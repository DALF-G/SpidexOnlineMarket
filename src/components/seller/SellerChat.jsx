import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Backend message API routes
const API_BASE = "https://spidexmarket.onrender.com/api/message";

const SellerChat = () => {
  const { token, user } = useContext(AuthContext);
  const { buyerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const receiverId = buyerId;
  const receiverName = location.state?.receiverName || "Buyer";
  const replyTo = location.state?.replyTo || null;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation with buyer
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/conversation/${receiverId}`,
        { headers }
      );

      setMessages(res.data.messages || []);
      setLoading(false);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed loading messages", error);
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const payload = {
      sender: user._id,
      receiver: receiverId,
      product: null, // sellers may not need product reference here
      content: message.trim(),
    };

    try {
      setSending(true);

      await axios.post(`${API_BASE}/send`, payload, { headers });

      setMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error("Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  // Mark buyer messages as seen
  const markSeen = async () => {
    const unseen = messages.filter(
      (m) => !m.seen && m.sender?._id === receiverId
    );

    if (unseen.length === 0) return;

    try {
      await Promise.all(
        unseen.map((m) =>
          axios.put(
            `${API_BASE}/seen`,
            { messageId: m._id },
            { headers }
          )
        )
      );
    } catch (error) {
      console.warn("Failed to mark as seen", error);
    }
  };

  // Send via Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto load + poll
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);

    return () => clearInterval(pollRef.current);
  }, [receiverId]);

  // Scroll + mark seen on new messages
  useEffect(() => {
    scrollToBottom();
    markSeen();
  }, [messages]);

  if (loading)
    return <p className="text-center mt-4">Loading chat…</p>;

  return (
    <div className="container py-3" style={{ maxWidth: "750px" }}>
      <ToastContainer />

      {/* Back Button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Chat Header */}
      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex align-items-center">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#FFD34E",
              fontSize: 20,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {receiverName.charAt(0).toUpperCase()}
          </div>

          <div className="ms-3">
            <h5 className="mb-0">{receiverName}</h5>
            <small className="text-muted">
              Chat with your customer
            </small>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div
        className="card shadow-sm"
        style={{
          height: "60vh",
          overflowY: "auto",
          padding: "15px",
          background: "#F4F4F6",
        }}
      >
        {messages.length === 0 ? (
          <p className="text-center text-muted">No messages yet.</p>
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
                    background: mine ? "#FFE28A" : "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "12px",
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

      {/* Message Input */}
      <div className="d-flex mt-3">
        <textarea
          rows="2"
          className="form-control"
          placeholder="Type your message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          className="btn btn-warning ms-2 px-4"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default SellerChat;
