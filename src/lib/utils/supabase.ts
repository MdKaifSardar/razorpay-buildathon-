import { Merchant, Product, CatalogSearchParams, CatalogSearchResult } from '../models/merchant.model';

// Seeded Merchant Directory
export const MERCHANTS_DATA: Merchant[] = [
  {
    id: 'audiohub',
    name: 'AudioHub',
    description: 'Premium audio gear, active noise cancelling headphones, and wireless earbuds.',
    category: 'audio',
    shippingDays: 3,
    returnPolicyDays: 10,
    trustScore: 98,
    status: 'ACTIVE',
  },
  {
    id: 'techstore',
    name: 'TechStore',
    description: 'High-performance PC peripherals, mechanical keyboards, monitors, and mice.',
    category: 'peripherals',
    shippingDays: 4,
    returnPolicyDays: 7,
    trustScore: 95,
    status: 'ACTIVE',
  },
  {
    id: 'gadgetmart',
    name: 'GadgetMart',
    description: 'Smart wearables, fitness trackers, power banks, and essential gadgets.',
    category: 'wearables',
    shippingDays: 2,
    returnPolicyDays: 5,
    trustScore: 92,
    status: 'ACTIVE',
  },
];

// Seeded Product Catalog
export const PRODUCTS_DATA: Product[] = [
  // AudioHub Products
  {
    id: 'jbl-tune-770nc',
    merchantId: 'audiohub',
    merchantName: 'AudioHub',
    name: 'JBL Tune 770NC Wireless ANC Headphones',
    description: 'Adaptive Noise Cancelling, Bluetooth 5.3, 70-hour battery life, and JBL Pure Bass Sound.',
    category: 'audio',
    price: 6999,
    currency: 'INR',
    stock: 18,
    rating: 4.6,
    inStock: true,
    shippingDays: 3,
    returnDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    attributes: { wireless: 'true', anc: 'true', battery: '70 hours' },
  },
  {
    id: 'sony-wh-ch520',
    merchantId: 'audiohub',
    merchantName: 'AudioHub',
    name: 'Sony WH-CH520 Wireless On-Ear Headphones',
    description: '50-hour battery life, multipoint connection, lightweight design with DSEE audio enhancement.',
    category: 'audio',
    price: 4490,
    currency: 'INR',
    stock: 25,
    rating: 4.4,
    inStock: true,
    shippingDays: 3,
    returnDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80',
    attributes: { wireless: 'true', anc: 'false', battery: '50 hours' },
  },
  {
    id: 'boat-rockerz-450',
    merchantId: 'audiohub',
    merchantName: 'AudioHub',
    name: 'boAt Rockerz 450 Bluetooth Headphone',
    description: '40mm dynamic drivers, 15-hour playback, comfortable ear cushions with voice assistant support.',
    category: 'audio',
    price: 1499,
    currency: 'INR',
    stock: 40,
    rating: 4.1,
    inStock: true,
    shippingDays: 2,
    returnDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    attributes: { wireless: 'true', anc: 'false', battery: '15 hours' },
  },
  {
    id: 'sennheiser-hd-350bt',
    merchantId: 'audiohub',
    merchantName: 'AudioHub',
    name: 'Sennheiser HD 350BT Wireless Headset',
    description: 'Deep dynamic bass, AAC and AptX Low Latency support, 30-hour battery life.',
    category: 'audio',
    price: 8990,
    currency: 'INR',
    stock: 6,
    rating: 4.7,
    inStock: true,
    shippingDays: 4,
    returnDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    attributes: { wireless: 'true', anc: 'false', battery: '30 hours' },
  },
  {
    id: 'jbl-wave-flex',
    merchantId: 'audiohub',
    merchantName: 'AudioHub',
    name: 'JBL Wave Flex TWS Earbuds',
    description: 'Hands-free calls with VoiceAware, water and dust resistant IP54, 32 hours total battery.',
    category: 'audio',
    price: 3299,
    currency: 'INR',
    stock: 30,
    rating: 4.3,
    inStock: true,
    shippingDays: 3,
    returnDays: 10,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    attributes: { wireless: 'true', anc: 'false', battery: '32 hours' },
  },

  // TechStore Products
  {
    id: 'keychron-k2-v2',
    merchantId: 'techstore',
    merchantName: 'TechStore',
    name: 'Keychron K2 V2 Wireless Mechanical Keyboard',
    description: '75% layout, Gateron G Pro Red switches, RGB backlighting, Mac and Windows compatible.',
    category: 'peripherals',
    price: 6499,
    currency: 'INR',
    stock: 12,
    rating: 4.8,
    inStock: true,
    shippingDays: 4,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    attributes: { layout: '75%', switchType: 'Red Mechanical', wireless: 'true' },
  },
  {
    id: 'logitech-g305-lightspeed',
    merchantId: 'techstore',
    merchantName: 'TechStore',
    name: 'Logitech G305 LIGHTSPEED Wireless Gaming Mouse',
    description: 'HERO sensor 12,000 DPI, 250h battery life on 1 AA battery, ultra-lightweight 99g.',
    category: 'peripherals',
    price: 2895,
    currency: 'INR',
    stock: 22,
    rating: 4.6,
    inStock: true,
    shippingDays: 3,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    attributes: { dpi: '12000', weight: '99g', wireless: 'true' },
  },
  {
    id: 'redragon-k552-kumara',
    merchantId: 'techstore',
    merchantName: 'TechStore',
    name: 'Redragon K552 Mechanical Gaming Keyboard',
    description: 'Tenkeyless compact 87 key design, custom dustproof mechanical switches, red LED backlit.',
    category: 'peripherals',
    price: 2799,
    currency: 'INR',
    stock: 15,
    rating: 4.4,
    inStock: true,
    shippingDays: 4,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=600&q=80',
    attributes: { layout: 'TKL', switchType: 'Blue Mechanical', wireless: 'false' },
  },
  {
    id: 'lg-24mr400-monitor',
    merchantId: 'techstore',
    merchantName: 'TechStore',
    name: 'LG 24-inch Full HD IPS Monitor (100Hz)',
    description: 'FHD 1080p IPS display, 100Hz refresh rate, AMD FreeSync, 3-side virtually borderless.',
    category: 'peripherals',
    price: 7999,
    currency: 'INR',
    stock: 8,
    rating: 4.5,
    inStock: true,
    shippingDays: 5,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    attributes: { resolution: '1080p', refreshRate: '100Hz', panel: 'IPS' },
  },
  {
    id: 'cosmic-byte-cb-gk-16',
    merchantId: 'techstore',
    merchantName: 'TechStore',
    name: 'Cosmic Byte Firefly TKL Mechanical Keyboard',
    description: 'Outemu Blue Switches, RGB backlighting with 18 effects, full key anti-ghosting.',
    category: 'peripherals',
    price: 2199,
    currency: 'INR',
    stock: 0, // Out of stock demo item
    rating: 4.2,
    inStock: false,
    shippingDays: 4,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
    attributes: { layout: 'TKL', switchType: 'Blue', wireless: 'false' },
  },

  // GadgetMart Products
  {
    id: 'noise-colorfit-pulse-2',
    merchantId: 'gadgetmart',
    merchantName: 'GadgetMart',
    name: 'Noise ColorFit Pulse 2 Max Smartwatch',
    description: '1.85 inch display, Bluetooth calling, 550 nits brightness, 100+ sports modes, 10-day battery.',
    category: 'wearables',
    price: 1799,
    currency: 'INR',
    stock: 50,
    rating: 4.3,
    inStock: true,
    shippingDays: 2,
    returnDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    attributes: { display: '1.85 inch', calling: 'true', battery: '10 days' },
  },
  {
    id: 'amazfit-bip-5',
    merchantId: 'gadgetmart',
    merchantName: 'GadgetMart',
    name: 'Amazfit Bip 5 Smart Watch',
    description: '1.91 inch ultra-large screen, Bluetooth phone calls, 4 satellite positioning systems, 10-day battery.',
    category: 'wearables',
    price: 6499,
    currency: 'INR',
    stock: 14,
    rating: 4.5,
    inStock: true,
    shippingDays: 3,
    returnDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    attributes: { display: '1.91 inch', gps: 'true', battery: '10 days' },
  },
  {
    id: 'anker-powercore-10000',
    merchantId: 'gadgetmart',
    merchantName: 'GadgetMart',
    name: 'Anker PowerCore 10000mAh Portable Charger',
    description: 'Ultra-compact high-speed power bank with PowerIQ technology, voltage boost charging.',
    category: 'wearables',
    price: 1999,
    currency: 'INR',
    stock: 35,
    rating: 4.7,
    inStock: true,
    shippingDays: 2,
    returnDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1609592424074-9543ef8cae37?auto=format&fit=crop&w=600&q=80',
    attributes: { capacity: '10000mAh', fastCharge: 'true' },
  },
  {
    id: 'fastrack-limitless-fs1',
    merchantId: 'gadgetmart',
    merchantName: 'GadgetMart',
    name: 'Fastrack Limitless FS1 Smartwatch',
    description: '1.95 inch Horizon display, BT calling with SingleSync, 100+ sports modes, IP68 waterproof.',
    category: 'wearables',
    price: 1495,
    currency: 'INR',
    stock: 28,
    rating: 4.1,
    inStock: true,
    shippingDays: 2,
    returnDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    attributes: { display: '1.95 inch', calling: 'true', waterproof: 'IP68' },
  },
  {
    id: 'apple-watch-se-gen2',
    merchantId: 'gadgetmart',
    merchantName: 'GadgetMart',
    name: 'Apple Watch SE (2nd Gen) GPS 40mm',
    description: 'Crash detection, heart rate tracking, Sleep tracking, Retina display, 50m water resistant.',
    category: 'wearables',
    price: 24900,
    currency: 'INR',
    stock: 5,
    rating: 4.9,
    inStock: true,
    shippingDays: 2,
    returnDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=600&q=80',
    attributes: { brand: 'Apple', display: 'Retina', waterResistant: '50m' },
  },
];

