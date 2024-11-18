const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatRequestController');
const authMiddleware = require('../middleware/auth');

// Route to send a chat request
router.post('/send-request', chatController.sendChatRequest);

// Route to accept a chat request
router.post('/accept-request', chatController.acceptChatRequest);

// Route to reject a chat request
router.post('/reject-request', chatController.rejectChatRequest);

// Route to get pending chat requests
router.get('/pending-requests', authMiddleware, chatController.getPendingRequests);

module.exports = router;
