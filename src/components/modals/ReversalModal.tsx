import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { X, AlertOctagon, RotateCcw } from 'lucide-react';

export const ReversalModal: React.FC = () => {
  const {
    isReversalModalOpen,
    setIsReversalModalOpen,
    reversalTarget,
    setReversalTarget,
    reverseSale,
    reversePurchase,
    reverseExpense,
    language,
    t
  } = useApp();

  const [reason, setReason] = useState<string>('Customer canceled / Incorrect package entered');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isReversalModalOpen || !reversalTarget) return null;

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      let ok = false;
      if (reversalTarget.type === 'sale') {
        ok = await reverseSale(reversalTarget.id, reason.trim());
      } else if (reversalTarget.type === 'purchase') {
        ok = await reversePurchase(reversalTarget.id, reason.trim());
      } else if (reversalTarget.type === 'expense') {
        ok = await reverseExpense(reversalTarget.id, reason.trim());
      }

      if (ok) {
        setIsReversalModalOpen(false);
        setReversalTarget(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {t.confirmReversal}
              </h2>
              <p className="text-xs text-red-400">
                {reversalTarget.reference} (Rs. {reversalTarget.amount})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsReversalModalOpen(false);
              setReversalTarget(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmReversal} className="p-5 space-y-4">
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>
              {language === 'ur'
                ? 'اہم انتباہ: یہ ٹرانزیکشن خاموشی سے حذف نہیں ہوگی۔ اس کے اثرات کو لیجر میں جوابی اندراج (Compensating Ledger Entry) کے ذریعے الٹ دیا جائے گا اور آڈٹ لاگ میں محفوظ کیا جائے گا۔'
                : 'Notice: Financial history is never silently deleted. Reversing will post traceable counter-balancing ledger entries and restore account & party balances.'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'ریورس کرنے کی وجہ (لازمی)' : 'Reversal Reason (Mandatory for Audit)'}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain why this entry is being canceled/reversed..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsReversalModalOpen(false);
                setReversalTarget(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{submitting ? 'Reversing...' : t.confirm}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
