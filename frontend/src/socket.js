import { io } from "socket.io-client";

export const socket = io("https://employee-and-workorder-management-system.onrender.com", {
  transports: ["websocket"],
});

