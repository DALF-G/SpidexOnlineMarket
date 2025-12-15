import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// SAME API your old buyerChat & sellerChat used
const API_BASE = "https://spidexmarket.onrender.com/api/message";

const ChatBox = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // receiverId comes from:
  // 1. route param (buyer or seller)
  // 2. location.state
  const receiverId =
  location.state?.receiverId ||
  params.partnerId ||
  null;

  console.log("DEBUG → receiverId:", receiverId);
  console.log("DEBUG → params:", params);
  console.log("DEBUG → location.state:", location.state);
  

    const [receiverName, setReceiverName] = useState(
        location.state?.receiverName || ""
      );
      
  const productId = location.state?.productId || null;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const bottomRef = useRef(null);
  const pollingRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation
  const fetchMessages = async () => {
    if (!receiverId) return;

    try {
      const res = await axios.get(
        `${API_BASE}/conversation/${receiverId}`,
        { headers }
      );

      setMessages(res.data?.messages || []);
      setLoading(false);

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Load failed", err);
      setLoading(false);
    }
  };

  // Send Message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const payload = {
      sender: user._id,
      receiver: receiverId,
      product: productId,
      content: message.trim(),
      replyTo: replyTo ? replyTo._id : null,
    };

    try {
      setSending(true);
      await axios.post(`${API_BASE}/send`, payload, { headers });

      setMessage("");
      setReplyTo(null);
      fetchMessages();
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSendOnEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark messages as seen
  const markSeen = async () => {
    const unseen = messages.filter(
      (msg) => !msg.seen && msg.sender?._id === receiverId
    );

    for (let msg of unseen) {
      try {
        await axios.put(
          `${API_BASE}/seen`,
          { messageId: msg._id },
          { headers }
        );
      } catch {}
    }
  };

  // Polling every 3 sec just like original working chat
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);

    return () => clearInterval(pollingRef.current);
  }, [receiverId]);

  useEffect(() => {
    if (messages.length === 0) return;
  
    // Find ANY message where the other user is present
    const sample = messages.find(
      m =>
        (m.sender?._id !== user._id && m.sender) ||
        (m.receiver?._id !== user._id && m.receiver)
    );
  
    if (sample) {
      const correctName =
        sample.sender?._id !== user._id
          ? sample.sender.name
          : sample.receiver.name;
  
      setReceiverName(correctName);
    }
  }, [messages]);
  

  useEffect(() => {
    scrollToBottom();
    markSeen();
  }, [messages]);

  return (
    <div className="container py-3" style={{ maxWidth: "750px" }}>
      <ToastContainer />
      {/* Header */}
      <div className="card shadow-sm mb-3">
      <div className="card-body d-flex justify-content-between align-items-center">

    {/* LEFT SIDE — Avatar + Name */}
    <div className="d-flex align-items-center">
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

    {/* RIGHT SIDE — Back Button */}
    <button
      className="btn btn-outline-secondary btn-sm"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>

  </div>
</div>


      {/* Chat Window */}
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
          <p className="text-center text-muted">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.sender?._id === user._id;
            const isHighlighted = highlightId === msg._id;

            return (
              <div
                key={msg._id}
                className={`d-flex mb-3 ${
                  mine ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  onClick={() =>
                    setHighlightId(isHighlighted ? null : msg._id)
                  }
                  onDoubleClick={() => setReplyTo(msg)}
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: mine ? "#FFE28A" : "#ffffff",
                    border: "1px solid #ddd",
                    boxShadow: isHighlighted
                      ? "0 0 8px rgba(255,200,0,0.6)"
                      : "none",
                    cursor: "pointer",
                  }}
                >
                  {/* reply preview */}
                  {msg.replyTo && (
                    <div
                      style={{
                        background: "#eee",
                        padding: "4px",
                        borderLeft: "3px solid #FFD34E",
                        marginBottom: "6px",
                      }}
                    >
                      <small>
                        {messages.find((m) => m._id === msg.replyTo)?.content}
                      </small>
                    </div>
                  )}

                  {msg.content}

                  <small className="text-muted d-block mt-1">
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

      {/* Reply box */}
      {replyTo && (
        <div className="alert alert-warning mt-2 p-2">
          Replying to: <strong>{replyTo.content}</strong>
          <button
            onClick={() => setReplyTo(null)}
            className="btn btn-sm btn-link text-danger float-end"
          >
            cancel
          </button>
        </div>
      )}

      {/* Send message */}
      <div className="d-flex mt-3">
        <textarea
          rows="2"
          className="form-control"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSendOnEnter}
        />

        <button
          className="btn btn-warning ms-2 px-4"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
