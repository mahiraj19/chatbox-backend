const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        // Exclude the logged-in user by using their ID from the request object
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
