import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import screenshotDesktop from 'screenshot-desktop';

export async function captureScreenshot(outPath) {
  const targetPath = outPath || path.join(os.tmpdir(), `tele_agy_snap_${Date.now()}.png`);
  
  try {
    const filename = await screenshotDesktop({ filename: targetPath });
    if (!fs.existsSync(filename)) {
      throw new Error('Screenshot file was not created.');
    }
    const stats = fs.statSync(filename);
    if (stats.size < 1000) {
      throw new Error('Display returned an empty black frame due to background session isolation.');
    }
    return filename;
  } catch (err) {
    throw new Error(`Screenshot capture failed: ${err.message}`);
  }
}
