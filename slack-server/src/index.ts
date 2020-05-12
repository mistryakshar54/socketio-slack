/* eslint-disable no-console */
import express, { Request, Response } from 'express';
import socketIo from 'socket.io';
import NameSpace from './models/namespace';
const PORT = process.env.PORT || 4000;

const NameSpaces: NameSpace[] = [
  new NameSpace('coding', '1234', ['JS', 'general'], 'faCode', [
    { roomName: 'JS', history: [] },
    { roomName: 'general', history: [] },
  ]),
  new NameSpace(
    'gaming',
    '1234',
    ['pubg', 'cod', 'counter-strike'],
    'faGamepad',
    [
      { roomName: 'pubg', history: [] },
      { roomName: 'cod', history: [] },
      { roomName: 'counter-strike', history: [] },
    ]
  ),
];

const app = express();

app.use(express.static(__dirname + '/build'));

app.use('/test', (req: Request, res: Response) => {
  res.send({ message: 'Welcome!' });
});

app.use('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/build/index.html');
});

const appInstance = app.listen(PORT);
appInstance.on('listening', () => {
  console.log('Server listening on port: ', PORT);
});

const getNamespaceList = (): Partial<NameSpace>[] => {
  return NameSpaces.map((namespace: NameSpace) => {
    return {
      name: namespace.name,
      icon: namespace.icon,
      rooms: namespace.rooms,
    };
  });
};

const io = socketIo(appInstance);

io.on('connection', (socket) => {
  const namespaceList = getNamespaceList();
  socket.emit('mainSocketMsg', {
    message: {
      type: 'namespaceList',
      data: namespaceList,
    },
  });
});

NameSpaces.forEach((ns) => {
  io.of(ns.name).on('connection', (socket) => {
    socket.emit('NSMsg', `Connected to Namespace : ${ns.name}`);
    socket.on('NSClientMsg', (room, ackCallback) => {
      const roomToLeave = Object.keys(socket.rooms)[1];
      socket.leave(roomToLeave, () => {
        socket.removeAllListeners('RoomMsg');
        socket.join(`${room}`, () => {
          const historyData = ns.history.filter(
            (historyObj) => historyObj.roomName === room
          );
          io.of(`${ns.name}`)
            .in(`${room}`)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .clients((err: any, clients: string | any[]) => {
              ackCallback(clients.length, ...historyData);
            });
        });
      });
    });

    socket.on('roomChatMsg', (clientResp) => {
      const { message, room } = clientResp;
      ns.history.forEach((historyObj) => {
        if (historyObj.roomName === room) {
          historyObj.history.push(message);
        }
      });
      io.of(`${ns.name}`)
        .to(`${room}`)
        .emit('RoomMsg', {
          type: 'chatMsg',
          message,
        });
    });
  });
});
