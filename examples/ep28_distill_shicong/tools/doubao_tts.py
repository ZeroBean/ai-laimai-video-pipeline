"""豆包语音合成 2.0：整段文本一次合成（HTTP 单向流式）"""
import base64, json, os, sys, urllib.request
def key():
    k = os.environ.get("DOUBAO_SPEECH_KEY")
    if not k: raise SystemExit("缺环境变量 DOUBAO_SPEECH_KEY（火山引擎豆包语音合成 2.0 的 API Key）")
    return k
def tts(text, speaker, out, rate=0, ctx=None, res="seed-tts-2.0", sr=48000):
    rp = {"text": text, "speaker": speaker, "audio_params": {"format": "mp3", "sample_rate": sr, "bit_rate": 192000, "speech_rate": rate}}
    if ctx: rp["additions"] = json.dumps({"context_texts": [ctx]}, ensure_ascii=False)
    req = urllib.request.Request("https://openspeech.bytedance.com/api/v3/tts/unidirectional", method="POST",
        data=json.dumps({"user": {"uid": "aivideo"}, "req_params": rp}, ensure_ascii=False).encode(),
        headers={"X-Api-Key": key(), "X-Api-Resource-Id": res, "Content-Type": "application/json"})
    buf = b""; err = None
    with urllib.request.urlopen(req, timeout=120) as r:
        for ln in r:
            ln = ln.strip()
            if not ln: continue
            j = json.loads(ln)
            if j.get("data"): buf += base64.b64decode(j["data"])
            elif j.get("code") not in (0, 20000000): err = j
    if not buf: raise RuntimeError(err)
    open(out, "wb").write(buf); return len(buf)
if __name__ == "__main__":
    print(tts(sys.argv[1], sys.argv[2], sys.argv[3]))
