import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';

export const TransferModal: React.FC = () => {
  const {
    isTransferModalOpen,
    setIsTransferModalOpen,
    data,
    recordTransfer,
    language,
    t
  } = useApp();

  const [fromAccountId, setFromAccountId] = useState<string>('acc_cash');
  const [toAccountId, setToAccountId] = useState<string>('acc_jazzcash');
  const [amount, setAmount] = useState<number>(1000);
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const accounts = data?.accounts || [];
  const fromAccount = accounts.find((a: any) => a.id === fromAccountId);

  if (!isTransferModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fromAccountId === toAccountId) {
      setErrorMsg(language === 'ur' ? 'ایک ہی اکاؤنٹ میں منتقلی ممکن نہیں ہے۔' : 'Cannot transfer to the same account.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg(language === 'ur' ? 'رقم صفر سے زیادہ ہونی چاہیے۔' : 'Transfer amount must be greater than zero.');
      return;
    }

    if (fromAccount && !fromAccount.allowNegative && fromAccount.currentBalance < amount) {
      setErrorMsg(
        language === 'ur'
          ? `${fromAccount.name} میں مطلوبہ بیلنس موجود نہیں ہے۔ (موجودہ بیلنس: Rs. ${fromAccount.currentBalance})`
          : `Insufficient funds in ${fromAccount.name}. (Available: Rs. ${fromAccount.currentBalance})`
      );
      return;
    }

    setSubmitting(true);
    try {
      const ok = await recordTransfer({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        reference,
        notes
      });
      if (ok) {
        setIsTransferModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.transferFunds}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'اندرونی منتقلی سے کل اثاثے غیر تبدیل شدہ رہتے ہیں' : 'Internal transfers preserve total business assets'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* From Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'کس اکاؤنٹ سے رقم نکالنی ہے؟' : 'Transfer From (Source Account)'}
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Balance: Rs. {a.currentBalance})
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'کس اکاؤنٹ میں رقم منتقل کرنی ہے؟' : 'Transfer To (Destination Account)'}
            </label>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Balance: Rs. {a.currentBalance})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'منتقلی کی رقم (روپے)' : 'Amount (PKR)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-500">Rs.</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.reference}</label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="TRF-001"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.notes}</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Reason or notes"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Invariance Accounting Note */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
            ℹ️ {language === 'ur' ? 'مثال کے طور پر: نقد رقم سے 1000 جاز کیش میں منتقل کرنے سے نقد 1000 کم اور جاز کیش 1000 زیادہ ہوگا، یہ آمدن یا خرچ میں شمار نہیں ہوگا۔' : 'Notice: Transferring Rs. 1,000 from cash to wallet will reduce cash by Rs. 1,000 and increase wallet by Rs. 1,000 without affecting net profit or revenue.'}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0}
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Transferring...' : t.transferFunds}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
