import React, { useState, useEffect } from 'react';
import { getResults } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Award, Printer, Download, Sparkles, TrendingUp, CheckCircle, FileText } from 'lucide-react';

export const ResultsPage = () => {
  const [resultsData, setResultsData] = useState(null);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getResults();
        if (mounted) setResultsData(data);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Compiling University Grade Sheets..." />;

  const currentSem = resultsData?.semesters?.[activeSemIndex] || {
    semester: 4,
    session: '2025-26 Even',
    sgpa: 8.65,
    result_status: 'PASS',
    subjects: [],
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Official Academic Records
            </span>
            <span className="text-xs font-medium text-blue-100">
              Controller of Examinations &bull; AKTU
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Performance & Report Cards
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Credit accumulation &bull; SGPA/CGPA evaluation &bull; Subject grade points
          </p>
        </div>

        <NeoButton
          variant="white"
          size="md"
          icon={Printer}
          onClick={() => window.print()}
          className="rounded-full w-full sm:w-auto justify-center"
        >
          Print Grade Sheet
        </NeoButton>
      </div>

      {/* Highlights Metrics: CGPA, SGPA, Credits, Result */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Cumulative CGPA
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            {resultsData?.current_cgpa || '8.42'}
          </span>
          <span className="text-xs font-semibold text-emerald-600 block mt-1 truncate">
            Honors Division
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Latest SGPA
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            {currentSem.sgpa}
          </span>
          <span className="text-xs font-semibold text-slate-400 block mt-1 truncate">
            Semester {currentSem.semester}
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            Earned Credits
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">
            {resultsData?.total_credits || '94'}
          </span>
          <span className="text-xs font-semibold text-slate-400 block mt-1 truncate">
            Zero Backlogs
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-emerald-50/70 rounded-3xl border border-emerald-100 shadow-soft-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
            Result Status
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight block mt-1">
            {currentSem.result_status}
          </span>
          <span className="text-xs font-semibold text-emerald-700/80 block mt-1 truncate">
            Promoted to Sem 5
          </span>
        </div>
      </div>

      {/* Semester Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 select-none">
        {resultsData?.semesters?.map((sem, idx) => (
          <button
            key={sem.semester}
            onClick={() => setActiveSemIndex(idx)}
            className={`
              px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0
              ${
                activeSemIndex === idx
                  ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }
            `}
          >
            Semester {sem.semester} ({sem.session})
          </button>
        ))}
      </div>

      {/* Grade Card Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Semester {currentSem.semester} Statement of Marks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              AKTU Tabulated Results &bull; Session {currentSem.session}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1E6BFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              SGPA: {currentSem.sgpa}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Subject Code</th>
                <th className="p-4">Subject Name</th>
                <th className="p-4 text-center">Credits</th>
                <th className="p-4 text-center">Marks</th>
                <th className="p-4 text-center">Letter Grade</th>
                <th className="p-4 text-center">Grade Point</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentSem.subjects?.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{sub.code}</td>
                  <td className="p-4 font-semibold text-slate-900">{sub.name}</td>
                  <td className="p-4 text-center">{sub.credits}</td>
                  <td className="p-4 text-center">{sub.marks_obtained}/{sub.max_marks}</td>
                  <td className="p-4 text-center font-bold text-blue-600">{sub.grade}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{sub.grade_point}</td>
                  <td className="p-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
