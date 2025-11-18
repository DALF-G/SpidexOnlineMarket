import React, { useContext, useEffect, useState } from 'react'
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  const url = "https://spidexmarket.onrender.com/api/admin/sellers";

  // Fetch all sellers awaiting approval
  const fetchSellers = async () => {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("SELLERS RESPONSE:", res.data);
      setSellers(res.data.sellers);
      setLoading(false);
    } 
    catch (err) {
      console.error("ERROR FETCHING SELLERS:", err.response?.data || err.message);
      setLoading(false);
    }
  };

  // Approve seller
  const approveSeller = async (sellerId) => {
    try {
      await axios.put(
        `https://spidexmarket.onrender.com/api/admin/approveseller/${sellerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSellers();
      alert("Seller approved successfully");
    } catch (err) {
      alert("Error approving seller");
      console.error(err);
    }
  };

  // Reject seller
  const rejectSeller = async (sellerId) => {
    try {
      await axios.put(
        `https://spidexmarket.onrender.com/api/admin/rejectseller/${sellerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSellers();
      alert("Seller rejected");
    } catch (err) {
      alert("Error rejecting seller");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading sellers...</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-warning">Pending Seller Approvals</h3>
      <hr />

      {sellers.length === 0 ? (
        <div className="alert alert-info">No sellers waiting for approval.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-warning">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller.name}</td>
                <td>{seller.email}</td>
                <td>{seller.phone}</td>
                <td>
                  {seller.isApprovedSeller ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-danger">Pending</span>
                  )}
                </td>
                <td className="text-center">
                  {!seller.isApprovedSeller && (
                    <>
                      <button
                        onClick={() => approveSeller(seller._id)}
                        className="btn btn-sm btn-success me-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectSeller(seller._id)}
                        className="btn btn-sm btn-danger"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Sellers
