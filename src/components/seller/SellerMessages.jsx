import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const SellerMessages = () => {
  const { token, user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const API_MY_MESSAGES = "https://spidexmarket.onrender.com/api/message/my";
  const API_MARK_SEEN = "https://spidexmarket.onrender.com/api/message/seen";

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch all messages for seller
  const loadMessages = async () => {
    try {
      const res = await axios.get(API_MY_MESSAGES, authHeader);
      const allMessages = res.data.messages || [];

      // Filter messages where the logged-in seller is sender or receiver
      const myMessages = allMessages.filter(
        (msg) =>
          msg.sender?._id === user._id ||
          msg.receiver?._id === user._id
      );

      // Group messages by buyer
      const convMap = {};

      myMessages.forEach((msg) => {
        const otherUser =
          msg.sender?._id === user._id ? msg.receiver : msg.sender;

        if (!otherUser) return;

        const buyerId = otherUser._id;

        if (!convMap[buyerId]) {
          convMap[buyerId] = {
            buyerId,
            buyerName: otherUser.name || "Buyer",
            messages: [],
          };
        }

        convMap[buyerId].messages.push(msg);
      });

      // Format conversations
      const convList = Object.values(convMap).map((c) => {
        const sorted = [...c.messages].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return {
          ...c,
          lastMessage: sorted[0],
          unread: sorted.filter(
            (m) => !m.seen && m.sender?._id !== user._id
          ).length,
        };
      });

      setConversations(convList);
    } catch (err) {
      console.error("Failed to load messages", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Mark partner's messages as seen
  const markSeen = async (buyerId, messages) => {
    try {
      const unseen = messages.filter(
        (msg) => !msg.seen && msg.sender?._id === buyerId
      );

      await Promise.all(
        unseen.map((msg) =>
          axios.put(
            API_MARK_SEEN,
            { messageId: msg._id },
            authHeader
          )
        )
      );
    } catch (err) {
      console.error("Failed to mark seen", err);
    }
  };

  // Open chat page
  const openChat = async (buyerId, messages, buyerName) => {
    await markSeen(buyerId, messages);

    navigate(`/seller-dashboard/messages/chat/${buyerId}`, {
      state: { receiverName: buyerName },
    });
  };

  useEffect(() => {
    loadMessages();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading messages…</p>;
  }

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2000} />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/seller-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active">Messages</li>
        </ol>
      </nav>

      <div className="card shadow p-3">
        <h5 className="text-success mb-3">
          <i className="bi bi-chat-left-text"></i> Messages
        </h5>

        {conversations.length === 0 ? (
          <div className="alert alert-info text-center">
            No messages found.
          </div>
        ) : (
          <div className="list-group">
            {conversations.map((c) => (
              <div
                key={c.buyerId}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
              >
                {/* Header row */}
                <div
                  className="d-flex justify-content-between"
                  onClick={() =>
                    openChat(c.buyerId, c.messages, c.buyerName)
                  }
                >
                  <h6 className="fw-bold">{c.buyerName}</h6>

                  {c.unread > 0 && (
                    <span className="badge bg-danger">{c.unread}</span>
                  )}
                </div>

                {/* Message preview */}
                <p className="text-muted mb-1">
                  {c.lastMessage?.content?.slice(0, 45) || "No message…"}…
                </p>

                {/* Timestamp */}
                <small className="text-muted d-block mb-2">
                  {new Date(c.lastMessage?.createdAt).toLocaleString()}
                </small>

                {/* Action Buttons */}
                <div className="mt-2 d-flex gap-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() =>
                      openChat(c.buyerId, c.messages, c.buyerName)
                    }
                  >
                    Open Chat
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      navigate(
                        `/seller-dashboard/messages/chat/${c.buyerId}`,
                        {
                          state: { replyTo: c.lastMessage },
                        }
                      )
                    }
                  >
                    Reply
                  </button>

                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    to={`/seller-dashboard/messages/chat/${c.buyerId}`}
                  >
                    View Conversation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerMessages;
