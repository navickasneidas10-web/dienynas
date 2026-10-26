/* Dienynas — mokinio ir tėvų rodiniai, pranešimai, paskyra */
/* ================= MOKINYS / TĖVAI ================= */
function needChild(){const sid=viewedStudent();return sid?null:`<h1>Vaiko dienynas</h1><div class="sheet empty">Prie paskyros dar nepridėtas vaikas. <button class="btn" data-act="view" data-v="p_add">Pridėti vaiką</button></div>`;}
/* ---- Bendri pagalbiniai ---- */
/* Mėnesių skirtukai: nuo mokslo metų pradžios iki einamojo mėnesio arba vėliausio mėnesio, kuriame yra įrašų */
function yearMonths(withData){const r=yearRange();let end=(TODAY()<r.to?TODAY():r.to).slice(0,7);
  if(withData)withData.forEach(m=>{if(m>end&&m<=r.to.slice(0,7))end=m;});const out=[];let y=+r.from.slice(0,4),m=+r.from.slice(5,7);
  for(let i=0;i<14;i++){const k=`${y}-${String(m).padStart(2,"0")}`;out.push(k);if(k>=end)break;m++;if(m>12){m=1;y++;}}return out;}
function monthTabs(key,withData){const ms=yearMonths(withData);if(!ms.includes(ui[key])){const now=TODAY().slice(0,7);const d=withData?ms.filter(m=>withData.has(m)):[];const past=d.filter(m=>m<=now);ui[key]=d.includes(now)?now:past.length?past[past.length-1]:d.length?d[0]:ms[ms.length-1];}
  const i=ms.indexOf(ui[key]),m=ui[key];
  return `<div class="mtabs only-d" role="tablist">${ms.map(m=>`<button role="tab" aria-selected="${ui[key]===m}" data-act="mtab" data-k="${key}" data-v="${m}">${m}</button>`).join("")}</div>
  <div class="mnav only-m"><button data-act="mtab" data-k="${key}" data-v="${ms[i-1]||""}" ${i<=0?"disabled":""} aria-label="Ankstesnis mėnuo">${ICON.chevL}</button><b>${m.slice(0,4)} ${MONTHS[+m.slice(5)-1].toUpperCase()}</b><button data-act="mtab" data-k="${key}" data-v="${ms[i+1]||""}" ${i>=ms.length-1?"disabled":""} aria-label="Kitas mėnuo">${ICON.chev}</button></div>`;}
const pad2=n=>String(n).padStart(2,"0");
function stamp(at){if(!at)return"";const d=new Date(at);if(isNaN(d))return"";return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}<br>${pad2(d.getHours())}:${pad2(d.getMinutes())}`;}
const typeLbl=t=>`<span class="${t==="KD"?"kdtxt":""}">${esc(TYPE_NAME[t]||t||"")}</span>`;

/* ---- Dienų blokai (senas dienyno dizainas) ---- */
const dayBlocks=(days,rowsFor,mon=false)=>`<div class="diary">${days.map(d=>`<div class="dday"><div class="dday-h"><b>${+d.slice(8)}</b><span>${WD[wdOf(d)]}</span>${mon?`<span class="small">${MONTHS[+d.slice(5,7)-1].slice(0,3)}.</span>`:""}</div><div>${rowsFor(d)}</div></div>`).join("")}</div>`;
const drow=(attrs,val,txt,time="")=>`<button class="drow" ${attrs}><span class="dval">${val}</span><span class="dtxt">${txt}</span><span class="dtime">${time}</span></button>`;
const stripe=t=>t?` ts" style="--tc:${tc(t)}`:"";
const barCls=t=>t?`" style="--tc:${tc(t)}`:"";
function subjFilterOpts(sid){return [["*","Visi dalykai"],...[...new Set(studentGroups(sid).map(g=>g.subjectId))].map(s=>[s,subjName(s)]).sort((a,b)=>lsort(a[1],b[1]))];}

/* ---- Naujausi įvykiai: pažymiai, lankomumas, namų darbai, pagyrimai/pastabos pagal įrašymo datą ---- */
VIEWS.s_events=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const items=[];const day=at=>at?String(at).slice(0,10)===String(at).slice(0,10)&&(()=>{const d=new Date(at);return isNaN(d)?null:`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;})():null;
  studentGroups(sid).forEach(g=>{const D=G(g.id);
    D.grades.filter(x=>x.s===sid).forEach(x=>items.push({k:"g",ed:day(x.at)||kDate(x.d),at:x.at||x.d,g,x}));
    D.att.filter(x=>x.s===sid).forEach(x=>items.push({k:"a",ed:day(x.at)||kDate(x.d),at:x.at||x.d,g,x}));
    D.notes.filter(x=>x.s===sid).forEach(x=>items.push({k:"n",ed:day(x.at)||kDate(x.d),at:x.at||x.d,g,x}));
    D.lessons.filter(l=>l.hw).forEach(l=>items.push({k:"h",ed:day(l.hwAt)||kDate(l.d),at:l.hwAt||l.d,g,x:l}));});
  const from=addDays(TODAY(),-4);const list=items.filter(i=>i.ed>=from&&i.ed<=TODAY()).sort((a,b)=>lsort(b.at,a.at));
  const days=[...new Set(list.map(i=>i.ed))].sort().reverse();
  const at=i=>`data-act="stuLesson" data-g="${i.g.id}" data-d="${i.x.d}"`;const les=(x,extra="")=>`<span class="te-les">Įrašyta į <b>${dayGen(x.d)}</b> pamoką.${extra}</span>`;
  const r=(A,val,bar,title,lines,foot)=>`<button class="te-row" ${A}><span class="te-v">${val}</span><span class="te-b${bar?"":" nob"}"${bar?` style="--tc:${tc(bar)}"`:""}></span><span class="te-t"><b>${title}</b>${lines}</span><span class="te-f">${foot}</span></button>`;
  const row=i=>{const g=i.g,x=i.x,sub=esc(subjName(g.subjectId));
    if(i.k==="g")return r(at(i),esc(VLABEL[x.v]??x.v),x.t||"KL",sub,`<span>${esc(TYPE_NAME[x.t]||x.t||"")}</span>`,les(x));
    if(i.k==="a")return r(at(i),x.m==="pv"?"p":esc(x.j||"n"),"",sub,`<span>${x.m==="pv"?"Pavėlavo":x.j?"Nedalyvavo — "+esc(JUST_NAME[x.j]):"Nedalyvavo"}</span>`,les(x));
    if(i.k==="n")return r(at(i),`<span class="te-ic note-${x.kind}">${ICON.note}</span>`,"",`${esc(NOTE_NAME[x.kind]||"")} · ${sub}`,`<span>${esc(x.text)}</span>`,les(x));
    return r(at(i),`<span class="te-ic hw">${ICON.hw}</span>`,"",sub,`<span>${esc(x.hw)}</span>`,les(x,x.hwDue?` Atlikti iki <b>${dayGen(x.hwDue)}</b>`:""));};
  const head=d=>`<div class="te-h"><span>${+d.slice(8)} ${WD_FULL[wdOf(d)]}</span><span class="te-chip">${d===TODAY()?"Šiandien":MONTHS[+d.slice(5,7)-1]}</span></div>`;
  return `<h1>Naujausi įvykiai</h1>${days.length?`<div class="te">${days.map(d=>head(d)+list.filter(i=>i.ed===d).map(row).join("")).join("")}</div>`:'<div class="sheet empty">Per paskutines 5 dienas naujų įrašų nėra.</div>'}`;};

