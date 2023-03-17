import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import io, { Socket as SocketIOClientSocket } from 'socket.io-client';
import { Button } from 'react-bootstrap'
import Body from '@/components/Body'
import Rules from '@/components/Rules'

export default function Home() {
  const [socket, setSocket] = useState<SocketIOClientSocket | null>(null);
  const [showRules, setShowRules] = useState(false);

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

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="success" onClick={toggleRules} style={{ position: 'absolute', marginLeft: '5px' }}>
          Read Rules
        </Button>
        <h1 style={{ textAlign: 'center', width: '100%' }}>'Round the Wordle</h1>
      </div>
      <hr/>
      <div>{ socket && <Body socket={socket}/> }</div>
      <Rules show={showRules} onHide={toggleRules} />
    </>
  )
}
