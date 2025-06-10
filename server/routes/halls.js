const express = require('express');
const router = express.Router();
const Hall = require('../models/hall');
const auth = require('../middleware/auth');

// Get all halls
router.get('/', async (req, res) => {
    try {
        const halls = await Hall.find();
        res.json(halls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one hall
router.get('/:id', async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });
        res.json(hall);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create hall (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const hall = new Hall({
        name: req.body.name,
        capacity: req.body.capacity,
        status: req.body.status,
        seatingLayout: {
            rows: req.body.seatingLayout.rows,
            seatsPerRow: req.body.seatingLayout.seatsPerRow
        }
    });

    try {
        const newHall = await hall.save();
        res.status(201).json(newHall);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update hall (Admin only)
router.patch('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });

        if (req.body.name) hall.name = req.body.name;
        if (req.body.capacity) hall.capacity = req.body.capacity;
        if (req.body.status) hall.status = req.body.status;
        if (req.body.seatingLayout) {
            if (req.body.seatingLayout.rows) hall.seatingLayout.rows = req.body.seatingLayout.rows;
            if (req.body.seatingLayout.seatsPerRow) hall.seatingLayout.seatsPerRow = req.body.seatingLayout.seatsPerRow;
        }

        const updatedHall = await hall.save();
        res.json(updatedHall);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete hall (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });
        
        await hall.deleteOne();
        res.json({ message: 'Hall deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;