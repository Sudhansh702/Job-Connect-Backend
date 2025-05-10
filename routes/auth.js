const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../models/userSchema");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
// signup route
router.post('/signup', async (req, res) => { 
    try {
        const userData = req.body.userData;
        const { username, email } = userData;

        const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (user) {
            return res.status(400).json({ error: 'Username or email already used' });
        }

        const newUser = new User(userData);
        await newUser.save();

        // Generate token and login
        const token = jwt.sign(
            { id: newUser._id, username: username},
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ message: `Signup successful and logged in as ${username}`, token });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during signup', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body.logInData;
        const user = await User.findOne({ username: username, password: password });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, username: username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ token:token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// profile route to get user details
router.get('/getuser', authMiddleware, async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findOne({ _id: id }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching the user details' });
    }
});

// verify token
router.get('/api/verify-token', authMiddleware, (req, res) => {
    return res.status(200).json({ valid: true, user: req.user });
});


module.exports = router;





