import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth } from '../../services/healthService';
import { getNotifications } from '../../services/academicService';
import QRScannerModal from '../common/QRScannerModal';
import NotificationDrawer from '../common/NotificationDrawer';
import GlobalSearchModal from '../common/GlobalSearchModal';
import {
  Sparkles,
  LogOut,
  Search,
  QrCode,
  Bell,
  Activity,
  Menu,
  Flame,
  Diamond,
} from 'lucide-react';
import NeoButton from '../common/NeoButton';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, profile, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(null);

  // Modals state
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    let isMounted = true;
    const ping = async () => {
      const ok = await checkBackendHealth();
      if (isMounted) setApiOnline(ok);
    };

    ping();
    const interval = setInterval(ping, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      if (user) {
        try {
          const res = await getNotifications();
          if (isMounted) setUnreadCount(res.unread_count || 0);
        } catch (e) {
          // ignore
        }
      }
    };
    fetchCount();
    return () => {
      isMounted = false;
    };
  }, [user, isNotifOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu Toggle + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group select-none shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1E6BFF] flex items-center justify-center text-white shadow-glow-blue group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-slate-900 block leading-none">
                  UniMind{' '}
                  <span className="text-[#1E6BFF] font-black">
                    AI
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:block mt-0.5">
                  Academic Cloud
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar (Lingora-style pill search) */}
          {user && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200/60 rounded-full py-2.5 px-4 flex items-center justify-between cursor-pointer transition-all shadow-soft-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>Search subjects, exams, circulars, notes...</span>
                </div>
                <span className="bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shadow-xs">
                  Ctrl+K
                </span>
              </button>
            </div>
          )}

          {/* Right: Streak, Gems, Health, QR, Notifs & User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Streak flame pill (Lingora style) */}
            {user && (
              <div
                title="12-Day Study Streak Active"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 text-xs font-bold select-none"
              >
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>12</span>
              </div>
            )}

            {/* Credits / Gems pill (Lingora style) */}
            {user && (
              <div
                title="480 Academic Credits"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#1E6BFF] text-xs font-bold select-none"
              >
                <Diamond className="w-3.5 h-3.5 fill-[#1E6BFF]/20" />
                <span>480</span>
              </div>
            )}

            {/* Backend Health Badge */}
            <div
              title={
                apiOnline
                  ? 'FastAPI Backend Online (Port 8000)'
                  : 'FastAPI Backend Offline or unreachable'
              }
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold select-none ${
                apiOnline === true
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : apiOnline === false
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>{apiOnline ? 'Online' : 'Offline'}</span>
            </div>

            {user ? (
              <>
                {/* Search icon on mobile */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* QR Scanner Trigger */}
                <button
                  type="button"
                  onClick={() => setIsQrOpen(true)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Scan Attendance / Event QR"
                >
                  <QrCode className="w-4 h-4 text-[#1E6BFF]" />
                  <span className="hidden xl:inline">Scan QR</span>
                </button>

                {/* Notification Bell with Badge */}
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center relative cursor-pointer transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  )}
                </button>

                {/* Role Pill & Logout */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span
                    className={`hidden sm:inline-flex text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full border ${
                      role === 'student'
                        ? 'bg-blue-50 text-[#1E6BFF] border-blue-200/60'
                        : role === 'parent'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : role === 'teacher'
                        ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                        : 'bg-rose-50 text-rose-700 border-rose-200/60'
                    }`}
                  >
                    {role || 'student'}
                  </span>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login">
                <NeoButton variant="primary" size="sm">
                  Sign In
                </NeoButton>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <QRScannerModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
