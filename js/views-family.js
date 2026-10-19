/* Dienynas — mokinio ir tėvų rodiniai, pranešimai, paskyra */
/* ================= MOKINYS / TĖVAI ================= */
function needChild(){const sid=viewedStudent();return sid?null:`<h1>Vaiko dienynas</h1><div class="sheet empty">Prie paskyros dar nepridėtas vaikas. <button class="btn" data-act="view" data-v="p_add">Pridėti vaiką</button></div>`;}
/* ---- Bendri pagalbiniai ---- */
/* Mėnesių skirtukai: nuo mokslo metų pradžios iki einamojo mėnesio arba vėliausio mėnesio, kuriame yra įrašų */
function yearMonths(withData){const r=yearRange();let end=(TODAY()<r.to?TODAY():r.to).slice(0,7);
  if(withData)withData.forEach(m=>{if(m>end&&m<=r.to.slice(0,7))end=m;});const out=[];let y=+r.from.slice(0,4),m=+r.from.slice(5,7);
  for(let i=0;i<14;i++){const k=`${y}-${String(m).padStart(2,"0")}`;out.push(k);if(k>=end)break;m++;if(m>12){m=1;y++;}}return out;}
function monthTabs(key,withData){const ms=yearMonths(withData);if(!ms.includes(ui[key])){const now=TODAY().slice(0,7);const d=withData?ms.filter(m=>withData.has(m)):[];const past=d.filter(m=>m<=now);ui[key]=d.includes(now)?now:past.length?past[past.length-1]:d.length?d[0]:ms[ms.length-1];}
  return `<div class="mtabs" role="tablist">${ms.map(m=>`<button role="tab" aria-selected="${ui[key]===m}" data-act="mtab" data-k="${key}" data-v="${m}">${m}</button>`).join("")}</div>`;}
