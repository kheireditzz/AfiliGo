
// =========================================================================
// SUPABASE CLIENT INITIALIZATION & CLOUD PERSISTENCE
// =========================================================================
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { encryptApiKey, decryptApiKey } from './crypto.js';
import { GoogleGenAI } from '@google/genai';

const JWT_SECRET = process.env.JWT_SECRET || 'affiliatego_jwt_super_secure_secret_key_2026_min32chars!';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bvmmshskoqylzptoyuxf.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bW1zaHNrb3F5bHpwdG95dXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU4ODY1MCwiZXhwIjoyMTAzMTY0NjUwfQ.g14Co5jvqMao9e6ZZ0sYUV8fQ1t6KCHlR8UD5CXf_-k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('SUPABASE_CLIENT_INITIALIZED_FOR_AFILIGO');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: 0
}));

// Database File Paths
const DB_DIR = path.join(__dirname, 'data');
const DB_PRODUCTS = path.join(DB_DIR, 'products.json');
const DB_STORYBOARDS = path.join(DB_DIR, 'storyboards.json');
const DB_PROMPTS = path.join(DB_DIR, 'prompts.json');
const DB_CHATS = path.join(DB_DIR, 'chats.json');
const DB_SETTINGS = path.join(DB_DIR, 'settings.json');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initFile(DB_PRODUCTS, []);
initFile(DB_STORYBOARDS, []);
initFile(DB_PROMPTS, []);
initFile(DB_CHATS, []);
initFile(DB_SETTINGS, {
  geminiApiKey: '',
  huggingFaceKey: '',
  adminUsername: 'admin',
  adminPassword: 'admin123@password',
  adminName: 'Super Administrator VIP',
  vipActive: true,
  vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));


const DB_USERS = path.join(DB_DIR, 'users.json');

initFile(DB_USERS, [
  {
    id: 'usr-admin-1',
    name: 'Kheir Editz (Super Admin)',
    email: 'kheireditz@gmail.com',
    username: 'kheireditz@gmail.com',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    vipActive: true,
    apiKey: null,
    createdAt: new Date().toISOString()
  }
]);

initFile(DB_CHATS, []);

// ==========================================
// AUTH MIDDLEWARE (JWT HTTP-ONLY COOKIE & HEADER)
// ==========================================
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Autentikasi dibutuhkan. Silakan login kembali.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Sesi login tidak valid atau telah kedaluwarsa.' });
  }
};

// ==========================================
// PUBLIC AUTHENTICATION (REGISTER & LOGIN)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Harap isi nama, email, dan password!' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rawPass = password.trim();
  const userName = name.trim();

  try {
    // 1. Check existing user in Supabase
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', normalizedEmail).single();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar! Silakan langsung login.' });
    }

    // 2. Insert into Supabase
    const { data, error } = await supabase.from('users').insert([{
      name: userName,
      email: normalizedEmail,
      password: rawPass,
      role: 'USER',
      vip_active: false
    }]).select();

    if (!error && data && data[0]) {
      const user = data[0];
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vipActive: user.vip_active || false,
          hasApiKey: false
        }
      });
    }
  } catch (err) {
    console.error('Supabase register error:', err);
  }

  // Fallback to local DB
  const users = readJson(DB_USERS);
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar! Silakan login.' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: userName,
    email: normalizedEmail,
    username: normalizedEmail,
    password: rawPass,
    role: 'USER',
    vipActive: false,
    vipExpiresAt: null,
    apiKey: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJson(DB_USERS, users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      vipActive: newUser.vipActive,
      hasApiKey: false
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Harap masukkan email dan password!' });
  }

  const inputKey = username.trim().toLowerCase();
  const inputPass = password.trim();

  // 1. Instant check local database (0ms latency)
  const users = readJson(DB_USERS);
  const foundUser = users.find(u => 
    (u.email && u.email.toLowerCase() === inputKey) || 
    (u.username && u.username.toLowerCase() === inputKey)
  );

  if (foundUser) {
    const isPassValid = foundUser.password === inputPass || 
      (foundUser.password && foundUser.password.startsWith('$2') && bcrypt.compareSync(inputPass, foundUser.password));

    if (isPassValid) {
      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: `Selamat datang kembali, ${foundUser.name || 'User'}!`,
        token,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          vipActive: foundUser.vipActive || false,
          hasApiKey: !!foundUser.apiKey
        }
      });
    }
  }

  // 2. Fallback check Supabase cloud auth if not found in local DB
  try {
    const { data: supaUser, error: supaErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', inputKey)
      .single();

    if (supaUser && !supaErr) {
      if (supaUser.password === inputPass || (supaUser.password.startsWith('$2') && bcrypt.compareSync(inputPass, supaUser.password))) {
        const usersLocal = readJson(DB_USERS);
        const localIdx = usersLocal.findIndex(u => u.email.toLowerCase() === inputKey);
        const hasKey = localIdx !== -1 ? !!usersLocal[localIdx].apiKey : false;

        const token = jwt.sign({ id: supaUser.id, email: supaUser.email, name: supaUser.name, role: supaUser.role }, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.json({
          success: true,
          message: `Selamat datang kembali, ${supaUser.name || 'User'}!`,
          token,
          user: {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role,
            vipActive: supaUser.vip_active || false,
            hasApiKey: hasKey
          }
        });
      }
    }
  } catch (err) {
    console.error('Supabase login check exception:', err);
  }

  return res.status(401).json({ success: false, message: 'Email atau password salah!' });
});

app.post('/api/auth/update-profile', (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const settings = readJson(DB_SETTINGS);

  if (currentPassword !== settings.adminPassword) {
    return res.status(400).json({ error: 'Password saat ini salah!' });
  }

  if (name) settings.adminName = name;
  if (newPassword && newPassword.trim().length >= 6) {
    settings.adminPassword = newPassword.trim();
  }

  writeJson(DB_SETTINGS, settings);
  res.json({ success: true, message: 'Profil dan kredensial admin berhasil diperbarui!' });
});

// ==========================================
// DASHBOARD STATS API (SUPABASE CLOUD SYNC)
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [pRes, sbRes, prRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('storyboards').select('*').order('created_at', { ascending: false }),
      supabase.from('prompts').select('id', { count: 'exact' })
    ]);

    const storyboardsList = sbRes.data || readJson(DB_STORYBOARDS);
    let totalScenes = 0;
    storyboardsList.forEach(sb => {
      if (sb.scenes && Array.isArray(sb.scenes)) {
        totalScenes += sb.scenes.length;
      }
    });

    res.json({
      totalProducts: pRes.count !== null ? pRes.count : readJson(DB_PRODUCTS).length,
      totalStoryboards: sbRes.data ? sbRes.data.length : storyboardsList.length,
      totalScenes: totalScenes,
      totalPrompts: prRes.count !== null ? prRes.count : readJson(DB_PROMPTS).length,
      recentStoryboards: storyboardsList.slice(0, 4)
    });
  } catch (err) {
    const products = readJson(DB_PRODUCTS);
    const storyboards = readJson(DB_STORYBOARDS);
    const prompts = readJson(DB_PROMPTS);
    let totalScenes = 0;
    storyboards.forEach(sb => {
      if (sb.scenes && Array.isArray(sb.scenes)) totalScenes += sb.scenes.length;
    });
    res.json({
      totalProducts: products.length,
      totalStoryboards: storyboards.length,
      totalScenes: totalScenes,
      totalPrompts: prompts.length,
      recentStoryboards: storyboards.slice(-4).reverse()
    });
  }
});

// ==========================================
// PRODUCTS CRUD APIs (SUPABASE SYNC)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) throw error;
    res.json(data);
  } catch (err) {
    res.json(readJson(DB_PRODUCTS));
  }
});

app.post('/api/products', async (req, res) => {
  const newProduct = {
    title: req.body.title || 'Produk Baru',
    category: req.body.category || 'Umum',
    price: Number(req.body.price) || 0,
    commission_rate: Number(req.body.commissionRate) || 10,
    target_market: req.body.targetMarket || '',
    usp: req.body.usp || '',
    affiliate_link: req.body.affiliateLink || '',
    image_url: req.body.imageUrl || ''
  };

  try {
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error && data && data[0]) {
      // Local sync
      const products = readJson(DB_PRODUCTS);
      products.unshift(data[0]);
      writeJson(DB_PRODUCTS, products);
      return res.status(201).json(data[0]);
    }
  } catch (err) {
    console.error('Supabase product insert error:', err);
  }

  const products = readJson(DB_PRODUCTS);
  const fallbackProd = { id: 'prod-' + Date.now(), ...newProduct };
  products.unshift(fallbackProd);
  writeJson(DB_PRODUCTS, products);
  res.status(201).json(fallbackProd);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase product delete error:', err);
  }

  let products = readJson(DB_PRODUCTS);
  products = products.filter(p => p.id !== id);
  writeJson(DB_PRODUCTS, products);
  res.json({ success: true });
});

// ==========================================
// STORYBOARDS CRUD APIs (SUPABASE SYNC)
// ==========================================
app.get('/api/storyboards', async (req, res) => {
  try {
    const { data, error } = await supabase.from('storyboards').select('*').order('created_at', { ascending: false });
    if (error || !data) throw error;
    res.json(data);
  } catch (err) {
    res.json(readJson(DB_STORYBOARDS));
  }
});

app.post('/api/storyboards', async (req, res) => {
  const sb = req.body;
  const sbPayload = {
    title: sb.title || 'Storyboard Tanpa Judul',
    platform: sb.platform || 'TikTok / Reels (9:16)',
    total_duration: Number(sb.totalDuration) || 15,
    model_description: sb.modelDescription || '',
    location_setting: sb.locationSetting || '',
    hook: sb.hook || '',
    cta: sb.cta || '',
    scenes: sb.scenes || []
  };

  try {
    if (sb.id && !sb.id.startsWith('sb-')) {
      // Existing UUID
      const { data, error } = await supabase.from('storyboards').update(sbPayload).eq('id', sb.id).select();
      if (!error && data && data[0]) {
        return res.status(200).json(data[0]);
      }
    } else {
      // New row
      const { data, error } = await supabase.from('storyboards').insert([sbPayload]).select();
      if (!error && data && data[0]) {
        const storyboards = readJson(DB_STORYBOARDS);
        storyboards.unshift(data[0]);
        writeJson(DB_STORYBOARDS, storyboards);
        return res.status(201).json(data[0]);
      }
    }
  } catch (err) {
    console.error('Supabase storyboard sync error:', err);
  }

  const storyboards = readJson(DB_STORYBOARDS);
  const existingIdx = storyboards.findIndex(s => s.id === sb.id);
  if (existingIdx >= 0) {
    storyboards[existingIdx] = sb;
  } else {
    if (!sb.id) sb.id = 'sb-' + Date.now();
    storyboards.unshift(sb);
  }
  writeJson(DB_STORYBOARDS, storyboards);
  res.status(201).json(sb);
});

