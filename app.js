/* WBCS Prelims Mock Series engine. Add content only in data/. */
const $=s=>document.querySelector(s),LS=(k,v)=>v===undefined?JSON.parse(localStorage.getItem(k)||"null"):localStorage.setItem(k,JSON.stringify(v));
const DB={},P={},nm=k=>(BANK.find(b=>b.slug===k)||{name:k}).name,fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
let Z=null,LAST=null,V="home",A,CF,RF="all";
/* ---- data ---- */
function registerSet(slug,set,qs){(DB[slug]=DB[slug]||[]).push(...qs.map((x,i)=>({...x,id:`${slug}-${set}-Q${String(i+1).padStart(3,"0")}`,sec:slug,set})))}
const load=(slug,set)=>P[slug+set]||(P[slug+set]=new Promise(r=>{const s=document.createElement("script");s.src=`data/${slug}/${set}.js`;s.onload=r;s.onerror=()=>{console.warn("Missing file",s.src);r()};document.head.appendChild(s)}));
const loadAll=()=>Promise.all(BANK.flatMap(b=>b.sets.map(s=>load(b.slug,s))));
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const shuf=(arr,r=Math.random)=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const hash=s=>[...s].reduce((h,c)=>h*31+c.charCodeAt(0)|0,7);
/* n = mock number (same paper every time, no repeats between mocks) or 0 = fresh random */
function buildMock(n){const out=[],notes=[];
 MOCK_PATTERN.units.forEach((u,ui)=>{const got=[];let short=0;
  Object.entries(u.from).forEach(([slug,cnt])=>{const base=n?shuf(DB[slug]||[],rng(hash(slug))):shuf(DB[slug]||[]),k=Math.min(cnt,base.length),off=base.length?((n?n-1:0)*cnt)%base.length:0;
   got.push(...[...base,...base].slice(off,off+k));if(k<cnt){short+=cnt-k;notes.push(`${nm(slug)} ${k}/${cnt}`)}});
  if(short){const ids=new Set(got.map(q=>q.id));got.push(...shuf(Object.keys(u.from).flatMap(s=>DB[s]||[]).filter(q=>!ids.has(q.id))).slice(0,short))}
  got.forEach(q=>out.push({...q,unit:ui}))});
 return{qs:out,notes}}
/* ---- storage ---- */
const H=()=>LS("wbcs_hist")||[],ST=()=>LS("wbcs_set")||{neg:MOCK_PATTERN.negative,mpq:MOCK_PATTERN.mpq},pctOf=r=>Math.max(0,Math.round(r.marks/r.max*100));
function agg(){const o={};H().forEach(r=>Object.entries(r.bySec).forEach(([k,g])=>{const x=o[k]=o[k]||{c:0,w:0};x.c+=g.c;x.w+=g.w}));return o}
/* ---- navigation ---- */
function go(v,a){if(Z&&v!=="quiz"){if(!confirm("Leave this test? Your answers will be lost."))return;clearInterval(Z.iv);Z=null}V=v;A=a;draw();scrollTo(0,0)}
function draw(){$("#app").innerHTML=({home,secPage,mocks,hist,quiz,result,review})[V](A);$("#dock").innerHTML=Z?qdock():[["home","⌂","Home"],["mocks","◎","Mocks"],["hist","◔","Progress"]].map(([v,i,l])=>`<button class="${V===v?"on":""}" onclick="go('${v}')">${i}<small>${l}</small></button>`).join("")}
function theme(t){document.documentElement.dataset.theme=t;LS("wbcs_theme",t);$("#theme").textContent=t==="dark"?"☀":"☾"}
/* ---- pages ---- */
function home(){const h=H(),ag=agg(),avg=h.length?Math.round(h.reduce((s,r)=>s+pctOf(r),0)/h.length):0,best=h.length?Math.max(...h.map(pctOf)):0;
 return `<section class="hero"><h1>WBCS Prelims<br>Mock Test Series</h1><p>18 topics, 100-question sets and 200-mark full mocks.</p><button class="btn p" onclick="go('mocks')">Start a full mock</button></section>
 <div class="stats"><div class="st"><b>${h.length}</b>Tests taken</div><div class="st"><b>${avg}%</b>Average</div><div class="st"><b>${best}%</b>Best</div></div><h2>Topics</h2>
 <div class="grid">${BANK.map(b=>{const g=ag[b.slug],ac=g&&g.c+g.w?Math.round(g.c/(g.c+g.w)*100)+"% accuracy":"Not practised";return `<div class="card"><h3>${b.name}</h3><p class="meta">${b.sets.length?b.sets.length+" set(s), "+ac:"Coming soon"}</p><button class="btn" ${b.sets.length?"":"disabled"} onclick="go('secPage','${b.slug}')">Open</button></div>`}).join("")}</div>`}
