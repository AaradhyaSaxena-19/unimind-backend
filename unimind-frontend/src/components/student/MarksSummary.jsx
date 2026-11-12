import React from 'react';
import NeoCard from '../common/NeoCard';
import NeoBadge from '../common/NeoBadge';
import { Award } from 'lucide-react';

export const MarksSummary = ({ marks = [], subjects = [] }) => {
  const subjectMap = {};
  subjects.forEach((s) => {
    subjectMap[s.id] = s;
  });

  const marksBySubject = {};
  let totalObtained = 0;
  let totalMax = 0;

  marks.forEach((m) => {
    if (!marksBySubject[m.subject_id]) {
      marksBySubject[m.subject_id] = [];
    }
    marksBySubject[m.subject_id].push(m);
    totalObtained += parseFloat(m.marks_obtained || 0);
    totalMax += parseFloat(m.max_marks || 0);
  });

  const overallPct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  return (
    <NeoCard
      title="Internal Marks & Tests"
      subtitle="Unit Tests, Assignments & Mid-Term Evaluations"
      icon={Award}
      badge={totalMax > 0 ? `${overallPct}% Overall` : 'No Marks'}
      badgeColor="purple"
    >
      {Object.keys(marksBySubject).length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
          <p className="font-bold text-sm text-slate-800">No marks published yet for this semester.</p>
          <p className="text-xs text-slate-400 mt-1">
            Faculty submissions will appear here once entered.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(marksBySubject).map(([subjectId, items]) => {
              const sub = subjectMap[subjectId] || { code: 'SUB', name: 'Subject' };
              const subObtained = items.reduce((acc, curr) => acc + parseFloat(curr.marks_obtained || 0), 0);
              const subMax = items.reduce((acc, curr) => acc + parseFloat(curr.max_marks || 0), 0);
              const subPct = subMax > 0 ? ((subObtained / subMax) * 100).toFixed(1) : 0;

              return (
                <div
                  key={subjectId}
                  className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-soft-xs text-left space-y-2 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#1E6BFF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {sub.code}
                      </span>
                      <h5 className="font-bold text-xs text-slate-800 line-clamp-1 mt-1">
                        {sub.name}
                      </h5>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {subPct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1E6BFF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${subPct}%` }}
                    />
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] text-slate-600"
                      >
                        <span className="truncate">{it.exam_type}</span>
                        <span className="font-semibold text-slate-900">
                          {it.marks_obtained}/{it.max_marks}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </NeoCard>
  );
};

export default MarksSummary;
