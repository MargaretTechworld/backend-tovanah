const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/create-payment-intent').post(createPaymentIntent);
router.route('/webhook').post(express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
