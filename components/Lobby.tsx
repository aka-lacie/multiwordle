import React, { useState, useEffect, useRef } from 'react'
import { Container, Button, Alert } from 'react-bootstrap'

type LobbyProps = {
  socket: any, // SocketIOClientSocket
  username: string,
  room: string,
  isHost: boolean,
  onStartGame: () => void,
}

type Player = {
  name: string;
  id: string;
};


export default function Lobby({socket, username, room, isHost, onStartGame}: LobbyProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAlert, setShowAlert] = useState({ show: false, msg: '' });
  const playersRef = useRef<Player[]>([]);
  
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    listenerInitializer();
  
    if (isHost) {
      setPlayers([{ name: username, id: socket.id }]);
      socket.emit("host-update-players", room, [{ name: username, id: socket.id }]);
    } else {
      socket.emit("joined-lobby", room, username, socket.id);
    }
  
    return () => {
      socket.removeAllListeners(["player-joined", "update-players", "player-disconnect"]);
    };
  }, []);



  const listenerInitializer = () => {
      socket.on("player-joined", (player: string, socketId: string) => {
        setShowAlert({ show: true, msg: `${player} just joined!` })
        
        if (isHost) {
          setPlayers((prevPlayers) => {
            const newPlayers = [...prevPlayers, { name: player, id: socketId }];
            socket.emit("host-update-players", room, newPlayers)
            return newPlayers
          })
        }
      });

      socket.on("player-disconnect", (socketId: string) => {
        console.log("player-disconnect", socketId);
        const player = playersRef.current.find((p) => p.id === socketId);
        if (player) {
          console.log("player-disconnect", player.name);
          setShowAlert({ show: true, msg: `${player.name} has left.` });
        }
      
        if (isHost) {
          setPlayers((prevPlayers) => {
            const newPlayers = prevPlayers.filter((p) => p.id !== socketId);
            socket.emit("host-update-players", room, newPlayers);
            return newPlayers;
          });
        }
      });


      socket.on("update-players", (players: Player[]) => {
        console.log(players.join(', '))
        setPlayers(players)
      });
  }

  const welcomeNotice: string = isHost ? 
    "Welcome to your lobby! Press Start Game when everyone is here." : 
    "Welcome! Sit back and wait for your host (P1) to begin. If the host leaves or isn't present, please refresh and join a new room.";
  
  return (
    <Container className="align-items-center d-flex" style={{ height: '80vh', flexDirection: 'column' }}>
      <h1 className="display-4">Lobby for Room ID: {room}</h1>
      <Alert variant="warning">{welcomeNotice}</Alert>
      { showAlert.show && <Alert variant="primary" onClose={() => setShowAlert({ show: false, msg: '' })} dismissible>{showAlert.msg}</Alert> }
      {/* <h3>Players waiting:</h3> */}
      <table className="table table-bordered mt-3" style={{ maxWidth: '200px'}}>
        <tbody>
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <tr style={{ height: '40px', whiteSpace: 'nowrap' }} key={rowIndex}>
              <td style={{ width: '1%'}}>{rowIndex < players.length ? `P${rowIndex+1}` : ''}</td>
              <td>{rowIndex < players.length ? players[rowIndex].name : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>{ isHost && <Button className='mt-3' onClick={onStartGame}>Start Game</Button> }</div>
    </Container>
  )
}

