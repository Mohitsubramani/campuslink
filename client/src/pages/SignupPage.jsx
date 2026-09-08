import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Hash, BookOpen, GraduationCap, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const ALLOWED_DOMAINS = ['kce.ac.in', 'kahed.edu.in', 'karpagamtech.edu.in'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { setOtpPending } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    email: '',
    department: 'Computer Science',
    year: '3',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend domain check
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
      setError(`College email required! Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setOtpPending(formData.email, data.devOtpNotice || '');
      navigate('/verify-otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-[#1D2233]">Create Account</h2>
          <p className="text-sm text-[#656C80] mt-2">
            Join CampusLink with your verified college email
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
              />
            </div>
          </div>

          {/* Roll No & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Roll No</label>
              <div className="relative">
                <Hash className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
                <input
                  type="text"
                  name="roll_no"
                  required
                  value={formData.roll_no}
                  onChange={handleChange}
                  placeholder="21CS042"
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Year</label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl neu-input text-sm text-[#1D2233] bg-[#ECEFF4]"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Department</label>
            <div className="relative">
              <BookOpen className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="Computer Science & Eng"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
              />
            </div>
          </div>

          {/* College Email */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">College Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@kce.ac.in"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl neu-input text-sm text-[#1D2233]"
              />
            </div>
            <p className="text-[11px] text-[#656C80] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Must end in @kce.ac.in, @kahed.edu.in, or @karpagamtech.edu.in
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-[#656C80]" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
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
            {loading ? 'Sending OTP Code...' : 'Create Account & Send OTP'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-xs text-[#656C80] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#6C63FF] hover:underline">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
}
