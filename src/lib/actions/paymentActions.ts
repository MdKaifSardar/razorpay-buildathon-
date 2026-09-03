'use server';

import { TransactionContract } from '../models/contract.model';
import { validateContractAction } from './contractActions';
import { createOrderAction, updateOrderStatusAction } from './orderActions';
import { createRazorpayOrderServer } from '../utils/razorpay';
import { logAuditEvent } from '../utils/auditLogger';

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