const pad2=n=>String(n).padStart(2,"0");
function stamp(at){if(!at)return"";const d=new Date(at);if(isNaN(d))return"";return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}<br>${pad2(d.getHours())}:${pad2(d.getMinutes())}`;}
const typeLbl=t=>`<span>${esc(TYPE_NAME[t]||t||"")}</span>`;

/* ---- Bendri mobiliojo stiliaus elementai ---- */
const dayHead=(d,extra="")=>{const t=TODAY();const chip=d===t?'<span class="dh-chip now">Šiandien</span>':`<span class="dh-chip">${MONTHS[+d.slice(5,7)-1]}</span>`;
  return `<div class="dh"><b>${+d.slice(8)} ${WD_FULL[wdOf(d)]}</b>${extra}${chip}</div>`;};
const barCls=t=>t?`" style="--tc:${tc(t)}`:"";
function subjFilterOpts(sid){return [["*","Visi dalykai"],...[...new Set(studentGroups(sid).map(g=>g.subjectId))].map(s=>[s,subjName(s)]).sort((a,b)=>lsort(a[1],b[1]))];}

/* ---- Naujausi įvykiai: pažymiai, lankomumas, namų darbai, pagyrimai/pastabos pagal įrašymo datą ---- */
VIEWS.s_events=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const items=[];const day=at=>at?String(at).slice(0,10)===String(at).slice(0,10)&&(()=>{const d=new Date(at);return isNaN(d)?null:`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;})():null;
  studentGroups(sid).forEach(g=>{const D=G(g.id);
    D.grades.filter(x=>x.s===sid).forEach(x=>items.push({k:"g",ed:day(x.at)||x.d,at:x.at||x.d,g,x}));
    D.att.filter(x=>x.s===sid).forEach(x=>items.push({k:"a",ed:day(x.at)||x.d,at:x.at||x.d,g,x}));
    D.notes.filter(x=>x.s===sid).forEach(x=>items.push({k:"n",ed:day(x.at)||x.d,at:x.at||x.d,g,x}));
    D.lessons.filter(l=>l.hw).forEach(l=>items.push({k:"h",ed:day(l.hwAt)||l.d,at:l.hwAt||l.d,g,x:l}));});
  const from=addDays(TODAY(),-45);const list=items.filter(i=>i.ed>=from&&i.ed<=TODAY()).sort((a,b)=>lsort(b.at,a.at));
  const days=[...new Set(list.map(i=>i.ed))].sort().reverse();
  const row=i=>{const g=i.g,x=i.x,sub=esc(subjName(g.subjectId));
    if(i.k==="g")return `<button class="ev" data-act="stuLesson" data-g="${g.id}" data-d="${x.d}"><span class="ev-l big-g">${VLABEL[x.v]??x.v}</span><span class="ev-r vbar ${barCls(x.t)}"><b>${sub}</b><span>${typeLbl(x.t)}</span><span>Įrašyta į <b>${dayGen(x.d)}</b> pamoką.</span></span></button>`;
    if(i.k==="a")return `<button class="ev" data-act="stuLesson" data-g="${g.id}" data-d="${x.d}"><span class="ev-l big-g">${x.m==="pv"?"p":x.j||"n"}</span><span class="ev-r"><b>${sub}</b><span>${x.m==="pv"?"Pavėlavo":x.j?"Nedalyvavo — "+esc(JUST_NAME[x.j]):"Nedalyvavo"}</span><span>Įrašyta į <b>${dayGen(x.d)}</b> pamoką.</span></span></button>`;
    if(i.k==="n")return `<div class="ev"><span class="ev-l ic note-${x.kind}">${ICON.note}</span><span class="ev-r"><b>${NOTE_NAME[x.kind]||""} · ${sub}</b><span>${esc(x.text)}</span><span class="muted">${esc(uNameFL(x.by))}</span></span></div>`;
    return `<button class="ev" data-act="stuLesson" data-g="${g.id}" data-d="${x.d}"><span class="ev-l ic hw">${ICON.hw}</span><span class="ev-r"><b>${sub}</b><span>${esc(x.hw)}</span><span>Įrašyta į <b>${dayGen(x.d)}</b> pamoką.</span>${x.hwDue?`<span>Atlikti iki <b>${dayGen(x.hwDue)}</b></span>`:""}</span></button>`;};
  return `<h1>Naujausi įvykiai</h1>${days.length?`<div class="feed">${days.map(d=>dayHead(d)+`<div class="feed-day">${list.filter(i=>i.ed===d).map(row).join("")}</div>`).join("")}</div>`:'<div class="sheet empty">Per pastarąsias 45 dienas įvykių nėra.</div>'}`;};

/* ---- Dienynas: pažymiai ir lankomumas pagal dienas arba dalykus ---- */
function filterSheet(key,sid,have){const ms=yearMonths(have);const so=subjFilterOpts(sid);
  openDlg(`<div class="sheet-h"><b>Dalykas ir data</b><button class="side-x" data-act="close" aria-label="Uždaryti">${ICON.close}</button></div>
  <form data-form="diaryFilter" data-k="${key}" class="sheet-b"><div class="sheet-sec">Data</div>${ms.slice().reverse().map(m=>`<label class="radio"><input type="radio" name="m" value="${m}" ${ui[key]===m?"checked":""}> ${m.slice(0,4)} ${MONTHS[+m.slice(5)-1].toUpperCase()}</label>`).join("")}
   <div class="sheet-sec">Dalykas</div>${so.map(([v,nm])=>`<label class="radio"><input type="radio" name="s" value="${v}" ${(ui.dSubj||"*")===v?"checked":""}> ${esc(nm)}</label>`).join("")}
   <div class="sheet-f"><button class="btn pri wide">Pasirinkti</button></div></form>`,false);$("#dlg").classList.add("sheet-right");}
