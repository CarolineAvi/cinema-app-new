const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    movieTitle: String,
    showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    date: String,
    time: String,
    hall: String,
    seats: [String],
    total: Number,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: String,
    customerEmail: String,
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed', 'checked-in'], default: 'confirmed' },
    bookingDate: String,
    paymentMethod: String,
    isWalkIn: { type: Boolean, default: false },
    soldBy: String,
    poster: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);