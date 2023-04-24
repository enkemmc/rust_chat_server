import React from 'react';
import './Navigation.css';

interface NavigationProps {
  children: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = (props) => { // children
  const { children } = props;
  return (
    <div className="navigation-container shadow">
      {children}
    </div>
  )
}

export default Navigation;
