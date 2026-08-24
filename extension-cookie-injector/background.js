// Background service worker to fetch cookies from AffiliateGo server and inject to google.com domain

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
    for (const c of cookies) {
      if (!c.name || !c.value) continue;
      
      // Set to .google.com
      await chrome.cookies.set({
        url: "https://labs.google",
        name: c.name,
        value: c.value,
        domain: ".google.com",
        path: "/",
        secure: true,
        httpOnly: c.name.startsWith("__Secure") || c.name.startsWith("SID") || c.name.startsWith("HSID") || c.name.startsWith("SSID"),
        sameSite: "no_restriction"
      });

      // Set to labs.google directly
      await chrome.cookies.set({
        url: "https://labs.google",
        name: c.name,
        value: c.value,
        domain: "labs.google",
        path: "/",
        secure: true,
        sameSite: "no_restriction"
      });
    }

    console.log("Successfully injected all Google Flow session cookies!");
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
    sendResponse({ active: true, version: "1.0.0" });
    return true;
  }
});
