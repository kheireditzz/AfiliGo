
// =========================================================================
// SUPABASE CLIENT INITIALIZATION & CLOUD PERSISTENCE
// =========================================================================
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(cors());
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

initFile(DB_USERS, [
  {
    id: 'usr-admin-1',
    name: 'Kheir Editz (Super Admin)',
    email: 'kheireditz@gmail.com',
    username: 'kheireditz@gmail.com',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    vipActive: true,
    createdAt: new Date().toISOString()
  }
]);

// ==========================================
// PUBLIC AUTHENTICATION (LOGIN & DAFTAR / REGISTER)
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Harap isi nama, email, dan password!' });
  }

  const users = readJson(DB_USERS);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar! Silakan login.' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    username: normalizedEmail,
    password: password.trim(),
    role: 'USER',
    vipActive: false,
    vipExpiresAt: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJson(DB_USERS, users);

  res.status(201).json({
    success: true,
    token: 'token_' + Date.now(),
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      vipActive: newUser.vipActive
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Harap masukkan email dan password!' });
  }

  const inputKey = username.trim().toLowerCase();
  const inputPass = password.trim();

  const users = readJson(DB_USERS);
  
  // Check users database or fallback admin
  const user = users.find(u => (u.email && u.email.toLowerCase() === inputKey) || (u.username && u.username.toLowerCase() === inputKey));

  if (user && user.password === inputPass) {
    return res.json({
      success: true,
      token: 'token_' + Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vipActive: user.role === 'SUPER_ADMIN' ? true : (user.vipActive || false)
      }
    });
  }

  // Backup check for kheireditz@gmail.com
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
// DASHBOARD STATS API
// ==========================================
app.get('/api/dashboard/stats', (req, res) => {
  const products = readJson(DB_PRODUCTS);
  const storyboards = readJson(DB_STORYBOARDS);
  const prompts = readJson(DB_PROMPTS);

  let totalScenes = 0;
  storyboards.forEach(sb => {
    if (sb.scenes && Array.isArray(sb.scenes)) {
      totalScenes += sb.scenes.length;
    }
  });

  res.json({
    totalProducts: products.length,
    totalStoryboards: storyboards.length,
    totalScenes: totalScenes,
    totalPrompts: prompts.length,
    recentStoryboards: storyboards.slice(-4).reverse()
  });
});

// ==========================================
// PRODUCTS CRUD APIs
// ==========================================
app.get('/api/products', (req, res) => {
  res.json(readJson(DB_PRODUCTS));
});

app.post('/api/products', (req, res) => {
  const products = readJson(DB_PRODUCTS);
  const newProduct = {
    id: 'prod-' + Date.now(),
    title: req.body.title || 'Produk Baru',
    category: req.body.category || 'Umum',
    price: Number(req.body.price) || 0,
    commissionRate: Number(req.body.commissionRate) || 10,
    targetMarket: req.body.targetMarket || '',
    usp: req.body.usp || '',
    affiliateLink: req.body.affiliateLink || ''
  };
  products.unshift(newProduct);
  writeJson(DB_PRODUCTS, products);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  let products = readJson(DB_PRODUCTS);
  products = products.filter(p => p.id !== req.params.id);
  writeJson(DB_PRODUCTS, products);
  res.json({ success: true });
});

// ==========================================
// STORYBOARDS CRUD APIs
// ==========================================
app.get('/api/storyboards', (req, res) => {
  res.json(readJson(DB_STORYBOARDS));
});

