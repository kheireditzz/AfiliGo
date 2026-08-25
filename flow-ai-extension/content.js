// Flow Ai Extension v4.5 - Auto-Sequential Scene Runner & Robust Event Listeners
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
  host.style.top = '14px';
  host.style.left = '50%';
  host.style.transform = 'translateX(-50%)';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      background: linear-gradient(135deg, rgba(13, 17, 30, 0.96), rgba(20, 26, 46, 0.96));
      border: 1.5px solid rgba(249, 115, 22, 0.7);
      border-radius: 9999px;
      color: #fff;
      font-size: 10.5px;
      font-weight: 800;
      cursor: grab;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 16px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .floating-pill:hover {
      transform: scale(1.04);
      border-color: #f97316;
    }
    .pill-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .pill-badge {
      background: rgba(249, 115, 22, 0.25);
      color: #fb923c;
      padding: 1px 6px;
      border-radius: 5px;
      font-size: 8.5px;
      font-family: monospace;
      border: 1px solid rgba(249, 115, 22, 0.4);
    }

    .floating-studio {
      width: 360px;
      max-width: calc(100vw - 20px);
      max-height: 85vh;
      background: linear-gradient(180deg, #0d121f 0%, #070911 100%);
      border: 1.5px solid rgba(249, 115, 22, 0.55);
      border-radius: 18px;
      color: #f8fafc;
      box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 25px rgba(249, 115, 22, 0.2);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      resize: both;
      animation: popIn 0.18s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .studio-body {
      padding: 10px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

    .ctrl-group {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .btn-ctrl {
      background: #1e293b;
      color: #cbd5e1;
      width: 22px;
      height: 22px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
      font-weight: bold;
    }
    .btn-ctrl:hover { background: #334155; color: #fff; }

    .card-section {
      background: rgba(13, 19, 34, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .input-text, .select-input {
      width: 100%;
      background: #030712;
      border: 1px solid #1f2937;
      border-radius: 7px;
      color: #fff;
      padding: 5px 8px;
      font-size: 10px;
      outline: none;
    }
    .input-text:focus, .select-input:focus { border-color: #f97316; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }

    /* Scene Navigation Pills */
    .scene-nav-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .scene-tab-pill {
      padding: 4px 8px;
      border-radius: 7px;
      font-size: 9px;
      font-weight: 800;
      font-family: monospace;
      cursor: pointer;
      border: 1px solid #334155;
      background: #0f172a;
      color: #94a3b8;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .scene-tab-pill.active {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff;
      border-color: #f97316;
      box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
    }

    .image-slot-compact {
      aspect-ratio: 1;
      border-radius: 8px;
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
    .image-slot-compact:hover { border-color: #f97316; }
    .image-slot-compact img { width: 100%; height: 100%; object-fit: cover; }
    .btn-slot-crop {
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(0,0,0,0.85);
      color: #f59e0b;
      border: 1px solid rgba(255,255,255,0.2);
      font-size: 7px;
      font-weight: bold;
      padding: 1px 4px;
      border-radius: 3px;
      cursor: pointer;
    }

    .btn-action-primary {
      background: linear-gradient(135deg, #083344, #0e7490);
      border: 1.5px solid #06b6d4;
      color: #a5f3fc;
      padding: 8px 10px;
      border-radius: 9px;
      font-weight: 800;
      font-size: 10.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);
    }
    .btn-action-primary:hover { background: #0891b2; color: #fff; }

    .btn-auto-sequence {
      background: linear-gradient(135deg, #15803d, #16a34a);
      border: 1.5px solid #4ade80;
      color: #fff;
      padding: 8px 10px;
      border-radius: 9px;
      font-weight: 800;
      font-size: 10.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }
    .btn-auto-sequence:hover { opacity: 0.95; }
    .btn-auto-sequence.running {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      border-color: #f87171;
    }

    .status-banner {
      padding: 6px 8px;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(249, 115, 22, 0.3);
      font-size: 9px;
      color: #fed7aa;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, #f97316 50%);
      border-bottom-right-radius: 16px;
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
      border-radius: 14px;
      padding: 12px;
      width: 300px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #fff;
    }
  `;
  shadow.appendChild(style);

  let isMinimized = true;
  let activeSceneIndex = 0;
  let currentZoom = 1.0;
  let isAutoRunning = false;
  let autoTimerInterval = null;

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
          activeSceneIndex = 0;
          render();
          alert("✅ Berhasil mengimpor Scene 1.." + scenes.length + " dan Gambar dari Storyboard AffiliateGo!");
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
      host.style.top = '14px';
      host.style.left = '50%';
      host.style.transform = 'translateX(-50%)';
      wrapper.innerHTML = `
        <div class="floating-pill" id="btn-expand-pill" title="Klik untuk membuka Flow Ai Studio">
          <div class="pill-icon">⚡</div>
          <span>Flow Ai Extension</span>
          <span class="pill-badge">v4.5</span>
        </div>
      `;
      wrapper.querySelector('#btn-expand-pill').addEventListener('click', () => {
        isMinimized = false;
        render();
      });
      makeDraggable(wrapper.querySelector('.floating-pill'));
    } else {
      if (activeSceneIndex >= scenes.length) activeSceneIndex = 0;
      const currentScene = scenes[activeSceneIndex] || scenes[0];
      const activeImg = currentScene.imageUrl || images.product || images.model || images.location || "";

      wrapper.innerHTML = `
        <div class="floating-studio" id="main-floating-studio" style="transform:scale(${currentZoom}); transform-origin:top center;">
          <!-- Compact Header -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:6px;">
              <div class="pill-icon">⚡</div>
              <div>
                <div style="font-size:11px; font-weight:800; color:#fff;">Flow Ai Extension</div>
                <div style="font-size:8px; color:#fb923c; font-family:monospace;">Mode Per-Scene (Top-Center)</div>
              </div>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil">🔍-</button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar">🔍+</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">-</button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Sync & Per-Scene Navigator Bar -->
            <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
              <div class="scene-nav-bar" id="scene-pills-bar">
                ${scenes.map((s, i) => `
                  <button class="scene-tab-pill ${i === activeSceneIndex ? 'active' : ''}" data-idx="${i}">
                    SCENE ${i+1}
                  </button>
                `).join("")}
                <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ Scene</button>
              </div>
              <button id="btn-sync-web-compact" style="background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#6ee7b7; border-radius:6px; padding:3px 6px; font-size:8.5px; font-weight:bold; cursor:pointer; white-space:nowrap;">📥 Sync Web</button>
            </div>

            <!-- Active Status Banner (Auto Runner) -->
            <div class="status-banner" id="auto-runner-banner">
              <span id="runner-status-text">
                ${isAutoRunning ? `🔄 Auto-Runner Aktif: Sedang di Scene ${activeSceneIndex + 1}...` : `⚡ Scene Aktif: Scene ${activeSceneIndex + 1} dari ${scenes.length}`}
              </span>
              <span id="runner-countdown" style="font-family:monospace; font-weight:bold; color:#f97316;">
                ${currentScene.duration}s
              </span>
            </div>

            <!-- Active Scene Visual Image Slot with Crop -->
            <div class="card-section">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; font-weight:bold; color:#f59e0b;">
                <span>🖼️ Gambar Scene ${activeSceneIndex + 1} (Klik foto untuk Ganti/Crop)</span>
                <span style="font-size:8px; color:#94a3b8; font-family:monospace;">${currentScene.duration}s</span>
              </div>
              
              <div style="display:grid; grid-template-columns: 80px 1fr; gap:8px;">
                <div class="image-slot-compact" id="slot-scene-active" style="height:80px; width:80px;">
                  ${activeImg ? `<img src="${activeImg}"><button class="btn-slot-crop" id="btn-crop-scene-active">Crop</button>` : `<div style="font-size:8px; color:#94a3b8;">+ Foto Scene</div>`}
                  <input type="file" id="input-file-scene-active" accept="image/*" style="display:none">
                </div>

                <div style="display:flex; flex-direction:column; gap:4px;">
                  <div class="grid-2">
                    <select class="select-input" id="inp-model-ai" style="font-size:9px; padding:3px 5px;">
                      <option value="omni-flash" selected>Omni Flash</option>
                      <option value="veo-3.1-lite">Veo 3.1 - Lite</option>
                      <option value="veo-3.1-fast">Veo 3.1 - Fast</option>
                      <option value="veo-3.1-quality">Veo 3.1 - Quality</option>
                    </select>
                    <select class="select-input" id="inp-scene-dur" style="font-size:9px; padding:3px 5px;">
                      <option value="4" ${currentScene.duration == 4 ? 'selected' : ''}>4s (4 Detik)</option>
                      <option value="6" ${currentScene.duration == 6 ? 'selected' : ''}>6s (6 Detik)</option>
                      <option value="8" ${currentScene.duration == 8 ? 'selected' : ''}>8s (8 Detik)</option>
                      <option value="10" ${currentScene.duration == 10 ? 'selected' : ''}>10s (10 Detik)</option>
                    </select>
                  </div>
                  <input type="text" class="input-text" id="inp-shot-type" style="font-size:9px;" value="${currentScene.shotType}" placeholder="Tipe Shot">
                </div>
              </div>

              <!-- Prompt Video & Voiceover for Active Scene -->
              <div style="display:flex; flex-direction:column; gap:4px; margin-top:2px;">
                <textarea rows="2" class="input-text" id="inp-prompt-video" style="font-size:9px; resize:none; font-family:monospace; color:#fef08a;" placeholder="Prompt Video Motion Scene ${activeSceneIndex+1}">${currentScene.promptVideo}</textarea>
                <input type="text" class="input-text" id="inp-voiceover" style="font-size:9px; color:#34d399;" value="${currentScene.voiceover}" placeholder="Naskah Voiceover Scene ${activeSceneIndex+1}">
              </div>
            </div>

            <!-- Sequential Execution Action Bar -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
              <button class="btn-action-primary" id="btn-inject-current-scene" title="Kirim Prompt dan Upload Gambar Scene ${activeSceneIndex + 1} ke Chat Flow AI">
                <span>🎯 Inject Scene ${activeSceneIndex + 1}</span>
              </button>
              
              <button class="btn-auto-sequence ${isAutoRunning ? 'running' : ''}" id="btn-toggle-auto-runner" title="Otomatis lanjut ke scene berikutnya saat selesai">
                <span>${isAutoRunning ? '⏹️ Stop Auto' : '🚀 Auto Lanjut Scene'}</span>
              </button>
            </div>

            <!-- 3 General Slots (Produk, Model, Lokasi) Compact -->
            <div class="card-section">
              <div style="font-size:8.5px; font-weight:bold; color:#94a3b8;">
                📦 3 Slot Foto Utama (Produk / Model / Lokasi)
              </div>
              <div class="grid-3">
                <div class="image-slot-compact" id="slot-product" style="height:48px;">
                  ${images.product ? `<img src="${images.product}">` : `<div style="font-size:7.5px; color:#64748b;">+ Produk</div>`}
                  <input type="file" id="input-file-prod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot-compact" id="slot-model" style="height:48px;">
                  ${images.model ? `<img src="${images.model}">` : `<div style="font-size:7.5px; color:#64748b;">+ Model</div>`}
                  <input type="file" id="input-file-mod" accept="image/*" style="display:none">
                </div>
                <div class="image-slot-compact" id="slot-location" style="height:48px;">
                  ${images.location ? `<img src="${images.location}">` : `<div style="font-size:7.5px; color:#64748b;">+ Lokasi</div>`}
                  <input type="file" id="input-file-loc" accept="image/*" style="display:none">
                </div>
              </div>
            </div>

          </div>

          <div class="resize-handle" id="gripper-resize" title="Tarik untuk mengubah ukuran"></div>
        </div>
      `;

      // Attach Event Listeners to every Scene Tab Pill dynamically (Fixing scene switching!)
      const pills = wrapper.querySelectorAll('.scene-tab-pill[data-idx]');
      pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIdx = parseInt(pill.getAttribute('data-idx'), 10);
          if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < scenes.length) {
            activeSceneIndex = targetIdx;
            render();
          }
        });
      });

      // Zoom Controls
      wrapper.querySelector('#btn-zoom-in').addEventListener('click', () => {
        if (currentZoom < 1.4) {
          currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = `scale(${currentZoom})`;
        }
      });
      wrapper.querySelector('#btn-zoom-out').addEventListener('click', () => {
        if (currentZoom > 0.6) {
          currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = `scale(${currentZoom})`;
        }
      });
      wrapper.querySelector('#btn-minimize-studio').addEventListener('click', () => {
        isMinimized = true;
        render();
      });

      // Add scene
      wrapper.querySelector('#btn-add-scene-compact').addEventListener('click', () => {
        scenes.push({
          id: scenes.length + 1,
          shotType: "Close-Up",
          duration: 6,
          promptVideo: "Smooth dynamic camera motion showing product benefits, 4k 60fps",
          voiceover: "Klik keranjang kuning sekarang mumpung diskon spesial!",
          imageUrl: images.product || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
        });
        activeSceneIndex = scenes.length - 1;
        render();
      });

      wrapper.querySelector('#btn-sync-web-compact').addEventListener('click', () => {
        if (!tryAutoSyncFromWeb()) {
          fetchStoryboardFromAffiliateGo();
        } else {
          render();
          alert("✅ Berhasil menyinkronkan data dari AffiliateGo!");
        }
      });

      // Inputs onchange handlers
      const durSelect = wrapper.querySelector('#inp-scene-dur');
      if (durSelect) {
        durSelect.addEventListener('change', (e) => {
          scenes[activeSceneIndex].duration = parseInt(e.target.value) || 6;
        });
      }

      const shotInput = wrapper.querySelector('#inp-shot-type');
      if (shotInput) {
        shotInput.addEventListener('input', (e) => {
          scenes[activeSceneIndex].shotType = e.target.value;
        });
      }

      const promptArea = wrapper.querySelector('#inp-prompt-video');
      if (promptArea) {
        promptArea.addEventListener('input', (e) => {
          scenes[activeSceneIndex].promptVideo = e.target.value;
        });
      }

      const voiceInput = wrapper.querySelector('#inp-voiceover');
      if (voiceInput) {
        voiceInput.addEventListener('input', (e) => {
          scenes[activeSceneIndex].voiceover = e.target.value;
        });
      }

      // Crop button
      const cropBtn = wrapper.querySelector('#btn-crop-scene-active');
      if (cropBtn) {
        cropBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCropActiveScene();
        });
      }

      // Inject single scene
      wrapper.querySelector('#btn-inject-current-scene').addEventListener('click', async () => {
        await injectSingleSceneWithImage(activeSceneIndex);
      });

      // Toggle Auto Sequence Runner
      wrapper.querySelector('#btn-toggle-auto-runner').addEventListener('click', () => {
        if (isAutoRunning) {
          stopAutoRunner();
        } else {
          startAutoRunner();
        }
      });

      setupSceneImageUpload();
      setupMainImageUploads();
      makeDraggable(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#studio-drag-bar'));
      setupResizeHandler(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#gripper-resize'));
    }
  }

  // Auto Sequential Runner Logic (Automatically advance to next scene when video is done or timer completes)
  function startAutoRunner() {
    isAutoRunning = true;
    render();
    runCurrentSceneInSequence();
  }

  function stopAutoRunner() {
    isAutoRunning = false;
    if (autoTimerInterval) clearInterval(autoTimerInterval);
    render();
  }

  async function runCurrentSceneInSequence() {
    if (!isAutoRunning) return;

    // 1. Inject current scene + Image
    await injectSingleSceneWithImage(activeSceneIndex);

    // 2. Start monitoring Flow AI for generation completion
    const curDur = scenes[activeSceneIndex].duration || 6;
    let secondsLeft = curDur + 25; // estimated generation time

    const bannerText = shadow.getElementById('runner-status-text');
    const countdownEl = shadow.getElementById('runner-countdown');

    if (autoTimerInterval) clearInterval(autoTimerInterval);

    autoTimerInterval = setInterval(() => {
      if (!isAutoRunning) {
        clearInterval(autoTimerInterval);
        return;
      }

      secondsLeft--;
      if (countdownEl) countdownEl.innerText = secondsLeft + 's';
      if (bannerText) bannerText.innerText = '⏳ Scene ' + (activeSceneIndex + 1) + ' Sedang Diproses Flow AI...';

      // Check if Flow AI video is generated in page
      const videos = document.querySelectorAll('video');
      const hasNewVideo = videos.length > 0;

      if (secondsLeft <= 0 || (secondsLeft < 15 && hasNewVideo)) {
        clearInterval(autoTimerInterval);
        if (bannerText) bannerText.innerText = '✅ Scene ' + (activeSceneIndex + 1) + ' Selesai! Lanjut Scene ' + (activeSceneIndex + 2 <= scenes.length ? activeSceneIndex + 2 : 1) + '...';

        setTimeout(() => {
          if (!isAutoRunning) return;
          if (activeSceneIndex + 1 < scenes.length) {
            activeSceneIndex++;
            render();
            runCurrentSceneInSequence();
          } else {
            alert('🎉 Semua Scene (Scene 1 s/d ' + scenes.length + ') Selesai Diproses Secara Brutal!');
            stopAutoRunner();
          }
        }, 3000);
      }
    }, 1000);
  }

  function setupSceneImageUpload() {
    const slot = wrapper.querySelector('#slot-scene-active');
    const inp = wrapper.querySelector('#input-file-scene-active');
    if (slot && inp) {
      slot.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') inp.click();
      });
      inp.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          scenes[activeSceneIndex].imageUrl = evt.target.result;
          render();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function setupMainImageUploads() {
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

  async function urlOrBase64ToFile(urlOrData, filename = 'scene-visual.jpg') {
    if (!urlOrData) return null;
    try {
      if (urlOrData.startsWith('data:')) {
        const arr = urlOrData.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      } else {
        const res = await fetch(urlOrData);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
      }
    } catch(e) {
      console.warn("Failed to convert image to file:", e);
      return null;
    }
  }

  async function injectSingleSceneWithImage(sceneIdx) {
    const sc = scenes[sceneIdx] || scenes[0];
    const promptText = "[Scene " + (sceneIdx + 1) + " (" + sc.duration + "s)]: " + sc.promptVideo;
    const imgSource = sc.imageUrl || images.product || images.model || images.location;

    // 1. Upload Image to Flow AI
    if (imgSource) {
      const fileObj = await urlOrBase64ToFile(imgSource, "scene-" + (sceneIdx + 1) + ".jpg");
      if (fileObj) {
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
        if (fileInputs.length > 0) {
          const targetFileInput = fileInputs[0];
          const dt = new DataTransfer();
          dt.items.add(fileObj);
          targetFileInput.files = dt.files;
          targetFileInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetFileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    // 2. Inject Prompt text into Flow AI Chat Prompt Textarea
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
        targetInput.value = promptText;
        targetInput.dispatchEvent(new Event("input", { bubbles: true }));
        targetInput.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        targetInput.innerText = promptText;
        targetInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: promptText }));
      }
    } else {
      navigator.clipboard.writeText(promptText);
    }
  }

  function openCropActiveScene() {
    const sc = scenes[activeSceneIndex];
    const imgSrc = sc.imageUrl || images.product;
    if (!imgSrc) return;

    const cropOverlay = document.createElement('div');
    cropOverlay.className = 'crop-modal-overlay';
    cropOverlay.innerHTML = `
      <div class="crop-dialog">
        <div style="font-size:11px; font-weight:bold; color:#f59e0b;">✂️ Crop Foto Scene ${activeSceneIndex + 1}</div>
        <div style="width:100%; aspect-ratio:1; overflow:hidden; border-radius:8px; background:#000; display:flex; align-items:center; justify-content:center;">
          <img id="crop-preview-img" src="${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>
        <div style="display:flex; justify-content:space-between; gap:6px;">
          <button id="btn-crop-cancel" style="flex:1; background:#1e293b; color:#cbd5e1; border:none; border-radius:6px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer;">Batal</button>
          <button id="btn-crop-apply" style="flex:1; background:#ea580c; color:#fff; border:none; border-radius:6px; padding:6px; font-size:10px; font-weight:bold; cursor:pointer;">Crop 1:1</button>
        </div>
      </div>
    `;
    shadow.appendChild(cropOverlay);

    cropOverlay.querySelector('#btn-crop-cancel').addEventListener('click', () => cropOverlay.remove());
    cropOverlay.querySelector('#btn-crop-apply').addEventListener('click', () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, (img.width - size)/2, (img.height - size)/2, size, size, 0, 0, 600, 600);
        scenes[activeSceneIndex].imageUrl = canvas.toDataURL('image/jpeg', 0.92);
        cropOverlay.remove();
        render();
      };
      img.src = imgSrc;
    });
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
      const newW = Math.max(280, Math.min(window.innerWidth - 30, startWidth + e.clientX - startX));
      const newH = Math.max(250, Math.min(window.innerHeight - 30, startHeight + e.clientY - startY));
      studio.style.width = newW + 'px';
      studio.style.height = newH + 'px';
    }

    function stopResize() {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }

  tryAutoSyncFromWeb();
  render();
})();
