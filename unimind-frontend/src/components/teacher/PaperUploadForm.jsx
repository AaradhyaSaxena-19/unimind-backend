import React, { useState } from 'react';
import NeoCard from '../common/NeoCard';
import NeoButton from '../common/NeoButton';
import NeoInput from '../common/NeoInput';
import NeoSelect from '../common/NeoSelect';
import NeoAlert from '../common/NeoAlert';
import { Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';

export const PaperUploadForm = ({ subjects = [], onPreview, loading }) => {
  const [file, setFile] = useState(null);
  const [subjectCode, setSubjectCode] = useState(subjects[0]?.code || '');
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [formError, setFormError] = useState('');

  const subjectOptions = [
    ...subjects.map((s) => ({
      value: s.code,
      label: `${s.code} - ${s.name} (Sem ${s.semester})`,
    })),
    { value: 'CUSTOM', label: '+ Enter Custom Subject Code' },
  ];

  const [useCustomCode, setUseCustomCode] = useState(subjects.length === 0);
  const [customCode, setCustomCode] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFormError('');
    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Please select a valid PDF file (.pdf extension).');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFormError('The selected PDF exceeds the 10 MB limit.');
      return;
    }

    setFile(selected);

    // Try to auto-detect subject and year from filename, e.g. BNC501_2026.pdf
    const match = selected.name.match(/^([A-Za-z]{2,5}\d{3,4})_(\d{4})\.pdf$/i);
    if (match) {
      const code = match[1].toUpperCase();
      const year = parseInt(match[2], 10);
      if (subjects.some((s) => s.code === code)) {
        setSubjectCode(code);
        setUseCustomCode(false);
      } else {
        setUseCustomCode(true);
        setCustomCode(code);
      }
      setExamYear(year);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!file) {
      setFormError('Please choose a question paper PDF file to upload.');
      return;
    }

    const finalCode = useCustomCode ? customCode.trim().toUpperCase() : subjectCode.trim().toUpperCase();
    if (!finalCode) {
      setFormError('Please specify the subject code.');
      return;
    }

    if (!/^[A-Z]{2,5}\d{3,4}$/.test(finalCode)) {
      setFormError('Subject code must look like BNC501 or KCS501 (letters followed by digits, no spaces).');
      return;
    }

    const yearNum = parseInt(examYear, 10);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > maxYear) {
      setFormError(`Exam year must be between 2000 and ${maxYear}.`);
      return;
    }

    onPreview({
      file,
      subjectCode: finalCode,
      examYear: yearNum,
    });
  };

  return (
    <NeoCard
      title="Upload AKTU Question Paper"
      subtitle="AI extracts & categorizes each question automatically"
      icon={Upload}
      badge="PDF Studio"
      badgeColor="purple"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {formError && (
          <NeoAlert type="error" title="Invalid Submission" message={formError} onClose={() => setFormError('')} />
        )}

        {/* File Drop Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Question Paper File (PDF, Max 10MB)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 p-6 text-center hover:bg-blue-50/40 hover:border-blue-300 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">
                  {file ? file.name : 'Click or drag PDF here to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction` : 'Supports both typed PDFs and scanned question papers'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Code Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            {!useCustomCode && subjects.length > 0 ? (
              <NeoSelect
                label="Assigned Subject"
                options={subjectOptions}
                value={subjectCode}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setUseCustomCode(true);
                  } else {
                    setSubjectCode(e.target.value);
                  }
                }}
              />
            ) : (
              <div>
                <NeoInput
                  label="Subject Code"
                  placeholder="e.g. BNC501 or KCS501"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                />
                {subjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustomCode(false)}
                    className="text-[11px] font-bold text-neutral-600 underline mt-1 cursor-pointer"
                  >
                    ← Choose from assigned subjects list
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <NeoInput
              label="Exam Year"
              type="number"
              min="2000"
              max={new Date().getFullYear() + 1}
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <NeoButton
            type="submit"
            variant="accent"
            size="lg"
            loading={loading}
            icon={Sparkles}
            className="w-full"
          >
            {loading ? 'AI Analyzing PDF (Vision/Text)...' : 'Extract Questions with Groq AI'}
          </NeoButton>
          <p className="text-[11px] font-bold text-neutral-500 text-center mt-2">
            Uses Vision OCR for scanned papers or high-speed LLM text extraction for typed documents.
          </p>
        </div>
      </form>
    </NeoCard>
  );
};

export default PaperUploadForm;
