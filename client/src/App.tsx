import React, { useContext, useRef, useState, useEffect, FormEventHandler, MouseEventHandler, ChangeEvent } from 'react';
import './App.css';
import Signin from './components/signin/Signin'
import NewEnterMessage from './components/entermessage/EnterMessage'
import Rooms from './components/rooms/Rooms'
import MessageDisplay, { Message } from './components/messagedisplay/MessageDisplay'
import Navigation from './components/navigation/Navigation'
import Logo from './components/navigation/Logo'
import Centered from './components/wrappers/Centered'
import { useSession, SessionProvider } from './components/wrappers/SessionContext'

interface AppState {
  currentChannel: string
  status: Status
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
    for (let i = 0; i < 30; i++) {
      messages[room].push({
        sender: 'Admin',
        message: `This is a fake message for ${room}`
      })
      }
    })
}

function App() {

  const initialState: AppState = {
    currentChannel: 'lobby',
    status: Status.Reconnecting,
    messages: {
      lobby: [
        { sender: 'Admin', message: 'Welcome to the lobby!  Try creating a new room with the menu on the left.' }
      ]
    }
  }

  if (process.env.NODE_ENV === 'development') {
    loadFakeMessages(initialState)
  }

  const [state, setState] = useState(initialState)

  const setConnectedStatus = (status: Status) => {
    setState(prevState => ({
      ...prevState,
      status
    }))
  }

  const storeMessage = (room: string, username: string, message: string, push = false) => {
    if (push) {
      setState(prevState => {
        let current: Message[] = []
        if (prevState.messages[room]){
          current = [...prevState.messages[room]]
        }
        return {
          ...prevState,
          messages: {
            ...prevState.messages,
            [room]: [{ sender: username, message },...current]
          }
        }
      })
    } else {
      // put system messages in here
    }
  }

  const handleSend = (message: string, username: string) => {
    fetch(`${process.env.PUBLIC_URL}/api/message`, { 
        method: 'POST', 
      body: new URLSearchParams({ room: state.currentChannel, username, message })
    })
    .then(resp => {
      if (resp.ok) {
          // server received
      }
    })
    .catch(e => console.log(`Error in handlesend ${e}`))
  }

  useEffect(() => {
    if (state.status === Status.Connected) {
      return
    }
    const uri = `${process.env.PUBLIC_URL}/api/events`
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

    sse.onopen = _e => {
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
        [roomName]: [{ sender: 'Admin', message: `Welcome to ${roomName}!` }],
        ...prevState.messages,
      },
      currentChannel: roomName
    }))
  }

  return (
    <SessionProvider>
      <Centered>
        <Navigation>
          <Logo />
          <Signin/>
        </Navigation>
        <div style={{ height: '100%' }}>
          <Rooms rooms={Object.keys(state.messages)} onSelectRoom={handleSelectRoom} onAddRoom={handleAddRoom} currentRoom={state.currentChannel}/>
          <MessageDisplay messages={state.messages[state.currentChannel]} currentChannel={state.currentChannel} />
          <NewEnterMessage onSend={handleSend}/>
        </div>
      </Centered>
    </SessionProvider>
  )
}

export default App;
