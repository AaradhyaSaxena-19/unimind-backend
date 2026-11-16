import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  FileText,
  Users,
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  Megaphone,
  TrendingUp,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { profile } = useAuth();

  const facultyName = profile?.full_name || 'Dr. S.K. Sharma';
  const facultyDept = 'Computer Science & Engineering';
  const facultyRole = 'Associate Professor & Academic Mentor';

  const todayClasses = [
    {
      period: 1,
      subjectCode: 'KCS501',
      subjectName: 'Database Management Systems',
      cohort: 'B.Tech CSE - Sem 5 (Sec A)',
      time: '09:00 AM - 10:00 AM',
      room: 'Lecture Hall 302',
      attendanceMarked: true,
      attendanceRate: '90%',
    },
    {
      period: 2,
      subjectCode: 'KCS502',
      subjectName: 'Compiler Design',
      cohort: 'B.Tech CSE - Sem 5 (Sec A)',
      time: '10:00 AM - 11:00 AM',
      room: 'Lecture Hall 302',
      attendanceMarked: false,
      attendanceRate: 'Pending',
    },
    {
      period: 3,
      subjectCode: 'KCS551',
      subjectName: 'DBMS Practical Lab (Batch A)',
      cohort: 'B.Tech CSE - Sem 5 (Sec A)',
      time: '11:15 AM - 01:15 PM',
      room: 'Advanced Software Lab 2',
      attendanceMarked: false,
      attendanceRate: 'Pending',
    },
    {
      period: 5,
      subjectCode: 'MCA101',
      subjectName: 'Advanced Data Structures',
      cohort: 'MCA - Sem 1 (Sec A)',
      time: '02:15 PM - 03:15 PM',
      room: 'Seminar Hall B',
      attendanceMarked: false,
      attendanceRate: 'Pending',
    },
  ];

  const assignedSubjects = [
    {
      code: 'KCS501',
      name: 'Database Management Systems',
      course: 'B.Tech CSE',
      semester: 5,
      students: 64,
      attendanceRate: 88,
      nextSession: 'Today, 09:00 AM',
    },
    {
      code: 'KCS502',
      name: 'Compiler Design',
      course: 'B.Tech CSE',
      semester: 5,
      students: 62,
      attendanceRate: 79,
      nextSession: 'Today, 10:00 AM',
    },
    {
      code: 'MCA101',
      name: 'Advanced Data Structures',
      course: 'MCA',
      semester: 1,
      students: 45,
      attendanceRate: 91,
      nextSession: 'Today, 02:15 PM',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 text-left">
      {/* Header Banner - Clean Blue Theme */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-blue-700 via-[#1E6BFF] to-blue-600 text-white shadow-glow-blue">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                Faculty Workspace &bull; Session 2026-27
              </span>
              <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {facultyDept}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {facultyName}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {facultyRole} &bull; Manage student attendance, launch Paper AI Studio question analysis, and coordinate semester courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link to="/teacher/attendance" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#1E6BFF] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-soft-xs hover:shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            </Link>

            <Link to="/teacher/papers" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Paper AI Studio</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Lectures Today
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              4
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block truncate">
              1 Completed &bull; 3 Pending
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block truncate">
              Students Mentored
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight">
              171
            </span>
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Across 3 Course Batches
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block truncate">
              Avg. Attendance
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              86%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block truncate">
              Compliant with 75% rule
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block truncate">
              AI Exam Papers
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight">
              12
            </span>
            <span className="text-[11px] font-medium text-purple-600 block truncate">
              Uploaded in Studio
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Schedule & Active Classes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Today's Teaching Schedule</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Monday &bull; Session 2026-27
              </span>
            </div>

            <div className="space-y-3">
              {todayClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E6BFF] font-black text-xs flex items-center justify-center shrink-0">
                      P{item.period}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1E6BFF]">
                          {item.subjectCode}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">&bull;</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {item.cohort}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.subjectName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.time} &bull; {item.room}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.attendanceMarked ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marked ({item.attendanceRate})</span>
                      </span>
                    ) : (
                      <Link to="/teacher/attendance">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-[#1E6BFF] hover:bg-[#155BE5] text-white text-xs font-bold shadow-soft-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Take Attendance</span>
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Subjects Overview */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Assigned Courses & Attendance Health</h2>
              </div>
              <Link to="/courses" className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                <span>All Courses</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {assignedSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#1E6BFF] bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Sem {sub.semester}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{sub.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub.course} &bull; {sub.students} Enrolled</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Cohort Attendance</span>
                      <span className="font-bold text-slate-900">{sub.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1E6BFF] h-full rounded-full"
                        style={{ width: `${sub.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  <Link to="/teacher/attendance">
                    <button
                      type="button"
                      className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition-colors cursor-pointer text-center"
                    >
                      Open Register
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Quick Actions & Faculty Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action Navigation Grid */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Faculty Command Center
            </h3>

            <div className="space-y-2">
              <Link
                to="/teacher/attendance"
                className="p-3 bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs font-bold text-[#1E6BFF] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E6BFF] flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900">Faculty Attendance Portal</span>
                    <span className="text-[10px] text-slate-500 font-normal">Daily student roll call register</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/teacher/papers"
                className="p-3 bg-purple-50/60 hover:bg-purple-100/60 border border-purple-100 rounded-2xl flex items-center justify-between text-xs font-bold text-purple-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900">Paper AI Studio</span>
                    <span className="text-[10px] text-slate-500 font-normal">AI exam extraction & grading</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/courses"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900">Courses & Subjects</span>
                    <span className="text-[10px] text-slate-500 font-normal">Curriculum syllabi & modules</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/assignments"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900">Assignments & Tasks</span>
                    <span className="text-[10px] text-slate-500 font-normal">Review student submissions</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/announcements"
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-900">Post Announcements</span>
                    <span className="text-[10px] text-slate-500 font-normal">Notify enrolled student batches</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Academic Calendar Reminder */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/40 rounded-3xl p-5 border border-blue-100 shadow-soft-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Calendar className="w-4 h-4 text-[#1E6BFF]" />
              <span className="font-bold text-xs uppercase tracking-wide">University Calendar</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              Mid-Semester Assessment Week
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Internal assessment marks submission window opens Nov 28. Ensure lecture attendance logs are audited before final generation.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-bold text-[#1E6BFF] bg-white px-3 py-1 rounded-full border border-blue-100">
                12 Days Remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
