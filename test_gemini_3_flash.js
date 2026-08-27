import fs from 'fs';

const key = "AIzaSyBH8W_HnTW9Q18wQGym2fb0EQwiLwmr9x8";

async function testGemini3() {
  const models = [
    "models/gemini-3-flash-preview",
    "models/gemini-2.5-flash-lite",
    "models/gemini-flash-latest"
  ];

  const prompt = "Commercial product photography of Indonesian woman holding skincare serum in cafe, photorealistic 8k";

  for (const m of models) {
    console.log(`\n=== Testing model: ${m} ===`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
        })
      });
      console.log(`Status ${m}:`, res.status);
      const data = await res.json();
      console.log("Response:", JSON.stringify(data).slice(0, 200));

      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            console.log("SUKSES_GENERATE_GAMBAR_ASLI_DENGAN_MODEL:", m);
            fs.writeFileSync('/sdcard/Download/gemini_official_image.jpg', Buffer.from(part.inlineData.data, 'base64'));
            return true;
          }
        }
      }
    } catch (e) {
      console.log(`Error ${m}:`, e.message);
    }
  }
}

testGemini3();
