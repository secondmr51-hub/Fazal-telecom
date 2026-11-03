import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Calendar, Filter } from 'lucide-react';

export const DateFilterBar: React.FC = () => {
  const { dateFilter, setDateFilter, customDateRange, setCustomDateRange, t } = useApp();

  const options: Array<{ id: 'today' | 'yesterday' | 'last7' | 'last30' | 'this_month' | 'custom'; label: string }> = [
    { id: 'today', label: t.filterToday },
    { id: 'yesterday', label: t.filterYesterday },
    { id: 'last7', label: t.filterLast7 },
    { id: 'last30', label: t.filterLast30 },
    { id: 'this_month', label: t.filterThisMonth },
    { id: 'custom', label: t.filterCustom },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 px-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">{t.filter}:</span>
        </span>
        {options.map(opt => {
          const isSelected = dateFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setDateFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs if custom selected */}
      {dateFilter === 'custom' && (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-xs">
            <span className="text-slate-400">{t.startDate}:</span>
            <input
              type="date"
              value={customDateRange.start}
              onChange={e => setCustomDateRange({ ...customDateRange, start: e.target.value })}
              className="bg-transparent text-white focus:outline-none text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-xs">
            <span className="text-slate-400">{t.endDate}:</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={e => setCustomDateRange({ ...customDateRange, end: e.target.value })}
              className="bg-transparent text-white focus:outline-none text-xs"
            />
          </div>
        </div>
      )}

      {/* Active Timezone indicator */}
      <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <span>PKT (UTC+5) Local Accounting</span>
      </div>
    </div>
  );
};
