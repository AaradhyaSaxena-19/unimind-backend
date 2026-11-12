import React, { useState, useEffect } from 'react';
import { getAnnouncements, markAnnouncementRead } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Megaphone, Calendar, User, Eye, CheckCircle2, X } from 'lucide-react';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAnnouncements();
        if (mounted) setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenNotice = async (ann) => {
    setSelectedAnn(ann);
    if (!ann.is_read) {
      try {
        await markAnnouncementRead(ann.id);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === ann.id ? { ...a, is_read: true } : a))
        );
      } catch (e) {
        // ignore
      }
    }
  };

  if (loading) return <LoadingSpinner label="Loading Campus Circulars..." />;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      <div className="p-5 sm:p-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl shadow-glow-amber flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Official Notices
            </span>
            <span className="text-xs font-medium text-amber-100">
              Registrar & Department Bulletins
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Announcements & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Important college notices &bull; Examination orders &bull; Placement drives
          </p>
        </div>

        <NeoBadge color="coral" size="md">
          {announcements.filter((a) => !a.is_read).length} Unread Notices
        </NeoBadge>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            onClick={() => handleOpenNotice(ann)}
            className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-soft-xs hover:shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              ann.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/40 border-blue-200/70 border-l-4 border-l-[#1E6BFF]'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {ann.category || 'Academic'}
                </span>
                {!ann.is_read && (
                  <span className="text-[10px] font-bold text-[#1E6BFF] bg-blue-100 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium">
                  {ann.date}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                {ann.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {ann.content}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Read Circular</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Notice Details Modal */}
      {selectedAnn && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-6 max-w-lg w-full space-y-4 text-left relative animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedAnn(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1E6BFF] px-2.5 py-0.5 rounded-full border border-blue-100">
                {selectedAnn.category || 'Official Circular'}
              </span>
              <h3 className="font-bold text-lg text-slate-900 pt-1 leading-snug">
                {selectedAnn.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span>Issued by: {selectedAnn.issued_by || 'Registrar Office'}</span>
                <span>&bull;</span>
                <span>Date: {selectedAnn.date}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {selectedAnn.content}
            </div>

            <div className="flex justify-end pt-2">
              <NeoButton
                variant="primary"
                size="sm"
                onClick={() => setSelectedAnn(null)}
                className="rounded-full"
              >
                Done
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
