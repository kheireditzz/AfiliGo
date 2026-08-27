let currentMode = "brutal";
let activeGroupIndex = 0;

let groups = [
  {
    name: "Kelompok 1",
    brutalState: { product: null, model: null, location: null, prompt: "" },
    scenes: [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  setupModeTabs();
  setupGroupManager();
  setupBrutalUploads();
  setupEventListeners();
});

function setupModeTabs() {
  const tabBrutal = document.getElementById("mode-tab-brutal");
  const tabStoryboard = document.getElementById("mode-tab-storyboard");
  const secBrutal = document.getElementById("section-brutal-mode");
  const secStoryboard = document.getElementById("section-storyboard-mode");

  tabBrutal?.addEventListener("click", () => {
    currentMode = "brutal";
    tabBrutal.className = "touch-btn py-1.5 rounded-lg text-[10px] font-black transition flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow";
    tabStoryboard.className = "touch-btn py-1.5 rounded-lg text-[10px] font-extrabold text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
    secBrutal?.classList.remove("hidden");
    secStoryboard?.classList.add("hidden");
    saveState();
  });

  tabStoryboard?.addEventListener("click", () => {
    currentMode = "storyboard";
    tabStoryboard.className = "touch-btn py-1.5 rounded-lg text-[10px] font-black transition flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow";
    tabBrutal.className = "touch-btn py-1.5 rounded-lg text-[10px] font-extrabold text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
    secStoryboard?.classList.remove("hidden");
    secBrutal?.classList.add("hidden");
    renderScenes();
    saveState();
  });
}

function setupGroupManager() {
  document.getElementById("btn-add-group")?.addEventListener("click", () => {
    const newIdx = groups.length + 1;
    groups.push({
      name: "Kelompok " + newIdx,
      brutalState: { product: null, model: null, location: null, prompt: "" },
      scenes: [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }]
    });
    activeGroupIndex = groups.length - 1;
    renderGroupPills();
    updateActiveGroupView();
    saveState();
  });

  document.getElementById("btn-delete-group")?.addEventListener("click", () => {
    if (groups.length <= 1) {
      alert("Minimal harus ada 1 kelompok!");
      return;
    }
    if (confirm("Hapus " + groups[activeGroupIndex].name + "?")) {
      groups.splice(activeGroupIndex, 1);
      if (activeGroupIndex >= groups.length) activeGroupIndex = groups.length - 1;
      renderGroupPills();
      updateActiveGroupView();
      saveState();
    }
  });
}

function renderGroupPills() {
  const container = document.getElementById("group-pills-container");
  if (!container) return;

  container.innerHTML = groups.map((g, idx) => {
    const isActive = idx === activeGroupIndex;
    return "<button onclick=\"switchGroup(" + idx + ")\" class=\"touch-btn px-2.5 py-1 rounded-lg text-[9.5px] font-extrabold whitespace-nowrap border transition flex items-center gap-1 " + 
      (isActive ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-400 shadow-md" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white") + "\">" +
      "<i class=\"fa-solid fa-folder text-[8px]\"></i>" + g.name +
    "</button>";
  }).join("");
}

window.switchGroup = function(idx) {
  if (groups[idx]) {
    activeGroupIndex = idx;
    renderGroupPills();
    updateActiveGroupView();
    saveState();
  }
};

function updateActiveGroupView() {
  updateBrutalThumbnails();
  renderScenes();
}

function setupBrutalUploads() {
  ["product", "model", "location"].forEach(key => {
    const fileInput = document.getElementById("ext-file-" + key);

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          groups[activeGroupIndex].brutalState[key] = evt.target.result;
          updateBrutalThumbnails();
          saveState();
        };
        reader.readAsDataURL(file);
      });
    }
  });

  const promptInput = document.getElementById("ext-brutal-prompt");
  if (promptInput) {
    promptInput.addEventListener("input", (e) => {
      groups[activeGroupIndex].brutalState.prompt = e.target.value;
      saveState();
    });
  }

  document.getElementById("btn-save-brutal-preset")?.addEventListener("click", () => {
    saveState();
    alert("💾 Data " + groups[activeGroupIndex].name + " tersimpan!");
  });
}

