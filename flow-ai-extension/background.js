chrome.runtime.onInstalled.addListener(() => {
  console.log("Flow AI Brutal Studio Ultra v10.0 Installed Successfully.");
});

// Safe Relay Message to avoid "Receiving end does not exist"
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PING") {
    sendResponse({ status: "PONG" });
    return true;
  }
  return true;
});