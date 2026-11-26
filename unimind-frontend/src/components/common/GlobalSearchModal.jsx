import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  BookOpen,
  Calendar,
  FileText,
  Megaphone,
  CreditCard,
  CheckSquare,
  ArrowRight,
  Briefcase,
  Users,
} from 'lucide-react';

const SEARCHABLE_ITEMS = [
  { title: 'Job Finds - Resume & Placement Engine', category: 'Placement', path: '/jobs', icon: Briefcase },
  { title: 'Campus Link Hub - Student, Faculty & Admin Records', category: 'Placement', path: '/campus/link', icon: Users },
  { title: 'Courses & Curriculum Management', category: 'Academics', path: '/courses', icon: BookOpen },
  { title: 'Faculty Attendance Portal', category: 'Faculty', path: '/teacher/attendance', icon: Calendar },
  { title: 'Database Management Systems (KCS501)', category: 'Subjects', path: '/attendance', icon: BookOpen },
  { title: 'Compiler Design (KCS502)', category: 'Subjects', path: '/attendance', icon: BookOpen },
  { title: 'Design & Analysis of Algorithms (KCS503)', category: 'Subjects', path: '/attendance', icon: BookOpen },
  { title: 'Constitution of India (BNC501)', category: 'Subjects', path: '/attendance', icon: BookOpen },
  { title: 'ER Model to Schema Normalization', category: 'Assignments', path: '/assignments', icon: CheckSquare },
  { title: 'Lexical Analyzer Implementation in C', category: 'Assignments', path: '/assignments', icon: CheckSquare },
  { title: 'AKTU Odd Semester Examination Schedule', category: 'Exams', path: '/exams', icon: Calendar },
  { title: 'TechSparks 2026 Annual Hackathon', category: 'Events', path: '/events', icon: Calendar },
  { title: 'Semester Tuition & Amenity Fee Ledger', category: 'Fees', path: '/fees', icon: CreditCard },
  { title: 'AKTU Examination Circular Notice', category: 'Announcements', path: '/announcements', icon: Megaphone },
  { title: 'Relational Algebra & SQL Quiz', category: 'Assessments', path: '/assessments', icon: CheckSquare },
  { title: 'Semester 4 Official Grade Card', category: 'Results', path: '/results', icon: FileText },
  { title: 'Digital Student Identity Card', category: 'Documents', path: '/documents', icon: FileText },
  { title: 'DBMS Unit 4 Transaction Processing Notes', category: 'Content', path: '/study-material', icon: FileText },
];

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? SEARCHABLE_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCHABLE_ITEMS.slice(0, 6);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-20 p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg max-w-xl w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, assignments, exams, notices, notes..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 shrink-0 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
            {query.trim() ? `Search Results (${results.length})` : 'Recommended Quick Jumps'}
          </span>

          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No matching academic resources found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="p-3 bg-white rounded-2xl border border-slate-100/80 hover:border-blue-200 hover:bg-blue-50/30 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-soft-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-800 leading-snug">
                        {item.title}
                      </h5>
                      <span className="text-[10px] font-medium text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
