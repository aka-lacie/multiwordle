import React, { useState } from 'react'

// Cell component
const Cell = ({ letter, status, index }) => (
  <div
    className={`cell cell-${status} ${status ? 'flip-animation' : ''}`}
    style={status ? { animationDelay: `${index * 0.1}s` } : {}}
  >
    {letter}
  </div>
);


// Row component
const Row = ({ word, statuses, showLetters }) => {
  const paddedWord = word.padEnd(5, ' ');
  const paddedStatuses = statuses.concat(Array(5 - statuses.length).fill(''));

  return (
    <div className="wordle-row">
      {paddedWord.split('').map((letter, index) => {
        return <Cell 
                 key={index}
                 letter={showLetters ? letter : '?'}
                 status={paddedStatuses[index]}
                 index={index}
                />
      })}
    </div>
  );
};

// Board component
const Board = ({ currentGuess, attempts, flashRed }) => {
  const rows = Array(6).fill(null)
    .map((_, index) => {
      if (attempts.length > index) {
        // Previous guesses
        return (
          <Row
            key={index}
            word={attempts[index].word}
            statuses={attempts[index].statuses}
            showLetters={attempts[index].showLetters}
          />
        );
      } else if (index === attempts.length) {
        // Current input field
        return (
          <div className={`row ${flashRed ? 'flash-red' : ''}`}>
            <Row key={index} word={currentGuess} statuses={[]} showLetters={true}/>
          </div>
        );
      } else {
        // Future rows
        return <Row key={index} word="" statuses={[]} showLetters={true}/>;
      }
    });

  return <div className="wordle-board">{rows}</div>;
};

export default Board;