function secPage(slug){const b=BANK.find(x=>x.slug===slug),h=H();
 return `<button class="link" onclick="go('home')">← All topics</button><h2>${b.name}</h2><p class="meta">Pick a set, or mix all sets of this topic.</p><div class="grid">${b.sets.map(s=>{const t=h.filter(r=>r.name===`${b.name} · ${s}`);return `<div class="card"><h3>${s.replace("set","Set")}</h3><p class="meta">${t.length?"Best "+Math.max(...t.map(pctOf))+"%":"Not attempted"}</p><button class="btn p" onclick="openSet('${slug}','${s}')">Start</button></div>`}).join("")}<div class="card"><h3>Mix all sets</h3><p class="meta">Random order</p><button class="btn p" onclick="openSet('${slug}')">Start</button></div></div>`}
function mocks(){const h=H(),u=MOCK_PATTERN.units,card=(n,t)=>{const a=h.filter(r=>r.name===t);return `<div class="card"><h3>${t}</h3><p class="meta">${a.length?`Best ${Math.max(...a.map(pctOf))}%, ${a.length} attempt(s)`:"Not attempted"}</p><button class="btn p" onclick="openMock(${n})">Start</button></div>`};
 return `<h2>Full mock tests</h2><p class="meta">${u.length} units × ${u[0].total} questions, ${MOCK_PATTERN.totalMinutes} minutes. Numbered mocks never repeat a question.</p><div class="grid">${Array.from({length:MOCK_COUNT},(_,i)=>card(i+1,"Full Mock "+(i+1))).join("")}${card(0,"Fresh Random Mock")}</div>`}
function hist(){const h=H(),ag=agg(),pts=h.slice(0,15).reverse().map(pctOf),
 sp=pts.length>1?`<svg viewBox="0 0 300 70" class="spark"><polyline fill="none" stroke="var(--acc)" stroke-width="3" points="${pts.map((p,i)=>`${i*300/(pts.length-1)},${66-p*.62}`).join(" ")}"/></svg>`:"",
 sec=Object.entries(ag).filter(([,g])=>g.c+g.w).map(([k,g])=>[k,Math.round(g.c/(g.c+g.w)*100)]).sort((a,b)=>a[1]-b[1]);
 return `<h2>Your progress</h2>${sp}<h3>Topic accuracy, weakest first</h3>${sec.map(([k,a])=>`<div class="row"><span>${nm(k)}</span><div class="bar ${a<60?"lo":""}"><i style="width:${a}%"></i></div><small>${a}%</small></div>`).join("")||"<p class='meta'>Take a test to see this.</p>"}
 <h3>Attempts</h3><div class="grid">${h.map((r,i)=>`<div class="card"><h3>${r.name}</h3><p class="meta">${new Date(r.date).toLocaleDateString()}, ${r.marks}/${r.max} (${pctOf(r)}%)</p><button class="btn" onclick="viewHist(${i})">Analysis</button></div>`).join("")}</div>
 <div class="acts"><button class="btn" onclick="exp()">Export backup</button><button class="btn" onclick="$('#imp').click()">Import backup</button><button class="btn" onclick="resetAll()">Reset analysis</button><input id="imp" type="file" accept=".json" hidden onchange="imp(this)"></div>`}
