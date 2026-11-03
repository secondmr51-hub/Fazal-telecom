import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { formatCurrency } from '../utils/networkUtils.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Users,
  Building2,
  Wallet
} from 'lucide-react';

export const ProfitLossPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    dateFilter
  } = useApp();

  const sales = data?.sales || [];
  const expenses = data?.expenses || [];
  const customers = data?.customers || [];
  const suppliers = data?.suppliers || [];
  const ledger = data?.ledgerEntries || [];

  // Active sales & expenses for the filtered period
  const activeSales = sales.filter((s: any) => s.status === 'completed' && isDateInRange(s.localDate));
  const activeExpenses = expenses.filter((e: any) => e.status === 'completed' && isDateInRange(e.localDate));

  // Revenue & COGS
  const grossSalesVolume = activeSales.reduce((sum: number, s: any) => sum + s.sellingPrice, 0);
  const totalDiscounts = activeSales.reduce((sum: number, s: any) => sum + s.discount, 0);
  const netSalesRevenue = grossSalesVolume - totalDiscounts;
  const totalCOGS = activeSales.reduce((sum: number, s: any) => sum + s.packagePurchaseCost, 0);
  const grossProfit = netSalesRevenue - totalCOGS;
  const grossMarginPercent = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100).toFixed(1) : '0';

  // Itemized Expenses
  const expenseCategories = [
    'Shop Rent',
    'Electricity',
    'Internet',
    'Employee Salary',
    'Transport',
    'Maintenance',
    'Other Expenses'
  ];

  const expenseBreakdown = expenseCategories.map(cat => {
    const list = activeExpenses.filter((e: any) => e.category === cat);
    const amount = list.reduce((sum: number, e: any) => sum + e.amount, 0);
    return { category: cat, amount, count: list.length };
  });

  const totalOperatingExpenses = activeExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  // Profit / Loss calculation according to strict accounting formulas:
  // Net Profit = Gross Profit - Business Expenses
  // Net Loss = Maximum of (0, -Net Profit)
  // Net Profit Display = Maximum of (0, Net Profit)
  const netProfitSigned = grossProfit - totalOperatingExpenses;
  const netProfitDisplay = Math.max(0, netProfitSigned);
  const netLossDisplay = Math.max(0, -netProfitSigned);
  const netMarginPercent = netSalesRevenue > 0 ? ((netProfitSigned / netSalesRevenue) * 100).toFixed(1) : '0';

  // Cash Flow vs Accrual Accounting
  // Actual cash received from sales in this period
  const actualCashCollectedFromSales = activeSales.reduce((sum: number, s: any) => sum + s.amountReceived, 0);
  // Actual payments made for expenses
  const actualCashPaidForExpenses = totalOperatingExpenses;
  const netOperatingCashFlow = actualCashCollectedFromSales - actualCashPaidForExpenses;

  // Balance sheet receivables and payables
  const totalReceivables = customers.reduce((sum: number, c: any) => sum + (c.currentOutstanding || 0), 0);
  const totalPayables = suppliers.reduce((sum: number, s: any) => sum + (s.currentPayable || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <span>{language === 'ur' ? 'مکمل منافع و نقصان گوشوارہ (P&L)' : 'Accurate Profit & Loss Statement'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'مجموعی منافع، مال کی لاگت، دکان کے اخراجات اور کیش فلو بمقابلہ خالص منافع کا تفصیلی جائزہ'
              : 'True financial profitability: Net Sales Revenue - COGS - Business Overheads with cash flow divergence'}
          </p>
        </div>
      </div>

      <DateFilterBar />

      {/* Top 3 High-Impact Cards: Gross Profit, Signed Result, Net Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Profit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.grossProfit}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {formatCurrency(grossProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Gross Margin: <strong className="text-white">{grossMarginPercent}%</strong>
          </div>
        </div>

        {/* Signed Net Result */}
        <div className={`p-5 rounded-3xl border shadow-sm ${
          netProfitSigned >= 0
            ? 'bg-slate-900 border-emerald-900/60 bg-gradient-to-b from-slate-900 to-emerald-950/20'
            : 'bg-slate-900 border-red-900/60 bg-gradient-to-b from-slate-900 to-red-950/20'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {netProfitSigned >= 0 ? t.netProfit : t.netLoss}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netProfitSigned >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {netProfitSigned >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${netProfitSigned >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
            {formatCurrency(netProfitSigned)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Net Margin: <strong className={netProfitSigned >= 0 ? 'text-emerald-400' : 'text-red-400'}>{netMarginPercent}%</strong>
          </div>
        </div>

        {/* Operating Cash Flow Divergence */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t.netCashFlow}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${netOperatingCashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(netOperatingCashFlow)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Liquid Inflow - Overheads Paid
          </div>
        </div>
      </div>

      {/* Itemized Profit & Loss Statement Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-white mb-1">
            {language === 'ur' ? 'نظام الاوقات و گوشوارہ حساب' : 'Standard Income Statement'}
          </h2>
          <p className="text-xs text-slate-400">
            For period: <strong className="text-white uppercase">{dateFilter}</strong>
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Revenue Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-800 font-bold text-slate-200">
              <span className="text-xs uppercase tracking-wider">1. Trading Sales Revenue</span>
              <span>{formatCurrency(netSalesRevenue)}</span>
            </div>
            <div className="pl-4 space-y-1.5 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Gross Package Selling Volume ({activeSales.length} items):</span>
                <span className="font-semibold text-white">{formatCurrency(grossSalesVolume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Customer Discounts Granted:</span>
                <span className="text-rose-400">-{formatCurrency(totalDiscounts)}</span>
              </div>
              <div className="flex items-center justify-between text-white font-semibold pt-1">
                <span>Net Sales Revenue:</span>
                <span>{formatCurrency(netSalesRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-800 font-bold text-slate-200">
              <span className="text-xs uppercase tracking-wider">2. Cost of Goods Sold (COGS)</span>
              <span className="text-rose-400">-{formatCurrency(totalCOGS)}</span>
            </div>
            <div className="pl-4 space-y-1.5 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Wholesale Package Purchase Cost:</span>
                <span className="text-rose-400">-{formatCurrency(totalCOGS)}</span>
              </div>
            </div>
          </div>

          {/* Gross Profit Subtotal */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between text-sm font-extrabold text-emerald-400">
            <span>GROSS PROFIT (Trading Margin):</span>
            <span className="text-base font-black">{formatCurrency(grossProfit)}</span>
          </div>

          {/* Business Expenses Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-800 font-bold text-slate-200">
              <span className="text-xs uppercase tracking-wider">3. Business Operating Overheads</span>
              <span className="text-rose-400">-{formatCurrency(totalOperatingExpenses)}</span>
            </div>
            <div className="pl-4 space-y-1.5 text-slate-400">
              {expenseBreakdown.map(item => (
                <div key={item.category} className="flex items-center justify-between">
                  <span>{item.category} ({item.count}):</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-white font-semibold pt-1">
                <span>Total Business Expenses:</span>
                <span className="text-rose-400">-{formatCurrency(totalOperatingExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit & Loss Grand Total */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-base font-black ${
            netProfitSigned >= 0
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}>
            <div>
              <span>NET RESULT ({netProfitSigned >= 0 ? 'NET PROFIT' : 'NET LOSS'}):</span>
              <p className="text-[11px] font-normal opacity-80 mt-0.5">
                Gross Profit ({formatCurrency(grossProfit)}) - Operating Overheads ({formatCurrency(totalOperatingExpenses)})
              </p>
            </div>
            <span className="text-xl sm:text-2xl font-black">
              {formatCurrency(netProfitSigned)}
            </span>
          </div>
        </div>
      </div>

      {/* Profit vs Cash Flow Education Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Accrual Profit vs Available Cash Flow (Section 8 Standard)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In telecommunications and retail, <strong>Net Profit</strong> measures economic value gained from completed sales regardless of whether the customer paid in cash or took the package on credit (udhaar). <strong>Cash Flow</strong>, in contrast, measures physical cash and wallet balances moving into your hands.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <span className="font-bold text-white block">Accrual Net Profit: {formatCurrency(netProfitSigned)}</span>
            <p className="text-slate-400">
              Includes credit sales recognized today. A customer who takes Rs. 500 package on credit generates profit today, even if cash arrives next week.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <span className="font-bold text-white block">Operating Cash Flow: {formatCurrency(netOperatingCashFlow)}</span>
            <p className="text-slate-400">
              Measures real liquidity collected: Rs. {actualCashCollectedFromSales} received minus Rs. {actualCashPaidForExpenses} cash expenses paid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
