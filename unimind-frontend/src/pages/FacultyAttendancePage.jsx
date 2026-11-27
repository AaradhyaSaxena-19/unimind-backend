import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Filter,
  Check,
  ArrowRight,
  Download,
  Info,
  CheckSquare,
  RefreshCw,
  ChevronDown,
  Building,
} from 'lucide-react';

// Comprehensive mock roster for realistic classroom simulation
const INITIAL_STUDENT_ROSTER = [
  { id: 'st-01', rollNo: '210161010001', name: 'Kanishka Saxena', email: 'kanishka.s@rbmi.edu', camuId: 'RBMI2021001', historicalRate: 88, status: 'present', remarks: 'Regular' },
  { id: 'st-02', rollNo: '210161010002', name: 'Abhishek Patel', email: 'abhishek.p@rbmi.edu', camuId: 'RBMI2021002', historicalRate: 79, status: 'present', remarks: 'Regular' },
  { id: 'st-03', rollNo: '210161010003', name: 'Aditya Singhal', email: 'aditya.s@rbmi.edu', camuId: 'RBMI2021003', historicalRate: 68, status: 'absent', remarks: 'Medical Leave' },
  { id: 'st-04', rollNo: '210161010004', name: 'Ananya Gupta', email: 'ananya.g@rbmi.edu', camuId: 'RBMI2021004', historicalRate: 94, status: 'present', remarks: 'Regular' },
  { id: 'st-05', rollNo: '210161010005', name: 'Ayush Kumar', email: 'ayush.k@rbmi.edu', camuId: 'RBMI2021005', historicalRate: 74, status: 'present', remarks: 'Late (10 mins)' },
  { id: 'st-06', rollNo: '210161010006', name: 'Bhavna Joshi', email: 'bhavna.j@rbmi.edu', camuId: 'RBMI2021006', historicalRate: 91, status: 'present', remarks: 'Regular' },
  { id: 'st-07', rollNo: '210161010007', name: 'Deepak Maurya', email: 'deepak.m@rbmi.edu', camuId: 'RBMI2021007', historicalRate: 83, status: 'present', remarks: 'Regular' },
  { id: 'st-08', rollNo: '210161010008', name: 'Divyanshu Sharma', email: 'divyanshu.s@rbmi.edu', camuId: 'RBMI2021008', historicalRate: 72, status: 'absent', remarks: 'Uninformed' },
  { id: 'st-09', rollNo: '210161010009', name: 'Ishita Kapoor', email: 'ishita.k@rbmi.edu', camuId: 'RBMI2021009', historicalRate: 86, status: 'present', remarks: 'Regular' },
  { id: 'st-10', rollNo: '210161010010', name: 'Kartik Shukla', email: 'kartik.s@rbmi.edu', camuId: 'RBMI2021010', historicalRate: 81, status: 'present', remarks: 'Regular' },
  { id: 'st-11', rollNo: '210161010011', name: 'Manish Rawat', email: 'manish.r@rbmi.edu', camuId: 'RBMI2021011', historicalRate: 77, status: 'present', remarks: 'Regular' },
  { id: 'st-12', rollNo: '210161010012', name: 'Nandini Agarwal', email: 'nandini.a@rbmi.edu', camuId: 'RBMI2021012', historicalRate: 95, status: 'present', remarks: 'Regular' },
  { id: 'st-13', rollNo: '210161010013', name: 'Prashant Tiwari', email: 'prashant.t@rbmi.edu', camuId: 'RBMI2021013', historicalRate: 64, status: 'absent', remarks: 'Sports Team OD' },
  { id: 'st-14', rollNo: '210161010014', name: 'Priya Verma', email: 'priya.v@rbmi.edu', camuId: 'RBMI2021014', historicalRate: 92, status: 'present', remarks: 'Regular' },
  { id: 'st-15', rollNo: '210161010015', name: 'Rahul Choudhary', email: 'rahul.c@rbmi.edu', camuId: 'RBMI2021015', historicalRate: 85, status: 'present', remarks: 'Regular' },
  { id: 'st-16', rollNo: '210161010016', name: 'Rohan Verma', email: 'rohan.v@rbmi.edu', camuId: 'RBMI2021016', historicalRate: 93, status: 'present', remarks: 'Regular' },
  { id: 'st-17', rollNo: '210161010017', name: 'Sakshi Singh', email: 'sakshi.s@rbmi.edu', camuId: 'RBMI2021017', historicalRate: 89, status: 'present', remarks: 'Regular' },
  { id: 'st-18', rollNo: '210161010018', name: 'Siddharth Jain', email: 'siddharth.j@rbmi.edu', camuId: 'RBMI2021018', historicalRate: 70, status: 'present', remarks: 'Regular' },
  { id: 'st-19', rollNo: '210161010019', name: 'Sneha Pandey', email: 'sneha.p@rbmi.edu', camuId: 'RBMI2021019', historicalRate: 96, status: 'present', remarks: 'Regular' },
  { id: 'st-20', rollNo: '210161010020', name: 'Tanmay Saxena', email: 'tanmay.s@rbmi.edu', camuId: 'RBMI2021020', historicalRate: 82, status: 'present', remarks: 'Regular' },
];