app.delete('/api/storyboards/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await supabase.from('storyboards').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase storyboard delete error:', err);
  }

  let storyboards = readJson(DB_STORYBOARDS);
  storyboards = storyboards.filter(s => s.id !== id);
  writeJson(DB_STORYBOARDS, storyboards);
  res.json({ success: true });
});

// ==========================================
// PROMPTS CRUD APIs (SUPABASE SYNC)
// ==========================================
app.get('/api/prompts', async (req, res) => {
  try {
    const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
    if (error || !data) throw error;
    res.json(data);
  } catch (err) {
    res.json(readJson(DB_PROMPTS));
  }
});

app.post('/api/prompts', async (req, res) => {
  const promptPayload = {
    title: req.body.title || 'Prompt Baru',
    category: req.body.category || 'General',
    aspect_ratio: req.body.aspectRatio || '9:16',
    prompt: req.body.prompt || ''
  };

  try {
    const { data, error } = await supabase.from('prompts').insert([promptPayload]).select();
    if (!error && data && data[0]) {
      const prompts = readJson(DB_PROMPTS);
      prompts.unshift(data[0]);
      writeJson(DB_PROMPTS, prompts);
      return res.status(201).json(data[0]);
    }
  } catch (err) {
    console.error('Supabase prompt insert error:', err);
  }

  const prompts = readJson(DB_PROMPTS);
  const fallbackPrompt = { id: 'prompt-' + Date.now(), ...promptPayload };
  prompts.unshift(fallbackPrompt);
  writeJson(DB_PROMPTS, prompts);
  res.status(201).json(fallbackPrompt);
});

app.delete('/api/prompts/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await supabase.from('prompts').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase prompt delete error:', err);
  }

  let prompts = readJson(DB_PROMPTS);
  prompts = prompts.filter(p => p.id !== id);
  writeJson(DB_PROMPTS, prompts);
  res.json({ success: true });
});

// ==========================================
// SETTINGS APIs (SUPABASE SYNC)
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      return res.json({
        geminiApiKey: data.gemini_api_key ? '********' : '',
        huggingFaceKey: data.huggingface_key ? '********' : '',
        adminName: 'Super Administrator VIP'
      });
    }
  } catch (e) {}

  const settings = readJson(DB_SETTINGS);
  res.json({
    geminiApiKey: settings.geminiApiKey ? '********' : '',
    huggingFaceKey: settings.huggingFaceKey ? '********' : '',
    adminName: settings.adminName || 'Super Administrator VIP'
  });
});

async function syncSettingsToSupabase(settings) {
  try {
    const activeKey = getActiveGeminiKey();
    const payload = {
      id: 1,
      updated_at: new Date().toISOString()
    };
    if (activeKey && !activeKey.includes('****')) payload.gemini_api_key = activeKey;
    if (settings.huggingFaceKey && !settings.huggingFaceKey.includes('****')) payload.huggingface_key = settings.huggingFaceKey;
    if (settings.geminiApiKeys) payload.gemini_api_keys = settings.geminiApiKeys;

    await supabase.from('settings').upsert(payload);
  } catch (e) {
    console.error('Supabase settings sync error (fallback to local DB):', e.message);
  }
}

app.post('/api/settings', async (req, res) => {
  const settings = readJson(DB_SETTINGS);
  if (req.body.geminiApiKey && !req.body.geminiApiKey.includes('****')) {
    settings.geminiApiKey = req.body.geminiApiKey;
    let pool = settings.geminiApiKeys || getGeminiKeyPool();
    let existing = pool.find(k => k.key === req.body.geminiApiKey.trim());
    if (!existing) {
      pool.push({
        id: 'key-' + Date.now(),
        key: req.body.geminiApiKey.trim(),
        label: 'API Key Utama',
        isActive: true,
        status: 'active',
        addedAt: new Date().toISOString()
      });
    }
    pool.forEach(k => {
      k.isActive = (k.key === req.body.geminiApiKey.trim());
    });
    settings.geminiApiKeys = pool;
  }
  if (req.body.huggingFaceKey && !req.body.huggingFaceKey.includes('****')) {
    settings.huggingFaceKey = req.body.huggingFaceKey;
  }
  writeJson(DB_SETTINGS, settings);
  await syncSettingsToSupabase(settings);
  res.json({ success: true, message: 'Pengaturan berhasil disimpan!' });
});

// ==========================================
// GEMINI MULTI-API KEY POOL & AUTO-FAILOVER ENGINE
// ==========================================
function maskApiKey(key) {
  if (!key || key.length < 10) return '********';
  return key.slice(0, 7) + '...' + key.slice(-5);
}

function getGeminiKeyPool() {
  const settings = readJson(DB_SETTINGS);
  let pool = settings.geminiApiKeys || [];

  // Migrate legacy single key if exists
  if (pool.length === 0 && settings.geminiApiKey && !settings.geminiApiKey.includes('****') && settings.geminiApiKey !== 'YOUR_GEMINI_API_KEY') {
    pool.push({
      id: 'key-' + Date.now(),
      key: settings.geminiApiKey,
      label: 'API Key Utama',
      isActive: true,
      status: 'active',
      addedAt: new Date().toISOString()
    });
    settings.geminiApiKeys = pool;
    writeJson(DB_SETTINGS, settings);
  }

  // Fallback default key if pool is completely empty
  if (pool.length === 0) {
    const envKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY')
      ? process.env.GEMINI_API_KEY
      : 'AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw';
    pool.push({
      id: 'key-builtin-1',
      key: envKey,
      label: 'Default Key',
      isActive: true,
      status: 'active',
      addedAt: new Date().toISOString()
    });
  }

  return pool;
}

function getActiveGeminiKey() {
  const pool = getGeminiKeyPool();
  const validKeyObj = pool.find(k => k.isActive && k.key && k.key.startsWith('AIzaSy')) ||
                       pool.find(k => k.status === 'active' && k.key && k.key.startsWith('AIzaSy')) ||
                       pool.find(k => k.key && k.key.startsWith('AIzaSy'));
  if (validKeyObj) return validKeyObj.key;
  return (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy'))
    ? process.env.GEMINI_API_KEY
    : 'AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw';
}

function rotateGeminiKeyOnLimit(failedKey) {
  const settings = readJson(DB_SETTINGS);
  let pool = settings.geminiApiKeys || getGeminiKeyPool();
  if (pool.length === 0) return getActiveGeminiKey();

  const failedIdx = pool.findIndex(k => k.key === failedKey || k.id === failedKey);
  if (failedIdx !== -1) {
    pool[failedIdx].status = 'rate_limited';
    pool[failedIdx].isActive = false;
    pool[failedIdx].lastLimitedAt = new Date().toISOString();
  }

  // Find next working key
  let nextKey = pool.find(k => k.status !== 'rate_limited');
  if (!nextKey) {
    // Reset all statuses if all were marked limited
    pool.forEach(k => k.status = 'active');
    nextKey = pool[0];
  }

  if (nextKey) {
    nextKey.isActive = true;
    settings.geminiApiKeys = pool;
    settings.geminiApiKey = nextKey.key;
    writeJson(DB_SETTINGS, settings);
    syncSettingsToSupabase(settings);
    console.log(`[Gemini Failover] Switched active key to: ${nextKey.label} (${maskApiKey(nextKey.key)})`);
    return nextKey.key;
  }

  return getActiveGeminiKey();
}

app.get('/api/gemini-keys', (req, res) => {
  const pool = getGeminiKeyPool();
  const safeList = pool.map(k => ({
    id: k.id,
    label: k.label || 'API Key',
    maskedKey: maskApiKey(k.key),
    isActive: !!k.isActive,
    status: k.status || 'active',
    addedAt: k.addedAt,
    lastLimitedAt: k.lastLimitedAt || null
  }));
  res.json({ success: true, keys: safeList });
});

app.post('/api/gemini-keys', async (req, res) => {
  const { key, label } = req.body;
  if (!key || key.length < 8) {
    return res.status(400).json({ success: false, message: 'Format Google Gemini API Key tidak valid.' });
  }

  const settings = readJson(DB_SETTINGS);
  let pool = settings.geminiApiKeys || getGeminiKeyPool();

  // Check duplicate
  const existing = pool.find(k => k.key === key.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'API Key ini sudah ada di dalam daftar.' });
  }

  const newKeyObj = {
    id: 'key-' + Date.now(),
    key: key.trim(),
    label: (label && label.trim()) ? label.trim() : `Key ${pool.length + 1}`,
    isActive: pool.length === 0,
    status: 'active',
    addedAt: new Date().toISOString()
  };

  pool.push(newKeyObj);
  settings.geminiApiKeys = pool;
  if (newKeyObj.isActive) {
    settings.geminiApiKey = newKeyObj.key;
  }
  writeJson(DB_SETTINGS, settings);
  await syncSettingsToSupabase(settings);

  res.json({ success: true, message: 'API Key berhasil disimpan ke database & cloud!', key: { ...newKeyObj, maskedKey: maskApiKey(newKeyObj.key) } });
});

app.post('/api/gemini-keys/set-active', async (req, res) => {
  const { id } = req.body;
  const settings = readJson(DB_SETTINGS);
  let pool = settings.geminiApiKeys || getGeminiKeyPool();

  let target = null;
  pool.forEach(k => {
    if (k.id === id) {
      k.isActive = true;
      k.status = 'active'; // reset limit status if user manually activates
      target = k;
    } else {
      k.isActive = false;
    }
  });

  if (target) {
    settings.geminiApiKeys = pool;
    settings.geminiApiKey = target.key;
    writeJson(DB_SETTINGS, settings);
    await syncSettingsToSupabase(settings);
    return res.json({ success: true, message: `Key "${target.label}" sekarang aktif!` });
  }
  res.status(404).json({ success: false, message: 'Key tidak ditemukan.' });
});

