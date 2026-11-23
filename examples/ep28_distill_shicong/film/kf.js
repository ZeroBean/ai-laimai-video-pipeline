// 关键帧：renderKF(编号)。进度条按全片 94 秒算。
const KTOTAL=94;
const doy=(m,d)=>[0,31,59,90,120,151,181,212,243,273,304,334][m-1]+d;
const TODAY=doy(11,23);
// 发布点（官方记录：DeepSeek api-docs 新闻、docs.z.ai、千问 changelog、Kimi 开放平台 changelog 月份 + IT之家/每经/新浪 具体日期）
const LANES=[
 {k:'mm',name:'MiniMax',pts:[[doy(2,12),'M2.5',1,'mm_m25'],[doy(3,18),'M2.7',1,'mm_m27'],[doy(6,1),'M3',1,'mm_m3'],[doy(10,19),'M3.1 Flash',0,'mm_m31f']]},
 {k:'ds',name:'DeepSeek',pts:[[doy(4,24),'V4 预览版',1],[doy(8,13),'V4-Pro',1,'ds_v4pro'],[doy(9,10),'V4.1-Flash',0],[doy(10,17),'',0]]},
 {k:'zp',name:'智谱',pts:[[doy(2,12),'GLM-5',1],[doy(4,7),'GLM-5.1',1],[doy(6,16),'GLM-5.2',1],[doy(8,14),'GLM-5.3',1,'zp_53'],[doy(8,26),'',0]]},
 {k:'qw',name:'千问',pts:[[doy(2,16),'Qwen3.5',1],[doy(4,2),'Qwen3.6-Plus',1],[doy(8,3),'Qwen3.8-Max',1,'qw_38'],[doy(11,15),'Qwen4-Max',1,'f_qwen4']]},
 {k:'km',name:'Kimi',pts:[[doy(1,27),'K2.5',1],[doy(4,20),'K2.6',1],[doy(6,12),'K2.7 Code',0],[doy(7,17),'K3',1,'km_k3'],[doy(10,24),'K3.1 Pro',1,'f_k31']]}];
const FLAGS_OR=[[doy(2,23),'2.23','指控'],[doy(9,11),'9.11','再指控'],[doy(10,12),'10.12','防护升级'],[doy(11,20),'11.20','OpenAI 新规']];
const FLAGS_GR=[[doy(11,16),'11.16','算力新规'],[doy(11,17),'11.17','H200 停供']];
function svgRoot(){const NS='http://www.w3.org/2000/svg';const sv=document.createElementNS(NS,'svg');sv.setAttribute('width',W);sv.setAttribute('height',H);sv.style.position='absolute';sv.style.left=0;sv.style.top=0;sv.style.zIndex=3;root.appendChild(sv);
 const el=(n,a,par)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(par||sv).appendChild(e);return e;};
 el('defs',{}).innerHTML=`<pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="${C.paper2}"/><line x1="0" y1="0" x2="0" y2="14" stroke="#B9BEB6" stroke-width="5"/></pattern>
 <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-opacity=".22"/></filter>`;
 return el;}
