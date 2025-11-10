import React from 'react'
import { Link } from 'react-router-dom'
import "./css/NotFound.css"

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="error-code">404</h1>
      <h2 className="error-message">Page Not Found</h2>
      <h4 className="error-subtext">Click the link below to go back home</h4>
      <h3>
        <Link to="/" className="home-link">Home</Link>
      </h3>
    </div>
  )
}

export default NotFound
