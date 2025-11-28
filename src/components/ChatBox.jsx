import React, { useEffect, useRef, useState } from "react";

const ChatBox = ({ messages, onSend }) => {
  const [text, setText] = useState("");
  const scrollRef = useRef();

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  // Auto scroll down
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container border rounded p-3 shadow-sm" style={{ height: "420px", display: "flex", flexDirection: "column" }}>
      
      {/* Messages Area */}
      <div className="chat-body flex-grow-1 overflow-auto mb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex mb-2 ${msg.isBuyer ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`p-2 rounded-3 ${
                msg.isBuyer ? "bg-primary text-white" : "bg-light border"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Scroll Ref */}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Area */}
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
