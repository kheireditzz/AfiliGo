const fs = require('fs');
const path = require('path');

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

const contentJs = `// Flow Ai Auto v9.0 - Unified Storyboard Scene & Full Auto-Generate Runner (Zero-Touch & Manual)
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

  // Embedded Pure SVG Icons (100% CSP Safe & Crisp)
  const ICONS = {
    bolt: \`<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>\`,
    image: \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>\`,
    play: \`<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>\`,
    stop: \`<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>\`,
    sync: \`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>\`,
    crop: \`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>\`,
    minus: \`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>\`,
    plus: \`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\`,
    arrowRight: \`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>\`,
    chevronUp: \`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>\`
  };

  const style = document.createElement('style');
  style.textContent = \`
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
      width: 300px;
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
      max-height: 82vh;
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
      padding: 4px 6px;
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

    /* Unified Storyboard Visual Preview Slot */
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

    /* Primary Buttons */
    .btn-auto-now {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      border: 1px solid #f97316;
      color: #fff;
      padding: 7px 9px;
      border-radius: 8px;
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

    .btn-manual-inject {
      background: linear-gradient(135deg, #083344, #0e7490);
      border: 1px solid #06b6d4;
      color: #a5f3fc;
      padding: 7px 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 9.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .btn-auto-sequence {
      background: linear-gradient(135deg, #15803d, #16a34a);
      border: 1px solid #4ade80;
      color: #fff;
      padding: 7px 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 9.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .btn-auto-sequence.running {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      border-color: #f87171;
    }

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
  \`;
  shadow.appendChild(style);

  let isMinimized = false;
  let activeSceneIndex = 0;
  let isAutoRunning = false;
  let autoTimerInterval = null;
  let currentZoom = 1.0;

  // Unified Storyboard Scenes (Contains Combined Product + Model + Location in 1 complete frame)
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

  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);

  // Auto-Sync Unified Storyboards from AffiliateGo Web API
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
          render();
        }
      }).catch(() => {});
  }

  function render() {
    if (isMinimized) {
      host.style.top = '10px';
      host.style.left = '50%';
      host.style.transform = 'translateX(-50%)';
      wrapper.innerHTML = \`
        <div class="floating-pill" id="btn-expand-pill" title="Buka Flow Ai Auto">
          <div class="pill-icon">\${ICONS.bolt}</div>
          <span>Flow Ai Auto</span>
          <span style="font-size:8.5px; color:#fb923c; font-family:monospace;">S\${activeSceneIndex+1}</span>
        </div>
      \`;
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

      wrapper.innerHTML = \`
        <div class="floating-studio" id="main-floating-studio" style="transform:scale(\${currentZoom});">
          <!-- Header -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:6px;">
              <div class="pill-icon">\${ICONS.bolt}</div>
              <span style="font-size:11px; font-weight:800; color:#fff;">Flow Ai Auto</span>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil Ukuran">\${ICONS.minus}</button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar Ukuran">\${ICONS.plus}</button>
              <button class="btn-ctrl" id="btn-sync-web-mini" style="color:#6ee7b7;" title="Ambil Storyboard dari Web">\${ICONS.sync}</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">\${ICONS.chevronUp}</button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Scene Pills -->
            <div class="scene-nav-bar" id="scene-pills-bar">
              \${scenes.map((s, i) => \`
                <button class="scene-tab-pill \${i === activeSceneIndex ? 'active' : ''}" data-idx="\${i}">
                  SCENE \${i+1}
                </button>
              \`).join("")}
              <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ Scene</button>
            </div>

            <!-- Unified Storyboard Card (Contains Combined Product + Model + Location in 1 image) -->
            <div class="card-section">
              <div style="display:grid; grid-template-columns: 58px 1fr; gap:6px; align-items:center;">
                <div class="storyboard-slot" id="slot-storyboard-scene" title="Gambar Storyboard Scene (Klik untuk Ganti / Upload)">
                  <img src="\${currentScene.imageUrl}">
                  <button class="btn-slot-crop" id="btn-crop-storyboard">\${ICONS.crop}</button>
                  <span class="slot-badge">Scene \${activeSceneIndex+1}</span>
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
                      <option value="4" \${currentScene.duration == 4 ? 'selected' : ''}>4s (4 Detik)</option>
                      <option value="6" \${currentScene.duration == 6 ? 'selected' : ''}>6s (6 Detik)</option>
                      <option value="8" \${currentScene.duration == 8 ? 'selected' : ''}>8s (8 Detik)</option>
                      <option value="10" \${currentScene.duration == 10 ? 'selected' : ''}>10s (10 Detik)</option>
                    </select>
                    <select class="select-input" id="inp-aspect-ratio">
                      <option value="9:16" \${currentScene.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (TikTok)</option>
                      <option value="16:9" \${currentScene.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (YouTube)</option>
                      <option value="1:1" \${currentScene.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                    </select>
                  </div>
                  <input type="text" class="input-text" id="inp-prompt-video" style="color:#fef08a; font-size:8.5px;" value="\${currentScene.promptVideo}" placeholder="Prompt Video Motion Scene \${activeSceneIndex+1}">
                </div>
              </div>

              <!-- Full Voiceover / Script Input -->
              <input type="text" class="input-text" id="inp-voiceover" style="color:#34d399; font-size:8.5px;" value="\${currentScene.voiceover || ''}" placeholder="Voiceover / Naskah Narasi Scene \${activeSceneIndex+1}">
            </div>

            <!-- Action Controls (Zero-Touch Auto Generate vs Manual Inject) -->
            <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:4px;">
              <!-- Zero-Touch Auto Generate -->
              <button class="btn-auto-now" id="btn-auto-generate-now" title="Otomatis Injeksi Gambar + Prompt dan Langsung Klik Generate di Flow AI Tanpa Sentuh!">
                \${ICONS.bolt}
                <span>Auto Gen S\${activeSceneIndex+1}</span>
              </button>

              <!-- Manual Inject -->
              <button class="btn-manual-inject" id="btn-manual-inject-only" title="Injeksi Gambar + Prompt ke Chat (Generate Manual)">
                \${ICONS.arrowRight}
                <span>Inject S\${activeSceneIndex+1}</span>
              </button>
            </div>

            <!-- Auto-Sequence Runner (S1 -> S2 -> S3...) -->
            <button class="btn-auto-sequence \${isAutoRunning ? 'running' : ''}" id="btn-toggle-auto-runner" title="Otomatis Jalankan Seluruh Scene Berurutan">
              \${isAutoRunning ? ICONS.stop : ICONS.play}
              <span>\${isAutoRunning ? 'Stop Auto-Sequence' : '🚀 Auto-Run Semua Scene (S1..S' + scenes.length + ')'}</span>
            </button>

          </div>

          <div class="resize-handle" id="gripper-resize" title="Tarik sudut untuk ubah ukuran"></div>
        </div>
      \`;

      // Zoom In / Out Handlers
      wrapper.querySelector('#btn-zoom-in').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentZoom < 1.35) {
          currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = \`scale(\${currentZoom})\`;
        }
      });
      wrapper.querySelector('#btn-zoom-out').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentZoom > 0.7) {
          currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = \`scale(\${currentZoom})\`;
        }
      });

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

      wrapper.querySelector('#btn-minimize-studio').addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = true;
        render();
      });

      wrapper.querySelector('#btn-add-scene-compact').addEventListener('click', (e) => {
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

      wrapper.querySelector('#btn-sync-web-mini').addEventListener('click', (e) => {
        e.stopPropagation();
        autoSyncStoryboardFromWeb();
        alert("✅ Gambar Storyboard & Naskah berhasil disinkronkan dari web AffiliateGo!");
      });

      const durSelect = wrapper.querySelector('#inp-scene-dur');
      if (durSelect) {
        durSelect.addEventListener('change', (e) => {
          scenes[activeSceneIndex].duration = parseInt(e.target.value) || 6;
        });
      }

      const aspectSelect = wrapper.querySelector('#inp-aspect-ratio');
      if (aspectSelect) {
        aspectSelect.addEventListener('change', (e) => {
          scenes[activeSceneIndex].aspectRatio = e.target.value;
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

      // Crop Button
      const cropBtn = wrapper.querySelector('#btn-crop-storyboard');
      if (cropBtn) {
        cropBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCropModal();
        });
      }

      // Zero-Touch Auto Generate (Inject + Click Generate Button in Flow AI)
      wrapper.querySelector('#btn-auto-generate-now').addEventListener('click', async (e) => {
        e.stopPropagation();
        await executeFlowAiInjection(activeSceneIndex, true);
      });

      // Manual Inject Only
      wrapper.querySelector('#btn-manual-inject-only').addEventListener('click', async (e) => {
        e.stopPropagation();
        await executeFlowAiInjection(activeSceneIndex, false);
      });

      // Sequential Runner
      wrapper.querySelector('#btn-toggle-auto-runner').addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAutoRunning) {
          stopAutoRunner();
        } else {
          startAutoRunner();
        }
      });

      setupStoryboardImageUpload();
      makeDraggable(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#studio-drag-bar'));
      setupResizeHandler(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#gripper-resize'));
    }
  }

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
    await executeFlowAiInjection(activeSceneIndex, true);

    const curDur = scenes[activeSceneIndex].duration || 6;
    let secondsLeft = curDur + 24;

    if (autoTimerInterval) clearInterval(autoTimerInterval);

    autoTimerInterval = setInterval(() => {
      if (!isAutoRunning) {
        clearInterval(autoTimerInterval);
        return;
      }

      secondsLeft--;
      const videos = document.querySelectorAll('video');
      const hasNewVideo = videos.length > 0;

      if (secondsLeft <= 0 || (secondsLeft < 12 && hasNewVideo)) {
        clearInterval(autoTimerInterval);
        setTimeout(() => {
          if (!isAutoRunning) return;
          if (activeSceneIndex + 1 < scenes.length) {
            activeSceneIndex++;
            render();
            runCurrentSceneInSequence();
          } else {
            alert('🎉 Semua Scene Storyboard Selesai Digenerate!');
            stopAutoRunner();
          }
        }, 2500);
      }
    }, 1000);
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
    const imgSrc = sc.imageUrl;

    // 1. Injeksi File Gambar Storyboard ke Flow AI (Single Clean Dispatch)
    if (imgSrc) {
      try {
        const blob = await urlOrBase64ToBlob(imgSrc);
        if (blob) {
          const file = new File([blob], "storyboard-scene-" + (sceneIdx + 1) + ".jpg", { type: blob.type || "image/jpeg" });
          const dt = new DataTransfer();
          dt.items.add(file);

          // Trigger input[type="file"]
          const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
          for (const fi of fileInputs) {
            try {
              fi.files = dt.files;
              fi.dispatchEvent(new Event('change', { bubbles: true }));
              fi.dispatchEvent(new Event('input', { bubbles: true }));
            } catch(e) {}
          }

          // Trigger Paste on Active Element / Textarea
          const dropTargets = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"], form'));
          for (const target of dropTargets) {
            try {
              target.dispatchEvent(new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dt
              }));
              target.dispatchEvent(new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dt
              }));
            } catch(e) {}
          }
        }
      } catch(e) {}
    }

    // 2. Injeksi Prompt Text ke Kotak Prompt / Chat Area
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

      // 3. ZERO-TOUCH AUTO GENERATE (Klik tombol generate di Flow AI tanpa disentuh)
      if (autoClickGenerate) {
        setTimeout(() => {
          // Cari tombol generate / submit / arrow
          const btnCandidates = Array.from(document.querySelectorAll('button[aria-label*="generate" i], button[aria-label*="send" i], button[aria-label*="submit" i], button[type="submit"], [data-testid*="send" i], [data-testid*="generate" i]'));
          let clicked = false;
          for (const btn of btnCandidates) {
            if (!btn.disabled && btn.offsetParent !== null) {
              btn.click();
              clicked = true;
              break;
            }
          }

          // Fallback Enter key event
          if (!clicked) {
            targetPromptEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
        }, 500);
      }
    } else {
      navigator.clipboard.writeText(promptText);
    }
  }

  function openCropModal() {
    const sc = scenes[activeSceneIndex];
    const imgSrc = sc.imageUrl;
    if (!imgSrc) return;

    const cropOverlay = document.createElement('div');
    cropOverlay.className = 'crop-modal-overlay';
    cropOverlay.innerHTML = \`
      <div class="crop-dialog">
        <div style="font-size:11px; font-weight:bold; color:#f59e0b;">✂ Crop Storyboard Scene \${activeSceneIndex + 1}</div>
        <div style="width:100%; aspect-ratio:9/16; max-height:160px; overflow:hidden; border-radius:8px; background:#000; display:flex; align-items:center; justify-content:center;">
          <img id="crop-preview-img" src="\${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:4px;">
          <button id="btn-crop-9-16" style="background:#ea580c; color:#fff; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">9:16 TikTok</button>
          <button id="btn-crop-1-1" style="background:#f59e0b; color:#000; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">1:1 Square</button>
          <button id="btn-crop-cancel" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:6px; padding:5px; font-size:8.5px; font-weight:bold; cursor:pointer;">Batal</button>
        </div>
      </div>
    \`;
    shadow.appendChild(cropOverlay);

    cropOverlay.querySelector('#btn-crop-cancel').addEventListener('click', () => cropOverlay.remove());

    cropOverlay.querySelector('#btn-crop-1-1').addEventListener('click', () => {
      cropImageToRatio(imgSrc, 1, 1, (res) => {
        scenes[activeSceneIndex].imageUrl = res;
        cropOverlay.remove();
        render();
      });
    });

    cropOverlay.querySelector('#btn-crop-9-16').addEventListener('click', () => {
      cropImageToRatio(imgSrc, 9, 16, (res) => {
        scenes[activeSceneIndex].imageUrl = res;
        cropOverlay.remove();
        render();
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
      if (moveDist > 4) {
        e.preventDefault();
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        host.style.transform = 'none';
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

    function doTouchResize(e) {
      e.preventDefault();
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
  render();
})();
`;

fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);
console.log("Flow Ai Auto v9.0 generated successfully with Unified Storyboard & Zero-Touch Auto Generate!");
