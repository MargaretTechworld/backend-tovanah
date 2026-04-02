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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #10b981;">Payment Successful!</h2>
              <p style="color: #64748b;">Welcome to the Tovanah Consulting community.</p>
            </div>
            
            <p>Dear Valued Student,</p>
            <p>Your enrollment in <strong>${course.title}</strong> is now officially active. We are thrilled to have you join our professional development program.</p>
            
            <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h4 style="margin-top: 0; color: #0f172a;">Course Delivery Details</h4>
              <p style="margin: 8px 0;"><strong>Mode:</strong> ${course.mode || 'Online'}</p>
              ${course.mode === 'Online' 
                ? `<p style="margin: 8px 0;"><strong>Zoom/Live Link:</strong> <a href="${course.zoomLink || '#'}" style="color: #3b82f6;">Join Classroom</a></p>` 
                : `<p style="margin: 8px 0;"><strong>Location:</strong> ${course.location || 'Consultancy Office'}</p>`}
              <p style="margin: 8px 0;"><strong>Schedule:</strong> See course schedule in portal</p>
            </div>

            <p>You can now access all learning materials, track your progress, and download your receipt in the <a href="https://tovaah-frontend.onrender.com/portal" style="color: #3b82f6; font-weight: bold;">Student Portal</a>.</p>
            
            <p style="margin-top: 30px;">Best Regards,<br/><strong>Tovanah Consulting Team</strong></p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 0.8rem; color: #94a3b8; text-align: center;">
              This is an automated confirmation of your professional enrollment.
            </div>
          </div>
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