function exp(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(H())],{type:"application/json"}));a.download="wbcs-progress.json";a.click()}
function imp(i){const f=i.files[0];f&&f.text().then(t=>{try{LS("wbcs_hist",JSON.parse(t));draw()}catch(e){alert("This file is not a valid backup.")}})}
function viewHist(i){LAST={R:H()[i],qs:[],ans:{}};go("result")}
function resetAll(){if(!confirm("Reset all analysis and history? This cannot be undone. Tip: export a backup first."))return;localStorage.removeItem("wbcs_hist");localStorage.removeItem("wbcs_set");LAST=null;draw()}
/* ---- starting tests ---- */
async function openSet(slug,set){const b=BANK.find(x=>x.slug===slug);await Promise.all(b.sets.map(s=>load(slug,s)));
 const qs=(DB[slug]||[]).filter(q=>!set||q.set===set);if(!qs.length)return alert("No questions found in data/"+slug+"/");
 cfgOpen({name:`${b.name} · ${set||"Mixed"}`,qs,mins:0,mode:"practice",rand:!set})}
async function openMock(n){$("#app").innerHTML="<p class='meta'>Building your mock…</p>";await loadAll();const{qs,notes}=buildMock(n);draw();
 if(!qs.length)return alert("The question bank is empty. Add sets in data/ first.");
 cfgOpen({name:n?`Full Mock ${n}`:"Fresh Random Mock",qs,mins:MOCK_PATTERN.totalMinutes,mode:"exam",mock:1,notes})}
function cfgOpen(o){CF=o;const s=ST(),d=$("#cfg");
 d.innerHTML=`<h3>${o.name}</h3><p class="meta">${o.qs.length} questions${o.notes&&o.notes.length?". Short of questions in: "+o.notes.join(", "):""}</p>
 <label>Mode</label><select id="c-mode"><option value="practice">Practice (answer shown instantly)</option><option value="exam">Exam (review at the end)</option></select>
 ${o.mock?"":`<label>Number of questions</label><input id="c-n" type="number" min="1" max="${o.qs.length}" value="${Math.min(o.qs.length,100)}"><label><input type="checkbox" id="c-r" ${o.rand?"checked":""}>Random order</label>`}
 <label>Timer in minutes (0 for none)</label><input id="c-t" type="number" min="0" value="${o.mins}">
 <label>Marks per question</label><input id="c-m" type="number" step=".5" min="0" value="${s.mpq}">
 <label>Negative marking (fraction of a mark)</label><select onchange="$('#c-g').value=this.value"><option value="">Quick pick</option><option value="0">None</option><option value=".25">¼</option><option value=".33">⅓</option><option value=".5">½</option></select><input id="c-g" type="number" step=".01" min="0" max="1" value="${s.neg}">
 <label><input type="checkbox" id="c-s">Shuffle answer options</label>
 <div class="acts"><button class="btn" onclick="$('#cfg').close()">Cancel</button><button class="btn p" onclick="cfgGo()">Start test</button></div>`;
 $("#c-mode").value=o.mode;d.showModal()}
function cfgGo(){const o=CF,g=id=>$("#"+id),n=g("c-n")?+g("c-n").value:o.qs.length;let qs=g("c-r")&&g("c-r").checked?shuf(o.qs):o.qs;qs=qs.slice(0,n||qs.length);
 const mpq=+g("c-m").value||1,neg=+g("c-g").value||0;LS("wbcs_set",{neg,mpq});$("#cfg").close();
 start({name:o.name,qs,mode:g("c-mode").value,mins:+g("c-t").value||0,mpq,neg,shuf:g("c-s").checked})}
