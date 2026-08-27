import fs from 'fs';
import path from 'path';

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

// 1. manifest.json
const manifest = {
  "manifest_version": 3,
  "name": "Flow Ai Extension",
  "version": "3.1.0",
  "description": "Flow Ai Extension - Brutal Video & Storyboard Generator with Omni Flash and Veo 3.1 (Lite, Fast, Quality).",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "downloads"
  ],
  "host_permissions": [
    "*://labs.google/*",
    "*://*.google.com/*",
    "*://*.flow.ai/*",
    "*://affiliatego.vercel.app/*",
    "*://*.vercel.app/*",
    "*://localhost/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Flow Ai Extension"
  },
  "content_scripts": [
    {
      "matches": [
        "*://labs.google/*",
        "*://*.google.com/*",
        "*://*.flow.ai/*",
        "*://affiliatego.vercel.app/*",
        "*://*.vercel.app/*",
        "http://localhost:*/*"
      ],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
};
fs.writeFileSync(path.join(extDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// 2. popup.html
const popupHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flow Ai Extension</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    body {
      width: 480px;
      max-height: 590px;
      background: #070b14;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-y: auto;
    }
    .ultra-glass {
      background: rgba(13, 19, 34, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #070b14; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #f97316; }
    @keyframes shimmerWave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-active::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(249,115,22,0.25), transparent);
      animation: shimmerWave 1.4s infinite;
    }
  </style>
</head>
<body class="p-3.5 space-y-3 antialiased select-none">

  <!-- TOP HEADER -->
  <header class="ultra-glass p-3 rounded-2xl flex items-center justify-between border border-orange-500/30 shadow-lg">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm shadow">
        <i class="fa-solid fa-bolt-lightning"></i>
      </div>
      <div>
        <div class="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
          <span>Flow Ai Extension</span>
          <span class="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono border border-orange-500/40">v3.1</span>
        </div>
        <div class="text-[9px] text-slate-400 font-mono">Omni Flash & Veo 3.1 Suite</div>
      </div>
    </div>
    
    <div class="flex items-center gap-1.5">
      <button id="btn-save-all-json" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-1" title="Simpan Data Prompt JSON">
        <i class="fa-solid fa-file-code"></i>
        <span>JSON</span>
      </button>
      <button id="btn-download-all-zip" class="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white text-[10px] font-extrabold shadow flex items-center gap-1 transition" title="Download Semua Aset 1-Klik">
        <i class="fa-solid fa-cloud-arrow-down"></i>
        <span>Unduh All</span>
      </button>
    </div>
  </header>

  <!-- 1. MULTI-IMAGE SLOTS (PRODUK, MODEL, LOKASI) -->
  <div class="ultra-glass p-3 rounded-2xl space-y-2 border border-slate-800">
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
        <i class="fa-solid fa-images text-orange-400"></i> Masukkan Gambar (3 Slot)
      </span>
      <span class="text-[9px] text-slate-400 font-mono">Auto Visual AI</span>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <!-- Slot 1: Produk -->
      <div class="space-y-1 text-center">
        <label for="ext-file-product" class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center">
          <img id="ext-thumb-product" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-product" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-box-open text-slate-500 group-hover:text-amber-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Produk</div>
          </div>
          <input type="file" id="ext-file-product" accept="image/*" class="hidden">
        </label>
        <div class="text-[8px] text-slate-400 truncate">Produk</div>
      </div>

      <!-- Slot 2: Model -->
      <div class="space-y-1 text-center">
        <label for="ext-file-model" class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center">
          <img id="ext-thumb-model" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-model" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-user text-slate-500 group-hover:text-orange-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Model</div>
          </div>
          <input type="file" id="ext-file-model" accept="image/*" class="hidden">
        </label>
        <div class="text-[8px] text-slate-400 truncate">Model/Talent</div>
      </div>

      <!-- Slot 3: Lokasi -->
      <div class="space-y-1 text-center">
        <label for="ext-file-location" class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center">
          <img id="ext-thumb-location" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-location" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-mountain-sun text-slate-500 group-hover:text-red-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Tempat</div>
          </div>
          <input type="file" id="ext-file-location" accept="image/*" class="hidden">
        </label>
        <div class="text-[8px] text-slate-400 truncate">Lokasi/Latar</div>
      </div>
    </div>
  </div>

  <!-- 2. AI MODEL SELECTOR (OMNI FLASH & VEO 3.1) & DURATION CONFIG -->
  <div class="ultra-glass p-3 rounded-2xl space-y-2.5 border border-slate-800">
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-[10px] font-bold text-slate-300 mb-1">Model Flow AI</label>
        <select id="ext-ai-model" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] text-amber-300 font-mono focus:outline-none focus:border-orange-500">
          <option value="omni-flash" selected>Omni Flash</option>
          <option value="veo-3.1-lite">Veo 3.1 - Lite</option>
          <option value="veo-3.1-fast">Veo 3.1 - Fast</option>
          <option value="veo-3.1-quality">Veo 3.1 - Quality</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-300 mb-1">Durasi Video</label>
        <select id="ext-duration" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-orange-500">
          <option value="5">5 Detik (Hook Singkat)</option>
          <option value="10">10 Detik (Fast UGC)</option>
          <option value="15" selected>15 Detik (Standard TikTok)</option>
          <option value="30">30 Detik (Review Lengkap)</option>
          <option value="60">60 Detik (Storytelling)</option>
        </select>
      </div>
    </div>

    <!-- Product Title & USP Input -->
    <div class="space-y-1.5">
      <input type="text" id="ext-product-title" placeholder="Nama Produk (contoh: Wireless Earbuds ANC Pro)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-orange-500">
      <input type="text" id="ext-product-usp" placeholder="Keunggulan / USP Produk (contoh: Noise cancelling hening, bass nendang)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500">
    </div>

    <!-- Live Timer & Progress Bar -->
    <div id="ext-timer-container" class="hidden p-2 rounded-xl bg-orange-950/40 border border-orange-500/40 space-y-1">
      <div class="flex items-center justify-between text-[9px] font-mono">
        <span class="text-amber-300 font-bold flex items-center gap-1">
          <i class="fa-solid fa-stopwatch animate-spin"></i> Proses Flow AI...
        </span>
        <span id="ext-timer-text" class="text-orange-400 font-black">0s</span>
      </div>
      <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div id="ext-progress-bar" class="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 w-0 transition-all duration-300"></div>
      </div>
    </div>

    <!-- Brutal Generate Button -->
    <button id="btn-ext-generate-brutal" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition">
      <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
      <span id="btn-ext-gen-text">Generate Brutal Video di Flow AI</span>
    </button>
  </div>

  <!-- 3. DYNAMIC SCENES MANAGER -->
  <div class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-bold text-white font-display flex items-center gap-1.5">
        <i class="fa-solid fa-clapperboard text-orange-400"></i> Daftar Adegan (Scene)
      </span>
      <button id="btn-add-scene" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-1">
        <i class="fa-solid fa-plus text-[9px]"></i>
        <span>Tambah Scene</span>
      </button>
    </div>

    <div id="ext-scenes-container" class="space-y-2.5">
      <!-- Scene Cards -->
    </div>
  </div>

  <!-- BOTTOM INJECT & SYNC BAR -->
  <div class="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
    <button id="btn-inject-flow-tab" class="flex-1 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition flex items-center justify-center gap-1.5">
      <i class="fa-solid fa-arrow-pointer"></i>
      <span>Inject Prompt ke Tab Flow AI</span>
    </button>
    <button id="btn-copy-all-prompts" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center gap-1" title="Salin Naskah & Semua Prompt">
      <i class="fa-solid fa-copy"></i>
      <span>Salin</span>
    </button>
  </div>

  <script src="popup.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(extDir, 'popup.html'), popupHtml);

// 3. content.js (Floating in-page with Omni Flash & Veo 3.1 models)
const contentJs = `// Flow Ai Extension - In-Page Floating Brutal Generator
(function() {
  if (window.__FLOW_AI_EXTENSION_INJECTED__) return;
  window.__FLOW_AI_EXTENSION_INJECTED__ = true;

  const host = document.createElement('div');
  host.id = 'flow-ai-extension-host';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.top = '20px';
  host.style.right = '20px';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = \`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: linear-gradient(135deg, rgba(13, 17, 30, 0.95), rgba(20, 26, 46, 0.95));
      border: 1.5px solid rgba(249, 115, 22, 0.6);
      border-radius: 9999px;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      cursor: grab;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(249, 115, 22, 0.3);
      backdrop-filter: blur(12px);
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .floating-pill:hover {
      transform: scale(1.05);
      border-color: #f97316;
      box-shadow: 0 12px 30px rgba(249, 115, 22, 0.4);
    }
    .pill-icon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .pill-badge {
      background: rgba(249, 115, 22, 0.2);
      color: #fb923c;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 9px;
      font-family: monospace;
      border: 1px solid rgba(249, 115, 22, 0.3);
    }

    .floating-studio {
      width: 400px;
      max-width: calc(100vw - 30px);
      max-height: 85vh;
      background: linear-gradient(180deg, #0b0f19 0%, #070a12 100%);
      border: 1.5px solid rgba(249, 115, 22, 0.4);
      border-radius: 20px;
      color: #f8fafc;
      box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 25px rgba(249, 115, 22, 0.15);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: popIn 0.2s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
    }
    .studio-body {
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .studio-body::-webkit-scrollbar { width: 4px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

    .btn-minimize {
      background: #1e293b;
      color: #94a3b8;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    }
    .btn-minimize:hover { background: #334155; color: #fff; }

    .card-section {
      background: rgba(13, 19, 34, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .input-text, .select-input {
      width: 100%;
      background: #030712;
      border: 1px solid #1f2937;
      border-radius: 8px;
      color: #fff;
      padding: 6px 8px;
      font-size: 11px;
      outline: none;
    }
    .input-text:focus, .select-input:focus { border-color: #f97316; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }

    .image-slot {
      aspect-ratio: 1;
      border-radius: 10px;
      background: #030712;
      border: 1px dashed #374151;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      text-align: center;
    }
    .image-slot:hover { border-color: #f97316; }
    .image-slot img { width: 100%; height: 100%; object-fit: cover; }

    .btn-brutal {
      background: linear-gradient(135deg, #f59e0b, #ea580c, #dc2626);
      color: #fff;
      padding: 9px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 11px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.35);
      transition: transform 0.1s;
    }
    .btn-brutal:active { transform: scale(0.98); }

    .btn-inject {
      background: #083344;
      border: 1px solid #06b6d4;
      color: #67e8f9;
      padding: 8px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 10px;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .btn-inject:hover { background: #0e7490; color: #fff; }

    .scene-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  \`;
  shadow.appendChild(style);

  let isMinimized = true;
  let scenes = [
    {
      id: 1,
      shotType: "Hook Close-Up",
      duration: 3,
      promptVideo: "Slow cinematic zoom in on product texture with studio bokeh lighting",
      voiceover: "Stop scrolling! Ini produk paling worth it yang lagi viral!"
    },
    {
      id: 2,
      shotType: "Action Demo",
      duration: 4,
      promptVideo: "Medium camera pan showing creator demonstrating key features enthusiastically",
      voiceover: "Langsung checkout di keranjang kuning sekarang mumpung diskon!"
    }
  ];
  let images = { product: null, model: null, location: null };

  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);

  function render() {
    if (isMinimized) {
      wrapper.innerHTML = \`
        <div class="floating-pill" id="btn-expand-pill" title="Klik untuk membuka Flow Ai Extension">
          <div class="pill-icon">⚡</div>
          <span>Flow Ai Extension</span>
          <span class="pill-badge">v3.1</span>
        </div>
      \`;
      wrapper.querySelector('#btn-expand-pill').addEventListener('click', () => {
        isMinimized = false;
        render();
      });
      makeDraggable(wrapper.querySelector('.floating-pill'));
    } else {
      wrapper.innerHTML = \`
        <div class="floating-studio">
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="pill-icon">⚡</div>
              <div>
                <div style="font-size:11px; font-weight:800; color:#fff;">Flow Ai Extension</div>
                <div style="font-size:8.5px; color:#94a3b8;">Omni Flash & Veo 3.1 Suite (Melayang)</div>
              </div>
            </div>
            <button class="btn-minimize" id="btn-minimize-studio" title="Perkecil / Minimize">-</button>
          </div>

          <div class="studio-body">
            <!-- 3 Image Slots -->
            <div class="card-section">
              <div style="font-size:9.5px; font-weight:bold; color:#f59e0b;">
                📷 Masukkan 3 Gambar (Produk, Model, Lokasi)
              </div>
              <div class="grid-3">
                <div class="image-slot" id="slot-product">
                  \${images.product ? \`<img src="\${images.product}">\` : \`<div style="font-size:8px; color:#94a3b8;">+ Produk</div>\`}
                  <input type="file" id="input-file-prod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot" id="slot-model">
                  \${images.model ? \`<img src="\${images.model}">\` : \`<div style="font-size:8px; color:#94a3b8;">+ Model</div>\`}
                  <input type="file" id="input-file-mod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot" id="slot-location">
                  \${images.location ? \`<img src="\${images.location}">\` : \`<div style="font-size:8px; color:#94a3b8;">+ Lokasi</div>\`}
                  <input type="file" id="input-file-loc" accept="image/*" style="display:none">
                </div>
              </div>
            </div>

            <!-- Parameters -->
            <div class="card-section">
              <div class="grid-2">
                <div>
                  <label style="font-size:8.5px; color:#94a3b8; font-weight:bold; display:block; margin-bottom:2px;">Model Flow AI</label>
                  <select class="select-input" id="inp-model-ai">
                    <option value="omni-flash" selected>Omni Flash</option>
                    <option value="veo-3.1-lite">Veo 3.1 - Lite</option>
                    <option value="veo-3.1-fast">Veo 3.1 - Fast</option>
                    <option value="veo-3.1-quality">Veo 3.1 - Quality</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:8.5px; color:#94a3b8; font-weight:bold; display:block; margin-bottom:2px;">Durasi</label>
                  <select class="select-input" id="inp-duration">
                    <option value="5">5s (Hook Singkat)</option>
                    <option value="15" selected>15s (TikTok)</option>
                    <option value="30">30s (Review)</option>
                  </select>
                </div>
              </div>

              <input type="text" class="input-text" id="inp-title" placeholder="Nama Produk (contoh: Wireless Earbuds ANC Pro)">
              <input type="text" class="input-text" id="inp-usp" placeholder="Keunggulan / USP Produk (contoh: Noise cancelling hening)">

              <button class="btn-brutal" id="btn-generate-now">
                <span>⚡ Generate Brutal Video di Flow AI</span>
              </button>
            </div>

            <!-- Scenes List -->
            <div class="card-section">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:9.5px; font-weight:bold; color:#fff;">🎬 Daftar Scene</span>
                <button id="btn-add-scene-inline" style="background:#1e293b; color:#fbbf24; border:none; border-radius:6px; padding:3px 8px; font-size:9px; font-weight:bold; cursor:pointer;">+ Tambah Scene</button>
              </div>

              <div id="scenes-list-inline" style="display:flex; flex-direction:column; gap:6px;">
                \${scenes.map((sc, i) => \`
                  <div class="scene-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:3px;">
                      <span style="font-size:8.5px; font-weight:bold; color:#ea580c; font-family:monospace;">SCENE \${i+1} (\${sc.duration}s)</span>
                      <button onclick="this.getRootNode().host.deleteSceneHandler(\${i})" style="background:transparent; border:none; color:#f87171; font-size:8.5px; cursor:pointer;">Hapus</button>
                    </div>
                    <input type="text" class="input-text" style="font-size:8.5px;" value="\${sc.promptVideo}" placeholder="Prompt Video Motion" onchange="this.getRootNode().host.updateSceneHandler(\${i}, 'promptVideo', this.value)">
                    <input type="text" class="input-text" style="font-size:8.5px; color:#34d399;" value="\${sc.voiceover}" placeholder="Voiceover" onchange="this.getRootNode().host.updateSceneHandler(\${i}, 'voiceover', this.value)">
                  </div>
                \`).join("")}
              </div>
            </div>

            <!-- Bottom Actions -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <button class="btn-inject" id="btn-inject-page">
                <span>🎯 Inject ke Flow AI</span>
              </button>
              <button class="btn-inject" id="btn-download-all-inline" style="background:#064e3b; border-color:#10b981; color:#6ee7b7;">
                <span>📦 Unduh JSON</span>
              </button>
            </div>

          </div>
        </div>
      \`;

      wrapper.querySelector('#btn-minimize-studio').addEventListener('click', () => {
        isMinimized = true;
        render();
      });

      wrapper.querySelector('#btn-add-scene-inline').addEventListener('click', () => {
        scenes.push({
          id: scenes.length + 1,
          shotType: "Close-Up",
          duration: 3,
          promptVideo: "Smooth camera motion showing product benefit",
          voiceover: "Klik keranjang kuning sekarang mumpung diskon!"
        });
        render();
      });

      wrapper.querySelector('#btn-generate-now').addEventListener('click', async () => {
        const title = wrapper.querySelector('#inp-title').value.trim() || 'Produk Affiliate';
        const usp = wrapper.querySelector('#inp-usp').value.trim() || 'Kualitas terbaik';
        const modelAi = wrapper.querySelector('#inp-model-ai').value;
        const genBtn = wrapper.querySelector('#btn-generate-now');
        genBtn.innerText = '⏳ Merancang (' + modelAi + ')...';
        genBtn.disabled = true;

        try {
          const res = await fetch('https://affiliatego.vercel.app/api/generate-storyboard-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productTitle: title,
              usp: usp,
              numScenes: scenes.length,
              duration: parseInt(wrapper.querySelector('#inp-duration').value) || 15
            })
          });
          const data = await res.json();
          if (data && data.scenes) {
            scenes = data.scenes.map((s, idx) => ({
              id: idx + 1,
              shotType: s.shotType || \`Scene \${idx+1}\`,
              duration: s.durationSeconds || 3,
              promptVideo: s.visualDescription,
              voiceover: s.voiceover
            }));
          }
        } catch(e) {
          scenes.forEach(s => {
            s.promptVideo = \`Cinematic \${s.shotType} of \${title}, \${usp}, 4k 60fps [\${modelAi}]\`;
          });
        } finally {
          genBtn.innerText = '⚡ Generate Brutal Video di Flow AI';
          genBtn.disabled = false;
          render();
        }
      });

      wrapper.querySelector('#btn-inject-page').addEventListener('click', () => {
        injectPromptDirectly();
      });

      wrapper.querySelector('#btn-download-all-inline').addEventListener('click', () => {
        const data = { app: "Flow Ai Extension", scenes: scenes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'FlowAI-Prompts.json';
        a.click();
      });

      setupImageSlots();
      makeDraggable(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#studio-drag-bar'));
    }
  }

  function setupImageSlots() {
    ['prod', 'mod', 'loc'].forEach((k, idx) => {
      const keyMap = ['product', 'model', 'location'][idx];
      const slot = wrapper.querySelector('#slot-' + keyMap);
      const inp = wrapper.querySelector('#input-file-' + k);
      if (slot && inp) {
        slot.addEventListener('click', () => inp.click());
        inp.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            images[keyMap] = evt.target.result;
            render();
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  function injectPromptDirectly() {
    const fullScript = scenes.map((s, idx) => \`[Scene \${idx+1}]: \${s.promptVideo}\`).join("\\n");
    const input = document.querySelector('textarea, input[type="text"], [contenteditable="true"]');
    if (input) {
      if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
        input.value = fullScript;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        input.innerText = fullScript;
      }
      alert("✅ Prompt video berhasil ditempelkan langsung ke kotak input Flow AI!");
    } else {
      navigator.clipboard.writeText(fullScript);
      alert("📋 Prompt disalin ke clipboard! Silakan paste langsung ke Flow AI.");
    }
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragTarget = handle || element;
    dragTarget.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      host.style.top = (host.offsetTop - pos2) + "px";
      host.style.left = (host.offsetLeft - pos1) + "px";
      host.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  host.deleteSceneHandler = function(idx) {
    if (scenes.length <= 1) return;
    scenes.splice(idx, 1);
    render();
  };
  host.updateSceneHandler = function(idx, field, val) {
    if (scenes[idx]) scenes[idx][field] = val;
  };

  render();
})();
`;
fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);

console.log("Flow Ai Extension updated successfully with models: Omni Flash, Veo 3.1 - Lite, Veo 3.1 - Fast, Veo 3.1 - Quality");