VIEWS.s_diary=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>{const D=G(g.id);D.grades.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});D.att.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});});
  const tabs=monthTabs("dMonth",have);const mon=ui.dMonth;if(!["days","subj"].includes(ui.dTab))ui.dTab="days";const so=subjFilterOpts(sid);if(!so.some(x=>x[0]===ui.dSubj))ui.dSubj="*";
  const items=[];studentGroups(sid).filter(g=>ui.dSubj==="*"||g.subjectId===ui.dSubj).forEach(g=>{const D=G(g.id);
    D.grades.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"g",d:x.d,g,x,at:x.at||""}));
    D.att.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"a",d:x.d,g,x,at:x.at||""}));});
  const head=`<h1>${me().role==="parent"?"Vaiko dienynas":"Mokinio dienynas"}</h1><p class="lead only-d">${esc(uNameFL(sid))} · ${esc(clsName(U(sid).classId))} klasė</p>
   <div class="only-d"><div class="bar">${tabs}${sel("dSubj",so,ui.dSubj,"Dalykas")}</div></div>
   <button class="mf-btn only-m" data-act="diaryFilter">${ui.dSubj==="*"?"Pasirinkite dalyką ir datą":esc(subjName(ui.dSubj))+" · "+mon}${ICON.chev}</button>
   <div class="tabs dtabs"><button aria-selected="${ui.dTab==="days"}" data-act="dTab" data-v="days">Pagal dienas</button><button aria-selected="${ui.dTab==="subj"}" data-act="dTab" data-v="subj">Pagal dalykus</button></div>`;
  if(!items.length)return head+`<div class="sheet empty">${mon}: įvertinimų ir lankomumo žymų nėra.</div>`;
  if(ui.dTab==="subj"){const bySub=new Map();items.filter(i=>i.k==="g").forEach(i=>{const k=subjName(i.g.subjectId);(bySub.get(k)||bySub.set(k,[]).get(k)).push(i);});
    const rows=[...bySub.entries()].sort((a,b)=>lsort(a[0],b[0])).map(([name,list])=>{list.sort((a,b)=>lsort(a.d,b.d));const av=avgOf(list.map(i=>i.x));
      return `<tr><td><b>${esc(name)}</b><div class="dgrades only-m" style="margin-top:4px">${list.map(i=>`<span class="dg">${chip(i.x,false)}<small>${i.d.slice(5)}</small></span>`).join("")}</div></td><td class="only-d"><div class="dgrades">${list.map(i=>`<span class="dg" title="${esc(TYPE_NAME[i.x.t]||"")}${i.x.c?" · "+esc(i.x.c):""}">${chip(i.x,false)}<small>${i.d.slice(5)}</small></span>`).join("")}</div></td><td class="num"><b>${fmtAvg(av)}</b></td></tr>`;}).join("");
    return head+`<div class="sheet scroll">${rows?`<table><thead><tr><th>Dalykas</th><th class="only-d">Įvertinimai</th><th class="num">Vidurkis</th></tr></thead><tbody>${rows}</tbody></table>`:'<div class="empty">Šį mėnesį įvertinimų nėra.</div>'}</div>`;}
  const days=[...new Set(items.map(i=>i.d))].sort().reverse();
  return head+`<div class="feed">${days.map(d=>dayHead(d)+`<div class="feed-day">${items.filter(i=>i.d===d).sort((a,b)=>lsort(subjName(a.g.subjectId),subjName(b.g.subjectId))).map(i=>{const x=i.x;
    const val=i.k==="g"?`<span class="ev-l big-g">${VLABEL[x.v]??x.v}</span>`:`<span class="ev-l big-g">${x.m==="pv"?"p":x.j||"n"}</span>`;
    const sub=i.k==="g"?typeLbl(x.t)+(x.c?` <span class="muted">— ${esc(x.c)}</span>`:""):(x.m==="pv"?"Pavėlavo":x.j?"Nedalyvavo — "+esc(JUST_NAME[x.j]):"Nedalyvavo (nepateisinta)");
    return `<button class="ev" data-act="stuLesson" data-g="${i.g.id}" data-d="${i.d}">${val}<span class="ev-r vbar ${i.k==="g"?barCls(x.t):"att"}"><b>${esc(subjName(i.g.subjectId))}</b><span>${sub}</span></span><span class="ev-t">${stamp(i.at)}</span></button>`;}).join("")}</div>`).join("")}</div>${typeLegend()}`;};

