const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    orderItems: [
        {
            title: { type: String, required: true },
            qty: { type: Number, required: true, default: 1 },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            course: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Course',
            },
        },
    ],
    paymentMethod: {
        type: String,
        required: true,
        default: 'Stripe',
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