function start(o){const qs=o.qs.map(q=>({...q,oi:o.shuf?shuf([0,1,2,3]):[0,1,2,3]}));
 Z={...o,qs,i:0,ans:{},mark:{},time:{},left:o.mins?o.mins*60:null,t0:Date.now()};Z.iv=setInterval(tick,1000);go("quiz")}
function retry(){cfgOpen({name:LAST.R.name+" · Retry",qs:LAST.qs.filter(q=>LAST.ans[q.id]!==q.oi.indexOf(q.answer)),mins:0,mode:"practice"})}
/* ---- quiz ---- */
function tick(){const q=Z.qs[Z.i];Z.time[q.id]=(Z.time[q.id]||0)+1;if(Z.left!==null&&--Z.left<=0)return submit();const t=$("#clock");if(t)t.textContent=fmt(Z.left??Math.round((Date.now()-Z.t0)/1000))}
function quiz(){const q=Z.qs[Z.i],a=Z.ans[q.id],cor=q.oi.indexOf(q.answer),done=Z.mode==="practice"&&a!==undefined,u=q.unit;
 return `<div class="qh"><span>Q ${Z.i+1} of ${Z.qs.length}, ${nm(q.sec)}${u!==undefined?" ("+MOCK_PATTERN.units[u].name+")":""}</span><b id="clock" class="clock">${fmt(Z.left??Math.round((Date.now()-Z.t0)/1000))}</b></div>
 <div class="bar"><i style="width:${(Z.i+1)/Z.qs.length*100}%"></i></div><h2 class="q">${q.q}</h2>
 ${q.oi.map((k,j)=>`<button class="opt${a===j?" sel":""}${done&&j===cor?" ok":""}${done&&a===j&&j!==cor?" no":""}" onclick="pick(${j})"><i>${"ABCD"[j]}</i>${q.options[k]}</button>`).join("")}
 ${done&&q.explanation?`<p class="exp"><b>Explanation:</b> ${q.explanation}</p>`:""}`}
const qdock=()=>{const q=Z.qs[Z.i];return `<button onclick="nav(-1)">◀<small>Prev</small></button><button onclick="sheet()">▦<small>Palette</small></button><button onclick="mk()">${Z.mark[q.id]?"★":"☆"}<small>Mark</small></button><button onclick="clr()">⌫<small>Clear</small></button><button onclick="nav(1)">▶<small>Next</small></button><button class="go" onclick="fin()">✔<small>Submit</small></button>`};
function pick(j){const q=Z.qs[Z.i];if(Z.mode==="practice"&&Z.ans[q.id]!==undefined)return;Z.ans[q.id]=j;draw()}
function nav(d){const n=Z.i+d;if(n>=0&&n<Z.qs.length){Z.i=n;draw()}}
function mk(){const q=Z.qs[Z.i];Z.mark[q.id]=!Z.mark[q.id];draw()}
function clr(){delete Z.ans[Z.qs[Z.i].id];draw()}
function fin(){const u=Z.qs.filter(q=>Z.ans[q.id]===undefined).length;if(confirm(`Submit now? ${u} question(s) unanswered.`))submit()}
function sheet(open=true){const s=$("#sheet");if(!open)return s.classList.remove("open");let h="",last=-1;
 Z.qs.forEach((q,i)=>{if(q.unit!==undefined&&q.unit!==last){h+=`<h4>${MOCK_PATTERN.units[q.unit].name}</h4>`;last=q.unit}
  h+=`<button class="cell${i===Z.i?" cur":""}${Z.ans[q.id]!==undefined?" ans":""}${Z.mark[q.id]?" mk":""}" onclick="Z.i=${i};sheet(false);draw()">${i+1}</button>`});
 s.innerHTML=`<div class="sh"><div class="shh"><b>Question palette</b><button class="btn" onclick="sheet(false)">Close</button></div>${h}<p class="meta"><span class="lg cell ans"></span> Answered &nbsp; <span class="lg cell mk"></span> Marked</p></div>`;s.classList.add("open")}
