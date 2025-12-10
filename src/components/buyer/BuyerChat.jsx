import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API base URL
const API_BASE = "https://spidexmarket.onrender.com/api/message";

const BuyerChat = () => {
  const { token, user } = useContext(AuthContext);
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the receiver
  const receiverId = location.state?.receiverId || sellerId;
  const receiverName = location.state?.receiverName || "Seller";
  const productId = location.state?.productId || null;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const pollingRef = useRef(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversation between current user & receiver
  const fetchMessages = async () => {
    if (!receiverId) return;

    try {
      const res = await axios.get(
        `${API_BASE}/conversation/${receiverId}`,
        { headers: authHeaders }
      );

      const msgs = res.data?.messages || [];
      setMessages(msgs);
      setLoading(false);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error);
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);

      const payload = {
        sender: user._id,
        receiver: receiverId,
        product: productId,
        content: message.trim(),
      };

      await axios.post(`${API_BASE}/send`, payload, {
        headers: authHeaders,
      });

      setMessage("");
      await fetchMessages();
    } catch (error) {
      console.error("Send error:", error.response?.data || error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Send on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark seen messages
  const markSeen = async () => {
    const unseen = messages.find(
      (m) => !m.seen && m.sender?._id === receiverId
    );

    if (!unseen) return;

    try {
      await axios.put(
        `${API_BASE}/seen`,
        { messageId: unseen._id },
        { headers: authHeaders }
      );
    } catch (error) {
      console.warn("Seen update failed:", error);
    }
  };

  // Initial load + polling
  useEffect(() => {
    fetchMessages();

    pollingRef.current = setInterval(fetchMessages, 3000);

    return () => clearInterval(pollingRef.current);
  }, [receiverId]);

  // Auto-scroll + mark seen
  useEffect(() => {
    scrollToBottom();
    markSeen();
  }, [messages]);

  return (
    <div className="container py-3" style={{ maxWidth: "750px" }}>
      <ToastContainer />

      {/* BACK BUTTON */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex align-items-center">
          <div
            style={{
              width: 45,
              height: 45,
              borderRadius: "50%",
              background: "#FFD34E",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            {receiverName.charAt(0).toUpperCase()}
          </div>

          <div className="ms-3">
            <h5 className="mb-0">{receiverName}</h5>
            <small className="text-muted">Chat conversation</small>
          </div>
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        className="card shadow-sm"
        style={{
          height: "60vh",
          overflowY: "auto",
          padding: "15px",
          background: "#F4F4F6",
        }}
      >
        {loading ? (
          <p className="text-center text-muted">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted">No messages yet. Start the chat!</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.sender?._id === user._id;

            return (
              <div
                key={msg._id}
                className={`d-flex mb-3 ${
                  mine ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: mine ? "#FFE28A" : "#ffffff",
                    border: "1px solid #ddd",
                  }}
                >
                  <p className="mb-1" style={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </p>
                  <small className="text-muted">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT AREA */}
      <div className="d-flex mt-3">
        <textarea
          rows="2"
          className="form-control"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          className="btn btn-warning ms-2 px-4"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      <div style={{ height: "40px" }}></div>
    </div>
  );
};

export default BuyerChat;
