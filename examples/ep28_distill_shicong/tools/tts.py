"""第28期配音：按段整段合成；豆包 2.0 刘飞；tts/NN.mp3 + tts/meta.json。中文和数字之间不留空格，防多读字"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import ROOT, FF
import doubao_tts as doubao
os.chdir(ROOT); SPK = 'zh_male_liufei_uranus_bigtts'
body = open('文案_定稿.md', encoding='utf8').read()
P = [re.sub(r'\s*\n\s*', '', p.strip()) for p in re.split(r'\n\s*\n', body) if p.strip()]
SAY = (('Qwen3.8-Max', 'Qwen三点八 Max'), ('Qwen4-Max', 'Qwen四 Max'), ('M3.1 Flash', 'M三点一 Flash'), ('K3.1 Pro', 'K三点一 Pro'), ('H200', 'H二百'), ('6 月', '六月'), ('8 月', '八月'), ('10 月', '十月'), ('11 月', '十一月'), ('7 月', '七月'))
def say(s):
    for a, b in SAY: s = s.replace(a, b)
    return re.sub(r'(?<=[一-鿿])\s+(?=[一-鿿0-9A-Za-z])|(?<=[0-9A-Za-z])\s+(?=[一-鿿])', '', s)
def dur(f):
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', subprocess.run([FF, '-i', f], capture_output=True, text=True).stderr).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)
res = []; only = set(map(int, sys.argv[1:]))
for n, t in enumerate(P, 1):
    mp3 = f'tts/{n:02d}.mp3'; text = say(t)
    if n in only or not (os.path.exists(mp3) and os.path.getsize(mp3) > 1000):
        raw = f'tts/{n:02d}_raw.mp3'; doubao.tts(text, SPK, raw, rate=20)
        subprocess.run([FF, '-y', '-v', 'error', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-55dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', '-b:a', '192k', mp3], check=True); os.remove(raw)
    res.append({'n': n, 'file': mp3, 'dur': dur(mp3), 'say': text, 'text': t}); print(n, round(res[-1]['dur'], 2), text, flush=True)
json.dump(res, open('tts/meta.json', 'w'), ensure_ascii=False, indent=1); print('合计', round(sum(r['dur'] for r in res), 1))
