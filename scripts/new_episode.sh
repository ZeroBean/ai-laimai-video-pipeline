#!/bin/bash
# 新建一期：从第28期范例拷通用工具，清空每期要重写的部分。
# 用法：bash scripts/new_episode.sh ep29_xxx [成片名]
set -e
NAME=$1; [ -z "$NAME" ] && { echo "用法: bash scripts/new_episode.sh ep29_xxx [成片名]"; exit 1; }
OUTNAME=${2:-${NAME}_v1}
ROOT=$(cd "$(dirname "$0")/.." && pwd); SRC=$ROOT/examples/ep28_distill_shicong; D=$ROOT/episodes/$NAME
[ -e "$D" ] && { echo "已存在：$D"; exit 1; }
mkdir -p $D/{tools,film/cuts,tts,kf,资料,素材/{视频,空镜,网页,海报}}
cp $SRC/tools/{cfg.py,doubao_tts.py,tts.py,words_all.py,gen_timeline.py,prep.mjs,score.py,build_v1.sh,patch.sh,dull_scan.py,final_qc.py,fsheet.py,grid.py} $D/tools/
cp $SRC/film/{cfg.mjs,render.mjs,shot_kf.mjs,webhl.mjs,zhover.js,shot_page.mjs,gettext.mjs,peek.mjs,package.json,index.html,index_kf.html,kit.js} $D/film/
python3 - "$D" "$OUTNAME" <<'PY'
import re, sys, pathlib
D = pathlib.Path(sys.argv[1]); OUT = sys.argv[2]
def sub(f, pat, rep, flags=re.S):
    p = D / f; s = p.read_text(); s2 = re.sub(pat, rep, s, count=1, flags=flags)
    if s2 == s: print('没改到', f, pat[:40])
    p.write_text(s2)
sub('tools/tts.py', r"SAY = \(.*?\)\)\n", "SAY = ()   # 读音替换：(('H200', 'H二百'), ('6 月', '六月'))\n")
sub('tools/gen_timeline.py', r"SC = \{.*?\]\}\n", "SC = {     # 每句怎么切屏：一屏 ≤14 字，按逗号切；{o|词} {g|词} {y|词} 上色\n1: ['第一句，', '第二屏。'],\n}\n")
sub('tools/gen_timeline.py', r"PARA = \{[^}]*\}", "PARA = set()   # 这几句前停顿长一点（新段落）")
sub('tools/gen_timeline.py', r"SAY = \(.*?\)\)\n", "SAY = ()   # 和 tools/tts.py 的 SAY 保持一致\n")
sub('tools/gen_timeline.py', r"NUMS = \{.*?\}\n", "NUMS = {}   # 识别成阿拉伯数字的地方按句换回汉字：{13: [('10', '十')]}\n")
sub('tools/final_qc.py', r"NUM = \(\(.*?\)\)\n", "NUM = ()   # 屏上文字 → 读法，比对前替换（同 SAY）\n")
for f in ['tools/build_v1.sh', 'tools/patch.sh']:
    p = D / f; p.write_text(p.read_text().replace('国产AI师从美国_v1', OUT))
(D / 'film/shots.js').write_text("""// 镜头表：sh(id, 起秒, 止秒, { src, ss 入点, m: 'full'|'rot'|'blur'|'img', cx 裁切中心(按1920宽), ch 裁高比例 })
const V = '../素材/视频/', B = '../素材/空镜/';
const SH = [];
function sh(id, a, b, o) { SH.push(Object.assign({ id, a, b, rate: 1, m: 'full', cx: 960 }, o)); }
(function () {
  // sh('open', 0, S(2), { src: V + 'xxx.mp4', ss: 1.0 });
})();
const SHID = Object.fromEntries(SH.map(s => [s.id, s]));
""")
(D / 'film/scenes.js').write_text("""// 全片：render(t) 按成片时间画一帧。参考 examples/ep28_distill_shicong/film/scenes.js
const D = {};
// D.open = t => { ... };
function render(t) { root.innerHTML = ''; root.style.background = '#000';
  const s = SH.find(x => t >= x.a && t < x.b) || SH[SH.length - 1]; if (s && D[s.id]) D[s.id](t);
  hud(t / TOTAL); }
""")
(D / 'film/kf.js').write_text("// 关键帧：renderKF(n)。参考 examples/ep28_distill_shicong/film/kf.js\nfunction renderKF(n) {}\n")
for f, t in [('文案_用户原稿_v1.md', '（把用户口播稿原样贴在这里）\n'), ('文案_定稿.md', '（空行分段，一段 = 一句配音）\n'),
             ('事实核对.md', '# 事实核对\n\n## 结论\n\n## 逐句\n| 原稿 | 核对 | 处理 |\n|---|---|---|\n\n## 一句话风险提示\n\n## 逻辑体检\n\n## 时长估算\n\n## 来源\n'),
             ('分镜_v1.md', '# 分镜 v1\n\n## 〇、选用风格\n（从 docs/07_风格库.md 选：风格编号 + 为什么适合这期题材 + 代表视频 + 和上一期怎么区分）\n\n## 一、这期怎么做\n（核心意象 / 颜色表 / 段→画面语言 / 主线路径）\n\n## 二、逐句分镜\n| # | 时间 | 口播 | 画面 | 动效/运镜 | 为什么这样配 |\n|---|---|---|---|---|---|\n\n## 三、要找的素材（计划）\n\n## 四、制作时间\n\n## 五、要你定的\n'),
             ('素材清单.md', '# 素材清单\n\n| 文件 | 内容 | 用在 | 取段 |\n|---|---|---|---|\n')]:
    (D / f).write_text(t)
PY
sed -i 's#<script src="kf.js"></script><script src="timeline.js"></script>#<script src="kf.js"></script><script src="timeline.js"></script>#' $D/film/index.html
echo "已建好：$D"
echo "下一步：把口播稿贴进 文案_用户原稿_v1.md，在 Claude Code 里说「按 CLAUDE.md 做这一期」。"
