// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth'); // Middleware to protect routes

// Route to get messages between two users
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Route to send a message
router.post('/', authMiddleware, async (req, res) => {
    const { receiver, content } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            content
        });

        await newMessage.save();
        res.json(newMessage);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
