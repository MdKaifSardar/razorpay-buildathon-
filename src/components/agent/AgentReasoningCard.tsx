import React from 'react';
import { TransactionIntent } from '@/lib/models/intent.model';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AgentReasoningCardProps {
  intent: TransactionIntent;
  totalProductsFound: number;
}

export function AgentReasoningCard({ intent, totalProductsFound }: AgentReasoningCardProps) {
  const { product, aiReasoning, proposedAmount } = intent;

  return (
    <Card className="border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-900/80 mb-6">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="blue">AI Selected Match</Badge>
          <span className="text-xs text-slate-400">Found {totalProductsFound} matching items</span>
        </div>
        <Badge variant="purple">{intent.intentId}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Summary Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block mb-1">
              Merchant: <strong className="text-slate-200">{product.merchantName}</strong> (
              {product.shippingDays}-day shipping)
            </span>
            <h4 className="text-lg font-bold text-white">{product.name}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description}</p>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <span className="text-xs text-slate-400 block">Proposed Total</span>
            <span className="text-2xl font-black text-blue-400">
              ₹{proposedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* AI Reasoning Block */}
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300">
          <span className="font-semibold text-blue-300 block mb-1">🤖 AI Selection Reasoning:</span>
          <p className="leading-relaxed text-slate-300">{aiReasoning}</p>
        </div>
      </CardContent>
    </Card>
  );
}
