import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTeacherSubjects, isSupabaseConfigured } from '../services/supabase';
import { previewPaper, savePaper } from '../services/paperService';
import PaperUploadForm from '../components/teacher/PaperUploadForm';
import QuestionEditor from '../components/teacher/QuestionEditor';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import { FileCheck, Sparkles, FolderCheck, PlusCircle } from 'lucide-react';

export const TeacherPaperStudio = () => {
  const { user, profile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentCode, setCurrentCode] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadSubjects = async () => {
      if (isSupabaseConfigured() && user?.id) {
        const subs = await fetchTeacherSubjects(user.id);
        if (mounted && subs.length > 0) {
          setSubjects(subs);
          return;
        }
      }

      if (mounted) {
        setSubjects([
          { id: 's1', code: 'BNC501', name: 'Constitution of India, Law and Engineering', semester: 5 },
          { id: 's2', code: 'KCS501', name: 'Database Management Systems', semester: 5 },
          { id: 's3', code: 'KCS502', name: 'Compiler Design', semester: 5 },
        ]);
      }
    };

    loadSubjects();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handlePreview = async ({ file, subjectCode, examYear }) => {
    setError('');
    setLoadingPreview(true);
    setCurrentFile(file);
    setCurrentCode(subjectCode);
    setCurrentYear(examYear);

    try {
      const data = await previewPaper({ file, subjectCode, examYear });
      setPreviewData(data);
    } catch (err) {
      console.error('Error during paper preview:', err);
      setError(err.message || 'Could not extract questions from PDF.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSaveQuestions = async ({ questions, replace }) => {
    setError('');
    setSaving(true);

    try {
      const res = await savePaper({
        file: currentFile,
        subjectCode: currentCode,
        examYear: currentYear,
        questions,
        replace,
      });

      setSuccessData(res);
      setPreviewData(null);
    } catch (err) {
      console.error('Error saving question paper:', err);
      setError(err.message || 'Could not save question paper to Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreviewData(null);
    setSuccessData(null);
    setCurrentFile(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* Title Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-3xl shadow-glow-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full">
              Faculty Portal
            </span>
            <span className="text-xs font-medium text-purple-200">
              {profile?.full_name || 'Teacher'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Question Paper AI Studio
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Upload AKTU exam PDFs &bull; Auto-detect topics & marks &bull; Enrich student exam analytics
          </p>
        </div>

        <NeoBadge color="purple" size="md">
          {subjects.length} Assigned Subject{subjects.length > 1 ? 's' : ''}
        </NeoBadge>
      </div>

      {error && (
        <NeoAlert
          type="error"
          title="Operation Failed"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Success View */}
      {successData && (
        <NeoCard
          title="Paper Successfully Stored"
          icon={FileCheck}
          badge="Complete"
          badgeColor="mint"
        >
          <div className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <FolderCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                {currentCode} ({currentYear}) Saved to Knowledge Base!
              </h3>
              <p className="text-xs text-slate-500">
                {successData.questions} questions have been inserted into the database. Students can now view exam trends for this subject.
              </p>
              <p className="text-xs font-mono bg-slate-50 border border-slate-200 inline-block px-3 py-1 rounded-xl mt-2 text-slate-700">
                Storage Path: <strong>question-papers/{successData.pdf}</strong>
              </p>
            </div>

            <div className="pt-4">
              <NeoButton
                variant="primary"
                size="md"
                onClick={handleReset}
                icon={PlusCircle}
                className="rounded-full"
              >
                Upload Another Question Paper
              </NeoButton>
            </div>
          </div>
        </NeoCard>
      )}

      {/* Stage 1: Upload Form */}
      {!previewData && !successData && (
        <PaperUploadForm
          subjects={subjects}
          onPreview={handlePreview}
          loading={loadingPreview}
        />
      )}

      {/* Stage 2: Question Review & Edit */}
      {previewData && (
        <QuestionEditor
          paperData={previewData}
          onSave={handleSaveQuestions}
          onCancel={handleReset}
          saving={saving}
        />
      )}
    </div>
  );
};

export default TeacherPaperStudio;
