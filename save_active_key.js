import fs from 'fs';

const key = "AIzaSyAcUG1NVjd2-FDmN1lt8oVDafy_OvfSLT0";

// Simpan ke settings.json
const settingsPath = '/data/data/com.termux/files/home/affiliate-ai-suite/data/settings.json';
let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {}

settings.geminiApiKey = key;
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

// Simpan ke .env
fs.writeFileSync('/data/data/com.termux/files/home/affiliate-ai-suite/.env', `GEMINI_API_KEY=${key}\nPORT=3000\n`);

console.log("KEY_AKTIF_BERHASIL_DISIMPAN!");
