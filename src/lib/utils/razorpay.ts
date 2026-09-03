import Razorpay from 'razorpay';

// Initialize Razorpay Node SDK Client
export const razorpayClient = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
});

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

/**
 * Server utility to create a Razorpay Order
 */
export async function createRazorpayOrderServer(
  amountInINR: number,
  receiptId: string
): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  const amountInPaisa = Math.round(amountInINR * 100); // Razorpay requires amount in Paisa
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keySecret && keySecret !== 'your_razorpay_key_secret') {
    try {
      const order = await razorpayClient.orders.create({
        amount: amountInPaisa,
        currency: 'INR',
        receipt: receiptId,
        notes: { gateway: 'AgentCommerce', receiptId },
      });

      return {
        orderId: order.id,
        amount: amountInPaisa,
        currency: 'INR',
        keyId,
      };
    } catch (err) {
      console.warn('Live Razorpay API call failed, falling back to simulated Razorpay Test Order:', err);
    }
  }

  // Simulated Razorpay Order fallback (for $0 demo testing without live secret keys!)
  return {
    orderId: `order_RZP${Math.floor(100000000 + Math.random() * 900000000)}`,
    amount: amountInPaisa,
    currency: 'INR',
    keyId,
  };
}
