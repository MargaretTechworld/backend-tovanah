const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here' 
    ? Stripe(process.env.STRIPE_SECRET_KEY) 
    : { 
        paymentIntents: { create: () => { throw new Error('Stripe API Key not configured'); } },
        webhooks: { constructEvent: () => { throw new Error('Stripe Webhook Secret not configured'); } } 
    };
const Order = require('../models/orderModel');
const Course = require('../models/courseModel');
const sendEmail = require('../utils/sendEmail');

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    const { items, email } = req.body; // Expect email in body for guest checkout or from user context

    try {
        // Fetch course price from DB to be secure
        const course = await Course.findById(items[0].id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const amount = course.price * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                courseId: course._id.toString(),
                email: email,
            }
        });

        // In a real app, you'd use webhooks for email sending to be robust. 
        // For simplicity here, we assume intent creation is enough to prep client, 
        // but actual email should be sent on webhook 'payment_intent.succeeded'.
        // However, user asked for "once paid information will tell you about the course in your email".
        // Use webhook or send strictly after confirmation on frontend (insecure).
        // Best approach: Webhook. 

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { courseId, email } = paymentIntent.metadata;

        const course = await Course.findById(courseId);

        const message = `
            <h1>Thank you for enrolling in ${course.title}</h1>
            <p>We are excited to have you on board.</p>
            ${course.mode === 'Online' ? `<p><strong>Zoom Link:</strong> <a href="${course.zoomLink}">${course.zoomLink}</a></p>` : `<p><strong>Location:</strong> ${course.location}</p>`}
            <p>Please keep this information safe.</p>
        `;

        try {
            await sendEmail({
                email: email, // getting email from metadata or customer
                subject: 'Course Enrollment Details',
                message,
            });
            console.log('Email sent');
        } catch (err) {
            console.error('Email send failed', err);
        }
    }

    res.json({ received: true });
};

module.exports = { createPaymentIntent, handleWebhook };
