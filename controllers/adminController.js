const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send email to student with attachments
// @route   POST /api/orders/contact
// @access  Private/Admin
const contactStudent = async (req, res) => {
    const { email, subject, message, attachments } = req.body;

    try {
        await sendEmail({
            email,
            subject,
            message: `<div style="font-family: Arial, sans-serif;">${message}</div>`,
            attachments: attachments || [] // Attachments should be an array of { filename, content/path }
        });
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        paymentMethod,
        totalPrice,
        paymentResult,
        isPaid,
        paidAt
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            user: req.user._id,
            orderItems,
            paymentMethod,
            totalPrice,
            paymentResult,
            isPaid,
            paidAt
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const totalStudents = await User.countDocuments({ isAdmin: false });
        const pendingApplications = await Application.countDocuments({ status: 'Pending' });

        console.log(`Stats DEBUG: Courses=${totalCourses}, Students=${totalStudents}, Pending=${pendingApplications}`);

        const sales = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalSales = sales.length > 0 ? sales[0].total : 0;

        // Fetch recent activity
        const recentApplications = await Application.find({})
            .populate('user', 'name')
            .populate('course', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentOrders = await Order.find({})
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalCourses,
            totalStudents,
            pendingApplications,
            totalSales,
            recentApplications,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admin statistics', error: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    contactStudent,
    addOrderItems,
    getAdminStats
};
