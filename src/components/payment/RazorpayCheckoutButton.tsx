'use client';

import React, { useState } from 'react';
import { TransactionContract } from '@/lib/models/contract.model';
import { createRazorpayOrderAction } from '@/lib/actions/paymentActions';
import { Button } from '@/components/ui/Button';

interface RazorpayCheckoutButtonProps {
  contract: TransactionContract;
  simulatedPriceOverride?: number;
  onPaymentSuccess: (paymentPayload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => void;
  onPaymentFailed: (errorReason: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckoutButton({
  contract,
  simulatedPriceOverride,
  onPaymentSuccess,
  onPaymentFailed,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Validate Contract & Create Razorpay Order via Server Action
      const res = await createRazorpayOrderAction(contract, simulatedPriceOverride);

      if (!res.success || !res.razorpayOrderId) {
        setLoading(false);
        onPaymentFailed(res.error || 'Contract validation failed.');
        return;
      }

      // 2. Load Checkout.js
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded && typeof window !== 'undefined') {
        // Fallback for simulated test payment if script is blocked by browser adblockers
        const mockPaymentPayload = {
          razorpay_order_id: res.razorpayOrderId,
          razorpay_payment_id: `pay_RZP${Math.floor(100000000 + Math.random() * 900000000)}`,
          razorpay_signature: `sig_mock_${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: res.orderId || 'ORD-12345',
        };
        setLoading(false);
        onPaymentSuccess(mockPaymentPayload);
        return;
      }

      // 3. Configure Razorpay Modal Options
      const options = {
        key: res.keyId || 'rzp_test_demo_key',
        amount: res.amount,
        currency: res.currency || 'INR',
        name: 'AgentCommerce Gateway',
        description: `Payment for ${contract.productName}`,
        order_id: res.razorpayOrderId,
        handler: function (response: any) {
          setLoading(false);
          onPaymentSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: res.orderId || 'ORD-12345',
          });
        },
        prefill: {
          name: 'AI Agent Buyer',
          email: 'buyer@agentcommerce.io',
          contact: '9999999999',
        },
        notes: {
          contractId: contract.contractId,
          merchantName: contract.merchantName,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setLoading(false);
        onPaymentFailed(response.error?.description || 'Razorpay payment attempt failed.');
      });

      rzp.open();
    } catch (err: any) {
      setLoading(false);
      onPaymentFailed(err.message || 'An error occurred initiating checkout.');
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading || contract.status.startsWith('INVALIDATED')}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Validating Contract & Opening Razorpay...
        </span>
      ) : (
        `Pay ₹${contract.authorizedAmount.toLocaleString('en-IN')} with Razorpay Test Mode →`
      )}
    </Button>
  );
}
