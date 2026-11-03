import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { TelecomNetwork } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Download,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    setIsSaleModalOpen,
    setReversalTarget,
    setIsReversalModalOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const sales = data?.sales || [];

  const filteredSales = sales.filter((s: any) => {
    if (!isDateInRange(s.localDate)) return false;
    if (networkFilter !== 'all' && s.network !== networkFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'reversed' && s.status !== 'reversed') return false;
      if (statusFilter === 'completed' && s.status !== 'completed') return false;
      if (statusFilter === 'unpaid' && s.outstandingAmount <= 0) return false;
      if (statusFilter === 'fully_paid' && s.paymentStatus !== 'fully_paid') return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchNum = s.transactionNumber.toLowerCase().includes(q);
      const matchPkg = s.packageName.toLowerCase().includes(q);
      const matchCust = (s.customerName || '').toLowerCase().includes(q);
      const matchMobile = (s.customerMobile || '').includes(q);
      const matchRef = (s.reference || '').toLowerCase().includes(q);
      return matchNum || matchPkg || matchCust || matchMobile || matchRef;
    }
    return true;
  });

  const activeSales = filteredSales.filter((s: any) => s.status === 'completed');
  const totalRevenue = activeSales.reduce((sum: number, s: any) => sum + s.netSaleAmount, 0);
  const totalReceived = activeSales.reduce((sum: number, s: any) => sum + s.amountReceived, 0);
  const totalOutstanding = activeSales.reduce((sum: number, s: any) => sum + s.outstandingAmount, 0);
  const totalGrossProfit = activeSales.reduce((sum: number, s: any) => sum + s.grossProfit, 0);
  const totalNetProfit = activeSales.reduce((sum: number, s: any) => sum + s.netProfit, 0);

  const exportCSV = () => {
    const headers = ['Tx Number', 'Date', 'Time', 'Network', 'Package', 'Customer', 'Mobile', 'Cost', 'Sell Price', 'Discount', 'Net Amount', 'Received', 'Due', 'Gross Profit', 'Net Profit', 'Payment Method', 'Status'];
    const rows = filteredSales.map((s: any) => [
      s.transactionNumber,
      s.localDate,
      s.localTime,
      s.network.toUpperCase(),
      `"${s.packageName}"`,
      `"${s.customerName || ''}"`,
      s.customerMobile || '',
      s.packagePurchaseCost,
      s.sellingPrice,
      s.discount,
      s.netSaleAmount,
      s.amountReceived,
      s.outstandingAmount,
      s.grossProfit,
      s.netProfit,
      s.paymentMethod,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FAT_Sales_Report_${new Date().toISOString().substring(0, 10)}.csv`);
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
            <ShoppingCart className="w-6 h-6 text-emerald-500" />
            <span>{language === 'ur' ? 'پیکج سیلز رجسٹر' : 'Package Sales Register'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'تمام سیلز کی تفصیلی فہرست، کسٹمر ادھار اور ریورسل کی سہولت'
              : 'Complete package transaction log, customer receivable tracking, and traceable reversals'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.recordSale}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar />

      {/* Metric summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Net Sales</span>
          <span className="text-base sm:text-lg font-black text-white">{formatCurrency(totalRevenue)}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{activeSales.length} sales</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Cash Received</span>
          <span className="text-base sm:text-lg font-black text-emerald-400">{formatCurrency(totalReceived)}</span>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5">Liquid Inflow</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customer Due (Udhaar)</span>
          <span className="text-base sm:text-lg font-black text-amber-400">{formatCurrency(totalOutstanding)}</span>
          <span className="text-[10px] text-amber-400/80 block mt-0.5">Receivable</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Gross Profit</span>
          <span className="text-base sm:text-lg font-black text-emerald-400">{formatCurrency(totalGrossProfit)}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Sales - COGS</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950/20">
          <span className="text-[10px] text-emerald-300 uppercase font-bold block mb-1">Net Profit</span>
          <span className="text-base sm:text-lg font-black text-emerald-300">{formatCurrency(totalNetProfit)}</span>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5">Actual Net Gain</span>
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
            placeholder="Search tx #, customer, mobile, package..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="unpaid">Udhaar / Unpaid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="reversed">Reversed Only</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No sales records found for this period and filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Tx #</th>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Network</th>
                  <th className="py-3 px-3">Package</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Net Sale</th>
                  <th className="py-3 px-3">Received</th>
                  <th className="py-3 px-3">Due</th>
                  <th className="py-3 px-3">Gross / Net</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSales.map((sale: any) => {
                  const meta = NETWORK_METAS[sale.network as TelecomNetwork] || NETWORK_METAS.jazz;
                  const isReversed = sale.status === 'reversed';

                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                        {sale.transactionNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        <div>{formatShortDate(sale.localDate)}</div>
                        <div className="text-[10px] text-slate-500">{sale.localTime}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: meta.themeColor }}
                        >
                          {meta.name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${isReversed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {sale.packageName}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{sale.customerName || 'Walk-in'}</div>
                        {sale.customerMobile && (
                          <div className="text-[10px] text-slate-500">{sale.customerMobile}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {formatCurrency(sale.netSaleAmount)}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold whitespace-nowrap">
                        {formatCurrency(sale.amountReceived)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {sale.outstandingAmount > 0 ? (
                          <span className="text-amber-400 font-bold">{formatCurrency(sale.outstandingAmount)}</span>
                        ) : (
                          <span className="text-slate-500">Nil</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-emerald-400">+{formatCurrency(sale.grossProfit)}</div>
                        <div className="text-[10px] text-slate-400">Net: +{formatCurrency(sale.netProfit)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isReversed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/50">
                            REVERSED
                          </span>
                        ) : sale.outstandingAmount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/50">
                            PARTIAL / DUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            PAID
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isReversed && (
                          <button
                            onClick={() => {
                              setReversalTarget({
                                type: 'sale',
                                id: sale.id,
                                reference: sale.transactionNumber,
                                amount: sale.netSaleAmount
                              });
                              setIsReversalModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Reverse Transaction"
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
