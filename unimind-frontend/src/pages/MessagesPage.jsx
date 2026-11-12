import React, { useState, useEffect } from 'react';
import { getMessages, sendMessage } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Mail, Send, User, MessageSquare, Clock, CheckCheck } from 'lucide-react';

export const MessagesPage = () => {
  const [threads, setThreads] = useState([]);
  const [activeThreadIndex, setActiveThreadIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    try {
      const data = await getMessages();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const activeThread = threads[activeThreadIndex];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      await sendMessage({
        faculty_name: activeThread.faculty_name,
        subject: activeThread.subject,
        text: textToSend,
      });
      await loadThreads();
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner label="Opening Faculty Communication Channels..." />;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 text-left">
      <div className="p-5 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-3xl shadow-glow-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Direct Mentorship
            </span>
            <span className="text-xs font-medium text-purple-200">
              Official Faculty & Student Communication
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Messaging Hub
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Clear academic doubts &bull; Schedule project reviews &bull; Direct mentor contact
          </p>
        </div>

        <NeoBadge color="purple" size="md">
          {threads.length} Active Threads
        </NeoBadge>
      </div>

      {/* Mobile Faculty Conversation Switcher Pills */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {threads.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setActiveThreadIndex(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              activeThreadIndex === idx
                ? 'bg-[#1E6BFF] text-white shadow-glow-blue'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {t.faculty_name}
          </button>
        ))}
      </div>

      {/* Main Chat Interface Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-250px)] min-h-[460px] md:h-[550px]">
        {/* Threads List Sidebar (Desktop) */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-soft p-3 overflow-y-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
            Faculty Conversations
          </span>
          {threads.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => setActiveThreadIndex(idx)}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                activeThreadIndex === idx
                  ? 'bg-blue-50 text-[#1E6BFF] border border-blue-200/70 shadow-soft-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs truncate max-w-[150px]">{t.faculty_name}</h4>
                <span className="text-[10px] text-slate-400">{t.last_time}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{t.subject}</p>
              <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-normal">
                {t.messages[t.messages.length - 1]?.text}
              </p>
            </div>
          ))}
        </div>

        {/* Conversation View Area */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between overflow-hidden h-full">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center font-bold text-sm">
                    {activeThread.faculty_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {activeThread.faculty_name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {activeThread.subject}
                    </span>
                  </div>
                </div>

                <NeoBadge color="mint" size="xs">
                  Active Channel
                </NeoBadge>
              </div>

              {/* Message Bubbles Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {activeThread.messages.map((m, i) => {
                  const isMe = m.sender === 'student';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#1E6BFF] text-white rounded-tr-xs shadow-glow-blue font-medium'
                            : 'bg-white text-slate-800 rounded-tl-xs border border-slate-100 shadow-soft-xs font-normal'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {m.time}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type a message to your mentor..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs font-medium py-3 px-4 bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="bg-[#1E6BFF] hover:bg-[#155BE5] text-white p-3 rounded-full shadow-glow-blue disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              Select a conversation to begin messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
