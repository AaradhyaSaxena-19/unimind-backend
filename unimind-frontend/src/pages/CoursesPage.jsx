import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  GraduationCap,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  Info,
  Building,
  User,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  BookMarked,
} from 'lucide-react';

// Comprehensive mock curriculum data
const INITIAL_COURSES = [
  {
    id: 'course-1',
    code: 'BCSE',
    name: 'B.Tech - Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    degreeLevel: 'Undergraduate',
    duration: '4 Years (8 Semesters)',
    totalSemesters: 8,
    totalCredits: 160,
    enrolledStudents: 240,
    coordinator: 'Dr. S.K. Sharma',
    description: 'Premier degree program emphasizing data structures, algorithms, operating systems, compiler design, and software engineering.',
    subjects: [
      { id: 'sub-101', code: 'KCS501', name: 'Database Management Systems', semester: 5, credits: 4, type: 'Theory + Lab', faculty: 'Dr. S.K. Sharma' },
      { id: 'sub-102', code: 'KCS502', name: 'Compiler Design', semester: 5, credits: 4, type: 'Theory', faculty: 'Dr. Ananya Sen' },
      { id: 'sub-103', code: 'KCS503', name: 'Design and Analysis of Algorithms', semester: 5, credits: 4, type: 'Theory + Lab', faculty: 'Prof. Rajesh Verma' },
      { id: 'sub-104', code: 'KCS504', name: 'Web Technology & Cloud Computing', semester: 5, credits: 3, type: 'Theory', faculty: 'Er. Neha Dixit' },
      { id: 'sub-105', code: 'BNC501', name: 'Constitution of India', semester: 5, credits: 2, type: 'Audit', faculty: 'Dr. R.K. Mishra' },
      { id: 'sub-106', code: 'KCS301', name: 'Data Structures and Algorithms', semester: 3, credits: 4, type: 'Theory + Lab', faculty: 'Prof. Priya Sharma' },
      { id: 'sub-107', code: 'KCS302', name: 'Computer Organization & Architecture', semester: 3, credits: 4, type: 'Theory', faculty: 'Dr. V.K. Singh' },
    ],
  },
  {
    id: 'course-2',
    code: 'BIT',
    name: 'B.Tech - Information Technology',
    department: 'Information Technology',
    degreeLevel: 'Undergraduate',
    duration: '4 Years (8 Semesters)',
    totalSemesters: 8,
    totalCredits: 160,
    enrolledStudents: 120,
    coordinator: 'Prof. Alok Saxena',
    description: 'Applied computing degree focusing on cloud infrastructure, enterprise security, web systems, and networking architectures.',
    subjects: [
      { id: 'sub-201', code: 'KIT501', name: 'Information Security & Cryptography', semester: 5, credits: 4, type: 'Theory', faculty: 'Prof. Alok Saxena' },
      { id: 'sub-202', code: 'KIT502', name: 'Cloud Computing Infrastructure', semester: 5, credits: 4, type: 'Theory + Lab', faculty: 'Er. Rohit Kumar' },
      { id: 'sub-203', code: 'KIT503', name: 'Object Oriented Software Engineering', semester: 5, credits: 3, type: 'Theory', faculty: 'Dr. Sunita Rao' },
    ],
  },
  {
    id: 'course-3',
    code: 'MCA',
    name: 'Master of Computer Applications (MCA)',
    department: 'Computer Science & Engineering',
    degreeLevel: 'Postgraduate',
    duration: '2 Years (4 Semesters)',
    totalSemesters: 4,
    totalCredits: 96,
    enrolledStudents: 90,
    coordinator: 'Dr. Manisha Goel',
    description: 'Postgraduate master program in advanced computational methods, AI, machine learning, and enterprise backend engineering.',
    subjects: [
      { id: 'sub-301', code: 'MCA101', name: 'Advanced Data Structures & Algorithms', semester: 1, credits: 4, type: 'Theory + Lab', faculty: 'Dr. Manisha Goel' },
      { id: 'sub-302', code: 'MCA102', name: 'Full Stack Web Architectures', semester: 1, credits: 4, type: 'Theory + Lab', faculty: 'Er. Sameer Khan' },
      { id: 'sub-303', code: 'MCA301', name: 'Machine Learning & Neural Networks', semester: 3, credits: 4, type: 'Theory + Lab', faculty: 'Dr. Vivek Pandey' },
    ],
  },
  {
    id: 'course-4',
    code: 'BCA',
    name: 'Bachelor of Computer Applications (BCA)',
    department: 'Computer Applications',
    degreeLevel: 'Undergraduate',
    duration: '3 Years (6 Semesters)',
    totalSemesters: 6,
    totalCredits: 120,
    enrolledStudents: 180,
    coordinator: 'Prof. Kavita Rastogi',
    description: 'Foundational degree in programming, computer fundamentals, database management, and business computing systems.',
    subjects: [
      { id: 'sub-401', code: 'BCA301', name: 'Core Java Programming', semester: 3, credits: 4, type: 'Theory + Lab', faculty: 'Prof. Kavita Rastogi' },
      { id: 'sub-402', code: 'BCA302', name: 'Operating Systems Principles', semester: 3, credits: 3, type: 'Theory', faculty: 'Er. Gaurav Mehta' },
      { id: 'sub-403', code: 'BCA501', name: 'Python for Data Analysis', semester: 5, credits: 4, type: 'Theory + Lab', faculty: 'Dr. Renu Gupta' },
    ],
  },
  {
    id: 'course-5',
    code: 'MBA',
    name: 'Master of Business Administration (MBA)',
    department: 'Management Studies',
    degreeLevel: 'Postgraduate',
    duration: '2 Years (4 Semesters)',
    totalSemesters: 4,
    totalCredits: 96,
    enrolledStudents: 120,
    coordinator: 'Dr. Hemant Bhardwaj',
    description: 'Executive management curriculum preparing leaders in finance, marketing, corporate analytics, and human resource management.',
    subjects: [
      { id: 'sub-501', code: 'MBA101', name: 'Financial Accounting & Reporting', semester: 1, credits: 4, type: 'Theory', faculty: 'Dr. Hemant Bhardwaj' },
      { id: 'sub-502', code: 'MBA102', name: 'Marketing Management & Analytics', semester: 1, credits: 4, type: 'Theory', faculty: 'Prof. Smita Kapoor' },
      { id: 'sub-503', code: 'MBA301', name: 'Strategic Enterprise Management', semester: 3, credits: 3, type: 'Theory', faculty: 'Dr. Ashok Bansal' },
    ],
  },
];

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Computer Applications',
  'Management Studies',
];