addEventListener("keydown",e=>{if(!Z||$("#cfg").open)return;if("1234".includes(e.key))pick(+e.key-1);if(e.key==="ArrowRight")nav(1);if(e.key==="ArrowLeft")nav(-1)});
addEventListener("beforeunload",e=>{if(Z){e.preventDefault();e.returnValue=""}});
/* ---- scoring and analysis ---- */
function submit(){clearInterval(Z.iv);const R={name:Z.name,date:Date.now(),mode:Z.mode,neg:Z.neg,mpq:Z.mpq,total:Z.qs.length,c:0,w:0,s:0,fast:0,time:Math.round((Date.now()-Z.t0)/1000),bySec:{},byUnit:{}};
 Z.qs.forEach(q=>{const a=Z.ans[q.id],ok=a!==undefined&&q.oi.indexOf(q.answer)===a,t=Z.time[q.id]||0;
  [[R.bySec,q.sec],...(q.unit!==undefined?[[R.byUnit,MOCK_PATTERN.units[q.unit].name]]:[])].forEach(([o,k])=>{const g=o[k]=o[k]||{n:0,c:0,w:0,t:0};g.n++;g.t+=t;if(a!==undefined)ok?g.c++:g.w++});
  if(a===undefined)R.s++;else if(ok)R.c++;else{R.w++;if(t<10)R.fast++}});
 R.marks=+(R.c*R.mpq-R.w*R.neg*R.mpq).toFixed(2);R.max=R.total*R.mpq;
 LS("wbcs_hist",[R,...H()].slice(0,100));LAST={R,qs:Z.qs,ans:Z.ans};Z=null;go("result")}
function insights(R,pv){const I=[],S=Object.entries(R.bySec).map(([k,g])=>({k,g,a:g.c+g.w})).filter(x=>x.g.n>=3),avgT=R.time/R.total,pc=x=>Math.round(x.g.c/x.a*100);
 S.filter(x=>x.a>=2&&pc(x)<60).sort((a,b)=>pc(a)-pc(b)).slice(0,3).forEach(x=>I.push(`🔴 <b>${nm(x.k)}</b>: ${pc(x)}% accuracy. Revise this first.`));
 const st=S.filter(x=>x.a>=3&&pc(x)>=80).map(x=>nm(x.k));if(st.length)I.push(`🟢 Strong in ${st.join(", ")}. Keep them fresh with short drills.`);
 const sk=S.filter(x=>x.g.n-x.a>x.g.n*.4).map(x=>nm(x.k));if(sk.length)I.push(`🟡 Many skipped in ${sk.join(", ")}. Attempt questions where you can narrow it to two options.`);
 const sl=S.filter(x=>x.g.t/x.g.n>Math.max(avgT*1.5,45)).map(x=>nm(x.k));if(sl.length)I.push(`🐢 Slow in ${sl.join(", ")}. Set a time cap per question.`);
 if(R.neg&&R.w)I.push(`⚠️ Wrong answers cost ${(R.w*R.neg*R.mpq).toFixed(2)} marks. Guess only when you can eliminate options (break-even is about ${Math.round(R.neg/(1+R.neg)*100)}% confidence).`);
 if(R.fast>2)I.push(`⚡ ${R.fast} wrong answers took under 10 seconds. Likely careless reading; read every option.`);
 if(R.s>R.total*.2)I.push(`⏱ ${R.s} unanswered. Make a first pass for sure answers, then return to marked ones.`);
 if(pv)I.push(`📈 Against your previous attempt of this test: ${R.marks>=pv.marks?"+":""}${(R.marks-pv.marks).toFixed(1)} marks.`);
 return I.length?I:["A solid, balanced attempt. Take more tests to unlock trend insights."]}
