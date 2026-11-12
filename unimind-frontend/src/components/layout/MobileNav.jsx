import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, FileCheck2, MessageSquare, Menu } from 'lucide-react';

export const MobileNav = ({ onOpenSidebar }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/70 px-2 pt-1.5 pb-2.5 sm:pb-1.5 flex items-center justify-around lg:hidden shadow-soft select-none">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 p-1 rounded-xl transition-all ${
            isActive ? 'text-[#1E6BFF] font-bold' : 'text-slate-500 font-medium'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink
        to="/timetable"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            isActive ? 'text-[#1E6BFF] font-bold' : 'text-slate-500 font-medium'
          }`
        }
      >
        <Clock className="w-5 h-5" />
        <span className="text-[10px]">Timetable</span>
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            isActive ? 'text-[#1E6BFF] font-bold' : 'text-slate-500 font-medium'
          }`
        }
      >
        <div className="w-8 h-8 rounded-full bg-[#1E6BFF] text-white flex items-center justify-center -mt-3 shadow-glow-blue">
          <MessageSquare className="w-4 h-4" />
        </div>
        <span className="text-[10px]">AI Chat</span>
      </NavLink>

      <NavLink
        to="/assignments"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
            isActive ? 'text-[#1E6BFF] font-bold' : 'text-slate-500 font-medium'
          }`
        }
      >
        <FileCheck2 className="w-5 h-5" />
        <span className="text-[10px]">Tasks</span>
      </NavLink>

      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">More</span>
      </button>
    </div>
  );
};

export default MobileNav;
