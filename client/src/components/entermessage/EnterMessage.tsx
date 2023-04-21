import React, { useState } from 'react';
import './EnterMessage.css';

interface EnterMessageProps {
  onSend: (message: string) => void;
}

const EnterMessage: React.FC<EnterMessageProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend(message);
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
