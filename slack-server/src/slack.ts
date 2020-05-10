import express, { Request , Response } from 'express';
import socketIo from 'socket.io';
import NameSpace from './models/namespace';
import path from 'path';
const PORT = process.env.PORT||4000;
const NameSpaces: NameSpace[] = [
  new NameSpace(
    'coding',
    '1234',
    ['JS', 'general'],
    '/nsicons/code.png',
    [
      { roomName : 'JS', history:[]}, 
      {roomName : 'general', history:[]}, 
    ]
  ),
  new NameSpace(
    'gaming',
    '1234',
    ['pubg', 'cod', 'counter-strike'],
    '/nsicons/game.png',
    [
      { roomName : 'pubg', history:[]}, 
      {roomName : 'cod', history:[]}, 
      {roomName : 'counter-strike', history:[]} 
    ]
  ),
];

const app = express();

app.use(express.static(__dirname + '/public'));

app.use('/test', ( req: Request , res: Response ) => {
  res.send({message : 'Welcome!'});
});

const appInstance = app.listen(PORT);
appInstance.on('listening' , () => {
  console.log('Server listening on port: ', PORT);
});

const getNamespaceList = () => {
  return NameSpaces.map( (namespace: NameSpace) => {
    return {
      name : namespace.name,
      icon : namespace.icon,
      rooms : namespace.rooms
    };
  });
};

const io = socketIo(appInstance);

io.on('connection', ( socket ) => {
  const namespaceList = getNamespaceList();
  socket.emit('mainSocketMsg', {
    message: {
      type: 'namespaceList',
      data: namespaceList,
    },
  });
});

NameSpaces.forEach((ns) => {
  io.of(ns.name).on('connection' , ( socket ) => {
    socket.emit('NSMsg', { type:'connectHandshake', data:{rooms : ns.rooms}, message: `Connected to Namespace : ${ns.name}` });
    socket.on('NSClientMsg' , (clientMsg, ackCallback ) => {
      const { type , room } = clientMsg;
      if(type === 'joinRoom'){
        const roomToLeave = Object.keys(socket.rooms)[1];
        socket.leave(roomToLeave , () => {
          socket.removeAllListeners('RoomMsg');
          socket.join(`${room}` , () => {
            const historyData = ns.history.filter((historyObj) => historyObj.roomName === room);
            io.of(`${ns.name}`)
              .in(`${room}`)
              .clients( (err: any , clients: string | any[]) => {
                ackCallback(room, clients.length, ...historyData);
              });
          });
        }
        );
      }
    });
    
    socket.on('roomChatMsg' , clientResp => {
        const { message , room } = clientResp;
        ns.history.forEach( historyObj => {
          if(historyObj.roomName === room){
            historyObj.history.push(message);
          }
        });
        io.of(`${ns.name}`).to(`${room}`).emit('RoomMsg', {
          type: 'chatMsg',
          message,
        });
    });
  });
});