app.delete('/api/gemini-keys/:id', async (req, res) => {
  const { id } = req.params;
  const settings = readJson(DB_SETTINGS);
  let pool = settings.geminiApiKeys || getGeminiKeyPool();

  if (pool.length <= 1) {
    return res.status(400).json({ success: false, message: 'Minimal harus ada 1 API Key di dalam pool.' });
  }

  const wasActive = pool.find(k => k.id === id)?.isActive;
  pool = pool.filter(k => k.id !== id);

  if (wasActive && pool.length > 0) {
    pool[0].isActive = true;
    pool[0].status = 'active';
    settings.geminiApiKey = pool[0].key;
  }

  settings.geminiApiKeys = pool;
  writeJson(DB_SETTINGS, settings);
  await syncSettingsToSupabase(settings);
  res.json({ success: true, message: 'API Key berhasil dihapus.' });
});

// ==========================================
// DONGTUBE VIP PAYMENT GATEWAY & WEBHOOK ENGINE
// ==========================================
const DONGTUBE_API_KEY = 'DONGTUBE_20a06f2ab35b44ac';
const DONGTUBE_BASE_URL = 'https://payment.dongtube.cyou';
const VIP_PRICE = 25000;

app.post('/api/vip/create-invoice', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const url = `${DONGTUBE_BASE_URL}/api/v1/invoice?apikey=${DONGTUBE_API_KEY}&amount=${VIP_PRICE}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.success) {
      let qrisImg = data.qris_image;
      if (qrisImg && qrisImg.startsWith('/')) {
        qrisImg = DONGTUBE_BASE_URL + qrisImg;
      }

      // Record invoice to Supabase
      try {
        await supabase.from('invoices').insert([{
          invoice_id: data.invoice_id,
          amount: data.amount || VIP_PRICE,
          status: 'pending',
          qris_image: qrisImg,
          user_id: userId || null
        }]);
      } catch (dbErr) {
        console.error('Supabase invoice insert error:', dbErr);
      }

      res.json({
        success: true,
        invoice_id: data.invoice_id,
        amount: data.amount,
        fee: data.fee,
        total: data.total || (data.amount + (data.fee || 0)),
        qris_image: qrisImg,
        expired_at: data.expired_at
      });
    } else {
      res.status(400).json({ success: false, message: data.message || 'Gagal membuat invoice QRIS Dongtube' });
    }
  } catch (err) {
    console.error('Dongtube create invoice error:', err);
    res.status(500).json({ success: false, message: 'Koneksi ke gateway Dongtube gagal.' });
  }
});

// OFFICIAL PAYMENT WEBHOOK HANDLER
// Receives instant payment callback from payment gateway
// URL: https://affiliatego.vercel.app/api/vip/webhook
app.post('/api/vip/webhook', async (req, res) => {
  console.log('PAYMENT_WEBHOOK_RECEIVED:', req.body);
  const { invoice_id, status, amount, signature, user_email, user_id } = req.body;

  if (!invoice_id) {
    return res.status(400).json({ success: false, message: 'Invoice ID is required' });
  }

  const isPaid = status === 'paid' || status === 'SUCCESS' || status === 'settlement' || status === 'PAID';

  if (isPaid) {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Update invoice in Supabase
    try {
      await supabase.from('invoices').update({
        status: 'paid',
        paid_at: new Date().toISOString()
      }).eq('invoice_id', invoice_id);
    } catch (err) {
      console.error('Supabase webhook invoice update error:', err);
    }

    // 2. Activate VIP user in Supabase
    if (user_id || user_email) {
      try {
        const query = user_id 
          ? supabase.from('users').update({ vip_active: true, vip_expires_at: thirtyDaysFromNow }).eq('id', user_id)
          : supabase.from('users').update({ vip_active: true, vip_expires_at: thirtyDaysFromNow }).eq('email', user_email.toLowerCase());
        await query;
      } catch (err) {
        console.error('Supabase user VIP activation error:', err);
      }
    }

    // 3. Update global settings fallback
    const settings = readJson(DB_SETTINGS);
    settings.vipActive = true;
    settings.vipExpiresAt = thirtyDaysFromNow;
    writeJson(DB_SETTINGS, settings);

    console.log(`VIP_ACTIVATED_SUCCESSFULLY for invoice: ${invoice_id}`);
    return res.json({ success: true, message: 'Payment webhook processed and VIP activated!' });
  }

  res.json({ success: true, message: 'Webhook received but payment is not in paid state.' });
});

app.get('/api/vip/check-status/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const url = `${DONGTUBE_BASE_URL}/api/v1/invoice/status?apikey=${DONGTUBE_API_KEY}&invoice_id=${invoiceId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.status) {
      if (data.status === 'paid') {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Supabase sync
        try {
          await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('invoice_id', invoiceId);
        } catch(e) {}

        const settings = readJson(DB_SETTINGS);
        settings.vipActive = true;
        settings.vipExpiresAt = thirtyDaysFromNow;
        writeJson(DB_SETTINGS, settings);
      }
      res.json({
        success: true,
        status: data.status,
        data: data
      });
    } else {
      res.json({ success: false, status: 'pending' });
    }
  } catch (err) {
    console.error('Check invoice status error:', err);
    res.status(500).json({ success: false, status: 'pending' });
  }
});

// Dynamic 30-Day VIP Status & Expiry Engine
app.get('/api/vip/status', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  const now = Date.now();

  let isVip = false;
  let remainingMs = 0;
  let remainingDays = 0;
  let expiryDate = settings.vipExpiresAt || null;

  if (settings.vipExpiresAt) {
    const expireTime = new Date(settings.vipExpiresAt).getTime();
    if (expireTime > now) {
      isVip = true;
      remainingMs = expireTime - now;
      remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    } else {
      isVip = false;
      settings.vipActive = false;
      settings.vipExpiresAt = null;
      writeJson(DB_SETTINGS, settings);
    }
  }

  res.json({
    vipActive: isVip,
    vipPrice: VIP_PRICE,
    expiresAt: expiryDate,
    remainingMs: remainingMs,
    remainingDays: remainingDays
  });
});

// =========================================================================
// FLOW AI EXTENSION DOWNLOAD ENDPOINT (ZIP)
// =========================================================================
app.get('/api/extension/download-flow-ai', (req, res) => {
  const zipPath = path.join(__dirname, 'public', 'Flow-Ai-Extension.zip');
  const fallbackPath = path.join(__dirname, 'public', 'AffiliateGo-FlowAI-Extension.zip');
  const target = fs.existsSync(zipPath) ? zipPath : fallbackPath;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Flow-Ai-Extension.zip"');
    return res.sendFile(target);
  }
  res.status(404).json({ success: false, message: 'File extension belum dibuat.' });
});

// =========================================================================
// SYNC GENERATED ASSETS (VIDEO & IMAGES) FROM FLOW AI TO AFFILIATEGO WEB
// =========================================================================
app.post('/api/storyboards/sync-flow-asset', (req, res) => {
  try {
    const { sceneId, videoUrl, imageUrl, prompt, model, duration, timestamp } = req.body;
    const storyboards = readJson(DB_STORYBOARDS);
    
    // Create or append to a synced Flow AI Storyboard record
    let flowStoryboard = storyboards.find(sb => sb.isFlowAiSynced === true);
    if (!flowStoryboard) {
      flowStoryboard = {
        id: 'flow-ai-' + Date.now(),
        productTitle: 'Flow AI Generated Video Suite',
        usp: 'Hasil generate otomatis dari Flow AI Extension',
        modelDesc: model || 'Veo 3.1 / Nano Banana Pro',
        locationDesc: 'Studio Flow AI',
        isFlowAiSynced: true,
        createdAt: new Date().toISOString(),
        scenes: []
      };
      storyboards.unshift(flowStoryboard);
    }

    // Add or update scene asset
    const existingSceneIndex = flowStoryboard.scenes.findIndex(s => s.id === sceneId);
    const sceneData = {
      id: sceneId || (flowStoryboard.scenes.length + 1),
      shotType: 'Scene ' + (sceneId || (flowStoryboard.scenes.length + 1)),
      durationSeconds: parseInt(duration) || 6,
      visualDescription: prompt || 'Generated with Flow AI Extension',
      imageUrl: imageUrl || (flowStoryboard.scenes[0] && flowStoryboard.scenes[0].imageUrl) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      videoUrl: videoUrl || null,
      syncedAt: timestamp || new Date().toISOString()
    };

    if (existingSceneIndex >= 0) {
      flowStoryboard.scenes[existingSceneIndex] = { ...flowStoryboard.scenes[existingSceneIndex], ...sceneData };
    } else {
      flowStoryboard.scenes.push(sceneData);
    }

    writeJson(DB_STORYBOARDS, storyboards);
    return res.json({ success: true, message: 'Aset Flow AI berhasil disinkronkan ke Galeri Web!', storyboard: flowStoryboard });
  } catch(err) {
    console.error('Error syncing Flow AI asset:', err);
    return res.status(500).json({ success: false, message: 'Gagal sinkron aset.' });
  }
});

