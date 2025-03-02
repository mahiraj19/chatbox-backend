const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth'); // Middleware to protect routes
const ChatRequest = require('../models/ChatRequest');
const mongoose = require('mongoose');

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

// Send Chat Request
router.post('/send-request', async (req, res) => {
    const { senderId, receiverId } = req.body;

    // Validate senderId and receiverId to be valid Mongo ObjectIds
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid sender or receiver ID.' });
    }

    // Check if a request already exists
    const existingRequest = await ChatRequest.findOne({ sender: senderId, receiver: receiverId, status: 'pending' });
    if (existingRequest) {
        return res.status(400).json({ message: 'Chat request already sent.' });
    }

    // Create a new chat request
    const chatRequest = new ChatRequest({ sender: senderId, receiver: receiverId });
    await chatRequest.save();
    res.json({ success: true, message: 'Chat request sent.' });
});

// Accept Chat Request
router.post('/accept-request', async (req, res) => {
    const { requestId } = req.body;

    // Validate requestId to be a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: 'Invalid request ID.' });
    }

    const request = await ChatRequest.findById(requestId);
    if (request) {
        request.status = 'accepted';
        await request.save();
        res.json({ success: true, message: 'Chat request accepted.' });
    } else {
        res.status(404).json({ message: 'Chat request not found.' });
    }
});

// Reject Chat Request
router.post('/reject-request', async (req, res) => {
    const { requestId } = req.body;

    // Validate requestId to be a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: 'Invalid request ID.' });
    }

    const request = await ChatRequest.findById(requestId);
    if (request) {
        request.status = 'rejected';
        await request.save();
        res.json({ success: true, message: 'Chat request rejected.' });
    } else {
        res.status(404).json({ message: 'Chat request not found.' });
    }
});

// Get Pending Chat Requests
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log(req.user, '=========>');
        const userId = req.user.id; // Get the user ID from the authenticated user

        // Find all pending requests where the user is either the sender or receiver
        const pendingRequests = await ChatRequest.find({
            $or: [
                { sender: userId, status: 'pending' },
                { receiver: userId, status: 'pending' }
            ]
        }).populate('sender receiver', 'name email');  // Optionally populate sender and receiver details

        res.json(pendingRequests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
