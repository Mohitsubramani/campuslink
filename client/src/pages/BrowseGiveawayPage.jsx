import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gift, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  BookOpen, 
  Laptop, 
  Box, 
  Shirt, 
  PenTool, 
  Sparkles,
  Inbox,
  Clock,
  HeartHandshake
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Textbooks',
  'Electronics',
  'Lab Equipment',
  'Furniture',
  'Clothing',
  'Stationery',
  'Miscellaneous'
];

export default function BrowseGiveawayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Claim Modal State
  const [claimingItem, setClaimingItem] = useState(null);
  const [claimNote, setClaimNote] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchGiveaways = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const [itemsRes, reqsRes] = await Promise.all([
        fetch('http://localhost:5000/api/items?type=GIVEAWAY', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/requests/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const data = await itemsRes.json();
      if (!itemsRes.ok) {
        throw new Error(data.error || 'Failed to fetch giveaways.');
      }

      if (reqsRes.ok) {
        const reqsData = await reqsRes.json();
        setMyRequests(reqsData.data || []);
      }

      setItems(data.data || []);
    } catch (err) {
      console.error('Fetch giveaways error:', err);
      setError(err.message || 'Failed to load giveaway items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    // Parse condition from description if present e.g. [Condition: Like New]
    let itemCondition = 'Good';
    if (item.description && item.description.includes('[Condition:')) {
      const match = item.description.match(/\[Condition:\s*([^\]]+)\]/);
      if (match) itemCondition = match[1].trim();
    }

    const matchesCondition = selectedCondition === 'All' || itemCondition === selectedCondition;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      (item.user?.name && item.user.name.toLowerCase().includes(query));

    return matchesCategory && matchesCondition && matchesSearch;
  });

  const handleOpenClaimModal = (item) => {
    setClaimingItem(item);
    setClaimNote('');
    setClaimError('');
    setClaimSuccess(false);
  };

  const handleCloseClaimModal = () => {
    setClaimingItem(null);
    setClaimNote('');
    setClaimError('');
    setClaimSuccess(false);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimingItem) return;

    try {
      setClaimLoading(true);
      setClaimError('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: claimingItem.id,
          note: claimNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit claim request.');
      }

      setClaimSuccess(true);
      fetchGiveaways();
      setTimeout(() => {
        handleCloseClaimModal();
        navigate('/giveaway/claims');
      }, 1500);
    } catch (err) {
      console.error('Submit claim error:', err);
      setClaimError(err.message || 'Failed to submit claim.');
    } finally {
      setClaimLoading(false);
    }
  };

  // Helper to extract clean description and condition badge
  const parseItemDetails = (desc) => {
    if (!desc) return { condition: 'Good', cleanDesc: '' };
    const match = desc.match(/\[Condition:\s*([^\]]+)\]/);
    if (match) {
      const condition = match[1].trim();
      const cleanDesc = desc.replace(/\[Condition:\s*[^\]]+\]/, '').trim();
      return { condition, cleanDesc };
    }
    return { condition: 'Good', cleanDesc: desc };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 mb-3 border border-white/20">
              <Gift className="w-3.5 h-3.5" /> 100% Free Campus Donations
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Campus Giveaways
            </h1>
            <p className="text-purple-100 mt-2 max-w-xl text-sm md:text-base">
              Find free textbooks, lab gear, furniture, and gadgets donated by seniors and campus peers. Claim items directly or list items you no longer need!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/giveaway/claims"
              className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/20 transition-all flex items-center shadow-sm"
            >
              <Inbox className="w-4 h-4 mr-2" /> My Giveaway Claims
            </Link>

            <Link
              to="/giveaway/post"
              className="px-5 py-3 rounded-2xl bg-white text-[#6C63FF] text-sm font-bold hover:bg-purple-50 transition-all shadow-lg flex items-center"
            >
              <Plus className="w-4.5 h-4.5 mr-2" /> List Free Giveaway
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/60 shadow-lg mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search giveaways by title, department, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Condition Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
            >
              <option value="All">All Conditions</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair Condition</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-gray-100">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading free campus giveaways...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-800 font-semibold">{error}</p>
          <button 
            onClick={fetchGiveaways}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6C63FF] flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1D2233] font-['Space_Grotesk']">No Giveaways Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {searchQuery || selectedCategory !== 'All' || selectedCondition !== 'All'
              ? 'No items match your active search or filters. Try adjusting your search keywords.'
              : 'Be the first student to list a free giveaway item for your campus peers!'}
          </p>
          
          <Link
            to="/giveaway/post"
            className="mt-6 inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post First Giveaway
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const { condition, cleanDesc } = parseItemDetails(item.description);
            const isOwner = user && user.id === item.user_id;
            const isAvailable = item.status === 'AVAILABLE';

            const existingReq = myRequests.find(r => r.item_id === item.id);
            const isPending = existingReq && existingReq.status === 'PENDING';
            const isApproved = existingReq && existingReq.status === 'APPROVED';

            return (
              <div 
                key={item.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-300">
                      <Gift className="w-12 h-12 mb-1" />
                      <span className="text-xs font-semibold text-purple-400">Campus Giveaway</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-[#6C63FF] shadow-sm">
                      {item.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm`}>
                      {condition}
                    </span>
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-rose-500 text-white uppercase tracking-wider shadow-lg">
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1D2233] font-['Space_Grotesk'] line-clamp-1 group-hover:text-[#6C63FF] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {cleanDesc || 'No additional description provided.'}
                    </p>

                    {/* Meta info */}
                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-[#6C63FF] flex-shrink-0" />
                        <span className="truncate font-medium">{item.location}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          Donor: <strong className="text-gray-700 font-semibold">{item.user?.name || 'Campus Student'}</strong>
                          {item.user?.department && ` (${item.user.department})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400">
                      Free Item
                    </span>

                    {isOwner ? (
                      <Link
                        to="/giveaway/claims"
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#6C63FF] text-xs font-bold hover:bg-purple-100 transition-colors"
                      >
                        Manage Listed Item
                      </Link>
                    ) : isPending ? (
                      <Link
                        to="/giveaway/claims"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center"
                      >
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 animate-pulse" /> Claim Pending
                      </Link>
                    ) : isApproved ? (
                      <Link
                        to="/giveaway/claims"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Claim Approved
                      </Link>
                    ) : isAvailable ? (
                      <button
                        onClick={() => handleOpenClaimModal(item)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold hover:shadow-md hover:shadow-[#6C63FF]/30 transition-all flex items-center"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 mr-1.5" /> Claim Item
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold">
                        Already Claimed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Request Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative overflow-hidden animate-scale-up">
            <button
              onClick={handleCloseClaimModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C63FF] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#1D2233] font-['Space_Grotesk']">
                  Submit Giveaway Claim
                </h3>
                <p className="text-xs text-gray-500">
                  Request this free item from donor <strong className="text-gray-700">{claimingItem.user?.name || 'Campus Peer'}</strong>
                </p>
              </div>
            </div>

            {/* Target Item summary card */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex items-center gap-3">
              {claimingItem.image_url ? (
                <img src={claimingItem.image_url} alt={claimingItem.title} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center">
                  <Gift className="w-7 h-7" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate">{claimingItem.title}</h4>
                <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                  <MapPin className="w-3 h-3 mr-1 text-[#6C63FF]" /> {claimingItem.location}
                </p>
              </div>
            </div>

            {claimError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            {claimSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Claim Request Submitted!</p>
                  <p className="text-emerald-600 mt-0.5">Opening your claims hub...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Note to Donor (Optional but helpful)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why you need this item or when you can meet for pickup (e.g. 'I am a 1st year student taking this course this semester!')."
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-xs transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseClaimModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimLoading || claimSuccess}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
                >
                  {claimLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-3.5 h-3.5 mr-1.5" /> Submit Claim Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
