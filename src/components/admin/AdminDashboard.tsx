'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getAdminMetricsAction,
  getMerchantCatalogAdminAction,
  getAllContractsAdminAction,
  getAllAuditLogsAdminAction,
  AdminMetrics,
} from '@/lib/actions/adminActions';
import { Merchant, Product } from '@/lib/models/merchant.model';
import { TransactionContract } from '@/lib/models/contract.model';
import { AuditEvent } from '@/lib/models/audit.model';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'contracts' | 'audit'>('catalog');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contracts, setContracts] = useState<TransactionContract[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    const [met, cat, cont, logs] = await Promise.all([
      getAdminMetricsAction(),
      getMerchantCatalogAdminAction(),
      getAllContractsAdminAction(),
      getAllAuditLogsAdminAction(),
    ]);

    setMetrics(met);
    setMerchants(cat.merchants);
    setProducts(cat.products);
    setContracts(cont);
    setAuditLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Admin & Governance Control Console
            </h2>
            <Badge variant="purple">Live System View</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring of Merchant Catalogs, Transaction Contracts, Scam Interceptions & Audit Trail
          </p>
        </div>

        <Button onClick={loadAdminData} variant="secondary" size="sm" disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Live Data'}
        </Button>
      </div>

      {/* System KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-500/30 bg-blue-950/20">
          <CardContent className="p-4">
            <span className="text-[10px] text-slate-400 font-mono block">TOTAL VOLUME AUTHORIZED</span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              ₹{metrics ? metrics.totalVolume.toLocaleString('en-IN') : 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Active & Verified Orders</span>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 bg-purple-950/20">
          <CardContent className="p-4">
            <span className="text-[10px] text-slate-400 font-mono block">CONTRACTS GENERATED</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {metrics ? metrics.totalContracts : 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Bounded Cryptographic Primitive</span>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 bg-rose-950/20">
          <CardContent className="p-4">
            <span className="text-[10px] text-slate-400 font-mono block">SCAM SURGES INTERCEPTED</span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {metrics ? metrics.scamInterceptions : 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Pre-Payment Contract Rejections</span>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-950/20">
          <CardContent className="p-4">
            <span className="text-[10px] text-slate-400 font-mono block">AUTO-APPROVE RATE</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {metrics ? metrics.autoApproveRate : 100}%
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Policy Auto Approval Rate</span>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏪 Merchant Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'contracts'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📑 Transaction Contracts ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📜 Audit Trail ({auditLogs.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter admin records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2 w-full sm:w-64 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* TAB 1: Merchant & Catalog Explorer */}
      {activeTab === 'catalog' && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200">
              Registered Merchants & Live Catalog Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Merchant Summary Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {merchants.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Free {m.shippingDays}-day delivery • {m.description}
                    </span>
                  </div>
                  <Badge variant="emerald">{m.trustScore / 20} ★ Verified</Badge>
                </div>
              ))}
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Merchant</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-sans font-semibold text-slate-100">{p.name}</td>
                      <td className="p-3 text-slate-300">{p.merchantName}</td>
                      <td className="p-3">
                        <Badge variant="blue">{p.category}</Badge>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-300">{p.stock} units</td>
                      <td className="p-3 text-amber-400 font-bold">{p.rating} ★</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Transaction Contract Registry */}
      {activeTab === 'contracts' && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200">
              Transaction Contract Registry & Order Fulfillments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No active contracts generated yet. Run a prompt in the AI Assistant tab to issue contracts!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Contract ID</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Merchant</th>
                      <th className="p-3">Locked Amount</th>
                      <th className="p-3">Auth Type</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {contracts.map((c) => (
                      <tr key={c.contractId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-purple-300">{c.contractId}</td>
                        <td className="p-3 font-sans font-semibold text-slate-100">
                          {c.productName}
                        </td>
                        <td className="p-3 text-slate-300">{c.merchantName}</td>
                        <td className="p-3 text-emerald-400 font-bold">
                          ₹{c.authorizedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={c.authorizationType === 'AUTO_APPROVED' ? 'emerald' : 'purple'}
                          >
                            {c.authorizationType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              c.status === 'USED'
                                ? 'emerald'
                                : c.status.startsWith('INVALIDATED')
                                ? 'rose'
                                : 'purple'
                            }
                          >
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: System Audit Trail Stream */}
      {activeTab === 'audit' && (
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200">
              System-Wide Audit Stream & Security Log Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No audit events logged yet. Execute buyer agent tasks to populate audit stream!
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                      log.status === 'ERROR'
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                        : log.status === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                        : log.status === 'SUCCESS'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === 'ERROR'
                              ? 'rose'
                              : log.status === 'WARNING'
                              ? 'amber'
                              : log.status === 'SUCCESS'
                              ? 'emerald'
                              : 'blue'
                          }
                        >
                          {log.eventType}
                        </Badge>
                        <span className="font-bold text-slate-100 font-sans">{log.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans mt-1">{log.description}</p>
                    {log.metadata && (
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-950/90 p-2 rounded-lg border border-slate-800 overflow-x-auto">
                        <code>{JSON.stringify(log.metadata)}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
