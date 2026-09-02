'use server';

import { TransactionIntent } from '../models/intent.model';
import { TransactionContract, ContractStatus } from '../models/contract.model';
import { checkInventoryAction } from './merchantActions';

// In-Memory active contract store for validation
const ACTIVE_CONTRACTS = new Map<string, TransactionContract>();

/**
 * Server Action: Generate a locked, time-bounded Transaction Contract
 */
export async function createContractAction(
  intent: TransactionIntent,
  authType: 'AUTO_APPROVED' | 'USER_APPROVED'
): Promise<TransactionContract> {
  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minute TTL

  const contract: TransactionContract = {
    contractId: `TC-${Math.floor(10000 + Math.random() * 90000)}`,
    intentId: intent.intentId,
    merchantId: intent.product.merchantId,
    merchantName: intent.product.merchantName,
    productId: intent.product.id,
    productName: intent.product.name,
    quantity: intent.quantity,
    authorizedAmount: intent.proposedAmount,
    currency: intent.currency,
    authorizationType: authType,
    policyId: 'pol_user_default_v1',
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'ACTIVE',
  };

  ACTIVE_CONTRACTS.set(contract.contractId, contract);
  return contract;
}

/**
 * Server Action: Validate Transaction Contract prior to Razorpay Order creation
 */
export async function validateContractAction(
  contract: TransactionContract,
  simulatedPriceOverride?: number
): Promise<{
  valid: boolean;
  status: ContractStatus;
  reason?: string;
  updatedContract: TransactionContract;
}> {
  const currentContract = ACTIVE_CONTRACTS.get(contract.contractId) || contract;

  // 1. Check TTL Expiry
  if (new Date() > new Date(currentContract.expiresAt)) {
    const updated = { ...currentContract, status: 'EXPIRED' as ContractStatus, invalidationReason: 'Contract expired after 10-minute validity window.' };
    ACTIVE_CONTRACTS.set(contract.contractId, updated);
    return { valid: false, status: 'EXPIRED', reason: updated.invalidationReason, updatedContract: updated };
  }

  // 2. Check Live Product Price & Inventory
  const liveStock = await checkInventoryAction(contract.productId);

  if (!liveStock || !liveStock.inStock) {
    const updated = { ...currentContract, status: 'INVALIDATED_OUT_OF_STOCK' as ContractStatus, invalidationReason: 'Product went out of stock before payment execution.' };
    ACTIVE_CONTRACTS.set(contract.contractId, updated);
    return { valid: false, status: 'INVALIDATED_OUT_OF_STOCK', reason: updated.invalidationReason, updatedContract: updated };
  }

  // Check Price Change (or simulated price hike trigger for demo)
  const effectiveLivePrice = simulatedPriceOverride !== undefined ? simulatedPriceOverride : liveStock.currentPrice;

  if (effectiveLivePrice > contract.authorizedAmount) {
    const updated = {
      ...currentContract,
      status: 'INVALIDATED_PRICE_CHANGED' as ContractStatus,
      invalidationReason: `Price changed from authorized ₹${contract.authorizedAmount.toLocaleString('en-IN')} to live price ₹${effectiveLivePrice.toLocaleString('en-IN')}. Payment aborted to prevent overcharging.`,
    };
    ACTIVE_CONTRACTS.set(contract.contractId, updated);
    return { valid: false, status: 'INVALIDATED_PRICE_CHANGED', reason: updated.invalidationReason, updatedContract: updated };
  }

  return { valid: true, status: currentContract.status, updatedContract: currentContract };
}
