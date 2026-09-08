import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Repeat, Plus, MapPin, Tag, Clock, User, CheckCircle2, AlertCircle, Send, X, Inbox } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Tools & Hardware', 'Lab Equipment', 'Sports & Fitness', 'Other'];

export default function BrowseBorrowPage() {
  const { user, token } = useAuth();
  
  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');

  // Request modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestedDays, setRequestedDays] = useState(3);
  const [note, setNote] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBorrowItems();
  }, [selectedCategory, locationQuery]);

  const fetchBorrowItems = async () => {
    setLoading(true);
    try {
      let url = `/api/items?type=BORROW&status=AVAILABLE`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (locationQuery) url += `&location=${encodeURIComponent(locationQuery)}`;

      const tokenStr = token || localStorage.getItem('campuslink_token');

      const promises = [fetch(url)];
      if (tokenStr) {
        promises.push(fetch('/api/requests/mine', {
          headers: { Authorization: `Bearer ${tokenStr}` }
        }));
      }

      const results = await Promise.all(promises);
      if (results[0].ok) {
        const result = await results[0].json();
        setItems(result.data || []);
      }

      if (results[1] && results[1].ok) {
        const reqs = await results[1].json();
        setMyRequests(reqs.data || []);
      }
    } catch (err) {
      console.error('Fetch borrow items error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setRequestMsg({ type: '', text: '' });
    setRequestLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: selectedItem.id,
          requested_days: parseInt(requestedDays, 10),
          note
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send borrow request');

      setRequestMsg({ type: 'success', text: 'Borrow request sent successfully! The owner will be notified.' });
      setTimeout(() => {
        setSelectedItem(null);
        setRequestMsg({ type: '', text: '' });
      }, 1800);
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.message });
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Banner & Post CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-1 rounded-full mb-2">
            <Repeat className="w-3.5 h-3.5" /> Peer Resource Sharing
          </div>
          <h1 className="text-3xl font-bold font-heading text-[#1D2233]">
            Borrow Catalogue
          </h1>
          <p className="text-sm text-[#656C80] mt-1">
            Borrow scientific calculators, lab coats, and tools from verified peers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/borrow/list"
            className="btn-gradient px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Share Resource
          </Link>
          <Link
            to="/borrow/requests"
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-[#1D2233] bg-white hover:bg-white/80 border border-white/80 shadow-sm flex items-center gap-1.5"
          >
            <Inbox className="w-4 h-4 text-[#6C63FF]" /> Requests Hub
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl neu-input text-xs font-semibold text-[#1D2233] bg-[#ECEFF4]"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Location Search Input */}
          <div className="relative flex-1 max-w-xs">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#656C80]" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl neu-input text-xs text-[#1D2233]"
            />
          </div>

        </div>
      </div>

      {/* Grid of Borrowable Items */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#656C80]">
          Loading available borrow listings...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-md mx-auto">
          <Repeat className="w-10 h-10 text-[#6C63FF] mx-auto mb-3" />
          <h3 className="font-bold font-heading text-lg text-[#1D2233]">No items available to borrow</h3>
          <p className="text-xs text-[#656C80] mt-1 mb-6">
            No borrowable items match your filters right now. Be the first to share!
          </p>
          <Link
            to="/borrow/list"
            className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Share a Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const isOwner = user && user.id === item.user_id;
            const existingReq = myRequests.find(r => r.item_id === item.id);
            const isPending = existingReq && existingReq.status === 'PENDING';
            const isApproved = existingReq && existingReq.status === 'APPROVED';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isPending && !isApproved && !isOwner) {
                    setSelectedItem(item);
                    setRequestedDays(Math.min(3, item.max_duration_days || 7));
                    setNote('');
                    setRequestMsg({ type: '', text: '' });
                  }
                }}
                className="neu-card p-5 rounded-3xl border border-white/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Photo / Thumbnail */}
                  <div className="w-full h-44 rounded-2xl bg-gray-200/80 mb-4 overflow-hidden relative flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-3xl">⚙️</span>
                    )}
                    
                    <span className="absolute top-3 left-3 bg-[#6C63FF] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-wider">
                      {item.category}
                    </span>

                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Max {item.max_duration_days || 7} Days
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1D2233] group-hover:text-[#6C63FF] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#656C80] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center justify-between text-xs">
                  <span className="text-[#656C80] text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" /> {item.location}
                  </span>
                  {isOwner ? (
                    <Link
                      to="/borrow/requests"
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-purple-600 hover:underline flex items-center gap-1"
                    >
                      My Listed Resource
                    </Link>
                  ) : isPending ? (
                    <Link
                      to="/borrow/requests"
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      Request Pending <Clock className="w-3.5 h-3.5 animate-pulse" />
                    </Link>
                  ) : isApproved ? (
                    <Link
                      to="/borrow/active"
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      Request Approved <CheckCircle2 className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#6C63FF] flex items-center gap-1">
                      Request to Borrow <Send className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request to Borrow Glass Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/80 relative">
            
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 text-[#656C80] hover:text-[#1D2233] rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#6C63FF]/10 text-[#6C63FF] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Borrow Request
              </span>
              <span className="text-xs text-[#656C80]">
                Max lend period: <strong>{selectedItem.max_duration_days || 7} days</strong>
              </span>
            </div>

            <h2 className="text-2xl font-bold font-heading text-[#1D2233] mb-2">
              {selectedItem.title}
            </h2>
            <p className="text-xs text-[#656C80] mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200/60">
              {selectedItem.description}
            </p>

            {requestMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                requestMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {requestMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{requestMsg.text}</span>
              </div>
            )}

            {/* Check if user owns the item */}
            {selectedItem.user_id === user?.id ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are the owner of this listed item. You cannot request to borrow your own resource.</span>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                
                {/* Requested Days Slider / Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#1D2233] uppercase tracking-wider">Requested Duration</label>
                    <span className="text-xs font-bold text-[#6C63FF]">{requestedDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={selectedItem.max_duration_days || 7}
                    value={requestedDays}
                    onChange={(e) => setRequestedDays(e.target.value)}
                    className="w-full accent-[#6C63FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#656C80] mt-1 font-mono">
                    <span>1 Day</span>
                    <span>Max {selectedItem.max_duration_days || 7} Days</span>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-[#1D2233] mb-1 uppercase tracking-wider">Note to Owner (Optional)</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Need this for end-sem exam preparation tomorrow. Will return promptly!"
                    className="w-full px-4 py-2.5 rounded-xl neu-input text-xs text-[#1D2233]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={requestLoading}
                  className="w-full btn-gradient py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {requestLoading ? 'Sending Request...' : 'Send Borrow Request'}
                  {!requestLoading && <Send className="w-4 h-4" />}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
