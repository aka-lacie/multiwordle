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
    <Container className="align-items-center d-flex" style={{ height: '100vh' }}>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Player Name</Form.Label>
          <Form.Control type="text" placeholder="Enter your name" ref={userRef} required />
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Room ID</Form.Label>
          <Form.Control type="text" placeholder="Enter room ID" ref={roomRef} required />
        </Form.Group>
        <Button type="submit" className="mt-3">Join Room</Button>
      </Form>
    </Container>
  )
}
