'use server';

import { TransactionIntent } from '../models/intent.model';
import { BuyerPolicy, PolicyEvaluationResult, DEFAULT_USER_POLICY } from '../models/policy.model';

/**
 * Server Action: Evaluate Transaction Intent against deterministic user policy
 */
export async function evaluatePolicyAction(
  intent: TransactionIntent,
  policy: BuyerPolicy = DEFAULT_USER_POLICY
): Promise<PolicyEvaluationResult> {
  const { proposedAmount, product } = intent;

  // 1. Check Category Blocklist
  if (policy.blockedCategories.includes(product.category)) {
    return {
      decision: 'REJECT',
      reason: `Blocked by policy: Category "${product.category}" is on your restricted spending list.`,
      autoApproveLimit: policy.autoApproveLimit,
      maxApprovalLimit: policy.maxApprovalLimit,
      proposedAmount,
      currency: intent.currency,
      policyId: policy.id,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 2. Check Maximum Approval Limit Hard Cap
  if (proposedAmount > policy.maxApprovalLimit) {
    return {
      decision: 'REJECT',
      reason: `Purchase blocked: Amount ₹${proposedAmount.toLocaleString('en-IN')} exceeds your maximum allowed spending policy cap of ₹${policy.maxApprovalLimit.toLocaleString('en-IN')}.`,
      autoApproveLimit: policy.autoApproveLimit,
      maxApprovalLimit: policy.maxApprovalLimit,
      proposedAmount,
      currency: intent.currency,
      policyId: policy.id,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 3. Check Auto-Approve Threshold
  if (proposedAmount <= policy.autoApproveLimit) {
    return {
      decision: 'APPROVE',
      reason: `Automatically authorized: Proposed amount ₹${proposedAmount.toLocaleString('en-IN')} is within your automatic spending limit of ₹${policy.autoApproveLimit.toLocaleString('en-IN')}.`,
      autoApproveLimit: policy.autoApproveLimit,
      maxApprovalLimit: policy.maxApprovalLimit,
      proposedAmount,
      currency: intent.currency,
      policyId: policy.id,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 4. Requires Explicit 1-Click User Authorization
  return {
    decision: 'NEEDS_APPROVAL',
    reason: `User authorization required: Proposed amount ₹${proposedAmount.toLocaleString('en-IN')} exceeds your automatic buy limit of ₹${policy.autoApproveLimit.toLocaleString('en-IN')}.`,
    autoApproveLimit: policy.autoApproveLimit,
    maxApprovalLimit: policy.maxApprovalLimit,
    proposedAmount,
    currency: intent.currency,
    policyId: policy.id,
    evaluatedAt: new Date().toISOString(),
  };
}
