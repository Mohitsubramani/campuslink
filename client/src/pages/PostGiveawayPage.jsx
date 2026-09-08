import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gift, 
  UploadCloud, 
  Tag, 
  MapPin, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Laptop,
  Box,
  Shirt,
  PenTool,
  HelpCircle,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Textbooks', label: 'Textbooks & Study Material', icon: BookOpen },
  { id: 'Electronics', label: 'Electronics & Gadgets', icon: Laptop },
  { id: 'Lab Equipment', label: 'Lab Equipment & Tools', icon: PenTool },
  { id: 'Furniture', label: 'Furniture & Room Essentials', icon: Box },
  { id: 'Clothing', label: 'Clothing & Accessories', icon: Shirt },
  { id: 'Stationery', label: 'Stationery & Supplies', icon: PenTool },
  { id: 'Miscellaneous', label: 'Miscellaneous', icon: HelpCircle }
];

const CONDITIONS = [
  { id: 'Brand New', label: 'Brand New', desc: 'Unused / In original packaging', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
  { id: 'Like New', label: 'Like New', desc: 'Minimal signs of use', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
  { id: 'Good', label: 'Good Condition', desc: 'Fully functional, normal wear', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
  { id: 'Fair', label: 'Fair Condition', desc: 'Usable with visible wear', color: 'bg-purple-500/10 text-purple-700 border-purple-300' }
];

export default function PostGiveawayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Textbooks',
    condition: 'Like New',
    location: '',
    description: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('campuslink_token');

      // Combine condition info into description or title metadata
      const combinedDescription = `[Condition: ${formData.condition}] ${formData.description.trim()}`;

      const res = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'GIVEAWAY',
          title: formData.title.trim(),
          category: formData.category,
          location: formData.location.trim(),
          description: combinedDescription,
          image: formData.image
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post giveaway item.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/giveaway');
      }, 1800);
    } catch (err) {
      console.error('Post giveaway error:', err);
      setError(err.message || 'Failed to submit post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/giveaway"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#6C63FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Giveaways
        </Link>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-200">
          <Gift className="w-3.5 h-3.5 mr-1" /> Free Campus Sharing
        </span>
      </div>

      {/* Main Glass Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-['Space_Grotesk']">
                Give Away an Item
              </h1>
              <p className="text-sm text-purple-100">
                Help fellow campus peers by donating unused books, lab kits, or room supplies!
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-sm">
              <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-base">Giveaway Posted Successfully!</p>
                <p className="text-emerald-600 text-xs">Redirecting you to the Giveaway Catalogue...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#1D2233] mb-1.5">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Mathematics Textbook 4th Ed / Casio Scientific Calculator"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all"
                />
              </div>
            </div>

            {/* Category & Condition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-[#1D2233] mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-semibold text-[#1D2233] mb-1.5">
                  Campus Pickup Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE Department Lab 3 / Hostel Block B Lobby"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Item Condition Selector */}
            <div>
              <label className="block text-sm font-semibold text-[#1D2233] mb-2">
                Item Condition <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CONDITIONS.map(cond => {
                  const isSelected = formData.condition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: cond.id })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected 
                          ? 'border-[#6C63FF] bg-[#6C63FF]/10 ring-2 ring-[#6C63FF]/30' 
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/80'
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 ${cond.color}`}>
                        {cond.label}
                      </span>
                      <p className="text-[11px] text-gray-500 leading-tight">{cond.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#1D2233] mb-1.5">
                Description & Pickup Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Mention details about the item, Edition, specific pickup times, or any missing accessories..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] text-sm transition-all resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-[#1D2233] mb-1.5">
                Upload Photo (Optional but Recommended)
              </label>
              
              <div className="border-2 border-dashed border-gray-300 hover:border-[#6C63FF] rounded-2xl p-6 text-center bg-gray-50/50 transition-colors relative">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 rounded-xl border border-gray-200 shadow-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag photo here</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                to="/giveaway"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading || success}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8F7BFF] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Posting Giveaway...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" /> Post Free Giveaway
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
