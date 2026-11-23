import { CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core';
const dir=new URL('.',import.meta.url);
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1080,height:1920,deviceScaleFactor:1});
p.on('pageerror',e=>{console.error('PAGE ERROR',e.message);process.exit(1)});
await p.goto(new URL('index_kf.html',dir).href);await p.waitForFunction('window.READY===true',{timeout:60000});
for(const n of process.argv.slice(2)){await p.evaluate(async n=>{renderKF(n);await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await new Promise(r=>setTimeout(r,600));},+n);
 await (await p.$('#wrap')).screenshot({path:new URL(`../kf/kf${String(n).padStart(2,"0")}.jpg`,dir).pathname,type:'jpeg',quality:92});console.log('kf',n);}
await b.close();
