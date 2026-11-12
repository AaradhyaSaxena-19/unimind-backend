import React, { useState, useEffect } from 'react';
import { getContent } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BookOpen, Download, FileText, User, Calendar, ExternalLink } from 'lucide-react';

export const StudyMaterialPage = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getContent(selectedSubject);
        if (mounted) setContentList(data.content || []);
      } catch (err) {
        console.error('Failed to load study content:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [selectedSubject]);

  if (loading) return <LoadingSpinner label="Indexing Faculty Study Material..." />;

  const subjects = ['ALL', 'KCS501', 'KCS502', 'KCS503', 'BNC501'];

  const handleDownload = (item) => {
    alert(`Downloading "${item.title}" (${item.size}) prepared by ${item.faculty}...`);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              E-Learning Repository
            </span>
            <span className="text-xs font-medium text-blue-100">
              Department of Computer Science & Engineering
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Content & Notes
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Verified lecture slides &bull; Unit-wise study handouts &bull; AKTU reference PDFs
          </p>
        </div>

        <NeoBadge color="purple" size="md">
          {contentList.length} Verified Documents
        </NeoBadge>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              selectedSubject === sub
                ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Content List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentList.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between gap-4 text-left transition-all hover:border-slate-200"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <NeoBadge color="purple" size="sm">
                    {item.subject_code}
                  </NeoBadge>
                  <span className="text-xs font-medium text-slate-400">
                    Unit {item.unit}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {item.file_type} &bull; {item.size}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 font-normal">
                {item.subject_name}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-600">{item.faculty}</span>
              </div>

              <NeoButton
                variant="white"
                size="sm"
                icon={Download}
                onClick={() => handleDownload(item)}
                className="rounded-full"
              >
                Download
              </NeoButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterialPage;
