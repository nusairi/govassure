/* Plain-English glossary of abbreviations, plus a CSP-safe annotator:
   - wraps known abbreviations in <abbr title="full form"> (hover/long-press tooltip);
   - writes the full form on first use in each tab or architect's-pack section, e.g. "service control policy (SCP)";
   - builds the A-Z glossary list and the legend under each diagram.
   Code, commands, links, buttons and SVG are never touched. */
(function(){
"use strict";
var G={
"AAD":["additional authenticated data","Extra, non-secret context bound to an encryption operation. Decryption only works if exactly the same context is supplied again."],
"ABAC":["attribute-based access control","Granting access based on attributes such as tags on a key and on the caller, rather than listing each person or role by name."],
"ADR":["architecture decision record","A short document that records one design decision: the context, what was decided, the consequences and who owns it."],
"AEAD":["authenticated encryption with associated data","Encryption that both hides data and detects any tampering with it or with the extra context supplied alongside it."],
"AES":["Advanced Encryption Standard","The widely used symmetric encryption algorithm standardised by NIST. The same secret key encrypts and decrypts."],
"API":["application programming interface","The defined set of requests a program can send to a service, such as the calls that ask a KMS to encrypt or decrypt."],
"ARN":["Amazon Resource Name","The unique identifier AWS gives every resource, including each KMS key, used in policies and commands."],
"AWS":["Amazon Web Services","Amazon's cloud platform. AWS KMS is its key management service."],
"AZ":["Availability Zone","A separate data centre location inside one cloud region. Spreading HSMs across zones keeps keys available if one zone fails."],
"BYOK":["bring your own key","You create key material in your own environment and import it into the cloud provider's key service."],
"CA":["certificate authority","The trusted party in a PKI that signs digital certificates. Its private key is one of the most sensitive keys an organisation holds."],
"CAF":["Cyber Assessment Framework","The NCSC framework of objectives and contributing outcomes used to assess how well an organisation manages cyber risk to essential services."],
"CISO":["chief information security officer","The senior leader accountable for an organisation's information security."],
"CLI":["command line interface","A text-based tool for running commands. The AWS CLI sends the same requests to AWS as the web console."],
"CMK":["customer managed key","A key that you create and control (its policy, rotation and deletion), as opposed to one fully managed by the provider. AWS now calls these KMS keys."],
"DBA":["database administrator","The person or team who runs and maintains databases."],
"DEK":["data encryption key","The key that actually encrypts your data. It is itself kept encrypted (wrapped) by a key encryption key."],
"DR":["disaster recovery","The plans and systems that restore service after a major failure, such as losing a whole region."],
"DSA":["Digital Signature Algorithm","A family of algorithms for creating and checking digital signatures. ML-DSA is the new post-quantum version."],
"EBS":["Elastic Block Store","AWS disk storage for virtual servers. Its volumes can be encrypted with KMS keys."],
"EC":["elliptic curve","A type of public-key cryptography that gives strong security with shorter keys than RSA."],
"ECC":["elliptic curve cryptography","Public-key cryptography based on elliptic curves, used for signatures and key agreement."],
"ECDSA":["Elliptic Curve Digital Signature Algorithm","A widely used signature algorithm based on elliptic curves, for example with the P-256 curve."],
"EKM":["External Key Manager","Google Cloud's option for keeping keys in a key manager outside Google, which Cloud KMS calls when it needs them."],
"FIPS":["Federal Information Processing Standards","US government security standards. FIPS 140 sets the levels used to validate cryptographic modules such as HSMs."],
"GCM":["Galois/Counter Mode","A mode of using AES that encrypts and also detects tampering (an AEAD mode)."],
"GDPR":["General Data Protection Regulation","Data protection law that governs how personal data is handled, including keeping it secure."],
"HMAC":["hash-based message authentication code","A code made from a secret key and a hash function that proves a message came from a key holder and was not changed."],
"HSM":["hardware security module","A tamper-resistant device that generates and stores keys and performs cryptography so that keys never leave it in plain form."],
"HYOK":["hold your own key","Keys stay in a key manager you run outside the cloud provider; the provider must call it each time a key is used."],
"IAM":["identity and access management","The service and policies that decide who (people, roles, services) may do what to which resources."],
"IEC":["International Electrotechnical Commission","A standards body that publishes, jointly with ISO, standards such as ISO/IEC 27001."],
"ISO":["International Organization for Standardization","An international standards body, for example for ISO/IEC 27001 security management and ISO 8601 dates."],
"JSON":["JavaScript Object Notation","A plain-text format for structured data. AWS policies and event patterns are written in JSON."],
"KEK":["key encryption key","A key used only to encrypt (wrap) other keys, such as data encryption keys. It usually stays inside the KMS or HSM."],
"KEM":["key encapsulation mechanism","A public-key method for securely sharing a symmetric key. ML-KEM is the post-quantum standard."],
"KMS":["key management service","A service that creates, stores, controls and uses cryptographic keys. In this app, KMS means whichever key service your platform provides."],
"MAC":["message authentication code","A short code, made with a secret key, that shows a message is genuine and unchanged."],
"ML-DSA":["module-lattice-based digital signature algorithm","A NIST post-quantum signature standard, designed to resist attack by future quantum computers."],
"ML-KEM":["module-lattice-based key encapsulation mechanism","A NIST post-quantum standard for sharing keys, designed to resist attack by future quantum computers."],
"NCSC":["National Cyber Security Centre","The UK's technical authority for cyber security. Its guidance is the main reference for this app."],
"NIST":["National Institute of Standards and Technology","The US standards body that publishes cryptographic standards such as SP 800-57 on key management."],
"OAEP":["Optimal Asymmetric Encryption Padding","The recommended way of padding data before RSA encryption."],
"OT":["operational technology","Systems that monitor and control physical equipment, such as industrial control systems."],
"OU":["organizational unit","A group of accounts in AWS Organizations. Policies such as SCPs can be attached to a whole OU."],
"PKI":["public key infrastructure","The certificates, certificate authorities and processes that let people and systems trust public keys."],
"PQC":["post-quantum cryptography","New algorithms designed to stay secure even against future large quantum computers."],
"PSS":["Probabilistic Signature Scheme","The recommended way of creating RSA signatures."],
"RBAC":["role-based access control","Granting permissions to roles (such as key administrator) and then assigning people or services to those roles."],
"RCP":["resource control policy","An AWS Organizations policy that caps what can be done to resources, such as KMS keys, in member accounts, whoever is asking."],
"RDS":["Relational Database Service","AWS's managed database service. Its storage can be encrypted with KMS keys."],
"RF":["radio frequency","Wireless communications. The NCSC has guidance on securing RF links in OT systems."],
"RSA":["Rivest-Shamir-Adleman","A long-established public-key algorithm used for encryption and digital signatures."],
"S3":["Simple Storage Service","AWS object storage. Buckets can be encrypted with KMS keys (SSE-KMS)."],
"SCP":["service control policy","An AWS Organizations policy that sets the maximum permissions for accounts in an organization, for example to block key deletion."],
"SDK":["software development kit","Code libraries that make it easier for applications to call a service's API."],
"SIRO":["Senior Information Risk Owner","The senior person in a UK public body who owns information risk and accepts it on the organisation's behalf."],
"SLA":["service level agreement","An agreed target time or quality for completing something, such as fixing a finding within 30 days."],
"SNS":["Simple Notification Service","AWS's messaging service, used here to send security alerts to people or tools."],
"SOC":["security operations centre","The team that monitors security alerts and responds to incidents."],
"SOC 2":["System and Organization Controls 2","An independent audit report on a service provider's security controls."],
"SP":["Special Publication","A NIST document series. SP 800-57 is NIST's key management recommendation."],
"SRA":["Security Reference Architecture","AWS's published guidance on how to lay out security accounts and services in an organization."],
"SSE":["server-side encryption","The storage service encrypts your data for you when it is written, for example SSE-KMS uses a KMS key."],
"TDE":["transparent data encryption","Database encryption that happens automatically underneath the application."],
"TLS":["Transport Layer Security","The protocol that encrypts data in transit, for example between a browser or application and a service."],
"VM":["virtual machine","A software-based computer running on a cloud provider's hardware."],
"VPC":["virtual private cloud","Your own isolated network inside a cloud provider."],
"XKS":["external key store","An AWS KMS feature where keys stay in a key manager outside AWS that you operate, reached through a proxy."]
};
var PLURAL={SCP:1,RCP:1,HSM:1,KEK:1,DEK:1,ADR:1,OU:1,CMK:1,DBA:1,ARN:1,API:1,CA:1,VPC:1,VM:1,SDK:1};
var keys=Object.keys(G).sort(function(a,b){ return b.length-a.length; });
var RE=new RegExp("(?<![A-Za-z0-9-])("+keys.map(function(k){return k.replace(/[\\^$.*+?()[\]{}|\/-]/g,"\\$&");}).join("|")+")(s?)(?![A-Za-z0-9])","g");
var SKIP={THEAD:1,CAPTION:1,H1:1,H2:1,H3:1,H4:1,PRE:1,CODE:1,A:1,ABBR:1,BUTTON:1,SCRIPT:1,STYLE:1,svg:1,SVG:1,TEXTAREA:1,TITLE:1,OPTION:1};
function skip(n, root, ex){ for(var p=n.parentNode; p && p!==root.parentNode; p=p.parentNode){ if(SKIP[p.nodeName]) return true; if(p.classList && (p.classList.contains("noabbr")||p.classList.contains("crefs"))) return true; if(p.getAttribute && p.getAttribute("role")==="tab") return true; if(ex && p.classList && p.classList.contains(ex)) return true; } return false; }
function abbr(k, s){ var a=document.createElement("abbr"); a.title=G[k][0]; a.textContent=k+(s||""); return a; }
function scope(root, seen, ex){
  var w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list=[], n;
  while((n=w.nextNode())) if(n.nodeValue && /[A-Z]{2}|S3/.test(n.nodeValue) && !skip(n, root, ex)) list.push(n);
  list.forEach(function(t){
    var v=t.nodeValue, last=0, m, frag=null; RE.lastIndex=0;
    while((m=RE.exec(v))){ var k=m[1], s=m[2]; if(s && !PLURAL[k]) continue;
      if(!frag) frag=document.createDocumentFragment();
      frag.appendChild(document.createTextNode(v.slice(last, m.index)));
      var already=/\($/.test(v.slice(0,m.index).trimEnd()) || v.slice(Math.max(0,m.index-G[k][0].length-4), m.index).toLowerCase().indexOf(G[k][0].toLowerCase())>=0;
      if(!seen[k] && !already){ var fw=G[k][0]; if(s) fw=/[^aeiou]y$/.test(fw)?fw.slice(0,-1)+"ies":fw+"s"; var pre=v.slice(0,m.index); if((pre.trim()===""&&t.previousSibling===null)||/[.!?]\s+$/.test(pre)) fw=fw.charAt(0).toUpperCase()+fw.slice(1); frag.appendChild(document.createTextNode(fw+" (")); frag.appendChild(abbr(k,s)); frag.appendChild(document.createTextNode(")")); }
      else frag.appendChild(abbr(k,s));
      seen[k]=1; last=m.index+k.length+s.length; }
    if(frag){ frag.appendChild(document.createTextNode(v.slice(last))); t.parentNode.replaceChild(frag, t); } });
}
var obs=null, busy=false, timer=null;
var SEEN={};
function annotate(){
  if(busy) return; busy=true; if(obs) obs.disconnect();
  var panels=document.querySelectorAll(".tabpanel");
  for(var i=0;i<panels.length;i++){ var p=panels[i];
    if(p.id==="view-arch"){ var secs=p.querySelectorAll("section.asec");
      SEEN["arch-head"]=SEEN["arch-head"]||{}; scope(p, SEEN["arch-head"], "asec");
      Array.prototype.forEach.call(secs, function(s){ if(s.id==="arch-glossary") return; SEEN[s.id]=SEEN[s.id]||{}; scope(s, SEEN[s.id]); }); }
    else { SEEN[p.id]=SEEN[p.id]||{}; scope(p, SEEN[p.id]); } }
  var m=document.querySelector("main")||document.body;
  busy=false; if(window.MutationObserver){ if(!obs) obs=new MutationObserver(function(){ clearTimeout(timer); timer=setTimeout(annotate,60); }); obs.observe(m,{childList:true,subtree:true}); }
}
function list(){
  var dl=document.createElement("dl"); dl.className="gloss noabbr"; dl.id="glossary-list";
  Object.keys(G).sort(function(a,b){ return a.localeCompare(b); }).forEach(function(k){
    var dt=document.createElement("dt"); dt.id="g-"+k.toLowerCase().replace(/[^a-z0-9]+/g,"-"); dt.appendChild(abbr(k)); var f=document.createElement("span"); f.className="gfull"; f.textContent=" — "+G[k][0]; dt.appendChild(f);
    var dd=document.createElement("dd"); dd.textContent=G[k][1]; dl.appendChild(dt); dl.appendChild(dd); });
  return dl;
}
function legend(d){
  var words=[]; (d.groups||[]).forEach(function(g){ words.push(g.t); }); (d.nodes||[]).forEach(function(n){ words.push(n.t.join(" ")); }); (d.edges||[]).forEach(function(e){ if(e.t) words.push(e.t); });
  var t=words.join(" "), found=[], m; RE.lastIndex=0;
  while((m=RE.exec(t))) if(found.indexOf(m[1])<0) found.push(m[1]);
  if(!found.length) return null; found.sort();
  var p=document.createElement("p"); p.className="legend noabbr"; p.appendChild(document.createTextNode("Abbreviations in this diagram: "));
  found.forEach(function(k,i){ if(i) p.appendChild(document.createTextNode("; ")); p.appendChild(abbr(k)); p.appendChild(document.createTextNode(" = "+G[k][0])); });
  p.appendChild(document.createTextNode(".")); return p;
}
window.KMS_GLOSS={terms:G, annotate:annotate, list:list, legend:legend};
var printOpened=[];
window.addEventListener("beforeprint", function(){ printOpened=[]; Array.prototype.forEach.call(document.querySelectorAll("details:not([open])"), function(d){ d.open=true; printOpened.push(d); }); });
window.addEventListener("afterprint", function(){ printOpened.forEach(function(d){ d.open=false; }); printOpened=[]; });
function init(){ setTimeout(annotate, 0); }
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
