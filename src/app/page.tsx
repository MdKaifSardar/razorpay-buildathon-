'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PolicyConfigCard } from '@/components/policy/PolicyConfigCard';
import { AgentChat } from '@/components/agent/AgentChat';
import { AgentReasoningCard } from '@/components/agent/AgentReasoningCard';
import { TransactionContractModal } from '@/components/contract/TransactionContractModal';
import { PriceHikeSimulator } from '@/components/demo/PriceHikeSimulator';
import { RazorpayCheckoutButton } from '@/components/payment/RazorpayCheckoutButton';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

import { DEFAULT_USER_POLICY, BuyerPolicy, PolicyEvaluationResult } from '@/lib/models/policy.model';
import { TransactionIntent, AgentTaskResult } from '@/lib/models/intent.model';
import { TransactionContract } from '@/lib/models/contract.model';
import { AuditEvent } from '@/lib/models/audit.model';
import { runAgentTaskAction } from '@/lib/actions/agentActions';
import { evaluatePolicyAction } from '@/lib/actions/policyActions';
import { createContractAction, validateContractAction } from '@/lib/actions/contractActions';
import { updateProductPriceAction } from '@/lib/actions/merchantActions';
import { verifyPaymentSignatureAction } from '@/lib/actions/paymentActions';
import { getAuditEventsAction } from '@/lib/actions/orderActions';
import { logAuditEvent } from '@/lib/utils/auditLogger';

