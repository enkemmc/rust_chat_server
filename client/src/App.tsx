import React, { useRef, useState, useEffect, FormEventHandler } from 'react';
import { MouseEventHandler, ChangeEvent } from 'react'
//import './App.css';
import './newApp.css'
import Signin from './components/signin/Signin'
import NewEnterMessage from './components/entermessage/EnterMessage'
import Rooms from './components/rooms/Rooms'
import MessageDisplay, { Message } from './components/messagedisplay/MessageDisplay'
import Navigation from './components/navigation/Navigation'
import Logo from './components/navigation/Logo'
import Centered from './components/wrappers/Centered'

const serverPrefix = process.env.NODE_ENV === 'development' ? 'https://api.llyth.net/rust_chat_server' : 'https://api.llyth.net/rust_chat_server'


interface AppState {
  currentChannel: string
  username: string
  status: Status
  nextId: number
  messages: {
    [key: string]: Message[]
  }
}

enum Status {
  Reconnecting = "reconnecting",
  Connected = "connected"
}

const loadFakeMessages = (state: AppState) => {
  const messages = state.messages
  const rooms = Object.keys(messages)
  rooms.forEach(room => {
    for (let i = 0; i < 100; i++) {
      messages[room].push({
        id: state.nextId,
        sender: 'Admin',
        message: `This is a fake message for ${room}`
      })
      state.nextId++
      }
    })
}

function App() {
  const initialState: AppState = {
    currentChannel: 'lobby',
    status: Status.Reconnecting,
    username: 'Guest',
    nextId: 1,
    messages: {
      lobby: [
        { id: 0, sender: 'Admin', message: 'Welcome to the lobby!' }
      ]
    }
  }

  if (process.env.NODE_ENV === 'development') {
    //loadFakeMessages(initialState)
  }

  const [state, setState] = useState(initialState)

  const latestNextId = useRef(state.nextId);

  useEffect(() => {
    latestNextId.current = state.nextId;
  }, [state.nextId]);

  const getNextId = (): number => {
    setState(prevState => ({
      ...prevState,
      nextId: prevState.nextId + 1
    }));
    let newval = latestNextId.current + 1;
    return newval
  }

  const setConnectedStatus = (status: Status) => {
    setState(prevState => ({
      ...prevState,
      status
    }))
  }

  const storeMessage = (room: string, username: string, message: string, push = false) => {
    if (push) {
      setState(prevState => ({
        ...prevState,
        messages: {
          ...prevState.messages,
          [room]: [...prevState.messages[room], { id: getNextId(), sender: username, message }]
        }
      }))
    } else {
      // put system messages in here
    }
  }

  const handleSignIn = (email: string, password: string) => {
    console.log('signin clicked')
  }

  const handleSend = (message: string) => {
    fetch(`${serverPrefix}/message`, { 
        method: 'POST', 
      body: new URLSearchParams({ room: state.currentChannel, username: state.username, message })
    })
    .then(resp => {
      if (resp.ok) {
          // server received
      }
    })
  }

  useEffect(() => {
    if (state.status === Status.Connected) {
      return
    }
    const uri = `${serverPrefix}/events`
    const sse = new EventSource(uri)

    sse.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (!('room' in data) || !('username' in data) || !('message' in data)){
        return console.error('object was missing room username or message')
      } else {
        const { room, username, message } = data
        storeMessage(room, username, message, true)
      }
    }

    sse.onerror = () => {
      setConnectedStatus(Status.Reconnecting)
      sse.close()
    }

    sse.onopen = e => {
      setConnectedStatus(Status.Connected)
    }

    return () => {
      setConnectedStatus(Status.Reconnecting)
      sse.close()
    }

  }, [])

  const handleSelectRoom = (roomName: string) => {
    setState(prevState => ({
      ...prevState,
      currentChannel: roomName
    }))
  }

  const handleAddRoom = (roomName: string) => {
    setState(prevState => ({
      ...prevState,
      messages: {
        [roomName]: [{ id: getNextId(), sender: 'Admin', message: `Welcome to ${roomName}!` }],
        ...prevState.messages,
      },
      currentChannel: roomName
    }))
  }

  return (
    <>
      <Centered>
        <Navigation>
          <Logo />
          {/* <Signin onSignIn={handleSignIn}/> */}
        </Navigation>
        <div style={{ height: '100%' }}>
          <Rooms rooms={Object.keys(state.messages)} onSelectRoom={handleSelectRoom} onAddRoom={handleAddRoom} currentRoom={state.currentChannel}/>
          <MessageDisplay messages={state.messages[state.currentChannel]} currentChannel={state.currentChannel} />
          <NewEnterMessage onSend={handleSend}/>
        </div>
      </Centered>
    </>
  )
}

export default App;
