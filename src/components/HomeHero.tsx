import React, { useState } from 'react';
import { Shield, Database, ChevronRight, TestTube2, Printer, Download } from 'lucide-react';
import { exportBlankFormPdf } from '../utils/exportUtils';
import { PrintableBlankFormModal } from './PrintableBlankFormModal';

interface HomeHeroProps {
  onGoToForm: () => void;
  onGoToAdmin: () => void;
  totalPatientsCount: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onGoToForm,
  onGoToAdmin,
  totalPatientsCount
}) => {
  const [isBlankFormModalOpen, setIsBlankFormModalOpen] = useState(false);

  return (
    <div className="relative overflow-hidden py-12 sm:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-100/70 min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        
        {/* Prominent Mor Tüp Kan Alınacak Alert Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-purple-50 border-2 border-purple-400 text-purple-900 text-sm sm:text-base font-extrabold mb-10 shadow-md shadow-purple-500/10 animate-pulse">
          <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <TestTube2 className="w-4 h-4" />
          </div>
          <span className="tracking-wide">Hastadan Mor Tüp Kan Alınacak</span>
        </div>

        {/* THE TWO LARGE SLEEK BUTTONS (Clean, no sub-descriptions) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto w-full">
          
          {/* Button 1: Formu Doldur */}
          <button
            onClick={onGoToForm}
            className="w-full sm:w-1/2 group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-xl shadow-indigo-600/25 hover:shadow-2xl hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all duration-200 text-left cursor-pointer border border-indigo-500/30 overflow-hidden"
          >
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xl shadow-inner group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-file-waveform"></i>
              </div>
            </div>

            <div className="font-extrabold text-2xl tracking-tight text-white flex items-center justify-between">
              <span>Formu Doldur</span>
              <ChevronRight className="w-6 h-6 text-indigo-200 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>

          {/* Button 2: Yönetim Paneli (Admin) */}
          <button
            onClick={onGoToAdmin}
            className="w-full sm:w-1/2 group relative p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-1 transition-all duration-200 text-left cursor-pointer border-2 border-slate-200 hover:border-indigo-400 overflow-hidden"
          >
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-indigo-50 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xl shadow-inner group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>{totalPatientsCount} Kayıt</span>
              </div>
            </div>

            <div className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center justify-between">
              <span>Yönetim Paneli</span>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>

        </div>

        {/* Quick Manual Blank Form Options */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsBlankFormModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-purple-900 hover:text-purple-950 border border-purple-200 hover:border-purple-400 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-purple-600" />
            <span>Boş Formu Önizle & Yazdır (A4)</span>
          </button>

          <button
            type="button"
            onClick={exportBlankFormPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 hover:text-purple-950 border border-purple-200 text-xs font-bold transition-all shadow-2xs hover:shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Boş Formu PDF Olarak İndir</span>
          </button>
        </div>

      </div>

      {/* Printable Blank Form Modal */}
      <PrintableBlankFormModal
        isOpen={isBlankFormModalOpen}
        onClose={() => setIsBlankFormModalOpen(false)}
      />

    </div>
  );
};
