// Flow Ai Auto v10.0 - Full Video & Nano Banana Image Studio with 2-Way Sync & Auto-Downloader
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
  host.style.top = '10px';
  host.style.left = '50%';
  host.style.transform = 'translateX(-50%)';
  host.style.pointerEvents = 'auto';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Pure SVG Icons
  const ICONS = {
    bolt: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    banana: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 7.25c-.24-.31-.69-.37-1-.13l-1.39 1.05C14.3 6.06 10.9 5.3 7.8 6.09 5.16 6.77 2.8 8.44 1.25 10.74c-.3.44-.19 1.04.25 1.34.44.3 1.04.19 1.34-.25 1.28-1.89 3.23-3.26 5.4-3.82 2.58-.66 5.42-.02 7.5 1.83l-1.68 1.26c-.31.23-.37.68-.14.99.23.31.68.37.99.14l3.5-2.63c.31-.23.37-.68.14-.99l-2.02-2.7z"/></svg>`,
    video: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    image: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
    download: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    sync: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
    crop: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>`,
    minus: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    plus: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    cloudUp: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16l-4-4-4 4M12 12v9M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
    folderPlus: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
    trash: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    chevronUp: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`
  };

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; pointer-events: auto; }
    
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #090d16, #121829);
      border: 1.5px solid rgba(249, 115, 22, 0.85);
      border-radius: 9999px;
      color: #fff;
      font-size: 10.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.9), 0 0 16px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      user-select: none;
    }
    .pill-icon {
      width: 18px;
      height: 18px;
      border-radius: 5px;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .floating-studio {
      width: 320px;
      max-width: 96vw;
      background: #080b13;
      border: 1.5px solid rgba(249, 115, 22, 0.6);
      border-radius: 16px;
      color: #f8fafc;
      box-shadow: 0 20px 50px rgba(0,0,0,0.95), 0 0 25px rgba(249, 115, 22, 0.2);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      animation: popIn 0.15s ease-out;
      transform-origin: top center;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 7px 11px;
      background: linear-gradient(90deg, #0e1424, #161f36);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .studio-body {
      padding: 9px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 84vh;
      overflow-y: auto;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

    .ctrl-group { display: flex; align-items: center; gap: 3px; }
    .btn-ctrl {
      background: #162035;
      color: #cbd5e1;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
      transition: all 0.15s;
    }
    .btn-ctrl:hover { background: #253352; color: #fff; }
    .btn-ctrl:active { transform: scale(0.92); }

    /* Studio Mode Switcher (Video vs Nano Banana Image) */
    .mode-switch-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      background: #040711;
      padding: 3px;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .mode-btn {
      padding: 4px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: transparent;
      color: #94a3b8;
      transition: all 0.15s;
    }
    .mode-btn.active {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff;
      box-shadow: 0 0 10px rgba(234, 88, 12, 0.4);
    }

    .card-section {
      background: #0d121f;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 7px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .input-text, .select-input {
      width: 100%;
      background: #040711;
      border: 1px solid #1f293d;
      border-radius: 6px;
      color: #fff;
      padding: 4.5px 6px;
      font-size: 9px;
      outline: none;
    }
    .input-text:focus, .select-input:focus { border-color: #f97316; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }

    /* Scene Navigation Pills */
    .scene-nav-bar {
      display: flex;
      align-items: center;
      gap: 3px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .scene-tab-pill {
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 8.5px;
      font-weight: 800;
      font-family: monospace;
      cursor: pointer;
      border: 1px solid #1e293b;
      background: #0b0f19;
      color: #94a3b8;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .scene-tab-pill.active {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #fff;
      border-color: #f97316;
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
    }

    .storyboard-slot {
      aspect-ratio: 9/16;
      height: 80px;
      border-radius: 8px;
      background: #040711;
      border: 1px dashed #334155;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      text-align: center;
      position: relative;
    }
    .storyboard-slot img { width: 100%; height: 100%; object-fit: cover; }
    .slot-badge {
      position: absolute;
      bottom: 2px;
      left: 2px;
      right: 2px;
      background: rgba(0,0,0,0.8);
      border-radius: 3px;
      font-size: 6.5px;
      font-weight: bold;
      color: #fbd38d;
      padding: 1px 2px;
      text-align: center;
    }
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
      display: flex;
      align-items: center;
      gap: 2px;
    }

    /* Primary Action Buttons */
    .btn-auto-now {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      border: 1px solid #f97316;
      color: #fff;
      padding: 6.5px 8px;
      border-radius: 7px;
      font-weight: 800;
      font-size: 9.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
      transition: all 0.15s;
    }
    .btn-auto-now:active { transform: scale(0.96); }

    .btn-download-quick {
      background: linear-gradient(135deg, #065f46, #047857);
      border: 1px solid #10b981;
      color: #a7f3d0;
      padding: 6.5px 8px;
      border-radius: 7px;
      font-weight: 800;
      font-size: 9.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .btn-download-quick:active { transform: scale(0.96); }

    .btn-banana-gen {
      background: linear-gradient(135deg, #eab308, #ca8a04);
      border: 1px solid #fde047;
      color: #000;
      padding: 7px 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
    }
    .btn-banana-gen:active { transform: scale(0.96); }

    .resize-handle {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, #f97316 50%);
      border-bottom-right-radius: 14px;
    }

    .crop-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 10px;
    }
    .crop-dialog {
      background: #0d121f;
      border: 1.5px solid #ea580c;
      border-radius: 12px;
      padding: 12px;
      width: 270px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 7px;
      color: #fff;
    }
  `;
  shadow.appendChild(style);

  let isMinimized = false;
  let activeTabMode = "video"; // "video" or "nano-banana"
  let activeSceneIndex = 0;
  let isAutoRunning = false;
  let autoTimerInterval = null;
  let currentZoom = 1.0;
  let detectedVideoUrl = null;

  // Unified Storyboard Scenes
  let scenes = [
    {
      id: 1,
      shotType: "Hook Close-Up",
      aspectRatio: "9:16",
      duration: 4,
      promptVideo: "Cinematic commercial macro shot of product in aesthetic setting, glowing studio bokeh, 8k 60fps",
      voiceover: "Stop scrolling! Ini rahasia produk viral yang wajib kamu punya!",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
    },
    {
      id: 2,
      shotType: "Action Demo",
      aspectRatio: "9:16",
      duration: 6,
      promptVideo: "Medium camera pan showing creator demonstrating key features with enthusiastic expression",
      voiceover: "Langsung checkout di keranjang kuning sekarang mumpung diskon spesial!",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"
    }
  ];

  // Nano Banana Image Generator State
  let bananaState = {
    model: "nano-banana-pro", // "nano-banana-pro", "nano-banana-2", "nano-banana-2-lite"
    aspectRatio: "9:16",
    prompt: "Ultra-photorealistic commercial product photo, dramatic studio lighting, octane render, 8k",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
  };

  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);

  // Auto-Sync Unified Storyboards from Web API
  function autoSyncStoryboardFromWeb() {
    fetch('https://affiliatego.vercel.app/api/storyboards')
      .then(res => res.json())
      .then(list => {
        if (Array.isArray(list) && list.length > 0 && list[0].scenes && list[0].scenes.length > 0) {
          scenes = list[0].scenes.map((s, idx) => ({
            id: idx + 1,
            shotType: s.shotType || ("Scene " + (idx + 1)),
            aspectRatio: s.aspectRatio || "9:16",
            duration: s.durationSeconds || 4,
            promptVideo: s.visualDescription || s.prompt || "Cinematic video scene",
            voiceover: s.voiceover || "",
            imageUrl: s.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
          }));
          if (scenes[0]) bananaState.imageUrl = scenes[0].imageUrl;
          render();
        }
      }).catch(() => {});
  }

  // 2-Way Push: Send generated Video & Image back to AffiliateGo Web
  async function sendGeneratedAssetToWeb(sceneId, videoUrl, imageUrl, promptText) {
    try {
      await fetch('https://affiliatego.vercel.app/api/storyboards/sync-flow-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: sceneId,
          videoUrl: videoUrl,
          imageUrl: imageUrl,
          prompt: promptText,
          model: activeTabMode === 'video' ? 'Veo 3.1' : 'Nano Banana Pro',
          duration: scenes[activeSceneIndex]?.duration || 6,
          timestamp: new Date().toISOString()
        })
      });
    } catch(e) {}
  }

  // Auto Video Downloader & Flow AI Watcher
  function startVideoWatcher() {
    setInterval(() => {
      const videoElements = document.querySelectorAll('video');
      for (const v of videoElements) {
        const src = v.currentSrc || v.src;
        if (src && src.startsWith('blob:') || (src && src.startsWith('http') && !src.includes('youtube'))) {
          if (detectedVideoUrl !== src) {
            detectedVideoUrl = src;
            // Auto download video to device
            triggerDirectDownload(src, "FlowAI-Generated-Scene-" + (activeSceneIndex + 1) + ".mp4");
            // Auto push to web
            sendGeneratedAssetToWeb(activeSceneIndex + 1, src, scenes[activeSceneIndex]?.imageUrl, scenes[activeSceneIndex]?.promptVideo);
          }
        }
      }
    }, 2000);
  }

  function triggerDirectDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function render() {
    if (isMinimized) {
      host.style.top = '10px';
      host.style.left = '50%';
      host.style.transform = 'translateX(-50%)';
      wrapper.innerHTML = `
        <div class="floating-pill" id="btn-expand-pill" title="Buka Flow Ai Auto">
          <div class="pill-icon">${ICONS.bolt}</div>
          <span>Flow Ai Auto</span>
          <span style="font-size:8.5px; color:#fb923c; font-family:monospace;">${activeTabMode === 'video' ? 'VEO' : 'BANANA'}</span>
        </div>
      `;
      const pillBtn = wrapper.querySelector('#btn-expand-pill');
      pillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = false;
        render();
      });
      makeDraggable(pillBtn);
    } else {
      if (activeSceneIndex >= scenes.length) activeSceneIndex = 0;
      const currentScene = scenes[activeSceneIndex] || scenes[0];

      wrapper.innerHTML = `
        <div class="floating-studio" id="main-floating-studio" style="transform:scale(${currentZoom});">
          <!-- Header -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:6px;">
              <div class="pill-icon">${ICONS.bolt}</div>
              <span style="font-size:11px; font-weight:800; color:#fff;">Flow Ai Auto</span>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil">${ICONS.minus}</button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar">${ICONS.plus}</button>
              <button class="btn-ctrl" id="btn-sync-web-mini" style="color:#6ee7b7;" title="Sync dari Web AffiliateGo">${ICONS.sync}</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">${ICONS.chevronUp}</button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Mode Switcher: Video Generator vs Nano Banana Image Generator -->
            <div class="mode-switch-bar">
              <button class="mode-btn ${activeTabMode === 'video' ? 'active' : ''}" id="tab-btn-video">
                ${ICONS.video}
                <span>Video Studio</span>
              </button>
              <button class="mode-btn ${activeTabMode === 'nano-banana' ? 'active' : ''}" id="tab-btn-banana">
                ${ICONS.banana}
                <span>Nano Banana Foto</span>
              </button>
            </div>

            ${activeTabMode === 'video' ? renderVideoStudio(currentScene) : renderNanoBananaStudio()}

          </div>

          <div class="resize-handle" id="gripper-resize" title="Tarik sudut untuk ubah ukuran"></div>
        </div>
      `;

      attachCommonListeners();
    }
  }

  function renderVideoStudio(currentScene) {
    return `
      <!-- Scene Pills -->
      <div class="scene-nav-bar" id="scene-pills-bar">
        ${scenes.map((s, i) => `
          <button class="scene-tab-pill ${i === activeSceneIndex ? 'active' : ''}" data-idx="${i}">
            SCENE ${i+1}
          </button>
        `).join("")}
        <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ Scene</button>
      </div>

      <!-- Unified Storyboard Card -->
      <div class="card-section">
        <div style="display:grid; grid-template-columns: 58px 1fr; gap:6px; align-items:center;">
          <div class="storyboard-slot" id="slot-storyboard-scene" title="Gambar Storyboard Scene (Klik untuk Ganti / Upload)">
            <img src="${currentScene.imageUrl}">
            <button class="btn-slot-crop" id="btn-crop-storyboard">${ICONS.crop}</button>
            <span class="slot-badge">Scene ${activeSceneIndex+1}</span>
            <input type="file" id="input-file-storyboard" accept="image/*" style="display:none">
          </div>

          <div style="display:flex; flex-direction:column; gap:3px;">
            <div class="grid-3">
              <select class="select-input" id="inp-model-ai">
                <option value="omni-flash" selected>Omni Flash</option>
                <option value="veo-3.1-lite">Veo Lite</option>
                <option value="veo-3.1-fast">Veo Fast</option>
                <option value="veo-3.1-quality">Veo Quality</option>
              </select>
              <select class="select-input" id="inp-scene-dur">
                <option value="4" ${currentScene.duration == 4 ? 'selected' : ''}>4s</option>
                <option value="6" ${currentScene.duration == 6 ? 'selected' : ''}>6s</option>
                <option value="8" ${currentScene.duration == 8 ? 'selected' : ''}>8s</option>
                <option value="10" ${currentScene.duration == 10 ? 'selected' : ''}>10s</option>
              </select>
              <select class="select-input" id="inp-aspect-ratio">
                <option value="9:16" ${currentScene.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (TikTok)</option>
                <option value="16:9" ${currentScene.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
                <option value="1:1" ${currentScene.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
              </select>
            </div>
            <input type="text" class="input-text" id="inp-prompt-video" style="color:#fef08a; font-size:8.5px;" value="${currentScene.promptVideo}" placeholder="Prompt Video Scene ${activeSceneIndex+1}">
          </div>
        </div>

        <input type="text" class="input-text" id="inp-voiceover" style="color:#34d399; font-size:8.5px;" value="${currentScene.voiceover || ''}" placeholder="Voiceover / Naskah Narasi Scene ${activeSceneIndex+1}">
      </div>

      <!-- Action Controls -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
        <button class="btn-auto-now" id="btn-auto-generate-now" title="Otomatis Injeksi Gambar + Prompt dan Langsung Generate di Flow AI!">
          ${ICONS.bolt}
          <span>Auto Gen S${activeSceneIndex+1}</span>
        </button>

        <button class="btn-download-quick" id="btn-download-video-now" title="Unduh Video Hasil Generate 1-Klik">
          ${ICONS.download}
          <span>Unduh Video</span>
        </button>
      </div>

      
      
      <!-- Project & Asset Actions -->
      <div style="display:grid; grid-template-columns: 1fr; gap:4px; margin-top:2px;">
        <!-- Buat Project Baru -->
        <button class="btn-ctrl" id="btn-create-new-project" style="width:100%; height:26px; border-radius:7px; font-size:9px; background:linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.25)); border:1px solid rgba(249,115,22,0.5); color:#fed7aa; font-weight:800;" title="Mulai project storyboard baru dari awal">
          ${ICONS.folderPlus}
          <span style="margin-left:4px;">+ Buat Project Baru</span>
        </button>

        <!-- Separated: Hapus Gambar vs Hapus Video -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
          <button class="btn-ctrl" id="btn-clear-flow-images" style="height:25px; border-radius:7px; font-size:8.5px; background:rgba(220,38,38,0.15); border:1px solid rgba(248,113,113,0.35); color:#fca5a5;" title="Hapus semua lampiran foto / gambar di Flow AI">
            ${ICONS.trash}
            <span style="margin-left:3px;">Hapus Gambar</span>
          </button>

          <button class="btn-ctrl" id="btn-clear-flow-videos" style="height:25px; border-radius:7px; font-size:8.5px; background:rgba(185,28,28,0.18); border:1px solid rgba(239,68,68,0.4); color:#fecaca;" title="Hapus semua video player & hasil render di Flow AI">
            ${ICONS.video}
            <span style="margin-left:3px;">Hapus Video</span>
          </button>
        </div>
      </div>


      <!-- 1-Click Image Download & Web Sync Button -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
        <button class="btn-ctrl" id="btn-download-img-now" style="width:100%; height:26px; border-radius:7px; font-size:9px; color:#fbd38d;">
          ${ICONS.image}
          <span style="margin-left:4px;">Unduh Foto (1-Klik)</span>
        </button>
        <button class="btn-ctrl" id="btn-push-to-web" style="width:100%; height:26px; border-radius:7px; font-size:9px; color:#6ee7b7;">
          ${ICONS.cloudUp}
          <span style="margin-left:4px;">Kirim ke Web</span>
        </button>
      </div>
    `;
  }

  function renderNanoBananaStudio() {
    return `
      <!-- Nano Banana Image Studio Card -->
      <div class="card-section">
        <div style="font-size:9px; font-weight:bold; color:#facc15; display:flex; justify-content:space-between; align-items:center;">
          <span>${ICONS.banana} Model Gambar Nano Banana</span>
          <span style="font-size:7.5px; color:#94a3b8;">High-Res Visual</span>
        </div>

        <div style="display:grid; grid-template-columns: 58px 1fr; gap:6px; align-items:center;">
          <div class="storyboard-slot" id="slot-banana-image" title="Upload Gambar Referensi">
            <img src="${bananaState.imageUrl}">
            <button class="btn-slot-crop" id="btn-crop-banana">${ICONS.crop}</button>
            <span class="slot-badge">Banana</span>
            <input type="file" id="input-file-banana" accept="image/*" style="display:none">
          </div>

          <div style="display:flex; flex-direction:column; gap:3px;">
            <div class="grid-2">
              <select class="select-input" id="inp-banana-model" style="color:#fde047; font-weight:bold;">
                <option value="nano-banana-pro" ${bananaState.model === 'nano-banana-pro' ? 'selected' : ''}>Nano Banana Pro</option>
                <option value="nano-banana-2" ${bananaState.model === 'nano-banana-2' ? 'selected' : ''}>Nano Banana 2</option>
                <option value="nano-banana-2-lite" ${bananaState.model === 'nano-banana-2-lite' ? 'selected' : ''}>Nano Banana 2 Lite</option>
              </select>

              <select class="select-input" id="inp-banana-aspect">
                <option value="9:16" ${bananaState.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (TikTok)</option>
                <option value="1:1" ${bananaState.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                <option value="16:9" ${bananaState.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
                <option value="4:3" ${bananaState.aspectRatio === '4:3' ? 'selected' : ''}>4:3 (Photo)</option>
                <option value="3:4" ${bananaState.aspectRatio === '3:4' ? 'selected' : ''}>3:4 (Portrait)</option>
              </select>
            </div>

            <textarea rows="2" class="input-text" id="inp-banana-prompt" style="color:#fef08a; font-size:8.5px; resize:none;" placeholder="Prompt Gambar Model Nano Banana...">${bananaState.prompt}</textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons for Nano Banana -->
      <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:4px;">
        <button class="btn-banana-gen" id="btn-generate-banana-now">
          ${ICONS.bolt}
          <span>Generate Nano Banana</span>
        </button>

        <button class="btn-download-quick" id="btn-download-banana-img">
          ${ICONS.download}
          <span>Unduh Foto</span>
        </button>
      </div>
    `;
  }

  function attachCommonListeners() {
    // Mode Switcher
    const tabVid = wrapper.querySelector('#tab-btn-video');
    const tabBan = wrapper.querySelector('#tab-btn-banana');
    if (tabVid) tabVid.addEventListener('click', () => { activeTabMode = 'video'; render(); });
    if (tabBan) tabBan.addEventListener('click', () => { activeTabMode = 'nano-banana'; render(); });

    // Zoom Handlers
    wrapper.querySelector('#btn-zoom-in')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentZoom < 1.35) {
        currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
        const st = wrapper.querySelector('#main-floating-studio');
        if (st) st.style.transform = `scale(${currentZoom})`;
      }
    });
    wrapper.querySelector('#btn-zoom-out')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentZoom > 0.7) {
        currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
        const st = wrapper.querySelector('#main-floating-studio');
        if (st) st.style.transform = `scale(${currentZoom})`;
      }
    });

    wrapper.querySelector('#btn-minimize-studio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      isMinimized = true;
      render();
    });

    wrapper.querySelector('#btn-sync-web-mini')?.addEventListener('click', (e) => {
      e.stopPropagation();
      autoSyncStoryboardFromWeb();
      alert("✅ Data & Gambar berhasil disinkronkan dari web AffiliateGo!");
    });

    if (activeTabMode === 'video') {
      attachVideoStudioListeners();
    } else {
      attachNanoBananaListeners();
    }

    makeDraggable(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#studio-drag-bar'));
    setupResizeHandler(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#gripper-resize'));
  }

  
    // Function to Remove All Uploaded Images & Videos in Flow AI
    
    // 1. Separate: Remove Flow AI Images
    function removeFlowImages() {
      let count = 0;

      // Click all close / remove / dismiss buttons on image chips
      const imageChips = Array.from(document.querySelectorAll('img, [data-testid*="image" i], [aria-label*="image" i], .attachment-item'));
      imageChips.forEach(chip => {
        const closeBtn = chip.parentElement?.querySelector('button, [role="button"], svg');
        if (closeBtn) {
          try { closeBtn.click(); count++; } catch(e) {}
        }
      });

      // Target all Material & standard dismiss buttons
      const allDismissBtns = Array.from(document.querySelectorAll('button[aria-label*="remove" i], button[aria-label*="dismiss" i], button[aria-label*="delete" i], button[aria-label*="clear" i], button[aria-label*="close" i], [data-testid*="remove" i], [data-testid*="delete" i], .delete-btn, .remove-btn, .close-button, svg path[d*="19 6.41"], svg path[d*="M19 6.41"]'));
      allDismissBtns.forEach(el => {
        try {
          const btn = el.tagName === "BUTTON" || el.getAttribute("role") === "button" ? el : el.closest("button, [role='button']");
          if (btn) { btn.click(); count++; }
        } catch(e) {}
      });

      // Reset all file inputs
      const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
      fileInputs.forEach(fi => {
        try {
          fi.value = "";
          fi.dispatchEvent(new Event("change", { bubbles: true }));
          fi.dispatchEvent(new Event("input", { bubbles: true }));
          count++;
        } catch(e) {}
      });

      alert("🖼️ Berhasil menghapus seluruh lampiran gambar di Flow AI!");
    }

    // 2. Separate: Remove Flow AI Videos
    function removeFlowVideos() {
      let count = 0;
      const videos = Array.from(document.querySelectorAll("video"));
      videos.forEach(v => {
        try {
          v.pause();
          v.removeAttribute("src");
          v.src = "";
          v.load();
          const card = v.closest(".video-card, .output-card, [data-testid*='video'], .result-container");
          if (card) {
            const delBtn = card.querySelector('button[aria-label*="delete" i], button[aria-label*="remove" i], [data-testid*="delete" i]');
            if (delBtn) delBtn.click();
          }
          count++;
        } catch(e) {}
      });

      detectedVideoUrl = null;
      alert("🎬 Berhasil menghapus/membersihkan video hasil render di Flow AI!");
    }

    // 3. Create Brand New Project
    function createNewProject() {
      if (confirm("Buat Project Baru? Storyboard akan di-reset ke Scene 1 bersih.")) {
        scenes = [
          {
            id: 1,
            shotType: "Hook Close-Up",
            aspectRatio: "9:16",
            duration: 4,
            promptVideo: "Cinematic commercial macro shot of product in aesthetic setting, 8k 60fps",
            voiceover: "Stop scrolling! Ini rahasia produk yang lagi viral!",
            imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
          }
        ];
        activeSceneIndex = 0;
        detectedVideoUrl = null;

        // Try clicking New Project / Create in Flow AI web UI
        const newProjectBtn = Array.from(document.querySelectorAll('button, a')).find(el => {
          const txt = (el.textContent || el.getAttribute("aria-label") || "").toLowerCase();
          return txt.includes("new project") || txt.includes("create project") || txt.includes("proyek baru");
        });
        if (newProjectBtn) {
          try { newProjectBtn.click(); } catch(e) {}
        }

        render();
        alert("✨ Project Baru Berhasil Dibuat! Siap untuk merancang storyboard baru.");
      }
    }


  function attachVideoStudioListeners() {
    const currentScene = scenes[activeSceneIndex] || scenes[0];

    // Scene Tab Switching
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

    wrapper.querySelector('#btn-add-scene-compact')?.addEventListener('click', (e) => {
      e.stopPropagation();
      scenes.push({
        id: scenes.length + 1,
        shotType: "Close-Up",
        aspectRatio: "9:16",
        duration: 6,
        promptVideo: "Smooth dynamic camera motion showing product benefits, 4k 60fps",
        voiceover: "Klik keranjang kuning sekarang mumpung diskon spesial!",
        imageUrl: scenes[0]?.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
      });
      activeSceneIndex = scenes.length - 1;
      render();
    });

    wrapper.querySelector('#inp-scene-dur')?.addEventListener('change', (e) => {
      scenes[activeSceneIndex].duration = parseInt(e.target.value) || 6;
    });

    wrapper.querySelector('#inp-aspect-ratio')?.addEventListener('change', (e) => {
      scenes[activeSceneIndex].aspectRatio = e.target.value;
    });

    wrapper.querySelector('#inp-prompt-video')?.addEventListener('input', (e) => {
      scenes[activeSceneIndex].promptVideo = e.target.value;
    });

    wrapper.querySelector('#inp-voiceover')?.addEventListener('input', (e) => {
      scenes[activeSceneIndex].voiceover = e.target.value;
    });

    wrapper.querySelector('#btn-crop-storyboard')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openCropModal(scenes[activeSceneIndex].imageUrl, (res) => {
        scenes[activeSceneIndex].imageUrl = res;
        render();
      });
    });

    // 1-Click Video Download
    wrapper.querySelector('#btn-download-video-now')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoEl = document.querySelector('video');
      const videoSrc = (videoEl && (videoEl.currentSrc || videoEl.src)) || detectedVideoUrl;
      if (videoSrc) {
        triggerDirectDownload(videoSrc, "FlowAI-Scene-" + (activeSceneIndex + 1) + ".mp4");
        alert("📥 Video Scene " + (activeSceneIndex + 1) + " sedang diunduh!");
      } else {
        alert("Video belum selesai digenerate di Flow AI. Silakan tunggu render selesai.");
      }
    });

    // 1-Click Image Download
    wrapper.querySelector('#btn-download-img-now')?.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerDirectDownload(currentScene.imageUrl, "FlowAI-Image-Scene-" + (activeSceneIndex + 1) + ".jpg");
      alert("🖼️ Gambar Scene " + (activeSceneIndex + 1) + " sedang diunduh!");
    });

    // Push to Web
    wrapper.querySelector('#btn-push-to-web')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const videoEl = document.querySelector('video');
      const videoSrc = (videoEl && (videoEl.currentSrc || videoEl.src)) || detectedVideoUrl;
      await sendGeneratedAssetToWeb(activeSceneIndex + 1, videoSrc, currentScene.imageUrl, currentScene.promptVideo);
      alert("✅ Aset Scene " + (activeSceneIndex + 1) + " berhasil dikirim ke Galeri Web AffiliateGo!");
    });

    // Zero-Touch Auto Generate
    wrapper.querySelector('#btn-auto-generate-now')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      await executeFlowAiInjection(activeSceneIndex, true);
    });

    setupStoryboardImageUpload();
    wrapper.querySelector("#btn-clear-all-flow-assets")?.addEventListener("click", (e) => {
      e.stopPropagation();
      removeAllUploadedFlowAssets();
    });
  }

  function attachNanoBananaListeners() {
    wrapper.querySelector('#inp-banana-model')?.addEventListener('change', (e) => {
      bananaState.model = e.target.value;
    });
    wrapper.querySelector('#inp-banana-aspect')?.addEventListener('change', (e) => {
      bananaState.aspectRatio = e.target.value;
    });
    wrapper.querySelector('#inp-banana-prompt')?.addEventListener('input', (e) => {
      bananaState.prompt = e.target.value;
    });

    wrapper.querySelector('#btn-crop-banana')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openCropModal(bananaState.imageUrl, (res) => {
        bananaState.imageUrl = res;
        render();
      });
    });

    wrapper.querySelector('#btn-download-banana-img')?.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerDirectDownload(bananaState.imageUrl, "NanoBanana-" + bananaState.model + ".jpg");
      alert("🖼️ Gambar Nano Banana berhasil diunduh!");
    });

    wrapper.querySelector('#btn-generate-banana-now')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const btn = wrapper.querySelector('#btn-generate-banana-now');
      btn.innerText = "⏳ Merancang " + bananaState.model + "...";
      btn.disabled = true;

      // Injeksi Prompt Nano Banana ke Chat Flow AI
      const promptText = "[Model: " + bananaState.model + ", " + bananaState.aspectRatio + "]: " + bananaState.prompt;
      await executeRawTextAndImageInjection(promptText, bananaState.imageUrl);

      setTimeout(() => {
        btn.innerHTML = ICONS.bolt + "<span>Generate Nano Banana</span>";
        btn.disabled = false;
        alert("✅ Prompt & Gambar " + bananaState.model + " berhasil dikirim ke generator Flow AI!");
      }, 800);
    });

    const slot = wrapper.querySelector('#slot-banana-image');
    const inp = wrapper.querySelector('#input-file-banana');
    if (slot && inp) {
      slot.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) inp.click();
      });
      inp.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          bananaState.imageUrl = evt.target.result;
          render();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function setupStoryboardImageUpload() {
    const slot = wrapper.querySelector('#slot-storyboard-scene');
    const inp = wrapper.querySelector('#input-file-storyboard');
    if (slot && inp) {
      slot.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) inp.click();
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

  async function urlOrBase64ToBlob(urlOrData) {
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
        return new Blob([u8arr], { type: mime });
      } else {
        const res = await fetch(urlOrData);
        return await res.blob();
      }
    } catch(e) { return null; }
  }

  // BULLETPROOF INJECTION & ZERO-TOUCH AUTO GENERATE
  async function executeFlowAiInjection(sceneIdx, autoClickGenerate = false) {
    const sc = scenes[sceneIdx] || scenes[0];
    const aspect = sc.aspectRatio || "9:16";
    const promptText = "[Scene " + (sceneIdx + 1) + " (" + sc.duration + "s, " + aspect + ")]: " + sc.promptVideo;
    await executeRawTextAndImageInjection(promptText, sc.imageUrl, autoClickGenerate);
  }

  async function executeRawTextAndImageInjection(promptText, imgSrc, autoClickGenerate = false) {
    if (imgSrc) {
      try {
        const blob = await urlOrBase64ToBlob(imgSrc);
        if (blob) {
          const file = new File([blob], "flow-asset.jpg", { type: blob.type || "image/jpeg" });
          const dt = new DataTransfer();
          dt.items.add(file);

          const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
          for (const fi of fileInputs) {
            try {
              fi.files = dt.files;
              fi.dispatchEvent(new Event('change', { bubbles: true }));
              fi.dispatchEvent(new Event('input', { bubbles: true }));
            } catch(e) {}
          }

          const dropTargets = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"], form'));
          for (const target of dropTargets) {
            try {
              target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
              target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
            } catch(e) {}
          }
        }
      } catch(e) {}
    }

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

    let targetPromptEl = null;
    for (const selector of promptSelectors) {
      const candidates = Array.from(document.querySelectorAll(selector));
      const filtered = candidates.filter(el => {
        const ph = (el.getAttribute('placeholder') || '').toLowerCase();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        return !ph.includes('search') && !ph.includes('cari') && !aria.includes('search');
      });
      if (filtered.length > 0) {
        targetPromptEl = filtered[0];
        break;
      }
    }

    if (targetPromptEl) {
      targetPromptEl.focus();
      if (targetPromptEl.tagName === "TEXTAREA" || targetPromptEl.tagName === "INPUT") {
        targetPromptEl.value = promptText;
        targetPromptEl.dispatchEvent(new Event("input", { bubbles: true }));
        targetPromptEl.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        targetPromptEl.innerText = promptText;
        targetPromptEl.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: promptText }));
      }

      if (autoClickGenerate) {
        setTimeout(() => {
          const btnCandidates = Array.from(document.querySelectorAll('button[aria-label*="generate" i], button[aria-label*="send" i], button[aria-label*="submit" i], button[type="submit"], [data-testid*="send" i], [data-testid*="generate" i]'));
          let clicked = false;
          for (const btn of btnCandidates) {
            if (!btn.disabled && btn.offsetParent !== null) {
              btn.click();
              clicked = true;
              break;
            }
          }
          if (!clicked) {
            targetPromptEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
        }, 500);
      }
    } else {
      navigator.clipboard.writeText(promptText);
    }
  }

  function openCropModal(imgSrc, callback) {
    if (!imgSrc) return;

    const cropOverlay = document.createElement('div');
    cropOverlay.className = 'crop-modal-overlay';
    cropOverlay.innerHTML = `
      <div class="crop-dialog">
        <div style="font-size:11px; font-weight:bold; color:#f59e0b;">✂ Crop Foto</div>
        <div style="width:100%; aspect-ratio:9/16; max-height:160px; overflow:hidden; border-radius:8px; background:#000; display:flex; align-items:center; justify-content:center;">
          <img id="crop-preview-img" src="${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:4px;">
          <button id="btn-crop-9-16" style="background:#ea580c; color:#fff; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">9:16 TikTok</button>
          <button id="btn-crop-1-1" style="background:#f59e0b; color:#000; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">1:1 Square</button>
          <button id="btn-crop-cancel" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">Batal</button>
        </div>
      </div>
    `;
    shadow.appendChild(cropOverlay);

    cropOverlay.querySelector('#btn-crop-cancel').addEventListener('click', () => cropOverlay.remove());

    cropOverlay.querySelector('#btn-crop-1-1').addEventListener('click', () => {
      cropImageToRatio(imgSrc, 1, 1, (res) => {
        callback(res);
        cropOverlay.remove();
      });
    });

    cropOverlay.querySelector('#btn-crop-9-16').addEventListener('click', () => {
      cropImageToRatio(imgSrc, 9, 16, (res) => {
        callback(res);
        cropOverlay.remove();
      });
    });
  }

  function cropImageToRatio(src, ratioW, ratioH, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let targetW, targetH;
      const srcRatio = img.width / img.height;
      const targetRatio = ratioW / ratioH;

      if (srcRatio > targetRatio) {
        targetH = img.height;
        targetW = img.height * targetRatio;
      } else {
        targetW = img.width;
        targetH = img.width / targetRatio;
      }

      canvas.width = 600;
      canvas.height = Math.round(600 / targetRatio);
      const ctx = canvas.getContext('2d');
      const sx = (img.width - targetW) / 2;
      const sy = (img.height - targetH) / 2;
      ctx.drawImage(img, sx, sy, targetW, targetH, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = src;
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragTarget = handle || element;

    dragTarget.addEventListener('mousedown', dragMouseDown);
    dragTarget.addEventListener('touchstart', dragTouchStart, { passive: true });

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.closest('button')) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function dragTouchStart(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.closest('button')) return;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.addEventListener('touchend', closeDragTouch);
      document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      host.style.transform = 'none';
      host.style.top = Math.max(0, host.offsetTop - pos2) + "px";
      host.style.left = Math.max(0, host.offsetLeft - pos1) + "px";
    }

    function elementTouchDrag(e) {
      const touch = e.touches[0];
      const moveDist = Math.hypot(touch.clientX - pos3, touch.clientY - pos4);
      if (moveDist > 3) {
        if (e.cancelable) {
          try { e.preventDefault(); } catch(err) {}
        }
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        host.style.transform = "none";
        host.style.top = Math.max(0, host.offsetTop - pos2) + "px";
        host.style.left = Math.max(0, host.offsetLeft - pos1) + "px";
      }
    }

    function closeDragElement() {
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
    }

    function closeDragTouch() {
      document.removeEventListener('touchend', closeDragTouch);
      document.removeEventListener('touchmove', elementTouchDrag);
    }
  }

  function setupResizeHandler(studio, gripper) {
    if (!studio || !gripper) return;
    let startX, startY, startWidth, startHeight;

    gripper.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(studio).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(studio).height, 10);
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    });

    gripper.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(studio).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(studio).height, 10);
      document.addEventListener('touchmove', doTouchResize, { passive: false });
      document.addEventListener('touchend', stopTouchResize);
    }, { passive: false });

    function doResize(e) {
      studio.style.width = Math.max(260, startWidth + e.clientX - startX) + 'px';
      studio.style.height = Math.max(220, startHeight + e.clientY - startY) + 'px';
    }

    function doTouchResize(e) { if (e.cancelable) { try { e.preventDefault(); } catch(err) {} }
      const touch = e.touches[0];
      studio.style.width = Math.max(260, startWidth + touch.clientX - startX) + 'px';
      studio.style.height = Math.max(220, startHeight + touch.clientY - startY) + 'px';
    }

    function stopResize() {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    }

    function stopTouchResize() {
      document.removeEventListener('touchmove', doTouchResize);
      document.removeEventListener('touchend', stopTouchResize);
    }
  }

  autoSyncStoryboardFromWeb();
  startVideoWatcher();
  render();
})();
