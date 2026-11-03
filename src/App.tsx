/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { FloatingActionButton } from './components/FloatingActionButton.tsx';

// Modals
import { SaleModal } from './components/modals/SaleModal.tsx';
import { PurchaseModal } from './components/modals/PurchaseModal.tsx';
import { TransferModal } from './components/modals/TransferModal.tsx';
import { ExpenseModal } from './components/modals/ExpenseModal.tsx';
import { CustomerPaymentModal } from './components/modals/CustomerPaymentModal.tsx';
import { SupplierPaymentModal } from './components/modals/SupplierPaymentModal.tsx';
import { PackageModal } from './components/modals/PackageModal.tsx';
import { CustomerModal } from './components/modals/CustomerModal.tsx';
import { SupplierModal } from './components/modals/SupplierModal.tsx';
import { ReversalModal } from './components/modals/ReversalModal.tsx';

// Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { NetworksPage } from './pages/NetworksPage.tsx';
import { PackagesPage } from './pages/PackagesPage.tsx';
import { SalesPage } from './pages/SalesPage.tsx';
import { PurchasesPage } from './pages/PurchasesPage.tsx';
import { AccountsPage } from './pages/AccountsPage.tsx';
import { CustomersPage } from './pages/CustomersPage.tsx';
import { SuppliersPage } from './pages/SuppliersPage.tsx';
import { ExpensesPage } from './pages/ExpensesPage.tsx';
import { ProfitLossPage } from './pages/ProfitLossPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { LedgerPage } from './pages/LedgerPage.tsx';
import { VerificationSuitePage } from './pages/VerificationSuitePage.tsx';
import { AuditLogPage } from './pages/AuditLogPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, activePage, toasts, removeToast } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'networks':
        return <NetworksPage />;
      case 'packages':
        return <PackagesPage />;
      case 'sales':
        return <SalesPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'profit_loss':
        return <ProfitLossPage />;
      case 'reports':
        return <ReportsPage />;
      case 'ledger':
        return <LedgerPage />;
      case 'tests':
        return <VerificationSuitePage />;
      case 'audit_logs':
        return <AuditLogPage />;
      case 'settings':
      case 'backup':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Layout: Sidebar + Page Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-full overflow-x-hidden">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating Speed Dial */}
      <FloatingActionButton />

      {/* All Application Modals */}
      <SaleModal />
      <PurchaseModal />
      <TransferModal />
      <ExpenseModal />
      <CustomerPaymentModal />
      <SupplierPaymentModal />
      <PackageModal />
      <CustomerModal />
      <SupplierModal />
      <ReversalModal />

      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs border backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
