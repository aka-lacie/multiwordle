import React, { useState } from 'react'

// Cell component
const Cell = ({ letter, status }) => (
  <div className={`cell cell-${status}`}>
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
        return <Cell key={index} letter={showLetters ? letter : '?'} status={paddedStatuses[index]} />
      })}
    </div>
  );
};

// Board component
const Board = ({ currentGuess, attempts }) => {
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
        return <Row key={index} word={currentGuess} statuses={[]} showLetters={true}/>;
      } else {
        // Future rows
        return <Row key={index} word="" statuses={[]} showLetters={true}/>;
      }
    });

  return <div className="wordle-board">{rows}</div>;
};

export default Board;