export default function Home() {
  // State Management
  const [mainViewTab, setMainViewTab] = useState<'buyer' | 'admin'>('buyer');
  const [policy, setPolicy] = useState<BuyerPolicy>(DEFAULT_USER_POLICY);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [taskResult, setTaskResult] = useState<AgentTaskResult | null>(null);
  const [policyResult, setPolicyResult] = useState<PolicyEvaluationResult | null>(null);
  const [contract, setContract] = useState<TransactionContract | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [simulatedPriceHike, setSimulatedPriceHike] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to refresh audit log state
  const refreshAuditEvents = async (refId: string) => {
    const events = await getAuditEventsAction(refId);
    setAuditEvents(events);
  };

  // 1. Run AI Buyer Agent Task
  const handleInstructAgent = async (userPrompt: string) => {
    setIsAgentRunning(true);
    setErrorMsg(null);
    setTaskResult(null);
    setPolicyResult(null);
    setContract(null);
    setPaymentCompleted(null);
    setAuditEvents([]);

    try {
      // Execute Agent Task Server Action
      const result = await runAgentTaskAction(userPrompt);
      setTaskResult(result);
      setIsAgentRunning(false);

      if (!result.success || !result.intent) {
        setErrorMsg(result.error || 'No matching products found.');
        return;
      }

      const intent = result.intent;

      // Log Audit: USER_INTENT & AI_DISCOVERED
      logAuditEvent(
        intent.intentId,
        'USER_INTENT',
        'User Instruction Received',
        `User prompt: "${userPrompt}"`,
        'INFO'
      );

      logAuditEvent(
        intent.intentId,
        'PRODUCT_SELECTED',
        'AI Product Recommendation Selected',
        `Selected ${intent.product.name} from ${intent.product.merchantName} for ₹${intent.proposedAmount.toLocaleString('en-IN')}.`,
        'SUCCESS',
        { productId: intent.product.id, merchant: intent.product.merchantName, price: intent.proposedAmount }
      );

      // Evaluate Policy
      const polResult = await evaluatePolicyAction(intent, policy);
      setPolicyResult(polResult);

      logAuditEvent(
        intent.intentId,
        'POLICY_EVALUATED',
        `Policy Evaluated: ${polResult.decision}`,
        polResult.reason,
        polResult.decision === 'REJECT' ? 'ERROR' : polResult.decision === 'NEEDS_APPROVAL' ? 'WARNING' : 'SUCCESS',
        { decision: polResult.decision, autoApproveLimit: polResult.autoApproveLimit, proposedAmount: polResult.proposedAmount }
      );

      // If Auto-Approved, issue contract immediately
      if (polResult.decision === 'APPROVE') {
        const newContract = await createContractAction(intent, 'AUTO_APPROVED');
        setContract(newContract);

        logAuditEvent(
          intent.intentId,
          'CONTRACT_CREATED',
          'Transaction Contract Locked',
          `Created Transaction Contract ${newContract.contractId} automatically for ₹${newContract.authorizedAmount.toLocaleString('en-IN')}.`,
          'SUCCESS',
          { contractId: newContract.contractId, authType: 'AUTO_APPROVED' }
        );
      }

      await refreshAuditEvents(intent.intentId);
    } catch (err: any) {
      setIsAgentRunning(false);
      setErrorMsg(err.message || 'An error occurred processing prompt.');
    }
  };

  // 2. User 1-Click Approval Handler
  const handleUserApprovePurchase = async () => {
    if (!taskResult?.intent) return;
    const intent = taskResult.intent;

    logAuditEvent(
      intent.intentId,
      'USER_AUTHORIZED',
      'User Authorized Purchase',
      `User approved purchase of ${intent.product.name} for ₹${intent.proposedAmount.toLocaleString('en-IN')}.`,
      'SUCCESS'
    );

    const newContract = await createContractAction(intent, 'USER_APPROVED');
    setContract(newContract);

    logAuditEvent(
      intent.intentId,
      'CONTRACT_CREATED',
      'Transaction Contract Issued',
      `Issued Transaction Contract ${newContract.contractId} under user authorization. TTL 10 minutes.`,
      'SUCCESS',
      { contractId: newContract.contractId, authType: 'USER_APPROVED' }
    );

    await refreshAuditEvents(intent.intentId);
  };

  // 3. User Rejection Handler
  const handleUserRejectPurchase = () => {
    if (!taskResult?.intent) return;
    logAuditEvent(
      taskResult.intent.intentId,
      'POLICY_BLOCKED',
      'User Rejected Purchase',
      'User declined to authorize the proposed purchase proposal.',
      'ERROR'
    );
    refreshAuditEvents(taskResult.intent.intentId);
    setPolicyResult({
      ...policyResult!,
      decision: 'REJECT',
      reason: 'User explicitly declined to approve purchase.',
    });
  };

  // 4. Payment Success Callback
  const handlePaymentSuccess = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => {
    if (!taskResult?.intent || !contract) return;

    // Verify Signature Server-Side
    const verRes = await verifyPaymentSignatureAction({
      ...payload,
      contractId: contract.contractId,
    });

    if (verRes.success) {
      setPaymentCompleted({
        paymentId: payload.razorpay_payment_id,
        orderId: payload.orderId,
      });
    } else {
      setErrorMsg(verRes.error || 'Server-side payment verification failed.');
    }

    await refreshAuditEvents(taskResult.intent.intentId);
  };

  // 5. Payment Failure Callback
  const handlePaymentFailed = async (errorReason: string) => {
    if (!taskResult?.intent) return;
    setErrorMsg(`Payment Aborted: ${errorReason}`);
    await refreshAuditEvents(taskResult.intent.intentId);
  };

  // 6. Scam Simulation: Mutate Product Price Row in Live Supabase DB
  const handleTogglePriceHike = async (active: boolean) => {
    if (!contract) return;
    setSimulatedPriceHike(active);

    const originalPrice = contract.authorizedAmount;
    const hikedPrice = Math.round(originalPrice * 1.1);
    const targetPrice = active ? hikedPrice : originalPrice;

    // Mutate live product price row in Supabase PostgreSQL database!
    await updateProductPriceAction(contract.productId, targetPrice);

    logAuditEvent(
      contract.contractId,
      'PRICE_CHANGED',
      active ? 'Merchant Price Surge Mutated in DB' : 'Merchant Price Reset in DB',
      active
        ? `Merchant mutated product price row in live Supabase database to ₹${targetPrice.toLocaleString('en-IN')} (+10% surge).`
        : `Merchant price row reset to original contract price ₹${targetPrice.toLocaleString('en-IN')} in live Supabase database.`,
      active ? 'WARNING' : 'INFO',
      { productId: contract.productId, originalPrice, newPrice: targetPrice }
    );

    // Re-validate contract against live DB row!
    const validation = await validateContractAction(contract);
    setContract(validation.updatedContract);
    await refreshAuditEvents(contract.contractId);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 border border-blue-400/40">
              AG
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                AgentCommerce Gateway
                <Badge variant="blue">Razorpay Buildathon 2026</Badge>
              </h1>
              <p className="text-xs text-slate-400">Track 01 — AI Growth & Agentic Commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setMainViewTab('buyer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mainViewTab === 'buyer'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛍️ Buyer Gateway
              </button>
              <button
                onClick={() => setMainViewTab('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mainViewTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Admin & Governance
              </button>
            </div>

            <span className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Razorpay Test Mode Active
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-8 space-y-6">
        {mainViewTab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {/* Policy Configuration Controls */}
            <PolicyConfigCard policy={policy} onUpdatePolicy={setPolicy} />

            {/* AI Assistant Prompt Input */}
            <AgentChat onRunTask={handleInstructAgent} isLoading={isAgentRunning} />

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="font-bold">⚠️ Notice:</span> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Task Result & Reasoning */}
        {taskResult?.intent && (
          <AgentReasoningCard intent={taskResult.intent} totalProductsFound={taskResult.totalProductsFound} />
        )}

        {/* Policy Evaluation Result & Approval Action Card */}
        {policyResult && (
          <Card
            className={`mb-6 border-l-4 ${
              policyResult.decision === 'APPROVE'
                ? 'border-l-emerald-500 border-slate-800 bg-slate-900/90'
                : policyResult.decision === 'NEEDS_APPROVAL'
                ? 'border-l-amber-500 border-amber-500/30 bg-amber-950/20'
                : 'border-l-rose-500 border-rose-500/30 bg-rose-950/20'
            }`}
          >
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">POLICY EVALUATION</span>
                  <Badge
                    variant={
                      policyResult.decision === 'APPROVE'
                        ? 'emerald'
                        : policyResult.decision === 'NEEDS_APPROVAL'
                        ? 'amber'
                        : 'rose'
                    }
                  >
                    {policyResult.decision}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300">{policyResult.reason}</p>
              </div>

              {policyResult.decision === 'NEEDS_APPROVAL' && !contract && (
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleUserApprovePurchase}>
                    ✓ Approve Purchase (₹{policyResult.proposedAmount.toLocaleString('en-IN')})
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleUserRejectPurchase}>
                    ✕ Reject
                  </Button>
                </div>
              )}
            </CardHeader>
          </Card>
        )}

        {/* Transaction Contract Primitive Modal Card */}
        {contract && <TransactionContractModal contract={contract} />}

        {/* Failure Recovery Demo Simulator Controls */}
        {contract && !paymentCompleted && (
          <PriceHikeSimulator
            contract={contract}
            isSimulatedPriceHike={simulatedPriceHike}
            onTogglePriceHike={handleTogglePriceHike}
          />
        )}

        {/* Razorpay Test Checkout Action Button */}
        {contract && !paymentCompleted && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
            <RazorpayCheckoutButton
              contract={contract}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailed={handlePaymentFailed}
            />
          </div>
        )}

        {/* Payment Success Confirmation Banner */}
        {paymentCompleted && (
          <Card className="border-emerald-500/50 bg-emerald-950/20 shadow-emerald-950/30 text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Purchase Completed & Verified!</h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto mb-4">
              Merchant order <strong className="text-emerald-400 font-mono">{paymentCompleted.orderId}</strong> has been officially updated to <Badge variant="emerald">PAID</Badge> after server HMAC signature verification.
            </p>
            <div className="inline-flex gap-4 text-xs font-mono bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-slate-400">
              <span>Razorpay Payment ID: <strong className="text-slate-200">{paymentCompleted.paymentId}</strong></span>
              <span>Status: <strong className="text-emerald-400">PAID</strong></span>
            </div>
          </Card>
        )}

        {/* Audit Log Timeline */}
        <AuditTimeline events={auditEvents} />
          </>
        )}
      </div>
    </main>
  );
}
