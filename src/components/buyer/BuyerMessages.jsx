import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const BuyerMessages = () => {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const API_MY_MESSAGES = "https://spidexmarket.onrender.com/api/message/my";
  const API_MARK_SEEN = "https://spidexmarket.onrender.com/api/message/seen";

  useEffect(() => {
    if (!token || !user?._id) return;

    const loadMessages = async () => {
      try {
        setLoading(true);

        const res = await axios.get(API_MY_MESSAGES, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allMessages = res.data.messages || [];

        // Filter messages where logged-in buyer is sender or receiver
        const myMessages = allMessages.filter(
          (msg) =>
            msg.sender?._id === user._id ||
            msg.receiver?._id === user._id
        );

        setMessages(myMessages);

        // Group by seller
        const convMap = {};

        myMessages.forEach((msg) => {
          // Identify conversation partner
          const otherUser =
            msg.sender?._id === user._id ? msg.receiver : msg.sender;

          if (!otherUser) return;

          const sellerId = otherUser._id;

          if (!convMap[sellerId]) {
            convMap[sellerId] = {
              sellerId,
              sellerName: otherUser.name || "Seller",
              messages: [],
            };
          }

          convMap[sellerId].messages.push(msg);
        });

        // Build conversation objects
        const convList = Object.values(convMap).map((conv) => {
          const sorted = [...conv.messages].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          return {
            ...conv,
            lastMessage: sorted[0],
            unread: sorted.filter(
              (m) => !m.seen && m.sender?._id !== user._id
            ).length,
          };
        });

        setConversations(convList);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [token, user]);

  // When a conversation is opened, mark all partner messages as seen
  const openConversation = async (sellerId, messages) => {
    try {
      const unseen = messages.filter(
        (msg) => !msg.seen && msg.sender?._id === sellerId
      );

      await Promise.all(
        unseen.map((msg) =>
          axios.put(
            API_MARK_SEEN,
            { messageId: msg._id },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );
    } catch (err) {
      console.error("Mark seen failed", err);
    }

    navigate(`/buyer-dashboard/messages/chat/${sellerId}`);
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div>
      <h3 className="text-success mb-4">
        <i className="bi bi-inbox me-2"></i> Inbox
      </h3>

      {conversations.length === 0 ? (
        <div className="alert alert-info">No messages yet.</div>
      ) : (
        <div className="list-group shadow-sm">
          {conversations.map((conv) => (
            <div
              key={conv.sellerId}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
            >
              {/* Header row */}
              <div
                className="d-flex justify-content-between"
                onClick={() =>
                  openConversation(conv.sellerId, conv.messages)
                }
              >
                <h6 className="fw-bold mb-1">{conv.sellerName}</h6>

                {conv.unread > 0 && (
                  <span className="badge bg-danger">{conv.unread}</span>
                )}
              </div>

              {/* Last message preview */}
              <p className="text-muted mb-1">
                {conv.lastMessage?.content?.slice(0, 45) || "No message"}…
              </p>

              <small className="text-muted d-block mb-2">
                {new Date(conv.lastMessage?.createdAt).toLocaleString()}
              </small>

              {/* Buttons */}
              <div className="mt-2 d-flex gap-2">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() =>
                    openConversation(conv.sellerId, conv.messages)
                  }
                >
                  Open Chat
                </button>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    navigate(
                      `/buyer-dashboard/messages/chat/${conv.sellerId}`,
                      { state: { replyTo: conv.lastMessage } }
                    )
                  }
                >
                  Reply
                </button>

                <Link
                  to={`/buyer-dashboard/messages/chat/${conv.sellerId}`}
                  className="btn btn-sm btn-outline-secondary"
                >
                  View Conversation
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerMessages;
