import React from 'react';
import NeoCard from '../common/NeoCard';
import NeoBadge from '../common/NeoBadge';
import { Clock } from 'lucide-react';

export const MissedLecturesList = ({ missedLectures = [] }) => {
  return (
    <NeoCard
      title="Recent Missed Lectures"
      subtitle="Latest missed periods recorded in system"
      icon={Clock}
      badge={missedLectures.length > 0 ? `${missedLectures.length} Logged` : 'None'}
      badgeColor={missedLectures.length > 0 ? 'coral' : 'mint'}
    >
      {missedLectures.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
          <p className="font-bold text-sm text-slate-800">🎉 No missed lectures recorded!</p>
          <p className="text-xs text-slate-500 mt-1">
            You have a 100% attendance streak in recent sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {missedLectures.map((lec, idx) => {
            const timeSlot =
              lec.lecture_time && lec.lecture_end_time
                ? `${lec.lecture_time.slice(0, 5)} - ${lec.lecture_end_time.slice(0, 5)}`
                : lec.lecture_time
                ? lec.lecture_time.slice(0, 5)
                : 'Time slot N/A';

            return (
              <div
                key={idx}
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-soft-xs flex items-center justify-between gap-2.5 sm:gap-3 text-left hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                    #{lec.lecture_number || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 leading-snug truncate">
                      {lec.subject_name || 'Subject'}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {lec.attendance_date}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                        {timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <NeoBadge color="coral" size="xs">
                    {lec.subject_code}
                  </NeoBadge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </NeoCard>
  );
};

export default MissedLecturesList;
