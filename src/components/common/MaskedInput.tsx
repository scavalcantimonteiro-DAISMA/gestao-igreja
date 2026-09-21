import React from 'react';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: 'cpf' | 'phone' | 'cep' | 'currency';
  value: string | number;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export const applyMask = (value: string, mask: 'cpf' | 'phone' | 'cep' | 'currency'): string => {
  const clean = value.replace(/\D/g, '');

  if (mask === 'cpf') {
    return clean
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  if (mask === 'phone') {
    if (clean.length <= 10) {
      return clean
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return clean
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  if (mask === 'cep') {
    return clean
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  if (mask === 'currency') {
    const num = parseFloat(clean) / 100;
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return value;
};

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  label,
  error,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value, mask);
    onChange(masked);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        {...props}
        value={value}
        onChange={handleChange}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 ${
          error ? 'border-rose-500' : ''
        } ${className}`}
      />
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};
