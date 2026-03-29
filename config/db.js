const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Log the error but don't exit; this helps the app stay up so Render can report it.
        // process.exit(1); 
    }
};

module.exports = connectDB;
