import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gift, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Inbox, 
  Send, 
  MapPin, 
  User, 
  Mail, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export default function GiveawayClaimsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'

  const [incomingClaims, setIncomingClaims] = useState([]);
  const [outgoingClaims, setOutgoingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [processingId, setProcessingId] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('campuslink_token');

      const [incRes, outRes] = await Promise.all([
        fetch('http://localhost:5000/api/requests/incoming', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/requests/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const incData = await incRes.json();
      const outData = await outRes.json();

      if (!incRes.ok) throw new Error(incData.error || 'Failed to load incoming claims.');
      if (!outRes.ok) throw new Error(outData.error || 'Failed to load outgoing claims.');

      // Filter for giveaway items and exclude self-requests
      const incFiltered = (incData.data || []).filter(c => c.requester_id !== user?.id);
      const outFiltered = (outData.data || []).filter(c => c.owner_id !== user?.id);

      setIncomingClaims(incFiltered);
      setOutgoingClaims(outFiltered);
    } catch (err) {
      console.error('Fetch claims error:', err);
      setError(err.message || 'Failed to load giveaway claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDecision = async (requestId, newStatus) => {
    try {
      setProcessingId(requestId);
      setActionMessage({ type: '', text: '' });
      const token = localStorage.getItem('campuslink_token');

      const res = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request.');
      }

      setActionMessage({
        type: 'success',
        text: newStatus === 'APPROVED' 
          ? 'Claim approved! Item has been marked as CLAIMED and recipient has been notified with pickup details.'
          : 'Claim request declined.'
      });

      fetchClaims();
    } catch (err) {
      console.error('Decision error:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to update claim decision.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#6C63FF] via-[#7C73FF] to-[#8F7BFF] rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100 mb-3 border border-white/20">
              <Gift className="w-3.5 h-3.5" /> Free Handover & Claims Hub
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-['Space_Grotesk']">
              Giveaway Claims Hub
            </h1>
            <p className="text-purple-100 mt-2 max-w-xl text-sm">
              Approve claim requests on your listed giveaways or track status on claims you submitted to peers.
            </p>
          </div>

          <Link
            to="/giveaway"
            className="px-5 py-3 rounded-2xl bg-white text-[#6C63FF] text-sm font-bold hover:bg-purple-50 transition-all shadow-lg flex items-center self-start md:self-auto"
          >
            Browse Giveaways <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {actionMessage.text && (
        <div className={`mb-6 p-4 rounded-2xl border text-sm flex items-center justify-between ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-3">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-gray-200 mb-8 pb-1">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'incoming'
              ? 'border-[#6C63FF] text-[#6C63FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-4 h-4" /> Received Claims
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#6C63FF]">
            {incomingClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'outgoing'
              ? 'border-[#6C63FF] text-[#6C63FF]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" /> My Claim Requests
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {outgoingClaims.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Received Claims (My Giveaways) */}
      {activeTab === 'incoming' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-500">Loading incoming claims...</p>
            </div>
          ) : incomingClaims.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-gray-200 text-center max-w-md mx-auto my-6">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Received Claims Yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                When students submit a claim for your free giveaway items, their requests will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingClaims.map(claim => {
                const isPending = claim.status === 'PENDING';
                const isApproved = claim.status === 'APPROVED';
                const isRejected = claim.status === 'REJECTED';

                return (
                  <div 
                    key={claim.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Item & Requester details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {claim.item?.image_url ? (
                        <img src={claim.item.image_url} alt={claim.item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center flex-shrink-0">
                          <Gift className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6C63FF]">
                            {claim.item?.category || 'Giveaway'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Requested {new Date(claim.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-[#1D2233] font-['Space_Grotesk'] mt-1 truncate">
                          {claim.item?.title || 'Giveaway Item'}
                        </h4>

                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p className="flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            Requester: <strong className="text-gray-800">{claim.requester?.name || 'Student'}</strong>
                            {claim.requester?.email && <span className="text-gray-400">({claim.requester.email})</span>}
                          </p>
                          {claim.note && (
                            <p className="bg-gray-50 p-2.5 rounded-xl text-gray-600 italic border border-gray-100">
                              "{claim.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status / Decision Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {isPending ? (
                        <>
                          <button
                            disabled={processingId === claim.id}
                            onClick={() => handleDecision(claim.id, 'REJECTED')}
                            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Decline
                          </button>

                          <button
                            disabled={processingId === claim.id}
                            onClick={() => handleDecision(claim.id, 'APPROVED')}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center disabled:opacity-50"
                          >
                            {processingId === claim.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                            ) : (
                              <Check className="w-3.5 h-3.5 mr-1" />
                            )}
                            Approve Handover
                          </button>
                        </>
                      ) : isApproved ? (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Handover Approved
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          <XCircle className="w-4 h-4 text-rose-600" /> Declined
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claim Requests (Outgoing) */}
      {activeTab === 'outgoing' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-[#6C63FF]/20 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-500">Loading your claim requests...</p>
            </div>
          ) : outgoingClaims.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-gray-200 text-center max-w-md mx-auto my-6">
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Claim Requests Sent</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                You haven't requested any giveaway items yet. Browse available giveaways on campus!
              </p>
              <Link
                to="/giveaway"
                className="px-4 py-2 bg-[#6C63FF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#5b52e0] transition-colors"
              >
                Browse Giveaways
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingClaims.map(claim => {
                const isPending = claim.status === 'PENDING';
                const isApproved = claim.status === 'APPROVED';
                const isRejected = claim.status === 'REJECTED';

                return (
                  <div 
                    key={claim.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Item details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {claim.item?.image_url ? (
                        <img src={claim.item.image_url} alt={claim.item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-purple-100 text-[#6C63FF] flex items-center justify-center flex-shrink-0">
                          <Gift className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6C63FF]">
                            {claim.item?.category || 'Giveaway'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Claimed {new Date(claim.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-[#1D2233] font-['Space_Grotesk'] mt-1 truncate">
                          {claim.item?.title || 'Giveaway Item'}
                        </h4>

                        <p className="text-xs text-gray-500 mt-1">
                          Donor: <strong className="text-gray-700">{claim.owner?.name || 'Campus Student'}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Status display */}
                    <div className="flex flex-col items-end gap-2">
                      {isPending && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Donor Approval
                        </div>
                      )}

                      {isApproved && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Claim Approved!
                          </div>

                          {claim.owner?.email && (
                            <a
                              href={`mailto:${claim.owner.email}?subject=Pickup%20for%20Giveaway%3A%20${encodeURIComponent(claim.item?.title || '')}`}
                              className="px-3 py-1.5 bg-[#6C63FF] text-white text-xs font-bold rounded-xl hover:bg-[#5b52e0] transition-colors flex items-center shadow-sm"
                            >
                              <Mail className="w-3.5 h-3.5 mr-1" /> Contact Donor via Email
                            </a>
                          )}
                        </div>
                      )}

                      {isRejected && (
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          <XCircle className="w-4 h-4 text-rose-600" /> Claim Declined
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
