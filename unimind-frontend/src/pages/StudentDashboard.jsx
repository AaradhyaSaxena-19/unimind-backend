import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchStudentAcademicData, isSupabaseConfigured } from '../services/supabase';
import { getTimetable, getAnnouncements, getExams, getEvents } from '../services/academicService';
import { getMe } from '../services/linkageService';
import AttendanceWidget from '../components/student/AttendanceWidget';
import MissedLecturesList from '../components/student/MissedLecturesList';
import MarksSummary from '../components/student/MarksSummary';
import FeesCard from '../components/student/FeesCard';
import NeoCard from '../components/common/NeoCard';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MessageSquare,
  BookOpen,
  CheckSquare,
  Sparkles,
  Clock,
  Calendar,
  Award,
  Megaphone,
  ArrowRight,
  FileCheck2,
  Database,
  Cpu,
  Layers,
  Globe,
  Trophy,
  Play,
  CheckCircle2,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

// Turn the connected /api/academic/me payload into the shape the dashboard widgets use.
const buildSubjectsFromTimetable = (timetable = {}) => {
  const seen = new Map();
  Object.values(timetable).forEach((slots) => {
    (slots || []).forEach((slot) => {
      if (!seen.has(slot.subject_code)) {
        seen.set(slot.subject_code, {
          id: slot.subject_code,
          code: slot.subject_code,
          name: slot.subject_name,
        });
      }
    });
  });
  return Array.from(seen.values());
};

const mapMeToDashboard = (me, timetable) => {
  if (!me || me.role !== 'student') return null;
  const items = me.assignments?.items || [];
  const fees = me.fees || {};
  const pct = me.attendance?.percentage ?? 0;

  return {
    profile: me.profile,
    rules: { min_attendance_percent: '75', attendance_method: 'lecture', lectures_per_day: '4' },
    overall: {
      days_present: Math.round((42 * pct) / 100),
      total_days: 42,
      lectures_attended: me.attendance?.lectures_attended || 0,
      lectures_held: me.attendance?.lectures_held || 168,
    },
    monthly: [],
    missedLectures: [],
    subjects: buildSubjectsFromTimetable(timetable),
    marks: items
      .filter((item) => item.marks_awarded !== null && item.marks_awarded !== undefined)
      .map((item) => ({
        subject_id: item.subject_code,
        exam_type: item.title.length > 30 ? `${item.title.slice(0, 30)}...` : item.title,
        marks_obtained: item.marks_awarded,
        max_marks: item.max_marks,
      })),
    fees: [
      {
        description: 'Semester academic, exam & amenity fee',
        total_amount: fees.total_fee || 0,
        paid_amount: fees.paid_fee || 0,
        pending_amount: fees.pending_fee || 0,
        due_date: fees.next_due_date || 'Cleared',
      },
    ],
    assignments: items.map((item) => ({
      id: item.id,
      title: item.title,
      due_date: item.due_date,
      isSubmitted: item.is_submitted,
    })),
    results: me.results,
    faculty: me.faculty,
    resume: me.resume,
    applications: me.applications,
  };
};

