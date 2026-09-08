import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Repeat, Gift, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white shadow-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#6C63FF]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#656C80]">
            Exclusive College Resource & Match Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1D2233] max-w-4xl leading-[1.15] mb-6">
          Share Resources. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#6C63FF] via-[#8F7BFF] to-[#1FC8B8] bg-clip-text text-transparent">
            Recover Lost Items with AI.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#656C80] max-w-2xl leading-relaxed mb-10">
          CampusLink connects verified students across campus to post lost & found items, borrow equipment, and give away study materials seamlessly.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/signup"
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 w-full sm:w-auto shadow-xl"
          >
            Get Started with College Email
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl font-semibold text-lg text-[#1D2233] bg-white/80 hover:bg-white border border-white shadow-sm transition-all w-full sm:w-auto text-center"
          >
            Log In to Account
          </Link>
        </div>

        {/* Whitelisted Colleges Pill */}
        <div className="mt-12 flex items-center gap-2 text-xs text-[#656C80] bg-white/50 px-4 py-2 rounded-xl border border-white/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified for @kce.ac.in, @kahed.edu.in & @karpagamtech.edu.in students</span>
        </div>

        {/* 3 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left w-full">
          
          {/* Tile 1: Lost & Found */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 font-bold">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D2233] mb-3">Lost & Found</h3>
            <p className="text-[#656C80] text-sm leading-relaxed mb-6">
              Post lost items or report found belongings. Gemini AI automatically matches lost descriptions with reported items.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
              <CheckCircle2 className="w-4 h-4" /> AI Match Notifications
            </div>
          </div>

          {/* Tile 2: Resource Borrowing */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center mb-6 font-bold">
              <Repeat className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D2233] mb-3">Borrow & Lend</h3>
            <p className="text-[#656C80] text-sm leading-relaxed mb-6">
              Need a scientific calculator, lab coat, or camera for a day? Borrow from peers safely with return reminders.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6C63FF]">
              <CheckCircle2 className="w-4 h-4" /> Trackable Handover & Return
            </div>
          </div>

          {/* Tile 3: Give Away */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#1FC8B8]/10 text-[#1FC8B8] flex items-center justify-center mb-6 font-bold">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D2233] mb-3">Give Away</h3>
            <p className="text-[#656C80] text-sm leading-relaxed mb-6">
              Pass down textbooks, notes, and dorm supplies to junior students for free. Keep the campus eco-friendly!
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1FC8B8]">
              <CheckCircle2 className="w-4 h-4" /> Zero Cost Peer Sharing
            </div>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-white/50 py-8 text-center text-xs text-[#656C80]">
        <p>© 2026 CampusLink. Built for College Communities.</p>
      </footer>
    </div>
  );
}
