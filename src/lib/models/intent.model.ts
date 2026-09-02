import { Product } from './merchant.model';

export interface TransactionIntent {
  intentId: string;
  userPrompt: string;
  product: Product;
  quantity: number;
  proposedAmount: number;
  currency: string;
  aiReasoning: string;
  createdAt: string;
}

export interface AgentTaskResult {
  success: boolean;
  userPrompt: string;
  extractedQuery?: {
    query: string;
    category?: string;
    maxPrice?: number;
  };
  totalProductsFound: number;
  recommendedProduct?: Product;
  intent?: TransactionIntent;
  error?: string;
}
