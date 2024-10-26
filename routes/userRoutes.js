const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');

// Define the routes
router.get('/', getUsers);


module.exports = router;
