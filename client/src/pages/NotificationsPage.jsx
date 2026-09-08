import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Inbox, 
  CheckCheck, 
  AlertCircle, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Unread' | 'Requests' | 'Matches' | 'Returns'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications.');

      setNotifications(data.data || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.message || 'Failed to load notifications feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem('campuslink_token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('campuslink_token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'Unread') return !n.is_read;
    if (filterType === 'Requests') return n.type.includes('REQUEST');
    if (filterType === 'Matches') return n.type === 'MATCH_FOUND';
    if (filterType === 'Returns') return n.type === 'RETURN_DUE';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'REQUEST_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'REQUEST_REJECTED':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'MATCH_FOUND':
        return <Sparkles className="w-5 h-5 text-[#6C63FF]" />;
      case 'RETURN_DUE':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Inbox className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Notifications Feed
            </h1>
            <p className="text-xs text-purple-100 mt-0.5">
              Stay updated on borrow requests, giveaway claims, and campus item matches.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 rounded-2xl bg-white text-[#6C63FF] text-xs font-bold hover:bg-purple-50 transition-all shadow-md flex items-center self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
        <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
        {['All', 'Unread', 'Requests', 'Matches', 'Returns'].map(type => {
          const isSelected = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Main Feed Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">Loading notifications feed...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-rose-800">{error}</p>
          <button onClick={fetchNotifications} className="mt-3 px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
            Retry
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-gray-200 text-center max-w-md mx-auto my-4">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">
            {filterType === 'All' 
              ? "You're all caught up! Updates about your requests and matches will show up here."
              : `No ${filterType.toLowerCase()} notifications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                !n.is_read 
                  ? 'bg-purple-50/50 border-[#6C63FF]/30 shadow-md' 
                  : 'bg-white/90 border-gray-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {n.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">
                  {n.message}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  {n.related_item_id ? (
                    <Link
                      to="/borrow"
                      className="text-xs font-bold text-[#6C63FF] hover:underline flex items-center"
                    >
                      View Related Item <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  ) : <div />}

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
