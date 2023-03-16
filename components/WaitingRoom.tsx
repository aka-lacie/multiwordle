import React, { useState, useEffect } from 'react'
import { Container, Button } from 'react-bootstrap'

type Props = {
  username: string,
  room: string,
  isHost: boolean,
  onStartGame: () => void,
}

// when client joins room, emit to all clients in room that a new player has joined, and add the player to the list of players in the room
// when client leaves room, emit to all clients in room that a player has left, and remove the player from the list of players in the room
// if the player is the first to join the room, allow them to change settings (number of rounds, time limit, etc.) and start the game

export default function WaitingRoom({username, room, isHost, onStartGame}: Props) {

  // const [players, setPlayers] = useState<string[]>([]);

  // const handlePlayerJoin = () => {
  //   // if player name already exists, add a number to the end of the name
    
  //   setPlayers(prevPlayers => [...prevPlayers, player]);
  // }

  return (
    <Container className="align-items-center d-flex" style={{ height: '80vh', flexDirection: 'column' }}>
      <h1>Waiting Room: {room}</h1>
      <div>{ isHost && <Button onClick={onStartGame}>Start Game</Button> }</div>
      {/* <div>
        {players.map((player, index) => (
          <div key={player.id}>{index + 1}. {player.name}</div>
        ))}
      </div> */}
    </Container>
  )
}

