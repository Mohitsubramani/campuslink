const express = require('express');
const router = express.Router();
const { randomUUID: uuidv4 } = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

/**
 * POST /api/requests
 * Submit a borrow request
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { item_id, requested_days, note } = req.body;
    if (!item_id) {
      return res.status(400).json({ error: 'Item ID is required.' });
    }

    const requesterId = req.user.id;

    // Fetch item
    let item = null;
    if (isConfigured) {
      const { data } = await supabase.from('items').select('*').eq('id', item_id).maybeSingle();
      if (data) item = data;
    }
    if (!item) {
      item = memoryStore.items.find(i => i.id === item_id);
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    // 1. Reject if requesting own item
    if (item.user_id === requesterId) {
      return res.status(400).json({ 
        error: item.type === 'GIVEAWAY' 
          ? 'You cannot claim your own giveaway item.' 
          : 'You cannot request to borrow your own item.' 
      });
    }

    // 2. Reject if item not available
    if (item.status !== 'AVAILABLE') {
      return res.status(409).json({ error: 'This item is currently not available for borrowing.' });
    }

    // 3. Reject duplicate pending request
    let existingPending = false;
    if (isConfigured) {
      const { data: dup } = await supabase
        .from('requests')
        .select('*')
        .eq('item_id', item_id)
        .eq('requester_id', requesterId)
        .eq('status', 'PENDING')
        .maybeSingle();

      if (dup) existingPending = true;
    }
    if (!existingPending) {
      existingPending = memoryStore.requests.some(r => r.item_id === item_id && r.requester_id === requesterId && r.status === 'PENDING');
    }

    if (existingPending) {
      return res.status(409).json({ error: 'You already have a pending request for this item.' });
    }

    const requestId = uuidv4();
    const now = new Date().toISOString();
    const newRequest = {
      id: requestId,
      item_id,
      requester_id: requesterId,
      owner_id: item.user_id,
      note: note ? note.trim() : null,
      requested_days: requested_days ? parseInt(requested_days, 10) : 1,
      status: 'PENDING',
      created_at: now
    };

    memoryStore.requests.unshift(newRequest);

    // Create notification for owner
    const notifId = uuidv4();
    const notifObj = {
      id: notifId,
      user_id: item.user_id,
      type: 'REQUEST_RECEIVED',
      message: `${req.user.name} requested to borrow your item "${item.title}".`,
      related_item_id: item_id,
      is_read: false,
      created_at: now
    };
    memoryStore.notifications.unshift(notifObj);

    if (isConfigured) {
      try { await supabase.from('requests').insert(newRequest); } catch (e) {}
      try { await supabase.from('notifications').insert(notifObj); } catch (e) {}
    }

    return res.status(201).json({ request: newRequest });
  } catch (err) {
    console.error('Create request error:', err);
    return res.status(500).json({ error: 'Failed to create borrow request.' });
  }
});

/**
 * GET /api/requests/incoming
 * Owner views incoming requests
 */
router.get('/incoming', requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.id;
    let dbRequests = [];

    if (isConfigured) {
      const { data } = await supabase
        .from('requests')
        .select('*, items(title, category, image_url), users!requests_requester_id_fkey(name, email)')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (data) dbRequests = data;
    }

    const memRequests = memoryStore.requests.filter(r => r.owner_id === ownerId);

    const combinedMap = new Map();
    [...dbRequests, ...memRequests].forEach(r => {
      if (!combinedMap.has(r.id)) {
        const itemObj = r.items || memoryStore.items.find(i => i.id === r.item_id) || {};
        const requesterObj = r.users || memoryStore.users.find(u => u.id === r.requester_id) || {};

        combinedMap.set(r.id, {
          ...r,
          item: {
            id: r.item_id,
            title: itemObj.title || 'Resource Item',
            category: itemObj.category || 'General',
            image_url: itemObj.image_url
          },
          requester: {
            id: r.requester_id,
            name: requesterObj.name || 'Student Peer',
            email: requesterObj.email
          }
        });
      }
    });

    const list = Array.from(combinedMap.values())
      .filter(r => r.requester_id !== ownerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json({ data: list });
  } catch (err) {
    console.error('Incoming requests error:', err);
    return res.status(500).json({ error: 'Failed to fetch incoming requests.' });
  }
});

