// 第28期全片：render(t) 按成片时间画一帧。视频帧在 seq/<镜头id>/NNNN.jpg（shots.js），其余是网页原件 + 自绘。
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), eo = x => 1 - Math.pow(1 - cl(x), 3), eio = x => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, pg = (t, a, d) => cl((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k, pad4 = n => String(n).padStart(4, '0');
const CAPC = { o: '#F29A74', g: '#A6E03A', y: '#FFD43B' };
function FR(id, t, hold) { const s = SHID[id], n = SEQN[id]; let tt = t - s.a; if (hold !== undefined) tt = Math.min(tt, hold); return `seq/${id}/${pad4(cl(Math.floor(tt * 30 + 1e-6), 0, n - 1) + 1)}.jpg`; }
const PP = (id, t) => { const s = SHID[id]; return cl((t - s.a) / (s.b - s.a)); };
// 满幅视频帧 + 缓慢推近
function vid(id, t, o = {}) { const z = (o.z0 || 1) + (o.push === undefined ? .06 : o.push) * eo(PP(id, t));
  img(root, FR(id, t, o.hold), { left: 0, top: 0, width: W + 'px', height: H + 'px', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: o.org || '50% 45%', filter: o.f || 'none' });
  if (o.shade !== 0) div(root, { left: 0, right: 0, bottom: 0, height: '560px', background: `linear-gradient(rgba(0,0,0,0),rgba(0,0,0,${.38 * (o.shade || 1)}))` });
  div(root, { left: 0, right: 0, top: 0, height: '220px', background: 'linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,0))' }); }
// 网页原件：按时间缓推/缓移
function web(src, t, a, b, o) { const p = eo(pg(t, a, b - a)), k = lerp(o.k0 || 1, o.k1 || o.k0 || 1, p);
  const f = div(root, { left: 0, top: (o.top || 0) + 'px', width: W + 'px', height: (o.h || H) + 'px', overflow: 'hidden', background: '#fff', zIndex: o.z || 1 });
  const im = img(f, src, { left: '0px', top: '0px', width: o.iw + 'px', transformOrigin: '0 0', transform: `translate(${lerp(o.x0, o.x1 === undefined ? o.x0 : o.x1, p)}px,${lerp(o.y0, o.y1 === undefined ? o.y0 : o.y1, p)}px) scale(${k})` });
  return { f, X: x => lerp(o.x0, o.x1 === undefined ? o.x0 : o.x1, p) + x * k * o.iw / (o.nat || 1080), Y: y => (o.top || 0) + lerp(o.y0, o.y1 === undefined ? o.y0 : o.y1, p) + y * k * o.iw / (o.nat || 1080) }; }
// 荧光笔扫过（t0 起，从左到右）
function marker(t, t0, x, y, w, h, col, o = {}) { if (t < t0) return; const p = eo(pg(t, t0, o.d || .35));
  div(root, { left: x + 'px', top: y + 'px', width: w * p + 'px', height: h + 'px', background: col, opacity: o.a || .55, mixBlendMode: 'multiply', borderRadius: '4px', zIndex: o.z || 4 }); }
function boxT(t, t0, x, y, w, h, col, o = {}) { if (t < t0) return; const p = eo(pg(t, t0, .3));
  div(root, { left: x - 8 + 'px', top: y - 8 + 'px', width: w + 16 + 'px', height: h + 16 + 'px', border: `6px solid ${col}`, borderRadius: '10px', opacity: p, transform: `scale(${1.25 - .25 * p})`, zIndex: 9 }); }
function tagT(t, t0, x, y, s, o = {}) { if (t < t0) return; const p = eo(pg(t, t0, .3)); const e = div(root, { left: x + 'px', top: y + 'px', padding: '8px 18px', borderRadius: '10px', background: o.dark ? 'rgba(0,0,0,.5)' : C.ink, font: `700 26px ${ZH}`, color: '#fff', opacity: p, transform: `translateY(${16 * (1 - p)}px)`, zIndex: 20, whiteSpace: 'nowrap' }, s); return e; }
function stampT(t, t0, x, y, s, col, o = {}) { if (t < t0) return; const p = eo(pg(t, t0, .22)); const e = stamp(x, y, s, col, o); e.style.opacity = p; e.style.transform = `rotate(${o.rot || -8}deg) scale(${1.6 - .6 * p})`; }
function bigT(t, t0, x, y, html, o = {}) { if (t < t0) return null; const p = eo(pg(t, t0, o.d || .25));
  return div(root, { left: x + 'px', top: y + 'px', width: (o.w || 1000) + 'px', textAlign: o.al || 'left', font: `${o.fw || 900} ${o.fs || 120}px/${o.lh || 1.1} ${o.ff || ZH}`, color: o.col || '#fff', webkitTextStroke: o.st === 0 ? '0' : `${o.st || 12}px #111317`, paintOrder: 'stroke fill', opacity: p, transform: `scale(${1 + (o.kk === undefined ? .15 : o.kk) * (1 - p)})`, transformOrigin: o.org || '50% 50%', zIndex: o.z || 12, whiteSpace: 'nowrap', letterSpacing: (o.ls || 0) + 'px' }, html); }
const num = (t, t0, v, d = .8) => Math.round(v * eo(pg(t, t0, d)));
// 字幕：按 TL 的屏
function caps(t) { for (const L of TL) for (let i = 0; i < L.scr.length; i++) { const s = L.scr[i], nx = L.scr[i + 1], end = nx ? nx.t : L.e + .22;
  if (t >= s.t && t < end) { caption(s.p.map(([x, k]) => k ? `<span style="color:${CAPC[k]}">${x}</span>` : x).join('')); return; } } }

// ===== 时间轴（世界坐标 = 关键帧 KF20 的全景坐标；相机 cam={x,y,s}）=====
const WX = d => 150 + (d - 1) / (doy(11, 30) - 1) * 870, LY = { mm: 720, ds: 870, zp: 1020, qw: 1170, km: 1320 };
function camAt(t) { const K = [[S(11), 3.4, WX(doy(7, 21)), 960], [S(12) - .2, 1.7, WX(doy(7, 21)) - 120, 930], [T0(12, 1) + .4, 1, 585, 1010], [S(13) - .1, 1, 585, 1010], [S(13) + 1.1, 1.42, WX(doy(4, 1)), 700], [S(14) - .4, 1.48, WX(doy(7, 25)), 690],
  [S(14) + .9, 1.55, WX(doy(8, 30)), 935], [S(15) - .1, 1.55, WX(doy(9, 15)), 940], [S(16) - .1, 1.45, WX(doy(7, 10)), 1230], [T0(16, 2) - .4, 1.45, WX(doy(8, 1)), 1220], [S(17) - .3, 1.45, WX(doy(8, 20)), 1240], [S(17) + .9, 1, 585, 1010], [S(18), 1.02, 585, 1010]];
  let i = 0; while (i < K.length - 1 && t > K[i + 1][0]) i++; if (i >= K.length - 1) return { s: K[i][1], x: K[i][2], y: K[i][3] };
  const [a, s0, x0, y0] = K[i], [b, s1, x1, y1] = K[i + 1], k = eio((t - a) / (b - a)); return { s: lerp(s0, s1, k), x: lerp(x0, x1, k), y: lerp(y0, y1, k) }; }
function drawTL(t, cam, o) { paper();
  const P = (x, y) => [(x - cam.x) * cam.s + 540, (y - cam.y) * cam.s + 960];
  const el = svgRoot(), sp = x => x * Math.sqrt(cam.s);
  const unf = o.unfold === undefined ? 1 : o.unfold;  // 泳道展开进度
  const axT = o.axisT === undefined ? 1 : o.axisT;   // 轴线长出来
  // 月份刻度
  for (let m = 1; m <= 11; m++) { const [x, y0] = P(WX(doy(m, 1)), 620), [, y1] = P(0, 1400); if (x < -40 || x > 1120) continue;
    el('line', { x1: x, x2: x, y1: y0, y2: y1, stroke: C.line, 'stroke-width': 2, 'stroke-dasharray': '3 9', opacity: unf });
    txt(el, x + 6, y1 + 34, m + '月', { fs: 24, c: C.dim, a: 'start', fw: 700, op: unf }); }
  // 今天
  const xtW = WX(TODAY) + (o.todayShift || 0), [xt, yt0] = P(xtW, 600), [, yt1] = P(0, 1410);
  if (unf > 0) { el('line', { x1: xt, x2: xt, y1: yt0, y2: yt1, stroke: C.ink, 'stroke-width': 4, opacity: unf });
    div(root, { left: Math.min(xt - 78, 900) + 'px', top: Math.max(yt0 - 62, 150) + 'px', width: '156px', textAlign: 'center', padding: '7px 0', borderRadius: '10px', background: C.ink, color: '#fff', font: `800 27px ${ZH}`, zIndex: 9, opacity: unf }, o.todayLabel || '今天 11.23'); }
  LANES.forEach((L, i) => { const ly = LY[L.k], lu = cl(unf * 5 - i); if (lu <= 0) return;
    const op = (o.focus && !o.focus.includes(L.k) ? .22 : 1) * lu; const g = el('g', { opacity: op });
    const [xa, y] = P(WX(1), ly), [xb] = P(WX(TODAY), ly);
    el('line', { x1: xa, x2: lerp(xa, xb, eo(lu)), y1: y, y2: y, stroke: '#AEB3AB', 'stroke-width': 4 }, g);
    txt(el, Math.max(18, xa - 120 * cam.s + 0), y - 26, L.name, { fs: 28, a: 'start', fw: 900, op });
    // 还在等（斜纹）
    if (o.wait && o.wait[L.k] !== undefined && t >= o.wait[L.k][1]) { const [d, t0, lab] = o.wait[L.k], gp = eo(pg(t, t0, 1.0)); const [x0] = P(WX(d), 0);
      el('rect', { x: x0 + 12, y: y - 13, width: Math.max(0, (xt - x0 - 24) * gp), height: 26, rx: 8, fill: 'url(#hatch)' }, g);
      if (lab && t >= t0 + .2) div(root, { left: ((x0 + xt) / 2 - 110) + 'px', top: (y + 22) + 'px', width: '220px', textAlign: 'center', font: `900 ${o.wfs || 40}px ${EN}`, color: C.or, zIndex: 9, opacity: op * eo(pg(t, t0 + .2, .3)) }, `${num(t, t0 + .2, lab, .8)}<span style="font:900 ${(o.wfs || 40) * .6}px ${ZH}"> 天</span>`); }
    // 未来虚线
    if (o.future && t >= o.future) { const fp = eo(pg(t, o.future, 1.2)); el('line', { x1: xt, x2: xt + 70 * fp, y1: y, y2: y, stroke: C.ink, 'stroke-width': 4, 'stroke-dasharray': '8 10', opacity: .7 }, g);
      if (fp > .6) txt(el, xt + 70 * fp + 20, y + 12, '?', { fs: 40 + 10 * Math.max(0, Math.sin((t - o.future) * 6 - i)), fw: 900, c: C.or, op: (fp - .6) / .4 }); }
    L.pts.forEach(([d, lab, big], j) => { const ap = o.ptT ? o.ptT(L.k, j, d) : 0; if (t < ap) return; const pp = eo(pg(t, ap, .3)); const [x] = P(WX(d), ly);
      const r = (big ? 13 : 8) * Math.sqrt(cam.s) * (1 + .6 * (1 - pp));
      if (big) { el('circle', { cx: x, cy: y, r, fill: C.ink, filter: 'url(#sh)' }, g); el('circle', { cx: x, cy: y, r: r * .42, fill: '#fff' }, g); }
      else el('circle', { cx: x, cy: y, r, fill: C.paper, stroke: C.ink, 'stroke-width': 3.5 }, g);
      if (o.labels && lab && (!o.focus || o.focus.includes(L.k))) txt(el, x, y + 30 + 14 * cam.s, lab, { fs: 21 + 3 * cam.s, fw: big ? 800 : 500, c: big ? C.ink : C.sub, en: true, op: op * pp }); });
  });
  return { el, P, xt };
}
// 发布页小海报：从发布点弹出来，挂一根虚线
function poster(t, t0, P, d, lane, src, dx, dy, w, h, rot) { if (t < t0) return; const p = eo(pg(t, t0, .35)); const [x, y] = P(WX(d), LY[lane]);
  const el = svgRoot(); el('path', { d: `M${x} ${y - 14} L${x + dx} ${y + dy + h / 2}`, stroke: C.ink, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '4 6', opacity: p });
  const b = thumb(src, x + dx - w / 2, y + dy - h / 2, w, h, { rot, iw: w * 1.6, ix: -w * .3, iy: -4 }); b.style.opacity = p; b.style.transform = `rotate(${rot}deg) scale(${.4 + .6 * p})`; b.style.zIndex = 10; }
function flagT(t, t0, P, d, date, lab, col, lx, ly, top, o = {}) { if (t < t0) return; const p = eo(pg(t, t0, .35)); const el = svgRoot(); const [x, ya] = P(WX(d), 620), [, yb] = P(0, 1340);
  el('line', { x1: x, x2: x, y1: ya, y2: ya + (yb - ya) * p, stroke: col, 'stroke-width': 3, 'stroke-dasharray': '10 8', opacity: .9 });
  const ay = top ? ya : yb; el('circle', { cx: x, cy: ay, r: 9, fill: col }); el('path', { d: `M${x} ${ay} L${lx} ${top ? ly + 70 : ly - 8}`, stroke: col, 'stroke-width': 3, fill: 'none', opacity: p });
  div(root, { left: (lx - 82) + 'px', top: (ly + (top ? -30 : 30) * (1 - p)) + 'px', width: '164px', textAlign: 'center', padding: '6px 0', borderRadius: '10px', background: col, font: `900 26px/1.2 ${ZH}`, color: '#fff', zIndex: 11, opacity: p, boxShadow: o.glow ? `0 0 ${24 * o.glow}px ${col}` : 'none' }, `${date}<br><span style="font-weight:700;font-size:22px">${lab}</span>`); }

// ===== 各镜头 =====
const D = {};
D.h1 = t => { vid('h1', t, { push: .1 }); };
D.h2 = t => { vid('h2', t, { push: .1 }); };
D.h3 = t => { vid('h3', t, { push: .1 }); };
D.h4 = t => { const hold = .45, fz = t - SHID.h4.a > hold; vid('h4', t, { push: fz ? .0 : .08, hold, f: fz ? 'saturate(.2) brightness(.55)' : 'none', z0: fz ? 1.08 - .05 * eo(pg(t, SHID.h4.a + hold, .6)) : 1 });
  if (fz) div(root, { inset: 0, border: '14px solid #fff', opacity: .9 * (1 - pg(t, SHID.h4.a + hold, .25)), zIndex: 3 });
  if (fz) div(root, { left: 0, right: 0, top: '980px', height: '420px', background: 'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.55) 30%,rgba(0,0,0,.55) 70%,rgba(0,0,0,0))', zIndex: 4 });
  bigT(t, T0(1, 1) + .25, 40, 1080, `不让学了<span style="color:${CAPC.o}">？</span>`, { fs: 170, w: 1000, al: 'center' }); };
D.anth = t => { vid('anth', t, { push: .08 }); tagT(t, S(2) + .25, 56, 1330, 'Anthropic 旧金山 · 做 Claude', { dark: 1 }); };
D.oai = t => { vid('oai', t, { push: .08 }); tagT(t, T0(2, 2) + .2, 56, 1330, 'OpenAI 旧金山 · 做 ChatGPT', { dark: 1 }); };
D.policy = t => { root.style.background = '#fff'; const a = SHID.policy.a, b = SHID.policy.b;
  const w = web('img/web_openai_policy_zh.png', t, a, b, { iw: 2400, x0: -620, y0: -1000, y1: -1180 });
  // 高亮（原图已就地换中文）再扫一道橙色
  marker(t, T0(2, 4) - .1, w.X(370), w.Y(639), w.X(757) - w.X(370), w.Y(668) - w.Y(639), C.or, { a: .35 });
  marker(t, T0(2, 4) + .25, w.X(370), w.Y(680), w.X(709) - w.X(370), w.Y(709) - w.Y(680), C.or, { a: .35 });
  div(root, { left: 0, right: 0, top: 0, height: '230px', background: 'linear-gradient(#fff 45%,rgba(255,255,255,0))', zIndex: 5 });
  div(root, { left: 0, right: 0, bottom: 0, height: '520px', background: 'linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.95) 50%)', zIndex: 5 });
  tagT(t, a, 56, 150, 'OpenAI 使用政策 · Training and developing models');
  stampT(t, T0(2, 5) - .1, 600, 1250, '11.20 生效', C.or, { fs: 50, rot: -7 }); };
// Claude 界面（示意）：思考过程展开 → 折叠成一行摘要
D.claude = t => { root.style.background = '#F5F4EE'; const a = S(3), col = T0(3, 1) - .2, cp = eo(pg(t, col, .45));
  div(root, { left: '260px', right: '60px', top: '250px', padding: '24px 30px', borderRadius: '26px', background: '#E9E6DC', font: `500 38px/1.45 ${ZH}`, color: '#2B2B2B' }, '帮我写一个排课程序，要能处理冲突');
  const ph = lerp(820, 96, cp), box = div(root, { left: '60px', right: '60px', top: '470px', height: ph + 'px', borderRadius: '20px', border: '2px solid #D9D5C8', background: '#FBFAF6', overflow: 'hidden' });
  div(box, { left: '28px', top: '26px', font: `700 34px ${ZH}`, color: '#6B675E' }, cp < .5 ? '▾ 思考过程' : '▸ 已思考 14 秒 · 摘要');
  const lines = ['先看约束：老师、教室、时间段三类资源…', '冲突检测可以用区间树，复杂度 O(n log n)…', '但如果课程数不多，直接两两比较更简单…', '再考虑优先级：必修课先排，选修课后排…', '回溯会不会太慢？先估一下规模…', '边界情况：跨天课程、同一老师连堂…', '决定：贪心 + 局部回溯，先写数据结构…', '再检查一遍输入格式…'];
  const shown = Math.floor((t - a) / .17);
  lines.forEach((s, i) => { if (i > shown) return; div(box, { left: '28px', right: '28px', top: (96 + i * 84) + 'px', font: `400 33px/1.4 ${ZH}`, color: '#8A867C', opacity: (1 - cp) * cl((t - a - i * .17) / .15) }, s); });
  div(root, { left: '60px', right: '60px', top: (470 + ph + 40) + 'px', font: `500 38px/1.55 ${ZH}`, color: '#2B2B2B', opacity: eo(pg(t, col + .25, .3)) }, '好的，下面是一个能处理冲突的排课程序……');
  if (cp > .3) { const ry = 470 + ph / 2; div(root, { left: '40px', top: (ry - 50) + 'px', width: '1000px', height: '100px', border: `6px solid ${C.or}`, borderRadius: '24px', opacity: eo(pg(t, col + .15, .3)), zIndex: 6 }); }
  mock(56, 180);
  const qt = col + .55; if (t >= qt) { const p = eo(pg(t, qt, .4)); const f = div(root, { left: '0px', top: (1120 + 300 * (1 - p)) + 'px', width: W + 'px', height: '400px', overflow: 'hidden', boxShadow: '0 -20px 50px rgba(0,0,0,.18)', zIndex: 8, background: '#fff' });
    img(f, 'img/web_anth_oct_reason_zh.png', { left: '-60px', top: (-470 - 40 * pg(t, qt, 1.5)) + 'px', width: '1300px' }); tagT(t, qt + .1, 56, 1080, 'Anthropic 官方博客 · 2026-10-12'); } };
// Anthropic 10-12 标题 → "蒸馏"
D.octt = t => { root.style.background = '#FAF9F5'; const a = S(4);
  const w = web('img/web_anth_oct_title_zh.png', t, a, S(5), { iw: 1500, x0: -20, y0: 100, k1: 1.1, x1: -60, y1: 40 });
  if (t < S(5)) marker(t, a + .15, w.X(46), w.Y(186), w.X(443) - w.X(46), w.Y(233) - w.Y(186), C.or, { a: .3 });
  const bt = AT(4, '蒸馏') - .1;
  if (t >= bt) { const p = eo(pg(t, bt, .3)), up = eo(pg(t, S(5) - .05, .45));
    div(root, { inset: 0, background: '#FAF9F5', opacity: .92 * p, zIndex: 6 });
    bigT(t, bt, 40, lerp(800, 330, up), '蒸馏', { fs: lerp(300, 150, up), col: C.or, st: 0, w: 1000, al: 'center', z: 9 });
    if (t >= S(5)) { const q = eo(pg(t, S(5) + .1, .45)); div(root, { left: '120px', right: '120px', top: lerp(1900, 700, q) + 'px', height: '640px', borderRadius: '34px', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,.14)', zIndex: 8 }); } }
  if (t < S(5)) tagT(t, a + .1, 56, 150, 'Anthropic 官方博客 · 2026-10-12'); };
// 师傅答题 → 撕成纸条
const QA = ['进水管每小时可注入水池容量的 1/3，', '出水管每小时会放掉 1/5。', '每小时净进水 1/3 − 1/5 = 2/15，', '注满要 7.5 小时。'];
const TEAR = `polygon(0% 6%,3% 0%,7% 5%,11% 1%,16% 6%,21% 0%,26% 4%,31% 1%,37% 6%,42% 0%,48% 5%,54% 1%,60% 6%,66% 0%,72% 4%,78% 1%,84% 6%,90% 0%,95% 5%,100% 1%,100% 94%,96% 100%,91% 95%,85% 100%,79% 94%,73% 99%,67% 95%,61% 100%,55% 94%,49% 99%,43% 95%,37% 100%,31% 94%,25% 99%,19% 95%,13% 100%,7% 94%,2% 99%,0% 95%)`;
function strip(x, y, s, rot, o = {}) { return div(root, { left: x + 'px', top: y + 'px', padding: '22px 36px', background: '#FBF7F0', clipPath: TEAR, transform: `rotate(${rot}deg) scale(${o.k || 1})`, font: `700 ${o.fs || 44}px ${ZH}`, color: C.or, zIndex: o.z || 6, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.25))', opacity: o.op === undefined ? 1 : o.op, whiteSpace: 'nowrap' }, s); }
D.teach = t => { paper(); const a = S(6), b2 = T0(6, 2);
  bigT(t, 0, 40, 200, '蒸馏', { fs: 110, col: C.or, st: 0, w: 1000, al: 'center', kk: 0 });
  const bx = div(root, { left: '60px', right: '60px', top: '380px', height: '980px', borderRadius: '34px', background: '#fff', boxShadow: '0 30px 70px rgba(0,0,0,.14)', zIndex: 4 });
  const Qs = ['进水管 3 小时注满，出水管 5 小时放完，同时开几小时注满？', '一件商品先涨价 20% 再降价 20%，现在比原价便宜多少？', '甲乙两人相向而行，几分钟后相遇？', '一个正方形对角线长 10，面积是多少？'];
  const qi = t < b2 ? 0 : 1 + Math.min(2, Math.floor((t - b2) / .38));
  div(bx, { right: '36px', top: '34px', maxWidth: '78%', padding: '18px 28px', borderRadius: '26px', background: '#EEEFEC', font: `500 34px/1.4 ${ZH}`, color: '#3A3F46' }, Qs[qi]);
  div(bx, { left: '36px', top: '230px', display: 'flex', alignItems: 'center', gap: '14px', font: `800 34px ${ZH}`, color: C.or }, `<span style="display:inline-block;width:42px;height:42px;border-radius:50%;background:${C.or}"></span>更强的模型`);
  if (t < b2) { const n = (t - a - .2) / .05; let left = n; QA.forEach((s, i) => { const k = Math.max(0, Math.min(s.length, Math.floor(left))); left -= s.length; if (k > 0) div(bx, { left: '36px', right: '36px', top: (310 + i * 74) + 'px', font: `600 40px/1.5 ${ZH}`, color: C.or }, s.slice(0, k)); }); }
  stampT(t, T0(6, 1) + .1, 640, 600, '师傅', C.or, { fs: 70, rot: -10, z: 9 });
  if (t >= b2) { // 纸条一张张撕下来往下飞
    QA.forEach((s, i) => { const t0 = b2 + i * .26, p = pg(t, t0, .55), y = 690 + i * 74 + 900 * p * p, r = (i % 2 ? 1 : -1) * 6 * p;
      if (t < t0) div(bx, { left: '36px', right: '36px', top: (310 + i * 74) + 'px', font: `600 40px/1.5 ${ZH}`, color: C.or }, s);
      else strip(60 + i * 10, y, s, r, { fs: 38, z: 8 }); });
    for (let j = 0; j < 3; j++) { const t0 = b2 + .4 + j * .3; if (t < t0) continue; const p = pg(t, t0, .7); strip(100 + 60 * j, 700 + 900 * p * p, ['甲乙每分钟共走 140 米，', '涨跌后是原价的 96%，', '面积 = 10 × 10 ÷ 2 = 50。'][j], (j - 1) * 5 * p, { fs: 36, z: 8, op: .95 }); } } };
// 练习册（实拍旋转）上贴纸条
D.book = t => { vid('book', t, { push: .07, shade: .6 }); const a = SHID.book.a;
  QA.forEach((s, i) => { const t0 = a + i * .17, p = eo(pg(t, t0, .3)); if (t < t0) return;
    strip(150 + (i % 2) * 26, 800 + i * 140 - 260 * (1 - p), s, [-2.5, 1.8, -1.2, 2.4][i], { k: 1.25 - .25 * p, op: p }); });
  for (const [x, y, r, i] of [[120, 780, -28, 0], [760, 920, 24, 1], [130, 1210, -22, 3]]) if (t > a + i * .17 + .25) div(root, { left: x + 'px', top: y + 'px', width: '130px', height: '44px', background: 'rgba(235,228,205,.75)', transform: `rotate(${r}deg)`, zIndex: 7 });
  const hp = pg(t, a + .35, .5); div(root, { left: '330px', top: '560px', font: `400 170px ${HAND}`, color: '#1F2A44', transform: 'rotate(-4deg)', zIndex: 8, clipPath: `inset(0 ${100 - 100 * hp}% 0 0)` }, '教材');
  if (t > a + .75) div(root, { left: '680px', top: '632px', font: `400 64px ${HAND}`, color: C.or, transform: 'rotate(-4deg)', zIndex: 8, opacity: eo(pg(t, a + .75, .2)) }, '第 1 册');
  const n = num(t, a + .55, 80, .8); if (t > a + .55) div(root, { right: '70px', top: '1350px', textAlign: 'right', zIndex: 9 }, `<div style="font:900 132px/1 ${EN};color:${C.or};-webkit-text-stroke:10px #fff;paint-order:stroke fill">${n}<span style="font:900 84px ${ZH}"> 万条</span></div>`);
  tagT(t, a + .8, 560, 1500, 'DeepSeek-R1 论文：80 万条样本'); };
// 小模型答出橙字
D.student = t => { paper(); const a = SHID.student.a;
  const M = (s, k) => `<span style="background:linear-gradient(90deg, ${C.orL} ${100 * k}%, transparent ${100 * k}%);background-size:100% 42%;background-repeat:no-repeat;background-position:0 88%;color:#B2532F;font-weight:800">${s}</span>`;
  const hk = eo(pg(t, a + .6, .35));
  const dlg = (y, w, h, who, bg, html, small, p) => { const b = div(root, { left: ((W - w) / 2) + 'px', top: (y + 200 * (1 - p)) + 'px', width: w + 'px', height: h + 'px', borderRadius: '34px', background: bg, boxShadow: '0 24px 60px rgba(0,0,0,.16)', zIndex: 5, opacity: p });
    div(b, { right: '34px', top: '30px', maxWidth: '70%', padding: '14px 24px', borderRadius: '24px', background: small ? '#D9DBD8' : '#EEEFEC', font: `500 ${small ? 26 : 30}px/1.4 ${ZH}`, color: '#3A3F46' }, '进水管 3 小时注满，出水管 5 小时放完，同时开几小时注满？');
    div(b, { left: '34px', top: (small ? 150 : 160) + 'px', display: 'flex', alignItems: 'center', gap: '14px', font: `800 ${small ? 28 : 32}px ${ZH}`, color: small ? '#6B7178' : C.or }, `<span style="display:inline-block;width:${small ? 34 : 40}px;height:${small ? 34 : 40}px;border-radius:50%;background:${small ? '#9AA0A8' : C.or}"></span>${who}`);
    div(b, { left: '34px', right: '34px', top: (small ? 210 : 226) + 'px', font: `500 ${small ? 32 : 38}px/1.62 ${ZH}`, color: C.or }, html); };
  dlg(250, 960, 640, '师傅', '#fff', `进水管每小时可注入水池容量的 1/3，出水管每小时会放掉 1/5。<br>两管同时打开，每小时的净进水量为 ${M('1/3 − 1/5 = 2/15', hk)}。<br>注满所需时间为 1 ÷ 2/15 = ${M('7.5 小时', hk)}。`, false, 1);
  const sp = eo(pg(t, a, .35)); dlg(960, 860, 520, '自己的模型', '#E4E6E3', `进水管每小时能注入水池的 1/3，出水管每小时能放出 1/5，两管同时打开时，每小时实际能注入 ${M('1/3 − 1/5 = 2/15', hk)}……需要的时间是 ${M('7.5 小时', hk)}。`, true, sp);
  const np = eo(pg(t, a - .05, .4)); const nb = div(root, { left: lerp(300, -30, np) + 'px', top: lerp(700, 1330, np) + 'px', width: '200px', height: '250px', overflow: 'hidden', borderRadius: '8px', transform: `rotate(${-14 * np}deg)`, boxShadow: '0 16px 34px rgba(0,0,0,.35)', zIndex: 7 });
  img(nb, FR('book', SHID.book.b - .1), { left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover' }); div(nb, { left: '26px', top: '70px', font: `400 70px ${HAND}`, color: '#1F2A44', transform: 'rotate(-4deg)' }, '教材');
  tagT(t, a + .2, 56, 170, '同一道题，两个模型的实际回答（节选）'); mock(880, 1490); };
// Anthropic 自己说：蒸馏很常见
D.legit = t => { root.style.background = '#fff'; const a = S(7), b = S(8);
  const w = web('img/web_anth_feb_legit_zh.png', t, a, b, { iw: 2000, x0: -786, y0: -263, k1: 1.06, x1: -830, y1: -330 });
  marker(t, T0(7, 1) - .15, w.X(468), w.Y(661), w.X(911) - w.X(468), w.Y(688) - w.Y(661), C.or, { a: .35 });
  div(root, { left: 0, right: 0, bottom: 0, height: '480px', background: 'linear-gradient(rgba(255,255,255,0),rgba(255,255,255,.95) 50%)', zIndex: 5 });
  tagT(t, a + .1, 56, 150, 'Anthropic 官方博客 · 2026-02-23（就是它指控蒸馏的那篇）'); };
// DeepSeek R1：论文 80 万条 → HF 6 个 Distill 模型
D.r1 = t => { root.style.background = '#fff'; const a = S(8), m = T0(8, 1);
  if (t < m) { const w = web('img/web_r1_800k_zh.png', t, a, m, { iw: 1700, x0: -1120, y0: -100, k1: 1.04, x1: -1150, y1: -130 });
    marker(t, a + .2, w.X(768), w.Y(642), w.X(1056) - w.X(768), w.Y(669) - w.Y(642), C.or, { a: .35 }); div(root, { left: 0, right: 0, top: '1120px', height: '300px', background: 'linear-gradient(rgba(255,255,255,0),#fff 30%,#fff 80%,rgba(255,255,255,0))', zIndex: 11 }); bigT(t, a + .35, 40, 1180, `80 万条<span style="font-size:70px">样本</span>`, { fs: 130, col: C.or, st: 10, w: 1000, al: 'center' }); tagT(t, a + .05, 56, 150, 'DeepSeek-R1 论文 · 附录'); return; }
  const w = web('img/web_hf_r1_distill_clean.png', t, m, S(9), { iw: 1500, x0: -260, y0: -160, k1: 1.04, x1: -280, y1: -230 });
  for (let i = 0; i < 6; i++) { const t0 = m + .3 + i * .22; if (t < t0) continue; const p = eo(pg(t, t0, .2)); const y = w.Y(445 + i * 60.4), hh = w.Y(477 + i * 60.4) - y;
    div(root, { left: w.X(200) + 'px', top: y + 'px', width: (w.X(490) - w.X(200)) * p + 'px', height: hh + 'px', background: C.orL, opacity: .6, mixBlendMode: 'multiply', zIndex: 3 });
    div(root, { left: (w.X(200) - 74) + 'px', top: (y + hh / 2 - 28) + 'px', width: '56px', height: '56px', borderRadius: '50%', background: C.or, color: '#fff', font: `900 34px/56px ${EN}`, textAlign: 'center', zIndex: 6, opacity: p }, String(i + 1)); }
  tagT(t, m + .05, 56, 150, 'Hugging Face · deepseek-ai/DeepSeek-R1');
  if (t >= T0(8, 2)) { div(root, { left: 0, right: 0, top: '1120px', height: '300px', background: 'linear-gradient(rgba(255,255,255,0),#fff 30%,#fff 80%,rgba(255,255,255,0))', zIndex: 11 }); bigT(t, T0(8, 2) + .1, 40, 1180, `6 <span style="font-size:90px">个小模型</span>`, { fs: 150, col: C.or, st: 10, w: 1000, al: 'center', ff: EN }); } };
// 指控：机房 → Anthropic 标题 → 大数字 → 原文
D.hall = t => { vid('hall', t, { push: .1 });
  if (t >= T0(9, 1) - .1) { const p = eo(pg(t, T0(9, 1) - .1, .4)); const f = page('img/web_anth_feb_title_zh.png', 40, 300 - 200 * (1 - p), 1000, 200, { iw: 1000, iy: -28, r: 14, rot: -1.2, z: 8 }); f.style.opacity = p; }
  tagT(t, T0(9, 1) + .2, 56, 530, 'Anthropic 官方博客 · 2026-02-23', { dark: 1 }); };
D.rack = t => { vid('rack', t, { push: .07 });
  const f = page('img/web_anth_feb_title_zh.png', 40, 300, 1000, 200, { iw: 1000, iy: -28, r: 14, rot: -1.2, z: 8 });
  const n0 = T0(9, 3) - .25; if (t >= n0) div(root, { left: 0, right: 0, top: '780px', textAlign: 'center', zIndex: 9 },
    `<div style="font:900 210px/1 ${EN};color:#fff;-webkit-text-stroke:14px #111317;paint-order:stroke fill;letter-spacing:-4px">${num(t, n0, 1600, .9)}<span style="font:900 120px ${ZH}"> 万次</span></div>`);
  bigT(t, n0 + .5, 40, 1010, '和 Claude 的对话', { fs: 76, w: 1000, al: 'center' });
  if (t >= n0 + .9) { const p = eo(pg(t, n0 + .9, .3)); div(root, { left: '230px', top: (1130 + 30 * (1 - p)) + 'px', width: '620px', textAlign: 'center', padding: '14px 0', borderRadius: '14px', background: C.or, font: `900 56px ${ZH}`, color: '#fff', opacity: p, zIndex: 9 }, '约 2.4 万个虚假账号'); }
  tagT(t, SHID.rack.a, 56, 530, 'Anthropic 官方博客 · 2026-02-23', { dark: 1 }); };
D.rack2 = t => { vid('rack2', t, { push: .04 }); const a = SHID.rack2.a, p = eo(pg(t, a, .45));
  div(root, { left: 0, right: 0, top: lerp(780, 230, p) + 'px', textAlign: 'center', zIndex: 9 }, `<div style="font:900 ${lerp(210, 110, p)}px/1 ${EN};color:#fff;-webkit-text-stroke:${lerp(14, 9, p)}px #111317;paint-order:stroke fill">1600<span style="font:900 ${lerp(120, 66, p)}px ${ZH}"> 万次</span></div>`);
  const f = div(root, { left: '30px', top: (lerp(1920, 470, p)) + 'px', width: '1020px', height: '860px', overflow: 'hidden', borderRadius: '18px', background: '#FAF9F5', boxShadow: '0 30px 80px rgba(0,0,0,.5)', zIndex: 8, transform: 'rotate(-1deg)' });
  img(f, 'img/web_anth_feb_num_zh.png', { left: '-70px', top: (-420 - 40 * pg(t, a, 2)) + 'px', width: '1300px' });
  if (t > a + .5) div(root, { left: '50px', top: (470 + 812 - 40) + 'px', width: '980px', textAlign: 'center', font: `700 30px ${ZH}`, color: C.or, zIndex: 9, opacity: eo(pg(t, a + .5, .3)) }, '原文点名的三家：DeepSeek、月之暗面、MiniMax'); };
// 月之暗面回应
D.kimi = t => { vid('kimi', t, { push: .06 }); tagT(t, S(10) + .1, 56, 1330, 'Kimi K3 官方宣传片 · 2026.7.16', { dark: 1 }); };
D.ifeng = t => { root.style.background = '#fff'; const a = SHID.ifeng.a, b = S(11);
  const pp = eio(pg(t, a, b - a)), k = 1.85 + .3 * pp; const ix = 40, iy = 960 - 675 * k + 120 * (1 - pp); const X = x => ix + x * k, Y = y => iy + y * k;
  img(root, 'img/web_ifeng_kimi_clean.png', { left: ix + 'px', top: iy + 'px', width: 1080 * k + 'px' });
  marker(t, T0(10, 3) - .1, X(830), Y(637), X(910) - X(830), 30 * k, '#BFC4CC', { a: .75, d: .2 });
  marker(t, T0(10, 3) + .1, X(0), Y(682), X(352) - X(0), 30 * k, '#BFC4CC', { a: .75, d: .3 });
  tagT(t, a + .05, 56, 150, '凤凰网 · 7 月 21 日月之暗面回应');
  div(root, { left: 0, right: 0, bottom: 0, height: '560px', background: 'linear-gradient(rgba(255,255,255,0),#fff 40%)', zIndex: 5 });
  stampT(t, T0(10, 4) + .1, 470, 1250, '并非蒸馏复刻', '#3B4150', { fs: 60, rot: -6 });
  boxT(t, T0(10, 4) + .9, X(0), Y(639), X(96) - X(0), 28 * k, C.ink); };
// 时间轴（第 11–17 句连续一个镜头）
const PT = (k, j, d) => { // 每个发布点什么时候冒出来
  const base = T0(12, 0) + .3 + ({ mm: 0, ds: .12, zp: .24, qw: .36, km: .48 })[k] + (d / 334) * 1.1; return base; };
D.tl = t => { const cam = camAt(t);
  const a = S(11), unfold = t < S(12) ? 0 : eo(pg(t, S(12), 1.4));
  const foc = t < S(13) - .1 ? null : t < S(14) - .2 ? ['mm'] : t < S(15) - .1 ? ['ds', 'zp'] : t < S(17) - .2 ? ['qw', 'km'] : null;
  const { P, xt } = drawTL(t, cam, { unfold, focus: foc, labels: t > S(13) && t < S(17) + .3, ptT: PT,
    wait: { ds: [doy(8, 13), T0(14, 2), 102], zp: [doy(8, 14), T0(14, 2) + .15, 101] }, wfs: 38 });
  // 第 11 句：日期框 → 点 → 线
  if (t < S(12) + .6) { const el = svgRoot(); el('g', {}); const sv = root.lastChild; sv.style.opacity = 1 - pg(t, S(12), .6); const [x, y] = P(WX(doy(7, 21)), 960 + 0); const g = pg(t, a + .4, 1.1);
    el('line', { x1: x - 1400 * eo(g), x2: x + 400 * eo(g), y1: y, y2: y, stroke: C.ink, 'stroke-width': 5 });
    el('circle', { cx: x, cy: y, r: 16, fill: C.ink }); for (let q = 0; q < 2; q++) { const ph = ((t - a) / .9 + q * .5) % 1; el('circle', { cx: x, cy: y, r: 16 + 70 * ph, fill: 'none', stroke: C.or, 'stroke-width': 4, opacity: (1 - ph) * .8 }); } txt(el, x, y - 34, '7.21', { fs: 40, fw: 900, en: true, op: 1 - pg(t, S(12), .3) });
    if (t < a + .5) { const q = pg(t, a, .5); div(root, { left: (x - 60 * (1 - q) - 10) + 'px', top: (y - 30 * (1 - q) - 10) + 'px', width: (120 * (1 - q) + 20) + 'px', height: (60 * (1 - q) + 20) + 'px', border: `6px solid ${C.ink}`, borderRadius: '10px', zIndex: 9 }); } }
  if (t >= S(11) && t < S(12) + .2) { bigT(t, T0(11, 1), 56, 330, '限制变严之后', { fs: 64, col: C.or, st: 0, al: 'left', kk: .05, org: '0 50%' }); bigT(t, T0(11, 2), 56, 430, '更新真的变慢了吗？', { fs: 80, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' });
    FLAGS_OR.forEach(([d, date, lab], i) => { const t0 = S(11) + .25 + i * .32; if (t < t0) return; const p = eo(pg(t, t0, .3)), fo = 1 - pg(t, S(12) - .1, .4);
      div(root, { left: (56 + 240 * (1 - p)) + 'px', top: (1180 + i * 82) + 'px', padding: '10px 22px', borderRadius: '12px', background: C.or, font: `900 34px ${ZH}`, color: '#fff', opacity: p * fo, zIndex: 9, whiteSpace: 'nowrap' }, `${date}　<span style="font-weight:700">${lab}</span>`); }); }
  // 第 13 句 MiniMax
  if (t >= S(13) && t < S(14)) { poster(t, T0(13, 1), P, doy(2, 12), 'mm', 'mm_m25', 60, -260, 290, 240, -4); poster(t, T0(13, 1) + .4, P, doy(3, 18), 'mm', 'mm_m27', 180, -470, 290, 240, 3);
    poster(t, T0(13, 2), P, doy(6, 1), 'mm', 'mm_m3', 60, -280, 290, 240, -2); poster(t, T0(13, 5), P, doy(10, 19), 'mm', 'mm_m31f', -130, -300, 250, 210, 3);
    if (t >= T0(13, 3)) { const el = svgRoot(), [x0, y] = P(WX(doy(6, 1)), LY.mm), [x1] = P(WX(doy(10, 19)), LY.mm), gp = eo(pg(t, T0(13, 3), 1));
      el('rect', { x: x0 + 18, y: y - 14, width: (x1 - x0 - 36) * gp, height: 28, rx: 8, fill: 'url(#hatch)' });
      el('path', { d: `M${x0 + 10} ${y + 90} L${x0 + 10} ${y + 110} L${x1 - 10} ${y + 110} L${x1 - 10} ${y + 90}`, fill: 'none', stroke: C.or, 'stroke-width': 5, opacity: gp });
      div(root, { left: x0 + 'px', width: (x1 - x0) + 'px', top: (y + 125) + 'px', textAlign: 'center', font: `900 104px ${EN}`, color: C.or, zIndex: 9 }, `${num(t, T0(13, 3), 140, 1)}<span style="font:900 56px ${ZH}"> 天</span>`); }
    bigT(t, S(13), 56, 250, `MiniMax`, { fs: 84, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' });
    bigT(t, T0(13, 1) + .1, 56, 350, '上半年一两个月一更', { fs: 50, col: C.sub, st: 0, al: 'left', kk: .05, org: '0 50%' }); }
  // 第 14 句 DeepSeek / 智谱
  if (t >= S(14) - .1 && t < S(15) + .2) { poster(t, S(14) + .2, P, doy(8, 13), 'ds', 'ds_v4pro', -170, -330, 290, 230, -3); poster(t, T0(14, 1), P, doy(8, 14), 'zp', 'zp_53', -230, 150, 290, 230, 3);
    bigT(t, S(14), 56, 250, `DeepSeek <span style="color:${C.dim}">/</span> 智谱`, { fs: 76, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' });
    bigT(t, T0(14, 2), 56, 345, '上一代旗舰之后，到今天', { fs: 46, col: C.sub, st: 0, al: 'left', kk: .05, org: '0 50%' }); }
  // 第 15–16 句 千问 / Kimi
  if (t >= S(15) - .1 && t < S(17)) { bigT(t, S(15), 56, 250, `千问 <span style="color:${C.dim}">/</span> Kimi`, { fs: 76, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' });
    poster(t, S(16) + .3, P, doy(8, 3), 'qw', 'qw_38', -60, -330, 270, 210, -3); poster(t, T0(16, 1), P, doy(11, 15), 'qw', 'f_qwen4', -250, -330, 270, 170, 3);
    poster(t, T0(16, 2), P, doy(7, 17), 'km', 'km_k3', -100, 250, 270, 210, 2); poster(t, T0(16, 3), P, doy(10, 24), 'km', 'f_k31', 30, 250, 270, 170, -3);
    if (t >= T0(16, 1) + .3) bigT(t, T0(16, 1) + .3, 56, 345, '中间都已经出了新旗舰', { fs: 46, col: C.sub, st: 0, al: 'left', kk: .05, org: '0 50%' }); }
  // 第 17 句：拉回全景，橙旗落下
  if (t >= S(17) + .4) { const fl = [[T0(17, 1) - .2, 0, 170], [T0(17, 1) + .25, 1, 520], [T0(17, 2) - .25, 2, 680], [T0(17, 2) + .15, 3, 840]];
    for (const [t0, i, lx] of fl) flagT(t, t0, P, FLAGS_OR[i][0], FLAGS_OR[i][1], FLAGS_OR[i][2], C.or, lx, 470, true);
    bigT(t, S(17) + .4, 56, 250, `${OR('反蒸馏')} 的时间点`, { fs: 70, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' }); }
};
// 算力
D.hgx = t => { vid('hgx', t, { push: .08 });
  tagT(t, S(18) + .3, 56, 1330, '英伟达数据中心 GPU · Reuters', { dark: 1 }); };
D.h200 = t => { vid('h200', t, { push: .08 }); tagT(t, S(19) + .2, 56, 1330, 'NVIDIA H200 · 官方产品片（PNY）', { dark: 1 }); };
D.sina = t => { root.style.background = '#0B1020'; const a = SHID.sina.a, b = SHID.sina.b;
  const top = div(root, { left: 0, top: 0, width: W + 'px', height: '1000px', overflow: 'hidden' }); img(top, FR('h200', SHID.h200.b - .05), { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 + .05 * pg(t, a, b - a)})` });
  const p = eo(pg(t, a, .4)); const f = div(root, { left: 0, top: lerp(1920, 940, p) + 'px', width: W + 'px', height: '980px', overflow: 'hidden', background: '#fff', boxShadow: '0 -20px 60px rgba(0,0,0,.4)', zIndex: 5 });
  img(f, 'img/web_sina_h200_clean.png', { left: '-20px', top: '-170px', width: '1120px' });
  marker(t, T0(19, 2) - .2, 148, lerp(1920, 940, p) + 213, 700, 51, C.gr, { a: .45, z: 6 });
  stampT(t, T0(19, 2) + .3, 560, 1290, '11.17 财报会确认', C.gr, { fs: 44, rot: -5, bg: 'rgba(255,255,255,.9)' });
  tagT(t, a + .2, 56, 950, '新浪财经 · 2026-11-18'); };
D.bis = t => { vid('bis', t, { push: .06 }); const a = SHID.bis.a, p = eo(pg(t, a, .45));
  const f = div(root, { left: '30px', top: lerp(1920, 560, p) + 'px', width: '1020px', height: '640px', overflow: 'hidden', borderRadius: '18px', background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.5)', zIndex: 8, transform: 'rotate(-1deg)' });
  img(f, 'img/web_sina_bis_title_clean.png', { left: '-40px', top: '-230px', width: '1160px' });
  marker(t, T0(19, 4) - .15, 60, lerp(1920, 560, p) + 166, 960, 53, C.gr, { a: .45, z: 9 });
  tagT(t, a + .3, 56, 470, '美国商务部 11.16 新规 · 新浪科技', { dark: 1 });
  bigT(t, T0(19, 4) + .2, 40, 1260, `租海外算力 <span style="color:${CAPC.g}">要许可</span>`, { fs: 92, w: 1000, al: 'center' }); };
// 收尾：全景时间轴 + 两排压力
D.tl2 = t => { const a = S(20), q = eio(pg(t, a, TOTAL - a)), cam = { s: 1 + .16 * q, x: 585 + 150 * q, y: 1000 + 20 * q };
  const tsh = t < S(21) ? 0 : 40 * eio(pg(t, S(21) + .1, 1.4));
  const { P } = drawTL(t, cam, { unfold: 1, labels: false, wait: { ds: [doy(8, 13), -1, 0], zp: [doy(8, 14), -1, 0] }, future: T0(21, 1) + .2, todayShift: tsh, todayLabel: t > S(21) + .3 ? '接下来' : '今天 11.23' });
  [[0, 170], [1, 520], [2, 680], [3, 840]].forEach(([i, lx]) => flagT(t, -1, P, FLAGS_OR[i][0], FLAGS_OR[i][1], FLAGS_OR[i][2], C.or, lx, 470, true, { glow: t < T0(20, 1) ? .6 + .4 * Math.sin((t - a) * 9) : 0 }));
  [[0, 700, 0], [1, 880, .35]].forEach(([i, lx, dt]) => flagT(t, T0(20, 1) - .2 + dt, P, FLAGS_GR[i][0], FLAGS_GR[i][1], FLAGS_GR[i][2], C.gr, lx, 1470, false, { glow: t > T0(20, 1) + .5 && t < S(21) ? .8 : 0 }));
  div(root, { left: '56px', top: '250px', font: `900 74px/1.25 ${ZH}`, color: C.ink, zIndex: 9 }, `${OR('反蒸馏')}<span style="color:${C.dim};opacity:${eo(pg(t, T0(20, 1) - .2, .3))}">　/　</span><span style="opacity:${eo(pg(t, T0(20, 1) - .2, .3))}">${GN('算力收紧')}</span>`);
  if (t >= S(21)) bigT(t, T0(21, 2), 56, 350, '更新周期会不会普遍拉长？', { fs: 50, col: C.ink, st: 0, al: 'left', kk: .05, org: '0 50%' }); };

function render(t) { root.innerHTML = ''; root.style.background = '#000';
  const s = SH.find(x => t >= x.a && t < x.b) || SH[SH.length - 1]; D[s.id](t);
  // 时间轴 → 英伟达：整张图往上推走，下一镜头从下面顶上来
  if (s.id === 'tl' && t >= S(18) - .4) { const p = eio(pg(t, S(18) - .4, .4)), kids = [...root.childNodes], bg = root.style.background;
    const h = div(root, { left: 0, top: (-1920 * p) + 'px', width: W + 'px', height: H + 'px', background: bg || C.paper }); kids.forEach(k => h.appendChild(k));
    const n = div(root, { left: 0, top: (1920 * (1 - p)) + 'px', width: W + 'px', height: H + 'px', overflow: 'hidden' }); img(n, FR('hgx', S(18)), { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }); }
  if (s.id === 'teach') { const z = 1 + .09 * eio(pg(t, s.a, s.b - s.a)), kids = [...root.childNodes], bg = root.style.background;
    const h = div(root, { inset: 0, background: bg || C.paper, transform: `scale(${z}) translateY(${-40 * pg(t, s.a, s.b - s.a)}px)`, transformOrigin: '50% 30%' }); kids.forEach(k => h.appendChild(k)); }
  caps(t); hud(t / TOTAL); }