/* ---- Dienynas: pažymiai ir lankomumas pagal dienas arba dalykus ---- */
VIEWS.s_diary=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>{const D=G(g.id);D.grades.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});D.att.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});});
  const tabs=monthTabs("dMonth",have);const mon=ui.dMonth;if(!["days","subj"].includes(ui.dTab))ui.dTab="days";const so=subjFilterOpts(sid);if(!so.some(x=>x[0]===ui.dSubj))ui.dSubj="*";
  const items=[];studentGroups(sid).filter(g=>ui.dSubj==="*"||g.subjectId===ui.dSubj).forEach(g=>{const D=G(g.id);
    D.grades.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"g",d:x.d,g,x,at:x.at||""}));
    D.att.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"a",d:x.d,g,x,at:x.at||""}));});
  const head=`<h1>${me().role==="parent"?"Vaiko dienynas":"Mokinio dienynas"}</h1><p class="lead">${esc(uNameFL(sid))} · ${esc(clsName(U(sid).classId))} klasė</p>
   <div class="bar">${tabs}${sel("dSubj",so,ui.dSubj,"Dalykas")}</div>
   <div class="tabs"><button aria-selected="${ui.dTab==="days"}" data-act="dTab" data-v="days">Pagal dienas</button><button aria-selected="${ui.dTab==="subj"}" data-act="dTab" data-v="subj">Pagal dalykus</button></div>`;
  if(!items.length)return head+`<div class="sheet empty">${mon}: įvertinimų ir lankomumo žymų nėra.</div>`;
  if(ui.dTab==="subj"){const bySub=new Map();items.filter(i=>i.k==="g").forEach(i=>{const k=subjName(i.g.subjectId);(bySub.get(k)||bySub.set(k,[]).get(k)).push(i);});
    const rows=[...bySub.entries()].sort((a,b)=>lsort(a[0],b[0])).map(([name,list])=>{list.sort((a,b)=>lsort(a.d,b.d));const av=avgOf(list.map(i=>i.x));
      return `<tr><td><b>${esc(name)}</b><div class="dgrades only-m" style="margin-top:4px">${list.map(i=>`<span class="dg">${chip(i.x,false)}<small>${i.d.slice(5,10)}</small></span>`).join("")}</div></td><td class="only-d"><div class="dgrades">${list.map(i=>`<span class="dg" title="${esc(TYPE_NAME[i.x.t]||"")}${i.x.c?" · "+esc(i.x.c):""}">${chip(i.x,false)}<small>${i.d.slice(5,10)}</small></span>`).join("")}</div></td><td class="num"><b>${fmtAvg(av)}</b></td></tr>`;}).join("");
    return head+`<div class="sheet scroll">${rows?`<table><thead><tr><th>Dalykas</th><th class="only-d">Įvertinimai</th><th class="num">Vidurkis</th></tr></thead><tbody>${rows}</tbody></table>`:'<div class="empty">Šį mėnesį įvertinimų nėra.</div>'}</div>`;}
  const days=[...new Set(items.map(i=>kDate(i.d)))].sort().reverse();
  return head+dayBlocks(days,d=>items.filter(i=>kDate(i.d)===d).sort((a,b)=>lsort(subjName(a.g.subjectId),subjName(b.g.subjectId))).map(i=>{const x=i.x;const A=`data-act="stuLesson" data-g="${i.g.id}" data-d="${i.d}"`;
    if(i.k==="g")return drow(A,chip({v:x.v},false),`<div class="dtxt-in${stripe(x.t)}"><b>${esc(subjName(i.g.subjectId))}</b><div>${esc(TYPE_NAME[x.t]||x.t||"")}${x.c?` <span class="muted">— ${esc(x.c)}</span>`:""}</div></div>`,stamp(i.at));
    return drow(A,`<span class="g">${x.m==="pv"?"p":x.j||"n"}</span>`,`<b>${esc(subjName(i.g.subjectId))}</b><div class="muted">${x.m==="pv"?"Pavėlavo":x.j?"Nedalyvavo — "+esc(JUST_NAME[x.j]):"Nedalyvavo (nepateisinta)"}</div>`,stamp(i.at));}).join(""));};

/* ---- Pamokos (tema, klasės darbas, namų darbai) ---- */
VIEWS.s_lessons=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>G(g.id).lessons.forEach(l=>{if(l.topic||l.cw||l.hw)have.add(l.d.slice(0,7));}));const tabs=monthTabs("lMonth",have);const mon=ui.lMonth;const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.d.startsWith(mon)&&(l.topic||l.cw||l.hw)).forEach(l=>list.push({...l,g})));
  const days=[...new Set(list.map(x=>kDate(x.d)))].sort().reverse();
  return `<h1>Pamokos</h1><p class="lead">Pamokų temos, klasės darbai ir namų darbai, kuriuos įrašė mokytojai.</p>${tabs}${days.length?dayBlocks(days,d=>list.filter(x=>kDate(x.d)===d).sort((a,b)=>(a.no||0)-(b.no||0)).map(l=>drow(`data-act="stuLesson" data-g="${l.g.id}" data-d="${l.d}"`,`<span class="lno">${l.no?l.no+" pam.":""}</span>`,
    `<div class="dtxt-in${stripe(l.t)}"><b>${esc(subjName(l.g.subjectId))}</b>${substituteFor(l.g,l.d)?`<div>${subTag(l.g,l.d)}</div>`:""}${l.t?`<div>${typeLbl(l.t)}</div>`:""}${l.topic?`<div><b>Tema:</b> ${esc(l.topic)}</div>`:""}${l.cw?`<div><b>Klasės darbas:</b> ${esc(l.cw)}</div>`:""}${l.hw?`<div><b>Namų darbai:</b> ${esc(l.hw)}${l.hwDue?` <span class="tag">atlikti iki ${l.hwDue}</span>`:""}</div>`:""}</div>`)).join("")):'<div class="sheet empty">Šį mėnesį pamokų įrašų nėra.</div>'}`;};

/* ---- Namų darbai: surūšiuoti pagal atlikimo datą ---- */
VIEWS.s_hw=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const t=TODAY();const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.hw).forEach(l=>list.push({...l,g,due:l.hwDue||kDate(l.d)})));
  const next=ui.hwTab!=="past";const sel_=list.filter(x=>next?x.due>=t:x.due<t).sort((a,b)=>next?lsort(a.due,b.due):lsort(b.due,a.due)).slice(0,next?200:60);
  const badge=d=>d===t?'<span class="hw-b today">Šiandien</span>':d===addDays(t,1)?'<span class="hw-b soon">Rytoj</span>':d<t?`<span class="hw-b past">${d}</span>`:"";
  const days=[...new Set(sel_.map(x=>x.due))];
  return `<h1>Namų darbai</h1><div class="tabs"><button aria-selected="${next}" data-act="hwTab" data-v="next">Artimiausi namų darbai</button><button aria-selected="${!next}" data-act="hwTab" data-v="past">Ankstesni</button></div>
  <p class="info-line">Sąrašas surūšiuotas pagal namų darbų <b>atlikimo datą</b></p>
  ${days.length?days.map(d=>`<div class="hw-day"><b>${WD_FULL[wdOf(d)]}</b><span>${d}</span></div>${sel_.filter(x=>x.due===d).map(x=>`<button class="hw-card" data-act="stuLesson" data-g="${x.g.id}" data-d="${x.d}"><span class="hw-top"><b>${esc(subjName(x.g.subjectId))}</b>${badge(x.due)}</span>
    <span class="hw-lbl">Namų darbai:</span><span class="hw-txt">${esc(x.hw)}</span><span class="hw-foot">${esc(uNameFL(x.g.teacherId))}, <b>įvedė:</b> ${x.hwAt?stamp(x.hwAt).replace("<br>"," "):kDate(x.d)}${x.hwDue?"":" · atlikimo data nenurodyta"}</span></button>`).join("")}`).join(""):`<div class="sheet empty">${next?"Artimiausių namų darbų nėra.":"Ankstesnių namų darbų nėra."}</div>`}`;};

