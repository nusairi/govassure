(function(){
"use strict";
var SEVN = {C:"Critical", H:"High", M:"Medium"}, SEVC = {C:"sev-c", H:"sev-h", M:"sev-m"}, REG = [];
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function verdicts(g){ var o=[]; (g.th||[]).forEach(function(t){ var v=/^BLOCK/.test(t[1])?"BLOCK":/^WARN/.test(t[1])?"WARN":null; if(v&&o.indexOf(v)<0) o.push(v); }); return o; }
function mkCell(item, kind, extra){
  var b=el("button","cell "+(extra||"")); b.type="button"; b.dataset.i=REG.length; b.classList.add(SEVC[item.sev]);
  REG.push({item:item,kind:kind}); b.addEventListener("click",function(){ open(parseInt(b.dataset.i,10)); }); return b;
}
ATTRS.forEach(function(a){ document.getElementById("attrs").appendChild(el("span",null,esc(a))); });
PHASES.forEach(function(s){ document.getElementById("stages").appendChild(el("span","s",esc(s))); });

/* stages */
K.stages.forEach(function(d){
  var b=mkCell(d,"Lifecycle stage "+d.n,"v-"+d.v), hd=el("div","hd");
  hd.appendChild(el("span","num",esc(d.n))); hd.appendChild(el("span","ct",esc(d.t))); b.appendChild(hd);
  var ul=el("ul"); d.bul.forEach(function(x){ ul.appendChild(el("li",null,esc(x))); }); b.appendChild(ul);
  var ft=el("div","ft"); ft.appendChild(el("span","r",esc(d.ft))); ft.appendChild(el("span","o",esc(d.s))); b.appendChild(ft);
  document.getElementById("domains").appendChild(b);
});
/* planes */
K.planes.forEach(function(pl){
  var row=el("div","prow"); row.appendChild(el("div","ph",esc(pl.label)));
  var g=el("div","grid10"); g.style.setProperty("--n",pl.cells.length);
  pl.cells.forEach(function(c){ var b=mkCell(c,"Key hierarchy · "+pl.label,"v-"+c.v); b.appendChild(el("span","ct",esc(c.t))); b.appendChild(el("span","cs",esc(c.s))); g.appendChild(b); });
  row.appendChild(g); document.getElementById("planes").appendChild(row);
});
/* lifecycle strip: the six key states */
var LIFE=[["pre","PRE-ACTIVATION","plan · generate","M"],["act","ACTIVE","store · use · rotate · monitor","C"],["sus","SUSPENDED","disable · investigate","M"],["dea","DEACTIVATED","decrypt-only · archive","H"],["com","COMPROMISED","revoke · re-key","C"],["des","DESTROYED","delete · crypto-erase","H"]];
var lifeEl=document.getElementById("life"); lifeEl.style.gridTemplateColumns="repeat(6,1fr)";
LIFE.forEach(function(l){ var s=STATES[l[0]]; var it={t:s.t,s:"Key state (NIST SP 800-57 Pt1 §7) · stages: "+s.map,sev:l[3],p:s.p,c:["Lifecycle stages acting on this state: "+s.map,"Entry to and exit from this state recorded in key metadata and the audit log"],r:"If state changes are not recorded, you cannot show which keys could still decrypt data at a given time.",refs:["S20 NIST SP 800-57 Pt1 §7"]};
  var b=mkCell(it,"Key state"); b.appendChild(el("span","ct",esc(l[1]))); b.appendChild(el("span","cs",esc(l[2]))); lifeEl.appendChild(b); });
/* gates */
var gw=document.getElementById("gates"); gw.style.setProperty("--g",K.gates.length);
K.gates.forEach(function(g,i){
  var b=mkCell(g,"Lifecycle gate","v-"+g.v); b.appendChild(el("span","gn","K"+(i+1)));
  b.appendChild(el("span","ct",esc(g.t))); b.appendChild(el("span","cs",esc(g.s)));
  var bw=el("span","badges"); verdicts(g).forEach(function(v){ bw.appendChild(el("span","badge"+(v==="WARN"?" warn":""),v)); }); b.appendChild(bw); gw.appendChild(b);
});
/* legend */
var lg=document.getElementById("legend"), TOOL=[["inhouse","Governance & inventory"],["cloud","KMS / HSM platform"],["peer","Identity & access"],["quality","Service integration & recovery"],["appsec","Rotation & crypto-agility"],["cicd","Monitoring & destruction"],["dast","Disable & compromise"]], RISK=[["sev-c","Critical if absent"],["sev-h","High if absent"],["sev-m","Medium if absent"]];
function paint(){ lg.innerHTML=""; lg.appendChild(el("span","lg","LEGEND")); var risk=document.body.classList.contains("risk");
  (risk?RISK:TOOL).forEach(function(p){ var s=el("span"), sw=el("i");
    if(risk){ var m={"sev-c":["#fbeced","#9d2235"],"sev-h":["#fdf2e6","#b8601a"],"sev-m":["#eef6fc","#1a7ec8"]}[p[0]]; sw.style.background=m[0]; sw.style.borderColor=m[1]; }
    else { sw.className="v-"+p[0]; sw.style.background="var(--x-f)"; sw.style.borderColor="var(--x-s)"; }
    s.appendChild(sw); s.appendChild(document.createTextNode(p[1])); lg.appendChild(s); }); }
paint();
var vt=document.getElementById("v-tool"), vr=document.getElementById("v-risk");
function setRisk(r){ document.body.classList.toggle("risk",r); vt.setAttribute("aria-pressed",String(!r)); vr.setAttribute("aria-pressed",String(r)); paint(); }
vt.addEventListener("click",function(){ setRisk(false); }); vr.addEventListener("click",function(){ setRisk(true); });

/* modal */
var back=document.getElementById("back"), lastFocus=null;
function open(i){
  var e=REG[i], n=e.item; lastFocus=document.activeElement;
  document.getElementById("mkind").textContent=e.kind;
  document.getElementById("mtitle").textContent=n.t;
  document.getElementById("msub").textContent=n.s||"";
  document.getElementById("mpurpose").textContent=n.p;
  document.getElementById("mncwrap").hidden=!n.ncsc; document.getElementById("mncsc").textContent=n.ncsc||"";
  var ul=document.getElementById("mctrl"); ul.innerHTML=""; (n.c||[]).forEach(function(c){ ul.appendChild(el("li",null,esc(c))); });
  var ck=document.getElementById("mchk"); ck.innerHTML=""; document.getElementById("mchkwrap").hidden=!n.chk; (n.chk||[]).forEach(function(c){ ck.appendChild(el("li",null,esc(c))); });
  var thw=document.getElementById("mthwrap"), tht=document.getElementById("mth"); tht.innerHTML="";
  if(n.th&&n.th.length){ thw.hidden=false; n.th.forEach(function(t){ var tr=el("tr"); tr.appendChild(el("td","c",esc(t[0]))); var v=/^BLOCK/.test(t[1])?"b":/^WARN/.test(t[1])?"w":"n"; var td=el("td","v"); td.appendChild(el("span","vchip "+v,esc(t[1]))); tr.appendChild(td); tht.appendChild(tr); }); } else thw.hidden=true;
  document.getElementById("mriskbox").className="riskbox"+(n.sev==="H"?" h":n.sev==="M"?" m":"");
  document.getElementById("msev").textContent=SEVN[n.sev];
  document.getElementById("mrisk").textContent=n.r;
  var rf=document.getElementById("mrefs"); rf.innerHTML=""; (n.refs||[]).forEach(function(x){ var a=el("a","refl"); a.href="#ga-sources"; a.title="Listed under Sources at the foot of the page"; a.appendChild(el("span",null,esc(x))); a.addEventListener("click",function(){ lastFocus=null; close(); }); rf.appendChild(a); });
  back.classList.add("on"); document.getElementById("close").focus(); document.getElementById("modal").scrollTop=0;
}
function close(){ back.classList.remove("on"); if(lastFocus) lastFocus.focus(); }
document.getElementById("close").addEventListener("click",close);
back.addEventListener("click",function(e){ if(e.target===back) close(); });
document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&back.classList.contains("on")) close(); });
window.__open=open;

