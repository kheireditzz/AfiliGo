// Google Session Injector with Explicit Exact-Domain Constraints
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

      const isHostOnly = c.name.startsWith("__Host-");
      const isHttpOnlyCookie = ["SID", "HSID", "SSID", "SAPISID", "APISID", "__Secure-1PSID", "__Secure-3PSID"].includes(c.name);

      // Target 1: Global Google Domain (.google.com)
      if (!isHostOnly) {
        try {
          await chrome.cookies.set({
            url: "https://www.google.com/",
            domain: ".google.com",
            name: c.name,
            value: c.value,
            path: "/",
            secure: true,
            httpOnly: isHttpOnlyCookie,
            sameSite: "no_restriction",
            expirationDate: oneYearLater
          });
        } catch (e) {
          try {
            await chrome.cookies.set({
              url: "https://google.com/",
              domain: ".google.com",
              name: c.name,
              value: c.value,
              path: "/",
              secure: true,
              sameSite: "lax",
              expirationDate: oneYearLater
            });
          } catch(err2) {}
        }
      }

      // Target 2: Google Labs Subdomain (.labs.google)
      try {
        await chrome.cookies.set({
          url: "https://labs.google/fx/id/tools/flow",
          domain: isHostOnly ? undefined : ".labs.google",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: isHttpOnlyCookie,
          sameSite: "no_restriction",
          expirationDate: oneYearLater
        });
      } catch (e) {
        try {
          await chrome.cookies.set({
            url: "https://labs.google/",
            name: c.name,
            value: c.value,
            path: "/",
            secure: true,
            sameSite: "lax",
            expirationDate: oneYearLater
          });
        } catch(err2) {}
      }

      // Target 3: Accounts Google (.accounts.google.com)
      try {
        await chrome.cookies.set({
          url: "https://accounts.google.com/",
          domain: ".google.com",
          name: c.name,
          value: c.value,
          path: "/",
          secure: true,
          httpOnly: isHttpOnlyCookie,
          sameSite: "no_restriction",
          expirationDate: oneYearLater
        });
      } catch(e) {}
    }

    console.log("Cookies persistent exact-domain injection completed!");
    return true;
  } catch (err) {
    console.error("Cookie injection failed:", err);
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  injectCookiesToGoogle();
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
