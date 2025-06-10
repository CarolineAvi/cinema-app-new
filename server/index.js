const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const bookingsRouter = require('./routes/bookings');
const hallsRouter = require('./routes/halls');
const showtimesRouter = require('./routes/showtimes');

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true,
            w: 'majority'
        });
        
        // Remove admin creation code from here since it's handled by seedAdmin.js

        // Setup routes
        app.use('/api/movies', moviesRouter);
        app.use('/api/auth', authRouter);
        app.use('/api/users', usersRouter);
        app.use('/api/bookings', bookingsRouter);
        app.use('/api/halls', hallsRouter);
        app.use('/api/showtimes', showtimesRouter);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();