import React, { useState, useEffect } from 'react';
import { getTimetable } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Clock, Calendar, MapPin, User, Sparkles, BookOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePage = () => {
  const [activeDay, setActiveDay] = useState('Monday');
  const [timetable, setTimetable] = useState(null);
  const [todayName, setTodayName] = useState('Monday');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getTimetable();
        if (mounted) {
          setTimetable(data.timetable || {});
          if (data.today && DAYS.includes(data.today)) {
            setActiveDay(data.today);
            setTodayName(data.today);
          }
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading Academic Timetable..." />;

  const currentSchedule = timetable?.[activeDay] || [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600 via-[#1E6BFF] to-indigo-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Class Schedule
            </span>
            <span className="text-xs font-medium text-blue-100">
              Odd Semester 2026-27 &bull; Section A
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Weekly Lecture Timetable
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Real-time classroom allocations &bull; Faculty periods &bull; Practical Lab sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-white text-slate-800 px-3.5 py-1.5 rounded-full shadow-soft-xs">
            Today is <strong>{todayName}</strong>
          </span>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {DAYS.map((day) => {
          const isToday = day === todayName;
          const isSelected = day === activeDay;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`
                px-4 py-2 rounded-full font-semibold text-xs tracking-wide transition-all cursor-pointer shrink-0
                ${
                  isSelected
                    ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }
              `}
            >
              <div className="flex items-center gap-1.5">
                <span>{day}</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Schedule Period Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1E6BFF]" />
            <span>{activeDay}'s Lectures ({currentSchedule.length} Periods)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Venue: Academic Block 3 & Labs
          </span>
        </div>

        {currentSchedule.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-soft">
            <p className="font-bold text-base text-slate-800">No scheduled lectures for {activeDay}.</p>
            <p className="text-xs text-slate-400 mt-1">
              Enjoy your self-study session or project work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSchedule.map((item, idx) => {
              const isLab = item.is_lab;
              return (
                <div
                  key={idx}
                  className={`
                    p-5 rounded-3xl border transition-all shadow-soft-xs hover:shadow-soft flex flex-col justify-between gap-3
                    ${isLab ? 'bg-cyan-50/50 border-cyan-100' : 'bg-white border-slate-100'}
                  `}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E6BFF] font-bold text-xs flex items-center justify-center">
                        #{item.period}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {item.time}
                      </span>
                    </div>

                    <NeoBadge color={isLab ? 'coral' : 'purple'} size="xs">
                      {isLab ? 'Practical Lab' : 'Theory'}
                    </NeoBadge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#1E6BFF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {item.subject_code}
                    </span>
                    <h4 className="font-bold text-base text-slate-800 leading-snug">
                      {item.subject_name}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.faculty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">Room {item.room}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetablePage;
