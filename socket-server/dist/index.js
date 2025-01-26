"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Serve a basic route
app.get("/", (req, res) => {
    res.send("Socket.io Server is Running!");
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    }
});
// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("A user connected :", socket.id);
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        io.to(roomId).emit(`${socket.id} joined ${roomId}`);
    });
    socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit(`${socket.id} left ${roomId}`);
    });
    socket.on("room-message", ({ room, curMessage }) => {
        console.log({ room, curMessage });
        const messageData = {
            id: socket.id, // Sender's socket ID
            text: curMessage, // Message text
        };
        io.to(room).emit("room-message", messageData);
    });
    // Listen for custom events
    socket.on("message", (data) => {
        const messageData = {
            id: socket.id, // Sender's socket ID
            text: data, // Message text
        };
        // Broadcast the message to all clients
        io.emit("message", messageData);
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
