import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { TelecomNetwork, TelecomPackage } from '../types/index.ts';
import { NETWORK_METAS, formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  Signal,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  PackagePlus,
  Clock,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';

export const NetworksPage: React.FC = () => {
  const {
    data,
    selectedNetwork,
    setSelectedNetwork,
    language,
    t,
    setIsPackageModalOpen,
    setEditingPackage,
    deletePackage,
    savePackage,
    setIsSaleModalOpen,
    setIsPurchaseModalOpen,
    setReversalTarget,
    setIsReversalModalOpen
  } = useApp();

  const activeNet: TelecomNetwork = selectedNetwork === 'all' ? 'jazz' : selectedNetwork;
  const meta = NETWORK_METAS[activeNet];

  const [packageSearch, setPackageSearch] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const packages: TelecomPackage[] = data?.packages || [];
  const sales = data?.sales || [];
  const accounts = data?.accounts || [];

  // Filter packages for this network
  const networkPackages = packages.filter(p => {
    if (p.network !== activeNet) return false;
    if (selectedDuration !== 'All' && p.duration !== selectedDuration) return false;
    if (packageSearch) {
      const q = packageSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchUrdu = (p.urduName || '').includes(q);
      const matchCode = (p.activationCode || '').includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      return matchName || matchUrdu || matchCode || matchDesc;
    }
    return true;
  });

  // Network transaction history
  const networkSales = sales.filter((s: any) => s.network === activeNet);

  // Network retailer load account
  const loadAccount = accounts.find((a: any) => a.network === activeNet && a.type === 'retailer_load');
  const currentLoadBalance = loadAccount ? loadAccount.currentBalance : 0;

  // Stats
  const activeCount = packages.filter(p => p.network === activeNet && p.status === 'active').length;
  const netRevenue = networkSales.filter((s: any) => s.status === 'completed').reduce((sum: number, s: any) => sum + s.netSaleAmount, 0);
  const netProfit = networkSales.filter((s: any) => s.status === 'completed').reduce((sum: number, s: any) => sum + s.netProfit, 0);

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
      {/* Network Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(['jazz', 'zong', 'telenor', 'ufone'] as TelecomNetwork[]).map(net => {
          const itemMeta = NETWORK_METAS[net];
          const isSelected = activeNet === net;
          const netPkgCount = packages.filter(p => p.network === net && p.status === 'active').length;

          return (
            <button
              key={net}
              onClick={() => setSelectedNetwork(net)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between shadow-sm ${
                isSelected
                  ? `bg-slate-900 ${itemMeta.borderColor} border-2 ring-2 ring-blue-500/20`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shadow"
                  style={{ backgroundColor: itemMeta.themeColor }}
                >
                  {itemMeta.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'ur' ? itemMeta.urduName : itemMeta.name}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {netPkgCount} {language === 'ur' ? 'پیکجز' : 'packages'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Network Header Banner */}
      <div
        className="rounded-3xl p-5 sm:p-6 border text-white shadow-xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0F172A 0%, ${meta.themeColor}33 100%)`,
          borderColor: `${meta.themeColor}55`
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl"
              style={{ backgroundColor: meta.themeColor }}
            >
              {meta.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">
                  {language === 'ur' ? `${meta.urduName} پیکجز و ٹرانزیکشنز` : `${meta.name} Packages & Management`}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20">
                  {meta.name}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'ur'
                  ? `دستیاب ریٹیلر بیلنس: ${formatCurrency(currentLoadBalance)} | کل فعال پیکجز: ${activeCount}`
                  : `Retailer SIM Load Balance: ${formatCurrency(currentLoadBalance)} • Active Packages: ${activeCount}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addPackage}</span>
            </button>
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t.recordSale}</span>
            </button>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Refill Load</span>
            </button>
          </div>
        </div>
      </div>

      {/* Package Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={packageSearch}
            onChange={e => setPackageSearch(e.target.value)}
            placeholder={language === 'ur' ? 'پیکج کا نام، کوڈ یا ڈیٹا تلاش کریں...' : 'Search package, code, data...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 font-semibold">{t.duration}:</span>
          {['All', 'Daily', '3 Days', '7 Days', '15 Days', '30 Days'].map(dur => (
            <button
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDuration === dur
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {dur}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{language === 'ur' ? `${meta.urduName} پیکجز فہرست (${networkPackages.length})` : `${meta.name} Package Catalog (${networkPackages.length})`}</span>
          </h2>
        </div>

        {networkPackages.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>{language === 'ur' ? 'اس فلٹر کے تحت کوئی پیکج موجود نہیں ہے۔' : 'No packages found matching this filter.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {networkPackages.map(pkg => {
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
                    {/* Top Row: Category, Duration, Verified badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pkg.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {pkg.category}
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

                    {/* Package Name & Code */}
                    <h3 className="font-bold text-white text-base leading-snug">
                      {pkg.name}
                    </h3>
                    {pkg.urduName && (
                      <p className="text-xs text-slate-400 font-urdu mt-0.5">{pkg.urduName}</p>
                    )}

                    <div className="mt-2 text-xs font-mono bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-xl text-slate-300 inline-block">
                      Activation: <span className="text-amber-400 font-bold">{pkg.activationCode || 'Direct Load'}</span>
                    </div>

                    {/* Allowance Badges */}
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

                  {/* Financial Breakdown & Actions */}
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
                        <span className="text-[10px] text-slate-500 block">Profit</span>
                        <span className="font-extrabold text-emerald-400">+{formatCurrency(profit)}</span>
                      </div>
                    </div>

                    {/* Actions row */}
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
                        title="Edit Package"
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
                        title={pkg.status === 'active' ? 'Deactivate Package' : 'Activate Package'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(pkg.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 hover:border-red-800/40 border border-slate-700"
                        title="Delete Package"
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
      </div>

      {/* Network Sales History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{language === 'ur' ? `${meta.urduName} ٹرانزیکشن ہسٹری (${networkSales.length})` : `${meta.name} Transaction History (${networkSales.length})`}</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total Net: <strong className="text-white">{formatCurrency(netRevenue)}</strong> | Profit: <strong className="text-emerald-400">{formatCurrency(netProfit)}</strong>
          </span>
        </div>

        {networkSales.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            {language === 'ur' ? 'اس نیٹ ورک پر ابھی تک کوئی سیلز ریکارڈ نہیں ہوئی۔' : 'No sales recorded for this network yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Package</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Sale Amount</th>
                  <th className="py-2.5 px-3">Net Profit</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {networkSales.slice(0, 10).map((sale: any) => {
                  const isReversed = sale.status === 'reversed';
                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                        {formatShortDate(sale.localDate)} {sale.localTime}
                      </td>
                      <td className="py-2 px-3 font-semibold text-white">
                        {sale.packageName}
                      </td>
                      <td className="py-2 px-3">
                        {sale.customerName} {sale.customerMobile ? `(${sale.customerMobile})` : ''}
                      </td>
                      <td className="py-2 px-3 font-bold text-white">
                        {formatCurrency(sale.netSaleAmount)}
                      </td>
                      <td className="py-2 px-3 font-bold text-emerald-400">
                        +{formatCurrency(sale.netProfit)}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isReversed
                            ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {sale.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {!isReversed && (
                          <button
                            onClick={() => {
                              setReversalTarget({
                                type: 'sale',
                                id: sale.id,
                                reference: sale.transactionNumber,
                                amount: sale.netSaleAmount
                              });
                              setIsReversalModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-400"
                            title="Reverse"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-5 max-w-sm w-full text-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Delete Package?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to delete this package record? Past sales referencing this package will retain historical integrity.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
