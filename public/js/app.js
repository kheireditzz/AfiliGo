
// ================================================================
// DRAGGABLE & EDGE-DOCKING FLOATING HUB CONTROLLER
// ================================================================
let isFloatingHubActive = false;
let isFloatingWindowOpen = false;
let isDockedOnLeft = false;
let isDockedOnRight = false;
let activeServerList = [
  { id: 'srv-1', name: 'Server 1 (Flow AI)', url: 'https://labs.google/fx/id/tools/flow', description: 'Google Labs Flow AI - Sesi login aktif', status: 'ON' },
  { id: 'srv-2', name: 'Server 2 (Studio Pro)', url: 'https://aistudio.google.com/', description: 'Google AI Studio Pro Cloud Workspace', status: 'ON' },
  { id: 'srv-3', name: 'Server 3 (Flux Video)', url: 'https://pollinations.ai/', description: 'High-Performance 8K Visual Engine', status: 'ON' }
];
let currentSelectedServerIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadFloatingServersState();
  initDraggableFloatingWidget();
});

async function loadFloatingServersState() {
  try {
    const res = await fetch('/api/floating-servers');
    const data = await res.json();
    if (data) {
      // Respect user's local activation toggle (default: false / OFF)
      if (localStorage.getItem('affiliate_floating_user_enabled') !== null) {
        isFloatingHubActive = localStorage.getItem('affiliate_floating_user_enabled') === 'true';
      } else {
        isFloatingHubActive = false; // Default OFF
      }

      if (data.servers && data.servers.length > 0) {
        activeServerList = data.servers.map(s => ({ ...s, status: s.status || 'ON' }));
      }

      syncActivationSwitchesUI();
      applyFloatingHubVisibility();
      renderFloatingServerTabs();
      renderSettingsServerTable();
      updateFloatingVipBadge();
    }
  } catch (e) {
    console.error('Error loading floating servers:', e);
  }
}

function syncActivationSwitchesUI() {
  const drawerToggle = document.getElementById('drawer-floating-toggle');
  const settingsToggle = document.getElementById('setting-floating-enabled');
  const dashToggle = document.getElementById('dashboard-floating-toggle');
  const dashBadge = document.getElementById('dash-floating-status-badge');

  if (drawerToggle) drawerToggle.checked = isFloatingHubActive;
  if (settingsToggle) settingsToggle.checked = isFloatingHubActive;
  if (dashToggle) dashToggle.checked = isFloatingHubActive;

  if (dashBadge) {
    if (isFloatingHubActive) {
      dashBadge.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/40';
      dashBadge.innerText = 'AKTIF';
    } else {
      dashBadge.className = 'px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-mono font-bold border border-slate-700';
      dashBadge.innerText = 'OFF';
    }
  }
}

function applyFloatingHubVisibility() {
  const fab = document.getElementById('floating-hub-fab');
  const win = document.getElementById('floating-hub-window');

  if (isFloatingHubActive) {
    if (fab) {
      fab.classList.remove('hidden');
      if (!fab.style.top || fab.style.top === '70px') {
        fab.style.top = '70px';
        fab.style.left = '50%';
        fab.style.transform = 'translateX(-50%)';
      }
    }
  } else {
    if (fab) fab.classList.add('hidden');
    if (win) {
      win.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100', 'flex');
      win.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    }
    isFloatingWindowOpen = false;
  }
  updateFloatingVipBadge();
}

function updateFloatingVipBadge() {
  const lockBadge = document.getElementById('floating-vip-lock-badge');
  const statusPill = document.getElementById('floating-server-status-pill');
  const liveDot = document.getElementById('floating-live-dot');

  const isAdmin = currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.username === 'admin' || currentUser.email === 'kheireditz@gmail.com');
  const hasVipAccess = isVipUser || isAdmin;

  if (lockBadge) {
    if (hasVipAccess) {
      lockBadge.className = 'px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-mono font-bold border border-emerald-500/30 flex items-center gap-0.5';
      lockBadge.innerHTML = '<i class="fa-solid fa-unlock text-[7px]"></i> VIP UNLOCKED';
    } else {
      lockBadge.className = 'px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold border border-amber-500/30 flex items-center gap-0.5';
      lockBadge.innerHTML = '<i class="fa-solid fa-lock text-[7px]"></i> VIP LOCKED';
    }
  }

  const currentSrv = activeServerList[currentSelectedServerIndex];
  const isServerOn = currentSrv ? currentSrv.status !== 'OFF' : true;

  if (statusPill) {
    if (isServerOn) {
      statusPill.className = 'px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-mono font-bold border border-emerald-500/30';
      statusPill.innerText = 'ONLINE';
    } else {
      statusPill.className = 'px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[8px] font-mono font-bold border border-rose-500/30';
      statusPill.innerText = 'OFFLINE';
    }
  }

  if (liveDot) {
    liveDot.className = isServerOn ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse' : 'w-2 h-2 rounded-full bg-rose-500';
  }
}

// Action 1: Click Body = Open Server Dropdown Window
// Action: Click Pill = Open / Close Server Window
function handleFloatingHubBodyClick(e) {
  if (e) e.stopPropagation();

  const isAdmin = currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.username === 'admin' || currentUser.email === 'kheireditz@gmail.com');
  const hasVipAccess = isVipUser || isAdmin;

  if (!hasVipAccess) {
    openVipPaymentModal();
    return;
  }

  toggleFloatingHub();
}

// DRAGGABLE WITHOUT AUTO-DOCKING (STABLE DI MANA PUN DITINGGALKAN)
// DRAGGABLE WITHOUT JUMP/BOUNCE GLITCH
function initDraggableFloatingWidget() {
  const fab = document.getElementById('floating-hub-fab');
  if (!fab) return;

  let isPointerDown = false;
  let isActuallyDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const onStart = (e) => {
    // If clicked on an interactive element (link / button), do not initiate drag
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }

    isPointerDown = true;
    isActuallyDragging = false;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = fab.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
  };

  const onMove = (e) => {
    if (!isPointerDown) return;

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Only start dragging if moved more than 6px threshold (distinguishing click vs drag)
    if (!isActuallyDragging && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
      isActuallyDragging = true;
      fab.style.transition = 'none';
      fab.style.transform = 'none';
    }

    if (isActuallyDragging) {
      e.preventDefault();

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      // Constrain inside viewport
      const minLeft = 10;
      const maxLeft = window.innerWidth - fab.offsetWidth - 10;
      const minTop = 60;
      const maxTop = window.innerHeight - fab.offsetHeight - 10;

      newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
      newTop = Math.max(minTop, Math.min(maxTop, newTop));

      fab.style.left = newLeft + 'px';
      fab.style.top = newTop + 'px';
    }
  };

  const onEnd = () => {
    isPointerDown = false;
    isActuallyDragging = false;
  };

  fab.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  fab.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
}

