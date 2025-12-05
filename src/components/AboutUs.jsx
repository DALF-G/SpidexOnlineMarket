import React from 'react'
import { Link } from 'react-router-dom'
import MyNavbar from './MyNavbar'
import MyFooter from './MyFooter'

const AboutUs = () => {
  return (
    <div>
        <MyNavbar/>
        <div>
            {/* Below is the hero section */}
      <section className='hero position-relative text-white'>

    <img 
      src="images/spidex.png"
      alt="Spidex Market Banner" 
      className='w-100 image-fluid'
      style={{
        maxHeight: '680px',
        minHeight: '400px',
        objectFit: 'cover',
      }}
    /> 

    <div 
    className="hero-text position-absolute top-50 start-50 translate-middle text-center bg-dark bg-opacity-75 p-3 p-md-4 rounded"
    style={{
        maxWidth: '90%',
        width: '600px',
    }}
    >
        <h1 className="fw-bold text-warning mb-3">
            Buy. Sell. Connect — Instantly.
          </h1>
          <p className="small mb-4">
            Welcome to <strong>Spidex Online Market</strong> — your trusted digital marketplace for electronics, fashion, vehicles, real estate, and more.
          </p>
          <Link to="/products" className="btn btn-warning btn-sm fw-bold">
            Start Exploring
          </Link>
    </div>   
    </section>

     {/* About Section */}
      <section className="py-5 bg-light" id="about">
        <div className="container">
          <h2 className="text-warning text-center mb-4">About Spidex Online Market</h2>
          <p className="text-center">
            <strong>Spidex Online Market</strong> connects buyers and sellers across Kenya and beyond.
            Our mission is to create a seamless, safe, and fast shopping experience powered by technology and trust.
          </p>
          <p className="text-center">
            Whether you’re selling a car, advertising real estate, or shopping for the latest tech, 
            Spidex brings everyone together in one convenient platform.
          </p>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-5" id="categories">
        <div className="container">
          <h2 className="text-warning text-center mb-4">Top Categories</h2>

          <div className="row g-4">

            {/* Electronics */}
            <div className="col-md-3 col-sm-6">
              <Link
                to="/products?category=electronics"
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 text-center border-0 shadow-sm">
                  <img
                    src="images/electronics.jpg"
                    className="card-img-top"
                    alt="Electronics"
                  />
                  <div className="card-body">
                    <h5 className="card-title">Electronics</h5>
                    <p className="card-text small">
                      Phones, laptops, TVs, accessories and more.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Vehicles */}
            <div className="col-md-3 col-sm-6">
              <Link
                to="/products?category=vehicles"
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 text-center border-0 shadow-sm">
                  <img
                    src="images/vehicles.jpg"
                    className="card-img-top"
                    alt="Vehicles"
                  />
                  <div className="card-body">
                    <h5 className="card-title">Vehicles</h5>
                    <p className="card-text small">
                      Buy and sell cars, bikes & spare parts.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Fashion */}
            <div className="col-md-3 col-sm-6">
              <Link
                to="/products?category=fashion"
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 text-center border-0 shadow-sm">
                  <img
                    src="images/fashion.jpg"
                    className="card-img-top"
                    alt="Fashion"
                  />
                  <div className="card-body">
                    <h5 className="card-title">Fashion</h5>
                    <p className="card-text small">
                      Shop clothing, shoes and accessories.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Real Estate */}
            <div className="col-md-3 col-sm-6">
              <Link
                to="/products?category=realestate"
                className="text-decoration-none text-dark"
              >
                <div className="card h-100 text-center border-0 shadow-sm">
                  <img
                    src="images/realestate.jpg"
                    className="card-img-top"
                    alt="Real Estate"
                  />
                  <div className="card-body">
                    <h5 className="card-title">Real Estate</h5>
                    <p className="card-text small">
                      Homes, apartments & land for sale or rent.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
    <MyFooter/>
    </div>
  )
}

export default AboutUs
