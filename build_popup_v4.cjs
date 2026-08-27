const fs = require('fs');
const path = require('path');
const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

// popup.html
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
          <span class="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono border border-orange-500/40">v3.5</span>
        </div>
        <div class="text-[9px] text-slate-400 font-mono">Omni Flash & Veo 3.1 Suite</div>
      </div>
    </div>
    
    <div class="flex items-center gap-1.5">
      <button id="btn-save-all-json" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-1">
        <i class="fa-solid fa-file-code"></i>
        <span>JSON</span>
      </button>
      <button id="btn-download-all-zip" class="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-white text-[10px] font-extrabold shadow flex items-center gap-1 transition">
        <i class="fa-solid fa-cloud-arrow-down"></i>
        <span>Unduh All</span>
      </button>
    </div>
  </header>

  <!-- SYNC FROM AFFILIATEGO WEB -->
  <button id="btn-sync-from-web" class="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 hover:from-emerald-900/80 hover:to-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold shadow flex items-center justify-center gap-2 transition">
    <i class="fa-solid fa-cloud-arrow-down text-emerald-400"></i>
    <span>Ambil Gambar & Scene dari Web AffiliateGo</span>
  </button>

  <!-- 1. MULTI-IMAGE SLOTS (PRODUK, MODEL, LOKASI) WITH CROP -->
  <div class="ultra-glass p-3 rounded-2xl space-y-2 border border-slate-800">
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
        <i class="fa-solid fa-images text-orange-400"></i> Masukkan Gambar (3 Slot)
      </span>
      <span class="text-[9px] text-slate-400 font-mono">Klik foto untuk Crop</span>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <!-- Slot 1: Produk -->
      <div class="space-y-1 text-center">
        <div class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center" id="box-product">
          <img id="ext-thumb-product" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-product" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-box-open text-slate-500 group-hover:text-amber-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Produk</div>
          </div>
          <span id="btn-crop-product" class="hidden absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-bold text-amber-300 border border-white/20"><i class="fa-solid fa-crop"></i></span>
          <input type="file" id="ext-file-product" accept="image/*" class="hidden">
        </div>
        <div class="text-[8px] text-slate-400 truncate">Produk</div>
      </div>

      <!-- Slot 2: Model -->
      <div class="space-y-1 text-center">
        <div class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center" id="box-model">
          <img id="ext-thumb-model" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-model" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-user text-slate-500 group-hover:text-orange-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Model</div>
          </div>
          <span id="btn-crop-model" class="hidden absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-bold text-amber-300 border border-white/20"><i class="fa-solid fa-crop"></i></span>
          <input type="file" id="ext-file-model" accept="image/*" class="hidden">
        </div>
        <div class="text-[8px] text-slate-400 truncate">Model/Talent</div>
      </div>

      <!-- Slot 3: Lokasi -->
      <div class="space-y-1 text-center">
        <div class="relative block aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 cursor-pointer overflow-hidden group shadow flex flex-col items-center justify-center" id="box-location">
          <img id="ext-thumb-location" class="hidden w-full h-full object-cover">
          <div id="ext-placeholder-location" class="p-1 space-y-0.5 text-center">
            <i class="fa-solid fa-mountain-sun text-slate-500 group-hover:text-red-400 text-xs"></i>
            <div class="text-[8px] font-bold text-slate-300">Foto Tempat</div>
          </div>
          <span id="btn-crop-location" class="hidden absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[8px] font-bold text-amber-300 border border-white/20"><i class="fa-solid fa-crop"></i></span>
          <input type="file" id="ext-file-location" accept="image/*" class="hidden">
        </div>
        <div class="text-[8px] text-slate-400 truncate">Lokasi/Latar</div>
      </div>
    </div>
  </div>

  <!-- 2. AI MODEL (OMNI FLASH & VEO 3.1) & EXACT FLOW AI DURATIONS (4s, 6s, 8s, 10s) -->
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
        <label class="block text-[10px] font-bold text-slate-300 mb-1">Durasi Flow AI</label>
        <select id="ext-duration" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-[10px] text-white font-mono focus:outline-none focus:border-orange-500">
          <option value="4">4s (4 Detik)</option>
          <option value="6" selected>6s (6 Detik)</option>
          <option value="8">8s (8 Detik)</option>
          <option value="10">10s (10 Detik)</option>
        </select>
      </div>
    </div>

    <!-- Product Title & USP -->
    <div class="space-y-1.5">
      <input type="text" id="ext-product-title" placeholder="Nama Produk (contoh: Wireless Earbuds ANC Pro)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-orange-500">
      <input type="text" id="ext-product-usp" placeholder="Keunggulan / USP Produk (contoh: Noise cancelling hening, bass punchy)" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500">
    </div>

    <button id="btn-ext-generate-brutal" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition">
      <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
      <span id="btn-ext-gen-text">Generate Brutal Video di Flow AI</span>
    </button>
  </div>

  <!-- 3. SCENES LIST -->
  <div class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-bold text-white font-display flex items-center gap-1.5">
        <i class="fa-solid fa-clapperboard text-orange-400"></i> Daftar Scene Storyboard
      </span>
      <button id="btn-add-scene" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[10px] font-bold border border-slate-700 transition flex items-center gap-1">
        <i class="fa-solid fa-plus text-[9px]"></i>
        <span>Tambah Scene</span>
      </button>
    </div>

    <div id="ext-scenes-container" class="space-y-2.5"></div>
  </div>

  <!-- BOTTOM INJECT BAR (EXACT FLOW AI CHAT BOX) -->
  <div class="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
    <button id="btn-inject-flow-tab" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-950 to-slate-900 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow">
      <i class="fa-solid fa-arrow-pointer text-cyan-400"></i>
      <span>Inject ke Chat Flow AI</span>
    </button>
    <button id="btn-copy-all-prompts" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center gap-1">
      <i class="fa-solid fa-copy"></i>
      <span>Salin</span>
    </button>
  </div>

  <script src="popup.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(extDir, 'popup.html'), popupHtml);

