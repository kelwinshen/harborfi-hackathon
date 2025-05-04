// src/triggerPaymentXendit.ts
import { Xendit } from 'xendit-node';
import dotenv from 'dotenv';

dotenv.config();

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_API_KEY!,
});

const { PaymentRequest } = xenditClient;

async function simulatePayment(paymentRequestId: string) {
  try {
    const response = await PaymentRequest.getPaymentRequestByID({
      paymentRequestId,
    });

    console.log('Payment simulation successful:', response);
  } catch (error: any) {
    console.error('Failed to simulate payment');

    // Handle Xendit error response correctly without re-reading the body
    if (error?.response) {
      const status = error.response.status;
      const text = await error.response.text(); // Can only be read once

      console.error(`HTTP ${status}`);
      console.error(`Response Text: ${text}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Use static ID (for debugging)
const paymentRequestId = process.argv[2]

simulatePayment(paymentRequestId);