function txt(el,x,y,s,o={}){const t=el('text',{x,y,fill:o.c||C.ink,'font-size':o.fs||28,'font-family':o.en?'Liberation Sans':'Noto Sans CJK SC','font-weight':o.fw||700,'text-anchor':o.a||'middle',opacity:o.op||1});t.textContent=s;return t;}
function thumb(src,x,y,w,h,o={}){const b=div(root,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',overflow:'hidden',borderRadius:'10px',background:'#fff',boxShadow:'0 10px 26px rgba(0,0,0,.25)',border:'3px solid #fff',zIndex:8,transform:`rotate(${o.rot||0}deg)`});
 img(b,'img/'+src+(src.startsWith('f_')?'.jpg':'.png'),src.startsWith('f_')?{left:0,top:0,width:'100%',height:'100%',objectFit:'cover'}:{left:(o.ix||-w*0.15)+'px',top:(o.iy||-10)+'px',width:(o.iw||w*1.3)+'px'});return b;}
// 时间轴：view={d0,d1,x0,x1} 日期→横坐标；lanes 的 y；focus=只看某条泳道
function timeline(v,ys,o={}){const el=svgRoot();const X=d=>v.x0+(d-v.d0)/(v.d1-v.d0)*(v.x1-v.x0);
 // 月份刻度
 for(let m=1;m<=11;m++){const d=doy(m,1);if(d<v.d0||d>v.d1)continue;el('line',{x1:X(d),x2:X(d),y1:o.gridTop||ys[0]-110,y2:ys[ys.length-1]+70,stroke:C.line,'stroke-width':2,'stroke-dasharray':'3 9'});
  txt(el,X(d)+6,(ys[ys.length-1]+118),m+'月',{fs:o.mfs||26,c:C.dim,a:'start',fw:700});}
 // 今天
 const xt=X(TODAY);el('line',{x1:xt,x2:xt,y1:(o.gridTop||ys[0]-110)-30,y2:ys[ys.length-1]+80,stroke:C.ink,'stroke-width':4});
 const tg=div(root,{left:(xt-78)+'px',top:((o.gridTop||ys[0]-110)-92)+'px',width:'156px',textAlign:'center',padding:'8px 0',borderRadius:'10px',background:C.ink,color:'#fff',font:`800 28px ${ZH}`,zIndex:9},'今天 11.23');
 LANES.forEach((L,i)=>{const y=ys[i];if(y==null)return;const op=o.focus&&o.focus!==L.k?0.22:1;const g=el('g',{opacity:op});
  el('line',{x1:Math.max(v.x0-20,X(v.d0)),x2:xt,y1:y,y2:y,stroke:'#AEB3AB','stroke-width':4},g);
  if(o.lfs!==0)txt(el,o.labelX||v.x0-10,y-34,L.name,{fs:o.lfs||34,a:'start',fw:900,c:C.ink}).setAttribute('opacity',op);
  // 空白段（还在等）
  if(o.waiting&&o.waiting[L.k]){const [d,lab]=o.waiting[L.k];el('rect',{x:X(d)+14,y:y-15,width:xt-X(d)-28,height:30,rx:8,fill:'url(#hatch)'},g);
   const tw=txt(el,(X(d)+xt)/2,y+62,lab,{fs:o.wfs||34,fw:900,c:C.ink});tw.setAttribute('opacity',op);}
  for(const [d,lab,big] of L.pts){if(d<v.d0)continue;const x=X(d);
   if(big){el('circle',{cx:x,cy:y,r:o.r||16,fill:C.ink,filter:'url(#sh)'},g);el('circle',{cx:x,cy:y,r:(o.r||16)*.42,fill:'#fff'},g);}
   else el('circle',{cx:x,cy:y,r:(o.r||16)*.62,fill:C.paper,stroke:C.ink,'stroke-width':4},g);
   if(lab&&!o.noPtLabel)txt(el,x,y+(o.plo||50),lab,{fs:o.pfs||22,fw:big?800:500,c:big?C.ink:C.sub,en:true}).setAttribute('opacity',op);}
 });
 return {el,X,xt};}
function flag(el,X,d,date,lab,col,y0,y1,o={}){const x=X(d);el('line',{x1:x,x2:x,y1:y0,y2:y1,stroke:col,'stroke-width':3,'stroke-dasharray':'10 8',opacity:.85});
 const up=o.up!==false;const fy=up?y0:y1;
 el('path',{d:`M${x} ${fy} L${x} ${fy+(up?-70:70)}`,stroke:col,'stroke-width':5});
 el('path',{d:up?`M${x} ${fy-70} L${x+(o.dir||1)*62} ${fy-56} L${x} ${fy-42} Z`:`M${x} ${fy+42} L${x+(o.dir||1)*62} ${fy+56} L${x} ${fy+70} Z`,fill:col});
 const lx=x+(o.dir||1)*(o.dir===-1?-10:10);
 div(root,{left:(o.dir===-1?lx-(o.lw||170):lx)+'px',top:(up?fy-140:fy+78)+'px',width:(o.lw||170)+'px',textAlign:o.dir===-1?'right':'left',font:`800 ${o.fs||24}px/1.15 ${ZH}`,color:col,zIndex:9},`${date}<br><span style="font-weight:700;color:${C.ink}">${lab}</span>`);}

function renderKF(n){
 if(n===2){ // 第2句：OpenAI 使用政策原件满屏，原句就地换中文
  root.innerHTML='';root.style.background='#fff';
  const tb=div(root,{left:0,top:0,width:W+'px',height:'720px',overflow:'hidden'});
  img(tb,'img/f_oai_bldg.jpg',{left:'-560px',top:'-40px',height:'900px'});
  srcTag(600,640,'OpenAI 旧金山总部 · CBS 湾区新闻',{dark:true});
  page('img/web_openai_policy_zh.png',0,700,W,1220,{iw:2400,ix:-620,iy:-1122});
  div(root,{left:0,right:0,top:'1380px',height:'540px',background:'linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.92) 45%)',zIndex:6});
  div(root,{left:'56px',top:'628px',padding:'6px 14px',borderRadius:'8px',background:C.ink,font:`800 30px ${EN}`,color:'#fff',zIndex:7},'OpenAI <span style="font:600 26px '+ZH+'">使用政策</span>');
  stamp(620,1200,'11.20 生效',C.or,{fs:46,rot:-7});
  caption('不让别人拿自己的模型，');hud(9.4/KTOTAL);
 }
 if(n===61){ // 第6句第3拍：橙色答案撕成纸条，贴进练习册
  footage('img/f_notebook2.jpg',{rot:90,w:2200,noShade:true});
  const A=['进水管每小时注入 1/3，','出水管每小时放掉 1/5。','每小时净进水 1/3 − 1/5 = 2/15，','注满要 7.5 小时。'];
  const tear=`polygon(0% 6%,3% 0%,7% 5%,11% 1%,16% 6%,21% 0%,26% 4%,31% 1%,37% 6%,42% 0%,48% 5%,54% 1%,60% 6%,66% 0%,72% 4%,78% 1%,84% 6%,90% 0%,95% 5%,100% 1%,100% 94%,96% 100%,91% 95%,85% 100%,79% 94%,73% 99%,67% 95%,61% 100%,55% 94%,49% 99%,43% 95%,37% 100%,31% 94%,25% 99%,19% 95%,13% 100%,7% 94%,2% 99%,0% 95%)`;
  A.forEach((t,i)=>{const s=div(root,{left:(150+(i%2)*26)+'px',top:(800+i*140)+'px',padding:'24px 40px',background:'#FBF7F0',clipPath:tear,transform:`rotate(${[-2.5,1.8,-1.2,2.4][i]}deg)`,font:`700 46px ${ZH}`,color:C.or,boxShadow:'0 8px 18px rgba(0,0,0,.25)',zIndex:6,filter:'drop-shadow(0 8px 10px rgba(0,0,0,.22))'},t);});
  // 胶带
  for(const [x,y,r] of [[120,780,-28],[760,920,24],[130,1210,-22]])div(root,{left:x+'px',top:y+'px',width:'130px',height:'44px',background:'rgba(235,228,205,.72)',transform:`rotate(${r}deg)`,zIndex:7,boxShadow:'0 2px 4px rgba(0,0,0,.08)'});
  // 手写"教材"
  div(root,{left:'330px',top:'560px',font:`400 170px ${HAND}`,color:'#1F2A44',transform:'rotate(-4deg)',zIndex:8,opacity:.92},'教材');
  div(root,{left:'680px',top:'632px',font:`400 64px ${HAND}`,color:C.or,transform:'rotate(-4deg)',zIndex:8},'第 1 册');
  // 计数
  div(root,{right:'70px',top:'1350px',textAlign:'right',zIndex:9},`<div style="font:900 132px/1 ${EN};color:${C.or};${'-webkit-text-stroke:10px #fff;paint-order:stroke fill'}">80<span style="font:900 84px ${ZH}"> 万条</span></div>`);
  srcTag(600,1490,'DeepSeek-R1 论文：80 万条样本');
  caption('再把这些答案整理成教材，',1600);hud(21.2/KTOTAL);
 }
 if(n===62){ // 第6句第4拍：小模型答出橙字（豆包 pro / lite 同题实测原话，不写模型名）
  paper();
  const dlg=(y,w,h,who,bg,lines,small)=>{const b=div(root,{left:((W-w)/2)+'px',top:y+'px',width:w+'px',height:h+'px',borderRadius:'34px',background:bg,boxShadow:'0 24px 60px rgba(0,0,0,.16)',border:'2px solid rgba(0,0,0,.05)',zIndex:5});
   div(b,{right:'34px',top:'30px',maxWidth:'70%',padding:'16px 26px',borderRadius:'26px',background:small?'#D9DBD8':'#EEEFEC',font:`500 ${small?26:30}px/1.4 ${ZH}`,color:'#3A3F46'},'进水管 3 小时注满，出水管 5 小时放完，同时开几小时注满？');
   div(b,{left:'34px',top:(small?150:160)+'px',display:'flex',alignItems:'center',gap:'14px',font:`800 ${small?28:32}px ${ZH}`,color:small?'#6B7178':C.or},`<span style="display:inline-block;width:${small?34:40}px;height:${small?34:40}px;border-radius:50%;background:${small?'#9AA0A8':C.or}"></span>${who}`);
   div(b,{left:'34px',right:'34px',top:(small?210:226)+'px',font:`500 ${small?32:38}px/1.62 ${ZH}`,color:C.or},lines);return b;};
  const M=s=>`<span style="background:linear-gradient(transparent 58%, ${C.orL} 58%);color:#B2532F;font-weight:800">${s}</span>`;
  dlg(250,960,640,'师傅',`#FFFFFF`,`进水管每小时可注入水池容量的 1/3，出水管每小时会放掉 1/5。<br>两管同时打开，每小时的净进水量为 ${M('1/3 − 1/5 = 2/15')}。<br>注满所需时间为 1 ÷ 2/15 = ${M('7.5 小时')}。`);
  dlg(960,860,520,'自己的模型','#E4E6E3',`进水管每小时能注入水池的 1/3，出水管每小时能放出 1/5，两管同时打开时，每小时实际能注入 ${M('1/3 − 1/5 = 2/15')}……需要的时间是 ${M('7.5 小时')}。`,true);
  // 练习册塞进来
  const nb=div(root,{left:'-30px',top:'1330px',width:'200px',height:'250px',overflow:'hidden',borderRadius:'8px',transform:'rotate(-14deg)',boxShadow:'0 16px 34px rgba(0,0,0,.35)',zIndex:7});
  img(nb,'img/f_notebook2.jpg',{left:'50%',top:'50%',width:'470px',transform:'translate(-50%,-50%) rotate(90deg)'});
  div(nb,{left:'26px',top:'70px',font:`400 70px ${HAND}`,color:'#1F2A44',transform:'rotate(-4deg)'},'教材');
  mock(880,1490);srcTag(56,190,'同一道题，两个模型的实际回答（节选）');
  caption('拿去教自己的模型。',1620);hud(22.6/KTOTAL);
 }
 if(n===9){ // 第9句：Anthropic 标题 + 机房实拍上的大数字（2 月博客原数）
  footage('img/f_rack.jpg',{pos:'50% 50%',s:1.04});
  page('img/web_anth_feb_title_zh.png',40,300,1000,200,{iw:1000,iy:-28,r:14,rot:-1.2});
  srcTag(56,530,'Anthropic 官方博客 · 2026-02-23',{dark:true});
  div(root,{left:0,right:0,top:'800px',textAlign:'center',zIndex:9},
   `<div style="font:900 210px/1 ${EN};color:#fff;-webkit-text-stroke:14px #111317;paint-order:stroke fill;letter-spacing:-4px">1600<span style="font:900 120px ${ZH}"> 万次</span></div>
    <div style="margin-top:18px;font:900 76px ${ZH};color:#fff;-webkit-text-stroke:10px #111317;paint-order:stroke fill">和 Claude 的对话</div>
    <div style="display:inline-block;margin-top:44px;padding:14px 34px;border-radius:14px;background:${C.or};font:900 56px ${ZH};color:#fff">约 2.4 万个虚假账号</div>`);
  caption('获取用来训练模型的数据。');hud(35.4/KTOTAL);
 }
 if(n===13){ // 第13句：镜头贴着 MiniMax 泳道走，空白计天数
  paper();
  const v={d0:doy(1,20),d1:doy(11,30),x0:70,x1:1010};
  const {el,X}=timeline(v,[1060],{focus:'mm',pfs:28,lfs:0,r:22,plo:64,gridTop:560});
  // 海报
  const P=[[doy(2,12),'mm_m25',-4],[doy(3,18),'mm_m27',3],[doy(6,1),'mm_m3',-2],[doy(10,19),'mm_m31f',3]];
  const PX=[160,400,640,880];
  P.forEach(([d,s,r],i)=>{const w=i===3?210:236,h=i===3?170:200,ty=i%2?720:600;thumb(s,PX[i]-w/2,ty,w,h,{rot:r,iw:w*1.6,ix:-w*0.3,iy:-4});
   el('path',{d:`M${PX[i]} ${ty+h} L${X(d)} 1036`,stroke:C.ink,'stroke-width':2,fill:'none','stroke-dasharray':'4 6'});});
  // 空白段
  const x0=X(doy(6,1))+26,x1=X(doy(10,19))-18;
  el('rect',{x:x0,y:1045,width:x1-x0,height:30,rx:8,fill:'url(#hatch)'});
  el('path',{d:`M${x0} 1215 L${x0} 1235 L${x1} 1235 L${x1} 1215`,fill:'none',stroke:C.or,'stroke-width':5});
  div(root,{left:x0+'px',width:(x1-x0)+'px',top:'1250px',textAlign:'center',font:`900 100px ${EN}`,color:C.or,zIndex:9},`140<span style="font:900 52px ${ZH}"> 天</span>`);
  div(root,{left:(X(doy(10,19))-80)+'px',top:'1000px',width:'160px',textAlign:'center',font:`700 24px ${ZH}`,color:C.sub,zIndex:9},'');
  div(root,{left:'70px',top:'250px',font:`900 76px/1.2 ${ZH}`,color:C.ink,zIndex:9},`MiniMax<br><span style="font-size:52px;color:${C.sub}">上半年一两个月一更</span>`);
  caption('隔了快四个月，');hud(56.4/KTOTAL);
 }
 if(n===19){ // 第19句：H200 产品片 + 新浪原件
  root.innerHTML='';root.style.background='#0B1020';
  const top=div(root,{left:0,top:0,width:W+'px',height:'1060px',overflow:'hidden'});
  img(top,'img/f_h200c.jpg',{left:'-560px',top:'-40px',height:'1140px'});
  page('img/web_sina_h200.png',0,1000,W,640,{iw:W,iy:-170,flat:false});
  stamp(560,1360,'11.17 财报会确认',C.gr,{fs:42,rot:-5,bg:'rgba(255,255,255,.85)'});
  srcTag(56,1010,'新浪财经 · 2026-11-18');
  caption('不再向中国发 H200 芯片，');hud(82.6/KTOTAL);
 }
 if(n===20){ // 第20句：全景时间轴，橙、绿两排压力事件落下
  paper();
  const v={d0:doy(1,1),d1:doy(11,30),x0:150,x1:1020};
  const ys=[720,870,1020,1170,1300];
  const {el,X,xt}=timeline(v,ys,{noPtLabel:true,lfs:28,r:13,labelX:30,gridTop:600,mfs:22,waiting:{ds:[doy(8,13),''],zp:[doy(8,14),'']}});
  const lab2=(d,date,lab,col,lx,ly,top)=>{const x=X(d);el('line',{x1:x,x2:x,y1:620,y2:1340,stroke:col,'stroke-width':3,'stroke-dasharray':'10 8',opacity:.9});
   el('circle',{cx:x,cy:top?620:1340,r:9,fill:col});el('path',{d:`M${x} ${top?620:1340} L${lx} ${top?ly+70:ly-8}`,stroke:col,'stroke-width':3,fill:'none'});
   div(root,{left:(lx-80)+'px',top:ly+'px',width:'160px',textAlign:'center',padding:'6px 0',borderRadius:'10px',background:col,font:`900 26px/1.2 ${ZH}`,color:'#fff',zIndex:9},`${date}<br><span style="font-weight:700;font-size:22px">${lab}</span>`);};
  [[0,170],[1,520],[2,680],[3,840]].forEach(([i,lx])=>lab2(FLAGS_OR[i][0],FLAGS_OR[i][1],FLAGS_OR[i][2],C.or,lx,470,true));
  [[0,700],[1,880]].forEach(([i,lx])=>lab2(FLAGS_GR[i][0],FLAGS_GR[i][1],FLAGS_GR[i][2],C.gr,lx,1470,false));
  div(root,{left:'56px',top:'250px',font:`900 74px/1.25 ${ZH}`,color:C.ink,zIndex:9},`${OR('反蒸馏')}<span style="color:${C.dim}">　/　</span>${GN('算力收紧')}`);
  div(root,{left:'56px',top:'350px',font:`700 34px ${ZH}`,color:C.sub,zIndex:9},'五家旗舰发布 · 2026 年 1 月至今');
  caption('一边是算力收紧。',1640);hud(88.6/KTOTAL);
 }
}
