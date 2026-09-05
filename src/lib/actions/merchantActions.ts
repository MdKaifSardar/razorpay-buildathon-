'use server';

import { CatalogSearchParams, CatalogSearchResult, Product, Merchant } from '../models/merchant.model';
import { queryCatalog, PRODUCTS_DATA, MERCHANTS_DATA, supabase } from '../utils/supabase';

/**
 * Server Action: Search merchant catalog by keywords, budget, and category
 */
export async function searchCatalogAction(params: CatalogSearchParams): Promise<CatalogSearchResult> {
  return queryCatalog(params);
}

/**
 * Server Action: Get exact product by ID from Supabase DB (with fallback)
 */
export async function getProductAction(productId: string): Promise<Product | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (!error && data) {
        return {
          id: data.id,
          merchantId: data.merchant_id,
          merchantName: data.merchant_name,
          name: data.name,
          description: data.description,
          category: data.category,
          price: Number(data.price),
          currency: data.currency || 'INR',
          stock: Number(data.stock),
          rating: Number(data.rating),
          inStock: Number(data.stock) > 0,
          shippingDays: Number(data.shipping_days || 3),
          returnDays: 7,
          imageUrl: data.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          attributes: { wireless: 'true' },
        };
      }
    } catch (err) {
      console.warn('Failed to fetch product from Supabase:', err);
    }
  }

  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  return product || null;
}

/**
 * Server Action: Check live product inventory and price from Supabase DB (with fallback)
 */
export async function checkInventoryAction(productId: string): Promise<{
  inStock: boolean;
  stockCount: number;
  currentPrice: number;
  currency: string;
} | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('stock, price, currency').eq('id', productId).single();
      if (!error && data) {
        const stock = Number(data.stock);
        return {
          inStock: stock > 0,
          stockCount: stock,
          currentPrice: Number(data.price),
          currency: data.currency || 'INR',
        };
      }
    } catch (err) {
      console.warn('Failed to check live inventory from Supabase:', err);
    }
  }

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
 * Server Action: Update live merchant product price in Supabase DB (and fallback store)
 */
export async function updateProductPriceAction(
  productId: string,
  newPrice: number
): Promise<{ success: boolean; newPrice: number }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('products').update({ price: newPrice }).eq('id', productId);
      if (error) {
        console.error('Failed to update product price in Supabase DB:', error.message);
      }
    } catch (err) {
      console.warn('Supabase DB update error:', err);
    }
  }

  // Update local memory store fallback
  const product = PRODUCTS_DATA.find((p) => p.id === productId);
  if (product) {
    product.price = newPrice;
  }

  return { success: true, newPrice };
}

/**
 * Server Action: Get list of active merchants from Supabase DB (with fallback)
 */
export async function getMerchantsAction(): Promise<Merchant[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('merchants').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.shipping_terms || 'Verified merchant partner',
          category: row.category_focus || 'audio',
          shippingDays: 3,
          returnPolicyDays: 7,
          trustScore: Math.round(Number(row.rating || 4.5) * 20),
          status: 'ACTIVE',
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch merchants from Supabase:', err);
    }
  }

  return MERCHANTS_DATA;
}
