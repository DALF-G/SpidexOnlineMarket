import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ProductsPage from "../ProductsPage";

const BuyerDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container-fluid py-4">



      {/* WELCOME CARD */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body">
          <h4 className="fw-bold">Welcome back, {user?.name}! 👋</h4>
          <p className="text-muted mb-0">
            Manage your activity, browse products, and connect with sellers.
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="row g-4 mb-5">

        {/* ORDERS */}
        <div className="col-md-4">
          <Link to="/buyer-dashboard/orders" className="text-decoration-none">
            <div className="card shadow-sm border-0 p-4 text-center h-100 action-card-hover">
              <i className="bi bi-bag-check text-warning fs-1"></i>
              <h5 className="mt-3 text-dark">My Orders</h5>
              <p className="small text-muted">View items you purchased</p>
            </div>
          </Link>
        </div>

        {/* MESSAGES */}
        <div className="col-md-4">
          <Link to="/buyer-dashboard/messages" className="text-decoration-none">
            <div className="card shadow-sm border-0 p-4 text-center h-100 action-card-hover">
              <i className="bi bi-chat-dots text-primary fs-1"></i>
              <h5 className="mt-3 text-dark">Messages</h5>
              <p className="small text-muted">Chat with sellers directly</p>
            </div>
          </Link>
        </div>

        {/* WISHLIST */}
        <div className="col-md-4">
          <Link to="/buyer-dashboard/wishlist" className="text-decoration-none">
            <div className="card shadow-sm border-0 p-4 text-center h-100 action-card-hover">
              <i className="bi bi-heart text-danger fs-1"></i>
              <h5 className="mt-3 text-dark">Wishlist</h5>
              <p className="small text-muted">Your saved favourite products</p>
            </div>
          </Link>
        </div>

      </div>

      {/* PRODUCTS SECTION */}
      <div className="card shadow-sm border-0 p-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">
            <i className="bi bi-shop me-2"></i> Browse Products
          </h4>

          <button 
            className="btn btn-sm btn-outline-success"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-repeat me-1"></i> Refresh
          </button>
        </div>

        {/* Load the products list */}
        <ProductsPage />
      </div>

      <style>
        {`
          .action-card-hover:hover {
            transform: translateY(-3px);
            transition: 0.25s ease-in-out;
            cursor: pointer;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </div>
  );
};

export default BuyerDashboard;
