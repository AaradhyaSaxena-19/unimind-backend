import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchStudentAcademicData, isSupabaseConfigured } from '../services/supabase';
import { getAnalytics } from '../services/academicService';
import AttendanceWidget from '../components/student/AttendanceWidget';
import MissedLecturesList from '../components/student/MissedLecturesList';
import NeoCard from '../components/common/NeoCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CalendarCheck, AlertTriangle, BookOpen, BarChart3 } from 'lucide-react';

export const AttendancePage = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [acad, anal] = await Promise.all([
          isSupabaseConfigured() && user ? fetchStudentAcademicData(user) : null,
          getAnalytics(),
        ]);
        if (mounted) {
          setData(acad || {
            overall: { days_present: 32, total_days: 42, lectures_attended: 128, lectures_held: 168 },
            rules: { min_attendance_percent: '75', attendance_method: 'day' },
            missedLectures: [
              { subject_name: 'Database Management Systems', subject_code: 'KCS501', attendance_date: '2026-11-09', lecture_time: '10:00:00', lecture_end_time: '11:00:00', lecture_number: 2 },
              { subject_name: 'Compiler Design', subject_code: 'KCS502', attendance_date: '2026-11-08', lecture_time: '12:00:00', lecture_end_time: '13:00:00', lecture_number: 4 },
            ],
          });
          setAnalytics(anal);
        }
      } catch (err) {
        console.error('Error loading attendance:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <LoadingSpinner label="Compiling Attendance Analytics..." />;

  const subjectAttendance = analytics?.subject_attendance || [
    { code: 'KCS501', name: 'Database Management Systems', percentage: 82.6 },
    { code: 'KCS502', name: 'Compiler Design', percentage: 74.0 },
    { code: 'KCS503', name: 'Design & Analysis of Algorithms', percentage: 79.5 },
    { code: 'BNC501', name: 'Constitution of India', percentage: 85.0 },
    { code: 'KCS504', name: 'Web Technology', percentage: 71.4 },
  ];

  const trends = analytics?.attendance_trend || [
    { month: 'Aug', percentage: 85.0 },
    { month: 'Sep', percentage: 78.5 },
    { month: 'Oct', percentage: 82.0 },
    { month: 'Nov', percentage: 76.2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Title Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white rounded-3xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Attendance Center
            </span>
            <span className="text-xs font-medium text-emerald-100">
              AKTU Mandatory 75% Rule Compliance
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Comprehensive Attendance Audit
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Real-time biometric & faculty registers &bull; Mathematical leave advice &bull; Subject percentages
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {(role === 'teacher' || role === 'admin') && (
            <Link to="/teacher/attendance">
              <button
                type="button"
                className="bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-soft-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-700" />
                <span>Faculty Attendance Portal &rarr;</span>
              </button>
            </Link>
          )}

          <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/30 text-center shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
              Current Status
            </span>
            <span className="text-xl font-extrabold text-white">76.2% Safe</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance Gauge + Missed Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceWidget overall={data?.overall} rules={data?.rules} />
        </div>

        <div>
          <MissedLecturesList missedLectures={data?.missedLectures} />
        </div>
      </div>

      {/* Monthly Trends & Subject-Wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Attendance Progress */}
        <NeoCard
          title="Subject-Wise Attendance"
          subtitle="Percentage per enrolled curriculum course"
          icon={BookOpen}
          badge="Enrolled"
          badgeColor="blue"
        >
          <div className="space-y-4">
            {subjectAttendance.map((sub, idx) => {
              const isBelow = sub.percentage < 75.0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-semibold gap-1 sm:gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="bg-blue-50 text-[#1E6BFF] border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                        {sub.code}
                      </span>
                      <span className="text-slate-800 truncate">{sub.name}</span>
                    </span>
                    <span className={isBelow ? 'text-rose-600 font-bold shrink-0' : 'text-emerald-600 font-bold shrink-0'}>
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBelow ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-[1.5px] bg-slate-400 z-10"
                      style={{ left: '75%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </NeoCard>

        {/* Monthly Trend Visualizer */}
        <NeoCard
          title="Monthly Attendance Trajectory"
          subtitle="Month-over-month percentage evolution"
          icon={BarChart3}
          badge="Semester 5"
          badgeColor="purple"
        >
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-4 gap-4 items-end h-44 pb-2 border-b border-slate-100">
              {trends.map((item, idx) => {
                const heightPct = Math.round((item.percentage / 100) * 100);
                const isShort = item.percentage < 75;

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-slate-800">
                      {item.percentage}%
                    </span>
                    <div
                      className={`w-full rounded-t-2xl transition-all duration-500 ${
                        isShort ? 'bg-rose-400' : 'bg-[#1E6BFF]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs font-semibold text-slate-500">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 gap-1.5 sm:gap-0">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1E6BFF]" />
                <span>Normal Attendance</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span>Below 75% Risk Zone</span>
              </span>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Attendance Policy Guidance Box */}
      <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200/60 rounded-3xl text-left flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-slate-800">
            AKTU Ordinance Clause 4.2 &bull; Examination Admit Card Rule
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every enrolled candidate must secure a minimum aggregate attendance of <strong>75%</strong> in all registered theory lectures and laboratories. Medical concessions up to 15% are subject to Dean approval with hospital records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
