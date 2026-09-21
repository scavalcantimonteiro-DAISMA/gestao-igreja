import React from 'react';
import { Church } from '../../types';

interface ChurchBrandLogoProps {
  church: Church;
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
}

export const ChurchBrandLogo: React.FC<ChurchBrandLogoProps> = ({ 
  church, 
  variant = 'full',
  className = '' 
}) => {
  const isCBA = church.slug === 'cbacolher' || church.id === 'church_cba_maceio';

  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 border border-sky-200 p-1 flex items-center justify-center shadow-sm">
          {isCBA ? (
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              {/* Ícone de Chama e Coração Entrelaçados CBA */}
              <path
                d="M50 18 C35 30 20 48 20 65 C20 78 32 88 47 88 C49 88 51 87.8 53 87.5 C43 83 38 72 40 62 C42 52 50 44 54 36 C57 44 65 52 65 64 C65 72 61 78 55 83 C68 83 80 75 80 62 C80 46 65 30 50 18 Z"
                fill="url(#cbaGlow)"
              />
              <defs>
                <linearGradient id="cbaGlow" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E0F2FE" />
                  <stop offset="1" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <span className="font-bold text-white text-sm">{church.name[0]}</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-slate-900 truncate tracking-tight">{church.name}</span>
          <span className="text-[11px] text-slate-500 truncate">{church.city} - {church.state}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 border border-sky-200 p-1.5 flex items-center justify-center shadow-sm">
          {isCBA ? (
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path
                d="M50 16 C34 29 18 47 18 65 C18 79 31 90 47 90 C49 90 51 89.8 53 89.5 C43 84 37 72 40 61 C42 51 50 43 54 34 C57 43 66 51 66 64 C66 73 61 80 55 85 C70 85 82 76 82 62 C82 45 66 29 50 16 Z"
                fill="url(#cbaCompactGlow)"
              />
              <defs>
                <linearGradient id="cbaCompactGlow" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E0F2FE" />
                  <stop offset="1" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <span className="font-bold text-white text-base">{church.name[0]}</span>
          )}
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-900 tracking-tight leading-tight">{church.name}</h1>
          <p className="text-xs text-slate-500">{church.city} - {church.state} {church.instagram && `• ${church.instagram}`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 ${className}`}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#091B2B] via-[#0E273C] to-sky-950 border border-sky-400/40 p-2.5 flex items-center justify-center shadow-2xl shrink-0 glow-cyan">
        {isCBA ? (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path
              d="M50 14 C33 28 16 47 16 66 C16 81 30 92 47 92 C49.5 92 52 91.8 54 91.3 C43 85 36 72 39 60 C42 49 50 41 54 32 C58 41 67 50 67 63 C67 73 62 80 55 86 C71 86 84 76 84 62 C84 44 67 27 50 14 Z"
              fill="url(#cbaFullGlow)"
            />
            <defs>
              <linearGradient id="cbaFullGlow" x1="16" y1="14" x2="84" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#0EA5E9" />
                <stop offset="1" stopColor="#0284C7" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          <span className="font-black text-sky-400 text-3xl">{church.name[0]}</span>
        )}
      </div>

      <div className="text-center sm:text-left flex-1">
        <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">
          COMUNIDADE
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
          {church.name.toUpperCase()}
        </h1>
        {isCBA && (
          <div className="text-xs sm:text-sm font-semibold text-sky-300/90 tracking-wide mt-0.5">
            A CHAMA QUE NOS MOVE É O AMOR
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-300 mt-2">
          <span>{church.address}</span>
          <span>•</span>
          <span>{church.city} - {church.state}</span>
          {church.instagram && (
            <>
              <span>•</span>
              <a
                href={`https://instagram.com/${church.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 transition-colors"
              >
                {church.instagram}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
