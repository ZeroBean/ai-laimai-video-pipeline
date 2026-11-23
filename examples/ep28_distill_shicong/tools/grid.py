import sys,glob,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import FONT
from PIL import Image,ImageDraw,ImageFont
fs=sys.argv[2:];out=sys.argv[1];ft=ImageFont.truetype(FONT,26)
w,h=360,640;cols=8;rows=(len(fs)+cols-1)//cols;S=Image.new('RGB',(cols*(w+6),rows*(h+36)),'#222');d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    x=(i%cols)*(w+6);y=(i//cols)*(h+36);d.text((x+4,y+2),f.split('still_')[-1][:-4],font=ft,fill='#FFD54A');S.paste(Image.open(f).resize((w,h)),(x,y+34))
S.save(out,quality=82)
