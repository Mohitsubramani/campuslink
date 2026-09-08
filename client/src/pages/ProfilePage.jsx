import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Edit3, 
  Package, 
  Repeat, 
  Gift, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Tab: 'listings' | 'borrows' | 'giveaways'
  const [activeTab, setActiveTab] = useState('listings');

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', department: '', year: '1' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile.');

      setProfileData(data);
      setEditForm({
        name: data.user.name || '',
        department: data.user.department || '',
        year: String(data.user.year || '1')
      });
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setEditError('');
      setEditSuccess('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess('');
        fetchProfile();
      }, 1200);
    } catch (err) {
      console.error('Save profile error:', err);
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-500">Loading student profile & activity history...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-rose-800">{error || 'Could not load profile.'}</p>
        <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  const { user: userDetails, stats, items = [], transactions = [] } = profileData;

  // Filter items for tabs
  const lostFoundItems = items.filter(i => i.type === 'LOST' || i.type === 'FOUND');
  const giveawayItems = items.filter(i => i.type === 'GIVEAWAY');
  const borrowItems = items.filter(i => i.type === 'BORROW');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header Glass Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        {/* Banner Graphic */}
        <div className="h-32 bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] relative overflow-hidden p-6">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center shadow-sm border border-white/20"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#8F7BFF] text-white flex items-center justify-center font-extrabold text-3xl font-['Space_Grotesk']">
                  {userDetails.name?.[0]?.toUpperCase() || 'S'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#1D2233] font-['Space_Grotesk']">
                    {userDetails.name}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Campus Verified
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Roll No: <strong className="text-gray-700">{userDetails.roll_no}</strong> • {userDetails.email}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Info Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Department</p>
                <p className="text-xs font-bold text-gray-800">{userDetails.department}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Year of Study</p>
                <p className="text-xs font-bold text-gray-800">Year {userDetails.year}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Campus Email</p>
                <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{userDetails.email.split('@')[1]}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Member Since</p>
                <p className="text-xs font-bold text-gray-800">
                  {new Date(userDetails.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Listed Posts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6C63FF] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1D2233] font-['Space_Grotesk'] mt-2">
            {stats.totalItemsPosted}
          </p>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Lost, Found, Borrow & Giveaways</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Borrowings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1D2233] font-['Space_Grotesk'] mt-2">
            {stats.activeBorrows}
          </p>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Items borrowed from peers</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Giveaways Donated</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1D2233] font-['Space_Grotesk'] mt-2">
            {stats.giveawaysDonated}
          </p>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Free items shared with peers</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Completed Deals</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1D2233] font-['Space_Grotesk'] mt-2">
            {stats.completedTransactions}
          </p>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Returned loans & handovers</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-2 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-[#6C63FF] text-[#6C63FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-4 h-4" /> My Listed Posts ({items.length})
          </button>

          <button
            onClick={() => setActiveTab('borrows')}
            className={`pb-2 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'borrows'
                ? 'border-[#6C63FF] text-[#6C63FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Repeat className="w-4 h-4" /> Borrow & Lending History ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('giveaways')}
            className={`pb-2 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'giveaways'
                ? 'border-[#6C63FF] text-[#6C63FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift className="w-4 h-4" /> Giveaway Items ({giveawayItems.length})
          </button>
        </div>

        {/* Tab 1: Listed Posts */}
        {activeTab === 'listings' && (
          <div>
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">You haven't posted any items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex items-center gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6C63FF]/10 text-[#6C63FF]">
                          {item.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'AVAILABLE' || item.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 truncate mt-1">{item.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Borrow & Lending Transactions */}
        {activeTab === 'borrows' && (
          <div>
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Repeat className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No borrow or lending transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => {
                  const isBorrower = t.receiver_id === userDetails.id;
                  return (
                    <div key={t.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex items-center justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          {isBorrower ? 'BORROWED FROM PEER' : 'LENT TO PEER'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-800 mt-1">{t.items?.title || 'Resource Item'}</h4>
                        <p className="text-xs text-gray-400">
                          Date: {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Giveaways */}
        {activeTab === 'giveaways' && (
          <div>
            {giveawayItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Gift className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No giveaway items posted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {giveawayItems.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 flex items-center gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center">
                        <Gift className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {item.status}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 truncate mt-1">{item.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-extrabold text-[#1D2233] font-['Space_Grotesk'] mb-4">
              Edit Student Profile
            </h3>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Year of Study</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#6C63FF] text-white text-xs font-bold hover:bg-[#5b52e0] disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
