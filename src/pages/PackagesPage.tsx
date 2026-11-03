import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { TelecomPackage, TelecomNetwork, PackageDuration, PackageCategory } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency } from '../utils/networkUtils.ts';
import {
  Layers,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Edit2,
  Trash2,
  Power,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const {
    data,
    language,
    t,
    setIsPackageModalOpen,
    setEditingPackage,
    deletePackage,
    savePackage,
    setIsSaleModalOpen,
    setSelectedNetwork
  } = useApp();

  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const packages: TelecomPackage[] = data?.packages || [];

  const filtered = packages.filter(p => {
    if (networkFilter !== 'all' && p.network !== networkFilter) return false;
    if (durationFilter !== 'all' && p.duration !== durationFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchUrdu = (p.urduName || '').includes(q);
      const matchCode = (p.activationCode || '').includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      return matchName || matchUrdu || matchCode || matchDesc;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    await deletePackage(id);
    setDeleteConfirmId(null);
  };

  const handleToggleStatus = async (pkg: TelecomPackage) => {
    const nextStatus = pkg.status === 'active' ? 'inactive' : 'active';
    await savePackage({ ...pkg, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-500" />
            <span>{language === 'ur' ? 'ٹیلی کام پیکجز مینجمنٹ' : 'All Telecom Packages'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'جاز، زونگ، ٹیلی نار اور یوفون کے تمام پیکجز، خرید و فروخت ریٹ اور تصدیق شدہ تفصیلات'
              : 'Central catalog for Jazz, Zong, Telenor, and Ufone packages with verified pricing and margins'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPackage(null);
            setIsPackageModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addPackage}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search package, code, data..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Network Filter */}
          <div>
            <select
              value={networkFilter}
              onChange={e => setNetworkFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Networks (تمام نیٹ ورکس)</option>
              <option value="jazz">Jazz (جاز)</option>
              <option value="zong">Zong (زونگ)</option>
              <option value="telenor">Telenor (ٹیلی نار)</option>
              <option value="ufone">Ufone (یو فون)</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <select
              value={durationFilter}
              onChange={e => setDurationFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Durations (تمام مدّت)</option>
              <option value="Daily">Daily (روزانہ)</option>
              <option value="3 Days">3 Days (3 دن)</option>
              <option value="7 Days">7 Days (ہفتہ وار)</option>
              <option value="15 Days">15 Days (15 دن)</option>
              <option value="30 Days">30 Days (ماہانہ)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All Categories (تمام اقسام)</option>
              <option value="All-in-One">All-in-One</option>
              <option value="Data">Data (انٹرنیٹ)</option>
              <option value="Voice">Voice (کال)</option>
              <option value="Social">Social</option>
              <option value="SMS">SMS</option>
              <option value="Prepaid">Prepaid</option>
              <option value="Postpaid">Postpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Packages */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
          <Layers className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p>No telecom packages found matching the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pkg => {
            const meta = NETWORK_METAS[pkg.network];
            const profit = pkg.sellingPrice - pkg.purchaseCost;
            const isInactive = pkg.status === 'inactive';

            return (
              <div
                key={pkg.id}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isInactive
                    ? 'border-slate-800/80 opacity-60'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                        style={{ backgroundColor: meta.themeColor }}
                      >
                        {meta.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {pkg.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {pkg.isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">
                    {pkg.name}
                  </h3>
                  {pkg.urduName && (
                    <p className="text-xs text-slate-400 font-urdu mt-0.5">{pkg.urduName}</p>
                  )}

                  <div className="mt-2 text-xs font-mono bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-xl text-slate-300 inline-block">
                    Code: <span className="text-amber-400 font-bold">{pkg.activationCode || 'Direct Load'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-[11px]">
                    <div className="bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[9px] uppercase">Data</span>
                      <span className="font-bold text-white">{pkg.internetData || '0'}</span>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[9px] uppercase">On-Net</span>
                      <span className="font-bold text-white">{pkg.onNetMinutes || '0'}</span>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[9px] uppercase">Off-Net</span>
                      <span className="font-bold text-white">{pkg.offNetMinutes || '0'}</span>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Retailer Cost</span>
                      <span className="font-bold text-slate-300">{formatCurrency(pkg.purchaseCost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Selling Price</span>
                      <span className="font-bold text-white">{formatCurrency(pkg.sellingPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Margin</span>
                      <span className="font-extrabold text-emerald-400">+{formatCurrency(profit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setSelectedNetwork(pkg.network);
                        setIsSaleModalOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Sale</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsPackageModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(pkg)}
                      className={`p-2 rounded-xl border text-xs ${
                        pkg.status === 'active'
                          ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400'
                          : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                      }`}
                      title={pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(pkg.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-5 max-w-sm w-full text-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Delete Package?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to delete this package? Historical sales records will remain preserved in the ledger.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
