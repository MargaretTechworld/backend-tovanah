const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
// Webhook needs raw body, exclude from standard json parsing
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payment/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const contentRoutes = require('./routes/contentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// ...

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
