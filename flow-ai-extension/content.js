// Flow Ai Auto v8.0 - Professional Studio with Multi-Image Slot (Product + Model + Location) & Anti-Duplicate Injection
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
  host.style.top = '12px';
  host.style.left = '50%';
  host.style.transform = 'translateX(-50%)';
  host.style.pointerEvents = 'auto';
  host.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Load Font Awesome icons for Shadow DOM
  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  shadow.appendChild(faLink);

  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; pointer-events: auto; }
    
    /* Minimized Capsule Bar */
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      background: linear-gradient(135deg, rgba(10, 14, 26, 0.96), rgba(18, 24, 43, 0.96));
      border: 1.5px solid rgba(249, 115, 22, 0.75);
      border-radius: 9999px;
      color: #fff;
      font-size: 10.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.85), 0 0 16px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      user-select: none;
      transition: transform 0.15s, border-color 0.15s;
    }
    .floating-pill:hover {
      transform: scale(1.04);
      border-color: #f97316;
    }
    .pill-icon {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 10px;
    }

    /* Main Modern Luxury Studio */
    .floating-studio {
      width: 310px;
      max-width: 96vw;
      background: #080b13;
      border: 1.5px solid rgba(249, 115, 22, 0.55);
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
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 8px 12px;
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
      gap: 7px;
      max-height: 82vh;
      overflow-y: auto;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

    .ctrl-group {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .btn-ctrl {
      background: #162035;
      color: #cbd5e1;
      width: 21px;
      height: 21px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
      font-weight: bold;
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
      padding: 4.5px 7px;
      font-size: 9.5px;
      outline: none;
    }
    .input-text:focus, .select-input:focus { border-color: #f97316; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }

    /* Scene Navigation Pills */
    .scene-nav-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .scene-tab-pill {
      padding: 3.5px 8px;
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

    /* 3 Visual Reference Cards (Produk, Model, Lokasi) */
    .image-slot-modern {
      aspect-ratio: 1;
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
      transition: border-color 0.15s;
    }
    .image-slot-modern:hover { border-color: #f97316; }
    .image-slot-modern img { width: 100%; height: 100%; object-fit: cover; }
    .slot-label {
      position: absolute;
      bottom: 2px;
      left: 2px;
      right: 2px;
      background: rgba(0,0,0,0.75);
      border-radius: 3px;
      font-size: 7px;
      font-weight: bold;
      color: #cbd5e1;
      padding: 1px 2px;
      text-align: center;
      pointer-events: none;
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
    }

    /* Action Buttons */
    .btn-action-primary {
      background: linear-gradient(135deg, #083344, #0e7490);
      border: 1px solid #06b6d4;
      color: #a5f3fc;
      padding: 7px 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .btn-action-primary:active { transform: scale(0.96); }

    .btn-auto-sequence {
      background: linear-gradient(135deg, #15803d, #16a34a);
      border: 1px solid #4ade80;
      color: #fff;
      padding: 7px 9px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .btn-auto-sequence.running {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      border-color: #f87171;
    }

    /* Resize Gripper */
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
  let activeSceneIndex = 0;
  let isAutoRunning = false;
  let autoTimerInterval = null;
  let currentZoom = 1.0;

  let scenes = [
    {
      id: 1,
      shotType: "Hook Close-Up",
      aspectRatio: "9:16",
      duration: 4,
      promptVideo: "Slow cinematic zoom in on product texture with studio bokeh lighting, 8k resolution",
      voiceover: "Stop scrolling! Ini produk paling worth it yang lagi viral!",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
    },
    {
      id: 2,
      shotType: "Action Demo",
      aspectRatio: "9:16",
      duration: 6,
      promptVideo: "Medium camera pan showing creator demonstrating key features enthusiastically",
      voiceover: "Langsung checkout di keranjang kuning sekarang mumpung diskon!",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400"
    }
  ];
  let images = { product: null, model: null, location: null };

  const wrapper = document.createElement('div');
  shadow.appendChild(wrapper);

  function autoSyncFromWeb() {
    try {
      const thumbProd = document.getElementById('img-thumb-product');
      const thumbMod = document.getElementById('img-thumb-model');
      const thumbLoc = document.getElementById('img-thumb-location');

      if (thumbProd && thumbProd.src && !thumbProd.classList.contains('hidden')) images.product = thumbProd.src;
      if (thumbMod && thumbMod.src && !thumbMod.classList.contains('hidden')) images.model = thumbMod.src;
      if (thumbLoc && thumbLoc.src && !thumbLoc.classList.contains('hidden')) images.location = thumbLoc.src;

      fetch('https://affiliatego.vercel.app/api/storyboards')
        .then(res => res.json())
        .then(list => {
          if (Array.isArray(list) && list.length > 0 && list[0].scenes) {
            scenes = list[0].scenes.map((s, idx) => ({
              id: idx + 1,
              shotType: s.shotType || ("Scene " + (idx + 1)),
              aspectRatio: s.aspectRatio || "9:16",
              duration: s.durationSeconds || 4,
              promptVideo: s.visualDescription || s.prompt || "Cinematic shot",
              voiceover: s.voiceover || "",
              imageUrl: s.imageUrl || images.product || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
            }));
            if (scenes[0] && scenes[0].imageUrl && !images.product) images.product = scenes[0].imageUrl;
            render();
          }
        }).catch(() => {});
    } catch(e) {}
  }

  function render() {
    if (isMinimized) {
      host.style.top = '10px';
      host.style.left = '50%';
      host.style.transform = 'translateX(-50%)';
      wrapper.innerHTML = `
        <div class="floating-pill" id="btn-expand-pill" title="Buka Flow Ai Auto">
          <div class="pill-icon"><i class="fa-solid fa-bolt"></i></div>
          <span>Flow Ai Auto</span>
          <span style="font-size:8.5px; color:#fb923c; font-family:monospace;">S${activeSceneIndex+1}</span>
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
              <div class="pill-icon"><i class="fa-solid fa-bolt"></i></div>
              <span style="font-size:11px; font-weight:800; color:#fff; font-family:inherit;">Flow Ai Auto</span>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil Ukuran"><i class="fa-solid fa-minus" style="font-size:8px;"></i></button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar Ukuran"><i class="fa-solid fa-plus" style="font-size:8px;"></i></button>
              <button class="btn-ctrl" id="btn-sync-web-mini" style="color:#6ee7b7;" title="Sync dari Web"><i class="fa-solid fa-cloud-arrow-down" style="font-size:8.5px;"></i></button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;"><i class="fa-solid fa-chevron-up" style="font-size:8px;"></i></button>
            </div>
          </div>

          <div class="studio-body">
            <!-- Scene Pills -->
            <div class="scene-nav-bar" id="scene-pills-bar">
              ${scenes.map((s, i) => `
                <button class="scene-tab-pill ${i === activeSceneIndex ? 'active' : ''}" data-idx="${i}">
                  SCENE ${i+1}
                </button>
              `).join("")}
              <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ Scene</button>
            </div>

            <!-- 3 Integrated Slots (Produk + Model + Lokasi) -->
            <div class="card-section">
              <div style="font-size:8.5px; font-weight:bold; color:#f59e0b; display:flex; justify-content:space-between;">
                <span><i class="fa-solid fa-images"></i> 3 Slot Referensi Lengkap</span>
                <span style="font-size:7.5px; color:#94a3b8;">Klik untuk Upload / Crop</span>
              </div>
              <div class="grid-3">
                <!-- Slot Produk -->
                <div class="image-slot-modern" id="slot-product" title="Upload Foto Produk">
                  ${images.product ? `<img src="${images.product}"><button class="btn-slot-crop" data-slot="product"><i class="fa-solid fa-crop"></i></button>` : `<i class="fa-solid fa-box-open" style="font-size:13px; color:#64748b;"></i>`}
                  <span class="slot-label">Produk</span>
                  <input type="file" id="input-file-prod" accept="image/*" style="display:none">
                </div>
                <!-- Slot Model -->
                <div class="image-slot-modern" id="slot-model" title="Upload Foto Model">
                  ${images.model ? `<img src="${images.model}"><button class="btn-slot-crop" data-slot="model"><i class="fa-solid fa-crop"></i></button>` : `<i class="fa-solid fa-user" style="font-size:13px; color:#64748b;"></i>`}
                  <span class="slot-label">Model</span>
                  <input type="file" id="input-file-mod" accept="image/*" style="display:none">
                </div>
                <!-- Slot Lokasi -->
                <div class="image-slot-modern" id="slot-location" title="Upload Foto Lokasi">
                  ${images.location ? `<img src="${images.location}"><button class="btn-slot-crop" data-slot="location"><i class="fa-solid fa-crop"></i></button>` : `<i class="fa-solid fa-mountain-sun" style="font-size:13px; color:#64748b;"></i>`}
                  <span class="slot-label">Lokasi</span>
                  <input type="file" id="input-file-loc" accept="image/*" style="display:none">
                </div>
              </div>
            </div>

            <!-- Parameters Card -->
            <div class="card-section">
              <div class="grid-3">
                <select class="select-input" id="inp-model-ai">
                  <option value="omni-flash" selected>Omni Flash</option>
                  <option value="veo-3.1-lite">Veo Lite</option>
                  <option value="veo-3.1-fast">Veo Fast</option>
                  <option value="veo-3.1-quality">Veo Quality</option>
                </select>
                <select class="select-input" id="inp-scene-dur">
                  <option value="4" ${currentScene.duration == 4 ? 'selected' : ''}>4s (4 Detik)</option>
                  <option value="6" ${currentScene.duration == 6 ? 'selected' : ''}>6s (6 Detik)</option>
                  <option value="8" ${currentScene.duration == 8 ? 'selected' : ''}>8s (8 Detik)</option>
                  <option value="10" ${currentScene.duration == 10 ? 'selected' : ''}>10s (10 Detik)</option>
                </select>
                <select class="select-input" id="inp-aspect-ratio">
                  <option value="9:16" ${currentScene.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (TikTok)</option>
                  <option value="16:9" ${currentScene.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
                  <option value="1:1" ${currentScene.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                </select>
              </div>

              <input type="text" class="input-text" id="inp-prompt-video" style="color:#fef08a; font-size:9px;" value="${currentScene.promptVideo}" placeholder="Prompt Video Scene ${activeSceneIndex+1}">
              <input type="text" class="input-text" id="inp-voiceover" style="color:#34d399; font-size:9px;" value="${currentScene.voiceover || ''}" placeholder="Voiceover Scene ${activeSceneIndex+1}">
            </div>

            <!-- Action Buttons Grid -->
            <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap:5px;">
              <button class="btn-action-primary" id="btn-inject-current-scene" title="Inject Prompt dan Upload Semua Foto (Produk, Model, Lokasi) Tanpa Duplikat">
                <i class="fa-solid fa-arrow-pointer"></i>
                <span>Inject S${activeSceneIndex + 1} + 3 Foto</span>
              </button>
              
              <button class="btn-auto-sequence ${isAutoRunning ? 'running' : ''}" id="btn-toggle-auto-runner">
                <i class="fa-solid ${isAutoRunning ? 'fa-stop' : 'fa-play'}"></i>
                <span>${isAutoRunning ? 'Stop Auto' : 'Auto Lanjut'}</span>
              </button>
            </div>

          </div>

          <!-- Bottom Resize Gripper -->
          <div class="resize-handle" id="gripper-resize" title="Tarik sudut untuk ubah ukuran"></div>
        </div>
      `;

      // Zoom In / Out Handlers
      wrapper.querySelector('#btn-zoom-in').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentZoom < 1.35) {
          currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = `scale(${currentZoom})`;
        }
      });
      wrapper.querySelector('#btn-zoom-out').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentZoom > 0.7) {
          currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
          const st = wrapper.querySelector('#main-floating-studio');
          if (st) st.style.transform = `scale(${currentZoom})`;
        }
      });

      // Scene Switching
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
          imageUrl: images.product || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
        });
        activeSceneIndex = scenes.length - 1;
        render();
      });

      wrapper.querySelector('#btn-sync-web-mini').addEventListener('click', (e) => {
        e.stopPropagation();
        autoSyncFromWeb();
        alert("✅ Data & Gambar (Produk, Model, Lokasi) berhasil disinkronkan dari web!");
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

      // Crop Buttons
      wrapper.querySelectorAll('.btn-slot-crop').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const slot = btn.getAttribute('data-slot');
          openCropModal(slot);
        });
      });

      wrapper.querySelector('#btn-inject-current-scene').addEventListener('click', async (e) => {
        e.stopPropagation();
        await executePrecisionCleanInjection(activeSceneIndex);
      });

      wrapper.querySelector('#btn-toggle-auto-runner').addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAutoRunning) {
          stopAutoRunner();
        } else {
          startAutoRunner();
        }
      });

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
    await executePrecisionCleanInjection(activeSceneIndex);

    const curDur = scenes[activeSceneIndex].duration || 6;
    let secondsLeft = curDur + 22;

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
            alert('🎉 Semua Scene Selesai Digenerate!');
            stopAutoRunner();
          }
        }, 2500);
      }
    }, 1000);
  }

  function setupMainImageUploads() {
    ['prod', 'mod', 'loc'].forEach((k, idx) => {
      const keyMap = ['product', 'model', 'location'][idx];
      const slot = wrapper.querySelector('#slot-' + keyMap);
      const inp = wrapper.querySelector('#input-file-' + k);
      if (slot && inp) {
        slot.addEventListener('click', (e) => {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) inp.click();
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

  // PRECISION CLEAN INJECTION (All 3 Images: Product + Model + Location WITHOUT Duplicates)
  async function executePrecisionCleanInjection(sceneIdx) {
    const sc = scenes[sceneIdx] || scenes[0];
    const aspect = sc.aspectRatio || "9:16";
    const promptText = "[Scene " + (sceneIdx + 1) + " (" + sc.duration + "s, " + aspect + ")]: " + sc.promptVideo;
    
    // Collect all available distinct images (Product, Model, Location, Scene)
    const distinctImageSources = [];
    const seenHashes = new Set();

    [
      { label: 'produk', src: images.product || sc.imageUrl },
      { label: 'model', src: images.model },
      { label: 'lokasi', src: images.location }
    ].forEach((item) => {
      if (item.src && typeof item.src === 'string' && item.src.length > 50) {
        const sampleKey = item.src.slice(0, 100);
        if (!seenHashes.has(sampleKey)) {
          seenHashes.add(sampleKey);
          distinctImageSources.push(item);
        }
      }
    });

    // Build Single Clean DataTransfer with all distinct image files
    if (distinctImageSources.length > 0) {
      try {
        const dt = new DataTransfer();
        for (let i = 0; i < distinctImageSources.length; i++) {
          const item = distinctImageSources[i];
          const blob = await urlOrBase64ToBlob(item.src);
          if (blob) {
            const fileName = (i + 1) + "_" + item.label + ".jpg";
            const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
            dt.items.add(file);
          }
        }

        // Single File Input Dispatch (No duplicate triggers)
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
        if (fileInputs.length > 0) {
          const targetInput = fileInputs[0];
          targetInput.files = dt.files;
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Single Synthetic Drop on Chat Box
        const chatBox = document.querySelector('textarea, [contenteditable="true"], form, main');
        if (chatBox) {
          chatBox.dispatchEvent(new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dt
          }));
        }
      } catch(e) {}
    }

    // Single Text Injection into Chat Prompt Textarea
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
      alert("✅ Flow Ai Auto: Scene " + (sceneIdx + 1) + " + Semua Foto (Produk, Model, Lokasi) berhasil di-inject ke chat!");
    } else {
      navigator.clipboard.writeText(promptText);
      alert("📋 Prompt Scene " + (sceneIdx + 1) + " berhasil disalin ke clipboard!");
    }
  }

  function openCropModal(slotKey) {
    const imgSrc = images[slotKey];
    if (!imgSrc) return;

    const cropOverlay = document.createElement('div');
    cropOverlay.className = 'crop-modal-overlay';
    cropOverlay.innerHTML = `
      <div class="crop-dialog">
        <div style="font-size:11px; font-weight:bold; color:#f59e0b;"><i class="fa-solid fa-crop"></i> Crop Foto (${slotKey.toUpperCase()})</div>
        <div style="width:100%; aspect-ratio:1; overflow:hidden; border-radius:8px; background:#000; display:flex; align-items:center; justify-content:center;">
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
        images[slotKey] = res;
        cropOverlay.remove();
        render();
      });
    });

    cropOverlay.querySelector('#btn-crop-9-16').addEventListener('click', () => {
      cropImageToRatio(imgSrc, 9, 16, (res) => {
        images[slotKey] = res;
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

  autoSyncFromWeb();
  render();
})();
