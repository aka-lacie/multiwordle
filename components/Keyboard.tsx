import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

function Keyboard({ keyColors, onCurrentGuessUpdate, onEnter }
  : { keyColors: Map<string, string>, onCurrentGuessUpdate: (guess: string) => void, onEnter: (currentGuess: string) => Promise<boolean> }) {
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  
  const handleKeyClick = (letter: string) => {
    if (letter === 'ENTER') {
      setCurrentGuess((currentGuess) => {
        console.log(currentGuess.length);
        if (currentGuess.length === 5) {
          handleSubmitEnter(currentGuess.join(''));
          console.log("Enter acknowledged");
        }
        return currentGuess;
      });
    } else if (letter === 'BACK') {
      setCurrentGuess((prevGuess) => {
        if (prevGuess.length > 0) return prevGuess.slice(0, -1);
        return prevGuess;
      });
    } else {
      setCurrentGuess((prevGuess) => {
        if (prevGuess.length < 5) return [...prevGuess, letter];
        return prevGuess;
      });
    }
    console.log('Key clicked: ', letter);
  };

  const handleSubmitEnter = async (currentGuess: string) => {
    const valid = await onEnter(currentGuess);
    if (valid) {
      console.log("clearing current guess");
      setCurrentGuess([]);
    }
  }

  const handleKeyDown = (event) => {
    const letter = event.key.toUpperCase();
    if (event.key === 'Enter') {
      handleKeyClick('ENTER');
    } else if (event.key === 'Backspace') {
      handleKeyClick('BACK');
    } else if (keyboardLayout.some((row) => row.includes(letter))) {
      handleKeyClick(letter);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    console.log('Current guess: ', currentGuess.join(''));
    onCurrentGuessUpdate(currentGuess.join(''));
  }, [currentGuess]);

  return (
    <div className="keyboard">
      { keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex}>
          {row.map((letter) => (
            <Key
              key={letter}
              letter={letter}
              color={keyColors.get(letter)}
              onClick={handleKeyClick}
              disabled={
                letter === 'ENTER' && currentGuess.length < 5 || 
                letter === 'BACK' && currentGuess.length === 0
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Key({ letter, color, onClick, disabled }) {
  let bgColor = '#d3d6da';
  switch (color) {
    case 'green':
      bgColor = '#6aaa64'
      break
    case 'yellow':
      bgColor = '#c9b458'
      break
    case 'grey':
      bgColor = '#787c7e'
  }
  
  const style = {
    backgroundColor: bgColor, 
    border: 'None',
    fontFamily: "nyt-franklin, helvetica, sans-serif",
    fontWeight: "bold",
    fontSize: '1.25em',
    color: "#000000",
  }

  return (
    <Button 
      className='key'
      style={style}
      onClick={() => onClick(letter)}
      disabled={disabled}
    >{letter}
    </Button>
  );
}

export default Keyboard;