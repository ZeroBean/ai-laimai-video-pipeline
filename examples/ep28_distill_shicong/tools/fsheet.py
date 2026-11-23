"""快速总览：按时间点跳着抽帧（输入端 seek，不整条解码）。python fsheet.py 视频 张数 输出.jpg [起 止]"""
import subprocess, sys, json
from PIL import Image, ImageDraw, ImageFont
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import FF, FP, FONT
v,n,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
dur=float(subprocess.run([FP,'-v','error','-show_entries','format=duration','-of','json',v],capture_output=True,text=True).stdout and json.loads(subprocess.run([FP,'-v','error','-show_entries','format=duration','-of','json',v],capture_output=True,text=True).stdout)['format']['duration'])
a=float(sys.argv[4]) if len(sys.argv)>4 else 0; b=float(sys.argv[5]) if len(sys.argv)>5 else dur-1
ts=[a+(b-a)*i/(n-1) for i in range(n)]; ims=[]
ft=ImageFont.truetype(FONT,22)
for t in ts:
    r=subprocess.run([FF,'-v','error','-ss',f'{t:.2f}','-i',v,'-frames:v','1','-vf','scale=320:-2','-f','image2pipe','-vcodec','png','-'],capture_output=True)
    import io; im=Image.open(io.BytesIO(r.stdout)).convert('RGB'); d=ImageDraw.Draw(im); d.rectangle((0,0,92,28),fill='black'); d.text((4,0),f'{t:.0f}s',font=ft,fill='yellow'); ims.append(im)
w,h=ims[0].size; cols=6; rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(w*cols,h*rows),'#222')
for j,im in enumerate(ims): S.paste(im,((j%cols)*w,(j//cols)*h))
S.save(out,quality=85); print(out,len(ims),round(dur))
