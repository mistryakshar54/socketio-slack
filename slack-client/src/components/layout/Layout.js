import React, { Component } from 'react';
import io from 'socket.io-client';
import "./Layout.scss"
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
class LayoutComponent extends Component {
  state = {
    namespaceList: [
      {
        name: "",
        icon: "",
        rooms: [],
      },
    ],
    NSSocket: null,
    currentNS: {
      name: "",
      icon: "",
      rooms: [],
    },
    currentRoom: {
      room: "",
      history: [],
    },
    currentUsersInRoom: 0,
    chatMsgVal: "",
  };
  componentDidMount() {
    const socket = io("http://localhost:4000/");
    socket.on("mainSocketMsg", (mainSocketMsg) => {
      if (mainSocketMsg.message.type === "namespaceList") {
        this.setState({ namespaceList: mainSocketMsg.message.data });
      }
    });
  }

  joinNamespace = (namespaceName) => {
    const NSSocket = io.connect(`http://localhost:4000/${namespaceName}`);
    NSSocket.on(`${namespaceName}NSMsg`, (msg) => {
      const selectedNS = this.state.namespaceList.filter(
        (ns) => ns.name === namespaceName
      );
      this.setState({ NSSocket, currentNS: selectedNS[0] });
    });
  };

  joinRoom = (roomName) => {
    const { currentNS, NSSocket } = this.state;
    NSSocket.emit(
      `${currentNS.name}NSClientMsg`,
      {
        type: "joinRoom",
        message: "Wanna join the room",
        room: roomName,
      },
      (room, currentNoOfUsers, chatHistory) => {
        console.log("Total users online:", currentNoOfUsers);
        this.setState({
          currentUsersInRoom: currentNoOfUsers,
          currentRoom: {
            room: chatHistory.roomName,
            history: chatHistory.history,
          },
        });
        console.log("Updated history:", this.state);
      }
    );
    NSSocket.on(`RoomMsg`, (msg) => {
      console.log("Current Room still exists post callback!!:", roomName);
      console.log("Got RoomChatMsg ,", msg, Date.now());
      const { currentRoom } = this.state;
      const chatHistory = currentRoom.history;
      console.log("Got Msh: ", msg);
      if (msg.type === "chatMsg") {
        chatHistory.push(msg.message);
        this.setState({
          currentRoom,
          ...chatHistory,
        });
      } else {
        console.log("Error fetching message from room ", currentRoom);
      }
    });
  };

  renderRoomList = () => {
    const { currentNS } = this.state;
    return currentNS.rooms.map((room, index) => {
      return (
        <button
          key={room + index}
          id={room + "Btn"}
          className="nsBtn"
          onClick={() => this.joinRoom(room)}
        >
          {room}
        </button>
      );
    });
  };

  sendMessage = () => {
    const { chatMsgVal, currentRoom, NSSocket } = this.state;
    NSSocket.emit(`roomChatMsg`, {
      type: "sendRoomMessage",
      message: chatMsgVal,
      room: currentRoom.room,
    });
  };

  onChatMsgChange = (event) =>
    this.setState({ chatMsgVal: event.target.value });

  render() {
    return (
      <div className="row mainComponent">
          <Col className="sidePanel" lg="2">
            <div className="nsPanel">
             <h4> Workspace </h4>
             {this.state.namespaceList.length > 0 &&
              this.state.namespaceList.map((namespace, index) => {
                return (
                  <button
                    key={namespace.name + index}
                    id={namespace.name}
                    className="nsBtn"
                    onClick={() => this.joinNamespace(namespace.name)}
                  >
                    {namespace.name}
                  </button>
                );
              })}
          </div>
          </Col>
          <Col lg="2">Room</Col>
          <Col>Chat</Col>
      </div>
      // <div className="mainComponent">

      //   <div className="sidePanel">
      //     <div className="nsPanel">
      //       <h4> Workspace </h4>
      //       {this.state.namespaceList.length > 0 &&
      //         this.state.namespaceList.map((namespace, index) => {
      //           return (
      //             <button
      //               key={namespace.name + index}
      //               id={namespace.name}
      //               className="nsBtn"
      //               onClick={() => this.joinNamespace(namespace.name)}
      //             >
      //               {namespace.name}
      //             </button>
      //           );
      //         })}
      //     </div>
      //     <div className="roomPanel">
      //       <h4> Rooms </h4>
      //       {this.state.currentNS?.rooms?.length > 0 && this.renderRoomList()}
      //     </div>
      //   </div>
      //   <div className="chatPanel"></div>
      // </div>
      //   <div className="chatPanel">

      //   </div>

      //   <div>
      //     <h1>Rooms</h1>
      //     {this.state.currentNS?.rooms?.length > 0 && this.renderRoomList()}
      //   </div>
      //   <div>
      //     <h1>{this.state.currentRoom?.room}</h1>
      //     <div>
      //       {this.state.currentRoom?.history?.length > 0 &&
      //         this.state.currentRoom.history.map((chatMsg, index) => {
      //           return <div key={index}>{chatMsg}</div>;
      //         })}
      //     </div>
      //     <div>
      //       <input
      //         type="text"
      //         id="chatInput"
      //         placeholder="Type Message Here.."
      //         onChange={this.onChatMsgChange}
      //         value={this.state.chatMsgVal}
      //       />
      //       <button id="sendBtn" onClick={this.sendMessage}>
      //         Send
      //       </button>
      //     </div>
      //   </div>
      // </div>
    );
  }
}

export default LayoutComponent