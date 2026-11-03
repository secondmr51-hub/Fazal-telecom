import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { BusinessSettings } from '../types/index.ts';
import {
  Settings,
  Languages,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Store,
  Phone,
  MapPin,
  Check,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    data,
    language,
    setLanguage,
    t,
    updateSettings,
    resetToDemo,
    restoreBackup,
    addToast
  } = useApp();

  const currentSettings: BusinessSettings = data?.settings || {
    businessName: 'Fazal Azam Telecom',
    businessUrduName: 'فضل اعظم ٹیلی کام',
    tagline: 'Trusted Telecom Packages & Digital Load Service',
    ownerName: 'Fazal Azam',
    phone: '+92 300 1234567',
    address: 'Shop # 4, Madina Market, Main Commercial Area, Pakistan',
    currencySymbol: 'Rs.',
    language: 'en',
    allowNegativeBalance: true,
    requireDuplicateCheck: true
  };

  const [businessName, setBusinessName] = useState(currentSettings.businessName);
  const [businessUrduName, setBusinessUrduName] = useState(currentSettings.businessUrduName);
  const [ownerName, setOwnerName] = useState(currentSettings.ownerName);
  const [phone, setPhone] = useState(currentSettings.phone);
  const [address, setAddress] = useState(currentSettings.address);
  const [allowNegative, setAllowNegative] = useState(currentSettings.allowNegativeBalance);
  const [requireDuplicate, setRequireDuplicate] = useState(currentSettings.requireDuplicateCheck);
  const [saving, setSaving] = useState(false);

  // Restore file
  const [restoreJsonString, setRestoreJsonString] = useState('');
  const [restoring, setRestoring] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        businessName,
        businessUrduName,
        ownerName,
        phone,
        address,
        allowNegativeBalance: allowNegative,
        requireDuplicateCheck: requireDuplicate
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup';
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setRestoring(true);
        await restoreBackup(parsed);
      } catch (err) {
        addToast('error', 'Invalid JSON backup file.');
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>{language === 'ur' ? 'کاروباری ترتیبات و بیک اپ' : 'Settings & Database Backup'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ur'
            ? 'دکان کا نام، زبان کی تبدیلی، منفی بیلنس کی اجازت اور مکمل ڈیٹا بیس بیک اپ'
            : 'Configure business identity, language, accounting rules, and system database backups'}
        </p>
      </div>

      {/* Language Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Languages className="w-4 h-4 text-blue-400" />
          <span>{language === 'ur' ? 'زبان کا انتخاب (Language)' : 'Language & Interface Direction'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              language === 'en'
                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/20 text-white font-bold'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="font-bold text-sm">English</div>
              <div className="text-[11px] text-slate-400">Standard Left-to-Right layout</div>
            </div>
            {language === 'en' && <Check className="w-5 h-5 text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`p-4 rounded-2xl border text-right flex items-center justify-between transition-all ${
              language === 'ur'
                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/20 text-white font-bold'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'ur' && <Check className="w-5 h-5 text-blue-400" />}
            <div>
              <div className="font-bold text-sm font-urdu">اردو (Urdu)</div>
              <div className="text-[11px] text-slate-400 font-urdu">دائیں سے بائیں (RTL) مکمل انٹرفیس</div>
            </div>
          </button>
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Store className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ur' ? 'دکان و کاروباری معلومات' : 'Business Identity & Shop Details'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name (English)</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">دکان کا نام (اردو)</label>
            <input
              type="text"
              value={businessUrduName}
              onChange={e => setBusinessUrduName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-urdu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Owner / Proprietor Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Financial Rules */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowNegative}
              onChange={e => setAllowNegative(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-0"
            />
            <div>
              <span className="font-bold text-white block">
                {language === 'ur' ? 'منفی بیلنس پر انتباہ کے ساتھ اجازت (Negative Balance Override)' : 'Allow Negative Balance with Warning'}
              </span>
              <span className="text-[11px] text-slate-400">
                Warns user before a sale/transfer creates negative balance and logs ledger adjustments
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={requireDuplicate}
              onChange={e => setRequireDuplicate(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-0"
            />
            <div>
              <span className="font-bold text-white block">
                {language === 'ur' ? 'ڈپلیکیٹ سیلز سے تحفظ (Prevent Accidental Duplicates)' : 'Prevent Accidental Duplicate Transactions'}
              </span>
              <span className="text-[11px] text-slate-400">
                Alerts if the exact same mobile number and package are entered within 2 minutes
              </span>
            </div>
          </label>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Backup and Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>{language === 'ur' ? 'ڈیٹا بیس بیک اپ اور بحالی' : 'Database Backup & Restore'}</span>
        </div>

        <p className="text-xs text-slate-300">
          All financial data, packages, accounts, customers, and ledger entries are stored securely in a real persistent database on the server. You can export a full JSON backup anytime or restore from an earlier file.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Download Backup */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">Export Complete Database</h4>
              <p className="text-[11px] text-slate-400">Download snapshot containing all transactions and ledger history.</p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Upload Restore */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-white text-xs mb-1">Restore from Backup</h4>
              <p className="text-[11px] text-slate-400">Upload a previously saved JSON backup file to restore database.</p>
            </div>
            <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{restoring ? 'Restoring...' : 'Upload Backup File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
                disabled={restoring}
              />
            </label>
          </div>
        </div>

        {/* Demo reset */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Reset to Fresh Demo State</span>
            <span className="text-[11px] text-slate-500">Seeds default Pakistani packages and opening balances</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the database to clean demo state?')) {
                resetToDemo();
              }
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 rounded-xl text-xs font-semibold"
          >
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
};
