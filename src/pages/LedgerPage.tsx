import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { DateFilterBar } from '../components/DateFilterBar.tsx';
import { LedgerEntry } from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const { data, language, isDateInRange } = useApp();

  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const ledgerEntries: LedgerEntry[] = data?.ledgerEntries || [];
  const accounts = data?.accounts || [];

  const filteredEntries = ledgerEntries.filter(entry => {
    if (!isDateInRange(entry.localDate)) return false;
    if (accountFilter !== 'all' && entry.accountId !== accountFilter) return false;
    if (typeFilter !== 'all' && entry.transactionType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchDesc = entry.description.toLowerCase().includes(q);
      const matchRef = (entry.reference || '').toLowerCase().includes(q);
      const matchAcc = entry.accountName.toLowerCase().includes(q);
      return matchDesc || matchRef || matchAcc;
    }
    return true;
  });

  const totalCredits = filteredEntries.filter(e => e.entryType === 'credit').reduce((s, e) => s + e.amount, 0);
  const totalDebits = filteredEntries.filter(e => e.entryType === 'debit').reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const headers = ['Date', 'Account', 'Type', 'Entry', 'Amount', 'Balance After', 'Description', 'Reference'];
    const rows = filteredEntries.map(e => [
      e.localDate,
      `"${e.accountName}"`,
      e.transactionType,
      e.entryType.toUpperCase(),
      e.amount,
      e.balanceAfter,
      `"${e.description}"`,
      `"${e.reference}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FAT_Ledger_${new Date().toISOString().substring(0, 10)}.csv`);
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
            <BookOpen className="w-6 h-6 text-blue-500" />
            <span>{language === 'ur' ? 'کھاتہ لیجر و ڈبل انٹری روزنامچہ' : 'General Transaction Ledger'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'ہر مالیاتی اندراج کی ڈبل انٹری ہسٹری، ڈیبٹ، کریڈٹ اور بیلنس ٹریسنگ'
              : 'Chronological double-entry record of all credits, debits, running balances, and audit references'}
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export CSV</span>
        </button>
      </div>

      <DateFilterBar />

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Credits (Money IN)</span>
          <span className="text-xl font-black text-emerald-400">+{formatCurrency(totalCredits)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Cash, collections, stock inflow</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Debits (Money OUT)</span>
          <span className="text-xl font-black text-red-400">-{formatCurrency(totalDebits)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Expenses, load sales, payments</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Filtered Entries</span>
          <span className="text-xl font-black text-white">{filteredEntries.length}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Balanced double-entry posts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search description, reference, account..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5"
          >
            <option value="all">All Entry Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="transfer">Transfers</option>
            <option value="expense">Expenses</option>
            <option value="customer_payment">Customer Payments</option>
            <option value="supplier_payment">Supplier Payments</option>
            <option value="reversal">Reversals</option>
            <option value="adjustment">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No ledger entries found for this selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Debit (Out)</th>
                  <th className="py-3 px-3">Credit (In)</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                      {formatShortDate(entry.localDate)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {entry.accountName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 uppercase">
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {entry.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      {entry.reference}
                    </td>
                    <td className="py-2.5 px-3 text-red-400 font-bold whitespace-nowrap">
                      {entry.entryType === 'debit' ? `-${formatCurrency(entry.amount)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold whitespace-nowrap">
                      {entry.entryType === 'credit' ? `+${formatCurrency(entry.amount)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-white whitespace-nowrap">
                      {formatCurrency(entry.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