// =========================================================================
// AI AFFILIATE PRODUCT VISION & SCRIPT VAULT GENERATION API (@google/genai)
// =========================================================================
app.post('/api/ai/analyze-affiliate-product', async (req, res) => {
  const { image, target_platform = 'all', additional_context = '' } = req.body;

  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'Harap sertakan gambar produk dalam format base64.'
    });
  }

  // 1. Resolve API Key from environment or settings
  const apiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
    ? process.env.GEMINI_API_KEY
    : (readJson(DB_SETTINGS).geminiApiKey || 'AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw');

  // 2. Clean Base64 Data
  let mimeType = 'image/jpeg';
  let base64Data = image;

  const match = image.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1] || 'image/jpeg';
    base64Data = match[2];
  }

  // 3. System Prompt for Affiliate AI
  const systemPrompt = `Kamu adalah AI Visual Director dan Pakar Copywriting Konten Affiliate level tertinggi untuk pasar Indonesia (TikTok Shop, Shopee Video, Instagram Reels, YouTube Shorts).
Tugasmu adalah menganalisa gambar produk yang diunggah secara mendalam dan menghasilkan data terstruktur dalam format JSON yang siap dipakai langsung oleh kreator affiliate untuk pembuatan konten video dan visualisasi AI.

Format response WAJIB berupa JSON valid murni dengan struktur spesifik berikut:
{
  "analisa_produk": {
    "nama_produk": "Nama spesifik, komersial, dan akurat dari produk di foto (contoh: Skintific 5X Ceramide Barrier Repair Moisture Gel, TWS Bluetooth Wireless Earbuds ANC Matte Black)",
    "jenis": "Kategori / jenis produk (contoh: Skincare / Pelembap Wajah, Gadget / Audio, Fashion / Tas)",
    "warna": "Warna dominan dan aksen visual produk/kemasan",
    "fitur_menonjol": "3-4 fitur atau keunggulan visual utama yang terlihat jelas pada produk",
    "target_pasar": "Segmen audiens pembeli paling potensial (gender, rentang usia, problem yang dialami)",
    "deskripsi_singkat": "Ringkasan 1-2 kalimat mengapa produk ini bernilai tinggi untuk dipromosikan."
  },
  "prompt_video": [
    {
      "gaya": "UGC (User-Generated Content)",
      "deskripsi": "Gaya natural ala kreator / review santai unboxing",
      "prompt_en": "Hyperrealistic UGC style handheld smartphone camera footage of a friendly Indonesian young woman (22yo) enthusiastically holding and unboxing [product name], demonstrating its [key feature], natural bedroom lighting, authentic cozy morning vibe, 4k 60fps, photorealistic textures",
      "instruksi_kreator": "Pegang produk dekat kamera, perlihatkan detail kemasan/tekstur seolah baru pertama kali mencoba."
    },
    {
      "gaya": "Cinematic Commercial",
      "deskripsi": "Iklan estetik mewah dengan pencahayaan studio & slow motion",
      "prompt_en": "High-end commercial 8k cinematic shot of [product name] rotating slowly on a dark reflective marble pedestal, soft atmospheric golden hour lighting, water droplet condensation / subtle product particle bokeh, shot on 85mm anamorphic lens, luxury color grading",
      "instruksi_kreator": "Gunakan pergerakan kamera slow-motion memutar 360 derajat untuk menonjolkan kesan mewah dan premium."
    },
    {
      "gaya": "Fast Hook / Problem & Solution",
      "deskripsi": "Adegan dinamis 3 detik pertama pemecah kebosanan penonton",
      "prompt_en": "Dynamic fast-paced close-up macro transition showing a problem scenario instantly solved by applying/using [product name], dramatic studio lighting, high energy motion blur, sharp focus on product action, 4k ultra detailed",
      "instruksi_kreator": "Potong transisi cepat di 2 detik pertama antara ekspresi bingung/masalah langsung beralih ke rasa puas setelah memakai produk."
    }
  ],
  "caption": [
    {
      "tipe": "FOMO & Diskon (Tinggi Konversi)",
      "hook": "Stop scrolling! Jangan beli ini sebelum tau rahasia ini... 😱👇",
      "teks_lengkap": "Sumpah ini racun banget! Buat yang sering nanyain solusi terbaik, wajib banget cobain [nama_produk]. Mumpung lagi ada promo flash sale & gratis ongkir, langsung checkout di keranjang kuning sekarang sebelum kehabisan! 🔥🛒",
      "hashtags": "#racuntiktok #tiktokshop #spillproduk #rekomendasiproduk #fyp"
    },
    {
      "tipe": "Edukasi & Review Jujur",
      "hook": "Akhirnya nemu juga produk yang beneran worth it! ✨",
      "teks_lengkap": "Awalnya skeptis, tapi setelah nyobain [nama_produk] sendiri selama seminggu, hasilnya bener-bener di luar ekspektasi. Yang paling aku suka itu [fitur_menonjol]. Worth it banget dengan harga segini! Cek keranjang kuning buat detail promonya yaa ✨",
      "hashtags": "#reviewjujur #rekomendasiproduk #affiliatemarketing #tipsbelanja #fypindonesia"
    },
    {
      "tipe": "Storytelling & Relate",
      "hook": "Dulu sering insecure gara-gara ini, sampai akhirnya... 🥺",
      "teks_lengkap": "Siapa di sini yang punya masalah sama [target_pasar]? Kalian wajib tau ini! Sejak pakai [nama_produk], hidup jadi jauh lebih simpel dan percaya diri. Klik icon keranjang di pojok kiri bawah buat dapetin diskon hari ini ya! 💖",
      "hashtags": "#storytime #tipsaffiliate #viraltiktok #keranjangkuning #fyp"
    }
  ]
}`;

  try {
    // Attempt 1: Using @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });
    const userPromptText = `Analisa gambar produk ini untuk platform ${target_platform}. ${additional_context ? `Konteks tambahan dari user: ${additional_context}.` : ''} Hasilkan analisa lengkap, 3 varian prompt video, dan 3 varian caption dalam format JSON sesuai spesifikasi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        { text: `${systemPrompt}\n\n${userPromptText}` }
      ],
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    });

    if (response && response.text) {
      const parsedData = JSON.parse(response.text);
      return res.json({
        success: true,
        analisa_produk: parsedData.analisa_produk || {},
        prompt_video: parsedData.prompt_video || [],
        caption: parsedData.caption || [],
        source: 'GoogleGenAI (gemini-2.5-flash)'
      });
    }
  } catch (sdkError) {
    console.error('@google/genai SDK failed, falling back to direct REST API:', sdkError);

    // Attempt 2: Direct REST fetch fallback
    try {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: `${systemPrompt}\n\nAnalisa gambar produk ini untuk platform ${target_platform}.` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      });

      const restData = await restRes.json();
      if (restData.candidates && restData.candidates[0]?.content?.parts?.[0]?.text) {
        const parsedData = JSON.parse(restData.candidates[0].content.parts[0].text);
        return res.json({
          success: true,
          analisa_produk: parsedData.analisa_produk || {},
          prompt_video: parsedData.prompt_video || [],
          caption: parsedData.caption || [],
          source: 'Gemini REST Fallback (gemini-2.5-flash)'
        });
      }
    } catch (restError) {
      console.error('REST Vision fallback also failed:', restError);
    }
  }

  // Graceful Fallback if vision service is temporarily unavailable
  return res.json({
    success: true,
    analisa_produk: {
      nama_produk: "Smart Affiliate Product",
      jenis: "Produk Unggulan E-Commerce",
      warna: "Modern Color Palette",
      fitur_menonjol: "Desain ergonomis, material kokoh premium, portabel dan praktis digunakan",
      target_pasar: "Audiens muda & profesional aktif (18-35 tahun)",
      deskripsi_singkat: "Produk inovatif dengan daya tarik visual kuat yang siap dikonversikan menjadi penjualan tinggi."
    },
    prompt_video: [
      {
        gaya: "UGC (User-Generated Content)",
        deskripsi: "Gaya unboxing & review natural",
        prompt_en: "Hyperrealistic handheld POV smartphone footage of authentic Indonesian content creator unboxing and holding the product, warm natural daylight, soft bedroom background, 4k 60fps",
        instruksi_kreator: "Sorot ekspresi antusias saat pertama kali membuka kemasan."
      },
      {
        gaya: "Cinematic Commercial",
        deskripsi: "Tampilan visual mewah studio",
        prompt_en: "High-end commercial 8k product photography, luxury reflective dark surface, dramatic rim lighting, golden particle bokeh, 85mm lens",
        instruksi_kreator: "Gunakan slow motion 120fps untuk menonjolkan tekstur material."
      },
      {
        gaya: "Fast Hook / Problem & Solution",
        deskripsi: "3 detik pertama penarik perhatian",
        prompt_en: "Fast dynamic split screen transition showing everyday problem instantly fixed by the product, high energy, sharp focus, vibrant colors",
        instruksi_kreator: "Buat transisi cepat sebelum dan sesudah pemakaian."
      }
    ],
    caption: [
      {
        tipe: "FOMO & Diskon (Tinggi Konversi)",
        hook: "Stop scrolling! Jangan beli ini sebelum tau rahasia ini... 😱👇",
        teks_lengkap: "Sumpah ini racun banget! Mumpung lagi ada promo flash sale & gratis ongkir, langsung checkout di keranjang kuning sekarang sebelum kehabisan! 🔥🛒",
        hashtags: "#racuntiktok #tiktokshop #spillproduk #fyp"
      },
      {
        tipe: "Edukasi & Review Jujur",
        hook: "Akhirnya nemu juga produk yang beneran worth it! ✨",
        teks_lengkap: "Awalnya ragu, tapi setelah nyobain sendiri hasilnya bener-bener di luar ekspektasi. Cek keranjang kuning buat detail promonya yaa ✨",
        hashtags: "#reviewjujur #rekomendasiproduk #affiliatemarketing #fypindonesia"
      },
      {
        tipe: "Storytelling & Relate",
        hook: "Dulu sering bingung cari yang pas, sampai akhirnya nemu ini... 🥺",
        teks_lengkap: "Kalian wajib tau ini! Hidup jadi jauh lebih simpel. Klik icon keranjang di pojok kiri bawah buat dapetin diskon hari ini ya! 💖",
        hashtags: "#storytime #tipsaffiliate #keranjangkuning #fyp"
      }
    ],
    fallback: true
  });
});

// Vision AI Auto-Analyzer with Multimodal Google Gemini Vision
app.post('/api/analyze-uploaded-visuals', async (req, res) => {
  const { productImgBase64, modelImgBase64, locationImgBase64, currentTitle, targetType } = req.body;

  const keyToUse = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
    ? process.env.GEMINI_API_KEY
    : (readJson(DB_SETTINGS).geminiApiKey || 'AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw');

  const hasImage = (productImgBase64 && productImgBase64.includes('base64,')) ||
                   (modelImgBase64 && modelImgBase64.includes('base64,')) ||
                   (locationImgBase64 && locationImgBase64.includes('base64,'));

  if (hasImage) {
    try {
      const parts = [];
      let promptInstructions = `You are an expert Indonesian E-Commerce, Visual Director & Short-Form Video AI for TikTok Shop and Shopee.\n`;

      if (targetType === 'product' || (!targetType && productImgBase64)) {
        if (productImgBase64 && productImgBase64.includes('base64,')) {
          const match = productImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] }
            });
            promptInstructions += `This image is the PRODUCT. Read the text on packaging/bottle/box carefully. Identify the exact commercial Indonesian product name (e.g. 'Skintific 5X Ceramide Barrier Moisture Gel', 'TWS Earbuds Bluetooth Wireless ANC') and generate 2-3 key selling points / USP in Indonesian.\n`;
          }
        }
      } else if (targetType === 'model') {
        if (modelImgBase64 && modelImgBase64.includes('base64,')) {
          const match = modelImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] }
            });
            promptInstructions += `This image is the MODEL / TALENT. Describe this person's appearance, approximate age (e.g. 21-25yo), gender, Indonesian ethnicity look, clothing/outfit style, hairstyle, and makeup in concise detail for AI generation.\n`;
          }
        }
      } else if (targetType === 'location') {
        if (locationImgBase64 && locationImgBase64.includes('base64,')) {
          const match = locationImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] }
            });
            promptInstructions += `This image is the LOCATION / SETTING. Describe this room/environment, lighting (warm ambient, sunlight, bokeh), decor, and aesthetic vibe in English for generating high-end cinematic backgrounds.\n`;
          }
        }
      } else {
        if (productImgBase64 && productImgBase64.includes('base64,')) {
          const match = productImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) parts.push({ inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] } });
        }
        if (modelImgBase64 && modelImgBase64.includes('base64,')) {
          const match = modelImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) parts.push({ inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] } });
        }
        if (locationImgBase64 && locationImgBase64.includes('base64,')) {
          const match = locationImgBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) parts.push({ inlineData: { mimeType: match[1] || 'image/jpeg', data: match[2] } });
        }
        promptInstructions += `Identify product name, USP, model character description, and location setting.\n`;
      }

      promptInstructions += `Return a valid JSON object matching this schema:
{
  "suggestedTitle": "Exact commercial Indonesian product name",
  "suggestedUsp": "2-3 high-converting selling points / USP in Indonesian",
  "suggestedModel": "Description of the model character (Indonesian look, age, outfit, makeup)",
  "suggestedLocation": "Cinematic aesthetic background setting in English"
}`;

      parts.push({ text: promptInstructions });

      const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
      const visionRes = await fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      const visionData = await visionRes.json();
      if (visionData.candidates && visionData.candidates[0]?.content?.parts?.[0]?.text) {
        const parsed = JSON.parse(visionData.candidates[0].content.parts[0].text);
        return res.json({
          success: true,
          suggestedTitle: parsed.suggestedTitle || currentTitle || 'Produk Unggulan',
          suggestedUsp: parsed.suggestedUsp || 'Kualitas premium dengan performa terbaik untuk kebutuhan sehari-hari.',
          suggestedModel: parsed.suggestedModel || 'Indonesian Youth Talent, 22 tahun, gaya kasual modis trendy, ekspresi percaya diri.',
          suggestedLocation: parsed.suggestedLocation || 'Modern Minimalist Aesthetic Room with warm soft ambient lighting',
          analyzedFromVision: true
        });
      }
    } catch (visionErr) {
      console.error('Vision AI analysis error:', visionErr);
    }
  }

  // Fallback heuristic if no image or vision fails
  let inferredTitle = currentTitle || 'Smart Wireless Device';
  let inferredUsp = 'Desain ergonomis elegan, build quality premium, performa tinggi tahan lama, cocok untuk gaya hidup modern.';
  let inferredModel = 'Indonesian Youth Talent, 22 tahun, gaya kasual modis trendy, ekspresi percaya diri.';
  let inferredLocation = 'Modern Minimalist Aesthetic Room with warm soft ambient lighting';

  if (currentTitle) {
    const titleLower = currentTitle.toLowerCase();
    if (titleLower.includes('serum') || titleLower.includes('skin') || titleLower.includes('cream') || titleLower.includes('glow')) {
      inferredUsp = 'Formula konsentrat cepat meresap, mencerahkan kulit kusam seketika, melembapkan 24 jam tanpa lengket.';
      inferredModel = 'Indonesian Female Content Creator, 21 tahun, kulit glowing natural bersih, makeup fresh minimalis.';
      inferredLocation = 'Aesthetic Bright Bathroom / Vanity Mirror Studio with natural morning sunlight';
    } else if (titleLower.includes('earphone') || titleLower.includes('earbuds') || titleLower.includes('headphone') || titleLower.includes('tws')) {
      inferredUsp = 'Active Noise Cancellation 35dB hening total, Bass punchy nendang, baterai tahan 36 jam ultra awet.';
      inferredModel = 'Indonesian Trendsetter, 23 tahun, stylish streetwear outfit, ekspresi asyik menikmati musik.';
      inferredLocation = 'Modern Aesthetic Urban Coffee Shop with soft warm bokeh illumination';
    } else if (titleLower.includes('baju') || titleLower.includes('dress') || titleLower.includes('jaket') || titleLower.includes('hoodie') || titleLower.includes('kaos')) {
      inferredUsp = 'Bahan cotton premium adem anti gerah, jahitan rapi presisi standar distro, warna tidak mudah luntur.';
      inferredModel = 'Indonesian Fashion Model, postur proporsional elegan, pose OOTD natural percaya diri.';
      inferredLocation = 'Minimalist Concrete Studio & Outdoor Aesthetic City Street';
    } else if (titleLower.includes('tas') || titleLower.includes('bag') || titleLower.includes('sepatu') || titleLower.includes('shoes')) {
      inferredUsp = 'Material waterproof tahan air, kompartemen luas multifungsi, desain stylish cocok untuk kerja dan hangout.';
      inferredLocation = 'Contemporary Modern Office & Trendy Cafe Lounge';
    }
  }

  res.json({
    success: true,
    suggestedTitle: currentTitle || inferredTitle,
    suggestedUsp: inferredUsp,
    suggestedModel: inferredModel,
    suggestedLocation: inferredLocation
  });
});

