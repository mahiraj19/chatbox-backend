const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        // Use User.find() to fetch all users
        const users = await User.find(); // Retrieves all user documents from the database
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
