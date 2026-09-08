const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');
const { generateEmbedding, cosineSimilarity } = require('../lib/gemini');

/**
 * GET /api/ai/lost-found-matches
 * AI semantic matching engine between active LOST and FOUND items
 */
router.get('/lost-found-matches', requireAuth, async (req, res) => {
  try {
    let allItems = [];
    if (isConfigured) {
      const { data } = await supabase.from('items').select('*, users(name, email, department)');
      if (data) allItems = data;
    }

    const memItems = memoryStore.items.map(i => {
      const u = memoryStore.users.find(user => user.id === i.user_id);
      return { ...i, users: u ? { name: u.name, email: u.email, department: u.department } : null };
    });

    const combinedMap = new Map();
    [...allItems, ...memItems].forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item);
    });

    const itemsList = Array.from(combinedMap.values());
    const lostItems = itemsList.filter(i => i.type === 'LOST' && i.status === 'ACTIVE');
    const foundItems = itemsList.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE');

    const matches = [];

    for (const lost of lostItems) {
      const lostText = `${lost.title} ${lost.description} ${lost.category} ${lost.location}`;
      const lostEmbedding = await generateEmbedding(lostText);

      for (const found of foundItems) {
        // Skip if same user posted both
        if (lost.user_id === found.user_id) continue;

        const foundText = `${found.title} ${found.description} ${found.category} ${found.location}`;
        const foundEmbedding = await generateEmbedding(foundText);

        let sim = cosineSimilarity(lostEmbedding, foundEmbedding);

        // Boost for identical category
        if (lost.category.toLowerCase() === found.category.toLowerCase()) {
          sim += 0.15;
        }

        // Boost for location keyword overlap
        const locA = lost.location.toLowerCase();
        const locB = found.location.toLowerCase();
        if (locA.includes(locB) || locB.includes(locA) || locA.split(' ').some(w => w.length > 2 && locB.includes(w))) {
          sim += 0.12;
        }

        // Clamp between 0 and 0.99
        sim = Math.min(0.99, Math.max(0, sim));
        const percentage = Math.round(sim * 100);

        if (percentage >= 35) {
          let matchLevel = 'Possible Match';
          if (percentage >= 75) matchLevel = 'High Match';
          else if (percentage >= 55) matchLevel = 'Good Match';

          matches.push({
            id: `match_${lost.id}_${found.id}`,
            matchScore: percentage,
            matchLevel,
            analysis: {
              categoryMatch: lost.category.toLowerCase() === found.category.toLowerCase(),
              locationProximity: `${lost.location} ~ ${found.location}`,
              textSimPercent: Math.round(sim * 100)
            },
            lostItem: {
              id: lost.id,
              title: lost.title,
              description: lost.description,
              category: lost.category,
              location: lost.location,
              image_url: lost.image_url,
              created_at: lost.created_at,
              poster: { name: lost.users?.name || 'Verified Student', email: lost.users?.email }
            },
            foundItem: {
              id: found.id,
              title: found.title,
              description: found.description,
              category: found.category,
              location: found.location,
              image_url: found.image_url,
              created_at: found.created_at,
              poster: { name: found.users?.name || 'Verified Student', email: found.users?.email }
            }
          });
        }
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({ data: matches, totalMatches: matches.length });
  } catch (err) {
    console.error('AI Lost-Found matching error:', err);
    return res.status(500).json({ error: 'Failed to compute AI lost-found matches.' });
  }
});

/**
 * POST /api/ai/resource-matches
 * Need <-> Resource AI recommendation assistant
 */
router.post('/resource-matches', requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Please describe the resource or item you need.' });
    }

    const cleanPrompt = prompt.trim();
    const promptEmbedding = await generateEmbedding(cleanPrompt);

    // Fetch active BORROW and GIVEAWAY items
    let itemsList = [];
    if (isConfigured) {
      const { data } = await supabase
        .from('items')
        .select('*, users(name, department)')
        .in('type', ['BORROW', 'GIVEAWAY'])
        .eq('status', 'AVAILABLE');
      if (data) itemsList = data;
    }

    const memItems = memoryStore.items
      .filter(i => (i.type === 'BORROW' || i.type === 'GIVEAWAY') && i.status === 'AVAILABLE')
      .map(i => {
        const u = memoryStore.users.find(user => user.id === i.user_id);
        return { ...i, users: u ? { name: u.name, department: u.department } : null };
      });

    const combinedMap = new Map();
    [...itemsList, ...memItems].forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item);
    });

    const availableItems = Array.from(combinedMap.values());
    const recommendations = [];

    for (const item of availableItems) {
      const itemText = `${item.title} ${item.description} ${item.category} ${item.location}`;
      const itemEmbedding = await generateEmbedding(itemText);

      let sim = cosineSimilarity(promptEmbedding, itemEmbedding);

      // Category boost if prompt contains category keywords
      if (cleanPrompt.toLowerCase().includes(item.category.toLowerCase())) {
        sim += 0.15;
      }

      sim = Math.min(0.99, Math.max(0, sim));
      const score = Math.round(sim * 100);

      if (score >= 25) {
        recommendations.push({
          ...item,
          matchScore: score,
          posterName: item.users?.name || 'Campus Peer'
        });
      }
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      prompt: cleanPrompt,
      data: recommendations,
      totalResults: recommendations.length
    });
  } catch (err) {
    console.error('Resource match error:', err);
    return res.status(500).json({ error: 'Failed to find resource recommendations.' });
  }
});

/**
 * GET /api/ai/search
 * Natural Language Smart Search across all campus items
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const queryText = q.trim();
    const queryEmbedding = await generateEmbedding(queryText);

    let allItems = [];
    if (isConfigured) {
      const { data } = await supabase.from('items').select('*, users(name)');
      if (data) allItems = data;
    }

    const memItems = memoryStore.items.map(i => {
      const u = memoryStore.users.find(user => user.id === i.user_id);
      return { ...i, users: u ? { name: u.name } : null };
    });

    const combinedMap = new Map();
    [...allItems, ...memItems].forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item);
    });

    const itemsList = Array.from(combinedMap.values());
    const rankedResults = [];

    for (const item of itemsList) {
      const itemText = `${item.title} ${item.description} ${item.category} ${item.location}`;
      const itemEmbedding = await generateEmbedding(itemText);

      let sim = cosineSimilarity(queryEmbedding, itemEmbedding);

      // Keyword match boost
      const queryWords = queryText.toLowerCase().split(' ');
      if (queryWords.some(w => w.length > 2 && item.title.toLowerCase().includes(w))) {
        sim += 0.20;
      }

      sim = Math.min(0.99, Math.max(0, sim));
      const score = Math.round(sim * 100);

      if (score >= 20) {
        rankedResults.push({
          ...item,
          relevanceScore: score,
          posterName: item.users?.name || 'Verified Student'
        });
      }
    }

    rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.status(200).json({
      query: queryText,
      data: rankedResults,
      total: rankedResults.length
    });
  } catch (err) {
    console.error('Smart search error:', err);
    return res.status(500).json({ error: 'Failed to execute smart search.' });
  }
});

module.exports = router;
