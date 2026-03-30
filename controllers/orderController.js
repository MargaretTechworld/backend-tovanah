const Order = require('../models/orderModel');

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.course', 'title image price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your orders', error: error.message });
    }
};

module.exports = { getMyOrders };