/* ---- Pamokos (tema, klasės darbas, namų darbai) ---- */
VIEWS.s_lessons=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>G(g.id).lessons.forEach(l=>{if(l.topic||l.cw||l.hw)have.add(l.d.slice(0,7));}));const tabs=monthTabs("lMonth",have);const mon=ui.lMonth;const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.d.startsWith(mon)&&(l.topic||l.cw||l.hw)).forEach(l=>list.push({...l,g})));
  const days=[...new Set(list.map(x=>x.d))].sort().reverse();
  return `<h1>Pamokos</h1><p class="lead">Pamokų temos, klasės darbai ir namų darbai, kuriuos įrašė mokytojai.</p>${tabs}${days.length?`<div class="feed">${days.map(d=>dayHead(d)+`<div class="feed-day">${
    list.filter(x=>x.d===d).sort((a,b)=>(a.no||0)-(b.no||0)).map(l=>`<button class="ev" data-act="stuLesson" data-g="${l.g.id}" data-d="${l.d}"><span class="ev-l no">${l.no||""}</span><span class="ev-r vbar ${barCls(l.t)}"><b>${esc(subjName(l.g.subjectId))}</b>${l.t?`<span>${typeLbl(l.t)}</span>`:""}
      ${l.topic?`<span><b>Tema:</b> ${esc(l.topic)}</span>`:""}${l.cw?`<span><b>Klasės darbas:</b> ${esc(l.cw)}</span>`:""}${l.hw?`<span><b>Namų darbai:</b> ${esc(l.hw)}${l.hwDue?` <span class="tag">atlikti iki ${l.hwDue}</span>`:""}</span>`:""}</span></button>`).join("")}</div>`).join("")}</div>`:'<div class="sheet empty">Šį mėnesį pamokų įrašų nėra.</div>'}`;};

/* ---- Namų darbai: surūšiuoti pagal atlikimo datą ---- */
VIEWS.s_hw=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const t=TODAY();const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.hw).forEach(l=>list.push({...l,g,due:l.hwDue||l.d})));
  const next=ui.hwTab!=="past";const sel_=list.filter(x=>next?x.due>=t:x.due<t).sort((a,b)=>next?lsort(a.due,b.due):lsort(b.due,a.due)).slice(0,next?200:60);
  const badge=d=>d===t?'<span class="hw-b today">Šiandien</span>':d===addDays(t,1)?'<span class="hw-b soon">Rytoj</span>':d<t?`<span class="hw-b past">${d}</span>`:"";
  const days=[...new Set(sel_.map(x=>x.due))];
  return `<h1>Namų darbai</h1><div class="tabs"><button aria-selected="${next}" data-act="hwTab" data-v="next">Artimiausi namų darbai</button><button aria-selected="${!next}" data-act="hwTab" data-v="past">Ankstesni</button></div>
  <p class="info-line">Sąrašas surūšiuotas pagal namų darbų <b>atlikimo datą</b></p>
  ${days.length?days.map(d=>`<div class="hw-day"><b>${WD_FULL[wdOf(d)]}</b><span>${d}</span></div>${sel_.filter(x=>x.due===d).map(x=>`<button class="hw-card" data-act="stuLesson" data-g="${x.g.id}" data-d="${x.d}"><span class="hw-top"><b>${esc(subjName(x.g.subjectId))}</b>${badge(x.due)}</span>
    <span class="hw-lbl">Namų darbai:</span><span class="hw-txt">${esc(x.hw)}</span><span class="hw-foot">${esc(uNameFL(x.g.teacherId))}, <b>įvedė:</b> ${x.hwAt?stamp(x.hwAt).replace("<br>"," "):x.d}${x.hwDue?"":" · atlikimo data nenurodyta"}</span></button>`).join("")}`).join(""):`<div class="sheet empty">${next?"Artimiausių namų darbų nėra.":"Ankstesnių namų darbų nėra."}</div>`}`;};

