import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TelecomNetwork, PaymentMethod } from '../../types/index.ts';
import { NETWORK_METAS } from '../../utils/networkUtils.ts';
import { X, PackagePlus, Building2 } from 'lucide-react';

export const PurchaseModal: React.FC = () => {
  const {
    isPurchaseModalOpen,
    setIsPurchaseModalOpen,
    data,
    recordPurchase,
    language,
    t
  } = useApp();

  const [network, setNetwork] = useState<TelecomNetwork>('jazz');
  const [packageName, setPackageName] = useState<string>('Jazz Easyload Bulk Stock');
  const [supplierId, setSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(1000);
  const [amountPaid, setAmountPaid] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidFromAccountId, setPaidFromAccountId] = useState<string>('acc_cash');
  const [creditedToAccountId, setCreditedToAccountId] = useState<string>('acc_jazz_load');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const suppliers = data?.suppliers || [];
  const accounts = data?.accounts || [];

  useEffect(() => {
    // When network changes, update default load account and sample name
    const netLoadAcc = accounts.find((a: any) => a.network === network && a.type === 'retailer_load');
    if (netLoadAcc) setCreditedToAccountId(netLoadAcc.id);
    setPackageName(`${NETWORK_METAS[network].name} Retailer Load / SIM Stock`);
    // Check if supplier exists for this network
    const netSup = suppliers.find((s: any) => s.network === network);
    if (netSup) {
      setSupplierId(netSup.id);
      setSupplierName(netSup.name);
    }
  }, [network, accounts, suppliers]);

  const totalCost = (quantity || 1) * (unitCost || 0);
  const remainingPayable = Math.max(0, totalCost - (amountPaid || 0));

  if (!isPurchaseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    setSubmitting(true);
    try {
      const ok = await recordPurchase({
        network,
        packageName,
        supplierId: supplierId || undefined,
        supplierName: supplierName.trim(),
        quantity: Number(quantity),
        unitPurchaseCost: Number(unitCost),
        amountPaid: Number(amountPaid),
        paymentMethod,
        paidFromAccountId,
        creditedToAccountId,
        reference,
        notes
      });
      if (ok) {
        setIsPurchaseModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.recordPurchase}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'ریٹیلر لوڈ اور اسٹاک خریداری کا اندراج' : 'Retailer Load & Stock Inflow'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPurchaseModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Network Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'ur' ? 'نیٹ ورک کا انتخاب' : 'Select Network'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['jazz', 'zong', 'telenor', 'ufone'] as TelecomNetwork[]).map(net => {
                const meta = NETWORK_METAS[net];
                const isSelected = network === net;
                return (
                  <button
                    type="button"
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? `bg-slate-800 text-white shadow-md ${meta.borderColor} border-2`
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{language === 'ur' ? meta.urduName : meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                {language === 'ur' ? 'سپلائر / ڈیلر' : 'Supplier / Franchise'}
              </span>
              {suppliers.length > 0 && (
                <select
                  value={supplierId}
                  onChange={e => {
                    const id = e.target.value;
                    setSupplierId(id);
                    const s = suppliers.find((sup: any) => sup.id === id);
                    if (s) setSupplierName(s.name);
                  }}
                  className="bg-slate-800 text-slate-300 text-[11px] border border-slate-700 rounded-lg px-2 py-1"
                >
                  <option value="">{language === 'ur' ? '-- سپلائر منتخب کریں --' : '-- Select Supplier --'}</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Payable: Rs. {s.currentPayable})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                placeholder="e.g. Jazz Franchise or Local Stockist"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Stock Item & Costing */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Stock Description / Bundle</label>
              <input
                type="text"
                value={packageName}
                onChange={e => setPackageName(e.target.value)}
                placeholder="e.g. Easyload Top-up or Scratch Cards"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Unit Cost (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={unitCost}
                  onChange={e => {
                    const u = Number(e.target.value);
                    setUnitCost(u);
                    setAmountPaid(quantity * u);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Total Cost</label>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center h-[34px]">
                  Rs. {totalCost}
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Accounts */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {language === 'ur' ? 'ادائیگی اور کھاتہ' : 'Payment Settlement'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.paymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="cash">{t.cash}</option>
                  <option value="bank">{t.bank}</option>
                  <option value="jazzcash">{t.jazzcash}</option>
                  <option value="easypaisa">{t.easypaisa}</option>
                  <option value="credit">Credit / Payable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Amount Paid (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  max={totalCost}
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Remaining Payable</label>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center h-[34px] ${
                  remainingPayable > 0 ? 'bg-red-950/40 border-red-500/40 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  Rs. {remainingPayable}
                </div>
              </div>
            </div>

            {/* Account Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'ur' ? 'ادائیگی کا ذریعہ' : 'Paid From Account'}
                </label>
                <select
                  value={paidFromAccountId}
                  onChange={e => setPaidFromAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Bal: Rs. {a.currentBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'ur' ? 'اسٹاک وصول کرنے والا ریٹیلر اکاؤنٹ' : 'Credit Stock To Load Account'}
                </label>
                <select
                  value={creditedToAccountId}
                  onChange={e => setCreditedToAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Bal: Rs. {a.currentBalance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.reference}</label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="Invoice or Receipt #"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.notes}</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional supplier notes"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !supplierName}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Recording...' : t.recordPurchase}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