function renderSettingsServerTable() {
  const tbody = document.getElementById('settings-server-tbody');
  if (!tbody) return;

  if (activeServerList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-slate-500">Belum ada server ditambahkan.</td></tr>';
    return;
  }

  tbody.innerHTML = activeServerList.map((srv, idx) => {
    const isServerOn = srv.status !== 'OFF';
    return `
      <tr class="hover:bg-slate-900/60 transition">
        <td class="px-3 py-2.5 font-bold text-white flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full ${isServerOn ? 'bg-emerald-400' : 'bg-rose-500'}"></span>
          <span>${srv.name}</span>
        </td>
        <td class="px-3 py-2.5">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" onchange="toggleServerStatus(${idx}, this.checked)" ${isServerOn ? 'checked' : ''} class="sr-only peer">
            <div class="w-7 h-3.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1.5px] after:left-[2px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span class="ml-1.5 text-[9px] font-mono font-bold ${isServerOn ? 'text-emerald-400' : 'text-slate-500'}">${isServerOn ? 'ON' : 'OFF'}</span>
          </label>
        </td>
        <td class="px-3 py-2.5 text-slate-400 font-mono text-[11px] max-w-[130px] truncate" title="${srv.url}">${srv.url}</td>
        <td class="px-3 py-2.5 text-slate-400 text-[11px] max-w-[150px] truncate" title="${srv.description || ''}">${srv.description || '-'}</td>
        <td class="px-3 py-2.5 text-right">
          <button onclick="deleteCustomServer(${idx})" class="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition" title="Hapus Server">
            <i class="fa-solid fa-trash text-[10px]"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleServerStatus(index, isChecked) {
  if (activeServerList[index]) {
    activeServerList[index].status = isChecked ? 'ON' : 'OFF';
    renderFloatingServerTabs();
    renderSettingsServerTable();
    updateFloatingVipBadge();

    try {
      await fetch('/api/floating-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isFloatingHubActive, servers: activeServerList })
      });
    } catch (err) {
      console.error('Error updating server status:', err);
    }
  }
}

// AFFILIATE AI STUDIO - MAIN APPLICATION CONTROLLER
// ================================================================

let currentUser = null;
let isVipUser = false;
let isSidebarOpen = false;
let autoSaveTimer = null;
let currentCropTarget = null;
let activeCropper = null;
let currentActiveHistoryType = null;
let currentInvoiceId = null;
let invoicePollInterval = null;
let vipTimerInterval = null;
let vipExpiryTimestamp = null;
let isCtaActive = true;

let productsCache = [];
let storyboardsCache = [];
let promptsCache = [];
let standaloneRendersCache = JSON.parse(localStorage.getItem("affiliate_ai_renders_history") || "[]");

let uploadedImages = { product: null, model: null, location: null };
let rawImages = { product: null, model: null, location: null };

let currentStoryboard = {
  id: null,
  title: "Affiliate Campaign Blueprint",
  platform: "TikTok / Reels (9:16)",
  totalDuration: 15,
  modelDescription: "Indonesian Female Content Creator, 22 years old",
  locationSetting: "Modern Aesthetic Coffee Shop with warm lighting",
  hook: "Jangan beli sebelum nonton ini sampai habis!",
  cta: "Klik keranjang kuning sekarang mumpung diskon 50%!",
  scenes: []
};

let currentFeaturesConfig = {
  "storyboard-creator": { name: "AI Storyboard & Foto", isVip: false, isError: false, errorMsg: "Fitur sedang dalam perbaikan server." },
  "storyboard-list": { name: "Galeri Storyboard", isVip: false, isError: false, errorMsg: "Fitur sedang dalam pemeliharaan." },
  "product-db": { name: "Database Produk", isVip: true, isError: false, errorMsg: "Fitur sedang dalam pemeliharaan server." },
  "prompt-library": { name: "Prompt Library", isVip: true, isError: false, errorMsg: "Fitur sedang dalam pemeliharaan server." },
  "ai-photo-generator": { name: "Studio Foto AI", isVip: true, isError: false, errorMsg: "Engine Flux sedang mengalami antrean render tinggi." }
};

document.addEventListener("DOMContentLoaded", () => {
  checkAuthSession();
});

function checkAuthSession() {
  let savedToken = localStorage.getItem("affiliate_ai_auth_token");
  let savedUser = localStorage.getItem("affiliate_ai_user");

  // If no saved user, default to Super Admin for seamless uninterrupted access
  if (!savedToken || !savedUser) {
    const defaultAdmin = {
      id: "usr-admin-1",
      name: "Super Administrator",
      email: "kheireditz@gmail.com",
      role: "SUPER_ADMIN",
      vipActive: true,
      hasApiKey: false
    };
    savedToken = "super_admin_session_" + Date.now();
    savedUser = JSON.stringify(defaultAdmin);
    localStorage.setItem("affiliate_ai_auth_token", savedToken);
    localStorage.setItem("affiliate_ai_user", savedUser);
  }

  try {
    currentUser = JSON.parse(savedUser);
    showMainApp();
  } catch (e) {
    showLoginScreen();
  }

  // Smoothly fade out App Skeleton Preloader
  const preloader = document.getElementById("app-skeleton-preloader") || document.getElementById("tiktok-preloader");
  if (preloader) {
    preloader.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      if (preloader.parentElement) preloader.remove();
    }, 100);
  }
}

function bypassLoginDirectly() {
  const defaultAdmin = {
    id: "usr-admin-1",
    name: "Kheir Editz (Super Admin)",
    email: "kheireditz@gmail.com",
    role: "SUPER_ADMIN",
    vipActive: true,
    hasApiKey: true
  };
  localStorage.setItem("affiliate_ai_auth_token", "super_admin_direct_token_" + Date.now());
  localStorage.setItem("affiliate_ai_user", JSON.stringify(defaultAdmin));
  currentUser = defaultAdmin;

  const overlay = document.getElementById("login-overlay");
  const app = document.getElementById("main-app");
  if (overlay) {
    overlay.classList.add("hidden");
    overlay.style.setProperty("display", "none", "important");
  }
  if (app) {
    app.classList.remove("hidden");
    app.style.setProperty("display", "flex", "important");
    app.style.height = "100vh";
    app.style.minHeight = "100vh";
  }
  try { showMainApp(); } catch(e) {}
  try { selectMenu("dashboard"); } catch(e) {}
  try { openTab("dashboard"); } catch(e) {}
}

window.bypassLoginDirectly = bypassLoginDirectly;

function showLoginScreen() {
  const loginOverlay = document.getElementById("login-overlay");
  const mainApp = document.getElementById("main-app");
  if (loginOverlay) {
    loginOverlay.classList.remove("hidden");
    loginOverlay.style.display = "flex";
  }
  if (mainApp) {
    mainApp.classList.add("hidden");
    mainApp.style.display = "none";
  }

  const preloader = document.getElementById("app-skeleton-preloader") || document.getElementById("tiktok-preloader");
  if (preloader) {
    preloader.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      if (preloader.parentElement) preloader.remove();
    }, 400);
  }
}

function showMainApp() {
  const loginOverlay = document.getElementById("login-overlay");
  const mainApp = document.getElementById("main-app");
  
  if (loginOverlay) {
    loginOverlay.classList.add("hidden");
    loginOverlay.style.setProperty("display", "none", "important");
  }
  
  if (mainApp) {
    mainApp.classList.remove("hidden");
    mainApp.style.setProperty("display", "flex", "important");
    mainApp.style.height = "100vh";
    mainApp.style.minHeight = "100vh";
  }

  if (currentUser && currentUser.name) {
    const adminInput = document.getElementById("setting-admin-name");
    if (adminInput) adminInput.value = currentUser.name;
    const drawerAdminName = document.getElementById("drawer-admin-name");
    if (drawerAdminName) drawerAdminName.innerText = currentUser.name;
  }

  openTab("dashboard");

  // Lightweight staggered initialization for silky-smooth 60fps performance
  setTimeout(() => {
    try { loadDashboardData(); } catch(e){}
    try { checkVipStatus(); } catch(e){}
  }, 50);

  setTimeout(() => {
    try { loadSettings(); } catch(e){}
    try { loadGeminiKeysPool(); } catch(e){}
  }, 500);
}

function switchAuthMode(mode) {
  const loginForm = document.getElementById("form-login");
  const regForm = document.getElementById("form-register");
  const tabLogin = document.getElementById("tab-auth-login");
  const tabReg = document.getElementById("tab-auth-register");
  const errorMsg = document.getElementById("login-error-msg");
  const successMsg = document.getElementById("login-success-msg");

  if (errorMsg) errorMsg.classList.add("hidden");
  if (successMsg) successMsg.classList.add("hidden");

  if (mode === "login") {
    if (loginForm) loginForm.classList.remove("hidden");
    if (regForm) regForm.classList.add("hidden");
    if (tabLogin) tabLogin.className = "py-2 rounded-xl font-bold text-xs transition bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow";
    if (tabReg) tabReg.className = "py-2 rounded-xl font-bold text-xs text-slate-400 hover:text-white transition";
  } else {
    if (loginForm) loginForm.classList.add("hidden");
    if (regForm) regForm.classList.remove("hidden");
    if (tabReg) tabReg.className = "py-2 rounded-xl font-bold text-xs transition bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow";
    if (tabLogin) tabLogin.className = "py-2 rounded-xl font-bold text-xs text-slate-400 hover:text-white transition";
  }
}

async function handleRegister(e) {
  if (e) e.preventDefault();
  
  const nameEl = document.getElementById("reg-name");
  const emailEl = document.getElementById("reg-email");
  const passEl = document.getElementById("reg-password");
  const errorMsg = document.getElementById("login-error-msg");
  const btn = document.getElementById("btn-register");

  const name = nameEl ? nameEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const password = passEl ? passEl.value.trim() : "";

  if (errorMsg) errorMsg.classList.add("hidden");

  if (!name || !email || !password) {
    if (errorMsg) {
      errorMsg.innerText = "Harap isi nama, email, dan password secara lengkap!";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (password.length < 6) {
    if (errorMsg) {
      errorMsg.innerText = "Password minimal 6 karakter!";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin\"></i> Mendaftarkan Akun...";
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("affiliate_ai_auth_token", data.token);
      localStorage.setItem("affiliate_ai_user", JSON.stringify(data.user));
      currentUser = data.user;
      showMainApp();
    } else {
      if (errorMsg) {
        errorMsg.innerText = data.message || "Gagal mendaftar. Email mungkin sudah terdaftar.";
        errorMsg.classList.remove("hidden");
      }
    }
  } catch (err) {
    console.error("Register error:", err);
    if (errorMsg) {
      errorMsg.innerText = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      errorMsg.classList.remove("hidden");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "<i class=\"fa-solid fa-user-plus\"></i><span>Daftar</span>";
    }
  }
}

async function handleLogin(e) {
  if (e) e.preventDefault();
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorMsg = document.getElementById("login-error-msg");
  const btn = document.getElementById("btn-login");

  const username = usernameInput ? usernameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  if (errorMsg) errorMsg.classList.add("hidden");

  if (!username || !password) {
    if (errorMsg) {
      errorMsg.innerText = "Harap masukkan email dan password!";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin\"></i> Memverifikasi...";
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("affiliate_ai_auth_token", data.token);
      localStorage.setItem("affiliate_ai_user", JSON.stringify(data.user));
      currentUser = data.user;
      showToastNotification("success", "Login Berhasil", data.message || "Selamat datang kembali!");
      showMainApp();
    } else {
      if (errorMsg) {
        errorMsg.innerText = data.message || "Email atau password salah!";
        errorMsg.classList.remove("hidden");
      }
    }
  } catch (err) {
    console.error("Login error:", err);
    if (errorMsg) {
      errorMsg.innerText = "Gagal terhubung ke server autentikasi.";
      errorMsg.classList.remove("hidden");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "<i class=\"fa-solid fa-right-to-bracket\"></i><span>Masuk</span>";
    }
  }
}

function handleLogout() {
  localStorage.removeItem("affiliate_ai_auth_token");
  localStorage.removeItem("affiliate_ai_user");
  currentUser = null;
  toggleSidebar(false);
  showLoginScreen();
  showToastNotification("success", "Logout Berhasil", "Anda telah keluar dari akun dengan aman.");
}

async function updateAdminProfile() {
  const name = document.getElementById("setting-admin-name").value.trim();
  const currentPassword = document.getElementById("setting-current-pass").value.trim();
  const newPassword = document.getElementById("setting-new-pass").value.trim();

  if (!currentPassword) {
    showToastNotification("error", "Simpan Gagal", "Harap masukkan password saat ini untuk verifikasi!");
    return;
  }

  try {
    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword, newPassword })
    });

    const data = await res.json();
    if (res.ok) {
      showToastNotification("success", "Simpan Sukses", "Profil dan password admin berhasil diperbarui.");
      if (name && currentUser) {
        currentUser.name = name;
        localStorage.setItem("affiliate_ai_user", JSON.stringify(currentUser));
        const drawerAdminName = document.getElementById("drawer-admin-name");
        if (drawerAdminName) drawerAdminName.innerText = name;
      }
      document.getElementById("setting-current-pass").value = "";
      document.getElementById("setting-new-pass").value = "";
    } else {
      showToastNotification("error", "Simpan Gagal", data.error || "Gagal memperbarui profil.");
    }
  } catch (err) {
    console.error("Update profile error:", err);
    showToastNotification("error", "Simpan Gagal", "Terjadi kesalahan koneksi saat memperbarui akun.");
  }
}

function toggleSidebar(forceState) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const contentContainer = document.getElementById("content-scroll-container");
  
  if (typeof forceState === "boolean") {
    isSidebarOpen = forceState;
  } else {
    isSidebarOpen = !isSidebarOpen;
  }

  if (isSidebarOpen) {
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    backdrop.classList.remove("hidden");
    if (contentContainer) contentContainer.style.overflowY = "hidden";
  } else {
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    backdrop.classList.add("hidden");
    if (contentContainer) contentContainer.style.overflowY = "auto";
  }
}

function selectMenu(tabId) {
  openTab(tabId);
  toggleSidebar(false);
}

function openTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.add("hidden");
    el.style.display = "none";
  });
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("bg-orange-600/20", "text-amber-300", "font-bold", "border", "border-orange-500/40");
    btn.classList.add("text-slate-400");
  });

  const target = document.getElementById("tab-" + tabId);
  if (target) {
    target.classList.remove("hidden");
    if (tabId === "gemini-chat") {
      target.style.display = "flex";
    } else {
      target.style.display = "block";
    }
  }

  const activeNav = document.getElementById("nav-" + tabId);
  if (activeNav) {
    activeNav.classList.remove("text-slate-400");
    activeNav.classList.add("bg-orange-600/20", "text-amber-300", "font-bold", "border", "border-orange-500/40");
  }

  // Toggle header 'Buat' button: show only on dashboard, hide when in any feature
  const headerCreateBtn = document.getElementById("header-btn-create");
  if (headerCreateBtn) {
    if (tabId === "dashboard") {
      headerCreateBtn.classList.remove("hidden");
      headerCreateBtn.style.display = "";
    } else {
      headerCreateBtn.classList.add("hidden");
      headerCreateBtn.style.display = "none";
    }
  }

  const contentContainer = document.getElementById("content-scroll-container");
  if (contentContainer) contentContainer.scrollTop = 0;
}

async function checkVipStatus() {
  try {
    const res = await fetch("/api/vip/status");
    const data = await res.json();
    isVipUser = data.vipActive || false;
    
    if (isVipUser && data.expiresAt) {
      startVipCountdownClock(data.expiresAt);
    }
    updateVipUiState(data); updateFloatingVipBadge();
  } catch (e) {
    console.error("Error checking VIP status:", e);
  }
}

function startVipCountdownClock(expiresAt) {
  if (!expiresAt) return;
  vipExpiryTimestamp = new Date(expiresAt).getTime();

  if (vipTimerInterval) clearInterval(vipTimerInterval);

  const updateClock = () => {
    const now = Date.now();
    const distance = vipExpiryTimestamp - now;

    if (distance <= 0) {
      clearInterval(vipTimerInterval);
      isVipUser = false;
      updateVipUiState();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const clockEl = document.getElementById("vip-timer-clock");
    const badgeEl = document.getElementById("vip-timer-days-badge");
    
    if (clockEl) clockEl.innerText = days + " Hari " + hours + " Jam " + minutes + " Menit " + seconds + " Detik";
    if (badgeEl) badgeEl.innerText = days + " Hari Lagi";
  };

  updateClock();
  vipTimerInterval = setInterval(updateClock, 1000);
}

function updateVipUiState(vipData) {
  const drawerVipBadge = document.getElementById("drawer-vip-badge");
  const drawerUpgradeBtn = document.getElementById("btn-drawer-upgrade-vip");
  const countdownContainer = document.getElementById("vip-countdown-container");
  const drawerVipDesc = document.getElementById("drawer-vip-desc");

  if (isVipUser) {
    if (drawerVipBadge) {
      drawerVipBadge.innerText = "VIP AKTIF";
      drawerVipBadge.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold font-mono border border-emerald-500/40";
    }
    if (countdownContainer) countdownContainer.classList.remove("hidden");
    if (drawerVipDesc) drawerVipDesc.innerText = "Akses seluruh fitur premium aktif tanpa batasan selama masa langganan.";
    if (drawerUpgradeBtn) {
      drawerUpgradeBtn.innerHTML = "<i class=\"fa-solid fa-crown text-[10px]\"></i><span>Langganan VIP Aktif</span>";
      drawerUpgradeBtn.className = "w-full py-2.5 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] font-display flex items-center justify-center gap-1.5 cursor-default";
    }
  } else {
    if (drawerVipBadge) {
      drawerVipBadge.innerText = "Rp 25.000";
      drawerVipBadge.className = "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-extrabold font-mono border border-amber-500/40";
    }
    if (countdownContainer) countdownContainer.classList.add("hidden");
    if (drawerVipDesc) drawerVipDesc.innerText = "Buka semua fitur Studio Foto AI, Database Produk & Prompt Library tanpa batas selama 30 Hari.";
    if (drawerUpgradeBtn) {
      drawerUpgradeBtn.innerHTML = "<i class=\"fa-solid fa-qrcode text-[10px]\"></i><span>Upgrade VIP (Rp 25.000)</span>";
      drawerUpgradeBtn.className = "w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 active:scale-95 text-white font-extrabold text-[11px] font-display shadow flex items-center justify-center gap-1.5 transition";
    }
  }
}

async function loadFeaturesConfig() {
  try {
    const res = await fetch("/api/admin/features-config");
    const data = await res.json();
    if (data && data.featureConfig) {
      currentFeaturesConfig = { ...currentFeaturesConfig, ...data.featureConfig };
      renderFeaturesConfigTable();
      applyFeatureLockAndErrorState();
    }
  } catch (e) {
    console.error("Error loading feature configs:", e);
  }
}

function renderFeaturesConfigTable() {
  const tbody = document.getElementById("features-config-tbody");
  if (!tbody) return;

  tbody.innerHTML = Object.keys(currentFeaturesConfig).map(key => {
    const feat = currentFeaturesConfig[key];
    return "<tr class=\"hover:bg-slate-900/60 transition\">" +
      "<td class=\"px-3 py-2.5 font-bold text-white flex items-center gap-1.5\">" +
        "<span>" + feat.name + "</span>" +
        "<span class=\"text-[9px] font-mono text-slate-500\">(" + key + ")</span>" +
      "</td>" +
      "<td class=\"px-3 py-2.5 text-center\">" +
        "<label class=\"relative inline-flex items-center cursor-pointer\">" +
          "<input type=\"checkbox\" id=\"cfg-vip-" + key + "\" " + (feat.isVip ? "checked" : "") + " class=\"sr-only peer\">" +
          "<div class=\"w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500\"></div>" +
        "</label>" +
      "</td>" +
      "<td class=\"px-3 py-2.5 text-center\">" +
        "<label class=\"relative inline-flex items-center cursor-pointer\">" +
          "<input type=\"checkbox\" id=\"cfg-err-" + key + "\" " + (feat.isError ? "checked" : "") + " class=\"sr-only peer\">" +
          "<div class=\"w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600\"></div>" +
        "</label>" +
      "</td>" +
      "<td class=\"px-3 py-2.5\">" +
        "<input type=\"text\" id=\"cfg-msg-" + key + "\" value=\"" + (feat.errorMsg || "") + "\" placeholder=\"Pesan saat error...\" class=\"w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400\">" +
      "</td>" +
    "</tr>";
  }).join("");
}

async function saveFeatureConfigFromAdmin() {
  const saveBtn = document.getElementById("btn-save-feature-config");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin\"></i> Menyimpan...";
  }

  Object.keys(currentFeaturesConfig).forEach(key => {
    const vipEl = document.getElementById("cfg-vip-" + key);
    const errEl = document.getElementById("cfg-err-" + key);
    const msgEl = document.getElementById("cfg-msg-" + key);

    if (vipEl) currentFeaturesConfig[key].isVip = vipEl.checked;
    if (errEl) currentFeaturesConfig[key].isError = errEl.checked;
    if (msgEl) currentFeaturesConfig[key].errorMsg = msgEl.value.trim();
  });

  try {
    const res = await fetch("/api/admin/features-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureConfig: currentFeaturesConfig })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification("success", "Konfigurasi Berhasil Disimpan!", "Status fitur dan keamanan sistem berhasil diperbarui di cloud database.");
      applyFeatureLockAndErrorState();
    } else {
      showToastNotification("error", "Gagal Menyimpan", data.message || "Terjadi kendala saat menyimpan ke database.");
    }
  } catch (e) {
    console.error("Save feature config error:", e);
    showToastNotification("error", "Gagal Menyimpan", "Koneksi terputus. Silakan coba lagi.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = "<i class=\"fa-solid fa-floppy-disk\"></i> Simpan Konfigurasi";
    }
  }
}

function applyFeatureLockAndErrorState() {
  Object.keys(currentFeaturesConfig).forEach(key => {
    const feat = currentFeaturesConfig[key];
    const badge = document.getElementById("lock-badge-" + key);

    if (badge) {
      if (feat.isError) {
        badge.className = "px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-black font-mono border border-rose-500/30 flex items-center gap-1";
        badge.innerHTML = "<i class=\"fa-solid fa-triangle-exclamation text-[8px]\"></i> Maintenance";
      } else if (feat.isVip) {
        if (isVipUser) {
          badge.className = "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black font-mono border border-emerald-500/30 flex items-center gap-1";
          badge.innerHTML = "<i class=\"fa-solid fa-unlock text-[8px]\"></i> Unlocked";
        } else {
          badge.className = "px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black font-mono border border-amber-500/30 flex items-center gap-1";
          badge.innerHTML = "<i class=\"fa-solid fa-lock text-[8px]\"></i> VIP";
        }
      } else {
        badge.className = "px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono border border-slate-700 flex items-center gap-1";
        badge.innerHTML = "Free";
      }
    }
  });
}

function checkAndOpenVipMenu(tabId) {
  const feat = currentFeaturesConfig[tabId];

  if (feat && feat.isError) {
    showToastNotification("warning", "Fitur Dinonaktifkan", (feat.name || "Fitur ini") + " sedang dinonaktifkan sementara. " + (feat.errorMsg || "Dalam pemeliharaan server."));
    return;
  }

  if (currentUser && (currentUser.role === "SUPER_ADMIN" || currentUser.username === "admin" || currentUser.email === "kheireditz@gmail.com")) {
    selectMenu(tabId);
    return;
  }

  if (feat && feat.isVip && !isVipUser) {
    openVipPaymentModal();
    return;
  }

  selectMenu(tabId);
}

function openVipPaymentModal() {
  const modal = document.getElementById("vip-payment-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  document.getElementById("vip-step-generate").classList.remove("hidden");
  document.getElementById("vip-step-qris").classList.add("hidden");
  document.getElementById("vip-step-success").classList.add("hidden");
}

function closeVipPaymentModal() {
  const modal = document.getElementById("vip-payment-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (invoicePollInterval) {
    clearInterval(invoicePollInterval);
    invoicePollInterval = null;
  }
}

async function requestDongtubeInvoice() {
  const btn = document.getElementById("btn-request-qris");
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin\"></i> Menghubungkan ke Dongtube...";

  try {
    const res = await fetch("/api/vip/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    if (data.success && data.qris_image) {
      currentInvoiceId = data.invoice_id;

      document.getElementById("dongtube-qris-img").src = data.qris_image;
      document.getElementById("dongtube-inv-id").innerText = data.invoice_id;

      document.getElementById("vip-step-generate").classList.add("hidden");
      document.getElementById("vip-step-qris").classList.remove("hidden");

      startInvoicePolling(data.invoice_id);
    } else {
      showToastNotification("error", "QRIS Gagal", data.message || "Gagal membuat QRIS Dongtube.");
    }
  } catch (err) {
    console.error("Request Dongtube error:", err);
    showToastNotification("error", "QRIS Error", "Terjadi kesalahan saat memproses QRIS.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function startInvoicePolling(invoiceId) {
  if (invoicePollInterval) clearInterval(invoicePollInterval);
  invoicePollInterval = setInterval(() => {
    checkInvoiceStatusRealtime(invoiceId);
  }, 3500);
}

async function checkInvoiceStatusRealtime(invoiceId) {
  if (!invoiceId) return;
  try {
    const res = await fetch("/api/vip/check-status/" + invoiceId);
    const data = await res.json();

    if (data.status === "paid") {
      if (invoicePollInterval) clearInterval(invoicePollInterval);
      isVipUser = true;
      checkVipStatus();

      document.getElementById("vip-step-qris").classList.add("hidden");
      document.getElementById("vip-step-success").classList.remove("hidden");
      showToastNotification("success", "Pembayaran Berhasil!", "Akun VIP Anda telah aktif selama 30 hari.");
    } else if (data.status === "expired") {
      if (invoicePollInterval) clearInterval(invoicePollInterval);
      showToastNotification("warning", "QRIS Kadaluarsa", "Invoice QRIS telah kadaluarsa. Silakan buat QRIS baru.");
      closeVipPaymentModal();
    }
  } catch (e) {
    console.error("Poll status error:", e);
  }
}

function manualCheckPaymentStatus() {
  if (currentInvoiceId) {
    checkInvoiceStatusRealtime(currentInvoiceId);
  }
}

function triggerUpload(type) {
  const fileInput = document.getElementById("file-input-" + type);
  if (fileInput) fileInput.click();
}

function handleFileSelect(e, type) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    rawImages[type] = event.target.result;
    openCropperModal(type, event.target.result);
  };
  reader.readAsDataURL(file);
}

function reCropImage(type) {
  if (rawImages[type]) {
    openCropperModal(type, rawImages[type]);
  }
}

function openCropperModal(type, imageSrc) {
  currentCropTarget = type;
  const modal = document.getElementById("cropper-modal");
  const cropperImg = document.getElementById("cropper-image");
  const title = document.getElementById("cropper-modal-title");

  const titleMap = {
    product: "Edit & Crop Foto Produk",
    model: "Edit & Crop Foto Model / Talent",
    location: "Edit & Crop Foto Tempat / Setting"
  };
  if (title) title.innerText = titleMap[type] || "Edit & Crop Foto";

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  cropperImg.src = imageSrc;

  if (activeCropper) {
    activeCropper.destroy();
  }

  activeCropper = new Cropper(cropperImg, {
    aspectRatio: type === "location" ? 16 / 9 : (type === "model" ? 9 / 16 : 1),
    viewMode: 1,
    autoCropArea: 0.85,
    responsive: true,
    background: false
  });
}

function setCropRatio(ratio) {
  if (activeCropper) activeCropper.setAspectRatio(ratio);
}

function rotateCropper(degree) {
  if (activeCropper) activeCropper.rotate(degree);
}

function closeCropperModal() {
  const modal = document.getElementById("cropper-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  if (activeCropper) {
    activeCropper.destroy();
    activeCropper = null;
  }
}

function applyCrop() {
  if (!activeCropper || !currentCropTarget) return;

  const canvas = activeCropper.getCroppedCanvas({
    maxWidth: 1024,
    maxHeight: 1024,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high"
  });

  const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
  uploadedImages[currentCropTarget] = croppedDataUrl;

  const thumb = document.getElementById("img-thumb-" + currentCropTarget);
  const placeholder = document.getElementById("placeholder-" + currentCropTarget);
  const cropBtn = document.getElementById("btn-crop-" + currentCropTarget);
  const badge = document.getElementById("badge-has-" + currentCropTarget);

  if (thumb) {
    thumb.src = croppedDataUrl;
    thumb.classList.remove("hidden");
  }
  if (placeholder) placeholder.classList.add("hidden");
  if (cropBtn) cropBtn.classList.remove("hidden");
  if (badge) {
    badge.classList.remove("bg-slate-800", "text-slate-500");
    badge.classList.add("bg-emerald-950/80", "text-emerald-300", "border-emerald-500/50");
    badge.innerHTML = "<i class=\"fa-solid fa-check text-[8px]\"></i> " + (currentCropTarget.charAt(0).toUpperCase() + currentCropTarget.slice(1)) + " Ready";
  }

  const targetJustUploaded = currentCropTarget;
  closeCropperModal();
  triggerTargetVisionAnalysis(targetJustUploaded);
  triggerAutoSave();
}

async function triggerTargetVisionAnalysis(targetType) {
  const badge = document.getElementById("autosave-status-badge");
  const targetLabel = targetType === "product" ? "Foto Produk" : targetType === "model" ? "Karakter Model" : targetType === "location" ? "Latar Tempat" : "Gambar";
  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-amber-400 fa-spin"></i> Vision AI Menganalisa ${targetLabel}...`;
    badge.classList.remove("hidden");
  }

  const currentTitle = document.getElementById("sb-product-title")?.value.trim() || "";

  try {
    const res = await fetch("/api/analyze-uploaded-visuals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productImgBase64: uploadedImages.product || null,
        modelImgBase64: uploadedImages.model || null,
        locationImgBase64: uploadedImages.location || null,
        currentTitle: currentTitle,
        targetType: targetType
      })
    });

    const data = await res.json();
    if (data && data.success) {
      if (targetType === "product" || (!targetType && uploadedImages.product)) {
        const titleEl = document.getElementById("sb-product-title");
        const uspEl = document.getElementById("sb-product-usp");
        if (titleEl && data.suggestedTitle) {
          titleEl.value = data.suggestedTitle;
          titleEl.classList.add("ring-2", "ring-emerald-400", "border-emerald-400");
          setTimeout(() => titleEl.classList.remove("ring-2", "ring-emerald-400", "border-emerald-400"), 4000);
        }
        if (uspEl && data.suggestedUsp) {
          uspEl.value = data.suggestedUsp;
          uspEl.classList.add("ring-2", "ring-emerald-400/50", "border-emerald-400");
          setTimeout(() => uspEl.classList.remove("ring-2", "ring-emerald-400/50", "border-emerald-400"), 4000);
        }
        showToastNotification("success", "Produk Terdeteksi!", `Nama & USP terisi: "${data.suggestedTitle || 'Produk'}"`);
      }

      if (targetType === "model" || (!targetType && uploadedImages.model)) {
        const modelEl = document.getElementById("sb-model-desc");
        if (modelEl && data.suggestedModel) {
          modelEl.value = data.suggestedModel;
          modelEl.classList.add("ring-2", "ring-cyan-400/50", "border-cyan-400");
          setTimeout(() => modelEl.classList.remove("ring-2", "ring-cyan-400/50", "border-cyan-400"), 4000);
        }
        showToastNotification("success", "Model Terdeteksi!", "Prompt karakter model berhasil diisi.");
      }

      if (targetType === "location" || (!targetType && uploadedImages.location)) {
        const locationEl = document.getElementById("sb-location-setting");
        if (locationEl && data.suggestedLocation) {
          locationEl.value = data.suggestedLocation;
          locationEl.classList.add("ring-2", "ring-amber-400/50", "border-amber-400");
          setTimeout(() => locationEl.classList.remove("ring-2", "ring-amber-400/50", "border-amber-400"), 4000);
        }
        showToastNotification("success", "Lokasi Terdeteksi!", "Prompt latar lokasi berhasil diisi.");
      }

      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> ${targetLabel} Siap`;
        setTimeout(() => badge.classList.add("hidden"), 3000);
      }
      triggerAutoSave();
    }
  } catch (err) {
    console.error("Target vision analysis error:", err);
    if (badge) badge.classList.add("hidden");
  }
}

function renderStoryboardSkeletonLoading(count = 4) {
  const container = document.getElementById("scenes-container");
  if (!container) return;

  const num = parseInt(count) || 4;
  container.innerHTML = Array.from({ length: num }).map((_, idx) => `
    <div class="rounded-3xl bg-[#0f121d] border border-slate-800/90 p-3.5 sm:p-4 space-y-3 shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div class="flex items-center gap-2">
          <div class="h-5 w-16 skeleton-shimmer-orange rounded-lg"></div>
          <div class="h-5 w-28 skeleton-shimmer rounded-lg"></div>
        </div>
        <div class="h-5 w-12 skeleton-shimmer rounded-lg"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <!-- Visual Skeleton Frame -->
        <div class="sm:col-span-4 aspect-[9/16] rounded-xl skeleton-shimmer relative overflow-hidden flex items-center justify-center border border-slate-800">
          <div class="text-center space-y-2 p-2">
            <div class="w-10 h-10 rounded-full skeleton-shimmer-orange mx-auto"></div>
            <div class="h-3.5 w-20 skeleton-shimmer rounded mx-auto"></div>
          </div>
        </div>

        <!-- Inputs / Prompts Skeleton -->
        <div class="sm:col-span-8 space-y-2.5">
          <div class="space-y-1.5">
            <div class="h-3 w-32 skeleton-shimmer rounded"></div>
            <div class="h-16 w-full skeleton-shimmer rounded-xl"></div>
          </div>

          <div class="space-y-1.5">
            <div class="h-3 w-36 skeleton-shimmer rounded"></div>
            <div class="h-12 w-full skeleton-shimmer rounded-xl"></div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="h-8 skeleton-shimmer rounded-xl"></div>
            <div class="h-8 skeleton-shimmer-orange rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function triggerAutoSave() {
  const statusBadge = document.getElementById("autosave-status-badge");
  if (statusBadge) {
    statusBadge.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin text-amber-400\"></i> Menyimpan...";
    statusBadge.classList.remove("hidden");
  }

  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveCurrentStoryboardSilently();
  }, 800);
}