/* key state diagram */
var NS="http://www.w3.org/2000/svg", svg=document.getElementById("ksvg"), W=170, H=58;
function s(tag,attrs,parent){ var e=document.createElementNS(NS,tag); for(var k in attrs) e.setAttribute(k,attrs[k]); (parent||svg).appendChild(e); return e; }
var defs=s("defs",{});
[["ah","#8aa3bd"],["ah2","#b8860b"]].forEach(function(a){ var m=s("marker",{id:a[0],viewBox:"0 0 10 10",refX:"9",refY:"5",markerWidth:"7",markerHeight:"7",orient:"auto-start-reverse"},defs); s("path",{d:"M0,0 L10,5 L0,10 z",fill:a[1]},m); });
[["PRE-OPERATIONAL",60],["OPERATIONAL",330],["OPERATIONAL / POST-OPERATIONAL",600],["COMPROMISED / DESTROYED",870]].forEach(function(p){ var t=s("text",{x:p[1],y:16,"class":"phl"}); t.textContent=p[0]; });
function c(k){ var st=STATES[k]; return [st.x+W/2, st.y+H/2]; }
function clip(a,b){ var dx=b[0]-a[0], dy=b[1]-a[1]; var tx=Math.abs(dx)>0?(W/2+4)/Math.abs(dx):Infinity, ty=Math.abs(dy)>0?(H/2+4)/Math.abs(dy):Infinity, t=Math.min(tx,ty); return [a[0]+dx*t, a[1]+dy*t]; }
var EDG={};
EDGES.forEach(function(e){
  var a=c(e[0]), b=c(e[1]), rev=EDGES.some(function(f){ return f[0]===e[1]&&f[1]===e[0]; });
  if(rev){ var off=e[0]<e[1]?7:-7, dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy), nx=-dy/L*off, ny=dx/L*off; a=[a[0]+nx,a[1]+ny]; b=[b[0]+nx,b[1]+ny]; }
  var p1=clip(a,b), p2=clip(b,a), d;
  if(e[0]==="pre"&&e[1]==="des"){ d="M"+(STATES.pre.x+W/2)+","+(STATES.pre.y+H+4)+" C"+(STATES.pre.x+W/2)+",385 700,385 "+(STATES.des.x-4)+","+(STATES.des.y+H/2+10); }
  else if(e[0]==="act"&&e[1]==="des"){ d="M"+(STATES.act.x+W/2+20)+","+(STATES.act.y+H+4)+" C"+(STATES.act.x+W/2+20)+",355 700,350 "+(STATES.des.x-4)+","+(STATES.des.y+H/2); }
  else if(e[0]==="sus"&&e[1]==="des"){ d="M"+(STATES.sus.x+W+4)+","+(STATES.sus.y+H/2)+" C1080,"+(STATES.sus.y+H/2)+" 1080,"+(STATES.des.y)+" "+(STATES.des.x+W-10)+","+(STATES.des.y-4); }
  else if(e[0]==="pre"&&e[1]==="com"){ d="M"+(STATES.pre.x+W/2)+","+(STATES.pre.y-4)+" C"+(STATES.pre.x+W/2)+",10 "+(STATES.com.x+W/2)+",10 "+(STATES.com.x+W/2-20)+","+(STATES.com.y-4); }
  else d="M"+p1[0]+","+p1[1]+" L"+p2[0]+","+p2[1];
  EDG[e[0]+">"+e[1]]=s("path",{d:d,"class":"ed"});
});
var NODES={};
Object.keys(STATES).forEach(function(k){ var st=STATES[k], g=s("g",{"class":"st"+(k==="com"?" com":""),tabindex:"0",role:"button","aria-label":st.t});
  s("rect",{x:st.x,y:st.y,width:W,height:H,rx:8},g); var t=s("text",{x:st.x+W/2,y:st.y+24,"text-anchor":"middle"},g); t.textContent=st.t;
  var m=s("text",{x:st.x+W/2,y:st.y+42,"text-anchor":"middle","class":"m"},g); m.textContent=st.map.length>34?st.map.slice(0,32)+"…":st.map;
  g.addEventListener("click",function(){ showState(k); }); g.addEventListener("keydown",function(ev){ if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();showState(k);} }); NODES[k]=g; });
