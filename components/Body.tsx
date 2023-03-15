import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Login'
import WaitingRoom from './WaitingRoom'
import Game from './Game'
import io, { Socket as SocketIOClientSocket } from 'socket.io-client';
import { Alert } from 'react-bootstrap'

let socket : SocketIOClientSocket;

export default function Body({ socket }) {
  useEffect(() => { 
    listenerInitializer()
    return () => {
      socket.removeAllListeners(['action-rejected', 'is-host', 'start-game'])
    }
  }, [])

  const listenerInitializer = () => {
      socket.on("action-rejected", (reason : string) => {
        setShowAlert({ show: true, msg: reason })
      });

      console.log("starting listening for is-host")
      socket.on("is-host", (room: string) => {
        console.log("you are the host of this room")
        setHostState(true);
        setShowAlert({ show: true, msg: "You are the host of this room." })
      });
      console.log("finished listening for is-host")

      socket.on("start-game", () => {
        console.log("starting game");
        setGameState('Game');
      });
  }
  
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [hostState, setHostState] = useState(false);

  const [showAlert, setShowAlert] = useState({ show: false, msg: '' });
  const [gameState, setGameState] = useState('Login');

  
  const handleIdSubmit = ([name, room]: [string, string]) => {
    setName(name)
    setRoom(room)

    socket.emit("join-room", room, (success: boolean) => {
      if (success) setGameState('WaitingRoom')
    })
  }

  const handleStartGame = () => {
    console.log(`sending start for room: ${room}`)
    socket.emit("send-start", room)
  }

  switch(gameState) {
    case 'Login': 
      return (<>
        { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
        <Login onIdSubmit={handleIdSubmit} />
      </>)
    case 'WaitingRoom':
      return (<>
        { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
        <WaitingRoom username={name} room={room} isHost={hostState} onStartGame={handleStartGame}/>
      </>)
    case 'Game':
      return (<>
        { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
        <Game />
      </>)
  }
}