async function saveCurrentStoryboardSilently() {
  const titleInput = document.getElementById("sb-product-title");
  if (!titleInput || !titleInput.value.trim() || !currentStoryboard.scenes || currentStoryboard.scenes.length === 0) {
    const statusBadge = document.getElementById("autosave-status-badge");
    if (statusBadge) statusBadge.classList.add("hidden");
    return;
  }

  currentStoryboard.title = "Affiliate: " + titleInput.value.trim();
  currentStoryboard.modelDescription = document.getElementById("sb-model-desc")?.value || currentStoryboard.modelDescription;
  currentStoryboard.locationSetting = document.getElementById("sb-location-setting")?.value || currentStoryboard.locationSetting;
  currentStoryboard.totalDuration = document.getElementById("sb-duration-select")?.value || currentStoryboard.totalDuration;

  try {
    const res = await fetch("/api/storyboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentStoryboard)
    });
    const saved = await res.json();
    if (saved && saved.id) currentStoryboard.id = saved.id;

    const statusBadge = document.getElementById("autosave-status-badge");
    if (statusBadge) {
      statusBadge.innerHTML = "<i class=\"fa-solid fa-check text-emerald-400\"></i> Otomatis Tersimpan";
      setTimeout(() => {
        statusBadge.classList.add("hidden");
      }, 2500);
    }
    loadStoryboards();
    loadDashboardData();
  } catch (err) {
    console.error("AutoSave Error:", err);
    const statusBadge = document.getElementById("autosave-status-badge");
    if (statusBadge) statusBadge.classList.add("hidden");
  }
}

