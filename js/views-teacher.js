/* Dienynas — mokytojo ir klasės vadovo rodiniai */
/* ================= Tvarkaraščio tinklelis ================= */
function weekNav(){const m=mondayOf(ui.week||TODAY());return `<div class="row" style="gap:4px"><button class="btn" data-act="weekMove" data-v="-7" aria-label="Ankstesnė savaitė">‹</button><label class="field">Savaitė<input type="date" data-ch="week" value="${m}"></label><button class="btn" data-act="weekMove" data-v="7" aria-label="Kita savaitė">›</button><button class="btn" data-act="weekMove" data-v="0">Ši savaitė</button></div>`;}
function weekSlots(gids){const mon=mondayOf(ui.week||TODAY());const fri=addDays(mon,4);const slots={};let maxNo=6;
  gids.forEach(gid=>{const oc=occDates(gid,mon,fri);const L=G(gid).lessons;
    oc.forEach((no,d)=>{(slots[no+"|"+d]??=[]).push({gid,d,no});maxNo=Math.max(maxNo,no);});
    L.filter(l=>l.d>=mon&&l.d<=fri&&l.no&&!oc.has(l.d)).forEach(l=>{(slots[l.no+"|"+l.d]??=[]).push({gid,d:l.d,no:l.no});maxNo=Math.max(maxNo,l.no);});});
  return{mon,slots,maxNo};}
function weekGrid(gids,opt={}){const{mon,slots,maxNo}=weekSlots(gids);const t=TODAY();const u=me();
  let h=`<div class="scroll"><div class="week"><div></div>${[0,1,2,3,4].map(i=>{const d=addDays(mon,i);return `<div class="wh ${d===t?"today":""}">${WDL[i]} <span class="muted">${fmtD(d)}</span>${isHoliday(d)?' <span class="tag">laisva</span>':""}</div>`;}).join("")}`;
  for(let no=1;no<=maxNo;no++){h+=`<div class="no">${no}</div>`;for(let i=0;i<5;i++){const d=addDays(mon,i);const list=slots[no+"|"+d]||[];
    h+=`<div class="slot ${list.length?"":"empty"}">${list.map(x=>{const g=grp(x.gid);const l=G(x.gid).lessons.find(y=>y.d===x.d);const kd=l&&["KD","TA","SD"].includes(l.t);
      if(opt.sid){const gs=G(x.gid).grades.filter(y=>y.s===opt.sid&&y.d===x.d);const a=G(x.gid).att.find(y=>y.s===opt.sid&&y.d===x.d);
        return `<button class="lsn ${kd?"kd":""}" data-act="stuLesson" data-g="${x.gid}" data-d="${x.d}"><b>${esc(subjName(g.subjectId))}</b>${l&&l.topic?`<span>${esc(l.topic)}</span>`:""}${l&&l.t?` <span class="tag bad">${l.t}</span>`:""}<div class="chips" style="margin-top:2px">${gs.map(y=>chip(y)).join("")}${a?`<span class="att ${a.j?"j":""} ${a.m==="pv"?"p":""}">${a.m==="pv"?"p":a.j||"n"}</span>`:""}</div>${l&&l.hw?`<span class="small">ND: ${esc(l.hw)}</span>`:""}</button>`;}
      const sub=u&&u.role==="teacher"&&g.teacherId!==u.id;
      return opt.ro?`<div class="lsn"><b>${esc(g.name)}</b>${l&&l.topic?`<span>${esc(l.topic)}</span>`:""}</div>`:`<button class="lsn ${kd?"kd":""} ${sub?"sub":""}" data-act="openLesson" data-g="${x.gid}" data-d="${x.d}"><b>${esc(g.name)}</b>${sub?`<span class="small">vaduojate: ${esc(uNameFL(g.teacherId))}</span>`:""}${l&&l.topic?`<span>${esc(l.topic)}</span>`:'<span class="muted">tema neįvesta</span>'}</button>`;}).join("")}</div>`;}}
  return h+`</div></div>`;}

/* ================= MOKYTOJAS ================= */
VIEWS.t_tt=u=>{const gids=teacherGroups(u.id).map(g=>g.id);
  return `<h1>Tvarkaraštis</h1><p class="lead">Paspaudę pamoką įvesite temą, namų darbus, įvertinimus ir lankomumą. Pamokos sukuriamos pagal tvarkaraštį; vaduojamos pamokos pažymėtos punktyru.</p>
  <div class="bar">${weekNav()}<button class="btn pri" data-act="ttEdit">Redaguoti tvarkaraštį</button></div>
  ${gids.length?weekGrid(gids):`<div class="sheet empty">Pirma sukurkite grupę skiltyje „Grupės“.</div>`}`;};
