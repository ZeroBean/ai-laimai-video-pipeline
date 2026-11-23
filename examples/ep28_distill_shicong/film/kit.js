// 第28期《国产AI，师从美国？》：亮底 + 两种压力色（克劳德橙＝反蒸馏、英伟达绿＝算力），时间轴是主线。
// 实拍/网页原件满屏原样，不压暗；模拟界面标「界面示意」。
const W=1080,H=1920,ZH="'Noto Sans CJK SC',sans-serif",EN="'Liberation Sans','Noto Sans',sans-serif",HAND="'LongCang','Noto Sans CJK SC',cursive";
const C={paper:'#F3F4F1',paper2:'#E8EAE5',ink:'#1C1F24',sub:'#5E646C',dim:'#9AA0A8',line:'#C9CDC6',
 or:'#D97757',orL:'#F4C3AE',gr:'#76B900',grL:'#CFE8A0',white:'#FFFFFF'};
const root=document.getElementById('wrap');
function div(p,st={},html){const e=document.createElement('div');e.style.position='absolute';e.style.boxSizing='border-box';Object.assign(e.style,st);if(html!==undefined)e.innerHTML=html;p.appendChild(e);return e;}
function img(p,src,st={}){const e=document.createElement('img');e.src=src;e.style.position='absolute';Object.assign(e.style,st);p.appendChild(e);return e;}
const GRAIN=`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
// 纸底：浅冷白 + 很淡的顶光 + 纸纹颗粒
function paper(){root.innerHTML='';root.style.background=C.paper;
 div(root,{inset:0,background:'radial-gradient(120% 60% at 50% 20%, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 70%)'});
 div(root,{inset:0,opacity:.16,mixBlendMode:'multiply',backgroundImage:GRAIN});}
// 实拍满屏（cover），可旋转；只在底部字幕区加一点渐变保字幕，不整体压暗
function footage(src,o={}){root.innerHTML='';root.style.background='#000';
 const box=div(root,{inset:0,overflow:'hidden'});
 if(o.rot){img(box,src,{left:'50%',top:'50%',width:(o.w||H*1.78)+'px',transform:`translate(-50%,-50%) rotate(${o.rot}deg) scale(${o.s||1})`,filter:o.f||'none'});}
 else img(box,src,{left:0,top:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:o.pos||'50% 50%',transform:`scale(${o.s||1})`,filter:o.f||'none'});
 if(!o.noShade)div(root,{left:0,right:0,bottom:0,height:'520px',background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 100%)'});
 return box;}
const STROKE={webkitTextStroke:'12px #111317',paintOrder:'stroke fill'};
function hud(t){div(root,{right:'56px',top:'84px',font:`900 32px ${ZH}`,color:C.white,...STROKE,webkitTextStroke:'7px #111317',zIndex:50},'AI来龙去脉');
 div(root,{left:0,bottom:0,height:'6px',width:(W*t)+'px',background:'#fff',boxShadow:'0 0 0 1px rgba(0,0,0,.25)',opacity:.9,zIndex:50});}
function caption(html,top){div(root,{left:'30px',right:'30px',top:(top||1560)+'px',textAlign:'center',font:`900 68px/1.25 ${ZH}`,color:C.white,...STROKE,zIndex:40},html);}
function mock(x,y,txt){div(root,{left:x+'px',top:y+'px',padding:'5px 12px',borderRadius:'8px',background:'rgba(28,31,36,.08)',font:`600 21px ${ZH}`,color:'#7A8088',zIndex:30},txt||'界面示意');}
function srcTag(x,y,s,o={}){div(root,{left:x+'px',top:y+'px',padding:'6px 14px',borderRadius:'8px',background:o.dark?'rgba(0,0,0,.55)':'rgba(255,255,255,.85)',font:`600 22px ${ZH}`,color:o.dark?'#E6E8EB':'#4A5058',zIndex:30},s);}
// 网页原件：按原图尺寸放大取一块，带投影的纸边
function page(src,x,y,w,h,o={}){const b=div(root,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',overflow:'hidden',background:'#fff',boxShadow:o.flat?'none':'0 30px 80px rgba(0,0,0,.28)',borderRadius:(o.r||0)+'px',transform:`rotate(${o.rot||0}deg)`,zIndex:o.z||5});
 img(b,src,{left:(o.ix||0)+'px',top:(o.iy||0)+'px',width:(o.iw||w)+'px'});return b;}
// 橙/绿印章
function stamp(x,y,txt,col,o={}){return div(root,{left:x+'px',top:y+'px',padding:'10px 22px',border:`5px solid ${col}`,borderRadius:'12px',color:col,font:`900 ${o.fs||46}px ${ZH}`,transform:`rotate(${o.rot||-8}deg)`,background:o.bg||'rgba(255,255,255,.55)',opacity:.95,zIndex:o.z||20,letterSpacing:'2px'},txt);}
const OR=s=>`<span style="color:${C.or}">${s}</span>`,GN=s=>`<span style="color:${C.gr}">${s}</span>`;