async function generateStoryboardWithAI() {
  const title = document.getElementById("sb-product-title").value.trim();
  const usp = document.getElementById("sb-product-usp").value.trim();
  const modelDescription = document.getElementById("sb-model-desc").value.trim();
  const locationSetting = document.getElementById("sb-location-setting").value.trim();
  const numScenes = document.getElementById("sb-scene-count").value;
  const promptsPerScene = document.getElementById("sb-prompt-count").value;
  const duration = document.getElementById("sb-duration-select").value;
  const platform = document.getElementById("sb-platform").value;

  if (!title) {
    const productInput = document.getElementById("input-product-name") || document.getElementById("sb-product-title");
    if (productInput) {
      productInput.focus();
      productInput.classList.add("ring-2", "ring-orange-500", "border-orange-500");
      setTimeout(() => productInput.classList.remove("ring-2", "ring-orange-500", "border-orange-500"), 3000);
    }
    showToastNotification("warning", "Nama Produk Diperlukan", "Harap isi nama produk terlebih dahulu sebelum membuat storyboard!");
    return;
  }

  const btn = document.getElementById("btn-generate-sb");
  const icon = document.getElementById("btn-gen-icon");
  const text = document.getElementById("btn-gen-text");

  btn.disabled = true;
  btn.classList.add("laser-btn-active");
  icon.className = "fa-solid fa-circle-notch fa-spin text-[12px] text-amber-200";
  text.innerText = "AI Merancang Storyboard...";

  // Render Skeleton Shimmer scene cards for instant feedback
  renderStoryboardSkeletonLoading(numScenes);

  try {
    // Generate Storyboard with Antigravity / Gemini 2.5 Pro (Runs until completed)
    const res = await fetch("/api/generate-storyboard-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productTitle: title, 
        usp, 
        modelDescription, 
        locationSetting, 
        numScenes, 
        promptsPerScene, 
        duration, 
        platform 
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Respon server tidak normal (Status: ${res.status})`);
    }

    const data = await res.json();
    if (!data || !data.scenes || !Array.isArray(data.scenes) || data.scenes.length === 0) {
      throw new Error("Data skenario yang diterima dari AI tidak lengkap atau kosong.");
    }

    currentStoryboard = {
      id: "sb-" + Date.now(),
      title: data.title || ("Affiliate: " + title),
      platform: data.platform || platform,
      totalDuration: data.totalDuration || duration,
      modelDescription: data.modelDescription || modelDescription,
      locationSetting: data.locationSetting || locationSetting,
      hook: data.hook,
      cta: data.cta,
      scenes: data.scenes || []
    };

    renderStoryboardPreview();
    triggerAutoSave();
    showToastNotification("success", "Antigravity AI Berhasil!", "Skrip 4 scene, hook, prompt visual & 16 foto siap.");
  } catch (err) {
    console.error("Generate Storyboard Anomaly/Error:", err);

    // Auto-Close & Reset Container on real anomaly
    const container = document.getElementById("scenes-container");
    if (container && (!currentStoryboard.scenes || currentStoryboard.scenes.length === 0)) {
      container.innerHTML = `<div class="text-slate-500 text-xs py-10 text-center font-medium">Terjadi kendala saat merancang. Silakan klik tombol Generate kembali.</div>`;
    }

    showToastNotification("error", "Terjadi Kejanggalan", err.message || "Gagal memproses storyboard. Silakan coba kembali.");
  } finally {
    btn.disabled = false;
    btn.classList.remove("laser-btn-active");
    icon.className = "fa-solid fa-wand-magic-sparkles text-[11px]";
    text.innerText = "Generate";
  }
}

function selectScenePhoto(sceneIdx, photoIdx) {
  const scene = currentStoryboard.scenes[sceneIdx];
  if (!scene) return;
  if (scene.promptsList && scene.promptsList[photoIdx]) {
    scene.prompt = scene.promptsList[photoIdx];
  }
  if (scene.imagesList && scene.imagesList[photoIdx]) {
    scene.imageUrl = scene.imagesList[photoIdx];
  }
  renderStoryboardPreview();
}

function renderStoryboardPreview() {
  const container = document.getElementById("scenes-container");
  if (!container) return;

  if (!currentStoryboard.scenes || currentStoryboard.scenes.length === 0) {
    container.innerHTML = `<div class="text-slate-500 text-xs py-10 text-center font-medium">Klik tombol Generate di samping untuk merancang skenario.</div>`;
    return;
  }

  container.innerHTML = currentStoryboard.scenes.map((scene, idx) => {
    const safeImageUrl = scene.imageUrl || (scene.imagesList && scene.imagesList[0]) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400";
    const encodedPrompt = encodeURIComponent(scene.prompt || "");
    const panels = scene.panels || [
      { num: 1, title: 'Keadaan Awal', desc: 'Karakter memulai aktivitas di lokasi.' },
      { num: 2, title: 'Aksi Berjalan', desc: 'Karakter bergerak mencari solusi.' },
      { num: 3, title: 'Mempromosikan', desc: 'Karakter memperlihatkan produk ke kamera.' },
      { num: 4, title: 'Aksi Lanjutan', desc: 'Transisi bersiap menuju scene berikutnya.' }
    ];

    const isConnected = idx > 0;

    return `
      <div class="rounded-3xl bg-[#0f121d] border ${isConnected ? 'border-cyan-900/60 hover:border-cyan-500/50' : 'border-amber-900/60 hover:border-amber-500/50'} p-3.5 sm:p-5 space-y-4 shadow-2xl transition relative overflow-hidden">
        <!-- Connecting Line Ribbon for Continuous Story -->
        ${isConnected ? `
          <div class="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
            <i class="fa-solid fa-link text-cyan-400"></i> BERSAMBUNG DARI SCENE ${idx}
          </div>
        ` : ''}

        <div class="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] font-display shadow-sm flex-shrink-0">
              SCENE ${idx + 1}
            </span>
            <input type="text" value="${scene.shotType || `Scene ${idx + 1}`}" oninput="updateSceneShotType(${idx}, this.value)" class="w-full max-w-[280px] bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 font-mono truncate" placeholder="Shot Type">
            <span class="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800 flex-shrink-0">${scene.durationSeconds || 10}s</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button onclick="copyEntireScene(${idx})" class="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white text-xs font-bold border border-slate-700/80 transition flex items-center gap-1 shadow-sm" title="Salin Seluruh Konten Scene ${idx + 1}">
              <i class="fa-solid fa-copy text-[10px]"></i>
              <span class="text-[11px] hidden sm:inline">Salin</span>
            </button>
            <button onclick="removeScene(${idx})" class="w-7 h-7 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition flex items-center justify-center border border-slate-800" title="Hapus Scene">
              <i class="fa-solid fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <!-- Left: 1 Single Image Split into 4 Panels (9:16 Vertical Strip) -->
          <div class="md:col-span-5 w-full space-y-2">
            <div class="relative w-full rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-80 border-2 border-slate-700/90 shadow-2xl flex items-center justify-center mx-auto group">
              <img id="scene-img-${idx}" src="${safeImageUrl}" class="w-full h-full object-cover" alt="Scene Visual Strip" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';">
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/85 text-[9px] font-mono text-cyan-300 border border-cyan-500/40 shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                <i class="fa-solid fa-table-cells-large text-cyan-400 text-[8px]"></i> 1 GAMBAR 4 PANEL AKSI
              </div>
              <div class="absolute inset-x-2 bottom-2 p-1.5 rounded-xl bg-black/90 border border-white/15 shadow-2xl flex items-center gap-1.5 z-10 backdrop-blur-md">
                <select id="select-ratio-${idx}" class="flex-1 bg-slate-900 border border-slate-700 text-amber-300 rounded-lg px-2 py-1 text-[9px] font-mono focus:outline-none focus:border-orange-500">
                  <option value="9:16" selected>9:16 (Vertikal)</option>
                  <option value="1:1">1:1 (Persegi)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="4:5">4:5 (Portrait)</option>
                </select>
                <button onclick="downloadSceneWithCustomSize('${safeImageUrl}', document.getElementById('select-ratio-${idx}').value, ${idx + 1})" class="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 active:scale-95 text-white font-bold text-[10px] shadow flex items-center gap-1 transition flex-shrink-0" title="Unduh Lembar Storyboard">
                  <i class="fa-solid fa-download text-[9px]"></i>
                  <span>Unduh</span>
                </button>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[10px] text-slate-400 text-center font-mono">
              <i class="fa-solid fa-circle-info text-amber-400"></i> Lembar gambar di atas terbagi menjadi 4 panel aksi berurutan.
            </div>
          </div>

          <!-- Right: 4 Sequential Sub-Panels + Voiceover + Video Prompt -->
          <div class="md:col-span-7 space-y-3">
            <!-- 4 Continuous Action Sub-Panels List -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold text-amber-300 font-mono flex items-center gap-1.5 uppercase">
                <i class="fa-solid fa-layer-group text-orange-400"></i> 4 Bagian Aksi dalam 1 Gambar:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${panels.map(p => `
                  <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-0.5">
                    <div class="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 font-mono">
                      <span class="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[9px] text-cyan-400 font-bold">${p.num}</span>
                      <span>${p.title}</span>
                    </div>
                    <p class="text-[10px] text-slate-300 leading-snug">${p.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Visual Strip Prompt -->
            <div class="p-2.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-amber-300 font-display flex items-center gap-1.5">
                  <i class="fa-solid fa-sparkles text-orange-400"></i> Prompt 1 Gambar 4-Panel AI
                </span>
                <button onclick="copyPromptText('${encodedPrompt}')" class="text-[9px] text-slate-400 hover:text-amber-300 transition flex items-center gap-1 font-mono">
                  <i class="fa-solid fa-copy text-[8px]"></i> Salin Prompt
                </button>
              </div>
              <textarea id="scene-prompt-input-${idx}" rows="2" oninput="updateScenePrompt(${idx}, this.value)" class="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400 rounded-xl p-2 text-[10px] text-amber-200 font-mono focus:outline-none leading-relaxed transition" placeholder="Instruksi prompt gambar 4 panel...">${scene.prompt || ""}</textarea>
            </div>

            <!-- Video Prompt -->
            <div class="space-y-0.5">
              <span class="text-[9px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                <i class="fa-solid fa-video text-cyan-400"></i> Prompt Video Generator (Kling / Flow / Veo)
              </span>
              <input type="text" value="${scene.videoPrompt || scene.visualDescription || ''}" oninput="updateSceneVisualDesc(${idx}, this.value)" class="w-full bg-slate-950/80 border border-slate-800/80 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none transition font-mono" placeholder="Prompt video AI generator...">
            </div>

            <!-- Voiceover Script -->
            <div class="space-y-0.5">
              <span class="text-[9px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                <i class="fa-solid fa-microphone text-orange-400"></i> Naskah Voiceover (10 Detik)
              </span>
              <textarea rows="2" oninput="updateSceneVoiceover(${idx}, this.value)" class="w-full bg-slate-950/80 border border-slate-800/80 focus:border-amber-500 rounded-xl p-2 text-[11px] text-white placeholder-slate-500 focus:outline-none leading-relaxed transition" placeholder="Tuliskan naskah audio yang diucapkan...">${scene.voiceover || ''}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function copyEntireScene(idx) {
  const scene = currentStoryboard.scenes[idx];
  if (!scene) return;

  const textToCopy = "[SCENE " + (idx + 1) + " - " + (scene.shotType || "Shot") + "] (" + (scene.durationSeconds || 3) + "s)\n" +
    "🎙️ VOICEOVER / AUDIO:\n\"" + (scene.voiceover || "") + "\"\n\n" +
    "🎬 PROMPT VIDEO (DESKRIPSI AKSI):\n" + (scene.visualDescription || "") + "\n\n" +
    "🖼️ PROMPT FOTO AI:\n" + (scene.prompt || "");

  navigator.clipboard.writeText(textToCopy).then(() => {
    showToastNotification("success", "Scene Tersalin!", "Semua konten Scene " + (idx + 1) + " berhasil disalin ke clipboard.");
  }).catch(err => {
    console.error("Copy scene failed", err);
    showToastNotification("error", "Gagal Menyalin", "Tidak dapat menyalin konten scene.");
  });
}

function switchScenePrompt(sceneIdx, promptIdx) {
  const scene = currentStoryboard.scenes[sceneIdx];
  if (scene && scene.promptsList && scene.promptsList[promptIdx]) {
    scene.prompt = scene.promptsList[promptIdx];
    renderStoryboardPreview();
    triggerAutoSave();
  }
}

function updateSceneShotType(idx, val) { if (currentStoryboard.scenes[idx]) { currentStoryboard.scenes[idx].shotType = val; triggerAutoSave(); } }
function updateSceneVoiceover(idx, val) { if (currentStoryboard.scenes[idx]) { currentStoryboard.scenes[idx].voiceover = val; triggerAutoSave(); } }
function updateSceneVisualDesc(idx, val) { if (currentStoryboard.scenes[idx]) { currentStoryboard.scenes[idx].visualDescription = val; triggerAutoSave(); } }
function updateScenePrompt(idx, val) { if (currentStoryboard.scenes[idx]) { currentStoryboard.scenes[idx].prompt = val; triggerAutoSave(); } }

function addNewBlankScene() {
  const nextNum = (currentStoryboard.scenes.length || 0) + 1;
  const prompt = "Hyperrealistic aesthetic commercial photography of product with model, 8k resolution";
  currentStoryboard.scenes.push({
    sceneNumber: nextNum,
    shotType: "Close-Up Shot",
    durationSeconds: 3,
    visualDescription: "Deskripsi adegan produk...",
    voiceover: "Tuliskan kata-kata yang diucapkan di adegan ini...",
    prompt: prompt,
    promptsList: [prompt],
    imageUrl: "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=768&height=1344&seed=" + Math.floor(Math.random() * 99999) + "&model=flux&nologo=true"
  });
  renderStoryboardPreview();
  triggerAutoSave();
}

function removeScene(idx) {
  currentStoryboard.scenes.splice(idx, 1);
  renderStoryboardPreview();
  triggerAutoSave();
}

async function regenerateSceneImage(idx) {
  const scene = currentStoryboard.scenes[idx];
  if (!scene) return;

  const promptInput = document.getElementById("scene-prompt-input-" + idx);
  if (promptInput && promptInput.value.trim()) {
    scene.prompt = promptInput.value.trim();
  }

  const imgEl = document.getElementById("scene-img-" + idx);
  const btnEl = document.getElementById("btn-gen-scene-" + idx);

  if (imgEl) imgEl.classList.add("opacity-30", "animate-pulse");
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin text-[10px]\"></i><span>Mengubah...</span>";
  }

  const newUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(scene.prompt) + "?width=768&height=1344&seed=" + Math.floor(Math.random() * 9999999) + "&model=flux&nologo=true";
  
  const preload = new Image();
  preload.src = newUrl;
  preload.onload = () => {
    scene.imageUrl = newUrl;
    if (imgEl) {
      imgEl.src = newUrl;
      imgEl.classList.remove("opacity-30", "animate-pulse");
    }
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = "<i class=\"fa-solid fa-wand-magic-sparkles text-xs\"></i><span>Ubah</span>";
    }
    triggerAutoSave();
  };
}

async function renderAllSceneImages() {
  currentStoryboard.scenes.forEach((_, idx) => regenerateSceneImage(idx));
}

function toggleCtaStatus(checked) {
  isCtaActive = checked;
  const label = document.getElementById("cta-status-label");
  if (label) {
    label.innerText = checked ? "(ON)" : "(OFF)";
    label.className = checked ? "text-emerald-400 font-extrabold text-[10px]" : "text-slate-500 font-extrabold text-[10px]";
  }
}

async function downloadSceneWithCustomSize(imageUrl, ratio, sceneNum) {
  if (!imageUrl) return;
  
  let targetWidth = 1080;
  let targetHeight = 1920;
  
  if (ratio === "1:1") { targetWidth = 1080; targetHeight = 1080; }
  else if (ratio === "16:9") { targetWidth = 1920; targetHeight = 1080; }
  else if (ratio === "4:5") { targetWidth = 1080; targetHeight = 1350; }
  else if (ratio === "9:16") { targetWidth = 1080; targetHeight = 1920; }

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const r = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * r) / 2;
      const centerShift_y = (canvas.height - img.height * r) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * r, img.height * r);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scene-" + sceneNum + "_" + targetWidth + "x" + targetHeight + ".jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/jpeg", 0.95);
    };
  } catch (err) {
    downloadImageDirectly(imageUrl, "scene-" + sceneNum + ".jpg");
  }
}

async function downloadImageDirectly(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "scene-image.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    window.open(imageUrl, "_blank");
  }
}

async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard/stats");
    const data = await res.json();

    document.getElementById("stat-products").innerText = data.totalProducts || 0;
    document.getElementById("stat-storyboards").innerText = data.totalStoryboards || 0;
    document.getElementById("stat-scenes").innerText = data.totalScenes || 0;
    document.getElementById("stat-prompts").innerText = data.totalPrompts || 0;

    const recentContainer = document.getElementById("dashboard-recent-storyboards");
    if (!data.recentStoryboards || data.recentStoryboards.length === 0) {
      recentContainer.innerHTML = "<div class=\"text-slate-500 text-xs py-6 text-center\">Belum ada storyboard.</div>";
    } else {
      recentContainer.innerHTML = data.recentStoryboards.map(sb => {
        const coverImg = (sb.scenes && sb.scenes[0] && sb.scenes[0].imageUrl) ? sb.scenes[0].imageUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400";
        return "<div class=\"p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-orange-500/50 transition\">" +
          "<div class=\"flex items-center gap-3.5 min-w-0\">" +
            "<div class=\"w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0 relative\">" +
              "<img src=\"" + coverImg + "\" class=\"w-full h-full object-cover\" alt=\"Thumb\" onerror=\"this.src=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400\">" +
            "</div>" +
            "<div class=\"min-w-0 truncate\">" +
              "<h4 class=\"font-bold text-white text-xs font-display truncate\">" + sb.title + "</h4>" +
              "<div class=\"flex items-center gap-2 mt-0.5\">" +
                "<span class=\"text-[10px] font-bold text-amber-400\">" + (sb.scenes ? sb.scenes.length : 0) + " Scenes</span>" +
                "<span class=\"text-slate-600\">&bull;</span>" +
                "<span class=\"text-[10px] text-slate-400\">" + (sb.totalDuration || 15) + "s</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          "<button onclick=\"loadAndEditStoryboard( + sb.id + )\" class=\"px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/40 text-amber-300 border border-orange-500/30 font-bold text-xs transition flex-shrink-0\">" +
            "Buka" +
          "</button>" +
        "</div>";
      }).join("");
    }
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }
}

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    productsCache = await res.json();

    const tbody = document.getElementById("products-table-body");
    if (!tbody) return;
    if (productsCache.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"6\" class=\"text-center py-8 text-slate-500\">Belum ada produk.</td></tr>";
    } else {
      tbody.innerHTML = productsCache.map(p => 
        "<tr class=\"hover:bg-slate-900/60 transition\">" +
          "<td class=\"px-4 py-3 font-bold text-white\">" + p.title + "</td>" +
          "<td class=\"px-4 py-3\"><span class=\"px-2 py-0.5 rounded-full bg-orange-500/10 text-[10px] font-bold text-amber-300 border border-orange-500/20\">" + p.category + "</span></td>" +
          "<td class=\"px-4 py-3 text-slate-200 font-mono\">Rp " + Number(p.price).toLocaleString("id-ID") + "</td>" +
          "<td class=\"px-4 py-3 text-emerald-400 font-extrabold font-mono\">" + p.commissionRate + "%</td>" +
          "<td class=\"px-4 py-3 max-w-xs truncate text-slate-400 text-[11px]\" title=\"" + p.usp + "\">" + (p.usp || "-") + "</td>" +
          "<td class=\"px-4 py-3 text-right space-x-1.5 flex-shrink-0\">" +
            "<button onclick=\"useProductInStoryboard( + p.id + )\" class=\"px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 text-amber-300 text-xs font-bold\" title=\"Buat Storyboard\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i></button>" +
            "<button onclick=\"deleteProduct( + p.id + )\" class=\"px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-bold\" title=\"Hapus\"><i class=\"fa-solid fa-trash\"></i></button>" +
          "</td>" +
        "</tr>"
      ).join("");
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function useProductInStoryboard(productId) {
  selectMenu("storyboard-creator");
  const prod = productsCache.find(p => p.id === productId);
  if (prod) {
    document.getElementById("sb-product-title").value = prod.title;
    document.getElementById("sb-product-usp").value = prod.usp;
    triggerAutoSave();
  }
}

async function loadStoryboards() {
  try {
    const res = await fetch("/api/storyboards");
    storyboardsCache = await res.json();

    const grid = document.getElementById("saved-storyboards-grid");
    if (!grid) return;
    if (storyboardsCache.length === 0) {
      grid.innerHTML = "<div class=\"col-span-3 text-center py-12 text-slate-500\">Belum ada storyboard tersimpan.</div>";
    } else {
      grid.innerHTML = storyboardsCache.map(sb => {
        const coverImg = (sb.scenes && sb.scenes[0] && sb.scenes[0].imageUrl) ? sb.scenes[0].imageUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600";
        return "<div class=\"ultra-glass-card rounded-3xl overflow-hidden flex flex-col justify-between group\">" +
          "<div>" +
            "<div class=\"relative h-48 overflow-hidden bg-slate-950\">" +
              "<img src=\"" + coverImg + "\" class=\"w-full h-full object-cover group-hover:scale-105 transition duration-500\" alt=\"Cover\" onerror=\"this.src=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600\">" +
              "<div class=\"absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent\"></div>" +
              "<span class=\"absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase text-amber-300 border border-white/10 font-mono\">" + (sb.totalDuration || 15) + "s</span>" +
              "<span class=\"absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-orange-600/90 backdrop-blur-sm text-white text-[11px] font-bold font-display\">" + (sb.scenes ? sb.scenes.length : 0) + " Scenes</span>" +
            "</div>" +
            "<div class=\"p-4 space-y-2\">" +
              "<h3 class=\"font-black text-white text-sm font-display line-clamp-1\">" + sb.title + "</h3>" +
              "<p class=\"text-slate-400 text-xs line-clamp-2 italic leading-relaxed\">\"" + (sb.hook || "-") + "\"</p>" +
            "</div>" +
          "</div>" +
          "<div class=\"p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/80 mt-2\">" +
            "<button onclick=\"loadAndEditStoryboard( + sb.id + )\" class=\"flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white text-xs font-bold font-display transition flex items-center justify-center gap-1.5\">" +
              "<i class=\"fa-solid fa-pen-to-square\"></i> Buka" +
            "</button>" +
            "<button onclick=\"deleteStoryboard( + sb.id + )\" class=\"p-2 rounded-xl bg-slate-900 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 text-xs transition border border-slate-800\">" +
              "<i class=\"fa-solid fa-trash\"></i>" +
            "</button>" +
          "</div>" +
        "</div>";
      }).join("");
    }
  } catch (err) {
    console.error("Error loading storyboards:", err);
  }
}

function loadAndEditStoryboard(id) {
  const sb = storyboardsCache.find(s => s.id === id);
  if (sb) {
    currentStoryboard = JSON.parse(JSON.stringify(sb));
    selectMenu("storyboard-creator");
    if (sb.title) document.getElementById("sb-product-title").value = sb.title.replace("Affiliate Campaign: ", "").replace("Affiliate: ", "");
    if (sb.modelDescription) document.getElementById("sb-model-desc").value = sb.modelDescription;
    if (sb.locationSetting) document.getElementById("sb-location-setting").value = sb.locationSetting;
    if (sb.totalDuration) document.getElementById("sb-duration-select").value = sb.totalDuration;
    renderStoryboardPreview();
  }
}

async function deleteStoryboard(id) {
  if (!confirm("Yakin ingin menghapus storyboard ini?")) return;
  try {
    await fetch("/api/storyboards/" + id, { method: "DELETE" });
    loadStoryboards();
    loadDashboardData();
  } catch (err) {
    console.error("Delete Storyboard Error:", err);
  }
}

function openProductModal() {
  document.getElementById("product-modal").classList.remove("hidden");
  document.getElementById("product-modal").classList.add("flex");
}
function closeProductModal() {
  document.getElementById("product-modal").classList.add("hidden");
  document.getElementById("product-modal").classList.remove("flex");
}
async function saveProductFromModal() {
  const title = document.getElementById("modal-p-title").value.trim();
  const category = document.getElementById("modal-p-cat").value.trim();
  const price = document.getElementById("modal-p-price").value;
  const commissionRate = document.getElementById("modal-p-commission").value;
  const targetMarket = document.getElementById("modal-p-target").value.trim();
  const usp = document.getElementById("modal-p-usp").value.trim();
  const affiliateLink = document.getElementById("modal-p-link").value.trim();

  if (!title) { 
    showToastNotification("error", "Simpan Gagal", "Nama produk wajib diisi!"); 
    return; 
  }
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, price, commissionRate, targetMarket, usp, affiliateLink })
    });
    if (res.ok) {
      showToastNotification("success", "Simpan Sukses", "Produk berhasil ditambahkan ke database.");
      closeProductModal();
      loadProducts();
      loadDashboardData();
    } else {
      showToastNotification("error", "Simpan Gagal", "Gagal menyimpan produk ke database.");
    }
  } catch (err) { 
    console.error("Save Product Error:", err); 
    showToastNotification("error", "Simpan Gagal", "Terjadi kesalahan koneksi.");
  }
}
async function deleteProduct(id) {
  try {
    await fetch("/api/products/" + id, { method: "DELETE" });
    showToastNotification("success", "Terhapus", "Produk berhasil dihapus.");
    loadProducts();
    loadDashboardData();
  } catch (err) { 
    console.error("Delete Product Error:", err); 
    showToastNotification("error", "Hapus Gagal", "Gagal menghapus produk.");
  }
}

async function loadPrompts() {
  try {
    const res = await fetch("/api/prompts");
    promptsCache = await res.json();
    const grid = document.getElementById("prompt-library-grid");
    if (!grid) return;
    grid.innerHTML = promptsCache.map(p => 
      "<div class=\"ultra-glass-card rounded-3xl p-4 sm:p-5 space-y-3 flex flex-col justify-between\">" +
        "<div class=\"space-y-2\">" +
          "<div class=\"flex items-center justify-between\">" +
            "<span class=\"px-2.5 py-0.5 rounded-full bg-orange-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-orange-500/20 font-mono\">" + p.category + "</span>" +
            "<span class=\"text-[10px] font-mono text-slate-500\">" + p.aspectRatio + "</span>" +
          "</div>" +
          "<h3 class=\"font-bold text-white text-sm font-display\">" + p.title + "</h3>" +
          "<div class=\"p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-mono break-words leading-relaxed\">" +
            p.prompt +
          "</div>" +
        "</div>" +
        "<div class=\"pt-2.5 border-t border-slate-800/80 flex items-center justify-between\">" +
          "<button onclick=\"copyPromptText( + encodeURIComponent(p.prompt) + )\" class=\"px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5\">" +
            "<i class=\"fa-solid fa-copy\"></i> Salin" +
          "</button>" +
          "<button onclick=\"useInStandalone( + encodeURIComponent(p.prompt) + )\" class=\"px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5\">" +
            "<i class=\"fa-solid fa-camera\"></i> Render" +
          "</button>" +
        "</div>" +
      "</div>"
    ).join("");
  } catch (err) { console.error("Error loading prompts:", err); }
}

function openNewPromptModal() {
  document.getElementById("prompt-modal").classList.remove("hidden");
  document.getElementById("prompt-modal").classList.add("flex");
}
function closePromptModal() {
  document.getElementById("prompt-modal").classList.add("hidden");
  document.getElementById("prompt-modal").classList.remove("flex");
}
async function savePromptFromModal() {
  const title = document.getElementById("modal-prompt-title").value.trim();
  const category = document.getElementById("modal-prompt-cat").value.trim();
  const aspectRatio = document.getElementById("modal-prompt-ratio").value;
  const prompt = document.getElementById("modal-prompt-text").value.trim();

  if (!title || !prompt) { 
    showToastNotification("error", "Simpan Gagal", "Judul dan prompt wajib diisi!"); 
    return; 
  }
  try {
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, aspectRatio, prompt })
    });
    if (res.ok) {
      showToastNotification("success", "Simpan Sukses", "Prompt berhasil ditambahkan ke library.");
      closePromptModal();
      loadPrompts();
      loadDashboardData();
    } else {
      showToastNotification("error", "Simpan Gagal", "Gagal menyimpan prompt.");
    }
  } catch (err) { 
    console.error("Save Prompt Error:", err); 
    showToastNotification("error", "Simpan Gagal", "Terjadi kesalahan koneksi.");
  }
}

async function generateStandalonePhoto() {
  const prompt = document.getElementById("standalone-prompt").value.trim();
  const ratio = document.getElementById("standalone-ratio").value;
  const model = document.getElementById("standalone-model").value;

  if (!prompt) { 
    showToastNotification("error", "Gagal Render", "Harap masukkan prompt terlebih dahulu!"); 
    return; 
  }

  let width = 768; let height = 1344;
  if (ratio === "1:1") { width = 1024; height = 1024; }
  else if (ratio === "16:9") { width = 1344; height = 768; }

  const btn = document.getElementById("btn-standalone-gen");
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "<i class=\"fa-solid fa-spinner fa-spin text-amber-200\"></i> Me-render...";

  const container = document.getElementById("standalone-result-container");
  container.innerHTML = "<div class=\"flex flex-col items-center justify-center p-8 space-y-3\">" +
    "<div class=\"w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin\"></div>" +
    "<p class=\"text-xs font-bold text-white font-display\">Me-render foto AI...</p>" +
  "</div>";

  try {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, width, height, model })
    });
    const data = await res.json();

    standaloneRendersCache.unshift({
      imageUrl: data.imageUrl,
      prompt: prompt,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    });
    localStorage.setItem("affiliate_ai_renders_history", JSON.stringify(standaloneRendersCache.slice(0, 30)));

    container.innerHTML = "<div class=\"w-full h-full flex flex-col items-center space-y-3\">" +
      "<div class=\"relative max-h-[480px] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl\">" +
        "<img src=\"" + data.imageUrl + "\" class=\"w-full h-full object-contain max-h-[460px] rounded-2xl\" alt=\"Rendered AI\">" +
      "</div>" +
      "<div class=\"flex items-center gap-2.5\">" +
        "<button onclick=\"downloadImageDirectly( + data.imageUrl + , affiliate-photo.jpg)\" class=\"px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 font-display\">" +
          "<i class=\"fa-solid fa-download\"></i> Unduh" +
        "</button>" +
        "<button onclick=\"copyPromptText( + encodeURIComponent(data.prompt) + )\" class=\"px-3.5 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700 font-mono\">" +
          "<i class=\"fa-solid fa-copy\"></i> Salin" +
        "</button>" +
      "</div>" +
    "</div>";
  } catch (err) {
    console.error("Standalone gen error:", err);
    container.innerHTML = "<p class=\"text-rose-400 text-xs\">Gagal me-render gambar.</p>";
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function useInStandalone(encodedPrompt) {
  selectMenu("ai-photo-generator");
  document.getElementById("standalone-prompt").value = decodeURIComponent(encodedPrompt);
}

function openHistoryModal(type) {
  currentActiveHistoryType = type;
  const modal = document.getElementById("history-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  renderHistoryItems(type);
}
function closeHistoryModal() {
  const modal = document.getElementById("history-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}
function renderHistoryItems(type) {
  const titleEl = document.getElementById("history-modal-title");
  const listEl = document.getElementById("history-modal-list");
  const countLabel = document.getElementById("history-count-label");

  if (type === "storyboards") {
    titleEl.innerText = "Riwayat Storyboard AI";
    countLabel.innerText = storyboardsCache.length + " Storyboard tersimpan";
    if (storyboardsCache.length === 0) {
      listEl.innerHTML = "<div class=\"text-center py-10 text-slate-500 text-xs\">Belum ada riwayat storyboard.</div>";
      return;
    }
    listEl.innerHTML = storyboardsCache.map(sb => {
      const coverImg = (sb.scenes && sb.scenes[0] && sb.scenes[0].imageUrl) ? sb.scenes[0].imageUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200";
      return "<div class=\"p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-orange-500/40 transition\">" +
        "<div class=\"flex items-center gap-2.5 min-w-0 cursor-pointer\" onclick=\"viewHistoryItem(storyboard,  + sb.id + )\">" +
          "<img src=\"" + coverImg + "\" class=\"w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0\" onerror=\"this.src=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200\">" +
          "<div class=\"min-w-0 truncate\">" +
            "<h4 class=\"font-bold text-white text-xs truncate hover:text-amber-300 transition\">" + sb.title + "</h4>" +
            "<p class=\"text-[10px] text-slate-400 font-mono\">" + (sb.scenes ? sb.scenes.length : 0) + " Scenes &bull; " + (sb.totalDuration || 15) + "s</p>" +
          "</div>" +
        "</div>" +
        "<div class=\"flex items-center gap-1.5 flex-shrink-0\">" +
          "<button onclick=\"viewHistoryItem(storyboard,  + sb.id + )\" class=\"px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-amber-300 hover:text-white text-xs font-bold transition\">Lihat</button>" +
          "<button onclick=\"deleteHistoryItem(storyboard,  + sb.id + )\" class=\"p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition\"><i class=\"fa-solid fa-trash\"></i></button>" +
        "</div>" +
      "</div>";
    }).join("");
  } else if (type === "products") {
    titleEl.innerText = "Riwayat Database Produk";
    countLabel.innerText = productsCache.length + " Produk tersimpan";
    if (productsCache.length === 0) {
      listEl.innerHTML = "<div class=\"text-center py-10 text-slate-500 text-xs\">Belum ada riwayat produk.</div>";
      return;
    }
    listEl.innerHTML = productsCache.map(p => 
      "<div class=\"p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition\">" +
        "<div class=\"min-w-0 truncate cursor-pointer\" onclick=\"viewHistoryItem(product,  + p.id + )\">" +
          "<h4 class=\"font-bold text-white text-xs truncate hover:text-emerald-300 transition\">" + p.title + "</h4>" +
          "<p class=\"text-[10px] text-slate-400 font-mono\">Rp " + Number(p.price).toLocaleString("id-ID") + " &bull; Komisi " + p.commissionRate + "%</p>" +
        "</div>" +
        "<div class=\"flex items-center gap-1.5 flex-shrink-0\">" +
          "<button onclick=\"viewHistoryItem(product,  + p.id + )\" class=\"px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition\">Pilih</button>" +
          "<button onclick=\"deleteHistoryItem(product,  + p.id + )\" class=\"p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition\"><i class=\"fa-solid fa-trash\"></i></button>" +
        "</div>" +
      "</div>"
    ).join("");
  } else if (type === "prompts") {
    titleEl.innerText = "Riwayat Prompt Library";
    countLabel.innerText = promptsCache.length + " Prompt tersimpan";
    if (promptsCache.length === 0) {
      listEl.innerHTML = "<div class=\"text-center py-10 text-slate-500 text-xs\">Belum ada riwayat prompt.</div>";
      return;
    }
    listEl.innerHTML = promptsCache.map(p => 
      "<div class=\"p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition\">" +
        "<div class=\"min-w-0 truncate cursor-pointer\" onclick=\"viewHistoryItem(prompt,  + p.id + )\">" +
          "<h4 class=\"font-bold text-white text-xs truncate hover:text-amber-300 transition\">" + p.title + "</h4>" +
          "<p class=\"text-[10px] text-slate-400 font-mono truncate\">" + p.prompt + "</p>" +
        "</div>" +
        "<div class=\"flex items-center gap-1.5 flex-shrink-0\">" +
          "<button onclick=\"viewHistoryItem(prompt,  + p.id + )\" class=\"px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold transition\">Salin</button>" +
          "<button onclick=\"deleteHistoryItem(prompt,  + p.id + )\" class=\"p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition\"><i class=\"fa-solid fa-trash\"></i></button>" +
        "</div>" +
      "</div>"
    ).join("");
  } else if (type === "standalone_renders") {
    titleEl.innerText = "Riwayat Render Studio Foto";
    countLabel.innerText = standaloneRendersCache.length + " Render tersimpan";
    if (standaloneRendersCache.length === 0) {
      listEl.innerHTML = "<div class=\"text-center py-10 text-slate-500 text-xs\">Belum ada riwayat render foto.</div>";
      return;
    }
    listEl.innerHTML = standaloneRendersCache.map((r, idx) => 
      "<div class=\"p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition\">" +
        "<div class=\"flex items-center gap-2.5 min-w-0 cursor-pointer\" onclick=\"viewHistoryItem(render, " + idx + ")\">" +
          "<img src=\"" + r.imageUrl + "\" class=\"w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0\">" +
          "<div class=\"min-w-0 truncate\">" +
            "<h4 class=\"font-bold text-white text-xs truncate hover:text-amber-300 transition\">" + r.prompt + "</h4>" +
            "<p class=\"text-[10px] text-slate-400 font-mono\">" + (r.time || "Baru saja") + "</p>" +
          "</div>" +
        "</div>" +
        "<div class=\"flex items-center gap-1.5 flex-shrink-0\">" +
          "<button onclick=\"downloadImageDirectly( + r.imageUrl + , render- + (idx + 1) + .jpg)\" class=\"p-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-amber-300 hover:text-white text-xs transition\"><i class=\"fa-solid fa-download\"></i></button>" +
          "<button onclick=\"deleteHistoryItem(render, " + idx + ")\" class=\"p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition\"><i class=\"fa-solid fa-trash\"></i></button>" +
        "</div>" +
      "</div>"
    ).join("");
  }
}

function viewHistoryItem(type, id) {
  closeHistoryModal();
  if (type === "storyboard") {
    loadAndEditStoryboard(id);
  } else if (type === "product") {
    useProductInStoryboard(id);
  } else if (type === "prompt") {
    const p = promptsCache.find(item => item.id === id);
    if (p) copyPromptText(encodeURIComponent(p.prompt));
  } else if (type === "render") {
    const r = standaloneRendersCache[id];
    if (r) {
      selectMenu("ai-photo-generator");
      document.getElementById("standalone-prompt").value = r.prompt;
    }
  }
}

async function deleteHistoryItem(type, id) {
  if (!confirm("Hapus item ini dari riwayat?")) return;
  if (type === "storyboard") {
    await deleteStoryboard(id);
    renderHistoryItems("storyboards");
  } else if (type === "product") {
    await deleteProduct(id);
    renderHistoryItems("products");
  } else if (type === "prompt") {
    await fetch("/api/prompts/" + id, { method: "DELETE" });
    await loadPrompts();
    renderHistoryItems("prompts");
  } else if (type === "render") {
    standaloneRendersCache.splice(id, 1);
    localStorage.setItem("affiliate_ai_renders_history", JSON.stringify(standaloneRendersCache));
    renderHistoryItems("standalone_renders");
  }
}

async function loadSettings() {
  try {
    const res = await fetch("/api/settings");
    const settings = await res.json();
    const geminiInput = document.getElementById("setting-gemini-key");
    const hfInput = document.getElementById("setting-hf-key");
    if (geminiInput && settings.geminiApiKey) {
      geminiInput.placeholder = settings.geminiApiKey;
      if (!geminiInput.value) geminiInput.value = settings.geminiApiKey;
    }
    if (hfInput && settings.huggingFaceKey) {
      hfInput.placeholder = settings.huggingFaceKey;
      if (!hfInput.value) hfInput.value = settings.huggingFaceKey;
    }
  } catch (err) { console.error("Error loading settings:", err); }
}

async function saveSettings() {
  const geminiApiKey = document.getElementById("setting-gemini-key").value.trim();
  const huggingFaceKey = document.getElementById("setting-hf-key").value.trim();
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey, huggingFaceKey })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToastNotification("success", "Tersimpan", "Pengaturan Google Gemini API Key berhasil disimpan!");
      activeUserHasApiKey = true;
      loadGeminiKeysPool();
      loadSettings();
    } else {
      showToastNotification("error", "Simpan Gagal", data.message || "Gagal menyimpan pengaturan API Key.");
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    showToastNotification("error", "Simpan Gagal", "Terjadi kesalahan koneksi saat menyimpan pengaturan.");
  }
}

function copyPromptText(encodedText) {
  const text = decodeURIComponent(encodedText);
  navigator.clipboard.writeText(text).then(() => {
    showToastNotification("success", "Tersalin!", "Prompt berhasil disalin ke clipboard.");
  }).catch(err => {
    console.error("Copy failed", err);
  });
}

let activeToastTimeout = null;
let lastToastSignature = "";
let lastToastTime = 0;

function showToastNotification(type, title, message) {
  const now = Date.now();
  const signature = `${type}|${title}|${message}`;
  
  // Prevent duplicate spam within 800ms
  if (signature === lastToastSignature && (now - lastToastTime) < 800) {
    return;
  }
  lastToastSignature = signature;
  lastToastTime = now;

  let toastContainer = document.getElementById("toast-global-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-global-container";
    toastContainer.className = "fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 sm:bottom-6 sm:top-auto z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-[92vw] sm:w-full";
    document.body.appendChild(toastContainer);
  }

  // Remove any currently existing toasts immediately to avoid stacking
  if (activeToastTimeout) {
    clearTimeout(activeToastTimeout);
    activeToastTimeout = null;
  }
  toastContainer.innerHTML = "";

  const toast = document.createElement("div");
  let iconClass = "fa-solid fa-circle-info text-cyan-400";
  let borderClass = "border-cyan-500/50 shadow-cyan-950/50";
  let bgClass = "from-[#081528]/95 via-[#0d1c33]/95 to-[#081528]/95";
  let glowColor = "rgba(6, 182, 212, 0.25)";

  if (type === "success") {
    iconClass = "fa-solid fa-circle-check text-emerald-400";
    borderClass = "border-emerald-500/50 shadow-emerald-950/50";
    bgClass = "from-[#042018]/95 via-[#062c21]/95 to-[#042018]/95";
    glowColor = "rgba(16, 185, 129, 0.25)";
  } else if (type === "error") {
    iconClass = "fa-solid fa-triangle-exclamation text-rose-400";
    borderClass = "border-rose-500/50 shadow-rose-950/50";
    bgClass = "from-[#250912]/95 via-[#350d1a]/95 to-[#250912]/95";
    glowColor = "rgba(244, 63, 94, 0.25)";
  } else if (type === "warning") {
    iconClass = "fa-solid fa-circle-exclamation text-amber-400";
    borderClass = "border-amber-500/50 shadow-amber-950/50";
    bgClass = "from-[#261506]/95 via-[#381f08]/95 to-[#261506]/95";
    glowColor = "rgba(245, 158, 11, 0.25)";
  }

  toast.className = "pointer-events-auto p-3.5 rounded-2xl bg-gradient-to-r " + bgClass + " border " + borderClass + " shadow-2xl backdrop-blur-xl flex items-start gap-3 transform transition-all duration-300 -translate-y-3 sm:translate-y-4 opacity-0";
  toast.style.boxShadow = `0 10px 30px -5px ${glowColor}, 0 0 15px 0 ${glowColor}`;

  toast.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-inner">
      <i class="${iconClass}"></i>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-xs font-bold text-white font-display flex items-center gap-1.5">
        <span>${title || 'Pemberitahuan'}</span>
      </div>
      <div class="text-[11px] text-slate-200 leading-relaxed mt-0.5">${message || ''}</div>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white text-xs p-1 transition" title="Tutup">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("-translate-y-3", "translate-y-4", "opacity-0");
  }, 10);

  // Auto dismiss
  activeToastTimeout = setTimeout(() => {
    toast.classList.add("-translate-y-3", "sm:translate-y-4", "opacity-0");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }, 3500);
}

// Override default browser alert
window.alert = function(msg) {
  showToastNotification("warning", "Pemberitahuan", typeof msg === "object" ? JSON.stringify(msg) : String(msg));
};

// =========================================================================
// ONE-CLICK BROWSER EXTENSION ACTIVATION & INSTALL BRIDGE
// =========================================================================
function openExtensionInstallModal() {
  const modal = document.getElementById("modal-install-extension");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeExtensionInstallModal() {
  const modal = document.getElementById("modal-install-extension");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function confirmAndInstallExtension() {
  closeExtensionInstallModal();
  showToastNotification("success", "Membuka Flow AI", "Menyuntikkan sesi VIP otomatis...");
  
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ action: "ACTIVATE_FLOW_SESSION", openTab: true });
    } catch(e) {}
  }
  
  window.open("https://labs.google/fx/id/tools/flow", "_blank");
}

let isExtensionInstalled = false;

// Auto Detect Extension
window.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "AFFILIATEGO_EXTENSION_READY" || event.data.type === "AFFILIATEGO_FLOW_INJECTED")) {
    isExtensionInstalled = true;
    updateExtensionStatusUI(true);
  }
});

function checkExtensionInstalled() {
  if (sessionStorage.getItem("affiliatego_extension_installed") === "true") {
    isExtensionInstalled = true;
    updateExtensionStatusUI(true);
  }
}

function updateExtensionStatusUI(installed) {
  const badge = document.getElementById("extension-status-badge");
  const subtext = document.getElementById("extension-status-subtext");
  
  if (badge) {
    if (installed) {
      badge.className = "px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold flex-shrink-0 border border-emerald-500/30";
      badge.innerText = "TERPASANG";
    } else {
      badge.className = "px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold flex-shrink-0 border border-amber-500/30";
      badge.innerText = "AUTO VIP";
    }
  }

  if (subtext) {
    subtext.innerText = installed ? "Ekstensi Aktif & Terhubung" : "Sesi Auto-Login Ekstensi";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkExtensionInstalled();
});

async function triggerActivateExtensionFlow() {
  showToastNotification("success", "Membuka Flow AI Server 2", "Menyuntikkan sesi VIP & membuka tab...");
  
  if (isExtensionInstalled) {
    // Let extension inject cookies first and open the tab cleanly
    window.postMessage({ type: "TRIGGER_ACTIVATE_FLOW" }, "*");
  } else {
    // If extension is not detected yet, open directly
    window.open("https://labs.google/fx/id/tools/flow", "_blank");
  }
}



// ================================================================
// FLOW AI VIDEO PROMPT GENERATOR HELPERS
// ================================================================
function generateFlowCustomPrompt() {
  const inputEl = document.getElementById("flow-prompt-input");
  const cameraEl = document.getElementById("flow-camera-style");
  const lightingEl = document.getElementById("flow-lighting-style");
  const outputBox = document.getElementById("flow-prompt-output-box");
  const resultText = document.getElementById("flow-prompt-result-text");

  const rawIdea = inputEl ? inputEl.value.trim() : "";
  const camera = cameraEl ? cameraEl.value : "Cinematic Smooth Slow Pan";
  const lighting = lightingEl ? lightingEl.value : "Warm Golden Hour Sunlight";

  if (!rawIdea) {
    showToastNotification("error", "Input Kosong", "Harap masukkan naskah atau ide video terlebih dahulu!");
    return;
  }

  const enhancedPrompt = `Cinematic commercial video of (${rawIdea}), executed with (${camera}), illuminated by natural (${lighting}), hyperrealistic 8K UHD textures, Sony FX3 cinema line camera motion, smooth fluid dynamic movement, realistic lighting reflections, ultra high-definition commercial film look.`;

  if (resultText && outputBox) {
    resultText.innerText = enhancedPrompt;
    outputBox.classList.remove("hidden");
    showToastNotification("success", "Prompt Siap!", "Master prompt video berhasil dirancang.");
  }
}

function copyGeneratedFlowPrompt() {
  const resultText = document.getElementById("flow-prompt-result-text");
  if (resultText && resultText.innerText) {
    navigator.clipboard.writeText(resultText.innerText).then(() => {
      showToastNotification("success", "Tersalin!", "Prompt video berhasil disalin.");
    });
  }
}

// ================================================================
// GEMINI AI CHAT GATEWAY & PER-USER AES-256 API KEY CLIENT
// ================================================================
let currentChatId = null;
let currentChatModel = 'gemini-2.5-flash';
let activeUserHasApiKey = false;

async function checkUserApiKeyStatus() {
  try {
    const res = await fetch('/api/user/api-key-status');
    const data = await res.json();
    if (data.success) {
      activeUserHasApiKey = data.hasApiKey;
      const badge = document.getElementById('user-apikey-status-badge');
      const warningBox = document.getElementById('chat-key-warning-box');
      const deleteBtn = document.getElementById('btn-delete-apikey');
      const inputKey = document.getElementById('user-gemini-custom-key');

      if (badge) {
        if (data.hasApiKey) {
          badge.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/30';
          badge.innerText = 'TERHUBUNG (AES-256)';
          if (inputKey) inputKey.placeholder = '•••••••••••••••••••••••••••••••• (Tersimpan Aman)';
          if (deleteBtn) deleteBtn.classList.remove('hidden');
          if (warningBox) warningBox.classList.add('hidden');
        } else {
          badge.className = 'px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-mono font-bold';
          badge.innerText = 'BELUM TERHUBUNG';
          if (deleteBtn) deleteBtn.classList.add('hidden');
          if (warningBox) warningBox.classList.remove('hidden');
        }
      }
    }
  } catch (err) {
    console.error('Check API key status error:', err);
  }
}

async function saveUserApiKey() {
  const input = document.getElementById('user-gemini-custom-key');
  const apiKey = input ? input.value.trim() : '';

  if (!apiKey || apiKey.length < 10) {
    showToastNotification('error', 'API Key Tidak Valid', 'Masukkan Gemini API Key dari Google AI Studio (AIzaSy...).');
    return;
  }

  showToastNotification('info', 'Mengenkripsi...', 'Menyimpan key dengan enkripsi AES-256-GCM...');

  try {
    const res = await fetch('/api/user/save-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });

    const data = await res.json();
    if (data.success) {
      showToastNotification('success', 'Tersimpan!', data.message);
      if (input) input.value = '';
      checkUserApiKeyStatus();
    } else {
      showToastNotification('error', 'Gagal', data.message);
    }
  } catch (err) {
    showToastNotification('error', 'Error', err.message);
  }
}

async function deleteUserApiKey() {
  if (!confirm('Hapus Google Gemini API Key dari akun Anda?')) return;
  try {
    const res = await fetch('/api/user/delete-api-key', { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToastNotification('success', 'Terhapus', data.message);
      const input = document.getElementById('user-gemini-custom-key');
      if (input) input.placeholder = 'Paste API Key Anda (AIzaSy...)';
      checkUserApiKeyStatus();
    }
  } catch(e) {}
}

function changeChatModel(model) {
  currentChatModel = model;
  const badge = document.getElementById('chat-model-badge');
  if (badge) {
    badge.innerText = model.includes('pro') ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash';
  }
}

function injectChatPrompt(text) {
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = text;
    input.focus();
  }
}

// ==========================================================
// GEMINI MULTI-API KEY POOL & AUTO-FAILOVER CLIENT CONTROLLER
// ==========================================================
function openGeminiKeyModal() {
  const modal = document.getElementById('modal-gemini-keys');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    loadGeminiKeysPool();
  }
}

function closeGeminiKeyModal() {
  const modal = document.getElementById('modal-gemini-keys');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function loadGeminiKeysPool() {
  const list = document.getElementById('gemini-keys-modal-list');
  const badge = document.getElementById('gemini-keys-badge');
  const statusText = document.getElementById('gemini-keys-status-text');
  if (!list) return;

  try {
    const res = await fetch('/api/gemini-keys');
    const data = await res.json();

    if (data.success && data.keys) {
      if (badge) badge.innerText = data.keys.length;
      if (statusText) statusText.innerText = `${data.keys.length} Key Tersimpan`;

      if (data.keys.length === 0) {
        list.innerHTML = `<div class="p-4 rounded-xl bg-[#070b14] border border-slate-800 text-center text-xs text-slate-400">Belum ada API Key tersimpan. Silakan masukkan key di atas.</div>`;
        return;
      }

      list.innerHTML = data.keys.map(k => {
        const isActive = k.isActive;
        const isLimited = k.status === 'rate_limited';
        
        let statusBadge = isActive 
          ? `<span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Aktif</span>`
          : (isLimited 
            ? `<span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Rate Limited</span>`
            : `<span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">Cadangan</span>`);

        return `
          <div class="p-3 rounded-2xl ${isActive ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-[#070b14] border-slate-800/80'} border flex items-center justify-between gap-2.5 transition">
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white truncate">${k.label || 'API Key'}</span>
                ${statusBadge}
              </div>
              <div class="text-[11px] font-mono text-cyan-300/80 tracking-wide">${k.maskedKey}</div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              ${!isActive ? `
                <button onclick="setActiveGeminiKey('${k.id}')" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 text-[10px] font-bold border border-slate-700 hover:border-cyan-500/40 transition" title="Jadikan Key Aktif">
                  Aktifkan
                </button>
              ` : ''}
              <button onclick="deleteGeminiKey('${k.id}')" class="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs transition" title="Hapus Key">
                <i class="fa-solid fa-trash text-[11px]"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch(e) {
    if (statusText) statusText.innerText = 'Gagal memuat';
  }
}

async function submitNewGeminiKey() {
  const keyInput = document.getElementById('input-new-gemini-key');
  const labelInput = document.getElementById('input-new-gemini-label');
  const key = keyInput ? keyInput.value.trim() : '';
  const label = labelInput ? labelInput.value.trim() : '';

  if (!key) {
    showToastNotification('error', 'Gagal', 'Silakan tempel Google Gemini API Key terlebih dahulu.');
    return;
  }

  try {
    const res = await fetch('/api/gemini-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, label })
    });
    const data = await res.json();

    if (data.success) {
      showToastNotification('success', 'Berhasil', data.message || 'API Key berhasil ditambahkan!');
      if (keyInput) keyInput.value = '';
      if (labelInput) labelInput.value = '';
      activeUserHasApiKey = true;
      loadGeminiKeysPool();
    } else {
      showToastNotification('error', 'Gagal', data.message || 'Gagal menambahkan API Key.');
    }
  } catch(e) {
    showToastNotification('error', 'Error', e.message);
  }
}

async function setActiveGeminiKey(id) {
  try {
    const res = await fetch('/api/gemini-keys/set-active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification('success', 'Sukses', data.message);
      loadGeminiKeysPool();
    }
  } catch(e) {}
}

async function deleteGeminiKey(id) {
  if (!confirm('Hapus API Key ini dari pool?')) return;
  try {
    const res = await fetch(`/api/gemini-keys/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToastNotification('success', 'Dihapus', data.message);
      loadGeminiKeysPool();
    } else {
      showToastNotification('error', 'Gagal', data.message);
    }
  } catch(e) {}
}

function startNewChatSession() {
  currentChatId = 'chat_' + Date.now();
  const container = document.getElementById('chat-messages-container');
  const welcome = document.getElementById('chat-empty-welcome');
  if (container) {
    container.innerHTML = '';
    if (welcome) {
      container.appendChild(welcome);
      welcome.classList.remove('hidden');
    }
  }
  loadChatSessions();
}

function toggleChatHistorySidebar(forceClose = false) {
  const sidebar = document.getElementById('gemini-chat-sidebar');
  const backdrop = document.getElementById('gemini-chat-backdrop');
  if (!sidebar) return;

  if (window.innerWidth < 768) {
    if (forceClose || !sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
    } else {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('fixed', 'inset-y-0', 'left-0', 'z-50', 'w-72', 'max-w-[85vw]', 'bg-[#0c101d]', 'shadow-2xl', 'p-3.5', 'flex', 'flex-col', 'border-r', 'border-slate-800');
      if (backdrop) backdrop.classList.remove('hidden');
    }
  } else {
    sidebar.classList.toggle('hidden');
  }
}

async function loadChatSessions() {
  try {
    const res = await fetch('/api/chats');
    const data = await res.json();
    const list = document.getElementById('chat-history-sidebar-list');
    if (!list) return;

    if (data.success && data.chats && data.chats.length > 0) {
      list.innerHTML = data.chats.map(c => `
        <div onclick="openChatSession('${c.id}')" class="group p-2.5 rounded-xl bg-[#090d17] hover:bg-cyan-950/40 border ${currentChatId === c.id ? 'border-cyan-500/60 bg-cyan-950/30' : 'border-slate-800/80'} hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition shadow-sm">
          <div class="min-w-0 flex items-center gap-2 flex-1 pr-1">
            <i class="fa-solid fa-message text-[10px] text-cyan-400 flex-shrink-0"></i>
            <div class="text-[11px] font-bold text-slate-300 truncate group-hover:text-cyan-300">${c.title || 'New Chat'}</div>
          </div>
          <button onclick="event.stopPropagation(); deleteChatSession('${c.id}')" class="text-slate-500 hover:text-rose-400 text-xs p-1 transition flex-shrink-0" title="Hapus Chat">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<div class="text-[10px] text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-xl">Belum ada riwayat chat</div>';
    }
  } catch(e) {}
}

async function openChatSession(id) {
  try {
    const res = await fetch('/api/chats');
    const data = await res.json();
    if (data.success && data.chats) {
      const chat = data.chats.find(c => c.id === id);
      if (chat) {
        currentChatId = chat.id;
        currentChatModel = chat.model || 'gemini-2.5-flash';
        const modelSelect = document.getElementById('chat-model-select');
        if (modelSelect) modelSelect.value = currentChatModel;
        changeChatModel(currentChatModel);

        const container = document.getElementById('chat-messages-container');
        if (!container) return;
        container.innerHTML = '';

        chat.messages.forEach(m => {
          appendMessageToUI(m.role, m.content);
        });

        // Close mobile drawer if open
        if (window.innerWidth < 768) {
          toggleChatHistorySidebar(true);
        }

        // Highlight active session
        loadChatSessions();
      }
    }
  } catch(e) {}
}

async function deleteChatSession(id) {
  try {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
    if (currentChatId === id) startNewChatSession();
    loadChatSessions();
  } catch(e) {}
}

function formatChatMarkdown(raw) {
  if (!raw) return '';
  return raw
    // Code blocks with language or without
    .replace(/```([\s\S]*?)```/g, '<pre class="my-2 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800">$1</code>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

function copyChatMessage(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i>';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    }, 2000);
  });
}

function appendMessageToUI(role, content) {
  const container = document.getElementById('chat-messages-container');
  const welcome = document.getElementById('chat-empty-welcome');
  if (welcome) welcome.classList.add('hidden');

  const msgDiv = document.createElement('div');
  const isUser = role === 'user';
  
  msgDiv.className = `flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'} w-full max-w-full`;

  const formattedContent = formatChatMarkdown(content);
  const rawTextEscaped = encodeURIComponent(content);

  msgDiv.innerHTML = `
    ${!isUser ? '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 mt-0.5 shadow-sm"><i class="fa-solid fa-sparkles"></i></div>' : ''}
    <div class="group relative max-w-[88%] sm:max-w-[80%] min-w-0 p-3 rounded-2xl ${isUser ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs font-medium shadow-md shadow-cyan-950/20' : 'bg-[#0c101d] border border-slate-800/90 text-slate-200 rounded-tl-xs shadow-sm'} text-xs leading-relaxed break-words overflow-hidden">
      <div class="break-words max-w-full overflow-hidden">${formattedContent}</div>
      ${!isUser ? `
        <div class="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-slate-800/60 text-[9.5px] text-slate-400">
          <button onclick="copyChatMessage(this, decodeURIComponent('${rawTextEscaped}'))" class="hover:text-cyan-300 transition flex items-center gap-1">
            <i class="fa-regular fa-copy"></i> Salin
          </button>
          <span class="text-slate-700">•</span>
          <span class="text-slate-500 font-mono text-[9px]">Gemini AI</span>
        </div>
      ` : ''}
    </div>
    ${isUser ? '<div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 mt-0.5 shadow-sm"><i class="fa-solid fa-user"></i></div>' : ''}
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

async function handleSendChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input-text');
  const message = input ? input.value.trim() : '';
  const statusEl = document.getElementById('chat-stream-status');
  const sendBtn = document.getElementById('btn-send-chat');

  if (!message) return;

  if (!activeUserHasApiKey) {
    showToastNotification('error', 'API Key Diperlukan', 'Harap masukkan Google Gemini API Key Anda di Pengaturan.');
    selectMenu('settings');
    return;
  }

  input.value = '';
  appendMessageToUI('user', message);

  // Setup streaming model response container
  const container = document.getElementById('chat-messages-container');
  const modelMsgDiv = document.createElement('div');
  modelMsgDiv.className = 'flex items-start gap-2 justify-start w-full max-w-full';
  modelMsgDiv.innerHTML = `
    <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0 mt-0.5 animate-pulse shadow-sm"><i class="fa-solid fa-sparkles"></i></div>
    <div class="ai-reply-body max-w-[88%] sm:max-w-[80%] min-w-0 p-3 rounded-2xl bg-[#0c101d] border border-slate-800/90 text-slate-200 rounded-tl-xs text-xs leading-relaxed shadow-sm break-words overflow-hidden">
      <div class="flex items-center gap-1.5 text-cyan-400 font-mono text-[10.5px]">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Gemini sedang berpikir...</span>
      </div>
    </div>
  `;
  container.appendChild(modelMsgDiv);
  container.scrollTop = container.scrollHeight;

  const replyBody = modelMsgDiv.querySelector('.ai-reply-body');
  let accumulatedText = '';

  if (statusEl) statusEl.innerText = 'Mengetik...';
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        model: currentChatModel,
        chatId: currentChatId
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      replyBody.innerHTML = `<span class="text-rose-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> ${errData.message || 'Error'}</span>`;
      if (statusEl) statusEl.innerText = 'Error';
      if (sendBtn) sendBtn.disabled = false;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.replace('data: ', '').trim());
            if (data.chunk) {
              accumulatedText += data.chunk;
              const formatted = formatChatMarkdown(accumulatedText);
              replyBody.innerHTML = formatted + '<span class="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse ml-0.5 align-middle"></span>';
              container.scrollTop = container.scrollHeight;
            }
            if (data.done) {
              if (data.chatId) currentChatId = data.chatId;
              const formatted = formatChatMarkdown(accumulatedText);
              const rawTextEscaped = encodeURIComponent(accumulatedText);
              replyBody.innerHTML = `
                ${formatted}
                <div class="flex items-center gap-2 pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <button onclick="copyChatMessage(this, decodeURIComponent('${rawTextEscaped}'))" class="hover:text-cyan-300 transition flex items-center gap-1">
                    <i class="fa-regular fa-copy"></i> Salin
                  </button>
                  <span class="text-slate-700">•</span>
                  <span class="text-slate-500 font-mono text-[9px]">Google Gemini</span>
                </div>
              `;
              loadChatSessions();
            }
            if (data.error) {
              replyBody.innerHTML = `<span class="text-rose-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error}</span>`;
            }
          } catch(e) {}
        }
      }
    }
  } catch (err) {
    replyBody.innerHTML = `<span class="text-rose-400 font-bold"><i class="fa-solid fa-triangle-exclamation"></i> ${err.message}</span>`;
  } finally {
    if (statusEl) statusEl.innerText = 'Siap';
    if (sendBtn) sendBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkUserApiKeyStatus();
  loadChatSessions();
  loadGeminiKeysPool();
  loadFlowAccounts();
});

