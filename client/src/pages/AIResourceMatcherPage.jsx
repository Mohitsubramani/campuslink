import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Repeat, 
  Gift, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  HelpCircle,
  Zap,
  Tag
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Casio fx-991EX scientific calculator for end-sem exams",
  "Engineering Mathematics 4th Edition textbook by BS Grewal",
  "Chemistry lab coat size M and safety goggles",
  "Foldable laptop table or study chair for hostel room",
  "Mini breadboard, jumper wires and Arduino UNO kit"
];

export default function AIResourceMatcherPage() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchNeed = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    if (customPrompt) setPrompt(customPrompt);

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch('http://localhost:5000/api/ai/resource-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: query.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to match resources.');

      setResults(data);
    } catch (err) {
      console.error('Resource match error:', err);
      setError(err.message || 'Failed to generate AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Need ↔ Resource AI Assistant
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Space_Grotesk']">
            AI Resource Finder
          </h1>
          <p className="text-purple-100 mt-2 max-w-xl text-sm md:text-base">
            Describe what you need in plain English. Our Gemini AI semantic engine matches your request with available borrowable resources and free giveaways on campus!
          </p>
        </div>
      </div>

      {/* Prompt Form Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/60 shadow-xl space-y-4">
        <form onSubmit={handleSearchNeed} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-[#1D2233] font-['Space_Grotesk'] mb-2">
              What resource or item do you need?
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Need a scientific calculator for 2 days for end-sem physics exam..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full pl-5 pr-32 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" /> AI Find Match
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Suggested Prompts */}
        <div>
          <span className="text-xs font-semibold text-gray-400 block mb-2">Try asking AI:</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearchNeed(null, p)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-[#6C63FF] text-xs font-medium transition-all text-left"
              >
                💡 "{p}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-extrabold text-[#1D2233] font-['Space_Grotesk']">
              AI Recommendations for <span className="text-[#6C63FF]">"{results.prompt}"</span>
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {results.totalResults} Match{results.totalResults === 1 ? '' : 'es'} Found
            </span>
          </div>

          {results.data.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-gray-200 text-center max-w-md mx-auto my-6">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">No Matching Resources Available</h4>
              <p className="text-xs text-gray-500 mt-1">
                No active borrow or giveaway items closely match your prompt. Try searching with different keywords!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.data.map(item => (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden p-5 space-y-4"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider ${
                        item.type === 'GIVEAWAY' ? 'bg-emerald-600' : 'bg-[#6C63FF]'
                      }`}>
                        {item.type === 'GIVEAWAY' ? 'FREE GIVEAWAY' : 'BORROW ITEM'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-[#6C63FF]">
                        <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
                        {item.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-[#1D2233] font-['Space_Grotesk'] line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#6C63FF]" /> {item.location}
                      </p>
                      <p className="flex items-center gap-1.5 text-gray-500">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Owner: <strong className="text-gray-700">{item.posterName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {item.type === 'BORROW' ? `Max ${item.max_duration_days || 7} Days` : 'Free Item'}
                    </span>

                    <Link
                      to={item.type === 'GIVEAWAY' ? '/giveaway' : '/borrow'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-xs font-bold hover:shadow-md transition-all flex items-center"
                    >
                      {item.type === 'GIVEAWAY' ? <Gift className="w-3.5 h-3.5 mr-1" /> : <Repeat className="w-3.5 h-3.5 mr-1" />}
                      {item.type === 'GIVEAWAY' ? 'Claim Item' : 'Borrow Item'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
