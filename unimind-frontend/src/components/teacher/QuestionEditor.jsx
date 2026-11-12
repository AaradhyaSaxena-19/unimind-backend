import React, { useState } from 'react';
import NeoButton from '../common/NeoButton';
import NeoBadge from '../common/NeoBadge';
import NeoAlert from '../common/NeoAlert';
import { Trash2, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const QuestionEditor = ({ paperData, onSave, onCancel, saving }) => {
  const [questions, setQuestions] = useState(paperData?.questions || []);
  const [replace, setReplace] = useState(false);
  const [error, setError] = useState('');

  const subject = paperData?.subject;
  const examYear = paperData?.exam_year;
  const scanned = paperData?.scanned;

  const handleTopicChange = (index, newTopic) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], topic: newTopic };
      return updated;
    });
  };

  const handleTextChange = (index, newText) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], question_text: newText };
      return updated;
    });
  };

  const handleDelete = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      setError('At least one question is required.');
      return;
    }
    onSave({ questions, replace });
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Banner */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <NeoBadge color="blue" size="md">
              {subject?.code} &bull; {examYear}
            </NeoBadge>
            <NeoBadge color={scanned ? 'coral' : 'mint'} size="sm">
              {scanned ? 'Scanned Paper (Vision OCR)' : 'Typed PDF (Text Mode)'}
            </NeoBadge>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Sem {subject?.semester}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{subject?.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            AI extracted {questions.length} individual questions. Review and edit any topics below before saving to knowledge base.
          </p>
        </div>

        <NeoButton variant="white" size="sm" onClick={onCancel} icon={RotateCcw}>
          Upload Different Paper
        </NeoButton>
      </div>

      {error && (
        <NeoAlert type="error" title="Validation Error" message={error} />
      )}

      {/* Question Cards List */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-soft-xs text-left space-y-3 hover:border-slate-200 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E6BFF] font-bold text-xs flex items-center justify-center">
                  Q{idx + 1}
                </span>

                {q.section && (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    Sec {q.section}
                  </span>
                )}

                {q.unit !== null && q.unit !== undefined && (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    Unit {q.unit}
                  </span>
                )}

                {q.marks !== null && q.marks !== undefined && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {q.marks} Marks
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Remove Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Topic */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                Topic Tag:
              </span>
              <input
                type="text"
                value={q.topic || ''}
                onChange={(e) => handleTopicChange(idx, e.target.value)}
                placeholder="Topic name (2-5 words)"
                className="flex-1 bg-slate-50 text-slate-900 font-medium text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF]"
              />
            </div>

            {/* Question Text */}
            <textarea
              rows={2}
              value={q.question_text || ''}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              className="w-full bg-slate-50/60 text-slate-800 font-medium text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1E6BFF] resize-y"
            />
          </div>
        ))}
      </div>

      {/* Save Action Footer */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Replace Existing Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={replace}
            onChange={(e) => setReplace(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#1E6BFF] focus:ring-blue-400 cursor-pointer"
          />
          <span className="text-xs font-medium text-slate-700">
            Replace existing paper if {subject?.code} {examYear} was already uploaded
          </span>
        </label>

        <NeoButton
          variant="primary"
          size="md"
          onClick={handleSubmit}
          loading={saving}
          icon={CheckCircle2}
          className="rounded-full"
        >
          Confirm & Save Questions to Database
        </NeoButton>
      </div>
    </div>
  );
};

export default QuestionEditor;
