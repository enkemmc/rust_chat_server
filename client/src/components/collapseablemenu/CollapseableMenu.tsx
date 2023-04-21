import React, { useState } from 'react';
import './CollapseableMenu.css';

interface Props {
  items: { name: string, handler: () => void }[];
  name: string;
}

const CollapseableMenu: React.FC<Props> = ({ items, name }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div className="collapseable-menu">
      <button onClick={toggleMenu}>
        {name}
        <div className="arrow-icon" style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</div>
      </button>
      {isOpen && (
        <div className="menu-items">
          {items.map(({ name, handler }) => (
            <div key={name} className="menu-item" onClick={handler}>{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollapseableMenu;
