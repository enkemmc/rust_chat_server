import React from 'react';
import './Signin.css'
import CollapseableMenu from '../collapseablemenu/CollapseableMenu';
import { useSession } from '../wrappers/SessionContext'

const SignIn: React.FC = () => {
  const { session, setSession } = useSession()
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.userData) {
      window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth2/github/login`
    }
  } 

  const handleLogout = async () => {
    setSession({
      ...session,
      isLoggedIn: false,
      userData: undefined
    })
    await fetch(`${process.env.REACT_APP_API_URL}/api/oauth2/github/logout`)
      .catch(e => console.log(`Error logging out: ${e}`))
  }

  const navitems = [
    {
      name: 'Profile',
      handler: () => console.log('Profile not yet implemented.')
    },
    {
      name: 'Sign out',
      handler: handleLogout
    }
  ]

  const loginOptions = [
    {
      name: 'Github',
      handler: () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth2/github/login`
      }
    },
    {
      name: 'Google',
      handler: () => {
        window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth2/google/login`
      }
    }
  ]

  return (
    <div className="sign-in-container">
      <div>
        {session.isLoggedIn && session.userData && (
          <>
            <CollapseableMenu items={navitems} name={session.userData.username}/>
          </>
        )}
        {(!session.isLoggedIn || !session.userData) && (
          <>
            <CollapseableMenu items={loginOptions} name="Sign In"/>
          </>
        )}
      </div>
    </div>
  );
};



export default SignIn;
