// 官方发布页头图截图：node shot_page.mjs url out.png [w] [h]
import { CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core';
const [url,out,w='1280',h='1500']=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const p=await b.newPage();await p.setViewport({width:+w,height:+h,deviceScaleFactor:1.5});
const r=await p.goto(url,{waitUntil:'networkidle2',timeout:100000}).catch(e=>null);await new Promise(r=>setTimeout(r,+(process.env.WAIT||7000)));
await p.evaluate(()=>{for(const b of document.querySelectorAll('a,button')){if(/^(accept|agree|got it|同意|知道了|接受)/i.test(b.textContent.trim()))b.click();}
 for(const e of document.querySelectorAll('body *')){const s=getComputedStyle(e);if(s.position==='fixed'&&e.getBoundingClientRect().height<500&&e.getBoundingClientRect().top>60)e.style.display='none';}});
await new Promise(r=>setTimeout(r,800));await p.screenshot({path:out});console.log(r&&r.status(),out,await p.title());await b.close();
