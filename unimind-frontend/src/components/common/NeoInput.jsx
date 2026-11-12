import React from 'react';

export const NeoInput = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            w-full bg-white text-slate-900 font-medium text-sm
            border border-slate-200 rounded-xl
            shadow-xs py-2.5 px-3.5
            ${Icon ? 'pl-10' : ''}
            focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]
            transition-all duration-150
            placeholder:text-slate-400 placeholder:font-normal
            ${error ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-100' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs font-medium text-rose-600 tracking-tight flex items-center gap-1 mt-0.5">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};

export default NeoInput;
