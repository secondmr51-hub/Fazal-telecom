import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TelecomNetwork, TelecomPackage, PaymentMethod } from '../../types/index.ts';
import { NETWORK_METAS, formatCurrency } from '../../utils/networkUtils.ts';
import {
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  User,
  Phone,
  Tag,
  CreditCard,
  Building,
  Sparkles
} from 'lucide-react';

export const SaleModal: React.FC = () => {
  const {
    isSaleModalOpen,
    setIsSaleModalOpen,
    data,
    recordSale,
    language,
    t
  } = useApp();

  const [network, setNetwork] = useState<TelecomNetwork>('jazz');
  const [packageId, setPackageId] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<TelecomPackage | null>(null);

  // Customer info
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');

  // Pricing & Accounting
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [allocatedExpense, setAllocatedExpense] = useState<number>(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [depositAccountId, setDepositAccountId] = useState<string>('acc_cash');
  const [loadAccountId, setLoadAccountId] = useState<string>('');

  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const packages: TelecomPackage[] = data?.packages || [];
  const networkPackages = packages.filter(p => p.network === network && p.status === 'active');
  const customers = data?.customers || [];
  const accounts = data?.accounts || [];

  // Reset or select default package when network changes
  useEffect(() => {
    const available = packages.filter(p => p.network === network && p.status === 'active');
    if (available.length > 0) {
      handleSelectPackage(available[0]);
    } else {
      setSelectedPackage(null);
      setPackageId('');
      setPurchaseCost(0);
      setSellingPrice(0);
      setAmountReceived(0);
    }

    // Set default load account for this network
    const netLoadAcc = accounts.find((a: any) => a.network === network && a.type === 'retailer_load');
    if (netLoadAcc) {
      setLoadAccountId(netLoadAcc.id);
    }
  }, [network, packages]);

  const handleSelectPackage = (pkg: TelecomPackage) => {
    setSelectedPackage(pkg);
    setPackageId(pkg.id);
    setPurchaseCost(pkg.purchaseCost);
    setSellingPrice(pkg.sellingPrice);
    setDiscount(0);
    setAmountReceived(pkg.sellingPrice);
  };

  // When customer chosen from dropdown
  const handleSelectCustomer = (id: string) => {
    setCustomerId(id);
    if (!id) {
      setCustomerName('');
      setCustomerMobile('');
      return;
    }
    const cust = customers.find((c: any) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerMobile(cust.mobile);
    }
  };

  // Calculations
  const netSaleAmount = Math.max(0, sellingPrice - (discount || 0));
  const outstandingAmount = Math.max(0, netSaleAmount - (amountReceived || 0));
  const grossProfit = netSaleAmount - purchaseCost;
  const netProfit = grossProfit - (allocatedExpense || 0);

  // Check duplicate sales in last 2 mins
  useEffect(() => {
    if (!customerMobile || !packageId || !data?.sales) {
      setDuplicateWarning(null);
      return;
    }
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const dup = data.sales.find((s: any) =>
      s.customerMobile === customerMobile &&
      s.packageId === packageId &&
      s.status === 'completed' &&
      new Date(s.dateTime).getTime() > twoMinutesAgo
    );
    if (dup) {
      setDuplicateWarning(
        language === 'ur'
          ? `انتباہ: اسی گاہک کو پچھلے 2 منٹ میں یہی پیکج (${dup.packageName}) فروخت کیا گیا ہے!`
          : `Warning: A sale for this exact package was recorded for this customer in the last 2 minutes!`
      );
    } else {
      setDuplicateWarning(null);
    }
  }, [customerMobile, packageId, data]);

  // Adjust deposit account based on payment method
  useEffect(() => {
    if (paymentMethod === 'jazzcash') setDepositAccountId('acc_jazzcash');
    else if (paymentMethod === 'easypaisa') setDepositAccountId('acc_easypaisa');
    else if (paymentMethod === 'bank') setDepositAccountId('acc_bank');
    else setDepositAccountId('acc_cash');
  }, [paymentMethod]);

  if (!isSaleModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId || !selectedPackage) return;

    setSubmitting(true);
    try {
      const ok = await recordSale({
        network,
        packageId,
        packageName: selectedPackage.name,
        customerId: customerId || undefined,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerMobile: customerMobile.trim(),
        packagePurchaseCost: Number(purchaseCost),
        sellingPrice: Number(sellingPrice),
        discount: Number(discount || 0),
        paymentMethod,
        amountReceived: Number(amountReceived),
        loadDeductedFromAccountId: loadAccountId,
        paymentDepositedToAccountId: depositAccountId,
        allocatedExpense: Number(allocatedExpense || 0),
        reference,
        notes
      });
      if (ok) {
        setIsSaleModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLoadAcc = accounts.find((a: any) => a.id === loadAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.recordSale}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'حقیقی مالی کھاتے اور منافع کے ساتھ' : 'Accurate Accounting & Immediate Profit Calculation'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSaleModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {duplicateWarning && (
            <div className="p-3 bg-amber-950/60 border border-amber-600/50 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Network Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'ur' ? 'نیٹ ورک کا انتخاب کریں' : '1. Select Network'}
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
                        ? `bg-slate-800 text-white shadow-md ${meta.borderColor} border-2 ring-2 ring-blue-500/20`
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.themeColor }} />
                      <span>{language === 'ur' ? meta.urduName : meta.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Package Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {language === 'ur' ? 'پیکج منتخب کریں' : '2. Select Package'}
              </label>
              <select
                value={packageId}
                onChange={e => {
                  const pkg = networkPackages.find(p => p.id === e.target.value);
                  if (pkg) handleSelectPackage(pkg);
                }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              >
                {networkPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.duration}) - Sell: Rs. {pkg.sellingPrice} | Cost: Rs. {pkg.purchaseCost}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Package Details Pill */}
            {selectedPackage && (
              <div className="sm:col-span-2 bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{selectedPackage.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                    {selectedPackage.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                    Code: {selectedPackage.activationCode || 'Direct Load'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Data: <span className="text-white font-medium">{selectedPackage.internetData || 'N/A'}</span> | Mins: <span className="text-white font-medium">{selectedPackage.onNetMinutes || '0'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer info */}
          <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {language === 'ur' ? 'گاہک کی معلومات (اختیاری)' : 'Customer Details (Optional)'}
              </span>
              {customers.length > 0 && (
                <select
                  value={customerId}
                  onChange={e => handleSelectCustomer(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-[11px] border border-slate-700 rounded-lg px-2 py-1"
                >
                  <option value="">{language === 'ur' ? '-- موجودہ گاہک منتخب کریں --' : '-- Choose Existing Customer --'}</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile}) - Due: Rs. {c.currentOutstanding}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.customer}</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in or Ali Khan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.mobileNumber}</label>
                <input
                  type="text"
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Accurate Accounting Section */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {language === 'ur' ? 'قیمت اور منافع کا درست حساب' : 'Price & Profit Calculation'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.purchaseCost}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={purchaseCost}
                    onChange={e => setPurchaseCost(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.sellingPrice}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={e => {
                      const sp = Number(e.target.value);
                      setSellingPrice(sp);
                      setAmountReceived(Math.max(0, sp - discount));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.discount}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={e => {
                      const d = Number(e.target.value);
                      setDiscount(d);
                      setAmountReceived(Math.max(0, sellingPrice - d));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Net Sale</label>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-white flex items-center h-[34px]">
                  Rs. {netSaleAmount}
                </div>
              </div>
            </div>

            {/* Profit Live Breakdown Banner */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                grossProfit >= 0 ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300' : 'bg-red-950/40 border-red-600/40 text-red-300'
              }`}>
                <span className="text-[11px] font-semibold">{t.grossProfit}:</span>
                <span className="text-sm font-extrabold flex items-center gap-1">
                  {grossProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  Rs. {grossProfit}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                netProfit >= 0 ? 'bg-blue-950/40 border-blue-600/40 text-blue-300' : 'bg-red-950/40 border-red-600/40 text-red-300'
              }`}>
                <span className="text-[11px] font-semibold">{t.netProfit}:</span>
                <span className="text-sm font-extrabold">
                  Rs. {netProfit}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Collection Details */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {language === 'ur' ? 'ادائیگی اور وصولی کی تفصیل' : 'Payment & Account Details'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.paymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="cash">{t.cash}</option>
                  <option value="jazzcash">{t.jazzcash}</option>
                  <option value="easypaisa">{t.easypaisa}</option>
                  <option value="bank">{t.bank}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.amountReceived}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    max={netSaleAmount}
                    value={amountReceived}
                    onChange={e => setAmountReceived(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.outstanding}</label>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center h-[34px] ${
                  outstandingAmount > 0 ? 'bg-red-950/40 border-red-500/40 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  Rs. {outstandingAmount}
                </div>
              </div>
            </div>

            {/* Account Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'ur' ? 'اسٹاک لوڈ کٹوتی اکاؤنٹ' : 'Deduct Stock From Load Account'}
                </label>
                <select
                  value={loadAccountId}
                  onChange={e => setLoadAccountId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Bal: Rs. {a.currentBalance})
                    </option>
                  ))}
                </select>
                {selectedLoadAcc && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Available: <span className="text-emerald-400 font-semibold">Rs. {selectedLoadAcc.currentBalance}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'ur' ? 'وصول شدہ رقم جمع کرنے کا اکاؤنٹ' : 'Deposit Received Cash/Funds Into'}
                </label>
                <select
                  value={depositAccountId}
                  onChange={e => setDepositAccountId(e.target.value)}
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
                placeholder="TRX-12345 or Slip #"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.notes}</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional comments"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsSaleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !packageId}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Recording...' : t.recordSale}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
