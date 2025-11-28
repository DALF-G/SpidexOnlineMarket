import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "https://spidexmarket.onrender.com/api/seller/buyers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBuyers(res.data.buyers || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load buyers:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center text-success mb-4">Buyer Visits</h2>

      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5>
            <i className="bi bi-people-fill me-2"></i> Buyers Who Visited Your
            Page
          </h5>
        </div>

        <div className="card-body">
          {loading ? (
            <p className="text-center text-muted">Loading buyers...</p>
          ) : buyers.length === 0 ? (
            <p className="text-center text-muted">
              No buyers have viewed your page yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer, index) => (
                    <tr key={buyer._id || index}>
                      <td>{index + 1}</td>
                      <td>{buyer.name || "N/A"}</td>
                      <td>{buyer.email || "N/A"}</td>
                      <td>{buyer.phone || "N/A"}</td>
                      <td>
                        {buyer.lastVisit
                          ? new Date(buyer.lastVisit).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBuyers;
