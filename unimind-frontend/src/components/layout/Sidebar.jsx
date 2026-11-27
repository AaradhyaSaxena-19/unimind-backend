import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  CalendarCheck,
  BookOpen,
  FileCheck2,
  Calendar,
  Award,
  CreditCard,
  Megaphone,
  FolderOpen,
  Mail,
  User,
  ShieldAlert,
  FileText,
  Crown,
  Sparkles,
  X,
  GraduationCap,
  Briefcase,
  Users,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { role, profile, user } = useAuth();
  const location = useLocation();

  const isStudent = role === 'student' || (!role && user);
  const isParent = role === 'parent';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  const studentLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Assistant', path: '/chat', icon: MessageSquare, badge: 'Groq' },
    { label: 'Timetable', path: '/timetable', icon: Clock },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Courses & Curriculum', path: '/courses', icon: GraduationCap },
    { label: 'Assignments', path: '/assignments', icon: FileCheck2 },
    { label: 'Online Tests', path: '/assessments', icon: Sparkles },
    { label: 'Examinations', path: '/exams', icon: Calendar },
    { label: 'Results & Cards', path: '/results', icon: Award },
    { label: 'Job Finds', path: '/jobs', icon: Briefcase, badge: 'Hiring' },
    { label: 'Fees & Pay', path: '/fees', icon: CreditCard },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Events & Holidays', path: '/events', icon: Calendar },
    { label: 'Study Content', path: '/study-material', icon: BookOpen },
    { label: 'Messages', path: '/messages', icon: Mail },
    { label: 'Documents Vault', path: '/documents', icon: FolderOpen },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  const parentLinks = [
    { label: 'Child Overview', path: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Attendance Tracking', path: '/attendance', icon: CalendarCheck },
    { label: 'Fees & Dues', path: '/fees', icon: CreditCard },
    { label: 'Report Cards', path: '/results', icon: Award },
    { label: 'Exam Schedule', path: '/exams', icon: Calendar },
    { label: 'Circulars', path: '/announcements', icon: Megaphone },
    { label: 'Contact Mentors', path: '/messages', icon: Mail },
    { label: 'Parent Profile', path: '/profile', icon: User },
  ];

  const teacherLinks = [
    { label: 'Faculty Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Classroom Roster', path: '/campus/link', icon: Users, badge: 'Linked' },
    { label: 'Job Finds & Placements', path: '/jobs', icon: Briefcase },
    { label: 'Faculty Attendance', path: '/teacher/attendance', icon: CalendarCheck, badge: 'Live' },
    { label: 'Courses & Subjects', path: '/courses', icon: GraduationCap },
    { label: 'Paper AI Studio', path: '/teacher/papers', icon: FileText, badge: 'Vision' },
    { label: 'Attendance Review', path: '/attendance', icon: CalendarCheck },
    { label: 'Assignments', path: '/assignments', icon: FileCheck2 },
    { label: 'Study Material', path: '/study-material', icon: BookOpen },
    { label: 'Student Messages', path: '/messages', icon: Mail },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Timetable', path: '/timetable', icon: Clock },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Hub', path: '/admin', icon: ShieldAlert, badge: 'Admin' },
    { label: 'Campus Link Hub', path: '/campus/link', icon: Users, badge: 'Linked' },
    { label: 'Job Finds & Placements', path: '/jobs', icon: Briefcase },
    { label: 'Faculty Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Courses & Curriculum', path: '/courses', icon: GraduationCap },
    { label: 'Paper AI Studio', path: '/teacher/papers', icon: FileText },
    { label: 'Student Analytics', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Fee Audits', path: '/fees', icon: CreditCard },
    { label: 'Timetable Config', path: '/timetable', icon: Clock },
    { label: 'Examinations', path: '/exams', icon: Calendar },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const links = isParent
    ? parentLinks
    : isTeacher
    ? teacherLinks
    : isAdmin
    ? adminLinks
    : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-[61px] bottom-0 left-0 z-50
          w-72 max-w-[85vw] bg-white border-r border-slate-200/70 h-screen lg:h-[calc(100vh-61px)]
          flex flex-col transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* User Card info inside sidebar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-left flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-soft-xs shrink-0 ${
                isParent
                  ? 'bg-emerald-100 text-emerald-700'
                  : isTeacher
                  ? 'bg-purple-100 text-purple-700'
                  : isAdmin
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-[#1E6BFF]'
              }`}
            >
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="font-bold text-sm text-slate-800 truncate leading-snug">
                {profile?.full_name || 'Kanishka Saxena'}
              </h4>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                {role || 'student'} &bull; {profile?.course ? profile.course.slice(0, 16) : 'B.Tech CSE'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 lg:hidden cursor-pointer transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-left">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onCloseMobile}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs
                  ${
                    isActive
                      ? 'bg-[#EBF3FE] text-[#1E6BFF] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E6BFF]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      link.badge === 'Groq'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200/50'
                        : link.badge === 'Admin'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200/50'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Lingora-Style Upgrade Pass Card */}
        <div className="p-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/40 border border-blue-100 text-left space-y-2 shadow-soft-xs">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs">UniMind Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Unlock AI exam predictions & automated paper grading.
            </p>
            <button
              onClick={() => alert('Campus Pro is active for all enrolled students.')}
              className="w-full py-1.5 px-3 rounded-xl bg-[#1E6BFF] hover:bg-[#155BE5] text-white text-xs font-semibold shadow-glow-blue transition-colors cursor-pointer"
            >
              Activated
            </button>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-left text-[11px] font-medium text-slate-400">
          <div className="flex items-center justify-between">
            <span>Session 2026-27</span>
            <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-semibold text-slate-600">
              RBMI ERP
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
