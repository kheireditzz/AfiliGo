document.getElementById('btn-inject').addEventListener('click', () => {
  const status = document.getElementById('status');
  const btn = document.getElementById('btn-inject');
  btn.disabled = true;
  btn.innerText = 'Menghubungkan...';

  chrome.runtime.sendMessage({ action: "INJECT_AND_OPEN_FLOW" }, (response) => {
    btn.disabled = false;
    btn.innerText = 'Buka Google Flow AI';
    if (response && response.success) {
      status.style.display = 'block';
      status.innerText = 'Sesi berhasil disuntikkan! Membuka tab baru...';
    } else {
      status.style.display = 'block';
      status.style.color = '#f87171';
      status.innerText = 'Gagal mengambil sesi dari server.';
    }
  });
});
