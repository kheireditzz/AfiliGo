
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

  container.innerHTML = scenes.map((sc, idx) => `
    <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/30 space-y-2.5 transition shadow">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-black font-mono border border-orange-500/30">
            SCENE ${idx + 1}
          </span>
          <input type="text" value="${sc.shotType}" onchange="updateSceneField(${idx}, 'shotType', this.value)" class="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-mono w-32 focus:outline-none focus:border-amber-400 truncate">
          <span class="text-[9px] text-slate-400 font-mono">${sc.duration}s</span>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="downloadSingleImage('${sc.imageUrl}', ${idx + 1})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[9px] flex items-center justify-center" title="Save Gambar Scene ${idx + 1}">
            <i class="fa-solid fa-download"></i>
          </button>
          <button onclick="deleteScene(${idx})" class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-[9px] flex items-center justify-center" title="Hapus Scene">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-4 relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-800">
          <img src="${sc.imageUrl}" class="w-full h-full object-cover" alt="Visual Preview">
        </div>
        <div class="col-span-8 space-y-1.5">
          <div>
            <span class="text-[8px] font-bold text-amber-400 uppercase font-mono">Prompt Video Motion:</span>
            <input type="text" value="${sc.promptVideo || ''}" onchange="updateSceneField(${idx}, 'promptVideo', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg px-1.5 py-1 text-[9px] text-white focus:outline-none truncate">
          </div>
          <div>
            <span class="text-[8px] font-bold text-emerald-400 uppercase font-mono">Voiceover / Narasi:</span>
            <input type="text" value="${sc.voiceover || ''}" onchange="updateSceneField(${idx}, 'voiceover', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-lg px-1.5 py-1 text-[9px] text-white focus:outline-none truncate">
          </div>
        </div>
      </div>
    </div>
  `).join("");
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
  const text = scenes.map((sc, i) => "[Scene " + (i+1) + " (" + sc.duration + "s)]: " + sc.promptVideo + "\nNarasi: \"" + sc.voiceover + "\"").join("\n\n");
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
  const fullScript = scenes.map((sc, i) => "[Scene " + (i+1) + " (" + sc.duration + "s)]: " + sc.promptVideo).join("\n");
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
