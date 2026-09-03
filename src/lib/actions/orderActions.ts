'use server';

import { MerchantOrder, OrderStatus } from '../models/order.model';
import { TransactionContract } from '../models/contract.model';
import { logAuditEvent, getAuditEvents } from '../utils/auditLogger';
import { AuditEvent } from '../models/audit.model';

const ORDERS_DB = new Map<string, MerchantOrder>();

/**
 * Server Action: Create application merchant order from authorized contract
 */
export async function createOrderAction(contract: TransactionContract): Promise<MerchantOrder> {
  const now = new Date().toISOString();

  const order: MerchantOrder = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    contractId: contract.contractId,
    userId: 'usr_main_buyer',
    merchantId: contract.merchantId,
    merchantName: contract.merchantName,
    productId: contract.productId,
    productName: contract.productName,
    quantity: contract.quantity,
    amount: contract.authorizedAmount,
    currency: contract.currency,
    status: 'ORDER_CREATED',
    createdAt: now,
    updatedAt: now,
  };

  ORDERS_DB.set(order.id, order);

  logAuditEvent(
    contract.contractId,
    'MERCHANT_ORDER_CREATED',
    'Merchant Order Created',
    `Created application merchant order ${order.id} for ${order.productName} (₹${order.amount.toLocaleString('en-IN')}).`,
    'SUCCESS',
    { orderId: order.id, merchantId: order.merchantId, amount: order.amount }
  );

  return order;
}

/**
 * Server Action: Update order status and log audit event
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  metadata?: Record<string, unknown>
): Promise<MerchantOrder | null> {
  const order = ORDERS_DB.get(orderId);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  ORDERS_DB.set(orderId, order);

  return order;
}

/**
 * Server Action: Fetch audit timeline events for contract or order
 */
export async function getAuditEventsAction(referenceId: string): Promise<AuditEvent[]> {
  return getAuditEvents(referenceId);
}
