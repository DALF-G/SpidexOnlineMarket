import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://spidexmarket.onrender.com"); // your backend

const ChatBox = ({ userId, receiverId, product, onClose }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // Fetch chat history
  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `https://spidexmarket.onrender.com/api/chat/history/${userId}/${receiverId}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.log("Failed loading history");
    }
  };

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket + join chat room
  useEffect(() => {
    socket.emit("join-chat", { userId, receiverId });

    // receive new message live
    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    fetchHistory();

    return () => {
      socket.off("new-message");
    };
  }, [receiverId]);

  const handleSend = () => {
    if (!text.trim()) return;

    const msg = {
      text,
      senderId: userId,
      receiverId: receiverId,
      productId: product?._id || null,
      timestamp: new Date(),
    };

    // send to server
    socket.emit("send-message", msg);

    // show instantly (before server returns)
    setMessages((prev) => [...prev, { ...msg, isLocal: true }]);
    setText("");
  };

  const sendInitialInquiry = () => {
    const autoMsg = `Hello, I'm interested in "${product?.title}". Is it still available?`;

    const msg = {
      text: autoMsg,
      senderId: userId,
      receiverId: receiverId,
      productId: product?._id || null,
      timestamp: new Date(),
    };

    socket.emit("send-message", msg);
    setMessages((prev) => [...prev, msg]);
  };

  // Auto-send inquiry when chat starts
  useEffect(() => {
    if (product) sendInitialInquiry();
  }, []);

  return (
    <div
      className="chat-container border rounded p-3 shadow-sm"
      style={{
        height: "420px",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* Chat Header */}
      <div className="d-flex justify-content-between mb-2">
        <strong>Chat with Seller</strong>
        <button className="btn btn-sm btn-outline-danger" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="chat-body flex-grow-1 overflow-auto mb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex mb-2 ${
              msg.senderId === userId
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={
                msg.senderId === userId
                  ? "p-2 bg-primary text-white rounded-3"
                  : "p-2 bg-light border rounded-3"
              }
              style={{ maxWidth: "70%" }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={scrollRef}></div>
      </div>

      {/* Input */}
      <div className="chat-input d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
