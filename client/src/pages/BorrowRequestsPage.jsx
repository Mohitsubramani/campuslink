import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Inbox, CheckCircle2, XCircle, Clock, AlertCircle, Calendar, User, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react';

export default function BorrowRequestsPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState('incoming'); // 'incoming' | 'outgoing'

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ id: null, text: '', type: '' });

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (tab === 'incoming') {
        const res = await fetch('/api/requests/incoming', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIncoming(data.data || []);
        }
      } else {
        const res = await fetch('/api/requests/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOutgoing(data.data || []);
        }
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId, decision) => {
    setActionMsg({ id: requestId, text: 'Processing decision...', type: 'info' });
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: decision })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request');

      setActionMsg({
        id: requestId,
        text: decision === 'APPROVED' ? 'Request Approved! Item marked as borrowed.' : 'Request Declined.',
        type: decision === 'APPROVED' ? 'success' : 'error'
      });

      fetchRequests();
    } catch (err) {
      setActionMsg({ id: requestId, text: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-[#1D2233]">Borrow Requests Hub</h1>
        <p className="text-sm text-[#656C80] mt-1">
          Review incoming borrow requests for your listed items or track your outgoing requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#ECEFF4] p-1.5 rounded-2xl max-w-md border border-white/60">
        <button
          onClick={() => setTab('incoming')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            tab === 'incoming'
              ? 'bg-[#6C63FF] text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          📥 Incoming Requests ({incoming.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            tab === 'outgoing'
              ? 'bg-[#6C63FF] text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          📤 My Outgoing Requests ({outgoing.length})
        </button>
      </div>

      {/* List Container */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#656C80]">
          Loading request data...
        </div>
      ) : tab === 'incoming' ? (
        
        /* Incoming Requests List (as Owner) */
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl max-w-md mx-auto">
              <Inbox className="w-10 h-10 text-[#6C63FF] mx-auto mb-2" />
              <p className="font-bold text-[#1D2233] text-sm">No incoming borrow requests</p>
              <p className="text-xs text-[#656C80] mt-1">When students request items you listed for lending, they will appear here for your approval.</p>
            </div>
          ) : (
            incoming.map(req => (
              <div key={req.id} className="neu-card p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#6C63FF] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                      {req.item?.category || 'Resource'}
                    </span>
                    <span className="text-[#656C80]">• Requested for <strong>{req.requested_days} days</strong></span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1D2233]">{req.item?.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-[#656C80]">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#6C63FF]" /> Requester: <strong>{req.requester?.name}</strong></span>
                    {req.note && <span className="flex items-center gap-1 text-[#1D2233] italic"><MessageSquare className="w-3.5 h-3.5 text-gray-400" /> "{req.note}"</span>}
                  </div>

                  {actionMsg.id === req.id && (
                    <p className={`text-xs font-semibold ${actionMsg.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {actionMsg.text}
                    </p>
                  )}
                </div>

                {/* Approve / Reject CTA */}
                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleDecision(req.id, 'APPROVED')}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Borrow
                    </button>
                    <button
                      onClick={() => handleDecision(req.id, 'REJECTED')}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-gray-200 hover:bg-gray-300 text-[#1D2233] flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {req.status === 'APPROVED' ? '✓ APPROVED' : 'DECLINED'}
                    </span>
                    {req.status === 'APPROVED' && (
                      <Link
                        to="/borrow/active"
                        className="text-xs font-semibold text-[#6C63FF] hover:underline flex items-center gap-1"
                      >
                        View Loan <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      ) : (

        /* Outgoing Requests List (as Borrower) */
        <div className="space-y-4">
          {outgoing.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl max-w-md mx-auto">
              <Inbox className="w-10 h-10 text-[#6C63FF] mx-auto mb-2" />
              <p className="font-bold text-[#1D2233] text-sm">No active outgoing borrow requests</p>
              <p className="text-xs text-[#656C80] mt-1">Browse the borrow catalogue to request items from peers.</p>
              <Link to="/borrow" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#6C63FF]">
                Explore Borrow Catalogue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            outgoing.map(req => (
              <div key={req.id} className="neu-card p-6 rounded-3xl border border-white/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-[#656C80]">Resource Owner: <strong>{req.owner?.name || 'Peer'}</strong></span>
                    <span>• {req.requested_days} Days Requested</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1D2233]">{req.item?.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'PENDING' ? '⏳ PENDING APPROVAL' : req.status === 'APPROVED' ? '✓ APPROVED' : 'DECLINED'}
                  </span>

                  {req.status === 'APPROVED' && (
                    <Link
                      to="/borrow/active"
                      className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md"
                    >
                      View Due Date & Loan <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      )}

    </div>
  );
}
