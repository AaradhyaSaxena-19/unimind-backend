import React, { useState, useEffect } from 'react';
import { getAssessments, getAssessmentDetails, submitAssessment } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Award,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  Play,
} from 'lucide-react';

export const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Test Engine state
  const [activeTest, setActiveTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const loadList = async () => {
    try {
      const data = await getAssessments();
      setAssessments(data.assessments || []);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // Timer countdown hook for active test
  useEffect(() => {
    if (!activeTest || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, timeLeft]);

  const handleStartTest = async (testId) => {
    setLoading(true);
    try {
      const details = await getAssessmentDetails(testId);
      setActiveTest(details);
      setCurrentQIndex(0);
      setAnswers({});
      setTimeLeft(details.duration_minutes * 60);
      setTestResult(null);
    } catch (err) {
      console.error('Error starting test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleAutoSubmit = async () => {
    if (submittingTest) return;
    await handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmittingTest(true);

    try {
      const res = await submitAssessment({
        assessment_id: activeTest.id,
        answers,
      });
      setTestResult(res);
      setActiveTest(null);
      await loadList();
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmittingTest(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Academic Assessments Engine..." />;

  // -------------------------------------------------------------
  // Test Taking Engine View
  // -------------------------------------------------------------
  if (activeTest) {
    const questions = activeTest.questions || [];
    const currentQ = questions[currentQIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isAnswered = currentQ && answers[currentQ.id] !== undefined;

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 text-left">
        {/* Test Header with Live Timer */}
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <NeoBadge color="purple" size="xs">
              {activeTest.subject_code}
            </NeoBadge>
            <h2 className="font-bold text-base sm:text-lg text-slate-800 mt-1">{activeTest.title}</h2>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-mono font-bold text-sm">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            <NeoButton
              variant="primary"
              size="sm"
              onClick={handleSubmitTest}
              loading={submittingTest}
              className="rounded-full"
            >
              Finish Test
            </NeoButton>
          </div>
        </div>

        {/* Question Palette Navigation */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
            Questions:
          </span>
          {questions.map((q, idx) => {
            const answered = answers[q.id] !== undefined;
            const isCurrent = idx === currentQIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQIndex(idx)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                    : answered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Active Question Card */}
        {currentQ && (
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#1E6BFF] px-3 py-1 rounded-full border border-blue-100">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Marks: {currentQ.marks}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleOptionSelect(currentQ.id, optIdx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#1E6BFF] text-slate-900 shadow-soft-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="font-medium text-sm">{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <NeoButton
                variant="white"
                size="sm"
                icon={ChevronLeft}
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => prev - 1)}
                className="rounded-full"
              >
                Previous
              </NeoButton>

              <NeoButton
                variant="primary"
                size="sm"
                icon={ChevronRight}
                disabled={currentQIndex === questions.length - 1}
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="rounded-full"
              >
                Next Question
              </NeoButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Test Results View (after submission)
  // -------------------------------------------------------------
  if (testResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-left">
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-soft space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow-emerald">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Assessment Evaluated!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your responses have been graded and recorded in the academic portal.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Score</span>
              <span className="text-xl font-bold text-slate-800">
                {testResult.score} / {testResult.total_marks}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Percentage</span>
              <span className="text-xl font-bold text-slate-800">{testResult.percentage}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
              <span className={`text-xl font-bold ${testResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {testResult.passed ? 'PASSED' : 'RETRY'}
              </span>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="text-left space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Question by Question Review:
            </h4>
            {testResult.breakdown?.map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  item.is_correct ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.is_correct ? '✓' : '✗'}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900 mb-1">{item.question}</p>
                  <p className="text-slate-600">
                    Your choice: <strong>Option {item.user_choice !== undefined ? item.user_choice + 1 : 'None'}</strong> &bull; Correct:{' '}
                    <strong className="text-emerald-700">Option {item.correct_choice + 1}</strong>
                  </p>
                </div>
                <span className="font-bold text-xs text-slate-700 shrink-0">
                  +{item.marks_earned}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <NeoButton variant="primary" size="md" onClick={() => setTestResult(null)} className="rounded-full">
              Return to Assessments List
            </NeoButton>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default List View
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Evaluation Portal
            </span>
            <span className="text-xs font-medium text-blue-100">
              MCQs, Quizzes & Pre-Exam Assessments
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Online Assessments & Tests
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Timed interactive test engine &bull; Automatic evaluation &bull; Instant feedback
          </p>
        </div>

        <NeoBadge color="coral" size="md">
          {assessments.filter((a) => a.status === 'available').length} Available
        </NeoBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((test) => {
          const isAvailable = test.status === 'available';
          const isCompleted = test.status === 'completed';

          return (
            <NeoCard
              key={test.id}
              title={test.title}
              badge={test.status.toUpperCase()}
              badgeColor={isAvailable ? 'mint' : isCompleted ? 'purple' : 'yellow'}
              className="flex flex-col justify-between"
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <NeoBadge color="purple" size="xs">
                    {test.subject_code}
                  </NeoBadge>
                  <span className="text-xs font-medium text-slate-500">
                    {test.subject_name}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-bold text-slate-800">{test.duration_minutes} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <span className="font-bold text-slate-800">{test.total_marks}</span>
                  </div>
                  {isCompleted && (
                    <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200/60 pt-1.5">
                      <span>Score:</span>
                      <span>
                        {test.score} / {test.total_marks} ({test.percentage}%)
                      </span>
                    </div>
                  )}
                  {test.start_time && (
                    <div className="flex justify-between text-slate-400">
                      <span>Schedule:</span>
                      <span>{test.start_time}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {test.instructions}
                </p>
              </div>

              <div className="pt-4 mt-auto">
                {isAvailable ? (
                  <NeoButton
                    variant="primary"
                    size="sm"
                    icon={Play}
                    className="w-full rounded-full"
                    onClick={() => handleStartTest(test.id)}
                  >
                    Start Assessment Now
                  </NeoButton>
                ) : isCompleted ? (
                  <NeoButton variant="white" size="sm" disabled className="w-full rounded-full">
                    Completed ({test.score} Marks)
                  </NeoButton>
                ) : (
                  <NeoButton variant="white" size="sm" disabled className="w-full rounded-full">
                    Opens Soon
                  </NeoButton>
                )}
              </div>
            </NeoCard>
          );
        })}
      </div>
    </div>
  );
};

export default AssessmentsPage;
