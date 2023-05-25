import { FC } from 'react'
import './OauthSelector.css'
import GithubIcon from '../../assets/github-icon.svg'

interface IOauthSelector {
  showOverlay: boolean
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>> 
}

const OauthSelector: FC<IOauthSelector> = ({ showOverlay, setShowOverlay }) => {
  const handleClose: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault()
    setShowOverlay(false);
  }

  const googleCallback = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth2/google/login`
  }

  const githubCallback = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/oauth2/github/login`
  }

  return (
  <div
    id="overlay"
    className={showOverlay ? 'show' : ''}
    onClick={handleClose}
    >
      <div className="button-container">
        <GoogleButton callback={googleCallback}/>
        <GithubButton callback={githubCallback}/>
      </div>
  </div>
  )
}

interface IButton {
  callback: () => void
}

const GoogleButton: FC<IButton> = ({ callback }) => {
  const handleGoogleSelect: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation()
    e.preventDefault()
    callback()
  }
  return (
    <div id="gSignInWrapper" onClick={handleGoogleSelect}>
      <div className="oauth-btn customGPlusSignIn">
        <span className="icon oauth-icon"></span>
        <span className="buttonText">Google</span>
      </div>
    </div>
  )
}

const GithubButton: FC<IButton> = ({ callback }) => {
  const handleGithubSelect: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation()
    e.preventDefault()
    callback()
  }
  return (
  <div id="githubSignInWrapper" onClick={handleGithubSelect}>
    <div className="oauth-btn">
      <img className="oauth-icon github-icon invert" src={GithubIcon} style={{}} />
      <span className="buttonText">Github</span>
    </div>
  </div>
  )
}

export default OauthSelector