/* ---- Trimestrai / pusmečiai: tik pasirinkto laikotarpio pažymiai ir išvesti įvertinimai ---- */
VIEWS.s_periods=()=>{const n=needChild();if(n)return n;return periodsReport(viewedStudent(),"<h1>Trimestrai / pusmečiai</h1>");};
/* Asmeninė mokymosi ataskaita: tą patį mato mokinys, tėvai, klasės vadovas ir administratorius */
function periodsReport(sid,head){const sys=sysOfStudent(sid);const ps=periodsSys(sys);
  const pOpts=[...ps.map(p=>[p.id,p.name]),["Y","Metinis"]];ensureIn("stPer",pOpts,curPeriod(sys));const pid=ui.stPer;
  const gs=studentGroups(sid).sort((a,b)=>lsort(subjName(a.subjectId),subjName(b.subjectId)));
  const tabs=`<div class="tabs">${pOpts.map(([k,nm])=>`<button aria-selected="${pid===k}" data-act="stPer" data-v="${k}">${nm}</button>`).join("")}</div>`;
  if(pid==="Y"){const rows=gs.map(g=>{const pg=G(g.id).pg[sid]||{};return `<tr><td><b>${esc(subjName(g.subjectId))}</b></td>${ps.map(p=>`<td class="num">${vchip(pg[p.id])}</td>`).join("")}<td class="num"><b>${vchip(pg.Y)}</b></td></tr>`;}).join("");
    return `${head}${tabs}<div class="sheet scroll"><table><thead><tr><th>Dalykas</th>${ps.map(p=>`<th class="num">${p.name}</th>`).join("")}<th class="num">Metinis</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="muted">Mokinys nepriskirtas grupėms.</td></tr>'}</tbody></table></div>
    <p class="small muted">Metinis įvertinimas — laikotarpių įvertinimų vidurkis, suapvalintas matematiškai.</p>`;}
  const p=core.settings.periods[pid];
  const rows=gs.map(g=>{const grs=sGrades(g.id,sid,pid);const isk=(g.evalSys||"10")==="isk";const pg=G(g.id).pg[sid]||{};const x=(g.extra||{})[pid]&&pg["X"+pid]!=null?`<div class="small muted">${esc(g.extra[pid])}: ${VLABEL[pg["X"+pid]]??pg["X"+pid]}</div>`:"";
    const gl=grs.map(y=>`<span class="dg" title="${esc(y.d)} · ${esc(TYPE_NAME[y.t]||"")}${y.c?" · "+esc(y.c):""}">${chip(y,false)}<small>${y.d.slice(5)}</small></span>`).join("");
    return `<tr><td><b>${esc(subjName(g.subjectId))}</b><div class="small muted">${esc(uNameFL(g.teacherId))}${progTag(g,sid)}</div><div class="dgrades only-m pr-m">${gl}</div>${x?`<div class="only-m">${x}</div>`:""}</td><td class="only-d"><div class="dgrades">${grs.map(y=>`<span class="dg" title="${esc(y.d)} · ${esc(TYPE_NAME[y.t]||"")}${y.c?" · "+esc(y.c):""}">${chip(y,false)}<small>${y.d.slice(5)}</small></span>`).join("")||'<span class="muted small">—</span>'}</div>${x}</td>
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
   ${isHoliday(day)?'<div class="sheet empty">Laisva diena</div>':lessons.length?`<div class="tt-list">${lessons.map(x=>{const g=grp(x.gid);const b=bellOf(x.no);const l=G(x.gid).lessons.find(y=>y.d===day);
     return `<button class="tt-row" data-act="stuLesson" data-g="${x.gid}" data-d="${day}"><span class="tt-no">${x.no}</span><span class="tt-time">${b?`${b[0]}<br>${b[1]}`:""}</span><span class="tt-subj"><b>${esc(subjName(g.subjectId))}</b><span>${esc(uNameFL(g.teacherId))}</span>${l&&l.topic?`<span class="tt-topic">${esc(l.topic)}</span>`:""}</span></button>`;}).join("")}</div>`:'<div class="sheet empty">Pamokų nėra.</div>'}`;
  return `<h1>Tvarkaraštis</h1><p class="lead only-d">Savaitės pamokos su temomis, namų darbais, gautais įvertinimais ir lankomumu.</p><div class="bar">${weekNav()}</div>
  <div class="only-d">${weekGrid(gids,{sid})}</div><div class="only-m">${dayList}</div>`;};
VIEWS.s_att=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const sys=sysOfStudent(sid);const pOpts=periodOpts(sys,true);ensureIn("stPid",pOpts,curPeriod(sys));
  const rows=[];studentGroups(sid).forEach(g=>G(g.id).att.filter(a=>a.s===sid&&inPeriod(a.d,ui.stPid)).forEach(a=>rows.push({...a,gn:subjName(g.subjectId)})));rows.sort((a,b)=>lsort(b.d,a.d));
  const nn=rows.filter(r=>r.m==="n"),un=nn.filter(r=>!r.j).length,pv=rows.filter(r=>r.m==="pv").length;
  return `<h1>Lankomumas</h1><div class="bar">${sel("stPid",pOpts,ui.stPid,"Laikotarpis")}</div>
  <div class="stats"><div><b>${nn.length}</b>praleista</div><div><b>${nn.length-un}</b>pateisinta</div><div><b class="${un?"bad":""}">${un}</b>nepateisinta</div><div><b>${pv}</b>pavėlavimų</div></div>
  <div class="sheet scroll">${rows.length?`<table><thead><tr><th>Data</th><th>Dalykas</th><th>Žyma</th><th>Pateisinimas</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.d}</td><td>${esc(r.gn)}</td><td><span class="att ${r.m==="pv"?"p":r.j?"j":""}">${r.m==="pv"?"p":r.j||"n"}</span></td><td>${r.m==="pv"?"Pavėlavo":r.j?esc(JUST_NAME[r.j]):'<span style="color:var(--pen)">Nepateisinta — kreipkitės į klasės vadovą</span>'}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">Praleistų pamokų nėra.</div>`}</div>`;};
/* ---- Atsiskaitomųjų darbų grafikas ---- */
VIEWS.s_works=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const gs=studentGroups(sid);
  const list=[];gs.forEach(g=>G(g.id).lessons.filter(l=>l.t).forEach(l=>list.push({d:l.d,g,t:l.t,topic:l.topic})));core.works.filter(w=>gs.some(g=>g.id===w.g)&&!list.some(x=>x.g.id===w.g&&x.d===w.d)).forEach(w=>list.push({d:w.d,g:grp(w.g),t:w.t,topic:w.topic}));
  const ms=yearMonths(new Set(list.map(x=>x.d.slice(0,7))));if(!ms.includes(ui.wMonth))ui.wMonth=ms.includes(TODAY().slice(0,7))?TODAY().slice(0,7):ms[ms.length-1];
  const i=ms.indexOf(ui.wMonth);const mon=ui.wMonth;const rows=list.filter(x=>x.d.startsWith(mon)).sort((a,b)=>lsort(b.d,a.d));
  return `<h1>Atsiskaitomųjų darbų grafikas</h1><div class="mnav"><button data-act="wMonth" data-v="${ms[i-1]||""}" ${i<=0?"disabled":""} aria-label="Ankstesnis mėnuo">${ICON.chevL}</button><b>${mon.slice(0,4)} ${MONTHS[+mon.slice(5)-1].toUpperCase()}</b><button data-act="wMonth" data-v="${ms[i+1]||""}" ${i>=ms.length-1?"disabled":""} aria-label="Kitas mėnuo">${ICON.chev}</button></div>
  ${rows.length?`<div class="works">${rows.map(x=>{const gr=G(x.g.id).grades.find(y=>y.s===sid&&y.d===x.d);return `<button class="wk" data-act="stuLesson" data-g="${x.g.id}" data-d="${x.d}"><span class="wk-d"><b>${+x.d.slice(8)}</b><span>${WD[wdOf(x.d)]}</span></span><span class="wk-r vbar ${barCls(x.t)}"><b class="wk-s">${esc(subjName(x.g.subjectId))}</b><span class="wk-t">${esc(TYPE_NAME[x.t]||x.t)}</span>${x.topic?`<span><b>Tema:</b> ${esc(x.topic)}</span>`:""}${gr?`<span><b>Įvertinimas:</b> ${chip(gr,false)}</span>`:""}</span></button>`;}).join("")}</div>`:'<div class="sheet empty">Šį mėnesį atsiskaitomųjų darbų nėra.</div>'}`;};

