/* Dienynas — mokinio ir tėvų rodiniai, pranešimai, paskyra */
/* ================= MOKINYS / TĖVAI ================= */
function needChild(){const sid=viewedStudent();return sid?null:`<h1>Vaiko dienynas</h1><div class="sheet empty">Prie paskyros dar nepridėtas vaikas. <button class="btn" data-act="view" data-v="p_add">Pridėti vaiką</button></div>`;}
/* ---- Bendri pagalbiniai ---- */
function yearMonths(){const r=yearRange();const end=(TODAY()<r.to?TODAY():r.to).slice(0,7);const out=[];let y=+r.from.slice(0,4),m=+r.from.slice(5,7);
  for(let i=0;i<14;i++){const k=`${y}-${String(m).padStart(2,"0")}`;out.push(k);if(k>=end)break;m++;if(m>12){m=1;y++;}}return out;}
function monthTabs(key,withData){const ms=yearMonths();if(!ms.includes(ui[key])){const d=withData?ms.filter(m=>withData.has(m)):[];ui[key]=d.length?d[d.length-1]:ms[ms.length-1];}
  return `<div class="mtabs" role="tablist">${ms.map(m=>`<button role="tab" aria-selected="${ui[key]===m}" data-act="mtab" data-k="${key}" data-v="${m}">${m}</button>`).join("")}</div>`;}
