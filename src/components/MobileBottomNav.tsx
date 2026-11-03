import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Layers,
  ShoppingCart,
  Wallet,
  FileSpreadsheet
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { t, activePage, setActivePage } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'packages', label: t.packages, icon: Layers },
    { id: 'sales', label: t.sales, icon: ShoppingCart },
    { id: 'accounts', label: t.accounts, icon: Wallet },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
              <span className="text-[10px] truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
