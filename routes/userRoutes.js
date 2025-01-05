const express = require('express');
const router = express.Router();
const { getUsers, getSingleUser, updateUser, upload } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Middleware to protect routes

// Define the routes
router.get('/', authMiddleware, getUsers);
router.get('/user/:id', authMiddleware, getSingleUser); // Get a single user by ID
router.put('/users/:id', upload.single('profileImage'), updateUser);


module.exports = router;
