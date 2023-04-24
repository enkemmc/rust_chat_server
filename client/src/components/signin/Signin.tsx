import React from 'react';
import './Signin.css'
import CollapseableMenu from '../collapseablemenu/CollapseableMenu';
import { useSession } from '../wrappers/SessionContext'

const SignIn: React.FC = () => {
  const { session, setSession } = useSession()
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.userData) {
      window.location.href = `${process.env.PUBLIC_URL}/api/login`
    }
  } 

  const handleLogout = async () => {
    setSession({
      ...session,
      isLoggedIn: false,
      userData: undefined
    })
    await fetch(`${process.env.PUBLIC_URL}/api/logout`)
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

  return (
    <div className="sign-in-container">
      <form onSubmit={handleLogin}>
        {session.isLoggedIn && session.userData && (
          <>
            <CollapseableMenu items={navitems} name={session.userData.username}/>
          </>
        )}
        {!session.isLoggedIn && (
          <button type="submit">Sign In</button>
        )}
      </form>
    </div>
  );
};



export default SignIn;
