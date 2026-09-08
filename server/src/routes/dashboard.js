const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * GET /api/dashboard/summary
 * Protected route
 */
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isConfigured) {
      const [{ count: activeLostCount }, { count: activeFoundCount }] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'LOST').eq('status', 'ACTIVE'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'FOUND').eq('status', 'ACTIVE')
      ]);

      const { count: myActiveBorrows } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('type', 'BORROW')
        .eq('status', 'ACTIVE');

      const { count: myActiveGiveaways } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'GIVEAWAY')
        .eq('status', 'AVAILABLE');

      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('id, message, created_at, is_read')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      return res.status(200).json({
        activeLostCount: activeLostCount || 0,
        activeFoundCount: activeFoundCount || 0,
        myActiveBorrows: myActiveBorrows || 0,
        myActiveGiveaways: myActiveGiveaways || 0,
        recentNotifications: recentNotifications || []
      });
    } else {
      const activeLostCount = memoryStore.items.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length;
      const activeFoundCount = memoryStore.items.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length;
      const myActiveBorrows = memoryStore.transactions.filter(t => t.receiver_id === userId && t.type === 'BORROW' && t.status === 'ACTIVE').length;
      const myActiveGiveaways = memoryStore.items.filter(i => i.user_id === userId && i.type === 'GIVEAWAY' && i.status === 'AVAILABLE').length;

      const recentNotifications = memoryStore.notifications
        .filter(n => n.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
        .map(({ id, message, created_at, is_read }) => ({ id, message, created_at, is_read }));

      return res.status(200).json({
        activeLostCount,
        activeFoundCount,
        myActiveBorrows,
        myActiveGiveaways,
        recentNotifications
      });
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary.' });
  }
});

module.exports = router;
