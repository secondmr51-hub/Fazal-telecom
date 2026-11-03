import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import { TelecomNetwork } from '../types/index.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  PackagePlus,
  Wallet,
  Building2,
  Users,
  CreditCard,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Signal,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    dateFilter,
    setActivePage,
    setSelectedNetwork,
    setIsSaleModalOpen,
    setIsPurchaseModalOpen,
    setIsTransferModalOpen,
    setIsExpenseModalOpen,
    setReversalTarget,
    setIsReversalModalOpen
  } = useApp();

  const sales = data?.sales || [];
  const purchases = data?.purchases || [];
  const expenses = data?.expenses || [];
  const accounts = data?.accounts || [];
  const customers = data?.customers || [];
  const suppliers = data?.suppliers || [];
  const packages = data?.packages || [];

  // Filtered lists for the active date range
  const filteredSales = sales.filter((s: any) => s.status === 'completed' && isDateInRange(s.localDate));
  const filteredPurchases = purchases.filter((p: any) => p.status === 'completed' && isDateInRange(p.localDate));
  const filteredExpenses = expenses.filter((e: any) => e.status === 'completed' && isDateInRange(e.localDate));

  // Today calculations
  const todayStr = new Date().toISOString().substring(0, 10);
  const todaySalesList = sales.filter((s: any) => s.status === 'completed' && s.localDate === todayStr);
  const todayPurchasesList = purchases.filter((p: any) => p.status === 'completed' && p.localDate === todayStr);
  const todayExpensesList = expenses.filter((e: any) => e.status === 'completed' && e.localDate === todayStr);

  const todaySalesRevenue = todaySalesList.reduce((sum: number, s: any) => sum + s.netSaleAmount, 0);
  const todayPurchasesCost = todayPurchasesList.reduce((sum: number, p: any) => sum + p.totalPurchaseCost, 0);
  const todayGrossProfit = todaySalesList.reduce((sum: number, s: any) => sum + s.grossProfit, 0);
  const todayExpensesTotal = todayExpensesList.reduce((sum: number, e: any) => sum + e.amount, 0);
  const todayNetProfitSigned = todayGrossProfit - todayExpensesTotal;
  const todayNetProfit = Math.max(0, todayNetProfitSigned);
  const todayLoss = Math.max(0, -todayNetProfitSigned);

  // Available Cash (counter drawer)
  const cashAcc = accounts.find((a: any) => a.id === 'acc_cash');
  const availableCash = cashAcc ? cashAcc.currentBalance : 0;

  // Available Digital Wallets (JazzCash, Easypaisa, Bank, Raast)
  const digitalAccounts = accounts.filter((a: any) => a.type === 'digital_wallet' || a.type === 'bank' || a.id === 'acc_other_digital');
  const availableDigital = digitalAccounts.reduce((sum: number, a: any) => sum + a.currentBalance, 0);

  // Retailer Load balances
  const retailerLoadAccounts = accounts.filter((a: any) => a.type === 'retailer_load');
  const totalRetailerLoad = retailerLoadAccounts.reduce((sum: number, a: any) => sum + a.currentBalance, 0);

  // Total Customer Receivables (Total Udhaar owed by customers)
  const totalReceivables = customers.reduce((sum: number, c: any) => sum + (c.currentOutstanding || 0), 0);

  // Total Outstanding Payables (Owed to suppliers/franchises)
  const totalPayables = suppliers.reduce((sum: number, s: any) => sum + (s.currentPayable || 0), 0);

  // Monthly Profit & Loss
  const thisMonthPrefix = todayStr.substring(0, 7);
  const monthlySalesList = sales.filter((s: any) => s.status === 'completed' && s.localDate.startsWith(thisMonthPrefix));
  const monthlyExpensesList = expenses.filter((e: any) => e.status === 'completed' && e.localDate.startsWith(thisMonthPrefix));
  const monthlyGrossProfit = monthlySalesList.reduce((sum: number, s: any) => sum + s.grossProfit, 0);
  const monthlyExpensesTotal = monthlyExpensesList.reduce((sum: number, e: any) => sum + e.amount, 0);
  const monthlyNetProfitSigned = monthlyGrossProfit - monthlyExpensesTotal;
  const monthlyNetProfit = Math.max(0, monthlyNetProfitSigned);
  const monthlyLoss = Math.max(0, -monthlyNetProfitSigned);

  // Total Business Liquid Assets = Cash + Digital + Load + Customer Receivables
  const totalLiquidAssets = availableCash + availableDigital + totalRetailerLoad + totalReceivables;

  // Active filter metrics
  const filterSalesRevenue = filteredSales.reduce((sum: number, s: any) => sum + s.netSaleAmount, 0);
  const filterGrossProfit = filteredSales.reduce((sum: number, s: any) => sum + s.grossProfit, 0);
  const filterExpensesTotal = filteredExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const filterNetProfitSigned = filterGrossProfit - filterExpensesTotal;

  // Recent 5 sales
  const recentSales = sales.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Signal className="w-3.5 h-3.5 text-blue-400" />
                {language === 'ur' ? 'فضل اعظم ٹیلی کام پاکستان' : 'Fazal Azam Telecom Pakistan'}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Live Real-Time Accounting</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {language === 'ur' ? 'ٹیلی کام بزنس و کھاتہ ڈیش بورڈ' : 'Telecom Business Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {language === 'ur'
                ? 'جاز، زونگ، ٹیلی نار اور یو فون پیکجز، سیلز، نقد اور ڈیجیٹل بیلنس، گاہک ادھار اور 100% درست منافع و نقصان'
                : 'Manage Jazz, Zong, Telenor & Ufone packages, retail sales, stock purchases, customer udhaar, and verified profit & loss.'}
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t.recordSale}</span>
            </button>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 active:scale-95 transition-all"
            >
              <PackagePlus className="w-4 h-4 text-purple-400" />
              <span>{t.recordPurchase}</span>
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 active:scale-95 transition-all"
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>{t.transferFunds}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar />

      {/* Primary KPI Grid (The 10 Required Values) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            {dateFilter === 'today'
              ? (language === 'ur' ? 'آج کے مالی حسابات (Today)' : "Today's Core Financials")
              : (language === 'ur' ? `منتخب مدت کے حسابات (${dateFilter})` : `Period Financials (${dateFilter})`)}
          </h2>
          <span className="text-xs text-slate-400">
            {language === 'ur' ? 'بغیر کسی فرضی یا تخمینی اعداد کے' : 'Exact mathematical balances'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Today's Sales */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{t.todaySales}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              {formatCurrency(todaySalesRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{todaySalesList.length} {language === 'ur' ? 'سیلز' : 'transactions'}</span>
            </div>
          </div>

          {/* 2. Today's Purchases */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{t.todayPurchases}</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <PackagePlus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              {formatCurrency(todayPurchasesCost)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{todayPurchasesList.length} {language === 'ur' ? 'اسٹاک انٹریز' : 'stock orders'}</span>
            </div>
          </div>

          {/* 3. Today's Gross Profit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{t.todayGrossProfit}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400">
              {formatCurrency(todayGrossProfit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Sales - Package Costs</span>
            </div>
          </div>

          {/* 4. Today's Net Profit */}
          <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-4 shadow-sm relative overflow-hidden bg-gradient-to-b from-slate-900 to-emerald-950/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-emerald-300">{t.todayNetProfit}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300">
              {formatCurrency(todayNetProfit)}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1">
              <span>Gross - Direct Expenses</span>
            </div>
          </div>

          {/* 5. Today's Loss */}
          <div className={`rounded-2xl p-4 shadow-sm relative overflow-hidden border ${
            todayLoss > 0
              ? 'bg-red-950/30 border-red-800 text-red-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">{t.todayLoss}</span>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-lg sm:text-xl font-extrabold ${todayLoss > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {formatCurrency(todayLoss)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{todayLoss > 0 ? 'Operating Deficit' : 'No net losses'}</span>
            </div>
          </div>
        </div>

        {/* Second Row: Balances & Receivables / Payables / Monthly */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-3">
          {/* 6. Available Cash Balance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{t.availableCash}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              {formatCurrency(availableCash)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Counter Cash Drawer</span>
            </div>
          </div>

          {/* 7. Available Digital Balance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{t.availableDigital}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white">
              {formatCurrency(availableDigital)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>JazzCash + Easypaisa + Bank</span>
            </div>
          </div>

          {/* 8. Total Customer Receivables (Udhaar) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-amber-300">{t.totalReceivables}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-300">
              {formatCurrency(totalReceivables)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Customer Khata Balances</span>
            </div>
          </div>

          {/* 9. Total Outstanding Payables */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-rose-300">{t.totalPayables}</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-rose-300">
              {formatCurrency(totalPayables)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Supplier / Dealer Due</span>
            </div>
          </div>

          {/* 10. Monthly Profit & Loss */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm bg-gradient-to-b from-slate-900 to-blue-950/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-blue-300">{t.monthlyProfitLoss}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-lg sm:text-xl font-black ${monthlyNetProfitSigned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(monthlyNetProfitSigned)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{monthlySalesList.length} sales this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Overview Cards (Jazz, Zong, Telenor, Ufone) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Signal className="w-4 h-4 text-blue-400" />
            {language === 'ur' ? 'چاروں ٹیلی کام نیٹ ورکس کا جائزہ' : 'Pakistani Telecom Networks'}
          </h2>
          <button
            onClick={() => setActivePage('networks')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>{language === 'ur' ? 'تفصیل دیکھیں' : 'View Network Hub'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(['jazz', 'zong', 'telenor', 'ufone'] as TelecomNetwork[]).map(net => {
            const meta = NETWORK_METAS[net];
            const netPackages = packages.filter((p: any) => p.network === net && p.status === 'active');
            const netTodaySales = todaySalesList.filter((s: any) => s.network === net);
            const netTodayRevenue = netTodaySales.reduce((sum: number, s: any) => sum + s.netSaleAmount, 0);
            const netLoadAcc = accounts.find((a: any) => a.network === net && a.type === 'retailer_load');
            const loadBalance = netLoadAcc ? netLoadAcc.currentBalance : 0;

            return (
              <div
                key={net}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
                        style={{ backgroundColor: meta.themeColor }}
                      >
                        {meta.name.substring(0, 1)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {language === 'ur' ? meta.urduName : meta.name}
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          {netPackages.length} {language === 'ur' ? 'پیکجز فعال' : 'active packages'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNetwork(net);
                        setActivePage('networks');
                      }}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      title="Manage Packages"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ur' ? 'لوڈ بیلنس:' : 'Retailer Load:'}</span>
                      <span className="font-bold text-white">{formatCurrency(loadBalance)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{language === 'ur' ? 'آج کی فروخت:' : "Today's Sales:"}</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(netTodayRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedNetwork(net);
                      setIsSaleModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sale</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNetwork(net);
                      setIsPurchaseModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Stock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions & Audit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Sales Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              {language === 'ur' ? 'حالیہ فروخت ٹرانزیکشنز' : 'Recent Package Sales'}
            </h3>
            <button
              onClick={() => setActivePage('sales')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>{language === 'ur' ? 'تمام سیلز دیکھیں' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>{language === 'ur' ? 'ابھی تک کوئی سیلز درج نہیں ہوئیں۔' : 'No sales recorded yet. Click "Record Sale" to start!'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentSales.map((sale: any) => {
                const meta = NETWORK_METAS[sale.network as TelecomNetwork] || NETWORK_METAS.jazz;
                const isReversed = sale.status === 'reversed';

                return (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ backgroundColor: meta.themeColor }}
                      >
                        {meta.name.substring(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isReversed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {sale.packageName}
                          </span>
                          {isReversed && (
                            <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded">
                              REVERSED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {sale.customerName} {sale.customerMobile ? `• ${sale.customerMobile}` : ''} • {formatShortDate(sale.localDate)} {sale.localTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`font-bold ${isReversed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {formatCurrency(sale.netSaleAmount)}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          +{formatCurrency(sale.netProfit)} profit
                        </div>
                      </div>

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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Reverse this sale"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Financial Health & Quick Verification */}
        <div className="space-y-4">
          {/* Quick Balance Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {language === 'ur' ? 'کل کاروباری لیکویڈیٹی' : 'Total Business Liquidity'}
            </h3>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 mb-1">{t.totalAssets}</div>
              <div className="text-2xl font-black text-white">{formatCurrency(totalLiquidAssets)}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cash + Wallets + Load + Udhaar</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Counter Cash:</span>
                <span className="font-semibold text-white">{formatCurrency(availableCash)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Digital Wallets & Bank:</span>
                <span className="font-semibold text-white">{formatCurrency(availableDigital)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Retailer SIM Load:</span>
                <span className="font-semibold text-white">{formatCurrency(totalRetailerLoad)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Customer Udhaar:</span>
                <span className="font-semibold text-amber-400">{formatCurrency(totalReceivables)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-slate-400">
                <span>Supplier Payables:</span>
                <span className="font-semibold text-rose-400">-{formatCurrency(totalPayables)}</span>
              </div>
            </div>

            <button
              onClick={() => setActivePage('profit_loss')}
              className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'مکمل منافع و نقصان رپورٹ' : 'View Full P&L Statement'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
