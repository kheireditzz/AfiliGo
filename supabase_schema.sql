-- =========================================================================
-- AFILIGO DATABASE SCHEMA FOR SUPABASE
-- Project URL: https://bvmmshskoqylzptoyuxf.supabase.co
-- =========================================================================

-- 1. USERS & SUBSCRIPTION TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER', -- 'USER' or 'SUPER_ADMIN'
  vip_active BOOLEAN DEFAULT false,
  vip_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS DATABASE TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Affiliate',
  price NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 10,
  target_market TEXT,
  usp TEXT,
  affiliate_link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STORYBOARDS & SCENES TABLE
CREATE TABLE IF NOT EXISTS public.storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT DEFAULT 'TikTok / Reels (9:16)',
  total_duration INT DEFAULT 15,
  model_description TEXT,
  location_setting TEXT,
  hook TEXT,
  cta TEXT,
  scenes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MASTER PROMPTS LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Product Shot',
  aspect_ratio TEXT DEFAULT '9:16',
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PAYMENT INVOICES TABLE (DONGTUBE QRIS)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC DEFAULT 25000,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'expired'
  qris_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- 6. SYSTEM SETTINGS & FEATURE CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  gemini_api_key TEXT,
  huggingface_key TEXT,
  google_flow_cookies TEXT,
  google_flow_active BOOLEAN DEFAULT true,
  floating_hub_enabled BOOLEAN DEFAULT true,
  custom_servers JSONB DEFAULT '[
    {"id": "srv-1", "name": "Server 1: Flow AI", "url": "https://labs.google/fx/id/tools/flow", "description": "Google Labs Flow AI - Sesi Login Aktif", "status": "ON"},
    {"id": "srv-2", "name": "Server 2: Gemini Pro", "url": "https://aistudio.google.com/", "description": "Google AI Studio Pro Cloud Workspace", "status": "ON"},
    {"id": "srv-3", "name": "Server 3: Flux 8K", "url": "https://pollinations.ai/", "description": "High-Performance 8K Visual Engine", "status": "ON"}
  ]'::jsonb,
  feature_config JSONB DEFAULT '{
    "storyboard-creator": {"name": "AI Storyboard & Foto", "isVip": false, "isError": false, "errorMsg": "Fitur dalam perbaikan."},
    "storyboard-list": {"name": "Galeri Storyboard", "isVip": false, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "product-db": {"name": "Database Produk", "isVip": true, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "prompt-library": {"name": "Prompt Library", "isVip": true, "isError": false, "errorMsg": "Fitur dalam pemeliharaan."},
    "ai-photo-generator": {"name": "Studio Foto AI", "isVip": true, "isError": false, "errorMsg": "Engine sedang sibuk."}
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INSERT DEFAULT ADMIN AND SETTINGS
INSERT INTO public.users (email, password, name, role, vip_active)
VALUES ('kheireditz@gmail.com', 'Admin@123', 'Super Admin AfiliGo', 'SUPER_ADMIN', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.settings (id, gemini_api_key, google_flow_active, floating_hub_enabled)
VALUES (1, 'YOUR_GEMINI_API_KEY', true, true)
ON CONFLICT (id) DO UPDATE SET
  gemini_api_key = EXCLUDED.gemini_api_key,
  updated_at = now();

-- Enable Row Level Security (RLS) optionally
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow Public / Service Access Policies
CREATE POLICY "Allow service_role full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow service_role full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow service_role full access storyboards" ON public.storyboards FOR ALL USING (true);
CREATE POLICY "Allow service_role full access prompts" ON public.prompts FOR ALL USING (true);
CREATE POLICY "Allow service_role full access invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow service_role full access settings" ON public.settings FOR ALL USING (true);
