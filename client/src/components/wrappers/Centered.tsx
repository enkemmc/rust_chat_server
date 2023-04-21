import React from 'react'
import './Centered.css'

interface CenteredProps {
  children: React.ReactNode
}

const Centered: React.FC<CenteredProps> = ({ children }) => {
  return (
    <div className="centered">
      {children}
    </div>
  )
}

export default Centered
