import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

const socket = io(SOCKET_URL);

export default function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, { type: "msg", ...data }]);
    });
    socket.on("system", (text) => {
      setMessages((prev) => [...prev, { type: "system", text }]);
    });
    socket.on("users", (list) => setUsers(list));

    return () => {
      socket.off("message");
      socket.off("system");
      socket.off("users");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    socket.emit("join", username.trim());
    setJoined(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("message", { text: message.trim() });
    setMessage("");
  };

  if (!joined) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <h1>Chat Application</h1>
          <form onSubmit={handleJoin}>
            <input
              autoFocus
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <h3>Online ({users.length})</h3>
        <ul>
          {users.map((u) => (
            <li key={u}>
              <span className="dot" /> {u}
            </li>
          ))}
        </ul>
      </aside>

      <div className="chat-area">
        <header>
          <h2>💬 Live Chat</h2>
          <span>Logged in as <strong>{username}</strong></span>
        </header>

        <div className="messages">
          {messages.map((m, i) =>
            m.type === "system" ? (
              <div key={i} className="system-msg">{m.text}</div>
            ) : (
              <div key={i} className={`bubble ${m.username === username ? "mine" : "theirs"}`}>
                <span className="sender">{m.username}</span>
                <p>{m.text}</p>
                <span className="time">{m.time}</span>
              </div>
            )
          )}
          <div ref={bottomRef} />
        </div>

        <form className="input-row" onSubmit={handleSend}>
          <input
            autoFocus
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}