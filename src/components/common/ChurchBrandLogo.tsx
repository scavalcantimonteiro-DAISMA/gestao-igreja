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
  const logo = church.logoUrl || (isCBA ? '/logo-cba-completa.png' : '');

  if (logo) {
    if (variant === 'badge') {
      return (
        <div className={`flex items-center ${className}`}>
          <img 
            src={logo} 
            alt={church.name} 
            className="h-8 w-auto max-w-[170px] object-contain rounded-lg shadow-sm"
          />
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div className={`flex items-center ${className}`}>
          <img 
            src={logo} 
            alt={church.name} 
            className="h-10 sm:h-12 w-auto max-w-[240px] sm:max-w-[300px] object-contain rounded-xl shadow-sm hover:scale-[1.01] transition-transform"
          />
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center sm:items-start gap-3 ${className}`}>
        <img 
          src={logo} 
          alt={church.name} 
          className={`h-16 sm:h-20 w-auto max-w-full object-contain rounded-2xl shadow-xl border border-sky-300/40 ${
            isCBA ? 'bg-[#0B69A3]' : 'bg-white p-1'
          }`}
        />
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-sky-100 font-medium">
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
                className="text-white hover:underline font-bold"
              >
                {church.instagram}
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  // Fallback para outras igrejas cadastradas no SaaS
  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {church.name[0]}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs text-slate-900 truncate">{church.name}</span>
          <span className="text-[10px] text-slate-500 truncate">{church.city} - {church.state}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
          {church.name[0]}
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-tight">{church.name}</h1>
          <p className="text-[11px] text-slate-500">{church.city} - {church.state}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
        {church.name[0]}
      </div>
      <div className="text-center sm:text-left flex-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {church.name}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{church.address} • {church.city} - {church.state}</p>
      </div>
    </div>
  );
};
