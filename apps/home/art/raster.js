const sharp=require('sharp');
const out=require('path').join(__dirname,'..','img')+'/';
const jobs={hero:[480,720,960],'hero-wide':[640,960,1200],approach:[480,760,1000],about:[450,675,900]};
(async()=>{
 for(const [n,ws] of Object.entries(jobs)) for(const w of ws){
   const b=sharp(n+'.svg',{density:72*w/ (n==='hero'?1000:n==='hero-wide'?1200:n==='approach'?1000:900)}).resize({width:w});
   await b.clone().avif({quality:52,effort:6}).toFile(`${out}${n}-${w}.avif`);
   await b.clone().webp({quality:72,effort:6}).toFile(`${out}${n}-${w}.webp`);
 }
 await sharp('og.svg').jpeg({quality:80,mozjpeg:true}).toFile(out+'og.jpg');
})();