/* ---- Trimestrai / pusmečiai: tik pasirinkto laikotarpio pažymiai ir išvesti įvertinimai ---- */
VIEWS.s_periods=()=>{const n=needChild();if(n)return n;return periodsReport(viewedStudent(),"<h1>Trimestrai / pusmečiai</h1>");};
/* Asmeninė mokymosi ataskaita: tą patį mato mokinys, tėvai, klasės vadovas ir direktorius */
function periodsReport(sid,head){const sys=sysOfStudent(sid);const ps=periodsSys(sys);
  const pOpts=[...ps.map(p=>[p.id,p.name]),["Y","Metinis"]];ensureIn("stPer",pOpts,curPeriod(sys));const pid=ui.stPer;
  const gs=studentGroups(sid).filter(g=>!isNF(g)).sort((a,b)=>lsort(subjName(a.subjectId),subjName(b.subjectId)));
  const tabs=`<div class="tabs">${pOpts.map(([k,nm])=>`<button aria-selected="${pid===k}" data-act="stPer" data-v="${k}">${nm}</button>`).join("")}</div>`;
  if(pid==="Y"){const rows=gs.map(g=>{const pg=G(g.id).pg[sid]||{};return `<tr><td><b>${esc(subjName(g.subjectId))}</b></td>${ps.map(p=>`<td class="num">${vchip(pg[p.id])}</td>`).join("")}<td class="num"><b>${vchip(pg.Y)}</b></td></tr>`;}).join("");
    return `${head}${tabs}<div class="sheet scroll"><table><thead><tr><th>Dalykas</th>${ps.map(p=>`<th class="num">${p.name}</th>`).join("")}<th class="num">Metinis</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="muted">Mokinys nepriskirtas grupėms.</td></tr>'}</tbody></table></div>
    <p class="small muted">Metinis įvertinimas — laikotarpių įvertinimų vidurkis, suapvalintas matematiškai.</p>`;}
  const p=core.settings.periods[pid];
  const rows=gs.map(g=>{const grs=sGrades(g.id,sid,pid);const isk=(g.evalSys||"10")==="isk";const pg=G(g.id).pg[sid]||{};const x=(g.extra||{})[pid]&&pg["X"+pid]!=null?`<div class="small muted">${esc(g.extra[pid])}: ${VLABEL[pg["X"+pid]]??pg["X"+pid]}</div>`:"";
    const gl=grs.map(y=>`<span class="dg" title="${esc(kDate(y.d))} · ${esc(TYPE_NAME[y.t]||"")}${y.c?" · "+esc(y.c):""}">${chip(y,false)}<small>${y.d.slice(5,10)}</small></span>`).join("");
    return `<tr><td><b>${esc(subjName(g.subjectId))}</b><div class="small muted">${esc(uNameFL(g.teacherId))}${progTag(g,sid)}</div><div class="dgrades only-m pr-m">${gl}</div>${x?`<div class="only-m">${x}</div>`:""}</td><td class="only-d"><div class="dgrades">${grs.map(y=>`<span class="dg" title="${esc(kDate(y.d))} · ${esc(TYPE_NAME[y.t]||"")}${y.c?" · "+esc(y.c):""}">${chip(y,false)}<small>${y.d.slice(5,10)}</small></span>`).join("")||'<span class="muted small">—</span>'}</div>${x}</td>
      <td class="num">${isk?"":`<b>${fmtAvg(avgOf(grs))}</b>`}</td><td class="num"><b class="big">${vchip(pg[pid])}</b></td></tr>`;}).join("");
  return `${head}${tabs}<p class="lead"><span class="only-m"><b>${PNAME[pid]}</b></span><span class="only-d">${PNAME[pid]}: ${p.from} – ${p.to}. Rodomi tik šio laikotarpio pažymiai ir išvesti įvertinimai.</span></p>
  <div class="sheet scroll"><table class="pr-t"><thead><tr><th>Dalykas</th><th class="only-d">Pažymiai</th><th class="num">Vidurkis</th><th class="num"><span class="only-d">Išvestas įvertinimas</span><span class="only-m">Pagr.</span></th></tr></thead><tbody>${rows||'<tr><td colspan="4" class="muted">Mokinys nepriskirtas grupėms.</td></tr>'}</tbody></table></div>
  <p class="small muted">Vidurkis = (p₁ + p₂ + … + pₙ) / n; visi pažymiai turi vienodą svorį, „neat.“ vidurkio nekeičia. Laikotarpio įvertinimą išveda mokytojas.</p>`;};
/* ---- Tvarkaraštis: kompiuteryje savaitės tinklelis, telefone — dienos sąrašas ---- */
VIEWS.s_tt=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const gids=studentGroups(sid).map(g=>g.id);
  const mon=mondayOf(ui.week||TODAY());if(ui.ttDay==null){const w=wdOf(TODAY());ui.ttDay=mondayOf(TODAY())===mon&&w<5?w:0;}
  const day=addDays(mon,ui.ttDay);const{slots}=weekSlots(gids);
  const lessons=Object.entries(slots).filter(([k])=>k.endsWith("|"+day)).flatMap(([,v])=>v).sort((a,b)=>a.no-b.no);
  const dayList=`<div class="tt-days" role="tablist">${[0,1,2,3,4].map(i=>`<button role="tab" aria-selected="${ui.ttDay===i}" data-act="ttDay" data-v="${i}" class="${addDays(mon,i)===TODAY()?"is-today":""}">${WD[i]}</button>`).join("")}</div>
   <div class="tt-h"><b>${day===TODAY()?"Šiandienos pamokos":WD_FULL[wdOf(day)]+" pamokos"}</b><span>${day}</span></div>
   ${isHoliday(day)?'<div class="sheet empty">Laisva diena</div>':lessons.length?`<div class="tt-list">${lessons.map(x=>{const g=grp(x.gid);const b=bellOf(x.no);const l=G(x.gid).lessons.find(y=>y.d===x.d);
     return `<button class="tt-row" data-act="stuLesson" data-g="${x.gid}" data-d="${x.d}"><span class="tt-no">${x.no}</span><span class="tt-time">${b?`${b[0]}<br>${b[1]}`:""}</span><span class="tt-subj"><b>${esc(subjName(g.subjectId))}</b>${substituteFor(g,x.d)?subTag(g,x.d):`<span>${esc(uNameFL(g.teacherId))}</span>`}${l&&l.topic?`<span class="tt-topic">${esc(l.topic)}</span>`:""}</span></button>`;}).join("")}</div>`:'<div class="sheet empty">Pamokų nėra.</div>'}`;
  return `<h1>Tvarkaraštis</h1><p class="lead only-d">Savaitės pamokos su temomis, namų darbais, gautais įvertinimais ir lankomumu.</p><div class="bar">${weekNav()}</div>
  <div class="only-d">${weekGrid(gids,{sid})}</div><div class="only-m">${dayList}</div>`;};
VIEWS.s_att=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const sys=sysOfStudent(sid);const pOpts=periodOpts(sys,true);ensureIn("stPid",pOpts,curPeriod(sys));
  const rows=[];studentGroups(sid).forEach(g=>G(g.id).att.filter(a=>a.s===sid&&inPeriod(a.d,ui.stPid)).forEach(a=>rows.push({...a,gn:subjName(g.subjectId)})));rows.sort((a,b)=>lsort(b.d,a.d));
  const nn=rows.filter(r=>r.m==="n"),un=nn.filter(r=>!r.j).length,pv=rows.filter(r=>r.m==="pv").length;
  return `<h1>Lankomumas</h1><div class="bar">${sel("stPid",pOpts,ui.stPid,"Laikotarpis")}</div>
  <div class="stats"><div><b>${nn.length}</b>praleista</div><div><b>${nn.length-un}</b>pateisinta</div><div><b class="${un?"bad":""}">${un}</b>nepateisinta</div><div><b>${pv}</b>pavėlavimų</div></div>
  <div class="sheet scroll">${rows.length?`<table><thead><tr><th>Data</th><th>Dalykas</th><th>Žyma</th><th>Pateisinimas</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${kDate(r.d)}</td><td>${esc(r.gn)}</td><td><span class="att ${r.m==="pv"?"p":r.j?"j":""}">${r.m==="pv"?"p":r.j||"n"}</span></td><td>${r.m==="pv"?"Pavėlavo":r.j?esc(JUST_NAME[r.j]):'<span style="color:var(--pen)">Nepateisinta — kreipkitės į klasės vadovą</span>'}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">Praleistų pamokų nėra.</div>`}</div>`;};
