import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature } from '@/lib/utils/signature';
import { logAuditEvent } from '@/lib/utils/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // 1. Verify Webhook Signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    console.log(`Razorpay Webhook Received: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const orderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      const paymentId = payload.payment?.entity?.id;
      const notes = payload.payment?.entity?.notes || payload.order?.entity?.notes || {};
      const contractId = notes.contractId || 'UNKNOWN_CONTRACT';

      logAuditEvent(
        contractId,
        'PAYMENT_VERIFIED',
        'Webhook Received: Payment Captured',
        `Razorpay Webhook confirmed captured payment ${paymentId} for order ${orderId}.`,
        'SUCCESS',
        { eventType, orderId, paymentId }
      );
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
