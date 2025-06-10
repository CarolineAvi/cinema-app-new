const express = require('express');
const Movie = require('../models/movie');
const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
    const movies = await Movie.find();
    res.json(movies);
});

// Get movie by ID
router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
});

// Create new movie
router.post('/', async (req, res) => {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
});

// Update movie
router.put('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
});

// Delete movie
router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
});

module.exports = router;
