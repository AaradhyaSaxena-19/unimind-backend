import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-soft-md flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[#1E6BFF] fill-blue-100 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1E6BFF] rounded-full flex items-center justify-center animate-spin shadow-glow-blue">
          <Loader2 className="w-3 h-3 text-white" />
        </div>
      </div>
      <p className="font-semibold text-xs text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-xs">
        {label}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#F4F7FC]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
};

export default LoadingSpinner;
