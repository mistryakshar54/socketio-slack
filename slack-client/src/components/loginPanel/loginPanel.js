import React , {useState} from 'react';
import Container from "react-bootstrap/Container";
import './loginPanel.scss';
import { SOCKET_URL } from '../../constants';
const LoginPanel = ( props ) => {
    const { namespaceList, login } = props;
    const [name, setName] = useState("");
    return (
      <Container fluid className="loginWindow">
        <div>
          <h1>Welcome To Slack Clone </h1>
        </div>
        <div>
          <input
            className="nameInput"
            type="text"
            value={name}
            placeholder="Enter your name here..."
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <h2>Select a namespace to join</h2>
          <div className="nsListContainer">
            {namespaceList.length > 0 &&
                namespaceList.map((namespace, index) => {
                return (
                  <div
                    className="nsList"
                    onClick={() => login(name , namespace.name)}
                    key={namespace.name + index}
                  >
                    <img src={SOCKET_URL + namespace.icon} />
                    <span id={namespace.name} className="nsBtn">
                      {namespace.name}
                    </span>
                  </div>
                );
                })}
          </div>
        </div>
      </Container>
    );
}

export default LoginPanel;