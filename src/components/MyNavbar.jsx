import React from 'react'
import { Link } from 'react-router-dom'
import "./css/Home.css"

const MyNavbar = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className='navbar navbar-expand-md navbar-dark navbar-custom' style={{ backgroundColor: '#150d0de2' }}>
  <div className="container">
      <Link className="navbar-brand text-brand" to={'/'}>Spidex Online Market</Link>

      <form className="d-flex ms-3" role="search">
        <select className="form-select me-2" style={{ width: '180px' }}>
         <option>Categories</option>
         <option>Electronics</option>
         <option>Vehicles</option>
         <option>Fashion</option>
         <option>Real Estate</option>
         <option>Jobs</option>
        </select>
        <input className="form-control me-2" type="search" placeholder="Search products, categories..." />
        <button className="btn btn-outline-warning" type="submit">Search</button>
      </form>

      {/* Below is my toggle button - either to expand or collapse content of the navbar */}
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar">
          <span className="navbar-toggler-icon"></span>
      </button>

      {/* Below is the Div that carries all the link to different pages */}
        <div className="collapse navbar-collapse justify-content-end"  id="navbarnav">
          <ul className="navbar-nav me-auto mb-1 mb-md-0">
            <li className="nav-item"><Link to={"/"} className="nav-link active">Home</Link></li>
            <li className="nav-item"><Link to="/products" className="nav-link" >Products</Link></li>
            <li className="nav-item">
            <Link className="nav-link" to="/deals">Top Deals</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/premium">Boost Ad</Link>
            </li>
          </ul>

          {/* Right side controls */}
          <div className="d-flex gap-2">
            <Link  to="/register" className="btn btn-primary">
              Register
            </Link>
            <Link  to="/login" className="btn btn-primary">
              Login
            </Link>   
          </div>
        </div>
      </div>
    </nav>
    
    </div>
  )
}

export default MyNavbar
