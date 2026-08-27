import fs from 'fs';

const key = "AIzaSyBH8W_HnTW9Q18wQGym2fb0EQwiLwmr9x8";

async function findWorkingGeminiImageModel() {
  const models = [
    "models/imagen-3.0-generate-002",
    "models/image-generation-001",
    "models/gemini-2.5-flash-image",
    "models/gemini-2.0-flash-exp",
    "models/gemini-2.5-flash"
  ];

  const prompt = "Commercial product photography of Indonesian woman holding skincare serum in cafe, photorealistic 8k";

  for (const m of models) {
    console.log(`\n=== Testing model: ${m} ===`);
    try {
      if (m.includes('imagen') || m.includes('image-generation')) {
        const url = `https://generativelanguage.googleapis.com/v1beta/${m}:predict?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: '9:16' }
          })
        });
        console.log(`Status ${m}:`, res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data).slice(0, 150));
      } else {
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
        console.log("Response:", JSON.stringify(data).slice(0, 150));
      }
    } catch (e) {
      console.log(`Error ${m}:`, e.message);
    }
  }
}

findWorkingGeminiImageModel();
