import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Customer, Sale, CustomerPayment } from '../types/index.ts';
import { formatCurrency, formatShortDate } from '../utils/networkUtils.ts';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  FileText,
  Printer,
  X,
  Phone,
  AlertCircle,
  Share2
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const {
    data,
    language,
    t,
    setIsCustomerModalOpen,
    setEditingCustomer,
    setIsCustomerPaymentModalOpen
  } = useApp();

  const [search, setSearch] = useState('');
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  const customers: Customer[] = data?.customers || [];
  const sales: Sale[] = data?.sales || [];
  const payments: CustomerPayment[] = data?.customerPayments || [];

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchMob = (c.mobile || '').includes(q);
    const matchAddr = (c.address || '').toLowerCase().includes(q);
    return matchName || matchMob || matchAddr;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0);

  // Statement transactions for customer
  const customerSales = statementCustomer ? sales.filter(s => s.customerId === statementCustomer.id && s.status === 'completed') : [];
  const customerPayments = statementCustomer ? payments.filter(p => p.customerId === statementCustomer.id && p.status === 'completed') : [];

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            <span>{language === 'ur' ? 'گاہک کھاتہ و بقایا ادھار' : 'Customer Accounts (Khata)'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ur'
              ? 'گاہکوں کا ریکارڈ، ادھار سیلز، وصولیاں، اور پرنٹ کے قابل کھاتہ اسٹیٹمنٹ'
              : 'Customer balances, credit sales, payment history, and printable accounts statements'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCustomerPaymentModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>{t.receivePayment}</span>
          </button>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Customer Udhaar</span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(totalOutstanding)}</span>
          <span className="text-[11px] text-amber-400/80 block mt-1">Receivables Asset</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Active Customers</span>
          <span className="text-2xl font-black text-white">{customers.length}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Registered clients</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Customers with Due Udhaar</span>
          <span className="text-2xl font-black text-red-400">
            {customers.filter(c => c.currentOutstanding > 0).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Pending recovery</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer by name, mobile, address..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => (
          <div
            key={cust.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base">{cust.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>{cust.mobile || 'No Mobile'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingCustomer(cust);
                    setIsCustomerModalOpen(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  title="Edit Customer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>

              {cust.address && (
                <p className="text-xs text-slate-500 mb-2">{cust.address}</p>
              )}

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{language === 'ur' ? 'بقایا ادھار:' : 'Current Due:'}</span>
                  <span className={`font-extrabold text-sm ${cust.currentOutstanding > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {formatCurrency(cust.currentOutstanding)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Credit Limit:</span>
                  <span>{formatCurrency(cust.creditLimit || 5000)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  setStatementCustomer(cust);
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Statement</span>
              </button>
              <button
                onClick={() => setIsCustomerPaymentModalOpen(true)}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pay Due</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Printable Statement Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:border-none print:bg-white print:text-black print:max-h-none print:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 print:border-b-2 print:border-slate-300">
              <div>
                <h2 className="text-lg font-bold text-white print:text-black">
                  Fazal Azam Telecom — Customer Statement
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Customer: <strong className="text-white print:text-black">{statementCustomer.name}</strong> ({statementCustomer.mobile || 'N/A'})
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrintStatement}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setStatementCustomer(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Statement Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs print:p-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl print:bg-slate-100 print:border-slate-300">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Opening Balance</span>
                  <span className="font-bold text-white print:text-black">{formatCurrency(statementCustomer.previousBalance)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Current Total Outstanding</span>
                  <span className="text-base font-black text-amber-400 print:text-amber-800">{formatCurrency(statementCustomer.currentOutstanding)}</span>
                </div>
              </div>

              {/* Transactions list */}
              <div>
                <h4 className="font-bold text-white print:text-black mb-2 uppercase text-[11px] tracking-wider">
                  Sales & Credit Purchases
                </h4>
                {customerSales.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No individual sales on record for this customer.</p>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300 print:text-black">
                    <thead className="bg-slate-950/80 border-b border-slate-800 print:bg-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Item</th>
                        <th className="py-2 px-2.5">Net Sale</th>
                        <th className="py-2 px-2.5">Paid</th>
                        <th className="py-2 px-2.5 text-right">Udhaar Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                      {customerSales.map(s => (
                        <tr key={s.id}>
                          <td className="py-2 px-2.5">{formatShortDate(s.localDate)}</td>
                          <td className="py-2 px-2.5">{s.packageName}</td>
                          <td className="py-2 px-2.5">{formatCurrency(s.netSaleAmount)}</td>
                          <td className="py-2 px-2.5 text-emerald-400 print:text-emerald-700">{formatCurrency(s.amountReceived)}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-amber-400 print:text-amber-800">{formatCurrency(s.outstandingAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Payments Received */}
              <div className="pt-2">
                <h4 className="font-bold text-white print:text-black mb-2 uppercase text-[11px] tracking-wider">
                  Payments Received
                </h4>
                {customerPayments.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No standalone payments recorded.</p>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300 print:text-black">
                    <thead className="bg-slate-950/80 border-b border-slate-800 print:bg-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Method</th>
                        <th className="py-2 px-2.5">Reference</th>
                        <th className="py-2 px-2.5 text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                      {customerPayments.map(p => (
                        <tr key={p.id}>
                          <td className="py-2 px-2.5">{formatShortDate(p.localDate)}</td>
                          <td className="py-2 px-2.5 uppercase text-[10px]">{p.paymentMethod}</td>
                          <td className="py-2 px-2.5">{p.reference || '—'}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-emerald-400 print:text-emerald-700">+{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 text-center text-slate-500 text-[11px]">
                <p>Fazal Azam Telecom • Madina Market, Commercial Area • Contact: +92 300 1234567</p>
                <p className="mt-0.5">Thank you for your business!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
