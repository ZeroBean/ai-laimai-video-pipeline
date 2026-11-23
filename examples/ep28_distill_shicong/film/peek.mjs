import { CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core';
const [url,out,w=430,h=932]=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
const p=await b.newPage();await p.setViewport({width:+w,height:+h,deviceScaleFactor:2});
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
await p.goto(url,{waitUntil:'networkidle2',timeout:90000});await new Promise(r=>setTimeout(r,4000));
await p.screenshot({path:out,fullPage:true});console.log(await p.evaluate(()=>document.body.scrollHeight));await b.close();
