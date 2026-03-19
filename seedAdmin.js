const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const seedAdmin = async () => {
    try {
        const userExists = await User.findOne({ email: 'admin@example.com' });

        if (userExists) {
            console.log('Admin user already exists');
            console.log('Email: admin@example.com');
            console.log('Password: (The one you set previously)');
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123', // This will be hashed by the model pre-save hook
                isAdmin: true,
            });
            console.log('Admin user created successfully');
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
