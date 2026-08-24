// =========================================================================
// CLOUDFLARE WORKER DEEP PROXY & DIRECT PROJECT WORKSPACE FOR FLOW AI
// =========================================================================

const RAW_COOKIE_STRING = "SID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; __Secure-1PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; __Secure-3PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-uIEBRoVAUF8yKqJdAyiB6LOG7heeHsQ8iN50076; __Secure-3PSIDTS=AKEyXzUCBRPrcipSKhBfSh3qxE73z8WHkUf2Ubjjoqk4V6j-2TreO_qvST7Qhfb8coUuKxlO; __Secure-1PSIDTS=AKEyXzUCBRPrcipSKhBfSh3qxE73z8WHkUf2Ubjjoqk4V6j-2TreO_qvST7Qhfb8coUuKxlO; SSID=AqDRs-AHIWBNtU06r; HSID=AqDRs-AHIWBNtU06r; SAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; APISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; __Secure-1PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; __Secure-3PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; SIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; __Secure-1PSIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; __Secure-3PSIDCC=AKEyXzXwKLhyRlaO8_MkyRecgiHSZzRjES5ttbwcZwRczuKtAzQgHlsa-cpoaMiQSlurFgP2; AEC=AdJVEavk7ZGXLNiAVrKDeuD0Z34Hu_0WaiBDD9YLm5R1Tx7Rs91u6fvwoA; NID=534=StyELGiY6IOC7IxlW1rM4IsGuZC56MC2JMa-lqxCVZW8-za8JG33Q5X7WZIkfxFLImEOD5u1N2X29gxR1UXuyw2ia36dioS5voEMsF3s549JG_DQUCfsW9nzayZZUgUD1O62-7tO968rGnxf14Prj0IpZYD0a6LK6ZDBmnFVagfqX2R1gCG_ceaV4LI44y1XLW-Gmf_niH6hVUdUy56etJnM4RqRAARcXSMSi1TaXy7pJkkWj0WqPHuW3EpJkkWj0WqPHuW3ErcJJIJME-LeignHJjFL6VoxrK9_uEyI0ABfU-b7Exf79fAwdRiu4TNunXVU7Zy3GMrghecU4Kyyc2W_T6wo80VhixmKmJXcLPtlwFeRWfBIUKeL_H7IONPuT1YLbnj-5wbWrID-Ntg7LQce-bt8Ucet0DkUBo8wZHcqhlTnMRIvrXjo-dVdqirOKOMejzEKY0b_Mf6EVoaheyjaGv_5m00rsPCgRLLInV4qHSDsNrjXWsnxhjON7B2CAUI01ET1rLYABhagGkzRQRr8GsNE6N5yWqw7nusXPVXvCm4ZE4x2Amew9o56KtUOKhCDQbWzxEx1M_Ox2pl8pyo8IAYIgQ5dolo5EpBoGvSxMZBWg8qvLO0BHcQf5CcMA8g-8aZSX1dzpzP_I8_U32mpi7I0BHmXoloAg5l1IUiDx-yed7YJYzFd8FiqngLTM6dQIzYjRU52vyzwvdOiUDV8YqZ0MvyvZFDA";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const workerDomain = url.hostname;
  
  let targetPath = url.pathname;
  // If root or /flow, target the direct editor project tool
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

    // Rewrite cookie domain for user browser
    const individualCookies = RAW_COOKIE_STRING.split(';');
    for (const c of individualCookies) {
      const trimmed = c.trim();
      if (trimmed) {
        responseHeaders.append('Set-Cookie', `${trimmed}; Path=/; Domain=${workerDomain}; Secure; SameSite=None; Max-Age=2592000`);
      }
    }

    if (contentType.includes('text/html')) {
      let html = await response.text();
      
      // Rewrite assets to fetch through worker domain
      html = html.replace(/https:\/\/labs\.google/g, '');
      html = html.replace(/href="\/fx/g, `href="https://${workerDomain}/fx`);
      
      return new Response(html, {
        status: response.status,
        headers: responseHeaders
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (e) {
    return new Response('Worker Error: ' + e.message, { status: 500 });
  }
}
