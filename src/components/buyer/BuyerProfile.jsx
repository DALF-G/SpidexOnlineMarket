import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const BuyerProfile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h3 className="text-success mb-4">
        <i className="bi bi-person-circle"></i> My Profile
      </h3>

      <div className="card shadow border-0 p-4">
        <h5 className="fw-bold mb-3">Personal Information</h5>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Name</label>
            <input className="form-control" value={user?.name} disabled />
          </div>
          <div className="col-md-6">
            <label>Email</label>
            <input className="form-control" value={user?.email} disabled />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Phone Number</label>
            <input className="form-control" value={user?.phone || "Not set"} disabled />
          </div>
          <div className="col-md-6">
            <label>Role</label>
            <input className="form-control" value={user?.role?.toUpperCase()} disabled />
          </div>
        </div>

        <button className="btn btn-warning mt-3 disabled">
          Edit Profile (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default BuyerProfile;
