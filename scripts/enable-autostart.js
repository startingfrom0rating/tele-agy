import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export function enableWindowsAutoStart() {
  if (process.platform !== 'win32') return false;

  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const startupFolder = path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
  const vbsPath = path.join(startupFolder, 'Tele-AGY.vbs');

  // Format path for VBScript
  const safeRoot = projectRoot.replace(/\//g, '\\');

  const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "${safeRoot}"
WshShell.Run "node src/index.js", 0, False
`;

  try {
    fs.writeFileSync(vbsPath, vbsContent, 'utf8');
    console.log(`✅ Windows User-Session Startup shortcut created: ${vbsPath}`);
    return vbsPath;
  } catch (err) {
    console.error(`⚠️ Failed to create Startup shortcut: ${err.message}`);
    return null;
  }
}

if (process.argv[1] && process.argv[1].endsWith('enable-autostart.js')) {
  enableWindowsAutoStart();
}
