// =========================================================================
// CLOUDFLARE WORKER REVERSE PROXY FOR GOOGLE LABS FLOW AI
// =========================================================================

const GOOGLE_FLOW_COOKIES = "SID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-ulEBRoVAUF8yKqJdAyiB6L0G7heeHsQ8iN50076; __Secure-1PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-ulEBRoVAUF8yKqJdAyiB6L0G7heeHsQ8iN50076; __Secure-3PSID=g.a000BwnG1-bTB2u2qBbOJW32VMmj8k860-MK9A6P7D46QcvOPI9QmWBj_SPt3QT-tK1EbWnT5QACgYKAYESARISFQHGX2Mit4wtvpjPdFJh-XzM-ulEBRoVAUF8yKqJdAyiB6L0G7heeHsQ8iN50076; __Secure-3PSIDTS=AKEyXzV--udVHs3xd3EFgmqqEXgng2oUTwWGUaUKQoufA0H28GWcccE3e1ETnKny9EYpGs0b; __Secure-1PSIDTS=AKEyXzV--udVHs3xd3EFgmqqEXgng2oUTwWGUaUKQoufA0H28GWcccE3e1ETnKny9EYpGs0b; SSID=AqDRs-AHIWBNtU06r; HSID=AqDRs-AHIWBNtU06r; SAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; APISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; __Secure-1PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; __Secure-3PAPISID=B4DqedTKzNzBNr0C/A7HYeMcBZTWviJetR; SIDCC=AKEyXzViE6pWfevgXMrcPQTUJGejf_4pNbznw91w7qP3kCGrgD04AoYV9JPb-BI1yw8S_w7k; __Secure-1PSIDCC=AKEyXzViE6pWfevgXMrcPQTUJGejf_4pNbznw91w7qP3kCGrgD04AoYV9JPb-BI1yw8S_w7k; __Secure-3PSIDCC=AKEyXzViE6pWfevgXMrcPQTUJGejf_4pNbznw91w7qP3kCGrgD04AoYV9JPb-BI1yw8S_w7k; AEC=AdJVEavk7ZGXLNiAVrKDeuD0Z34Hu_0WaiBDD9YLm5R1Tx7Rs91u6fvwoA; NID=534=SNrc5JwG5Na1IUjI0Y2FBr7Mb-FcNI4FaOApnyc6kM567C8v-aXX56FUKQXOa_YSN4nAS-0zV6X96CfCoDt-IQO8jBGPH9ay2KUIsAhFFnA8kV6-Y9LBJq5xnkb-bXX3deM0ee7vKJD8Y3Zjm61IEMKsylKPrEq4b6FN1QmSOBiV3hyY5uBqSZCSE3RQC4_iPzsddrzwnKAZLFHL1u4WgBsQI6Axb4pTiM5-vGY7Fg52cjpX-Gmy_8DOkxVXWXtXHt7czqjba8HphSyhnscnHBU_z-xa5tXEalbu-LPrOZv-tZ-yB4QHilwPIDITfLAzdnMBU9S2mURhPgEIT3KYtvg4skWNmzh5qfffeEEXyuGDZthQDV7_GpXX8sleHH07uO0Vzfg72wgyZ-qfX3hYs-4q1tsExW6RcRP1V0o70bAj8-RDm6DMy2W94Ti2csUUpe-Hba8AhjShMOFMuaGiPPOxOY7NVBF5-03Pjq0lxkDaX3s3DIbzLzICPloH3r5L3lwvF9MPe7egJ5LVXvXcMhyYMt_nj-tJEmpB3WABKj3KsdvRSnN4OanZqeBFG-hD_09B2EyLmXkG8V83PnvaDiU5ILQuHKi-MnkG3ugP0Jiz8LEaj36-Kwt8fh_zNHy6Zes4eoEu_h9dpE2mcFOt5Xem66le3aAq8IOIKceySROwcprhcuJFrhZfNwu2zoG6acqz7E91EgwX0tAYzbLfNQ";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Default route to Google Labs Flow
    let targetPath = url.pathname;
    if (targetPath === '/' || targetPath === '') {
      targetPath = '/fx/id/tools/flow';
    }

    const targetUrl = new URL(`https://labs.google${targetPath}${url.search}`);

    // Clone and prepare headers for Google
    const headers = new Headers(request.headers);
    headers.set('Host', 'labs.google');
    headers.set('Referer', 'https://labs.google/fx/id/tools/flow');
    headers.set('Origin', 'https://labs.google');
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    headers.set('Cookie', env.GOOGLE_FLOW_COOKIES || GOOGLE_FLOW_COOKIES);
    headers.set('Sec-Fetch-Site', 'same-origin');
    headers.set('Sec-Fetch-Mode', 'cors');
    headers.set('Sec-Fetch-Dest', 'empty');

    // Handle OPTIONS Preflight
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

      // Inject HTML header rewrite and auth persistence
      if (contentType.includes('text/html')) {
        let html = await response.text();
        html = html.replace(
          '<head>',
          `<head>\n<base href="https://labs.google/">\n<style>#gb, header .sign-in-btn, a[href*="accounts.google.com"] { display: none !important; }</style>`
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
    } catch (e) {
      return new Response('Cloudflare Worker Proxy Error: ' + e.message, { status: 500 });
    }
  }
};
