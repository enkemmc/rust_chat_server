import React, { useState } from 'react';
import './Signin.css'
import CollapseableMenu from '../collapseablemenu/CollapseableMenu';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn('email', 'password');
    setSignedIn(true)
  };

  const navitems = [
    {
      name: 'Profile',
      handler: () => console.log('profile clicked')
    },
    {
      name: 'Sign out',
      handler: () => {
        console.log('signout clicked')
        setSignedIn(false)
      }
    }
  ]

  return (
    <div className="sign-in-container"> {/* add the class name to the container */}
      <form onSubmit={handleSubmit}>
        {signedIn && (
          <>
            <CollapseableMenu items={navitems} name="UN and Pic"/>
          </>
        )}
        {!signedIn && (
          <button type="submit">Sign In</button>
        )}
      </form>
    </div>
  );
};

export default SignIn;
