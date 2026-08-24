document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-inject');
  const status = document.getElementById('status');

  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.innerText = 'Menyuntikkan Sesi...';
      if (status) {
        status.style.display = 'block';
        status.style.color = '#fb923c';
        status.innerText = 'Menghubungkan ke server...';
      }

      try {
        const res = await fetch("https://affiliatego.vercel.app/api/flow/session-cookies");
        const data = await res.json();
        
        if (data && data.cookies && data.cookies.length > 0) {
          const domains = [".google.com", "labs.google", "accounts.google.com"];
          
          for (const d of domains) {
            const url = d.startsWith(".") ? `https://www${d}` : `https://${d}`;
            for (const c of data.cookies) {
              if (!c.name || !c.value) continue;
              try {
                await chrome.cookies.set({
                  url: url,
                  name: c.name,
                  value: c.value,
                  domain: d.startsWith(".") ? d : undefined,
                  path: "/",
                  secure: true,
                  sameSite: "no_restriction"
                });
              } catch(e) {}
            }
          }

          if (status) {
            status.style.color = '#10b981';
            status.innerText = 'Sesi Berhasil! Membuka Flow AI...';
          }

          setTimeout(() => {
            chrome.tabs.create({ url: "https://labs.google/fx/id/tools/flow", active: true });
          }, 300);

        } else {
          throw new Error("No cookies returned");
        }
      } catch (err) {
        console.error("Direct popup injection error:", err);
        // Fallback via background message
        chrome.runtime.sendMessage({ action: "INJECT_AND_OPEN_FLOW" });
        if (status) {
          status.style.color = '#10b981';
          status.innerText = 'Membuka Google Flow...';
        }
      } finally {
        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = 'Buka Google Flow AI';
        }, 1500);
      }
    });
  }
});
