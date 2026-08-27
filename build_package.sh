#!/bin/bash
set -e

APK_NAME="AfiliGo_AI_Storyboard_v3.0.apk"
DEST_PATH="/sdcard/Download/$APK_NAME"

echo "Mempersiapkan package Android WebApp Standalone PWA..."
cd /data/data/com.termux/files/home/affiliate-ai-suite

# Buat bundle zip yang kompatibel dengan package PWA / WebApp
rm -f "$DEST_PATH"
zip -r "$DEST_PATH" public/* server.js package.json data/ > /dev/null

echo "PACKAGE_BERHASIL_DISIMPAN_DI: $DEST_PATH"
ls -lh "$DEST_PATH"
