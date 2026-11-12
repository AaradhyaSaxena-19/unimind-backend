import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getParentChildData } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Award,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  FileText,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getParentChildData();
        if (mounted) setData(res);
      } catch (err) {
        console.error('Failed to load parent portal data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Connecting to Parent Academic Portal..." />;

  const student = data?.student;
  const attendance = data?.attendance;
  const academic = data?.academic;
  const fees = data?.fees;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-3xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full">
              Parent Guardian Portal
            </span>
            <span className="text-xs font-medium text-emerald-100">
              Institutional Oversight
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Monitoring: {student?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            {student?.course} &bull; Roll No: {student?.roll_no} &bull; Semester {student?.semester}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <Link to="/fees" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto justify-center bg-white text-emerald-800 font-bold text-xs px-4 py-2.5 rounded-full shadow-soft-xs hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
              <CreditCard className="w-4 h-4" />
              <span>Fee Dues</span>
            </button>
          </Link>
          <Link to="/messages" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto justify-center bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-4 py-2.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>Contact Mentors</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Key Metrics: Attendance, Academic Rank, Fee Balance, Backlogs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Attendance Rate
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            {attendance?.percentage}%
          </span>
          <span className="text-xs font-semibold text-emerald-600 block mt-1 truncate">
            {attendance?.status}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Cumulative CGPA
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            {academic?.cgpa}
          </span>
          <span className="text-xs font-semibold text-slate-500 block mt-1 truncate">
            Standing: {academic?.rank}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Pending Fee
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight block mt-1 truncate">
            ₹{fees?.pending?.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400 block mt-1 truncate">
            Due: {fees?.due_date}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-amber-50/70 rounded-3xl border border-amber-100 shadow-soft-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block truncate">
            Active Backlogs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight block mt-1">
            {academic?.active_backlogs}
          </span>
          <span className="text-xs font-semibold text-amber-700/80 block mt-1 truncate">
            Clean Record
          </span>
        </div>
      </div>

      {/* Main Grid: Attendance Guidance & Recent Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Advice for Parents */}
        <NeoCard
          title="Attendance & Leave Supervision"
          subtitle="AKTU minimum 75% attendance rule"
          icon={CalendarCheck}
          badge={`${attendance?.percentage}% Safe`}
          badgeColor="mint"
        >
          <div className="space-y-4 text-left">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Official Leave Advisory:
              </h4>
              <p className="text-xs sm:text-sm font-normal text-slate-700 leading-relaxed">
                Your ward has attended <strong>{attendance?.days_present}</strong> out of{' '}
                <strong>{attendance?.total_days}</strong> recorded college days. Under the 75%
                policy, up to <strong>2 more days</strong> of leave are safe without entering the
                short attendance penalty zone.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft-xs">
              <span>Biometric Records: Verified Daily</span>
              <span className="text-emerald-600 font-bold">Gate Clearance: Granted</span>
            </div>
          </div>
        </NeoCard>

        {/* Recent Unit Test Marks */}
        <NeoCard
          title="Recent Internal Test Performance"
          subtitle="Continuous assessment scores"
          icon={Award}
          badge="Semester 5"
          badgeColor="blue"
        >
          <div className="space-y-2.5 text-left">
            {data?.recent_marks?.map((m, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-2xl border border-slate-100 shadow-soft-xs flex items-center justify-between text-xs font-medium hover:border-slate-200 transition-all"
              >
                <div>
                  <h5 className="font-bold text-slate-800 leading-snug">{m.subject}</h5>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{m.exam}</span>
                </div>

                <NeoBadge color="purple" size="sm">
                  {m.score}
                </NeoBadge>
              </div>
            ))}
          </div>
        </NeoCard>
      </div>

      {/* Mentor Feedback Card */}
      <NeoCard
        title="Faculty Mentor Remarks"
        subtitle="Department counseling & progress notes"
        icon={MessageSquare}
        badge="Official Note"
        badgeColor="purple"
      >
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 text-left">
          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
            "{data?.mentor_remarks}"
          </p>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pt-1">
            — Dr. Sharma, CSE Department Academic Mentor
          </span>
        </div>
      </NeoCard>
    </div>
  );
};

export default ParentDashboard;
