import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Buyers = () => {
  const { token } = useContext(AuthContext);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://spidexmarket.onrender.com/api/admin/buyers";

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchBuyers = async () => {
    try {
      toast.info("Loading buyers…");
      const res = await axios.get(API, authHeader);
      setBuyers(res.data.buyers || []);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load buyers");
    } finally {
      setLoading(false);
    }
  };

  const deleteBuyer = async (id) => {
    if (!window.confirm("Delete this buyer?")) return;
    try {
      await axios.delete(
        `https://spidexmarket.onrender.com/api/admin/deleteuser/${id}`,
        authHeader
      );
      toast.success("Buyer deleted");
      fetchBuyers();
    } catch (err) {
      toast.error("Failed to delete buyer");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading buyers…</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Buyers
          </li>
        </ol>
      </nav>

      <div className="card shadow p-3">
        <h5 className="text-success mb-3">
          <i className="bi bi-people-fill"></i> Buyers List
        </h5>

        {buyers.length === 0 ? (
          <div className="alert alert-warning text-center">No buyers found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((b, i) => (
                  <tr key={b._id}>
                    <td>{i + 1}</td>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.phone || "-"}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteBuyer(b._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buyers;
