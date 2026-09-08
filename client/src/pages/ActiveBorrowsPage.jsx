import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Repeat, CheckCircle2, Clock, AlertTriangle, Calendar, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ActiveBorrowsPage() {
  const { token } = useAuth();
  const [role, setRole] = useState('owner'); // 'owner' (Lent out) | 'borrower' (Borrowing)

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ id: null, text: '', type: '' });

  useEffect(() => {
    fetchTransactions();
  }, [role]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/mine?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (txId) => {
    setActionMsg({ id: txId, text: 'Updating status...', type: 'info' });
    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark as returned');

      setActionMsg({ id: txId, text: 'Item marked as Returned & Available again!', type: 'success' });
      fetchTransactions();
    } catch (err) {
      setActionMsg({ id: txId, text: err.message, type: 'error' });
    }
  };

  const isOverdue = (returnDate, status) => {
    if (status === 'COMPLETED' || !returnDate) return false;
    return new Date() > new Date(returnDate);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-[#1D2233]">Active Loans & Handover Tracking</h1>
        <p className="text-sm text-[#656C80] mt-1">
          Track active borrowed resources, expected return dates, and mark items returned
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex bg-[#ECEFF4] p-1.5 rounded-2xl max-w-md border border-white/60">
        <button
          onClick={() => setRole('owner')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            role === 'owner'
              ? 'bg-[#6C63FF] text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          🤝 Items I've Lent Out ({transactions.filter(t => t.status === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setRole('borrower')}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
            role === 'borrower'
              ? 'bg-[#6C63FF] text-white shadow-md'
              : 'text-[#656C80] hover:text-[#1D2233]'
          }`}
        >
          🎒 Items I'm Borrowing
        </button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#656C80]">
          Loading active transaction records...
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-3xl max-w-md mx-auto">
          <Repeat className="w-10 h-10 text-[#6C63FF] mx-auto mb-2" />
          <p className="font-bold text-[#1D2233] text-sm">No active loan records</p>
          <p className="text-xs text-[#656C80] mt-1">
            {role === 'owner' ? 'Items you lend out to peers will show here.' : 'Items you borrow from peers will show here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => {
            const overdue = isOverdue(tx.return_date, tx.status);
            return (
              <div
                key={tx.id}
                className={`neu-card p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  overdue ? 'border-red-400 bg-red-50/40' : 'border-white/60'
                }`}
              >
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#6C63FF] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                      {tx.item?.category || 'Resource'}
                    </span>

                    {overdue && (
                      <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> OVERDUE
                      </span>
                    )}

                    {tx.status === 'COMPLETED' && (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        ✓ RETURNED
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#1D2233]">{tx.item?.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#656C80]">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#6C63FF]" />
                      {role === 'owner' ? 'Lent to: ' : 'Lender: '}
                      <strong>{tx.counterparty?.name || 'Student Peer'}</strong>
                    </span>

                    <span className="flex items-center gap-1 text-[#1D2233]">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      Due Date: <strong>{tx.return_date ? new Date(tx.return_date).toLocaleDateString() : 'N/A'}</strong>
                    </span>
                  </div>

                  {actionMsg.id === tx.id && (
                    <p className={`text-xs font-semibold ${actionMsg.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {actionMsg.text}
                    </p>
                  )}
                </div>

                {/* Mark Returned CTA (Owner view only) */}
                {role === 'owner' && tx.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleMarkReturned(tx.id)}
                    className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Item Returned
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
