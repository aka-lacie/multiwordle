import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from '../components/Login'
import WaitingRoom from '../components/WaitingRoom'
import io from 'socket.io-client'
import { Socket as SocketIOClientSocket } from 'socket.io-client';
import { Alert } from 'react-bootstrap'
import Body from '@/components/Body'

export default function Home() {

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>'Round The Wordle</h1>
      <hr/>
      <Body />
    </>
  )
}
