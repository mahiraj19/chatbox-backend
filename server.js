const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-database-name';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Store connected users
let onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        onlineUsers.set(userId, socket.id); // Store user ID and socket ID
        console.log(`User ${userId} joined their room`);

        // Emit 'userOnline' to all clients when a user goes online
        io.emit('userOnline', userId);
    });

    // Handle sending messages
    socket.on('sendMessage', (data) => {
        const { sender, receiver, content } = data;
        const newMessage = { sender, receiver, content, timestamp: new Date() };

        // Emit the message to the receiver's room
        socket.to(receiver).emit('receiveMessage', newMessage);
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        let offlineUserId = null;

        // Find the user who disconnected and remove them from onlineUsers
        for (let [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                offlineUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }

        // Emit 'userOffline' to all clients when a user goes offline
        if (offlineUserId) {
            io.emit('userOffline', offlineUserId);
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});