import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PRODUCTS_DATA, MERCHANTS_DATA } from '@/lib/utils/supabase';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 border border-blue-400/40">
              AG
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                AgentCommerce Gateway
                <Badge variant="blue">Razorpay AI Buildathon 2026</Badge>
              </h1>
              <p className="text-xs text-slate-400">Track 01 — AI Growth & Agentic Commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Razorpay Test Mode Active
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          🛡️ Bounded Financial Authority for AI Buyers
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Let AI Agents Buy.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Keep Humans in Control of Money.
          </span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          A secure authorization & transaction middleware that converts AI intent into locked Transaction Contracts, evaluates deterministic policies, and executes payments via Razorpay.
        </p>

        {/* Architecture Thesis Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-mono bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xl">
          <div className="p-2 rounded bg-slate-800/50">
            <span className="text-blue-400 block font-bold">LLM</span>
            <span className="text-slate-400">Reasoning</span>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <span className="text-amber-400 block font-bold">Policy Engine</span>
            <span className="text-slate-400">Authority</span>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <span className="text-purple-400 block font-bold">Contract Lock</span>
            <span className="text-slate-400">Safety</span>
          </div>
          <div className="p-2 rounded bg-slate-800/50">
            <span className="text-emerald-400 block font-bold">Razorpay</span>
            <span className="text-slate-400">Execution</span>
          </div>
        </div>
      </section>

      {/* Simulated Merchant Ecosystem Catalog Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Simulated Merchant Ecosystem</h3>
            <p className="text-xs text-slate-400">
              Live products available for AI Agent product discovery and transaction testing
            </p>
          </div>
          <div className="flex gap-2">
            {MERCHANTS_DATA.map((merchant) => (
              <Badge key={merchant.id} variant="purple">
                {merchant.name} ({merchant.trustScore}% Trust)
              </Badge>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS_DATA.slice(0, 6).map((product) => (
            <Card key={product.id} className="hover:border-slate-700">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <Badge variant="slate" className="mb-2">
                    {product.merchantName}
                  </Badge>
                  <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
                </div>
                <Badge variant={product.inStock ? 'emerald' : 'rose'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </CardHeader>

              <CardContent>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{product.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-500 block">Price</span>
                    <span className="text-lg font-bold text-white">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Shipping</span>
                    <span className="text-xs font-medium text-slate-300">
                      {product.shippingDays} days delivery
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        AgentCommerce Gateway • Built for Razorpay AI Buildathon 2026 • Simulated Merchant Sandbox
      </footer>
    </main>
  );
}
