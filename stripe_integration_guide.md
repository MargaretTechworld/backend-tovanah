# Stripe Integration Guide

This guide describes how to complete the Stripe payment integration for both backend and frontend.

## 1. Stripe Dashboard Setup
1.  Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Go to **Developers > API keys**.
3.  Copy your **Secret key** (starts with `sk_test_`) and add it to your `.env` (and Render) as `STRIPE_SECRET_KEY`.
4.  Copy your **Publishable key** (starts with `pk_test_`) for your frontend.

## 2. Frontend Integration (Example)
On your frontend (React), install the Stripe libraries:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Create a Payment Element
Use `PaymentElement` from `@stripe/react-stripe-js` to collect payment details securely.

1.  Call `/api/payment/create-payment-intent` with the course details.
2.  Receive the `clientSecret`.
3.  Load the Stripe `Elements` provider with the `clientSecret`.
4.  Render the `PaymentElement`.

## 3. Webhook Setup
Webhooks allow your server to react when a payment is successful (e.g., to send a confirmation email).

### Local Testing with Stripe CLI
1.  Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2.  Log in: `stripe login`.
3.  Forward webhooks to your local server:
    ```bash
    stripe listen --forward-to localhost:5000/api/payment/webhook
    ```
4.  The CLI will output a **webhook signing secret** (starts with `whsec_`).
5.  Add this to your `.env` as `STRIPE_WEBHOOK_SECRET`.

### Production Webhook (Render)
1.  Go to **Developers > Webhooks** in the Stripe Dashboard.
2.  Click **"Add endpoint"**.
3.  Endpoint URL: `https://your-app-url.onrender.com/api/payment/webhook`.
4.  Select events to listen to: `payment_intent.succeeded`.
5.  Copy the **Signing secret** and add it to your Render environment variables as `STRIPE_WEBHOOK_SECRET`.

## 4. How it Works
1.  **Payment Intent**: When a user clicks "Enroll", the frontend calls the backend to create a `PaymentIntent`.
2.  **Payment**: The user enters their card details into the Stripe Element.
3.  **Webhook**: Once the payment is successful, Stripe sends a POST request to your `/api/payment/webhook` endpoint.
4.  **Email**: Your backend receives the webhook, verifies the signature, and sends a confirmation email to the user with the course details (Zoom link or location).
