const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * GET /api/notifications
 * Fetch notifications for current user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    let dbNotifs = [];

    if (isConfigured) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) dbNotifs = data;
    }

    const memNotifs = memoryStore.notifications.filter(n => n.user_id === userId);

    const combinedMap = new Map();
    [...dbNotifs, ...memNotifs].forEach(n => {
      if (!combinedMap.has(n.id)) {
        combinedMap.set(n.id, n);
      }
    });

    const list = Array.from(combinedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const unreadCount = list.filter(n => !n.is_read).length;

    return res.status(200).json({ data: list, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let notif = memoryStore.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
    }

    if (isConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', userId);
      } catch (e) {}
    }

    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    memoryStore.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });

    if (isConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
      } catch (e) {}
    }

    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

module.exports = router;
