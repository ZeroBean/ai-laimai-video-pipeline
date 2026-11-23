"""第28期音轨：只有配音（无 BGM、无音效），-14 LUFS / 48k。用法: python score.py <输出.wav>"""
import json, subprocess, sys
import numpy as np
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import ROOT, FF
R = str(ROOT) + '/'; SR = 44100
TL = json.load(open(R + 'tts/timeline.json')); TOTAL = TL[-1]['e'] + 1.4; NF = round(TOTAL * 30); T = NF / 30
def dec(f, ss=None, to=None):
    cmd = [FF, '-v', 'quiet'] + (['-ss', str(ss), '-to', str(to)] if ss is not None else []) + ['-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).copy()
n = int((T + .5) * SR); voice = np.zeros(n, np.float32)
for L in TL:
    if 'file' in L:
        a = dec(R + L['file']); s = int(L['base'] * SR); voice[s:s + len(a)] += a
v_rms = np.sqrt(np.mean(voice[np.abs(voice) > 1e-3] ** 2))
for L in TL:
    if 'clip' in L:  # 原声：响度对齐配音，首尾淡入淡出
        a = dec(R + L['src'], L['clip'][0], L['clip'][1])
        a *= v_rms / (np.sqrt(np.mean(a[np.abs(a) > 1e-3] ** 2)) + 1e-9) * .9
        fd = int(.06 * SR); a[:fd] *= np.linspace(0, 1, fd); a[-fd:] *= np.linspace(1, 0, fd)
        s = int(L['base'] * SR); voice[s:s + len(a)] += a
mix = np.stack([voice, voice], 1)
e_ = int(T * SR); fo = int(.45 * SR); mix[e_:] = 0; mix[e_ - fo:e_] *= np.linspace(1, 0, fo)[:, None]
mix = mix[:int(round(NF / 30 * SR))]; mix *= .95 / max(.95, float(np.abs(mix).max()))
raw = sys.argv[1] + '.raw.wav'
subprocess.run([FF, '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=mix.astype(np.float32).tobytes(), check=True)
r = subprocess.run([FF, '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
subprocess.run([FF, '-y', '-v', 'error', '-i', raw, '-af', f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.85:level=false:attack=2:release=60", '-ar', '48000', sys.argv[1]], check=True)
print('done', sys.argv[1], 'NF', NF, 'input_i', j['input_i'])
