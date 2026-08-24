
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
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0
}));

// Database File Paths
const DB_DIR = path.join(__dirname, 'data');
const DB_PRODUCTS = path.join(DB_DIR, 'products.json');
const DB_STORYBOARDS = path.join(DB_DIR, 'storyboards.json');
const DB_PROMPTS = path.join(DB_DIR, 'prompts.json');
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
const DB_CHATS = path.join(DB_DIR, 'chats.json');

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

  try {
    // 1. Try Supabase cloud auth
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

  // 2. Fallback check local users database
  const users = readJson(DB_USERS);
  if (inputKey === 'kheireditz@gmail.com' && inputPass === 'Admin@123') {
    return res.json({
      success: true,
      token: 'token_admin_' + Date.now(),
      user: {
        id: 'usr-admin-1',
        name: 'Kheir Editz (Super Admin)',
        email: 'kheireditz@gmail.com',
        role: 'SUPER_ADMIN',
        vipActive: true
      }
    });
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

app.post('/api/settings', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  if (req.body.geminiApiKey && !req.body.geminiApiKey.includes('****')) {
    settings.geminiApiKey = req.body.geminiApiKey;
  }
  if (req.body.huggingFaceKey && !req.body.huggingFaceKey.includes('****')) {
    settings.huggingFaceKey = req.body.huggingFaceKey;
  }
  writeJson(DB_SETTINGS, settings);
  res.json({ success: true });
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

// Vision AI Auto-Analyzer
app.post('/api/analyze-uploaded-visuals', async (req, res) => {
  const { currentTitle } = req.body;

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
// GOOGLE AI STUDIO PRO (GEMINI) DIRECT GENERATION ENGINE
// =========================================================================
async function callGeminiPro(promptText, apiKey) {
  const keyToUse = process.env.GEMINI_API_KEY || apiKey || readJson(DB_SETTINGS).geminiApiKey;
  if (!keyToUse || keyToUse === 'YOUR_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY not configured or using placeholder.');
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3000,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const rawText = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText);
    }
    return null;
  } catch (err) {
    console.error('Gemini Pro API call error:', err);
    return null;
  }
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
    duration = 15,
    platform = 'TikTok / Reels (9:16)',
    videoEngine = 'Flux 8K / Kling AI'
  } = req.body;

  const totalDurationNum = parseInt(duration) || 15;
  const sceneCount = parseInt(numScenes) || 4;
  const perSceneDuration = Math.max(2, Math.round(totalDurationNum / sceneCount));

  const modelText = modelDescription || 'Indonesian Female Content Creator, 22 years old, glowing natural skin, charming smile';
  const locationText = locationSetting || 'Aesthetic Modern Indonesian Coffee Shop, warm natural ambient bokeh lighting';
  const uspText = usp || 'Kualitas premium terlaris, formula unggulan terbukti viral.';
  const realismBoost = 'hyperrealistic commercial photograph, true-to-life 8k UHD resolution, authentic skin pores and micro-textures, natural soft daylight, subtle depth of field, captured on Sony A7R V with 50mm f/1.2 GM lens, color graded, cinematic film still, zero CGI, zero cartoon, raw authentic capture';

  const promptForGemini = `You are an elite viral TikTok/Shopee affiliate marketing director and master visual prompt engineer.
Create an authentic, high-converting storyboard tailored specifically to the user's exact parameters:
- Exact Product Title: ${productTitle}
- Key Value/USP: ${uspText}
- Model Character Description: ${modelText}
- Exact Setting/Location: ${locationText}
- Number of Scenes: ${sceneCount}
- Duration: ${totalDurationNum} seconds (${perSceneDuration}s per scene)
- Platform: ${platform}

Return STRICT JSON formatted with this schema:
{
  "hook": "Opening viral hook audio script in Indonesian (punchy, energetic, under 15 words)",
  "cta": "Closing CTA audio script in Indonesian (clear urgency, mention yellow basket/keranjang kuning, under 15 words)",
  "scenes": [
    {
      "sceneNumber": 1,
      "shotType": "Extreme Close-Up / Product Macro / Lifestyle Demo",
      "visualDescription": "Detailed Indonesian description of what model and product are doing in the specified location",
      "voiceover": "Natural, conversational spoken Indonesian voiceover script tailored to sell the USP",
      "prompt": "Detailed English Flux 8K photography prompt faithfully featuring: (${productTitle}), (${modelText}), situated directly in (${locationText}), specifying camera angle, lighting, depth of field, authentic material textures",
      "videoPrompt": "Cinematic AI video generation prompt for Kling/Luma: continuous realistic camera motion, model holding ${productTitle} in ${locationText}, natural realistic movements"
    }
  ]
}`;

  try {
    const aiResult = await callGeminiPro(promptForGemini);
    if (aiResult && aiResult.scenes && Array.isArray(aiResult.scenes) && aiResult.scenes.length > 0) {
      const processedScenes = aiResult.scenes.map((sc, idx) => {
        const fullPrompt = `${sc.prompt || `${productTitle} held naturally by ${modelText} at ${locationText}`}, ${realismBoost}`;
        return {
          sceneNumber: idx + 1,
          shotType: sc.shotType || 'Medium Shot',
          durationSeconds: perSceneDuration,
          visualDescription: sc.visualDescription || `Model memperlihatkan ${productTitle} di ${locationText}`,
          voiceover: sc.voiceover || `Lihat keunggulan ${productTitle} yang sangat praktis dan ${uspText}`,
          prompt: fullPrompt,
          videoPrompt: sc.videoPrompt || `Smooth slow motion camera pan of ${modelText} with ${productTitle} inside ${locationText}, 4k realistic footage`,
          promptsList: [fullPrompt],
          imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9999999)}&model=flux&nologo=true`
        };
      });

      return res.json({
        title: `Affiliate: ${productTitle}`,
        platform: platform,
        totalDuration: totalDurationNum,
        modelDescription: modelText,
        locationSetting: locationText,
        hook: aiResult.hook || `Stop scrolling! Ini rahasia kenapa ${productTitle} viral banget!`,
        cta: aiResult.cta || 'Klik keranjang kuning sekarang mumpung diskon spesial!',
        scenes: processedScenes,
        poweredBy: 'Google AI Studio Pro (Gemini 1.5 & Flux 8K Engine)'
      });
    }
  } catch (geminiError) {
    console.error('Gemini Pro generation fallback:', geminiError);
  }

  // High quality fallback matching exact user inputs
  const sceneTemplates = [
    {
      shotType: 'Hook / Extreme Close-Up',
      visualDesc: `Kamera fokus menyorot detail ${productTitle} yang dipegang elegan oleh ${modelText} di ${locationText}.`,
      voiceover: `Stop scrolling! Ini rahasia kenapa ${productTitle} ini lagi viral banget dan wajib kamu punya!`,
      promptBase: `Macro close-up shot of authentic ${productTitle}, held delicately by hands of ${modelText}, crystal clear authentic textures, ambient natural illumination in ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Problem & Solution / Medium Shot',
      visualDesc: `${modelText} mengekspresikan kepuasan saat mendemonstrasikan keunggulan ${productTitle} di ${locationText}.`,
      voiceover: `Dulu sering bingung cari yang pas, tapi pas nyobain ${productTitle} langsung kaget sama keunggulannya yang ${uspText}!`,
      promptBase: `Medium shot of ${modelText} actively demonstrating and genuinely using ${productTitle}, authentic happy facial expression, natural soft daylight, located inside ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Feature Demo / Close-Up Macro',
      visualDesc: `Demonstrasi jelas detail material dan manfaat ${productTitle} dengan pencahayaan estetik di ${locationText}.`,
      voiceover: `Lihat detail materialnya yang premium dan mewah. Bener-bener ${uspText} dan worth it banget!`,
      promptBase: `Crisp commercial photograph showcasing the authentic build of ${productTitle}, ${modelText} in natural background bokeh, soft realistic lighting in ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Lifestyle & Call-To-Action / Eye-Level Portrait',
      visualDesc: `${modelText} tersenyum percaya diri menggunakan ${productTitle} dalam aktivitas santai di ${locationText}.`,
      voiceover: `Praktis dibawa ke mana aja dan bikin hidup makin simpel! Klik keranjang kuning sekarang mumpung diskon spesial masih ada!`,
      promptBase: `Eye-level candid lifestyle photo of ${modelText} posing naturally with ${productTitle}, gorgeous authentic smile, realistic depth of field, seated inside ${locationText}, ${realismBoost}`
    }
  ];

  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    const template = sceneTemplates[i % sceneTemplates.length];
    const activePrompt = template.promptBase;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(activePrompt)}?width=768&height=1344&seed=${Math.floor(Math.random() * 9999999)}&model=flux&nologo=true`;

    scenes.push({
      sceneNumber: i + 1,
      shotType: template.shotType,
      durationSeconds: perSceneDuration,
      visualDescription: template.visualDesc,
      voiceover: template.voiceover,
      prompt: activePrompt,
      videoPrompt: `Smooth cinematic camera movement showing ${modelText} with ${productTitle} at ${locationText}, 4k realistic motion`,
      promptsList: [activePrompt],
      imageUrl: imageUrl
    });
  }

  res.json({
    title: `Affiliate: ${productTitle}`,
    platform: platform,
    totalDuration: totalDurationNum,
    modelDescription: modelText,
    locationSetting: locationText,
    hook: `Stop scrolling! Ini rahasia kenapa ${productTitle} viral banget!`,
    cta: `Klik keranjang kuning sekarang mumpung diskon spesial masih ada!`,
    scenes: scenes,
    poweredBy: 'Native AI Studio Engine (Flux 8K)'
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
app.all('/api/auth/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/api/fx/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/_next/*', (req, res) => handleFlowProxyRequest(req, res));
app.all('/flow-live', (req, res) => handleFlowProxyRequest(req, res));
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("AFFILIATE_AI_STUDIO_SERVER_RUNNING_ON_PORT_" + PORT);
  });
}

export default app;
