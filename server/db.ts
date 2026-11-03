import fs from 'fs';
import path from 'path';
import {
  TelecomPackage,
  Sale,
  Purchase,
  Account,
  LedgerEntry,
  Transfer,
  Customer,
  Supplier,
  CustomerPayment,
  SupplierPayment,
  Expense,
  AuditLog,
  BusinessSettings,
  UserSession,
  PaymentMethod
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'telecom_database.json');

export interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  users: Array<UserSession & { passwordHash: string }>;
  settings: BusinessSettings;
  packages: TelecomPackage[];
  sales: Sale[];
  purchases: Purchase[];
  accounts: Account[];
  ledgerEntries: LedgerEntry[];
  transfers: Transfer[];
  customers: Customer[];
  suppliers: Supplier[];
  customerPayments: CustomerPayment[];
  supplierPayments: SupplierPayment[];
  expenses: Expense[];
  auditLogs: AuditLog[];
}

// Helper for Pakistan Standard Time
export function getPakistanDateTime(): { iso: string; date: string; time: string; timestamp: number } {
  const now = new Date();
  // PKT is UTC+5
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const pktDate = new Date(utc + 5 * 3600000);

  const year = pktDate.getFullYear();
  const month = String(pktDate.getMonth() + 1).padStart(2, '0');
  const day = String(pktDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const hours = String(pktDate.getHours()).padStart(2, '0');
  const minutes = String(pktDate.getMinutes()).padStart(2, '0');
  const seconds = String(pktDate.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  return {
    iso: pktDate.toISOString(),
    date: dateStr,
    time: timeStr,
    timestamp: Date.now()
  };
}

function getInitialData(): DatabaseSchema {
  const { iso, date, time } = getPakistanDateTime();

  const accounts: Account[] = [
    {
      id: 'acc_cash',
      name: 'Cash in Hand',
      urduName: 'نقد کیش',
      type: 'cash',
      openingBalance: 10000,
      currentBalance: 10000,
      allowNegative: true,
      notes: 'Counter Cash Drawer',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_jazzcash',
      name: 'JazzCash Shop Account',
      urduName: 'جاز کیش دکان اکاؤنٹ',
      type: 'digital_wallet',
      accountNumber: '0300-1234567',
      openingBalance: 15000,
      currentBalance: 15000,
      allowNegative: false,
      notes: 'Merchant Till / Agent Account',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_easypaisa',
      name: 'Easypaisa Shop Account',
      urduName: 'ایزی پیسہ شاپ اکاؤنٹ',
      type: 'digital_wallet',
      accountNumber: '0345-9876543',
      openingBalance: 12000,
      currentBalance: 12000,
      allowNegative: false,
      notes: 'Easypaisa Agent Wallet',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_bank',
      name: 'Bank Account (HBL/Allied)',
      urduName: 'بینک اکاؤنٹ',
      type: 'bank',
      accountNumber: 'PK12HABB00012345678901',
      openingBalance: 50000,
      currentBalance: 50000,
      allowNegative: false,
      notes: 'Main Business Operating Account',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_jazz_load',
      name: 'Jazz Retailer Load Balance',
      urduName: 'جاز ریٹیلر لوڈ بیلنس',
      type: 'retailer_load',
      network: 'jazz',
      accountNumber: '0300-RETAIL-1',
      openingBalance: 25000,
      currentBalance: 25000,
      allowNegative: true,
      notes: 'Jazz Easyload SIM Balance',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_zong_load',
      name: 'Zong Retailer Load Balance',
      urduName: 'زونگ ریٹیلر لوڈ بیلنس',
      type: 'retailer_load',
      network: 'zong',
      accountNumber: '0312-RETAIL-2',
      openingBalance: 20000,
      currentBalance: 20000,
      allowNegative: true,
      notes: 'Zong Mini Load SIM Balance',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_telenor_load',
      name: 'Telenor Retailer Load Balance',
      urduName: 'ٹیلی نار ریٹیلر لوڈ بیلنس',
      type: 'retailer_load',
      network: 'telenor',
      accountNumber: '0345-RETAIL-3',
      openingBalance: 18000,
      currentBalance: 18000,
      allowNegative: true,
      notes: 'Telenor Easyload SIM Balance',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_ufone_load',
      name: 'Ufone Retailer Load Balance',
      urduName: 'یو فون ریٹیلر لوڈ بیلنس',
      type: 'retailer_load',
      network: 'ufone',
      accountNumber: '0333-RETAIL-4',
      openingBalance: 15000,
      currentBalance: 15000,
      allowNegative: true,
      notes: 'Ufone U-Load SIM Balance',
      createdAt: iso,
      updatedAt: iso,
    },
    {
      id: 'acc_other_digital',
      name: 'Other Digital Wallet (Raast/Nayapay)',
      urduName: 'دیگر ڈیجیٹل والیٹ',
      type: 'other',
      openingBalance: 5000,
      currentBalance: 5000,
      allowNegative: false,
      notes: 'Emergency Digital Buffer',
      createdAt: iso,
      updatedAt: iso,
    }
  ];

  const initialLedger: LedgerEntry[] = accounts.map((acc, index) => ({
    id: `led_init_${index + 1}`,
    transactionId: 'INIT',
    transactionType: 'opening',
    date: iso,
    localDate: date,
    accountId: acc.id,
    accountName: acc.name,
    entryType: 'credit',
    amount: acc.openingBalance,
    balanceAfter: acc.openingBalance,
    description: `Opening Balance for ${acc.name}`,
    reference: 'SYSTEM-INIT',
    createdAt: iso
  }));

  const packages: TelecomPackage[] = [
    // Jazz
    {
      id: 'pkg_jazz_1',
      name: 'Jazz Weekly Mega Plus',
      urduName: 'جاز ہفتہ وار میگا پلس',
      network: 'jazz',
      duration: '7 Days',
      category: 'Data',
      activationCode: '*453#',
      officialPrice: 420,
      purchaseCost: 385,
      sellingPrice: 420,
      expectedProfit: 35,
      description: '25 GB Data (10 GB 2AM-2PM) + 5000 Jazz Mins, 100 Off-net Mins',
      urduDescription: '25 جی بی انٹرنیٹ، 5000 جاز منٹس، 100 دیگر نیٹ ورک منٹس',
      internetData: '25 GB',
      onNetMinutes: '5000',
      offNetMinutes: '100',
      sms: '1000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_jazz_2',
      name: 'Jazz Monthly Super Duper',
      urduName: 'جاز ماہانہ سپر ڈوپر',
      network: 'jazz',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*706#',
      officialPrice: 1045,
      purchaseCost: 960,
      sellingPrice: 1045,
      expectedProfit: 85,
      description: '12 GB Data, 3000 Jazz Mins, 300 Other Mins, 3000 SMS',
      urduDescription: '12 جی بی انٹرنیٹ، 3000 جاز منٹس، 300 دیگر منٹس، 3000 ایس ایم ایس',
      internetData: '12 GB',
      onNetMinutes: '3000',
      offNetMinutes: '300',
      sms: '3000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_jazz_3',
      name: 'Jazz Daily Super Plus',
      urduName: 'جاز روزانہ سپر پلس',
      network: 'jazz',
      duration: 'Daily',
      category: 'All-in-One',
      activationCode: '*555#',
      officialPrice: 45,
      purchaseCost: 39,
      sellingPrice: 45,
      expectedProfit: 6,
      description: '500 MB Data, 500 Jazz Mins, 5 Off-net Mins',
      urduDescription: '500 ایم بی انٹرنیٹ، 500 جاز منٹس، 5 دیگر منٹس',
      internetData: '500 MB',
      onNetMinutes: '500',
      offNetMinutes: '5',
      sms: '500',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_jazz_4',
      name: 'Jazz Monthly Max 35GB',
      urduName: 'جاز ماہانہ میکس',
      network: 'jazz',
      duration: '30 Days',
      category: 'Data',
      activationCode: '*708#',
      officialPrice: 1565,
      purchaseCost: 1440,
      sellingPrice: 1565,
      expectedProfit: 125,
      description: '35 GB Data, 10000 Jazz Mins, 500 Off-net Mins',
      urduDescription: '35 جی بی ڈیٹا، 10000 جاز منٹس، 500 دیگر نیٹ ورک منٹس',
      internetData: '35 GB',
      onNetMinutes: '10000',
      offNetMinutes: '500',
      sms: '10000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },

    // Zong
    {
      id: 'pkg_zong_1',
      name: 'Zong Weekly Pro',
      urduName: 'زونگ ہفتہ وار پرو',
      network: 'zong',
      duration: '7 Days',
      category: 'All-in-One',
      activationCode: '*794#',
      officialPrice: 490,
      purchaseCost: 450,
      sellingPrice: 490,
      expectedProfit: 40,
      description: '40 GB Data, Unlimited Zong Mins, 250 Off-net Mins',
      urduDescription: '40 جی بی انٹرنیٹ، لامحدود زونگ منٹس، 250 دیگر منٹس',
      internetData: '40 GB',
      onNetMinutes: 'Unlimited',
      offNetMinutes: '250',
      sms: '5000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_zong_2',
      name: 'Zong Monthly Digital Max',
      urduName: 'زونگ ماہانہ ڈیجیٹل میکس',
      network: 'zong',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*6464#',
      officialPrice: 1650,
      purchaseCost: 1520,
      sellingPrice: 1650,
      expectedProfit: 130,
      description: '100 GB Data, 10000 Zong Mins, 1000 Off-net Mins, 10000 SMS',
      urduDescription: '100 جی بی انٹرنیٹ، 10000 زونگ منٹس، 1000 دیگر منٹس، 10000 ایس ایم ایس',
      internetData: '100 GB',
      onNetMinutes: '10000',
      offNetMinutes: '1000',
      sms: '10000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_zong_3',
      name: 'Zong Super Weekly Plus',
      urduName: 'زونگ سپر ویکلی پلس',
      network: 'zong',
      duration: '7 Days',
      category: 'Data',
      activationCode: '*20#',
      officialPrice: 360,
      purchaseCost: 330,
      sellingPrice: 360,
      expectedProfit: 30,
      description: '10 GB Internet Data for 7 days',
      urduDescription: '10 جی بی تیز رفتار انٹرنیٹ 7 دن کے لیے',
      internetData: '10 GB',
      onNetMinutes: '0',
      offNetMinutes: '0',
      sms: '0',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_zong_4',
      name: 'Zong Monthly Super Star',
      urduName: 'زونگ ماہانہ سپر اسٹار',
      network: 'zong',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*7070#',
      officialPrice: 990,
      purchaseCost: 910,
      sellingPrice: 990,
      expectedProfit: 80,
      description: '12 GB Data, 3000 Zong Mins, 400 Off-net, 3000 SMS',
      urduDescription: '12 جی بی انٹرنیٹ، 3000 زونگ منٹس، 400 دیگر منٹس',
      internetData: '12 GB',
      onNetMinutes: '3000',
      offNetMinutes: '400',
      sms: '3000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },

    // Telenor
    {
      id: 'pkg_telenor_1',
      name: 'Telenor Weekly EasyCard 1000',
      urduName: 'ٹیلی نار ہفتہ وار ایزی کارڈ',
      network: 'telenor',
      duration: '7 Days',
      category: 'All-in-One',
      activationCode: '*963#',
      officialPrice: 430,
      purchaseCost: 395,
      sellingPrice: 430,
      expectedProfit: 35,
      description: '18 GB Data, 2000 Telenor Mins, 150 Off-net Mins, 2000 SMS',
      urduDescription: '18 جی بی انٹرنیٹ، 2000 ٹیلی نار منٹس، 150 دیگر منٹس',
      internetData: '18 GB',
      onNetMinutes: '2000',
      offNetMinutes: '150',
      sms: '2000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_telenor_2',
      name: 'Telenor Monthly Ultra Plus',
      urduName: 'ٹیلی نار ماہانہ الٹرا پلس',
      network: 'telenor',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*303#',
      officialPrice: 1200,
      purchaseCost: 1100,
      sellingPrice: 1200,
      expectedProfit: 100,
      description: '50 GB Data, 5000 Telenor Mins, 450 Off-net Mins',
      urduDescription: '50 جی بی ڈیٹا، 5000 ٹیلی نار منٹس، 450 دیگر نیٹ ورک منٹس',
      internetData: '50 GB',
      onNetMinutes: '5000',
      offNetMinutes: '450',
      sms: '5000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_telenor_3',
      name: 'Telenor Weekly Video Max',
      urduName: 'ٹیلی نار ویڈیو میکس',
      network: 'telenor',
      duration: '7 Days',
      category: 'Social',
      activationCode: '*220#',
      officialPrice: 220,
      purchaseCost: 200,
      sellingPrice: 220,
      expectedProfit: 20,
      description: '15 GB YouTube, TikTok, Facebook data for 7 days',
      urduDescription: '15 جی بی یوٹیوب، ٹک ٹاک، فیس بک کے لیے',
      internetData: '15 GB',
      onNetMinutes: '0',
      offNetMinutes: '0',
      sms: '0',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },

    // Ufone
    {
      id: 'pkg_ufone_1',
      name: 'Ufone Super Card Grand',
      urduName: 'یو فون سپر کارڈ گرینڈ',
      network: 'ufone',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*2070#',
      officialPrice: 1099,
      purchaseCost: 1010,
      sellingPrice: 1099,
      expectedProfit: 89,
      description: '20 GB Data, 6000 Ufone/PTCL Mins, 450 Off-net, 6000 SMS',
      urduDescription: '20 جی بی ڈیٹا، 6000 یوفون منٹس، 450 دیگر منٹس، 6000 ایس ایم ایس',
      internetData: '20 GB',
      onNetMinutes: '6000',
      offNetMinutes: '450',
      sms: '6000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_ufone_2',
      name: 'Ufone Weekly Digital Grand',
      urduName: 'یو فون ڈیجیٹل گرینڈ',
      network: 'ufone',
      duration: '7 Days',
      category: 'Data',
      activationCode: '*7777#',
      officialPrice: 550,
      purchaseCost: 505,
      sellingPrice: 550,
      expectedProfit: 45,
      description: '100 GB Data (50 GB 1AM-9AM), 7000 Ufone Mins, 500 Off-net',
      urduDescription: '100 جی بی انٹرنیٹ، 7000 یوفون منٹس، 500 دیگر نیٹ ورک منٹس',
      internetData: '100 GB',
      onNetMinutes: '7000',
      offNetMinutes: '500',
      sms: '7000',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'pkg_ufone_3',
      name: 'Ufone Super Card Max',
      urduName: 'یو فون سپر کارڈ میکس',
      network: 'ufone',
      duration: '30 Days',
      category: 'All-in-One',
      activationCode: '*629#',
      officialPrice: 849,
      purchaseCost: 780,
      sellingPrice: 849,
      expectedProfit: 69,
      description: '10 GB Data, 3500 Ufone Mins, 350 Off-net, 3500 SMS',
      urduDescription: '10 جی بی ڈیٹا، 3500 یوفون منٹس، 350 دیگر منٹس',
      internetData: '10 GB',
      onNetMinutes: '3500',
      offNetMinutes: '350',
      sms: '3500',
      lastVerifiedDate: date,
      isVerified: true,
      status: 'active',
      createdAt: iso,
      updatedAt: iso
    }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'sup_1',
      name: 'Jazz Franchise Main Market',
      contactPerson: 'Muhammad Tariq',
      mobile: '0300-5551234',
      network: 'jazz',
      previousBalance: 0,
      currentPayable: 0,
      notes: 'Authorized Jazz Franchise Dealer',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'sup_2',
      name: 'Zong Telecom Direct Distributor',
      contactPerson: 'Khurram Shehzad',
      mobile: '0312-8884321',
      network: 'zong',
      previousBalance: 0,
      currentPayable: 0,
      notes: 'Zong Area Stockist',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'sup_3',
      name: 'Telenor Regional Sales Depot',
      contactPerson: 'Asadullah Khan',
      mobile: '0345-7776543',
      network: 'telenor',
      previousBalance: 0,
      currentPayable: 0,
      notes: 'Telenor Easyload & Scratch Cards',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'sup_4',
      name: 'Ufone Official Wholesaler',
      contactPerson: 'Waqas Ahmed',
      mobile: '0333-6669870',
      network: 'ufone',
      previousBalance: 0,
      currentPayable: 0,
      notes: 'PTCL / Ufone Authorized Channel',
      createdAt: iso,
      updatedAt: iso
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust_1',
      name: 'Chaudhry Nadeem',
      mobile: '0301-2345678',
      address: 'Main Bazar, Shop #12',
      creditLimit: 5000,
      previousBalance: 0,
      currentOutstanding: 0,
      notes: 'Regular local merchant',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'cust_2',
      name: 'Malik Rizwan',
      mobile: '0345-6789012',
      address: 'Near Jamia Masjid',
      creditLimit: 3000,
      previousBalance: 0,
      currentOutstanding: 0,
      notes: 'Weekly subscriber',
      createdAt: iso,
      updatedAt: iso
    },
    {
      id: 'cust_3',
      name: 'Dr. Shahzad',
      mobile: '0315-9988776',
      address: 'City Medical Complex',
      creditLimit: 10000,
      previousBalance: 0,
      currentOutstanding: 0,
      notes: 'Monthly corporate client',
      createdAt: iso,
      updatedAt: iso
    }
  ];

  return {
    version: 1,
    lastUpdated: iso,
    users: [
      {
        id: 'usr_admin',
        username: 'admin',
        fullName: 'Fazal Azam (Proprietor)',
        role: 'admin',
        passwordHash: 'admin123'
      },
      {
        id: 'usr_cashier',
        username: 'cashier',
        fullName: 'Shop Assistant (Cashier)',
        role: 'cashier',
        passwordHash: 'cashier123'
      }
    ],
    settings: {
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
    },
    packages,
    sales: [],
    purchases: [],
    accounts,
    ledgerEntries: initialLedger,
    transfers: [],
    customers,
    suppliers,
    customerPayments: [],
    supplierPayments: [],
    expenses: [],
    auditLogs: [
      {
        id: 'aud_init',
        action: 'System Initialized',
        entityType: 'settings',
        entityId: 'system',
        user: 'admin',
        details: 'Fazal Azam Telecom database initialized with default Pakistani telecom packages and financial accounts.',
        timestamp: iso
      }
    ]
  };
}

class DatabaseManager {
  private inMemoryData: DatabaseSchema | null = null;
  private isWriting = false;

  constructor() {
    this.ensureDataLoaded();
  }

  private ensureDataLoaded(): DatabaseSchema {
    if (this.inMemoryData) {
      return this.inMemoryData;
    }

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.inMemoryData = JSON.parse(fileContent) as DatabaseSchema;
        // Verify key tables exist
        if (!this.inMemoryData.packages) this.inMemoryData.packages = [];
        if (!this.inMemoryData.sales) this.inMemoryData.sales = [];
        if (!this.inMemoryData.purchases) this.inMemoryData.purchases = [];
        if (!this.inMemoryData.accounts) this.inMemoryData.accounts = [];
        if (!this.inMemoryData.ledgerEntries) this.inMemoryData.ledgerEntries = [];
        if (!this.inMemoryData.transfers) this.inMemoryData.transfers = [];
        if (!this.inMemoryData.customers) this.inMemoryData.customers = [];
        if (!this.inMemoryData.suppliers) this.inMemoryData.suppliers = [];
        if (!this.inMemoryData.expenses) this.inMemoryData.expenses = [];
        if (!this.inMemoryData.auditLogs) this.inMemoryData.auditLogs = [];
      } else {
        this.inMemoryData = getInitialData();
        this.persistSync();
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
      this.inMemoryData = getInitialData();
      this.persistSync();
    }

    return this.inMemoryData;
  }

  private persistSync() {
    if (!this.inMemoryData) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.inMemoryData.lastUpdated = new Date().toISOString();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.inMemoryData, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public getSnapshot(): DatabaseSchema {
    return this.ensureDataLoaded();
  }

  public resetToFreshDemo(): DatabaseSchema {
    this.inMemoryData = getInitialData();
    this.persistSync();
    return this.inMemoryData;
  }

  public restoreFromBackup(backupData: DatabaseSchema): DatabaseSchema {
    if (!backupData || !backupData.accounts || !backupData.packages) {
      throw new Error('Invalid backup data structure.');
    }
    this.inMemoryData = backupData;
    this.persistSync();
    return this.inMemoryData;
  }

  public addAuditLog(action: string, entityType: AuditLog['entityType'], entityId: string, user: string, details: string) {
    const db = this.ensureDataLoaded();
    const { iso } = getPakistanDateTime();
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      entityType,
      entityId,
      user: user || 'admin',
      details,
      timestamp: iso
    };
    db.auditLogs.unshift(log);
    // Keep max 500 audit logs
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500);
    }
    this.persistSync();
  }

  // Record Sale with Atomic Accounting
  public recordSale(saleInput: {
    network: TelecomPackage['network'];
    packageId: string;
    packageName: string;
    customerId?: string;
    customerName?: string;
    customerMobile?: string;
    packagePurchaseCost: number;
    sellingPrice: number;
    discount: number;
    paymentMethod: Sale['paymentMethod'];
    amountReceived: number;
    paymentDepositedToAccountId?: string;
    loadDeductedFromAccountId?: string;
    allocatedExpense?: number;
    reference?: string;
    notes?: string;
    user?: string;
  }): { sale: Sale; ledger: LedgerEntry[] } {
    const db = this.ensureDataLoaded();
    const { iso, date, time } = getPakistanDateTime();

    const netSaleAmount = Math.max(0, saleInput.sellingPrice - (saleInput.discount || 0));
    const amountReceived = Math.min(netSaleAmount, Math.max(0, saleInput.amountReceived || 0));
    const outstandingAmount = Math.max(0, netSaleAmount - amountReceived);
    const grossProfit = netSaleAmount - saleInput.packagePurchaseCost;
    const allocatedExpense = saleInput.allocatedExpense || 0;
    const netProfit = grossProfit - allocatedExpense;

    let paymentStatus: Sale['paymentStatus'] = 'unpaid';
    if (amountReceived >= netSaleAmount) {
      paymentStatus = 'fully_paid';
    } else if (amountReceived > 0) {
      paymentStatus = 'partially_paid';
    }

    const saleId = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const saleNum = `FAT-SL-${db.sales.length + 1001}`;

    // Determine load balance account to deduct package cost from
    const defaultLoadAccount = db.accounts.find(a => a.network === saleInput.network && a.type === 'retailer_load') || db.accounts.find(a => a.id === 'acc_cash')!;
    const loadAccId = saleInput.loadDeductedFromAccountId || defaultLoadAccount.id;

    // Determine cash/wallet account to deposit received money into
    let depositAccId = saleInput.paymentDepositedToAccountId;
    if (!depositAccId) {
      if (saleInput.paymentMethod === 'jazzcash') depositAccId = 'acc_jazzcash';
      else if (saleInput.paymentMethod === 'easypaisa') depositAccId = 'acc_easypaisa';
      else if (saleInput.paymentMethod === 'bank') depositAccId = 'acc_bank';
      else depositAccId = 'acc_cash';
    }

    const newSale: Sale = {
      id: saleId,
      transactionNumber: saleNum,
      dateTime: iso,
      localDate: date,
      localTime: time,
      network: saleInput.network,
      packageId: saleInput.packageId,
      packageName: saleInput.packageName,
      customerId: saleInput.customerId,
      customerName: saleInput.customerName || 'Walk-in Customer',
      customerMobile: saleInput.customerMobile || '',
      packagePurchaseCost: saleInput.packagePurchaseCost,
      sellingPrice: saleInput.sellingPrice,
      discount: saleInput.discount || 0,
      netSaleAmount,
      amountReceived,
      outstandingAmount,
      grossProfit,
      allocatedExpense,
      netProfit,
      paymentMethod: saleInput.paymentMethod,
      paymentStatus,
      loadDeductedFromAccountId: loadAccId,
      paymentDepositedToAccountId: depositAccId,
      reference: saleInput.reference || '',
      notes: saleInput.notes || '',
      status: 'completed',
      createdAt: iso,
      updatedAt: iso
    };

    const createdLedgerEntries: LedgerEntry[] = [];

    // 1. Deduct cost of goods from the retailer load / inventory balance account
    const loadAccount = db.accounts.find(a => a.id === loadAccId);
    if (loadAccount) {
      loadAccount.currentBalance -= saleInput.packagePurchaseCost;
      loadAccount.updatedAt = iso;

      const ledgerLoad: LedgerEntry = {
        id: `led_${Date.now()}_1`,
        transactionId: saleId,
        transactionType: 'sale',
        date: iso,
        localDate: date,
        accountId: loadAccount.id,
        accountName: loadAccount.name,
        entryType: 'debit',
        amount: saleInput.packagePurchaseCost,
        balanceAfter: loadAccount.currentBalance,
        description: `Package cost deduction for ${saleInput.packageName} (${saleNum})`,
        reference: saleNum,
        createdAt: iso
      };
      db.ledgerEntries.unshift(ledgerLoad);
      createdLedgerEntries.push(ledgerLoad);
    }

    // 2. Deposit actual received payment into the Cash/Wallet account
    if (amountReceived > 0) {
      const depositAccount = db.accounts.find(a => a.id === depositAccId);
      if (depositAccount) {
        depositAccount.currentBalance += amountReceived;
        depositAccount.updatedAt = iso;

        const ledgerCash: LedgerEntry = {
          id: `led_${Date.now()}_2`,
          transactionId: saleId,
          transactionType: 'sale',
          date: iso,
          localDate: date,
          accountId: depositAccount.id,
          accountName: depositAccount.name,
          entryType: 'credit',
          amount: amountReceived,
          balanceAfter: depositAccount.currentBalance,
          description: `Sale payment received for ${saleInput.packageName} (${saleNum})`,
          reference: saleNum,
          createdAt: iso
        };
        db.ledgerEntries.unshift(ledgerCash);
        createdLedgerEntries.push(ledgerCash);
      }
    }

    // 3. If credit / outstanding remains, update customer balance
    if (outstandingAmount > 0) {
      let customer = saleInput.customerId ? db.customers.find(c => c.id === saleInput.customerId) : null;
      if (!customer && saleInput.customerName && saleInput.customerName !== 'Walk-in Customer') {
        // Create customer record if mobile or name provided
        customer = {
          id: `cust_${Date.now()}`,
          name: saleInput.customerName,
          mobile: saleInput.customerMobile || '',
          previousBalance: 0,
          currentOutstanding: 0,
          createdAt: iso,
          updatedAt: iso
        };
        db.customers.push(customer);
        newSale.customerId = customer.id;
      }

      if (customer) {
        customer.currentOutstanding += outstandingAmount;
        customer.updatedAt = iso;
      }
    }

    db.sales.unshift(newSale);
    this.addAuditLog(
      'Sale Created',
      'sale',
      saleId,
      saleInput.user || 'admin',
      `Sale ${saleNum}: ${saleInput.packageName} (${saleInput.network.toUpperCase()}). Net: Rs. ${netSaleAmount}, Profit: Rs. ${netProfit}, Paid: Rs. ${amountReceived}, Due: Rs. ${outstandingAmount}`
    );

    this.persistSync();
    return { sale: newSale, ledger: createdLedgerEntries };
  }

  // Reverse Sale
  public reverseSale(saleId: string, reason: string, user: string): Sale {
    const db = this.ensureDataLoaded();
    const sale = db.sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Sale not found.');
    if (sale.status === 'reversed') throw new Error('Sale is already reversed.');

    const { iso, date } = getPakistanDateTime();

    // 1. Restore the load balance account (add back package purchase cost)
    const loadAcc = db.accounts.find(a => a.id === sale.loadDeductedFromAccountId);
    if (loadAcc) {
      loadAcc.currentBalance += sale.packagePurchaseCost;
      loadAcc.updatedAt = iso;

      db.ledgerEntries.unshift({
        id: `led_rev_${Date.now()}_1`,
        transactionId: sale.id,
        transactionType: 'reversal',
        date: iso,
        localDate: date,
        accountId: loadAcc.id,
        accountName: loadAcc.name,
        entryType: 'credit',
        amount: sale.packagePurchaseCost,
        balanceAfter: loadAcc.currentBalance,
        description: `REVERSAL: Refunded stock load for ${sale.packageName} (${sale.transactionNumber})`,
        reference: `REV-${sale.transactionNumber}`,
        createdAt: iso
      });
    }

    // 2. Reverse received cash/wallet funds
    if (sale.amountReceived > 0) {
      const depositAcc = db.accounts.find(a => a.id === (sale.paymentDepositedToAccountId || 'acc_cash'));
      if (depositAcc) {
        depositAcc.currentBalance -= sale.amountReceived;
        depositAcc.updatedAt = iso;

        db.ledgerEntries.unshift({
          id: `led_rev_${Date.now()}_2`,
          transactionId: sale.id,
          transactionType: 'reversal',
          date: iso,
          localDate: date,
          accountId: depositAcc.id,
          accountName: depositAcc.name,
          entryType: 'debit',
          amount: sale.amountReceived,
          balanceAfter: depositAcc.currentBalance,
          description: `REVERSAL: Refunded customer payment for ${sale.transactionNumber}`,
          reference: `REV-${sale.transactionNumber}`,
          createdAt: iso
        });
      }
    }

    // 3. Reverse customer outstanding if any
    if (sale.customerId && sale.outstandingAmount > 0) {
      const customer = db.customers.find(c => c.id === sale.customerId);
      if (customer) {
        customer.currentOutstanding = Math.max(0, customer.currentOutstanding - sale.outstandingAmount);
        customer.updatedAt = iso;
      }
    }

    sale.status = 'reversed';
    sale.reversalReason = reason;
    sale.reversedAt = iso;
    sale.reversedBy = user || 'admin';
    sale.updatedAt = iso;

    this.addAuditLog(
      'Sale Reversed',
      'sale',
      sale.id,
      user || 'admin',
      `Sale ${sale.transactionNumber} reversed. Reason: ${reason}`
    );

    this.persistSync();
    return sale;
  }

  // Record Purchase / Stock Load Inflow
  public recordPurchase(purchaseInput: {
    network: TelecomPackage['network'];
    packageName?: string;
    supplierId?: string;
    supplierName: string;
    quantity: number;
    unitPurchaseCost: number;
    amountPaid: number;
    paymentMethod: Purchase['paymentMethod'];
    paidFromAccountId?: string;
    creditedToAccountId?: string;
    reference?: string;
    notes?: string;
    user?: string;
  }): { purchase: Purchase; ledger: LedgerEntry[] } {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const quantity = Math.max(1, purchaseInput.quantity || 1);
    const unitCost = Math.max(0, purchaseInput.unitPurchaseCost || 0);
    const totalCost = quantity * unitCost;
    const amountPaid = Math.min(totalCost, Math.max(0, purchaseInput.amountPaid || 0));
    const remainingPayable = Math.max(0, totalCost - amountPaid);

    const purchaseId = `po_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const poNum = `FAT-PO-${db.purchases.length + 1001}`;

    // Target load account receiving this balance
    const defaultLoadAccount = db.accounts.find(a => a.network === purchaseInput.network && a.type === 'retailer_load') || db.accounts.find(a => a.id === 'acc_cash')!;
    const creditLoadAccId = purchaseInput.creditedToAccountId || defaultLoadAccount.id;

    // Account from which payment was made (e.g. Cash, Bank)
    const paidFromAccId = purchaseInput.paidFromAccountId || 'acc_cash';

    const newPurchase: Purchase = {
      id: purchaseId,
      purchaseNumber: poNum,
      date: iso,
      localDate: date,
      network: purchaseInput.network,
      packageName: purchaseInput.packageName || `${purchaseInput.network.toUpperCase()} Load / Bundle`,
      supplierId: purchaseInput.supplierId,
      supplierName: purchaseInput.supplierName,
      quantity,
      unitPurchaseCost: unitCost,
      totalPurchaseCost: totalCost,
      amountPaid,
      remainingPayable,
      paymentMethod: purchaseInput.paymentMethod,
      paidFromAccountId: amountPaid > 0 ? paidFromAccId : undefined,
      creditedToAccountId: creditLoadAccId,
      reference: purchaseInput.reference || '',
      notes: purchaseInput.notes || '',
      status: 'completed',
      createdAt: iso,
      updatedAt: iso
    };

    const createdLedger: LedgerEntry[] = [];

    // 1. Add stock load value to the retailer load account
    const creditLoadAcc = db.accounts.find(a => a.id === creditLoadAccId);
    if (creditLoadAcc) {
      creditLoadAcc.currentBalance += totalCost;
      creditLoadAcc.updatedAt = iso;

      const ledgerStock: LedgerEntry = {
        id: `led_${Date.now()}_po1`,
        transactionId: purchaseId,
        transactionType: 'purchase',
        date: iso,
        localDate: date,
        accountId: creditLoadAcc.id,
        accountName: creditLoadAcc.name,
        entryType: 'credit',
        amount: totalCost,
        balanceAfter: creditLoadAcc.currentBalance,
        description: `Purchased Stock/Load for ${purchaseInput.network.toUpperCase()} (${poNum})`,
        reference: poNum,
        createdAt: iso
      };
      db.ledgerEntries.unshift(ledgerStock);
      createdLedger.push(ledgerStock);
    }

    // 2. If amount paid > 0, deduct money from payment account (Cash/Bank)
    if (amountPaid > 0) {
      const paidFromAcc = db.accounts.find(a => a.id === paidFromAccId);
      if (paidFromAcc) {
        paidFromAcc.currentBalance -= amountPaid;
        paidFromAcc.updatedAt = iso;

        const ledgerPayment: LedgerEntry = {
          id: `led_${Date.now()}_po2`,
          transactionId: purchaseId,
          transactionType: 'purchase',
          date: iso,
          localDate: date,
          accountId: paidFromAcc.id,
          accountName: paidFromAcc.name,
          entryType: 'debit',
          amount: amountPaid,
          balanceAfter: paidFromAcc.currentBalance,
          description: `Payment for purchase ${poNum} to ${purchaseInput.supplierName}`,
          reference: poNum,
          createdAt: iso
        };
        db.ledgerEntries.unshift(ledgerPayment);
        createdLedger.push(ledgerPayment);
      }
    }

    // 3. Update supplier payable if unpaid portion exists
    if (remainingPayable > 0) {
      let supplier = purchaseInput.supplierId ? db.suppliers.find(s => s.id === purchaseInput.supplierId) : null;
      if (!supplier && purchaseInput.supplierName) {
        supplier = {
          id: `sup_${Date.now()}`,
          name: purchaseInput.supplierName,
          mobile: '',
          network: purchaseInput.network,
          previousBalance: 0,
          currentPayable: 0,
          createdAt: iso,
          updatedAt: iso
        };
        db.suppliers.push(supplier);
        newPurchase.supplierId = supplier.id;
      }

      if (supplier) {
        supplier.currentPayable += remainingPayable;
        supplier.updatedAt = iso;
      }
    }

    db.purchases.unshift(newPurchase);
    this.addAuditLog(
      'Purchase Recorded',
      'purchase',
      purchaseId,
      purchaseInput.user || 'admin',
      `Purchase ${poNum}: Total: Rs. ${totalCost}, Paid: Rs. ${amountPaid}, Payable: Rs. ${remainingPayable} from ${purchaseInput.supplierName}`
    );

    this.persistSync();
    return { purchase: newPurchase, ledger: createdLedger };
  }

  // Reverse Purchase
  public reversePurchase(purchaseId: string, reason: string, user: string): Purchase {
    const db = this.ensureDataLoaded();
    const purchase = db.purchases.find(p => p.id === purchaseId);
    if (!purchase) throw new Error('Purchase record not found.');
    if (purchase.status === 'reversed') throw new Error('Purchase is already reversed.');

    const { iso, date } = getPakistanDateTime();

    // 1. Remove the stock that was credited to load balance account
    const creditLoadAcc = db.accounts.find(a => a.id === purchase.creditedToAccountId);
    if (creditLoadAcc) {
      creditLoadAcc.currentBalance -= purchase.totalPurchaseCost;
      creditLoadAcc.updatedAt = iso;

      db.ledgerEntries.unshift({
        id: `led_rev_${Date.now()}_po1`,
        transactionId: purchase.id,
        transactionType: 'reversal',
        date: iso,
        localDate: date,
        accountId: creditLoadAcc.id,
        accountName: creditLoadAcc.name,
        entryType: 'debit',
        amount: purchase.totalPurchaseCost,
        balanceAfter: creditLoadAcc.currentBalance,
        description: `REVERSAL: Stock deducted for canceled purchase (${purchase.purchaseNumber})`,
        reference: `REV-${purchase.purchaseNumber}`,
        createdAt: iso
      });
    }

    // 2. Refund cash/bank payment back to source account
    if (purchase.amountPaid > 0 && purchase.paidFromAccountId) {
      const paidFromAcc = db.accounts.find(a => a.id === purchase.paidFromAccountId);
      if (paidFromAcc) {
        paidFromAcc.currentBalance += purchase.amountPaid;
        paidFromAcc.updatedAt = iso;

        db.ledgerEntries.unshift({
          id: `led_rev_${Date.now()}_po2`,
          transactionId: purchase.id,
          transactionType: 'reversal',
          date: iso,
          localDate: date,
          accountId: paidFromAcc.id,
          accountName: paidFromAcc.name,
          entryType: 'credit',
          amount: purchase.amountPaid,
          balanceAfter: paidFromAcc.currentBalance,
          description: `REVERSAL: Refunded cash payment for canceled purchase (${purchase.purchaseNumber})`,
          reference: `REV-${purchase.purchaseNumber}`,
          createdAt: iso
        });
      }
    }

    // 3. Remove remaining payable from supplier balance
    if (purchase.supplierId && purchase.remainingPayable > 0) {
      const supplier = db.suppliers.find(s => s.id === purchase.supplierId);
      if (supplier) {
        supplier.currentPayable = Math.max(0, supplier.currentPayable - purchase.remainingPayable);
        supplier.updatedAt = iso;
      }
    }

    purchase.status = 'reversed';
    purchase.reversalReason = reason;
    purchase.reversedAt = iso;
    purchase.updatedAt = iso;

    this.addAuditLog(
      'Purchase Reversed',
      'purchase',
      purchase.id,
      user || 'admin',
      `Purchase ${purchase.purchaseNumber} reversed. Reason: ${reason}`
    );

    this.persistSync();
    return purchase;
  }

  // Record Account-to-Account Transfer
  public recordTransfer(transferInput: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    reference?: string;
    notes?: string;
    user?: string;
  }): Transfer {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const fromAcc = db.accounts.find(a => a.id === transferInput.fromAccountId);
    const toAcc = db.accounts.find(a => a.id === transferInput.toAccountId);
    if (!fromAcc || !toAcc) throw new Error('Source or destination account invalid.');
    if (fromAcc.id === toAcc.id) throw new Error('Cannot transfer to the same account.');
    if (transferInput.amount <= 0) throw new Error('Transfer amount must be greater than zero.');

    if (!fromAcc.allowNegative && fromAcc.currentBalance < transferInput.amount) {
      throw new Error(`Insufficient balance in ${fromAcc.name}. Current: Rs. ${fromAcc.currentBalance}`);
    }

    const transferId = `tr_${Date.now()}`;
    fromAcc.currentBalance -= transferInput.amount;
    fromAcc.updatedAt = iso;

    toAcc.currentBalance += transferInput.amount;
    toAcc.updatedAt = iso;

    const transfer: Transfer = {
      id: transferId,
      date: iso,
      localDate: date,
      fromAccountId: fromAcc.id,
      fromAccountName: fromAcc.name,
      toAccountId: toAcc.id,
      toAccountName: toAcc.name,
      amount: transferInput.amount,
      reference: transferInput.reference || `TRF-${Date.now().toString().slice(-6)}`,
      notes: transferInput.notes || '',
      status: 'completed',
      createdAt: iso
    };

    // Double entry ledger for transfer
    db.ledgerEntries.unshift({
      id: `led_${Date.now()}_tr1`,
      transactionId: transferId,
      transactionType: 'transfer',
      date: iso,
      localDate: date,
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      entryType: 'debit',
      amount: transferInput.amount,
      balanceAfter: fromAcc.currentBalance,
      description: `Transfer OUT to ${toAcc.name}`,
      reference: transfer.reference,
      createdAt: iso
    });

    db.ledgerEntries.unshift({
      id: `led_${Date.now()}_tr2`,
      transactionId: transferId,
      transactionType: 'transfer',
      date: iso,
      localDate: date,
      accountId: toAcc.id,
      accountName: toAcc.name,
      entryType: 'credit',
      amount: transferInput.amount,
      balanceAfter: toAcc.currentBalance,
      description: `Transfer IN from ${fromAcc.name}`,
      reference: transfer.reference,
      createdAt: iso
    });

    db.transfers.unshift(transfer);
    this.addAuditLog(
      'Funds Transferred',
      'transfer',
      transferId,
      transferInput.user || 'admin',
      `Transferred Rs. ${transferInput.amount} from ${fromAcc.name} to ${toAcc.name}`
    );

    this.persistSync();
    return transfer;
  }

  // Record Business Expense
  public recordExpense(expenseInput: {
    category: Expense['category'];
    urduCategory?: string;
    amount: number;
    paymentMethod: Expense['paymentMethod'];
    paidFromAccountId?: string;
    description: string;
    receiptReference?: string;
    user?: string;
  }): Expense {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    if (expenseInput.amount <= 0) throw new Error('Expense amount must be greater than zero.');

    let paidFromAccId = expenseInput.paidFromAccountId;
    if (!paidFromAccId) {
      if (expenseInput.paymentMethod === 'jazzcash') paidFromAccId = 'acc_jazzcash';
      else if (expenseInput.paymentMethod === 'easypaisa') paidFromAccId = 'acc_easypaisa';
      else if (expenseInput.paymentMethod === 'bank') paidFromAccId = 'acc_bank';
      else paidFromAccId = 'acc_cash';
    }

    const paidFromAcc = db.accounts.find(a => a.id === paidFromAccId);
    if (!paidFromAcc) throw new Error('Account to pay expense from not found.');

    const expId = `exp_${Date.now()}`;
    const expNum = `FAT-EXP-${db.expenses.length + 1001}`;

    paidFromAcc.currentBalance -= expenseInput.amount;
    paidFromAcc.updatedAt = iso;

    const newExpense: Expense = {
      id: expId,
      expenseNumber: expNum,
      category: expenseInput.category,
      urduCategory: expenseInput.urduCategory || expenseInput.category,
      amount: expenseInput.amount,
      date: iso,
      localDate: date,
      paymentMethod: expenseInput.paymentMethod,
      paidFromAccountId: paidFromAcc.id,
      description: expenseInput.description,
      receiptReference: expenseInput.receiptReference || '',
      status: 'completed',
      createdAt: iso
    };

    db.ledgerEntries.unshift({
      id: `led_${Date.now()}_exp`,
      transactionId: expId,
      transactionType: 'expense',
      date: iso,
      localDate: date,
      accountId: paidFromAcc.id,
      accountName: paidFromAcc.name,
      entryType: 'debit',
      amount: expenseInput.amount,
      balanceAfter: paidFromAcc.currentBalance,
      description: `Expense: ${expenseInput.category} - ${expenseInput.description}`,
      reference: expNum,
      createdAt: iso
    });

    db.expenses.unshift(newExpense);
    this.addAuditLog(
      'Expense Recorded',
      'expense',
      expId,
      expenseInput.user || 'admin',
      `Expense ${expNum}: Rs. ${expenseInput.amount} for ${expenseInput.category} from ${paidFromAcc.name}`
    );

    this.persistSync();
    return newExpense;
  }

  // Reverse Expense
  public reverseExpense(expenseId: string, reason: string, user: string): Expense {
    const db = this.ensureDataLoaded();
    const expense = db.expenses.find(e => e.id === expenseId);
    if (!expense) throw new Error('Expense record not found.');
    if (expense.status === 'reversed') throw new Error('Expense is already reversed.');

    const { iso, date } = getPakistanDateTime();
    const paidAcc = db.accounts.find(a => a.id === expense.paidFromAccountId);
    if (paidAcc) {
      paidAcc.currentBalance += expense.amount;
      paidAcc.updatedAt = iso;

      db.ledgerEntries.unshift({
        id: `led_rev_${Date.now()}_exp`,
        transactionId: expense.id,
        transactionType: 'reversal',
        date: iso,
        localDate: date,
        accountId: paidAcc.id,
        accountName: paidAcc.name,
        entryType: 'credit',
        amount: expense.amount,
        balanceAfter: paidAcc.currentBalance,
        description: `REVERSAL: Refunded expense ${expense.expenseNumber} (${expense.category})`,
        reference: `REV-${expense.expenseNumber}`,
        createdAt: iso
      });
    }

    expense.status = 'reversed';
    this.addAuditLog('Expense Reversed', 'expense', expense.id, user || 'admin', `Expense ${expense.expenseNumber} reversed: ${reason}`);
    this.persistSync();
    return expense;
  }

  // Record Customer Payment (Receivable collection)
  public recordCustomerPayment(input: {
    customerId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    depositedToAccountId?: string;
    reference?: string;
    notes?: string;
    user?: string;
  }): CustomerPayment {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const customer = db.customers.find(c => c.id === input.customerId);
    if (!customer) throw new Error('Customer not found.');
    if (input.amount <= 0) throw new Error('Payment amount must be greater than zero.');

    let depAccId = input.depositedToAccountId;
    if (!depAccId) {
      if (input.paymentMethod === 'jazzcash') depAccId = 'acc_jazzcash';
      else if (input.paymentMethod === 'easypaisa') depAccId = 'acc_easypaisa';
      else if (input.paymentMethod === 'bank') depAccId = 'acc_bank';
      else depAccId = 'acc_cash';
    }

    const depAcc = db.accounts.find(a => a.id === depAccId);
    if (!depAcc) throw new Error('Deposit account not found.');

    const paymentId = `cpay_${Date.now()}`;
    customer.currentOutstanding = Math.max(0, customer.currentOutstanding - input.amount);
    customer.updatedAt = iso;

    depAcc.currentBalance += input.amount;
    depAcc.updatedAt = iso;

    const payment: CustomerPayment = {
      id: paymentId,
      customerId: customer.id,
      customerName: customer.name,
      date: iso,
      localDate: date,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      depositedToAccountId: depAcc.id,
      reference: input.reference || `CPAY-${Date.now().toString().slice(-6)}`,
      notes: input.notes || '',
      status: 'completed',
      createdAt: iso
    };

    db.ledgerEntries.unshift({
      id: `led_${Date.now()}_cpay`,
      transactionId: paymentId,
      transactionType: 'customer_payment',
      date: iso,
      localDate: date,
      accountId: depAcc.id,
      accountName: depAcc.name,
      entryType: 'credit',
      amount: input.amount,
      balanceAfter: depAcc.currentBalance,
      description: `Customer payment received from ${customer.name}`,
      reference: payment.reference,
      createdAt: iso
    });

    db.customerPayments.unshift(payment);
    this.addAuditLog(
      'Payment Received',
      'payment',
      paymentId,
      input.user || 'admin',
      `Received Rs. ${input.amount} from customer ${customer.name}. Remaining due: Rs. ${customer.currentOutstanding}`
    );

    this.persistSync();
    return payment;
  }

  // Record Supplier Payment (Payable settlement)
  public recordSupplierPayment(input: {
    supplierId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paidFromAccountId?: string;
    reference?: string;
    notes?: string;
    user?: string;
  }): SupplierPayment {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const supplier = db.suppliers.find(s => s.id === input.supplierId);
    if (!supplier) throw new Error('Supplier not found.');
    if (input.amount <= 0) throw new Error('Payment amount must be greater than zero.');

    const paidFromAccId = input.paidFromAccountId || 'acc_cash';
    const paidAcc = db.accounts.find(a => a.id === paidFromAccId);
    if (!paidAcc) throw new Error('Payment source account not found.');

    const paymentId = `spay_${Date.now()}`;
    supplier.currentPayable = Math.max(0, supplier.currentPayable - input.amount);
    supplier.updatedAt = iso;

    paidAcc.currentBalance -= input.amount;
    paidAcc.updatedAt = iso;

    const payment: SupplierPayment = {
      id: paymentId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: iso,
      localDate: date,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paidFromAccountId: paidAcc.id,
      reference: input.reference || `SPAY-${Date.now().toString().slice(-6)}`,
      notes: input.notes || '',
      status: 'completed',
      createdAt: iso
    };

    db.ledgerEntries.unshift({
      id: `led_${Date.now()}_spay`,
      transactionId: paymentId,
      transactionType: 'supplier_payment',
      date: iso,
      localDate: date,
      accountId: paidAcc.id,
      accountName: paidAcc.name,
      entryType: 'debit',
      amount: input.amount,
      balanceAfter: paidAcc.currentBalance,
      description: `Supplier payment made to ${supplier.name}`,
      reference: payment.reference,
      createdAt: iso
    });

    db.supplierPayments.unshift(payment);
    this.addAuditLog(
      'Payment Made',
      'payment',
      paymentId,
      input.user || 'admin',
      `Paid Rs. ${input.amount} to supplier ${supplier.name}. Remaining payable: Rs. ${supplier.currentPayable}`
    );

    this.persistSync();
    return payment;
  }

  // Package CRUD
  public savePackage(pkg: Partial<TelecomPackage> & { network: TelecomPackage['network']; name: string }, user: string): TelecomPackage {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const expectedProfit = (pkg.sellingPrice || 0) - (pkg.purchaseCost || 0);

    if (pkg.id) {
      const idx = db.packages.findIndex(p => p.id === pkg.id);
      if (idx !== -1) {
        const old = db.packages[idx];
        const updated: TelecomPackage = {
          ...old,
          ...pkg,
          expectedProfit,
          updatedAt: iso
        };
        db.packages[idx] = updated;
        this.addAuditLog('Package Price Changed', 'package', updated.id, user, `Updated package: ${updated.name}. Price: ${updated.sellingPrice}`);
        this.persistSync();
        return updated;
      }
    }

    const newPkg: TelecomPackage = {
      id: `pkg_${pkg.network}_${Date.now()}`,
      name: pkg.name,
      urduName: pkg.urduName || pkg.name,
      network: pkg.network,
      duration: pkg.duration || '7 Days',
      category: pkg.category || 'All-in-One',
      activationCode: pkg.activationCode || '',
      officialPrice: pkg.officialPrice || 0,
      purchaseCost: pkg.purchaseCost || 0,
      sellingPrice: pkg.sellingPrice || 0,
      expectedProfit,
      description: pkg.description || '',
      urduDescription: pkg.urduDescription || '',
      internetData: pkg.internetData || '',
      onNetMinutes: pkg.onNetMinutes || '',
      offNetMinutes: pkg.offNetMinutes || '',
      sms: pkg.sms || '',
      validityStartDate: pkg.validityStartDate,
      expiryDate: pkg.expiryDate,
      lastVerifiedDate: date,
      isVerified: pkg.isVerified ?? true,
      status: pkg.status || 'active',
      createdAt: iso,
      updatedAt: iso
    };

    db.packages.unshift(newPkg);
    this.addAuditLog('Package Created', 'package', newPkg.id, user, `Added new package: ${newPkg.name} (${newPkg.network.toUpperCase()})`);
    this.persistSync();
    return newPkg;
  }

  public deletePackage(packageId: string, user: string): boolean {
    const db = this.ensureDataLoaded();
    const idx = db.packages.findIndex(p => p.id === packageId);
    if (idx === -1) return false;
    const [deleted] = db.packages.splice(idx, 1);
    this.addAuditLog('Package Deleted', 'package', packageId, user, `Deleted package: ${deleted.name}`);
    this.persistSync();
    return true;
  }

  // Customer CRUD
  public saveCustomer(cust: Partial<Customer> & { name: string; mobile: string }, user: string): Customer {
    const db = this.ensureDataLoaded();
    const { iso } = getPakistanDateTime();

    if (cust.id) {
      const idx = db.customers.findIndex(c => c.id === cust.id);
      if (idx !== -1) {
        db.customers[idx] = { ...db.customers[idx], ...cust, updatedAt: iso };
        this.addAuditLog('Customer Updated', 'customer', cust.id, user, `Updated customer ${cust.name}`);
        this.persistSync();
        return db.customers[idx];
      }
    }

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      name: cust.name,
      mobile: cust.mobile,
      address: cust.address || '',
      creditLimit: cust.creditLimit || 5000,
      previousBalance: cust.previousBalance || 0,
      currentOutstanding: cust.previousBalance || 0,
      notes: cust.notes || '',
      createdAt: iso,
      updatedAt: iso
    };

    db.customers.unshift(newCust);
    this.addAuditLog('Customer Created', 'customer', newCust.id, user, `Added customer: ${newCust.name}`);
    this.persistSync();
    return newCust;
  }

  // Supplier CRUD
  public saveSupplier(sup: Partial<Supplier> & { name: string }, user: string): Supplier {
    const db = this.ensureDataLoaded();
    const { iso } = getPakistanDateTime();

    if (sup.id) {
      const idx = db.suppliers.findIndex(s => s.id === sup.id);
      if (idx !== -1) {
        db.suppliers[idx] = { ...db.suppliers[idx], ...sup, updatedAt: iso };
        this.addAuditLog('Supplier Updated', 'supplier', sup.id, user, `Updated supplier ${sup.name}`);
        this.persistSync();
        return db.suppliers[idx];
      }
    }

    const newSup: Supplier = {
      id: `sup_${Date.now()}`,
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      mobile: sup.mobile || '',
      network: sup.network,
      previousBalance: sup.previousBalance || 0,
      currentPayable: sup.previousBalance || 0,
      notes: sup.notes || '',
      createdAt: iso,
      updatedAt: iso
    };

    db.suppliers.unshift(newSup);
    this.addAuditLog('Supplier Created', 'supplier', newSup.id, user, `Added supplier: ${newSup.name}`);
    this.persistSync();
    return newSup;
  }

  // Account Balance Adjustment (with traceable ledger entry)
  public adjustAccountBalance(accountId: string, newBalance: number, reason: string, user: string): Account {
    const db = this.ensureDataLoaded();
    const { iso, date } = getPakistanDateTime();

    const acc = db.accounts.find(a => a.id === accountId);
    if (!acc) throw new Error('Account not found.');

    const difference = newBalance - acc.currentBalance;
    const oldBalance = acc.currentBalance;
    acc.currentBalance = newBalance;
    acc.updatedAt = iso;

    db.ledgerEntries.unshift({
      id: `led_adj_${Date.now()}`,
      transactionId: `ADJ-${Date.now()}`,
      transactionType: 'adjustment',
      date: iso,
      localDate: date,
      accountId: acc.id,
      accountName: acc.name,
      entryType: difference >= 0 ? 'credit' : 'debit',
      amount: Math.abs(difference),
      balanceAfter: newBalance,
      description: `Balance Adjustment: ${reason} (Was: Rs. ${oldBalance})`,
      reference: 'MANUAL-ADJ',
      createdAt: iso
    });

    this.addAuditLog(
      'Balance Adjustment',
      'account',
      acc.id,
      user,
      `Adjusted ${acc.name} from Rs. ${oldBalance} to Rs. ${newBalance}. Reason: ${reason}`
    );

    this.persistSync();
    return acc;
  }

  // Update Settings
  public updateSettings(newSettings: Partial<BusinessSettings>, user: string): BusinessSettings {
    const db = this.ensureDataLoaded();
    db.settings = { ...db.settings, ...newSettings };
    this.addAuditLog('Settings Updated', 'settings', 'config', user, 'Updated business settings');
    this.persistSync();
    return db.settings;
  }
}

export const dbManager = new DatabaseManager();
