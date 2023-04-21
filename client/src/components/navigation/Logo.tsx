import React from 'react';
import './Logo.css';
//https://github.com/facebook/create-react-app/issues/11770#issuecomment-1022024494
import Crab from '!file-loader!../../assets/rustacean-flat-gesture.svg'
import ReactLogo from '../../logo.svg'

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <img src={Crab} className="rustacean" alt="Rustacean"/>
      <img src={ReactLogo} className="react-logo" alt="React Logo"/>
    </div>
  );
};

export default Logo;
