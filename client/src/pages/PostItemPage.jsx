import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, AlertCircle, Search, PlusCircle, ArrowLeft, Tag, MapPin, FileText, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Bags', 'Electronics', 'ID/Documents', 'Books', 'Keys', 'Other'];

export default function PostItemPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();

  const initialType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
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

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Accepted image formats: JPG, PNG, WEBP.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !location) {
      setError('Please fill in all required fields (Title, Description, Category, Location).');
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
          type,
          title,
          description,
          category,
          location,
          image_url: imageUrl
        })
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Image size is too large for upload. Please choose a smaller photo under 2MB.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      navigate('/lost-found');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      
      {/* Back button */}
      <Link to="/lost-found" className="inline-flex items-center gap-2 text-xs font-semibold text-[#656C80] hover:text-[#1D2233] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
      </Link>

      <div className="glass-panel p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-[#1D2233]">
            {type === 'LOST' ? 'Post a Lost Item' : 'Report a Found Item'}
          </h1>
          <p className="text-sm text-[#656C80] mt-1">
            Provide details so peers and AI can help locate or identify the item
          </p>
        </div>

        {/* Type Switcher */}
        <div className="flex bg-[#ECEFF4] p-1.5 rounded-2xl mb-8 border border-white/60">
          <button
            type="button"
            onClick={() => setType('LOST')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              type === 'LOST'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-[#656C80] hover:text-[#1D2233]'
            }`}
          >
            🔍 I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setType('FOUND')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              type === 'FOUND'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[#656C80] hover:text-[#1D2233]'
            }`}
          >
            🙌 I Found Something
          </button>
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
              Item Photo (Optional, JPG/PNG under 5MB)
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
                <span className="text-sm font-semibold text-[#1D2233]">Click to upload item image</span>
                <span className="text-xs text-[#656C80] mt-1">Supports JPG, PNG, WEBP</span>
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
              placeholder="e.g. Blue HP Laptop Charger with adapter"
              className="w-full px-4 py-3 rounded-xl neu-input text-sm text-[#1D2233]"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Category *</label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-[#656C80]" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl neu-input text-sm text-[#1D2233] bg-[#ECEFF4]"
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
                  placeholder="e.g. Block 3 Canteen / Library 2nd Floor"
                  className="w-full pl-10 pr-4 py-3 rounded-xl neu-input text-sm text-[#1D2233]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1D2233] mb-1.5 uppercase tracking-wider">Detailed Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe distinctive marks, color, brand, condition, or specific time it was lost/found..."
              className="w-full px-4 py-3 rounded-xl neu-input text-sm text-[#1D2233]"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 transition-all ${
              type === 'LOST' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading ? 'Submitting Post...' : (type === 'LOST' ? 'Post Lost Item' : 'Report Found Item')}
          </button>

        </form>

      </div>
    </div>
  );
}
