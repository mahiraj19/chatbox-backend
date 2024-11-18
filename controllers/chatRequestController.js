const mongoose = require('mongoose');
const Message = require('../models/Message');
const ChatRequest = require('../models/ChatRequest');
const User = require('../models/User');

// Get messages between two users
exports.getMessages = async (req, res) => {
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
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    const { receiver, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiver)) {
        return res.status(400).json({ message: 'Invalid receiver ID' });
    }

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
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Send chat request
exports.sendChatRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid sender or receiver ID.' });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
        return res.status(404).json({ message: 'Receiver not found.' });
    }

    const existingRequest = await ChatRequest.findOne({ sender: senderId, receiver: receiverId, status: 'pending' }).select('_id');
    if (existingRequest) {
        return res.status(400).json({ message: 'Chat request already sent.' });
    }

    const chatRequest = new ChatRequest({ sender: senderId, receiver: receiverId });
    await chatRequest.save();
    res.json({ success: true, message: 'Chat request sent.' });
};

// Accept chat request
exports.acceptChatRequest = async (req, res) => {
    const { requestId } = req.body;

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
};

// Reject chat request
exports.rejectChatRequest = async (req, res) => {
    const { requestId } = req.body;

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
};

// Get pending chat requests
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const pendingRequests = await ChatRequest.find({
            $or: [
                { sender: userId},
                { receiver: userId}
            ]
        }).populate('sender receiver', 'name email');

        res.json(pendingRequests);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to fetch pending requests' });
    }
};
