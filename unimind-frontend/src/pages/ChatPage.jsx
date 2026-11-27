import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { sendChatMessage } from '../services/chatService';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Meri percentage batao',
  'Kya main kal chutti le sakta hoon?',
  'DBMS ke past papers me kaunse topics repeat hue?',
  'Total pending fees kitni hai?',
  'Missed lectures ki details dikhao',
];

export const ChatPage = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (isSupabaseConfigured() && supabase && user?.id) {
        try {
          const { data } = await supabase
            .table('chat_messages')
            .select('sender, content, created_at')
            .eq('student_id', user.id)
            .order('created_at', { ascending: true })
            .limit(20);

          if (isMounted && data && data.length > 0) {
            setMessages(
              data.map((m) => ({
                sender: m.sender === 'student' ? 'user' : 'bot',
                text: m.content,
                timestamp: m.created_at,
                aiAvailable: true,
              }))
            );
            return;
          }
        } catch (err) {
          console.error('Error fetching chat history from Supabase:', err);
        }
      }

      if (isMounted && messages.length === 0) {
        setMessages([
          {
            sender: 'bot',
            text: `Namaste ${profile?.full_name || 'Student'}! Main UniMind AI hoon, aapka personal college tutor. Aap mujhse attendance, leave eligibility, internal marks, fees ya exam trends ke baare me kuch bhi pooch sakte hain. (English, Hindi ya Hinglish me)`,
            aiAvailable: true,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user, profile]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || sending) return;

    setError('');
    setInput('');

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const data = await sendChatMessage(text);
      const botMsg = {
        sender: 'bot',
        text: data.answer,
        aiAvailable: data.ai_available !== false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat API error:', err);
      setError(err.message || 'Could not communicate with UniMind backend. Make sure FastAPI server is running on port 8000.');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ Service temporarily unavailable: ${err.message}. Please verify the backend API service is reachable.`,
          aiAvailable: false,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col gap-3 sm:gap-4">
      {/* Header Context Bar */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-wrap items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-800">UniMind AI Assistant</h2>
              <NeoBadge color="mint" size="xs">
                Verified Engine
              </NeoBadge>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Personalized for {profile?.full_name || 'Student'} &bull; Groq Math & LLM Pipeline
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>RLS Protected</span>
        </div>
      </div>

      {error && (
        <NeoAlert
          type="error"
          title="API Notification"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-soft p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-3.5 sm:space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-100 text-[#1E6BFF]'
                    : 'bg-[#1E6BFF] text-white shadow-glow-blue'
                }`}
              >
                {isUser ? (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/20" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl text-left text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#1E6BFF] text-white rounded-tr-xs shadow-glow-blue font-medium'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-900 rounded-tl-xs border border-rose-200'
                    : 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-100 shadow-soft-xs font-normal'
                }`}
              >
                {msg.text}

                {!isUser && msg.aiAvailable === false && !msg.isError && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[10px] font-medium text-amber-700">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Raw Python numbers returned (Groq LLM temporarily offline)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E6BFF] text-white flex items-center justify-center shadow-glow-blue animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl rounded-tl-xs border border-slate-100 shadow-soft-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1E6BFF] animate-ping" />
              <span className="text-xs font-medium text-slate-600">
                UniMind is calculating your academic facts...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
          Suggestions:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={sending}
            className="text-xs font-medium bg-white text-slate-700 border border-slate-200/80 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-soft-xs hover:border-[#1E6BFF] hover:text-[#1E6BFF] hover:bg-blue-50/50 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask UniMind AI in English, Hindi or Hinglish..."
          disabled={sending}
          className="flex-1 bg-white text-slate-900 font-medium text-xs sm:text-sm border border-slate-200 rounded-full shadow-soft-xs py-2.5 sm:py-3.5 px-4 sm:px-6 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF] placeholder:text-slate-400 transition-all"
        />

        <NeoButton
          variant="primary"
          size="md"
          onClick={() => handleSend()}
          disabled={!input.trim() || sending}
          loading={sending}
          icon={Send}
          className="!py-2.5 sm:!py-3.5 !px-4 sm:!px-6 rounded-full shrink-0"
        >
          Send
        </NeoButton>
      </div>
    </div>
  );
};

export default ChatPage;
