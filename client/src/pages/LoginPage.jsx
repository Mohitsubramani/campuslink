import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, LogIn, KeyRound, X } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveAuthSession, setOtpPending } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.status === 403) {
        setOtpPending(email);
        navigate('/verify-otp');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      saveAuthSession(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setModalMsg({ type: '', text: '' });
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalMsg({ type: 'success', text: data.devOtpNotice || data.message });
      setResetStep(2);
    } catch (err) {
      setModalMsg({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalMsg({ type: '', text: '' });
    setResetLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalMsg({ type: 'success', text: 'Password reset successful! You can now log in.' });
      setTimeout(() => {
        setShowForgotModal(false);
        setEmail(resetEmail);
        setResetStep(1);
      }, 1500);
    } catch (err) {
      setModalMsg({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] mx-auto flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-[#1D2233]">Welcome Back</h2>
          <p className="text-sm text-[#656C80] mt-2">
            Log in with your college credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* College Email */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">College Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@kce.ac.in"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1D2233] uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetStep(1);
                  setModalMsg({ type: '', text: '' });
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-medium text-[#6C63FF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mt-6 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-xs text-[#656C80] mt-6">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-[#6C63FF] hover:underline">
            Sign up now
          </Link>
        </p>

      </div>

      {/* Forgot Password Glass Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/80 relative">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#656C80] hover:text-[#1D2233] rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1D2233]">Reset Password</h3>
                <p className="text-xs text-[#656C80]">
                  {resetStep === 1 ? 'Enter your registered college email' : 'Verify OTP & set new password'}
                </p>
              </div>
            </div>

            {modalMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                modalMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {modalMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{modalMsg.text}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D2233] mb-1 uppercase tracking-wider">College Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@kce.ac.in"
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn-gradient py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-50"
                >
                  {resetLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D2233] mb-1 uppercase tracking-wider">6-Digit Reset OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-sm font-mono tracking-widest text-center font-bold text-[#1D2233]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D2233] mb-1 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading || resetOtp.length < 6}
                  className="w-full btn-gradient py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-50"
                >
                  {resetLoading ? 'Updating Password...' : 'Reset Password & Log In'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
