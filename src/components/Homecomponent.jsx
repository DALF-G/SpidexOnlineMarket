import React from 'react'
import MyNavbar from './MyNavbar'
import '../components/css/Home.css'
import { Link } from 'react-router-dom'
import MyFooter from './MyFooter'
import ProductsPage from './ProductsPage'

const Homecomponent = () => {
  return (
    <div className='homepage'>
      {/* Below is my Navbar */}
      <MyNavbar/>

      <ProductsPage/>




      {/*Why Choose Spidex Market*/}
      <section className="py-5 bg-light" id="whyspidex">
        <div className="container">
          <h2 className="text-warning text-center mb-4">Why Choose Spidex Online Market</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm p-3">
                <div className="card-body">
                  <h5 className="card-title">Safe & Verified Sellers</h5>
                  <p>We ensure all sellers meet our verification and security standards.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm p-3">
                <div className="card-body">
                  <h5 className="card-title">Fast Transactions</h5>
                  <p>Buy and sell faster with our smooth and secure payment system.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 text-center border-0 shadow-sm p-3">
                <div className="card-body">
                  <h5 className="card-title">24/7 Support</h5>
                  <p>Our dedicated support team is available around the clock for assistance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*Footer */}
     <MyFooter/>

    </div>
  )
}

export default Homecomponent
