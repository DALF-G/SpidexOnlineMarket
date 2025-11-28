import React, { useState } from "react";
import ChatBox from "./ChatBox";
import axios from "axios";

const ChatPage = ({ sellerId }) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (text) => {
    const newMessage = { text, isBuyer: true };

    // Show instantly
    setMessages((prev) => [...prev, newMessage]);

    // Send to API
    try {
      await axios.post("https://spidexmarket.onrender.com/api/message/send", {
        sellerId,
        text,
      });
    } 
    catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="container mt-4">
      <h4>Chat with Seller</h4>
      <ChatBox messages={messages} onSend={sendMessage} />
    </div>
  );
};

export default ChatPage;
