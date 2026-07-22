import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { stripAnsi } from './utils.js';

function getAgyExecutable() {
  if (process.platform === 'win32') {
    const localAgy = path.join(os.homedir(), 'AppData', 'Local', 'agy', 'bin', 'agy.exe');
    if (fs.existsSync(localAgy)) return localAgy;
    return 'agy.exe';
  }
  return 'agy';
}

export class AgyRunner {
  constructor({ cwd = process.cwd(), model = 'Gemini 3.6 Flash (High)', mode = 'accept-edits' } = {}) {
    this.cwd = cwd;
    this.model = model;
    this.mode = mode;
    this.process = null;
    this.onOutputCallback = null;
    this.onExitCallback = null;
  }

  getCwd() {
    return this.cwd;
  }

  setCwd(newCwd) {
    this.cwd = newCwd;
  }

  getModel() {
    return this.model;
  }

  setModel(newModel) {
    this.model = newModel;
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode) {
    this.mode = newMode;
  }

  isRunning() {
    return this.process !== null && !this.process.killed;
  }

  runCommand(promptText, onOutput, onExit) {
    if (this.isRunning()) {
      throw new Error('An AGY process is already running. Use /stop first.');
    }

    this.onOutputCallback = onOutput;
    this.onExitCallback = onExit;

    const args = ['--model', this.model, '--mode', this.mode, '--print', promptText];
    const cmd = getAgyExecutable();

    try {
      this.process = spawn(cmd, args, {
        cwd: this.cwd,
        env: { ...process.env, FORCE_COLOR: '0' }
      });
    } catch (err) {
      if (onExit) onExit(-1, err.message);
      return;
    }

    this.process.stdout.on('data', (data) => {
      const cleanStr = stripAnsi(data.toString());
      if (cleanStr && this.onOutputCallback) {
        this.onOutputCallback(cleanStr);
      }
    });

    this.process.stderr.on('data', (data) => {
      const cleanStr = stripAnsi(data.toString());
      if (cleanStr && this.onOutputCallback) {
        this.onOutputCallback(`[ERR] ${cleanStr}`);
      }
    });

    this.process.on('close', (code) => {
      this.process = null;
      if (this.onExitCallback) {
        this.onExitCallback(code);
      }
    });

    this.process.on('error', (err) => {
      this.process = null;
      if (this.onExitCallback) {
        this.onExitCallback(-1, err.message);
      }
    });
  }

  stop() {
    if (this.process) {
      this.process.kill('SIGINT');
      setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
          this.process = null;
        }
      }, 2000);
      return true;
    }
    return false;
  }
}
