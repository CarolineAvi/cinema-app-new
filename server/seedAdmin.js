const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinema';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        // Always remove any existing admin user to avoid role issues
        await User.deleteOne({ email: 'admin@cinema.local' });
        const hash = await bcrypt.hash('admin123', 10);
        const admin = new User({
            name: 'Admin',
            email: 'admin@cinema.local',
            password: hash,
            role: 'admin',
            accessLevel: 1
        });
        await admin.save();
        console.log('Default admin created: admin@cinema.local / admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
