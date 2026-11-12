import React from 'react';

export const NeoCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'yellow',
  headerBg = 'bg-white',
  className = '',
  shadow = 'neo',
  footer,
}) => {
  const badgeStyles = {
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    coral: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    mint: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    blue: 'bg-blue-50 text-[#1E6BFF] border border-blue-200/60',
  }[badgeColor] || 'bg-blue-50 text-[#1E6BFF] border border-blue-200/60';

  const iconBgStyles = {
    yellow: 'bg-amber-50 text-amber-600',
    coral: 'bg-rose-50 text-rose-600',
    mint: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-[#1E6BFF]',
  }[badgeColor] || 'bg-blue-50 text-[#1E6BFF]';

  return (
    <div
      className={`
        bg-white rounded-2xl md:rounded-3xl border border-slate-100
        shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]
        hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.08)]
        overflow-hidden flex flex-col transition-all duration-200
        ${className}
      `}
    >
      {(title || Icon || badge) && (
        <div
          className={`
            px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2
            ${headerBg}
          `}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {Icon && (
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBgStyles} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-bold text-sm sm:text-base text-slate-800 tracking-tight leading-snug truncate">{title}</h3>}
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {badge && (
            <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 ${badgeStyles}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1">{children}</div>

      {footer && (
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
          {footer}
        </div>
      )}
    </div>
  );
};

export default NeoCard;
