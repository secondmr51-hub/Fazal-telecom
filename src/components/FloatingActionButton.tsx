import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Plus,
  ShoppingCart,
  Receipt,
  Wallet,
  ArrowRightLeft,
  X,
  PackagePlus
} from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    t,
    setIsSaleModalOpen,
    setIsCustomerPaymentModalOpen,
    setIsExpenseModalOpen,
    setIsTransferModalOpen,
    setIsPurchaseModalOpen
  } = useApp();

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40 flex flex-col items-end">
      {/* Speed Dial Menu */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 transition-all duration-200">
          {/* Sale */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow border border-slate-700">
              {t.recordSale}
            </span>
            <button
              onClick={() => handleAction(() => setIsSaleModalOpen(true))}
              className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Payment */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow border border-slate-700">
              {t.receivePayment}
            </span>
            <button
              onClick={() => handleAction(() => setIsCustomerPaymentModalOpen(true))}
              className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-950/40 active:scale-95 transition-transform"
            >
              <Wallet className="w-5 h-5" />
            </button>
          </div>

          {/* Purchase Stock */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow border border-slate-700">
              {t.recordPurchase}
            </span>
            <button
              onClick={() => handleAction(() => setIsPurchaseModalOpen(true))}
              className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-950/40 active:scale-95 transition-transform"
            >
              <PackagePlus className="w-5 h-5" />
            </button>
          </div>

          {/* Transfer */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow border border-slate-700">
              {t.transferFunds}
            </span>
            <button
              onClick={() => handleAction(() => setIsTransferModalOpen(true))}
              className="w-11 h-11 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-950/40 active:scale-95 transition-transform"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Expense */}
          <div className="flex items-center gap-2">
            <span className="bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow border border-slate-700">
              {t.recordExpense}
            </span>
            <button
              onClick={() => handleAction(() => setIsExpenseModalOpen(true))}
              className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950/40 active:scale-95 transition-transform"
            >
              <Receipt className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all ${
          isOpen
            ? 'bg-slate-800 rotate-45 shadow-slate-900/50'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-900/50 hover:brightness-110'
        }`}
        aria-label="Quick Actions"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
