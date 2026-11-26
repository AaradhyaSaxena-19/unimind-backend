import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoInput from '../components/common/NeoInput';
import NeoSelect from '../components/common/NeoSelect';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getMe,
  gradeSubmission,
  createAssignment,
  createCircular,
  createFaculty,
  getFacultyStudentDetail,
} from '../services/linkageService';
import {
  Users,
  GraduationCap,
  FileCheck2,
  Megaphone,
  Plus,
  X,
  UserPlus,
  Activity,
  Mail,
  Building2,
  CheckCircle2,
  Send,
  BookOpen,
  ShieldAlert,
  Wallet,
} from 'lucide-react';

const Chip = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200/70',
    blue: 'bg-blue-50 text-[#1E6BFF] border-blue-100',
    mint: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

const attendanceTone = (value = 0) => (value >= 75 ? 'mint' : value >= 65 ? 'amber' : 'rose');

const Stat = ({ label, value, hint, icon: Icon, tone = 'text-slate-900' }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
    <div className="flex items-start justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-300" />}
    </div>
    <span className={`text-2xl font-extrabold block mt-1 ${tone}`}>{value}</span>
    {hint && <span className="text-[10px] font-medium text-slate-400 block mt-0.5">{hint}</span>}
  </div>
);

export const CampusLinkPage = () => {
  const { role, profile } = useAuth();
  const isAdmin = role === 'admin';

  const [data, setData] = useState(null);
  const [tab, setTab] = useState('students');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState(null);

  const [grades, setGrades] = useState({});
  const [assignmentForm, setAssignmentForm] = useState({
    subject: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 20,
  });
  const [circularForm, setCircularForm] = useState({
    title: '',
    content: '',
    category: 'Placement',
    priority: 'normal',
  });
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    subjects: '',
    password: '',
  });

  const load = async () => {
    try {
      const payload = await getMe();
      setData(payload);
      const subjects = payload?.profile?.subjects || [];
      if (subjects.length && !assignmentForm.subject) {
        const code = subjects[0].split(' ')[0];
        setAssignmentForm((prev) => ({ ...prev, subject: code }));
      }
    } catch (err) {
      setError(err.message || 'Could not load the campus link hub.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const students = data?.students || [];
  const faculty = data?.faculty || [];
  const submissions = data?.submissions || [];
  const activity = data?.activity || [];
  const announcements = data?.announcements || [];
  const stats = data?.stats || {};

  const subjectOptions = useMemo(() => {
    const subjectRows = data?.profile?.subjects || [];
    const options = subjectRows.map((entry) => {
      const [code, ...rest] = entry.split(' ');
      return { value: code, label: `${code} ${rest.join(' ')}`.trim() };
    });
    if (options.length === 0) {
      return [
        { value: 'KCS501', label: 'KCS501 DBMS' },
        { value: 'KCS502', label: 'KCS502 Compiler Design' },
        { value: 'KCS503', label: 'KCS503 DAA' },
        { value: 'KCS504', label: 'KCS504 Web Technology' },
        { value: 'BNC501', label: 'BNC501 Constitution of India' },
      ];
    }
    return options;
  }, [data]);

  const handleGrade = async (submission) => {
    const entry = grades[submission.id] || {};
    if (entry.marks === '' || entry.marks === undefined || entry.marks === null) {
      setError('Enter marks before saving.');
      return;
    }
    const marks = Number(entry.marks);
    if (Number.isNaN(marks) || marks < 0) {
      setError('Enter valid marks before saving.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await gradeSubmission(submission.id, {
        marks,
        remarks: entry.remarks || '',
      });
      setNotice(res.message || 'Marks saved.');
      setGrades((prev) => ({ ...prev, [submission.id]: { marks: '', remarks: '' } }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await createAssignment({
        subject_code: assignmentForm.subject,
        title: assignmentForm.title,
        description: assignmentForm.description,
        due_date: assignmentForm.due_date,
        max_marks: Number(assignmentForm.max_marks) || 20,
      });
      setNotice(res.message || 'Assignment published.');
      setAssignmentForm((prev) => ({ ...prev, title: '', description: '', due_date: '' }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCircular = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await createCircular(circularForm);
      setNotice(res.message || 'Circular published.');
      setCircularForm({ title: '', content: '', category: 'Placement', priority: 'normal' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFaculty = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await createFaculty({
        name: facultyForm.name,
        email: facultyForm.email,
        department: facultyForm.department,
        designation: facultyForm.designation,
        subjects: facultyForm.subjects
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        password: facultyForm.password,
      });
      setNotice(
        `${res.message} Login password: ${res.credentials?.password || '(as entered)'}.`
      );
      setFacultyForm({
        name: '',
        email: '',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        subjects: '',
        password: '',
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const openStudent = async (studentId) => {
    setError('');
    try {
      const payload = await getFacultyStudentDetail(studentId);
      setDetail(payload);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner label="Connecting student, faculty and admin records..." />;

  const pending = submissions.filter((row) => row.marks === null || row.marks === undefined);

  const tabs = [
    { id: 'students', label: `Students (${students.length})`, icon: Users },
    { id: 'submissions', label: `Submissions (${pending.length} pending)`, icon: FileCheck2 },
    { id: 'classwork', label: 'Post to class', icon: BookOpen },
    ...(isAdmin ? [{ id: 'faculty', label: `Faculty (${faculty.length})`, icon: GraduationCap }] : []),
    { id: 'circulars', label: 'Circulars & activity', icon: Megaphone },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 text-left">
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-indigo-700 via-[#1E6BFF] to-sky-600 text-white shadow-glow-blue">
        <div className="absolute -bottom-16 -right-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 px-3 py-1 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" /> Connected campus workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAdmin ? 'Campus Link Hub' : 'Classroom Roster'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            {isAdmin
              ? 'The same roster the students and faculty use: enrol students, add faculty accounts, review submissions, publish circulars and watch the shared activity feed.'
              : `You are signed in as ${profile?.full_name || 'faculty'}. Every student enrolled by the admin is here - grade their submissions, post assignments and circulars, and follow their placement activity.`}
          </p>
        </div>
      </div>

      {error && <NeoAlert type="error" title="Campus Link" message={error} onClose={() => setError('')} />}
      {notice && <NeoAlert type="success" title="Saved" message={notice} onClose={() => setNotice('')} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="Students" value={stats.students || students.length} icon={Users} hint="on the shared roster" />
        <Stat
          label="Avg attendance"
          value={`${stats.avg_attendance ?? 0}%`}
          icon={CheckCircle2}
          tone={(stats.avg_attendance || 0) >= 75 ? 'text-emerald-600' : 'text-amber-600'}
          hint={`${stats.below_75 || 0} below 75%`}
        />
        <Stat label="Pending reviews" value={stats.pending_reviews ?? pending.length} icon={FileCheck2} tone="text-[#1E6BFF]" />
        <Stat label="Resumes" value={stats.resumes || 0} icon={GraduationCap} hint="uploaded in Job Finds" />
        <Stat
          label="Pending dues"
          value={`₹${Number(stats.pending_dues || 0).toLocaleString()}`}
          icon={Wallet}
          tone="text-rose-600"
          hint={`${stats.applications || 0} job applications`}
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                tab === item.id
                  ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'students' && (
        <NeoCard
          title="Linked student roster"
          subtitle="Attendance, dues, resume and job applications in one row"
          icon={Users}
          badge={`${students.length} active`}
          badgeColor="blue"
        >
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs text-slate-900">{student.name}</h4>
                    <Chip>{student.roll_no}</Chip>
                    <Chip tone="blue">Sem {student.semester}</Chip>
                    <Chip tone={attendanceTone(student.attendance)}>{student.attendance}% attendance</Chip>
                    {student.pending_fee > 0 ? (
                      <Chip tone="rose">₹{Number(student.pending_fee).toLocaleString()} due</Chip>
                    ) : (
                      <Chip tone="mint">Fees clear</Chip>
                    )}
                    {student.resume_uploaded ? (
                      <Chip tone="mint">Resume ready</Chip>
                    ) : (
                      <Chip tone="amber">No resume</Chip>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {student.email} &bull; mentor {student.mentor || 'assigned'} &bull;{' '}
                    {student.applications} application{student.applications === 1 ? '' : 's'} &bull;{' '}
                    {student.pending_submissions} pending submission
                    {student.pending_submissions === 1 ? '' : 's'}
                    {student.resume_skills?.length ? ` · ${student.resume_skills.slice(0, 4).join(', ')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-700">
                    CGPA {student.cgpa ?? '—'}
                  </span>
                  <NeoButton size="sm" variant="white" onClick={() => openStudent(student.id)}>
                    Open 360°
                  </NeoButton>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">
                No students yet. An admin can enrol the first student from the Admin Hub.
              </p>
            )}
          </div>
        </NeoCard>
      )}

      {tab === 'submissions' && (
        <NeoCard
          title="Assignment submissions"
          subtitle="Marks saved here appear instantly on the student's assignment card"
          icon={FileCheck2}
          badge={`${pending.length} awaiting marks`}
          badgeColor={pending.length ? 'yellow' : 'mint'}
        >
          <div className="space-y-2">
            {submissions.map((row) => {
              const entry = grades[row.id] || { marks: '', remarks: '' };
              const graded = row.marks !== null && row.marks !== undefined;
              return (
                <div key={row.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900">{row.student_name}</h4>
                        <Chip>{row.roll_no}</Chip>
                        <Chip tone={graded ? 'mint' : 'amber'}>
                          {graded ? `${row.marks}/${row.max_marks}` : 'Awaiting marks'}
                        </Chip>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {row.assignment_title} &bull; {row.subject_code} &bull; {row.file_name}
                      </p>
                    </div>
                    {graded && (
                      <span className="text-[10px] text-slate-400">
                        by {row.graded_by} on {row.graded_at}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="w-full sm:w-28">
                      <NeoInput
                        type="number"
                        min="0"
                        max={row.max_marks}
                        placeholder={`/ ${row.max_marks}`}
                        value={entry.marks}
                        onChange={(e) =>
                          setGrades((prev) => ({
                            ...prev,
                            [row.id]: { ...entry, marks: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <NeoInput
                        placeholder="Feedback for the student (optional)"
                        value={entry.remarks}
                        onChange={(e) =>
                          setGrades((prev) => ({
                            ...prev,
                            [row.id]: { ...entry, remarks: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <NeoButton
                      size="sm"
                      variant="primary"
                      loading={busy}
                      onClick={() => handleGrade(row)}
                      className="sm:self-center"
                    >
                      {graded ? 'Update marks' : 'Save marks'}
                    </NeoButton>
                  </div>
                </div>
              );
            })}
            {submissions.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">
                No submissions yet. Post an assignment and students will submit from their Tasks page.
              </p>
            )}
          </div>
        </NeoCard>
      )}

      {tab === 'classwork' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <NeoCard title="Post an assignment" subtitle="Appears in every student's Tasks page" icon={Plus} badge="Class" badgeColor="blue">
            <form onSubmit={handleAssignment} className="space-y-2.5">
              <NeoSelect
                label="Subject"
                value={assignmentForm.subject}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                options={subjectOptions}
              />
              <NeoInput
                label="Title"
                required
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                placeholder="Unit 4 normalization worksheet"
              />
              <NeoInput
                label="Instructions"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                placeholder="Solve problems 1-8 and submit a PDF"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <NeoInput
                  label="Due date"
                  type="date"
                  required
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                />
                <NeoInput
                  label="Max marks"
                  type="number"
                  min="1"
                  max="100"
                  value={assignmentForm.max_marks}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, max_marks: e.target.value })}
                />
              </div>
              <NeoButton type="submit" icon={Send} loading={busy} className="w-full">
                Publish assignment
              </NeoButton>
            </form>
          </NeoCard>

          <NeoCard title="Latest submissions" subtitle="Straight from the student portal" icon={FileCheck2} badge={`${submissions.length} total`} badgeColor="purple">
            <div className="space-y-2">
              {submissions.slice(0, 6).map((row) => (
                <div key={row.id} className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{row.student_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{row.assignment_title}</p>
                  </div>
                  <Chip tone={row.marks === null || row.marks === undefined ? 'amber' : 'mint'}>
                    {row.marks === null || row.marks === undefined ? 'pending' : `${row.marks}/${row.max_marks}`}
                  </Chip>
                </div>
              ))}
              {submissions.length === 0 && <p className="text-xs text-slate-400">Nothing submitted yet.</p>}
            </div>
          </NeoCard>
        </div>
      )}

      {isAdmin && tab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <NeoCard title="Faculty accounts" subtitle="They can sign in with these credentials" icon={GraduationCap} badge={`${faculty.length} active`} badgeColor="purple">
            <div className="space-y-2">
              {faculty.map((member) => (
                <div key={member.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{member.full_name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {member.designation} &bull; {member.department}
                      </p>
                    </div>
                    <Chip tone="blue">{member.subjects?.length || 0} subjects</Chip>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {member.email}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(member.subjects || []).map((subject) => (
                      <Chip key={subject}>{subject}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          <NeoCard title="Add a faculty member" subtitle="Creates a working login on the spot" icon={UserPlus} badge="Admin" badgeColor="yellow">
            <form onSubmit={handleFaculty} className="space-y-2.5">
              <NeoInput
                label="Full name"
                required
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                placeholder="Dr. Meera Nair"
              />
              <NeoInput
                label="Email"
                type="email"
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                placeholder="meera.nair@rbmi.in"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <NeoInput
                  label="Designation"
                  value={facultyForm.designation}
                  onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                />
                <NeoInput
                  label="Password"
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  placeholder="fac@2026"
                />
              </div>
              <NeoInput
                label="Department"
                value={facultyForm.department}
                onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
              />
              <NeoInput
                label="Subjects (comma separated)"
                value={facultyForm.subjects}
                onChange={(e) => setFacultyForm({ ...facultyForm, subjects: e.target.value })}
                placeholder="KCS504 Web Technology"
              />
              <NeoButton type="submit" icon={UserPlus} loading={busy} className="w-full">
                Create faculty account
              </NeoButton>
            </form>
          </NeoCard>
        </div>
      )}

      {tab === 'circulars' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <NeoCard title="Publish a circular" subtitle="Students see it on their announcements page" icon={Megaphone} badge="All portals" badgeColor="yellow">
            <form onSubmit={handleCircular} className="space-y-2.5">
              <NeoInput
                label="Title"
                required
                value={circularForm.title}
                onChange={(e) => setCircularForm({ ...circularForm, title: e.target.value })}
                placeholder="Placement drive registration closes Friday"
              />
              <NeoSelect
                label="Category"
                value={circularForm.category}
                onChange={(e) => setCircularForm({ ...circularForm, category: e.target.value })}
                options={[
                  { value: 'Placement', label: 'Placement' },
                  { value: 'Exam Circular', label: 'Exam Circular' },
                  { value: 'Campus Event', label: 'Campus Event' },
                  { value: 'Circular', label: 'General Circular' },
                ]}
              />
              <NeoSelect
                label="Priority"
                value={circularForm.priority}
                onChange={(e) => setCircularForm({ ...circularForm, priority: e.target.value })}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                ]}
              />
              <NeoInput
                label="Message"
                required
                value={circularForm.content}
                onChange={(e) => setCircularForm({ ...circularForm, content: e.target.value })}
                placeholder="Eligible students must apply before 5 PM Friday."
              />
              <NeoButton type="submit" icon={Send} loading={busy} className="w-full">
                Publish circular
              </NeoButton>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recent circulars
              </span>
              {announcements.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{item.title}</p>
                    <Chip tone={item.priority === 'high' ? 'rose' : 'slate'}>{item.category}</Chip>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.author} &bull; {item.date}
                  </p>
                </div>
              ))}
            </div>
          </NeoCard>

          <NeoCard title="Shared activity feed" subtitle="Every role writes to the same log" icon={Activity} badge="Live" badgeColor="mint">
            <div className="space-y-2">
              {activity.map((event) => (
                <div key={event.id} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      event.actor_role === 'student'
                        ? 'bg-blue-50 text-[#1E6BFF]'
                        : event.actor_role === 'teacher'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-800">
                      {event.actor_name}{' '}
                      <span className="font-medium text-slate-500">{event.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{event.detail}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-300 shrink-0">
                    {(event.at || '').slice(11, 16)}
                  </span>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-xs text-slate-400 py-4">
                  Activity will appear here when students upload resumes, apply, or submit work.
                </p>
              )}
            </div>
          </NeoCard>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{detail.profile?.full_name}</h3>
                <p className="text-xs text-slate-500">
                  {detail.profile?.roll_no} &bull; {detail.profile?.course} &bull; Sem{' '}
                  {detail.profile?.semester}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Attendance</span>
                <span className="text-sm font-bold text-slate-800">
                  {detail.attendance?.percentage}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">CGPA</span>
                <span className="text-sm font-bold text-slate-800">
                  {detail.results?.current_cgpa ?? '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Dues</span>
                <span className="text-sm font-bold text-rose-600">
                  ₹{Number(detail.fees?.pending_fee || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Applied</span>
                <span className="text-sm font-bold text-[#1E6BFF]">
                  {detail.applications?.length || 0}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assignments
              </span>
              <div className="space-y-1.5 mt-1.5">
                {(detail.assignments?.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-700 truncate">{item.title}</span>
                    <Chip tone={item.status === 'graded' ? 'mint' : item.is_submitted ? 'blue' : 'amber'}>
                      {item.status === 'graded'
                        ? `${item.marks_awarded}/${item.max_marks}`
                        : item.is_submitted
                        ? 'submitted'
                        : 'pending'}
                    </Chip>
                  </div>
                ))}
                {(detail.assignments?.items || []).length === 0 && (
                  <p className="text-[11px] text-slate-400">No assignments.</p>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Resume skills
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(detail.resume?.skills || []).map((skill) => (
                  <Chip key={skill} tone="blue">{skill}</Chip>
                ))}
                {!detail.resume && <p className="text-[11px] text-slate-400">No resume uploaded yet.</p>}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Job applications
              </span>
              <div className="space-y-1.5 mt-1.5">
                {(detail.applications || []).map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-2 rounded-xl border border-slate-100 hover:border-blue-200"
                  >
                    <span className="text-[11px] font-semibold text-slate-700 truncate">{app.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{app.company}</span>
                  </a>
                ))}
                {(detail.applications || []).length === 0 && (
                  <p className="text-[11px] text-slate-400">No applications yet.</p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Mentored by {detail.profile?.mentor || 'the class mentor'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusLinkPage;
