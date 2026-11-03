import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Account, LedgerEntry } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Building,
  Radio,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const {
    data,
    language,
    t,
    setIsTransferModalOpen,
    adjustAccountBalance
  } = useApp();

  const accounts: Account[] = data?.accounts || [];
  const ledgerEntries: LedgerEntry[] = data?.ledgerEntries || [];

  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_cash');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustAccountId, setAdjustAccountId] = useState('');
  const [newAdjustBalance, setNewAdjustBalance] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  // Ledger for selected account
  const accountLedger = ledgerEntries.filter(l => l.accountId === selectedAccountId);

  // Totals for selected account
  const totalCredits = accountLedger.filter(l => l.entryType === 'credit').reduce((s, l) => s + l.amount, 0);
  const totalDebits = accountLedger.filter(l => l.entryType === 'debit').reduce((s, l) => s + l.amount, 0);

  // Overall totals
  const totalCash = accounts.filter(a => a.type === 'cash').reduce((s, a) => s + a.currentBalance, 0);
  const totalWallets = accounts.filter(a => a.type === 'digital_wallet' || a.type === 'bank' || a.id === 'acc_other_digital').reduce((s, a) => s + a.currentBalance, 0);
  const totalRetailerLoad = accounts.filter(a => a.type === 'retailer_load').reduce((s, a) => s + a.currentBalance, 0);
  const totalAllAccounts = accounts.reduce((s, a) => s + a.currentBalance, 0);

  const handleOpenAdjust = (acc: Account) => {
    setAdjustAccountId(acc.id);
    setNewAdjustBalance(acc.currentBalance);
    setAdjustReason('Physical cash count discrepancy / Reconciliation');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAccountId || !adjustReason.trim()) return;

    setAdjusting(true);
    try {
      const ok = await adjustAccountBalance(adjustAccountId, Number(newAdjustBalance), adjustReason.trim());
      if (ok) {
        setIsAdjustModalOpen(false);
      }
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-blue-500" />
            <span>{language === 'ur' ? 'کیش و ڈیجیٹل بیلنس اکاؤنٹس' : 'Cash & Digital Balance Accounts'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'نقد دراز، جاز کیش، ایزی پیسہ، بینک، اور چاروں کمپنیوں کے ریٹیلر سم لوڈ بیلنس کا حساب'
              : 'Counter cash, JazzCash, Easypaisa, Bank, and retailer SIM load balances with double-entry ledger'}
          </p>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{t.transferFunds}</span>
        </button>
      </div>

      {/* Aggregate Overview Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Counter Cash</span>
          <span className="text-lg sm:text-2xl font-black text-white">{formatCurrency(totalCash)}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Cash In Hand</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Digital Wallets & Bank</span>
          <span className="text-lg sm:text-2xl font-black text-blue-400">{formatCurrency(totalWallets)}</span>
          <span className="text-[10px] text-blue-400/80 block mt-1">JazzCash + Easypaisa + Bank</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Retailer SIM Load Balance</span>
          <span className="text-lg sm:text-2xl font-black text-purple-400">{formatCurrency(totalRetailerLoad)}</span>
          <span className="text-[10px] text-purple-400/80 block mt-1">Jazz, Zong, Telenor, Ufone</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl bg-gradient-to-b from-slate-900 to-blue-950/20">
          <span className="text-[11px] font-semibold text-slate-300 block mb-1">Total Liquid Account Funds</span>
          <span className="text-lg sm:text-2xl font-black text-emerald-400">{formatCurrency(totalAllAccounts)}</span>
          <span className="text-[10px] text-slate-400 block mt-1">9 Managed Accounts</span>
        </div>
      </div>

      {/* Grid of All 9 Accounts */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          All Managed Balance Accounts (Click to inspect ledger)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {accounts.map(acc => {
            const isSelected = selectedAccountId === acc.id;
            const isLoad = acc.type === 'retailer_load';
            const meta = acc.network ? NETWORK_METAS[acc.network] : null;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`bg-slate-900 border rounded-3xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                      {acc.type === 'cash' ? <Wallet className="w-4 h-4 text-emerald-400" /> :
                       acc.type === 'bank' ? <Building className="w-4 h-4 text-blue-400" /> :
                       acc.type === 'digital_wallet' ? <CreditCard className="w-4 h-4 text-amber-400" /> :
                       <Radio className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm">
                        {language === 'ur' && acc.urduName ? acc.urduName : acc.name}
                      </h3>
                      {acc.accountNumber && (
                        <p className="text-[10px] font-mono text-slate-500">{acc.accountNumber}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAdjust(acc);
                    }}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    title="Audit Adjust Balance"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">{t.balance}:</span>
                  <span className={`text-base font-extrabold ${
                    acc.currentBalance < 0 ? 'text-red-400' : 'text-white'
                  }`}>
                    {formatCurrency(acc.currentBalance)}
                  </span>
                </div>

                {acc.currentBalance < 0 && (
                  <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Negative Balance Warning</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Account Dedicated Ledger View */}
      {selectedAccount && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {selectedAccount.name} — Transaction Ledger
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                  {selectedAccount.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Opening Balance: {formatCurrency(selectedAccount.openingBalance)} • Current Balance: <strong className="text-white">{formatCurrency(selectedAccount.currentBalance)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400">Total Credits: +{formatCurrency(totalCredits)}</span>
              <span className="text-red-400">Total Debits: -{formatCurrency(totalDebits)}</span>
            </div>
          </div>

          {accountLedger.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No transactions recorded for this account yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Debit (Out)</th>
                    <th className="py-2.5 px-3">Credit (In)</th>
                    <th className="py-2.5 px-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {accountLedger.slice(0, 25).map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {formatShortDate(l.localDate || l.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 uppercase">
                          {l.transactionType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-medium">
                        {l.description}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {l.reference}
                      </td>
                      <td className="py-2.5 px-3 text-red-400 font-bold whitespace-nowrap">
                        {l.entryType === 'debit' ? `-${formatCurrency(l.amount)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold whitespace-nowrap">
                        {l.entryType === 'credit' ? `+${formatCurrency(l.amount)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                        {formatCurrency(l.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Balance Adjust Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">{t.adjustBalance}</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              <div className="text-xs text-slate-400">
                Adjusting balance will generate a permanent, traceable ledger entry explaining the adjustment amount.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Exact Balance (Rs.)</label>
                <input
                  type="number"
                  value={newAdjustBalance}
                  onChange={e => setNewAdjustBalance(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Reason / Justification</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Daily drawer physical recount difference"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !adjustReason.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {adjusting ? 'Adjusting...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
