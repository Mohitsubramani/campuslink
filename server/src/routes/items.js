const express = require('express');
const router = express.Router();
const { randomUUID: uuidv4 } = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * POST /api/items
 * Protected route
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, title, description, category, location, max_duration_days, image_url } = req.body;

    if (!type || !title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields: type, title, description, category, and location are required.' });
    }

    const validTypes = ['LOST', 'FOUND', 'BORROW', 'GIVEAWAY'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid item type. Allowed types: ${validTypes.join(', ')}` });
    }

    const defaultStatus = (type === 'BORROW' || type === 'GIVEAWAY') ? 'AVAILABLE' : 'ACTIVE';
    const itemId = uuidv4();
    const now = new Date().toISOString();

    let finalImageUrl = image_url || null;

    // Upload base64 image to Supabase Storage `item-images` bucket if configured
    if (isConfigured && image_url && image_url.startsWith('data:image/')) {
      try {
        const matches = image_url.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const ext = mimeType.split('/')[1] || 'png';
          const buffer = Buffer.from(matches[2], 'base64');
          const filename = `item_${itemId}_${Date.now()}.${ext}`;

          const { data: uploadData, error: uploadErr } = await supabase
            .storage
            .from('item-images')
            .upload(filename, buffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase
              .storage
              .from('item-images')
              .getPublicUrl(filename);

            if (publicUrlData?.publicUrl) {
              finalImageUrl = publicUrlData.publicUrl;
              console.log('Uploaded image to Supabase Storage:', finalImageUrl);
            }
          } else if (uploadErr) {
            console.warn('[Supabase Storage Notice]', uploadErr.message);
          }
        }
      } catch (imgErr) {
        console.warn('Storage upload notice:', imgErr.message);
      }
    }

    const newItem = {
      id: itemId,
      user_id: req.user.id,
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image_url: finalImageUrl,
      location: location.trim(),
      max_duration_days: max_duration_days ? parseInt(max_duration_days, 10) : null,
      status: defaultStatus,
      created_at: now
    };

    // Always store in memoryStore to guarantee zero data loss if RLS blocks DB
    memoryStore.items.unshift(newItem);

    if (isConfigured) {
      try {
        await supabase.from('items').insert(newItem);
      } catch (error) {
        console.warn('[Supabase DB Notice]', error.message, 'Saved to local memory store.');
      }
    }

    // Auto-match check for LOST <-> FOUND items
    if (type === 'LOST' || type === 'FOUND') {
      const oppositeType = type === 'LOST' ? 'FOUND' : 'LOST';
      const keywords = `${title} ${description}`.toLowerCase().match(/\b\w{3,}\b/g) || [];

      // Find candidate items
      let candidates = memoryStore.items.filter(i => i.type === oppositeType && i.status === 'ACTIVE' && i.user_id !== req.user.id);
      
      candidates.forEach(cand => {
        const candText = `${cand.title} ${cand.description} ${cand.category} ${cand.location}`.toLowerCase();
        const hasMatchingWord = keywords.some(k => candText.includes(k));
        const sameCategory = cand.category === category;

        if (hasMatchingWord || sameCategory) {
          const candPoster = memoryStore.users.find(u => u.id === cand.user_id);
          const candPosterName = candPoster ? candPoster.name : 'Student Peer';

          // Notify existing poster
          const notifToCand = {
            id: uuidv4(),
            user_id: cand.user_id,
            type: 'MATCH_FOUND',
            message: `✨ CampusLink Match: A new ${type.toLowerCase()} item "${title}" matching your ${cand.type.toLowerCase()} item "${cand.title}" was reported by ${req.user.name} at ${location}!`,
            related_item_id: itemId,
            is_read: false,
            created_at: now
          };
          memoryStore.notifications.unshift(notifToCand);
          if (isConfigured) {
            try { supabase.from('notifications').insert(notifToCand); } catch(e) {}
          }

          // Notify new poster
          const notifToNew = {
            id: uuidv4(),
            user_id: req.user.id,
            type: 'MATCH_FOUND',
            message: `✨ CampusLink Match: Your ${type.toLowerCase()} item "${title}" matches a ${cand.type.toLowerCase()} post "${cand.title}" by ${candPosterName} at ${cand.location}!`,
            related_item_id: cand.id,
            is_read: false,
            created_at: now
          };
          memoryStore.notifications.unshift(notifToNew);
          if (isConfigured) {
            try { supabase.from('notifications').insert(notifToNew); } catch(e) {}
          }
        }
      });
    }

    return res.status(201).json({ item: newItem });
  } catch (err) {
    console.error('Post item error:', err);
    return res.status(500).json({ error: 'Failed to create item post.' });
  }
});

/**
 * GET /api/items/mine
 * Protected route
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let dbItems = [];
    if (isConfigured) {
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.in('type', type.split(','));
      }
      const { data } = await query;
      if (data) dbItems = data;
    }

    const memItems = memoryStore.items.filter(i => i.user_id === userId && (!type || type.split(',').includes(i.type)));

    // Merge and deduplicate by id
    const combinedMap = new Map();
    [...dbItems, ...memItems].forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    const combinedList = Array.from(combinedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ data: combinedList });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your posts.' });
  }
});

/**
 * GET /api/items
 * Public browse route
 */
router.get('/', async (req, res) => {
  try {
    const { type, category, location, status, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let dbFormatted = [];
    if (isConfigured) {
      let query = supabase
        .from('items')
        .select('*, users(name)');

      if (type) query = query.in('type', type.split(','));
      if (status) query = query.eq('status', status);
      else if (type === 'LOST' || type === 'FOUND') query = query.eq('status', 'ACTIVE');
      if (category) query = query.eq('category', category);
      if (location) query = query.ilike('location', `%${location}%`);

      const { data } = await query.order('created_at', { ascending: false });
      if (data) {
        dbFormatted = data.map(item => ({
          ...item,
          poster: { name: item.users?.name || 'Verified Student' }
        }));
      }
    }

    const memResult = filterMemoryItems(req.query);
    const memFormatted = memResult.data || [];

    // Merge DB & memory items
    const combinedMap = new Map();
    [...dbFormatted, ...memFormatted].forEach(item => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });

    const combinedList = Array.from(combinedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({
      data: combinedList,
      total: combinedList.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    console.error('Browse items error:', err);
    return res.status(500).json({ error: 'Failed to fetch items.' });
  }
});

/**
 * Helper for filtering in-memory items
 */
function filterMemoryItems(queryParams) {
  const { type, category, location, status, page = 1, limit = 20 } = queryParams;
  let items = [...memoryStore.items];

  if (type) {
    const typesList = type.split(',');
    items = items.filter(i => typesList.includes(i.type));
  }

  if (status) {
    items = items.filter(i => i.status === status);
  } else if (type === 'LOST' || type === 'FOUND') {
    items = items.filter(i => i.status === 'ACTIVE');
  }

  if (category && category !== 'All') {
    items = items.filter(i => i.category === category);
  }

  if (location) {
    items = items.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
  }

  const formatted = items.map(item => {
    const posterUser = memoryStore.users.find(u => u.id === item.user_id);
    return {
      ...item,
      poster: { name: posterUser ? posterUser.name : 'Verified Student' }
    };
  });

  return {
    data: formatted,
    total: formatted.length,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
}

/**
 * GET /api/items/:id
 * Item detail page
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isConfigured) {
      const { data } = await supabase
        .from('items')
        .select('*, users(name)')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        return res.status(200).json({
          item: data,
          poster: { name: data.users?.name || 'Verified Student' }
        });
      }
    }

    const memItem = memoryStore.items.find(i => i.id === id);
    if (!memItem) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    const posterUser = memoryStore.users.find(u => u.id === memItem.user_id);
    return res.status(200).json({
      item: memItem,
      poster: { name: posterUser ? posterUser.name : 'Verified Student' }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch item details.' });
  }
});

/**
 * PATCH /api/items/:id
 * Protected route — only owner can update status
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    let targetItem = memoryStore.items.find(i => i.id === id);

    if (isConfigured && !targetItem) {
      const { data: dbItem } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (dbItem) targetItem = dbItem;
    }

    if (!targetItem) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (targetItem.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only manage your own posts.' });
    }

    targetItem.status = status;

    if (isConfigured) {
      await supabase
        .from('items')
        .update({ status })
        .eq('id', id);
    }

    return res.status(200).json({ item: targetItem });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update item status.' });
  }
});

/**
 * POST /api/items/:id/contact
 * Contact the poster of a lost or found item
 */
router.post('/:id/contact', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const requester = req.user;

    let targetItem = memoryStore.items.find(i => i.id === id);

    if (isConfigured && !targetItem) {
      const { data: dbItem } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (dbItem) targetItem = dbItem;
    }

    if (!targetItem) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (targetItem.user_id === requester.id) {
      return res.status(400).json({ error: 'You are the poster of this item.' });
    }

    const now = new Date().toISOString();
    const notifObj = {
      id: uuidv4(),
      user_id: targetItem.user_id,
      type: 'REQUEST_RECEIVED',
      message: `${requester.name} (${requester.email}) reached out regarding your ${targetItem.type.toLowerCase()} item "${targetItem.title}". ${message ? `Note: "${message}"` : ''}`,
      related_item_id: targetItem.id,
      is_read: false,
      created_at: now
    };

    memoryStore.notifications.unshift(notifObj);

    if (isConfigured) {
      try {
        await supabase.from('notifications').insert(notifObj);
      } catch (e) {}
    }

    return res.status(200).json({ message: 'Contact request sent to poster successfully.' });
  } catch (err) {
    console.error('Contact poster error:', err);
    return res.status(500).json({ error: 'Failed to send contact notification.' });
  }
});

module.exports = router;
