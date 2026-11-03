import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Signal, Lock, User, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, language, setLanguage, t } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/20">
          <Signal className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {language === 'ur' ? 'فضل اعظم ٹیلی کام' : 'FAZAL AZAM TELECOM'}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'ur'
            ? 'پیکجز مینجمنٹ اور ڈیجیٹل اکاؤنٹنگ سسٹم میں لاگ ان کریں'
            : 'Telecom Package Management & Digital Accounting System'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/40 active:scale-95 transition-all"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick preset credentials */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
            <span className="text-[11px] text-slate-400 block font-semibold text-center uppercase tracking-wider">
              Quick Role Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 text-[11px]"
              >
                <div className="font-bold text-white">Admin / Owner</div>
                <div className="text-[10px] text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cashier', 'cashier123')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 text-[11px]"
              >
                <div className="font-bold text-white">Counter Cashier</div>
                <div className="text-[10px] text-slate-400">cashier / cashier123</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              {language === 'en' ? 'اردو میں استعمال کریں' : 'Switch to English'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
