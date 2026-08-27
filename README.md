# 🎬 AffiliateGo — AI Storyboard Studio for E-Commerce & Short-Form Video

> **Platform AI Pembuat Skenario Storyboard 9:16 (Multi-Panel Grid), Video Motion Prompts, dan Naskah Voiceover Berbahasa Indonesia dengan Google Gemini Vision Auto-Analysis & Interactive Cropper.**

---

## 🌟 Daftar Fitur Utama (100% Sama Persis dengan Aplikasi & Web)

### 1. 🖼️ Upload & Interactive Smart Cropper Foto
- **Multi-Slot Upload Visual**:
  - 📦 **Foto Produk** (Rasio 1:1 Square)
  - 👤 **Foto Model / Talent** (Rasio 9:16 Portrait Vertikal)
  - 🏖️ **Foto Tempat / Lokasi** (Rasio 16:9 Landscape Sinematik)
- **Editor Cropper Interaktif**:
  - Pemotongan gambar presisi tinggi menggunakan library `Cropper.js`.
  - Pilihan rasio aspek dinamis (1:1, 9:16, 16:9, atau Freeform).
  - Kompresi gambar client-side otomatis ke resolusi optimal 512px JPEG medium quality untuk transmisi data cepat kilat (<100KB payload).
- **🖼️ Persistent Media Gallery**:
  - Foto yang dicrop otomatis tersimpan ke memori galeri lokal (`localStorage`).
  - Fitur *"Buka Galeri"* di setiap slot gambar untuk memilih dan memasang kembali foto lama tanpa perlu upload berulang kali.
  - Kelola galeri: Hapus foto individual atau bersihkan semua galeri.

---

### 2. 🧠 Google Gemini Multimodal Vision AI Auto-Analysis
- **Deteksi Cerdas Foto Real-Time**:
  - 🔍 **Analisa Foto Produk**: Gemini Vision membaca teks kemasan (packaging/brand/bottle) dan secara instan mengisi **Nama Produk** & merumuskan 2-3 poin **Keunggulan (USP)** dalam Bahasa Indonesia.
  - 👤 **Analisa Karakter Model**: Mendeteksi perkiraan usia, jenis kelamin, etnis, gaya busana, riasan wajah, dan otomatis mengisi kolom **Model / Talent**.
  - 🏖️ **Analisa Latar / Lokasi**: Mendeteksi pencahayaan ruangan, dekorasi, suasana ambient, dan mengisi kolom **Tempat / Lokasi Latar**.
- **Metode Pemicu Analisa**:
  - **Otomatis**: Langsung berjalan otomatis di latar belakang begitu foto selesai dicrop.
  - **Manual**: Tombol **`[ 🪄 Analisa Foto Gemini ]`** untuk menganalisa ulang semua foto yang terpasang.
  - **Pre-Generate**: Jika pengguna mengupload foto tanpa mengisi nama produk lalu menekan tombol *Generate*, Vision AI otomatis membaca foto terlebih dahulu.
- **Model Engine**:
  - Didukung jajaran model resmi Google Generative AI: `gemini-3.6-flash`, `gemini-2.5-flash`, `gemini-3-flash-preview`, dan `gemini-2.5-pro`.

---

### 3. 📝 100% Pure Storyboard Prompts Output (Bukan File Gambar)
Saat menekan tombol **`[ 🪄 Generate ]`**, AI merancang skrip dan formula prompt teks:
1. 🖼️ **Prompt Gambar Storyboard 9:16 (Multi-Panel Grid Matrix)**:
   - Formula prompt bahasa Inggris detail 8K photorealistic (2x2 Matrix, 2x3, 2x4, atau 1-Panel Single) yang menjaga konsistensi produk & karakter model.
   - Siap disalin dan dipaste ke Midjourney, Flux.1, Imagen 3, Stable Diffusion, atau Leonardo AI.
2. 🎥 **Prompt Video AI Generator (Motion Prompt)**:
   - Instruksi pergerakan kamera sinematik (Pan, Zoom, Tilt, Tracking Shot) untuk **Kling AI, Google Veo, Luma Dream Machine, dan Runway Gen-3**.
3. 🎙️ **Naskah Voiceover Audio Natural**:
   - Skrip percakapan santai, persuasif, dan berenergi positif khas top affiliate creator TikTok Shop & Shopee Video.
4. 📋 **1-Click Copy Actions**:
   - Tombol **`[ 📋 Salin Lengkap ]`** per Scene.
   - Tombol **`[ 📋 Salin Semua ]`** untuk menyalin seluruh skenario video sekaligus.

---

### 4. 🔑 Sistem Status API Key (Hijau / Merah Dinamis)
- **Tombol Status Header**:
  - 🟢 **Hijau Menyala (Emerald Pulse)**: API Key aktif dan tersimpan.
  - 🔴 **Merah Berkedip (Rose Pulse)**: API Key kosong atau belum dimasukkan.
- **Penyimpanan Lokal Privat (Zero Leak)**:
  - Disimpan langsung ke memori lokal browser/APK (`localStorage`) secara instan.
  - Tidak ditulis mentah di source code repositori sehingga **aman 100% dari pemindaian bot Google dan bebas dari pemblokiran/leaked**.
- **Manajemen Key**:
  - Modal dark-glass elegan untuk input API Key baru.
  - Tautan langsung ke [Google AI Studio](https://aistudio.google.com/app/apikey).
  - Tombol Show/Hide Password & Tombol Hapus Key.

---

### 5. 📜 Manajemen Riwayat Storyboard
- Riwayat skenario tersimpan otomatis secara rapi.
- Modal daftar riwayat dengan tombol:
  - 👁️ Buka & Muat Storyboard
  - 🗑️ Hapus Storyboard Tertentu
  - 🧹 **`[ 🗑️ Hapus Semua ]`** untuk membersihkan seluruh riwayat sekaligus.

---

## 🛠️ Panduan Menjalankan & Build

### 1. Menjalankan di Server Lokal / Web
```bash
# Clone repositori
git clone https://github.com/kheireditzz/AfiliGo.git
cd AfiliGo

# Install dependensi
npm install

# Jalankan server
npm start
```
Akses di browser melalui: `http://localhost:3000`

---

### 2. Membangun Aplikasi Android (APK) dengan Capacitor
```bash
# Sinkronisasi aset web ke Android
npx cap sync android

# Kompilasi debug APK via Gradle di Termux / Linux
cd android
./gradlew assembleDebug --no-daemon

# Lokasi Output APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📁 Struktur Proyek
```text
├── android/                   # Project native Android (Capacitor)
├── public/                    # Frontend Web Assets
│   ├── index.html             # UI Dashboard, Cropper Modal & Prompt Cards
│   ├── js/
│   │   └── app.js             # Logic Cropper, Vision AI, Gemini API & Storyboard
│   └── css/
├── server.js                  # Express backend & API proxy Google Generative Language
├── capacitor.config.json      # Konfigurasi Capacitor Android
├── package.json
└── README.md
```

---

## 🌐 Live URL & APK
- **Web App**: [https://affiliate-ai-suite.vercel.app](https://affiliate-ai-suite.vercel.app)
- **Official APK**: `/sdcard/Download/AfiliGo_AI_Suite_Official.apk`
