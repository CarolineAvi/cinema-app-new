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

// Run admin seeder on startup if no admin exists
const User = require('./models/user');
const bcrypt = require('bcryptjs');

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
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully to:', process.env.MONGO_URI);
        });

        // Create admin user if doesn't exist
        const adminExists = await User.findOne({ email: 'admin@cinema.local' });
        if (!adminExists) {
            const hash = await bcrypt.hash('admin123', 10);
            const admin = new User({
                name: 'Admin',
                email: 'admin@cinema.local',
                password: hash,
                accessLevel: 1
            });
            await admin.save();
            console.log('Default admin created: admin@cinema.local / admin123');
        }

        // Setup routes
        app.get('/', (req, res) => res.send('API running'));
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