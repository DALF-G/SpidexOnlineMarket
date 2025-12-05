import React from "react";
import { NavLink, Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white p-3 shadow">

      <h4 className="text-center mb-4">
        <Link to="/buyer-dashboard" className="text-warning text-decoration-none">
          Buyer Panel
        </Link>
      </h4>

      <ul className="nav flex-column">

        <li className="nav-item mb-2">
          <NavLink
            to="/buyer-dashboard"
            className="nav-link text-white"
            activeclassname="active"
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/buyer-dashboard/profile"
            className="nav-link text-white"
            activeclassname="active"
          >
            <i className="bi bi-person-circle me-2"></i> My Profile
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/buyer-dashboard/orders"
            className="nav-link text-white"
            activeclassname="active"
          >
            <i className="bi bi-bag-check me-2"></i> My Orders
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/buyer-dashboard/messages"
            className="nav-link text-white"
            activeclassname="active"
          >
            <i className="bi bi-chat-dots me-2"></i> Messages
          </NavLink>
        </li>

      </ul>

      {/* Footer */}
      <div className="mt-auto text-center small text-muted">
        <hr className="bg-secondary" />
        Spidex Market © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default SideBar;
