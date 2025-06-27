const express = require('express');
const router = express.Router();
const ShowTime = require('../models/showtime');
const Booking = require('../models/booking');
const auth = require('../middleware/auth');

// Get all showtimes
router.get('/', async (req, res) => {
    try {
        const showtimes = await ShowTime.find().populate('movieId').populate('hallId');
        res.json(showtimes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get showtimes for today
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const showtimes = await ShowTime.find({
            date: {
                $gte: today.toISOString().split('T')[0],
                $lt: tomorrow.toISOString().split('T')[0]
            }
        }).populate('movieId').populate('hallId');
        res.json(showtimes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one showtime
router.get('/:id', async (req, res) => {
    try {
        const showtime = await ShowTime.findById(req.params.id).populate('movieId').populate('hallId');
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        res.json(showtime);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create showtime (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    const showtime = new ShowTime({
        movieId: req.body.movieId,
        hallId: req.body.hallId,
        date: req.body.date,
        time: req.body.time,
        price: req.body.price,
        totalSeats: req.body.totalSeats,
        soldTickets: req.body.soldTickets || 0
    });
    try {
        const newShowtime = await showtime.save();
        res.status(201).json(newShowtime);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update showtime (Admin only)
router.patch('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const showtime = await ShowTime.findById(req.params.id);
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        if (req.body.movieId) showtime.movieId = req.body.movieId;
        if (req.body.hallId) showtime.hallId = req.body.hallId;
        if (req.body.date) showtime.date = req.body.date;
        if (req.body.time) showtime.time = req.body.time;
        if (req.body.price) showtime.price = req.body.price;
        if (req.body.totalSeats) showtime.totalSeats = req.body.totalSeats;
        if (req.body.soldTickets !== undefined) showtime.soldTickets = req.body.soldTickets;
        const updatedShowtime = await showtime.save();
        res.json(updatedShowtime);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete showtime (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const showtime = await ShowTime.findById(req.params.id);
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
        await showtime.deleteOne();
        res.json({ message: 'Showtime deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check seat availability
router.get('/:id/seats', async (req, res) => {
    try {
        const showtime = await ShowTime.findById(req.params.id).populate('hallId');
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

        // Get all bookings for this showtime
        const bookings = await Booking.find({
            showtimeId: req.params.id,
            status: { $in: ['confirmed', 'checked-in'] }
        });

        // Get all occupied seats
        const occupiedSeats = bookings.flatMap(booking => booking.seats);

        // Return occupied seats and hall layout
        res.json({
            occupiedSeats,
            hallLayout: showtime.hallId.seatingLayout,
            totalSeats: showtime.totalSeats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;