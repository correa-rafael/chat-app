// src/app/pages/index.tsx
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import Layout from "../styles/layout";
import "../styles/globals.css";

const Home: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    // Prompt user for a username
    const user = prompt("Enter your username:");
    setUsername(user);

    // Add an event to handle messages received from the server
    newSocket.on("chat message", (data: any) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Clean up the socket when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (socket) {
      socket.emit("chat message", { message: inputMessage, username });
      setInputMessage("");
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="bg-blue-500 text-white p-2 mb-4 rounded-lg">
          <h2 className="text-lg font-bold">Chat Room</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ul className="space-y-2">
            {messages.map((msg, index) => (
              <li key={index} className="flex items-start">
                <div className="bg-gray-200 p-2 rounded">
                  <strong>{msg.username}:</strong> {msg.message}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="border p-2 flex-grow rounded"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