/* ---- Pagyrimai ir pastabos ---- */
VIEWS.s_notes=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const list=[];studentGroups(sid).forEach(g=>G(g.id).notes.filter(x=>x.s===sid).forEach(x=>list.push({...x,g})));list.sort((a,b)=>lsort(b.at||b.d,a.at||a.d));
  return `<h1>Pagyrimai ir pastabos</h1>${list.length?`<div class="notes">${list.map(x=>`<div class="nt-card"><span class="nt-ic note-${x.kind}">${ICON.note}</span><div class="nt-b"><div class="nt-top"><b>${NOTE_NAME[x.kind]||""}</b><span>${x.d.slice(5)}d</span></div>
    <div class="nt-subj">${esc(subjName(x.g.subjectId))} (${esc(uNameFL(x.by||x.g.teacherId))})</div><div class="nt-txt">${esc(x.text)}</div><div class="nt-who">${esc(uNameFL(sid))}</div></div></div>`).join("")}</div>`:'<div class="sheet empty">Įrašų nėra.</div>'}`;};
VIEWS.s_soc=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const a=social.list.filter(x=>x.hours[sid]).sort((x,y)=>lsort(y.d,x.d));
  return `<h1>Socialinė-pilietinė veikla</h1><div class="sheet pad socsum"><div class="small muted">Atlikta${socPlan(sid)!=null?" iš metinio plano":""}</div><div class="socbig">${socProgress(sid)}</div></div>
  <div class="sheet scroll" style="margin-top:12px">${a.length?`<table><thead><tr><th>Data</th><th>Veikla</th><th>Partneris</th><th>Įrašė</th><th class="num">Val.</th></tr></thead><tbody>${a.map(x=>`<tr><td style="white-space:nowrap">${x.d}</td><td><b>${esc(x.activity)}</b><div class="small muted">${esc(x.type)}${x.comment?" · "+esc(x.comment):""}</div></td><td>${esc(x.partner)}</td><td>${esc(uNameFL(x.by))}</td><td class="num"><b>${fmtH(x.hours[sid])}</b></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Veiklų dar nėra.</div>'}</div>`;};
VIEWS.p_child=()=>{const n=needChild();if(n)return n;const s=U(viewedStudent());
  return `<h1>Vaiko duomenys</h1><p class="lead">Galite pataisyti vaiko asmeninius ir kontaktinius duomenis. Jei vaikas dar neturi paskyros, jo mokinio raktas nurodytas žemiau.</p>
  <div class="sheet pad"><form data-form="saveChild" style="display:flex;flex-direction:column;gap:12px;max-width:520px"><div class="row"><label class="field" style="flex:1">Vardas<input name="first" value="${esc(s.first)}" required></label><label class="field" style="flex:1">Pavardė<input name="last" value="${esc(s.last)}" required></label></div>
  <div class="row"><label class="field">Gimimo data<input type="date" name="birth" value="${esc(s.birth||"")}"></label><label class="field" style="flex:1">El. paštas<input type="email" name="email" value="${esc(s.email||"")}"></label></div>
  <div><button class="btn pri">Išsaugoti</button></div></form></div>
  <h2>Prisijungimas</h2><div class="sheet pad">${s.login?`Vaikas prisijungia vardu <b>${esc(s.login)}</b>.${s.email?"":" Nurodykite el. paštą, kad būtų lengviau atkurti prisijungimą."} Pamiršus slaptažodį, naują nustato mokyklos administratorius.`:`Vaikas dar neužsiregistravo. Mokinio raktas: <span class="mono">${esc(s.key)}</span>`}</div>`;};
VIEWS.p_add=()=>`<h1>Pridėti vaiką</h1><p class="lead">Jei keli jūsų vaikai mokosi mokykloje, pakanka vienos paskyros. Įveskite kito vaiko tėvų raktą — jį suteikia klasės vadovas arba administratorius.</p>
  <div class="sheet pad"><form data-form="addChild" class="bar" style="margin:0"><label class="field" style="flex:1">Tėvų raktas<input name="key" class="mono" required placeholder="vardpavaT…"></label><button class="btn pri">Išsaugoti</button></form></div>
  <h2>Pridėti vaikai</h2><div class="list">${(me().childIds||[]).filter(U).map(c=>`<div class="li"><span>${esc(uNameFL(c))} · ${esc(clsName(U(c).classId))}</span></div>`).join("")||'<span class="muted small">Nėra.</span>'}</div>`;

/* ================= PRANEŠIMAI ================= */
function recipientsFor(u){let ids=new Set();const all=Object.values(users).filter(x=>x.id!==u.id);
  if(u.role==="admin")all.forEach(x=>ids.add(x.id));
  else if(u.role==="teacher"){all.filter(x=>x.role==="admin"||x.role==="teacher").forEach(x=>ids.add(x.id));const ss=new Set();teacherGroups(u.id).forEach(g=>g.students.forEach(s=>ss.add(s)));headClassesOf(u.id).forEach(c=>classStudents(c.id).forEach(s=>ss.add(s.id)));
    ss.forEach(s=>{ids.add(s);all.filter(p=>p.role==="parent"&&(p.childIds||[]).includes(s)).forEach(p=>ids.add(p.id));});}
  else{const kids=u.role==="student"?[u.id]:(u.childIds||[]);kids.forEach(k=>{studentGroups(k).forEach(g=>ids.add(g.teacherId));const c=cls((U(k)||{}).classId);if(c&&c.headTeacherId)ids.add(c.headTeacherId);});all.filter(x=>x.role==="admin").forEach(x=>ids.add(x.id));}
  return [...ids].filter(id=>U(id)&&U(id).login).sort((a,b)=>lsort(U(a).role+uName(a),U(b).role+uName(b)));}
const MSG_GROUPS=[["admin","Administratoriai"],["teacher","Mokytojai"],["parent","Tėvai"],["student","Mokiniai"]];
function msgWho(id){const x=U(id);if(!x)return"";if(x.role==="student")return clsName(x.classId)+" kl.";if(x.role==="parent"){const k=(x.childIds||[]).filter(U);return k.length?"vaikas: "+k.map(c=>`${uNameFL(c)} (${clsName(U(c).classId)})`).join(", "):"";}
  if(x.role==="teacher"){const h=core.classes.filter(c=>c.headTeacherId===id).map(c=>c.name);return h.length?"kl. vadovas "+h.join(", "):"";}return"";}
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
VIEWS.acc=u=>`<h1>Mano paskyra</h1><div class="sheet pad"><div class="row" style="gap:28px"><div><div class="small muted">Vardas, pavardė</div><b>${esc(u.first)} ${esc(u.last)}</b></div><div><div class="small muted">Prisijungimo vardas</div><b>${esc(u.login)}</b></div><div><div class="small muted">Vaidmuo</div><b>${ROLE_NAME[u.role]}</b></div>${u.key?`<div><div class="small muted">Asmeninis raktas</div><span class="mono">${esc(u.key)}</span></div>`:""}</div></div>
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
