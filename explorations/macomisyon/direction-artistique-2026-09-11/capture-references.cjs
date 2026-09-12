const { chromium } = require('playwright');
const path = require('node:path');
(async () => {
 const browser=await chromium.launch({headless:true});
 const refs=[['macojaune','https://macojaune.com'],['shootareas','https://shootareas.marvinl.com'],['quilivreou','https://quilivreou.marvinl.com'],['marvinl','https://marvinl.com'],['zikak','https://zikak-dev.marvinl.com'],['omasla','https://omasla.fr'],['memebank','https://memebank-dev.marvinl.com']];
 const out=await Promise.allSettled(refs.map(async([name,url])=>{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const r=await page.goto(url,{waitUntil:'networkidle',timeout:30000}).catch(async()=>null);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(__dirname,'references',name+'.png')});
  const info=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,1300),fonts:[...new Set([...document.querySelectorAll('h1,h2,button,p')].map(e=>getComputedStyle(e).fontFamily))]}));
  await page.close();return {name,url,status:r?.status(),...info};
 }));
 console.log(JSON.stringify(out,null,2));await browser.close();
})();