/* ---- Atsiskaitomųjų darbų grafikas ---- */
VIEWS.s_works=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const gs=studentGroups(sid);
  const list=[];gs.forEach(g=>G(g.id).lessons.filter(l=>l.t).forEach(l=>list.push({d:l.d,g,t:l.t,topic:l.topic})));core.works.filter(w=>gs.some(g=>g.id===w.g)&&!list.some(x=>x.g.id===w.g&&x.d===w.d)).forEach(w=>list.push({d:w.d,g:grp(w.g),t:w.t,topic:w.topic}));
  const ms=yearMonths(new Set(list.map(x=>x.d.slice(0,7))));if(!ms.includes(ui.wMonth))ui.wMonth=ms.includes(TODAY().slice(0,7))?TODAY().slice(0,7):ms[ms.length-1];
  const i=ms.indexOf(ui.wMonth);const mon=ui.wMonth;const rows=list.filter(x=>x.d.startsWith(mon)).sort((a,b)=>lsort(b.d,a.d));
  return `<h1>Atsiskaitomųjų darbų grafikas</h1><div class="mnav"><button data-act="wMonth" data-v="${ms[i-1]||""}" ${i<=0?"disabled":""} aria-label="Ankstesnis mėnuo">${ICON.chevL}</button><b>${mon.slice(0,4)} ${MONTHS[+mon.slice(5)-1].toUpperCase()}</b><button data-act="wMonth" data-v="${ms[i+1]||""}" ${i>=ms.length-1?"disabled":""} aria-label="Kitas mėnuo">${ICON.chev}</button></div>
  ${rows.length?`<div class="works">${rows.map(x=>{const gr=G(x.g.id).grades.find(y=>y.s===sid&&y.d===x.d);return `<button class="wk" data-act="stuLesson" data-g="${x.g.id}" data-d="${x.d}"><span class="wk-d"><b>${+x.d.slice(8,10)}</b><span>${WD[wdOf(x.d)]}</span></span><span class="wk-r vbar ${barCls(x.t)}"><b class="wk-s">${esc(subjName(x.g.subjectId))}</b><span class="wk-t">${esc(TYPE_NAME[x.t]||x.t)}</span>${x.topic?`<span><b>Tema:</b> ${esc(x.topic)}</span>`:""}${gr?`<span><b>Įvertinimas:</b> ${chip(gr,false)}</span>`:""}</span></button>`;}).join("")}</div>`:'<div class="sheet empty">Šį mėnesį atsiskaitomųjų darbų nėra.</div>'}`;};

/* ---- Pagyrimai ir pastabos ---- */
VIEWS.s_notes=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const list=[];studentGroups(sid).forEach(g=>G(g.id).notes.filter(x=>x.s===sid).forEach(x=>list.push({...x,g})));list.sort((a,b)=>lsort(b.at||b.d,a.at||a.d));
  return `<h1>Pagyrimai ir pastabos</h1>${list.length?`<div class="notes">${list.map(x=>`<div class="nt-card"><span class="nt-ic note-${x.kind}">${ICON.note}</span><div class="nt-b"><div class="nt-top"><b>${NOTE_NAME[x.kind]||""}</b><span>${x.d.slice(5,10)}d</span></div>
    <div class="nt-subj">${esc(subjName(x.g.subjectId))} (${esc(uNameFL(x.by||x.g.teacherId))})</div><div class="nt-txt">${esc(x.text)}</div><div class="nt-who">${esc(uNameFL(sid))}</div></div></div>`).join("")}</div>`:'<div class="sheet empty">Įrašų nėra.</div>'}`;};
/* ---- Neformalusis švietimas (būreliai) ---- */
VIEWS.s_nf=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const gs=studentGroups(sid).filter(isNF).sort((a,b)=>lsort(subjName(a.subjectId),subjName(b.subjectId)));
  const card=g=>{const tt=core.timetable.filter(t=>t.g===g.id&&TODAY()<=ttUntil(t)).sort((a,b)=>a.wd-b.wd||a.no-b.no);const D=G(g.id);const att=D.att.filter(a=>a.s===sid);const held=D.lessons.filter(l=>kDate(l.d)<=TODAY()).length;
    const next=[...occDates(g.id,TODAY(),addDays(TODAY(),21)).entries()][0];
    return `<div class="nf-card"><div class="nf-h"><b>${esc(subjName(g.subjectId))}</b><span>${esc(uNameFL(g.teacherId))}</span></div>
     <div class="small">${tt.length?tt.map(t=>{const b=bellOf(t.no);return `${WDL[t.wd]}, ${t.no} pamoka${b?` (${b[0]}–${b[1]})`:""}`;}).join("; "):'<span class="muted">Tvarkaraštis nenurodytas</span>'}</div>
     ${next?`<div class="small">Artimiausias užsiėmimas: <b>${kDate(next[0])} (${WDL[wdOf(next[0])]})</b></div>`:""}
     <div class="nf-stats"><span>Užsiėmimų įvyko: <b>${held}</b></span><span>Nedalyvavo: <b>${att.filter(a=>a.m==="n").length}</b></span><span>Pavėlavo: <b>${att.filter(a=>a.m==="pv").length}</b></span></div>
     ${D.lessons.filter(l=>l.topic&&kDate(l.d)<=TODAY()).sort((a,b)=>lsort(b.d,a.d)).slice(0,5).map(l=>`<button class="nf-l" data-act="stuLesson" data-g="${g.id}" data-d="${l.d}"><span>${kDate(l.d)}</span> ${esc(l.topic)}</button>`).join("")}</div>`;};
  return `<h1>Neformalusis švietimas</h1><p class="lead">Būreliai ir kiti neformaliojo švietimo užsiėmimai: tvarkaraštis, lankomumas ir paskutinės temos. Šie užsiėmimai nevertinami pažymiais.</p>${gs.length?`<div class="nf-list">${gs.map(card).join("")}</div>`:'<div class="sheet empty">Būrelių nėra.</div>'}`;};
