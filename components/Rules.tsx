import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface RulesProps {
  show: boolean;
  onHide: () => void;
}

const Rules: React.FC<RulesProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rules</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Welcome to 'Round the Wordle! This multiplayer game puts a new spin on the classic Wordle.</p>
        <ol>
          <li> A maximum of 6 players is support in each room. </li>
          <li> Or you can play alone with an endless supply of rounds!</li>
          <li> You have a total of 6 attempts to correctly guess the word, with one player contributing one guess per round, round-robin style. </li>
          <li> Only the next player can see the word guessed in the previous turn. Kind of like Telephone, but Wordle. </li>
          <li> The colors of the cells in the grid and keyboard will still be available for everyone to see. </li>
          <li> A correct letter in the correct position will appear in a green cell, while a correct letter in the wrong position will appear in a yellow cell. An incorrect letter will remain in a grey cell. </li>
          <li> The game is a test of your individual wit and collaborative strategy, so no communication is allowed between players while the game is in progress!</li>
          <li> If the group successfully guesses the word within six attempts, everyone wins together! Celebrate your collective brainpower.</li>
          <li> In the event that the word is not guessed within the allotted attempts, don't worry! Better luck next time!</li>
        </ol>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Rules;
