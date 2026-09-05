import React from 'react';
import { TransactionContract } from '@/lib/models/contract.model';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { XCircle, FileCode } from 'lucide-react';

interface TransactionContractModalProps {
  contract: TransactionContract;
}

export function TransactionContractModal({ contract }: TransactionContractModalProps) {
  const isInvalidated = contract.status.startsWith('INVALIDATED');

  return (
    <Card
      className={`mb-6 transition-all duration-300 ${
        isInvalidated
          ? 'border-rose-500/50 bg-rose-950/20 shadow-rose-950/30'
          : 'border-purple-500/40 bg-purple-950/20 shadow-purple-950/20'
      }`}
    >
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-extrabold text-purple-300 tracking-wider">
              TRANSACTION CONTRACT
            </span>
            <Badge variant={isInvalidated ? 'rose' : 'purple'}>
              {contract.authorizationType}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Bounded cryptographic authorization primitive locked prior to Razorpay execution
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-purple-400 font-bold block">
            {contract.contractId}
          </span>
          <span className="text-[10px] text-slate-500 block">TTL: 10 mins</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contract Data Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">MERCHANT</span>
            <span className="text-slate-200 font-semibold">{contract.merchantName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">PRODUCT</span>
            <span className="text-slate-200 font-semibold line-clamp-1">{contract.productName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">QTY</span>
            <span className="text-slate-200 font-semibold">{contract.quantity} unit</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">LOCKED AMOUNT</span>
            <span className="text-emerald-400 font-bold">
              ₹{contract.authorizedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Status Notification Banner */}
        {isInvalidated ? (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
              <XCircle className="w-4 h-4 text-rose-400" /> CONTRACT INVALIDATED
            </span>
            <p>{contract.invalidationReason || 'Contract is no longer valid for payment initiation.'}</p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Contract Active & Verified Pre-Payment
            </span>
            <span className="font-mono text-[10px] text-purple-400">Status: {contract.status}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
