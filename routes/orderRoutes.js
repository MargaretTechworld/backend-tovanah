const express = require('express');
const router = express.Router();
const { 
    getOrders, 
    getOrderById, 
    contactStudent, 
    addOrderItems, 
    getAdminStats 
} = require('../controllers/adminController');
const { getMyOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getOrders).post(protect, addOrderItems);
router.route('/mine').get(protect, getMyOrders);
router.route('/stats').get(protect, admin, getAdminStats);
router.route('/:id').get(protect, admin, getOrderById);
router.route('/contact').post(protect, admin, contactStudent);

module.exports = router;
