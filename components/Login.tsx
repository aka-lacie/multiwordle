import React, { useRef } from 'react'
import { Button, Container, Form } from 'react-bootstrap'

export default function Login({ onIdSubmit } : { onIdSubmit: (args: [string, string]) => void }) {
  const userRef = useRef<HTMLInputElement>(null)
  const roomRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onIdSubmit([userRef.current!.value, roomRef.current!.value])
  }

  return (
    <Container className="align-items-center d-flex" style={{ height: '80vh', flexDirection: 'column', justifyContent: 'center' }}>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Player Name</Form.Label>
          <Form.Control type="text" placeholder="Enter name (A-Z)" ref={userRef} required maxLength={10} pattern="^[a-zA-Z]*$"/>
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Room ID</Form.Label>
          <Form.Control type="text" placeholder="Enter code (A-Z | 0-9)" ref={roomRef} required maxLength={10} pattern="^[a-zA-Z0-9]*$"/>
        </Form.Group>
        <Button type="submit" className="mt-3">Join Room</Button>
      </Form>
    </Container>
  )
}
