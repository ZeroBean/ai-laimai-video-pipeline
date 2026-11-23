// 原句就地换中文：叠层挂在原文段落里（随段落一起排版），先用页面底色抹掉英文，再写高亮中文。返回页面坐标
window.__zhOver=function(ph,zh,col){
 const norm=s=>s.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ');
 const bgOf=e=>{for(;e;e=e.parentElement){const b=getComputedStyle(e).backgroundColor;if(b&&!/rgba\(0, 0, 0, 0\)|transparent/.test(b))return b;}return '#fff';};
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){const t=norm(n.textContent),i=t.indexOf(norm(ph));if(i<0||!n.parentElement.offsetParent)continue;
  const rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+ph.length);
  const rs=[...rg.getClientRects()].filter(r=>r.width>2);if(!rs.length)continue;
  let A=n.parentElement;while(A&&getComputedStyle(A).display==='inline')A=A.parentElement;
  if(getComputedStyle(A).position==='static')A.style.position='relative';
  const aR=A.getBoundingClientRect(),cs=getComputedStyle(n.parentElement),fs=parseFloat(cs.fontSize),lh=rs[0].height,bg=bgOf(n.parentElement);
  const L=Math.min(...rs.map(r=>r.left)),T=Math.min(...rs.map(r=>r.top)),R=Math.max(...rs.map(r=>r.right)),B=Math.max(...rs.map(r=>r.bottom));
  const lay=document.createElement('span');lay.className='zh-over';lay.style.cssText='position:absolute;left:0;top:0;width:0;height:0;z-index:99999;pointer-events:none;display:block';A.appendChild(lay);
  for(const r of rs){const d=document.createElement('span');d.style.cssText=`display:block;position:absolute;left:${r.left-aR.left-1}px;top:${r.top-aR.top}px;width:${r.width+2}px;height:${r.height}px;background:${bg}`;lay.appendChild(d);}
  const tx=document.createElement('span');
  tx.style.cssText=`display:block;position:absolute;left:${L-aR.left}px;top:${T-aR.top}px;width:${R-L+2}px;text-indent:${rs[0].left-L}px;font-family:'Noto Sans CJK SC',sans-serif;font-weight:700;color:#000;line-height:${lh}px;font-size:${fs}px;text-align:left;white-space:normal;word-break:break-all`;
  const hl=document.createElement('span');hl.textContent=zh;hl.style.cssText=`background:linear-gradient(transparent 6%,${col||'#B5F23A'} 6%,${col||'#B5F23A'} 94%,transparent 94%);padding:0 3px;-webkit-box-decoration-break:clone;box-decoration-break:clone`;
  tx.appendChild(hl);lay.appendChild(tx);
  let f=fs;while(tx.scrollHeight>(B-T)+1&&f>8){f-=0.5;tx.style.fontSize=f+'px';}
  return {y0:T+scrollY,y1:B+scrollY};}
 return null;};
