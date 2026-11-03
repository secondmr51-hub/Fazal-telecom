import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { TelecomNetwork } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  TrendingUp,
  Layers,
  Building2,
  Users,
  Wallet,
  Receipt,
  BookOpen
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    dateFilter
  } = useApp();

  type ReportTab =
    | 'daily'
    | 'monthly'
    | 'network'
    | 'package'
    | 'purchases'
    | 'balance_sheet'
    | 'customer_due'
    | 'supplier_payable'
    | 'expenses';

  const [activeTab, setActiveTab] = useState<ReportTab>('daily');
  const [reportSearch, setReportSearch] = useState('');

  const sales = data?.sales || [];
  const purchases = data?.purchases || [];
  const expenses = data?.expenses || [];
  const accounts = data?.accounts || [];
  const customers = data?.customers || [];
  const suppliers = data?.suppliers || [];
  const packages = data?.packages || [];

  const filteredSales = sales.filter((s: any) => s.status === 'completed' && isDateInRange(s.localDate));
  const filteredPurchases = purchases.filter((p: any) => p.status === 'completed' && isDateInRange(p.localDate));
  const filteredExpenses = expenses.filter((e: any) => e.status === 'completed' && isDateInRange(e.localDate));

  // Network-wise aggregation
  const networkReport = (['jazz', 'zong', 'telenor', 'ufone'] as TelecomNetwork[]).map(net => {
    const netSales = filteredSales.filter((s: any) => s.network === net);
    const revenue = netSales.reduce((s: number, i: any) => s + i.netSaleAmount, 0);
    const cost = netSales.reduce((s: number, i: any) => s + i.packagePurchaseCost, 0);
    const grossProfit = revenue - cost;
    const netProfit = netSales.reduce((s: number, i: any) => s + i.netProfit, 0);
    return {
      network: net,
      name: NETWORK_METAS[net].name,
      urduName: NETWORK_METAS[net].urduName,
      count: netSales.length,
      revenue,
      cost,
      grossProfit,
      netProfit
    };
  });

  // Package-wise aggregation
  const packageMap = new Map<string, { id: string; name: string; network: string; count: number; revenue: number; profit: number }>();
  filteredSales.forEach((s: any) => {
    const existing = packageMap.get(s.packageId) || {
      id: s.packageId,
      name: s.packageName,
      network: s.network,
      count: 0,
      revenue: 0,
      profit: 0
    };
    existing.count += 1;
    existing.revenue += s.netSaleAmount;
    existing.profit += s.netProfit;
    packageMap.set(s.packageId, existing);
  });
  const packageReport = Array.from(packageMap.values()).sort((a, b) => b.revenue - a.revenue);

  // Balance sheet summary calculations
  const totalCash = accounts.filter((a: any) => a.type === 'cash').reduce((s: number, a: any) => s + a.currentBalance, 0);
  const totalWallets = accounts.filter((a: any) => a.type === 'digital_wallet' || a.type === 'bank' || a.id === 'acc_other_digital').reduce((s: number, a: any) => s + a.currentBalance, 0);
  const totalRetailerLoad = accounts.filter((a: any) => a.type === 'retailer_load').reduce((s: number, a: any) => s + a.currentBalance, 0);
  const totalCustomerReceivables = customers.reduce((s: number, c: any) => s + (c.currentOutstanding || 0), 0);
  const totalAssets = totalCash + totalWallets + totalRetailerLoad + totalCustomerReceivables;

  const totalSupplierPayables = suppliers.reduce((s: number, sup: any) => s + (sup.currentPayable || 0), 0);
  const totalLiabilities = totalSupplierPayables;
  const netBusinessEquity = totalAssets - totalLiabilities;

  const handlePrint = () => {
    window.print();
  };

  const exportCurrentReportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeTab === 'daily' || activeTab === 'monthly') {
      headers = ['Date', 'Tx #', 'Network', 'Package', 'Customer', 'Net Sale', 'Gross Profit', 'Net Profit'];
      rows = filteredSales.map((s: any) => [
        s.localDate,
        s.transactionNumber,
        s.network.toUpperCase(),
        `"${s.packageName}"`,
        `"${s.customerName || 'Walk-in'}"`,
        s.netSaleAmount,
        s.grossProfit,
        s.netProfit
      ]);
    } else if (activeTab === 'network') {
      headers = ['Network', 'Total Sales Count', 'Total Sales Revenue', 'Total COGS', 'Gross Profit', 'Net Profit'];
      rows = networkReport.map(n => [n.name, n.count, n.revenue, n.cost, n.grossProfit, n.netProfit]);
    } else if (activeTab === 'package') {
      headers = ['Package Name', 'Network', 'Units Sold', 'Total Revenue', 'Total Net Profit'];
      rows = packageReport.map(p => [`"${p.name}"`, p.network.toUpperCase(), p.count, p.revenue, p.profit]);
    } else if (activeTab === 'customer_due') {
      headers = ['Customer Name', 'Mobile Number', 'Credit Limit', 'Current Outstanding Udhaar'];
      rows = customers.map((c: any) => [`"${c.name}"`, c.mobile || '', c.creditLimit || 0, c.currentOutstanding]);
    } else if (activeTab === 'supplier_payable') {
      headers = ['Supplier Name', 'Network', 'Contact', 'Outstanding Payable Due'];
      rows = suppliers.map((s: any) => [`"${s.name}"`, s.network || 'All', s.mobile || '', s.currentPayable]);
    } else {
      headers = ['Item', 'Amount'];
      rows = [['Total Business Assets', totalAssets], ['Total Liabilities', totalLiabilities], ['Net Equity', netBusinessEquity]];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FAT_Report_${activeTab}_${new Date().toISOString().substring(0, 10)}.csv`);
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
            <FileSpreadsheet className="w-6 h-6 text-blue-500" />
            <span>{language === 'ur' ? 'کاروباری رپورٹس و بیلنس شیٹ' : 'Business Reports & Balance Sheet'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'روزانہ، ماہانہ، نیٹ ورک وار، پیکج وار اور مالیاتی پوزیشن رپورٹس برائے برآمد (CSV) و پرنٹ'
              : 'Daily, monthly, network-wise, package-wise, balance sheet, and receivables ledger with CSV & Print export'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print View</span>
          </button>
          <button
            onClick={exportCurrentReportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <DateFilterBar />

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 border-b border-slate-800">
        {[
          { id: 'daily', label: 'Daily / Period Sales' },
          { id: 'network', label: 'Network-Wise Sales' },
          { id: 'package', label: 'Package-Wise Sales' },
          { id: 'balance_sheet', label: 'Balance Sheet Summary' },
          { id: 'customer_due', label: 'Customer Receivables (Udhaar)' },
          { id: 'supplier_payable', label: 'Supplier Payables' },
          { id: 'expenses', label: 'Operating Expenses' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Daily / Period Sales Report */}
      {activeTab === 'daily' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Sales Ledger ({filteredSales.length} items)
            </h3>
            <span className="text-xs text-slate-400">
              Total Revenue: <strong className="text-white">{formatCurrency(filteredSales.reduce((s: number, i: any) => s + i.netSaleAmount, 0))}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Tx #</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Package</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Net Sale</th>
                  <th className="py-2.5 px-3">Gross Profit</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{formatShortDate(s.localDate)} {s.localTime}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{s.transactionNumber}</td>
                    <td className="py-2.5 px-3 uppercase font-bold text-slate-300">{s.network}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.packageName}</td>
                    <td className="py-2.5 px-3">{s.customerName || 'Walk-in'}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{formatCurrency(s.netSaleAmount)}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">+{formatCurrency(s.grossProfit)}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">+{formatCurrency(s.netProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Network-Wise Sales Report */}
      {activeTab === 'network' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-sm">
            Network-Wise Telecom Performance Report
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-3">Network</th>
                  <th className="py-3 px-3">Total Sales Units</th>
                  <th className="py-3 px-3">Gross Revenue</th>
                  <th className="py-3 px-3">Cost of Goods Sold (COGS)</th>
                  <th className="py-3 px-3">Gross Profit</th>
                  <th className="py-3 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {networkReport.map(n => (
                  <tr key={n.network} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NETWORK_METAS[n.network].themeColor }} />
                      <span>{n.name} ({n.urduName})</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{n.count} sales</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(n.revenue)}</td>
                    <td className="py-3 px-3 text-rose-400 font-semibold">{formatCurrency(n.cost)}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">+{formatCurrency(n.grossProfit)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-300">+{formatCurrency(n.netProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Package-Wise Sales Report */}
      {activeTab === 'package' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-sm">
            Top Performing Package Sales Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-3">Package Name</th>
                  <th className="py-3 px-3">Network</th>
                  <th className="py-3 px-3">Units Sold</th>
                  <th className="py-3 px-3">Total Revenue</th>
                  <th className="py-3 px-3 text-right">Total Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {packageReport.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">
                      {idx + 1}. {p.name}
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] font-semibold text-slate-400">
                      {p.network}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{p.count}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatCurrency(p.revenue)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">+{formatCurrency(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Balance Sheet Summary */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-white text-base">
              Fazal Azam Telecom — Balance Sheet Summary
            </h3>
            <p className="text-xs text-slate-400">Statement of Business Financial Position as of Today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Assets */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-white text-sm uppercase tracking-wider">CURRENT ASSETS</span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(totalAssets)}</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Cash in Hand (Counter Drawer):</span>
                  <span className="font-semibold text-white">{formatCurrency(totalCash)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Digital Accounts (JazzCash, Easypaisa, Bank):</span>
                  <span className="font-semibold text-white">{formatCurrency(totalWallets)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Retailer SIM Load Balances (Jazz, Zong, Telenor, Ufone):</span>
                  <span className="font-semibold text-white">{formatCurrency(totalRetailerLoad)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Customer Accounts Receivable (Udhaar):</span>
                  <span className="font-semibold text-amber-400">{formatCurrency(totalCustomerReceivables)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-white text-sm uppercase tracking-wider">LIABILITIES & EQUITY</span>
                <span className="font-black text-blue-400 text-sm">{formatCurrency(totalLiabilities + netBusinessEquity)}</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Accounts Payable (Supplier Dues):</span>
                  <span className="font-semibold text-rose-400">{formatCurrency(totalSupplierPayables)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-white font-bold">
                  <span>Total Liabilities:</span>
                  <span className="text-rose-400">{formatCurrency(totalLiabilities)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-emerald-400 font-extrabold text-sm">
                  <span>Net Business Net Worth (Equity):</span>
                  <span>{formatCurrency(netBusinessEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Customer Receivables Report */}
      {activeTab === 'customer_due' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Customer Accounts Receivable (Khata Udhaar)
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              Total Due: {formatCurrency(totalCustomerReceivables)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Credit Limit</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{c.mobile || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.address || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{formatCurrency(c.creditLimit || 5000)}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-amber-400">
                      {formatCurrency(c.currentOutstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Supplier Payables Report */}
      {activeTab === 'supplier_payable' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Supplier / Franchise Outstanding Payables
            </h3>
            <span className="text-xs text-rose-400 font-bold">
              Total Payable: {formatCurrency(totalSupplierPayables)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {suppliers.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 uppercase text-[11px] font-semibold text-slate-400">{s.network || 'All'}</td>
                    <td className="py-2.5 px-3 text-slate-300">{s.contactPerson || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{s.mobile || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-rose-400">
                      {formatCurrency(s.currentPayable)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Operating Expenses Report */}
      {activeTab === 'expenses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Operating Expenses Report
            </h3>
            <span className="text-xs text-red-400 font-bold">
              Total Overheads: {formatCurrency(filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0))}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredExpenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400">{formatShortDate(e.localDate)}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{e.expenseNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{e.category}</td>
                    <td className="py-2.5 px-3 text-slate-300">{e.description}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-400">-{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