// =========================================================================
// GEMINI AI GATEWAY CHAT STREAMING & PERSISTENT SESSIONS API
// =========================================================================
app.get('/api/chats', (req, res) => {
  try {
    const chats = readJson(DB_CHATS);
    res.json({ success: true, chats: chats.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)) });
  } catch(e) {
    res.json({ success: true, chats: [] });
  }
});

app.delete('/api/chats/:id', (req, res) => {
  try {
    const id = req.params.id;
    let chats = readJson(DB_CHATS);
    chats = chats.filter(c => c.id !== id);
    writeJson(DB_CHATS, chats);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, model = 'gemini-2.5-flash', chatId } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
  }

  // Prepare SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const modelId = model.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  // Find or create chat session in DB
  let chats = readJson(DB_CHATS);
  let activeChat = chats.find(c => c.id === chatId);
  const isNew = !activeChat;
  const currentId = activeChat ? activeChat.id : ('chat-' + Date.now());

  if (isNew) {
    activeChat = {
      id: currentId,
      title: message.slice(0, 32) + (message.length > 32 ? '...' : ''),
      model: modelId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    chats.unshift(activeChat);
  } else {
    activeChat.updatedAt = new Date().toISOString();
  }

  // Add User Message to History
  activeChat.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  // Prepare Contents Array for Multi-turn Gemini API
  const historyContents = activeChat.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  let accumulatedAiResponse = '';
  let activeKey = getActiveGeminiKey();
  let retryCount = 0;
  const maxRetries = Math.max(1, (readJson(DB_SETTINGS).geminiApiKeys || []).length);

  while (retryCount <= maxRetries) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse&key=${activeKey}`;

    try {
      const upstreamRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: historyContents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000
          }
        })
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        const isRateLimit = upstreamRes.status === 429 || upstreamRes.status === 403 || errText.includes('RESOURCE_EXHAUSTED') || errText.includes('Quota exceeded');
        
        if (isRateLimit && retryCount < maxRetries) {
          console.warn(`[Gemini Limit Hit] Rotating key from ${maskApiKey(activeKey)} (Attempt ${retryCount + 1}/${maxRetries})`);
          activeKey = rotateGeminiKeyOnLimit(activeKey);
          retryCount++;
          continue;
        }

        res.write(`data: ${JSON.stringify({ error: 'Gemini API Error: ' + errText })}\n\n`);
        res.end();
        return;
      }

      const reader = upstreamRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const rawJson = line.replace('data: ', '').trim();
              if (rawJson) {
                const parsed = JSON.parse(rawJson);
                if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
                  const textPart = parsed.candidates[0].content.parts[0].text;
                  accumulatedAiResponse += textPart;
                  res.write(`data: ${JSON.stringify({ chunk: textPart })}\n\n`);
                }
              }
            } catch(e) {}
          }
        }
      }

      // Save AI response to History
      activeChat.messages.push({
        role: 'assistant',
        content: accumulatedAiResponse,
        timestamp: new Date().toISOString()
      });
      writeJson(DB_CHATS, chats);

      res.write(`data: ${JSON.stringify({ done: true, chatId: currentId })}\n\n`);
      res.end();
      return;
    } catch(err) {
      if (retryCount < maxRetries) {
        activeKey = rotateGeminiKeyOnLimit(activeKey);
        retryCount++;
        continue;
      }
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
      return;
    }
  }
});


// =========================================================================
// GOOGLE AI STUDIO PRO (GEMINI) DIRECT GENERATION ENGINE (WITH AUTO-FAILOVER)
// =========================================================================
async function callGeminiPro(promptText, customKey) {
  let keyToUse = customKey || getActiveGeminiKey();
  const pool = getGeminiKeyPool();
  let maxAttempts = Math.max(1, pool.length);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        if ((response.status === 429 || response.status === 403 || errText.includes('RESOURCE_EXHAUSTED')) && attempt < maxAttempts - 1) {
          keyToUse = rotateGeminiKeyOnLimit(keyToUse);
          continue;
        }
        return null;
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const rawText = data.candidates[0].content.parts[0].text;
        return JSON.parse(rawText);
      }
      return null;
    } catch (err) {
      if (attempt < maxAttempts - 1) {
        keyToUse = rotateGeminiKeyOnLimit(keyToUse);
        continue;
      }
      console.error('Gemini Pro API call error:', err);
      return null;
    }
  }
  return null;
}

// AI STORYBOARD & SCENE GENERATOR API (HYPER-REALISTIC & CUSTOM USER INPUTS)
// =========================================================================
const handleGenerateStoryboard = async (req, res) => {
  const { 
    productTitle, 
    usp, 
    modelDescription, 
    locationSetting, 
    numScenes = 4, 
    promptsPerScene = 1,
    duration = 40,
    platform = 'TikTok / Reels (9:16)',
    videoEngine = 'Flux 8K / Kling AI'
  } = req.body;

  const totalDurationNum = 40;
  const sceneCount = 4;
  const perSceneDuration = 10;

  const modelText = modelDescription || 'Indonesian Female Content Creator, 22 years old, glowing natural skin, charming smile';
  const locationText = locationSetting || 'Aesthetic Modern Indonesian Coffee Shop, warm natural ambient bokeh lighting';
  const uspText = usp || 'Kualitas premium terlaris, formula unggulan terbukti viral.';
  const realismBoost = 'hyperrealistic commercial photograph, true-to-life 8k UHD resolution, authentic skin pores and micro-textures, natural soft daylight, subtle depth of field, captured on Sony A7R V with 50mm f/1.2 GM lens, color graded, cinematic film still, zero CGI, zero cartoon, raw authentic capture';

  const promptForGemini = `Kamu adalah AI storyboard artist & prompt engineer profesional. Buatkan storyboard untuk video pendek dengan tema produk: ${productTitle} (${uspText}).

ATURAN OUTPUT:
1. Buat TEPAT 4 scene (Scene 1, Scene 2, Scene 3, Scene 4), alur cerita berurutan logis (awal/hook - isi/problem-solution - klimaks/demonstrasi - penutup/CTA).
2. Untuk SETIAP scene, berikan dalam blok terpisah:
   a. Judul scene singkat
   b. Deskripsi visual (setting: ${locationText}, karakter: ${modelText}, aksi, ekspresi, pencahayaan, angle kamera)
   c. Voice Over (VO) — naskah narasi/dialog persuasif bahasa Indonesia, durasi bicara pas untuk 10 detik (sekitar 20-25 kata)
   d. Video Prompt — siap dipakai di AI video generator (Flow AI / Runway / Kling / Veo), termasuk gerakan kamera, transisi, format vertical 9:16, durasi 10 detik
3. WAJIB: Buat 1 (SATU) PROMPT GAMBAR STORYBOARD GABUNGAN — hanya SATU gambar dengan 4 panel susun vertikal (rasio 9:16, garis pembatas, label SCENE 1/2/3/4 di tiap panel), menggambarkan 4 scene secara konsisten visual dan pencahayaan.
4. Total durasi video: 40 detik (4 scene x 10 detik). Rasio aspek video & gambar: 9:16 vertical.

Return STRICT JSON formatted with this schema:
{
  "title": "${productTitle}",
  "totalDuration": 40,
  "hook": "Opening viral hook audio script in Indonesian (under 15 words)",
  "cta": "Closing CTA audio script in Indonesian (clear urgency, keranjang kuning)",
  "unifiedStoryboardImagePrompt": "A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom separated by clean borders labeled SCENE 1, SCENE 2, SCENE 3, SCENE 4, showing: Panel 1 (${productTitle} close up with ${modelText}), Panel 2 (${modelText} testing ${productTitle} in ${locationText}), Panel 3 (${productTitle} texture detail macro), Panel 4 (${modelText} smiling holding ${productTitle}), consistent cinematic photorealistic lighting, 8k resolution, aspect ratio 9:16 --ar 9:16",
  "formattedTextOutput": "=== STORYBOARD: ${productTitle} (Total durasi: 40 detik) ===\\n\\n>>> SCENE 1: Hook Pembuka (10 detik) <<<\\nDeskripsi: ...\\nVoice Over: \\"...\\"\\nVideo Prompt: ...\\n>>> END SCENE 1 <<<\\n\\n>>> SCENE 2: Masalah & Solusi (10 detik) <<<\\nDeskripsi: ...\\nVoice Over: \\"...\\"\\nVideo Prompt: ...\\n>>> END SCENE 2 <<<\\n\\n>>> SCENE 3: Demonstrasi Keunggulan (10 detik) <<<\\nDeskripsi: ...\\nVoice Over: \\"...\\"\\nVideo Prompt: ...\\n>>> END SCENE 3 <<<\\n\\n>>> SCENE 4: Call to Action (10 detik) <<<\\nDeskripsi: ...\\nVoice Over: \\"...\\"\\nVideo Prompt: ...\\n>>> END SCENE 4 <<<\\n\\n>>> IMAGE PROMPT STORYBOARD (1 gambar, 4 panel susun vertikal, aspect ratio 9:16) <<<\\n...\\n>>> END IMAGE PROMPT <<<",
  "scenes": [
    {
      "sceneNumber": 1,
      "shotType": "Scene 1: Hook Close-Up",
      "visualDescription": "Deskripsi visual detail setting ${locationText}, karakter ${modelText}, aksi, ekspresi, angle kamera",
      "voiceover": "Naskah voiceover bahasa Indonesia durasi 10 detik",
      "prompt": "Detailed English Flux 8K photography prompt for panel 1 featuring ${productTitle} and ${modelText} in ${locationText}",
      "videoPrompt": "Cinematic AI video generation prompt for Kling/Veo: camera movement, model holding ${productTitle}, 9:16 aspect ratio, 10s duration"
    }
  ]
}`;

  try {
    const aiResult = await callGeminiPro(promptForGemini);
    if (aiResult && aiResult.scenes && Array.isArray(aiResult.scenes) && aiResult.scenes.length > 0) {
      const unifiedImgPrompt = aiResult.unifiedStoryboardImagePrompt || `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom labeled SCENE 1, SCENE 2, SCENE 3, SCENE 4 showing ${productTitle} with ${modelText} in ${locationText}, aspect ratio 9:16, ${realismBoost}`;
      const unifiedImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(unifiedImgPrompt)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9999999)}&nologo=true`;

      const processedScenes = aiResult.scenes.slice(0, 4).map((sc, idx) => {
        const p1 = `${sc.prompt || `${productTitle} extreme macro close up held by ${modelText} at ${locationText}`}, aspect ratio 9:16, ${realismBoost}`;
        const p2 = `Medium action UGC commercial shot of ${modelText} enthusiastically testing and presenting ${productTitle} inside ${locationText}, authentic soft daylight, aspect ratio 9:16, ${realismBoost}`;
        const p3 = `45-degree high-end commercial texture showcase of ${productTitle} with bokeh lighting in ${locationText}, crisp details, aspect ratio 9:16, ${realismBoost}`;
        const p4 = `Lifestyle dynamic commercial portrait of ${modelText} proudly smiling and holding ${productTitle} in ${locationText}, 8k UHD, aspect ratio 9:16, ${realismBoost}`;

        const prompts = [p1, p2, p3, p4];
        const images = prompts.map((p, pIdx) => 
          `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9000000 + (idx * 10 + pIdx) * 10000)}&nologo=true`
        );

        return {
          sceneNumber: idx + 1,
          shotType: sc.shotType || `Scene ${idx + 1}`,
          durationSeconds: 10,
          aspectRatio: '9:16',
          visualDescription: sc.visualDescription || `Model memperlihatkan ${productTitle} di ${locationText}`,
          voiceover: sc.voiceover || `Lihat keunggulan ${productTitle} yang sangat praktis dan ${uspText}`,
          prompt: p1,
          videoPrompt: sc.videoPrompt || `Smooth slow motion camera movement of ${modelText} with ${productTitle} inside ${locationText}, vertical 9:16, 10s duration, 4k realistic footage`,
          promptsList: prompts,
          imagesList: images,
          imageUrl: images[0]
        };
      });

      // Pad to exactly 4 scenes if AI returned fewer
      while (processedScenes.length < 4) {
        const idx = processedScenes.length;
        const p1 = `Commercial portrait of ${modelText} with ${productTitle} in ${locationText}, aspect ratio 9:16, ${realismBoost}`;
        const p2 = `Close-up demonstration of ${productTitle} by ${modelText}, aspect ratio 9:16, ${realismBoost}`;
        const p3 = `Product angle showcase of ${productTitle} in ${locationText}, aspect ratio 9:16, ${realismBoost}`;
        const p4 = `Happy customer reaction holding ${productTitle}, aspect ratio 9:16, ${realismBoost}`;
        const prompts = [p1, p2, p3, p4];
        const images = prompts.map((p, pIdx) => 
          `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9000000 + (idx * 10 + pIdx) * 10000)}&nologo=true`
        );

        processedScenes.push({
          sceneNumber: idx + 1,
          shotType: `Scene ${idx + 1}: Closing Action`,
          durationSeconds: 10,
          aspectRatio: '9:16',
          visualDescription: `${modelText} tersenyum menunjukkan ${productTitle} di ${locationText}.`,
          voiceover: `Klik keranjang kuning sekarang mumpung promo diskon spesial masih ada!`,
          prompt: p1,
          videoPrompt: `Smooth push in camera move towards ${modelText} showing ${productTitle}, 9:16 vertical, 10s duration`,
          promptsList: prompts,
          imagesList: images,
          imageUrl: images[0]
        });
      }

      return res.json({
        title: `Affiliate: ${productTitle}`,
        platform: 'TikTok / Reels (9:16)',
        totalDuration: 40,
        modelDescription: modelText,
        locationSetting: locationText,
        hook: aiResult.hook || `Stop scrolling! Ini rahasia kenapa ${productTitle} viral banget!`,
        cta: aiResult.cta || 'Klik keranjang kuning sekarang mumpung diskon spesial!',
        unifiedStoryboardImagePrompt: unifiedImgPrompt,
        unifiedStoryboardImageUrl: unifiedImgUrl,
        formattedTextOutput: aiResult.formattedTextOutput || '',
        scenes: processedScenes,
        poweredBy: 'Antigravity AI (Gemini 2.5 Pro 4-Scene 16-Photo Director)'
      });
    }
  } catch (geminiError) {
    console.error('Gemini Pro generation fallback:', geminiError);
  }

  const continuousSceneTemplates = [
    {
      sceneNumber: 1,
      shotType: 'Scene 1: Hook Pembuka & Penemuan',
      visualDesc: `Scene 1 menampilkan 4 panel bertingkat: Panel 1 (${modelText} di ${locationText} mengalami masalah), Panel 2 (${modelText} berjalan mencari solusi), Panel 3 (${modelText} menemukan & memegang ${productTitle}), Panel 4 (${modelText} bersiap mencoba ${productTitle}).`,
      voiceover: `Stop scrolling! Kalau kamu lagi ngalamin masalah ini, kamu wajib kenal sama ${productTitle}!`,
      videoPrompt: `Sequential 4-action TikTok commercial flow: model sitting in ${locationText}, walking and searching, discovering ${productTitle}, and excitedly preparing to use it, 9:16 vertical, 10s duration`,
      panels: [
        { num: 1, title: 'Keadaan Awal', desc: `${modelText} sedang duduk di ${locationText} dengan ekspresi membutuhkan solusi.` },
        { num: 2, title: 'Aksi Berjalan', desc: `${modelText} berjalan melihat-lihat mencari produk yang tepat.` },
        { num: 3, title: 'Mempromosikan', desc: `${modelText} menemukan dan memegang ${productTitle} ke arah kamera dengan senyum kagum.` },
        { num: 4, title: 'Aksi Lanjutan', desc: `${modelText} bersiap membuka segel ${productTitle} menuju scene berikutnya.` }
      ],
      stripPrompt: `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom separated by crisp white border lines labeled 1, 2, 3, 4 showing sequential continuous action: Panel 1 (${modelText} sitting in ${locationText} needing solution), Panel 2 (${modelText} walking looking for solution), Panel 3 (${modelText} discovering and holding ${productTitle} excitedly), Panel 4 (${modelText} preparing to test ${productTitle}), aspect ratio 9:16, ${realismBoost}`
    },
    {
      sceneNumber: 2,
      shotType: 'Scene 2: Pemakaian & Reaksi Solusi (Bersambung dari Scene 1)',
      visualDesc: `Scene 2 bersambung: Panel 1 (${modelText} membuka & mengaplikasikan ${productTitle}), Panel 2 (${modelText} berjalan merasakan kenyamanan khasiat ${uspText}), Panel 3 (${modelText} mempromosikan hasil seketika), Panel 4 (${modelText} mengajak melihat tekstur di scene berikutnya).`,
      voiceover: `Pas pertama kali aku coba, bener-bener kaget sama hasilnya yang langsung ${uspText}!`,
      videoPrompt: `Sequential 4-action UGC flow: model unboxing and applying ${productTitle}, walking feeling the instant benefit, showing the instant radiant outcome to camera, and gesturing forward, 9:16 vertical, 10s duration`,
      panels: [
        { num: 1, title: 'Aksi Lanjutan Membuka', desc: `Bersambung dari Scene 1, ${modelText} membuka kemasan ${productTitle}.` },
        { num: 2, title: 'Aksi Menggunakan & Bergerak', desc: `${modelText} berjalan santai sambil menikmati manfaat ${productTitle}.` },
        { num: 3, title: 'Mempromosikan Hasil', desc: `${modelText} tersenyum memperlihatkan hasil instan ${productTitle} ke kamera.` },
        { num: 4, title: 'Aksi Lanjutan', desc: `${modelText} menunjuk meja untuk memperlihatkan tekstur di scene berikutnya.` }
      ],
      stripPrompt: `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom separated by crisp white border lines labeled 1, 2, 3, 4 showing sequential continuous action: Panel 1 (${modelText} applying ${productTitle}), Panel 2 (${modelText} walking feeling the instant benefits of ${uspText}), Panel 3 (${modelText} smiling showing radiant results to camera), Panel 4 (${modelText} gesturing towards product details), aspect ratio 9:16, ${realismBoost}`
    },
    {
      sceneNumber: 3,
      shotType: 'Scene 3: Uji Tekstur & Bukti Formula (Bersambung dari Scene 2)',
      visualDesc: `Scene 3 bersambung: Panel 1 (${modelText} menaruh ${productTitle} di meja estetik ${locationText}), Panel 2 (Kamera zoom-in makro menyorot tekstur & material premium ${productTitle}), Panel 3 (${modelText} memegang produk sambil menjelaskan ${uspText}), Panel 4 (${modelText} memberi jempol bersiap ajakan beli).`,
      voiceover: `Lihat tekstur dan kandungannya yang se-premium ini. Kualitasnya ${uspText} dan berasa mewah banget!`,
      videoPrompt: `Sequential 4-action demonstration: model placing ${productTitle} on aesthetic table, macro camera move on rich formula texture, model proudly holding product explaining benefits, model thumbs up, 9:16 vertical, 10s duration`,
      panels: [
        { num: 1, title: 'Aksi Menyiapkan Produk', desc: `Bersambung dari Scene 2, ${modelText} menaruh ${productTitle} di meja estetik.` },
        { num: 2, title: 'Aksi Kamera Makro', desc: `Kamera bergerak mendekat menyorot detail formula premium ${productTitle}.` },
        { num: 3, title: 'Mempromosikan Formula', desc: `${modelText} memegang produk sambil menjelaskan keunggulan ${uspText}.` },
        { num: 4, title: 'Aksi Lanjutan', desc: `${modelText} memberi acungan jempol dan bersiap mengajak beli di scene penutup.` }
      ],
      stripPrompt: `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom separated by crisp white border lines labeled 1, 2, 3, 4 showing sequential continuous action: Panel 1 (${productTitle} placed on table in ${locationText}), Panel 2 (extreme macro close up of ${productTitle} premium texture), Panel 3 (${modelText} explaining key benefits of ${uspText}), Panel 4 (${modelText} giving double thumbs up), aspect ratio 9:16, ${realismBoost}`
    },
    {
      sceneNumber: 4,
      shotType: 'Scene 4: Klimaks & Call to Action (Bersambung dari Scene 3)',
      visualDesc: `Scene 4 bersambung: Panel 1 (${modelText} berjalan percaya diri membawa ${productTitle}), Panel 2 (${modelText} menunjuk ke arah keranjang kuning di pojok bawah), Panel 3 (${modelText} mempromosikan diskon & promo gratis ongkir), Panel 4 (${modelText} melambaikan tangan menutup video).`,
      voiceover: `Yuk langsung checkout sekarang di keranjang kuning mumpung lagi ada promo diskon spesial!`,
      videoPrompt: `Sequential 4-action closing CTA flow: model confidently walking with ${productTitle}, pointing down to yellow shopping cart, showing product next to cheek with bright smile, waving goodbye, 9:16 vertical, 10s duration`,
      panels: [
        { num: 1, title: 'Aksi Kepuasan Berjalan', desc: `Bersambung dari Scene 3, ${modelText} berjalan santai dengan ekspresi sangat puas.` },
        { num: 2, title: 'Aksi Menunjuk Keranjang', desc: `${modelText} menunjuk ke arah pojok kiri bawah (keranjang kuning).` },
        { num: 3, title: 'Mempromosikan Promo', desc: `${modelText} memegang ${productTitle} di samping wajah dengan senyum memikat.` },
        { num: 4, title: 'Aksi Penutup', desc: `${modelText} melambaikan tangan dengan ${productTitle} tetap di genggaman.` }
      ],
      stripPrompt: `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom separated by crisp white border lines labeled 1, 2, 3, 4 showing sequential continuous action: Panel 1 (${modelText} walking happily with ${productTitle}), Panel 2 (${modelText} pointing down towards TikTok shopping cart), Panel 3 (${modelText} smiling holding ${productTitle} next to cheek promoting special discount), Panel 4 (${modelText} waving goodbye holding ${productTitle}), aspect ratio 9:16, ${realismBoost}`
    }
  ];

  const scenes = continuousSceneTemplates.map((template, idx) => {
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(template.stripPrompt)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9000000 + idx * 25000)}&nologo=true`;
    return {
      sceneNumber: template.sceneNumber,
      shotType: template.shotType,
      durationSeconds: 10,
      aspectRatio: '9:16',
      visualDescription: template.visualDesc,
      voiceover: template.voiceover,
      prompt: template.stripPrompt,
      videoPrompt: template.videoPrompt,
      panels: template.panels,
      promptsList: [template.stripPrompt],
      imagesList: [imgUrl],
      imageUrl: imgUrl
    };
  });

  const unifiedFallbackPrompt = `A single 9:16 vertical commercial storyboard sheet with 4 horizontal panels stacked vertically from top to bottom labeled SCENE 1, SCENE 2, SCENE 3, SCENE 4, showing: Panel 1 (${productTitle} macro hook), Panel 2 (${modelText} demonstrating solution), Panel 3 (${productTitle} premium texture in ${locationText}), Panel 4 (${modelText} happy holding ${productTitle}), aspect ratio 9:16, ${realismBoost}`;
  const unifiedFallbackImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(unifiedFallbackPrompt)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9999999)}&nologo=true`;

  const fallbackFormattedText = `=== STORYBOARD: ${productTitle} (Total durasi: 40 detik) ===\n\n` +
    scenes.map(s => `>>> ${s.shotType.toUpperCase()} (10 detik) <<<\nDeskripsi: ${s.visualDescription}\nVoice Over: "${s.voiceover}"\nVideo Prompt: ${s.videoPrompt}\n>>> END SCENE ${s.sceneNumber} <<<`).join('\n\n') +
    `\n\n>>> IMAGE PROMPT STORYBOARD (1 gambar, 4 panel susun vertikal, aspect ratio 9:16) <<<\n${unifiedFallbackPrompt}\n>>> END IMAGE PROMPT <<<`;

  res.json({
    title: `Affiliate: ${productTitle}`,
    platform: 'TikTok / Reels (9:16)',
    totalDuration: 40,
    modelDescription: modelText,
    locationSetting: locationText,
    hook: `Stop scrolling! Ini rahasia kenapa ${productTitle} viral banget!`,
    cta: `Klik keranjang kuning sekarang mumpung diskon spesial masih ada!`,
    unifiedStoryboardImagePrompt: unifiedFallbackPrompt,
    unifiedStoryboardImageUrl: unifiedFallbackImgUrl,
    formattedTextOutput: fallbackFormattedText,
    scenes: scenes,
    poweredBy: 'Native AI 4-Scene Continuous 4-Panel Strip Director'
  });
};

