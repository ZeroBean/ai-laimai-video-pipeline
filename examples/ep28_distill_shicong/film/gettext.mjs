import { CHROME } from './cfg.mjs';
import puppeteer from 'puppeteer-core';
const [url]=process.argv.slice(2);
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox']});
const p=await b.newPage();const r=await p.goto(url,{waitUntil:'networkidle2',timeout:90000});await new Promise(r=>setTimeout(r,2000));
console.log('STATUS',r.status());console.log((await p.evaluate(()=>document.body.innerText)).slice(0,+(process.argv[3]||4000)));await b.close();
