'use server';

import { TransactionIntent } from '../models/intent.model';
import { TransactionContract, ContractStatus } from '../models/contract.model';
import { checkInventoryAction } from './merchantActions';
import { supabase } from '../utils/supabase';

// In-Memory active contract store for validation
const ACTIVE_CONTRACTS = new Map<string, TransactionContract>();

/**
 * Fetch all transaction contracts for admin governance view (with Supabase fallback)
 */
export async function getAllContractsAction(): Promise<TransactionContract[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('contracts').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          contractId: row.contract_id,
          intentId: row.intent_id,
          merchantId: row.merchant_id,
          merchantName: row.merchant_name,
          productId: row.product_id,
          productName: row.product_name,
          authorizedAmount: Number(row.authorized_amount),
          currency: row.currency || 'INR',
          quantity: Number(row.quantity || 1),
          status: row.status as ContractStatus,
          authorizationType: row.authorization_type as 'AUTO_APPROVED' | 'USER_APPROVED',
          policyId: 'pol_user_default_v1',
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          invalidationReason: row.invalidation_reason,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch contracts from Supabase:', err);
    }
  }

  return Array.from(ACTIVE_CONTRACTS.values());
}

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

  if (supabase) {
    supabase
      .from('contracts')
      .insert({
        contract_id: contract.contractId,
        intent_id: contract.intentId,
        merchant_id: contract.merchantId,
        merchant_name: contract.merchantName,
        product_id: contract.productId,
        product_name: contract.productName,
        authorized_amount: contract.authorizedAmount,
        currency: contract.currency,
        quantity: contract.quantity,
        status: contract.status,
        authorization_type: contract.authorizationType,
        user_policy: { autoApproveLimit: 5000 },
        ai_reasoning: intent.aiReasoning || 'Selected best spec match within policy',
        expires_at: contract.expiresAt,
      })
      .then(({ error }) => {
        if (error) console.warn('Failed to insert contract into Supabase:', error.message);
      });
  }

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

    if (supabase) {
      supabase.from('contracts').update({ status: updated.status, invalidation_reason: updated.invalidationReason }).eq('contract_id', contract.contractId);
    }

    return { valid: false, status: 'INVALIDATED_PRICE_CHANGED', reason: updated.invalidationReason, updatedContract: updated };
  }

  // Reset to ACTIVE if price hike toggle is turned off
  const activeContract = {
    ...currentContract,
    status: 'ACTIVE' as ContractStatus,
    invalidationReason: undefined,
  };
  ACTIVE_CONTRACTS.set(contract.contractId, activeContract);

  return { valid: true, status: 'ACTIVE', updatedContract: activeContract };
}