const DEGREE_LEVELS = ['All Levels', 'Undergraduate', 'Postgraduate'];

export const CoursesPage = () => {
  // Courses state (local React state for demo)
  const [courses, setCourses] = useState(INITIAL_COURSES);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Expanded courses in cards view
  const [expandedCourses, setExpandedCourses] = useState({ 'course-1': true });

  // Modal States
  const [courseModal, setCourseModal] = useState({ open: false, mode: 'add', course: null });
  const [subjectModal, setSubjectModal] = useState({ open: false, mode: 'add', courseId: null, subject: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: '', courseId: '', name: '' });

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  // Course Form Fields
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: 'Computer Science & Engineering',
    degreeLevel: 'Undergraduate',
    totalSemesters: 8,
    totalCredits: 160,
    coordinator: '',
    description: '',
  });

  // Subject Form Fields
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    semester: 1,
    credits: 4,
    type: 'Theory + Lab',
    faculty: '',
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        course.name.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.department.toLowerCase().includes(q) ||
        course.subjects.some(
          (sub) =>
            sub.name.toLowerCase().includes(q) ||
            sub.code.toLowerCase().includes(q) ||
            sub.faculty.toLowerCase().includes(q)
        );

      const matchesDept =
        selectedDept === 'All Departments' || course.department === selectedDept;

      const matchesLevel =
        selectedLevel === 'All Levels' || course.degreeLevel === selectedLevel;

      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [courses, searchQuery, selectedDept, selectedLevel]);

  // Aggregate stats
  const totalCourses = courses.length;
  const totalSubjects = courses.reduce((acc, c) => acc + c.subjects.length, 0);
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);

  // Toggle card expansion
  const toggleExpand = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Handlers for Course Modal
  const openAddCourse = () => {
    setCourseForm({
      code: '',
      name: '',
      department: 'Computer Science & Engineering',
      degreeLevel: 'Undergraduate',
      totalSemesters: 8,
      totalCredits: 160,
      coordinator: '',
      description: '',
    });
    setCourseModal({ open: true, mode: 'add', course: null });
  };

  const openEditCourse = (course) => {
    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department,
      degreeLevel: course.degreeLevel,
      totalSemesters: course.totalSemesters,
      totalCredits: course.totalCredits,
      coordinator: course.coordinator,
      description: course.description,
    });
    setCourseModal({ open: true, mode: 'edit', course });
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) {
      alert('Please fill in Course Code and Course Name.');
      return;
    }

    if (courseModal.mode === 'add') {
      const newCourse = {
        id: `course-${Date.now()}`,
        code: courseForm.code.toUpperCase(),
        name: courseForm.name,
        department: courseForm.department,
        degreeLevel: courseForm.degreeLevel,
        duration: `${courseForm.totalSemesters / 2} Years (${courseForm.totalSemesters} Semesters)`,
        totalSemesters: Number(courseForm.totalSemesters),
        totalCredits: Number(courseForm.totalCredits),
        enrolledStudents: 60,
        coordinator: courseForm.coordinator || 'Faculty In-Charge',
        description: courseForm.description || 'Program syllabus outline.',
        subjects: [],
      };
      setCourses((prev) => [newCourse, ...prev]);
      setExpandedCourses((prev) => ({ ...prev, [newCourse.id]: true }));
      triggerToast(`Course "${newCourse.name}" created successfully (Local Demo).`);
    } else {
      const updatedId = courseModal.course.id;
      setCourses((prev) =>
        prev.map((c) =>
          c.id === updatedId
            ? {
                ...c,
                code: courseForm.code.toUpperCase(),
                name: courseForm.name,
                department: courseForm.department,
                degreeLevel: courseForm.degreeLevel,
                totalSemesters: Number(courseForm.totalSemesters),
                totalCredits: Number(courseForm.totalCredits),
                coordinator: courseForm.coordinator,
                description: courseForm.description,
              }
            : c
        )
      );
      triggerToast(`Course "${courseForm.name}" updated successfully (Local Demo).`);
    }
    setCourseModal({ open: false, mode: 'add', course: null });
  };

  // Handlers for Subject Modal
  const openAddSubject = (courseId) => {
    setSubjectForm({
      code: '',
      name: '',
      semester: 1,
      credits: 4,
      type: 'Theory + Lab',
      faculty: '',
    });
    setSubjectModal({ open: true, mode: 'add', courseId, subject: null });
  };

  const openEditSubject = (courseId, subject) => {
    setSubjectForm({
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
      faculty: subject.faculty,
    });
    setSubjectModal({ open: true, mode: 'edit', courseId, subject });
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert('Please fill in Subject Code and Subject Name.');
      return;
    }

    const { courseId, mode, subject } = subjectModal;

    if (mode === 'add') {
      const newSubject = {
        id: `sub-${Date.now()}`,
        code: subjectForm.code.toUpperCase(),
        name: subjectForm.name,
        semester: Number(subjectForm.semester),
        credits: Number(subjectForm.credits),
        type: subjectForm.type,
        faculty: subjectForm.faculty || 'Assigned Faculty',
      };

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, subjects: [...c.subjects, newSubject] }
            : c
        )
      );
      triggerToast(`Subject "${newSubject.name}" added to curriculum (Local Demo).`);
    } else {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                subjects: c.subjects.map((s) =>
                  s.id === subject.id
                    ? {
                        ...s,
                        code: subjectForm.code.toUpperCase(),
                        name: subjectForm.name,
                        semester: Number(subjectForm.semester),
                        credits: Number(subjectForm.credits),
                        type: subjectForm.type,
                        faculty: subjectForm.faculty,
                      }
                    : s
                ),
              }
            : c
        )
      );
      triggerToast(`Subject "${subjectForm.name}" updated successfully (Local Demo).`);
    }
    setSubjectModal({ open: false, mode: 'add', courseId: null, subject: null });
  };

  // Handlers for Delete
  const confirmDelete = () => {
    const { type, id, courseId, name } = deleteConfirm;
    if (type === 'course') {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Course "${name}" deleted (Local Demo).`);
    } else if (type === 'subject') {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, subjects: c.subjects.filter((s) => s.id !== id) }
            : c
        )
      );
      triggerToast(`Subject "${name}" removed from course (Local Demo).`);
    }
    setDeleteConfirm({ open: false, type: '', id: '', courseId: '', name: '' });
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
                Academic Curriculum &bull; University Registry
              </span>
              <span className="text-[11px] font-medium text-blue-100 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Session 2026-27 Approved Syllabi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Courses & Subjects Management
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Explore undergraduate and postgraduate academic programs, semester module allocations, credit distributions, and faculty assignments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={openAddCourse}
              className="w-full md:w-auto bg-white hover:bg-slate-50 text-[#1E6BFF] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-soft-xs hover:shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1E6BFF] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-[#1E6BFF]">Interactive Curriculum Demo: </span>
          Adding, modifying, or removing courses and subjects updates your local React state for demonstration. No changes are written to the live Supabase database.
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Active Degree Programs
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalCourses}
            </span>
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              B.Tech, BCA, MCA, MBA
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block truncate">
              Total Subjects Cataloged
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight">
              {totalSubjects}
            </span>
            <span className="text-[11px] font-medium text-indigo-600 block truncate">
              Theory, Labs & Audits
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block truncate">
              Academic Departments
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              4
            </span>
            <span className="text-[11px] font-medium text-emerald-600 block truncate">
              CSE, IT, CA, Management
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block truncate">
              Enrolled Students
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-700 tracking-tight">
              {totalStudents}
            </span>
            <span className="text-[11px] font-medium text-sky-600 block truncate">
              Across all cohorts
            </span>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course code, title, subject name, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
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

          {/* Department Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                {DEGREE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Semester Filter */}
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#1E6BFF] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#1E6BFF] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Structured Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredCourses.length > 0 ? (
        viewMode === 'cards' ? (
          /* Cards View */
          <div className="space-y-5">
            {filteredCourses.map((course) => {
              const isExpanded = !!expandedCourses[course.id];
              const subjectsToDisplay =
                selectedSemester === 'all'
                  ? course.subjects
                  : course.subjects.filter((s) => s.semester === Number(selectedSemester));

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-200"
                >
                  {/* Course Header Bar */}
                  <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] font-black text-sm flex items-center justify-center shrink-0 border border-blue-100">
                        {course.code}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1E6BFF] border border-blue-100">
                            {course.degreeLevel}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {course.department}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                          {course.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Course Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openAddSubject(course.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-[#1E6BFF] font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditCourse(course)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit Course"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            open: true,
                            type: 'course',
                            id: course.id,
                            courseId: '',
                            name: course.name,
                          })
                        }
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(course.id)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Course Metadata Bar */}
                  <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration:</span>
                      <span className="font-bold text-slate-800">{course.duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Credits:</span>
                      <span className="font-bold text-slate-800">{course.totalCredits} Credits</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Cohort Size:</span>
                      <span className="font-bold text-slate-800">{course.enrolledStudents} Enrolled</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Coordinator:</span>
                      <span className="font-bold text-slate-800 truncate block">{course.coordinator}</span>
                    </div>
                  </div>

                  {/* Expandable Subjects Section */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-4 h-4 text-[#1E6BFF]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Curriculum Subjects ({subjectsToDisplay.length})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {selectedSemester !== 'all' ? `Filtered by Sem ${selectedSemester}` : 'All Semesters'}
                        </span>
                      </div>

                      {subjectsToDisplay.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {subjectsToDisplay.map((sub) => (
                            <div
                              key={sub.id}
                              className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/70 rounded-2xl p-3.5 space-y-2.5 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs text-[#1E6BFF] bg-blue-100/70 px-2 py-0.5 rounded-md">
                                      {sub.code}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                      Sem {sub.semester}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-xs text-slate-900 leading-tight pt-1">
                                    {sub.name}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => openEditSubject(course.id, sub)}
                                    className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-white"
                                    title="Edit Subject"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        open: true,
                                        type: 'subject',
                                        id: sub.id,
                                        courseId: course.id,
                                        name: sub.name,
                                      })
                                    }
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                                    title="Delete Subject"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 truncate max-w-[140px]">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{sub.faculty}</span>
                                </span>
                                <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                                  {sub.credits} Credits &bull; {sub.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                          <p>No subjects listed for the chosen semester.</p>
                          <button
                            type="button"
                            onClick={() => openAddSubject(course.id)}
                            className="mt-2 text-xs font-bold text-[#1E6BFF] hover:underline"
                          >
                            + Add a subject to this course
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Course Title & Department</th>
                    <th className="py-3 px-4">Degree Level</th>
                    <th className="py-3 px-4">Semesters & Credits</th>
                    <th className="py-3 px-4">Subjects Count</th>
                    <th className="py-3 px-4">Coordinator</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-[#1E6BFF] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          {c.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 block">{c.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {c.degreeLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{c.totalSemesters} Semesters</span>
                        <span className="text-[11px] text-slate-400">{c.totalCredits} Total Credits</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1E6BFF] bg-blue-50 px-2.5 py-1 rounded-lg">
                          {c.subjects.length} Subjects
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{c.coordinator}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAddSubject(c.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-[#1E6BFF] font-bold text-[11px] px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            + Subject
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCourse(c)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                type: 'course',
                                id: c.id,
                                courseId: '',
                                name: c.name,
                              })
                            }
                            className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-12 border border-slate-200/80 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching curriculum programs found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any courses or subjects matching your search or filter combination.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('All Departments');
              setSelectedLevel('All Levels');
              setSelectedSemester('all');
            }}
            className="bg-[#1E6BFF] hover:bg-[#155BE5] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-glow-blue transition-all cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Course Add / Edit Modal */}
      {courseModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-lg w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-[#1E6BFF] to-blue-600 text-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                {courseModal.mode === 'add' ? 'New Degree Program' : 'Modify Curriculum Course'}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                {courseModal.mode === 'add' ? 'Add Academic Course' : `Edit: ${courseModal.course?.code}`}
              </h3>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCSE, MCA, MBA"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Degree Level</label>
                  <select
                    value={courseForm.degreeLevel}
                    onChange={(e) => setCourseForm({ ...courseForm, degreeLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Course Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech - Computer Science & Engineering"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Academic Department</label>
                <select
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                >
                  {DEPARTMENTS.filter((d) => d !== 'All Departments').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseForm.totalSemesters}
                    onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Total Credits</label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={courseForm.totalCredits}
                    onChange={(e) => setCourseForm({ ...courseForm, totalCredits: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Program Coordinator / HOD</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. S.K. Sharma"
                  value={courseForm.coordinator}
                  onChange={(e) => setCourseForm({ ...courseForm, coordinator: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Program Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief curriculum description..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900">
                💡 <strong>Demo Mode:</strong> Saves to React local state. Backend schemas remain untouched.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCourseModal({ open: false, mode: 'add', course: null })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E6BFF] hover:bg-[#155BE5] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-glow-blue cursor-pointer"
                >
                  {courseModal.mode === 'add' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Add / Edit Modal */}
      {subjectModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-lg w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-[#1E6BFF] to-blue-600 text-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
                {subjectModal.mode === 'add' ? 'New Subject Allocation' : 'Edit Subject'}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                {subjectModal.mode === 'add' ? 'Add Subject to Course' : `Edit: ${subjectModal.subject?.code}`}
              </h3>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KCS501"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Credits</label>
                  <select
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  >
                    <option value={1}>1 Credit</option>
                    <option value={2}>2 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={4}>4 Credits</option>
                    <option value={5}>5 Credits</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Subject Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Theory + Lab">Theory + Lab</option>
                    <option value="Lab Only">Lab Only</option>
                    <option value="Audit">Audit Course</option>
                    <option value="Elective">Department Elective</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Faculty In-Charge</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. S.K. Sharma"
                  value={subjectForm.faculty}
                  onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900">
                💡 <strong>Demo Mode:</strong> Updates local state only.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubjectModal({ open: false, mode: 'add', courseId: null, subject: null })}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E6BFF] hover:bg-[#155BE5] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-glow-blue cursor-pointer"
                >
                  {subjectModal.mode === 'add' ? 'Add Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-sm w-full p-5 sm:p-6 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                Delete {deleteConfirm.type === 'course' ? 'Course' : 'Subject'}?
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove <strong>"{deleteConfirm.name}"</strong>? This will remove it from your active local session view.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: '', id: '', courseId: '', name: '' })}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-soft-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
