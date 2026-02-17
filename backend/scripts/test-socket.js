import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    withCredentials: true
});

socket.on("connect", () => {
    console.log("✅ Client connected to server with ID:", socket.id);
    socket.emit("ping");
});

socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
});

socket.on("pong", (data) => {
    console.log("✅ Received pong from server:", data);
    process.exit(0);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
});

// Timeout if no connection after 5 seconds
setTimeout(() => {
    console.error("❌ Timeout: Could not connect to server");
    process.exit(1);
}, 5000);
