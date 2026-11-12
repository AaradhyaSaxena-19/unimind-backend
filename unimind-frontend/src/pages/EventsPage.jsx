import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, MapPin, Sparkles, PartyPopper, BookOpen, AlertOctagon } from 'lucide-react';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getEvents();
        if (mounted) setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading Campus Events & Holidays..." />;

  const filteredEvents =
    typeFilter === 'all'
      ? events
      : events.filter((e) => e.type === typeFilter);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'fest':
        return { color: 'coral', label: 'College Fest' };
      case 'holiday':
        return { color: 'mint', label: 'Gazetted Holiday' };
      case 'exam':
        return { color: 'yellow', label: 'Academic Examination' };
      default:
        return { color: 'purple', label: 'Academic Workshop' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Academic Calendar
            </span>
            <span className="text-xs font-medium text-purple-200">
              Institutional Activities & Holidays
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Campus Events & Holidays
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Key academic milestones &bull; Cultural festivals &bull; Scheduled semester holidays
          </p>
        </div>

        <NeoBadge color="yellow" size="md">
          {events.length} Upcoming Dates
        </NeoBadge>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none">
        {['all', 'fest', 'holiday', 'academic', 'exam'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer shrink-0 ${
              typeFilter === t
                ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => {
          const badge = getTypeBadge(ev.type);
          return (
            <div
              key={ev.id}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between gap-4 text-left transition-all hover:border-slate-200"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <NeoBadge color={badge.color} size="sm">
                      {badge.label}
                    </NeoBadge>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {ev.date}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {ev.description}
                </p>
              </div>

              {ev.location && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600">{ev.location}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;
