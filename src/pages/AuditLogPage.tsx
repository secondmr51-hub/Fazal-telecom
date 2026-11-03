import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AuditLog } from '../types/index.ts';
import { formatShortDate } from '../utils/networkUtils.ts';
import {
  History,
  Search,
  Filter,
  Shield,
  RotateCcw,
  User
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { data, language, t } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const auditLogs: AuditLog[] = data?.auditLogs || [];

  const filteredLogs = auditLogs.filter(log => {
    if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchUser = log.user.toLowerCase().includes(q);
      const matchEntity = log.entityId.toLowerCase().includes(q);
      return matchAction || matchDetails || matchUser || matchEntity;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-blue-500" />
          <span>{language === 'ur' ? 'آڈٹ لاگ و سیکیورٹی ٹریکنگ' : 'Financial Audit Log & History'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'ur'
            ? 'ہر مالیاتی تبدیلی، قیمت میں ردوبدل اور ٹرانزیکشن ریورسل کا غیر مٹنے والا ریکارڈ'
            : 'Traceable immutable event log of all financial events, price updates, reversals, and user sessions'}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit details, action, user..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5"
        >
          <option value="all">All Event Types</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
          <option value="transfer">Transfers</option>
          <option value="payment">Payments</option>
          <option value="expense">Expenses</option>
          <option value="package">Package Modifications</option>
          <option value="account">Account Adjustments</option>
          <option value="customer">Customer Records</option>
          <option value="supplier">Supplier Records</option>
          <option value="auth">User Authentications</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Shield className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No audit log events match this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Timestamp (PKT)</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Entity Type</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map(log => {
                  const isReversal = log.action.toLowerCase().includes('reversed');

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatShortDate(log.timestamp)} {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                          @{log.user}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isReversal
                            ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] text-slate-400 font-mono">
                        {log.entityType}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
