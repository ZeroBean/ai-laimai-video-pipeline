#!/bin/bash
# 第28期全片 v1：两路并行渲画面 → 拼接 → 合成音轨
set -e
R=$(cd "$(dirname "$0")/.." && pwd); FF=${FFMPEG:-ffmpeg}; PY=${PYTHON:-python3}
cd $R/film
TOTAL=$(grep -oE 'const TOTAL = [0-9.]+' timeline.js | grep -oE '[0-9.]+$')
nice node render.mjs clip out/v1_partA.mp4 0 47.5 > out/v1_partA.log 2>&1 &
A=$!
nice node render.mjs clip out/v1_partB.mp4 47.5 $TOTAL > out/v1_partB.log 2>&1 &
B=$!
wait $A; wait $B
printf "file '%s'\nfile '%s'\n" $R/film/out/v1_partA.mp4 $R/film/out/v1_partB.mp4 > out/v1_parts.txt
$FF -y -v error -f concat -safe 0 -i out/v1_parts.txt -c copy out/video_v1.mp4
cd $R
$PY tools/score.py film/out/audio_v1.wav
$FF -y -v error -i film/out/video_v1.mp4 -i film/out/audio_v1.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest "国产AI师从美国_v1.mp4"
ls -la --time-style=long-iso "国产AI师从美国_v1.mp4"
echo BUILD_DONE
