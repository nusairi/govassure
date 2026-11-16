/* Architect's pack renderer. Provider-neutral: renders window.KMS_ARCH[<provider>] (generated
   at build time by build_arch.py from arch_<provider>.py) into #arch[data-provider].
   CSP-safe: no inline styles or handlers; SVG built with createElementNS. */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }
function txt(tag, cls, s){ var e=el(tag, cls); e.textContent=s; return e; }
function sv(tag, attrs){ var e=document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); return e; }
function refs(codes){
  var w=el("span","crefs");
  (codes||[]).forEach(function(x){ var a=txt("a","refl",x); a.href="#ga-sources"; a.title="Listed under Sources at the foot of the page"; a.setAttribute("data-code",x); w.appendChild(a); });
  return w;
}
var uid=0;
function section(body, nav, id, title, lead){
  var s=el("section","asec"); s.id=id; s.setAttribute("aria-labelledby", id+"-h");
  var h=txt("h3","ah",title); h.id=id+"-h"; s.appendChild(h);
  if(lead) s.appendChild(txt("p","alead",lead));
  var a=txt("a","anav",title); a.href="#"+id; nav.appendChild(a);
  body.appendChild(s); return s;
}
function table(cap, heads, rows, cls){
  var wrap=el("div","cmpwrap"); wrap.setAttribute("role","region"); wrap.setAttribute("aria-label",cap+" (scrolls sideways on small screens)"); wrap.tabIndex=0;
  var t=el("table","cmptab atab"+(cls?" "+cls:"")); t.appendChild(txt("caption",null,cap));
  var th=el("thead"), hr=el("tr");
  heads.forEach(function(h,i){ var c=txt("th", i===0?"stg":null, h); c.setAttribute("scope","col"); hr.appendChild(c); });
  th.appendChild(hr); t.appendChild(th);
  var tb=el("tbody");
  rows.forEach(function(r){ var tr=el("tr");
    r.forEach(function(v,i){
      var c;
      if(i===0){ c=el("th","stg"); c.setAttribute("scope","row"); }
      else { c=el("td"); c.setAttribute("data-label", heads[i]); }
      if(v && v.nodeType) c.appendChild(v);
      else if(Array.isArray(v)) c.appendChild(refs(v));
      else c.appendChild(txt("span", i===0?"st":"ctx", v));
      tr.appendChild(c); });
    tb.appendChild(tr); });
  t.appendChild(tb); wrap.appendChild(t); return wrap;
}
var live;
function copyBtn(pre, label){
  var b=txt("button","copybtn",label||"Copy"); b.type="button"; b.setAttribute("aria-label",(label||"Copy")+": "+(pre.getAttribute("data-name")||"code"));
  b.addEventListener("click", function(){
    var s=pre.textContent, done=function(ok){ b.textContent=ok?"Copied":"Select and copy"; live.textContent=ok?"Copied to clipboard":"Copy not available: select the text";
      setTimeout(function(){ b.textContent=label||"Copy"; }, 1800); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(function(){ done(true); }, function(){ done(fallback(pre)); });
    else done(fallback(pre));
  });
  return b;
}
function fallback(pre){ try{ var r=document.createRange(); r.selectNodeContents(pre); var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r); return document.execCommand("copy"); }catch(e){ return false; } }
function codeBlock(code, name, lang, label, badge, title){
  var det=el("details","codedet"); det.setAttribute("data-name",name);
  var sm=el("summary"); sm.appendChild(txt("span","adrid",badge||"Code")); sm.appendChild(txt("span","adrt",title||name)); sm.appendChild(txt("span","cdhint","Click to view"));
  det.appendChild(sm);
  var box=el("div","codebox"); var bar=el("div","codebar"); bar.appendChild(txt("span","codename",name));
  var pre=el("pre","code"); pre.setAttribute("data-name",name); if(lang) pre.setAttribute("data-lang",lang); pre.tabIndex=0;
  var c=el("code"); c.textContent=code; pre.appendChild(c);
  bar.appendChild(copyBtn(pre, label)); box.appendChild(bar); box.appendChild(pre); det.appendChild(box);
  det.addEventListener("toggle", function(){ var h=det.querySelector(".cdhint"); if(h) h.textContent=det.open?"Click to hide":"Click to view"; });
  return det;
}

