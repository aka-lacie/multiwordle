import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import io, { Socket as SocketIOClientSocket } from 'socket.io-client';
import { Alert } from 'react-bootstrap'
import Body from '@/components/Body'

export default function Home() {
  const [socket, setSocket] = useState<SocketIOClientSocket | null>(null);

  useEffect(() => {
    socketInitializer();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [])

  const socketInitializer = () => {
    fetch('/api/socket').then(() => {
      let sock = io()

      sock.on("connect", () => {
        console.log(`connected ${sock.id}`);
        setSocket(sock);
      });
    });
  }

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>'Round The Wordle</h1>
      <hr/>
      <div>{ socket && <Body socket={socket}/> }</div>
      <div>Your ID: { socket && socket.id}</div>
    </>
  )
}
