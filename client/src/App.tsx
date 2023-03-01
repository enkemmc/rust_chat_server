import React, { useState, useEffect, FormEventHandler } from 'react';
import { MouseEventHandler, ChangeEvent } from 'react'
import './App.css';

const serverPrefix = process.env.NODE_ENV === 'development' ? '' : 'https://api.llyth.net/rust_chat_server'

interface AppState {
  currentRoom: string
  status: Status,
  messages: {
    [key: string]: { [key: string]: string }[]
  }
}

enum Status {
  Reconnecting = "reconnecting",
  Connected = "connected"
}

function App() {
  const initialState: AppState = {
    currentRoom: 'lobby',
    status: Status.Reconnecting,
    messages: {
      lobby: [
        { 'Admin': 'Welcome to the lobby!' },
      ]
    }
  }

  const [state, setState] = useState(initialState)
  const changeRoom = (newName: string) => {
    setState(prevState => ({
      ...prevState,
      currentRoom: newName
    }))
  }

  const createRoom = (newName: string) => {
    if (!Object.keys(state.messages).includes(newName)) {
      setState(prevState => ({
        ...prevState,
        messages: {
          ...prevState.messages,
          [newName]: [
            { 'Admin': `Welcome to ${newName}` },
          ]
        },
        currentRoom: newName
      }))
    }  
  }

  const setConnectedStatus = (status: Status) => {
    setState(prevState => ({
      ...prevState,
      status
    }))
  }

  const addMessage = (room: string, username: string, message: string, push = false) => {
    if (push) {
      console.log('pushed')
      console.log(room, username, message)
      setState(prevState => ({
        ...prevState,
        messages: {
          ...prevState.messages,
          [room]: [...prevState.messages[room], { [`${username}`]: `${message}` }]
        }
      }))
    } else {
      // put system messages in here
    }
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
        addMessage(room, username, message, true)
      }
    }

    sse.onerror = () => {
      console.log('there was an error')
      setConnectedStatus(Status.Reconnecting)
      sse.close()
    }

    sse.onopen = e => {
      console.log('open!')
      setConnectedStatus(Status.Connected)
    }

    return () => {
      console.log('closing dead connection')
      setConnectedStatus(Status.Reconnecting)
      sse.close()
    }

  }, [])

  return (
      <div className="wrapper">
        <div className="toolbar-left">
          <StatusDisplay status={state.status}/>
          <RoomList roomnames={Object.keys(state.messages)} currentRoom={state.currentRoom} changeRoom={changeRoom}/>
          <NewRoom createRoom={createRoom}/>
        </div>
        <div className="content">
          <div className="scroller">
            <div className="messages">
              <DisplayMessages messages={state.messages} roomName={state.currentRoom} />
            </div>
          </div>
          <EnterMessage room={state.currentRoom} />
        </div>
      </div>
  )
}

interface ISubmitMessage {
 room: string, message: string, username: string 
}

interface IDisplayMessages {
  messages: {
    [key: string]: { [key: string]: string }[]
  },
  roomName: string
}

const hashColor = (str: string) => {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return `hsl(${hash % 360}, 100%, 70%)`;
}

const DisplayMessages = ({ messages, roomName }: IDisplayMessages) => {
  return (
    <>
      {
        messages[roomName] ?
          messages[roomName].map((message, i) => {
            const [name, text] = Object.entries(message)[0]
            return (
              <div className="message" key={`${roomName} ${i}`}>
                <span className={name} style={{ color: hashColor(name) }}>{name}</span>
                <span className="text">{text}</span>
              </div>
            )
          })
        :
        null
      }
  </>
  )
}

interface IEnterMessage {
  room: string
}

const EnterMessage = (props: IEnterMessage) => {
  const { room } = props
  const [message, updateMessage] = useState('')
  const [username, updateUsername] = useState('')
  const changeMessage = (event: ChangeEvent<HTMLInputElement>) => {
    updateMessage(event.target.value)
  }

  const changeName = (event: ChangeEvent<HTMLInputElement>) => {
    updateUsername(event.target.value)
  }

  const submit: FormEventHandler = e => {
    e.preventDefault()

    fetch(`${serverPrefix}/message`, { 
        method: 'POST', 
      body: new URLSearchParams({ room, username, message })
    })
      .then(resp => {
        if (resp.ok) {
          updateMessage('')
        }
      })
  }

  return (
    <div className='form-wrapper'>
      <div className='name-field'>
        <form>
          <input className="pad-left-content" type="text" name="username" placeholder="Guest" maxLength={20} onChange={changeName} value={username}/>
        </form>
      </div>
      <div className='message-field '>
        <form onSubmit={submit}>
          <input className="pad-left-content" type="text" name="message" placeholder="Send a message" maxLength={100} onChange={changeMessage} value={message}/>
          <button className="bottom" type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

export default App;

interface IStatusDisplay {
  status: Status
}
const StatusDisplay = ({ status }: IStatusDisplay) => {
  const classname = `status ${status} left-item pad-left-content`
  return (
    <div 
      className={classname}
    >
      {status}
    </div>
  )
}

interface INewRoom {
  createRoom: (roomname: string) => void
}

const NewRoom = ({ createRoom }: INewRoom) => {
  const [roomname, updateRoomName] = useState('')
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateRoomName(event.target.value)
  }
  const handleClick: MouseEventHandler = event => {
    event.preventDefault()
    createRoom(roomname)
  }
  return (
    <div 
      className='form-wrapper'
    >
      <form>
        <input className="pad-left-content" type="text" id="name" name="name" placeholder="New room..." maxLength={20} value={roomname} onChange={handleChange} />
        <button className="bottom" type="submit" onClick={handleClick}>+</button>
      </form>
    </div>
  )
}

interface RoomListProps {
  roomnames: string[]
  currentRoom: string
  changeRoom: (name: string) => void
}

const RoomList = (props: RoomListProps) => {
  const { roomnames, currentRoom, changeRoom } = props

  const getClass = (roomname: string) => {
    return roomname === currentRoom ? 'room active pad-left-content' : 'room pad-left-content'
  }

  return (
    <div 
      className='room-list'
    >
      {roomnames.map((name, i) => (
        <React.Fragment key={i}>
          <button 
            onClick={() => changeRoom(name)}
            className={getClass(name)}>{name}</button>
        </React.Fragment>
      ))}
      </div>
  )
}
