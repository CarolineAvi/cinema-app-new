const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email już istnieje.' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({ user: userObj });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Nieprawidłowy email lub hasło.' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Nieprawidłowy email lub hasło.' });
        user.lastLogin = new Date();
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        res.json({ user: userObj });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

module.exports = router;