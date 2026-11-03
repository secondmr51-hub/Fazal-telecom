import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Customer } from '../../types/index.ts';
import { X, UserPlus } from 'lucide-react';

export const CustomerModal: React.FC = () => {
  const {
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    editingCustomer,
    setEditingCustomer,
    saveCustomer,
    language,
    t
  } = useApp();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState(5000);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setMobile(editingCustomer.mobile);
      setAddress(editingCustomer.address || '');
      setCreditLimit(editingCustomer.creditLimit || 5000);
      setPreviousBalance(editingCustomer.previousBalance || 0);
      setNotes(editingCustomer.notes || '');
    } else {
      setName('');
      setMobile('');
      setAddress('');
      setCreditLimit(5000);
      setPreviousBalance(0);
      setNotes('');
    }
  }, [editingCustomer, isCustomerModalOpen]);

  if (!isCustomerModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const ok = await saveCustomer({
        id: editingCustomer?.id,
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        creditLimit: Number(creditLimit),
        previousBalance: Number(previousBalance),
        notes: notes.trim()
      });
      if (ok) {
        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingCustomer ? t.edit : t.addCustomer}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'گاہک کا نام، موبائل اور ادھار کھاتہ' : 'Customer profile & credit ledger'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCustomerModalOpen(false);
              setEditingCustomer(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.customer}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Haji Muhammad Tariq"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.mobileNumber}</label>
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="0300-1234567"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'ur' ? 'پتہ / دکان' : 'Address / Shop Location'}
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Shop # 3, Main Market"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {language === 'ur' ? 'سابقہ بقایا رقم' : 'Opening Udhaar'}
              </label>
              <input
                type="number"
                min="0"
                value={previousBalance}
                onChange={e => setPreviousBalance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                disabled={!!editingCustomer}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Credit Limit (Rs.)</label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={e => setCreditLimit(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.notes}</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsCustomerModalOpen(false);
                setEditingCustomer(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Saving...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
