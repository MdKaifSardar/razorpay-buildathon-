export type OrderStatus =
  | 'PROPOSED'
  | 'CONTRACT_CREATED'
  | 'AUTHORIZATION_PENDING'
  | 'AUTHORIZED'
  | 'ORDER_CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'REJECTED'
  | 'PRICE_CHANGED'
  | 'OUT_OF_STOCK'
  | 'CANCELLED';

export interface MerchantOrder {
  id: string;
  contractId: string;
  userId: string;
  merchantId: string;
  merchantName: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}
