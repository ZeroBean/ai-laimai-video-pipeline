#!/bin/bash
# 第28期素材一键获取：视频 / 空镜 / 网页原件截图 / 官方发布页 / 抽帧 / 字体 / 渲染依赖。
# 素材都是第三方版权内容，仓库里不放，按这个脚本自己下载（网页会改版，截图可能和成片略有出入）。
# 用法：在本期目录运行  bash tools/fetch_assets.sh
set -e
R=$(cd "$(dirname "$0")/.." && pwd); cd $R
FF=${FFMPEG:-ffmpeg}; YTDLP=${YTDLP:-yt-dlp}
mkdir -p 素材/{视频,空镜,网页,海报} film/img film/fonts 资料/网页存档

echo "== 1. Node 依赖（puppeteer-core，用本机 Chrome 渲染）"
(cd film && [ -d node_modules ] || npm install --no-audit --no-fund)

echo "== 2. 字体：LongCang 手写体（Google Fonts，OFL 授权）"
[ -f film/fonts/LongCang-Regular.ttf ] || curl -sfL -o film/fonts/LongCang-Regular.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/longcang/LongCang-Regular.ttf

echo "== 3. YouTube 视频（官方发布片 / 新闻片段 / 产品片），只下 1080p 以内"
# YouTube 拦机器人时需要 cookies：export YT_COOKIES=/path/to/cookies.txt（只导出 youtube/google 域）
CK=(); [ -n "$YT_COOKIES" ] && CK=(--cookies "$YT_COOKIES")
for id in bn0atstgavo DIyHTpfWctU CKlK-KDFKjM vvR2BM0Yrig jhlmUayEYWo ZF48xbVk6QI MgOQ1Rb1zOI olZ5eneX-WQ lR_wZyWOM2U; do
  [ -f 素材/视频/$id.mp4 ] || $YTDLP "${CK[@]}" -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "素材/视频/%(id)s.%(ext)s" -q "https://youtu.be/$id"
done

echo "== 4. Mixkit 免费空镜（Mixkit License，可商用）"
for v in 47242 45923 20235 20468 45340 39849 42655 47665 11401 23282 23215 7887 47668; do
  [ -f 素材/空镜/mk_$v.mp4 ] || curl -sfL -A Mozilla/5.0 -o 素材/空镜/mk_$v.mp4 https://assets.mixkit.co/videos/$v/$v-1080.mp4 || curl -sfL -A Mozilla/5.0 -o 素材/空镜/mk_$v.mp4 https://assets.mixkit.co/videos/$v/$v-720.mp4
done

echo "== 5. 网页原件截图（原句高亮；英文原句就地换中文）"
cd film
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36'
# OpenAI 官网拦无头浏览器：先 curl 存档，再关掉页面脚本渲染
curl -s -A "$UA" https://openai.com/policies/usage-policies/ | sed 's#<head>#<head><base href="https://openai.com/">#' > ../资料/网页存档/openai_usage_policies.html
NOJS=1 node webhl.mjs "file://$R/资料/网页存档/openai_usage_policies.html" cuts/openai.json 760
node webhl.mjs https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks cuts/anth_feb.json 760
node webhl.mjs https://www.anthropic.com/news/distillation-defenses cuts/anth_oct.json 760
node webhl.mjs https://arxiv.org/html/2501.12948 cuts/r1.json 760
node webhl.mjs https://huggingface.co/deepseek-ai/DeepSeek-R1 cuts/hf_r1.json 760
node webhl.mjs https://tech.ifeng.com/c/8ux43dxX4WX cuts/ifeng.json 760
HIDEFIXED=1 node webhl.mjs https://finance.sina.com.cn/roll/2026-11-18/doc-inizcrpc1136411.shtml cuts/sina_h200.json 760
HIDEFIXED=1 node webhl.mjs https://finance.sina.com.cn/tech/roll/2026-11-17/doc-iniyznqc1741967.shtml cuts/sina_bis.json 760

echo "== 6. 官方发布页头图（时间轴上的发布点）"
P=../素材/海报
node shot_page.mjs https://www.minimax.io/news/minimax-m25 $P/mm_m25.png
node shot_page.mjs https://www.minimax.io/blog/minimax-m27 $P/mm_m27.png
node shot_page.mjs https://www.minimax.io/blog/minimax-m3 $P/mm_m3.png
node shot_page.mjs https://www.minimax.io/blog/minimax-m31f $P/mm_m31f.png
node shot_page.mjs "https://qwen.ai/blog?id=qwen3.8" $P/qw_38.png
node shot_page.mjs https://www.kimi.com/blog/kimi-k3 $P/km_k3.png
node shot_page.mjs https://api-docs.deepseek.com/zh-cn/news/news260813 $P/ds_v4pro.png
node shot_page.mjs https://z.ai/blog/glm-5.3 $P/zp_53.png
cd $R

echo "== 7. 抽静帧 → film/img，网页和发布页也拷进去"
x(){ $FF -v error -y -ss $2 -i $1 -frames:v 1 -q:v 2 film/img/$3.jpg; }
x 素材/空镜/mk_47242.mp4 7 f_notebook; x 素材/空镜/mk_45340.mp4 6 f_notebook2; x 素材/空镜/mk_23215.mp4 5 f_rack; x 素材/空镜/mk_23282.mp4 3 f_hall; x 素材/空镜/mk_7887.mp4 4 f_rack2
x 素材/视频/MgOQ1Rb1zOI.mp4 6 f_h200; x 素材/视频/MgOQ1Rb1zOI.mp4 17 f_h200b; x 素材/视频/MgOQ1Rb1zOI.mp4 29 f_h200c; x 素材/视频/olZ5eneX-WQ.mp4 15 f_dgx
x 素材/视频/vvR2BM0Yrig.mp4 31 f_qwen4; x 素材/视频/DIyHTpfWctU.mp4 16.5 f_k31; x 素材/视频/ZF48xbVk6QI.mp4 19 f_oai_bldg; x 素材/视频/jhlmUayEYWo.mp4 42 f_anth_bldg; x 素材/视频/lR_wZyWOM2U.mp4 59 f_bj
cp 素材/网页/*.png 素材/海报/*.png film/img/

echo "== 8. 按镜头表抽视频帧序列 → film/seq/"
node tools/prep.mjs
echo FETCH_DONE
