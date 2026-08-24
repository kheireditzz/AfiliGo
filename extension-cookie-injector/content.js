// Content script bridging webpage and extension with safe runtime guard
try {
  window.sessionStorage.setItem('affiliatego_extension_installed', 'true');
  window.postMessage({ type: 'AFFILIATEGO_EXTENSION_READY', version: '1.0.3' }, '*');
} catch (e) {}

// Listen for trigger events from webpage with active context validation
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_ACTIVATE_FLOW') {
    // Check if extension context is still valid
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      try {
        chrome.runtime.sendMessage({ action: 'INJECT_AND_OPEN_FLOW' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Runtime message warning:", chrome.runtime.lastError.message);
          }
          window.postMessage({ type: 'AFFILIATEGO_FLOW_INJECTED', success: !chrome.runtime.lastError }, '*');
        });
      } catch (err) {
        console.warn("Extension context reloaded, refreshing bridge...");
      }
    }
  }
});
