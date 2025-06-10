const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: String,
    duration: Number,
    description: String,
    genre: String,
    year: Number,
    director: String,
    rating: Number,
    poster: String,
    status: { type: String, default: 'active' }
});

module.exports = mongoose.model('Movie', MovieSchema);