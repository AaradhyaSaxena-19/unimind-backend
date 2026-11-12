import React, { useState, useEffect } from 'react';
import { getNotifications, markAllNotificationsRead, clearNotification } from '../../services/academicService';
import NeoButton from './NeoButton';
import NeoBadge from './NeoBadge';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Calendar,
  AlertTriangle,
  CreditCard,
  BookOpen,
  Megaphone,
} from 'lucide-react';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifs();
    }
  }, [isOpen]);

  const loadNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleClear = async (id, e) => {
    e.stopPropagation();
    try {
      await clearNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to clear notification:', err);
    }
  };

  if (!isOpen) return null;

  const filteredNotifs =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'attendance':
        return AlertTriangle;
      case 'fee':
        return CreditCard;
      case 'exam':
        return Calendar;
      case 'assignment':
        return BookOpen;
      default:
        return Megaphone;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full border-l border-slate-200/80 shadow-soft-lg flex flex-col text-left animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-[#1E6BFF] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Academic alerts & deadlines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto">
            {['all', 'attendance', 'assignment', 'fee', 'exam'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full transition-all ${
                  filter === f
                    ? 'bg-blue-50 text-[#1E6BFF] border border-blue-200/60'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto stroke-[1.5] text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">No notifications in this category.</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const Icon = getTypeIcon(n.type);
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all relative ${
                    n.is_read
                      ? 'bg-white border-slate-100 shadow-soft-xs'
                      : 'bg-blue-50/50 border-blue-100 shadow-soft-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-slate-800 leading-tight">
                          {n.title}
                        </h5>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">
                        {n.message}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 block mt-1.5">
                        {n.time}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleClear(n.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 absolute top-2 right-2 cursor-pointer"
                      title="Clear"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
