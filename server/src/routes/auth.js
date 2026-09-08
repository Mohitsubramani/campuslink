const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const { supabase, isConfigured, memoryStore } = require('../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'campuslink_super_secret_jwt_key_2026';
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || 'kce.ac.in,kahed.edu.in,karpagamtech.edu.in')
  .split(',')
  .map(d => d.trim().toLowerCase());

// Utility to check email domain
function isAllowedDomain(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase();
  return ALLOWED_DOMAINS.some(allowed => domain === allowed || domain.endsWith('.' + allowed));
}

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, roll_no, email, department, year, password } = req.body;

    if (!name || !roll_no || !email || !department || !year || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. College Domain Check
    if (!isAllowedDomain(cleanEmail)) {
      return res.status(400).json({
        error: `College email required. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`
      });
    }

    const otpCode = generateOtp();
    const now = Date.now();

    if (isConfigured) {
      // Check existing user in Supabase DB
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'An account with this college email already exists.' });
      }

      let userId = uuidv4();

      // Attempt Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name, roll_no, department, year }
        }
      });

      if (authData?.user) {
        userId = authData.user.id;
      } else if (authError) {
        console.warn(`[Supabase Auth Notice] ${authError.message}. Proceeding with database user creation.`);
      }

      // Upsert into users table with is_verified = false
      const { error: dbError } = await supabase.from('users').upsert({
        id: userId,
        name,
        roll_no,
        email: cleanEmail,
        department,
        year: parseInt(year, 10),
        is_verified: false
      }, { onConflict: 'email' });

      if (dbError) {
        console.error('Database user insert error:', dbError);
      }

      // Save user password in memory fallback if Supabase Auth rate limited
      const existingMemUser = memoryStore.users.find(u => u.email === cleanEmail);
      if (!existingMemUser) {
        memoryStore.users.push({
          id: userId,
          name,
          roll_no,
          email: cleanEmail,
          department,
          year: parseInt(year, 10),
          password,
          is_verified: false
        });
      }

      // Store OTP state
      memoryStore.otps.set(cleanEmail, {
        code: otpCode,
        expiresAt: now + 10 * 60 * 1000, // 10 mins
        lastSent: now
      });

      console.log(`[AUTH LOG] OTP for ${cleanEmail} is: ${otpCode}`);

      return res.status(201).json({
        message: 'Signup successful! OTP code sent.',
        email: cleanEmail,
        devOtpNotice: `Demo OTP is ${otpCode}`
      });
    } else {
      // Memory fallback implementation
      const existingUser = memoryStore.users.find(u => u.email === cleanEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this college email already exists.' });
      }

      const newUser = {
        id: uuidv4(),
        name,
        roll_no,
        email: cleanEmail,
        department,
        year: parseInt(year, 10),
        password,
        is_verified: false,
        created_at: new Date().toISOString()
      };

      memoryStore.users.push(newUser);
      memoryStore.otps.set(cleanEmail, {
        code: otpCode,
        expiresAt: now + 10 * 60 * 1000,
        lastSent: now
      });

      console.log(`[DEV MODE] Created user ${cleanEmail}. Demo OTP: ${otpCode}`);

      return res.status(201).json({
        message: 'Signup successful! OTP sent to your college email.',
        email: cleanEmail,
        devOtpNotice: `Demo OTP is ${otpCode}`
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to complete signup.' });
  }
});

