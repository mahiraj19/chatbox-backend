const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(req.params.id,'req.params.id');
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};