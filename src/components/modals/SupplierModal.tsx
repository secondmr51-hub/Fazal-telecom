import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TelecomNetwork } from '../../types/index.ts';
import { X, Building2 } from 'lucide-react';

export const SupplierModal: React.FC = () => {
  const {
    isSupplierModalOpen,
    setIsSupplierModalOpen,
    editingSupplier,
    setEditingSupplier,
    saveSupplier,
    language,
    t
  } = useApp();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [network, setNetwork] = useState<TelecomNetwork | ''>('');
  const [previousBalance, setPreviousBalance] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name);
      setContactPerson(editingSupplier.contactPerson || '');
      setMobile(editingSupplier.mobile);
      setNetwork(editingSupplier.network || '');
      setPreviousBalance(editingSupplier.previousBalance || 0);
      setNotes(editingSupplier.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setMobile('');
      setNetwork('');
      setPreviousBalance(0);
      setNotes('');
    }
  }, [editingSupplier, isSupplierModalOpen]);

  if (!isSupplierModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const ok = await saveSupplier({
        id: editingSupplier?.id,
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        mobile: mobile.trim(),
        network: (network as TelecomNetwork) || undefined,
        previousBalance: Number(previousBalance),
        notes: notes.trim()
      });
      if (ok) {
        setIsSupplierModalOpen(false);
        setEditingSupplier(null);
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
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingSupplier ? t.edit : t.addSupplier}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'کمپنی ڈیلر / فرنچائز کی تفصیلات' : 'Supplier / Distributor credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSupplierModalOpen(false);
              setEditingSupplier(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Supplier Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jazz Franchise Main Bazar"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="Manager Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.mobileNumber}</label>
              <input
                type="text"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="0300-1234567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Network Affiliation</label>
              <select
                value={network}
                onChange={e => setNetwork(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="">All / Multi</option>
                <option value="jazz">Jazz</option>
                <option value="zong">Zong</option>
                <option value="telenor">Telenor</option>
                <option value="ufone">Ufone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Payable</label>
              <input
                type="number"
                min="0"
                value={previousBalance}
                onChange={e => setPreviousBalance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                disabled={!!editingSupplier}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.notes}</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Terms, distributor codes"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsSupplierModalOpen(false);
                setEditingSupplier(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Saving...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
