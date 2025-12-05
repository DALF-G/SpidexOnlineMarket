import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const BuyerMessages = () => {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://spidexmarket.onrender.com/api/messages/user";

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await axios.get(API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [token]);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div>
      <h3 className="text-success mb-4">
        <i className="bi bi-chat-dots"></i> Messages
      </h3>

      {messages.length === 0 ? (
        <div className="alert alert-info">You have no messages yet.</div>
      ) : (
        <div className="list-group shadow-sm">
          {messages.map((msg) => (
            <div key={msg._id} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold">
                  From: {msg.sender?.name || "Unknown"}
                </h6>
                <small className="text-muted">
                  {new Date(msg.createdAt).toLocaleString()}
                </small>
              </div>
              <p className="mb-1">{msg.text}</p>

              {msg.seen ? (
                <span className="badge bg-success">Seen</span>
              ) : (
                <span className="badge bg-secondary">Unread</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerMessages;
