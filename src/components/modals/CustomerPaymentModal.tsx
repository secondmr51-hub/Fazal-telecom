import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PaymentMethod } from '../../types/index.ts';
import { X, Wallet, User } from 'lucide-react';

export const CustomerPaymentModal: React.FC = () => {
  const {
    isCustomerPaymentModalOpen,
    setIsCustomerPaymentModalOpen,
    data,
    recordCustomerPayment,
    language,
    t
  } = useApp();

  const [customerId, setCustomerId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [depositedToAccountId, setDepositedToAccountId] = useState<string>('acc_cash');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const customers = data?.customers || [];
  const accounts = data?.accounts || [];
  const selectedCustomer = customers.find((c: any) => c.id === customerId);

  useEffect(() => {
    if (customers.length > 0 && !customerId) {
      const withOutstanding = customers.find((c: any) => c.currentOutstanding > 0) || customers[0];
      setCustomerId(withOutstanding.id);
      setAmount(withOutstanding.currentOutstanding || 500);
    }
  }, [customers]);

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const c = customers.find((cust: any) => cust.id === id);
    if (c) {
      setAmount(c.currentOutstanding || 0);
    }
  };

  if (!isCustomerPaymentModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || amount <= 0) return;

    setSubmitting(true);
    try {
      const ok = await recordCustomerPayment({
        customerId,
        amount: Number(amount),
        paymentMethod,
        depositedToAccountId,
        reference,
        notes
      });
      if (ok) {
        setIsCustomerPaymentModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.receivePayment}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'گاہک سے ادھار رقم کی وصولی کا اندراج' : 'Customer Credit / Udhaar Collection'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomerPaymentModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'گاہک منتخب کریں' : 'Select Customer'}
            </label>
            <select
              value={customerId}
              onChange={e => handleCustomerChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              required
            >
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile || 'No Mobile'}) - Due: Rs. {c.currentOutstanding}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{language === 'ur' ? 'موجودہ بقایا ادھار:' : 'Current Outstanding:'}</span>
                <span className="font-extrabold text-red-400">Rs. {selectedCustomer.currentOutstanding}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ur' ? 'وصول شدہ رقم (روپے)' : 'Amount Received (PKR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500">Rs.</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.paymentMethod}</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="cash">{t.cash}</option>
                <option value="jazzcash">{t.jazzcash}</option>
                <option value="easypaisa">{t.easypaisa}</option>
                <option value="bank">{t.bank}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'رقم جمع کرنے کا اکاؤنٹ' : 'Deposit To Account'}
            </label>
            <select
              value={depositedToAccountId}
              onChange={e => setDepositedToAccountId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Bal: Rs. {a.currentBalance})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.reference}</label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="Receipt / TX ID"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.notes}</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Remarks"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCustomerPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0 || !customerId}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Recording...' : t.receivePayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
