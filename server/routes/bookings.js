const express = require('express');
const Booking = require('../models/booking');
const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
});

// Get bookings by user
router.get('/user/:userId', async (req, res) => {
    const bookings = await Booking.find({ customerId: req.params.userId });
    res.json(bookings);
});

// Create new booking
router.post('/', async (req, res) => {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
});

// Update booking
router.put('/:id', async (req, res) => {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
});

// Delete booking
router.delete('/:id', async (req, res) => {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
});

module.exports = router;
