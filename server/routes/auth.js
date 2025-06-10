const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '7d';

// Register for customers only
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        }
        
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email już istnieje.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hash,
            role: 'customer',
            accessLevel: 3
        });

        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(201).json({ user: { ...userObj, token } });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Register staff (protected, admin only)
router.post('/register/staff', async (req, res) => {
    try {
        // Check if requester is admin
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Brak autoryzacji' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await User.findById(decoded.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Brak uprawnień' });
        }

        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email już istnieje.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const staff = new User({
            name,
            email,
            password: hash,
            phone,
            role: 'staff',
            accessLevel: 2
        });

        await staff.save();
        const staffObj = staff.toObject();
        delete staffObj.password;
        res.status(201).json({ user: staffObj });
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
        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ user: { ...userObj, token } });
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

module.exports = router;