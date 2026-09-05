import Razorpay from 'razorpay';

// Initialize Razorpay Node SDK Client
export const razorpayClient = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
});

/**
 * Server utility to create a Razorpay Order
 */
export async function createRazorpayOrderServer(
  amountInINR: number,
  receiptId: string
): Promise<{ orderId: string; amount: number; currency: string; keyId: string; isSimulatedOrder: boolean }> {
  const amountInPaisa = Math.round(amountInINR * 100); // Razorpay requires amount in Paisa
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key';
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keySecret && keySecret !== 'your_razorpay_key_secret' && keySecret !== 'rzp_test_placeholder_secret') {
    try {
      const client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await client.orders.create({
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
        isSimulatedOrder: false,
      };
    } catch (err: any) {
      console.warn('Live Razorpay API call failed or credentials invalid, falling back to simulated Razorpay Test Order:', err?.message || err);
    }
  }

  // Simulated Razorpay Order fallback
  return {
    orderId: `order_RZP${Math.floor(100000000 + Math.random() * 900000000)}`,
    amount: amountInPaisa,
    currency: 'INR',
    keyId,
    isSimulatedOrder: true,
  };
}
