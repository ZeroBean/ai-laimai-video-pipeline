"""第28期时间轴：整句配音 → film/timeline.js、tts/timeline.json。覆盖率不够直接报错"""
import json, re, difflib
from pypinyin import lazy_pinyin
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import ROOT
R = str(ROOT) + '/'
meta = json.load(open(R + 'tts/meta.json')); words = json.load(open(R + 'tts/words.json'))
SC = {1:['国产 AI 更新变慢，','是因为美国 AI {o|不让学了}吗？'],
2:['最近，','做 Claude 的 Anthropic，','还有做 ChatGPT 的 OpenAI，','都在收紧一件事：','不让别人拿自己的模型，','去{o|训练竞争对手}。'],
3:['甚至连 AI 的部分思考过程，','也{o|藏了起来}。'],
4:['它们防的，就是{o|蒸馏}。'],
5:['什么叫蒸馏？'],
6:['你可以把更强的模型，','当成一个{o|师傅}。','让它做题、给答案，','再把这些答案整理成{o|教材}，','拿去教自己的模型。'],
7:['这个方法在 AI 圈','其实{o|很常见}。'],
8:['DeepSeek 就公开过，','用自己的 R1 当“师傅”，','训出了{o|好几个小模型}。'],
9:['但这次，','Anthropic 公开指控，','有几家国内 AI 公司','通过{o|大量账号}和 Claude 对话，','获取用来训练模型的数据。'],
10:['月之暗面此前','也回应过蒸馏质疑，','表示 Kimi K3 的性能提升','来自{y|底层架构创新}，','并非蒸馏复刻现有模型。'],
11:['那限制变严之后，','国产模型的更新，','真的{y|慢下来了}吗？'],
12:['把时间线摆出来看，','各家其实{y|不太一样}。'],
13:['比如 MiniMax，','上半年基本一两个月就更一次，','但 6 月发完 M3 之后，','隔了{y|快四个月}，','到 10 月才补了一个','轻量版 M3.1 Flash。'],
14:['像 DeepSeek 和智谱，','距离上一代大版本旗舰，','也都隔了{y|三个月以上}。'],
15:['再看千问和 Kimi。'],
16:['千问 8 月发了 Qwen3.8-Max，','11 月又出了 Qwen4-Max。','Kimi 7 月发 K3，','10 月也更新了 K3.1 Pro。'],
17:['所以光看发布时间，','很难把变慢','全算在{o|反蒸馏}头上。'],
18:['因为同一时间，','{g|算力}这头的压力也在变大。'],
19:['外部芯片的口子越收越紧，','英伟达确认','不再向中国发 {g|H200} 芯片，','美国也在收紧','{g|海外算力}的租用限制。'],
20:['一边是{o|反蒸馏}，','一边是{g|算力收紧}。'],
21:['接下来，','国产旗舰模型的更新周期，','是不是会{y|普遍拉长}？']}
PARA = {4,5,11,12,15,17,18,20,21}
V = '素材/视频/'
CLIPS = {}
clean = lambda s: re.sub(r'[^一-鿿A-Za-z0-9]', '', s)
plain = lambda s: re.sub(r'\{[cpyog]\|(.*?)\}', r'\1', s)
SAY = (('Qwen3.8-Max', 'Qwen三点八 Max'), ('Qwen4-Max', 'Qwen四 Max'), ('M3.1 Flash', 'M三点一 Flash'), ('K3.1 Pro', 'K三点一 Pro'), ('H200', 'H二百'), ('6 月', '六月'), ('8 月', '八月'), ('10 月', '十月'), ('11 月', '十一月'), ('7 月', '七月'))
NUMS = {13:[('31','三点一'),('10','十'),('6','六'),('4','四')],16:[('K5Win','Qwen'),('38','三点八'),('K31Pro','K三点一Pro'),('K310','K3十'),('11','十一'),('8','八'),('7','七'),('4','四')],19:[('200','二百')]}
NUM = ()
def tosay(s):
    for a, b in SAY: s = s.replace(a, b)
    return s
def parts(s):
    out = []; pos = 0
    for m in re.finditer(r'\{([cpyog])\|(.*?)\}', s):
        if m.start() > pos: out.append([s[pos:m.start()], ''])
        out.append([m.group(2), m.group(1)]); pos = m.end()
    if pos < len(s): out.append([s[pos:], ''])
    return out
