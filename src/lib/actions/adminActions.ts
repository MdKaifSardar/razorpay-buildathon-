'use server';

import { MERCHANTS_DATA, PRODUCTS_DATA, supabase } from '../utils/supabase';
import { getAllContractsAction } from './contractActions';
import { getAllAuditEvents } from '../utils/auditLogger';
import { TransactionContract } from '../models/contract.model';
import { AuditEvent } from '../models/audit.model';
import { Merchant, Product } from '../models/merchant.model';

export interface AdminMetrics {
  totalVolume: number;
  totalContracts: number;
  scamInterceptions: number;
  autoApproveRate: number;
  activeProductsCount: number;
  merchantCount: number;
}

/**
 * Fetch aggregated system-wide KPI metrics for Admin Dashboard
 */
export async function getAdminMetricsAction(): Promise<AdminMetrics> {
  const cat = await getMerchantCatalogAdminAction();
  const contracts: TransactionContract[] = await getAllContractsAction();
  const auditLogs: AuditEvent[] = getAllAuditEvents();

  const totalVolume = contracts
    .filter((c: TransactionContract) => c.status === 'USED' || c.status === 'ACTIVE')
    .reduce((sum: number, c: TransactionContract) => sum + c.authorizedAmount, 0);

  const totalContracts = contracts.length;
  const scamInterceptions = auditLogs.filter(
    (l: AuditEvent) => l.eventType === 'CONTRACT_INVALIDATED' || l.eventType === 'PAYMENT_BLOCKED'
  ).length;

  const autoApproved = contracts.filter((c: TransactionContract) => c.authorizationType === 'AUTO_APPROVED').length;
  const autoApproveRate = totalContracts > 0 ? Math.round((autoApproved / totalContracts) * 100) : 100;

  return {
    totalVolume,
    totalContracts,
    scamInterceptions,
    autoApproveRate,
    activeProductsCount: cat.products.length,
    merchantCount: cat.merchants.length,
  };
}

/**
 * Fetch all registered merchants & catalog items from Supabase DB (with fallback)
 */
export async function getMerchantCatalogAdminAction(): Promise<{ merchants: Merchant[]; products: Product[] }> {
  if (supabase) {
    try {
      const [{ data: dbMerchants }, { data: dbProducts }] = await Promise.all([
        supabase.from('merchants').select('*'),
        supabase.from('products').select('*'),
      ]);

      if (dbMerchants && dbProducts && dbProducts.length > 0) {
        const merchants: Merchant[] = dbMerchants.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.shipping_terms || 'Verified merchant partner',
          category: row.category_focus || 'audio',
          shippingDays: 3,
          returnPolicyDays: 7,
          trustScore: Math.round(Number(row.rating || 4.5) * 20),
          status: 'ACTIVE',
        }));

        const products: Product[] = dbProducts.map((row: any) => ({
          id: row.id,
          merchantId: row.merchant_id,
          merchantName: row.merchant_name,
          name: row.name,
          description: row.description,
          category: row.category,
          price: Number(row.price),
          currency: row.currency || 'INR',
          stock: Number(row.stock),
          rating: Number(row.rating),
          inStock: Number(row.stock) > 0,
          shippingDays: Number(row.shipping_days || 3),
          returnDays: 7,
          imageUrl: row.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          attributes: { wireless: 'true' },
        }));

        return { merchants, products };
      }
    } catch (err) {
      console.warn('Failed to fetch admin catalog from Supabase:', err);
    }
  }

  return {
    merchants: MERCHANTS_DATA,
    products: PRODUCTS_DATA,
  };
}

/**
 * Fetch all transaction contracts & orders for Admin Registry
 */
export async function getAllContractsAdminAction() {
  return getAllContractsAction();
}

/**
 * Fetch all audit logs across all transactions for Admin Audit Trail Stream
 */
export async function getAllAuditLogsAdminAction() {
  return getAllAuditEvents();
}
