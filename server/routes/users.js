const express = require('express');
const User = require('../models/user');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all users
router.get('/', auth, async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
});

// Get user by ID
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    res.json(user);
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, accessLevel, phone, birthDate } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email już istnieje.' });
        const hash = await bcrypt.hash(password, 10);
        let newUser = new User({
            name,
            email,
            password: hash,
            phone,
            birthDate,
            role: role || 'customer',
            accessLevel: accessLevel || 3
        });

        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Update user
router.put('/:id', auth, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    res.json(user);
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Brak uprawnień' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    res.json({ message: 'Użytkownik usunięty.' });
});

module.exports = router;