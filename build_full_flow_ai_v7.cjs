const fs = require('fs');
const path = require('path');

const extDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';

const contentJs = `// Flow Ai Extension v7.0 - Multi-Vector Image Injection, Aspect Ratio & Auto-Web Sync
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

  const style = document.createElement('style');
  style.textContent = \`
    * { box-sizing: border-box; margin: 0; padding: 0; pointer-events: auto; }
    
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #090d16, #121829);
      border: 1.5px solid rgba(249, 115, 22, 0.8);
      border-radius: 9999px;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9), 0 0 14px rgba(249, 115, 22, 0.35);
      backdrop-filter: blur(14px);
      user-select: none;
    }
    .pill-icon {
      width: 18px;
      height: 18px;
      border-radius: 6px;
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
    }

    .floating-studio {
      width: 295px;
      max-width: 96vw;
      background: #090d16;
      border: 1.5px solid rgba(249, 115, 22, 0.6);
      border-radius: 14px;
      color: #f8fafc;
      box-shadow: 0 16px 45px rgba(0,0,0,0.95), 0 0 25px rgba(249, 115, 22, 0.2);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      animation: popIn 0.15s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .studio-header {
      padding: 6px 10px;
      background: linear-gradient(90deg, #0e1424, #141c30);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .studio-body {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

    .btn-ctrl {
      background: #1a2236;
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
      font-weight: bold;
    }

    .card-section {
      background: #0d121f;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 6px;
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
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }

    .scene-nav-bar {
      display: flex;
      align-items: center;
      gap: 3px;
      overflow-x: auto;
      padding-bottom: 1px;
    }
    .scene-tab-pill {
      padding: 3px 7px;
      border-radius: 6px;
      font-size: 8px;
      font-weight: 800;
      font-family: monospace;
      cursor: pointer;
      border: 1px solid #1e293b;
      background: #0b0f19;
      color: #94a3b8;
      white-space: nowrap;
    }
    .scene-tab-pill.active {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #fff;
      border-color: #f97316;
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
    }

    .image-slot-mini {
      aspect-ratio: 1;
      border-radius: 6px;
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
      border: 1px solid #06b6d4;
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
      transition: all 0.15s;
    }
    .btn-action-primary:active { transform: scale(0.96); }

    .btn-auto-sequence {
      background: linear-gradient(135deg, #15803d, #16a34a);
      border: 1px solid #4ade80;
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
      transition: all 0.15s;
    }
    .btn-auto-sequence.running {
      background: linear-gradient(135deg, #b91c1c, #dc2626);
      border-color: #f87171;
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
      padding: 10px;
      width: 260px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #fff;
    }
  \`;
  shadow.appendChild(style);

  let isMinimized = false;
  let activeSceneIndex = 0;
  let isAutoRunning = false;
  let autoTimerInterval = null;

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

  // Auto-sync on script start from AffiliateGo
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
            if (scenes[0] && scenes[0].imageUrl) images.product = scenes[0].imageUrl;
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
      wrapper.innerHTML = \`
        <div class="floating-pill" id="btn-expand-pill" title="Klik untuk membuka Flow AI Studio">
          <div class="pill-icon">⚡</div>
          <span>Flow AI</span>
          <span style="font-size:8px; color:#fb923c; font-family:monospace;">SCENE \${activeSceneIndex+1}</span>
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
      const activeImg = currentScene.imageUrl || images.product || images.model || images.location || "";

      wrapper.innerHTML = \`
        <div class="floating-studio" id="main-floating-studio">
          <!-- Header -->
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:5px;">
              <div class="pill-icon">⚡</div>
              <span style="font-size:10px; font-weight:800; color:#fff;">Flow AI Studio</span>
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

            <!-- Active Scene Card -->
            <div class="card-section">
              <div style="display:grid; grid-template-columns: 52px 1fr; gap:5px; align-items:center;">
                <div class="image-slot-mini" id="slot-scene-active" style="height:52px; width:52px;" title="Klik untuk ganti / upload gambar">
                  \${activeImg ? \`<img src="\${activeImg}"><button class="btn-slot-crop" id="btn-crop-scene-active">✂</button>\` : \`<div style="font-size:7px; color:#94a3b8;">+ Foto</div>\`}
                  <input type="file" id="input-file-scene-active" accept="image/*" style="display:none">
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
                      <option value="4" \${currentScene.duration == 4 ? 'selected' : ''}>4s</option>
                      <option value="6" \${currentScene.duration == 6 ? 'selected' : ''}>6s</option>
                      <option value="8" \${currentScene.duration == 8 ? 'selected' : ''}>8s</option>
                      <option value="10" \${currentScene.duration == 10 ? 'selected' : ''}>10s</option>
                    </select>
                    <!-- Aspect Ratio / Ukuran Video -->
                    <select class="select-input" id="inp-aspect-ratio">
                      <option value="9:16" \${currentScene.aspectRatio === '9:16' ? 'selected' : ''}>9:16 (TikTok)</option>
                      <option value="16:9" \${currentScene.aspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
                      <option value="1:1" \${currentScene.aspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
                    </select>
                  </div>
                  <input type="text" class="input-text" id="inp-prompt-video" style="color:#fef08a; font-size:8.5px;" value="\${currentScene.promptVideo}" placeholder="Prompt Video Scene \${activeSceneIndex+1}">
                </div>
              </div>
              
              <!-- Voiceover Input -->
              <input type="text" class="input-text" id="inp-voiceover" style="color:#34d399; font-size:8.5px;" value="\${currentScene.voiceover || ''}" placeholder="Voiceover Scene \${activeSceneIndex+1}">
            </div>

            <!-- Action Buttons Grid -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
              <button class="btn-action-primary" id="btn-inject-current-scene">
                <span>🎯 Inject S\${activeSceneIndex + 1} + Foto</span>
              </button>
              
              <button class="btn-auto-sequence \${isAutoRunning ? 'running' : ''}" id="btn-toggle-auto-runner">
                <span>\${isAutoRunning ? '⏹ Stop' : '🚀 Auto Lanjut'}</span>
              </button>
            </div>

            <!-- 3 Mini Photo Slots -->
            <div class="grid-3">
              <div class="image-slot-mini" id="slot-product" style="height:32px;" title="Foto Produk">
                \${images.product ? \`<img src="\${images.product}">\` : \`<span style="font-size:6px; color:#64748b;">+Produk</span>\`}
                <input type="file" id="input-file-prod" accept="image/*" style="display:none">
              </div>
              <div class="image-slot-mini" id="slot-model" style="height:32px;" title="Foto Model">
                \${images.model ? \`<img src="\${images.model}">\` : \`<span style="font-size:6px; color:#64748b;">+Model</span>\`}
                <input type="file" id="input-file-mod" accept="image/*" style="display:none">
              </div>
              <div class="image-slot-mini" id="slot-location" style="height:32px;" title="Foto Lokasi">
                \${images.location ? \`<img src="\${images.location}">\` : \`<span style="font-size:6px; color:#64748b;">+Lokasi</span>\`}
                <input type="file" id="input-file-loc" accept="image/*" style="display:none">
              </div>
            </div>

          </div>
        </div>
      \`;

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
        alert("✅ Data & Gambar berhasil disinkronkan dari web AffiliateGo!");
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

      const cropBtn = wrapper.querySelector('#btn-crop-scene-active');
      if (cropBtn) {
        cropBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCropActiveScene();
        });
      }

      wrapper.querySelector('#btn-inject-current-scene').addEventListener('click', async (e) => {
        e.stopPropagation();
        await executeMultiVectorImageInjection(activeSceneIndex);
      });

      wrapper.querySelector('#btn-toggle-auto-runner').addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAutoRunning) {
          stopAutoRunner();
        } else {
          startAutoRunner();
        }
      });

      setupSceneImageUpload();
      setupMainImageUploads();
      makeDraggable(wrapper.querySelector('.floating-studio'), wrapper.querySelector('#studio-drag-bar'));
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
    await executeMultiVectorImageInjection(activeSceneIndex);

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
            alert('🎉 Semua Scene Selesai Digenerate!');
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

  // MULTI-VECTOR IMAGE & PROMPT INJECTION INTO FLOW AI
  async function executeMultiVectorImageInjection(sceneIdx) {
    const sc = scenes[sceneIdx] || scenes[0];
    const aspect = sc.aspectRatio || "9:16";
    const promptText = "[Scene " + (sceneIdx + 1) + " (" + sc.duration + "s, " + aspect + ")]: " + sc.promptVideo;
    const imgSrc = sc.imageUrl || images.product || images.model || images.location;

    let imageInjected = false;

    // Vector 1: Find Flow AI file upload inputs
    if (imgSrc) {
      try {
        const blob = await urlOrBase64ToBlob(imgSrc);
        if (blob) {
          const file = new File([blob], "flow-ai-scene-" + (sceneIdx + 1) + ".jpg", { type: blob.type || "image/jpeg" });
          
          // 1. Dispatch to all input[type="file"]
          const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
          for (const fi of fileInputs) {
            try {
              const dt = new DataTransfer();
              dt.items.add(file);
              fi.files = dt.files;
              fi.dispatchEvent(new Event('change', { bubbles: true }));
              fi.dispatchEvent(new Event('input', { bubbles: true }));
              imageInjected = true;
            } catch(err) {}
          }

          // 2. Synthetic Paste Event into Chat Area / Textarea
          const dropZones = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], form, main, .chat-container, [role="textbox"]'));
          for (const dz of dropZones) {
            try {
              const dt = new DataTransfer();
              dt.items.add(file);
              const pasteEvt = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dt
              });
              dz.dispatchEvent(pasteEvt);
              
              const dropEvt = new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dt
              });
              dz.dispatchEvent(dropEvt);
            } catch(e) {}
          }

          // 3. System Clipboard Image Copy (Direct Binary Clipboard)
          try {
            if (navigator.clipboard && navigator.clipboard.write) {
              const pngBlob = blob.type === 'image/png' ? blob : await convertBlobToPng(blob);
              if (pngBlob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': pngBlob })
                ]);
              }
            }
          } catch(e) {}
        }
      } catch(e) {}
    }

    // Vector 2: Text Injection into Chat Prompt Box
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
      alert("✅ Scene " + (sceneIdx + 1) + " + Foto berhasil dimasukkan ke Chat Flow AI! (Foto juga tersalin ke clipboard)");
    } else {
      navigator.clipboard.writeText(promptText);
      alert("📋 Prompt & Foto Scene " + (sceneIdx + 1) + " siap! Paste (Ctrl+V) langsung ke Flow AI.");
    }
  }

  function convertBlobToPng(blob) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b), 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(blob);
    });
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
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:3px;">
          <button id="btn-crop-9-16" style="background:#ea580c; color:#fff; border:none; border-radius:4px; padding:4px; font-size:8px; font-weight:bold; cursor:pointer;">9:16 TikTok</button>
          <button id="btn-crop-1-1" style="background:#f59e0b; color:#000; border:none; border-radius:4px; padding:4px; font-size:8px; font-weight:bold; cursor:pointer;">1:1 Square</button>
          <button id="btn-crop-cancel" style="background:#1e293b; color:#cbd5e1; border:none; border-radius:4px; padding:4px; font-size:8px; font-weight:bold; cursor:pointer;">Batal</button>
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
    let isTouchMoving = false;

    dragTarget.addEventListener('mousedown', dragMouseDown);
    dragTarget.addEventListener('touchstart', dragTouchStart, { passive: true });

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function dragTouchStart(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      isTouchMoving = false;
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
        isTouchMoving = true;
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

  autoSyncFromWeb();
  render();
})();
`;

fs.writeFileSync(path.join(extDir, 'content.js'), contentJs);
console.log("content.js v7.0 with multi-vector image injection and aspect ratio built successfully!");