function updateBrutalThumbnails() {
  const currentBrutal = groups[activeGroupIndex]?.brutalState || {};
  ["product", "model", "location"].forEach(key => {
    const thumb = document.getElementById("ext-thumb-" + key);
    const placeholder = document.getElementById("ext-placeholder-" + key);
    const val = currentBrutal[key];

    if (val) {
      if (thumb) { thumb.src = val; thumb.classList.remove("hidden"); }
      if (placeholder) placeholder.classList.add("hidden");
    } else {
      if (thumb) { thumb.src = ""; thumb.classList.add("hidden"); }
      if (placeholder) placeholder.classList.remove("hidden");
    }
  });

  const promptInput = document.getElementById("ext-brutal-prompt");
  if (promptInput) {
    promptInput.value = currentBrutal.prompt || "";
  }
}

function setupEventListeners() {
  document.getElementById("btn-add-scene")?.addEventListener("click", () => {
    const currentScenes = groups[activeGroupIndex].scenes;
    currentScenes.push({
      id: currentScenes.length + 1,
      shotType: "Scene " + (currentScenes.length + 1),
      duration: 6,
      aspectRatio: "9:16",
      promptVideo: "",
      voiceover: "",
      imageUrl: null
    });
    renderScenes();
    saveState();
  });

  document.getElementById("btn-save-all-json")?.addEventListener("click", saveAllJson);
  document.getElementById("btn-copy-all-prompts")?.addEventListener("click", copyAllPromptsText);

  document.getElementById("btn-reset-cache-all")?.addEventListener("click", () => {
    if (confirm("Reset semua data dan kosongkan preset?")) {
      groups = [
        {
          name: "Kelompok 1",
          brutalState: { product: null, model: null, location: null, prompt: "" },
          scenes: [{ id: 1, shotType: "Scene 1", duration: 6, aspectRatio: "9:16", promptVideo: "", voiceover: "", imageUrl: null }]
        }
      ];
      activeGroupIndex = 0;
      saveState();
      renderGroupPills();
      updateActiveGroupView();
      alert("✨ Data telah dikosongkan!");
    }
  });

  document.getElementById("btn-inject-brutal-single")?.addEventListener("click", () => {
    sendBrutalSingleToTab();
  });

  document.getElementById("btn-inject-brutal-all-groups")?.addEventListener("click", () => {
    const intervalSec = parseInt(document.getElementById("select-interval-brutal")?.value) || 10;
    sendBrutalAllGroupsToTab(intervalSec);
  });

  document.getElementById("btn-run-storyboard-all-groups")?.addEventListener("click", () => {
    const intervalSec = parseInt(document.getElementById("select-interval-seq")?.value) || 10;
    sendStoryboardAllGroupsToTab(intervalSec);
  });
}

