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
        <i className="bi bi-shop-window me-2"></i> Spidex Admin
      </h4>

      <ul className="nav nav-pills flex-column mb-auto">

        {/* Dashboard */}
        <li className="nav-item">
          <NavLink
            to="/admin-dashboard"
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

        {/* Users */}
        <li>
          <NavLink
            to="/admin-dashboard/users"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i className="bi bi-people me-2"></i> Manage Users
          </NavLink>
        </li>

        {/* Seller Approval */}
        <li>
          <NavLink
            to="/admin-dashboard/sellers"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i className="bi bi-person-check-fill me-2"></i> Seller Approval
          </NavLink>
        </li>

        {/* Categories */}
        <li>
          <NavLink
            to="/admin-dashboard/categories"
            className={({ isActive }) =>
              isActive
                ? "nav-link bg-warning text-dark fw-bold"
                : "nav-link text-white"
            }
          >
            <i className="bi bi-list-ul me-2"></i> Categories
          </NavLink>
        </li>

        {/* Products */}
        <li>
          <NavLink
            to="/admin-dashboard/products"
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
            to="/admin-dashboard/messages"
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
            to="/admin-dashboard/buyers"
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
