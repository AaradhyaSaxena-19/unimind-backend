import React from 'react';

const badgeColors = {
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  coral: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
  mint: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  pink: 'bg-pink-50 text-pink-700 border border-pink-200/60',
  blue: 'bg-blue-50 text-[#1E6BFF] border border-blue-200/60',
  white: 'bg-white text-slate-700 border border-slate-200 shadow-xs',
  dark: 'bg-slate-800 text-white',
};

export const NeoBadge = ({
  children,
  color = 'yellow',
  size = 'sm',
  className = '',
  icon: Icon,
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold rounded-md',
    sm: 'px-2.5 py-1 text-xs font-semibold rounded-full',
    md: 'px-3.5 py-1.5 text-sm font-bold rounded-full',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 select-none
        ${badgeColors[color] || badgeColors.yellow}
        ${sizeStyles[size] || sizeStyles.sm}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </span>
  );
};

export default NeoBadge;
