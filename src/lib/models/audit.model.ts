export type AuditEventType =
  | 'USER_INTENT'
  | 'AI_DISCOVERED'
  | 'PRODUCT_SELECTED'
  | 'POLICY_EVALUATED'
  | 'USER_AUTHORIZED'
  | 'CONTRACT_CREATED'
  | 'MERCHANT_ORDER_CREATED'
  | 'RAZORPAY_ORDER_CREATED'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_VERIFIED'
  | 'ORDER_PAID'
  | 'PRICE_CHANGED'
  | 'CONTRACT_INVALIDATED'
  | 'PAYMENT_BLOCKED'
  | 'POLICY_BLOCKED';

export interface AuditEvent {
  id: string;
  referenceId: string; // Contract ID or Order ID
  eventType: AuditEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
}
