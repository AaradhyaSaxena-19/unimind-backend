import React, { useState, useEffect } from 'react';
import { getAssignments, submitAssignment } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FileCheck2,
  Calendar,
  User,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

export const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Submit Modal state
  const [activeAsg, setActiveAsg] = useState(null);
  const [fileName, setFileName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadAssignments = async () => {
    try {
      const data = await getAssignments(filter, subjectFilter);
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [filter, subjectFilter]);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!activeAsg || !fileName) return;

    setSubmitting(true);
    setFeedback('');

    try {
      const res = await submitAssignment({
        assignment_id: activeAsg.id,
        file_name: fileName,
        remarks,
      });

      setFeedback(res.message);
      setActiveAsg(null);
      setFileName('');
      setRemarks('');
      await loadAssignments();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Academic Coursework..." />;

  const subjects = ['ALL', 'KCS501', 'KCS502', 'KCS503', 'BNC501'];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Academic Coursework
            </span>
            <span className="text-xs font-medium text-purple-200">
              Continuous Evaluation Tasks
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Assignments & Submissions
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Subject-wise submissions &bull; Faculty review &bull; Grade tracking
          </p>
        </div>

        <NeoBadge color="yellow" size="md">
          {assignments.filter((a) => !a.is_submitted).length} Pending Tasks
        </NeoBadge>
      </div>

      {feedback && (
        <NeoAlert
          type="success"
          title="Submission Recorded"
          message={feedback}
          onClose={() => setFeedback('')}
        />
      )}

      {/* Filter Bar */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none">
          {['all', 'pending', 'submitted', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer shrink-0
                ${
                  filter === tab
                    ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Subject:
          </span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-soft">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-base text-slate-800">No assignments in this category!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              You are all caught up with your academic submissions.
            </p>
          </div>
        ) : (
          assignments.map((asg) => {
            const isSubmitted = asg.is_submitted;
            const isOverdue = !isSubmitted && asg.due_date < new Date().toISOString().slice(0, 10);

            return (
              <div
                key={asg.id}
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-4 text-left transition-all hover:border-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <NeoBadge color="purple" size="xs">
                        {asg.subject_code}
                      </NeoBadge>
                      <span className="text-xs font-medium text-slate-400">
                        {asg.subject_name}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800">{asg.title}</h3>
                  </div>

                  <NeoBadge
                    color={isSubmitted ? 'mint' : isOverdue ? 'coral' : 'yellow'}
                    size="sm"
                  >
                    {isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                  </NeoBadge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {asg.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Faculty: <strong>{asg.faculty}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due Date: <strong>{asg.due_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attachment: <strong className="text-[#1E6BFF]">{asg.attachment_name || 'problem-sheet.pdf'}</strong></span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                  {isSubmitted ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">Submitted on {asg.submission_date || 'Nov 10, 2026'}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      Status: Open for submission
                    </span>
                  )}

                  <NeoButton
                    variant={isSubmitted ? 'white' : 'primary'}
                    size="sm"
                    icon={Upload}
                    onClick={() => setActiveAsg(asg)}
                    className="rounded-full w-full sm:w-auto justify-center"
                  >
                    {isSubmitted ? 'Re-upload / Update' : 'Submit Assignment'}
                  </NeoButton>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {activeAsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-5 sm:p-6 max-w-md w-full space-y-4 text-left relative animate-in fade-in duration-200">
            <button
              onClick={() => setActiveAsg(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Submit Assignment</h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px]">
                  {activeAsg.title}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Select Submission File (PDF, DOCX, ZIP)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 210161010001_DBMS_Assgn1.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Remarks / Notes for Faculty
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain solution or add query execution screenshots..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <NeoButton
                  variant="white"
                  size="sm"
                  onClick={() => setActiveAsg(null)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  className="rounded-full"
                >
                  Upload & Turn In
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
