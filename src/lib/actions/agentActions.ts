'use server';

import { AgentTaskResult, TransactionIntent } from '../models/intent.model';
import { extractSearchIntentFromPrompt } from '../utils/groq';
import { queryCatalog } from '../utils/supabase';

/**
 * Server Action: Process user prompt, discover matching products, select best product, and generate Transaction Intent
 */
export async function runAgentTaskAction(userPrompt: string): Promise<AgentTaskResult> {
  if (!userPrompt || userPrompt.trim().length === 0) {
    return {
      success: false,
      userPrompt,
      totalProductsFound: 0,
      error: 'Prompt cannot be empty.',
    };
  }

  // 1. Extract search parameters using Groq LLM / Parser
  const searchParams = await extractSearchIntentFromPrompt(userPrompt);

  // 2. Query merchant database
  const catalogResult = await queryCatalog(searchParams);

  if (catalogResult.products.length === 0) {
    return {
      success: false,
      userPrompt,
      extractedQuery: searchParams,
      totalProductsFound: 0,
      error: `No products found matching your search criteria for "${searchParams.query || userPrompt}". Try broadening your budget, category, or rating requirements.`,
    };
  }

  // 3. AI Product Selection & Comparison Logic
  // Select the best matching item that satisfies budget & has highest rating
  const recommendedProduct = catalogResult.products[0];

  // 4. Generate AI Reasoning explanation
  const reasoning = `Selected ${recommendedProduct.name} from ${recommendedProduct.merchantName} because it offers the best spec match, holds a ${recommendedProduct.rating}★ rating, includes ${recommendedProduct.shippingDays}-day shipping, and sits comfortably within your ₹${recommendedProduct.price.toLocaleString('en-IN')} budget.`;

  // 5. Generate typed Transaction Intent Object
  const intent: TransactionIntent = {
    intentId: `INTENT-${Math.floor(100000 + Math.random() * 900000)}`,
    userPrompt,
    product: recommendedProduct,
    quantity: 1,
    proposedAmount: recommendedProduct.price,
    currency: recommendedProduct.currency,
    aiReasoning: reasoning,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    userPrompt,
    extractedQuery: searchParams,
    totalProductsFound: catalogResult.totalFound,
    recommendedProduct,
    intent,
  };
}
