import React, { useEffect, useState } from 'react'
import { Container, Alert} from 'react-bootstrap'
import Board from './Board'
import Keyboard from './Keyboard'

type Attempt = {
  word: string,
  statuses: string[],
}

export default function Game({ socket, room, isHost, SOLUTION } 
  : { socket: any, room: string, isHost: boolean, SOLUTION: string }) {

  useEffect(() => { 
    console.log("word: " + SOLUTION)
    listenerInitializer()
    return () => {
      socket.removeAllListeners(['start-turn'])
    }
  }, [])

  const listenerInitializer = () => {
    socket.on("start-turn", (currPlayerId: string, guess: string | null) => {
      console.log("start-turn received");
      handleStartTurn(currPlayerId, guess);
    });
  }

  // Host always starts first
  const [isMyTurn, setIsMyTurn] = useState<boolean>(isHost);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [gameOver, setGameOver] = useState<string>('');

  function handleStartTurn(currPlayerId: string, guess: string) {
    // Check the latest guess against the SOLUTION to determine the statuses
    if (guess) {
      console.log("guess: " + guess)
      const statuses = guess.split('').map((letter, index) => {
        if (letter === SOLUTION[index]) {
          return 'green';
        } else if (SOLUTION.includes(letter)) {
          return 'yellow';
        } else {
          return 'grey';
        }
      });
      
      // If the guess matches the SOLUTION, show the victory notice
      if (guess === SOLUTION) {
        setGameOver('win');
      }
      
      setAttempts((prevAttempts) => [...prevAttempts, { word: guess, statuses }]);
    }


    // Figure out if it's my turn
    setIsMyTurn(currPlayerId === socket.id);
    if (currPlayerId === socket.id) console.log("It's your turn!");
  }

  // Monitor for game over
  useEffect(() => {
    // If out of tries, mount the defeat screen
    if (attempts.length === 6) {
      if (!gameOver) setGameOver('lose');
    }
  }, [attempts]);


  function handleCurrentGuessUpdate(updatedGuess: string) {
    console.log("handleCurrentGuessUpdate called with:", updatedGuess);
    // Update the Board
    setCurrentGuess(updatedGuess);
  }

  async function handleEnter(currentGuess: string) {
    // Send guess to the server to verify and broadcast/reject
    console.log("verifying guess: " + currentGuess)
    const response = await fetch(`api/checkWord?word=${currentGuess.toLowerCase()}`)
    const data = await response.json()
    console.log(data)
    if (!data.isWord) {
      console.log("not a word")
      // TODO: Alert board by flashing the guess red
      return false
    } else {
      console.log("guess validated")
      socket.emit("send-guess", room, currentGuess)
      return true
    }
  }

  return (
    <>
    <Container className="align-items-center d-flex" style={{ height: '100vh', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <div> {gameOver === 'win' && <Alert variant="success">You win!</Alert>} </div>
      <div> {gameOver === 'lose' && <Alert variant="danger">Game over! The word was {SOLUTION}</Alert>} </div>
      <div><Board currentGuess={currentGuess} attempts={attempts}/></div>
      <div><Keyboard onCurrentGuessUpdate={handleCurrentGuessUpdate} onEnter={(currentGuess) => handleEnter(currentGuess)} showLetters={isMyTurn}/></div>
      <div> {!gameOver && isMyTurn && <Alert variant="info">It's your turn!</Alert>} </div>
    </Container>
    </>
  )
}