function renderScenes() {
  const container = document.getElementById("ext-scenes-container");
  if (!container) return;

  const currentScenes = groups[activeGroupIndex]?.scenes || [];

  container.innerHTML = currentScenes.map((sc, idx) => {
    return "<div class=\"p-2.5 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2 transition shadow\">" +
      "<div class=\"flex items-center justify-between border-b border-slate-800 pb-1.5\">" +
        "<div class=\"flex items-center gap-1.5\">" +
          "<span class=\"px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[9.5px] font-black font-mono border border-orange-500/40\">" +
            "SCENE " + (idx + 1) +
          "</span>" +
          "<input type=\"text\" value=\"" + (sc.shotType || ("Scene " + (idx+1))) + "\" onchange=\"updateSceneField(" + idx + ", \x27shotType\x27, this.value)\" class=\"bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-amber-300 font-mono w-24 focus:outline-none focus:border-amber-400 truncate\">" +
        "</div>" +
        "<div class=\"flex items-center gap-1\">" +
          "<button onclick=\"runSingleScene(" + idx + ")\" class=\"touch-btn px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-[9px] font-extrabold border border-amber-500/40 shadow\">" +
            "<i class=\"fa-solid fa-play mr-0.5\"></i>Run" +
          "</button>" +
          "<button onclick=\"deleteScene(" + idx + ")\" class=\"touch-btn w-5 h-5 rounded bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-[9px] flex items-center justify-center shadow\">" +
            "<i class=\"fa-solid fa-trash\"></i>" +
          "</button>" +
        "</div>" +
      "</div>" +

      "<div class=\"grid grid-cols-12 gap-2 items-stretch\">" +
        "<label for=\"scene-file-input-" + idx + "\" class=\"touch-btn col-span-5 relative aspect-[9/16] rounded-lg overflow-hidden bg-black border border-dashed border-slate-700 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer group shadow\">" +
          (sc.imageUrl ? ("<img src=\"" + sc.imageUrl + "\" class=\"w-full h-full object-cover rounded-lg\">") : ("<div class=\"p-1 text-center text-slate-500 group-hover:text-amber-400\"><i class=\"fa-solid fa-image text-base mb-0.5\"></i><div class=\"text-[8px] font-bold\">+ Foto</div></div>")) +
          "<input type=\"file\" id=\"scene-file-input-" + idx + "\" accept=\"image/*\" class=\"hidden\" onchange=\"handleScenePhotoSelected(" + idx + ", this)\">" +
        "</label>" +

        "<div class=\"col-span-7 bg-slate-950/80 border border-slate-800/90 rounded-lg p-2 flex flex-col justify-between space-y-1.5\">" +
          "<div>" +
            "<span class=\"text-[8px] font-bold text-amber-400 font-mono uppercase\">Durasi:</span>" +
            "<select onchange=\"updateSceneField(" + idx + ", \x27duration\x27, this.value)\" class=\"w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-white outline-none mt-0.5\">" +
              "<option value=\"4\"" + (sc.duration == 4 ? " selected" : "") + ">4 Detik</option>" +
              "<option value=\"6\"" + (sc.duration == 6 ? " selected" : "") + ">6 Detik</option>" +
              "<option value=\"8\"" + (sc.duration == 8 ? " selected" : "") + ">8 Detik</option>" +
              "<option value=\"10\"" + (sc.duration == 10 ? " selected" : "") + ">10 Detik</option>" +
            "</select>" +
          "</div>" +
          "<div>" +
            "<span class=\"text-[8px] font-bold text-amber-400 font-mono uppercase\">Ukuran:</span>" +
            "<select onchange=\"updateSceneField(" + idx + ", \x27aspectRatio\x27, this.value)\" class=\"w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-white outline-none mt-0.5\">" +
              "<option value=\"9:16\"" + (sc.aspectRatio === "9:16" ? " selected" : "") + ">9:16 (TikTok)</option>" +
              "<option value=\"1:1\"" + (sc.aspectRatio === "1:1" ? " selected" : "") + ">1:1 (Square)</option>" +
              "<option value=\"16:9\"" + (sc.aspectRatio === "16:9" ? " selected" : "") + ">16:9 (Landscape)</option>" +
            "</select>" +
          "</div>" +
        "</div>" +
      "</div>" +

      "<div class=\"space-y-0.5\">" +
        "<span class=\"text-[8.5px] font-bold text-amber-400 font-mono uppercase\">Prompt Video:</span>" +
        "<textarea onchange=\"updateSceneField(" + idx + ", \x27promptVideo\x27, this.value)\" placeholder=\"Ketik prompt motion di sini...\" class=\"w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-lg p-2 text-[9.5px] text-white placeholder-slate-600 focus:outline-none h-14 leading-relaxed resize-none\">" + (sc.promptVideo || "") + "</textarea>" +
      "</div>" +

      "<div class=\"space-y-0.5\">" +
        "<span class=\"text-[8.5px] font-bold text-emerald-400 font-mono uppercase\">Voiceover:</span>" +
        "<input type=\"text\" value=\"" + (sc.voiceover || "") + "\" onchange=\"updateSceneField(" + idx + ", \x27voiceover\x27, this.value)\" placeholder=\"Tulis narasi suara...\" class=\"w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-lg px-2 py-1 text-[9.5px] text-white placeholder-slate-600 focus:outline-none truncate\">" +
      "</div>" +
    "</div>";
  }).join("");
}

window.updateSceneField = function(idx, field, value) {
  const currentScenes = groups[activeGroupIndex]?.scenes;
  if (currentScenes && currentScenes[idx]) {
    currentScenes[idx][field] = value;
    saveState();
  }
};

window.deleteScene = function(idx) {
  const currentScenes = groups[activeGroupIndex]?.scenes;
  if (!currentScenes || currentScenes.length <= 1) return;
  currentScenes.splice(idx, 1);
  renderScenes();
  saveState();
};

