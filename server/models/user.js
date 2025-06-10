const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    accessLevel: { type: Number, default: 3 }, // 1=admin, 2=staff, 3=customer
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    preferences: {
        notifications: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false },
        favoriteGenres: [String]
    },
    phone: String,
    birthDate: String
});

module.exports = mongoose.model('User', UserSchema);