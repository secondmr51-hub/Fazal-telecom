export type TelecomNetwork = 'jazz' | 'zong' | 'telenor' | 'ufone';

export type PackageDuration = 'Daily' | '3 Days' | '7 Days' | '15 Days' | '30 Days' | 'Other';

export type PackageCategory = 'Prepaid' | 'Postpaid' | 'Data' | 'All-in-One' | 'Voice' | 'Social' | 'SMS';

export interface NetworkMeta {
  id: TelecomNetwork;
  name: string;
  urduName: string;
  themeColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  gradient: string;
}

export interface TelecomPackage {
  id: string;
  name: string;
  urduName?: string;
  network: TelecomNetwork;
  duration: PackageDuration;
  category: PackageCategory;
  activationCode: string;
  officialPrice: number;
  purchaseCost: number; // Retailer Purchase Cost
  sellingPrice: number; // Customer Selling Price
  expectedProfit: number; // sellingPrice - purchaseCost
  description: string;
  urduDescription?: string;
  internetData: string; // e.g. "12 GB"
  onNetMinutes: string; // e.g. "5000"
  offNetMinutes: string; // e.g. "300"
  sms: string; // e.g. "5000"
  validityStartDate?: string;
  expiryDate?: string;
  lastVerifiedDate: string;
  isVerified: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'jazzcash' | 'easypaisa' | 'bank' | 'credit' | 'other';
export type PaymentStatus = 'fully_paid' | 'partially_paid' | 'unpaid';

export interface Sale {
  id: string;
  transactionNumber: string;
  dateTime: string;
  localDate: string; // YYYY-MM-DD
  localTime: string; // HH:mm:ss
  network: TelecomNetwork;
  packageId: string;
  packageName: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  packagePurchaseCost: number;
  sellingPrice: number;
  discount: number;
  netSaleAmount: number; // sellingPrice - discount
  amountReceived: number;
  outstandingAmount: number; // netSaleAmount - amountReceived
  grossProfit: number; // netSaleAmount - packagePurchaseCost
  allocatedExpense: number;
  netProfit: number; // grossProfit - allocatedExpense
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  loadDeductedFromAccountId: string; // Retailer Load Account
  paymentDepositedToAccountId?: string; // Account where cash/digital money went
  reference?: string;
  notes?: string;
  status: 'completed' | 'reversed';
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  date: string;
  localDate: string;
  network: TelecomNetwork;
  packageName?: string;
  supplierId?: string;
  supplierName: string;
  quantity: number;
  unitPurchaseCost: number;
  totalPurchaseCost: number; // quantity * unitPurchaseCost
  amountPaid: number;
  remainingPayable: number; // totalPurchaseCost - amountPaid
  paymentMethod: PaymentMethod;
  paidFromAccountId?: string;
  creditedToAccountId: string; // e.g. Retailer Load account receiving stock
  reference: string;
  notes?: string;
  status: 'completed' | 'reversed';
  reversalReason?: string;
  reversedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'cash' | 'digital_wallet' | 'bank' | 'retailer_load' | 'other';

export interface Account {
  id: string;
  name: string;
  urduName: string;
  type: AccountType;
  network?: TelecomNetwork;
  accountNumber?: string;
  openingBalance: number;
  currentBalance: number;
  allowNegative: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  transactionType: 'sale' | 'purchase' | 'transfer' | 'expense' | 'customer_payment' | 'supplier_payment' | 'reversal' | 'adjustment' | 'opening';
  date: string;
  localDate: string;
  accountId: string;
  accountName: string;
  entryType: 'debit' | 'credit';
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  date: string;
  localDate: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  reference: string;
  notes?: string;
  status: 'completed' | 'reversed';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  creditLimit?: number;
  previousBalance: number;
  currentOutstanding: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  mobile: string;
  network?: TelecomNetwork;
  previousBalance: number;
  currentPayable: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  localDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  depositedToAccountId: string;
  reference: string;
  notes?: string;
  status: 'completed' | 'reversed';
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  localDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidFromAccountId: string;
  reference: string;
  notes?: string;
  status: 'completed' | 'reversed';
  createdAt: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity'
  | 'Internet'
  | 'Employee Salary'
  | 'Transport'
  | 'Maintenance'
  | 'Other Expenses';

export interface Expense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  urduCategory: string;
  amount: number;
  date: string;
  localDate: string;
  paymentMethod: PaymentMethod;
  paidFromAccountId: string;
  description: string;
  receiptReference?: string;
  status: 'completed' | 'reversed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'sale' | 'purchase' | 'transfer' | 'payment' | 'expense' | 'package' | 'account' | 'customer' | 'supplier' | 'settings' | 'auth';
  entityId: string;
  user: string;
  details: string;
  timestamp: string;
}

export interface BusinessSettings {
  businessName: string;
  businessUrduName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  currencySymbol: string;
  language: 'en' | 'ur';
  allowNegativeBalance: boolean;
  requireDuplicateCheck: boolean;
}

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'cashier';
}

export interface FinancialSummary {
  todaySales: number;
  todayPurchases: number;
  todayGrossProfit: number;
  todayNetProfit: number;
  todayLoss: number;
  availableCashBalance: number;
  availableDigitalBalance: number;
  totalCustomerReceivables: number;
  totalOutstandingPayables: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  monthlyLoss: number;
  monthlySalesRevenue: number;
  monthlyCOGS: number;
  monthlyExpenses: number;
  cashFlowIn: number;
  cashFlowOut: number;
  netCashFlow: number;
}
