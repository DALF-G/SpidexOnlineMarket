import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get token from AuthContext
  const { token } = useContext(AuthContext);

  // Backend URL
  const url = "https://spidexmarket.onrender.com/api/admin/users";

  // Fetch all users (wrapped in useCallback to fix ESLint warnings)
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  }, [token]); // token is the only dependency

  // Activate / Deactivate user
  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(
        `https://spidexmarket.onrender.com/api/admin/toggleactive/${id}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status");
    }
  };

  // Approve seller
  const approveSeller = async (id) => {
    try {
      await axios.put(
        `https://spidexmarket.onrender.com/api/admin/approveseller/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error approving seller:", err);
      alert("Failed to approve seller");
    }
  };

  // Reject seller
  const rejectSeller = async (id) => {
    try {
      await axios.put(
        `https://spidexmarket.onrender.com/api/admin/rejectseller/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error rejecting seller:", err);
      alert("Failed to reject seller");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(
        `https://spidexmarket.onrender.com/api/admin/deleteuser/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <p className="text-center mt-5">Loading users...</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-warning">Manage Users</h3>
      <hr />

      <table className="table table-bordered table-striped">
        <thead className="table-warning">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Seller Status</th>
            <th>Account Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>

              <td>
                <span className="badge bg-info">{u.role}</span>
              </td>

              {/* Seller approval status */}
              <td>
                {u.role === "seller" ? (
                  u.isApprovedSeller ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-danger">Pending</span>
                  )
                ) : (
                  <span className="badge bg-secondary">N/A</span>
                )}
              </td>

              {/* Active / inactive */}
              <td>
                {u.isActive ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-danger">Inactive</span>
                )}
              </td>

              <td className="text-center">

                {/* Approve / reject seller */}
                {u.role === "seller" && !u.isApprovedSeller && (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => approveSeller(u._id)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => rejectSeller(u._id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Activate / deactivate */}
                <button
                  className={
                    u.isActive
                      ? "btn btn-sm btn-warning me-2"
                      : "btn btn-sm btn-success me-2"
                  }
                  onClick={() => toggleActive(u._id, u.isActive)}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>

                {/* Delete user */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteUser(u._id)}
                >
                  Delete
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
