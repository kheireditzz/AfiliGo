const fs = require('fs');
const path = require('path');

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

const contentJs = `// Flow Ai Extension v5.0 - Ultra-Compact Micro Bar with Full Mobile Touch & Mouse Drag
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
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = \`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    /* Ultra-Compact Minimized Pill */
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, rgba(13, 17, 30, 0.98), rgba(20, 26, 46, 0.98));
      border: 1.5px solid rgba(249, 115, 22, 0.8);
      border-radius: 9999px;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      cursor: grab;
      touch-action: none;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8), 0 0 14px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      user-select: none;
    }
    .pill-icon {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
    }

    /* Ultra-Compact Mini Floating Studio (Small & Slim) */
    .floating-studio {
      width: 290px;
      max-width: 94vw;
      max-height: 80vh;
      background: linear-gradient(180deg, #0b0f19 0%, #060810 100%);
      border: 1.5px solid rgba(249, 115, 22, 0.6);
      border-radius: 14px;
      color: #f8fafc;
      box-shadow: 0 16px 40px rgba(0,0,0,0.95), 0 0 20px rgba(249, 115, 22, 0.2);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      resize: both;
      animation: popIn 0.15s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 6px 10px;
      background: rgba(15, 23, 42, 0.98);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      touch-action: none;
      user-select: none;
      flex-shrink: 0;
    }
    .studio-body {
      padding: 8px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

    .btn-ctrl {
      background: #1e293b;
      color: #cbd5e1;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 9px;
      font-weight: bold;
    }

    .card-section {
      background: rgba(13, 19, 34, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 9px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .input-text, .select-input {
      width: 100%;
      background: #030712;
      border: 1px solid #1f2937;
      border-radius: 6px;
      color: #fff;
      padding: 4px 6px;
      font-size: 9px;
      outline: none;
    }
    .input-text:focus, .select-input:focus { border-color: #f97316; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }

    /* Scene Navigation Pills */
    .scene-nav-bar {
      display: flex;
      align-items: center;
      gap: 3px;
      overflow-x: auto;
      padding-bottom: 1px;
    }
    .scene-tab-pill {
      padding: 3px 6px;
      border-radius: 5px;
      font-size: 8px;
      font-weight: 800;
      font-family: monospace;
      cursor: pointer;
      border: 1px solid #334155;
      background: #0f172a;
      color: #94a3b8;
      white-space: nowrap;
    }
    .scene-tab-pill.active {
      background: #ea580c;
      color: #fff;
      border-color: #f97316;
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
    }

    .image-slot-mini {
      aspect-ratio: 1;
      border-radius: 6px;
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
    .image-slot-mini img { width: 100%; height: 100%; object-fit: cover; }
    .btn-slot-crop {
      position: absolute;
      top: 1px;
      right: 1px;
      background: rgba(0,0,0,0.85);
      color: #f59e0b;
      border: 1px solid rgba(255,255,255,0.2);
      font-size: 6.5px;
      font-weight: bold;
      padding: 1px 3px;
      border-radius: 3px;
      cursor: pointer;
    }

    .btn-action-primary {
      background: linear-gradient(135deg, #083344, #0e7490);
      border: 1.5px solid #06b6d4;
      color: #a5f3fc;
      padding: 6px 8px;
      border-radius: 7px;
      font-weight: 800;
      font-size: 9.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .btn-action-primary:active { transform: scale(0.97); }

    .btn-auto-sequence {
      background: linear-gradient(135deg, #15803d, #16a34a);
      border: 1.5px solid #4ade80;
      color: #fff;
      padding: 6px 8px;
      border-radius: 7px;
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
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, #f97316 50%);
      border-bottom-right-radius: 12px;
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
      padding: 10px;
    }
    .crop-dialog {
      background: #0d121f;
      border: 1.5px solid #ea580c;
      border-radius: 12px;
      padding: 10px;
      width: 270px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #fff;
    }
  \`;
  shadow.appendChild(style);

  let isMinimized = true;
  let activeSceneIndex = 0;
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
          alert("✅ Berhasil mengimpor Scene 1.." + scenes.length + " dari AffiliateGo!");
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
      host.style.top = '10px';
      host.style.left = '50%';
      host.style.transform = 'translateX(-50%)';
      wrapper.innerHTML = \`
        <div class="floating-pill" id="btn-expand-pill" title="Klik untuk membuka Flow AI Studio">
          <div class="pill-icon">⚡</div>
          <span>Flow AI</span>
          <span style="font-size:8px; color:#fb923c; font-family:monospace;">SCENE \${activeSceneIndex+1}</span>
        </div>
      \`;
      wrapper.querySelector('#btn-expand-pill').addEventListener('click', () => {
        isMinimized = false;
        render();
      });
      makeDraggable(wrapper.querySelector('.floating-pill'));
    } else {
      if (activeSceneIndex >= scenes.length) activeSceneIndex = 0;
      const currentScene = scenes[activeSceneIndex] || scenes[0];
      const activeImg = currentScene.imageUrl || images.product || images.model || images.location || "";

      wrapper.innerHTML = \`
        <div class="floating-studio" id="main-floating-studio">
          <!-- Slim Drag Header -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:5px;">
              <div class="pill-icon">⚡</div>
              <span style="font-size:10px; font-weight:800; color:#fff;">Flow AI (Mini)</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:3px;">
              <button class="btn-ctrl" id="btn-sync-web-mini" style="color:#6ee7b7; font-size:8px; width:auto; padding:0 4px;" title="Sync dari Web">📥 Sync</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">-</button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Scene Pills -->
            <div class="scene-nav-bar" id="scene-pills-bar">
              \${scenes.map((s, i) => \`
                <button class="scene-tab-pill \${i === activeSceneIndex ? 'active' : ''}" data-idx="\${i}">
                  S\${i+1}
                </button>
              \`).join("")}
              <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ S</button>
            </div>

            <!-- Compact Active Scene -->
            <div class="card-section">
              <div style="display:grid; grid-template-columns: 52px 1fr; gap:6px; align-items:center;">
                <div class="image-slot-mini" id="slot-scene-active" style="height:52px; width:52px;">
                  \${activeImg ? \`<img src="\${activeImg}"><button class="btn-slot-crop" id="btn-crop-scene-active">✂</button>\` : \`<div style="font-size:7px; color:#94a3b8;">+ Foto</div>\`}
                  <input type="file" id="input-file-scene-active" accept="image/*" style="display:none">
                </div>

                <div style="display:flex; flex-direction:column; gap:3px;">
                  <div class="grid-2">
                    <select class="select-input" id="inp-model-ai">
                      <option value="omni-flash" selected>Omni Flash</option>
                      <option value="veo-3.1-lite">Veo Lite</option>
                      <option value="veo-3.1-fast">Veo Fast</option>
                      <option value="veo-3.1-quality">Veo Quality</option>
                    </select>
                    <select class="select-input" id="inp-scene-dur">
                      <option value="4" \${currentScene.duration == 4 ? 'selected' : ''}>4 Detik</option>
                      <option value="6" \${currentScene.duration == 6 ? 'selected' : ''}>6 Detik</option>
                      <option value="8" \${currentScene.duration == 8 ? 'selected' : ''}>8 Detik</option>
                      <option value="10" \${currentScene.duration == 10 ? 'selected' : ''}>10 Detik</option>
                    </select>
                  </div>
                  <input type="text" class="input-text" id="inp-prompt-video" style="color:#fef08a;" value="\${currentScene.promptVideo}" placeholder="Prompt Video Scene \${activeSceneIndex+1}">
                </div>
              </div>
            </div>

            <!-- Action Buttons Grid -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
              <button class="btn-action-primary" id="btn-inject-current-scene">
                <span>🎯 Inject S\${activeSceneIndex + 1}</span>
              </button>
              
              <button class="btn-auto-sequence \${isAutoRunning ? 'running' : ''}" id="btn-toggle-auto-runner">
                <span>\${isAutoRunning ? '⏹ Stop' : '🚀 Auto Lanjut'}</span>
              </button>
            </div>

            <!-- 3 Mini Photo Slots -->
            <div class="grid-3" style="margin-top:1px;">
              <div class="image-slot-mini" id="slot-product" style="height:36px;">
                \${images.product ? \`<img src="\${images.product}">\` : \`<span style="font-size:6.5px; color:#64748b;">+Produk</span>\`}
                <input type="file" id="input-file-prod" accept="image/*" style="display:none">
              </div>
              <div class="image-slot-mini" id="slot-model" style="height:36px;">
                \${images.model ? \`<img src="\${images.model}">\` : \`<span style="font-size:6.5px; color:#64748b;">+Model</span>\`}
                <input type="file" id="input-file-mod" accept="image/*" style="display:none">
              </div>
              <div class="image-slot-mini" id="slot-location" style="height:36px;">
                \${images.location ? \`<img src="\${images.location}">\` : \`<span style="font-size:6.5px; color:#64748b;">+Lokasi</span>\`}
                <input type="file" id="input-file-loc" accept="image/*" style="display:none">
              </div>
            </div>

          </div>

          <div class="resize-handle" id="gripper-resize" title="Tarik untuk ubah ukuran"></div>
        </div>
      \`;

      // Scene Switching Event Listeners
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

      wrapper.querySelector('#btn-minimize-studio').addEventListener('click', () => {
        isMinimized = true;
        render();
      });

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

      wrapper.querySelector('#btn-sync-web-mini').addEventListener('click', () => {
        if (!tryAutoSyncFromWeb()) {
          fetchStoryboardFromAffiliateGo();
        } else {
          render();
          alert("✅ Data tersinkron!");
        }
      });

      const durSelect = wrapper.querySelector('#inp-scene-dur');
      if (durSelect) {
        durSelect.addEventListener('change', (e) => {
          scenes[activeSceneIndex].duration = parseInt(e.target.value) || 6;
        });
      }

      const promptArea = wrapper.querySelector('#inp-prompt-video');
      if (promptArea) {
        promptArea.addEventListener('input', (e) => {
          scenes[activeSceneIndex].promptVideo = e.target.value;
        });
      }

      const cropBtn = wrapper.querySelector('#btn-crop-scene-active');
      if (cropBtn) {
        cropBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCropActiveScene();
        });
      }

      wrapper.querySelector('#btn-inject-current-scene').addEventListener('click', async () => {
        await injectSingleSceneWithImage(activeSceneIndex);
      });

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
    await injectSingleSceneWithImage(activeSceneIndex);

    const curDur = scenes[activeSceneIndex].duration || 6;
    let secondsLeft = curDur + 20;

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
            alert('🎉 Semua Scene Selesai!');
            stopAutoRunner();
          }
        }, 2500);
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
    } catch(e) { return null; }
  }

  async function injectSingleSceneWithImage(sceneIdx) {
    const sc = scenes[sceneIdx] || scenes[0];
    const promptText = "[Scene " + (sceneIdx + 1) + " (" + sc.duration + "s)]: " + sc.promptVideo;
    const imgSource = sc.imageUrl || images.product || images.model || images.location;

    // 1. Upload image
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

    // 2. Inject text into prompt textarea (excluding search)
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

    let targetInput = null;
    for (const selector of promptSelectors) {
      const candidates = Array.from(document.querySelectorAll(selector));
      const filtered = candidates.filter(el => {
        const ph = (el.getAttribute('placeholder') || '').toLowerCase();
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        return !ph.includes('search') && !ph.includes('cari') && !aria.includes('search');
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
    cropOverlay.innerHTML = \`
      <div class="crop-dialog">
        <div style="font-size:10px; font-weight:bold; color:#f59e0b;">✂ Crop Scene \${activeSceneIndex + 1}</div>
        <div style="width:100%; aspect-ratio:1; overflow:hidden; border-radius:6px; background:#000; display:flex; align-items:center; justify-content:center;">
          <img id="crop-preview-img" src="\${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;">
        </div>
        <div style="display:flex; justify-content:space-between; gap:4px;">
          <button id="btn-crop-cancel" style="flex:1; background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px; font-size:9px; font-weight:bold; cursor:pointer;">Batal</button>
          <button id="btn-crop-apply" style="flex:1; background:#ea580c; color:#fff; border:none; border-radius:4px; padding:4px; font-size:9px; font-weight:bold; cursor:pointer;">Crop 1:1</button>
        </div>
      </div>
    \`;
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

  // Smooth Universal Draggable (Mouse + Touch Support for Mobile / Android)
  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragTarget = handle || element;

    // Mouse Events
    dragTarget.addEventListener('mousedown', dragMouseDown);

    // Touch Events (Mobile Kiwi / Chrome)
    dragTarget.addEventListener('touchstart', dragTouchStart, { passive: false });

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function dragTouchStart(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      e.preventDefault();
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
      e.preventDefault();
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      host.style.transform = 'none';
      host.style.top = Math.max(0, host.offsetTop - pos2) + "px";
      host.style.left = Math.max(0, host.offsetLeft - pos1) + "px";
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
      studio.style.width = Math.max(220, startWidth + e.clientX - startX) + 'px';
      studio.style.height = Math.max(180, startHeight + e.clientY - startY) + 'px';
    }

    function doTouchResize(e) {
      e.preventDefault();
      const touch = e.touches[0];
      studio.style.width = Math.max(220, startWidth + touch.clientX - startX) + 'px';
      studio.style.height = Math.max(180, startHeight + touch.clientY - startY) + 'px';
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

  tryAutoSyncFromWeb();
  render();
})();
`;

fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);
console.log("Ultra-compact content.js v5.0 with full touch and drag support successfully built!");