function diagram(d){
  var id="ad-"+d.id+"-"+(++uid), W=d.vb[0], H=d.vb[1];
  var fig=el("figure","archfig"); fig.setAttribute("data-diagram", d.id);
  var wrap=el("div","svgwrap"); wrap.setAttribute("role","region"); wrap.setAttribute("aria-label",d.title+" (scrolls sideways on small screens)"); wrap.tabIndex=0;
  var s=sv("svg",{viewBox:"0 0 "+W+" "+H, role:"img", "aria-labelledby":id+"-t "+id+"-d", "class":"archsvg", width:W, height:H, preserveAspectRatio:"xMidYMin meet"});
  var t=sv("title",{id:id+"-t"}); t.textContent=d.title; s.appendChild(t);
  var ds=sv("desc",{id:id+"-d"}); ds.textContent=d.desc; s.appendChild(ds);
  var defs=sv("defs",{}), m=sv("marker",{id:id+"-a", viewBox:"0 0 10 10", refX:"9", refY:"5", markerWidth:"7", markerHeight:"7", orient:"auto-start-reverse"});
  m.appendChild(sv("path",{d:"M0,0 L10,5 L0,10 z", "class":"arrowhead"})); defs.appendChild(m); s.appendChild(defs);
  d.groups.forEach(function(g){
    s.appendChild(sv("rect",{x:g.x, y:g.y, width:g.w, height:g.h, rx:10, "class":"g-"+g.cls}));
    var l=sv("text",{x:g.x+12, y:g.y+20, "class":"gl"}); l.textContent=g.t; s.appendChild(l); });
  d.edges.forEach(function(e){
    s.appendChild(sv("polyline",{points:e.p.map(function(p){return p.join(",");}).join(" "), "class":"edge"+(e.dash?" dash":""), "marker-end":"url(#"+id+"-a)"}));
    if(e.t){ var l=sv("text",{x:e.at[0], y:e.at[1], "class":"el"}); l.textContent=e.t; s.appendChild(l); } });
  d.nodes.forEach(function(n){
    var gEl=sv("g",{"class":"node n-"+n.cls});
    gEl.appendChild(sv("rect",{x:n.x, y:n.y, width:n.w, height:n.h, rx:8}));
    var warn=n.cls==="warn", lh=warn?20:17, y0=warn? n.y+26 : n.y+n.h/2-(n.t.length-1)*lh/2+5;
    n.t.forEach(function(line,i){
      var tx=sv("text",{x: warn? n.x+16 : n.x+n.w/2, y:y0+i*lh, "class":(i===0&&!warn?"nt":"ns")+(warn?" left":"")});
      tx.textContent=line; gEl.appendChild(tx); });
    s.appendChild(gEl); });
  wrap.appendChild(s); fig.appendChild(wrap);
  var cap=el("figcaption"); cap.appendChild(txt("h4","figt",d.title)); cap.appendChild(txt("p","figd",d.desc)); cap.appendChild(refs(d.c)); if(window.KMS_GLOSS) { var lg=window.KMS_GLOSS.legend(d); if(lg) cap.appendChild(lg); } fig.appendChild(cap);
  return fig;
}

