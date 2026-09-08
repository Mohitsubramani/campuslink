import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search,
  Zap,
  Tag,
  ShieldCheck,
  BellRing
} from 'lucide-react';

export default function AIMatchingPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/ai/lost-found-matches', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compute AI matches.');

      setMatches(data.data || []);
    } catch (err) {
      console.error('Fetch AI matches error:', err);
      setError(err.message || 'Failed to compute AI matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleNotifyPoster = async (match) => {
    try {
      const token = localStorage.getItem('campuslink_token');

      // Contact poster of found item
      await fetch(`http://localhost:5000/api/items/${match.foundItem.id}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: `AI Match Alert: Your found item matched a lost item report "${match.lostItem.title}"!` })
      });

      setNotifiedIds(prev => new Set(prev).add(match.id));
    } catch (err) {
      console.error('Notify error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Gemini AI Vector Similarity
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
              AI Lost ↔ Found Matcher
            </h1>
            <p className="text-purple-100 mt-2 max-w-xl text-sm md:text-base">
              Semantic vector analysis (`text-embedding-004`) automatically pairs lost item reports with found items based on description similarity, category, and campus location proximity.
            </p>
          </div>

          <button
            onClick={fetchMatches}
            className="px-5 py-3 rounded-2xl bg-white text-[#6C63FF] text-xs font-bold hover:bg-purple-50 transition-all shadow-lg flex items-center self-start md:self-auto"
          >
            <Zap className="w-4 h-4 mr-2 text-amber-500" /> Re-scan AI Matches
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-500">Computing 768-dimensional Gemini embeddings & semantic similarity scores...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-800">{error}</p>
          <button onClick={fetchMatches} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
            Retry AI Scan
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-gray-200 text-center max-w-md mx-auto my-6">
          <Sparkles className="w-12 h-12 text-[#6C63FF] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-gray-800 font-['Space_Grotesk']">No Potential Matches Yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            As students post active Lost and Found items, our AI engine automatically detects matching pairs and alerts both students!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              Found <strong className="text-[#6C63FF]">{matches.length}</strong> Potential AI Match Pairs
            </span>
          </div>

          <div className="space-y-6">
            {matches.map(m => {
              const isNotified = notifiedIds.has(m.id);

              return (
                <div 
                  key={m.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all space-y-6 relative overflow-hidden"
                >
                  {/* Top Match Score Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        m.matchScore >= 75 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : m.matchScore >= 55 
                          ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                          : 'bg-amber-500 text-white'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {m.matchScore}% AI Match
                      </div>

                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {m.matchLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Category Match: <strong className="text-gray-800">{m.analysis.categoryMatch ? 'Yes ✓' : 'Partial'}</strong></span>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lost Item Card */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                            LOST ITEM
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(m.lostItem.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-gray-900 font-['Space_Grotesk']">
                          {m.lostItem.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {m.lostItem.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs text-gray-600 space-y-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" /> Reported Lost: <strong className="text-gray-800">{m.lostItem.location}</strong>
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" /> Poster: <strong className="text-gray-800">{m.lostItem.poster.name}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Found Item Card */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                            FOUND ITEM
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(m.foundItem.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-gray-900 font-['Space_Grotesk']">
                          {m.foundItem.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {m.foundItem.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs text-gray-600 space-y-1">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Found Location: <strong className="text-gray-800">{m.foundItem.location}</strong>
                        </p>
                        <p className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" /> Poster: <strong className="text-gray-800">{m.foundItem.poster.name}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Gemini Vector Similarity Score: <strong className="text-gray-700">{m.matchScore}%</strong>
                    </span>

                    {isNotified ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Match Alert Dispatched!
                      </span>
                    ) : (
                      <button
                        onClick={() => handleNotifyPoster(m)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold hover:shadow-lg transition-all flex items-center"
                      >
                        <BellRing className="w-4 h-4 mr-1.5" /> Dispatch Match Notification
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
