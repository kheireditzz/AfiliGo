// Content script bridging webpage and extension
window.sessionStorage.setItem('affiliatego_extension_installed', 'true');
window.postMessage({ type: 'AFFILIATEGO_EXTENSION_READY', version: '1.0.2' }, '*');

// Listen for trigger events from webpage
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_ACTIVATE_FLOW') {
    chrome.runtime.sendMessage({ action: 'INJECT_AND_OPEN_FLOW' }, (response) => {
      window.postMessage({ type: 'AFFILIATEGO_FLOW_INJECTED', success: response && response.success }, '*');
    });
  }
});
