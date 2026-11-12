import React from 'react';
import NeoCard from '../common/NeoCard';
import NeoBadge from '../common/NeoBadge';
import { CheckCircle2, AlertOctagon, Calendar, TrendingUp } from 'lucide-react';

export const AttendanceWidget = ({ overall, rules }) => {
  const minPct = parseFloat(rules?.min_attendance_percent || '75');
  const method = rules?.attendance_method === 'lecture' ? 'lecture' : 'day';

  if (!overall || !overall.total_days) {
    return (
      <NeoCard title="Official Attendance" icon={Calendar} badge="Sem 5" badgeColor="blue">
        <div className="py-6 text-center">
          <p className="font-medium text-sm text-slate-400">No attendance data recorded yet for this semester.</p>
        </div>
      </NeoCard>
    );
  }

  const {
    days_present = 0,
    total_days = 0,
    lectures_attended = 0,
    lectures_held = 0,
  } = overall;

  const present = method === 'day' ? days_present : lectures_attended;
  const total = method === 'day' ? total_days : lectures_held;
  const unit = method === 'day' ? 'days' : 'lectures';
  const pct = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
  const isSafe = pct >= minPct;

  const unitsCanMiss = Math.max(Math.floor((present * 100) / minPct) - total, 0);
  const unitsNeeded = isSafe ? 0 : Math.ceil((minPct * total - 100 * present) / (100 - minPct));

  const lpd = total_days > 0 ? lectures_held / total_days : 4;
  const simulation = [1, 2, 3, 5].map((d) => {
    let afterPct = 0;
    if (method === 'day') {
      afterPct = parseFloat(((present / (total + d)) * 100).toFixed(1));
    } else {
      afterPct = parseFloat(((present / (total + d * lpd)) * 100).toFixed(1));
    }
    return {
      days: d,
      pct: afterPct,
      safe: afterPct >= minPct,
    };
  });

  return (
    <NeoCard
      title="Official Attendance Status"
      subtitle={`Evaluated ${method}-wise based on university regulations`}
      icon={Calendar}
      badge={`${pct}%`}
      badgeColor={isSafe ? 'mint' : 'coral'}
      headerBg="bg-white"
    >
      <div className="space-y-6">
        {/* Main Indicator Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/60 shadow-soft-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-xs shrink-0 ${
                isSafe ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isSafe ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertOctagon className="w-6 h-6" />
              )}
            </div>

            <div className="text-left min-w-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{pct}%</span>
              <p className="text-xs font-medium text-slate-500 truncate">
                {present} of {total} {unit} attended
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
            <NeoBadge color={isSafe ? 'mint' : 'coral'} size="sm">
              {isSafe ? 'Safe Zone' : 'Short Attendance'}
            </NeoBadge>
            <span className="text-[11px] font-medium text-slate-400 sm:mt-1">
              Threshold: {minPct}%
            </span>
          </div>
        </div>

        {/* Modern Pill Progress Bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Semester Cumulative Progress</span>
            <span>Mandatory Target: {minPct}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSafe ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
            {/* Target marker */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-slate-400 z-10"
              style={{ left: `${minPct}%` }}
              title="75% Requirement"
            />
          </div>
        </div>

        {/* Mathematical Leave Guidance Banner */}
        <div
          className={`p-4 rounded-2xl border text-left ${
            isSafe
              ? 'bg-blue-50/70 border-blue-100 text-blue-950'
              : 'bg-rose-50/70 border-rose-100 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#1E6BFF]" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Mathematical Attendance Advisory
            </h4>
          </div>
          <p className="text-xs font-normal leading-relaxed text-slate-700">
            {isSafe ? (
              <>
                You can safely miss up to{' '}
                <span className="bg-white px-2 py-0.5 rounded-full border border-blue-200 font-bold text-[#1E6BFF]">
                  {unitsCanMiss} more {unit}
                </span>{' '}
                and still remain compliant with the mandatory {minPct}% rule.
              </>
            ) : (
              <>
                No leave is safe right now! You must attend the next{' '}
                <span className="bg-white px-2 py-0.5 rounded-full border border-rose-200 font-bold text-rose-600">
                  {unitsNeeded} {unit} in a row
                </span>{' '}
                consecutively to climb back to {minPct}%.
              </>
            )}
          </p>
        </div>

        {/* Leave Impact Simulation Grid */}
        <div className="space-y-2 text-left">
          <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
            Leave Impact Projection
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {simulation.map((s) => (
              <div
                key={s.days}
                className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between"
              >
                <span className="text-[11px] font-medium text-slate-500">
                  {s.days} Day{s.days > 1 ? 's' : ''} Leave
                </span>
                <span
                  className={`text-base font-bold my-1 ${
                    s.safe ? 'text-slate-800' : 'text-rose-600'
                  }`}
                >
                  {s.pct}%
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-center ${
                    s.safe ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {s.safe ? 'Safe' : 'Below 75%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info row */}
        <div className="text-[11px] font-medium text-slate-400 text-left border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <span>Day-wise: {days_present}/{total_days} days</span>
          <span>Lecture-wise: {lectures_attended}/{lectures_held} lectures</span>
        </div>
      </div>
    </NeoCard>
  );
};

export default AttendanceWidget;
