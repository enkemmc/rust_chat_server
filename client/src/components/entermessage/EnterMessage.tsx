import React, { useState } from 'react';
import './EnterMessage.css';
import { useSession } from '../wrappers/SessionContext';

interface EnterMessageProps {
  onSend: (message: string, username: string) => void;
}

const EnterMessage: React.FC<EnterMessageProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const { session } = useSession()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend(message, session.userData?.username || 'Guest');
    setMessage('');
  };

  return (
    <div className="enter-message-form-wrapper" >
      <form className="enter-message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="enter-message-input shadow"
        />
        <button type="submit" className="enter-message-send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default EnterMessage;
