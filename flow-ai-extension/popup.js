
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
            <span class="text-[8px] font-bold text-orange-400 uppercase font-mono">Prompt Visual AI:</span>
            <textarea rows="2" onchange="updateSceneField(${idx}, 'promptVisual', this.value)" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg p-1 text-[9px] text-amber-200 font-mono focus:outline-none leading-tight">${sc.promptVisual || ''}</textarea>
          </div>
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
      sc.promptVisual = `Hyperrealistic ${sc.shotType} of ${title} featuring ${usp}, 8k UHD resolution, photorealistic cinematic lighting, engine ${modelType}`;
      sc.promptVideo = `Fast dynamic motion transition showing ${title} in action, ${usp}, 4k 60fps`;
      sc.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(sc.promptVisual)}?width=768&height=1344&seed=${Math.floor(Math.random()*999999)}&model=flux&nologo=true`;
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
  const text = scenes.map((sc, i) => `[SCENE ${i+1} - ${sc.shotType}] (${sc.duration}s)\n🎬 PROMPT VIDEO: ${sc.promptVideo}\n🖼️ PROMPT VISUAL: ${sc.promptVisual}\n🎙️ VOICEOVER: "${sc.voiceover}"`).join("\n\n");
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
