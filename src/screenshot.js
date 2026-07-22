import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import screenshotDesktop from 'screenshot-desktop';

export async function captureAllScreenshots() {
  const userDir = os.homedir();

  // Primary Windows User-Space Desktop Screen Capture
  if (process.platform === 'win32') {
    const targetPath = path.join(userDir, `tele_agy_snap_${Date.now()}.png`);
    try {
      const psScript = `
        [System.IO.Directory]::SetCurrentDirectory('${userDir.replace(/'/g, "''")}');
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $screens = [System.Windows.Forms.Screen]::AllScreens
        for ($i = 0; $i -lt $screens.Length; $i++) {
          $s = $screens[$i]
          $b = New-Object System.Drawing.Bitmap $s.Bounds.Width, $s.Bounds.Height
          $g = [System.Drawing.Graphics]::FromImage($b)
          $g.CopyFromScreen($s.Bounds.Left, $s.Bounds.Top, 0, 0, $b.Size)
          $outName = "${targetPath.replace(/'/g, "''")}".Replace('.png', "_$i.png")
          $b.Save($outName, [System.Drawing.Imaging.ImageFormat]::Png)
          $g.Dispose()
          $b.Dispose()
        }
      `;
      const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}`, { cwd: userDir });

      const snaps = [];
      for (let i = 0; i < 10; i++) {
        const p = targetPath.replace('.png', `_${i}.png`);
        if (fs.existsSync(p) && fs.statSync(p).size > 1000) {
          snaps.push({ path: p, name: `Monitor ${i + 1}`, width: 1920, height: 1080 });
        }
      }
      if (snaps.length > 0) return snaps;
    } catch (e) {
      // Fallback if PowerShell capture fails
    }
  }

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

  const targetPath = path.join(userDir, `tele_agy_snap_${Date.now()}.png`);
  const filename = await screenshotDesktop({ filename: targetPath });
  return [{ path: filename, name: 'Primary Display', width: 1920, height: 1080 }];
}

export async function captureScreenshot(outPath) {
  const snaps = await captureAllScreenshots();
  return snaps[0].path;
}
