import React from 'react';
import './Logo.css';
//https://github.com/facebook/create-react-app/issues/11770#issuecomment-1022024494
import Crab from '!file-loader!../../assets/rustacean-flat-gesture.svg'
import ReactLogo from '../../logo.svg'

const Logo: React.FC = () => {
  const handleClick = () => {
    window.location.href = '/'
  }

  return (
    <div className="logo-container" onClick={handleClick}>
      <img src={Crab} className="rustacean" alt="Rustacean"/>
      <img src={ReactLogo} className="react-logo rotate" alt="React Logo"/>
    </div>
  );
};

export default Logo;