/**
 * GET /api/requests/mine
 * Requester views outgoing requests
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const requesterId = req.user.id;
    let dbRequests = [];

    if (isConfigured) {
      const { data } = await supabase
        .from('requests')
        .select('*, items(title, category, image_url, status)')
        .eq('requester_id', requesterId)
        .order('created_at', { ascending: false });

      if (data) dbRequests = data;
    }

    const memRequests = memoryStore.requests.filter(r => r.requester_id === requesterId);

    const combinedMap = new Map();
    [...dbRequests, ...memRequests].forEach(r => {
      if (!combinedMap.has(r.id)) {
        const itemObj = r.items || memoryStore.items.find(i => i.id === r.item_id) || {};
        const ownerObj = memoryStore.users.find(u => u.id === r.owner_id) || {};

        combinedMap.set(r.id, {
          ...r,
          item: {
            id: r.item_id,
            title: itemObj.title || 'Resource Item',
            category: itemObj.category || 'General',
            image_url: itemObj.image_url,
            status: itemObj.status
          },
          owner: {
            name: ownerObj.name || 'Resource Owner'
          }
        });
      }
    });

    const list = Array.from(combinedMap.values())
      .filter(r => r.owner_id !== requesterId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json({ data: list });
  } catch (err) {
    console.error('Outgoing requests error:', err);
    return res.status(500).json({ error: 'Failed to fetch outgoing requests.' });
  }
});

/**
 * PATCH /api/requests/:id
 * Owner approves or rejects a request
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
    }

    let request = memoryStore.requests.find(r => r.id === id);
    if (isConfigured && !request) {
      const { data } = await supabase.from('requests').select('*').eq('id', id).maybeSingle();
      if (data) request = data;
    }

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // 1. Ownership check (only owner can approve/reject)
    if (request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only the item owner can decide on this request.' });
    }

    // 2. Prevent re-deciding non-pending request
    if (request.status !== 'PENDING') {
      return res.status(409).json({ error: `Request has already been ${request.status.toLowerCase()}.` });
    }

    request.status = status;

    // Fetch associated item to know if it's BORROW or GIVEAWAY
    let targetItem = memoryStore.items.find(i => i.id === request.item_id);
    if (isConfigured && !targetItem) {
      const { data } = await supabase.from('items').select('*').eq('id', request.item_id).maybeSingle();
      if (data) targetItem = data;
    }

    const itemType = targetItem ? targetItem.type : 'BORROW';
    let transactionObj = null;
    const now = new Date();

    if (status === 'APPROVED') {
      if (itemType === 'GIVEAWAY') {
        // GIVEAWAY approval
        transactionObj = {
          id: uuidv4(),
          item_id: request.item_id,
          owner_id: request.owner_id,
          receiver_id: request.requester_id,
          type: 'GIVEAWAY',
          start_date: now.toISOString(),
          return_date: null,
          status: 'COMPLETED',
          created_at: now.toISOString()
        };

        memoryStore.transactions.unshift(transactionObj);

        // Update item status = 'CLAIMED'
        if (targetItem) targetItem.status = 'CLAIMED';
        const memItem = memoryStore.items.find(i => i.id === request.item_id);
        if (memItem) memItem.status = 'CLAIMED';

        if (isConfigured) {
          try { await supabase.from('items').update({ status: 'CLAIMED' }).eq('id', request.item_id); } catch(e) {}
          try { await supabase.from('transactions').insert(transactionObj); } catch(e) {}
        }

        // Notify recipient
        const notifObj = {
          id: uuidv4(),
          user_id: request.requester_id,
          type: 'REQUEST_APPROVED',
          message: `Your claim for giveaway "${targetItem?.title || 'item'}" was approved by ${req.user.name}! Pickup location: ${targetItem?.location || 'Campus'}.`,
          related_item_id: request.item_id,
          is_read: false,
          created_at: now.toISOString()
        };
        memoryStore.notifications.unshift(notifObj);
        if (isConfigured) {
          try { await supabase.from('notifications').insert(notifObj); } catch(e) {}
        }

        // Auto-decline other pending claims for this giveaway item
        memoryStore.requests.forEach(r => {
          if (r.item_id === request.item_id && r.id !== id && r.status === 'PENDING') {
            r.status = 'REJECTED';
            const autoNotif = {
              id: uuidv4(),
              user_id: r.requester_id,
              type: 'REQUEST_REJECTED',
              message: `The giveaway item "${targetItem?.title || 'item'}" was claimed by another student.`,
              related_item_id: request.item_id,
              is_read: false,
              created_at: now.toISOString()
            };
            memoryStore.notifications.unshift(autoNotif);
            if (isConfigured) {
              try { supabase.from('notifications').insert(autoNotif); } catch(e) {}
            }
          }
        });

        if (isConfigured) {
          try {
            await supabase
              .from('requests')
              .update({ status: 'REJECTED' })
              .eq('item_id', request.item_id)
              .neq('id', id)
              .eq('status', 'PENDING');
          } catch (e) {}
        }
      } else {
        // BORROW approval
        const days = request.requested_days || 1;
        const returnDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

        transactionObj = {
          id: uuidv4(),
          item_id: request.item_id,
          owner_id: request.owner_id,
          receiver_id: request.requester_id,
          type: 'BORROW',
          start_date: now.toISOString(),
          return_date: returnDate,
          status: 'ACTIVE',
          created_at: now.toISOString()
        };

        memoryStore.transactions.unshift(transactionObj);

        // Update item status = 'BORROWED'
        if (targetItem) targetItem.status = 'BORROWED';
        const memItem = memoryStore.items.find(i => i.id === request.item_id);
        if (memItem) memItem.status = 'BORROWED';

        if (isConfigured) {
          try { await supabase.from('items').update({ status: 'BORROWED' }).eq('id', request.item_id); } catch(e) {}
          try { await supabase.from('transactions').insert(transactionObj); } catch(e) {}
        }

        // Notify borrower
        const notifObj = {
          id: uuidv4(),
          user_id: request.requester_id,
          type: 'REQUEST_APPROVED',
          message: `Your borrow request for "${targetItem?.title || 'item'}" was approved! Return expected by ${new Date(returnDate).toLocaleDateString()}.`,
          related_item_id: request.item_id,
          is_read: false,
          created_at: now.toISOString()
        };
        memoryStore.notifications.unshift(notifObj);
        if (isConfigured) {
          try { await supabase.from('notifications').insert(notifObj); } catch(e) {}
        }
      }
    } else {
      // REJECTED
      const notifObj = {
        id: uuidv4(),
        user_id: request.requester_id,
        type: 'REQUEST_REJECTED',
        message: itemType === 'GIVEAWAY' 
          ? `Your claim request for "${targetItem?.title || 'item'}" was declined by the donor.`
          : `Your request to borrow "${targetItem?.title || 'item'}" was declined by the owner.`,
        related_item_id: request.item_id,
        is_read: false,
        created_at: now.toISOString()
      };
      memoryStore.notifications.unshift(notifObj);
      if (isConfigured) {
        try { await supabase.from('notifications').insert(notifObj); } catch(e) {}
      }
    }

    if (isConfigured) {
      try { await supabase.from('requests').update({ status }).eq('id', id); } catch(e) {}
    }

    return res.status(200).json({ request, transaction: transactionObj });
  } catch (err) {
    console.error('Approve/Reject request error:', err);
    return res.status(500).json({ error: 'Failed to update request.' });
  }
});

module.exports = router;