function ttEditDlg(){const u=me();const own=teacherGroups(u.id,false);const entries=core.timetable.filter(t=>own.some(g=>g.id===t.g)).sort((a,b)=>a.wd-b.wd||a.no-b.no);
  const r=yearRange();
  openDlg(dlgHead("Tvarkaraščio redagavimas")+`<div class="dlg-b">
  <div class="list">${entries.map(t=>`<div class="li"><span><b>${WDL[t.wd]}, ${t.no} pamoka</b> · ${esc(grp(t.g).name)}<div class="small muted">nuo ${t.from} ${t.weeks?`, ${t.weeks} sav.`:"iki metų pabaigos"}${t.parity&&t.parity!=="all"?` · ${t.parity==="even"?"lyginėmis":"nelyginėmis"} savaitėmis`:""}</div></span><button class="x" data-act="delTt" data-v="${t.id}" aria-label="Ištrinti">×</button></div>`).join("")||'<span class="muted small">Tvarkaraštis tuščias.</span>'}</div>
  ${own.length?`<form data-form="addTt" style="display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--line-2);padding-top:12px">
   <b>Pridėti pamoką</b>
   <div class="row"><label class="field" style="flex:1">Grupė<select name="g">${own.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></label><label class="field">Pamokos Nr.<select name="no">${[1,2,3,4,5,6,7,8,9].map(n=>`<option>${n}</option>`).join("")}</select></label></div>
   <div class="row"><label class="field">Savaitės diena<select name="wd">${WDL.map((w,i)=>`<option value="${i}">${w}</option>`).join("")}</select></label><label class="field">Nuo datos<input type="date" name="from" value="${TODAY()<r.from?r.from:TODAY()}" required></label></div>
   <div class="row"><label class="field">Galiojimas<select name="valid"><option value="end">Iki metų pabaigos</option><option value="weeks">Savaičių</option></select></label><label class="field">Savaičių skaičius<input type="number" name="weeks" min="1" max="45" value="4" style="min-width:80px"></label>
   <label class="field">Savaitės<select name="parity"><option value="all">Visomis</option><option value="odd">Nelyginėmis</option><option value="even">Lyginėmis</option></select></label></div>
   <div class="small muted">Lyginės ir nelyginės savaitės skaičiuojamos nuo mokslo metų pradžios, ne pagal kalendorių.</div>
   <div><button class="btn pri">Pridėti pamoką</button></div></form>`:'<div class="note">Neturite grupių.</div>'}</div><div class="dlg-f"><button class="btn" data-act="close">Uždaryti</button></div>`);}

function journalDates(g,pid){const p=core.settings.periods[pid];const lim=addDays(TODAY(),14);const to=p.to<lim?p.to:lim;const d=G(g.id);
  const set=new Set([...occDates(g.id,p.from,to).keys(),...d.lessons.map(l=>l.d),...d.grades.map(x=>x.d),...d.att.map(x=>x.d)]);return [...set].filter(x=>inPeriod(x,pid)).sort();}
VIEWS.t_grid=u=>{
  const gs=teacherGroups(u.id);const gOpts=gs.map(g=>[g.id,gLabel(g)]);ensureIn("gid",gOpts);const g=grp(ui.gid);
  if(!g)return `<h1>Žurnalas</h1><div class="sheet empty">Grupių dar nėra. <button class="btn" data-act="view" data-v="t_groups">Sukurti grupę</button></div>`;
  const pOpts=periodOpts(sysOfGroup(g));ensureIn("pid",pOpts,curPeriod(sysOfGroup(g)));const pid=ui.pid;const d=G(g.id);const dates=journalDates(g,pid);
  const sids=[...g.students].sort(byName);const isk=(g.evalSys||"10")==="isk";
  const head=dates.map(dt=>{const l=d.lessons.find(x=>x.d===dt);const t=l&&l.t;const ro=!canEditDate(g,dt);return `<th class="d ${t==="KD"?"kd":""}" data-act="openLesson" data-g="${g.id}" data-d="${dt}" title="${esc(l&&l.topic||"Pamoka")}${t?" · "+esc(TYPE_NAME[t]):""}${l&&l.hw?" · ND: "+esc(l.hw):""}">${fmtD(dt)}<small>${t||(l&&l.hw?"ND":"&nbsp;")}</small></th>`;}).join("");
  const rows=sids.map(sid=>{const cells=dates.map(dt=>{const gg=d.grades.filter(x=>x.s===sid&&x.d===dt);const a=d.att.find(x=>x.s===sid&&x.d===dt);const nt=d.notes.filter(x=>x.s===sid&&x.d===dt);const ro=!canEditDate(g,dt);
      const at=a?`<span class="att ${a.j?"j":""} ${a.m==="pv"?"p":""}" title="${a.m==="pv"?"Pavėlavo":a.j?esc(JUST_NAME[a.j]):"Nepateisinta"}">${a.m==="pv"?"p":a.j||"n"}</span>`:"";
      return `<td class="c ${ro?"ro":""}" data-act="${ro?"roCell":"cell"}" data-s="${sid}" data-d="${dt}"><div class="cellw">${gg.map(x=>chip(x)).join("")}${at}${nt.map(n=>`<span class="nt" title="${esc(n.text)}">${n.kind==="p"?"👍":"⚠️"}</span>`).join("")}</div></td>`;}).join("");
    const gsP=sGrades(g.id,sid,pid);const av=isk?null:avgOf(gsP);
    return `<tr><td class="stu">${esc(uName(sid))}${progTag(g,sid)}</td>${cells}<td class="avg">${isk?`${gsP.filter(x=>x.v==="isk").length}/${gsP.length}`:fmtAvg(av)}</td></tr>`;}).join("");
  const p=core.settings.periods[pid];const own=g.teacherId===u.id;
  return `<h1>Žurnalas</h1><p class="lead">${esc(subjName(g.subjectId))} · ${KINDS[g.kind]} · ${EVAL_SYS[g.evalSys||"10"]}${own?"":` · vaduojate ${esc(uNameFL(g.teacherId))}`}. Paspaudę datą pereisite į tos pamokos pildymą, paspaudę langelį — pataisysite vieno mokinio įrašus. Užbrūkšniuoti langeliai — tik peržiūrai.</p>
  <div class="bar">${sel("gid",gOpts,ui.gid,"Grupė")}${sel("pid",pOpts,pid,"Laikotarpis")}<label class="field">Papildoma pamoka<input type="date" id="newLesson" value="${inPeriod(TODAY(),pid)?TODAY():p.from}" min="${p.from}" max="${p.to}"></label><button class="btn" data-act="addLesson">Pridėti</button></div>
  <div class="sheet scroll">${dates.length?`<table class="grid"><thead><tr><th class="stu">Mokinys</th>${head}<th class="avg">${isk?"Įsk.":"Vidurkis"}</th></tr></thead><tbody>${rows||`<tr><td class="stu muted" colspan="${dates.length+2}">Grupėje nėra mokinių</td></tr>`}</tbody></table>`:`<div class="empty">Šiame laikotarpyje pamokų nėra. Susidarykite tvarkaraštį arba pridėkite pamoką.</div>`}</div>
  <p class="small muted" style="margin-top:10px">Vidurkis — paprastasis aritmetinis: visi pažymių tipai turi vienodą svorį, „neat.“ neįskaičiuojamas. 👍 — pagyrimas, ⚠️ — pastaba.</p>`;};
function gradeOptions(g){const vals=(g.evalSys||"10")==="isk"?GRADE_VALUES.filter(v=>!/^\d+$/.test(v)):GRADE_VALUES;return vals.map(v=>[v,VLABEL[v]||v]);}
function openCell(gid,sid,dt){const g=grp(gid),d=G(gid);const l=d.lessons.find(x=>x.d===dt);const gs=d.grades.filter(x=>x.s===sid&&x.d===dt);const a=d.att.find(x=>x.s===sid&&x.d===dt);const nt=d.notes.filter(x=>x.s===sid&&x.d===dt);
  const defT=l&&l.t&&TYPE_NAME[l.t]?l.t:"KL";
  openDlg(dlgHead(esc(uNameFL(sid)),`${esc(g.name)} · ${dt}${l&&l.topic?" · "+esc(l.topic):""}`)+`<div class="dlg-b">
   ${gs.length||nt.length||a?`<div class="list">${a?`<div class="li"><span>Lankomumas: <b class="att ${a.m==="pv"?"pv":a.j?"j":""}">${a.m==="pv"?"p":a.j||"n"}</b> ${a.m==="pv"?"— pavėlavo":a.j?"— "+esc(JUST_NAME[a.j]):"— nedalyvavo"}</span><button class="x del" data-act="delAttCell" data-g="${gid}" data-s="${sid}" data-v="${dt}" title="Ištrinti lankomumo žymą" aria-label="Ištrinti lankomumo žymą">×</button></div>`:""}${gs.map(x=>`<div class="li"><span>${chip(x,false)} ${esc(TYPE_NAME[x.t])}${x.c?` <span class="muted">— ${esc(x.c)}</span>`:""}</span><button class="x" data-act="delGrade" data-g="${gid}" data-v="${x.id}" title="Ištrinti pažymį" aria-label="Ištrinti pažymį">×</button></div>`).join("")}${nt.map(n=>`<div class="li"><span>${n.kind==="p"?"👍 Pagyrimas":"⚠️ Pastaba"}: ${esc(n.text)}</span><button class="x" data-act="delNote" data-g="${gid}" data-v="${n.id}" aria-label="Ištrinti">×</button></div>`).join("")}</div>`:""}
   <div><div class="small muted" style="margin-bottom:6px">Naujas įvertinimas</div><div class="pick" id="pickV">${gradeOptions(g).map(([v,n])=>`<button type="button" data-act="pickV" data-v="${v}" aria-pressed="false" title="${esc(VTITLE[v]||"")}">${n}</button>`).join("")}</div></div>
   <div class="row"><label class="field">Tipas<select id="gType">${TYPES.map(([k,n])=>`<option value="${k}" ${k===defT?"selected":""}>${n}</option>`).join("")}</select></label><label class="field" style="flex:1">Komentaras<input id="gCom" placeholder="Nebūtina"></label></div>
   <div><div class="small muted" style="margin-bottom:6px">Lankomumas</div><div class="pick" id="pickA">${[["","Dalyvavo"],["n","n — nedalyvavo"],["pv","p — pavėlavo"]].map(([k,n])=>`<button type="button" style="padding:0 12px" data-act="pickA" data-v="${k}" aria-pressed="${(a?a.m:"")===k}">${n}</button>`).join("")}</div>
    ${a&&a.m==="n"?`<div class="small muted" style="margin-top:6px">${a.j?"Pateisinta: "+esc(JUST_NAME[a.j]):"Nepateisinta. Pateisina klasės vadovas."}</div>`:""}</div>
   <div class="row"><label class="field">Pagyrimas / pastaba<select id="nKind"><option value="">—</option><option value="p">Pagyrimas</option><option value="n">Pastaba</option></select></label><label class="field" style="flex:1">Tekstas<input id="nText"></label></div></div>
   <div class="dlg-f"><button class="btn" data-act="close">Atšaukti</button><button class="btn pri" data-act="saveCell" data-g="${gid}" data-s="${sid}" data-d="${dt}">Išsaugoti</button></div>`);
  dlgState={v:null,a:a?a.m:""};}
function preJust(sid,dt){const p=core.prejust.find(x=>x.s===sid&&dt>=x.from&&dt<=x.to);return p?p.j:null;}
function setAtt(d,sid,dt,m){const i=d.att.findIndex(x=>x.s===sid&&x.d===dt);if(!m){if(i>=0)d.att.splice(i,1);return;}
  if(i>=0){const x=d.att[i];if(x.m!==m){x.m=m;x.j=m==="n"?preJust(sid,dt):null;}}else d.att.push({id:uid(),s:sid,d:dt,m,j:m==="n"?preJust(sid,dt):null});}
function ensureLesson(d,dt,gid){if(!d.lessons.find(l=>l.d===dt)){const oc=occDates(gid,dt,dt);d.lessons.push({d:dt,t:"",topic:"",hw:"",no:oc.get(dt)||null});}}
async function saveCell(gid,sid,dt){const d=G(gid);const u=me();const ops=[];
  if(!d.lessons.find(l=>l.d===dt)){ensureLesson(d,dt,gid);ops.push(DB.lesson(gid,d.lessons.find(l=>l.d===dt)));}
  if(dlgState.v!=null){const x={id:uid(),s:sid,d:dt,t:$("#gType").value,v:parseV(dlgState.v),c:$("#gCom").value.trim(),by:u.id};d.grades.push(x);ops.push(DB.ins("grades",R.grade(gid,x)));}
  const had=!!d.att.find(x=>x.s===sid&&x.d===dt);setAtt(d,sid,dt,dlgState.a);const now=d.att.find(x=>x.s===sid&&x.d===dt);
  if(now)ops.push(DB.att(gid,now));else if(had)ops.push(DB.delAtt(gid,sid,dt));
  const nk=$("#nKind").value,ntx=$("#nText").value.trim();if(nk&&ntx){const n={id:uid(),s:sid,d:dt,kind:nk,text:ntx,by:u.id};d.notes.push(n);ops.push(DB.ins("notes",R.note(gid,n)));}
  closeDlg();render();await Promise.all(ops);}
/* ---- Pamokos langas: pažymių įvedimas kaip TAMO ---- */
function lessonDefType(l){return l&&l.t&&TYPE_NAME[l.t]?l.t:"KL";}
/* ---- Skiltis „Pamokos“: tema, klasės darbas, namų darbai ir pažymiai vienoje vietoje ---- */
let ls={gid:null,dt:null,ro:true,types:{}};let lessonDirty=false;
function openLesson(gid,dt){const g=grp(gid);ui.view="t_journal";ui.gid=gid;ui.pid=(periodsG(g).find(p=>dt>=p.from&&dt<=p.to)||{id:ui.pid}).id;ui.lesson=dt;lessonDirty=false;closeDlg();render();window.scrollTo(0,0);}
function lessonLabel(g,dt){const l=G(g.id).lessons.find(x=>x.d===dt);const no=(l&&l.no)||occDates(g.id,dt,dt).get(dt);return `${dt} ${WD[wdOf(dt)]}${no?`, ${no} pam.`:""}${l&&l.topic?` — ${l.topic}`:""}`;}
VIEWS.t_journal=u=>{
  const gs=teacherGroups(u.id);const gOpts=gs.map(g=>[g.id,gLabel(g)]);ensureIn("gid",gOpts);const g=grp(ui.gid);
  if(!g)return `<h1>Pamokos</h1><div class="sheet empty">Grupių dar nėra. <button class="btn" data-act="view" data-v="t_groups">Sukurti grupę</button></div>`;
  const pOpts=periodOpts(sysOfGroup(g));ensureIn("pid",pOpts,curPeriod(sysOfGroup(g)));const p=core.settings.periods[ui.pid];
  const dates=journalDates(g,ui.pid);
  if(!dates.includes(ui.lesson)){const past=dates.filter(x=>x<=TODAY());ui.lesson=past.length?past[past.length-1]:(dates[0]||null);}
  const dt=ui.lesson;const idx=dates.indexOf(dt);
  const bar=`<div class="bar">${sel("gid",gOpts,ui.gid,"Grupė")}${sel("pid",pOpts,ui.pid,"Laikotarpis")}
    ${dates.length?`<div class="row" style="gap:4px"><button class="btn" data-act="lessonMove" data-v="-1" ${idx<=0?"disabled":""} aria-label="Ankstesnė pamoka">‹</button>${sel("lesson",dates.map(x=>[x,lessonLabel(g,x)]).reverse(),dt,"Pamoka",'style="max-width:340px"')}<button class="btn" data-act="lessonMove" data-v="1" ${idx>=dates.length-1?"disabled":""} aria-label="Kita pamoka">›</button></div>`:""}
    <label class="field">Nauja pamoka<input type="date" id="newLesson" value="${inPeriod(TODAY(),ui.pid)?TODAY():p.from}" min="${p.from}" max="${p.to}"></label><button class="btn" data-act="addLesson">Pridėti</button></div>`;
  if(!dt)return `<h1>Pamokos</h1>${bar}<div class="sheet empty">Šiame laikotarpyje pamokų nėra. Susidarykite tvarkaraštį arba pridėkite pamoką.</div>`;
  const d=G(g.id);const l=d.lessons.find(x=>x.d===dt)||{d:dt,t:"",topic:"",cw:"",hw:""};const ro=!canEditDate(g,dt);const plan=core.plans.find(x=>x.id===g.planId);
  if(ls.gid!==g.id||ls.dt!==dt)ls={gid:g.id,dt,ro,types:{}};else ls.ro=ro;
  const no=l.no||occDates(g.id,dt,dt).get(dt)||"";const cnt=d.grades.filter(x=>x.d===dt).length+d.att.filter(x=>x.d===dt).length;const dis=ro?"disabled":"";
  return `<h1>Pamokos</h1><p class="lead">Pasirinkite pamoką, įrašykite temą, klasės darbą ir namų darbus, žemiau — pažymius ir lankomumą.</p>${bar}
  <div class="sheet pad lesson-page">
   <div class="lesson-h"><div><h2 style="margin:0">${esc(g.name)} · ${dt}</h2><div class="small muted">${WDL[wdOf(dt)]||""}${no?`, ${no} pamoka`:""}${g.teacherId!==u.id?` · vaduojate ${esc(uNameFL(g.teacherId))}`:""}${ro?" · tik peržiūra":""}</div></div>
    ${ro?"":`<button type="button" class="btn warn sm" data-act="delLesson" data-g="${g.id}" data-v="${dt}" ${cnt?`disabled title="Pirma ištrinkite šios pamokos įrašus (${cnt})"`:""}>Ištrinti pamoką</button>`}</div>
   <form data-form="saveLesson" data-g="${g.id}" data-d="${dt}" class="lesson-form">
    <div class="row"><label class="field" style="flex:2">Tema<input name="topic" value="${esc(l.topic||"")}" list="planTopics" ${dis}></label><datalist id="planTopics">${plan?plan.topics.map(t=>`<option value="${esc(t)}">`).join(""):""}</datalist>
    <label class="field">Pamokos tipas<select name="t" ${dis}><option value="">Įprasta pamoka</option>${WORK_TYPES.map(([k,n])=>`<option value="${k}" ${k===l.t?"selected":""}>${n}</option>`).join("")}</select></label></div>
    <label class="field">Klasės darbas<textarea name="cw" rows="2" ${dis} placeholder="Kas buvo atlikta pamokoje">${esc(l.cw||"")}</textarea></label>
    <label class="field">Namų darbai<textarea name="hw" rows="2" ${dis} placeholder="pvz., Vadovėlis p. 45, 3–7 užd.">${esc(l.hw||"")}</textarea></label>
    ${ro?"":`<div><button class="btn pri">Išsaugoti pamoką</button> <span class="small muted" id="lessonDirtyNote"></span></div>`}
   </form>
   <div class="settype">Nustatyti įvertinimų tipą visai grupei:<select class="inp" id="allType" ${dis}>${TYPES.map(([k,n])=>`<option value="${k}" ${k===lessonDefType(l)?"selected":""}>${n}</option>`).join("")}</select><button type="button" class="btn sm" data-act="lgAllType" ${dis}>Keisti</button></div>
   <div class="scroll" id="lsnRows">${lessonRows()}</div>
   <p class="small muted" style="margin:10px 0 0">Pažymiai ir lankomumas išsaugomi iškart paspaudus. Pažymį ar lankomumo žymą ištrinsite paspaudę ×. n — nedalyvavo, p — pavėlavo.</p>
  </div>`;};
function lessonRows(){const{gid,dt,ro}=ls;const g=grp(gid),d=G(gid);const l=d.lessons.find(x=>x.d===dt);const opts=gradeOptions(g);const dis=ro?"disabled":"";
  const rows=[...g.students].sort(byName).map((sid,i)=>{const s=U(sid)||{first:"",last:"(pašalintas)"};const gs=d.grades.filter(x=>x.s===sid&&x.d===dt);const cur=gs[gs.length-1];const a=d.att.find(x=>x.s===sid&&x.d===dt);
    const type=ls.types[sid]||(cur&&cur.t)||lessonDefType(l);
    return `<tr><td class="num muted">${i+1}</td><td class="nm"><b>${esc(s.last)}</b>${progTag(g,sid)}<div>${esc(s.first)}</div></td>
     <td class="gcol">${gs.map(x=>`<span class="gset">${chip(x)}${ro?"":`<button type="button" class="x del" data-act="lgDel" data-v="${x.id}" title="Ištrinti pažymį" aria-label="Ištrinti pažymį ${esc(VLABEL[x.v]||x.v)}">×</button>`}</span>`).join("")}</td>
     <td><div class="gvals">${opts.map(([v,n])=>`<button type="button" class="gv" data-act="lv" data-s="${sid}" data-v="${v}" aria-pressed="${cur&&String(cur.v)===v}" title="${esc(VTITLE[v]||"Pažymys "+v)}" ${dis}>${n}</button>`).join("")}</div></td>
     <td><select class="inp" data-ch="rowType" data-s="${sid}" ${dis} style="min-width:120px">${TYPES.map(([k,n])=>`<option value="${k}" ${k===type?"selected":""}>${n}</option>`).join("")}</select></td>
     <td class="am"><button type="button" class="gv" data-act="la" data-s="${sid}" data-v="n" aria-pressed="${!!a&&a.m==="n"}" title="Nedalyvavo" ${dis}>n</button><button type="button" class="gv" data-act="la" data-s="${sid}" data-v="pv" aria-pressed="${!!a&&a.m==="pv"}" title="Pavėlavo" ${dis}>p</button>${a&&!ro?`<button type="button" class="x del" data-act="laDel" data-s="${sid}" title="Ištrinti lankomumo žymą" aria-label="Ištrinti lankomumo žymą">×</button>`:""}</td></tr>`;}).join("");
  return `<table class="lsn-t"><thead><tr><th class="num">Nr.</th><th>Mokinys</th><th>Pažymys</th><th>Pasirinkite pažymį</th><th>Tipas</th><th>Lankomumas</th></tr></thead><tbody>${rows||`<tr><td colspan="6" class="muted">Grupėje nėra mokinių</td></tr>`}</tbody></table>`;}
function refreshLessonRows(){const box=$("#lsnRows");if(box)box.innerHTML=lessonRows();}
async function ensureLessonSaved(gid,dt){const d=G(gid);if(!d.lessons.find(l=>l.d===dt)){ensureLesson(d,dt,gid);await DB.lesson(gid,d.lessons.find(l=>l.d===dt));}}

/* ---- Laikotarpiai ---- */
function canEditGroup(g){const u=me();if(!u||u.role!=="teacher")return false;if(g.teacherId===u.id)return true;const t=TODAY();return core.subs.some(s=>s.from===g.teacherId&&s.to===u.id&&t>=s.dFrom&&t<=s.dTo);}
VIEWS.t_periods=u=>{
  const gs=teacherGroups(u.id);const gOpts=gs.map(g=>[g.id,gLabel(g)]);ensureIn("gid",gOpts);const g=grp(ui.gid);if(!g)return `<h1>Trimestrai / pusmečiai</h1><div class="sheet empty">Grupių nėra.</div>`;
  const sys=sysOfGroup(g);const pOpts=[...periodOpts(sys),["Y","Metinis įvertinimas"]];ensureIn("lpid",pOpts,curPeriod(sys));const pid=ui.lpid;const d=G(g.id);const sids=[...g.students].sort(byName);const isk=(g.evalSys||"10")==="isk";const can=canEditGroup(g);
  const bar=`<div class="bar">${sel("gid",gOpts,ui.gid,"Grupė")}${sel("lpid",pOpts,pid,"Laikotarpis")}`;
  const btns=(sid,key,sug,cur,dis,system)=>{const opts=system==="isk"?["isk","neisk"]:[1,2,3,4,5,6,7,8,9,10];return `<div class="pg">${sug!=null?`<button class="sug" data-act="setPg" data-s="${sid}" data-k="${key}" data-v="${sug}" aria-pressed="${cur===sug}" ${dis} title="Siūlomas">${VLABEL[sug]??sug}</button>`:""}${opts.filter(v=>v!==sug).map(v=>`<button data-act="setPg" data-s="${sid}" data-k="${key}" data-v="${v}" aria-pressed="${cur===v}" ${dis}>${VLABEL[v]??v}</button>`).join("")}<button data-act="setPg" data-s="${sid}" data-k="${key}" data-v="neat" aria-pressed="${cur==="neat"}" ${dis} style="padding:0 8px">neat.</button></div>`;};
  if(pid==="Y"){const ps=periodsG(g);const lastP=core.settings.periods[ps[ps.length-1].id];const dis=can&&lastP.active?"":"disabled";
    const rows=sids.map(sid=>{const pg=d.pg[sid]||{};const an=annual(g,sid);const cur=pg.Y;
      return `<tr><td>${esc(uName(sid))}${progTag(g,sid)}</td>${ps.map(p=>`<td class="num">${vchip(pg[p.id])}</td>`).join("")}<td class="num">${fmtAvg(an.avg)}</td><td>${btns(sid,"Y",an.sug,cur,dis,g.evalSys||"10")}</td><td class="num">${vchip(cur)}</td><td>${cur!=null&&!dis?`<button class="x" data-act="delPg" data-s="${sid}" data-k="Y" aria-label="Ištrinti">🗑</button>`:""}</td></tr>`;}).join("");
    return `<h1>Metinis įvertinimas</h1><p class="lead">Metinis = laikotarpių galutinių pažymių vidurkis, apvalinamas nuo ,50. Įvesti galima, kai vyksta paskutinio laikotarpio vertinimas.</p>${bar}<button class="btn go" data-act="autoPg" data-v="Y" ${dis}>Atlikti automatinį vertinimą</button></div>
    ${dis?`<div class="note">${can?"Mokyklos administratorius dar neaktyvavo paskutinio laikotarpio vertinimo.":"Šios grupės laikotarpių vertinimų keisti negalite."}</div>`:""}
    <div class="formula">Metinis = (${ps.map(p=>p.name).join(" + ")}) / ${ps.length}</div>
    <div class="sheet scroll" style="margin-top:12px"><table><thead><tr><th>Mokinys</th>${ps.map(p=>`<th class="num">${p.name}</th>`).join("")}<th class="num">Vidurkis</th><th>Įvertinimas</th><th class="num">Galutinis</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;}
  const p=core.settings.periods[pid];const extraName=(g.extra||{})[pid];const tab=ui.tab==="x"&&extraName?"x":"m";
  if(!p.active)return `<h1>Trimestrai / pusmečiai</h1>${bar}</div><div class="note">Mokyklos TAMO administratorius dar neaktyvavo šio laikotarpio vertinimo.</div>`;
  const dis=can?"":"disabled";const thrTxt={0.5:"matematiškai (nuo ,50)",0.45:"mokinio naudai (nuo ,45)",0.4:"mokinio naudai (nuo ,40)"}[core.settings.rounding];
  const tabs=extraName?`<div class="tabs"><button aria-selected="${tab==="m"}" data-act="tab" data-v="m">Pagrindinis vertinimas</button><button aria-selected="${tab==="x"}" data-act="tab" data-v="x">${esc(extraName)}</button></div>`:"";
  if(tab==="x"){const rows=sids.map(sid=>{const cur=(d.pg[sid]||{})["X"+pid];return `<tr><td>${esc(uName(sid))}</td><td>${btns(sid,"X"+pid,null,cur,dis,g.extraSys||"10")}</td><td class="num">${vchip(cur)}</td><td>${cur!=null&&can?`<button class="x" data-act="delPg" data-s="${sid}" data-k="X${pid}" aria-label="Ištrinti">🗑</button>`:""}</td></tr>`;}).join("");
    return `<h1>Trimestrai / pusmečiai</h1><p class="lead">${esc(extraName)} — papildomas vertinimo tipas. Į metinį vidurkį neįtraukiamas.</p>${bar}</div>${tabs}<div class="sheet scroll"><table><thead><tr><th>Mokinys</th><th>Įvertinimas</th><th class="num">Galutinis</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;}
  const rows=sids.map(sid=>{const gs=sGrades(g.id,sid,pid);const av=avgOf(gs);const sug=suggest(g,sid,pid);const cur=(d.pg[sid]||{})[pid];const neat=gs.filter(x=>x.v==="neat").length;
    return `<tr><td>${esc(uName(sid))}${progTag(g,sid)}</td><td><div class="chips">${gs.map(x=>chip(x)).join("")||'<span class="muted small">nėra pažymių</span>'}</div></td>
    <td class="num">${isk?"":`<b>${fmtAvg(av)}</b>`}<div class="small muted">${isk?gs.length:numeric(gs).length} įv.${neat?`, ${neat} neat.`:""}</div></td><td>${btns(sid,pid,sug,cur,dis,g.evalSys||"10")}</td><td class="num">${vchip(cur)}</td><td>${cur!=null&&can?`<button class="x" data-act="delPg" data-s="${sid}" data-k="${pid}" aria-label="Ištrinti">🗑</button>`:""}</td></tr>`;}).join("");
  return `<h1>Trimestrai / pusmečiai</h1><p class="lead">${PNAME[pid]}: ${p.from} – ${p.to}. ${isk?"Įskaitų sistema.":`Siūlomas pažymys (žalias) — vidurkis, suapvalintas ${thrTxt}.`} Paspaudus mygtuką vertinimas išsaugomas iškart.</p>
  ${bar}<button class="btn go" data-act="autoPg" data-v="${pid}" ${dis}>Atlikti automatinį vertinimą</button></div>${tabs}
  <div class="sheet scroll"><table><thead><tr><th>Mokinys</th><th>Pažymiai</th><th class="num">${isk?"Įvertinimų":"Vidurkis"}</th><th>Įvertinimas</th><th class="num">Galutinis</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;};

/* ---- Grupės ---- */
VIEWS.t_groups=u=>{const own=teacherGroups(u.id,false);
  const rows=own.map(g=>{const d=G(g.id);return `<tr><td><b>${esc(g.name)}</b></td><td>${esc(subjName(g.subjectId))}</td><td>${KINDS[g.kind]}</td><td>${esc(g.level||"—")}</td><td class="num">${g.hours}</td><td class="num">${g.students.length}</td><td>${g.planId?esc((core.plans.find(p=>p.id===g.planId)||{}).name||""):'<span class="muted">—</span>'}</td><td class="num">${d.grades.length}</td>
   <td style="white-space:nowrap"><button class="btn sm" data-act="groupDlg" data-v="${g.id}">Redaguoti</button> <button class="btn sm warn" data-act="delGroup" data-v="${g.id}">Trinti</button></td></tr>`;}).join("");
  return `<h1>Grupės</h1><p class="lead">Grupę sudaro dalykas iš mokyklos sąrašo ir mokiniai. Pogrupiai skelia klasę (užsienio kalboms, IT, doriniam ugdymui), srautas jungia skirtingų klasių mokinius. Kiekvienos grupės vidurkiai skaičiuojami atskirai. Mokiniui atvykus iš kitos mokyklos, jo atsineštus pažymius įrašykite su tipu „Pažymys iš kitos mokyklos“.</p>
  <div class="bar"><button class="btn pri" data-act="groupDlg" data-v="">Sukurti naują grupę</button></div>
  <div class="sheet scroll">${rows?`<table><thead><tr><th>Pavadinimas</th><th>Dalykas</th><th>Tipas</th><th>Lygis</th><th class="num">Val./sav.</th><th class="num">Mokinių</th><th>Teminis planas</th><th class="num">Įvertinimų</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty">Grupių dar nėra.</div>`}</div>`;};
function groupDlg(id){const u=me();if(!core.subjects.length){toast("Mokyklos dalykų sąrašas tuščias — kreipkitės į administratorių");return;}
  const g=id?grp(id):{id:"",name:"",subjectId:core.subjects[0].id,kind:"klase",level:"",hours:2,students:[],programs:{},planId:""};
  const byCls=[...core.classes].sort((a,b)=>lsort(a.name,b.name)).map(c=>{const ss=classStudents(c.id);if(!ss.length)return"";
    return `<div style="margin-top:8px"><b class="small">${esc(c.name)}</b> <button type="button" class="btn sm" data-act="selCls" data-v="${c.id}">Pažymėti visus</button><div class="chk">${ss.map(s=>{
      const other=core.groups.find(o=>o.id!==g.id&&o.subjectId===g.subjectId&&o.students.includes(s.id));
      return `<label><input type="checkbox" name="gs" value="${s.id}" data-cls="${c.id}" ${g.students.includes(s.id)?"checked":""}>${esc(s.last)} ${esc(s.first)}${other?` <span title="Jau įtrauktas į grupę su tuo pačiu dalyku: ${esc(other.name)}" style="color:var(--amber)">●</span>`:""}
      <select name="gp_${s.id}" style="margin-left:auto;font-size:12px;padding:1px 2px" title="Programa"><option value="">—</option><option value="I" ${g.programs?.[s.id]==="I"?"selected":""}>I</option><option value="P" ${g.programs?.[s.id]==="P"?"selected":""}>P</option></select></label>`;}).join("")}</div></div>`;}).join("");
  const plans=core.plans.filter(p=>p.ownerId===u.id);
  openDlg(dlgHead(id?"Redaguoti grupę":"Sukurti naują grupę")+`<form data-form="saveGroup" data-v="${g.id}"><div class="dlg-b">
   <div class="row"><label class="field" style="flex:1">Dalykas<select name="subjectId">${[...core.subjects].sort((a,b)=>lsort(a.name,b.name)).map(s=>`<option value="${s.id}" ${s.id===g.subjectId?"selected":""}>${s.parentId?esc(subjName(s.parentId))+" › ":""}${esc(s.name)}</option>`).join("")}</select></label><label class="field" style="flex:1">Grupės pavadinimas<input name="name" required value="${esc(g.name)}" placeholder="pvz., 8A Fizika"></label></div>
   <div class="row"><label class="field">Grupės tipas<select name="kind">${Object.entries(KINDS).map(([k,n])=>`<option value="${k}" ${k===g.kind?"selected":""}>${n}</option>`).join("")}</select></label>
   <label class="field">Mokymo lygis<select name="level"><option value="">—</option>${["A","B","Bendrasis","Išplėstinis"].map(l=>`<option ${l===g.level?"selected":""}>${l}</option>`).join("")}</select></label>
   <label class="field">Val. per savaitę<input name="hours" type="number" min="1" max="10" value="${g.hours}" style="min-width:80px"></label>
   <label class="field">Teminis planas<select name="planId"><option value="">—</option>${plans.map(p=>`<option value="${p.id}" ${p.id===g.planId?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label></div>
   <div><div class="small muted">Mokiniai. ● — jau yra kitoje grupėje su tuo pačiu dalyku; I — individualizuota, P — pritaikyta programa.</div>${byCls||'<div class="muted small">Mokyklos mokinių sąrašas tuščias.</div>'}</div></div>
   <div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Išsaugoti</button></div></form>`,true);}

/* ---- Teminiai planai ---- */
VIEWS.t_plans=u=>{const list=core.plans.filter(p=>p.ownerId===u.id);
  return `<h1>Pamokų teminiai planai</h1><p class="lead">Sudarykite temų sąrašą ir priskirkite jį grupei — pildant pamoką temos bus siūlomos automatiškai. Tą patį planą galima naudoti kelioms grupėms.</p>
  <div class="bar"><button class="btn pri" data-act="planDlg" data-v="">Sukurti</button></div>
  <div class="list">${list.map(p=>`<div class="li"><span><b>${esc(p.name)}</b> · ${esc(subjName(p.subjectId))} · ${p.topics.length} temų<div class="small muted">${esc(p.desc||"")} ${core.groups.filter(g=>g.planId===p.id).map(g=>esc(g.name)).join(", ")}</div></span><span style="white-space:nowrap"><button class="btn sm" data-act="planDlg" data-v="${p.id}">Redaguoti</button> <button class="x" data-act="delPlan" data-v="${p.id}" aria-label="Ištrinti">🗑</button></span></div>`).join("")||'<div class="sheet empty">Teminių planų nėra.</div>'}</div>`;};
function planDlg(id){const p=id?core.plans.find(x=>x.id===id):{name:"",desc:"",subjectId:(core.subjects[0]||{}).id,topics:[]};
  openDlg(dlgHead(id?"Redaguoti teminį planą":"Naujas teminis planas")+`<form data-form="savePlan" data-v="${id||""}"><div class="dlg-b"><label class="field">Pavadinimas<input name="name" required value="${esc(p.name)}"></label><label class="field">Aprašymas<input name="desc" value="${esc(p.desc||"")}"></label>
  <label class="field">Dalykas<select name="subjectId">${core.subjects.map(s=>`<option value="${s.id}" ${s.id===p.subjectId?"selected":""}>${esc(s.name)}</option>`).join("")}</select></label>
  <label class="field">Temos (po vieną eilutėje)<textarea name="topics" style="min-height:200px">${esc(p.topics.join("\n"))}</textarea></label></div>
  <div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Išsaugoti</button></div></form>`);}

/* ---- Atsiskaitomieji darbai ---- */
function conflicts(gid,d,exceptId){const g=grp(gid);if(!g)return[];const set=new Set(g.students);const res=[];
  core.works.forEach(w=>{if(w.id===exceptId||w.d!==d||w.g===gid)return;const o=grp(w.g);if(o&&o.students.some(s=>set.has(s)))res.push({name:`${o.name} (${TYPE_NAME[w.t]})`,n:o.students.filter(s=>set.has(s)).length});});
  core.groups.forEach(o=>{if(o.id===gid)return;const l=G(o.id).lessons.find(x=>x.d===d&&x.t);if(l&&o.students.some(s=>set.has(s))&&!core.works.find(w=>w.g===o.id&&w.d===d))res.push({name:`${o.name} (${TYPE_NAME[l.t]})`,n:o.students.filter(s=>set.has(s)).length});});return res;}
VIEWS.t_works=u=>{const own=teacherGroups(u.id);const gOpts=own.map(g=>[g.id,g.name]);ensureIn("gid",gOpts);
  const list=core.works.filter(w=>own.some(g=>g.id===w.g)).sort((a,b)=>lsort(a.d,b.d));
  return `<h1>Atsiskaitomieji darbai</h1><p class="lead">Įveskite atsiskaitymo datą ir grupę, paspauskite „Peržiūrėti“ — pamatysite, ar tą dieną tie patys mokiniai neturi kito atsiskaitymo. Išsaugojus pamoka pažymima atsiskaitomojo darbo tipu, o mokiniai ir tėvai mato jį iš anksto.</p>
  ${own.length?`<div class="sheet pad"><div class="bar" style="margin:0"><label class="field">Data<input type="date" id="wDate" value="${TODAY()}"></label>${sel("gid",gOpts,ui.gid,"Grupė")}
  <label class="field">Tipas<select id="wType">${WORK_TYPES.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</select></label><label class="field" style="flex:1">Tema<input id="wTopic"></label>
  <button class="btn" data-act="checkWork">Peržiūrėti</button><button class="btn pri" data-act="saveWork">Išsaugoti</button></div><div id="workCheck"></div></div>`:'<div class="sheet empty">Grupių nėra.</div>'}
  <h2>Suplanuoti darbai</h2><div class="sheet scroll">${list.length?`<table><thead><tr><th>Data</th><th>Grupė</th><th>Tipas</th><th>Tema</th><th>Kiti atsiskaitymai</th><th></th></tr></thead><tbody>${list.map(w=>{const c=conflicts(w.g,w.d,w.id);return `<tr><td>${w.d}</td><td>${esc(grp(w.g).name)}</td><td>${esc(TYPE_NAME[w.t])}</td><td>${esc(w.topic)}</td><td>${c.length?`<span style="color:var(--amber)" title="${esc(c.map(x=>x.name).join(", "))}">Sutampa: ${c.length}</span>`:'<span class="muted">—</span>'}</td><td><button class="x" data-act="delWork" data-v="${w.id}" aria-label="Ištrinti">×</button></td></tr>`;}).join("")}</tbody></table>`:`<div class="empty">Suplanuotų darbų nėra.</div>`}</div>`;};

/* ---- Socialinė-pilietinė veikla ---- */
VIEWS.t_soc=u=>{const list=social.list.filter(a=>a.by===u.id).sort((a,b)=>lsort(b.d,a.d));
  return `<h1>Socialinė-pilietinė veikla</h1><p class="lead">Registruokite veiklą ir mokinių valandas. Jei visų indėlis vienodas, valandos priskiriamos visiems; kitaip įrašomos kiekvienam atskirai. Ataskaitas formuoja klasės vadovas.</p>
  <div class="bar"><button class="btn pri" data-act="socDlg">+ Naujas įvertinimas</button></div>
  <div class="sheet scroll">${list.length?`<table><thead><tr><th>Data</th><th>Veiklos tipas</th><th>Veikla</th><th>Partneris</th><th class="num">Mokinių</th><th class="num">Valandų</th><th></th></tr></thead><tbody>${list.map(a=>`<tr><td>${a.d}</td><td>${esc(a.type)}</td><td>${esc(a.activity)}${a.comment?`<div class="small muted">${esc(a.comment)}</div>`:""}</td><td>${esc(a.partner)}</td><td class="num">${Object.keys(a.hours).length}</td><td class="num">${Object.values(a.hours).reduce((x,y)=>x+y,0)}</td><td><button class="x" data-act="delSoc" data-v="${a.id}" aria-label="Ištrinti">×</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">Įrašų nėra.</div>`}</div>`;};
function socDlg(){const u=me();const sids=new Set();teacherGroups(u.id).forEach(g=>g.students.forEach(s=>sids.add(s)));headClassesOf(u.id).forEach(c=>classStudents(c.id).forEach(s=>sids.add(s.id)));
  const list=[...sids].filter(U).sort(byName);
  openDlg(dlgHead("Socialinės-pilietinės veiklos įvertinimas")+`<form data-form="saveSoc"><div class="dlg-b">
   <div class="row"><label class="field" style="flex:1">Veiklos tipas<select name="type">${SOC_TYPES.map(t=>`<option>${t}</option>`).join("")}</select></label><label class="field" style="flex:1">Soc. partneris<input name="partner" value="${esc(core.settings.school)}"></label></div>
   <label class="field">Veikla<input name="activity" required placeholder="pvz., Mokyklos kiemo tvarkymas"></label><label class="field">Komentaras<input name="comment"></label>
   <div class="row"><label class="field">Data<input type="date" name="d" value="${TODAY()}" required></label><label class="field">Valandos<input type="number" name="hours" min="0.5" step="0.5" value="2" style="min-width:80px"></label><label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" name="equal" checked> Visų vienodas indėlis</label></div>
   <div class="small muted">Jei indėlis nevienodas, nuimkite žymą ir įrašykite valandas prie kiekvieno mokinio.</div>
   <div class="chk">${list.map(s=>`<label><input type="checkbox" name="st" value="${s}">${esc(uName(s))} <span class="muted small">${esc(clsName(U(s).classId))}</span><input type="number" name="h_${s}" min="0" step="0.5" style="width:60px;margin-left:auto" class="inp" placeholder="val."></label>`).join("")}</div></div>
   <div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Išsaugoti</button></div></form>`,true);}
VIEWS.t_subs=u=>{const to=core.subs.filter(s=>s.to===u.id),from=core.subs.filter(s=>s.from===u.id);
  return `<h1>Pavadavimai</h1><p class="lead">Kai jus paskiria vaduoti, vaduojamo mokytojo grupės atsiranda jūsų tvarkaraštyje ir pamokų sąraše. Pildyti galite tik nurodyto laikotarpio pamokas.</p>
  <h2>Jūs vaduojate</h2><div class="list">${to.map(s=>`<div class="li"><span><b>${esc(uNameFL(s.from))}</b> · ${s.dFrom} – ${s.dTo}<div class="small muted">${teacherGroups(s.from,false).map(g=>esc(g.name)).join(", ")}</div></span></div>`).join("")||'<span class="muted small">Pavadavimų nėra.</span>'}</div>
  <h2>Jus vaduoja</h2><div class="list">${from.map(s=>`<div class="li"><span><b>${esc(uNameFL(s.to))}</b> · ${s.dFrom} – ${s.dTo}</span></div>`).join("")||'<span class="muted small">Pavadavimų nėra.</span>'}</div>`;};

/* ================= KLASĖS VADOVAS ================= */
function headClassSel(u){const hc=headClassesOf(u.id).sort((a,b)=>lsort(a.name,b.name));const o=hc.map(c=>[c.id,c.name]);ensureIn("cls",o);return sel("cls",o,ui.cls,"Klasė");}
function allAttN(sid){const out=[];studentGroups(sid).forEach(g=>G(g.id).att.forEach(a=>{if(a.s===sid&&a.m==="n")out.push({...a,g:g.id});}));return out;}
VIEWS.h_just=u=>{const cs=headClassSel(u);if(!ui.cls)return "<h1>N pateisinimas</h1>";const ss=classStudents(ui.cls);const so=ss.map(s=>[s.id,`${s.last} ${s.first}`]);ensureIn("sid",so);
  const y=core.settings.yearStart;const months=[];for(let i=0;i<10;i++){const m=(8+i)%12;months.push(`${m<8?y+1:y}-${String(m+1).padStart(2,"0")}`);}
  if(!months.includes(ui.month)){const t=TODAY().slice(0,7);ui.month=months.includes(t)?t:months[0];}
  const att=ui.sid?allAttN(ui.sid):[];const tot=att.length,just=att.filter(a=>a.j).length;
  const[yy,mm]=ui.month.split("-").map(Number);const first=`${ui.month}-01`;const days=new Date(Date.UTC(yy,mm,0)).getUTCDate();const off=wdOf(first);
  let cells=WD.map(w=>`<div class="h">${w}</div>`).join("")+"<div></div>".repeat(off);
  for(let dd=1;dd<=days;dd++){const d=`${ui.month}-${String(dd).padStart(2,"0")}`;const da=att.filter(a=>a.d===d);const un=da.filter(a=>!a.j).length;const pre=ui.sid&&preJust(ui.sid,d);const codes=[...new Set(da.filter(a=>a.j).map(a=>a.j))];const wk=wdOf(d)>=5||isHoliday(d);
    cells+=da.length?`<button class="day ${un?"bad":"okj"}" data-act="dayJust" data-v="${d}"><span>${dd}</span><b>${un?`${da.length} !`:`${da.length} ${codes.length>1?"n*":codes[0]}`}</b></button>`:`<div class="day ${wk?"off":""}"><span>${dd}</span><b class="muted">${pre?"–":""}</b></div>`;}
  const summary=ss.map(s=>{const a=allAttN(s.id);const un=a.filter(x=>!x.j).length;return `<tr><td><a href="#" data-act="pickSid" data-v="${s.id}">${esc(s.last)} ${esc(s.first)}</a></td><td class="num">${a.length}</td><td class="num">${a.length-un}</td><td class="num" style="${un?"color:var(--pen);font-weight:700":""}">${un}</td></tr>`;}).join("");
  return `<h1>N pateisinimas</h1><p class="lead">Raudoni langeliai su šauktuku — nepateisintos pamokos, pateisintos rodo priežasties sutrumpinimą, brūkšnys — iš anksto pateisinta diena. Skaičius rodo, kiek tą dieną praleista pamokų.</p>
  <div class="bar">${cs}${sel("sid",so,ui.sid,"Mokinys")}${sel("month",months.map(m=>[m,`${m.slice(0,4)} ${MONTHS[+m.slice(5)-1]}`]),ui.month,"Mėnuo")}<button class="btn go" data-act="groupJust">Pateisinti mokinių grupei / iš anksto</button></div>
  <div class="stats"><div><b>${tot}</b>praleista pamokų</div><div><b>${just}</b>pateisinta</div><div><b class="${tot-just?"bad":""}">${tot-just}</b>nepateisinta</div></div>
  <div class="cal">${cells}</div>
  <h2>Sutrumpinimai</h2><div class="small" style="columns:2 260px">${JUST.map(([k,n])=>`<div><b>${k}</b> — ${n}</div>`).join("")}<div><b>n*</b> — keli pateisinimai vienoje dienoje</div></div>
  <h2>Klasės praleistos pamokos</h2><div class="sheet scroll"><table><thead><tr><th>Mokinys</th><th class="num">Praleista</th><th class="num">Pateisinta</th><th class="num">Nepateisinta</th></tr></thead><tbody>${summary}</tbody></table></div>`;};
function openDayJust(d){const att=allAttN(ui.sid).filter(a=>a.d===d);
  openDlg(dlgHead("Pateisinti pamokas",`${esc(uNameFL(ui.sid))} · ${d}`)+`<div class="dlg-b"><div class="list">${att.map(a=>`<label class="li"><span><input type="checkbox" name="ja" value="${a.id}" ${a.j?"":"checked"}> ${esc(grp(a.g).name)}</span><span class="att ${a.j?"j":""}">${a.j||"!"}</span></label>`).join("")}</div>
  <label class="field">Iki datos (kelių dienų pateisinimas)<input type="date" id="jTo" value="${d}" min="${d}"></label>
  <label class="field">Priežastis<select id="jCode">${JUST.map(([k,n])=>`<option value="${k}">${k} — ${n}</option>`).join("")}</select></label>
  <div class="small muted">Nurodžius vėlesnę datą pateisinamos visos to laikotarpio praleistos pamokos.</div></div>
  <div class="dlg-f"><button class="btn warn" data-act="unjust" data-v="${d}">Panaikinti pateisinimą</button><button class="btn" data-act="close">Atšaukti</button><button class="btn pri" data-act="doJust" data-v="${d}">Pateisinti pamokas</button></div>`);}
function openGroupJust(){const ss=classStudents(ui.cls);
  openDlg(dlgHead("Pateisinti mokinių grupei / iš anksto")+`<div class="dlg-b"><div class="chk">${ss.map(s=>`<label><input type="checkbox" name="js" value="${s.id}" ${s.id===ui.sid?"checked":""}>${esc(s.last)} ${esc(s.first)}</label>`).join("")}</div>
  <div class="row"><label class="field">Nuo<input type="date" id="gjFrom" value="${TODAY()}"></label><label class="field">Iki<input type="date" id="gjTo" value="${TODAY()}"></label></div>
  <label class="field">Priežastis<select id="gjCode">${JUST.map(([k,n])=>`<option value="${k}">${k} — ${n}</option>`).join("")}</select></label>
  <div class="small muted">Jau įrašytos praleistos pamokos pateisinamos iškart, būsimos — automatiškai, kai mokytojas pažymės „n“.</div>
  ${core.prejust.filter(p=>ss.some(s=>s.id===p.s)).length?`<div class="list">${core.prejust.filter(p=>ss.some(s=>s.id===p.s)).map(p=>`<div class="li"><span>${esc(uName(p.s))}: ${p.from} – ${p.to} · ${p.j}</span><button class="x" data-act="delPre" data-v="${p.id}" aria-label="Ištrinti">×</button></div>`).join("")}</div>`:""}</div>
  <div class="dlg-f"><button class="btn" data-act="close">Atšaukti</button><button class="btn pri" data-act="doGroupJust">Pateisinti pamokas</button></div>`);}
VIEWS.h_summary=u=>{const cs=headClassSel(u);if(!ui.cls)return"";const sys=sysOfClass(ui.cls);const pOpts=periodOpts(sys,true);ensureIn("pid",pOpts,curPeriod(sys));
  const ss=classStudents(ui.cls);const gs=core.groups.filter(g=>g.students.some(s=>ss.find(x=>x.id===s)));const subs=[...new Set(gs.map(g=>g.subjectId))].sort((a,b)=>lsort(subjName(a),subjName(b)));
  const rows=ss.map(s=>{const avs=[];const cells=subs.map(sb=>{const g=gs.find(x=>x.subjectId===sb&&x.students.includes(s.id));if(!g)return"<td></td>";const a=avgOf(sGrades(g.id,s.id,ui.pid));if(a!=null)avs.push(a);return `<td class="num">${a==null?"—":fmtAvg(a)}</td>`;}).join("");
    const t=avs.length?avs.reduce((x,y)=>x+y,0)/avs.length:null;return `<tr><td>${esc(s.last)} ${esc(s.first)}</td>${cells}<td class="num"><b>${fmtAvg(t)}</b></td></tr>`;}).join("");
  return `<h1>Klasės suvestinė</h1><p class="lead">Einamųjų pažymių vidurkiai pagal dalykus. Kiekvienos grupės vidurkis skaičiuojamas atskirai; paskutinis stulpelis — dalykų vidurkių vidurkis.</p>
  <div class="bar">${cs}${sel("pid",pOpts,ui.pid,"Laikotarpis")}</div><div class="sheet scroll"><table><thead><tr><th>Mokinys</th>${subs.map(s=>`<th class="num">${esc(subjName(s))}</th>`).join("")}<th class="num">Bendras</th></tr></thead><tbody>${rows}</tbody></table></div>
  <h2>Išvestiniai įvertinimai</h2>${reportSummary(ui.cls,ui.pid).html}`;};
VIEWS.h_keys=u=>{const cs=headClassSel(u);if(!ui.cls)return"";const ss=classStudents(ui.cls);
  return `<h1>Tėvų raktai</h1><p class="lead">Tėvai registruojasi su tėvų raktu. Jei vaiką stebi keli tėvai, sugeneruokite papildomą raktą. Mokinio raktas skirtas pačiam mokiniui.</p><div class="bar">${cs}<button class="btn" data-act="print">Spausdinti</button></div>
  <div class="sheet scroll"><table><thead><tr><th>Mokinys</th><th>Mokinio raktas</th><th>Tėvų raktai</th><th></th></tr></thead><tbody>${ss.map(s=>`<tr><td>${esc(s.last)} ${esc(s.first)}</td><td>${s.login?'<span class="tag ok">užsiregistravo</span>':`<span class="mono">${esc(s.key)}</span>`}</td><td>${(s.parentKeys||[]).map(p=>p.usedBy?`<span class="tag ok">${esc(uNameFL(p.usedBy))}</span>`:`<div class="mono">${esc(p.key)}</div>`).join("")}</td><td class="noprint"><button class="btn sm" data-act="newParentKey" data-v="${s.id}">+ Tėvų raktas</button></td></tr>`).join("")}</tbody></table></div>`;};
VIEWS.h_soc=u=>{const cs=headClassSel(u);if(!ui.cls)return"";const ss=classStudents(ui.cls);const lvl=(cls(ui.cls)||{}).level||0;
  return `<h1>Socialinė-pilietinė veikla</h1><p class="lead">Klasės mokinių sukauptos valandos.${lvl>=11?" 11–12 klasių mokiniai per dvejus metus turi sukaupti ne mažiau kaip 70 valandų.":""}</p><div class="bar">${cs}</div>
  <div class="sheet scroll"><table><thead><tr><th>Mokinys</th><th class="num">Veiklų</th><th class="num">Valandų</th>${lvl>=11?"<th>Iki 70 val.</th>":""}</tr></thead><tbody>${ss.map(s=>{const a=social.list.filter(x=>x.hours[s.id]);const h=a.reduce((t,x)=>t+x.hours[s.id],0);return `<tr><td><a href="#" data-act="socStudent" data-v="${s.id}">${esc(s.last)} ${esc(s.first)}</a></td><td class="num">${a.length}</td><td class="num"><b>${h}</b></td>${lvl>=11?`<td>${h>=70?'<span class="tag ok">Įvykdyta</span>':`liko ${70-h}`}</td>`:""}</tr>`;}).join("")}</tbody></table></div>`;};
