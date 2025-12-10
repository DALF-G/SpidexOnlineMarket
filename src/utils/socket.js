import { io } from "socket.io-client";

const socket = io("https://spidexmarket.onrender.com", {
  transports: ["websocket"],
});

export default socket;
