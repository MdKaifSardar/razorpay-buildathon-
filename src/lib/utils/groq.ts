import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CatalogSearchParams } from '../models/merchant.model';

// Initialize Groq Provider
export const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key',
});

// Clean, General Zod Schema for Search Intent Extraction
export const SearchIntentSchema = z.object({
  query: z.string().describe('Cleaned core product keywords e.g. "headphones", "keyboard" without price or rating numbers'),
  category: z
    .enum(['audio', 'electronics', 'peripherals', 'wearables', 'all'])
    .nullable()
    .describe('Product category or null'),
  maxPrice: z.number().nullable().describe('Maximum price budget in INR or null'),
  minPrice: z.number().nullable().describe('Minimum price budget in INR or null'),
  minRating: z.number().nullable().describe('Minimum target rating (0 to 5) or null'),
});

/**
 * Extract structured search parameters from user prompt using Groq LLM (with fallback)
 */
export async function extractSearchIntentFromPrompt(userPrompt: string): Promise<CatalogSearchParams> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey && apiKey !== 'gsk_demo_key') {
    try {
      const { object } = await generateObject({
        model: groqProvider('openai/gpt-oss-120b'),
        schema: SearchIntentSchema,
        prompt: `Extract structured e-commerce search parameters from the user prompt: "${userPrompt}".
- Extract clean product keywords into 'query'.
- Extract category, price budget (maxPrice/minPrice), and rating threshold (minRating) if specified.`,
      });

      return {
        query: object.query || userPrompt,
        category: object.category && object.category !== 'all' ? object.category : undefined,
        maxPrice: object.maxPrice ?? undefined,
        minPrice: object.minPrice ?? undefined,
        minRating: object.minRating ?? undefined,
      };
    } catch (err) {
      console.warn('Groq API call failed, using general fallback parser:', err);
    }
  }

  // General Fallback Parser
  const normalized = userPrompt.toLowerCase();
  
  let maxPrice: number | undefined = undefined;
  const priceMatch = normalized.match(/(?:under|below|less than|max|budget)?\s*₹?\s*(\d+)(k|000)?/i);
  if (priceMatch && (normalized.includes('under') || normalized.includes('below') || normalized.includes('k') || normalized.includes('₹'))) {
    const val = parseInt(priceMatch[1], 10);
    maxPrice = priceMatch[2] === 'k' ? val * 1000 : val;
  }

  let minRating: number | undefined = undefined;
  const ratingMatch = normalized.match(/(\d(?:\.\d)?)\s*(?:star|rating)/i);
  if (ratingMatch) {
    minRating = parseFloat(ratingMatch[1]);
  }

  let category: string | undefined = undefined;
  if (normalized.includes('headphone') || normalized.includes('earbud') || normalized.includes('audio')) {
    category = 'audio';
  } else if (normalized.includes('keyboard') || normalized.includes('mouse') || normalized.includes('monitor')) {
    category = 'peripherals';
  } else if (normalized.includes('watch') || normalized.includes('wearable') || normalized.includes('powerbank')) {
    category = 'wearables';
  }

  let query = userPrompt;
  if (normalized.includes('headphone')) query = 'headphones';
  else if (normalized.includes('keyboard')) query = 'keyboard';
  else if (normalized.includes('mouse')) query = 'mouse';
  else if (normalized.includes('watch')) query = 'smartwatch';

  return {
    query,
    category,
    maxPrice,
    minRating,
  };
}