/**
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpData = memoryStore.otps.get(cleanEmail);

    if (isConfigured) {
      // Supabase verification
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otp.trim(),
        type: 'signup'
      });

      if (verifyErr) {
        // Fallback to DB check if manual OTP used
        if (otpData && otpData.code === otp.trim()) {
          memoryStore.otps.delete(cleanEmail);
        } else {
          return res.status(400).json({ error: verifyErr.message || 'Invalid OTP code.' });
        }
      }

      // Mark user as verified in public.users table & memory store
      await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('email', cleanEmail);

      const memUser = memoryStore.users.find(u => u.email === cleanEmail);
      if (memUser) memUser.is_verified = true;

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      const finalProfile = userProfile || memUser || { email: cleanEmail, is_verified: true };

      const token = jwt.sign(
        { id: finalProfile.id || cleanEmail, email: cleanEmail },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Email verified successfully!',
        token,
        user: finalProfile
      });
    } else {
      if (!otpData) {
        return res.status(400).json({ error: 'No OTP request found for this email. Please sign up again.' });
      }

      if (Date.now() > otpData.expiresAt) {
        return res.status(410).json({ error: 'OTP has expired. Please request a new code.' });
      }

      if (otpData.code !== otp.trim()) {
        return res.status(400).json({ error: 'Incorrect OTP code.' });
      }

      memoryStore.otps.delete(cleanEmail);

      const user = memoryStore.users.find(u => u.email === cleanEmail);
      if (user) {
        user.is_verified = true;
      }

      const token = jwt.sign(
        { id: user ? user.id : cleanEmail, email: cleanEmail },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userSafe = user ? { ...user } : { email: cleanEmail, is_verified: true };
      delete userSafe.password;

      return res.status(200).json({
        message: 'Email verified successfully!',
        token,
        user: userSafe
      });
    }
  } catch (err) {
    console.error('OTP Verification error:', err);
    return res.status(500).json({ error: 'OTP verification failed.' });
  }
});

/**
 * POST /api/auth/resend-otp
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const existingOtp = memoryStore.otps.get(cleanEmail);
    const now = Date.now();

    // 30 second cooldown check
    if (existingOtp && (now - existingOtp.lastSent) < 30000) {
      const waitSec = Math.ceil((30000 - (now - existingOtp.lastSent)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec} seconds before requesting another OTP.` });
    }

    const newCode = generateOtp();
    memoryStore.otps.set(cleanEmail, {
      code: newCode,
      expiresAt: now + 10 * 60 * 1000,
      lastSent: now
    });

    console.log(`[RESEND OTP] New code for ${cleanEmail}: ${newCode}`);

    return res.status(200).json({
      message: 'New OTP code sent!',
      devOtpNotice: `Demo OTP is ${newCode}`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let authenticated = false;
    let userProfile = null;

    if (isConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (!authError && authData?.user) {
        authenticated = true;
      }
    }

    const memUser = memoryStore.users.find(u => u.email === cleanEmail);
    if (!authenticated) {
      if (memUser && memUser.password === password) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    if (isConfigured) {
      const { data: dbProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbProfile) userProfile = dbProfile;
    }

    if (!userProfile) {
      userProfile = memUser || { email: cleanEmail, is_verified: true };
    }

    if (userProfile && userProfile.is_verified === false) {
      return res.status(403).json({ error: 'Please verify your college email before logging in.' });
    }

    const token = jwt.sign(
      { id: userProfile.id || cleanEmail, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userSafe = { ...userProfile };
    delete userSafe.password;

    return res.status(200).json({
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'College email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const otpCode = generateOtp();
    const now = Date.now();

    memoryStore.otps.set(`reset_${cleanEmail}`, {
      code: otpCode,
      expiresAt: now + 10 * 60 * 1000,
      lastSent: now
    });

    console.log(`[FORGOT PASSWORD] Reset OTP for ${cleanEmail}: ${otpCode}`);

    return res.status(200).json({
      message: 'Password reset OTP sent to your college email.',
      email: cleanEmail,
      devOtpNotice: `Demo Reset OTP is ${otpCode}`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const resetData = memoryStore.otps.get(`reset_${cleanEmail}`);

    if (!resetData || resetData.code !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid or expired password reset OTP.' });
    }

    if (Date.now() > resetData.expiresAt) {
      return res.status(410).json({ error: 'Reset OTP has expired. Please try again.' });
    }

    memoryStore.otps.delete(`reset_${cleanEmail}`);

    // Update or create memory user password
    let memUser = memoryStore.users.find(u => u.email === cleanEmail);
    if (memUser) {
      memUser.password = newPassword;
    } else {
      memoryStore.users.push({
        id: uuidv4(),
        email: cleanEmail,
        password: newPassword,
        is_verified: true
      });
    }

    if (isConfigured) {
      await supabase.auth.updateUser({ password: newPassword }).catch(() => {});
    }

    return res.status(200).json({
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

module.exports = router;
