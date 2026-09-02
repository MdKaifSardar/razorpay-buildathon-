import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CatalogSearchParams } from '../models/merchant.model';

// Initialize Groq Provider
export const groqProvider = createGroq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key',
});

// Zod Schema for Search Intent Extraction
export const SearchIntentSchema = z.object({
  query: z.string().describe('Core product search terms, e.g. wireless headphones, mechanical keyboard'),
  category: z
    .enum(['audio', 'electronics', 'peripherals', 'wearables', 'all'])
    .optional()
    .describe('Product category'),
  maxPrice: z.number().optional().describe('Maximum price budget extracted from prompt in INR'),
  minPrice: z.number().optional().describe('Minimum price budget in INR'),
});

/**
 * Extract structured catalog search parameters from prompt using Groq LLM (or smart fallback)
 */
export async function extractSearchIntentFromPrompt(userPrompt: string): Promise<CatalogSearchParams> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey && apiKey !== 'gsk_demo_key') {
    try {
      const { object } = await generateObject({
        model: groqProvider('llama-3.3-70b-versatile'),
        schema: SearchIntentSchema,
        prompt: `Extract commerce search parameters from this request: "${userPrompt}". If a budget like "under 8k" or "below ₹8,000" is mentioned, extract maxPrice as a number (e.g. 8000).`,
      });

      return {
        query: object.query || userPrompt,
        category: object.category === 'all' ? undefined : object.category,
        maxPrice: object.maxPrice,
        minPrice: object.minPrice,
      };
    } catch (err) {
      console.warn('Groq API call failed or rate-limited, falling back to intelligent parser:', err);
    }
  }

  // Smart Fallback Parser (guarantees offline/dev reliability!)
  const normalized = userPrompt.toLowerCase();
  
  // Budget Parsing
  let maxPrice: number | undefined = undefined;
  const kMatch = normalized.match(/(?:under|below|less than|max|budget)\s*₹?\s*(\d+)(k|000)?/i);
  if (kMatch) {
    const val = parseInt(kMatch[1], 10);
    maxPrice = kMatch[2] === 'k' ? val * 1000 : val;
  } else {
    const rawNum = normalized.match(/₹?\s*(\d{4,6})/);
    if (rawNum) {
      maxPrice = parseInt(rawNum[1], 10);
    }
  }

  // Category Parsing
  let category: string | undefined = undefined;
  if (normalized.includes('headphone') || normalized.includes('earbud') || normalized.includes('audio') || normalized.includes('speaker')) {
    category = 'audio';
  } else if (normalized.includes('keyboard') || normalized.includes('mouse') || normalized.includes('monitor')) {
    category = 'peripherals';
  } else if (normalized.includes('watch') || normalized.includes('wearable') || normalized.includes('powerbank')) {
    category = 'wearables';
  }

  // Query extraction
  let query = userPrompt;
  if (normalized.includes('headphone')) query = 'headphones';
  else if (normalized.includes('keyboard')) query = 'keyboard';
  else if (normalized.includes('mouse')) query = 'mouse';
  else if (normalized.includes('watch')) query = 'smartwatch';

  return {
    query,
    category,
    maxPrice,
  };
}
