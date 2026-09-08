const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * GET /api/profile/me
 * Fetch authenticated user profile details & activity metrics
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    let userObj = req.user;
    if (isConfigured) {
      const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (data) userObj = data;
    }

    // Fetch user items
    let userItems = [];
    if (isConfigured) {
      const { data } = await supabase.from('items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (data) userItems = data;
    }
    const memItems = memoryStore.items.filter(i => i.user_id === userId);
    const combinedItemsMap = new Map();
    [...userItems, ...memItems].forEach(i => {
      if (!combinedItemsMap.has(i.id)) combinedItemsMap.set(i.id, i);
    });
    const itemsList = Array.from(combinedItemsMap.values());

    // Fetch transactions
    let userTx = [];
    if (isConfigured) {
      const { data } = await supabase
        .from('transactions')
        .select('*, items(title, category, image_url)')
        .or(`owner_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (data) userTx = data;
    }
    const memTx = memoryStore.transactions.filter(t => t.owner_id === userId || t.receiver_id === userId);
    const combinedTxMap = new Map();
    [...userTx, ...memTx].forEach(t => {
      if (!combinedTxMap.has(t.id)) combinedTxMap.set(t.id, t);
    });
    const txList = Array.from(combinedTxMap.values());

    // Calculate metrics
    const stats = {
      totalItemsPosted: itemsList.length,
      lostFoundCount: itemsList.filter(i => i.type === 'LOST' || i.type === 'FOUND').length,
      giveawaysDonated: itemsList.filter(i => i.type === 'GIVEAWAY').length,
      activeBorrows: txList.filter(t => t.receiver_id === userId && t.type === 'BORROW' && t.status === 'ACTIVE').length,
      activeLends: txList.filter(t => t.owner_id === userId && t.type === 'BORROW' && t.status === 'ACTIVE').length,
      completedTransactions: txList.filter(t => t.status === 'COMPLETED').length
    };

    return res.status(200).json({
      user: {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        roll_no: userObj.roll_no,
        department: userObj.department,
        year: userObj.year,
        is_verified: userObj.is_verified,
        created_at: userObj.created_at
      },
      stats,
      items: itemsList,
      transactions: txList
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

/**
 * PATCH /api/profile/me
 * Update editable profile fields (department, year, name)
 */
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, department, year } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (department) updates.department = department.trim();
    if (year) updates.year = parseInt(year, 10);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    // Update in memoryStore
    const memUser = memoryStore.users.find(u => u.id === userId);
    if (memUser) {
      Object.assign(memUser, updates);
    }

    // Update in Supabase
    if (isConfigured) {
      try {
        await supabase.from('users').update(updates).eq('id', userId);
      } catch (e) {}
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: { ...req.user, ...updates }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
