import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --------------------------
// Configuration - adjust to your backend
// --------------------------
const API_BASE = process.env.REACT_APP_API_BASE || "https://spidexmarket.onrender.com";
const API_CHAT = `${API_BASE}/api/message`;
const API_UPLOAD = `${API_BASE}/api/send`;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE; // socket server (same origin often works)

// --------------------------
// ChatApp: full-featured chat + chat list + realtime + file uploads + seen + online
// Drop this component where you want the chat to appear.
// Props: sellerId (optional) - if provided it will open that seller chat; otherwise user can pick
// --------------------------

export default function SendMessage({ sellerId = null }) {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  // Chat meta
  const [chatList, setChatList] = useState([]); // [{ _id, members: [...], lastMessage, unreadCount }]
  const [activeChat, setActiveChat] = useState(null); // chat object
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); // array of userIds

  // UI states
  const [fetchingChats, setFetchingChats] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // ---------- Initialize socket ----------
  useEffect(() => {
    if (!user || !token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      // register user
      s.emit("addUser", user._id);
    });

    s.on("getUsers", (users) => {
      // users: [{ userId, socketId }]
      setOnlineUsers(users.map((u) => u.userId));
    });

    s.on("receiveMessage", (msg) => {
      // If message belongs to active chat -> append and mark seen
      if (activeChat && msg.messageId === activeChat._id) {
        setMessages((prev) => [...prev, msg]);
        // notify server we've seen it
        s.emit("messageSeen", { messageId: activeChat._id, userId: user._id });
      }

      // update chatList lastMessage and unread counter
      setChatList((prev) => {
        const copy = prev.map((c) => {
          if (c._id === msg.messageId) {
            // if active chat is open, don't increase unread (we just appended)
            const unread = activeChat && activeChat._id === c._id ? 0 : (c.unreadCount || 0) + 1;
            return { ...c, lastMessage: msg, unreadCount: unread };
          }
          return c;
        });
        // if chat not present, optionally fetch chats again
        return copy;
      });

      // Browser push notification (optional)
      if (Notification && Notification.permission === "granted") {
        new Notification("New message", {
          body: msg.text || "Sent an attachment",
        });
      }

      // small toast
      toast.info("New message received", { autoClose: 1500 });
    });

    s.on("messageSeenUpdate", ({ messageId, userId }) => {
      // update last message seen status in chatList
      setChatList((prev) => prev.map((c) => (c._id === messageId ? { ...c, lastSeenBy: userId } : c)));
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, activeChat]);

  // ---------- Fetch chat list ----------
  useEffect(() => {
    if (!user || !token) return;
    fetchChats();
    // eslint-disable-next-line
  }, [user, token]);

  const fetchChats = async () => {
    try {
      setFetchingChats(true);
      const res = await axios.get(`${API_CHAT}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatList(res.data.chats || []);
    } catch (err) {
      console.error("fetchChats", err);
      toast.error("Failed to load chats");
    } finally {
      setFetchingChats(false);
    }
  };

  // ---------- Open or create chat with seller (when clicking from product) ----------
  useEffect(() => {
    if (!sellerId || !user) return;
    openOrCreateChatWithSeller(sellerId);
    // eslint-disable-next-line
  }, [sellerId, user]);

  const openOrCreateChatWithSeller = async (sellerId) => {
    try {
      // call API to find or create chat between logged user and seller
      const res = await axios.post(
        `${API_CHAT}/open`,
        { sellerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chat = res.data.chat;
      // set active chat and load messages
      setActiveChat(chat);
      fetchMessages(chat._id);

      // reset unread count for that chat in UI
      setChatList((prev) => prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("openOrCreateChatWithSeller", err);
      toast.error("Failed to open chat");
    }
  };

  // ---------- Fetch messages for a chat ----------
  const fetchMessages = async (chatId) => {
    if (!chatId || !token) return;
    try {
      const res = await axios.get(`${API_CHAT}/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);

      // mark messages as seen
      socket?.emit("messageSeen", { chatId, userId: user._id });

      // update unread locally
      setChatList((prev) => prev.map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("fetchMessages", err);
      toast.error("Failed to load messages");
    }
  };

  // When active chat changes, load messages
  useEffect(() => {
    if (!activeChat) return;
    fetchMessages(activeChat._id);
    // eslint-disable-next-line
  }, [activeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- Send message (text or file) ----------
  const sendMessage = async ({ text = "", file = null }) => {
    if (!text.trim() && !file) return;
    if (!activeChat) return toast.error("No active chat");

    setSending(true);

    try {
      let fileData = null;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await axios.post(API_UPLOAD, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        fileData = up.data.filePath || up.data.fileUrl || up.data;
      }

      const payload = {
        chatId: activeChat._id,
        text,
        file: fileData,
      };

      // Optimistic UI
      const optimistic = {
        ...payload,
        senderId: user._id,
        createdAt: new Date().toISOString(),
        _id: `tmp-${Date.now()}`,
      };

      setMessages((prev) => [...prev, optimistic]);

      // send to API which will persist and emit to other side
      const res = await axios.post(`${API_CHAT}/send`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const saved = res.data.message;

      // replace optimistic message with saved one
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));

      // emit via socket for realtime delivery
      socket?.emit("sendMessage", saved);

      // update chatList last message
      setChatList((prev) => prev.map((c) => (c._id === activeChat._id ? { ...c, lastMessage: saved } : c)));
    } catch (err) {
      console.error("sendMessage", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ---------- Helper UI: determine if a user is online ----------
  const isUserOnline = (userId) => onlineUsers.includes(userId);

  // ---------- Layout ----------
  return (
    <div className="row g-4">
      <ToastContainer />

      {/* CHAT LIST */}
      <div className="col-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Chats</h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={fetchChats}>Refresh</button>
          </div>

          <div className="card-body p-0" style={{ maxHeight: "600px", overflow: "auto" }}>
            {fetchingChats ? (
              <div className="p-3">Loading chats...</div>
            ) : chatList.length === 0 ? (
              <div className="p-3">No chats yet.</div>
            ) : (
              chatList.map((c) => {
                // compute other member info
                const other = c.members.find((m) => m._id !== user._id) || {};
                return (
                  <div key={c._id} className={`p-2 d-flex align-items-center border-bottom ${activeChat && activeChat._id === c._id ? "bg-light" : ""}`} style={{ cursor: "pointer" }} onClick={() => setActiveChat(c)}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      {other.name ? other.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <strong>{other.name || "Unknown"}</strong>
                        <small className="text-muted">{c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString() : ""}</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-truncate" style={{ maxWidth: 180 }}>{c.lastMessage ? (c.lastMessage.text || (c.lastMessage.file ? "[attachment]" : "")) : "No messages"}</div>
                        <div className="ms-2 text-end">
                          {c.unreadCount > 0 && <span className="badge bg-danger">{c.unreadCount}</span>}
                          {isUserOnline(other._id) && <span className="ms-2 badge bg-success">online</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* ACTIVE CHAT */}
      <div className="col-md-8">
        <div className="card h-100 shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div>
              <strong>{activeChat ? (activeChat.members.find(m => m._id !== user._id)?.name || "Chat") : "Select a chat"}</strong>
              <div className="small text-muted">{activeChat ? (isUserOnline(activeChat.members.find(m => m._id !== user._id)?._id) ? "Online" : "Offline") : ""}</div>
            </div>
            <div>
              {activeChat && <small className="text-muted">Last seen: {activeChat.lastSeenAt ? new Date(activeChat.lastSeenAt).toLocaleString() : "-"}</small>}
            </div>
          </div>

          <div className="card-body d-flex flex-column" style={{ height: "600px" }}>
            {!activeChat ? (
              <div className="d-flex align-items-center justify-content-center flex-grow-1">Select a chat to start messaging</div>
            ) : (
              <>
                <div className="flex-grow-1 overflow-auto mb-3" style={{ paddingRight: 12 }}>
                  {messages.map((m) => (
                    <div key={m._id} className={`d-flex mb-2 ${m.senderId === user._id ? "justify-content-end" : "justify-content-start"}`}>
                      <div className={`p-2 rounded-3 ${m.senderId === user._id ? "bg-primary text-white" : "bg-light border"}`} style={{ maxWidth: "70%" }}>
                        {m.file ? (
                          <div>
                            <a href={`${API_BASE}/${m.file}`} target="_blank" rel="noreferrer">View attachment</a>
                            <div className="small text-muted">{m.text}</div>
                          </div>
                        ) : (
                          <div>{m.text}</div>
                        )}
                        <div style={{ fontSize: 11, opacity: 0.8 }} className="mt-1 text-end">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {/* seen indicator */}
                        {m._id === (activeChat.lastMessage?._id) && activeChat.lastSeenBy === user._id && (
                          <div style={{ fontSize: 11, opacity: 0.7 }} className="text-end">Seen</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <ChatInput onSend={sendMessage} sending={sending} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------
// ChatInput component (text + file)
// --------------------------
function ChatInput({ onSend, sending }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
  };

  const submit = async () => {
    if (!text.trim() && !file) return;
    await onSend({ text, file });
    setText("");
    setFile(null);
  };

  return (
    <div className="d-flex align-items-center">
      <input
        type="text"
        className="form-control me-2"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <label className="btn btn-outline-secondary me-2 mb-0">
        📎
        <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
      </label>

      <button className="btn btn-primary" onClick={submit} disabled={sending}>
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
