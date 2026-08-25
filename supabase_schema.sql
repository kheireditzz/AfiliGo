-- =========================================================================
-- AFFILIATEGO COMPLETE SUPABASE SQL SCHEMA (POSTGRESQL)
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'USER',
  vip_active BOOLEAN DEFAULT false,
  vip_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  gemini_api_key TEXT,
  huggingface_key TEXT,
  google_flow_cookies TEXT,
  google_flow_active BOOLEAN DEFAULT true,
  floating_hub_enabled BOOLEAN DEFAULT true,
  custom_servers JSONB DEFAULT '[]'::jsonb,
  feature_config JSONB DEFAULT '{}'::jsonb,
  gemini_api_keys JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure Default Row in Settings exists
INSERT INTO public.settings (id, gemini_api_key, google_flow_active, floating_hub_enabled, custom_servers, feature_config, gemini_api_keys)
VALUES (
  1,
  'AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw',
  true,
  true,
  '[
    {"id": "srv-1", "name": "Server 1: Flow AI", "url": "https://labs.google/fx/id/tools/flow", "status": "ON", "description": "Google Labs Flow AI - Sesi Login Aktif"},
    {"id": "srv-2", "name": "Server 2: Gemini Pro", "url": "https://aistudio.google.com/", "status": "ON", "description": "Google AI Studio Pro Cloud Workspace"},
    {"id": "srv-3", "name": "Server 3: Flux 8K", "url": "https://pollinations.ai/", "status": "ON", "description": "High-Performance 8K Visual Engine"}
  ]'::jsonb,
  '{
    "product-db": {"name": "Database Produk", "isVip": true, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "prompt-library": {"name": "Prompt Library", "isVip": true, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "storyboard-list": {"name": "Galeri Storyboard", "isVip": true, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "ai-photo-generator": {"name": "Studio Foto AI", "isVip": true, "isError": false, "errorMsg": "Engine sedang sibuk."},
    "storyboard-creator": {"name": "AI Storyboard & Foto", "isVip": false, "isError": false, "errorMsg": "Fitur dalam perbaikan."}
  }'::jsonb,
  '[
    {"id": "key-builtin-1", "key": "AIzaSyC5n4K5LAJEZM7IZbhenCUvQt18k-nd3Aw", "label": "Key Default Utama", "isActive": true, "status": "active"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  gemini_api_keys = COALESCE(public.settings.gemini_api_keys, EXCLUDED.gemini_api_keys),
  updated_at = NOW();

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Umum',
  price NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  target_audience TEXT,
  usp TEXT,
  affiliate_link TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STORYBOARDS TABLE
CREATE TABLE IF NOT EXISTS public.storyboards (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '9:16',
  scenes JSONB DEFAULT '[]'::jsonb,
  unified_prompt TEXT,
  full_text TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROMPTS TABLE
CREATE TABLE IF NOT EXISTS public.prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Product Shot',
  ratio TEXT DEFAULT '9:16',
  prompt TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHATS TABLE (GEMINI AI SESSIONS & HISTORY)
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  model TEXT DEFAULT 'gemini-2.5-flash',
  messages JSONB DEFAULT '[]'::jsonb,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GEMINI_KEYS TABLE (MULTI-KEY POOL)
CREATE TABLE IF NOT EXISTS public.gemini_keys (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  label TEXT DEFAULT 'API Key',
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  last_limited_at TIMESTAMPTZ
);

-- 9. INVOICES TABLE (VIP PAYMENTS & DONGTUBE)
CREATE TABLE IF NOT EXISTS public.invoices (
  invoice_id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  amount NUMERIC DEFAULT 25000,
  status TEXT DEFAULT 'pending',
  qr_image TEXT,
  payment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_user_id ON public.storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 11. DISABLE RLS OR ALLOW SERVICE ROLE ACCESS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemini_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Allow Public Access / Service Role Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Read All Settings" ON public.settings;
  CREATE POLICY "Public Read All Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
  CREATE POLICY "Public Full Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Products" ON public.products;
  CREATE POLICY "Public Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Storyboards" ON public.storyboards;
  CREATE POLICY "Public Full Access Storyboards" ON public.storyboards FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Prompts" ON public.prompts;
  CREATE POLICY "Public Full Access Prompts" ON public.prompts FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Chats" ON public.chats;
  CREATE POLICY "Public Full Access Chats" ON public.chats FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access GeminiKeys" ON public.gemini_keys;
  CREATE POLICY "Public Full Access GeminiKeys" ON public.gemini_keys FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Full Access Invoices" ON public.invoices;
  CREATE POLICY "Public Full Access Invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
END $$;
