import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, MapPin, Tag, Calendar, User, CheckCircle2, ArrowRight, Eye, Info, X } from 'lucide-react';

const CATEGORIES = ['All', 'Bags', 'Electronics', 'ID/Documents', 'Books', 'Keys', 'Other'];

export default function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');

  // Selected item modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [activeType, selectedCategory, locationQuery]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `/api/items?type=${activeType}`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (locationQuery) url += `&location=${encodeURIComponent(locationQuery)}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setItems(result.data || []);
      }
    } catch (err) {
      console.error('Fetch items error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setTypeToggle = (type) => {
    setSearchParams({ type });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Banner & Post CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[#1D2233]">
            Lost & Found Catalogue
          </h1>
          <p className="text-sm text-[#656C80] mt-1">
            Browse active lost & found items posted by verified students on campus
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/lost-found/post?type=${activeType}`}
            className="btn-gradient px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Post New Item
          </Link>
          <Link
            to="/my-posts"
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-[#1D2233] bg-white hover:bg-white/80 border border-white/80 shadow-sm"
          >
            My Posts
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Type Toggle */}
        <div className="flex bg-[#ECEFF4] p-1 rounded-2xl border border-white/60 w-full md:w-auto">
          <button
            onClick={() => setTypeToggle('LOST')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeType === 'LOST'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-[#656C80] hover:text-[#1D2233]'
            }`}
          >
            🔍 Lost Items
          </button>
          <button
            onClick={() => setTypeToggle('FOUND')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeType === 'FOUND'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[#656C80] hover:text-[#1D2233]'
            }`}
          >
            🙌 Found Items
          </button>
        </div>

        {/* Category & Location Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 px-4 py-2.5 rounded-xl neu-input text-xs font-semibold text-[#1D2233] bg-[#ECEFF4]"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Location Filter Input */}
          <div className="relative flex-1 sm:flex-none">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#656C80]" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Filter by location..."
              className="w-full sm:w-52 pl-9 pr-3 py-2 rounded-xl neu-input text-xs text-[#1D2233]"
            />
          </div>

        </div>

      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#656C80]">
          Loading active lost & found posts...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl max-w-md mx-auto">
          <Info className="w-10 h-10 text-[#6C63FF] mx-auto mb-3" />
          <h3 className="font-bold font-heading text-lg text-[#1D2233]">No items found</h3>
          <p className="text-xs text-[#656C80] mt-1 mb-6">
            No {activeType.toLowerCase()} items match your search filters right now.
          </p>
          <Link
            to={`/lost-found/post?type=${activeType}`}
            className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Be the first to post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => { setSelectedItem(item); setContactSuccess(false); }}
              className="neu-card p-5 rounded-3xl border border-white/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Image or Placeholder */}
                <div className="w-full h-44 rounded-2xl bg-gray-200/80 mb-4 overflow-hidden relative flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}

                  {/* Badge */}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-wider ${
                    item.type === 'LOST' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {item.type}
                  </span>

                  {item.status === 'RESOLVED' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        ✓ RESOLVED
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#656C80] mb-1">
                  <span className="bg-white/80 px-2.5 py-0.5 rounded-md border border-white">{item.category}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> {item.location}</span>
                </div>

                <h3 className="text-lg font-bold text-[#1D2233] group-hover:text-[#6C63FF] transition-colors line-clamp-1 mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#656C80] line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <span className="text-[#656C80] text-[11px] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Posted by {item.poster?.name || 'Verified Student'}
                </span>
                <span className="font-semibold text-[#6C63FF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Item Detail Glass Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/80 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 text-[#656C80] hover:text-[#1D2233] rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedItem.type === 'LOST' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {selectedItem.type}
              </span>
              <span className="text-xs font-semibold text-[#656C80] bg-gray-100 px-3 py-1 rounded-full">
                {selectedItem.category}
              </span>
              {selectedItem.status === 'RESOLVED' && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                  ✓ RESOLVED
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1D2233] mb-4">
              {selectedItem.title}
            </h2>

            {/* Photo preview */}
            {selectedItem.image_url && (
              <div className="w-full max-h-72 rounded-2xl overflow-hidden bg-gray-100 mb-6 border border-gray-200">
                <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-full object-contain" />
              </div>
            )}

            <div className="space-y-4 mb-6 text-sm text-[#1D2233]">
              <div>
                <h4 className="text-xs font-semibold text-[#656C80] uppercase tracking-wider mb-1">Description</h4>
                <p className="leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                  {selectedItem.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="text-[#656C80] block mb-0.5">Location Reported</span>
                  <strong className="flex items-center gap-1 text-[#1D2233]">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedItem.location}
                  </strong>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="text-[#656C80] block mb-0.5">Posted By</span>
                  <strong className="flex items-center gap-1 text-[#1D2233]">
                    <User className="w-3.5 h-3.5 text-[#6C63FF]" /> {selectedItem.poster?.name || 'Verified Student'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Contact Owner CTA */}
            {contactError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <span>{contactError}</span>
              </div>
            )}

            {contactSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Contact request sent to poster! A notification was sent to {selectedItem.poster?.name || 'the poster'}.</span>
              </div>
            ) : (
              <button
                disabled={contactLoading}
                onClick={async () => {
                  try {
                    setContactLoading(true);
                    setContactError('');
                    const token = localStorage.getItem('campuslink_token');

                    const res = await fetch(`http://localhost:5000/api/items/${selectedItem.id}/contact`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ message: 'I reached out regarding this item post.' })
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to send notification.');

                    setContactSuccess(true);
                  } catch (err) {
                    setContactError(err.message || 'Failed to send notification.');
                  } finally {
                    setContactLoading(false);
                  }
                }}
                className="w-full btn-gradient py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {contactLoading ? 'Sending Notification...' : `Contact Poster (${selectedItem.poster?.name || 'Student'})`}
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