const pad2=n=>String(n).padStart(2,"0");
function stamp(at){if(!at)return"";const d=new Date(at);if(isNaN(d))return"";return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}<br>${pad2(d.getHours())}:${pad2(d.getMinutes())}`;}
const typeLbl=t=>`<span class="${t==="KD"?"kdtxt":""}">${esc(TYPE_NAME[t]||t||"")}</span>`;

/* ---- Pagrindinis mokinio puslapis: Dienynas ---- */
VIEWS.s_diary=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>{const D=G(g.id);D.grades.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});D.att.forEach(x=>{if(x.s===sid)have.add(x.d.slice(0,7));});});const tabs=monthTabs("dMonth",have);const mon=ui.dMonth;
  if(!["days","subj"].includes(ui.dTab))ui.dTab="days";
  const gs=studentGroups(sid);const items=[];
  gs.forEach(g=>{const D=G(g.id);
    D.grades.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"g",d:x.d,g,x,at:x.at||""}));
    D.att.filter(x=>x.s===sid&&x.d.startsWith(mon)).forEach(x=>items.push({k:"a",d:x.d,g,x,at:""}));});
  const head=`<h1>${me().role==="parent"?"Vaiko dienynas":"Mokinio dienynas"}</h1><p class="lead">${esc(uNameFL(sid))} · ${esc(clsName(U(sid).classId))} klasė</p>${tabs}
   <div class="tabs dtabs"><button aria-selected="${ui.dTab==="days"}" data-act="dTab" data-v="days">Pagal dienas</button><button aria-selected="${ui.dTab==="subj"}" data-act="dTab" data-v="subj">Pagal dalykus</button></div>`;
  if(!items.length)return head+`<div class="sheet empty">Šį mėnesį įvertinimų ir lankomumo žymų nėra.</div>`;
  if(ui.dTab==="subj"){const bySub=new Map();items.filter(i=>i.k==="g").forEach(i=>{const k=subjName(i.g.subjectId);(bySub.get(k)||bySub.set(k,[]).get(k)).push(i);});
    const rows=[...bySub.entries()].sort((a,b)=>lsort(a[0],b[0])).map(([name,list])=>{list.sort((a,b)=>lsort(a.d,b.d));const av=avgOf(list.map(i=>i.x));
      return `<tr><td><b>${esc(name)}</b></td><td><div class="dgrades">${list.map(i=>`<span class="dg" title="${esc(TYPE_NAME[i.x.t]||"")}${i.x.c?" · "+esc(i.x.c):""}">${chip(i.x,false)}<small>${i.d.slice(5)}</small></span>`).join("")}</div></td><td class="num"><b>${fmtAvg(av)}</b></td></tr>`;}).join("");
    return head+`<div class="sheet scroll">${rows?`<table><thead><tr><th>Dalykas</th><th>Įvertinimai</th><th class="num">Mėnesio vidurkis</th></tr></thead><tbody>${rows}</tbody></table>`:'<div class="empty">Šį mėnesį įvertinimų nėra.</div>'}</div>`;}
  const days=[...new Set(items.map(i=>i.d))].sort().reverse();
  const out=days.map(d=>{const list=items.filter(i=>i.d===d).sort((a,b)=>lsort(subjName(a.g.subjectId),subjName(b.g.subjectId)));
    return `<div class="dday"><div class="dday-h"><b>${+d.slice(8)}</b><span>${WD[wdOf(d)]}</span></div><div class="dday-list">${list.map(i=>{
      if(i.k==="g")return `<div class="drow"><div class="dval">${chip(i.x,false)}</div><div class="dtxt"><b>${esc(subjName(i.g.subjectId))}</b><div>${typeLbl(i.x.t)}${i.x.c?` <span class="muted">— ${esc(i.x.c)}</span>`:""}</div></div><div class="dtime">${stamp(i.at)}</div></div>`;
      const a=i.x;return `<div class="drow"><div class="dval"><span class="g">${a.m==="pv"?"p":a.j||"n"}</span></div><div class="dtxt"><b>${esc(subjName(i.g.subjectId))}</b><div class="muted">${a.m==="pv"?"Pavėlavo":a.j?"Nedalyvavo — "+esc(JUST_NAME[a.j]):"Nedalyvavo (nepateisinta)"}</div></div><div class="dtime"></div></div>`;}).join("")}</div></div>`;}).join("");
  return head+`<div class="diary">${out}</div>`;};

/* ---- Pamokos (tema, klasės darbas, namų darbai) ---- */
VIEWS.s_lessons=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const have=new Set();studentGroups(sid).forEach(g=>G(g.id).lessons.forEach(l=>{if(l.topic||l.cw||l.hw)have.add(l.d.slice(0,7));}));const tabs=monthTabs("lMonth",have);const mon=ui.lMonth;const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.d.startsWith(mon)&&l.d<=TODAY()&&(l.topic||l.cw||l.hw)).forEach(l=>list.push({...l,g})));
  const days=[...new Set(list.map(x=>x.d))].sort().reverse();
  return `<h1>Pamokos</h1><p class="lead">Pamokų temos, klasės darbai ir namų darbai, kuriuos įrašė mokytojai.</p>${tabs}${days.length?`<div class="diary">${days.map(d=>`<div class="dday"><div class="dday-h"><b>${+d.slice(8)}</b><span>${WD[wdOf(d)]}</span></div><div class="dday-list">${
    list.filter(x=>x.d===d).sort((a,b)=>(a.no||0)-(b.no||0)).map(l=>`<div class="drow lrow"><div class="dtxt"><b>${l.no?l.no+". ":""}${esc(subjName(l.g.subjectId))}</b>${l.t?` ${typeLbl(l.t)}`:""}
      ${l.topic?`<div><span class="muted">Tema:</span> ${esc(l.topic)}</div>`:""}${l.cw?`<div><span class="muted">Klasės darbas:</span> ${esc(l.cw)}</div>`:""}${l.hw?`<div><span class="muted">Namų darbai:</span> ${esc(l.hw)}${l.hwDue?` <span class="tag">atlikti iki ${l.hwDue}</span>`:""}</div>`:""}</div></div>`).join("")}</div></div>`).join("")}</div>`:'<div class="sheet empty">Šį mėnesį pamokų įrašų nėra.</div>'}`;};

/* ---- Namų darbai ---- */
VIEWS.s_hw=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const t=TODAY();const list=[];
  studentGroups(sid).forEach(g=>G(g.id).lessons.filter(l=>l.hw).forEach(l=>list.push({...l,g,due:l.hwDue||""})));
  const act=list.filter(x=>x.due?x.due>=t:x.d>=addDays(t,-7)).sort((a,b)=>lsort(a.due||a.d,b.due||b.d));
  const past=list.filter(x=>!act.includes(x)).sort((a,b)=>lsort(b.d,a.d)).slice(0,40);
  const tbl=arr=>`<div class="sheet scroll"><table><thead><tr><th>Atlikti iki</th><th>Dalykas</th><th>Užduotis</th><th>Užduota</th></tr></thead><tbody>${arr.map(x=>`<tr><td style="white-space:nowrap"><b>${x.due||"—"}</b>${x.due&&x.due===t?' <span class="tag bad">šiandien</span>':""}</td><td>${esc(subjName(x.g.subjectId))}</td><td>${esc(x.hw)}${x.topic?`<div class="small muted">Tema: ${esc(x.topic)}</div>`:""}</td><td class="small muted" style="white-space:nowrap">${x.d}</td></tr>`).join("")}</tbody></table></div>`;
  return `<h1>Namų darbai</h1><h2>Aktualūs</h2>${act.length?tbl(act):'<div class="sheet empty">Aktualių namų darbų nėra.</div>'}<h2>Ankstesni</h2>${past.length?tbl(past):'<div class="sheet empty">Nėra.</div>'}`;};

/* ---- Trimestrai / pusmečiai: tik pasirinkto laikotarpio pažymiai ir išvesti įvertinimai ---- */
VIEWS.s_periods=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const sys=sysOfStudent(sid);const ps=periodsSys(sys);
  const pOpts=[...ps.map(p=>[p.id,p.name]),["Y","Metinis"]];ensureIn("stPer",pOpts,curPeriod(sys));const pid=ui.stPer;
  const gs=studentGroups(sid).sort((a,b)=>lsort(subjName(a.subjectId),subjName(b.subjectId)));
  const tabs=`<div class="tabs">${pOpts.map(([k,nm])=>`<button aria-selected="${pid===k}" data-act="stPer" data-v="${k}">${nm}</button>`).join("")}</div>`;
  if(pid==="Y"){const rows=gs.map(g=>{const pg=G(g.id).pg[sid]||{};return `<tr><td><b>${esc(subjName(g.subjectId))}</b></td>${ps.map(p=>`<td class="num">${vchip(pg[p.id])}</td>`).join("")}<td class="num"><b>${vchip(pg.Y)}</b></td></tr>`;}).join("");
    return `<h1>Trimestrai / pusmečiai</h1>${tabs}<div class="sheet scroll"><table><thead><tr><th>Dalykas</th>${ps.map(p=>`<th class="num">${p.name}</th>`).join("")}<th class="num">Metinis</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="muted">Mokinys nepriskirtas grupėms.</td></tr>'}</tbody></table></div>
    <p class="small muted">Metinis įvertinimas — laikotarpių įvertinimų vidurkis, suapvalintas matematiškai.</p>`;}
  const p=core.settings.periods[pid];
  const rows=gs.map(g=>{const grs=sGrades(g.id,sid,pid);const isk=(g.evalSys||"10")==="isk";const pg=G(g.id).pg[sid]||{};const x=(g.extra||{})[pid]&&pg["X"+pid]!=null?`<div class="small muted">${esc(g.extra[pid])}: ${VLABEL[pg["X"+pid]]??pg["X"+pid]}</div>`:"";
    return `<tr><td><b>${esc(subjName(g.subjectId))}</b><div class="small muted">${esc(uNameFL(g.teacherId))}${progTag(g,sid)}</div></td><td><div class="dgrades">${grs.map(y=>`<span class="dg" title="${esc(y.d)} · ${esc(TYPE_NAME[y.t]||"")}${y.c?" · "+esc(y.c):""}">${chip(y,false)}<small>${y.d.slice(5)}</small></span>`).join("")||'<span class="muted small">—</span>'}</div>${x}</td>
      <td class="num">${isk?"":`<b>${fmtAvg(avgOf(grs))}</b>`}</td><td class="num"><b class="big">${vchip(pg[pid])}</b></td></tr>`;}).join("");
  return `<h1>Trimestrai / pusmečiai</h1>${tabs}<p class="lead">${PNAME[pid]}: ${p.from} – ${p.to}. Rodomi tik šio laikotarpio pažymiai ir išvesti įvertinimai.</p>
  <div class="sheet scroll"><table><thead><tr><th>Dalykas</th><th>Pažymiai</th><th class="num">Vidurkis</th><th class="num">Išvestas įvertinimas</th></tr></thead><tbody>${rows||'<tr><td colspan="4" class="muted">Mokinys nepriskirtas grupėms.</td></tr>'}</tbody></table></div>
  <p class="small muted">Vidurkis = (p₁ + p₂ + … + pₙ) / n; visi pažymiai turi vienodą svorį, „neat.“ vidurkio nekeičia. Laikotarpio įvertinimą išveda mokytojas.</p>`;};
VIEWS.s_tt=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();return `<h1>Tvarkaraštis</h1><p class="lead">Savaitės pamokos su temomis, namų darbais, gautais įvertinimais ir lankomumu.</p><div class="bar">${weekNav()}</div>${weekGrid(studentGroups(sid).map(g=>g.id),{sid})}`;};
VIEWS.s_att=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const sys=sysOfStudent(sid);const pOpts=periodOpts(sys,true);ensureIn("stPid",pOpts,curPeriod(sys));
  const rows=[];studentGroups(sid).forEach(g=>G(g.id).att.filter(a=>a.s===sid&&inPeriod(a.d,ui.stPid)).forEach(a=>rows.push({...a,gn:subjName(g.subjectId)})));rows.sort((a,b)=>lsort(b.d,a.d));
  const nn=rows.filter(r=>r.m==="n"),un=nn.filter(r=>!r.j).length,pv=rows.filter(r=>r.m==="pv").length;
  return `<h1>Lankomumas</h1><div class="bar">${sel("stPid",pOpts,ui.stPid,"Laikotarpis")}</div>
  <div class="stats"><div><b>${nn.length}</b>praleista</div><div><b>${nn.length-un}</b>pateisinta</div><div><b class="${un?"bad":""}">${un}</b>nepateisinta</div><div><b>${pv}</b>pavėlavimų</div></div>
  <div class="sheet scroll">${rows.length?`<table><thead><tr><th>Data</th><th>Dalykas</th><th>Žyma</th><th>Pateisinimas</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.d}</td><td>${esc(r.gn)}</td><td><span class="att ${r.m==="pv"?"p":r.j?"j":""}">${r.m==="pv"?"p":r.j||"n"}</span></td><td>${r.m==="pv"?"Pavėlavo":r.j?esc(JUST_NAME[r.j]):'<span style="color:var(--pen)">Nepateisinta — kreipkitės į klasės vadovą</span>'}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">Praleistų pamokų nėra.</div>`}</div>`;};
VIEWS.s_works=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const gs=studentGroups(sid);const t=TODAY();
  const list=[];gs.forEach(g=>G(g.id).lessons.filter(l=>l.t).forEach(l=>list.push({d:l.d,g,t:l.t,topic:l.topic})));core.works.filter(w=>gs.some(g=>g.id===w.g)&&!list.some(x=>x.g.id===w.g&&x.d===w.d)).forEach(w=>list.push({d:w.d,g:grp(w.g),t:w.t,topic:w.topic}));
  const up=list.filter(x=>x.d>=t).sort((a,b)=>lsort(a.d,b.d)),past=list.filter(x=>x.d<t).sort((a,b)=>lsort(b.d,a.d)).slice(0,30);
  const row=x=>{const gr=G(x.g.id).grades.find(y=>y.s===sid&&y.d===x.d);return `<tr><td>${x.d}</td><td>${esc(subjName(x.g.subjectId))}</td><td>${esc(TYPE_NAME[x.t])}</td><td>${esc(x.topic||"")}</td><td>${gr?chip(gr):'<span class="muted">—</span>'}</td></tr>`;};
  return `<h1>Atsiskaitomieji darbai</h1><h2>Artėjantys</h2><div class="sheet scroll">${up.length?`<table><thead><tr><th>Data</th><th>Dalykas</th><th>Tipas</th><th>Tema</th><th>Įvertinimas</th></tr></thead><tbody>${up.map(row).join("")}</tbody></table>`:'<div class="empty">Suplanuotų atsiskaitymų nėra.</div>'}</div>
  <h2>Ankstesni</h2><div class="sheet scroll">${past.length?`<table><thead><tr><th>Data</th><th>Dalykas</th><th>Tipas</th><th>Tema</th><th>Įvertinimas</th></tr></thead><tbody>${past.map(row).join("")}</tbody></table>`:'<div class="empty">Nėra.</div>'}</div>`;};
VIEWS.s_notes=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const list=[];studentGroups(sid).forEach(g=>G(g.id).notes.filter(x=>x.s===sid).forEach(x=>list.push({...x,g})));list.sort((a,b)=>lsort(b.d,a.d));
  return `<h1>Pagyrimai / pastabos</h1><div class="list">${list.map(x=>`<div class="li"><span>${NOTE_ICON[x.kind]||""} <b>${NOTE_NAME[x.kind]||""}</b> · ${x.d} · ${esc(subjName(x.g.subjectId))}<div>${esc(x.text)}</div><div class="small muted">${esc(uNameFL(x.by))}</div></span></div>`).join("")||'<div class="sheet empty">Įrašų nėra.</div>'}</div>`;};
VIEWS.s_soc=()=>{const n=needChild();if(n)return n;const sid=viewedStudent();const a=social.list.filter(x=>x.hours[sid]).sort((x,y)=>lsort(y.d,x.d));const h=a.reduce((t,x)=>t+x.hours[sid],0);
  return `<h1>Socialinė-pilietinė veikla</h1><div class="stats"><div><b>${h}</b>sukaupta valandų</div><div><b>${a.length}</b>veiklų</div></div>
  <div class="sheet scroll">${a.length?`<table><thead><tr><th>Data</th><th>Tipas</th><th>Veikla</th><th>Partneris</th><th class="num">Val.</th></tr></thead><tbody>${a.map(x=>`<tr><td>${x.d}</td><td>${esc(x.type)}</td><td>${esc(x.activity)}</td><td>${esc(x.partner)}</td><td class="num">${x.hours[sid]}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">Veiklų dar nėra.</div>'}</div>`;};
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
VIEWS.msg=u=>{const tab=ui.msgTab;const inbox=msgs.list.filter(m=>m.to.includes(u.id)).sort((a,b)=>lsort(b.at,a.at));const out=msgs.list.filter(m=>m.from===u.id).sort((a,b)=>lsort(b.at,a.at));
  const list=tab==="out"?out:inbox;
  return `<h1>Pranešimai</h1><div class="bar"><button class="btn pri" data-act="newMsg">Naujas pranešimas</button></div>
  <div class="tabs"><button aria-selected="${tab==="in"}" data-act="msgTab" data-v="in">Gauti (${inbox.length})</button><button aria-selected="${tab==="out"}" data-act="msgTab" data-v="out">Išsiųsti (${out.length})</button></div>
  <div class="sheet scroll">${list.length?`<table><thead><tr><th>${tab==="out"?"Gavėjai":"Siuntėjas"}</th><th>Tema</th><th>Data</th></tr></thead><tbody>${list.map(m=>`<tr class="${tab==="in"&&!(m.read||{})[u.id]?"msg-unread":""}" style="cursor:pointer" data-act="openMsg" data-v="${m.id}"><td>${tab==="out"?esc(m.to.map(uNameFL).join(", ")):esc(uNameFL(m.from))}</td><td>${esc(m.subj)}</td><td>${m.at.slice(0,16).replace("T"," ")}</td></tr>`).join("")}</tbody></table>`:'<div class="empty">Pranešimų nėra.</div>'}</div>`;};
function newMsgDlg(to="",subj=""){const u=me();const r=recipientsFor(u);
  openDlg(dlgHead("Naujas pranešimas")+`<form data-form="sendMsg"><div class="dlg-b"><label class="field">Gavėjai (laikykite Ctrl / ⌘, kad pasirinktumėte kelis)<select name="to" multiple size="8" required>${r.map(id=>`<option value="${id}" ${id===to?"selected":""}>${esc(uName(id))} — ${ROLE_NAME[U(id).role]}${U(id).role==="student"?" "+esc(clsName(U(id).classId)):""}</option>`).join("")}</select></label>
  <label class="field">Tema<input name="subj" required value="${esc(subj)}"></label><label class="field">Tekstas<textarea name="body" required style="min-height:140px"></textarea></label></div>
  <div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Siųsti</button></div></form>`);}
function openMsg(id){const u=me();const m=msgs.list.find(x=>x.id===id);if(!m)return;if(m.to.includes(u.id)&&!(m.read||{})[u.id]){m.read??={};m.read[u.id]=true;DB.upd("message_recipients",{read_at:new Date().toISOString()},{message_id:m.id,recipient_id:u.id});}
  openDlg(dlgHead(esc(m.subj),`${esc(uNameFL(m.from))} → ${esc(m.to.map(uNameFL).join(", "))} · ${m.at.slice(0,16).replace("T"," ")}`)+`<div class="dlg-b"><div style="white-space:pre-wrap">${esc(m.body)}</div></div><div class="dlg-f">${m.from!==u.id?`<button class="btn pri" data-act="reply" data-v="${m.id}">Atsakyti</button>`:""}<button class="btn" data-act="close">Uždaryti</button></div>`);}

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
