"""本期公共配置：路径一律相对本期目录；外部程序和密钥从环境变量读（见仓库根目录 .env.example）"""
import os, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]                       # 本期目录（tools/ 的上一级）
FF = os.environ.get('FFMPEG') or shutil.which('ffmpeg') or 'ffmpeg'
FP = os.environ.get('FFPROBE') or shutil.which('ffprobe') or 'ffprobe'
WHISPER = os.environ.get('WHISPER_MODEL', 'small')               # faster-whisper 模型名或本地目录
FONT = os.environ.get('CJK_FONT', '/usr/share/fonts/google-noto-cjk/NotoSansCJK-Bold.ttc')
def need(name):
    v = os.environ.get(name)
    if not v: raise SystemExit(f'缺环境变量 {name}，见 .env.example')
    return v
