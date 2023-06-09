import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Login'
import Lobby from './Lobby'
import Game from './Game'
import { Container } from 'react-bootstrap'
import { Alert } from 'react-bootstrap'

export default function Body({ socket }) {
  useEffect(() => { 
    listenerInitializer()
    return () => {
      socket.removeAllListeners(['action-rejected', 'is-host', 'start-game'])
      socket.emit("leave-room", room, name)
    }
  }, [])

  const listenerInitializer = () => {
      socket.on("action-rejected", (reason : string) => {
        setShowAlert({ show: true, msg: reason })
      });

      socket.on("is-host", (room: string) => {
        console.log("you are the host of this room: " + room)
        setHostState(true);
        setShowAlert({ show: true, msg: "You are the host of this room." })
      });

      socket.on("start-game", (solution : string) => {
        setSolution(solution); // should be set to uppercase from server
        console.log("starting game");
        setGameState('Game');
      });
  }
  
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [hostState, setHostState] = useState(false);

  const [showAlert, setShowAlert] = useState({ show: false, msg: '' });
  const [gameState, setGameState] = useState('Login');
  const [solution, setSolution] = useState('');

  
  const handleIdSubmit = ([name, room]: [string, string]) => {
    setName(name)
    setRoom(room)

    socket.emit("join-room", room, (success: boolean) => {
      if (success) setGameState('Lobby')
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
    case 'Lobby':
      return (<>
        { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
        <Lobby socket={socket} username={name} room={room} isHost={hostState} onStartGame={handleStartGame}/>
      </>)
    case 'Game':
      return (<>
        { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
        <Container className="align-items-center d-flex" style={{ width: '100vw' }}>
          <Game socket={socket} username={name} room={room} isHost={hostState} SOLUTION={solution}/>
        </Container>
      </>)
  }
}
