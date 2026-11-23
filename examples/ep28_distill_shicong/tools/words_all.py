"""逐字对时：先不带提示词，对不上再带中性提示；拼音逐字比对，多字、少字都打印；只重做 argv 里的句子（无参数=全部）"""
import json, os, re, sys, difflib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import ROOT, WHISPER
os.chdir(ROOT)
from faster_whisper import WhisperModel
from pypinyin import lazy_pinyin
m = WhisperModel(WHISPER, device='cpu', compute_type='int8', cpu_threads=2)
NUM = (('2026', '二零二六'),)
def norm(s):
    for a, b in NUM: s = s.replace(a, b)
    return re.sub(r'[^一-鿿A-Za-z0-9]', '', s)
py = lambda x: [lazy_pinyin(c)[0].lower() for c in x]
def judge(ref, ws):
    a, b = py(norm(ref)), py(norm(''.join(x['w'] for x in ws)))
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    return sum(x.size for x in sm.get_matching_blocks()) / max(len(a), 1), [(t, ''.join(a[i:j]), ''.join(b[k:l])) for t, i, j, k, l in sm.get_opcodes() if t != 'equal']
def run(f, **kw):
    seg, _ = m.transcribe(f, language='zh', word_timestamps=True, vad_filter=False, condition_on_previous_text=False, **kw)
    return [{'w': x.word, 's': round(x.start, 3), 'e': round(x.end, 3)} for s in seg for x in s.words]
meta = json.load(open('tts/meta.json')); only = set(map(int, sys.argv[1:]))
old = {x['n']: x for x in json.load(open('tts/words.json'))} if os.path.exists('tts/words.json') else {}
out = []
for r in meta:
    if only and r['n'] not in only and r['n'] in old: out.append(old[r['n']]); continue
    best = None
    for tag, kw in (('noprompt', {}), ('neutral', {'initial_prompt': '以下是普通话句子。'}), ('say', {'initial_prompt': r['say']})):
        w = run(r['file'], **kw); sc, diff = judge(r['say'], w)
        print(r['n'], tag, round(sc, 2), ''.join(x['w'] for x in w), diff if diff else '', flush=True)
        if best is None or sc > best[0]: best = (sc, tag, w, diff)
        if sc >= .9: break
    out.append({'n': r['n'], 'words': best[2], 'src': best[1], 'match': round(best[0], 3), 'diff': best[3]})
    json.dump(out + [old[x] for x in old if x > r['n']], open('tts/words.json', 'w'), ensure_ascii=False)
print('WORDS_DONE', [(x['n'], x['match']) for x in out if x.get('match', 1) < .95], flush=True)
