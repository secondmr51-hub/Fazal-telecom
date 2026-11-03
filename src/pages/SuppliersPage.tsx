import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Supplier, Purchase, SupplierPayment } from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  Building2,
  Plus,
  Search,
  Wallet,
  FileText,
  Printer,
  X,
  Phone
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const {
    data,
    language,
    t,
    setIsSupplierModalOpen,
    setEditingSupplier,
    setIsSupplierPaymentModalOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [statementSupplier, setStatementSupplier] = useState<Supplier | null>(null);

  const suppliers: Supplier[] = data?.suppliers || [];
  const purchases: Purchase[] = data?.purchases || [];
  const supplierPayments: SupplierPayment[] = data?.supplierPayments || [];

  const filteredSuppliers = suppliers.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    const matchName = s.name.toLowerCase().includes(q);
    const matchPerson = (s.contactPerson || '').toLowerCase().includes(q);
    const matchMobile = (s.mobile || '').includes(q);
    return matchName || matchPerson || matchMobile;
  });

  const totalPayables = suppliers.reduce((sum, s) => sum + (s.currentPayable || 0), 0);

  const supPurchases = statementSupplier ? purchases.filter(p => p.supplierId === statementSupplier.id && p.status === 'completed') : [];
  const supPayments = statementSupplier ? supplierPayments.filter(p => p.supplierId === statementSupplier.id && p.status === 'completed') : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-purple-500" />
            <span>{language === 'ur' ? 'سپلائرز و کمپنی ڈیلرز' : 'Suppliers & Distributor Accounts'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'فرنچائز اور ڈسٹری بیوٹرز کا کھاتہ، خریداری اور ادائیگیوں کا مکمل حساب'
              : 'Authorized telecom franchises, wholesale dealers, payable balances, and settlement ledger'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsSupplierPaymentModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>{t.paySupplier}</span>
          </button>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setIsSupplierModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Outstanding Payables</span>
          <span className="text-2xl font-black text-rose-400">{formatCurrency(totalPayables)}</span>
          <span className="text-[11px] text-rose-400/80 block mt-1">Liability Due to Dealers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Registered Suppliers</span>
          <span className="text-2xl font-black text-white">{suppliers.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Franchises & Area Stockists</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Suppliers with Pending Dues</span>
          <span className="text-2xl font-black text-amber-400">
            {suppliers.filter(s => s.currentPayable > 0).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Require settlement</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier, contact, phone..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Suppliers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base">{sup.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {sup.contactPerson && <span className="text-slate-300 font-medium">{sup.contactPerson} • </span>}
                    <span>{sup.mobile || 'No Mobile'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingSupplier(sup);
                    setIsSupplierModalOpen(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  title="Edit Supplier"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>

              {sup.network && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 inline-block mb-3">
                  {sup.network} Partner
                </span>
              )}

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'ur' ? 'کل واجب الادا رقم:' : 'Current Payable:'}</span>
                  <span className={`font-extrabold text-sm ${sup.currentPayable > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {formatCurrency(sup.currentPayable)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setStatementSupplier(sup)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Statement</span>
              </button>
              <button
                onClick={() => setIsSupplierPaymentModalOpen(true)}
                className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pay Due</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Statement Modal */}
      {statementSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:border-none print:bg-white print:text-black print:max-h-none print:shadow-none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 print:border-b-2 print:border-slate-300">
              <div>
                <h2 className="text-lg font-bold text-white print:text-black">
                  Fazal Azam Telecom — Supplier Statement
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Supplier: <strong className="text-white print:text-black">{statementSupplier.name}</strong> ({statementSupplier.mobile || 'N/A'})
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setStatementSupplier(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs print:p-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl print:bg-slate-100 print:border-slate-300">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Opening Balance</span>
                  <span className="font-bold text-white print:text-black">{formatCurrency(statementSupplier.previousBalance)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Current Payable Due</span>
                  <span className="text-base font-black text-rose-400 print:text-rose-800">{formatCurrency(statementSupplier.currentPayable)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white print:text-black mb-2 uppercase text-[11px] tracking-wider">
                  Purchases & Stock Inflow
                </h4>
                {supPurchases.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No purchase orders on record for this supplier.</p>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300 print:text-black">
                    <thead className="bg-slate-950/80 border-b border-slate-800 print:bg-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Stock Item</th>
                        <th className="py-2 px-2.5">Total Cost</th>
                        <th className="py-2 px-2.5">Paid</th>
                        <th className="py-2 px-2.5 text-right">Payable Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                      {supPurchases.map(p => (
                        <tr key={p.id}>
                          <td className="py-2 px-2.5">{formatShortDate(p.localDate)}</td>
                          <td className="py-2 px-2.5">{p.packageName}</td>
                          <td className="py-2 px-2.5">{formatCurrency(p.totalPurchaseCost)}</td>
                          <td className="py-2 px-2.5 text-emerald-400 print:text-emerald-700">{formatCurrency(p.amountPaid)}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-rose-400 print:text-rose-800">{formatCurrency(p.remainingPayable)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Payments Made */}
              <div className="pt-2">
                <h4 className="font-bold text-white print:text-black mb-2 uppercase text-[11px] tracking-wider">
                  Payments Made to Supplier
                </h4>
                {supPayments.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No separate payments recorded.</p>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300 print:text-black">
                    <thead className="bg-slate-950/80 border-b border-slate-800 print:bg-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Method</th>
                        <th className="py-2 px-2.5">Reference</th>
                        <th className="py-2 px-2.5 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                      {supPayments.map(p => (
                        <tr key={p.id}>
                          <td className="py-2 px-2.5">{formatShortDate(p.localDate)}</td>
                          <td className="py-2 px-2.5 uppercase text-[10px]">{p.paymentMethod}</td>
                          <td className="py-2 px-2.5">{p.reference || '—'}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-emerald-400 print:text-emerald-700">-{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
