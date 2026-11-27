import React, { useState, useEffect } from 'react';
import { getExams } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, Clock, MapPin, Download, AlertCircle, Award, Printer, X, QrCode } from 'lucide-react';

export const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [session, setSession] = useState('Odd Semester 2026-27');
  const [loading, setLoading] = useState(true);
  const [showAdmitCard, setShowAdmitCard] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getExams();
        if (mounted) {
          setExams(data.exams || []);
          if (data.session) setSession(data.session);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading Examination Schedule..." />;

  const getDaysLeft = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateStr);
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white rounded-3xl shadow-glow-coral flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Official Timetable
            </span>
            <span className="text-xs font-medium text-rose-100">
              Dr. APJ Abdul Kalam Technical University (AKTU)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            End Semester Examination Schedule
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            {session} &bull; Room allocations &bull; Digital Admit Card Verification
          </p>
        </div>

        <NeoButton
          variant="white"
          size="md"
          icon={Download}
          onClick={() => setShowAdmitCard(true)}
          className="rounded-full w-full sm:w-auto justify-center"
        >
          View Admit Card
        </NeoButton>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((ex) => {
          const daysLeft = getDaysLeft(ex.exam_date);
          const isUrgent = daysLeft <= 15;

          return (
            <div
              key={ex.id}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between gap-4 text-left transition-all hover:border-slate-200"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <NeoBadge color="purple" size="sm">
                      {ex.subject_code}
                    </NeoBadge>
                    <span className="text-xs font-medium text-slate-400">
                      Max {ex.max_marks} Marks
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      daysLeft > 0
                        ? isUrgent
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {daysLeft > 0 ? `In ${daysLeft} Days` : 'Completed'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{ex.subject_name}</h3>
                <p className="text-xs text-slate-400 font-medium">{ex.exam_type}</p>
              </div>

              {/* Schedule Metadata */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{ex.exam_date}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{ex.time}</span>
                </div>

                <div className="col-span-2 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{ex.room}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Admit Card Modal */}
      {showAdmitCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-6 max-w-lg w-full space-y-4 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdmitCard(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-100 pb-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Dr. APJ Abdul Kalam Technical University, Lucknow
              </span>
              <h3 className="font-extrabold text-lg text-slate-900">
                Official Digital Admit Card
              </h3>
              <p className="text-xs text-slate-500">
                Odd Semester Examinations 2026-27 &bull; Hall Ticket
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-slate-800">Kanishka Saxena</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">University Roll No</span>
                <span className="font-mono font-bold text-slate-800">210161010001</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Branch</span>
                <span className="font-bold text-slate-800">B.Tech - CSE (Sem 5)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Centre Code</span>
                <span className="font-bold text-slate-800">161 - RBMI Bareilly</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Exam Paper Schedule
              </span>
              <div className="space-y-1.5">
                {exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{ex.subject_code}</span>
                      <span className="text-slate-400 ml-2">{ex.subject_name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{ex.exam_date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Gate Entry Requires Official College ID
              </span>
              <div className="flex gap-2">
                <NeoButton
                  variant="white"
                  size="sm"
                  onClick={() => window.print()}
                  icon={Printer}
                  className="rounded-full"
                >
                  Print
                </NeoButton>
                <NeoButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAdmitCard(false)}
                  className="rounded-full"
                >
                  Close
                </NeoButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
