// Full Multi-Domain Injection for Google Accounts, Google Labs & Flow
const SERVER_API = "https://affiliatego.vercel.app/api/flow/session-cookies";

async function injectCookiesToGoogle() {
  try {
    const res = await fetch(SERVER_API);
    const data = await res.json();
    if (!data || !data.cookies || data.cookies.length === 0) {
      console.warn("No active session cookies found on server.");
      return false;
    }

    const cookies = data.cookies;
    
    // Core Google Domains
    const domains = [
      ".google.com",
      "google.com",
      ".labs.google",
      "labs.google",
      "accounts.google.com"
    ];

    for (const d of domains) {
      const url = d.startsWith(".") ? `https://www${d}` : `https://${d}`;
      for (const c of cookies) {
        if (!c.name || !c.value) continue;

        try {
          await chrome.cookies.set({
            url: url,
            name: c.name,
            value: c.value,
            domain: d.startsWith(".") ? d : undefined,
            path: "/",
            secure: true,
            httpOnly: c.name.startsWith("SID") || c.name.startsWith("__Secure") || c.name.startsWith("HSID") || c.name.startsWith("SSID"),
            sameSite: "no_restriction"
          });
        } catch (e) {
          try {
            await chrome.cookies.set({
              url: `https://${d.replace(/^\./, '')}`,
              name: c.name,
              value: c.value,
              path: "/",
              secure: true,
              sameSite: "no_restriction"
            });
          } catch(err2) {}
        }
      }
    }

    console.log("Successfully injected all Google Flow session cookies!");
    return true;
  } catch (err) {
    console.error("Cookie injection error:", err);
    return false;
  }
}

// Automatically inject cookies when installed or refreshed
chrome.runtime.onInstalled.addListener(() => {
  injectCookiesToGoogle();
});

// Single Unified Listener to Inject first, then Open Tab without double firing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INJECT_AND_OPEN_FLOW") {
    injectCookiesToGoogle().then((success) => {
      chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow", active: true });
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === "ONLY_INJECT_COOKIES") {
    injectCookiesToGoogle().then((success) => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "ACTIVATE_FLOW_SESSION") {
    injectCookiesToGoogle().then((success) => {
      if (request.openTab) {
        chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow", active: true });
      }
      sendResponse({ success: true });
    });
    return true;
  }
});
