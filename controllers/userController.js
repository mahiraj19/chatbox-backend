const User = require('../models/User');
const multer = require('multer');
const path = require('path');

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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename
    }
});

const upload = multer({ storage });

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prepare fields for update
        const { name, email, mobile, gender } = req.body;
        const updateFields = { name, email, mobile, gender };

        // Handle file upload
        if (req.file) {
            updateFields.profileImage = 'images/' + req.file.filename;
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true } // Return the updated document
        );

        res.json({
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.upload = upload;
