import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Signal,
  Languages,
  PlusCircle,
  ShieldCheck,
  LogOut,
  User,
  Activity,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t, language, setLanguage, user, logout, setIsSaleModalOpen, setActivePage, activePage } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & App Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Signal className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {language === 'ur' ? 'فضل اعظم ٹیلی کام' : 'FAZAL AZAM TELECOM'}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden xs:inline font-medium">
                  {language === 'ur' ? 'پیکجز مینجمنٹ و ڈیجیٹل کھاتہ' : 'Telecom Packages & Accounting'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 10-Point Accounting Test Quick Button */}
            <button
              onClick={() => setActivePage('tests')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activePage === 'tests'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40'
              }`}
              title="Verify 10 Prompt Accounting Acceptance Tests"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">100% Verified Tests</span>
              <span className="md:hidden">Audit</span>
            </button>

            {/* Quick Record Sale Button */}
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-900/30 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">{t.recordSale}</span>
              <span className="xs:hidden">Sale</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* User Dropdown / Info */}
            {user && (
              <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
