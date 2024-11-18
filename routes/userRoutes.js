const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Middleware to protect routes

// Define the routes
router.get('/', authMiddleware, getUsers);


module.exports = router;
