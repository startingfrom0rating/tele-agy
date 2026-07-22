import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import screenshotDesktop from 'screenshot-desktop';

export async function captureAllScreenshots() {
  const userDir = os.homedir();

  try {
    const displays = await screenshotDesktop.listDisplays();
    if (displays && displays.length > 0) {
      const results = [];
      for (let i = 0; i < displays.length; i++) {
        const d = displays[i];
        const targetPath = path.join(userDir, `tele_agy_snap_${i}_${Date.now()}.png`);
        try {
          const filename = await screenshotDesktop({ screen: d.id, filename: targetPath });
          if (fs.existsSync(filename) && fs.statSync(filename).size > 0) {
            results.push({
              path: filename,
              name: d.name || `Display ${i + 1}`,
              width: d.width || 1920,
              height: d.height || 1080
            });
          }
        } catch (e) {}
      }
      if (results.length > 0) return results;
    }
  } catch (e) {}

  // Fallback to default full-desktop capture
  const targetPath = path.join(userDir, `tele_agy_snap_${Date.now()}.png`);
  const filename = await screenshotDesktop({ filename: targetPath });
  return [{ path: filename, name: 'Primary Display', width: 1920, height: 1080 }];
}

export async function captureScreenshot(outPath) {
  const snaps = await captureAllScreenshots();
  return snaps[0].path;
}
