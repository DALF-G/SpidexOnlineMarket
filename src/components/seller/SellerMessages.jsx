import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const SellerMessages = () => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://spidexmarket.onrender.com/api/message/my";

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchMessages = async () => {
    try {
      toast.info("Loading messages…");

      const res = await axios.get(API, authHeader);

      setMessages(res.data.messages || []); // ⬅ matches controller response

      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading messages…</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/seller-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Messages
          </li>
        </ol>
      </nav>

      <div className="card shadow p-3">
        <h5 className="text-success mb-3">
          <i className="bi bi-chat-dots"></i> Messages
        </h5>

        {messages.length === 0 ? (
          <div className="alert alert-info text-center">No messages found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((m, i) => (
                  <tr key={m._id}>
                    <td>{i + 1}</td>
                    <td>{m.sender?.name || "Unknown"}</td>
                    <td>{m.receiver?.name || "Unknown"}</td>
                    <td>{m.content || "-"}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
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

export default SellerMessages;
