const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
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
        let newUser = {
            name,
            email,
            password,
            phone,
            birthDate,
            role: 'customer', // default
            accessLevel: 3    // default
        };
        // If the request is authenticated and user is admin, allow setting role/accessLevel
        if (req.user && req.user.role === 'admin') {
            if (role) newUser.role = role;
            if (accessLevel) newUser.accessLevel = accessLevel;
        }
        const user = new User(newUser);
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (err) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    res.json(user);
});

// Delete user
router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    res.json({ message: 'Użytkownik usunięty.' });
});

module.exports = router;