VIEWS.s_soc=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const a=social.list.filter(x=>x.hours[sid]).sort((x,y)=>lsort(y.d,x.d));
  return `<h1>Socialinė-pilietinė veikla</h1><div class="sheet pad socsum"><div class="small muted">Atlikta${socPlan(sid)!=null?" iš metinio plano":""}</div><div class="socbig">${socProgress(sid)}</div></div>
  <div class="sheet scroll" style="margin-top:12px">${a.length?`<table><thead><tr><th>Data</th><th>Veikla</th><th>Partneris</th><th>Įrašė</th><th class="num">Val.</th></tr></thead><tbody>${a.map(x=>`<tr><td style="white-space:nowrap">${x.d}</td><td><b>${esc(x.activity)}</b><div class="small muted">${esc(x.type)}${x.comment?" · "+esc(x.comment):""}</div></td><td>${esc(x.partner)}</td><td>${esc(uNameFL(x.by))}</td><td class="num"><b>${fmtH(x.hours[sid])}</b></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Veiklų dar nėra.</div>'}</div>`;};
VIEWS.p_child=()=>{const n=needChild();if(n)return n;const s=U(viewedStudent());
  return `<h1>Vaiko duomenys</h1><p class="lead">Galite pataisyti vaiko asmeninius ir kontaktinius duomenis. Jei vaikas dar neturi paskyros, jo mokinio raktas nurodytas žemiau.</p>
  <div class="sheet pad"><form data-form="saveChild" style="display:flex;flex-direction:column;gap:12px;max-width:520px"><div class="row"><label class="field" style="flex:1">Vardas<input name="first" value="${esc(s.first)}" required></label><label class="field" style="flex:1">Pavardė<input name="last" value="${esc(s.last)}" required></label></div>
  <div class="row"><label class="field">Gimimo data<input type="date" name="birth" value="${esc(s.birth||"")}"></label><label class="field" style="flex:1">El. paštas<input type="email" name="email" value="${esc(s.email||"")}"></label></div>
  <div><button class="btn pri">Išsaugoti</button></div></form></div>
  <h2>Prisijungimas</h2><div class="sheet pad">${s.login?`Vaikas prisijungia vardu <b>${esc(s.login)}</b>.${s.email?"":" Nurodykite el. paštą, kad būtų lengviau atkurti prisijungimą."} Pamiršus slaptažodį, naują nustato mokyklos direktorius.`:`Vaikas dar neužsiregistravo. Mokinio raktas: <span class="mono">${esc(s.key)}</span>`}</div>`;};
VIEWS.p_add=()=>`<h1>Pridėti vaiką</h1><p class="lead">Jei keli jūsų vaikai mokosi mokykloje, pakanka vienos paskyros. Įveskite kito vaiko tėvų raktą — jį suteikia klasės vadovas arba direktorius.</p>
  <div class="sheet pad"><form data-form="addChild" class="bar" style="margin:0"><label class="field" style="flex:1">Tėvų raktas<input name="key" class="mono" required placeholder="vardpavaT…"></label><button class="btn pri">Išsaugoti</button></form></div>
  <h2>Pridėti vaikai</h2><div class="list">${(me().childIds||[]).filter(U).map(c=>`<div class="li"><span>${esc(uNameFL(c))} · ${esc(clsName(U(c).classId))}</span></div>`).join("")||'<span class="muted small">Nėra.</span>'}</div>`;

/* ================= PRANEŠIMAI ================= */
function recipientsFor(u){let ids=new Set();const all=Object.values(users).filter(x=>x.id!==u.id);
  if(hasRole(u,"admin")||hasRole(u,"deputy"))all.forEach(x=>ids.add(x.id));
  else if(hasRole(u,"teacher")){all.filter(isStaff).forEach(x=>ids.add(x.id));const ss=new Set();teacherGroups(u.id).forEach(g=>g.students.forEach(s=>ss.add(s)));headClassesOf(u.id).forEach(c=>classStudents(c.id).forEach(s=>ss.add(s.id)));
    ss.forEach(s=>{ids.add(s);all.filter(p=>p.role==="parent"&&(p.childIds||[]).includes(s)).forEach(p=>ids.add(p.id));});}
  else{const kids=u.role==="student"?[u.id]:(u.childIds||[]);kids.forEach(k=>{studentGroups(k).forEach(g=>ids.add(g.teacherId));const c=cls((U(k)||{}).classId);if(c&&c.headTeacherId)ids.add(c.headTeacherId);});all.filter(x=>x.role==="admin").forEach(x=>ids.add(x.id));}
  return [...ids].filter(id=>U(id)&&U(id).login).sort((a,b)=>lsort(U(a).role+uName(a),U(b).role+uName(b)));}
const MSG_GROUPS=[["admin","Direktorius"],["deputy","Direktoriaus pavaduotojai"],["teacher","Mokytojai"],["parent","Tėvai"],["student","Mokiniai"]];
function msgWho(id){const x=U(id);if(!x)return"";if(x.role==="student")return clsName(x.classId)+" kl.";if(x.role==="parent"){const k=(x.childIds||[]).filter(U);return k.length?"vaikas: "+k.map(c=>`${uNameFL(c)} (${clsName(U(c).classId)})`).join(", "):"";}
  if(isStaff(x)){const h=core.classes.filter(c=>c.headTeacherId===id).map(c=>c.name);const extra=rolesOf(x).filter(r=>r!==x.role).map(r=>ROLE_NAME[r].toLowerCase());return [...extra,...(h.length?["kl. vadovas "+h.join(", ")]:[])].join(", ");}return"";}
const inboxOf=u=>msgs.list.filter(m=>m.to.includes(u.id)&&!(m.deleted||{})[u.id]);
VIEWS.msg=u=>{const tab=ui.msgTab;const inbox=inboxOf(u).sort((a,b)=>lsort(b.at,a.at));const out=msgs.list.filter(m=>m.from===u.id).sort((a,b)=>lsort(b.at,a.at));
  const list=tab==="out"?out:inbox;
  return `<h1>Pranešimai</h1><div class="bar"><button class="btn pri" data-act="newMsg">Naujas pranešimas</button></div>
  <div class="tabs"><button aria-selected="${tab==="in"}" data-act="msgTab" data-v="in">Gauti (${inbox.length})</button><button aria-selected="${tab==="out"}" data-act="msgTab" data-v="out">Išsiųsti (${out.length})</button></div>
  <div class="sheet scroll">${list.length?`<table><thead><tr><th>${tab==="out"?"Gavėjai":"Siuntėjas"}</th><th>Tema</th><th>Data</th>${tab==="in"?"<th></th>":""}</tr></thead><tbody>${list.map(m=>`<tr class="${tab==="in"&&!(m.read||{})[u.id]?"msg-unread":""}" style="cursor:pointer" data-act="openMsg" data-v="${m.id}"><td>${tab==="out"?esc(m.to.length>3?m.to.slice(0,3).map(uNameFL).join(", ")+` ir dar ${m.to.length-3}`:m.to.map(uNameFL).join(", ")):esc(uNameFL(m.from))}</td><td>${esc(m.subj)}</td><td style="white-space:nowrap">${m.at.slice(0,16).replace("T"," ")}</td>${tab==="in"?`<td><button class="trash" data-act="delMsg" data-v="${m.id}" title="Ištrinti laišką" aria-label="Ištrinti laišką">${TRASH_SVG}</button></td>`:""}</tr>`).join("")}</tbody></table>`:'<div class="empty">Pranešimų nėra.</div>'}</div>`;};
function newMsgDlg(to="",subj=""){const u=me();const r=recipientsFor(u);
  const groups=MSG_GROUPS.map(([role,name])=>[role,name,r.filter(id=>U(id).role===role).sort((a,b)=>role==="student"?lsort(clsName(U(a).classId)+uName(a),clsName(U(b).classId)+uName(b)):byName(a,b))]).filter(x=>x[2].length);
  openDlg(dlgHead("Naujas pranešimas")+`<form data-form="sendMsg"><div class="dlg-b">
   <div><div class="row" style="justify-content:space-between;align-items:end"><b>Gavėjai</b><span class="small muted" id="msgCount">Pasirinkta: ${to?1:0}</span></div>
    <input class="inp" id="msgFilter" placeholder="Ieškoti pagal vardą ar klasę" style="width:100%;margin-top:6px" autocomplete="off">
    <div class="rgroups">${groups.length?groups.map(([role,name,ids])=>`<details class="rgroup" ${ids.includes(to)||groups.length===1?"open":""}><summary><label onclick="event.stopPropagation()"><input type="checkbox" data-grp="${role}"> ${name}</label> <span class="muted small">(${ids.length})</span></summary>
      <div class="rlist">${ids.map(id=>`<label class="ritem" data-q="${esc((uName(id)+" "+msgWho(id)).toLowerCase())}"><input type="checkbox" name="to" value="${id}" data-role="${role}" ${id===to?"checked":""}><span>${esc(uName(id))}${msgWho(id)?` <span class="muted small">— ${esc(msgWho(id))}</span>`:""}</span></label>`).join("")}</div></details>`).join(""):'<p class="muted small">Nėra galimų gavėjų (gavėjai turi būti užsiregistravę).</p>'}</div></div>
   <label class="field">Tema<input name="subj" required value="${esc(subj)}"></label><label class="field">Tekstas<textarea name="body" required style="min-height:140px"></textarea></label></div>
   <div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Siųsti</button></div></form>`,true);}
function msgCountUpd(){const n=$$('form[data-form="sendMsg"] input[name=to]:checked').length;const el=$("#msgCount");if(el)el.textContent="Pasirinkta: "+n;
  MSG_GROUPS.forEach(([role])=>{const box=$(`input[data-grp="${role}"]`);if(!box)return;const all=$$(`input[name=to][data-role="${role}"]`);const on=all.filter(c=>c.checked).length;box.checked=on===all.length&&on>0;box.indeterminate=on>0&&on<all.length;});}
function openMsg(id){const u=me();const m=msgs.list.find(x=>x.id===id);if(!m)return;if(m.to.includes(u.id)&&!(m.read||{})[u.id]){m.read??={};m.read[u.id]=true;DB.upd("message_recipients",{read_at:new Date().toISOString()},{message_id:m.id,recipient_id:u.id});}
  const isRec=m.to.includes(u.id);
  openDlg(dlgHead(esc(m.subj),`${esc(uNameFL(m.from))} → ${esc(m.to.map(uNameFL).join(", "))} · ${m.at.slice(0,16).replace("T"," ")}`)+`<div class="dlg-b"><div style="white-space:pre-wrap">${esc(m.body)}</div></div><div class="dlg-f">${isRec?`<button class="btn warn" data-act="delMsg" data-v="${m.id}">Ištrinti</button>`:""}${m.from!==u.id?`<button class="btn pri" data-act="reply" data-v="${m.id}">Atsakyti</button>`:""}<button class="btn" data-act="close">Uždaryti</button></div>`);}

/* ================= PASKYRA ================= */
VIEWS.acc=u=>`<h1>Mano paskyra</h1><div class="sheet pad"><div class="row" style="gap:28px"><div><div class="small muted">Vardas, pavardė</div><b>${esc(u.first)} ${esc(u.last)}</b></div><div><div class="small muted">Prisijungimo vardas</div><b>${esc(u.login)}</b></div><div><div class="small muted">Vaidmuo</div><b>${esc(roleNames(u))}</b></div>${u.key?`<div><div class="small muted">Asmeninis raktas</div><span class="mono">${esc(u.key)}</span></div>`:""}</div></div>
  <h2>Išvaizda</h2><div class="sheet pad"><div class="bar" style="margin:0">${sel("theme",[["auto","Pagal įrenginio nustatymą"],["light","Šviesi"],["dark","Tamsi"]],themePref(),"Tema")}</div></div>
  <h2>Telefono numeris</h2><div class="sheet pad"><form data-form="savePhone" class="bar" style="margin:0"><label class="field" style="flex:1;max-width:320px">Telefonas<input type="tel" name="phone" value="${esc((core.contacts[u.id]||{}).phone||"")}" placeholder="+370 6xx xxxxx"></label><button class="btn">Išsaugoti</button></form>
   <p class="small muted" style="margin-bottom:0">Numerį mato tik direktorius, jo pavaduotojai ir ${u.role==="parent"?"jūsų vaiko":u.role==="student"?"jūsų":"atitinkamas"} klasės vadovas.</p></div>
  <h2>Kontaktinis el. paštas</h2><div class="sheet pad"><form data-form="saveEmail" class="bar" style="margin:0"><label class="field" style="flex:1">El. paštas<input type="email" name="email" value="${esc(u.email||"")}"></label><button class="btn">Išsaugoti</button></form></div>
  <h2>Slaptažodžio keitimas</h2><div class="sheet pad"><form data-form="changePw" class="bar" style="margin:0"><label class="field">Naujas slaptažodis<input type="password" name="pw" required autocomplete="new-password"></label><label class="field">Pakartokite<input type="password" name="pw2" required autocomplete="new-password"></label><button class="btn pri">Keisti</button></form>
  <p class="small muted" style="margin-bottom:0">Bent 8 simboliai, raidės ir skaičiai. Nenaudokite to paties slaptažodžio kitose svetainėse.</p></div>
  <h2>Dviejų faktorių autentifikacija (2FA)</h2><div class="sheet pad">${mfa.enabled?`<p style="margin-top:0"><span class="tag ok">Įjungta</span> Jungiantis reikės kodo iš autentifikavimo programėlės.</p><button class="btn warn" data-act="stop2fa">Išjungti 2FA</button>`
   :`<p style="margin-top:0">Prisijungimas bus apsaugotas papildomu 6 skaitmenų kodu iš programėlės (Google Authenticator, Microsoft Authenticator ir kt.).</p><button class="btn pri" data-act="start2fa">Įjungti 2FA</button>`}</div>`;
async function start2fa(){
  const f=await sb.auth.mfa.listFactors();for(const x of (f.data&&f.data.all)||[])if(x.status!=="verified")await sb.auth.mfa.unenroll({factorId:x.id});
  const {data,error}=await sb.auth.mfa.enroll({factorType:"totp",friendlyName:"Dienynas "+Date.now()});
  if(error){toast("Nepavyko: "+error.message+" (ar Supabase projekte įjungta TOTP MFA?)");return;}
  dlgState={factorId:data.id};
  openDlg(dlgHead("2FA įjungimas")+`<form data-form="on2fa"><div class="dlg-b"><ol style="margin:0;padding-left:18px"><li>Programėlėje pasirinkite „Pridėti paskyrą“ ir nuskenuokite QR kodą.</li><li>Jei nuskenuoti nepavyksta, įveskite raktą ranka.</li><li>Įveskite programėlės rodomą kodą.</li></ol>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><div class="qr"><img src="${esc(data.totp.qr_code)}" alt="2FA QR kodas"></div><div><div class="small muted">Raktas</div><div class="mono" style="word-break:break-all;max-width:260px">${esc(data.totp.secret.match(/.{1,4}/g).join(" "))}</div></div></div>
  <label class="field">Kodas<input name="code" inputmode="numeric" autocomplete="one-time-code" required></label></div><div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Patvirtinti</button></div></form>`);}

/* ================= Renginių ir atostogų kalendorius ================= */
const LT_HOL_NAMES=y=>({[`${y}-11-01`]:"Visų šventųjų diena",[`${y}-11-02`]:"Mirusiųjų atminimo diena",[`${y}-12-24`]:"Kūčios",[`${y}-12-25`]:"Kalėdos",[`${y}-12-26`]:"Kalėdos",[`${y+1}-01-01`]:"Naujieji metai",[`${y+1}-02-16`]:"Valstybės atkūrimo diena",[`${y+1}-03-11`]:"Nepriklausomybės atkūrimo diena",[`${y+1}-05-01`]:"Darbo diena"});
function myClassIds(){const u=me();if(!u)return null;if(u.role==="student")return [u.classId];if(u.role==="parent")return (u.childIds||[]).map(k=>(U(k)||{}).classId).filter(Boolean);return null;}
function calItems(from,to){const out=[];const y=core.settings.yearStart;const hn=LT_HOL_NAMES(y);
  Object.entries(hn).forEach(([d,n])=>{if(d>=from&&d<=to)out.push({from:d,to:d,title:n,kind:"hol"});});
  core.settings.holidays.forEach(h=>{if(h.to>=from&&h.from<=to)out.push({from:h.from,to:h.to,title:h.name||"Atostogos",kind:"vac"});});
  const mine=myClassIds();core.events.forEach(e=>{if(e.to<from||e.from>to)return;if(e.classId&&mine&&!mine.includes(e.classId))return;out.push({...e,kind:"ev"});});
  const sid=viewedStudent();if(sid){studentGroups(sid).forEach(g=>{G(g.id).lessons.forEach(l=>{const d=kDate(l.d);if(l.t&&WORK_TYPES.some(w=>w[0]===l.t)&&d>=from&&d<=to)out.push({from:d,to:d,title:`${subjName(g.subjectId)}: ${TYPE_NAME[l.t]}`,kind:"work",kd:l.t==="KD"});});});
    core.works.filter(w=>studentGroups(sid).some(g=>g.id===w.g)&&w.d>=from&&w.d<=to&&!G(w.g).lessons.some(l=>kDate(l.d)===w.d&&l.t)).forEach(w=>out.push({from:w.d,to:w.d,title:`${subjName(grp(w.g).subjectId)}: ${TYPE_NAME[w.t]}`,kind:"work",kd:w.t==="KD"}));}
  return out;}
VIEWS.cal=()=>{const u=me();const canEdit=hasRole(u,"admin")||hasRole(u,"deputy");const r=yearRange();
  const months=[];for(let d=r.from.slice(0,7);d<=r.to.slice(0,7);){months.push(d);const [yy,mm]=d.split("-").map(Number);d=mm===12?`${yy+1}-01`:`${yy}-${pad2(mm+1)}`;}
  if(!months.includes(ui.calM))ui.calM=months.includes(TODAY().slice(0,7))?TODAY().slice(0,7):months[0];const m=ui.calM;const i=months.indexOf(m);
  const [yy,mm]=m.split("-").map(Number);const first=`${m}-01`;const days=new Date(Date.UTC(yy,mm,0)).getUTCDate();const last=`${m}-${pad2(days)}`;const items=calItems(first,last);
  let cells=WD.map(w=>`<div class="ch">${w}</div>`).join("")+'<div class="cd empty"></div>'.repeat(wdOf(first));
  for(let dd=1;dd<=days;dd++){const d=`${m}-${pad2(dd)}`;const it=items.filter(x=>d>=x.from&&d<=x.to);const off=wdOf(d)>=5||it.some(x=>x.kind==="hol"||x.kind==="vac");
    cells+=`<div class="cd ${off?"off":""} ${d===TODAY()?"today":""}"><span class="cn">${dd}</span>${it.map(x=>`<span class="ci ${x.kind==="ev"?"cev":x.kind} ${x.kd?"kd":""}" title="${esc(x.title)}">${esc(x.title)}</span>`).join("")}</div>`;}
  const list=items.filter(x=>x.kind!=="work").sort((a,b)=>lsort(a.from,b.from));
  const cOpts=[["","Visa mokykla"],...[...core.classes].sort((a,b)=>lsort(a.name,b.name)).map(c=>[c.id,c.name+" klasė"])];
  return `<h1>Kalendorius</h1><p class="lead">Mokyklos renginiai, atostogos ir šventinės dienos${viewedStudent()?", taip pat jūsų kontroliniai ir kiti atsiskaitymai":""}.</p>
  <div class="mnav cal-nav"><button data-act="calM" data-v="${months[i-1]||""}" ${i<=0?"disabled":""} aria-label="Ankstesnis mėnuo">${ICON.chevL}</button><b>${yy} ${MONTHS[mm-1].toUpperCase()}</b><button data-act="calM" data-v="${months[i+1]||""}" ${i>=months.length-1?"disabled":""} aria-label="Kitas mėnuo">${ICON.chev}</button></div>
  <div class="calg">${cells}</div>
  <div class="cal-leg"><span class="ci cev">Renginys</span><span class="ci vac">Atostogos</span><span class="ci hol">Šventinė diena</span>${viewedStudent()?'<span class="ci work">Atsiskaitymas</span>':""}</div>
  <h2>Šio mėnesio renginiai ir atostogos</h2><div class="sheet">${list.length?`<div class="list">${list.map(x=>`<div class="li"><span><b>${x.from}${x.to!==x.from?` – ${x.to}`:""}</b> · ${esc(x.title)}${x.kind==="ev"?` <span class="tag">${x.classId?esc(clsName(x.classId))+" kl.":"visa mokykla"}</span>`:x.kind==="vac"?' <span class="tag i">atostogos</span>':' <span class="tag i">šventė</span>'}${x.descr?`<div class="small muted">${esc(x.descr)}</div>`:""}</span>${canEdit&&x.kind==="ev"?`<button class="x del" data-act="delEvent" data-v="${x.id}" aria-label="Ištrinti renginį">×</button>`:""}</div>`).join("")}</div>`:'<div class="empty">Šį mėnesį renginių nėra.</div>'}</div>
  ${canEdit?`<h2>Naujas renginys</h2><div class="sheet pad"><form data-form="addEvent" class="bar" style="margin:0;align-items:flex-end"><label class="field" style="flex:1;min-width:200px">Pavadinimas<input name="title" required placeholder="pvz., Mokslo metų šventė"></label><label class="field">Nuo<input type="date" name="from" value="${TODAY()}" required></label><label class="field">Iki<input type="date" name="to" value="${TODAY()}" required></label>
   <label class="field">Kam<select name="classId">${cOpts.map(([v,n])=>`<option value="${v}">${esc(n)}</option>`).join("")}</select></label><label class="field" style="flex-basis:100%">Aprašymas<input name="descr" placeholder="Nebūtina"></label><button class="btn pri">Pridėti</button></form>
   <p class="small muted" style="margin-bottom:0">Atostogas ir nedarbo dienas tvarkykite skiltyje „Laikotarpiai“ — jos čia rodomos automatiškai.</p></div>`:""}`;};

/* ================= Analitika (mokiniui ir tėvams) ================= */
let anal={};   // grupių vidurkiai iš serverio: anal[sid] = {at, data:{gid:{avg,n,months}}}
async function loadAnal(sid){const [{data,error},rk]=await Promise.all([sb.rpc("group_stats",{p_student:sid}),sb.rpc("student_rank",{p_student:sid})]);const m={};(error?[]:data||[]).forEach(x=>{m[x.g]={avg:x.avg==null?null:+x.avg,n:+x.n||0,months:x.months||{}};});
  const R=rk.error||!rk.data?{cls:null,groups:{}}:{cls:rk.data.cls||null,level:rk.data.level||null,school:rk.data.school||null,groups:Object.fromEntries((rk.data.groups||[]).map(x=>[x.g,x]))};anal[sid]={at:Date.now(),data:m,rank:R,err:!!error};if(ui.view==="s_analytics")render();}
const svgEsc=s=>esc(String(s));
function chartLine(labels,series,h=220){const W=640,H=h,L=34,R=10,T=14,B=28;const n=labels.length;if(!n)return"";const x=i=>L+(n===1?(W-L-R)/2:i*(W-L-R)/(n-1));const y=v=>T+(10-v)/9*(H-T-B);
  let s=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Vidurkio kitimas">`;[1,4,6,8,10].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="grid-l"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" class="ax">${v}</text>`;});
  labels.forEach((lb,i)=>{s+=`<text x="${x(i)}" y="${H-8}" text-anchor="middle" class="ax">${svgEsc(lb)}</text>`;});
  series.forEach(se=>{const pts=se.values.map((v,i)=>v==null?null:[x(i),y(v),v]);let d="",pen=false;pts.forEach(p=>{if(!p){pen=false;return;}d+=(pen?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)+" ";pen=true;});
    s+=`<path d="${d}" class="ln ${se.cls}" fill="none"/>`+pts.filter(Boolean).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" class="dot-${se.cls}"><title>${svgEsc(se.name)}: ${p[2].toFixed(2).replace(".",",")}</title></circle>`).join("");});
  return s+"</svg>";}
