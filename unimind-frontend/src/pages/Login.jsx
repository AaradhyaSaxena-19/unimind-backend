import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoInput from '../components/common/NeoInput';
import NeoAlert from '../components/common/NeoAlert';
import {
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  GraduationCap,
  Shield,
  Users,
  KeyRound,
  X,
  CheckCircle,
} from 'lucide-react';

export const Login = () => {
  const { login, loginWithSupabase, loginDemo, resetPassword, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const userRole = res?.role || res?.profile?.role || 'student';
      if (userRole === 'teacher') {
        navigate('/teacher/papers');
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    loginDemo(role);
    if (role === 'teacher') {
      navigate('/teacher/papers');
    } else if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 select-none">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E6BFF] text-white shadow-glow-blue">
            <Sparkles className="w-7 h-7 fill-white/20" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            UniMind <span className="text-[#1E6BFF]">AI</span>
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Student & Parent Academic Management Portal
          </p>
        </div>

        {/* Main Login Card */}
        <NeoCard
          title="Campus Portal Access"
          subtitle="Student, Parent, Faculty & Admin Sign In"
          icon={Lock}
          badge="SSL Encrypted"
          badgeColor="blue"
        >
          {error && (
            <NeoAlert
              type="error"
              title="Authentication Alert"
              message={error}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <NeoInput
              label="College Email or University Roll Number"
              type="text"
              placeholder="e.g. 210161010001 or aaradhya.saxena@rbmi.in"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <NeoInput
                label="Designated Account Password"
                type="password"
                placeholder="Enter student or role password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center justify-between mt-1.5 text-xs">
                <span className="text-[11px] text-slate-400">
                  Password configured during enrollment
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setResetSuccess(false);
                  }}
                  className="text-xs font-semibold text-[#1E6BFF] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div className="pt-2">
              <NeoButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Sign In to Designated Portal
              </NeoButton>
            </div>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Demo Switcher
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="p-3 rounded-2xl border border-blue-100 bg-blue-50/70 hover:bg-blue-100 text-blue-700 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                <span className="text-[11px] font-bold">Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('parent')}
                className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-5 h-5" />
                <span className="text-[11px] font-bold">Parent</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('teacher')}
                className="p-3 rounded-2xl border border-purple-100 bg-purple-50/70 hover:bg-purple-100 text-purple-700 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                <span className="text-[11px] font-bold">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-3 rounded-2xl border border-rose-100 bg-rose-50/70 hover:bg-rose-100 text-rose-700 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-5 h-5" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-6 max-w-sm w-full space-y-4 text-left relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Reset Password</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered college email.
                </p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Email Dispatched!</h4>
                <p className="text-xs text-emerald-700">
                  A reset link has been dispatched to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
                <NeoButton
                  variant="white"
                  size="sm"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-2"
                >
                  Return to Login
                </NeoButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <NeoInput
                  label="Registered Email"
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <NeoButton
                    variant="white"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={resetLoading}
                  >
                    Send Link
                  </NeoButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
