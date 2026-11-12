import React, { useState, useEffect, useRef } from 'react';
import { getAdminSummary, addStudent, deleteStudent } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoInput from '../components/common/NeoInput';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Plus,
  Trash2,
  X,
  Sparkles,
  Camera,
  Upload,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
  Hash,
  BookOpen,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  // Table Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');

  // Multi-step Registration Form State
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'contact' | 'parent'
  const fileInputRef = useRef(null);

  // Form Fields
  const [photoPreview, setPhotoPreview] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [camuId, setCamuId] = useState('');
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');
  const [batch, setBatch] = useState('2024-2028');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('2004-05-15');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');

  const [parentName, setParentName] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bareilly');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('243001');

  const [formLoading, setFormLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getAdminSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load admin summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Photo File Selection
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Photograph must be under 5MB in size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoPreview(uploadEvent.target.result);
      setModalError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAutoGenerateIds = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRoll = `2401610${randomSuffix}`;
    setRollNo(newRoll);
    setCamuId(`RBMI2024${Math.floor(100 + Math.random() * 900)}`);
    if (name) {
      setEmail(`${name.toLowerCase().replace(/\s+/g, '.')}@rbmi.in`);
    }
  };

  const handleResetForm = () => {
    setPhotoPreview('');
    setName('');
    setRollNo('');
    setCamuId('');
    setCourse('B.Tech');
    setBranch('Computer Science & Engineering');
    setSemester(1);
    setSection('A');
    setBatch('2024-2028');
    setPhone('');
    setEmail('');
    setDob('2004-05-15');
    setGender('Male');
    setBloodGroup('B+');
    setParentName('');
    setParentRelation('Father');
    setParentPhone('');
    setParentEmail('');
    setAddress('');
    setCity('Bareilly');
    setStateName('Uttar Pradesh');
    setPincode('243001');
    setActiveTab('identity');
    setModalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setModalError('');

    // Validations
    if (!name.trim()) {
      setActiveTab('identity');
      setModalError('Student full name is required.');
      return;
    }
    if (!rollNo.trim()) {
      setActiveTab('identity');
      setModalError('University Roll Number is required.');
      return;
    }
    if (!semester) {
      setActiveTab('identity');
      setModalError('Please select a valid semester.');
      return;
    }
    if (!phone.trim()) {
      setActiveTab('contact');
      setModalError('Student contact phone number is required.');
      return;
    }

    setFormLoading(true);
    try {
      const studentPayload = {
        name: name.trim(),
        roll_no: rollNo.trim(),
        camu_id: camuId.trim() || `RBMI2024${Math.floor(100 + Math.random() * 900)}`,
        photo_url: photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rollNo.trim()}`,
        course,
        branch,
        semester: parseInt(semester, 10),
        section,
        batch,
        phone: phone.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@rbmi.in`,
        dob,
        gender,
        blood_group: bloodGroup,
        parent_name: parentName.trim() || 'Parent / Guardian',
        parent_relation: parentRelation,
        parent_phone: parentPhone.trim(),
        parent_email: parentEmail.trim(),
        address: address.trim() || `${city}, ${stateName}`,
        city,
        state: stateName,
        pincode,
      };

      const res = await addStudent(studentPayload);
      setFeedback(res.message || `Student ${name} successfully registered in Semester ${semester}!`);
      setShowAddStudent(false);
      handleResetForm();
      await loadSummary();
    } catch (err) {
      console.error('Add student error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to register student record.';
      setModalError(detail);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to permanently unregister ${studentName || 'this student'}?`)) {
      return;
    }
    try {
      await deleteStudent(id);
      setFeedback(`Student record for ${studentName || id} removed successfully.`);
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
      await loadSummary();
    } catch (err) {
      console.error('Delete student error:', err);
      setErrorFeedback('Failed to remove student record.');
    }
  };

  // Filtered Students
  const filteredStudents = (summary?.students || []).filter((std) => {
    const matchesSearch =
      searchQuery === '' ||
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (std.phone && std.phone.includes(searchQuery)) ||
      (std.camu_id && std.camu_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSemester =
      filterSemester === 'all' || std.semester.toString() === filterSemester.toString();

    const matchesBranch =
      filterBranch === 'all' ||
      std.branch.toLowerCase().includes(filterBranch.toLowerCase());

    return matchesSearch && matchesSemester && matchesBranch;
  });

  if (loading) return <LoadingSpinner label="Loading Institutional Admin Operations..." />;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full">
              System Administration
            </span>
            <span className="text-xs font-medium text-slate-300">
              Institutional RBAC & Student Admissions
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Campus ERP & Admissions Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Register students &bull; Photograph biometric profile &bull; Semester assignment &bull; Academic records
          </p>
        </div>

        <NeoButton
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            handleResetForm();
            setShowAddStudent(true);
          }}
          className="rounded-full w-full sm:w-auto justify-center shadow-lg hover:shadow-xl transition-all"
        >
          Register New Student
        </NeoButton>
      </div>

      {feedback && (
        <NeoAlert
          type="success"
          title="Registration Succeeded"
          message={feedback}
          onClose={() => setFeedback('')}
        />
      )}

      {errorFeedback && (
        <NeoAlert
          type="danger"
          title="Action Failed"
          message={errorFeedback}
          onClose={() => setErrorFeedback('')}
        />
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled
            </span>
            <span className="p-1.5 bg-blue-50 text-[#1E6BFF] rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
            {summary?.total_students}
          </span>
          <span className="text-xs font-medium text-slate-500 block mt-1">
            Active Student Roster
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Faculty Members
            </span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
            {summary?.total_faculty}
          </span>
          <span className="text-xs font-medium text-slate-500 block mt-1">
            Teaching & Mentors
          </span>
        </div>

        <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-100 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Fee Collections
            </span>
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-900 tracking-tight block mt-1">
            {summary?.total_revenue_collected}
          </span>
          <span className="text-xs font-semibold text-emerald-700/80 block mt-1">
            Pending: {summary?.pending_dues}
          </span>
        </div>

        <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-100 shadow-soft-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E6BFF]">
              Avg. Attendance
            </span>
            <span className="p-1.5 bg-blue-100 text-[#1E6BFF] rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-3xl font-extrabold text-[#1E6BFF] tracking-tight block mt-1">
            {summary?.avg_attendance}
          </span>
          <span className="text-xs font-semibold text-blue-700/80 block mt-1">
            Campus-wide Benchmark
          </span>
        </div>
      </div>

      {/* Students Directory Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden space-y-0">
        {/* Table Toolbar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <span>Student Enrollment Directory</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1E6BFF]">
                {filteredStudents.length} Students
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage registered students, photographs, semesters, contact numbers, and parent details
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
              />
            </div>

            {/* Semester Filter */}
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Branch Filter */}
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50/80 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Student Profile</th>
                <th className="p-4">Roll & ERP ID</th>
                <th className="p-4">Semester & Branch</th>
                <th className="p-4">Phone & Email</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching student records found. Click <strong>Register New Student</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Photo & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center font-bold text-slate-600 shadow-xs">
                          {std.photo_url ? (
                            <img
                              src={std.photo_url}
                              alt={std.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerText = std.name.charAt(0);
                              }}
                            />
                          ) : (
                            std.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate hover:text-[#1E6BFF] cursor-pointer" onClick={() => setSelectedStudent(std)}>
                            {std.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {std.course || 'B.Tech'} &bull; Sec {std.section || 'A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Roll No & CAMU ID */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 block">{std.roll_no}</span>
                      <span className="text-[11px] font-mono text-slate-400 block">{std.camu_id || 'RBMI2024001'}</span>
                    </td>

                    {/* Semester & Branch */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#1E6BFF] border border-blue-200/50">
                          Semester {std.semester}
                        </span>
                      </div>
                      <span className="text-slate-600 text-[11px] block truncate max-w-[170px]" title={std.branch}>
                        {std.branch}
                      </span>
                    </td>

                    {/* Phone & Email */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-xs">{std.phone || '+91 98765 43210'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5 truncate max-w-[160px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{std.email || `${std.name.toLowerCase().replace(' ', '.')}@rbmi.in`}</span>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-900 block">{std.attendance || '100%'}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Good</span>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          std.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {std.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="text-slate-400 hover:text-[#1E6BFF] p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Complete Student Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std.id, std.name)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* REGISTER NEW STUDENT MODAL                                            */}
      {/* ===================================================================== */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full my-auto text-left relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center font-bold shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Student Admission & Registration</h3>
                  <p className="text-xs text-slate-400">
                    Add student photograph, semester, contact number, and academic record
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddStudent(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside Modal */}
            {modalError && (
              <div className="px-6 pt-4 shrink-0">
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              </div>
            )}

            {/* Step Navigation Tabs */}
            <div className="px-6 pt-4 pb-1 border-b border-slate-100 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'identity'
                    ? 'border-[#1E6BFF] text-[#1E6BFF]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                1. Photo & Academics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'contact'
                    ? 'border-[#1E6BFF] text-[#1E6BFF]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                2. Contact & Personal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'parent'
                    ? 'border-[#1E6BFF] text-[#1E6BFF]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                3. Parent & Address
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateStudent} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: PHOTOGRAPH & ACADEMIC ALLOCATION */}
              {activeTab === 'identity' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Photo Upload Card */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-slate-300 group-hover:border-[#1E6BFF] flex items-center justify-center shadow-xs transition-colors">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Student Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2 text-slate-400 flex flex-col items-center">
                            <Camera className="w-6 h-6 mb-1 text-slate-400" />
                            <span className="text-[10px] font-semibold">No Photo</span>
                          </div>
                        )}
                      </div>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-colors"
                          title="Remove Photograph"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <NeoButton
                          type="button"
                          variant="white"
                          size="xs"
                          icon={Upload}
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-slate-200 text-slate-700 font-bold"
                        >
                          {photoPreview ? 'Change Photograph' : 'Upload Student Photograph'}
                        </NeoButton>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supported: JPG, PNG, WEBP (Max 5MB). Photo appears on student ID card, exam hall tickets, and ERP profile.
                      </p>
                    </div>
                  </div>

                  {/* Student Name & Roll Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NeoInput
                        label="Full Student Name *"
                        placeholder="e.g. Aarav Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={User}
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          University Roll Number *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateIds}
                          className="text-[11px] text-[#1E6BFF] hover:underline font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Gen ID
                        </button>
                      </div>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. 210161010045"
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          className="w-full bg-white text-slate-900 font-mono font-bold text-sm border border-slate-200 rounded-xl shadow-xs py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* ERP ID & Course */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NeoInput
                        label="CAMU ERP / Institutional ID"
                        placeholder="e.g. RBMI2024045"
                        value={camuId}
                        onChange={(e) => setCamuId(e.target.value)}
                        icon={Building2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Enrolled Degree / Program *
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                        <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                        <option value="MCA">MCA (Master of Computer Applications)</option>
                        <option value="MBA">MBA (Master of Business Administration)</option>
                        <option value="Diploma">Polytechnic Diploma</option>
                        <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
                      </select>
                    </div>
                  </div>

                  {/* Branch, Semester, Section & Batch */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Academic Branch *
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Information Technology">IT</option>
                        <option value="AI & Machine Learning">CSE (AI & ML)</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                        <option value="Civil Engineering">Civil</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Current Semester *
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                        className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] text-[#1E6BFF]"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Class Section
                      </label>
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT & PERSONAL DETAILS */}
              {activeTab === 'contact' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NeoInput
                        label="Student Mobile Phone *"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        icon={Phone}
                        type="tel"
                        required
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Used for attendance SMS alerts and OTP verification
                      </span>
                    </div>

                    <div>
                      <NeoInput
                        label="Student College / Personal Email"
                        placeholder="e.g. aarav.sharma@rbmi.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={Mail}
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Blood Group
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Admission Batch / Academic Cycle
                    </label>
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                    >
                      <option value="2024-2028">2024 - 2028 (Fresh 4-Year Cycle)</option>
                      <option value="2023-2027">2023 - 2027 (2nd Year)</option>
                      <option value="2022-2026">2022 - 2026 (3rd Year)</option>
                      <option value="2021-2025">2021 - 2025 (Final Year)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: PARENT & RESIDENTIAL ADDRESS */}
              {activeTab === 'parent' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NeoInput
                        label="Parent / Guardian Full Name"
                        placeholder="e.g. Rajesh Sharma"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        icon={User}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Relationship
                      </label>
                      <select
                        value={parentRelation}
                        onChange={(e) => setParentRelation(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NeoInput
                        label="Parent Contact Phone Number"
                        placeholder="e.g. +91 98765 12345"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        icon={Phone}
                        type="tel"
                      />
                    </div>

                    <div>
                      <NeoInput
                        label="Parent Email Address"
                        placeholder="e.g. parent.sharma@example.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        icon={Mail}
                        type="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Permanent Residential Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 142 Civil Lines, Near Circuit House"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {activeTab !== 'identity' && (
                    <NeoButton
                      type="button"
                      variant="white"
                      size="sm"
                      onClick={() => {
                        if (activeTab === 'parent') setActiveTab('contact');
                        else if (activeTab === 'contact') setActiveTab('identity');
                      }}
                    >
                      Back
                    </NeoButton>
                  )}
                  {activeTab !== 'parent' && (
                    <NeoButton
                      type="button"
                      variant="white"
                      size="sm"
                      onClick={() => {
                        if (activeTab === 'identity') setActiveTab('contact');
                        else if (activeTab === 'contact') setActiveTab('parent');
                      }}
                      className="text-[#1E6BFF] font-bold"
                    >
                      Next Step <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </NeoButton>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <NeoButton
                    type="button"
                    variant="white"
                    size="sm"
                    onClick={() => setShowAddStudent(false)}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={formLoading}
                    className="shadow-md rounded-xl"
                  >
                    Register & Enroll Student
                  </NeoButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STUDENT REGISTRATION DOSSIER CARD (VIEW MODAL)                       */}
      {/* ===================================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full text-left relative overflow-hidden animate-in fade-in duration-200">
            {/* Dossier Header Banner */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/60 shadow-lg shrink-0 flex items-center justify-center text-white font-black text-2xl">
                  {selectedStudent.photo_url ? (
                    <img
                      src={selectedStudent.photo_url}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerText = selectedStudent.name.charAt(0);
                      }}
                    />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                      Semester {selectedStudent.semester}
                    </span>
                    <span className="text-xs text-blue-100 font-mono">
                      {selectedStudent.roll_no}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl tracking-tight truncate">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-blue-100 truncate mt-0.5">
                    {selectedStudent.course || 'B.Tech'} &bull; {selectedStudent.branch}
                  </p>
                </div>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Academic Record Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Academic Credentials
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">CAMU ERP ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.camu_id || 'RBMI2024001'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Class Section:</span>
                  <span className="font-bold text-slate-900">Section {selectedStudent.section || 'A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Admission Batch:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.batch || '2024-2028'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Recorded Attendance:</span>
                  <span className="font-bold text-emerald-600">{selectedStudent.attendance || '100%'}</span>
                </div>
              </div>

              {/* Student Contact Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Personal & Contact Details
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">College Email:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.email || `${selectedStudent.name.toLowerCase().replace(' ', '.')}@rbmi.in`}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Date of Birth / Gender:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.dob || '2004-05-15'} ({selectedStudent.gender || 'Male'})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Blood Group:</span>
                  <span className="font-bold text-rose-600">{selectedStudent.blood_group || 'B+'}</span>
                </div>
              </div>

              {/* Guardian & Residence */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Guardian & Residential Record
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Guardian Name:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.parent_name || 'Guardian'} ({selectedStudent.parent_relation || 'Father'})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Guardian Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.parent_phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Residential Address:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[220px]">
                    {selectedStudent.address || 'Bareilly, Uttar Pradesh - 243001'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <NeoButton
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full w-full justify-center"
                >
                  Done & Close Dossier
                </NeoButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
