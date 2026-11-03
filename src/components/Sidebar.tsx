import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Radio,
  Layers,
  ShoppingCart,
  PackagePlus,
  Wallet,
  Users,
  Building2,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  History,
  ShieldCheck,
  Settings,
  HardDriveDownload,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, activePage, setActivePage, language } = useApp();

  const navGroups = [
    {
      title: language === 'ur' ? 'مرکزی مینیو' : 'Main Menu',
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'networks', label: t.networks, icon: Radio },
        { id: 'packages', label: t.packages, icon: Layers },
      ]
    },
    {
      title: language === 'ur' ? 'سیلز و خریداری' : 'Sales & Stock',
      items: [
        { id: 'sales', label: t.sales, icon: ShoppingCart },
        { id: 'purchases', label: t.purchases, icon: PackagePlus },
        { id: 'expenses', label: t.expenses, icon: Receipt },
      ]
    },
    {
      title: language === 'ur' ? 'مالیاتی کھاتہ جات' : 'Financial Accounts',
      items: [
        { id: 'accounts', label: t.accounts, icon: Wallet },
        { id: 'customers', label: t.customers, icon: Users },
        { id: 'suppliers', label: t.suppliers, icon: Building2 },
      ]
    },
    {
      title: language === 'ur' ? 'رپورٹس اور حسابات' : 'Reporting & Analytics',
      items: [
        { id: 'profit_loss', label: t.profitLoss, icon: TrendingUp },
        { id: 'reports', label: t.reports, icon: FileSpreadsheet },
        { id: 'ledger', label: t.ledger, icon: BookOpen },
        { id: 'tests', label: t.accountingAudit, icon: ShieldCheck, highlight: true },
      ]
    },
    {
      title: language === 'ur' ? 'سسٹم' : 'System',
      items: [
        { id: 'audit_logs', label: t.auditLogs, icon: History },
        { id: 'settings', label: t.settings, icon: Settings },
        { id: 'backup', label: t.backup, icon: HardDriveDownload },
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    setActivePage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-30 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${language === 'ur' ? 'right-0 md:right-auto md:left-auto md:border-r-0 md:border-l' : 'left-0'}`}
      >
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800">
          <span className="font-bold text-white text-base">
            {language === 'ur' ? 'فضل اعظم ٹیلی کام' : 'FAZAL AZAM TELECOM'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-0.5 mt-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                          : item.highlight
                          ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          100%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          <p className="font-medium text-slate-400">Fazal Azam Telecom v1.0</p>
          <p className="text-[10px] mt-0.5">PKT Standard Time (Asia/Karachi)</p>
        </div>
      </aside>
    </>
  );
};