function render(root){
  var D=(window.KMS_ARCH||{})[root.getAttribute("data-provider")]; if(!D) return;
  live=el("p","sr-only"); live.setAttribute("aria-live","polite"); root.appendChild(live);
  var intro=document.getElementById("arch-intro"); intro.textContent=D.intro+" "; intro.appendChild(refs(D.intro_c));
  document.getElementById("arch-checked").textContent=D.checked;
  var nav=document.getElementById("arch-nav"), body=document.getElementById("arch-body");

  // 1 diagrams
  var s1=section(body, nav, "arch-diagrams", "1. Reference architectures", "Four patterns, from a single account to customer-controlled HSMs. Each diagram has a text description for screen readers and below it.");
  var dg=el("div","figgrid"); D.diagrams.forEach(function(d){ dg.appendChild(diagram(d)); }); s1.appendChild(dg);

  // 2 ADRs
  var s2=section(body, nav, "arch-adrs", "2. Architecture decision records", "A template and five worked decisions. Adapt the decision owner and status to your organisation.");
  var dl=txt("a","dlbtn","Download the ADR pack (Markdown)"); dl.href="/"+D.md; dl.setAttribute("download", D.md); dl.id="arch-md"; s2.appendChild(dl);
  var td=el("details","codedet"); td.id="adr-template"; var tsm=el("summary"); tsm.appendChild(txt("span","adrid","T")); tsm.appendChild(txt("span","adrt","ADR template: fields to record")); tsm.appendChild(txt("span","cdhint","Click to view")); td.appendChild(tsm);
  td.appendChild(table("ADR template: fields to record", ["Field","What to record"], D.adr_template.map(function(r){ return [r[0], r[1]]; })));
  td.addEventListener("toggle", function(){ tsm.querySelector(".cdhint").textContent=td.open?"Click to hide":"Click to view"; }); s2.appendChild(td);
  D.adrs.forEach(function(a){
    var c=el("details","adr"); c.id="adr-"+a.id.toLowerCase(); var sm=el("summary"); sm.appendChild(txt("span","adrid",a.id)); sm.appendChild(txt("span","adrt",a.t)); c.appendChild(sm);
    var b=el("div","adrbody");
    var p=el("p"); p.appendChild(txt("b",null,"Context. ")); p.appendChild(document.createTextNode(a.ctx+" ")); p.appendChild(refs(a.ctx_c)); b.appendChild(p);
    p=el("p","dec"); p.appendChild(txt("b",null,"Decision. ")); p.appendChild(document.createTextNode(a.dec)); b.appendChild(p);
    b.appendChild(txt("p","sub","Consequences")); var ul=el("ul"); a.cons.forEach(function(x){ ul.appendChild(txt("li",null,x)); }); b.appendChild(ul); b.appendChild(refs(a.cons_c));
    p=el("p"); p.appendChild(txt("b",null,"Controls. ")); p.appendChild(document.createTextNode(a.ctl)); b.appendChild(p);
    p=el("p"); p.appendChild(txt("b",null,"Evidence. ")); p.appendChild(document.createTextNode(a.ev)); b.appendChild(p);
    p=el("p"); p.appendChild(txt("b",null,"NCSC mapping. ")); p.appendChild(document.createTextNode(a.map+" ")); p.appendChild(refs(a.map_c)); b.appendChild(p);
    c.appendChild(b); s2.appendChild(c); });

  // 3 policies
  var s3=section(body, nav, "arch-policies", "3. Key policy and IAM patterns", "Valid JSON, checked at build time against the AWS Service Authorization Reference. Replace the documentation example account IDs, role names and organization ID. Test in non-production first.");
  D.policies.forEach(function(p){
    var c=el("article","polcard"); c.id="pol-"+p.id.toLowerCase();
    var h=el("h4"); h.appendChild(txt("span","adrid",p.id)); h.appendChild(document.createTextNode(p.t)); c.appendChild(h);
    c.appendChild(txt("span","kind",p.kind));
    var w=el("p"); w.textContent=p.why+" "; w.appendChild(refs(p.c)); c.appendChild(w);
    c.appendChild(codeBlock(p.json, p.id+" "+p.kind.split(" + ")[0], "json", "Copy JSON", p.id, "View JSON: "+p.kind.split(" + ")[0]));
    if(p.json2){ c.appendChild(txt("p","sub",p.json2_t)); c.appendChild(codeBlock(p.json2, p.id+" "+p.json2_t, "json", "Copy JSON", p.id, "View JSON: "+p.json2_t)); }
    s3.appendChild(c); });

  // 4 naming
  var s4=section(body, nav, "arch-naming", "4. Key hierarchy, naming and tagging standard", null);
  s4.appendChild(table("Key hierarchy", ["Level","Standard","Sources"], D.hierarchy.map(function(r){ return [r[0], r[1], r[2]]; })));
  s4.appendChild(table("Alias rules", ["Rule","Standard","Sources"], D.alias_rules.map(function(r){ return [r[0], r[1], r[2]]; })));
  s4.appendChild(table("Required tags", ["Tag key","Meaning","Example"], D.tags));
  var tr=el("p","note"); tr.textContent=D.tag_rules+" "; tr.appendChild(refs(D.tag_rules_c)); s4.appendChild(tr);
  s4.appendChild(table("Ownership", ["Role","Responsibility"], D.ownership));

  // 5 threats
  var s5=section(body, nav, "arch-threats", "5. Threat model", "Key-management threats with preventive and detective controls. Policy IDs (P1 to P11) refer to section 3.");
  s5.appendChild(table("Threat model: AWS KMS", ["Threat","Impact","Preventive control","Detective control","NCSC / CAF","Sources"], D.threats, "threats"));

  // 6 guardrails
  var s6=section(body, nav, "arch-guardrails", "6. Guardrails", "Preventive guardrails are the SCPs and RCPs in section 3 (P7, P8, P6). Detective guardrails follow. Each Config rule name links to its own AWS page in Sources.");
  s6.appendChild(table("AWS Config managed rules", ["Rule name","What it checks","Source"], D.config.map(function(r){ var n=el("code","rule"); n.textContent=r[0]; return [n, r[1], r[2]]; }), "config"));
  D.eb.forEach(function(e){ var c=el("article","polcard"); var h=el("h4"); h.appendChild(txt("span","adrid",e.id)); h.appendChild(document.createTextNode("EventBridge pattern: "+e.t)); c.appendChild(h);
    var w=el("p"); w.textContent=e.why+" "; w.appendChild(refs(e.c)); c.appendChild(w); c.appendChild(codeBlock(e.json, e.id+" event pattern", "json", "Copy JSON", e.id, "View event pattern (JSON)")); s6.appendChild(c); });
  s6.appendChild(table("CloudWatch alarms", ["Alarm","Configuration","Source"], D.alarms));

  // 7 runbooks
  var s7=section(body, nav, "arch-runbooks", "7. Runbooks", "AWS CLI commands as documented by AWS. Replace <key-id> with the key ARN or ID; run from an approved administration role.");
  D.runbooks.forEach(function(r){
    var c=el("details","adr rb"); c.id="rb-"+r.id.toLowerCase(); var sm=el("summary"); sm.appendChild(txt("span","adrid",r.id)); sm.appendChild(txt("span","adrt",r.t)); c.appendChild(sm);
    var b=el("div","adrbody"); var p=el("p"); p.appendChild(txt("b",null,"When. ")); p.appendChild(document.createTextNode(r.when)); b.appendChild(p);
    var ol=el("ol","steps"); r.steps.forEach(function(st,i){ var li=el("li"); li.appendChild(txt("span",null,st[0]));
      if(st[1]) li.appendChild(codeBlock(st[1], r.id+" step "+(i+1), "sh", "Copy", r.id+"."+(i+1), "View command (AWS CLI)")); ol.appendChild(li); }); b.appendChild(ol);
    p=el("p","note"); p.appendChild(txt("b",null,"Check. ")); p.appendChild(document.createTextNode(r.verify+" ")); p.appendChild(refs(r.c)); b.appendChild(p);
    c.appendChild(b); s7.appendChild(c); });

  // 8 assurance
  var s8=section(body, nav, "arch-assurance", "8. Assurance checklist", "Each decision mapped to the NCSC Cloud Security Principles and CAF contributing outcomes, with the evidence an assessor would ask for. Principles 4, 5, 6 and 12 describe what to expect of the provider.");
  s8.appendChild(table("Assurance checklist", ["Decision or control","Cloud Security Principle","CAF outcome","Evidence","Sources"], D.checklist, "check"));

  // 9 cost
  var s9=section(body, nav, "arch-cost", "9. Cost and limits", "Real figures from AWS pages only. Prices and quotas change: check current pricing and quotas before you budget or design.");
  s9.appendChild(table("Cost items (US dollars)", ["Item","Figure","Source"], D.cost.map(function(r){ var w=el("span"); w.appendChild(refs(r[2])); w.appendChild(txt("span","chknote","Check current pricing")); return [r[0], r[1], w]; }), "cost"));
  s9.appendChild(table("Quotas and limits", ["Limit","Value","Source"], D.limits.map(function(r){ var w=el("span"); w.appendChild(refs(r[2])); w.appendChild(txt("span","chknote","Check current quotas")); return [r[0], r[1], w]; }), "limits"));
  // 10 glossary
  if(window.KMS_GLOSS){ var s10=section(body, nav, "arch-glossary", "10. Glossary (A to Z)", "Every abbreviation used in this app, in plain English. Hover over an underlined abbreviation anywhere on the page to see its full form.");
    s10.appendChild(window.KMS_GLOSS.list());
    var gl=txt("a","glink","Glossary of abbreviations"); gl.href="#arch-glossary"; intro.appendChild(document.createTextNode(" ")); intro.appendChild(gl); }
  document.getElementById("arch-rendered").setAttribute("data-ok","1");
  if(window.KMS_GLOSS) window.KMS_GLOSS.annotate();
  if(/^#(arch|adr|pol|rb)-/.test(location.hash) && window.__kmsFromHash) window.__kmsFromHash();
}
function init(){ var r=document.getElementById("arch"); if(r) render(r); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
