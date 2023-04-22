import React, { useEffect, useState, useRef } from 'react';
import './Rooms.css';

interface RoomsProps {
  rooms: string[];
  onSelectRoom: (room: string) => void;
  onAddRoom: (room: string) => void;
  currentRoom: string;
}

const Rooms: React.FC<RoomsProps> = ({ rooms, onSelectRoom, onAddRoom, currentRoom }) => {
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNewRoomClick = () => {
    setIsAddingRoom(true);
    inputRef.current?.focus();
  };

  const handleNewRoomSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddRoom(newRoomName);
    setIsAddingRoom(false);
    setNewRoomName('');
  };

  const handleDocumentClick = (event: MouseEvent | TouchEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsAddingRoom(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsAddingRoom(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={isExpanded ? 'rooms-container expanded' : 'rooms-container'}>
      <div className="rooms-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className={`${isExpanded ? 'arrow rotate-180' : 'arrow'}`}>
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M3.5 14L13.5 8 3.5 2z" fill="inherit" />
          </svg>
        </div>
      </div>
      <div className="rooms-list">
        {!isAddingRoom && (
          <div className="new-room-button ellipsis" onClick={handleNewRoomClick}>
            Create Room
          </div>
        )}
        {isAddingRoom && (
          <form onSubmit={handleNewRoomSubmit} className="new-room-form">
            <input
              type="text"
              placeholder="Enter room name"
              value={newRoomName}
              maxLength={15}
              onChange={(e) => setNewRoomName(e.target.value)}
              ref={inputRef}
              className="new-room-input"
            />
          </form>
        )}
        {rooms.map((room) => (
          <div key={room} className={`${currentRoom === room ? 'current ' : ''}room-item ellipsis`} onClick={() => onSelectRoom(room)}>
            {room}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
