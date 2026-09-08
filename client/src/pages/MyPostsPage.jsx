import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, MapPin, Tag, CheckCircle2, AlertCircle, RefreshCw, Box, Info } from 'lucide-react';

export default function MyPostsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('LOST');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ id: null, text: '', type: '' });

  useEffect(() => {
    fetchMyPosts();
  }, [activeTab]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/mine?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setPosts(result.data || []);
      }
    } catch (err) {
      console.error('Fetch my posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (itemId) => {
    setActionMsg({ id: itemId, text: 'Updating...', type: 'info' });
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'RESOLVED' })
      });

      const data = await res.json();

      if (res.status === 403) {
        setActionMsg({ id: itemId, text: '403 Forbidden: You can only resolve your own posts.', type: 'error' });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resolve item');
      }

      setActionMsg({ id: itemId, text: 'Marked as Resolved!', type: 'success' });
      fetchMyPosts();
    } catch (err) {
      setActionMsg({ id: itemId, text: err.message, type: 'error' });
    }
  };

  const activeItems = posts.filter(i => i.status === 'ACTIVE');
  const resolvedItems = posts.filter(i => i.status === 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[#1D2233]">My Posts & Listings</h1>
          <p className="text-sm text-[#656C80] mt-1">Manage your active lost & found items and update status</p>
        </div>

        <Link
          to={`/lost-found/post?type=${activeTab}`}
          className="btn-gradient px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Post New Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#ECEFF4] p-1.5 rounded-2xl max-w-md border border-white/60">
        <button
          onClick={() => setActiveTab('LOST')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'LOST'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          🔍 My Lost Posts ({posts.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setActiveTab('FOUND')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'FOUND'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          🙌 My Found Posts ({posts.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length})
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#656C80]">
          Loading your posts...
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Active Posts Section */}
          <div>
            <h2 className="text-xl font-bold font-heading text-[#1D2233] mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Active Posts ({activeItems.length})
            </h2>

            {activeItems.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-3xl max-w-md">
                <Info className="w-8 h-8 text-[#6C63FF] mx-auto mb-2" />
                <p className="font-semibold text-[#1D2233] text-sm">No active {activeTab.toLowerCase()} posts right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeItems.map(item => (
                  <div key={item.id} className="neu-card p-5 rounded-3xl border border-white/60 flex flex-col justify-between">
                    <div>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded-2xl mb-3" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200/60 rounded-2xl mb-3 flex items-center justify-center text-3xl">📦</div>
                      )}
                      
                      <div className="flex items-center justify-between text-[11px] text-[#656C80] mb-1 font-semibold">
                        <span>{item.category}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> {item.location}</span>
                      </div>

                      <h3 className="font-bold text-[#1D2233] text-base mb-1">{item.title}</h3>
                      <p className="text-xs text-[#656C80] line-clamp-2">{item.description}</p>
                    </div>

                    {/* Action */}
                    <div className="pt-4 mt-4 border-t border-gray-200/60">
                      {actionMsg.id === item.id && (
                        <p className={`text-xs mb-2 font-medium ${actionMsg.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {actionMsg.text}
                        </p>
                      )}
                      <button
                        onClick={() => handleMarkResolved(item.id)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Section */}
          {resolvedItems.length > 0 && (
            <div className="pt-6 border-t border-gray-300/50">
              <h2 className="text-lg font-bold font-heading text-[#656C80] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolved History ({resolvedItems.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                {resolvedItems.map(item => (
                  <div key={item.id} className="glass-panel p-5 rounded-3xl border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ RESOLVED
                    </div>
                    <h3 className="font-bold text-[#1D2233] text-base mb-1 pr-16">{item.title}</h3>
                    <p className="text-xs text-[#656C80] line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
