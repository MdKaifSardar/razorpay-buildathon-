'use server';

import { CatalogSearchParams, CatalogSearchResult, Product, Merchant } from '../models/merchant.model';
import { queryCatalog, PRODUCTS_DATA, MERCHANTS_DATA } from '../utils/supabase';

/**
 * Server Action: Search merchant catalog by keywords, budget, and category
 */
export async function searchCatalogAction(params: CatalogSearchParams): Promise<CatalogSearchResult> {
  // Simulate network latency (50ms)
  await new Promise((resolve) => setTimeout(resolve, 50));
  return queryCatalog(params);
}

/**
 * Server Action: Get exact product by ID
 */
export async function getProductAction(productId: string): Promise<Product | null> {
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  return product || null;
}

/**
 * Server Action: Check product inventory and live price
 */
export async function checkInventoryAction(productId: string): Promise<{
  inStock: boolean;
  stockCount: number;
  currentPrice: number;
  currency: string;
} | null> {
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (!product) return null;

  return {
    inStock: product.inStock && product.stock > 0,
    stockCount: product.stock,
    currentPrice: product.price,
    currency: product.currency,
  };
}

/**
 * Server Action: Get list of active merchants
 */
export async function getMerchantsAction(): Promise<Merchant[]> {
  return MERCHANTS_DATA;
}
