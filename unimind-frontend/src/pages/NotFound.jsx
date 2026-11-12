import React from 'react';
import { Link } from 'react-router-dom';
import NeoButton from '../components/common/NeoButton';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-soft p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center mx-auto shadow-soft-xs">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-base font-bold text-slate-800">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested page does not exist or has been relocated in the academic portal.
        </p>

        <div className="pt-2">
          <Link to="/">
            <NeoButton variant="primary" size="md" icon={Home} className="rounded-full">
              Back to Campus
            </NeoButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
