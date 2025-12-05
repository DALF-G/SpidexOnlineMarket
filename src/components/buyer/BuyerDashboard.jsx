import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BuyerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h3 className="text-success mb-4">
        <i className="bi bi-speedometer2"></i> Buyer Dashboard
      </h3>

      {/* Welcome Card */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body">
          <h4 className="fw-bold">Welcome back, {user?.name} 👋</h4>
          <p className="text-muted mb-0">
            Explore products, check your orders, and chat with sellers.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-4">

        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <i className="bi bi-bag-check text-warning fs-1"></i>
            <h5 className="mt-2">My Orders</h5>
            <p className="small text-muted">View your purchase history</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <i className="bi bi-chat-dots text-primary fs-1"></i>
            <h5 className="mt-2">Messages</h5>
            <p className="small text-muted">Chat with sellers</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3 text-center">
            <i className="bi bi-heart text-danger fs-1"></i>
            <h5 className="mt-2">Wishlist</h5>
            <p className="small text-muted">Products you liked</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BuyerDashboard;
