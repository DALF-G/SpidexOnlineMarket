import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const API = "https://spidexmarket.onrender.com/api/admin/message";

const Messages = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerFilter, setSellerFilter] = useState("");

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch all messages for admin
  const fetchMessages = async () => {
    try {
      toast.info("Loading messages…");
      const res = await axios.get(API, headers);
      const msgs = res.data?.msgs || [];
      setMessages(msgs);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group messages into conversations
  const buildConversations = (msgs) => {
    const map = {};

    msgs.forEach((msg) => {
      const sender = msg.sender?._id;
      const receiver = msg.receiver?._id;

      // Use combined id to identify unique conversation
      const convoKey =
        sender < receiver ? `${sender}-${receiver}` : `${receiver}-${sender}`;

      if (!map[convoKey]) {
        map[convoKey] = {
          id: convoKey,
          participants: [msg.sender, msg.receiver],
          messages: [],
        };
      }

      map[convoKey].messages.push(msg);
    });

    // format list
    const convList = Object.values(map).map((c) => {
      const sorted = [...c.messages].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const last = sorted[0];

      return {
        ...c,
        lastMessage: last,
        unread: sorted.filter((m) => !m.seen).length,
        seller:
          c.participants.find((p) => p?.role === "seller") ||
          c.participants.find((p) => p?.role !== "admin"),
      };
    });

    // Sort by latest last message
    convList.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt) -
        new Date(a.lastMessage?.createdAt)
    );

    setConversations(convList);
    setFiltered(convList);
  };

  // Apply seller filter
  const applyFilter = () => {
    if (!sellerFilter.trim()) {
      setFiltered(conversations);
      return;
    }

    const search = sellerFilter.toLowerCase();

    const filteredList = conversations.filter(
      (c) =>
        c.seller?.name?.toLowerCase().includes(search) ||
        c.participants.some((p) =>
          p?.name?.toLowerCase().includes(search)
        )
    );

    setFiltered(filteredList);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) buildConversations(messages);
  }, [messages]);

  useEffect(() => {
    applyFilter();
  }, [sellerFilter, conversations]);

  if (loading)
    return <p className="text-center mt-4">Loading messages…</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Messages
          </li>
        </ol>
      </nav>

      <div className="card shadow p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-success mb-0">
            <i className="bi bi-chat-dots"></i> Conversations
          </h5>

          {/* Search sellers */}
          <input
            type="text"
            className="form-control"
            placeholder="Filter by seller or user name..."
            style={{ maxWidth: "300px" }}
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="alert alert-info text-center">
            No conversations found.
          </div>
        ) : (
          <div className="list-group">
            {filtered.map((c, index) => {
              const last = c.lastMessage;
              const seller = c.seller;

              return (
                <div
                  key={c.id}
                  className="list-group-item list-group-item-action p-3"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/admin-dashboard/messages/chat/${seller?._id}`,
                      {
                        state: { participants: c.participants },
                      }
                    )
                  }
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="fw-bold mb-1">
                        {seller?.name || "Unknown User"}
                      </h6>
                      <p className="text-muted mb-1" style={{ fontSize: 14 }}>
                        {last?.content?.slice(0, 60) || "No messages…"}
                      </p>
                    </div>

                    <div className="text-end">
                      <small className="text-muted">
                        {new Date(last?.createdAt).toLocaleString()}
                      </small>
                      {c.unread > 0 && (
                        <div className="badge bg-danger mt-1">
                          {c.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