function clearVis(){ Object.keys(NODES).forEach(function(k){ NODES[k].classList.remove("on"); }); Object.keys(EDG).forEach(function(k){ EDG[k].classList.remove("on"); }); }
function chips(list){ var r=document.getElementById("d-refs"); r.innerHTML=""; list.forEach(function(x){ r.appendChild(el("span","chip",esc(x))); }); }
function showState(k){ clearVis(); NODES[k].classList.add("on"); var st=STATES[k];
  document.getElementById("d-code").textContent="Key state"; document.getElementById("d-title").textContent=st.t; document.getElementById("d-desc").textContent=st.p;
  document.getElementById("d-steps").innerHTML=""; var outs=EDGES.filter(function(e){return e[0]===k;}).map(function(e){return STATES[e[1]].t;});
  chips(st.map.split(" · ").concat(outs.length?["Can move to: "+outs.join(", ")]:["Terminal state"]));
  Array.prototype.forEach.call(document.getElementById("scen").children,function(b){b.classList.remove("active");}); }
var sb=document.getElementById("scen");
SCEN.forEach(function(sc,i){ var b=el("button","scen-btn"); b.type="button";
  b.innerHTML='<span class="scode">SCENARIO '+(i+1)+'</span><span class="sname"></span><span class="sdesc"></span>';
  b.querySelector(".sname").textContent=sc.t; b.querySelector(".sdesc").textContent=sc.path.map(function(p){return STATES[p].t;}).join(" → ");
  b.addEventListener("click",function(){ run(i); }); sb.appendChild(b); });
