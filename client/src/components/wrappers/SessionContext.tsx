import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserData {
  user_id: string
  username: string
}

interface Session {
  userData: UserData | undefined
  isLoggedIn: boolean
}

interface SessionContextValue {
  session: Session;
  setSession: React.Dispatch<React.SetStateAction<Session>>;
}

const defaultSession: Session = {
  userData: undefined,
  isLoggedIn: false
};

const SessionContext = createContext<SessionContextValue>({
  session: defaultSession,
  setSession: () => {},
});

export const useSession = () => useContext(SessionContext);

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session>(defaultSession);
  useEffect(() => {
    new Promise(async (_res, rej) => {
      try {
        const userData = await checkSessionValidity()
        setSession({
          isLoggedIn: true,
          userData
        })
      } catch (error){
        rej(error)
      }
    })
  },[])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};


export const checkSessionValidity = async (): Promise<UserData> => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/api/user_info`, { credentials: 'include' })
    if (response.ok) {
      const userdata: UserData = await response.json()
      return userdata
    } else {
      throw new Error(`Server error.`)
    }
  } catch (error){
    throw new Error(`Failed to fetch ${error}`)
  }
}