function chartBarsV(labels,values,h=170){const W=640,H=h,L=26,R=8,T=12,B=26;const mx=Math.max(1,...values);const bw=(W-L-R)/labels.length;
  let s=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Pažymių pasiskirstymas">`;
  labels.forEach((lb,i)=>{const v=values[i];const bh=(H-T-B)*v/mx;const x=L+i*bw+bw*.18;s+=`<rect x="${x.toFixed(1)}" y="${(H-B-bh).toFixed(1)}" width="${(bw*.64).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" class="bar-v ${+lb<4?"low":""}"><title>${svgEsc(lb)}: ${v}</title></rect>${v?`<text x="${(x+bw*.32).toFixed(1)}" y="${(H-B-bh-4).toFixed(1)}" text-anchor="middle" class="ax">${v}</text>`:""}<text x="${(x+bw*.32).toFixed(1)}" y="${H-8}" text-anchor="middle" class="ax">${svgEsc(lb)}</text>`;});
  return s+"</svg>";}
function nextNeeded(grs,T){const n=numeric(grs);const S=n.reduce((a,g)=>a+g.v,0),c=n.length;if(!T)return"";if(c&&S/c>=T){const drop=Math.ceil(T*(c+1)-S);return drop<=1?'<span class="tag ok">Tikslas pasiektas</span>':`<span class="tag ok">Pasiektas</span> <span class="small muted">vidurkis išliks ≥ ${String(T).replace(".",",")} gavus ${Math.max(1,drop)} ar daugiau</span>`;}
  const g=Math.ceil(T*(c+1)-S-1e-9);if(g<=10)return `Kitas pažymys turi būti bent <b>${Math.max(1,g)}</b>`;let k=1;while(k<60&&(S+10*k)/(c+k)<T)k++;return k>=60?'<span class="muted">Nepasiekiama</span>':`Reikia dar <b>${k}</b> dešimtukų iš eilės`;}