window.handleScenePhotoSelected = function(idx, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    groups[activeGroupIndex].scenes[idx].imageUrl = e.target.result;
    renderScenes();
    saveState();
  };
  reader.readAsDataURL(file);
};

function sendSafeTabMessage(payload, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].id) {
      alert("⚠️ Silakan buka tab website Flow AI.");
      return;
    }

    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, payload, (response) => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, payload, () => {
              if (callback) callback();
            });
          }, 300);
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

window.runSingleScene = function(idx) {
  const sc = groups[activeGroupIndex].scenes[idx];
  if (!sc) return;

  sendSafeTabMessage({
    action: "FLOW_AI_RUN_SINGLE_SCENE",
    data: {
      sceneIndex: idx,
      imageUrl: sc.imageUrl,
      prompt: sc.promptVideo,
      duration: sc.duration,
      aspectRatio: sc.aspectRatio || "9:16"
    }
  }, () => {
    alert("🚀 Scene " + (idx+1) + " (" + groups[activeGroupIndex].name + ") terinjeksi ke Flow AI!");
  });
};

function sendBrutalSingleToTab() {
  const brutalState = groups[activeGroupIndex].brutalState;
  const promptText = brutalState.prompt || "Generate high quality cinematic commercial video 4k 60fps";
  const images = [brutalState.product, brutalState.model, brutalState.location].filter(Boolean);

  sendSafeTabMessage({
    action: "FLOW_AI_RUN_BRUTAL",
    data: {
      images: images,
      productImg: brutalState.product,
      modelImg: brutalState.model,
      locationImg: brutalState.location,
      prompt: promptText,
      autoLoop: false
    }
  }, () => {
    alert("🔥 Foto & Prompt " + groups[activeGroupIndex].name + " Terinjeksi ke Flow AI!");
  });
}

function sendBrutalAllGroupsToTab(intervalSec) {
  sendSafeTabMessage({
    action: "FLOW_AI_RUN_ALL_GROUPS_BRUTAL",
    data: {
      groups: groups,
      intervalSeconds: intervalSec
    }
  }, () => {
    alert("🚀 Auto Generate Semua Kelompok dimulai dengan jeda " + intervalSec + "s!");
  });
}

function sendStoryboardAllGroupsToTab(intervalSec) {
  sendSafeTabMessage({
    action: "FLOW_AI_RUN_ALL_GROUPS_STORYBOARD",
    data: {
      groups: groups,
      intervalSeconds: intervalSec
    }
  }, () => {
    alert("🚀 Auto Sequence Semua Kelompok dimulai dengan jeda " + intervalSec + "s!");
  });
}

function saveAllJson() {
  const data = {
    app: "Flow AI Master Studio",
    version: "15.0",
    activeGroupIndex: activeGroupIndex,
    groups: groups
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "FlowAI-Master-Data.json";
  a.click();
}

function copyAllPromptsText() {
  let text = "";
  const currentGroup = groups[activeGroupIndex];
  if (currentMode === "brutal") {
    text = "[" + currentGroup.name + "]: " + (currentGroup.brutalState.prompt || "");
  } else {
    text = currentGroup.scenes.map((s, i) => "[" + currentGroup.name + " - Scene " + (i+1) + " (" + s.duration + "s)]: " + (s.promptVideo || "") + "\nNarasi: \"" + (s.voiceover || "") + "\"").join("\n\n");
  }
  navigator.clipboard.writeText(text);
  alert("📋 Prompt " + currentGroup.name + " berhasil disalin!");
}

function saveState() {
  const state = {
    currentMode: currentMode,
    activeGroupIndex: activeGroupIndex,
    groups: groups
  };
  chrome.storage?.local?.set({ "flow_ai_master_v13_state": state });
}

function loadSavedState() {
  chrome.storage?.local?.get(["flow_ai_master_v13_state"], (res) => {
    if (res && res.flow_ai_master_v13_state) {
      const st = res.flow_ai_master_v13_state;
      if (st.currentMode) currentMode = st.currentMode;
      if (st.groups && Array.isArray(st.groups) && st.groups.length > 0) {
        groups = st.groups;
        activeGroupIndex = Math.min(st.activeGroupIndex || 0, groups.length - 1);
      }
    }
    renderGroupPills();
    updateActiveGroupView();
  });
}