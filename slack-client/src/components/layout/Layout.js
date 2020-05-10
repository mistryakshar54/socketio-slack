import React, { Component } from 'react';
import io from 'socket.io-client';
import "./Layout.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCircle, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import Col from "react-bootstrap/Col";
import Media from 'react-bootstrap/Media';
import {SOCKET_URL} from '../../constants';
import LoginPanel from '../loginPanel/loginPanel';
class LayoutComponent extends Component {
  state = {
    serverUrl: SOCKET_URL,
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
    currentUser: "",
    sidePanelOpen: false,
  };
  componentDidMount() {
    const socket = io(this.state.serverUrl);
    socket.on("mainSocketMsg", (mainSocketMsg) => {
      if (mainSocketMsg.message.type === "namespaceList") {
        this.setState({ namespaceList: mainSocketMsg.message.data });
        socket.disconnect();
      }
    });
  }
  handleUserLogin = (name, namespaceToJoin) => {
    if (!name) {
      alert("Please enter name");
    } else {
      this.setState({ currentUser: name });
      this.joinNamespace(namespaceToJoin);
    }
  };
  joinNamespace = (namespaceName) => {
    const NSSocket = io.connect(`${this.state.serverUrl + namespaceName}`);
    NSSocket.on(`NSMsg`, (msg) => {
      const selectedNS = this.state.namespaceList.filter(
        (ns) => ns.name === namespaceName
      );
      this.setState({ NSSocket, currentNS: selectedNS[0] });
      this.joinRoom(selectedNS[0].rooms[0]);
    });
  };

  joinRoom = (roomName) => {
    let { currentNS, NSSocket } = this.state;
    NSSocket.close();
    NSSocket = io.connect(`${this.state.serverUrl + currentNS.name}`);
    this.setState({ NSSocket });
    NSSocket.emit(
      `NSClientMsg`,
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
        this.toggleSidePanel();
      }
    );
    NSSocket.on(`RoomMsg`, (msg) => {
      const { currentRoom } = this.state;
      const chatHistory = currentRoom.history;
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
        <span
          key={room + index}
          id={room + "Btn"}
          className="nsBtn"
          onClick={() => this.joinRoom(room)}
        >
          {"#" + room}
        </span>
      );
    });
  };

  renderChatHistory = () => {
    const { currentRoom } = this.state;
    if (currentRoom?.history?.length > 0) {
      return (
        <div className="chatContent">
          {this.state.currentRoom.history.map((chatMsg, index) => {
            const { message, user } = chatMsg;
            return (
              <Media key={index}>
                <img
                  width={50}
                  height={50}
                  className="mr-3"
                  src={this.state.serverUrl + "/nsicons/user.png"}
                  alt={user + "'s profile'"}
                />
                <Media.Body>
                  <h5>{user}</h5>
                  <p>{message}</p>
                </Media.Body>
              </Media>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="chatContent">
          <h1 className="greyText">No content here :(</h1>
          <h3 className="greyText">But you can always initiate a chat....</h3>
        </div>
      );
    }
  };
  sendMessage = () => {
    const { chatMsgVal, currentUser, currentRoom, NSSocket } = this.state;
    const chatMsg = {
      message: chatMsgVal,
      user: currentUser,
    };
    NSSocket.emit(`roomChatMsg`, {
      type: "sendRoomMessage",
      message: chatMsg,
      room: currentRoom.room,
    });
    this.setState({ chatMsgVal: "" });
  };

  toggleSidePanel = () => {
    const { sidePanelOpen } = this.state;
    this.setState({ sidePanelOpen : !(sidePanelOpen) });
  };

  onChatMsgChange = (event) =>
    this.setState({ chatMsgVal: event.target.value });

  render() {
    return (
      <div className="row mainComponent">
        {this.state.currentUser === "" && (
          <LoginPanel
            login={this.handleUserLogin}
            namespaceList={this.state.namespaceList}
          />
        )}
        {this.state.currentUser !== "" && (
          <>
            <Col
              style={{ zIndex: this.state.sidePanelOpen ? "100" : "0" }}
              className="sidePanel"
              xl="3"
              lg="4"
              md="4"
              sm="5"
            >
              <div className="nsPanel col-lg-5">
                {this.state.namespaceList.length > 0 &&
                  this.state.namespaceList.map((namespace, index) => {
                    return (
                      <div
                        className="nsContent"
                        onClick={() => this.joinNamespace(namespace.name)}
                        key={namespace.name + index}
                      >
                        <img alt="workspace icon" src={this.state.serverUrl + namespace.icon} />
                        <span id={namespace.name} className="nsBtn">
                          {namespace.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <div className="roomPanel">
                <div className="userHeader">
                  <h4>
                    {this.state.currentUser}
                    <FontAwesomeIcon className="online" icon={faCircle} />
                  </h4>
                  <FontAwesomeIcon
                    className="cross"
                    onClick={this.toggleSidePanel}
                    icon={faTimes}
                  />
                </div>
                {this.state.currentNS?.rooms?.length > 0 &&
                  this.renderRoomList()}
              </div>
            </Col>
            <Col className="chatPanel">
              <div className="msgPanel">
                <div className="roomHeader col-lg-12">
                  <h4>#{this.state.currentRoom?.room}</h4>
                  <FontAwesomeIcon
                    className="hamburger"
                    onClick={this.toggleSidePanel}
                    icon={faBars}
                  />
                </div>
                <div className="msgWindow">
                  <div id="chatWindowPanel" className="chatWindowPanel">
                    {this.renderChatHistory()}
                  </div>
                </div>
                <div className="chatFormDiv">
                  <input
                    type="text"
                    id="chatInput"
                    placeholder="Type Message Here.."
                    onChange={this.onChatMsgChange}
                    value={this.state.chatMsgVal}
                  />
                  <FontAwesomeIcon
                    id="sendBtn"
                    onClick={this.sendMessage}
                    icon={faPaperPlane}
                  />
                </div>
              </div>
            </Col>
          </>
        )}
      </div>
    );
  }
}

export default LayoutComponent