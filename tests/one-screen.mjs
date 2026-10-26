import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const root=process.env.TEST_URL||'http://127.0.0.1:5173/';
const browser=await chromium.launch({channel:'chrome'});await mkdir('test-results',{recursive:true});
try{
 for(const size of [[375,667],[390,844],[430,932],[1440,900]]){
  const page=await browser.newPage({viewport:{width:size[0],height:size[1]},reducedMotion:'reduce'});
  for(const path of ['', 'v2/', 'v3/', 'v4/'])for(const lang of ['ko','en','ru','vi','az']){
   await page.goto(`${root}${path}?lang=${lang}`);await page.evaluate(()=>document.fonts.ready);await page.locator('.screen-sender').waitFor();assert.equal(await page.locator('a[href="https://www.heerim.com/en/"]').count(),1);assert.match(await page.locator('link[rel="icon"]').getAttribute('href'),/heerim-h\.svg/);await page.waitForTimeout(350);
   const bounds=await page.evaluate(()=>{const b=document.querySelector('.screen-copy').getBoundingClientRect(),i=document.querySelector('.screen-copy-inner').getBoundingClientRect();return {scroll:document.documentElement.scrollHeight,h:innerHeight,w:innerWidth,sw:document.documentElement.scrollWidth,bottom:i.bottom,limit:b.bottom,scale:document.querySelector('.screen-copy-inner').style.transform,scrollHeight:document.querySelector('.screen-copy-inner').scrollHeight,offsetHeight:document.querySelector('.screen-copy-inner').offsetHeight};});
   assert.ok(bounds.scroll<=bounds.h+1,JSON.stringify({path,lang,size,bounds}));assert.ok(bounds.sw<=bounds.w+1);assert.ok(bounds.bottom<=bounds.limit+2,JSON.stringify({path,lang,size,bounds}));
   if(lang==='ko'||lang==='ru')await page.screenshot({path:`test-results/screen-${path.replace('/','')||'v1'}-${lang}-${size[0]}.png`});
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(`${root}v3/`);await page.waitForTimeout(7800);assert.equal(await page.locator('video').evaluate(v=>v.ended),true);assert.equal(await page.locator('.video-copy-ready').count(),1);const time=await page.locator('video').evaluate(v=>v.currentTime);await page.waitForTimeout(1600);assert.equal(await page.locator('video').evaluate(v=>v.currentTime),time);await page.screenshot({path:'test-results/v3-completed-hold.png'});
 await page.goto(`${root}v4/`);await page.locator('.outline-copy-stage.is-ready').waitFor({timeout:12000});await page.waitForTimeout(1700);await page.screenshot({path:'test-results/v4-morph-complete.png'});
 console.log('PASS: 80 viewport/language/version combinations fit without scrolling; v3 holds final frame; v4 completes morph.');
}finally{await browser.close();}