function run(i){ var sc=SCEN[i]; clearVis(); Array.prototype.forEach.call(sb.children,function(b,k){ b.classList.toggle("active",k===i); });
  sc.path.forEach(function(p,j){ NODES[p].classList.add("on"); if(j>0&&EDG[sc.path[j-1]+">"+p]) EDG[sc.path[j-1]+">"+p].classList.add("on"); });
  document.getElementById("d-code").textContent="Scenario "+(i+1); document.getElementById("d-title").textContent=sc.t;
  document.getElementById("d-desc").textContent="Path: "+sc.path.map(function(p){return STATES[p].t;}).join(" → ");
  var ol=document.getElementById("d-steps"); ol.innerHTML=""; sc.steps.forEach(function(x){ ol.appendChild(el("li",null,esc(x))); });
  chips(sc.steps.map(function(x){ var m=x.match(/\(([^)]+)\)\s*$/); return m?m[1]:null; }).filter(Boolean)); }
document.getElementById("clear").addEventListener("click",function(){ clearVis(); Array.prototype.forEach.call(sb.children,function(b){b.classList.remove("active");}); document.getElementById("d-steps").innerHTML=""; });
window.__run=run;

/* tabs */
var tabs=[["tab-model","view-model"],["tab-states","view-states"],["tab-dep","view-dep"],["tab-cmp","view-cmp"],["tab-arch","view-arch"]];
var HASH={"#model":"tab-model","#states":"tab-states","#dependency":"tab-dep","#compare":"tab-cmp","#architect-aws":"tab-arch"};
function showTab(id){ tabs.forEach(function(o){ var sel=o[0]===id; document.getElementById(o[0]).setAttribute("aria-selected",String(sel)); document.getElementById(o[1]).hidden=!sel; }); }
function fromHash(){ var h=location.hash; if(HASH[h]) showTab(HASH[h]);
  else if(/^#(arch|adr|pol|rb)-[a-z0-9-]+$/.test(h)){ var t=document.getElementById(h.slice(1)); if(t && document.getElementById("view-arch").contains(t)){ showTab("tab-arch"); if(t.tagName==="DETAILS") t.open=true; t.scrollIntoView(); } } }
tabs.forEach(function(t){ document.getElementById(t[0]).addEventListener("click",function(){ showTab(t[0]); var h=Object.keys(HASH).filter(function(k){return HASH[k]===t[0];})[0]; if(history.replaceState) history.replaceState(null,"",h); }); });
window.addEventListener("hashchange",fromHash); fromHash(); window.__kmsFromHash=fromHash;
})();
