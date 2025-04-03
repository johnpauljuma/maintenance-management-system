import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { amount, paymentMethodId } = req.body;

    if (!amount || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing amount or paymentMethodId' });
    }

    // Create PaymentIntent with test flags
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        test_card: 'true' // Flag this as a test payment
      }
    });

    // Special handling for test cards
    if (paymentIntent.status === 'succeeded') {
      console.log('Test payment succeeded immediately');
    } else if (paymentIntent.status === 'requires_action') {
      console.log('Test payment requires 3D Secure authentication');
    }

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      paymentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Stripe error:', error);
    
    // Special handling for test card errors
    if (error.code === 'card_declined') {
      return res.status(400).json({ 
        error: 'Test card was declined. Please use a different test card number.' 
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Payment processing failed' 
    });
  }
}