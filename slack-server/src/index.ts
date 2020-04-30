import express, { Request , Response , NextFunction } from 'express';
import socketIo from 'socket.io';
import NameSpace from './models/namespace';
const NameSpaces : NameSpace[] = [
  new NameSpace('marketo', '1234', [], ''),
  new NameSpace('adobe', '1234', [], ''),
];

const app = express();
console.log("__dirname", __dirname);
app.use("/slack", (req : Request, res: Response) => {
  res.sendFile(__dirname + "/public/chat.html");
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
  console.log("Request to main socket connection.");
  console.log("Sending NameSpace Lists");
  const namespaceList = getNamespaceList();
  socket.emit("mainSocketMsg", {
    message: {
      type: "namespaceList",
      data: namespaceList,
    },
  });
})

NameSpaces.forEach((ns) => {
  io.of(ns.name).on('connection' , ( socket ) => {
    console.log(`${socket.id} has joined namespace ${ns.name}`);
    socket.emit(`${ns.name}NSMsg`, { message: `Connected to Namespace : ${ns.name}` });
  });
});