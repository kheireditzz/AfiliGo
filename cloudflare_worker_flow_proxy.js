// =========================================================================
// CLOUDFLARE WORKER DEEP PROXY & DIRECT PROJECT WORKSPACE FOR FLOW AI
// =========================================================================

const RAW_COOKIE_STRING = "_ga=GA1.1.1073819654.1787600253; __Secure-3PSIDTS=AKEyXzUCBRPrcipSKhBfSh3qxE73z8WHkUf2Ubjjoqk4V6j-2TreO_qvST7Qhfb8coUuKxlO; __Secure-1PSIDTS=AKEyXzUCBRPrcipSKhBfSh3qxE73z8WHkUf2Ubjjoqk4V6j-2TreO_qvST7Qhfb8coUuKxlO; __Secure-1PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; __Secure-3PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; SIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; __Secure-1PSIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; __Secure-3PSIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; AEC=AdJVEavk7ZGXLNiAVrKDeuD0Z34Hu_0WaiBDD9YLm5R1Tx7Rs91u6fvwoA; NID=534=StyELGiY6IOC7IxlW1rM4IsGuZC56MC2JMa-lqxCVZW8-za8JG33Q5X7WZIkfxFLImEOD5u1N2X29gxR1UXuyw2ia36dioS5voEMsF3s549JG_DQUCfsW9nzayZZUgUD1O62-7tO968rGnxf14Prj0IpZYD0a6LK6ZDBmnFVagfqX2R1gCG_ceaV4LI44y1XLW-Gmf_niH6hVUdUy56etJnM4RqRAARcXSMSi1TaXy7pJkkWj0WqPHuW3EpJkkWj0WqPHuW3ErcJJIJME-LeignHJjFL6VoxrK9_uEyI0ABfU-b7Exf79fAwdRiu4TNunXVU7Zy3GMrghecU4Kyyc2W_T6wo80VhixmKmJXcLPtlwFeRWfBIUKeL_H7IONPuT1YLbnj-5wbWrID-Ntg7LQce-bt8Ucet0DkUBo8wZHcqhlTnMRIvrXjo-dVdqirOKOMejzEKY0b_Mf6EVoaheyjaGv_5m00rsPCgRLLInV4qHSDsNrjXWsnxhjON7B2CAUI01ET1rLYABhagGkzRQRr8GsNE6N5yWqw7nusXPVXvCm4ZE4x2Amew9o56KtUOKhCDQbWzxEx1M_Ox2pl8pyo8IAYIgQ5dolo5EpBoGvSxMZBWg8qvLO0BHcQf5CcMA8g-8aZSX1dzpzP_I8_U32mpi7I0BHmXoloAg5l1IUiDx-yed7YJYzFd8FiqngLTM6dQIzYjRU52vyzwvdOiUDV8YqZ0MvyvZFDA; EMAIL=%22kheireditzsupport%40gmail.com%22; SID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; __Secure-1PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; __Secure-3PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; SSID=AqDRs-AHIWBNtU06r; HSID=AqDRs-AHIWBNtU06r; SAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; APISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; _ga_X2GNH8R5NS=GS2.1.s1787603939$o2$g1$t1787606324$j57$l0$h981740632; _ga_TEFY0PFXC5=GS2.1.s1787603939$o2$g1$t1787606324$j57$l0$h0";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const workerDomain = url.hostname;
  
  let targetPath = url.pathname;
  
  // 1. Intercept Next-Auth session check
  if (targetPath.includes('/api/auth/session')) {
    return new Response(JSON.stringify({
      user: {
        name: "Kheir Editz VIP",
        email: "kheireditzsupport@gmail.com",
        image: "https://lh3.googleusercontent.com/a/default-user=s96-c"
      },
      expires: "2027-12-31T23:59:59.999Z"
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }

  // 2. Route root directly to Flow Tool
  if (targetPath === '/' || targetPath === '' || targetPath === '/flow') {
    targetPath = '/fx/id/tools/flow';
  }

  const targetUrl = new URL(`https://labs.google${targetPath}${url.search}`);

  // Forward headers with authorized session
  const headers = new Headers(request.headers);
  headers.set('Host', 'labs.google');
  headers.set('Referer', 'https://labs.google/fx/id/tools/flow');
  headers.set('Origin', 'https://labs.google');
  headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  headers.set('Cookie', RAW_COOKIE_STRING);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'follow'
  });

  try {
    const response = await fetch(modifiedRequest);
    const contentType = response.headers.get('content-type') || '';

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    responseHeaders.delete('X-Frame-Options');
    responseHeaders.delete('Content-Security-Policy');

    // 3. Rewrite and set all individual cookies on the worker domain with Lax policy
    const individualCookies = RAW_COOKIE_STRING.split(';');
    for (const c of individualCookies) {
      const trimmed = c.trim();
      if (trimmed) {
        responseHeaders.append('Set-Cookie', `${trimmed}; Domain=${workerDomain}; Path=/; Secure; SameSite=Lax; HttpOnly; Max-Age=31536000`);
      }
    }

    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Inject authenticated session into Next.js props
      html = html.replace(
        '"pageProps":{"session":null',
        '"pageProps":{"session":{"user":{"name":"Kheir Editz VIP","email":"kheireditzsupport@gmail.com","image":"https://lh3.googleusercontent.com/a/default-user=s96-c"},"expires":"2027-12-31T23:59:59.999Z"}'
      );

      // Client Auth Script: intercept client-side fetch in browser
      const clientInterceptorScript = `
<script>
(function() {
  window.__GOOGLE_FLOW_SESSION_ACTIVE__ = true;
  window.__NEXT_AUTH_USER__ = {
    name: "Kheir Editz VIP",
    email: "kheireditzsupport@gmail.com"
  };
  
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    let [resource, config] = args;
    config = config || {};
    config.headers = config.headers || {};

    if (typeof resource === 'string' && resource.includes('/api/auth/session')) {
      return new Response(JSON.stringify({
        user: { name: "Kheir Editz VIP", email: "kheireditzsupport@gmail.com", image: "https://lh3.googleusercontent.com/a/default-user=s96-c" },
        expires: "2027-12-31T23:59:59.999Z"
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    return originalFetch(resource, config);
  };
})();
</script>
`;

      // Inject base tag & client interceptor
      html = html.replace(
        '<head>',
        `<head>\n<base href="https://labs.google/">\n${clientInterceptorScript}\n<style>#gb, header .sign-in-btn, a[href*="accounts.google.com"], [data-testid="signin-button"] { display: none !important; }</style>`
      );

      return new Response(html, {
        status: response.status,
        headers: responseHeaders
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (err) {
    return new Response(`<h3>Cloudflare Flow Proxy Error: ${err.message}</h3>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
