const jwt = require('jsonwebtoken');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'campuslink_super_secret_jwt_key_2026';

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Try decoding with JWT_SECRET first
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && (decoded.id || decoded.email)) {
        const memUser = memoryStore.users.find(u => u.id === decoded.id || u.email === decoded.email);

        let profile = memUser;
        if (isConfigured) {
          const { data: dbProfile } = await supabase
            .from('users')
            .select('*')
            .or(`id.eq.${decoded.id},email.eq.${decoded.email}`)
            .maybeSingle();

          if (dbProfile) profile = dbProfile;
        }

        req.user = {
          id: profile ? profile.id : decoded.id,
          email: profile ? profile.email : decoded.email,
          name: profile ? profile.name : 'Verified Student',
          roll_no: profile?.roll_no || '',
          department: profile?.department || '',
          year: profile?.year || 3,
          is_verified: profile ? profile.is_verified : true
        };
        return next();
      }
    } catch (jwtErr) {
      // Token was not signed by JWT_SECRET, try Supabase Auth session token
    }

    // 2. Fallback to Supabase Auth getUser if configured
    if (isConfigured) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        req.user = {
          id: profile ? profile.id : user.id,
          email: user.email,
          name: profile ? profile.name : user.user_metadata?.name || 'Verified Student',
          roll_no: profile?.roll_no || '',
          department: profile?.department || '',
          year: profile?.year || 3,
          is_verified: profile ? profile.is_verified : true
        };
        return next();
      }
    }

    return res.status(401).json({ error: 'Invalid or expired session token.' });
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(401).json({ error: 'Token verification failed.' });
  }
};

module.exports = { requireAuth };
