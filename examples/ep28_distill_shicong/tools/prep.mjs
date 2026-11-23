// 按 film/shots.js 抽帧：node tools/prep.mjs [镜头id…]（不带参数=缺的才抽；带 id 强制重抽）→ film/seq/<id>/0001.jpg…、film/seqinfo.js
import vm from 'vm'; import fs from 'fs'; import { spawnSync } from 'child_process';
import { FF } from '../film/cfg.mjs';
const R = new URL('..', import.meta.url).pathname, F = R + 'film/';
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(F + 'timeline.js', 'utf8') + '\n' + fs.readFileSync(F + 'shots.js', 'utf8') + '\nthis.SH=SH;', ctx);
const only = process.argv.slice(2), info = {};
for (const s of ctx.SH) {
  if (s.m === 'img') continue;
  const dir = F + 'seq/' + s.id + '/', n = Math.ceil((s.b - s.a) * 30) + 2;
  const have = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
  if (only.includes(s.id) || (!only.length && have < n)) {
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const info0 = spawnSync(FF, ['-i', F + s.src], { encoding: 'utf8' }).stderr.match(/(\d{3,4})x(\d{3,4})/); const sw = +info0[1], shh = +info0[2];
    const eq = s.eq ? s.eq + ',' : '';
    let vf;
    if (s.m === 'full') { const ch = Math.round(shh * (s.ch || 1) / 2) * 2, w = Math.round(ch * 1080 / 1920 / 2) * 2, x = Math.max(0, Math.min(sw - w, Math.round(s.cx * sw / 1920 - w / 2)));
      vf = `${eq}crop=${w}:${ch}:${x}:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6${s.rate !== 1 ? `,setpts=(PTS-STARTPTS)/${s.rate}` : ''},fps=30`; }
    if (s.m === 'fill') vf = `${eq}fps=30,split[a][b];[a]scale=-2:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.04[bg];[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2`;
    if (s.m === 'rot') vf = `${eq}fps=30,transpose=1,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5`;
    if (s.m === 'blur') vf = `${eq}fps=30,scale=-2:1920,crop=1080:1920,boxblur=24:2`;
    const r = spawnSync(FF, ['-y', '-v', 'error', '-ss', String(s.ss), '-t', ((s.b - s.a) * s.rate + .5).toFixed(2), '-i', F + s.src, '-an', '-filter_complex', vf, '-frames:v', String(n), '-q:v', '3', dir + '%04d.jpg'], { encoding: 'utf8' });
    if (r.status) { console.error('FAIL', s.id, r.stderr); process.exit(1); }
    console.log('seq', s.id, fs.readdirSync(dir).length, '/', n);
  }
  info[s.id] = fs.readdirSync(dir).length;
}
fs.writeFileSync(F + 'seqinfo.js', 'const SEQN = ' + JSON.stringify(info) + ';\n');
console.log('PREP_DONE', Object.keys(info).length, 'shots', Object.values(info).reduce((a, b) => a + b, 0), 'frames');
