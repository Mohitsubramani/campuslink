const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 20;

let supabase = null;
if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Supabase credentials not fully configured. Operating with local fallback memory store.');
}

// In-memory fallback database for dev testing before user sets Supabase credentials
const memoryStore = {
  users: [], // { id, name, roll_no, email, department, year, is_verified, password, created_at }
  otps: new Map(), // email -> { code, expiresAt, lastSent }
  items: [],
  requests: [],
  transactions: [],
  notifications: []
};

module.exports = {
  supabase,
  isConfigured,
  memoryStore
};
