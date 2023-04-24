import React from 'react';
import './MessageDisplay.css';

export interface Message {
  sender: string;
  message: string;
}

interface MessageDisplayProps {
  messages: Message[];
  currentChannel: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages, currentChannel }) => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div className="message-display-container">
        <div className="message-list">
          {messages.map((message, i) => (
            <div key={i} className="message-item">
              <span className="message-sender" style={{ color: hashColor(message.sender) }}>{message.sender}: </span>
              <span className="message-text">{message.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const hashColor = (str: string) => {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  return `hsl(${hash % 360}, 100%, 70%)`;
}

export default MessageDisplay;
