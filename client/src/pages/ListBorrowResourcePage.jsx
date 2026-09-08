import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, AlertCircle, Repeat, ArrowLeft, Tag, MapPin, Clock, Sparkles } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Books', 'Tools & Hardware', 'Lab Equipment', 'Sports & Fitness', 'Other'];

export default function ListBorrowResourcePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [maxDurationDays, setMaxDurationDays] = useState(7);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !location || !maxDurationDays) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'BORROW',
          title,
          description,
          category,
          location,
          max_duration_days: parseInt(maxDurationDays, 10),
          image_url: imageUrl
        })
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {}

      if (!res.ok) throw new Error(data.error || 'Failed to list resource for lending.');

      navigate('/borrow');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      
      {/* Back button */}
      <Link to="/borrow" className="inline-flex items-center gap-2 text-xs font-semibold text-[#656C80] hover:text-[#1D2233] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Borrow Catalogue
      </Link>

      <div className="glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] text-xs font-semibold mb-3">
            <Repeat className="w-3.5 h-3.5" /> Peer-to-Peer Resource Sharing
          </div>
          <h1 className="text-3xl font-bold font-heading text-[#1D2233]">List a Resource to Lend</h1>
          <p className="text-sm text-[#656C80] mt-1">
            Share calculators, lab coats, tools, or camera gear safely with students on campus
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-2 uppercase tracking-wider">
              Resource Photo (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/80 max-h-64 bg-gray-100 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="max-h-64 object-contain" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageUrl(''); }}
                  className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-xl text-xs font-semibold hover:bg-black/80"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl neu-input cursor-pointer hover:border-[#6C63FF] transition-colors">
                <Upload className="w-10 h-10 text-[#6C63FF] mb-2" />
                <span className="text-sm font-semibold text-[#1D2233]">Click to upload resource image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Item Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio FX-991EX Scientific Calculator"
              className="w-full px-4 py-3 rounded-xl neu-input text-sm text-[#1D2233]"
            />
          </div>

          {/* Category, Location, & Max Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Category *</label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-[#656C80]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl neu-input text-xs text-[#1D2233] bg-[#ECEFF4]"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Location *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#656C80]" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hostel 4 / CS Lab"
                  className="w-full pl-10 pr-3 py-3 rounded-xl neu-input text-xs text-[#1D2233]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Max Lend Days *</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#656C80]" />
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={maxDurationDays}
                  onChange={(e) => setMaxDurationDays(e.target.value)}
                  placeholder="7"
                  className="w-full pl-10 pr-3 py-3 rounded-xl neu-input text-xs font-bold text-[#1D2233]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Item Details & Conditions *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, accessories included, and handover preferences..."
              className="w-full px-4 py-3 rounded-xl neu-input text-sm text-[#1D2233]"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-4 rounded-xl font-bold text-base shadow-xl disabled:opacity-50"
          >
            {loading ? 'Listing Resource...' : 'List Resource for Lending'}
          </button>

        </form>

      </div>
    </div>
  );
}
