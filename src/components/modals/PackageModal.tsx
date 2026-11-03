import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { TelecomPackage, TelecomNetwork, PackageDuration, PackageCategory } from '../../types/index.ts';
import { NETWORK_METAS } from '../../utils/networkUtils.ts';
import { X, Layers, CheckCircle2 } from 'lucide-react';

export const PackageModal: React.FC = () => {
  const {
    isPackageModalOpen,
    setIsPackageModalOpen,
    editingPackage,
    setEditingPackage,
    savePackage,
    language,
    t
  } = useApp();

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [network, setNetwork] = useState<TelecomNetwork>('jazz');
  const [duration, setDuration] = useState<PackageDuration>('7 Days');
  const [category, setCategory] = useState<PackageCategory>('All-in-One');
  const [activationCode, setActivationCode] = useState('');
  const [officialPrice, setOfficialPrice] = useState<number>(0);
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [urduDescription, setUrduDescription] = useState('');
  const [internetData, setInternetData] = useState('');
  const [onNetMinutes, setOnNetMinutes] = useState('');
  const [offNetMinutes, setOffNetMinutes] = useState('');
  const [sms, setSms] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPackage) {
      setName(editingPackage.name);
      setUrduName(editingPackage.urduName || '');
      setNetwork(editingPackage.network);
      setDuration(editingPackage.duration);
      setCategory(editingPackage.category);
      setActivationCode(editingPackage.activationCode);
      setOfficialPrice(editingPackage.officialPrice);
      setPurchaseCost(editingPackage.purchaseCost);
      setSellingPrice(editingPackage.sellingPrice);
      setDescription(editingPackage.description);
      setUrduDescription(editingPackage.urduDescription || '');
      setInternetData(editingPackage.internetData);
      setOnNetMinutes(editingPackage.onNetMinutes);
      setOffNetMinutes(editingPackage.offNetMinutes);
      setSms(editingPackage.sms);
      setIsVerified(editingPackage.isVerified);
      setStatus(editingPackage.status);
    } else {
      setName('');
      setUrduName('');
      setNetwork('jazz');
      setDuration('7 Days');
      setCategory('All-in-One');
      setActivationCode('*000#');
      setOfficialPrice(300);
      setPurchaseCost(270);
      setSellingPrice(300);
      setDescription('');
      setUrduDescription('');
      setInternetData('10 GB');
      setOnNetMinutes('1000');
      setOffNetMinutes('100');
      setSms('1000');
      setIsVerified(true);
      setStatus('active');
    }
  }, [editingPackage, isPackageModalOpen]);

  if (!isPackageModalOpen) return null;

  const expectedProfit = sellingPrice - purchaseCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const ok = await savePackage({
        id: editingPackage?.id,
        name: name.trim(),
        urduName: urduName.trim(),
        network,
        duration,
        category,
        activationCode: activationCode.trim(),
        officialPrice: Number(officialPrice),
        purchaseCost: Number(purchaseCost),
        sellingPrice: Number(sellingPrice),
        description: description.trim(),
        urduDescription: urduDescription.trim(),
        internetData: internetData.trim(),
        onNetMinutes: onNetMinutes.trim(),
        offNetMinutes: offNetMinutes.trim(),
        sms: sms.trim(),
        isVerified,
        status
      });
      if (ok) {
        setIsPackageModalOpen(false);
        setEditingPackage(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingPackage ? t.edit : t.addPackage}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ur' ? 'پیکج کی تمام تفصیلات اور منافع کا تعین کریں' : 'Configure package pricing, bundle allowance, and validity'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPackageModalOpen(false);
              setEditingPackage(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Network Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Network
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

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.packageName} (English)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jazz Weekly Mega Plus"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.packageName} (اردو)</label>
              <input
                type="text"
                value={urduName}
                onChange={e => setUrduName(e.target.value)}
                placeholder="مثال: جاز ہفتہ وار میگا پلس"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-urdu"
              />
            </div>
          </div>

          {/* Duration & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.duration}</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value as PackageDuration)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Daily">Daily</option>
                <option value="3 Days">3 Days</option>
                <option value="7 Days">7 Days</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.category}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PackageCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="All-in-One">All-in-One</option>
                <option value="Data">Data</option>
                <option value="Voice">Voice</option>
                <option value="Social">Social</option>
                <option value="SMS">SMS</option>
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.activationCode}</label>
              <input
                type="text"
                value={activationCode}
                onChange={e => setActivationCode(e.target.value)}
                placeholder="*117*1# or Direct Load"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pricing & Profit */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Pricing & Retailer Profit
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.officialPrice}</label>
                <input
                  type="number"
                  min="0"
                  value={officialPrice}
                  onChange={e => setOfficialPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.purchaseCost}</label>
                <input
                  type="number"
                  min="0"
                  value={purchaseCost}
                  onChange={e => setPurchaseCost(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.sellingPrice}</label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.expectedProfit}</label>
                <div className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center h-[34px] ${
                  expectedProfit >= 0 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  Rs. {expectedProfit}
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Allowances */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.data}</label>
              <input
                type="text"
                value={internetData}
                onChange={e => setInternetData(e.target.value)}
                placeholder="e.g. 20 GB"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.onNet}</label>
              <input
                type="text"
                value={onNetMinutes}
                onChange={e => setOnNetMinutes(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.offNet}</label>
              <input
                type="text"
                value={offNetMinutes}
                onChange={e => setOffNetMinutes(e.target.value)}
                placeholder="e.g. 300"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.sms}</label>
              <input
                type="text"
                value={sms}
                onChange={e => setSms(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t.description}</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 25 GB Data (10 GB 2AM-2PM) + 5000 Jazz Mins"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>

          {/* Status & Verification Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={e => setIsVerified(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>{language === 'ur' ? 'تصدیق شدہ آفیشل ریٹس (Verified)' : 'Verified Official Rates'}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={e => setStatus(e.target.checked ? 'active' : 'inactive')}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>{language === 'ur' ? 'پیکج فعال ہے (Active)' : 'Active Package'}</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsPackageModalOpen(false);
                setEditingPackage(null);
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
