import fs from 'fs';

const key = "AIzaSyAcUG1NVjd2-FDmN1lt8oVDafy_OvfSLT0";

async function testKey() {
  console.log("Menguji Gemini API Key Baru (Free Tier)...");
  const prompt = "Commercial product photography of a luxury wrist watch on aesthetic wooden table, modern warm studio lighting, 8k resolution, photorealistic";

  // 1. Coba models/gemini-2.5-flash-image
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    });

    console.log("Status response:", res.status);
    const data = await res.json();
    
    if (res.ok && data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync('/sdcard/Download/gemini_generated_jam_tangan.jpg', buf);
          console.log(">>> BERHASIL_GENERATE_GAMBAR_ASLI_DARI_GOOGLE_GEMINI! <<<");
          return true;
        }
      }
    } else {
      console.log("Pesan Gemini API:", JSON.stringify(data.error));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testKey();
