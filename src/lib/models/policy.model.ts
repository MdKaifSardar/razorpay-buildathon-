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

// Default User Spending Policy Constant
export const DEFAULT_USER_POLICY: BuyerPolicy = {
  id: 'pol_user_default_v1',
  userId: 'usr_main_buyer',
  autoApproveLimit: 5000,
  maxApprovalLimit: 10000,
  allowedCategories: ['audio', 'peripherals', 'wearables', 'electronics'],
  blockedCategories: ['restricted', 'gambling', 'crypto'],
  requireApprovalOnPriceChange: true,
  requireApprovalForNewMerchant: false,
};
