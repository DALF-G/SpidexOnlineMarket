import React from 'react'
import { NavLink } from 'react-router-dom'

const SideBar = () => {
  return (
    <div
      className="text-white d-flex flex-column p-3"
      style={{
        width: "250px",
        background: "linear-gradient(135deg, #1a1a1a, #000000)", // Dark premium look
        minHeight: "100vh",
      }}
    >
      {/* Brand */}
      <h4 className="text-center mb-4 text-warning">
        <i className="bi bi-shop-window me-2"></i> Spidex Seller
      </h4>

      <ul className="nav nav-pills flex-column mb-auto">

        {/* Dashboard */}
        <li className="nav-item">
          <NavLink
            to="/seller-dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </NavLink>
        </li>

       

        {/* Products */}
        <li>
          <NavLink
            to="/seller-dashboard/products"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i className="bi bi-box-seam me-2"></i> Products
          </NavLink>
        </li>

        {/* Messages */}
        <li>
          <NavLink
            to="/seller-dashboard/messages"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i class="bi bi-chat-dots"></i> Messages
          </NavLink>
        </li>

        {/* Buyers */}
        <li>
          <NavLink
            to="/seller-dashboard/buyers"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i class="bi bi-people"></i> Buyers
          </NavLink>
        </li>
      </ul>

      <hr />

      <div className="text-center small">
        <span className="text-light">&copy; 2025 Spidex Market</span>
      </div>
    </div>
  )
}

export default SideBar
