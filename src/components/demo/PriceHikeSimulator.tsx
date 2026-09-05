'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TransactionContract } from '@/lib/models/contract.model';
import { ShieldAlert, Check, AlertTriangle } from 'lucide-react';

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
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Security & Scam Prevention Demo Controls
            <Badge variant="amber">Failure Recovery Test</Badge>
          </CardTitle>
          <p className="text-xs text-slate-400">
            Mutate the product price row in live Supabase PostgreSQL database to test pre-payment contract invalidation.
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
              Database Merchant Price Surge:{' '}
              <strong className="text-amber-400">₹{simulatedPrice.toLocaleString('en-IN')} (+10%)</strong>
            </span>
          </div>

          <Button
            type="button"
            variant={isSimulatedPriceHike ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => onTogglePriceHike(!isSimulatedPriceHike)}
          >
            <span className="flex items-center gap-1.5">
              {isSimulatedPriceHike ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Price Hike Active in Database (Click to Reset)
                </>
              ) : (
                'Simulate Merchant Price Hike in DB (+10%)'
              )}
            </span>
          </Button>
        </div>

        {isSimulatedPriceHike && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Database Row Updated to ₹{simulatedPrice.toLocaleString('en-IN')}!
            </span>
            <p>
              The product row in your Supabase PostgreSQL database has been updated to ₹{simulatedPrice.toLocaleString('en-IN')}. When you click "Pay with Razorpay", the Gateway backend checks the live database price against the authorized contract amount (₹{authorizedPrice.toLocaleString('en-IN')}), immediately invalidating the contract (<strong className="text-rose-400">INVALIDATED_PRICE_CHANGED</strong>) and blocking Razorpay execution.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
