export type PolicyDecisionType = 'APPROVE' | 'NEEDS_APPROVAL' | 'REJECT';

export interface BuyerPolicy {
  id: string;
  userId: string;
  autoApproveLimit: number; // E.g. ₹5,000
  maxApprovalLimit: number; // E.g. ₹10,000
  allowedCategories: string[];
  blockedCategories: string[];
  requireApprovalOnPriceChange: boolean;
  requireApprovalForNewMerchant: boolean;
}

export interface PolicyEvaluationResult {
  decision: PolicyDecisionType;
  reason: string;
  autoApproveLimit: number;
  maxApprovalLimit: number;
  proposedAmount: number;
  currency: string;
  policyId: string;
  evaluatedAt: string;
}
