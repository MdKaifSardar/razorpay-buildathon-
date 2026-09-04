'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TransactionContract } from '@/lib/models/contract.model';

interface PriceHikeSimulatorProps {
  contract: TransactionContract;
  isSimulatedPriceHike: boolean;
  onTogglePriceHike: (active: boolean) => void;
}

export function PriceHikeSimulator({
  contract,
  isSimulatedPriceHike,
  onTogglePriceHike,
}: PriceHikeSimulatorProps) {
  const authorizedPrice = contract.authorizedAmount;
  const simulatedPrice = Math.round(authorizedPrice * 1.1); // 10% price bump

  return (
    <Card className="mb-6 border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-slate-900/90 shadow-amber-950/20">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-amber-300 flex items-center gap-2">
            ⚠️ Security & Scam Prevention Demo Controls
            <Badge variant="amber">Failure Recovery Test</Badge>
          </CardTitle>
          <p className="text-xs text-slate-400">
            Simulate a mid-flight merchant price bump to test pre-payment contract invalidation.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block font-mono">
              Authorized Contract Price: <strong className="text-emerald-400">₹{authorizedPrice.toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-xs text-slate-400 block font-mono">
              Simulated Merchant Price Surge:{' '}
              <strong className="text-amber-400">₹{simulatedPrice.toLocaleString('en-IN')} (+10%)</strong>
            </span>
          </div>

          <Button
            type="button"
            variant={isSimulatedPriceHike ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => onTogglePriceHike(!isSimulatedPriceHike)}
          >
            {isSimulatedPriceHike ? '✓ Price Hike Active (Simulating Scam)' : 'Simulate Merchant Price Hike (+10%)'}
          </Button>
        </div>

        {isSimulatedPriceHike && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <span className="font-bold text-amber-400 block mb-1">🚨 Dynamic Price Slippage Triggered!</span>
            <p>
              When you click "Pay with Razorpay", the Gateway backend will re-validate the contract against live catalog price (₹{simulatedPrice.toLocaleString('en-IN')}). Because the price exceeds the authorized amount (₹{authorizedPrice.toLocaleString('en-IN')}), the contract will <strong className="text-rose-400">INVALIDATE</strong> and Razorpay will be **BLOCKED**.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
