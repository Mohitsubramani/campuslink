import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Repeat, Gift, Bell, Plus, ArrowRight, ShieldCheck, Sparkles, Box, Info } from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState({
    activeLostCount: 0,
    activeFoundCount: 0,
    myActiveBorrows: 0,
    myActiveGiveaways: 0,
    recentNotifications: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to CampusLink
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#1D2233]">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-[#656C80] mt-1">
            {user?.department} • Year {user?.year} • Roll No: {user?.roll_no}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/lost-found/post"
            className="btn-gradient px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Post Item
          </Link>
          <Link
            to="/borrow/list"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1D2233] bg-white hover:bg-white/80 border border-white/80 shadow-sm flex items-center gap-2"
          >
            <Repeat className="w-4 h-4 text-[#6C63FF]" /> Share Resource
          </Link>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#656C80]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Quick search across Lost & Found, Borrowable items..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl neu-input text-sm text-[#1D2233]"
        />
      </div>

      {/* Three Main Module Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Lost & Found */}
        <Link
          to="/lost-found"
          className="neu-card p-6 rounded-3xl border border-white/60 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              {summary.activeLostCount + summary.activeFoundCount} Active Items
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#1D2233] group-hover:text-[#6C63FF] transition-colors mb-2">
            Lost & Found
          </h3>
          <p className="text-xs text-[#656C80] leading-relaxed mb-4">
            Browse reported lost items, claim found belongings, or post a new match query.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-[#6C63FF] pt-3 border-t border-gray-200/50">
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 2: Borrow & Lend */}
        <Link
          to="/borrow"
          className="neu-card p-6 rounded-3xl border border-white/60 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center font-bold">
              <Repeat className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#6C63FF] bg-purple-50 px-2.5 py-1 rounded-full">
              {summary.myActiveBorrows} Borrows Active
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#1D2233] group-hover:text-[#6C63FF] transition-colors mb-2">
            Borrow & Lend
          </h3>
          <p className="text-xs text-[#656C80] leading-relaxed mb-4">
            Borrow calculators, lab coats, and camera gear from verified campus peers.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-[#6C63FF] pt-3 border-t border-gray-200/50">
            <span>Request Resource</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 3: Give Away */}
        <Link
          to="/giveaway"
          className="neu-card p-6 rounded-3xl border border-white/60 hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1FC8B8]/10 text-[#1FC8B8] flex items-center justify-center font-bold">
              <Gift className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#1FC8B8] bg-teal-50 px-2.5 py-1 rounded-full">
              {summary.myActiveGiveaways} Listed Items
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#1D2233] group-hover:text-[#6C63FF] transition-colors mb-2">
            Give Away
          </h3>
          <p className="text-xs text-[#656C80] leading-relaxed mb-4">
            Free textbooks, notes, and dorm accessories given away by graduating seniors.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold text-[#1FC8B8] pt-3 border-t border-gray-200/50">
            <span>Claim Free Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Recent Activity Strip */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#6C63FF]" />
            <h3 className="font-bold font-heading text-lg text-[#1D2233]">Recent Activity</h3>
          </div>
          <span className="text-xs text-[#656C80]">Last 3 updates</span>
        </div>

        {summary.recentNotifications.length > 0 ? (
          <div className="space-y-3">
            {summary.recentNotifications.map(n => (
              <div key={n.id} className="p-3.5 rounded-xl bg-white/60 border border-white/80 flex items-center justify-between text-xs">
                <span className="text-[#1D2233] font-medium">{n.message}</span>
                <span className="text-[#656C80] text-[10px]">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#656C80] bg-white/40 rounded-2xl border border-white/60">
            <Info className="w-5 h-5 mx-auto mb-2 text-[#6C63FF]" />
            <p className="font-semibold text-[#1D2233]">No recent notifications yet!</p>
            <p className="mt-1">When you post items or receive borrow requests, updates will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
