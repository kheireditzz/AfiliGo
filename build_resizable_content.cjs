const fs = require('fs');
const path = require('path');

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

const contentJs = `// Flow Ai Extension v3.8 - In-Page Floating Studio with Dynamic Resizing & Zoom
(function() {
  if (window.__FLOW_AI_EXTENSION_INJECTED__) {
    const existing = document.getElementById('flow-ai-extension-host');
    if (existing) existing.remove();
  }
  window.__FLOW_AI_EXTENSION_INJECTED__ = true;

  const host = document.createElement('div');
  host.id = 'flow-ai-extension-host';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.top = '50%';
  host.style.left = '50%';
  host.style.transform = 'translate(-50%, -50%)';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = \`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* Minimized Floating Pill */
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      background: linear-gradient(135deg, rgba(13, 17, 30, 0.96), rgba(20, 26, 46, 0.96));
      border: 1.5px solid rgba(249, 115, 22, 0.7);
      border-radius: 9999px;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      cursor: grab;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.65), 0 0 18px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .floating-pill:hover {
      transform: scale(1.05);
      border-color: #f97316;
      box-shadow: 0 12px 30px rgba(249, 115, 22, 0.45);
    }
    .pill-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
    .pill-badge {
      background: rgba(249, 115, 22, 0.25);
      color: #fb923c;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 9px;
      font-family: monospace;
      border: 1px solid rgba(249, 115, 22, 0.4);
    }

    /* Main Floating Studio Box (Resizable & Expandable) */
    .floating-studio {
      width: 420px;
      min-width: 280px;
      max-width: 95vw;
      height: 580px;
      min-height: 280px;
      max-height: 92vh;
      background: linear-gradient(180deg, #0b0f19 0%, #070a12 100%);
      border: 1.5px solid rgba(249, 115, 22, 0.5);
      border-radius: 22px;
      color: #f8fafc;
      box-shadow: 0 25px 65px rgba(0,0,0,0.9), 0 0 30px rgba(249, 115, 22, 0.2);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      resize: both;
      animation: popIn 0.2s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.94); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.9);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .studio-body {
      padding: 12px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .studio-body::-webkit-scrollbar { width: 4px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

    /* Header Controls (+, -, Maximize, Minimize) */
    .ctrl-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-ctrl {
      background: #1e293b;
      color: #cbd5e1;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      font-weight: bold;
      transition: all 0.15s;
    }
    .btn-ctrl:hover { background: #334155; color: #fff; }
    .btn-ctrl:active { transform: scale(0.92); }

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
      padding: 6px 9px;
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
      position: relative;
    }
    .image-slot:hover { border-color: #f97316; }
    .image-slot img { width: 100%; height: 100%; object-fit: cover; }
    .btn-slot-crop {
      position: absolute;
      top: 3px;
      right: 3px;
      background: rgba(0,0,0,0.85);
      color: #f59e0b;
      border: 1px solid rgba(255,255,255,0.2);
      font-size: 8px;
      font-weight: bold;
      padding: 2px 5px;
      border-radius: 4px;
      cursor: pointer;
    }

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

    .btn-sync-web {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.4));
      border: 1px solid rgba(16, 185, 129, 0.5);
      color: #6ee7b7;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 9.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.2s;
    }
    .btn-sync-web:hover { background: rgba(16, 185, 129, 0.35); color: #fff; }

    .btn-inject {
      background: linear-gradient(135deg, #083344, #0e7490);
      border: 1.5px solid #06b6d4;
      color: #a5f3fc;
      padding: 9px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
    }
    .btn-inject:hover { background: #0891b2; color: #fff; }

    .scene-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    /* Resize Handle Gripper in Bottom-Right */
    .resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, #f97316 50%);
      border-bottom-right-radius: 18px;
      pointer-events: auto;
    }

    .crop-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 15px;
    }
    .crop-dialog {
      background: #0d121f;
      border: 1.5px solid #ea580c;
      border-radius: 16px;
      padding: 14px;
      width: 320px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #fff;
    }
  \`;
  shadow.appendChild(style);

  let isMinimized = true;
  let isMaximized = false;
  let currentZoom = 1.0;
  let savedWidth = "420px";
  let savedHeight = "580px";

  let scenes = [
    {
      id: 1,
      shotType: "Hook Close-Up",
      duration: 4,
      promptVideo: "Slow cinematic zoom in on product texture with studio bokeh lighting, 8k resolution",
      voiceover: "Stop scrolling! Ini produk paling worth it yang lagi viral!",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
    },
    {
      id: 2,
      shotType: "Action Demo",
      duration: 6,
      promptVideo: "Medium camera pan showing creator demonstrating key features enthusiastically",
      voiceover: "Langsung checkout di keranjang kuning sekarang mumpung diskon!",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400"
    }
  ];
  let images = { product: null, model: null, location: null };

  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);

  function tryAutoSyncFromWeb() {
    try {
      const thumbProd = document.getElementById('img-thumb-product');
      const thumbMod = document.getElementById('img-thumb-model');
      const thumbLoc = document.getElementById('img-thumb-location');

      let synced = false;
      if (thumbProd && thumbProd.src && !thumbProd.classList.contains('hidden')) {
        images.product = thumbProd.src;
        synced = true;
      }
      if (thumbMod && thumbMod.src && !thumbMod.classList.contains('hidden')) {
        images.model = thumbMod.src;
        synced = true;
      }
      if (thumbLoc && thumbLoc.src && !thumbLoc.classList.contains('hidden')) {
        images.location = thumbLoc.src;
        synced = true;
      }
      return synced;
    } catch(e) { return false; }
  }

  async function fetchStoryboardFromAffiliateGo() {
    try {
      const res = await fetch('https://affiliatego.vercel.app/api/storyboards');
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const latest = list[0];
        if (latest.scenes && latest.scenes.length > 0) {
          scenes = latest.scenes.map((s, idx) => ({
            id: idx + 1,
            shotType: s.shotType || ("Scene " + (idx + 1)),
            duration: s.durationSeconds || 4,
            promptVideo: s.visualDescription || s.prompt || "Cinematic video shot",
            voiceover: s.voiceover || "",
            imageUrl: s.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
          }));
          if (latest.scenes[0] && latest.scenes[0].imageUrl) {
            images.product = latest.scenes[0].imageUrl;
          }
          render();
          alert("Berhasil mengimpor Scene 1..N dan Gambar dari Storyboard AffiliateGo!");
          return;
        }
      }
      alert("Belum ada storyboard tersimpan di AffiliateGo.");
    } catch(err) {
      alert("Gagal terhubung ke AffiliateGo.");
    }
  }

  function render() {
    if (isMinimized) {
      host.style.transform = 'translate(-50%, -50%)';
      wrapper.innerHTML = \`
        <div class="floating-pill" id="btn-expand-pill" title="Klik untuk membuka Flow Ai Extension">
          <div class="pill-icon">⚡</div>
          <span>Flow Ai Extension</span>
          <span class="pill-badge">v3.8</span>
        </div>
      \`;
      wrapper.querySelector('#btn-expand-pill').addEventListener('click', () => {
        isMinimized = false;
        render();
      });
      makeDraggable(wrapper.querySelector('.floating-pill'));
    } else {
      const studioWidth = isMaximized ? "92vw" : savedWidth;
      const studioHeight = isMaximized ? "90vh" : savedHeight;

      wrapper.innerHTML = \`
        <div class="floating-studio" id="main-floating-studio" style="width:\${studioWidth}; height:\${studioHeight}; transform:scale(\${currentZoom}); transform-origin:center center;">
          <!-- Drag Header with Zoom & Sizing Controls -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="pill-icon">⚡</div>
              <div>
                <div style="font-size:11.5px; font-weight:800; color:#fff;">Flow Ai Extension</div>
                <div style="font-size:8.5px; color:#94a3b8;">Bisa Diperbesar / Diperkecil (Drag Sudut)</div>
              </div>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil Ukuran (Zoom Out)">🔍-</button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar Ukuran (Zoom In)">🔍+</button>
              <button class="btn-ctrl" id="btn-toggle-maximize" title="Layar Penuh / Pulihkan">\${isMaximized ? "🗗" : "🗖"}</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">-</button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Sync Web Button -->
            <button class="btn-sync-web" id="btn-fetch-web-data">
              <span>📥 Ambil Gambar & Scene dari Web AffiliateGo</span>
            </button>

            <!-- 3 Image Slots with Crop -->
            <div class="card-section">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; font-weight:bold; color:#f59e0b;">
                <span>📷 3 Slot Gambar (Klik foto untuk Crop)</span>
              </div>
              <div class="grid-3">
                <div class="image-slot" id="slot-product">
                  \${images.product ? \`<img src="\${images.product}"><button class="btn-slot-crop" onclick="this.getRootNode().host.openCropModal('product')">Crop</button>\` : \`<div style="font-size:8px; color:#94a3b8;">+ Foto Produk</div>\`}
                  <input type="file" id="input-file-prod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot" id="slot-model">
                  \${images.model ? \`<img src="\${images.model}"><button class="btn-slot-crop" onclick="this.getRootNode().host.openCropModal('model')">Crop</button>\` : \`<div style="font-size:8px; color:#94a3b8;">+ Foto Model</div>\`}
                  <input type="file" id="input-file-mod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot" id="slot-location">
                  \${images.location ? \`<img src="\${images.location}"><button class="btn-slot-crop" onclick="this.getRootNode().host.openCropModal('location')">Crop</button>\` : \`<div style="font-size:8px; color:#94a3b8;">+ Foto Lokasi</div>\`}
                  <input type="file" id="input-file-loc" accept="image/*" style="display:none">
                </div>
              </div>
            </div>

            <!-- Parameters & Flow AI Exact Durations -->
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
                  <label style="font-size:8.5px; color:#94a3b8; font-weight:bold; display:block; margin-bottom:2px;">Durasi Flow AI</label>
                  <select class="select-input" id="inp-duration">
                    <option value="4">4s (4 Detik)</option>
                    <option value="6" selected>6s (6 Detik)</option>
                    <option value="8">8s (8 Detik)</option>
                    <option value="10">10s (10 Detik)</option>
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
                <span style="font-size:9.5px; font-weight:bold; color:#fff;">🎬 Daftar Scene Storyboard</span>
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

            <!-- Inject Actions -->
            <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:6px;">
              <button class="btn-inject" id="btn-inject-page" title="Inject langsung ke kotak chat prompt Flow AI">
                <span>🎯 Inject ke Chat Flow AI</span>
              </button>
              <button class="btn-inject" id="btn-download-all-inline" style="background:#064e3b; border-color:#10b981; color:#6ee7b7;">
                <span>📦 Unduh JSON</span>
              </button>
            </div>

          </div>

          <!-- Bottom-Right Dynamic Resize Gripper -->
          <div class="resize-handle" id="gripper-resize" title="Tarik untuk mengubah ukuran"></div>
        </div>
      \`;

      // Zoom & Scale Controls
      wrapper.querySelector('#btn-zoom-in').addEventListener('click', () => {
        if (currentZoom < 1.4) {
          currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = \`scale(\${currentZoom})\`;
        }
      });

      wrapper.querySelector('#btn-zoom-out').addEventListener('click', () => {
        if (currentZoom > 0.6) {
          currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = \`scale(\${currentZoom})\`;
        }
      });

      wrapper.querySelector('#btn-toggle-maximize').addEventListener('click', () => {
        isMaximized = !isMaximized;
        render();
      });

      wrapper.querySelector('#btn-minimize-studio').addEventListener('click', () => {
        isMinimized = true;
        render();
      });

      wrapper.querySelector('#btn-fetch-web-data').addEventListener('click', () => {
        if (!tryAutoSyncFromWeb()) {
          fetchStoryboardFromAffiliateGo();
        } else {
          render();
          alert("Berhasil menyinkronkan data & gambar dari halaman AffiliateGo!");
        }
      });

      wrapper.querySelector('#btn-add-scene-inline').addEventListener('click', () => {
        const dur = parseInt(wrapper.querySelector('#inp-duration').value) || 6;
        scenes.push({
          id: scenes.length + 1,
          shotType: "Close-Up",
          duration: dur,
          promptVideo: "Smooth dynamic camera pan showing product benefits and texture, 4k 60fps",
          voiceover: "Klik keranjang kuning sekarang mumpung diskon spesial!"
        });
        render();
      });

      wrapper.querySelector('#btn-generate-now').addEventListener('click', async () => {
        const title = wrapper.querySelector('#inp-title').value.trim() || 'Produk Affiliate';
        const usp = wrapper.querySelector('#inp-usp').value.trim() || 'Kualitas terbaik';
        const modelAi = wrapper.querySelector('#inp-model-ai').value;
        const dur = parseInt(wrapper.querySelector('#inp-duration').value) || 6;
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
              duration: dur * scenes.length
            })
          });
          const data = await res.json();
          if (data && data.scenes) {
            scenes = data.scenes.map((s, idx) => ({
              id: idx + 1,
              shotType: s.shotType || ("Scene " + (idx + 1)),
              duration: dur,
              promptVideo: s.visualDescription,
              voiceover: s.voiceover
            }));
          }
        } catch(e) {
          scenes.forEach(s => {
            s.duration = dur;
            s.promptVideo = "Cinematic " + s.shotType + " of " + title + ", " + usp + ", 4k 60fps [" + modelAi + "]";
          });
        } finally {
          genBtn.innerText = '⚡ Generate Brutal Video di Flow AI';
          genBtn.disabled = false;
          render();
        }
      });

      wrapper.querySelector('#btn-inject-page').addEventListener('click', () => {
        injectPrecisionPromptToFlowAI();
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
      setupResizeHandler(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#gripper-resize'));
    }
  }

  function setupImageSlots() {
    ['prod', 'mod', 'loc'].forEach((k, idx) => {
      const keyMap = ['product', 'model', 'location'][idx];
      const slot = wrapper.querySelector('#slot-' + keyMap);
      const inp = wrapper.querySelector('#input-file-' + k);
      if (slot && inp) {
        slot.addEventListener('click', (e) => {
          if (e.target.tagName !== 'BUTTON') inp.click();
        });
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

  host.openCropModal = function(key) {
    if (!images[key]) return;
    const cropOverlay = document.createElement('div');
    cropOverlay.className = 'crop-modal-overlay';
    cropOverlay.innerHTML = \`
      <div class="crop-dialog">
        <div style="font-size:11px; font-weight:bold; color:#f59e0b;">✂️ Crop Foto (\${key.toUpperCase()})</div>
        <div style="width:100%; aspect-ratio:1; overflow:hidden; border-radius:10px; background:#000; display:flex; align-items:center; justify-content:center;">
          <img id="crop-preview-img" src="\${images[key]}" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>
        <div style="display:flex; justify-content:space-between; gap:6px;">
          <button id="btn-crop-cancel" style="flex:1; background:#1e293b; color:#cbd5e1; border:none; border-radius:8px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer;">Batal</button>
          <button id="btn-crop-apply-square" style="flex:1; background:#ea580c; color:#fff; border:none; border-radius:8px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer;">Crop 1:1</button>
        </div>
      </div>
    \`;
    shadow.appendChild(cropOverlay);

    cropOverlay.querySelector('#btn-crop-cancel').addEventListener('click', () => {
      cropOverlay.remove();
    });

    cropOverlay.querySelector('#btn-crop-apply-square').addEventListener('click', () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 600, 600);
        images[key] = canvas.toDataURL('image/jpeg', 0.92);
        cropOverlay.remove();
        render();
      };
      img.src = images[key];
    });
  };

  function injectPrecisionPromptToFlowAI() {
    const fullScript = scenes.map((s, idx) => "[Scene " + (idx+1) + " (" + s.duration + "s)]: " + s.promptVideo).join("\\n");
    
    const promptSelectors = [
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="describe" i]',
      'textarea[placeholder*="video" i]',
      'textarea[aria-label*="prompt" i]',
      'textarea[aria-label*="describe" i]',
      '[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea:not([type="search"]):not([placeholder*="search" i]):not([placeholder*="cari" i]):not([aria-label*="search" i])'
    ];

    let targetInput = null;
    for (const selector of promptSelectors) {
      const candidates = Array.from(document.querySelectorAll(selector));
      const filtered = candidates.filter(el => {
        const ph = (el.getAttribute('placeholder') || '').toLowerCase();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        const idClass = (el.id + ' ' + el.className).toLowerCase();
        return !ph.includes('search') && !ph.includes('cari') && !aria.includes('search') && !idClass.includes('search');
      });
      if (filtered.length > 0) {
        targetInput = filtered[0];
        break;
      }
    }

    if (targetInput) {
      targetInput.focus();
      if (targetInput.tagName === "TEXTAREA" || targetInput.tagName === "INPUT") {
        targetInput.value = fullScript;
        targetInput.dispatchEvent(new Event("input", { bubbles: true }));
        targetInput.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        targetInput.innerText = fullScript;
        targetInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: fullScript }));
      }
      alert("✅ Prompt video Flow AI berhasil dimasukkan tepat ke kotak chat generator!");
    } else {
      navigator.clipboard.writeText(fullScript);
      alert("📋 Prompt berhasil disalin! Silakan paste (Ctrl+V) langsung ke kotak prompt Flow AI.");
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
      host.style.transform = 'none';
      host.style.top = (host.offsetTop - pos2) + "px";
      host.style.left = (host.offsetLeft - pos1) + "px";
      host.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function setupResizeHandler(studio, gripper) {
    if (!studio || !gripper) return;
    let startX, startY, startWidth, startHeight;

    gripper.onmousedown = function(e) {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(studio).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(studio).height, 10);
      document.onmousemove = doResize;
      document.onmouseup = stopResize;
    };

    function doResize(e) {
      const newW = Math.max(280, Math.min(window.innerWidth - 40, startWidth + e.clientX - startX));
      const newH = Math.max(280, Math.min(window.innerHeight - 40, startHeight + e.clientY - startY));
      studio.style.width = newW + 'px';
      studio.style.height = newH + 'px';
      savedWidth = newW + 'px';
      savedHeight = newH + 'px';
    }

    function stopResize() {
      document.onmousemove = null;
      document.onmouseup = null;
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

  tryAutoSyncFromWeb();
  render();
})();
`;

fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);
console.log("Resizable content.js successfully built!");