export const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [acad, me, tt, ann, ex, _ev] = await Promise.all([
          isSupabaseConfigured() && user ? fetchStudentAcademicData(user) : null,
          getMe().catch(() => null),
          getTimetable().catch(() => ({ timetable: {} })),
          getAnnouncements().catch(() => ({ announcements: [] })),
          getExams().catch(() => ({ exams: [] })),
          getEvents().catch(() => ({ events: [] })),
        ]);

        if (mounted) {
          setData(
            mapMeToDashboard(me, tt.timetable) || acad || {
              profile: profile || {
                full_name: 'Kanishka Saxena',
                course: 'B.Tech Computer Science & Engineering',
                year: 3,
                semester: 5,
                roll_no: '210161010001',
                camu_id: 'RBMI2021001',
                college: 'RBMI Group of Institutions, Bareilly',
              },
              rules: {
                min_attendance_percent: '75',
                attendance_method: 'day',
                lectures_per_day: '4',
              },
              overall: {
                days_present: 32,
                total_days: 42,
                lectures_attended: 128,
                lectures_held: 168,
              },
              missedLectures: [
                {
                  subject_name: 'Database Management Systems',
                  subject_code: 'KCS501',
                  attendance_date: '2026-11-09',
                  lecture_time: '10:00:00',
                  lecture_end_time: '11:00:00',
                  lecture_number: 2,
                },
                {
                  subject_name: 'Compiler Design',
                  subject_code: 'KCS502',
                  attendance_date: '2026-11-08',
                  lecture_time: '12:00:00',
                  lecture_end_time: '13:00:00',
                  lecture_number: 4,
                },
              ],
              subjects: [
                { id: 'sub-1', code: 'KCS501', name: 'Database Management Systems', semester: 5 },
                { id: 'sub-2', code: 'KCS502', name: 'Compiler Design', semester: 5 },
                { id: 'sub-3', code: 'BNC501', name: 'Constitution of India', semester: 5 },
              ],
              marks: [
                { subject_id: 'sub-1', exam_type: 'Unit Test 1', marks_obtained: 24, max_marks: 30 },
                { subject_id: 'sub-1', exam_type: 'Assignment 1', marks_obtained: 18, max_marks: 20 },
                { subject_id: 'sub-2', exam_type: 'Unit Test 1', marks_obtained: 22, max_marks: 30 },
                { subject_id: 'sub-3', exam_type: 'Unit Test 1', marks_obtained: 27, max_marks: 30 },
              ],
              fees: [
                { description: 'Semester 5 Tuition Fee', total_amount: 55000, paid_amount: 35000, pending_amount: 20000, due_date: '2026-11-30' },
                { description: 'University Examination Fee', total_amount: 6500, paid_amount: 0, pending_amount: 6500, due_date: '2026-12-15' },
              ],
              assignments: [
                { id: 'a1', title: 'ER Model to Relational Schema Conversion', due_date: '2026-11-20', isSubmitted: true },
                { id: 'a2', title: 'Lexical Analyzer Implementation in C', due_date: '2026-11-28', isSubmitted: false },
                { id: 'a3', title: 'Dynamic Programming vs Greedy Algorithms', due_date: '2026-12-05', isSubmitted: false },
              ],
            }
          );

          const dayName = tt.today || 'Monday';
          setTodayClasses(tt.timetable?.[dayName] || tt.timetable?.['Monday'] || []);
          setAnnouncements((ann.announcements || []).slice(0, 2));
          setUpcomingExams((ex.exams || []).slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [user, profile]);

  if (loading) return <LoadingSpinner label="Loading Unified Academic Cloud..." />;

  const studentProfile = data?.profile || profile;
  const pendingTasks = (data?.assignments || []).filter((a) => !a.isSubmitted && !a.is_submitted);
  const attendancePct = data?.overall?.total_days
    ? Math.round((data.overall.days_present / data.overall.total_days) * 100)
    : 76;

  // Circular gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendancePct / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 text-left">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (Cols 1-8 on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Greeting Banner - Clean Blue University Style */}
          <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-blue-700 via-[#1E6BFF] to-blue-600 text-white shadow-glow-blue">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                  AKTU B.Tech CSE &bull; Semester {studentProfile?.semester || 5}
                </span>
                <span className="text-[11px] font-medium text-blue-100 font-mono">
                  Roll: {studentProfile?.roll_no || '210161010001'}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {studentProfile?.full_name?.split(' ')[0] || 'Kanishka'}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg leading-relaxed">
                  Session 2026-27 &bull; Your attendance is standing at a safe <strong className="text-white">{attendancePct}%</strong>. Check today's schedule and assignments below.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <Link to="/chat" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#1E6BFF] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-soft-xs hover:shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-blue-100" />
                    <span>Ask AI Academic Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <Link to="/timetable" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-colors cursor-pointer text-center justify-center"
                  >
                    Today's Schedule
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-colors cursor-pointer text-center justify-center"
                  >
                    Curriculum & Subjects
                  </button>
                </Link>

                <Link to="/jobs" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-center justify-center flex items-center gap-1.5"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Job Finds</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Overall Attendance
              </span>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight block mt-1">
                {attendancePct}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5 truncate">
                Safe (&ge;75% Cutoff)
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Scheduled Today
              </span>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight block mt-1">
                {todayClasses.length || 4}
              </span>
              <span className="text-[11px] font-medium text-slate-500 block mt-0.5 truncate">
                Lectures & Labs
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Tasks Pending
              </span>
              <span className="text-2xl font-extrabold text-[#1E6BFF] tracking-tight block mt-1">
                {pendingTasks.length}
              </span>
              <span className="text-[11px] font-medium text-slate-500 block mt-0.5 truncate">
                Due this week
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Internal CGPA
              </span>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight block mt-1">
                {data?.results?.current_cgpa ?? '—'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5 truncate">
                {data?.results?.published === false ? 'Result awaited' : `Published · Sem ${studentProfile?.semester || 5}`}
              </span>
            </div>
          </div>

          {/* In-Progress Coursework Spotlight */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Study Module
              </span>
              <span className="text-xs font-semibold text-[#1E6BFF] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                Unit 3 of 5
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0 border border-blue-100">
                  <Database className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 leading-snug truncate">
                    Database Management Systems
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Relational Normalization & BCNF &bull; Prof. Dr. S.K. Sharma
                  </p>
                </div>
              </div>

              <Link to="/study-material" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-[#1E6BFF] hover:bg-[#155BE5] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-glow-blue transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open Notes</span>
                </button>
              </Link>
            </div>

            {/* Attendance Progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Lecture Coverage: 38/42 Sessions</span>
                <span className="font-bold text-slate-800">90.5% Attendance</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E6BFF] h-full rounded-full transition-all duration-500"
                  style={{ width: '90.5%' }}
                />
              </div>
            </div>
          </div>

          {/* Current Semester Subjects (Modern University Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1E6BFF]" />
                <span>Current Semester Subjects</span>
              </h2>
              <Link to="/courses" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                <span>View Full Curriculum</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Subject 1: DBMS */}
              <div className="bg-white hover:border-blue-200 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1E6BFF] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    KCS501
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Database Management Systems</h4>
                  <p className="text-xs text-slate-500 mt-0.5">38 / 42 Lectures &bull; Dr. S.K. Sharma</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1E6BFF] h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              {/* Subject 2: Compiler Design */}
              <div className="bg-white hover:border-blue-200 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    KCS502
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Compiler Design</h4>
                  <p className="text-xs text-slate-500 mt-0.5">32 / 40 Lectures &bull; Dr. Ananya Sen</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Subject 3: DAA */}
              <div className="bg-white hover:border-blue-200 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                    KCS503
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Design & Analysis of Algorithms</h4>
                  <p className="text-xs text-slate-500 mt-0.5">40 / 42 Lectures &bull; Prof. Rajesh Verma</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              {/* Subject 4: Web Tech */}
              <div className="bg-white hover:border-blue-200 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100">
                    KCS504
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Web Tech & Cloud Computing</h4>
                  <p className="text-xs text-slate-500 mt-0.5">28 / 36 Lectures &bull; Er. Neha Dixit</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
            {[
              { label: 'Timetable', path: '/timetable', icon: Clock, bg: 'bg-blue-50 text-[#1E6BFF]' },
              { label: 'Attendance', path: '/attendance', icon: Calendar, bg: 'bg-emerald-50 text-emerald-600' },
              { label: 'Courses', path: '/courses', icon: GraduationCap, bg: 'bg-indigo-50 text-indigo-600' },
              { label: 'Tasks', path: '/assignments', icon: FileCheck2, bg: 'bg-purple-50 text-purple-600' },
              { label: 'Tests', path: '/assessments', icon: Sparkles, bg: 'bg-rose-50 text-rose-600' },
              { label: 'Exams', path: '/exams', icon: Calendar, bg: 'bg-amber-50 text-amber-600' },
              { label: 'Report Card', path: '/results', icon: Award, bg: 'bg-sky-50 text-sky-600' },
              { label: 'E-Library', path: '/study-material', icon: BookOpen, bg: 'bg-teal-50 text-teal-600' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-2 sm:p-3 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:border-blue-200 flex flex-col items-center gap-1.5 sm:gap-2 transition-all hover:-translate-y-0.5"
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 truncate max-w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Today's Classes & Important Circular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Schedule Card */}
            <NeoCard
              title="Today's Classes"
              subtitle="Live periods & lab sessions"
              icon={Clock}
              badge="Today"
              badgeColor="blue"
              footer={
                <Link to="/timetable" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                  <span>Weekly Timetable</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="space-y-2.5">
                {todayClasses.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E6BFF] font-bold text-xs flex items-center justify-center">
                        #{item.period}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-800 leading-tight">{item.subject_name}</h5>
                        <span className="text-[11px] text-slate-400">
                          {item.faculty} &bull; Room {item.room}
                        </span>
                      </div>
                    </div>
                    <NeoBadge color="purple" size="xs">
                      {item.time}
                    </NeoBadge>
                  </div>
                ))}
              </div>
            </NeoCard>

            {/* Important Circular Notice */}
            <NeoCard
              title="Important Notice"
              subtitle="Controller of Examinations"
              icon={Megaphone}
              badge="Official"
              badgeColor="blue"
              footer={
                <Link to="/announcements" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                  <span>All Notices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              {announcements[0] ? (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 leading-snug">
                    {announcements[0].title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {announcements[0].content}
                  </p>
                  <span className="text-[11px] font-medium text-slate-400 block pt-1">
                    Issued: {announcements[0].date}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No urgent notices today.</p>
              )}
            </NeoCard>
          </div>

          {/* Attendance Status & Missed Lectures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceWidget overall={data?.overall} rules={data?.rules} />
            <MissedLecturesList missedLectures={data?.missedLectures} />
          </div>

          {/* Internal Marks & Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarksSummary marks={data?.marks} subjects={data?.subjects} />
            <FeesCard fees={data?.fees} />
          </div>

          {/* Coursework Tasks & Upcoming Exams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Assignments */}
            <NeoCard
              title="Coursework Tasks"
              subtitle="Pending submissions"
              icon={CheckSquare}
              badge={`${pendingTasks.length} Pending`}
              badgeColor={pendingTasks.length > 0 ? 'coral' : 'mint'}
              footer={
                <Link to="/assignments" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                  <span>Go to Assignments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="space-y-2.5">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-800 leading-tight">{t.title}</h5>
                      <span className="text-[11px] text-slate-400">
                        Due: {t.due_date?.slice(0, 10)}
                      </span>
                    </div>
                    <NeoBadge color="coral" size="xs">
                      Pending
                    </NeoBadge>
                  </div>
                ))}
              </div>
            </NeoCard>

            {/* Upcoming Exams */}
            <NeoCard
              title="Exam Schedule"
              subtitle="AKTU Odd Semester Dates"
              icon={Calendar}
              badge="Admit Card Ready"
              badgeColor="blue"
              footer={
                <Link to="/exams" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                  <span>View All Exams</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="space-y-2.5">
                {upcomingExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-800 leading-tight">{ex.subject_name}</h5>
                      <span className="text-[11px] text-slate-400">
                        {ex.exam_date} &bull; {ex.time}
                      </span>
                    </div>
                    <NeoBadge color="purple" size="xs">
                      {ex.subject_code}
                    </NeoBadge>
                  </div>
                ))}
              </div>
            </NeoCard>
          </div>
        </div>

        {/* Right Rail / Widgets Column (Cols 9-12 on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Circular Attendance Goal Ring */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft text-center space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attendance Compliance
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Safe
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#1E6BFF"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {attendancePct}%
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cutoff: 75%
                </span>
              </div>
            </div>

            {/* Weekly Days Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Weekly Schedule</span>
                <span className="text-[#1E6BFF]">5/5 Days Active</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        idx < 5
                          ? 'bg-blue-50 text-[#1E6BFF] border border-blue-200/50'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {idx < 5 ? '✓' : day}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
              💡 You have attended <strong>32 days</strong> out of 42. You are <strong>+1.2%</strong> above mandatory cutoff.
            </p>
          </div>

          {/* Widget 2: Class Academic Leaderboard */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Class Leaderboard</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Sem 5 CSE</span>
            </div>

            <div className="space-y-2">
              {[
                { rank: '1', medal: '🥇', name: 'Kanishka Saxena (You)', score: '94.2%', active: true },
                { rank: '2', medal: '🥈', name: 'Rohan Verma', score: '91.8%', active: false },
                { rank: '3', medal: '🥉', name: 'Priya Sharma', score: '89.5%', active: false },
                { rank: '4', medal: '4', name: 'Yash Kapoor', score: '87.0%', active: false },
                { rank: '5', medal: '5', name: 'Ananya Gupta', score: '85.4%', active: false },
              ].map((student, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-2xl flex items-center justify-between text-xs transition-colors ${
                    student.active
                      ? 'bg-blue-50/80 border border-blue-200/60 font-bold text-[#1E6BFF]'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-bold text-slate-500">
                      {student.medal}
                    </span>
                    <span className="truncate max-w-[130px]">{student.name}</span>
                  </div>
                  <span className={student.active ? 'text-[#1E6BFF]' : 'text-slate-500'}>
                    {student.score}
                  </span>
                </div>
              ))}
            </div>

            <Link to="/results">
              <button
                type="button"
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-100 transition-colors cursor-pointer mt-1"
              >
                View Full Rankings
              </button>
            </Link>
          </div>

          {/* Widget 3: Quick AI Academic Mentor Card */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50/40 rounded-3xl p-6 border border-blue-100 shadow-soft-xs space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E6BFF] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wide">UniMind AI Mentor</span>
            </div>

            <h4 className="font-bold text-sm text-slate-900">
              Ask Instant Doubt Resolution
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stuck on Normalization or Lexical Analysis? Get step-by-step solutions powered by Groq LLM & AKTU syllabus indexing.
            </p>

            <Link to="/chat">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-[#1E6BFF] hover:bg-[#155BE5] text-white text-xs font-semibold shadow-glow-blue transition-colors cursor-pointer mt-1 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with AI Tutor</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
