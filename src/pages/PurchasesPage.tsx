import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { TelecomNetwork } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  PackagePlus,
  Plus,
  Search,
  RotateCcw,
  Download,
  Building2
} from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    setIsPurchaseModalOpen,
    setReversalTarget,
    setIsReversalModalOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');

  const purchases = data?.purchases || [];

  const filteredPurchases = purchases.filter((p: any) => {
    if (!isDateInRange(p.localDate)) return false;
    if (networkFilter !== 'all' && p.network !== networkFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = p.purchaseNumber.toLowerCase().includes(q);
      const matchPkg = (p.packageName || '').toLowerCase().includes(q);
      const matchSup = (p.supplierName || '').toLowerCase().includes(q);
      const matchRef = (p.reference || '').toLowerCase().includes(q);
      return matchNum || matchPkg || matchSup || matchRef;
    }
    return true;
  });

  const activePurchases = filteredPurchases.filter((p: any) => p.status === 'completed');
  const totalCost = activePurchases.reduce((sum: number, p: any) => sum + p.totalPurchaseCost, 0);
  const totalPaid = activePurchases.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
  const totalPayable = activePurchases.reduce((sum: number, p: any) => sum + p.remainingPayable, 0);

  const exportCSV = () => {
    const headers = ['PO Number', 'Date', 'Network', 'Item', 'Supplier', 'Qty', 'Unit Cost', 'Total Cost', 'Amount Paid', 'Remaining Payable', 'Payment Method', 'Status'];
    const rows = filteredPurchases.map((p: any) => [
      p.purchaseNumber,
      p.localDate,
      p.network.toUpperCase(),
      `"${p.packageName || ''}"`,
      `"${p.supplierName}"`,
      p.quantity,
      p.unitPurchaseCost,
      p.totalPurchaseCost,
      p.amountPaid,
      p.remainingPayable,
      p.paymentMethod,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FAT_Purchases_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <PackagePlus className="w-6 h-6 text-purple-500" />
            <span>{language === 'ur' ? 'اسٹاک و لوڈ خریداری (Purchases)' : 'Stock & Load Purchases'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'فرنچائز اور ڈسٹری بیوٹرز سے ریٹیلر لوڈ اور اسٹاک خریداری کا مکمل کھاتہ'
              : 'Record retailer load top-ups, SIM cards, supplier payables, and inventory receipts'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.recordPurchase}</span>
          </button>
        </div>
      </div>

      <DateFilterBar />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Stock Purchased</span>
          <span className="text-xl font-black text-white">{formatCurrency(totalCost)}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{activePurchases.length} purchase orders</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Cash / Bank Paid</span>
          <span className="text-xl font-black text-emerald-400">{formatCurrency(totalPaid)}</span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Settled Immediately</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Supplier Payable Due</span>
          <span className="text-xl font-black text-rose-400">{formatCurrency(totalPayable)}</span>
          <span className="text-[11px] text-rose-400/80 block mt-1">Pending Settlement</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search PO #, supplier, package..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={networkFilter}
          onChange={e => setNetworkFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5"
        >
          <option value="all">All Networks</option>
          <option value="jazz">Jazz</option>
          <option value="zong">Zong</option>
          <option value="telenor">Telenor</option>
          <option value="ufone">Ufone</option>
        </select>
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <PackagePlus className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No purchase records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">PO #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Network</th>
                  <th className="py-3 px-3">Stock Item</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Qty x Cost</th>
                  <th className="py-3 px-3">Total Cost</th>
                  <th className="py-3 px-3">Paid</th>
                  <th className="py-3 px-3">Remaining Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPurchases.map((purchase: any) => {
                  const meta = NETWORK_METAS[purchase.network as TelecomNetwork] || NETWORK_METAS.jazz;
                  const isReversed = purchase.status === 'reversed';

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                        {purchase.purchaseNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatShortDate(purchase.localDate)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: meta.themeColor }}
                        >
                          {meta.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {purchase.packageName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-200 font-medium">{purchase.supplierName}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {purchase.quantity} × {formatCurrency(purchase.unitPurchaseCost)}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {formatCurrency(purchase.totalPurchaseCost)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-400 whitespace-nowrap">
                        {formatCurrency(purchase.amountPaid)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {purchase.remainingPayable > 0 ? (
                          <span className="text-rose-400 font-bold">{formatCurrency(purchase.remainingPayable)}</span>
                        ) : (
                          <span className="text-slate-500">Nil</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isReversed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/50">
                            REVERSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            COMPLETED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isReversed && (
                          <button
                            onClick={() => {
                              setReversalTarget({
                                type: 'purchase',
                                id: purchase.id,
                                reference: purchase.purchaseNumber,
                                amount: purchase.totalPurchaseCost
                              });
                              setIsReversalModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title="Reverse Purchase"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
