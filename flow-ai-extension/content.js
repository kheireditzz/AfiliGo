
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "INJECT_FLOW_PROMPT") {
    const input = document.querySelector('textarea, input[type="text"], [contenteditable="true"]');
    if (input) {
      if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
        input.value = request.prompt;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        input.innerText = request.prompt;
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, reason: "No input found" });
    }
  }
});
