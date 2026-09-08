import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  User, 
  Filter, 
  AlertCircle, 
  ArrowRight,
  Package,
  Repeat,
  Gift,
  Zap
} from 'lucide-react';

export default function SmartSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const handleExecuteSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const qText = customQuery !== undefined ? customQuery : query;
    if (!qText.trim()) return;

    setSearchParams({ q: qText.trim() });

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`http://localhost:5000/api/ai/search?q=${encodeURIComponent(qText.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed.');

      setResults(data.data || []);
    } catch (err) {
      console.error('Smart search error:', err);
      setError(err.message || 'Failed to execute search.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleExecuteSearch(null, initialQuery);
    }
  }, []);

  const filteredResults = results.filter(item => {
    if (selectedType === 'LOST') return item.type === 'LOST';
    if (selectedType === 'FOUND') return item.type === 'FOUND';
    if (selectedType === 'BORROW') return item.type === 'BORROW';
    if (selectedType === 'GIVEAWAY') return item.type === 'GIVEAWAY';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Gemini AI Natural Language Search
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
            Smart Campus Search
          </h1>
          <p className="text-purple-100 mt-2 max-w-xl text-sm md:text-base">
            Search across Lost, Found, Borrowable, and Giveaway items simultaneously using AI semantic embeddings.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl space-y-4">
        <form onSubmit={handleExecuteSearch} className="relative">
          <Search className="w-5 h-5 absolute left-4 top-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            required
            placeholder="Type any search query e.g. 'Redmi phone lost near e-block' or 'lab coat size M'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-32 py-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" /> Search AI
              </>
            )}
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
          {['All', 'LOST', 'FOUND', 'BORROW', 'GIVEAWAY'].map(type => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                {type === 'All' ? 'All Modules' : type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">Searching 768-dim Gemini vector space across campus items...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-rose-800">{error}</p>
        </div>
      ) : results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-gray-800 font-['Space_Grotesk']">
              Showing {filteredResults.length} AI Relevant Results
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map(item => (
              <div 
                key={item.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden p-5 space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider ${
                      item.type === 'LOST' ? 'bg-amber-500' :
                      item.type === 'FOUND' ? 'bg-emerald-600' :
                      item.type === 'GIVEAWAY' ? 'bg-purple-600' : 'bg-[#6C63FF]'
                    }`}>
                      {item.type}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-[#6C63FF]">
                      <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
                      {item.relevanceScore}% Relevance
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[#1D2233] font-['Space_Grotesk'] line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> {item.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Posted by: <strong className="text-gray-700">{item.posterName}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                  <Link
                    to={
                      item.type === 'GIVEAWAY' ? '/giveaway' :
                      item.type === 'BORROW' ? '/borrow' : '/lost-found'
                    }
                    className="px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-xs font-bold hover:bg-[#5b52e0] transition-colors flex items-center"
                  >
                    View Item Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
