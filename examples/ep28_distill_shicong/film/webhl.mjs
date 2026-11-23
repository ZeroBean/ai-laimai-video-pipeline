// 真网页原句高亮截图：node webhl.mjs url cuts.json 宽度 → ../素材/网页/web_<key>.png（+ _clean 无高亮版）
import { CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core'; import fs from 'fs';
const [url,cutsF,W='760',DPRA]=process.argv.slice(2); const CUTS=JSON.parse(fs.readFileSync(cutsF));
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const p=await b.newPage();if(process.env.NOJS)await p.setJavaScriptEnabled(false);await p.emulateTimezone('Asia/Shanghai');await p.setViewport({width:+W,height:1400,deviceScaleFactor:DPRA?+DPRA:1080/ +W});
await p.goto(url,{waitUntil:'networkidle2',timeout:100000});await new Promise(r=>setTimeout(r,7000));
await p.evaluate(()=>{for(const b of document.querySelectorAll('a,button')){if(/^(accept|reject|only essential|refuse|agree|i accept|got it)/i.test(b.textContent.trim())){b.click();}}});
await p.addStyleTag({content:'[id*=cookie],[class*=cookie],[id*=consent],[class*=consent],[class*=paywall],[class*=newsletter],[class*=popup],[class*=modal],iframe,[id*=taboola],[class*=taboola],[id*=outbrain],[class*=outbrain],[class*=Ad_],[class*=ad-],[id^=ad],[class*=sponsor]{display:none!important}'});
await new Promise(r=>setTimeout(r,1200));if(process.env.HIDEFIXED)await p.evaluate(()=>{for(const e of document.querySelectorAll('body *')){const s=getComputedStyle(e);if(s.position==='fixed'&&e.getBoundingClientRect().height<1500)e.style.display='none';}});
const ZO=fs.readFileSync(new URL('zhover.js',import.meta.url),'utf8');
for(const c of CUTS){
 await p.evaluate(r=>{window.__rep2=r},c.rep2||null);
 if(c.zh){await p.evaluate(ZO);await p.evaluate(()=>document.querySelectorAll('.zh-over').forEach(e=>e.remove()));
  if(c.rep)await p.evaluate(rep=>{const w0=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let q;while(q=w0.nextNode()){for(const [a,b] of rep){if(q.textContent.trim()===a)q.textContent=b;}}},c.rep);
  let box=null;for(let i=0;i<c.ph.length;i++){if(!c.zh[i]){continue;}const r=await p.evaluate((a,b,cl)=>window.__zhOver(a,b,cl),c.ph[i],c.zh[i],(c.cols||[])[i]||null);if(r)box=box?{y0:Math.min(box.y0,r.y0),y1:Math.max(box.y1,r.y1)}:r;else console.log('MISS',c.key,i);}
  if(!box)continue;await new Promise(r=>setTimeout(r,300));
  const cy=(box.y0+box.y1)/2,h=c.h||Math.round(+W*1.25),clip={x:0,y:Math.max(0,cy-h*(c.at||0.5)),width:+W,height:h};
  await p.screenshot({path:`../素材/网页/web_${c.key}_zh.png`,clip,captureBeyondViewport:true});console.log('zh',c.key,Math.round(cy));continue;}
 const box=await p.evaluate((ph,col,zh,rep,cols)=>{
  if(window.__rep2){for(const [a,b] of window.__rep2){const w1=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let q;while(q=w1.nextNode()){const t=q.textContent.replace(/[‘’]/g,"'");const i=t.indexOf(a);if(i>=0){q.textContent=t.slice(0,i)+b+t.slice(i+a.length);break;}}}}
  if(rep){const w0=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let q;while(q=w0.nextNode()){for(const [a,b] of rep){if(q.textContent.trim()===a)q.textContent=b;}}}document.querySelectorAll('mark.hl').forEach(m=>m.replaceWith(...m.childNodes));
  const norm=s=>s.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ');let r=null;
  for(const [si,s] of ph.entries()){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
   while(n=w.nextNode()){const t=norm(n.textContent),i=t.indexOf(norm(s));if(i<0||!n.parentElement.offsetParent)continue;
    const rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+s.length);if(rg.getBoundingClientRect().width<2)continue;const m=document.createElement('mark');m.className='hl';
    const cc=(cols&&cols[si])||col;m.style.cssText=`background:linear-gradient(transparent 8%,${cc} 8%,${cc} 92%,transparent 92%);color:#000;padding:0 2px;-webkit-box-decoration-break:clone`;rg.surroundContents(m);if(zh&&zh[si]){m.textContent=zh[si];m.style.fontFamily="'Noto Sans CJK SC',sans-serif";m.style.fontWeight='700';}
    const bb=m.getBoundingClientRect();const y=bb.top+scrollY;r=r?{y0:Math.min(r.y0,y),y1:Math.max(r.y1,y+bb.height)}:{y0:y,y1:y+bb.height};break;}}
  return r;},c.ph,c.col||'#B5F23A',c.zhin||null,c.rep||null,c.cols||null);
 if(!box){console.log('MISS',c.key);continue;}
 await p.evaluate(()=>document.querySelector('mark.hl').scrollIntoView({block:'center'}));await new Promise(r=>setTimeout(r,c.wait||2500));
 const b2=await p.evaluate(()=>{let y0=1e9,y1=-1e9;document.querySelectorAll('mark.hl').forEach(m=>{const bb=m.getBoundingClientRect();y0=Math.min(y0,bb.top+scrollY);y1=Math.max(y1,bb.bottom+scrollY);});return {y0,y1};});if(b2.y1>b2.y0)Object.assign(box,b2);else console.log("WARN mark gone",c.key);
 const cy=(box.y0+box.y1)/2,h=c.h||Math.round(+W*1.25),clip={x:0,y:Math.max(0,cy-h*(c.at||0.5)),width:+W,height:h};
 const suf=c.zhin||c.rep?'_zh':'';await p.screenshot({path:`../素材/网页/web_${c.key}${suf}.png`,clip,captureBeyondViewport:true});
 if(!suf){await p.evaluate(()=>document.querySelectorAll('mark.hl').forEach(m=>{m.style.background='transparent';m.style.color='';}));
 await p.screenshot({path:`../素材/网页/web_${c.key}_clean.png`,clip,captureBeyondViewport:true});}console.log('ok',c.key,Math.round(cy));}
await b.close();