function result(){const L=LAST,R=L.R,att=R.c+R.w,acc=att?Math.round(R.c/att*100):0,pct=pctOf(R),pv=H().slice(1).find(h=>h.name===R.name),
 rows=o=>Object.entries(o).map(([k,g])=>{const a=g.c+g.w,ac=a?Math.round(g.c/a*100):0;return `<div class="row"><span>${nm(k)}</span><div class="bar ${ac<60?"lo":""}"><i style="width:${ac}%"></i></div><small>${g.c}/${g.n}, ${ac}%, ${g.n?Math.round(g.t/g.n):0}s each</small></div>`}).join(""),
 weak=Object.entries(R.bySec).filter(([,g])=>g.c+g.w>1).sort((a,b)=>a[1].c/(a[1].c+a[1].w)-b[1].c/(b[1].c+b[1].w))[0];
 return `<h2>${R.name}</h2><div class="score"><svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="${pct*3.267} 327" transform="rotate(-90 60 60)"/><text x="60" y="62" text-anchor="middle">${R.marks}</text><text x="60" y="80" text-anchor="middle" class="sm">out of ${R.max}</text></svg>
 <div class="stats"><div class="st"><b>${R.c}</b>Correct</div><div class="st"><b>${R.w}</b>Wrong</div><div class="st"><b>${R.s}</b>Skipped</div><div class="st"><b>${acc}%</b>Accuracy</div><div class="st"><b>${fmt(R.time)}</b>Time</div></div></div>
 <h3>What to improve</h3><div class="card">${insights(R,pv).map(i=>`<p>${i}</p>`).join("")}</div>
 ${Object.keys(R.byUnit).length?`<h3>Unit-wise</h3>${rows(R.byUnit)}`:""}<h3>Topic-wise</h3>${rows(R.bySec)}
 <div class="acts">${L.qs.length?`<button class="btn p" onclick="RF='all';go('review')">Review answers</button>`:""}${L.qs.length&&R.w+R.s?`<button class="btn" onclick="retry()">Retry wrong and skipped</button>`:""}${weak&&weak[1].c/(weak[1].c+weak[1].w)<.7?`<button class="btn" onclick="openSet('${weak[0]}')">Practise ${nm(weak[0])}</button>`:""}</div>`}
function review(){const L=LAST,items=L.qs.map((q,i)=>{const a=L.ans[q.id],cor=q.oi.indexOf(q.answer);return{q,i,a,cor,st:a===undefined?"skip":a===cor?"ok":"no"}}).filter(x=>RF==="all"||(RF==="no"?x.st==="no":x.st!=="ok"));
 return `<button class="link" onclick="go('result')">← Result</button><h2>Review</h2><div class="chips">${[["all","All"],["no","Wrong"],["skip","Wrong and skipped"]].map(([k,l])=>`<button class="chip${RF===k?" on":""}" onclick="RF='${k}';draw()">${l}</button>`).join("")}</div>`
 +items.map(x=>`<div class="card rv ${x.st}"><p class="meta">Q${x.i+1}, ${nm(x.q.sec)}</p><p><b>${x.q.q}</b></p>${x.q.oi.map((k,j)=>`<div class="ro${j===x.cor?" ok":j===x.a?" no":""}">${x.q.options[k]}</div>`).join("")}${x.q.explanation?`<p class="exp">${x.q.explanation}</p>`:""}</div>`).join("")}
/* ---- init ---- */
$("#theme").onclick=()=>theme(document.documentElement.dataset.theme==="dark"?"light":"dark");
window.WBCS_OK=1;
theme(LS("wbcs_theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"));draw();
/* ---- copy deterrent ---- */
addEventListener("contextmenu",e=>{if(!/INPUT|SELECT/.test(e.target.tagName))e.preventDefault()});
addEventListener("copy",e=>{if(!/INPUT|SELECT/.test((document.activeElement||{}).tagName||""))e.preventDefault()});
