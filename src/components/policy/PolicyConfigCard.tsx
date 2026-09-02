'use client';

import React from 'react';
import { BuyerPolicy } from '@/lib/models/policy.model';
import { Badge } from '@/components/ui/Badge';

interface PolicyConfigCardProps {
  policy: BuyerPolicy;
  onUpdatePolicy: (updated: BuyerPolicy) => void;
}

export function PolicyConfigCard({ policy, onUpdatePolicy }: PolicyConfigCardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            🛡️ My AI Spending Policy
            <Badge variant="blue">Deterministic Controls</Badge>
          </h4>
          <p className="text-xs text-slate-400">
            Define boundaries for autonomous AI purchases. The AI cannot spend beyond these rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Auto Approve Limit Slider / Input */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium">Auto-Buy Threshold:</span>
            <span className="text-sm font-extrabold text-emerald-400">
              ₹{policy.autoApproveLimit.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={policy.autoApproveLimit}
            onChange={(e) =>
              onUpdatePolicy({ ...policy, autoApproveLimit: parseInt(e.target.value, 10) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            Purchases &le; ₹{policy.autoApproveLimit.toLocaleString('en-IN')} proceed automatically
          </span>
        </div>

        {/* Max Approval Cap */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-medium">Maximum Policy Cap:</span>
            <span className="text-sm font-extrabold text-blue-400">
              ₹{policy.maxApprovalLimit.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min="5000"
            max="15000"
            step="1000"
            value={policy.maxApprovalLimit}
            onChange={(e) =>
              onUpdatePolicy({ ...policy, maxApprovalLimit: parseInt(e.target.value, 10) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            Purchases &gt; ₹{policy.maxApprovalLimit.toLocaleString('en-IN')} are strictly blocked
          </span>
        </div>
      </div>
    </div>
  );
}
