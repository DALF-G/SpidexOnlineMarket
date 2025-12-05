import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const BuyerOrders = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://spidexmarket.onrender.com/api/orders/my-orders";

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await axios.get(API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  if (loading) return <p>Loading your orders...</p>;

  return (
    <div>
      <h3 className="text-success mb-4">
        <i className="bi bi-bag-check"></i> My Orders
      </h3>

      {orders.length === 0 ? (
        <div className="alert alert-info">You have no orders yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-warning">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, i) => (
                <tr key={order._id}>
                  <td>{i + 1}</td>
                  <td>{order.product?.title}</td>
                  <td>KES {order.totalPrice}</td>
                  <td>
                    <span className={`badge bg-${order.status === "delivered" ? "success" : "secondary"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
