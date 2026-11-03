import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ExpenseCategory, PaymentMethod } from '../../types/index.ts';
import { X, Receipt } from 'lucide-react';

export const ExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    data,
    recordExpense,
    language,
    t
  } = useApp();

  const [category, setCategory] = useState<ExpenseCategory>('Shop Rent');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidFromAccountId, setPaidFromAccountId] = useState<string>('acc_cash');
  const [description, setDescription] = useState<string>('');
  const [receiptReference, setReceiptReference] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const accounts = data?.accounts || [];

  const categories: Array<{ id: ExpenseCategory; en: string; ur: string }> = [
    { id: 'Shop Rent', en: 'Shop Rent', ur: 'دکان کا کرایہ' },
    { id: 'Electricity', en: 'Electricity', ur: 'بجلی کا بل' },
    { id: 'Internet', en: 'Internet', ur: 'انٹرنیٹ خرچہ' },
    { id: 'Employee Salary', en: 'Employee Salary', ur: 'ملازم کی تنخواہ' },
    { id: 'Transport', en: 'Transport', ur: 'آمد و رفت / کرایہ' },
    { id: 'Maintenance', en: 'Maintenance', ur: 'مرمت و دیکھ بھال' },
    { id: 'Other Expenses', en: 'Other Expenses', ur: 'متفرق اخراجات' },
  ];

  if (!isExpenseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const catObj = categories.find(c => c.id === category);
    setSubmitting(true);
    try {
      const ok = await recordExpense({
        category,
        urduCategory: catObj?.ur || category,
        amount: Number(amount),
        paymentMethod,
        paidFromAccountId,
        description: description.trim(),
        receiptReference: receiptReference.trim()
      });
      if (ok) {
        setIsExpenseModalOpen(false);
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
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.recordExpense}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'کاروباری اخراجات خالص منافع پر اثر انداز ہوتے ہیں' : 'Direct operating business expenses'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'خرچے کی کیٹیگری' : 'Expense Category'}
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ur' ? `${c.ur} (${c.en})` : c.en}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ur' ? 'رقم (روپے)' : 'Amount (PKR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500">Rs.</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ur' ? 'ادائیگی کا ذریعہ' : 'Paid From Account'}
              </label>
              <select
                value={paidFromAccountId}
                onChange={e => setPaidFromAccountId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {accounts.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Bal: Rs. {a.currentBalance})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'تفصیل' : 'Description'}
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. November shop rent or office stationery"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Receipt Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'رسید / بل کا حوالہ' : 'Receipt / Voucher Reference'}
            </label>
            <input
              type="text"
              value={receiptReference}
              onChange={e => setReceiptReference(e.target.value)}
              placeholder="e.g. Bill # 98124 or Receipt slip"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0 || !description.trim()}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Saving...' : t.recordExpense}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