py1 = lambda x: [lazy_pinyin(c)[0].lower() for c in x]
def align(say, ws, dur, NUM=()):
    ref = clean(say); asr, tm = '', []
    for w in ws:
        c = clean(w['w'])
        asr += c
        for k in range(len(c)): tm.append(w['s'] + (w['e'] - w['s']) * k / max(len(c), 1))
    for d, z in NUM:  # 数字整串换成汉字读法，时间下标按比例摊开
        i = asr.find(d)
        while i >= 0:
            t0 = tm[i]; t1 = tm[i + len(d)] if i + len(d) < len(tm) else dur
            asr = asr[:i] + z + asr[i + len(d):]; tm[i:i + len(d)] = [t0 + (t1 - t0) * k / len(z) for k in range(len(z))]
            i = asr.find(d, i + len(z))
    blocks = difflib.SequenceMatcher(None, py1(ref), py1(asr), autojunk=False).get_matching_blocks()
    cover = sum(b.size for b in blocks) / len(ref)
    assert cover >= .85, ('逐字对时覆盖率太低，字幕会错位', say, round(cover, 2), asr)
    T = [None] * (len(ref) + 1)
    for a, b, n in blocks:
        for k in range(n): T[a + k] = tm[b + k]
    T[0] = T[0] if T[0] is not None else 0.0
    T[-1] = dur
    idx = [i for i, x in enumerate(T) if x is not None]
    for a, b in zip(idx, idx[1:]):
        for i in range(a + 1, b): T[i] = T[a] + (T[b] - T[a]) * (i - a) / (b - a)
    return ref, T
out, t = [], .2
for k, m in enumerate(meta):
    n = m['n']
    if k: t += (.32 if n in PARA else .22)
    ref, T = align(m['say'], words[k]['words'], m['dur'], NUMS.get(n, ()))
    pos, scr = 0, []
    for s in SC[n]:
        c = clean(tosay(plain(s))); L = len(c)
        assert ref[pos:pos+L] == c, (n, s, ref[pos:pos+L], c)
        scr.append({'t': round(t + T[pos], 2), 'e': round(t + T[pos+L], 2), 'p': parts(s)}); pos += L
        if len(clean(plain(s))) > 14: print('超14字', n, s)
    assert pos == len(ref), (n, pos, len(ref))
    scr[0]['t'] = round(t, 2)
    out.append({'n': n, 's': round(t, 2), 'e': round(t + m['dur'], 2), 'scr': scr, 'ref': ref, 'ct': [round(x, 3) for x in T], 'base': round(t, 3), 'file': m['file']})
    t += m['dur']
    if n in CLIPS:
        key, src, a, b, caps = CLIPS[n]; t += .3; d = round(b - a, 2)
        scr = [{'t': round(t + r, 2), 'e': round(t + (caps[i + 1][0] if i + 1 < len(caps) else d), 2), 'p': parts(x)} for i, (r, x) in enumerate(caps)]
        out.append({'n': key, 's': round(t, 2), 'e': round(t + d, 2), 'scr': scr, 'ref': '', 'ct': [], 'base': round(t, 3), 'clip': [a, b], 'src': src})
        t += d + .3
TOTAL = round(out[-1]['e'] + 1.4, 2)
json.dump(out, open(R + 'tts/timeline.json', 'w'), ensure_ascii=False)
js = "// 由 tools/gen_timeline.py 按配音生成，别手改\nconst TL = " + json.dumps(out, ensure_ascii=False) + f";\nconst TOTAL = {TOTAL};\n"
js += "const SN=n=>TL.find(L=>L.n===n),S=n=>SN(n).s,E=n=>SN(n).e,T0=(n,k=0)=>SN(n).scr[k].t,CE=(n,k=0)=>SN(n).scr[k].e;\nfunction AT(n,w){const i=SN(n).ref.indexOf(w);if(i<0)throw new Error('AT '+n+' '+w);return SN(n).base+SN(n).ct[i];}\n"
open(R + 'film/timeline.js', 'w').write(js)
print('TOTAL', TOTAL, 'frames', round(TOTAL * 30)); print(' '.join(f"{L['n']}:{L['s']}" for L in out))