VIEWS.s_analytics=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const A=anal[sid];if(!A||Date.now()-A.at>120000){if(!A||!A.loading){anal[sid]={...(A||{data:{}}),loading:true,at:A?A.at:0};loadAnal(sid);}if(!A)return `<h1>Analitika</h1><div class="sheet empty"><span class="spin"></span>Skaičiuojama…</div>`;}
  const gs=studentGroups(sid).filter(g=>!isNF(g)).sort((a,b)=>lsort(subjName(a.subjectId),subjName(b.subjectId)));const r=yearRange();const sys=sysOfStudent(sid);const pid=curPeriod(sys);
  const all=gs.flatMap(g=>G(g.id).grades.filter(x=>x.s===sid).map(x=>({...x,g})));const yAvg=avgOf(all);const pAvg=avgOf(all.filter(x=>inPeriod(x.d,pid)));
  const att=gs.concat(studentGroups(sid).filter(isNF)).flatMap(g=>G(g.id).att.filter(x=>x.s===sid));const nAll=att.filter(x=>x.m==="n"),nUn=nAll.filter(x=>!x.j).length,late=att.filter(x=>x.m==="pv").length;
  const notes=gs.flatMap(g=>G(g.id).notes.filter(x=>x.s===sid));
  const months=[];for(let d=r.from.slice(0,7);d<=TODAY().slice(0,7)&&d<=r.to.slice(0,7);){months.push(d);const [yy,mm]=d.split("-").map(Number);d=mm===12?`${yy+1}-01`:`${yy}-${pad2(mm+1)}`;}
  const stuM=months.map(m=>avgOf(all.filter(x=>x.d.startsWith(m))));
  const clsM=months.map(m=>{const v=gs.map(g=>((A.data[g.id]||{}).months||{})[m]).filter(x=>x!=null).map(Number);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;});
  const mLbl=months.map(m=>MONTHS[+m.slice(5)-1].slice(0,3)+".");
  const dist=[1,2,3,4,5,6,7,8,9,10].map(v=>all.filter(x=>x.v===v).length);
  const subRows=gs.map(g=>{const grs=all.filter(x=>x.g.id===g.id);const a=avgOf(grs);const ga=(A.data[g.id]||{}).avg;const T=core.targets[sid+"|"+g.id];return{g,grs,a,ga,T,cnt:numeric(grs).length};});
  const bar=(v,cls)=>v==null?"":`<span class="hb ${cls}" style="width:${Math.max(2,v*10)}%"></span>`;
  const attM=months.map(m=>{const x=att.filter(a=>a.d.startsWith(m)&&a.m==="n");return [x.filter(a=>a.j).length,x.filter(a=>!a.j).length];});const mxA=Math.max(1,...attM.map(([a,b])=>a+b));
  return `<h1>Analitika</h1><p class="lead">${esc(uNameFL(sid))} · ${r.from.slice(0,4)}–${r.to.slice(0,4)} m. m. Klasės vidurkiai skaičiuojami iš visų grupės mokinių pažymių (kitų mokinių pažymiai nerodomi).</p>
  ${A.rank&&A.rank.cls?`<div class="ranks">${[["cls",`${esc(clsName(U(sid).classId))} klasėje`],["level",`Visų ${(A.rank.level||{}).level||""} klasių mokinių`],["school","Visoje mokykloje"]].filter(([k])=>A.rank[k]).map(([k,t])=>{const r=A.rank[k];return `<div class="rank-card"><div class="rank-big"><b>${r.rank}</b><span>vieta</span></div><div><b>${t}</b><div>${r.rank} iš ${r.n}</div></div><div class="rank-bar"><span style="left:${r.n>1?((r.rank-1)/(r.n-1)*100):0}%"></span></div></div>`;}).join("")}</div><p class="small muted" style="margin:-6px 0 14px">Reitingas pagal visų metų pažymių vidurkį (be būrelių). Kitų mokinių vardai ir pažymiai nerodomi.</p>`:""}
  <div class="stats an-stats"><div><b>${fmtAvg(yAvg)}</b>metų vidurkis</div><div><b>${fmtAvg(pAvg)}</b>${esc(PNAME[pid]||"laikotarpio")} vidurkis</div><div><b>${numeric(all).length}</b>pažymių</div><div><b>${nAll.length}</b>praleista pamokų</div><div><b class="${nUn?"bad":""}">${nUn}</b>nepateisinta</div><div><b>${late}</b>pavėlavimų</div><div><b>${notes.filter(x=>x.kind==="p").length}</b>pagyrimų</div><div><b class="${notes.some(x=>x.kind==="n")?"bad":""}">${notes.filter(x=>x.kind==="n").length}</b>pastabų</div></div>
  <div class="an-grid">
   <section class="sheet pad an-card"><h3>Vidurkio kitimas pagal mėnesius</h3>${months.length?chartLine(mLbl,[{name:"Mokinio vidurkis",cls:"me",values:stuM},{name:"Klasės (grupių) vidurkis",cls:"cl",values:clsM}]):'<p class="muted">Duomenų dar nėra.</p>'}
    <div class="an-leg"><span class="lg me"></span>Mokinys <span class="lg cl"></span>Klasė</div></section>
   <section class="sheet pad an-card"><h3>Pažymių pasiskirstymas</h3>${chartBarsV(["1","2","3","4","5","6","7","8","9","10"],dist)}</section>
  </div>
  <section class="sheet pad an-card"><h3>Dalykai: mokinio ir klasės vidurkis</h3>${subRows.length?`<div class="hbars">${subRows.map(x=>`<div class="hrow"><span class="hl">${esc(subjName(x.g.subjectId))}</span><span class="ht">${bar(x.a,"me")}${bar(x.ga,"cl")}</span><span class="hv"><b>${fmtAvg(x.a)}</b> <span class="muted">/ ${fmtAvg(x.ga)}</span>${(A.rank&&A.rank.groups[x.g.id])?`<span class="rk" title="Vieta grupėje">${A.rank.groups[x.g.id].rank}/${A.rank.groups[x.g.id].n} vieta</span>`:""}</span></div>`).join("")}</div><div class="an-leg"><span class="lg me"></span>Mokinys <span class="lg cl"></span>Klasė</div>`:'<p class="muted">Dalykų nėra.</p>'}</section>
  <section class="sheet pad an-card"><h3>Praleistos pamokos pagal mėnesius</h3>${months.length?`<div class="abars">${attM.map(([j,u],i)=>`<div class="acol" title="${mLbl[i]}: pateisinta ${j}, nepateisinta ${u}"><div class="astack"><span class="au" style="height:${u/mxA*100}%"></span><span class="aj" style="height:${j/mxA*100}%"></span></div><b>${j+u||""}</b><span>${mLbl[i]}</span></div>`).join("")}</div><div class="an-leg"><span class="lg aj"></span>Pateisinta <span class="lg au"></span>Nepateisinta</div>`:'<p class="muted">Duomenų dar nėra.</p>'}</section>
  <section class="sheet pad an-card"><h3>Tikslinis vidurkis</h3><p class="small muted" style="margin-top:0">Įrašykite norimą vidurkį — pamatysite, kokio pažymio reikia toliau. Tikslą matote tik jūs ir mokytojai.</p>
   <div class="scroll"><table><thead><tr><th>Dalykas</th><th class="num">Dabar</th><th class="num">Pažymių</th><th>Tikslas</th><th>Ko reikia</th></tr></thead><tbody>${subRows.map(x=>`<tr><td>${esc(subjName(x.g.subjectId))}</td><td class="num"><b>${fmtAvg(x.a)}</b></td><td class="num">${x.cnt}</td><td><input class="inp tgt" type="number" min="1" max="10" step="0.1" data-ch="target" data-g="${x.g.id}" value="${x.T??""}" placeholder="pvz. 9"></td><td>${nextNeeded(x.grs,x.T)}</td></tr>`).join("")}</tbody></table></div></section>`;};
