import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#1E6BFF] text-white hover:bg-[#155BE5] shadow-[0_4px_14px_0_rgba(30,107,255,0.35)] active:scale-[0.98]',
  secondary: 'bg-[#EBF3FE] text-[#1E6BFF] hover:bg-blue-100/80 border border-blue-200/50 active:scale-[0.98]',
  accent: 'bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-[0_4px_14px_0_rgba(245,158,11,0.25)] active:scale-[0.98]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] active:scale-[0.98]',
  white: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 active:scale-[0.98]',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_4px_14px_0_rgba(244,63,94,0.3)] active:scale-[0.98]',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3 text-base font-bold rounded-2xl',
};

export const NeoButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        cursor-pointer select-none font-medium
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default NeoButton;
