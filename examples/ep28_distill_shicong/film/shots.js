// 第28期镜头表：镜头 = 成片时间 [a,b) + 素材 src 入点 ss + 模式 m
// m: full 竖屏满幅裁切（cx=裁切中心 x，按 1920 宽算；ch=只取上面这一比例的高度，躲台标/滚动条）｜rot 旋转 90° 满幅｜blur 满幅虚化｜img 纯画面，不抽帧
const V = '../素材/视频/', B = '../素材/空镜/';
const SH = [];
function sh(id, a, b, o) { SH.push(Object.assign({ id, a, b, rate: 1, m: 'full', cx: 960 }, o)); }
(function () {
  // ① 钩子：国产发布片快切
  sh('h1', 0, .8, { src: V + 'bn0atstgavo.mp4', ss: 1.0 });
  sh('h2', .8, 1.55, { src: V + 'CKlK-KDFKjM.mp4', ss: 3.0 });
  sh('h3', 1.55, 2.3, { src: V + 'DIyHTpfWctU.mp4', ss: 15.6 });
  sh('h4', 2.3, S(2), { src: V + 'vvR2BM0Yrig.mp4', ss: 30.2 });
  // ② 不让学
  sh('anth', S(2), T0(2, 2), { src: V + 'jhlmUayEYWo.mp4', ss: 38.6, cx: 900 });
  sh('oai', T0(2, 2), T0(2, 3), { src: V + 'ZF48xbVk6QI.mp4', ss: 112.7, cx: 900, ch: .9 });
  sh('policy', T0(2, 3), S(3), { m: 'img' });
  sh('claude', S(3), S(4), { m: 'img' });
  sh('octt', S(4), S(6), { m: 'img' });
  // ③ 蒸馏：师傅 → 撕纸条 → 练习册 → 小模型
  sh('teach', S(6), T0(6, 3), { m: 'img' });
  sh('book', T0(6, 3), T0(6, 4), { src: B + 'mk_45340.mp4', ss: 2, m: 'rot' });
  sh('student', T0(6, 4), S(7), { m: 'img' });
  sh('legit', S(7), S(8), { m: 'img' });
  sh('r1', S(8), S(9), { m: 'img' });
  // ④ 指控与回应
  sh('hall', S(9), T0(9, 2), { src: B + 'mk_23282.mp4', ss: .5 });
  sh('rack', T0(9, 2), T0(9, 4), { src: B + 'mk_23215.mp4', ss: 1 });
  sh('rack2', T0(9, 4), S(10), { src: B + 'mk_7887.mp4', ss: 1, m: 'blur' });
  sh('kimi', S(10), T0(10, 2), { src: V + 'bn0atstgavo.mp4', ss: 3.2 });
  sh('ifeng', T0(10, 2), S(11), { m: 'img' });
  // ⑤ 时间轴
  sh('tl', S(11), S(18), { m: 'img' });
  // ⑥ 算力
  sh('hgx', S(18), S(19), { src: V + 'lR_wZyWOM2U.mp4', ss: .4, cx: 860 });
  sh('h200', S(19), T0(19, 1), { src: V + 'MgOQ1Rb1zOI.mp4', ss: 28.4, cx: 1080 });
  sh('sina', T0(19, 1), T0(19, 3), { m: 'img' });
  sh('bis', T0(19, 3), S(20), { src: B + 'mk_7887.mp4', ss: 5 });
  // ⑦ 收尾：时间轴第 2 次
  sh('tl2', S(20), TOTAL, { m: 'img' });
})();
const SHID = Object.fromEntries(SH.map(s => [s.id, s]));
