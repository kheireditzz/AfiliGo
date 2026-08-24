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
    
    // Exact domain list required by Google Identity & Labs
    const domains = [
      ".google.com",
      "google.com",
      ".labs.google",
      "labs.google",
      "accounts.google.com",
      "myaccount.google.com",
      "aitestkitchen.withgoogle.com"
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
    sendResponse({ active: true, version: "1.0.3" });
    return true;
  }
});
