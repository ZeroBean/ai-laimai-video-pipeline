#!/bin/bash
# 局部补渲：只渲 [a,b) 秒这一段，按帧替换进上一版成片，再配原音轨。可一次补多段：bash tools/patch.sh 43.9 47.5 [61 63 ...]
set -e
R=$(cd "$(dirname "$0")/.." && pwd); FF=${FFMPEG:-ffmpeg}; PY=${PYTHON:-python3}
BASE=${BASE:-国产AI师从美国_v1.mp4}; FP=${FFPROBE:-ffprobe}
cd $R/film; [ -f out/video_master.mp4 ] || cp out/video_v1.mp4 out/video_master.mp4   # 画面母版：始终 30fps 全帧，补丁都打在它上面
NF0=$($FP -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets -of csv=p=0 out/video_master.mp4)
ARGS=("$@"); N=$((${#ARGS[@]} / 2)); INPUTS=(-i out/video_master.mp4); FC=""; LAB=""; PREV=0
for ((k = 0; k < N; k++)); do
  FA=$(python3 -c "print(round(${ARGS[2*k]}*30))"); FB=$(python3 -c "print(round(${ARGS[2*k+1]}*30))")
  nice node render.mjs clip out/patch_$k.mp4 $(python3 -c "print($FA/30)") $(python3 -c "print($FB/30)") > out/patch_$k.log 2>&1 &
  INPUTS+=(-i out/patch_$k.mp4)
  FC+="[0:v]trim=start_frame=$PREV:end_frame=$FA,setpts=PTS-STARTPTS[b$k];[$((k+1)):v]setpts=PTS-STARTPTS[p$k];"; LAB+="[b$k][p$k]"; PREV=$FB
done
wait
FC+="[0:v]trim=start_frame=$PREV,setpts=PTS-STARTPTS[bz];${LAB}[bz]concat=n=$((2*N+1)):v=1:a=0[v]"
$FF -y -v error "${INPUTS[@]}" -filter_complex "$FC" -map "[v]" -r 30 -fps_mode cfr -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -threads 3 out/video_patched.mp4
NF1=$($FP -v error -count_packets -select_streams v:0 -show_entries stream=nb_read_packets,r_frame_rate -of csv=p=0 out/video_patched.mp4)
[ "$NF1" = "30/1,$NF0" ] || { echo "帧数/帧率不对：母版 $NF0 帧，补后 $NF1"; exit 1; }
cp out/video_patched.mp4 out/video_master.mp4
$FF -y -v error -i out/video_patched.mp4 -i out/audio_v1.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest "$R/$BASE"
echo "PATCH_DONE $* 帧数 $NF1"; $FF -i "$R/$BASE" 2>&1 | grep -E "Duration" | head -1
