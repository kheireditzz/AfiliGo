// Background service worker with Full Multi-Domain Injection for Google Accounts & Labs

const SERVER_API = "https://affiliatego.vercel.app/api/flow/session-cookies";

async function injectCookiesToGoogle() {
  try {
    const res = await fetch(SERVER_API);
    const data = await res.json();
    if (!data || !data.cookies) {
      console.warn("No active session cookies found on server.");
      return false;
    }

    const cookies = data.cookies;
    const targetDomains = [
      { url: "https://labs.google", domain: ".google.com" },
      { url: "https://accounts.google.com", domain: ".google.com" },
      { url: "https://labs.google/fx/id/tools/flow", domain: "labs.google" },
      { url: "https://aitestkitchen.withgoogle.com", domain: ".google.com" }
    ];

    for (const target of targetDomains) {
      for (const c of cookies) {
        if (!c.name || !c.value) continue;

        try {
          // Injection with exact Chrome cookies API specification
          await chrome.cookies.set({
            url: target.url,
            name: c.name,
            value: c.value,
            domain: target.domain,
            path: "/",
            secure: true,
            httpOnly: c.name.startsWith("SID") || c.name.startsWith("__Secure") || c.name.startsWith("HSID") || c.name.startsWith("SSID"),
            sameSite: "no_restriction"
          });
        } catch (setErr) {
          // Retry without domain constraint if rejected
          try {
            await chrome.cookies.set({
              url: target.url,
              name: c.name,
              value: c.value,
              path: "/",
              secure: true,
              sameSite: "no_restriction"
            });
          } catch(e) {}
        }
      }
    }

    console.log("Successfully injected all Google Flow session cookies across all target Google endpoints!");
    return true;
  } catch (err) {
    console.error("Cookie injection failed:", err);
    return false;
  }
}

// Automatically inject cookies in background when browser starts or user visits Google Flow
chrome.runtime.onInstalled.addListener(() => {
  injectCookiesToGoogle();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.includes("labs.google") || tab.url.includes("google.com/fx"))) {
    if (changeInfo.status === "loading") {
      injectCookiesToGoogle();
    }
  }
});

// Listener for popup internal messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INJECT_AND_OPEN_FLOW") {
    injectCookiesToGoogle().then((success) => {
      chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow" });
      sendResponse({ success: success });
    });
    return true;
  }
});

// Listener for external web dashboard clicks from AffiliateGo website!
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "ACTIVATE_FLOW_SESSION") {
    injectCookiesToGoogle().then((success) => {
      if (request.openTab) {
        chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow" });
      }
      sendResponse({ success: success, message: "Google Flow session injected successfully!" });
    });
    return true;
  } else if (request.action === "PING_EXTENSION") {
    sendResponse({ active: true, version: "1.0.1" });
    return true;
  }
});