// High-Performance In-Memory Catalog Query Engine
export function queryCatalog(params: CatalogSearchParams): CatalogSearchResult {
  const { query, category, maxPrice, minPrice, merchantId, inStockOnly = true } = params;
  const normalizedQuery = query.toLowerCase().trim();

  let filtered = PRODUCTS_DATA.filter((product) => {
    // 1. In Stock Filter
    if (inStockOnly && !product.inStock) {
      return false;
    }

    // 2. Category Filter
    if (category && category !== 'all' && product.category !== category) {
      return false;
    }

    // 3. Merchant Filter
    if (merchantId && product.merchantId !== merchantId) {
      return false;
    }

    // 4. Max Price Filter
    if (maxPrice !== undefined && product.price > maxPrice) {
      return false;
    }

    // 5. Min Price Filter
    if (minPrice !== undefined && product.price < minPrice) {
      return false;
    }

    // 6. Keyword Match (Name, Description, Merchant, Category, Attributes)
    if (normalizedQuery) {
      const matchText = `${product.name} ${product.description} ${product.merchantName} ${product.category} ${Object.values(product.attributes).join(' ')}`.toLowerCase();
      
      const queryTokens = normalizedQuery.split(/\s+/);
      // Require at least one token to match
      const hasMatch = queryTokens.some((token) => matchText.includes(token));
      if (!hasMatch) return false;
    }

    return true;
  });

  // Sort by price ascending or relevance
  filtered.sort((a, b) => a.price - b.price);

  return {
    query: params,
    totalFound: filtered.length,
    products: filtered,
  };
}
