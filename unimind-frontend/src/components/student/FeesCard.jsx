import React from 'react';
import NeoCard from '../common/NeoCard';
import { CreditCard, Calendar } from 'lucide-react';

export const FeesCard = ({ fees = [] }) => {
  const totalPending = fees.reduce((acc, f) => acc + parseFloat(f.pending_amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + parseFloat(f.paid_amount || 0), 0);
  const totalAmount = fees.reduce((acc, f) => acc + parseFloat(f.total_amount || 0), 0);

  const isDuesCleared = totalPending === 0;

  return (
    <NeoCard
      title="Fee Ledger & Dues"
      subtitle="Tuition, Examination & College Amenities"
      icon={CreditCard}
      badge={isDuesCleared ? 'All Cleared' : `₹${totalPending.toLocaleString()} Due`}
      badgeColor={isDuesCleared ? 'mint' : 'coral'}
    >
      <div className="space-y-4">
        {/* Fee Highlights */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-left">
          <div className="p-2 sm:p-3 bg-slate-50/80 rounded-2xl border border-slate-100 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block truncate">Total</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">₹{totalAmount.toLocaleString()}</span>
          </div>

          <div className="p-2 sm:p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/60 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-emerald-600 block truncate">Paid</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-700 block truncate">₹{totalPaid.toLocaleString()}</span>
          </div>

          <div className="p-2 sm:p-3 bg-rose-50/60 rounded-2xl border border-rose-100/60 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-rose-600 block truncate">Pending</span>
            <span className="text-xs sm:text-sm font-bold text-rose-700 block truncate">₹{totalPending.toLocaleString()}</span>
          </div>
        </div>

        {/* Ledger Rows */}
        {fees.length === 0 ? (
          <p className="text-xs font-medium text-slate-400 py-3">No active fee obligations recorded.</p>
        ) : (
          <div className="space-y-2">
            {fees.map((fee, idx) => {
              const pending = parseFloat(fee.pending_amount || 0);
              return (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-2xl border border-slate-100 shadow-soft-xs flex items-center justify-between gap-3 text-left hover:border-slate-200 transition-all"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-snug">{fee.description}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {fee.due_date || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        pending > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {pending > 0 ? `₹${pending.toLocaleString()} Pending` : 'Paid'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Total: ₹{parseFloat(fee.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NeoCard>
  );
};

export default FeesCard;
