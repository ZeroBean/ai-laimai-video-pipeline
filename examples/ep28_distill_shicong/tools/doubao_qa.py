"""第28期第6句：同一道题，大模型（师傅）和小模型各答一遍，原样存档。密钥读环境变量 ARK_API_KEY，不打印。在本期目录下运行"""
import json, time, urllib.request, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import need
def key(): return need('ARK_API_KEY')
def chat(model, messages):
    req = urllib.request.Request('https://ark.cn-beijing.volces.com/api/v3/chat/completions', json.dumps({'model': model, 'messages': messages, 'thinking': {'type': 'disabled'}}, ensure_ascii=False).encode(), {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key()})
    d = json.load(urllib.request.urlopen(req, timeout=300)); return d['choices'][0]['message']['content'], d.get('model')
Q = '一个水池，单开进水管 3 小时能注满，单开出水管 5 小时能放完。两个管子同时打开，几小时能注满？请用三四句话讲清楚。'
for tag, m in [('师傅', sys.argv[1]), ('小模型', sys.argv[2])]:
    try:
        msgs = [{'role': 'user', 'content': Q}]; r, mm = chat(m, msgs)
        json.dump({'time': time.strftime('%F %T'), 'model': mm, 'messages': msgs, 'reply': r}, open(f'资料/豆包实测/{tag}.json', 'w'), ensure_ascii=False, indent=1); print(tag, mm, '\n', r, '\n')
    except Exception as e: print(tag, m, 'ERR', e)
