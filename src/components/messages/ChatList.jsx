import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const ChatList = () => {
  const { token, user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);

  const API = "https://spidexmarket.onrender.com/api/message/user";

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const msgs = res.data.messages || [];

      // GROUP MESSAGES BY OTHER USER
      const grouped = {};
      msgs.forEach((msg) => {
        const other =
          msg.sender._id === user._id ? msg.receiver : msg.sender;

        if (!grouped[other._id]) grouped[other._id] = {
          user: other,
          messages: [],
          unread: 0,
          lastMessage: null,
        };

        grouped[other._id].messages.push(msg);
        grouped[other._id].lastMessage = msg;
        if (!msg.seen && msg.receiver._id === user._id) {
          grouped[other._id].unread += 1;
        }
      });

      setThreads(Object.values(grouped));
    };

    load();
  }, [token]);

  return (
    <div>
      <h4 className="mb-4">Messages</h4>

      {threads.length === 0 ? (
        <div className="alert alert-info">No conversations yet.</div>
      ) : (
        <div className="list-group">
          {threads.map((t) => (
            <Link
              key={t.user._id}
              to={`/chat/${t.user._id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold">{t.user.name}</h6>

                {t.unread > 0 && (
                  <span className="badge bg-danger">{t.unread}</span>
                )}
              </div>

              <small className="text-muted">
                {t.lastMessage?.content?.slice(0, 40) || ""}
              </small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
