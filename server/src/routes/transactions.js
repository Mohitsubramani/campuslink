const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * GET /api/transactions/mine
 * Fetch active or completed borrow/lend transactions
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // 'owner' | 'borrower'

    let dbTx = [];
    if (isConfigured) {
      let query = supabase.from('transactions').select('*, items(title, category, image_url)');
      if (role === 'borrower') {
        query = query.eq('receiver_id', userId);
      } else {
        // default to owner
        query = query.eq('owner_id', userId);
      }

      const { data } = await query.order('created_at', { ascending: false });
      if (data) dbTx = data;
    }

    const memTx = memoryStore.transactions.filter(t => {
      if (role === 'borrower') return t.receiver_id === userId;
      return t.owner_id === userId;
    });

    const combinedMap = new Map();
    [...dbTx, ...memTx].forEach(t => {
      if (!combinedMap.has(t.id)) {
        const itemObj = t.items || memoryStore.items.find(i => i.id === t.item_id) || {};
        const counterpartyId = role === 'borrower' ? t.owner_id : t.receiver_id;
        const counterparty = memoryStore.users.find(u => u.id === counterpartyId) || {};

        combinedMap.set(t.id, {
          ...t,
          item: {
            id: t.item_id,
            title: itemObj.title || 'Resource Item',
            category: itemObj.category || 'General',
            image_url: itemObj.image_url
          },
          counterparty: {
            name: counterparty.name || 'Student Peer',
            email: counterparty.email
          }
        });
      }
    });

    const list = Array.from(combinedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json({ data: list });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    return res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

/**
 * PATCH /api/transactions/:id
 * Mark borrowed item returned (status = COMPLETED, resets item status = AVAILABLE)
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Status must be COMPLETED.' });
    }

    let transaction = memoryStore.transactions.find(t => t.id === id);
    if (isConfigured && !transaction) {
      const { data } = await supabase.from('transactions').select('*').eq('id', id).maybeSingle();
      if (data) transaction = data;
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // 1. Ownership check (only owner can mark returned)
    if (transaction.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the item lender/owner can mark an item as returned.' });
    }

    // 2. Prevent re-completing
    if (transaction.status === 'COMPLETED') {
      return res.status(409).json({ error: 'This transaction has already been completed.' });
    }

    transaction.status = 'COMPLETED';

    // Reset item status to 'AVAILABLE'
    const itemObj = memoryStore.items.find(i => i.id === transaction.item_id);
    if (itemObj) itemObj.status = 'AVAILABLE';

    if (isConfigured) {
      try { await supabase.from('transactions').update({ status: 'COMPLETED' }).eq('id', id); } catch(e) {}
      try { await supabase.from('items').update({ status: 'AVAILABLE' }).eq('id', transaction.item_id); } catch(e) {}
    }

    return res.status(200).json({ transaction });
  } catch (err) {
    console.error('Update transaction error:', err);
    return res.status(500).json({ error: 'Failed to complete transaction.' });
  }
});

module.exports = router;
