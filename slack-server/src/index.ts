import express, { Request , Response , NextFunction } from 'express';
import socketIo from 'socket.io';
import NameSpace from './models/namespace';
const NameSpaces : NameSpace[] = [
  new NameSpace('wiki', '1234', ['artciles', 'news'], ''),
  new NameSpace('gameing', '1234', ['pubg','cod','counter-strike'], ''),
];

const app = express();
app.use("/slack", (req : Request, res: Response) => {
  res.sendFile(__dirname + "/public/chat.html");
});

app.use("/slack2", (req : Request, res: Response) => {
  res.sendFile(__dirname + "/public/chat2.html");
});

app.use('/', ( req: Request , res : Response ) => {
  res.send({message : "Welcome!"});
})

const appInstance = app.listen(4000);
appInstance.on('listening' , () => {
  console.log("Server listening on port: 4000");
})

const getNamespaceList = () => {
  return NameSpaces.map( (namespace : NameSpace) => {
    return {
      name : namespace.name,
      icon : namespace.icon
    }
  });
};

const io = socketIo(appInstance);

io.on('connection', ( socket ) => {
  const namespaceList = getNamespaceList();
  socket.emit('mainSocketMsg', {
    message: {
      type: "namespaceList",
      data: namespaceList,
    },
  });
})

NameSpaces.forEach((ns) => {
  io.of(ns.name).on('connection' , ( socket ) => {
    console.log(`${socket.id} has joined namespace ${ns.name}`);
    socket.emit(`${ns.name}NSMsg`, { type:'connectHandshake', data:{rooms : ns.rooms}, message: `Connected to Namespace : ${ns.name}` });
    socket.on(`${ns.name}NSClientMsg` , clientMsg => {
      const { type , message, room } = clientMsg;
      if(type === 'joinRoom'){
        console.log(`Request from ${socket.id} to join room: ${room}`);
        socket.join(`${room}`, (err) => {
          io.of(`${ns.name}`)
            .in(`${room}`)
            .emit(`${ns.name}NSRoomMsg`, {
              type: "connectHandshake",
              message: `Room: ${room} connected!!`,
            });
        });
      }
    });
  });
});
