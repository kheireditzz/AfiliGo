import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const sourceDir = '/data/data/com.termux/files/home/affiliate-ai-suite/flow-ai-extension';
const outputDir = '/data/data/com.termux/files/home/affiliate-ai-suite/public';
const outPath = path.join(outputDir, 'AffiliateGo-FlowAI-Extension.zip');

const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log('Zip package created successfully! Bytes:', archive.pointer());
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);
archive.directory(sourceDir, false);
archive.finalize();
