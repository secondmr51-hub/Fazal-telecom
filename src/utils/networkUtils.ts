import { TelecomNetwork, NetworkMeta } from '../types/index.ts';

export const NETWORK_METAS: Record<TelecomNetwork, NetworkMeta> = {
  jazz: {
    id: 'jazz',
    name: 'Jazz',
    urduName: 'جاز',
    themeColor: '#D9232D',
    secondaryColor: '#FFB300',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: 'text-red-700',
    borderColor: 'border-red-500',
    gradient: 'from-red-600 to-amber-600'
  },
  zong: {
    id: 'zong',
    name: 'Zong',
    urduName: 'زونگ',
    themeColor: '#1BA754',
    secondaryColor: '#E6007E',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-500',
    gradient: 'from-emerald-600 to-teal-600'
  },
  telenor: {
    id: 'telenor',
    name: 'Telenor',
    urduName: 'ٹیلی نار',
    themeColor: '#00A9E0',
    secondaryColor: '#003A70',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-700',
    borderColor: 'border-sky-500',
    gradient: 'from-sky-600 to-blue-700'
  },
  ufone: {
    id: 'ufone',
    name: 'Ufone',
    urduName: 'یو فون',
    themeColor: '#F37021',
    secondaryColor: '#30773A',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-500',
    gradient: 'from-orange-600 to-amber-700'
  }
};

export function formatCurrency(amount: number, symbol = 'Rs.'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol} 0`;
  const formatted = Math.abs(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  return amount < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.substring(0, 10).split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
