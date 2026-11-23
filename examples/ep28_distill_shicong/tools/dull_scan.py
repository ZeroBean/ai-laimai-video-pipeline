"""闷点排查：成片按 10fps 解码成小灰度图（去掉字幕带、角标、进度条），
对每个起点 t，看 [t, t+2s] 内画面相对 t 的最大变化；最大变化都很小 = 2 秒内画面基本没动。
用法: python dull_scan.py 成片.mp4 [阈值，默认 3.0]  → 打印闷段 + 每秒变化曲线"""
import os, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import FF
mp4, TH = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
w, h, fps = 108, 192, 10
raw = subprocess.run([FF, '-v', 'error', '-i', mp4, '-vf', f'fps={fps},scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
mask = np.ones((h, w), bool)
mask[int(h * 1520 / 1920):int(h * 1740 / 1920), :] = False   # 字幕带
mask[:int(h * 130 / 1920), int(w * .6):] = False             # 右上角标
mask[-3:, :] = False                                          # 进度条
n, win = len(F), 2 * fps
M = np.zeros(n)
for i in range(n - 1):
    j = min(n, i + win + 1)
    M[i] = max(np.abs(F[k][mask] - F[i][mask]).mean() for k in range(i + 1, j))
bad = [i for i in range(n - win) if M[i] < TH]
segs = []
for i in bad:
    if segs and i <= segs[-1][1] + 1: segs[-1][1] = i
    else: segs.append([i, i])
print(f'帧数 {n}，阈值 {TH}（0–255 平均灰度差）')
for a, b in segs: print(f'闷段: {a / fps:.1f}s – {(b + win) / fps:.1f}s  最小变化 {M[a:b + 1].min():.2f}')
print('DULL_SEGS', len(segs))
print('每秒最小 2 秒窗口变化：', ' '.join(f'{s}:{M[s * fps:(s + 1) * fps].min():.1f}' for s in range(int((n - win) / fps))))
