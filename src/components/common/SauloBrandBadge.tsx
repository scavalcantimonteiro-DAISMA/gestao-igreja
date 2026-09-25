import React from 'react';
import { Code2, ShieldCheck, Sparkles } from 'lucide-react';

interface SauloBrandBadgeProps {
  onOpenMaster?: () => void;
  compact?: boolean;
}

export const SauloBrandBadge: React.FC<SauloBrandBadgeProps> = ({ onOpenMaster, compact = false }) => {
  if (compact) {
    return (
      <button
        onClick={onOpenMaster}
        title="Painel Master SaaS - SCM Tech"
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-md transition-all text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
          <img src="/logo-scm-tech-icon.png" alt="SCM Tech" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors tracking-tight">
              SCM Tech
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-sky-100 text-sky-800 border border-sky-200 rounded">
              SaaS Admin
            </span>
          </div>
          <span className="text-[10px] text-slate-500 leading-tight">
            Desenvolvimento de Software
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-200/80 shadow-sm p-5 sm:p-6">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 p-1 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo-scm-tech-icon.png" alt="SCM Tech" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wider">
                SCM Tech
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sky-600" /> Plataforma SaaS
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-sky-700 tracking-wide">
              DESENVOLVIMENTO DE SOFTWARE
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Saulo Monteiro • Soluções Tecnológicas Profissionais
            </p>
          </div>
        </div>

        {onOpenMaster && (
          <button
            onClick={onOpenMaster}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Acesso Master Admin
          </button>
        )}
      </div>
    </div>
  );
};
