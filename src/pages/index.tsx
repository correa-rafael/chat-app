// chat-app/src/pages/index.tsx
import { useEffect } from "react";
import io from "socket.io-client";

const Home: React.FC = () => {
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("connected to server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
    </div>
  );
};

export default Home;
