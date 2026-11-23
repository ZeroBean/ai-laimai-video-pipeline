// node render.mjs stills t1 t2 … ｜ node render.mjs clip out.mp4 a b  —— 按成片时间出单帧 / 渲一段无声视频（30fps）
import { FF, CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
const dir = fileURLToPath(new URL('.', import.meta.url)); mkdirSync(dir + 'out', { recursive: true });
const [mode, ...args] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') console.log('console:', m.text()); });
await p.goto(new URL('index.html', import.meta.url).href);
await p.waitForFunction('window.READY === true', { timeout: 120000 });
const warm = () => p.evaluate(async () => { for (let t = 0; t < TOTAL; t += 1.2) render(t); await document.fonts.ready; await new Promise(r => setTimeout(r, 2500)); await document.fonts.ready; });
const settle = t => p.evaluate(async t => { render(t); await Promise.all([...document.images, ...document.querySelectorAll('image')].map(x => x.decode ? x.decode().catch(() => 0) : 0)); }, t);
await warm();
if (mode === 'stills') for (const t of args) { await settle(+t); await p.screenshot({ path: `${dir}out/still_${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 90 }); console.log('still', t); }
if (mode === 'clip') {
  const [out, a, c] = args, fps = 30, f0 = Math.round(+a * fps), f1 = Math.round(+c * fps);
  const ff = spawn(FF, ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-threads', '2', '-crf', '20', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = f0; i < f1; i++) { await settle(i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 95 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if ((i - f0 + 1) % 150 === 0) console.log(i - f0 + 1, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('CLIP_DONE', f1 - f0, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await b.close();
