import fs from 'fs';
import path from 'path';

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';
if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });

// 1. manifest.json
const manifest = {
  "manifest_version": 3,
  "name": "AffiliateGo - Flow AI Brutal Video & Storyboard Generator",
  "version": "2.5.0",
  "description": "Generate brutal affiliate video prompts, multi-image product/model/location scenes, and 1-click batch download for Flow AI.",
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
    "default_title": "AffiliateGo Flow AI Brutal Generator"
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
  <title>AffiliateGo - Flow AI Brutal Generator</title>
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
    .neon-border {
      border: 1px solid rgba(249, 115, 22, 0.4);
      box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
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
          <span>Flow AI</span>
          <span class="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono border border-orange-500/40">BRUTAL v2.5</span>
        </div>
        <div class="text-[9px] text-slate-400 font-mono">AffiliateGo Video Director</div>
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

  <!-- 2. AI MODEL SELECTOR & DURATION CONFIG -->
  <div class="ultra-glass p-3 rounded-2xl space-y-2.5 border border-slate-800">
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-[10px] font-bold text-slate-300 mb-1">Engine Model AI</label>
        <select id="ext-ai-model" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] text-amber-300 font-mono focus:outline-none focus:border-orange-500">
          <option value="omni-flash" selected>Omni Flash (Gemini 2.5)</option>
          <option value="gemini-pro">Gemini 2.5 Pro (Cinematic)</option>
          <option value="veo2-kling">Veo 2 & Kling 1.5 Motion</option>
          <option value="flux-ultra">Flux 8K Ultra Photoreal</option>
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

    <!-- Live Timer & Progress Bar (Hidden until generation starts) -->
    <div id="ext-timer-container" class="hidden p-2 rounded-xl bg-orange-950/40 border border-orange-500/40 space-y-1">
      <div class="flex items-center justify-between text-[9px] font-mono">
        <span class="text-amber-300 font-bold flex items-center gap-1">
          <i class="fa-solid fa-stopwatch animate-spin"></i> Proses Brutal Flow AI...
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
      <!-- Scene Cards Dynamically Injected -->
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

// 3. popup.js
const popupJs = `
let scenes = [
  {
    id: 1,
    shotType: "Hook / Macro Close-Up",
    duration: 3,
    promptVisual: "Hyperrealistic commercial close-up of product with soft studio bokeh lighting, 8k resolution, photorealistic",
    promptVideo: "Slow cinematic zoom in on product texture, hands gently unboxing with dynamic motion blur",
    voiceover: "Stop scrolling! Ini rahasia kenapa produk ini lagi viral banget!",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
  },
  {
    id: 2,
    shotType: "Demonstration / Medium Shot",
    duration: 4,
    promptVisual: "Indonesian female creator demonstrating product in aesthetic modern room, natural sunlight, 4k",
    promptVideo: "Medium camera pan showing creator testing the key features with enthusiastic expression",
    voiceover: "Lihat hasilnya yang bener-bener instan dan worth it banget buat dicoba!",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400"
  }
];

let uploadedImages = { product: null, model: null, location: null };

document.addEventListener("DOMContentLoaded", () => {
  renderScenes();
  setupImageUploads();
  setupEventListeners();
  loadSavedState();
});

function setupEventListeners() {
  document.getElementById("btn-add-scene").addEventListener("click", () => {
    const newId = scenes.length + 1;
    scenes.push({
      id: newId,
      shotType: "Lifestyle / Close-Up",
      duration: 3,
      promptVisual: "Cinematic commercial shot of product in aesthetic setting, 8k",
      promptVideo: "Smooth camera motion showing product benefit and satisfaction",
      voiceover: "Klik keranjang kuning sekarang mumpung lagi diskon spesial!",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
    });
    renderScenes();
    saveState();
  });

  document.getElementById("btn-ext-generate-brutal").addEventListener("click", handleBrutalGeneration);
  document.getElementById("btn-save-all-json").addEventListener("click", savePromptsJson);
  document.getElementById("btn-download-all-zip").addEventListener("click", downloadAllAssets);
  document.getElementById("btn-inject-flow-tab").addEventListener("click", injectToActiveFlowTab);
  document.getElementById("btn-copy-all-prompts").addEventListener("click", copyAllPromptsText);
}

function setupImageUploads() {
  ['product', 'model', 'location'].forEach(key => {
    const fileInput = document.getElementById('ext-file-' + key);
    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        uploadedImages[key] = base64;

        const thumb = document.getElementById('ext-thumb-' + key);
        const placeholder = document.getElementById('ext-placeholder-' + key);
        if (thumb) { thumb.src = base64; thumb.classList.remove('hidden'); }
        if (placeholder) { placeholder.classList.add('hidden'); }

        saveState();
      };
      reader.readAsDataURL(file);
    });
  });
}

function renderScenes() {
  const container = document.getElementById("ext-scenes-container");
  if (!container) return;

  container.innerHTML = scenes.map((sc, idx) => \`
    <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/30 space-y-2.5 transition shadow">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-black font-mono border border-orange-500/30">
            SCENE \${idx + 1}
          </span>
          <input type="text" value="\${sc.shotType}" onchange="updateSceneField(\${idx}, 'shotType', this.value)" class="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-mono w-32 focus:outline-none focus:border-amber-400 truncate">
          <span class="text-[9px] text-slate-400 font-mono">\${sc.duration}s</span>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="downloadSingleImage('\${sc.imageUrl}', \${idx + 1})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[9px] flex items-center justify-center" title="Save Gambar Scene \${idx + 1}">
            <i class="fa-solid fa-download"></i>
          </button>
          <button onclick="deleteScene(\${idx})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-[9px] flex items-center justify-center" title="Hapus Scene">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-4 relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-800">
          <img src="\${sc.imageUrl}" class="w-full h-full object-cover" alt="Visual Preview">
        </div>
        <div class="col-span-8 space-y-1.5">
          <div>
            <span class="text-[8px] font-bold text-orange-400 uppercase font-mono">Prompt Visual AI:</span>
            <textarea rows="2" onchange="updateSceneField(\${idx}, 'promptVisual', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg p-1 text-[9px] text-amber-200 font-mono focus:outline-none leading-tight">\${sc.promptVisual || ''}</textarea>
          </div>
          <div>
            <span class="text-[8px] font-bold text-amber-400 uppercase font-mono">Prompt Video Motion:</span>
            <input type="text" value="\${sc.promptVideo || ''}" onchange="updateSceneField(\${idx}, 'promptVideo', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg px-1.5 py-1 text-[9px] text-white focus:outline-none truncate">
          </div>
          <div>
            <span class="text-[8px] font-bold text-emerald-400 uppercase font-mono">Voiceover / Narasi:</span>
            <input type="text" value="\${sc.voiceover || ''}" onchange="updateSceneField(\${idx}, 'voiceover', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-lg px-1.5 py-1 text-[9px] text-white focus:outline-none truncate">
          </div>
        </div>
      </div>
    </div>
  \`).join("");
}

window.updateSceneField = function(idx, field, value) {
  if (scenes[idx]) {
    scenes[idx][field] = value;
    saveState();
  }
};

window.deleteScene = function(idx) {
  if (scenes.length <= 1) return;
  scenes.splice(idx, 1);
  renderScenes();
  saveState();
};

window.downloadSingleImage = function(url, sceneNum) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FlowAI-Scene-' + sceneNum + '.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

async function handleBrutalGeneration() {
  const title = document.getElementById("ext-product-title").value.trim() || "Produk Affiliate";
  const usp = document.getElementById("ext-product-usp").value.trim() || "Kualitas terbaik dan viral";
  const modelType = document.getElementById("ext-ai-model").value;
  const duration = parseInt(document.getElementById("ext-duration").value) || 15;

  const btn = document.getElementById("btn-ext-generate-brutal");
  const btnText = document.getElementById("btn-ext-gen-text");
  const timerContainer = document.getElementById("ext-timer-container");
  const timerText = document.getElementById("ext-timer-text");
  const progressBar = document.getElementById("ext-progress-bar");

  btn.disabled = true;
  btn.classList.add("opacity-80", "shimmer-active");
  btnText.innerText = "Merancang Brutal AI...";
  timerContainer.classList.remove("hidden");

  let elapsed = 0;
  const timerInterval = setInterval(() => {
    elapsed += 0.2;
    timerText.innerText = elapsed.toFixed(1) + "s";
    progressBar.style.width = Math.min(95, (elapsed / 4) * 100) + "%";
  }, 200);

  try {
    const res = await fetch("https://affiliatego.vercel.app/api/generate-storyboard-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productTitle: title,
        usp: usp,
        modelDescription: "Indonesian Creator, natural look, enthusiastic smile",
        locationSetting: "Modern Aesthetic Studio with warm ambient lighting",
        numScenes: scenes.length,
        duration: duration,
        platform: "TikTok / Reels (9:16)"
      })
    });

    const data = await res.json();
    if (data && data.scenes && data.scenes.length > 0) {
      scenes = data.scenes.map((sc, idx) => ({
        id: idx + 1,
        shotType: sc.shotType || "Scene " + (idx + 1),
        duration: sc.durationSeconds || Math.round(duration / scenes.length),
        promptVisual: sc.prompt,
        promptVideo: sc.visualDescription,
        voiceover: sc.voiceover,
        imageUrl: sc.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
      }));
      renderScenes();
      saveState();
    }
  } catch (err) {
    console.warn("Server API offline, generating local brutal prompts:", err);
    scenes.forEach((sc, idx) => {
      sc.promptVisual = \`Hyperrealistic \${sc.shotType} of \${title} featuring \${usp}, 8k UHD resolution, photorealistic cinematic lighting, engine \${modelType}\`;
      sc.promptVideo = \`Fast dynamic motion transition showing \${title} in action, \${usp}, 4k 60fps\`;
      sc.imageUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(sc.promptVisual)}?width=768&height=1344&seed=\${Math.floor(Math.random()*999999)}&model=flux&nologo=true\`;
    });
    renderScenes();
    saveState();
  } finally {
    clearInterval(timerInterval);
    progressBar.style.width = "100%";
    timerText.innerText = "Selesai 100%!";
    setTimeout(() => timerContainer.classList.add("hidden"), 2000);

    btn.disabled = false;
    btn.classList.remove("opacity-80", "shimmer-active");
    btnText.innerText = "Generate Brutal Video di Flow AI";
  }
}

function savePromptsJson() {
  const data = {
    app: "AffiliateGo Flow AI Brutal Extension",
    product: document.getElementById("ext-product-title")?.value || "",
    usp: document.getElementById("ext-product-usp")?.value || "",
    totalDuration: document.getElementById("ext-duration")?.value || 15,
    generatedAt: new Date().toISOString(),
    scenes: scenes
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "FlowAI-Brutal-Prompts.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyAllPromptsText() {
  const text = scenes.map((sc, i) => \`[SCENE \${i+1} - \${sc.shotType}] (\${sc.duration}s)\\n🎬 PROMPT VIDEO: \${sc.promptVideo}\\n🖼️ PROMPT VISUAL: \${sc.promptVisual}\\n🎙️ VOICEOVER: "\${sc.voiceover}"\`).join("\\n\\n");
  navigator.clipboard.writeText(text);
  alert("Semua Prompt Scene berhasil disalin ke Clipboard!");
}

function downloadAllAssets() {
  savePromptsJson();
  scenes.forEach((sc, idx) => {
    setTimeout(() => {
      window.downloadSingleImage(sc.imageUrl, idx + 1);
    }, idx * 400);
  });
}

function injectToActiveFlowTab() {
  const scriptText = scenes.map(sc => sc.promptVideo).join(" -> ");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "INJECT_FLOW_PROMPT",
      prompt: scriptText,
      scenes: scenes
    }, (res) => {
      if (chrome.runtime.lastError) {
        alert("Prompt disalin! Silakan paste langsung di kotak input Flow AI / Google Labs.");
        navigator.clipboard.writeText(scriptText);
      } else {
        alert("Prompt berhasil di-inject ke halaman Flow AI!");
      }
    });
  });
}

function saveState() {
  const state = {
    title: document.getElementById("ext-product-title")?.value || "",
    usp: document.getElementById("ext-product-usp")?.value || "",
    duration: document.getElementById("ext-duration")?.value || "15",
    model: document.getElementById("ext-ai-model")?.value || "omni-flash",
    scenes: scenes,
    images: uploadedImages
  };
  chrome.storage?.local?.set({ "flow_ai_brutal_state": state });
}

function loadSavedState() {
  chrome.storage?.local?.get(["flow_ai_brutal_state"], (res) => {
    if (res && res.flow_ai_brutal_state) {
      const st = res.flow_ai_brutal_state;
      if (st.title) document.getElementById("ext-product-title").value = st.title;
      if (st.usp) document.getElementById("ext-product-usp").value = st.usp;
      if (st.duration) document.getElementById("ext-duration").value = st.duration;
      if (st.model) document.getElementById("ext-ai-model").value = st.model;
      if (st.scenes && st.scenes.length > 0) {
        scenes = st.scenes;
        renderScenes();
      }
      if (st.images) {
        uploadedImages = st.images;
        ['product', 'model', 'location'].forEach(k => {
          if (uploadedImages[k]) {
            const thumb = document.getElementById('ext-thumb-' + k);
            const placeholder = document.getElementById('ext-placeholder-' + k);
            if (thumb) { thumb.src = uploadedImages[k]; thumb.classList.remove('hidden'); }
            if (placeholder) { placeholder.classList.add('hidden'); }
          }
        });
      }
    }
  });
}
`;
fs.writeFileSync(path.join(extDir, 'popup.js'), popupJs);

// 4. content.js
const contentJs = `
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "INJECT_FLOW_PROMPT") {
    const input = document.querySelector('textarea, input[type="text"], [contenteditable="true"]');
    if (input) {
      if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
        input.value = request.prompt;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        input.innerText = request.prompt;
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, reason: "No input found" });
    }
  }
});
`;
fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);

// 5. background.js
const backgroundJs = `
chrome.runtime.onInstalled.addListener(() => {
  console.log("AffiliateGo Flow AI Brutal Extension Installed Successfully.");
});
`;
fs.writeFileSync(path.join(extDir, 'background.js'), backgroundJs);

console.log("Flow AI Extension files created successfully in:", extDir);
