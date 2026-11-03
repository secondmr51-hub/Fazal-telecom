import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { Expense } from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  Receipt,
  Plus,
  Search,
  RotateCcw,
  Download,
  Building,
  Zap,
  Wifi,
  Users,
  Car,
  Wrench,
  HelpCircle
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const {
    data,
    language,
    t,
    isDateInRange,
    setIsExpenseModalOpen,
    setReversalTarget,
    setIsReversalModalOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const expenses: Expense[] = data?.expenses || [];
  const accounts = data?.accounts || [];

  const filteredExpenses = expenses.filter(e => {
    if (!isDateInRange(e.localDate)) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = e.expenseNumber.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q);
      const matchRef = (e.receiptReference || '').toLowerCase().includes(q);
      return matchNum || matchDesc || matchCat || matchRef;
    }
    return true;
  });

  const activeExpenses = filteredExpenses.filter(e => e.status === 'completed');
  const totalAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category icons helper
  const getCatIcon = (cat: string) => {
    switch (cat) {
      case 'Shop Rent': return <Building className="w-4 h-4 text-amber-400" />;
      case 'Electricity': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Internet': return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'Employee Salary': return <Users className="w-4 h-4 text-blue-400" />;
      case 'Transport': return <Car className="w-4 h-4 text-purple-400" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-emerald-400" />;
      default: return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const exportCSV = () => {
    const headers = ['Expense #', 'Date', 'Category', 'Description', 'Amount', 'Paid From', 'Receipt Reference', 'Status'];
    const rows = filteredExpenses.map(e => [
      e.expenseNumber,
      e.localDate,
      `"${e.category}"`,
      `"${e.description}"`,
      e.amount,
      e.paidFromAccountId,
      `"${e.receiptReference || ''}"`,
      e.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FAT_Expenses_Report_${new Date().toISOString().substring(0, 10)}.csv`);
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
            <Receipt className="w-6 h-6 text-red-500" />
            <span>{language === 'ur' ? 'کاروباری اخراجات (Expenses)' : 'Business Operating Expenses'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'دکان کا کرایہ، بجلی کا بل، ملازمین کی تنخواہ اور دیگر اخراجات جو خالص منافع پر اثر انداز ہوتے ہیں'
              : 'Direct shop overheads: rent, electricity, staff salary, internet, and maintenance affecting net profit'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-red-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.recordExpense}</span>
          </button>
        </div>
      </div>

      <DateFilterBar />

      {/* Aggregate Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Operating Expenses</span>
          <span className="text-2xl font-black text-red-400">{formatCurrency(totalAmount)}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{activeExpenses.length} recorded vouchers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl sm:col-span-2 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span className="text-white font-bold block mb-1">Impact on Business Profitability:</span>
            <p className="max-w-md">
              Only genuine shop operating expenses deduct from Gross Profit to compute final Net Profit. Stock purchases are asset conversions and do not count as duplicate overhead.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search description, voucher #, receipt..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 w-full sm:w-auto"
        >
          <option value="all">All Expense Categories</option>
          <option value="Shop Rent">Shop Rent (کرایہ)</option>
          <option value="Electricity">Electricity (بجلی)</option>
          <option value="Internet">Internet (انٹرنیٹ)</option>
          <option value="Employee Salary">Employee Salary (تنخواہ)</option>
          <option value="Transport">Transport (کرایہ آمدورفت)</option>
          <option value="Maintenance">Maintenance (دیکھ بھال)</option>
          <option value="Other Expenses">Other Expenses (دیگر)</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No expense vouchers found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Voucher #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Receipt / Ref</th>
                  <th className="py-3 px-3">Paid From</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredExpenses.map(expense => {
                  const isReversed = expense.status === 'reversed';
                  const paidAcc = accounts.find((a: any) => a.id === expense.paidFromAccountId);

                  return (
                    <tr key={expense.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                        {expense.expenseNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {formatShortDate(expense.localDate)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          {getCatIcon(expense.category)}
                          <span>{language === 'ur' && expense.urduCategory ? expense.urduCategory : expense.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-medium">
                        {expense.description}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {expense.receiptReference || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {paidAcc ? paidAcc.name : expense.paidFromAccountId}
                      </td>
                      <td className="py-3 px-3 font-bold text-red-400 whitespace-nowrap">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isReversed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/50">
                            REVERSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                            POSTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isReversed && (
                          <button
                            onClick={() => {
                              setReversalTarget({
                                type: 'expense',
                                id: expense.id,
                                reference: expense.expenseNumber,
                                amount: expense.amount
                              });
                              setIsReversalModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title="Reverse Expense"
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