app.post('/api/generate-storyboard', handleGenerateStoryboard);
app.post('/api/generate-storyboard-ai', handleGenerateStoryboard);

// Standalone AI Image Generator
app.post('/api/generate-image', (req, res) => {
  const { prompt, width = 768, height = 1344, model = 'flux' } = req.body;
  const realismBoost = ', 8k resolution, raw authentic photography, sharp details, true-to-life textures, natural lighting, shot on 85mm lens';
  const fullPrompt = prompt + (prompt.includes('8k') ? '' : realismBoost);
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 999999)}&model=${model}&nologo=true`;

  res.json({
    imageUrl,
    prompt: fullPrompt,
    width,
    height,
    model
  });
});


// ==========================================
// FEATURE CONFIGURATION & SYSTEM STATUS API (SUPABASE SYNC)
// ==========================================
app.get('/api/admin/features-config', async (req, res) => {
  try {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data && data.feature_config) {
      return res.json({
        featureConfig: data.feature_config || {},
        vipActive: true,
        vipExpiresAt: null
      });
    }
  } catch (e) {}

  const settings = readJson(DB_SETTINGS);
  res.json({
    featureConfig: settings.featureConfig || {},
    vipActive: settings.vipActive || false,
    vipExpiresAt: settings.vipExpiresAt || null
  });
});

app.post('/api/admin/features-config', async (req, res) => {
  const { featureConfig, vipActive, vipDaysToAdd } = req.body;
  const settings = readJson(DB_SETTINGS);

  if (featureConfig) {
    settings.featureConfig = featureConfig;
  }
  if (typeof vipActive === 'boolean') {
    settings.vipActive = vipActive;
  }
  if (vipDaysToAdd) {
    settings.vipExpiresAt = new Date(Date.now() + parseInt(vipDaysToAdd) * 24 * 60 * 60 * 1000).toISOString();
  }

  try {
    await supabase.from('settings').upsert({
      id: 1,
      feature_config: featureConfig || settings.featureConfig,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Supabase featureConfig upsert error:', err);
  }

  writeJson(DB_SETTINGS, settings);
  res.json({ success: true, message: 'Konfigurasi fitur berhasil diperbarui!', settings });
});


// =========================================================================
// GOOGLE LABS FLOW AI AUTHENTICATED SESSION PROXY TUNNEL
// =========================================================================
app.get('/api/flow/session-cookies', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  const rawCookie = settings.googleFlowCookies || '';
  const parsedCookies = [];

  rawCookie.split(';').forEach(c => {
    const trimmed = c.trim();
    if (!trimmed) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const name = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      parsedCookies.push({ name, value });
    }
  });

  res.json({
    success: true,
    cookies: parsedCookies
  });
});

app.get('/api/flow/session-status', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  res.json({
    active: settings.googleFlowActive || false,
    hasCookies: !!settings.googleFlowCookies,
    targetUrl: 'https://labs.google/fx/id/tools/flow',
    accountName: 'kheireditz@gmail.com'
  });
});

app.post('/api/flow/tunnel-request', async (req, res) => {
  const { endpoint = '/fx/id/tools/flow', method = 'GET', bodyData = null } = req.body;
  const settings = readJson(DB_SETTINGS);
  const cookieToUse = settings.googleFlowCookies;

  if (!cookieToUse) {
    return res.status(401).json({ success: false, message: 'Cookie autentikasi Google Labs belum dikonfigurasi.' });
  }

  const targetUrl = endpoint.startsWith('http') ? endpoint : `https://labs.google${endpoint}`;

  try {
    const fetchOptions = {
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Cookie': cookieToUse,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': 'https://labs.google/'
      }
    };

    if (bodyData && method !== 'GET') {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(bodyData);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json({ success: true, status: response.status, data: data });
    } else {
      const text = await response.text();
      return res.json({ success: true, status: response.status, rawLength: text.length });
    }
  } catch (err) {
    console.error('Flow tunnel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================================
// CUSTOM SERVER MANAGEMENT APIS FOR FLOATING HUB
// =========================================================================
app.get('/api/floating-servers', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  const defaultServers = [
    { id: 'srv-1', name: 'Server 1 (Flow AI)', url: 'https://labs.google/fx/id/tools/flow', description: 'Google Labs Flow AI - Sesi login aktif terhubung' },
    { id: 'srv-2', name: 'Server 2 (Studio Pro)', url: 'https://aistudio.google.com/', description: 'Google AI Studio Pro Cloud Workspace' },
    { id: 'srv-3', name: 'Server 3 (Flux Video)', url: 'https://pollinations.ai/', description: 'High-Performance 8K Video & Visual Engine' }
  ];

  res.json({
    enabled: settings.floatingHubEnabled !== undefined ? settings.floatingHubEnabled : true,
    servers: settings.customServers && settings.customServers.length > 0 ? settings.customServers : defaultServers
  });
});

app.post('/api/floating-servers', (req, res) => {
  const { enabled, servers } = req.body;
  const settings = readJson(DB_SETTINGS);

  if (enabled !== undefined) settings.floatingHubEnabled = enabled;
  if (servers && Array.isArray(servers)) settings.customServers = servers;

  writeJson(DB_SETTINGS, settings);
  res.json({ success: true, enabled: settings.floatingHubEnabled, servers: settings.customServers });
});


// =========================================================================
// =========================================================================

// =========================================================================
// FULL GOOGLE LABS FLOW AI REVERSE PROXY & DIRECT COOKIE HANDSHAKE
// =========================================================================
// =========================================================================
// GOOGLE LABS FLOW AI FULL REVERSE PROXY & COOKIE AUTO-INJECTOR ENGINE
// =========================================================================
async function handleFlowProxyRequest(req, res, customPath = null) {
  const settings = readJson(DB_SETTINGS);
  const cookieToUse = settings.googleFlowCookies;

  if (!cookieToUse) {
    return res.status(401).send('<h3>Cookie akun Google Labs Flow belum disetel di pengaturan server.</h3>');
  }

  let subPath = customPath || req.originalUrl || req.url;
  if (subPath.startsWith('/flow-proxy')) {
    subPath = subPath.replace(/^\/flow-proxy/, '');
  }
  if (!subPath || subPath === '/' || subPath === '') {
    subPath = '/fx/id/tools/flow';
  }

  // Intercept Next-Auth session check to always return active authenticated session
  if (subPath.includes('/api/auth/session')) {
    return res.json({
      user: {
        name: "Kheir Editz VIP",
        email: "kheireditzsupport@gmail.com",
        image: "https://lh3.googleusercontent.com/a/default-user=s96-c"
      },
      expires: "2027-12-31T23:59:59.999Z"
    });
  }

  const targetUrl = `https://labs.google${subPath}`;

  try {
    const forwardHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Cookie': cookieToUse,
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://labs.google/fx/id/tools/flow',
      'Origin': 'https://labs.google',
      'Sec-Fetch-Dest': req.headers['sec-fetch-dest'] || 'empty',
      'Sec-Fetch-Mode': req.headers['sec-fetch-mode'] || 'cors',
      'Sec-Fetch-Site': 'same-origin'
    };

    if (req.headers['content-type']) {
      forwardHeaders['Content-Type'] = req.headers['content-type'];
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
      redirect: 'follow'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Set permissive proxy response headers
    res.status(response.status);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');

    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Inject authenticated user session directly into Next.js pageProps JSON payload
      html = html.replace(
        '"pageProps":{"session":null',
        '"pageProps":{"session":{"user":{"name":"Kheir Editz VIP","email":"kheireditzsupport@gmail.com","image":"https://lh3.googleusercontent.com/a/default-user=s96-c"},"expires":"2027-12-31T23:59:59.999Z"}'
      );

      // Inject Client-Side Google Auth Layer Interceptor
      const authInjectionScript = `
<script>
(function() {
  window.__GOOGLE_FLOW_SESSION_ACTIVE__ = true;
  window.__NEXT_AUTH_USER__ = {
    name: "Kheir Editz VIP",
    email: "kheireditzsupport@gmail.com"
  };
  
  // Intercept window.fetch to attach Google Authentication & Session Headers
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    let [resource, config] = args;
    config = config || {};
    config.headers = config.headers || {};

    if (typeof resource === 'string' && (resource.includes('google') || resource.includes('/fx/api/'))) {
      if (config.headers instanceof Headers) {
        config.headers.set('X-Goog-AuthUser', '0');
        config.headers.set('X-Requested-With', 'XMLHttpRequest');
      } else {
        config.headers['X-Goog-AuthUser'] = '0';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
      }
      config.credentials = 'include';
    }
    return originalFetch(resource, config);
  };
})();
</script>
`;

      // Inject base href and client auth interceptor script
      html = html.replace(
        '<head>',
        '<head>\n<base href="https://labs.google/">\n' + authInjectionScript + '\n<style>#gb, header .sign-in-btn, a[href*="accounts.google.com"], [data-testid="signin-button"] { display: none !important; }</style>'
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } else if (contentType.includes('application/json')) {
      const json = await response.json();
      return res.json(json);
    } else {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      return res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.error('Flow proxy execution error:', err);
    res.status(500).send('<h3>Gagal memuat proxy Google Labs Flow AI: ' + err.message + '</h3>');
  }
}

app.all('/flow-proxy', (req, res) => handleFlowProxyRequest(req, res));
app.all('/flow-proxy/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/fx/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/api/auth/session', (req, res) => handleFlowProxyRequest(req, res));
app.all('/api/fx/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/_next/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/flow-live', (req, res) => handleFlowProxyRequest(req, res));
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("AFFILIATE_AI_STUDIO_SERVER_RUNNING_ON_PORT_" + PORT);
  });
}

export default app;
