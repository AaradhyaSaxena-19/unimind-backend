import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertStyles = {
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-900',
    iconBg: 'bg-rose-100 text-rose-600',
    icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: CheckCircle,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    iconBg: 'bg-blue-100 text-[#1E6BFF]',
    icon: Info,
  },
};

export const NeoAlert = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
}) => {
  const config = alertStyles[type] || alertStyles.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bg} border rounded-2xl
        shadow-xs p-4 flex items-start gap-3 relative select-none
        ${className}
      `}
    >
      <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 text-left">
        {title && <h4 className="font-bold text-sm mb-0.5">{title}</h4>}
        <div className="text-xs font-normal leading-relaxed text-slate-700">
          {message || children}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NeoAlert;
