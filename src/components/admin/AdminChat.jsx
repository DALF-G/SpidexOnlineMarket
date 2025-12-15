import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://spidexmarket.onrender.com/api/message";

const AdminChat = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);

  const [activeReceiver, setActiveReceiver] = useState(null);
  const [receiverName, setReceiverName] = useState("User");

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [replyTo, setReplyTo] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [autoScroll, setAutoScroll] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  /* ------------------------------------------
     READ PARTICIPANTS FROM location.state
  -------------------------------------------*/
  useEffect(() => {
    const participants = location.state?.participants;

    if (participants && participants.length === 2) {
      const a = participants[0];
      const b = participants[1];

      setUserA(a);
      setUserB(b);

      // Pick the person who is NOT admin as default
      const other = participants.find((p) => p._id !== user._id) || participants[0];

      setActiveReceiver(other._id);
      setReceiverName(other.name);
    }
  }, [location.state, user._id]);

  /* ------------------------------------------
     SMART SCROLLING
  -------------------------------------------*/
  const scrollToBottom = () => {
    if (!autoScroll) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const chatWindow = document.getElementById("admin-chat-window");
    if (!chatWindow) return;

    const handleScroll = () => {
      const isAtBottom =
        chatWindow.scrollHeight - chatWindow.scrollTop <=
        chatWindow.clientHeight + 40;

      setAutoScroll(isAtBottom);
    };

    chatWindow.addEventListener("scroll", handleScroll);
    return () => chatWindow.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------------------------------
     FETCH MESSAGES (Smart Polling)
  -------------------------------------------*/
  const fetchMessages = async (silent = false) => {
    if (!userA || !userB) return;

    setLoading(!silent);

    try {
      const res = await axios.get(
        `${API_BASE}/conversation/${userA._id}/${userB._id}`,
        headers
      );

      const newMessages = res.data.messages || [];

      const latestTimestamp = newMessages[newMessages.length - 1]?.createdAt;

      // Only update messages if something has changed
      if (latestTimestamp !== lastFetchedAt) {
        setLastFetchedAt(latestTimestamp);
        setMessages(newMessages);

        if (autoScroll) setTimeout(scrollToBottom, 70);
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch admin chat error:", err);
      if (!silent) toast.error("Failed to load conversation");
      setLoading(false);
    }
  };

  /* ------------------------------------------
     POLLING (Silent)
  -------------------------------------------*/
  useEffect(() => {
    fetchMessages(false);

    pollRef.current = setInterval(() => fetchMessages(true), 3500);

    return () => clearInterval(pollRef.current);
  }, [userA, userB]);

  /* ------------------------------------------
     SEND MESSAGE
  -------------------------------------------*/
  const sendMessage = async () => {
    if (!message.trim()) return;

    const payload = {
      sender: user._id,
      receiver: activeReceiver,
      content: message.trim(),
      replyTo: replyTo ? replyTo._id : null,
    };

    try {
      setSending(true);
      await axios.post(`${API_BASE}/send`, payload, headers);

      setMessage("");
      setReplyTo(null);

      fetchMessages(false);
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ------------------------------------------
     DELETE MESSAGE
  -------------------------------------------*/
  const deleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(`${API_BASE}/delete/${msgId}`, headers);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ------------------------------------------
     DELETE ENTIRE CONVERSATION
  -------------------------------------------*/
  const deleteConversation = async () => {
    if (!window.confirm("Delete ENTIRE conversation?")) return;

    try {
      await axios.delete(
        `${API_BASE}/conversation/${activeReceiver}`,
        headers
      );

      setMessages([]);
      toast.success("Conversation deleted");
    } catch {
      toast.error("Deletion failed");
    }
  };

  /* ------------------------------------------
     SWITCH CHAT VIEW (Buyer ↔ Seller)
  -------------------------------------------*/
  const handleSwitch = (target) => {
    if (!target) return;

    setActiveReceiver(target._id);
    setReceiverName(target.name);
    setMessages([]);
    fetchMessages(false);
  };

  /* ------------------------------------------
     RENDER UI
  -------------------------------------------*/
  return (
    <div className="container py-2" style={{ maxWidth: "750px" }}>
      <ToastContainer />

      {/* HEADER */}
      <div className="card shadow-sm mb-2">
        <div className="card-body d-flex justify-content-between align-items-center">
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
              {receiverName?.charAt(0)}
            </div>

            <div className="ms-3">
              <h5 className="mb-0">{receiverName}</h5>
              <small className="text-muted">Admin Conversation View</small>
            </div>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* SWITCH BUTTONS */}
        <div className="p-2 d-flex gap-2">
          {userA && (
            <button
              className={`btn btn-sm ${
                activeReceiver === userA._id
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => handleSwitch(userA)}
            >
              Chat with {userA.name}
            </button>
          )}

          {userB && (
            <button
              className={`btn btn-sm ${
                activeReceiver === userB._id
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => handleSwitch(userB)}
            >
              Chat with {userB.name}
            </button>
          )}

          <button
            className="btn btn-sm btn-danger ms-auto"
            onClick={deleteConversation}
          >
            Delete Conversation
          </button>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div
        id="admin-chat-window"
        className="card shadow-sm"
        style={{
          height: "60vh",
          overflowY: "auto",
          padding: "15px",
          background: "#F4F4F6",
        }}
      >
        {loading ? (
          <p className="text-center text-muted">Loading chat…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted">No messages here.</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.sender?._id === user._id;
            const highlighted = highlightId === msg._id;

            return (
              <div
                key={msg._id}
                className={`d-flex mb-3 ${
                  mine ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  onClick={() =>
                    setHighlightId(highlighted ? null : msg._id)
                  }
                  onDoubleClick={() => setReplyTo(msg)}
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: mine ? "#d4ffe1" : "#ffffff",
                    border: "1px solid #ddd",
                    boxShadow: highlighted
                      ? "0 0 10px rgba(0,150,0,0.5)"
                      : "none",
                    cursor: "pointer",
                    whiteSpace: "pre-wrap",
                    position: "relative",
                  }}
                >
                  {/* Sender Name */}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "3px",
                      color: mine ? "#049c5a" : "#333",
                    }}
                  >
                    {msg.sender?.name}
                  </div>

                  {/* Reply Preview */}
                  {msg.replyTo && (
                    <div
                      style={{
                        padding: "4px",
                        background: "#eee",
                        borderLeft: "3px solid #00a884",
                        marginBottom: "6px",
                        fontSize: "12px",
                      }}
                    >
                      <em>
                        {messages.find((m) => m._id === msg.replyTo)?.content}
                      </em>
                    </div>
                  )}

                  {msg.content}

                  <small className="text-muted d-block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>

                  {/* Delete Button */}
                  <button
                    className="btn btn-sm btn-link text-danger p-0"
                    style={{
                      position: "absolute",
                      bottom: "-5px",
                      right: "-5px",
                    }}
                    onClick={() => deleteMessage(msg._id)}
                  >
                    delete
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="alert alert-info mt-2 p-2">
          Replying to: {replyTo.content}
          <button
            className="btn btn-sm btn-link float-end text-danger"
            onClick={() => setReplyTo(null)}
          >
            cancel
          </button>
        </div>
      )}

      {/* MESSAGE INPUT */}
      <div className="d-flex mt-2">
        <textarea
          className="form-control"
          rows="2"
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnter}
        />

        <button
          className="btn btn-success ms-2 px-4"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AdminChat;
