// Original GOV Assured illustrations (green #021c17 / gold #f0c987). Seeded so output is reproducible.
const fs=require('fs');
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
const G='#f0c987',GD='#c9a15d',F='#021c17',R='#102e26',S='#0b2318';
function network(w,h,n,seed,{cx,cy,hole=0,maxD=170,op=.5}){
  const r=rng(seed),pts=[];
  let guard=0;
  while(pts.length<n&&guard++<n*40){const x=r()*w,y=r()*h;
    if(hole&&Math.hypot(x-cx,y-cy)<hole)continue;
    if(pts.some(p=>Math.hypot(p.x-x,p.y-y)<38))continue; pts.push({x,y,s:r()})}
  let L='',C='';
  pts.forEach((p,i)=>{
    const near=pts.map((q,j)=>({j,d:Math.hypot(p.x-q.x,p.y-q.y)})).filter(o=>o.j>i&&o.d<maxD).sort((a,b)=>a.d-b.d).slice(0,3);
    near.forEach(o=>{const q=pts[o.j];const a=(op*(1-o.d/maxD)*.9).toFixed(2);L+=`<line x1="${p.x.toFixed(0)}" y1="${p.y.toFixed(0)}" x2="${q.x.toFixed(0)}" y2="${q.y.toFixed(0)}" stroke-opacity="${a}"/>`});
    const rr=(1.6+p.s*2.6).toFixed(1);C+=`<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${rr}" fill-opacity="${(.35+p.s*.6).toFixed(2)}"/>`;
  });
  return `<g stroke="${G}" stroke-width="1">${L}</g><g fill="${G}">${C}</g>`;
}
function shield(cx,cy,s,{fill=R,stroke=G,sw=6,check=true}={}){
  // shield path centred at cx,cy with height ~ 2.3*s
  const p=`M${cx} ${cy-1.1*s} L${cx+.95*s} ${cy-.72*s} V${cy+.05*s} C${cx+.95*s} ${cy+.72*s} ${cx+.5*s} ${cy+1.05*s} ${cx} ${cy+1.25*s} C${cx-.5*s} ${cy+1.05*s} ${cx-.95*s} ${cy+.72*s} ${cx-.95*s} ${cy+.05*s} V${cy-.72*s} Z`;
  let o=`<path d="${p}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  if(check)o+=`<path d="M${cx-.38*s} ${cy+.08*s} l${.27*s} ${.27*s} l${.52*s} ${-.56*s}" fill="none" stroke="${stroke}" stroke-width="${sw*1.25}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return o;
}
function crown(cx,cy,s,col=G){
  // simple five-point crown, base width 2s
  const b=cy+.45*s,t=cy-.55*s;
  const d=`M${cx-s} ${b} L${cx-s} ${cy-.15*s} L${cx-.55*s} ${cy+.12*s} L${cx-.28*s} ${t} L${cx} ${cy-.05*s} L${cx+.28*s} ${t} L${cx+.55*s} ${cy+.12*s} L${cx+s} ${cy-.15*s} L${cx+s} ${b} Z`;
  return `<path d="${d}" fill="${col}"/><rect x="${cx-s}" y="${b+.12*s}" width="${2*s}" height="${.16*s}" rx="${.05*s}" fill="${col}"/>`+
   [[-1,-.15],[-.28,-.55],[.28,-.55],[1,-.15]].map(([dx,dy])=>`<circle cx="${cx+dx*s}" cy="${cy+dy*s-.1*s}" r="${.09*s}" fill="${col}"/>`).join('');
}
function rings(cx,cy,rs,op=.25){return rs.map((r,i)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${G}" stroke-opacity="${(op*(1-i/rs.length)).toFixed(2)}" stroke-width="${i%2?1:1.5}" ${i%2?'stroke-dasharray="3 9"':''}/>`).join('')}
function glow(id,cx,cy,r,op){return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${G}" stop-opacity="${op}"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient>`}
function svg(w,h,defs,body){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs><rect width="${w}" height="${h}" fill="${F}"/>${body}</svg>`}

// 1. Hero (square, desktop) and hero-wide (mobile banner)
function heroArt(w,h,seed){
  const cx=w/2,cy=h*.54,s=Math.min(w,h)*.2;
  return svg(w,h,glow('g1',cx,cy,Math.max(w,h)*.6,.14)+glow('g2',w*.1,h*.05,w*.55,.12),
   `<rect width="${w}" height="${h}" fill="url(#g2)"/>`+network(w,h,Math.round(w*h/9000),seed,{cx,cy,hole:s*1.9,op:.55})+
   `<rect width="${w}" height="${h}" fill="url(#g1)"/>`+rings(cx,cy,[s*1.55,s*1.85,s*2.25,s*2.7,s*3.2],.5)+
   [0,60,120,180,240,300].map(a=>{const t=a*Math.PI/180,r1=s*1.55,r2=s*2.7;return `<line x1="${(cx+r1*Math.cos(t)).toFixed(0)}" y1="${(cy+r1*Math.sin(t)).toFixed(0)}" x2="${(cx+r2*Math.cos(t)).toFixed(0)}" y2="${(cy+r2*Math.sin(t)).toFixed(0)}" stroke="${G}" stroke-opacity=".35" stroke-width="1.5"/><circle cx="${(cx+r2*Math.cos(t)).toFixed(0)}" cy="${(cy+r2*Math.sin(t)).toFixed(0)}" r="${(s*.07).toFixed(1)}" fill="${S}" stroke="${G}" stroke-width="2"/>`}).join('')+
   shield(cx,cy,s,{sw:Math.max(4,s*.045)})+crown(cx,cy-s*1.62,s*.42));
}
fs.writeFileSync('hero.svg',heroArt(1000,1000,7));
fs.writeFileSync('hero-wide.svg',heroArt(1200,560,11));

// 2. Approach: layered assurance (stacked plates) with path
function approach(w,h){
  const cx=w*.5,base=h*.84;let b='';
  const labels=4;
  for(let i=0;i<labels;i++){const y=base-i*h*.15,ww=w*(.62-i*.09),hh=h*.11;
    b+=`<path d="M${cx-ww/2} ${y} L${cx} ${y-hh} L${cx+ww/2} ${y} L${cx} ${y+hh} Z" fill="${i===labels-1?'#1b4436':R}" stroke="${G}" stroke-opacity="${.35+i*.18}" stroke-width="2"/>`;}
  const top=base-(labels-1)*h*.15-h*.11;b+=shield(cx,top-h*.15,h*.085,{sw:4})+crown(cx,top-h*.15-h*.165,h*.04);
  // vertical dotted guides
  b+=[-1,1].map(k=>`<line x1="${cx+k*w*.31}" y1="${base}" x2="${cx+k*w*.04}" y2="${base-(labels-1)*h*.15-h*.05}" stroke="${G}" stroke-opacity=".3" stroke-dasharray="2 8" stroke-width="2"/>`).join('');
  return svg(w,h,glow('ga',cx,h*.3,w*.6,.18),`<rect width="${w}" height="${h}" fill="url(#ga)"/>`+network(w,h,48,21,{cx,cy:h*.55,hole:w*.36,op:.4})+b);
}
fs.writeFileSync('approach.svg',approach(1000,760));

// 3. About: crown emblem with orbit network
function about(w,h){const cx=w*.5,cy=h*.52,s=h*.17;
  return svg(w,h,glow('gb',cx,cy,w*.55,.2),`<rect width="${w}" height="${h}" fill="url(#gb)"/>`+network(w,h,70,33,{cx,cy,hole:s*2.4,op:.45})+rings(cx,cy,[s*1.6,s*2.1,s*2.6],.55)+
   `<circle cx="${cx}" cy="${cy}" r="${s*1.25}" fill="${R}" stroke="${G}" stroke-width="5"/>`+crown(cx,cy+s*.05,s*.72));}
fs.writeFileSync('about.svg',about(900,600));

// 4. OG image 1200x630
function og(){const w=1200,h=630;return heroArt(w,h,5).replace('</svg>',`<rect x="0" y="0" width="${w}" height="${h}" fill="${F}" fill-opacity="0"/></svg>`)}
fs.writeFileSync('og.svg',og());
console.log('ok');