// popup.js with web sync & crop
const popupJs = `
let scenes = [
  {
    id: 1,
    shotType: "Hook Close-Up",
    duration: 4,
    promptVisual: "Hyperrealistic commercial close-up of product with studio bokeh lighting, 8k resolution",
    promptVideo: "Slow cinematic zoom in on product texture, hands gently unboxing with dynamic motion blur",
    voiceover: "Stop scrolling! Ini rahasia kenapa produk ini lagi viral banget!",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
  },
  {
    id: 2,
    shotType: "Action Demo",
    duration: 6,
    promptVisual: "Indonesian female creator demonstrating product in aesthetic room, natural sunlight, 4k",
    promptVideo: "Medium camera pan showing creator testing key features with enthusiastic expression",
    voiceover: "Lihat hasilnya yang bener-bener instan dan worth it banget!",
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
    const dur = parseInt(document.getElementById("ext-duration").value) || 6;
    scenes.push({
      id: scenes.length + 1,
      shotType: "Close-Up",
      duration: dur,
      promptVisual: "Cinematic commercial shot of product in aesthetic setting, 8k",
      promptVideo: "Smooth camera motion showing product benefit and satisfaction",
      voiceover: "Klik keranjang kuning sekarang mumpung diskon spesial!",
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
  document.getElementById("btn-sync-from-web").addEventListener("click", syncFromAffiliateGoWeb);
}

async function syncFromAffiliateGoWeb() {
  try {
    const res = await fetch("https://affiliatego.vercel.app/api/storyboards");
    const list = await res.json();
    if (Array.isArray(list) && list.length > 0) {
      const latest = list[0];
      if (latest.scenes && latest.scenes.length > 0) {
        scenes = latest.scenes.map((s, idx) => ({
          id: idx + 1,
          shotType: s.shotType || ("Scene " + (idx + 1)),
          duration: s.durationSeconds || 4,
          promptVisual: s.prompt || "",
          promptVideo: s.visualDescription || s.prompt || "",
          voiceover: s.voiceover || "",
          imageUrl: s.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
        }));
        if (latest.scenes[0] && latest.scenes[0].imageUrl) {
          uploadedImages.product = latest.scenes[0].imageUrl;
          const thumb = document.getElementById("ext-thumb-product");
          const ph = document.getElementById("ext-placeholder-product");
          if (thumb) { thumb.src = latest.scenes[0].imageUrl; thumb.classList.remove("hidden"); }
          if (ph) ph.classList.add("hidden");
        }
        renderScenes();
        saveState();
        alert("✅ Berhasil menyinkronkan Scene 1..N dan Gambar dari Web AffiliateGo!");
        return;
      }
    }
    alert("Belum ada data storyboard tersimpan di AffiliateGo.");
  } catch(e) {
    alert("Gagal terhubung ke AffiliateGo.");
  }
}

function setupImageUploads() {
  ['product', 'model', 'location'].forEach(key => {
    const box = document.getElementById('box-' + key);
    const fileInput = document.getElementById('ext-file-' + key);
    if (!box || !fileInput) return;

    box.addEventListener('click', (e) => {
      if (e.target.id !== 'btn-crop-' + key) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        uploadedImages[key] = base64;

        const thumb = document.getElementById('ext-thumb-' + key);
        const placeholder = document.getElementById('ext-placeholder-' + key);
        const cropBtn = document.getElementById('btn-crop-' + key);
        if (thumb) { thumb.src = base64; thumb.classList.remove('hidden'); }
        if (placeholder) { placeholder.classList.add('hidden'); }
        if (cropBtn) { cropBtn.classList.remove('hidden'); }

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
  const dur = parseInt(document.getElementById("ext-duration").value) || 6;

  const btn = document.getElementById("btn-ext-generate-brutal");
  const btnText = document.getElementById("btn-ext-gen-text");

  btn.disabled = true;
  btnText.innerText = "Merancang (" + modelType + ")...";

  try {
    const res = await fetch("https://affiliatego.vercel.app/api/generate-storyboard-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productTitle: title,
        usp: usp,
        numScenes: scenes.length,
        duration: dur * scenes.length
      })
    });

    const data = await res.json();
    if (data && data.scenes && data.scenes.length > 0) {
      scenes = data.scenes.map((sc, idx) => ({
        id: idx + 1,
        shotType: sc.shotType || ("Scene " + (idx + 1)),
        duration: dur,
        promptVisual: sc.prompt,
        promptVideo: sc.visualDescription,
        voiceover: sc.voiceover,
        imageUrl: sc.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
      }));
      renderScenes();
      saveState();
    }
  } catch (err) {
    scenes.forEach((sc) => {
      sc.duration = dur;
      sc.promptVideo = "Cinematic " + sc.shotType + " of " + title + ", " + usp + ", 4k 60fps [" + modelType + "]";
    });
    renderScenes();
    saveState();
  } finally {
    btn.disabled = false;
    btnText.innerText = "Generate Brutal Video di Flow AI";
  }
}

function savePromptsJson() {
  const data = {
    app: "Flow Ai Extension",
    product: document.getElementById("ext-product-title")?.value || "",
    usp: document.getElementById("ext-product-usp")?.value || "",
    duration: document.getElementById("ext-duration")?.value || 6,
    scenes: scenes
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "FlowAI-Prompts.json";
  a.click();
}

function copyAllPromptsText() {
  const text = scenes.map((sc, i) => "[Scene " + (i+1) + " (" + sc.duration + "s)]: " + sc.promptVideo + "\\nNarasi: \\"" + sc.voiceover + "\\"").join("\\n\\n");
  navigator.clipboard.writeText(text);
  alert("Semua Prompt Scene berhasil disalin ke Clipboard!");
}

function downloadAllAssets() {
  savePromptsJson();
  scenes.forEach((sc, idx) => {
    setTimeout(() => {
      window.downloadSingleImage(sc.imageUrl, idx + 1);
    }, idx * 300);
  });
}

function injectToActiveFlowTab() {
  const fullScript = scenes.map((sc, i) => "[Scene " + (i+1) + " (" + sc.duration + "s)]: " + sc.promptVideo).join("\\n");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (text) => {
        const promptSelectors = [
          'textarea[placeholder*="prompt" i]',
          'textarea[placeholder*="describe" i]',
          'textarea[placeholder*="video" i]',
          'textarea[aria-label*="prompt" i]',
          'textarea[aria-label*="describe" i]',
          '[contenteditable="true"][role="textbox"]',
          'div[contenteditable="true"]',
          'textarea:not([type="search"]):not([placeholder*="search" i]):not([placeholder*="cari" i])'
        ];
        let target = null;
        for (const s of promptSelectors) {
          const els = Array.from(document.querySelectorAll(s)).filter(el => {
            const ph = (el.getAttribute('placeholder') || '').toLowerCase();
            const aria = (el.getAttribute('aria-label') || '').toLowerCase();
            return !ph.includes('search') && !ph.includes('cari') && !aria.includes('search');
          });
          if (els.length > 0) { target = els[0]; break; }
        }
        if (target) {
          target.focus();
          if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            target.value = text;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            target.innerText = text;
            target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
          }
          alert('✅ Prompt berhasil di-inject ke chat prompt Flow AI!');
        } else {
          navigator.clipboard.writeText(text);
          alert('📋 Prompt disalin ke clipboard! Silakan paste langsung ke Flow AI.');
        }
      },
      args: [fullScript]
    });
  });
}

function saveState() {
  const state = {
    title: document.getElementById("ext-product-title")?.value || "",
    usp: document.getElementById("ext-product-usp")?.value || "",
    duration: document.getElementById("ext-duration")?.value || "6",
    model: document.getElementById("ext-ai-model")?.value || "omni-flash",
    scenes: scenes,
    images: uploadedImages
  };
  chrome.storage?.local?.set({ "flow_ai_state_v4": state });
}

function loadSavedState() {
  chrome.storage?.local?.get(["flow_ai_state_v4"], (res) => {
    if (res && res.flow_ai_state_v4) {
      const st = res.flow_ai_state_v4;
      if (st.title) document.getElementById("ext-product-title").value = st.title;
      if (st.usp) document.getElementById("ext-product-usp").value = st.usp;
      if (st.duration) document.getElementById("ext-duration").value = st.duration;
      if (st.model) document.getElementById("ext-ai-model").value = st.model;
      if (st.scenes && st.scenes.length > 0) {
        scenes = st.scenes;
        renderScenes();
      }
    }
  });
}
`;
fs.writeFileSync(path.join(extDir, 'popup.js'), popupJs);
console.log("popup.html and popup.js updated with exact Flow AI 4s/6s/8s/10s durations, precision injection, and web sync!");
