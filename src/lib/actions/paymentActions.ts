'use server';

import { TransactionContract } from '../models/contract.model';
import { validateContractAction } from './contractActions';
import { createOrderAction, updateOrderStatusAction } from './orderActions';
import { createRazorpayOrderServer } from '../utils/razorpay';
import { logAuditEvent } from '../utils/auditLogger';
import { verifyRazorpaySignature } from '../utils/signature';

/**
 * Server Action: Validate Transaction Contract and create Razorpay Order
 */
export async function createRazorpayOrderAction(
  contract: TransactionContract,
  simulatedPriceOverride?: number
): Promise<{
  success: boolean;
  razorpayOrderId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}> {
  // 1. Pre-Payment Contract Re-validation!
  const validation = await validateContractAction(contract, simulatedPriceOverride);

  if (!validation.valid) {
    logAuditEvent(
      contract.contractId,
      'CONTRACT_INVALIDATED',
      'Pre-Payment Contract Re-validation Failed',
      `Contract invalidated prior to payment: ${validation.reason}`,
      'ERROR',
      { status: validation.status, reason: validation.reason }
    );

    logAuditEvent(
      contract.contractId,
      'PAYMENT_BLOCKED',
      'Razorpay Payment Blocked',
      'Razorpay Order creation was cancelled because the Transaction Contract was invalidated.',
      'ERROR'
    );

    return {
      success: false,
      error: validation.reason || 'Contract is no longer valid.',
    };
  }

  // 2. Create Application Merchant Order
  const merchantOrder = await createOrderAction(contract);

  // 3. Create Razorpay Order
  const rzpOrder = await createRazorpayOrderServer(contract.authorizedAmount, merchantOrder.id);

  // 4. Update Application Order with Razorpay Order ID
  await updateOrderStatusAction(merchantOrder.id, 'PAYMENT_PENDING', {
    razorpayOrderId: rzpOrder.orderId,
  });

  // 5. Log Audit Event
  logAuditEvent(
    contract.contractId,
    'RAZORPAY_ORDER_CREATED',
    'Razorpay Order Created',
    `Created Razorpay Order ${rzpOrder.orderId} for ₹${contract.authorizedAmount.toLocaleString('en-IN')}. Ready for checkout.`,
    'SUCCESS',
    { razorpayOrderId: rzpOrder.orderId, amount: contract.authorizedAmount }
  );

  return {
    success: true,
    razorpayOrderId: rzpOrder.orderId,
    orderId: merchantOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: rzpOrder.keyId,
  };
}

/**
 * Server Action: Verify Razorpay HMAC-SHA256 signature server-side and mark order as PAID
 */
export async function verifyPaymentSignatureAction(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
  contractId: string;
}): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  logAuditEvent(
    payload.contractId,
    'PAYMENT_RECEIVED',
    'Razorpay Payment Payload Received',
    `Received payment response for payment ${payload.razorpay_payment_id}. Initiating server-side cryptographic verification.`,
    'INFO',
    { paymentId: payload.razorpay_payment_id, orderId: payload.orderId }
  );

  // 1. Server-side HMAC Signature Verification
  const isValid = verifyRazorpaySignature(
    payload.razorpay_order_id,
    payload.razorpay_payment_id,
    payload.razorpay_signature,
    secret
  );

  if (!isValid) {
    logAuditEvent(
      payload.contractId,
      'PAYMENT_BLOCKED',
      'Signature Verification Failed',
      'HMAC-SHA256 signature check failed. Order was NOT marked as paid.',
      'ERROR'
    );

    await updateOrderStatusAction(payload.orderId, 'PAYMENT_FAILED');
    return { success: false, error: 'Cryptographic signature verification failed.' };
  }

  // 2. Mark Application Order as PAID
  await updateOrderStatusAction(payload.orderId, 'PAID', {
    razorpayPaymentId: payload.razorpay_payment_id,
  });

  // 3. Log Audit Events
  logAuditEvent(
    payload.contractId,
    'PAYMENT_VERIFIED',
    'HMAC-SHA256 Signature Verified',
    `Server-side signature check passed for payment ${payload.razorpay_payment_id}.`,
    'SUCCESS'
  );

  logAuditEvent(
    payload.contractId,
    'ORDER_PAID',
    'Order Marked PAID',
    `Merchant order ${payload.orderId} officially transitioned to PAID state. Transaction complete!`,
    'SUCCESS',
    { orderId: payload.orderId, paymentId: payload.razorpay_payment_id }
  );

  return { success: true };
}
