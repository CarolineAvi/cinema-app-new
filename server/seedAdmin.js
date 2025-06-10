const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cinema';

async function createInitialAdmin() {
    const adminData = {
        name: 'Admin',
        email: 'admin@cinema.local',
        password: 'admin123',
        role: 'admin',
        accessLevel: 1
    };

    try {
        const hash = await bcrypt.hash(adminData.password, 10);
        const admin = new User({
            ...adminData,
            password: hash
        });
        await admin.save();
        console.log('Default admin created:', adminData.email);
        return admin;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
    }
}

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            await createInitialAdmin();
            console.log('Admin seeding completed');
        } else {
            console.log('Admin already exists, skipping seed');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
