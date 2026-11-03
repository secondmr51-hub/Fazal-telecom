import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TelecomNetwork,
  TelecomPackage,
  Sale,
  Purchase,
  Account,
  LedgerEntry,
  Customer,
  Supplier,
  Expense,
  AuditLog,
  BusinessSettings,
  UserSession,
  PaymentMethod
} from '../types/index.ts';
import { translations, Language } from '../i18n/translations.ts';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface ReversalTarget {
  type: 'sale' | 'purchase' | 'expense';
  id: string;
  reference: string;
  amount: number;
}

interface AppContextType {
  // Data
  data: any | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // User
  user: UserSession | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];

  // Navigation
  activePage: string;
  setActivePage: (page: string) => void;
  selectedNetwork: TelecomNetwork | 'all';
  setSelectedNetwork: (net: TelecomNetwork | 'all') => void;

  // Date Filtering
  dateFilter: 'today' | 'yesterday' | 'last7' | 'last30' | 'this_month' | 'custom';
  setDateFilter: (filter: 'today' | 'yesterday' | 'last7' | 'last30' | 'this_month' | 'custom') => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;
  isDateInRange: (dateStr: string) => boolean;

  // Modals & Triggers
  isSaleModalOpen: boolean;
  setIsSaleModalOpen: (open: boolean) => void;
  isPurchaseModalOpen: boolean;
  setIsPurchaseModalOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  isCustomerPaymentModalOpen: boolean;
  setIsCustomerPaymentModalOpen: (open: boolean) => void;
  isSupplierPaymentModalOpen: boolean;
  setIsSupplierPaymentModalOpen: (open: boolean) => void;
  isPackageModalOpen: boolean;
  setIsPackageModalOpen: (open: boolean) => void;
  editingPackage: TelecomPackage | null;
  setEditingPackage: (pkg: TelecomPackage | null) => void;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (open: boolean) => void;
  editingCustomer: Customer | null;
  setEditingCustomer: (cust: Customer | null) => void;
  isSupplierModalOpen: boolean;
  setIsSupplierModalOpen: (open: boolean) => void;
  editingSupplier: Supplier | null;
  setEditingSupplier: (sup: Supplier | null) => void;
  isReversalModalOpen: boolean;
  setIsReversalModalOpen: (open: boolean) => void;
  reversalTarget: ReversalTarget | null;
  setReversalTarget: (target: ReversalTarget | null) => void;

  // Actions
  recordSale: (saleData: any) => Promise<boolean>;
  reverseSale: (saleId: string, reason: string) => Promise<boolean>;
  recordPurchase: (purchaseData: any) => Promise<boolean>;
  reversePurchase: (purchaseId: string, reason: string) => Promise<boolean>;
  recordTransfer: (transferData: any) => Promise<boolean>;
  recordExpense: (expenseData: any) => Promise<boolean>;
  reverseExpense: (expenseId: string, reason: string) => Promise<boolean>;
  recordCustomerPayment: (paymentData: any) => Promise<boolean>;
  recordSupplierPayment: (paymentData: any) => Promise<boolean>;
  savePackage: (pkg: any) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;
  saveCustomer: (cust: any) => Promise<boolean>;
  saveSupplier: (sup: any) => Promise<boolean>;
  adjustAccountBalance: (accountId: string, newBalance: number, reason: string) => Promise<boolean>;
  updateSettings: (settings: Partial<BusinessSettings>) => Promise<boolean>;
  resetToDemo: () => Promise<boolean>;
  restoreBackup: (backupJson: any) => Promise<boolean>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('fat_user');
    return saved ? JSON.parse(saved) : { id: 'usr_admin', username: 'admin', fullName: 'Fazal Azam (Proprietor)', role: 'admin' };
  });

  // Localization state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fat_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fat_lang', lang);
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  useEffect(() => {
    if (language === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [language]);

  // Navigation
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedNetwork, setSelectedNetwork] = useState<TelecomNetwork | 'all'>('all');

  // Date filtering
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7' | 'last30' | 'this_month' | 'custom'>('today');
  const todayStr = new Date().toISOString().substring(0, 10);
  const [customDateRange, setCustomDateRange] = useState({ start: todayStr, end: todayStr });

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCustomerPaymentModalOpen, setIsCustomerPaymentModalOpen] = useState(false);
  const [isSupplierPaymentModalOpen, setIsSupplierPaymentModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TelecomPackage | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false);
  const [reversalTarget, setReversalTarget] = useState<ReversalTarget | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch full data
  const refreshData = async () => {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.error || 'Failed to load database.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter helper
  const isDateInRange = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const d = dateStr.substring(0, 10);
    const today = new Date().toISOString().substring(0, 10);

    if (dateFilter === 'today') return d === today;
    if (dateFilter === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return d === y.toISOString().substring(0, 10);
    }
    if (dateFilter === 'last7') {
      const target = new Date();
      target.setDate(target.getDate() - 7);
      return d >= target.toISOString().substring(0, 10) && d <= today;
    }
    if (dateFilter === 'last30') {
      const target = new Date();
      target.setDate(target.getDate() - 30);
      return d >= target.toISOString().substring(0, 10) && d <= today;
    }
    if (dateFilter === 'this_month') {
      const prefix = today.substring(0, 7);
      return d.startsWith(prefix);
    }
    if (dateFilter === 'custom') {
      return d >= customDateRange.start && d <= customDateRange.end;
    }
    return true;
  };

  // Login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        localStorage.setItem('fat_user', JSON.stringify(json.user));
        addToast('success', `Welcome back, ${json.user.fullName}!`);
        return true;
      } else {
        addToast('error', json.message || 'Login failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fat_user');
    addToast('info', 'Logged out successfully.');
  };

  // API Action Wrappers
  const recordSale = async (saleData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...saleData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].saleRecorded);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to record sale.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const reverseSale = async (saleId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sales/${saleId}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].reversedSuccess);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Reversal failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const recordPurchase = async (purchaseData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...purchaseData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].purchaseRecorded);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to record purchase.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const reversePurchase = async (purchaseId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/purchases/${purchaseId}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].reversedSuccess);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Purchase reversal failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const recordTransfer = async (transferData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...transferData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].transferRecorded);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Transfer failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const recordExpense = async (expenseData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].expenseRecorded);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to record expense.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const reverseExpense = async (expenseId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/expenses/${expenseId}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', translations[language].reversedSuccess);
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Expense reversal failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const recordCustomerPayment = async (paymentData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/customers/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Customer payment recorded successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to record payment.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const recordSupplierPayment = async (paymentData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/suppliers/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentData, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Supplier payment recorded successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to record supplier payment.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const savePackage = async (pkg: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Package saved successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to save package.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const deletePackage = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/packages/${id}?user=${user?.username || 'admin'}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        addToast('info', 'Package deleted.');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to delete package.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const saveCustomer = async (cust: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cust, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Customer saved successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to save customer.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const saveSupplier = async (sup: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sup, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Supplier saved successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Failed to save supplier.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const adjustAccountBalance = async (accountId: string, newBalance: number, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/accounts/${accountId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBalance, reason, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Account balance adjusted with traceable ledger entry.');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Adjustment failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSettings, user: user?.username || 'admin' })
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Settings updated.');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Settings update failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const resetToDemo = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast('info', 'Database reset to clean demo state.');
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  const restoreBackup = async (backupJson: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupJson)
      });
      const json = await res.json();
      if (json.success) {
        addToast('success', 'Backup restored successfully!');
        await refreshData();
        return true;
      } else {
        addToast('error', json.error || 'Backup restore failed.');
        return false;
      }
    } catch (err: any) {
      addToast('error', err.message);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData,
        user,
        login,
        logout,
        language,
        setLanguage,
        t: translations[language],
        activePage,
        setActivePage,
        selectedNetwork,
        setSelectedNetwork,
        dateFilter,
        setDateFilter,
        customDateRange,
        setCustomDateRange,
        isDateInRange,
        isSaleModalOpen,
        setIsSaleModalOpen,
        isPurchaseModalOpen,
        setIsPurchaseModalOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        isCustomerPaymentModalOpen,
        setIsCustomerPaymentModalOpen,
        isSupplierPaymentModalOpen,
        setIsSupplierPaymentModalOpen,
        isPackageModalOpen,
        setIsPackageModalOpen,
        editingPackage,
        setEditingPackage,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        editingCustomer,
        setEditingCustomer,
        isSupplierModalOpen,
        setIsSupplierModalOpen,
        editingSupplier,
        setEditingSupplier,
        isReversalModalOpen,
        setIsReversalModalOpen,
        reversalTarget,
        setReversalTarget,
        recordSale,
        reverseSale,
        recordPurchase,
        reversePurchase,
        recordTransfer,
        recordExpense,
        reverseExpense,
        recordCustomerPayment,
        recordSupplierPayment,
        savePackage,
        deletePackage,
        saveCustomer,
        saveSupplier,
        adjustAccountBalance,
        updateSettings,
        resetToDemo,
        restoreBackup,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
