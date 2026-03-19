const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, contactStudent, addOrderItems } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getOrders).post(protect, addOrderItems);
router.route('/:id').get(protect, admin, getOrderById);
router.route('/contact').post(protect, admin, contactStudent);

module.exports = router;
