import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, AlertCircle, CheckCircle2, RotateCw, ArrowRight, Sparkles } from 'lucide-react';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { pendingEmail, devOtpNotice, setDevOtpNotice, saveAuthSession } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      saveAuthSession(data.token, data.user);
      setSuccessMsg('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.devOtpNotice) {
        setDevOtpNotice(data.devOtpNotice);
      }
      setSuccessMsg(data.message || 'New OTP sent!');
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] mx-auto flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-[#1D2233]">Verify College Email</h2>
          <p className="text-sm text-[#656C80] mt-2">
            We sent a 6-digit OTP code to <br />
            <strong className="text-[#1D2233]">{pendingEmail || 'your college email'}</strong>
          </p>
        </div>

        {/* Demo OTP Notice Badge for Effortless Dev Testing */}
        {devOtpNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{devOtpNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const code = devOtpNotice.split(' ').pop();
                if (code && code.length === 6) setOtp(code);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold shadow hover:bg-amber-700 transition-colors"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          
          {/* OTP Code Entry */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-2 uppercase tracking-wider text-center">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3.5 rounded-2xl neu-input font-bold text-[#1D2233]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email & Continue'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="mt-8 text-center border-t border-white/60 pt-6">
          <p className="text-xs text-[#656C80] mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6C63FF] hover:underline disabled:text-[#656C80] disabled:no-underline"
          >
            <RotateCw className={`w-3.5 h-3.5 ${cooldown === 0 ? 'animate-spin-slow' : ''}`} />
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}
          </button>
        </div>

      </div>
    </div>
  );
}
