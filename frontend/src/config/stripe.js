// frontend/src/config/stripe.js
import { loadStripe } from '@stripe/stripe-js';

/**
 * Configuration Stripe Frontend
 * Charge la clé publique Stripe depuis .env
 */

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;