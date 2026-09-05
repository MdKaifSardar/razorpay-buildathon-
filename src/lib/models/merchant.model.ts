export interface Merchant {
  id: string;
  name: string;
  description: string;
  category: string;
  shippingDays: number;
  returnPolicyDays: number;
  trustScore: number; // 0 to 100 rating
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  description: string;
  category: 'audio' | 'peripherals' | 'wearables' | 'electronics';
  price: number;
  currency: string;
  stock: number;
  rating: number;
  inStock: boolean;
  shippingDays: number;
  returnDays: number;
  imageUrl: string;
  attributes: Record<string, string>;
}

export interface CatalogSearchParams {
  query: string;
  category?: 'audio' | 'peripherals' | 'wearables' | 'electronics' | string;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  merchantId?: string;
  inStockOnly?: boolean;
}

export interface CatalogSearchResult {
  query: CatalogSearchParams;
  totalFound: number;
  products: Product[];
}