app.post('/api/storyboards', (req, res) => {
  const storyboards = readJson(DB_STORYBOARDS);
  const sb = req.body;
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

app.delete('/api/storyboards/:id', (req, res) => {
  let storyboards = readJson(DB_STORYBOARDS);
  storyboards = storyboards.filter(s => s.id !== req.params.id);
  writeJson(DB_STORYBOARDS, storyboards);
  res.json({ success: true });
});

// ==========================================
// PROMPTS CRUD APIs
// ==========================================
app.get('/api/prompts', (req, res) => {
  res.json(readJson(DB_PROMPTS));
});

app.post('/api/prompts', (req, res) => {
  const prompts = readJson(DB_PROMPTS);
  const newPrompt = {
    id: 'prompt-' + Date.now(),
    title: req.body.title || 'Prompt Baru',
    category: req.body.category || 'General',
    aspectRatio: req.body.aspectRatio || '9:16',
    prompt: req.body.prompt || ''
  };
  prompts.unshift(newPrompt);
  writeJson(DB_PROMPTS, prompts);
  res.status(201).json(newPrompt);
});

app.delete('/api/prompts/:id', (req, res) => {
  let prompts = readJson(DB_PROMPTS);
  prompts = prompts.filter(p => p.id !== req.params.id);
  writeJson(DB_PROMPTS, prompts);
  res.json({ success: true });
});

// ==========================================
// SETTINGS APIs
// ==========================================
app.get('/api/settings', (req, res) => {
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
// DONGTUBE VIP PAYMENT GATEWAY (RP 25.000)
// ==========================================
const DONGTUBE_API_KEY = 'DONGTUBE_20a06f2ab35b44ac';
const DONGTUBE_BASE_URL = 'https://payment.dongtube.cyou';
const VIP_PRICE = 25000;

app.post('/api/vip/create-invoice', async (req, res) => {
  try {
    const url = `${DONGTUBE_BASE_URL}/api/v1/invoice?apikey=${DONGTUBE_API_KEY}&amount=${VIP_PRICE}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.success) {
      let qrisImg = data.qris_image;
      if (qrisImg && qrisImg.startsWith('/')) {
        qrisImg = DONGTUBE_BASE_URL + qrisImg;
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

app.get('/api/vip/check-status/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const url = `${DONGTUBE_BASE_URL}/api/v1/invoice/status?apikey=${DONGTUBE_API_KEY}&invoice_id=${invoiceId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.status) {
      if (data.status === 'paid') {
        const settings = readJson(DB_SETTINGS);
        settings.vipActive = true;
        // Sets dynamic 30-day expiry date
        settings.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
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
  const keyToUse = apiKey || readJson(DB_SETTINGS).geminiApiKey || 'YOUR_GEMINI_API_KEY';
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
          maxOutputTokens: 2048,
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

// Storyboard Generation AI
app.post('/api/generate-storyboard-ai', async (req, res) => {
  const { 
    productTitle, 
    usp, 
    modelDescription, 
    locationSetting, 
    numScenes = 4, 
    promptsPerScene = 1,
    duration = 15,
    platform = 'TikTok / Reels (9:16)' 
  } = req.body;

  const totalDurationNum = parseInt(duration) || 15;
  const sceneCount = parseInt(numScenes) || 4;
  const perSceneDuration = Math.max(2, Math.round(totalDurationNum / sceneCount));

  const modelText = modelDescription || 'Indonesian Female Content Creator, 22 years old, glowing natural look, authentic skin texture';
  const locationText = locationSetting || 'Modern Aesthetic Indonesian Cafe with warm ambient bokeh lighting';
  const uspText = usp || 'Kualitas premium terlaris, harga promo spesial hari ini.';
  const realismBoost = 'hyperrealistic authentic commercial photography, shot on Sony A7R V with 50mm f/1.2 lens, natural authentic lighting, true-to-life skin textures and authentic material details, subtle depth of field, 8k UHD, crisp sharpness, color graded, no cartoon, no CGI artifacts';

  const settings = readJson(DB_SETTINGS);
  const activeApiKey = settings.geminiApiKey || 'YOUR_GEMINI_API_KEY';

  // Attempt Google AI Studio Pro Gemini Generation
  const promptForGemini = `You are an expert viral TikTok/Shopee affiliate marketing director and AI photography prompt engineer.
Create a high-converting affiliate storyboard breakdown for:
- Product: ${productTitle}
- USP / Keunggulan: ${uspText}
- Model Character: ${modelText}
- Setting / Location: ${locationText}
- Scene Count: ${sceneCount}
- Duration: ${totalDurationNum} seconds (${perSceneDuration}s per scene)
- Platform: ${platform}

Return STRICT JSON formatted with this schema:
{
  "hook": "Opening viral hook script in Indonesian (under 15 words)",
  "cta": "Closing CTA script in Indonesian (under 15 words)",
  "scenes": [
    {
      "sceneNumber": 1,
      "shotType": "Extreme Close-Up Shot",
      "visualDescription": "Indonesian description of model and product action",
      "voiceover": "Indonesian spoken audio script for this scene",
      "prompt": "Detailed English Flux 8K photography prompt with lighting, camera lens and realism"
    }
  ]
}`;

  try {
    const aiResult = await callGeminiPro(promptForGemini, activeApiKey);
    if (aiResult && aiResult.scenes && Array.isArray(aiResult.scenes) && aiResult.scenes.length > 0) {
      const processedScenes = aiResult.scenes.map((sc, idx) => {
        const fullPrompt = (sc.prompt || '') + ', ' + realismBoost;
        return {
          sceneNumber: idx + 1,
          shotType: sc.shotType || 'Medium Shot',
          durationSeconds: perSceneDuration,
          visualDescription: sc.visualDescription || `Model berinteraksi dengan ${productTitle}`,
          voiceover: sc.voiceover || '',
          prompt: fullPrompt,
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
        hook: aiResult.hook || 'Jangan beli sebelum nonton ini!',
        cta: aiResult.cta || 'Klik keranjang kuning sekarang!',
        scenes: processedScenes,
        poweredBy: 'Google AI Studio Pro (Gemini)'
      });
    }
  } catch (geminiError) {
    console.error('Gemini Pro fallback to internal engine:', geminiError);
  }

  // Fallback Engine if AI Studio API quota/limit
  const sceneTemplates = [
    {
      shotType: 'Hook / Extreme Close-Up',
      visualDesc: `Kamera fokus menyorot detail ${productTitle} yang dipegang elegan oleh model di ${locationText}.`,
      voiceover: `Stop scrolling! Ini rahasia kenapa ${productTitle} ini lagi viral banget dan sold out di mana-mana!`,
      promptBase: `Extreme macro close-up product shot of authentic ${productTitle}, held delicately by hands of ${modelText}, crystal clear authentic textures, ambient natural illumination in ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Problem & Solution / Medium Shot',
      visualDesc: `Model mengekspresikan kekaguman saat mencoba langsung fitur unggulan ${productTitle}.`,
      voiceover: `Dulu sering kecewa sama produk biasa, tapi pas nyobain ini langsung kaget sama keunggulannya yang ${uspText}!`,
      promptBase: `Medium shot of ${modelText} actively demonstrating and genuinely using ${productTitle}, authentic happy facial expression, natural soft shadows, located inside ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Feature Demo / Close-Up Macro',
      visualDesc: `Demonstrasi jelas cara kerja produk yang praktis dengan pencahayaan estetik natural.`,
      voiceover: `Lihat detail materialnya yang premium dan mewah. Bener-bener worth it banget untuk pemakaian sehari-hari.`,
      promptBase: `Crisp commercial close-up photograph showcasing the premium build of ${productTitle} in action, ${modelText} in background bokeh, authentic soft lighting, ${locationText}, ${realismBoost}`
    },
    {
      shotType: 'Lifestyle / Eye-Level Portrait',
      visualDesc: `Model tersenyum puas menggunakan produk dalam aktivitas santai di lokasi.`,
      voiceover: `Praktis dibawa ke mana aja dan bikin hidup jauh lebih simpel dan percaya diri! Klik keranjang kuning sekarang mumpung diskon spesial masih ada!`,
      promptBase: `Eye-level authentic candid lifestyle photo of ${modelText} posing naturally with ${productTitle}, gorgeous natural smile, realistic depth of field, seated in ${locationText}, ${realismBoost}`
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
    hook: `Jangan beli sebelum nonton ini sampai habis!`,
    cta: `Klik keranjang kuning sekarang mumpung diskon 50%!`,
    scenes: scenes,
    poweredBy: 'Native AI Studio Engine'
  });
});

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
// FEATURE CONFIGURATION & SYSTEM STATUS API
// ==========================================
app.get('/api/admin/features-config', (req, res) => {
  const settings = readJson(DB_SETTINGS);
  res.json({
    featureConfig: settings.featureConfig || {},
    vipActive: settings.vipActive || false,
    vipExpiresAt: settings.vipExpiresAt || null
  });
});

app.post('/api/admin/features-config', (req, res) => {
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

  writeJson(DB_SETTINGS, settings);
  res.json({ success: true, message: 'Konfigurasi fitur berhasil diperbarui!', settings });
});


// =========================================================================
// GOOGLE LABS FLOW AI AUTHENTICATED SESSION PROXY TUNNEL
// =========================================================================
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
app.use('/flow-proxy', async (req, res) => {
  const settings = readJson(DB_SETTINGS);
  const cookieToUse = settings.googleFlowCookies;

  const targetPath = req.url === '/' ? '/fx/id/tools/flow' : req.url;
  const targetUrl = `https://labs.google${targetPath}`;

  try {
    const forwardHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Cookie': cookieToUse || '',
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://labs.google/fx/id/tools/flow',
      'Origin': 'https://labs.google'
    };

    if (req.headers['content-type']) {
      forwardHeaders['Content-Type'] = req.headers['content-type'];
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Forward status
    res.status(response.status);

    // Set permissive CORS and allow browser nesting
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');

    if (contentType.includes('text/html')) {
      let html = await response.text();
      // Inject base href so all sub-requests route through our proxy
      html = html.replace(
        '<head>',
        '<head>\n<base href="https://labs.google/">'
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
    console.error('Flow proxy error:', err);
    res.status(500).send('<h3>Gagal menghubungkan ke Google Labs Flow AI. Silakan coba kembali.</h3>');
  }
});

// GOOGLE LABS FLOW AI LIVE PROXY WEB STREAM & COOKIE INJECTION BRIDGE
// =========================================================================
app.get('/flow-live', async (req, res) => {
  const settings = readJson(DB_SETTINGS);
  const cookieToUse = settings.googleFlowCookies;

  if (!cookieToUse) {
    return res.status(401).send('<h3>Cookie akun Google Labs Flow belum disetel di pengaturan server.</h3>');
  }

  try {
    const response = await fetch('https://labs.google/fx/id/tools/flow', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Cookie': cookieToUse,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://labs.google/'
      }
    });

    let html = await response.text();

    // Replace the Login/Sign-In prompt dynamically with Authorized Workspace Header
    html = html.replace(
      '</head>',
      '<base href="https://labs.google/">\n<style>#gb, header .sign-in-btn, a[href*="accounts.google.com"] { display: none !important; }</style>\n</head>'
    );

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Flow live proxy error:', err);
    res.status(500).send('<h3>Gagal memuat Google Labs Flow AI melalui sesi proxy. Silakan coba lagi.</h3>');
  }
});
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("AFFILIATE_AI_STUDIO_SERVER_RUNNING_ON_PORT_" + PORT);
  });
}

export default app;
