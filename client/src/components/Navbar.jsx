import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Search, Repeat, Gift, LogOut, User, Sparkles, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('campuslink_token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight bg-gradient-to-r from-[#1D2233] to-[#6C63FF] bg-clip-text text-transparent">
            CampusLink
          </span>
        </Link>

        {/* Module Navigation (Only if authenticated) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 bg-[#ECEFF4] p-1.5 rounded-2xl border border-white/60 shadow-inner">
            <Link
              to="/home"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/home')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/lost-found"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/lost-found')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Search className="w-4 h-4" />
              Lost & Found
            </Link>

            <Link
              to="/borrow"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/borrow')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Repeat className="w-4 h-4" />
              Borrow
            </Link>

            <Link
              to="/giveaway"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/giveaway')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Gift className="w-4 h-4" />
              Give Away
            </Link>

            <Link
              to="/ai/lost-found-matches"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/ai/lost-found-matches')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Matcher
            </Link>

            <Link
              to="/ai/resource-matches"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/ai/resource-matches')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              Need Assistant
            </Link>

            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/search')
                  ? 'bg-white text-[#6C63FF] shadow-sm font-semibold'
                  : 'text-[#656C80] hover:text-[#1D2233]'
              }`}
            >
              <Search className="w-4 h-4 text-[#6C63FF]" />
              Smart Search
            </Link>
          </div>
        )}

        {/* Right Section Auth Buttons / User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className={`p-2.5 rounded-xl border transition-all relative ${
                  isActive('/notifications')
                    ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-md'
                    : 'bg-white/70 text-[#656C80] border-white/80 hover:bg-white hover:text-[#1D2233]'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Card Link */}
              <Link 
                to="/profile"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                  isActive('/profile')
                    ? 'bg-white border-[#6C63FF] text-[#6C63FF] ring-2 ring-[#6C63FF]/20'
                    : 'bg-white/70 border-white/80 hover:bg-white text-[#1D2233]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="text-left text-xs hidden sm:block">
                  <p className="font-semibold leading-tight">{user?.name}</p>
                  <p className="text-[#656C80] font-mono text-[10px]">{user?.roll_no || user?.email}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-[#656C80] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl font-medium text-sm text-[#1D2233] hover:text-[#6C63FF] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn-gradient px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
