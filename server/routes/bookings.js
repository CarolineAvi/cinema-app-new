const express = require('express');
const Booking = require('../models/booking');
const ShowTime = require('../models/showtime'); // Assuming you have a ShowTime model
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

// Get today's bookings
router.get('/today', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({ bookingDate: today });
    res.json(bookings);
});

// Get today's sales stats
router.get('/stats/today', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({ bookingDate: today });

    const stats = bookings.reduce((acc, booking) => {
        if (booking.status !== 'cancelled') {
            acc.totalRevenue += booking.total;
            acc.totalTickets += booking.seats.length;
            if (booking.paymentMethod === 'cash') {
                acc.cashSales += booking.total;
            } else {
                acc.onlineSales += booking.total;
            }
            if (booking.isWalkIn) {
                acc.walkInCustomers++;
            } else {
                acc.onlineBookings++;
            }
        }
        return acc;
    }, {
        totalRevenue: 0,
        cashSales: 0,
        onlineSales: 0,
        totalTickets: 0,
        walkInCustomers: 0,
        onlineBookings: 0
    });

    res.json(stats);
});

// Create new booking
router.post('/', async (req, res) => {
    try {
        // Check if seats are still available
        const showtime = await ShowTime.findById(req.body.showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Seans nie został znaleziony' });
        }

        // Get existing bookings for this showtime
        const existingBookings = await Booking.find({
            showtimeId: req.body.showtimeId,
            status: { $in: ['confirmed', 'checked-in'] }
        });

        // Check for seat conflicts
        const occupiedSeats = existingBookings.flatMap(booking => booking.seats);
        const seatConflict = req.body.seats.some(seat => occupiedSeats.includes(seat));

        if (seatConflict) {
            return res.status(400).json({ 
                message: 'Wybrane miejsca zostały już zarezerwowane. Proszę wybrać inne miejsca.'
            });
        }

        // Create booking
        const booking = new Booking(req.body);
        await booking.save();

        // Update showtime's soldTickets count
        showtime.soldTickets = (showtime.soldTickets || 0) + req.body.seats.length;
        await showtime.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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
