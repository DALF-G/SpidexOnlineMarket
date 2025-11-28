import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_CHAT = "https://spidexmarket.onrender.com/api/message/send";

const SendMessage = ({ token }) => {
  const [params] = useSearchParams();

  const sellerId = params.get("seller");
  const productId = params.get("product");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      return toast.error("Please type a message");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_CHAT}/send`,
        {
          sellerId,
          productId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Message sent successfully!");
      setMessage(""); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer />

      <h3 className="mb-3 text-warning">Message Seller</h3>

      <div className="card shadow-sm p-3">
        <label className="fw-bold">Type your message:</label>
        <textarea
          className="form-control mt-2"
          rows="4"
          placeholder="Write something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button
          className="btn btn-warning mt-3"
          disabled={loading}
          onClick={sendMessage}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  );
};

export default SendMessage;
