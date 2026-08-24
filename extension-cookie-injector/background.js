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

      const isSecurePrefix = c.name.startsWith("__Secure-") || c.name.startsWith("__Host-");
      const isHttpOnlyCookie = ["SID", "HSID", "SSID", "SAPISID", "APISID", "__Secure-1PSID", "__Secure-3PSID"].includes(c.name);

      // 1. Inject to .google.com with Persistent Expiration
      try {
        await chrome.cookies.set({
          url: "https://google.com/",
          domain: ".google.com",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: isHttpOnlyCookie,
          sameSite: isSecurePrefix ? "lax" : "unspecified",
          expirationDate: oneYearLater
        });
      } catch (e) {}

      // 2. Inject to .labs.google with Persistent Expiration
      try {
        await chrome.cookies.set({
          url: "https://labs.google/",
          domain: ".labs.google",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: isHttpOnlyCookie,
          sameSite: "lax",
          expirationDate: oneYearLater
        });
      } catch (e) {}

      // 3. Inject to accounts.google.com
      try {
        await chrome.cookies.set({
          url: "https://accounts.google.com/",
          domain: ".google.com",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: isHttpOnlyCookie,
          sameSite: isSecurePrefix ? "lax" : "unspecified",
          expirationDate: oneYearLater
        });
      } catch (e) {}
    }

    console.log("Cookies persistent set successfully!");
    return true;
  } catch (err) {
    console.error("Cookie injection failed:", err);
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  injectCookiesToGoogle();
});

// Continuously keep cookies active on tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.includes("labs.google") || tab.url.includes("google.com/fx"))) {
    if (changeInfo.status === "loading") {
      injectCookiesToGoogle();
    }
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
