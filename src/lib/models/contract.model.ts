export type ContractStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'INVALIDATED_PRICE_CHANGED' | 'INVALIDATED_OUT_OF_STOCK';

export interface TransactionContract {
  contractId: string;
  intentId: string;
  merchantId: string;
  merchantName: string;
  productId: string;
  productName: string;
  quantity: number;
  authorizedAmount: number;
  currency: string;
  authorizationType: 'AUTO_APPROVED' | 'USER_APPROVED';
  policyId: string;
  createdAt: string;
  expiresAt: string; // 10 minute TTL
  status: ContractStatus;
  invalidationReason?: string;
}