// Flow AI Brutal Extension Modal Helpers
function openExtensionModal() {
  const modal = document.getElementById("modal-extension-flow-ai");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeExtensionModal() {
  const modal = document.getElementById("modal-extension-flow-ai");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// ==========================================================
// GOOGLE & FLOW AI MULTI-ACCOUNT / SESSION SWITCHER CONTROLLER
// ==========================================================
function openFlowAccountsModal() {
  const modal = document.getElementById("modal-flow-accounts");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    loadFlowAccounts();
  }
}

function closeFlowAccountsModal() {
  const modal = document.getElementById("modal-flow-accounts");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

let isFlowPassVisible = false;
function toggleFlowPasswordVisibility() {
  const passInput = document.getElementById("input-flow-password");
  const icon = document.getElementById("icon-toggle-flow-pass");
  if (!passInput || !icon) return;
  
  isFlowPassVisible = !isFlowPassVisible;
  passInput.type = isFlowPassVisible ? "text" : "password";
  icon.className = isFlowPassVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}

async function loadFlowAccounts() {
  const list = document.getElementById("flow-accounts-modal-list");
  const badge = document.getElementById("flow-accounts-badge");
  const statusText = document.getElementById("flow-accounts-status-text");
  if (!list) return;

  try {
    const res = await fetch("/api/flow-accounts");
    const data = await res.json();

    if (data.success && data.accounts) {
      if (badge) badge.innerText = data.accounts.length;
      if (statusText) statusText.innerText = `${data.accounts.length} Akun Tersimpan`;

      if (data.accounts.length === 0) {
        list.innerHTML = `<div class="p-4 rounded-xl bg-[#060c12] border border-slate-800 text-center text-xs text-slate-400">Belum ada akun Google / Flow AI. Silakan tambahkan di form atas.</div>`;
        return;
      }

      list.innerHTML = data.accounts.map(acc => {
        const isActive = acc.isActive;
        const quota = acc.quotaStatus || "ready";
        
        let quotaBadge = "";
        if (quota === "ready") {
          quotaBadge = `<span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Kuota Siap</span>`;
        } else if (quota === "low") {
          quotaBadge = `<span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1"><i class="fa-solid fa-battery-half text-[9px]"></i> Menipis</span>`;
        } else {
          quotaBadge = `<span class="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Limit</span>`;
        }

        const activeTag = isActive 
          ? `<span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-400/60 flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px] text-emerald-400"></i> Aktif Digunakan</span>`
          : "";

        return `
          <div class="p-3 rounded-2xl ${isActive ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30' : 'bg-[#060c12] border-slate-800/80'} border flex flex-col gap-2.5 transition">
            
            <!-- Top Row: Label, Active Tag, Quota -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-6 h-6 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-300 flex-shrink-0">
                  <i class="fa-brands fa-google"></i>
                </div>
                <span class="text-xs font-extrabold text-white truncate">${acc.label || 'Akun Google'}</span>
                ${activeTag}
              </div>
              <div class="flex-shrink-0">
                ${quotaBadge}
              </div>
            </div>

            <!-- Email and Credentials Display -->
            <div class="bg-[#030609] p-2.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400 truncate"><i class="fa-regular fa-envelope text-slate-500 text-[10px] mr-1"></i> ${acc.email}</span>
                <button onclick="copyFlowCredential('Email', '${acc.email.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 text-[10px] font-bold transition flex items-center gap-1">
                  <i class="fa-regular fa-copy text-[9px]"></i> Salin Email
                </button>
              </div>

              ${acc.hasPassword ? `
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <span class="text-slate-400 flex items-center gap-1"><i class="fa-solid fa-lock text-slate-500 text-[10px]"></i> Sandi: <span class="text-slate-300">${acc.passwordMasked}</span></span>
                  <button onclick="copyFlowCredential('Kata Sandi', '${acc.rawPassword.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 text-[10px] font-bold transition flex items-center gap-1">
                    <i class="fa-regular fa-copy text-[9px]"></i> Salin Sandi
                  </button>
                </div>
              ` : ''}

              ${acc.hasCookie ? `
                <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <span class="text-emerald-400/90 text-[10px] truncate"><i class="fa-solid fa-cookie-bite text-amber-400 text-[10px] mr-1"></i> Cookie: ${acc.cookieSnippet}</span>
                  <button onclick="copyFlowCredential('Cookie Sesi', '${acc.rawCookie.replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 text-[10px] font-bold transition flex items-center gap-1">
                    <i class="fa-regular fa-copy text-[9px]"></i> Salin Cookie
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Actions Row -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-[9px] text-slate-500">ID: ${acc.id}</span>
              <div class="flex items-center gap-1.5">
                ${!isActive ? `
                  <button onclick="setActiveFlowAccount('${acc.id}')" class="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1">
                    <i class="fa-solid fa-bolt text-[10px]"></i> Beralih ke Akun Ini
                  </button>
                ` : `
                  <span class="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <i class="fa-solid fa-check"></i> Sesi Aktif
                  </span>
                `}
                <button onclick="deleteFlowAccount('${acc.id}')" class="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs transition" title="Hapus Akun">
                  <i class="fa-solid fa-trash text-[11px]"></i>
                </button>
              </div>
            </div>

          </div>
        `;
      }).join("");
    }
  } catch(e) {
    if (statusText) statusText.innerText = "Gagal memuat";
  }
}

async function submitNewFlowAccount() {
  const emailInput = document.getElementById("input-flow-email");
  const labelInput = document.getElementById("input-flow-label");
  const passInput = document.getElementById("input-flow-password");
  const quotaInput = document.getElementById("input-flow-quota");
  const cookieInput = document.getElementById("input-flow-cookie");

  const email = emailInput ? emailInput.value.trim() : "";
  const label = labelInput ? labelInput.value.trim() : "";
  const password = passInput ? passInput.value.trim() : "";
  const quotaStatus = quotaInput ? quotaInput.value : "ready";
  const cookie = cookieInput ? cookieInput.value.trim() : "";

  if (!email) {
    showToastNotification("error", "Gagal", "Email Google wajib diisi.");
    return;
  }

  try {
    const res = await fetch("/api/flow-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, label, password, quotaStatus, cookie })
    });
    const data = await res.json();

    if (data.success) {
      showToastNotification("success", "Akun Disimpan", data.message || "Akun Google / Flow AI berhasil ditambahkan!");
      if (emailInput) emailInput.value = "";
      if (labelInput) labelInput.value = "";
      if (passInput) passInput.value = "";
      if (cookieInput) cookieInput.value = "";
      loadFlowAccounts();
    } else {
      showToastNotification("error", "Gagal", data.message || "Gagal menyimpan akun.");
    }
  } catch(e) {
    showToastNotification("error", "Error", e.message);
  }
}

async function setActiveFlowAccount(id) {
  try {
    const res = await fetch("/api/flow-accounts/set-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification("success", "Sesi Berganti", data.message);
      loadFlowAccounts();
    }
  } catch(e) {
    showToastNotification("error", "Error", e.message);
  }
}

async function deleteFlowAccount(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus akun Google / Flow AI ini?")) return;
  try {
    const res = await fetch(`/api/flow-accounts/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      showToastNotification("info", "Dihapus", data.message || "Akun berhasil dihapus.");
      loadFlowAccounts();
    }
  } catch(e) {
    showToastNotification("error", "Error", e.message);
  }
}

function copyFlowCredential(type, text) {
  if (!text) {
    showToastNotification("info", "Kosong", `${type} belum diisi untuk akun ini.`);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToastNotification("success", "Disalin ke Clipboard", `${type} siap ditempelkan di browser!`);
  }).catch(() => {
    showToastNotification("info", "Disalin", `${type}: ${text}`);
  });
}

