import React, { useEffect, useState } from 'react'
import { Container, Alert} from 'react-bootstrap'
import Board from './Board'
import Keyboard from './Keyboard'

type Attempt = {
  word: string,
  statuses: string[],
  showLetters: boolean,
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
  
  const keyArray = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M',
  ];
  const [keyColors, setKeyColors] = useState<Map<string, string>>(new Map(keyArray.map((key) => [key, ''])));

  function handleStartTurn(currPlayerId: string, guess: string) {
    // Figure out if it's my turn
    // Wrap everything else into a callback bc we need the updated turn state for setting attempts
    setIsMyTurn((prevIsMyTurn) => {
      const myTurn = currPlayerId === socket.id;
      if (myTurn) console.log("It's your turn!");
  
      // Check the latest guess against the SOLUTION to determine the statuses
      if (guess) {
        console.log("guess: " + guess)
        const statuses = guess.split('').map((letter, index) => {
          if (letter === SOLUTION[index]) {
            setKeyColors((prevKeyColors) => new Map(prevKeyColors.set(letter, 'green')));
            return 'green';
          } else if (SOLUTION.includes(letter)) {
            // We only want to set yellow if the letter hasn't already been set to green
            setKeyColors((prevKeyColors) => 
              prevKeyColors.get(letter) === '' ?
                new Map(prevKeyColors.set(letter, 'yellow')) : 
                prevKeyColors
              );
            return 'yellow';
          } else {
            setKeyColors((prevKeyColors) => new Map(prevKeyColors.set(letter, 'grey')));
            return 'grey';
          }
        });
        
        // If the guess matches the SOLUTION, show the victory notice
        if (guess === SOLUTION) {
          setGameOver('win');
        }
        
        // Add the guess to the attempts
        setAttempts((prevAttempts) => [...prevAttempts, { word: guess, statuses, showLetters: myTurn }]);
      }
      
      return myTurn;
    });
  }

  // Monitor for game over
  useEffect(() => {
    // If out of tries, show the defeat notice
    if (attempts.length === 6) {
      if (!gameOver) setGameOver('lose');
    }
  }, [attempts]);

  // When gameOver, show all letters
  useEffect(() => {
    if (gameOver) {
      setAttempts((prevAttempts) => prevAttempts.map((attempt) => ({ ...attempt, showLetters: true })));
    }
  }, [gameOver]);

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
      <div>
        <Board
          currentGuess={currentGuess}
          attempts={attempts}
        />
      </div>
      <div>
        <Keyboard
          keyColors={keyColors}
          onCurrentGuessUpdate={handleCurrentGuessUpdate}
          onEnter={(currentGuess) => handleEnter(currentGuess)}
        />
      </div>
      <div> {!gameOver && isMyTurn && <Alert variant="info" className='mt-2'>It's your turn!</Alert>} </div>
    </Container>
    </>
  )
}
