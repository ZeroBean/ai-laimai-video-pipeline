"""成片字幕对时校验：从成片抽音轨 → 逐字识别 → 每屏字幕时间段内识别到的字 和 屏上的字 按拼音比对"""
import json, os, re, subprocess, sys, difflib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import ROOT, FF, WHISPER
os.chdir(ROOT)
from faster_whisper import WhisperModel
from pypinyin import lazy_pinyin
mp4 = os.path.abspath(sys.argv[1]) if not os.path.isabs(sys.argv[1]) else sys.argv[1]
subprocess.run([FF, '-y', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', '16000', 'film/out/qc.wav'], check=True)
m = WhisperModel(WHISPER, device='cpu', compute_type='int8', cpu_threads=2)
seg, _ = m.transcribe('film/out/qc.wav', language='zh', word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
ch = []
for s in seg:
    for w in s.words:
        c = re.sub(r'[^一-鿿A-Za-z0-9]', '', w.word)
        for k, x in enumerate(c): ch.append((w.start + (w.end - w.start) * (k + .5) / len(c), x))
NUM = (('Qwen3.8-Max','Qwen三点八Max'),('Qwen4-Max','Qwen四Max'),('M3.1','M三点一'),('K3.1','K三点一'),('H200','H二百'),('11 月','十一月'),('10 月','十月'),('8 月','八月'),('7 月','七月'),('6 月','六月'))
def norm(s):
    for a, b in NUM: s = s.replace(a, b)
    s = s.replace(" ", "")
    for a, b in (('200','二百'),('31','三点一'),('38','三点八'),('11','十一'),('10','十'),('8','八'),('7','七'),('6','六'),('4','四')): s = s.replace(a, b)
    return re.sub(r'[^一-鿿A-Za-z0-9]', '', s)
py = lambda x: [lazy_pinyin(c)[0].lower() for c in x]
bad = 0
for L in json.load(open('tts/timeline.json')):
    for i, s in enumerate(L['scr']):
        want = norm(''.join(p[0] for p in s['p'])); got = norm(''.join(x for t, x in ch if s['t'] - .12 <= t < s['e'] + .12))
        r = difflib.SequenceMatcher(None, py(want), py(got), autojunk=False).ratio(); ok = r >= .8
        bad += not ok; print(L['n'], i, s['t'], s['e'], 'OK' if ok else 'BAD', round(r, 2), want, '|', got, flush=True)
print('QC_DONE bad', bad)
