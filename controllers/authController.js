const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        // Use a promise-based approach for signing
        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) reject(err);
                    resolve(token);
                }
            );
        });

        res.status(201).json({ token, userId: user.id });
    } catch (err) {
        console.error(err.message); // Ensure no sensitive info is logged
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) reject(err);
                    resolve(token);
                }
            );
        });

        res.json({ token, userId: user.id });
    } catch (err) {
        console.error(err.message); // Ensure no sensitive info is logged
        res.status(500).json({ msg: 'Server error' });
    }
};
