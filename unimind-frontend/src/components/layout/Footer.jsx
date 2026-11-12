import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/70 bg-white px-4 md:px-8 py-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1E6BFF] flex items-center justify-center text-white shadow-glow-blue">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-bold text-sm text-slate-800">
            UniMind AI &bull; Intelligent Academic Cloud Platform
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            AKTU B.Tech
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            FastAPI + Groq LLM
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            Supabase RLS
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <span>Designed with modern EdTech design</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