const COURSES = [
  { id: 'btech-cse', name: 'B.Tech - Computer Science & Engineering', code: 'BCSE', semesters: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'btech-it', name: 'B.Tech - Information Technology', code: 'BIT', semesters: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'bca', name: 'Bachelor of Computer Applications (BCA)', code: 'BCA', semesters: [1, 2, 3, 4, 5, 6] },
  { id: 'mca', name: 'Master of Computer Applications (MCA)', code: 'MCA', semesters: [1, 2, 3, 4] },
  { id: 'mba', name: 'Master of Business Administration (MBA)', code: 'MBA', semesters: [1, 2, 3, 4] },
];

const SUBJECTS_BY_SEMESTER = {
  5: [
    { code: 'KCS501', name: 'Database Management Systems', credits: 4, type: 'Theory + Lab' },
    { code: 'KCS502', name: 'Compiler Design', credits: 4, type: 'Theory' },
    { code: 'KCS503', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory + Lab' },
    { code: 'KCS504', name: 'Web Technology & Cloud', credits: 3, type: 'Theory' },
    { code: 'BNC501', name: 'Constitution of India', credits: 2, type: 'Audit' },
  ],
  3: [
    { code: 'KCS301', name: 'Data Structures using C', credits: 4, type: 'Theory + Lab' },
    { code: 'KCS302', name: 'Computer Organization & Architecture', credits: 4, type: 'Theory' },
    { code: 'KCS303', name: 'Discrete Mathematics', credits: 4, type: 'Theory' },
  ],
  7: [
    { code: 'KCS701', name: 'Artificial Intelligence', credits: 4, type: 'Theory' },
    { code: 'KCS702', name: 'Distributed Systems', credits: 4, type: 'Theory' },
  ],
};

const PERIODS = [
  { id: 'p1', label: 'Period 1 (09:00 AM - 10:00 AM)', room: 'LH-302' },
  { id: 'p2', label: 'Period 2 (10:00 AM - 11:00 AM)', room: 'LH-302' },
  { id: 'p3', label: 'Period 3 (11:15 AM - 12:15 PM)', room: 'CS-Lab 2' },
  { id: 'p4', label: 'Period 4 (01:15 PM - 02:15 PM)', room: 'LH-204' },
  { id: 'p5', label: 'Period 5 (02:15 PM - 03:15 PM)', room: 'LH-204' },
];

export const FacultyAttendancePage = () => {

  // Control selections
  const [selectedCourse, setSelectedCourse] = useState('btech-cse');
  const [selectedSemester, setSelectedSemester] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState('KCS501');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedPeriod, setSelectedPeriod] = useState('p2');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'present' | 'absent'

  // Student Attendance State (local demo state)
  const [students, setStudents] = useState(INITIAL_STUDENT_ROSTER);

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Available subjects based on semester
  const availableSubjects = SUBJECTS_BY_SEMESTER[selectedSemester] || SUBJECTS_BY_SEMESTER[5];
  const activeCourse = COURSES.find((c) => c.id === selectedCourse) || COURSES[0];
  const activeSubject = availableSubjects.find((s) => s.code === selectedSubject) || availableSubjects[0];
  const activePeriod = PERIODS.find((p) => p.id === selectedPeriod) || PERIODS[0];

  // Calculated Summary Statistics
  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.includes(searchQuery) ||
        student.camuId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  // Action: Toggle student status
  const handleToggleStatus = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  // Action: Update student remarks
  const handleUpdateRemarks = (id, remarks) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s))
    );
  };

  // Action: Mark all present
  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    triggerToast('All enrolled students marked as Present.');
  };

  // Action: Mark all absent
  const handleMarkAllAbsent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'absent' })));
    triggerToast('All students marked as Absent.');
  };

  // Action: Reset roster
  const handleResetRoster = () => {
    setStudents(INITIAL_STUDENT_ROSTER);
    triggerToast('Attendance register reset to default state.');
  };

  // Save handler with UI confirmation modal
  const handleSaveAttendance = () => {
    const receipt = {
      course: activeCourse.name,
      courseCode: activeCourse.code,
      semester: selectedSemester,
      subject: `${activeSubject.code} - ${activeSubject.name}`,
      section: selectedSection,
      period: activePeriod.label,
      room: activePeriod.room,
      date: attendanceDate,
      totalStudents,
      presentCount,
      absentCount,
      attendanceRate,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      absentStudents: students.filter((s) => s.status === 'absent'),
    };
    setSavedReceipt(receipt);
    setShowSaveModal(true);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-soft-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Clean Professional Blue/White Style */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-blue-700 via-[#1E6BFF] to-blue-600 text-white shadow-glow-blue">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                Faculty Portal &bull; Attendance Register
              </span>
              <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                Department of Computer Science & Engineering
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Class Attendance System
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Record, review, and verify session attendance for registered university batches. Compliant with university 75% attendance regulations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link to="/attendance" className="w-full md:w-auto">
              <button
                type="button"
                className="w-full md:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Student Audit View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E6BFF] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-[#1E6BFF]">Interactive Faculty Demo: </span>
          Attendance marks and state updates operate locally in this React session. No changes are committed to the live database or Supabase backend.
        </div>
      </div>

      {/* Session Controls: Course, Semester, Subject, Section, Period, Date */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Lecture Session Configuration</h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Room: <span className="font-bold text-slate-800">{activePeriod.room}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* Course Selector */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block">Course / Program</label>
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Semester Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Semester</label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => {
                  const sem = Number(e.target.value);
                  setSelectedSemester(sem);
                  const firstSub = (SUBJECTS_BY_SEMESTER[sem] || SUBJECTS_BY_SEMESTER[5])[0];
                  if (firstSub) setSelectedSubject(firstSub.code);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {activeCourse.semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Subject Selector */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block">Assigned Subject</label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {availableSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Section Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Section</label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Period Selector */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block">Lecture Slot / Time</label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block">Attendance Date</label>
            <div className="relative">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Info Chip */}
          <div className="lg:col-span-2 flex items-end">
            <div className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between">
              <span className="text-slate-500 font-medium">Subject Credits</span>
              <span className="font-bold text-[#1E6BFF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {activeSubject.credits} Credits ({activeSubject.type})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Total Enrolled
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalStudents}
            </span>
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Section {selectedSection} &bull; Sem {selectedSemester}
            </span>
          </div>
        </div>

        {/* Present Count */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block truncate">
              Students Present
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {presentCount}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block truncate">
              {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}% of cohort
            </span>
          </div>
        </div>

        {/* Absent Count */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block truncate">
              Students Absent
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight">
              {absentCount}
            </span>
            <span className="text-[11px] font-medium text-rose-600 block truncate">
              Requires follow-up
            </span>
          </div>
        </div>

        {/* Overall Percentage with Visual Progress */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Class Turnout Rate
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                attendanceRate >= 75
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {attendanceRate >= 75 ? 'Safe (≥75%)' : 'Below 75% Cutoff'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {attendanceRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Session Ratio</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                attendanceRate >= 75 ? 'bg-[#1E6BFF]' : 'bg-rose-500'
              }`}
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roster Controls & Actions Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or Camu ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start md:self-auto text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('present')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('absent')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-soft-xs"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              onClick={handleMarkAllAbsent}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-soft-xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>

            <button
              type="button"
              onClick={handleResetRoster}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Reset Roster"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto border border-slate-200/70 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Roll Number & Camu ID</th>
                <th className="py-3 px-4">Prior Track Record</th>
                <th className="py-3 px-4 text-center">Session Attendance Status</th>
                <th className="py-3 px-4">Session Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                  const isPresent = student.status === 'present';
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        !isPresent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Index / Counter */}
                      <td className="py-3 px-4 font-bold text-slate-400">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Student Profile Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPresent
                                ? 'bg-blue-100 text-[#1E6BFF]'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number & Camu ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {student.rollNo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {student.camuId}
                        </span>
                      </td>

                      {/* Prior Track Record */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold ${
                                student.historicalRate >= 75
                                  ? 'text-emerald-700'
                                  : 'text-rose-600'
                              }`}
                            >
                              {student.historicalRate}%
                            </span>
                            <span className="text-[10px] text-slate-400">cumulative</span>
                          </div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.historicalRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${student.historicalRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Attendance Toggle Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-soft-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-soft-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>

                      {/* Remarks Input / Selector */}
                      <td className="py-3 px-4">
                        <select
                          value={student.remarks}
                          onChange={(e) => handleUpdateRemarks(student.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-200"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Late (10 mins)">Late (10 mins)</option>
                          <option value="Medical Leave">Medical Leave</option>
                          <option value="Sports Team OD">Sports Team OD</option>
                          <option value="Uninformed">Uninformed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <p className="font-semibold text-xs">No students match your filter criteria.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="mt-2 text-xs font-bold text-[#1E6BFF] hover:underline"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800">{totalStudents}</strong> students enrolled.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="w-full sm:w-auto bg-[#1E6BFF] hover:bg-[#155BE5] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-glow-blue transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Save Attendance Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal upon Saving */}
      {showSaveModal && savedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-lg w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                  Attendance Recorded
                </span>
                <span className="text-xs text-emerald-100 font-mono">{savedReceipt.timestamp}</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Session Verification Slip</h3>
              <p className="text-xs text-emerald-100">
                Attendance register updated for {savedReceipt.subject}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-700">
              {/* Summary Badges */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Enrolled</span>
                  <span className="text-lg font-extrabold text-slate-800">{savedReceipt.totalStudents}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Present</span>
                  <span className="text-lg font-extrabold text-emerald-700">{savedReceipt.presentCount}</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-600 block uppercase">Absent</span>
                  <span className="text-lg font-extrabold text-rose-700">{savedReceipt.absentCount}</span>
                </div>
              </div>

              {/* Session Meta */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Program & Sem:</span>
                  <span className="font-bold text-slate-800">
                    {savedReceipt.courseCode} &bull; Semester {savedReceipt.semester} (Sec {savedReceipt.section})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Date & Period:</span>
                  <span className="font-bold text-slate-800">
                    {savedReceipt.date} &bull; {savedReceipt.period}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Class Turnout:</span>
                  <span className="font-extrabold text-[#1E6BFF]">{savedReceipt.attendanceRate}%</span>
                </div>
              </div>

              {/* Absent Students List */}
              {savedReceipt.absentStudents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    Absentee Log ({savedReceipt.absentStudents.length} Students):
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-rose-50/40 rounded-xl border border-rose-100 text-[11px]">
                    {savedReceipt.absentStudents.map((abs) => (
                      <div key={abs.id} className="flex justify-between text-rose-900">
                        <span>{abs.name} ({abs.rollNo})</span>
                        <span className="font-semibold">{abs.remarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulation Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Frontend Demo Mode:</strong> This attendance sheet was compiled in your local browser state. Live Supabase database tables remain unchanged.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  triggerToast('Verification receipt closed.');
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  triggerToast('Attendance summary exported to clipboard.');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-soft-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAttendancePage;
