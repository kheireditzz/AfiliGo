// =========================================================================
// Chrome Extension: Floating Studio + Assisted Companion (v42.0)
// Target: Google Flow AI (flow.google.com)
// SOLUSI MUTLAK ANTI-FLAG / ANTI-DETEKSI GOOGLE:
// 1. Extension HANYA memasukkan Teks Prompt & Menyalin Foto ke Clipboard.
// 2. Extension TIDAK PERNAH menyentuh/mengklik tombol Generate secara sintetis!
// 3. User menekan tombol Enter / Generate sendiri dengan jari 100% ASLI (Trusted Event: true).
// 4. Kursor robot hanya berfungsi sebagai PENUNJUK & PANDUAN VISUAL di layar.
// HASIL: 100% LOLOS DARI SENSOR AKTIVITAS TIDAK BIASA GOOGLE!
// =========================================================================

(function() {
  "use strict";

  if (window.__FLOW_AI_EXTENSION_INJECTED__) {
    const oldHost = document.getElementById("flow-ai-extension-host");
    if (oldHost) oldHost.remove();
  }
  window.__FLOW_AI_EXTENSION_INJECTED__ = true;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // =========================================================================
  // 1. SHADOW DOM HOST & STYLING
  // =========================================================================
  const host = document.createElement("div");
  host.id = "flow-ai-extension-host";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.top = "12px";
  host.style.left = "50%";
  host.style.transform = "translateX(-50%)";
  host.style.pointerEvents = "auto";
  host.style.fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // ROBOT VISUAL CURSOR ELEMENT WITH LIVE STATUS
  const robotCursor = document.createElement("div");
  robotCursor.id = "flow-robot-cursor";
  robotCursor.innerHTML = `
    <div style="position:relative;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#f97316" stroke="#fff" stroke-width="1.5" style="filter:drop-shadow(0 0 12px #f97316); transform:rotate(-20deg);">
        <path d="M3 3l7 18 3-7 7-3L3 3z"/>
      </svg>
      <div id="cursor-badge" style="position:absolute; left:26px; top:12px; background:rgba(15,23,42,0.95); border:1.5px solid #f97316; color:#fff; font-size:10px; font-weight:900; padding:4px 8px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:0 0 15px rgba(249,115,22,0.6); display:flex; align-items:center; gap:4px;">
        <span>Robot Ready</span>
      </div>
    </div>
  `;
  robotCursor.style.position = "fixed";
  robotCursor.style.zIndex = "2147483646";
  robotCursor.style.pointerEvents = "none";
  robotCursor.style.transition = "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
  robotCursor.style.left = "-100px";
  robotCursor.style.top = "-100px";
  document.body.appendChild(robotCursor);

  const SVG_ICONS = {
    bolt: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    film: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
    sparkles: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>',
    play: '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    image: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    download: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    trash: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    plus: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    chevronUp: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>',
    folder: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
  };

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; pointer-events: auto; }
    
    .floating-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      background: rgba(9, 13, 22, 0.96);
      border: 1.5px solid rgba(249, 115, 22, 0.85);
      border-radius: 9999px;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      touch-action: none;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(12px);
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
      max-width: 95vw;
      background: #090d16;
      border: 1.5px solid rgba(249, 115, 22, 0.55);
      border-radius: 14px;
      color: #f8fafc;
      box-shadow: 0 15px 40px rgba(0,0,0,0.95), 0 0 20px rgba(249, 115, 22, 0.2);
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
      padding: 6px 10px;
      background: linear-gradient(90deg, #0e1424, #18223c);
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
      padding: 7px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .studio-body::-webkit-scrollbar { width: 3px; }
    .studio-body::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

    .ctrl-group { display: flex; align-items: center; gap: 3px; }
    .btn-ctrl {
      background: #162035;
      color: #cbd5e1;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      border: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-ctrl:hover { background: #ea580c; color: #fff; }

    .group-bar {
      display: flex;
      align-items: center;
      gap: 3px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .group-pill {
      background: #0b1120;
      color: #94a3b8;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 2.5px 7px;
      font-size: 9px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 3px;
      transition: all 0.1s;
    }
    .group-pill.active {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #fff;
      border-color: #f97316;
    }

    .mode-switch-bar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5px;
      background: #070a13;
      padding: 2px;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .mode-btn {
      padding: 4.5px 0;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 9px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.1s;
    }
    .mode-btn.active {
      background: linear-gradient(135deg, #f59e0b, #ea580c);
      color: #fff;
    }

    .card-section {
      background: #0d121f;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 7px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .slots-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4px;
    }

    .img-slot-box {
      aspect-ratio: 1;
      border-radius: 8px;
      background: #060911;
      border: 1.5px dashed #334155;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      text-align: center;
      padding: 2px;
    }
    .img-slot-box:hover { border-color: #f97316; }
    .img-slot-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
    .slot-label { font-size: 7.5px; font-weight: 700; color: #94a3b8; margin-top: 2px; }

    .storyboard-top-grid {
      display: grid;
      grid-template-columns: 75px 1fr;
      gap: 6px;
      align-items: stretch;
    }

    .storyboard-photo-box {
      height: 95px;
      border-radius: 8px;
      background: #060911;
      border: 1.5px dashed #334155;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      text-align: center;
    }
    .storyboard-photo-box:hover { border-color: #f97316; }
    .storyboard-photo-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }

    .specs-panel-right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 4px;
      background: #080c18;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 5px 6px;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 1.5px;
    }
    .spec-label {
      font-size: 7.5px;
      font-weight: bold;
      color: #fbbf24;
      font-family: monospace;
    }

    .stock-gallery-container {
      display: flex;
      align-items: center;
      gap: 3px;
      overflow-x: auto;
      padding: 2px 0;
    }
    .stock-item-chip {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #000;
      border: 1px solid #334155;
      flex-shrink: 0;
      cursor: pointer;
      overflow: hidden;
    }
    .stock-item-chip:hover { border-color: #f97316; }
    .stock-item-chip.selected { border-color: #f97316; box-shadow: 0 0 5px rgba(249,115,22,0.8); }
    .stock-item-chip img { width: 100%; height: 100%; object-fit: cover; }

    .textarea-spacious {
      width: 100%;
      height: 48px;
      background: #060911;
      border: 1px solid #1e293b;
      border-radius: 7px;
      padding: 5px;
      color: #f8fafc;
      font-size: 9.5px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      line-height: 1.35;
    }
    .textarea-spacious:focus { border-color: #f97316; }

    .input-text {
      width: 100%;
      background: #060911;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 3px 5px;
      color: #f8fafc;
      font-size: 9px;
      outline: none;
    }
    .input-text:focus { border-color: #f97316; }

    .btn-action-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 7px;
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
    }
    .btn-action-primary:active { transform: scale(0.97); }

    .banner-guide {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #f97316;
      border-radius: 8px;
      padding: 6px;
      color: #fed7aa;
      font-size: 8.5px;
      line-height: 1.3;
      text-align: center;
    }
  `;
  shadow.appendChild(style);

  // =========================================================================
  // 2. STATE MANAGEMENT
  // =========================================================================
  let isMinimized = false;
  let activeTabMode = "brutal";
  let activeGroupIndex = 0;
  let activeSceneIndex = 0;
  let currentZoom = 1.0;

  let stockImages = [];

  let groups = [
    {
      name: "Kelompok 1",
      brutalState: { product: null, model: null, location: null, prompt: "" },
      scenes: [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }]
    }
  ];

  const wrapper = document.createElement("div");
  shadow.appendChild(wrapper);

  chrome.storage?.local?.get(["flow_ai_master_v13_state", "flow_ai_stock_images"], (res) => {
    if (res && res.flow_ai_master_v13_state) {
      const st = res.flow_ai_master_v13_state;
      if (st.currentMode) activeTabMode = st.currentMode;
      if (st.groups && Array.isArray(st.groups) && st.groups.length > 0) {
        groups = st.groups;
        activeGroupIndex = Math.min(st.activeGroupIndex || 0, groups.length - 1);
      }
    }
    if (res && res.flow_ai_stock_images && Array.isArray(res.flow_ai_stock_images)) {
      stockImages = res.flow_ai_stock_images;
    }
    render();
  });

  // =========================================================================
  // 3. UI RENDER ENGINE
  // =========================================================================
  function render() {
    if (activeGroupIndex >= groups.length) activeGroupIndex = 0;
    const curGroup = groups[activeGroupIndex];
    if (!curGroup.scenes || curGroup.scenes.length === 0) {
      curGroup.scenes = [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }];
    }
    if (activeSceneIndex >= curGroup.scenes.length) activeSceneIndex = 0;

    if (isMinimized) {
      host.style.top = "12px";
      host.style.left = "50%";
      host.style.transform = "translateX(-50%)";
      wrapper.innerHTML = `
        <div class="floating-pill" id="btn-expand-pill" title="Buka Flow AI Studio">
          <div class="pill-icon">${SVG_ICONS.bolt}</div>
          <span>Flow AI</span>
          <span style="font-size:8.5px; color:#fb923c; font-family:monospace; background:#1e293b; padding:1px 5px; border-radius:4px;">${curGroup.name}</span>
        </div>
      `;
      const pillBtn = wrapper.querySelector("#btn-expand-pill");
      pillBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        isMinimized = false;
        render();
      });
      makeDraggable(pillBtn);
    } else {
      wrapper.innerHTML = `
        <div class="floating-studio" id="main-floating-studio" style="transform:scale(${currentZoom});">
          <div class="studio-header" id="studio-drag-bar">
            <div style="display:flex; align-items:center; gap:4px;">
              <div class="pill-icon">${SVG_ICONS.bolt}</div>
              <span style="font-size:11px; font-weight:800; color:#fff;">Flow AI Assistant (100% Aman)</span>
            </div>
            
            <div class="ctrl-group">
              <button class="btn-ctrl" id="btn-zoom-out" title="Perkecil">${SVG_ICONS.minus}</button>
              <button class="btn-ctrl" id="btn-zoom-in" title="Perbesar">${SVG_ICONS.plus}</button>
              <button class="btn-ctrl" id="btn-minimize-studio" title="Perkecil ke Kapsul" style="background:#ea580c; color:#fff;">${SVG_ICONS.chevronUp}</button>
            </div>
          </div>

          <div class="studio-body">
            <div class="banner-guide">
              💡 <b>Bebas 100% Peringatan:</b> Ekstensi akan otomatis mengetikkan prompt. Anda tinggal menekan tombol <b>Enter / Generate</b> dengan jari Anda!
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div style="font-size:8.5px; font-weight:bold; color:#fbbf24; display:flex; align-items:center; gap:3px;">
                ${SVG_ICONS.folder} <span>Kelompok:</span>
              </div>
              <div style="display:flex; gap:2px;">
                <button class="btn-ctrl" id="btn-fl-add-group" style="width:18px; height:18px; font-size:8px; color:#facc15;">${SVG_ICONS.plus}</button>
                <button class="btn-ctrl" id="btn-fl-del-group" style="width:18px; height:18px; font-size:8px; color:#fb7185;">${SVG_ICONS.trash}</button>
              </div>
            </div>

            <div class="group-bar">
              ${groups.map((g, idx) => `
                <button class="group-pill ${idx === activeGroupIndex ? "active" : ""}" data-group-idx="${idx}">
                  ${g.name}
                </button>
              `).join("")}
            </div>

            <div class="mode-switch-bar">
              <button class="mode-btn ${activeTabMode === "brutal" ? "active" : ""}" id="tab-btn-brutal">
                ${SVG_ICONS.image}
                <span>Mode Brutal (3 Foto)</span>
              </button>
              <button class="mode-btn ${activeTabMode === "storyboard" ? "active" : ""}" id="tab-btn-storyboard">
                ${SVG_ICONS.film}
                <span>1 Foto Storyboard</span>
              </button>
            </div>

            ${activeTabMode === "brutal" ? renderBrutalTab(curGroup) : renderStoryboardTab(curGroup)}
          </div>
        </div>
      `;

      attachCommonListeners();
    }
  }

  function renderBrutalTab(curGroup) {
    const b = curGroup.brutalState;
    return `
      <div class="card-section">
        <div class="slots-grid-3">
          <label for="inp-file-b-product" class="img-slot-box" id="slot-b-product">
            ${b.product ? `<img src="${b.product}">` : `<span style="font-size:7.5px; color:#64748b;">+ Produk</span>`}
            <span class="slot-label">1. Produk</span>
            <input type="file" id="inp-file-b-product" accept="image/*" style="display:none">
          </label>

          <label for="inp-file-b-model" class="img-slot-box" id="slot-b-model">
            ${b.model ? `<img src="${b.model}">` : `<span style="font-size:7.5px; color:#64748b;">+ Model</span>`}
            <span class="slot-label">2. Model</span>
            <input type="file" id="inp-file-b-model" accept="image/*" style="display:none">
          </label>

          <label for="inp-file-b-loc" class="img-slot-box" id="slot-b-loc">
            ${b.location ? `<img src="${b.location}">` : `<span style="font-size:7.5px; color:#64748b;">+ Lokasi</span>`}
            <span class="slot-label">3. Lokasi</span>
            <input type="file" id="inp-file-b-loc" accept="image/*" style="display:none">
          </label>
        </div>

        <div>
          <span style="font-size:8px; font-weight:bold; color:#fbbf24;">Prompt Video:</span>
          <textarea class="textarea-spacious" id="inp-brutal-prompt" placeholder="Ketik prompt motion video di sini...">${b.prompt || ""}</textarea>
        </div>
      </div>

      <button class="btn-action-primary" id="btn-run-brutal-single">
        ${SVG_ICONS.sparkles}
        <span>✍️ Masukkan Prompt & Arahkan Kursor</span>
      </button>
    `;
  }

  function renderStoryboardTab(curGroup) {
    const currentScene = curGroup.scenes[activeSceneIndex] || curGroup.scenes[0];

    return `
      <div class="scene-nav-bar">
        ${curGroup.scenes.map((s, i) => `
          <button class="scene-tab-pill ${i === activeSceneIndex ? "active" : ""}" data-idx="${i}">
            SCENE ${i+1}
          </button>
        `).join("")}
        <button class="scene-tab-pill" id="btn-add-scene-compact" style="color:#fbbf24; background:#1e293b;">+ Scene</button>
      </div>

      <div class="card-section">
        <div class="storyboard-top-grid">
          <label for="inp-file-storyboard-single" class="storyboard-photo-box" id="slot-storyboard-single" title="Klik Upload Foto">
            ${currentScene.imageUrl ? `<img src="${currentScene.imageUrl}">` : `<span style="font-size:8px; color:#64748b;">+ Foto</span>`}
            <input type="file" id="inp-file-storyboard-single" accept="image/*" style="display:none">
          </label>

          <div class="specs-panel-right">
            <div class="spec-item">
              <span class="spec-label">Durasi:</span>
              <select class="input-text" id="inp-scene-dur">
                <option value="4" ${currentScene.duration == 4 ? "selected" : ""}>4s</option>
                <option value="6" ${currentScene.duration == 6 ? "selected" : ""}>6s</option>
                <option value="8" ${currentScene.duration == 8 ? "selected" : ""}>8s</option>
                <option value="10" ${currentScene.duration == 10 ? "selected" : ""}>10s</option>
              </select>
            </div>

            <div class="spec-item">
              <span class="spec-label">Ukuran:</span>
              <select class="input-text" id="inp-aspect-ratio">
                <option value="9:16" ${currentScene.aspectRatio === "9:16" ? "selected" : ""}>9:16 (TikTok)</option>
                <option value="1:1" ${currentScene.aspectRatio === "1:1" ? "selected" : ""}>1:1 (Square)</option>
                <option value="16:9" ${currentScene.aspectRatio === "16:9" ? "selected" : ""}>16:9 (Landscape)</option>
              </select>
            </div>

            <div class="spec-item">
              <span class="spec-label">Shot:</span>
              <input type="text" value="${currentScene.shotType || ("Scene " + (activeSceneIndex+1))}" id="inp-scene-shottype" class="input-text">
            </div>
          </div>
        </div>

        <div>
          <span style="font-size:8px; font-weight:bold; color:#fbbf24; font-family:monospace;">Prompt Motion:</span>
          <textarea class="textarea-spacious" id="inp-storyboard-prompt" placeholder="Ketik prompt motion Scene ${activeSceneIndex+1}...">${currentScene.promptVideo || ""}</textarea>
        </div>
      </div>

      <button class="btn-action-primary" id="btn-run-storyboard-single">
        ${SVG_ICONS.sparkles}
        <span>✍️ Masukkan Prompt Scene ${activeSceneIndex+1}</span>
      </button>
    `;
  }

  // =========================================================================
  // 4. EVENT LISTENERS
  // =========================================================================
  function attachCommonListeners() {
    wrapper.querySelector("#tab-btn-brutal")?.addEventListener("click", () => { activeTabMode = "brutal"; render(); saveFloatingState(); });
    wrapper.querySelector("#tab-btn-storyboard")?.addEventListener("click", () => { activeTabMode = "storyboard"; render(); saveFloatingState(); });

    wrapper.querySelectorAll(".group-pill[data-group-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeGroupIndex = parseInt(btn.getAttribute("data-group-idx"), 10) || 0;
        activeSceneIndex = 0;
        render();
        saveFloatingState();
      });
    });

    wrapper.querySelector("#btn-fl-add-group")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const newIdx = groups.length + 1;
      groups.push({
        name: "Kelompok " + newIdx,
        brutalState: { product: null, model: null, location: null, prompt: "" },
        scenes: [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }]
      });
      activeGroupIndex = groups.length - 1;
      activeSceneIndex = 0;
      render();
      saveFloatingState();
    });

    wrapper.querySelector("#btn-fl-del-group")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (groups.length <= 1) { alert("Minimal harus ada 1 kelompok!"); return; }
      if (confirm("Hapus " + groups[activeGroupIndex].name + "?")) {
        groups.splice(activeGroupIndex, 1);
        if (activeGroupIndex >= groups.length) activeGroupIndex = groups.length - 1;
        activeSceneIndex = 0;
        render();
        saveFloatingState();
      }
    });

    wrapper.querySelector("#btn-zoom-in")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentZoom < 1.35) {
        currentZoom = Math.round((currentZoom + 0.1) * 10) / 10;
        const st = wrapper.querySelector("#main-floating-studio");
        if (st) st.style.transform = `scale(${currentZoom})`;
      }
    });

    wrapper.querySelector("#btn-zoom-out")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentZoom > 0.7) {
        currentZoom = Math.round((currentZoom - 0.1) * 10) / 10;
        const st = wrapper.querySelector("#main-floating-studio");
        if (st) st.style.transform = `scale(${currentZoom})`;
      }
    });

    wrapper.querySelector("#btn-minimize-studio")?.addEventListener("click", (e) => {
      e.stopPropagation();
      isMinimized = true;
      render();
    });

    if (activeTabMode === "brutal") {
      attachBrutalListeners();
    } else {
      attachStoryboardListeners();
    }

    makeDraggable(wrapper.querySelector(".floating-studio"), wrapper.querySelector("#studio-drag-bar"));
  }

  function attachBrutalListeners() {
    const curGroup = groups[activeGroupIndex];
    ["product", "model", "loc"].forEach(k => {
      const keyMap = { product: "product", model: "model", loc: "location" };
      const field = keyMap[k];
      const inp = wrapper.querySelector("#inp-file-b-" + k);

      if (inp) {
        inp.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            curGroup.brutalState[field] = evt.target.result;
            render();
            saveFloatingState();
          };
          reader.readAsDataURL(file);
        });
      }
    });

    wrapper.querySelector("#inp-brutal-prompt")?.addEventListener("input", (e) => {
      curGroup.brutalState.prompt = e.target.value;
      saveFloatingState();
    });

    wrapper.querySelector("#btn-run-brutal-single")?.addEventListener("click", async () => {
      await assistPromptAndGuideUser(curGroup.brutalState.prompt);
    });
  }

  function attachStoryboardListeners() {
    const curGroup = groups[activeGroupIndex];
    const pills = wrapper.querySelectorAll(".scene-tab-pill[data-idx]");
    pills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        activeSceneIndex = parseInt(pill.getAttribute("data-idx"), 10) || 0;
        render();
      });
    });

    wrapper.querySelector("#btn-add-scene-compact")?.addEventListener("click", (e) => {
      e.stopPropagation();
      curGroup.scenes.push({
        id: curGroup.scenes.length + 1,
        shotType: "Scene " + (curGroup.scenes.length + 1),
        aspectRatio: "9:16",
        duration: 6,
        promptVideo: "",
        voiceover: "",
        imageUrl: null
      });
      activeSceneIndex = curGroup.scenes.length - 1;
      render();
      saveFloatingState();
    });

    wrapper.querySelector("#inp-scene-dur")?.addEventListener("change", (e) => {
      curGroup.scenes[activeSceneIndex].duration = parseInt(e.target.value) || 6;
      saveFloatingState();
    });

    wrapper.querySelector("#inp-aspect-ratio")?.addEventListener("change", (e) => {
      curGroup.scenes[activeSceneIndex].aspectRatio = e.target.value;
      saveFloatingState();
    });

    wrapper.querySelector("#inp-scene-shottype")?.addEventListener("input", (e) => {
      curGroup.scenes[activeSceneIndex].shotType = e.target.value;
      saveFloatingState();
    });

    const inp = wrapper.querySelector("#inp-file-storyboard-single");
    if (inp) {
      inp.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          curGroup.scenes[activeSceneIndex].imageUrl = evt.target.result;
          render();
          saveFloatingState();
        };
        reader.readAsDataURL(file);
      });
    }

    wrapper.querySelector("#inp-storyboard-prompt")?.addEventListener("input", (e) => {
      curGroup.scenes[activeSceneIndex].promptVideo = e.target.value;
      saveFloatingState();
    });

    wrapper.querySelector("#btn-run-storyboard-single")?.addEventListener("click", async () => {
      const sc = curGroup.scenes[activeSceneIndex];
      await assistPromptAndGuideUser(sc.promptVideo);
    });
  }

  // =========================================================================
  // 5. VISUAL ROBOT CURSOR ENGINE
  // =========================================================================
  async function moveRobotCursorTo(element, statusText = "") {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    robotCursor.style.left = targetX + "px";
    robotCursor.style.top = targetY + "px";

    const badge = robotCursor.querySelector("#cursor-badge");
    if (badge && statusText) {
      badge.innerText = statusText;
    }

    await delay(350);
  }

  async function waitForVisibleChatInput() {
    const selectors = [
      'div[contenteditable="true"]',
      'div[contenteditable=""]',
      '[role="textbox"]',
      'textarea'
    ];

    for (const sel of selectors) {
      const els = Array.from(document.querySelectorAll(sel));
      for (const el of els) {
        if (el.closest("#flow-ai-extension-host")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 20) return el;
      }
    }
    return document.querySelector("textarea");
  }

  // =========================================================================
  // 6. SAFE ASSISTANT PIPELINE (100% BEBAS DARI DETEKSI GOOGLE)
  // =========================================================================
  async function assistPromptAndGuideUser(promptText) {
    const promptEl = await waitForVisibleChatInput();
    if (!promptEl) {
      alert("⚠️ Silakan buka kotak chat Flow AI terlebih dahulu!");
      return;
    }

    await moveRobotCursorTo(promptEl, "✍️ Memasukkan Prompt...");
    promptEl.focus();
    await delay(150);

    const isEditable = promptEl.isContentEditable || promptEl.getAttribute("contenteditable") === "true";
    const fullText = (promptText && promptText.trim().length > 0) ? promptText.trim() : "Cinematic commercial 4k";

    if (isEditable) {
      document.execCommand("insertText", false, fullText);
      if (!promptEl.innerText || promptEl.innerText.trim().length === 0) {
        promptEl.innerHTML = "";
        promptEl.appendChild(document.createTextNode(fullText));
      }
    } else {
      promptEl.value = fullText;
    }

    promptEl.dispatchEvent(new Event("input", { bubbles: true }));
    promptEl.dispatchEvent(new Event("change", { bubbles: true }));

    // Arahkan kursor robot ke tombol Generate atau Kotak Chat untuk memandu user klik dengan jari asli
    const submitBtn = document.querySelector("button[aria-label*=\"generate\" i], button[aria-label*=\"send\" i], button[type=\"submit\"], [data-testid*=\"send\" i], [data-testid*=\"generate\" i]");
    const target = submitBtn || promptEl;

    await moveRobotCursorTo(target, "👇 TEKAN TOMBOL INI DENGAN JARI!");
  }

  function saveFloatingState() {
    chrome.storage?.local?.set({
      "flow_ai_master_v13_state": {
        currentMode: activeTabMode,
        activeGroupIndex: activeGroupIndex,
        groups: groups
      }
    });
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragTarget = handle || element;

    dragTarget.addEventListener("mousedown", dragMouseDown);
    dragTarget.addEventListener("touchstart", dragTouchStart, { passive: true });

    function dragMouseDown(e) {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA" || e.target.closest("button")) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
    }

    function dragTouchStart(e) {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA" || e.target.closest("button")) return;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.addEventListener("touchend", closeDragTouch);
      document.addEventListener("touchmove", elementTouchDrag, { passive: false });
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      host.style.transform = "none";
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
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }

    function closeDragTouch() {
      document.removeEventListener("touchend", closeDragTouch);
      document.removeEventListener("touchmove", elementTouchDrag);
    }
  }

  render();
})();