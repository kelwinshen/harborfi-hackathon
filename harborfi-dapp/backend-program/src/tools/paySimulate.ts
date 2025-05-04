import { Xendit } from 'xendit-node';
import dotenv from 'dotenv';

dotenv.config();

const xendit = new Xendit({
  secretKey: process.env.XENDIT_API_KEY!,
});

const { PaymentMethod } = xendit;

async function simulatePaymentMethod(paymentMethodId: string, amount: number) {
  try {
    const response = await PaymentMethod.simulatePayment({

    paymentMethodId: paymentMethodId,
      data: {
        amount,
      },
    });

    console.log('Simulated successfully:', response);
  } catch (error: any) {
    console.error('Failed to simulate:', error?.response?.data || error.message);
  }
}

// Example usage
simulatePaymentMethod('pm-73bfcade-da12-4195-9946-8bbaf554d66d', 10000);


