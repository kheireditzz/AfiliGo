// Standard Clean Google Session Cookie Injector with Continuous Session Keeper
const SERVER_API = "https://affiliatego.vercel.app/api/flow/session-cookies";

async function injectCookiesToGoogle() {
  try {
    const res = await fetch(SERVER_API);
    const data = await res.json();
    if (!data || !data.cookies || data.cookies.length === 0) return false;

    const cookies = data.cookies;
    const oneYearLater = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

    for (const c of cookies) {
      if (!c.name || !c.value) continue;

      const isSecure = c.name.startsWith("__Secure-") || c.name.startsWith("__Host-") || c.name.startsWith("SID") || c.name.startsWith("HSID") || c.name.startsWith("SSID") || c.name.startsWith("SAPISID") || c.name.startsWith("APISID");

      // 1. Inject to .google.com
      try {
        await chrome.cookies.set({
          url: "https://www.google.com/",
          domain: ".google.com",
          name: c.name,
          value: c.value,
          path: "/",
          secure: isSecure,
          httpOnly: ["SID", "HSID", "SSID", "__Secure-1PSID", "__Secure-3PSID"].includes(c.name),
          sameSite: "no_restriction",
          expirationDate: oneYearLater
        });
      } catch (e) {}

      // 2. Inject to .labs.google
      try {
        await chrome.cookies.set({
          url: "https://labs.google/",
          domain: ".labs.google",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: ["SID", "HSID", "SSID", "__Secure-1PSID", "__Secure-3PSID"].includes(c.name),
          sameSite: "no_restriction",
          expirationDate: oneYearLater
        });
      } catch (e) {}

      // 3. Inject to https://labs.google/fx/id/tools/flow
      try {
        await chrome.cookies.set({
          url: "https://labs.google/fx/id/tools/flow",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          sameSite: "no_restriction",
          expirationDate: oneYearLater
        });
      } catch (e) {}
    }

    console.log("All cookies successfully injected across all domains!");
    return true;
  } catch (err) {
    console.error("Cookie injection failed:", err);
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  injectCookiesToGoogle();
});

// Guard: Keep injecting continuously whenever Flow or Labs is opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.includes("labs.google") || tab.url.includes("google.com/fx"))) {
    injectCookiesToGoogle();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INJECT_AND_OPEN_FLOW") {
    injectCookiesToGoogle().then(() => {
      chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow", active: true });
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "ACTIVATE_FLOW_SESSION") {
    injectCookiesToGoogle().then(() => {
      if (request.openTab) {
        chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow", active: true });
      }
      sendResponse({ success: true });
    });
    return true;
  }
});
