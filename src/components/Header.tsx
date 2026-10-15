import React from 'react';
import { ShieldCheck, FileSpreadsheet, Lock, LogOut, HeartPulse } from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  currentView: 'home' | 'form' | 'admin';
  setCurrentView: (view: 'home' | 'form' | 'admin') => void;
  onOpenAdminLogin: () => void;
  adminUser: AdminUser;
  onLogoutAdmin: () => void;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenAdminLogin,
  adminUser,
  onLogoutAdmin,
  totalRecordsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Clinical Title */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-dna text-xl sm:text-2xl text-white animate-pulse"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight">
                  Adnan Tez Formu
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <i className="fa-solid fa-house mr-1.5 opacity-70"></i>
              Ana Sayfa
            </button>

            <button
              onClick={() => setCurrentView('form')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'form'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <i className="fa-solid fa-clipboard-list text-xs"></i>
              <span>Formu Doldur</span>
            </button>

            {adminUser.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Yönetim Paneli</span>
                  <span className="sm:hidden">Panel</span>
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {totalRecordsCount}
                  </span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  title="Yönetimden Çıkış Yap"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Yönetim Girişi</span>
                <span className="sm:hidden">Giriş</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
