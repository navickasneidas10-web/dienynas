/* Dienynas — naudotojo veiksmų apdorojimas (paspaudimai, formos) */
$("#dlg").addEventListener("close",()=>{dialogOpen=false;if(pendingRender)render();});
$("#dlg").addEventListener("click",e=>{if(e.target.id==="dlg")closeDlg();});
const UIKEYS=["lesson","gid","pid","lpid","cls","sid","month","stPid","tab","repCls","repPid","ttTeacher","evalCls","child"];

document.addEventListener("change",e=>{const el=e.target.closest("[data-ch]");if(!el)return;const k=el.dataset.ch,v=el.value;
  if(UIKEYS.includes(k)){if(lessonDirty&&ui.view==="t_journal"&&!confirm("Pamokos informacija neišsaugota. Tęsti neišsaugojus?")){render();return;}lessonDirty=false;ui[k]=v;if(k==="gid"&&ui.view==="t_periods")ui.tab=null;render();return;}
  if(k==="week"){if(v)ui.week=v;render();return;}
  if(k==="rowType"){const{gid,dt}=ls;const sid=el.dataset.s;ls.types[sid]=v;const ids=[];G(gid).grades.forEach(x=>{if(x.s===sid&&x.d===dt&&x.t!==v){x.t=v;ids.push(x.id);}});
    refreshLessonRows();if(ids.length)Promise.all(ids.map(id=>DB.upd("grades",{type:v},{id})));return;}
  if(k==="evalSys"){const g=grp(el.dataset.g);g.evalSys=v;DB.upd("groups",{eval_sys:v},{id:g.id}).then(r=>r&&toast("Vertinimo sistema pakeista"));return;}
  if(k==="extraName"){const g=grp(el.dataset.g);g.extra??={};const t=v.trim();if(t)g.extra[el.dataset.p]=t;else delete g.extra[el.dataset.p];DB.upd("groups",{extra:g.extra},{id:g.id}).then(r=>r&&toast("Išsaugota"));return;}
});

document.addEventListener("click",async e=>{
  const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act,v=el.dataset.v;if(el.tagName==="A")e.preventDefault();const u=me();
  switch(a){
  case"view":if(lessonDirty&&ui.view==="t_journal"&&v!=="t_journal"&&!confirm("Pamokos informacija neišsaugota. Tęsti neišsaugojus?"))return;lessonDirty=false;ui.view=v;ui.tab=null;render();window.scrollTo(0,0);break;
  case"logout":closeDlg();await logout();break;
  case"close":closeDlg();break;
  case"authTab":authUi.tab=v;authUi.err="";authUi.info="";authUi.keyInfo=null;renderAuth();break;
  case"keyReset":authUi.keyInfo=null;authUi.err="";renderAuth();break;
  case"forgot":authUi.err="";authUi.info="Kreipkitės į mokyklos administratorių — jis nustatys laikiną slaptažodį, kurį prisijungę pasikeisite.";renderAuth();break;
  case"wipe":if(!confirm("Ištrinti VISUS dienyno duomenis, išskyrus jūsų administratoriaus paskyrą?"))return;if(await DB.rpc("wipe_school")){await loadAll();render();toast("Duomenys ištrinti");}break;
  case"exportAll":exportFile(`dienynas-${realToday()}.json`,JSON.stringify({core,users,gd,social,msgs},null,1),"application/json");break;

  /* ---------- administratorius ---------- */
  case"classDlg":classDlg(v);break;
  case"delClass":if(classStudents(v).length){toast("Klasėje yra mokinių — pirma perkelkite arba pašalinkite juos");return;}if(!confirm("Šalinti klasę?"))return;
    core.classes=core.classes.filter(c=>c.id!==v);render();await DB.del("classes",{id:v});break;
  case"studentDlg":studentDlg(v);break;
  case"delStudent":{if(!confirm(`Šalinti mokinį ${uNameFL(v)}? Bus ištrinti ir visi jo pažymiai bei lankomumas.`))return;delete users[v];core.groups.forEach(g=>{g.students=g.students.filter(s=>s!==v);});render();await DB.del("people",{id:v});break;}
  case"importDlg":openDlg(dlgHead("Įkelti mokinių sąrašą")+`<form data-form="importStudents"><div class="dlg-b"><p class="small muted" style="margin:0">Įklijuokite eilutes iš Excel arba įrašykite formatu <span class="mono">Vardas;Pavardė;Klasė</span>. Neegzistuojančios klasės bus sukurtos automatiškai.</p><label class="field">Sąrašas<textarea name="data" required style="min-height:220px" placeholder="Ugnė;Kazlauskaitė;8A&#10;Matas;Petrauskas;8A"></textarea></label></div><div class="dlg-f"><button type="button" class="btn" data-act="close">Atšaukti</button><button class="btn pri">Įkelti</button></div></form>`);break;
  case"newParentKey":{const s=U(v);const k={id:uid(),key:genKey(s.first,s.last,"T"),usedBy:null};if(await DB.ins("reg_keys",{id:k.id,person_id:s.id,kind:"parent",key:k.key})){s.parentKeys.push(k);render();toast("Sugeneruotas naujas tėvų raktas");}break;}
  case"teacherDlg":teacherDlg(v);break;
  case"delTeacher":if(core.groups.some(g=>g.teacherId===v)){toast("Mokytojas turi grupių — jo pašalinti negalima");return;}if(!confirm("Šalinti mokytoją?"))return;
    delete users[v];core.classes.forEach(c=>{if(c.headTeacherId===v)c.headTeacherId="";});render();await DB.del("people",{id:v});break;
  case"subjectDlg":subjectDlg(v);break;
  case"delSubject":if(core.subjects.some(s=>s.parentId===v)){toast("Pirma pašalinkite šio dalyko modulius");return;}core.subjects=core.subjects.filter(s=>s.id!==v);render();await DB.del("subjects",{id:v});break;
  case"delHoliday":core.settings.holidays=core.settings.holidays.filter(h=>h.id!==v);_hol=null;render();await DB.settings();break;
  case"pStatus":core.settings.periods[v].active=el.dataset.on==="1";render();if(await DB.settings())toast(el.dataset.on==="1"?"Vertinimas pradėtas visoms klasėms":"Vertinimo įvedimas sustabdytas");break;
  case"subTab":ui.subTab=v;render();break;
  case"delSub":core.subs=core.subs.filter(s=>s.id!==v);render();await DB.del("subs",{id:v});break;
  case"delHeadSub":core.headSubs=core.headSubs.filter(s=>s.id!==v);render();await DB.del("head_subs",{id:v});break;
  case"rep":ui.rep=v;ui.tab=null;render();break;
  case"tab":ui.tab=v;render();break;
  case"print":window.print();break;
  case"exportKeys":{const who=ui.tab||"emp";const rows=[["Asmuo","Klasė / pareigos","Raktas"]];if(who==="emp")teachers().forEach(t=>rows.push([`${t.last} ${t.first}`,"Mokytojas",t.login?"":t.key]));else students().forEach(s=>{if(who==="stu")rows.push([`${s.last} ${s.first}`,clsName(s.classId),s.login?"":s.key]);else(s.parentKeys||[]).filter(p=>!p.usedBy).forEach(p=>rows.push([`${s.last} ${s.first}`,clsName(s.classId),p.key]));});exportFile(`raktai-${who}.csv`,"\ufeff"+csv(rows),"text/csv");break;}
  case"exportRep":{const r=ui.rep==="mr"?reportMR():ui.rep==="summary"?reportSummary(ui.repCls,ui.repPid):reportAtt(ui.repCls,ui.repPid);exportFile(`${ui.rep}-${ui.rep==="mr"?"metiniai":clsName(ui.repCls)}.csv`,"\ufeff"+csv(r.csv),"text/csv");break;}
  case"exportXml":exportFile(`metiniai-${core.settings.yearStart}.xml`,mrXml(),"application/xml");break;
  case"resetPw":{if(!confirm(`Nustatyti laikiną slaptažodį naudotojui ${uNameFL(v)}?`))return;const r=await DB.adminFn("reset_password",v);if(!r)return;users[v].mustChange=true;
    openDlg(dlgHead("Laikinas slaptažodis",esc(uNameFL(v)))+`<div class="dlg-b"><p>Perduokite naudotojui šiuos duomenis. Prisijungęs jis turės susikurti naują slaptažodį.</p><div class="formula">Prisijungimas: <b>${esc(users[v].login)}</b><br>Laikinas slaptažodis: <b class="mono">${esc(r.password)}</b></div></div><div class="dlg-f"><button class="btn pri" data-act="close">Gerai</button></div>`);break;}
  case"off2fa":if(await DB.adminFn("disable_mfa",v))toast("2FA išjungta");break;
  case"unreg":if(!confirm(`Panaikinti ${uNameFL(v)} registraciją? Asmuo galės registruotis iš naujo su tuo pačiu raktu.`))return;if(await DB.adminFn("unregister",v)){await loadAll();render();toast("Registracija panaikinta");}break;
  case"delParent":if(!confirm("Šalinti tėvų paskyrą? Jų panaudoti raktai vėl taps galiojantys."))return;if(await DB.adminFn("delete_account",v)){await loadAll();render();}break;

  /* ---------- mokytojas ---------- */
  case"weekMove":ui.week=+v?addDays(mondayOf(ui.week||TODAY()),+v):null;render();break;
  case"ttEdit":ttEditDlg();break;
  case"delTt":core.timetable=core.timetable.filter(t=>t.id!==v);ttEditDlg();pendingRender=true;await DB.del("timetable",{id:v});break;
  case"openLesson":if(lessonDirty&&!confirm("Pamokos informacija neišsaugota. Tęsti neišsaugojus?"))return;openLesson(el.dataset.g,el.dataset.d);break;
  case"lessonMove":{if(lessonDirty&&!confirm("Pamokos informacija neišsaugota. Tęsti neišsaugojus?"))return;const g=grp(ui.gid);const ds=journalDates(g,ui.pid);const i=ds.indexOf(ui.lesson)+ +v;if(ds[i]){lessonDirty=false;ui.lesson=ds[i];render();}break;}
  case"lv":{const{gid,dt,ro}=ls;if(ro)return;const sid=el.dataset.s;const d=G(gid);const gs=d.grades.filter(x=>x.s===sid&&x.d===dt);const cur=gs[gs.length-1];const val=parseV(v);
    const l=d.lessons.find(x=>x.d===dt);const type=ls.types[sid]||(cur&&cur.t)||lessonDefType(l);
    if(cur&&String(cur.v)===v){d.grades=d.grades.filter(x=>x.id!==cur.id);refreshLessonRows();await DB.del("grades",{id:cur.id});break;}
    await ensureLessonSaved(gid,dt);
    if(cur){cur.v=val;cur.t=type;refreshLessonRows();await DB.upd("grades",{value:String(val),type},{id:cur.id});}
    else{const x={id:uid(),s:sid,d:dt,t:type,v:val,c:"",by:u.id};d.grades.push(x);refreshLessonRows();await DB.ins("grades",R.grade(gid,x));}break;}
  case"laDel":{const{gid,dt,ro}=ls;if(ro)return;const sid=el.dataset.s;setAtt(G(gid),sid,dt,"");refreshLessonRows();if(await DB.delAtt(gid,sid,dt))toast("Lankomumo žyma ištrinta");break;}
  case"delAttCell":{const gid=el.dataset.g,sid=el.dataset.s,dt=v;setAtt(G(gid),sid,dt,"");openCell(gid,sid,dt);pendingRender=true;if(await DB.delAtt(gid,sid,dt))toast("Lankomumo žyma ištrinta");break;}
  case"lgDel":{const{gid}=ls;const d=G(gid);d.grades=d.grades.filter(x=>x.id!==v);refreshLessonRows();if(await DB.del("grades",{id:v}))toast("Pažymys ištrintas");break;}
  case"lgAllType":{const{gid,dt}=ls;const t=$("#allType").value;grp(gid).students.forEach(sid=>ls.types[sid]=t);const d=G(gid);let n=0;d.grades.forEach(x=>{if(x.d===dt&&x.t!==t){x.t=t;n++;}});
    refreshLessonRows();if(n)await DB.upd("grades",{type:t},{group_id:gid,date:dt});toast("Įvertinimų tipas nustatytas visai grupei");break;}
  case"la":{const{gid,dt,ro}=ls;if(ro)return;const sid=el.dataset.s;const d=G(gid);const a=d.att.find(x=>x.s===sid&&x.d===dt);const m=a&&a.m===v?"":v;
    await ensureLessonSaved(gid,dt);setAtt(d,sid,dt,m);refreshLessonRows();const now=d.att.find(x=>x.s===sid&&x.d===dt);if(now)await DB.att(gid,now);else await DB.delAtt(gid,sid,dt);break;}
  case"cell":openCell(ui.gid,el.dataset.s,el.dataset.d);break;
  case"roCell":toast("Šios pamokos įrašų keisti negalite");break;
  case"pickV":$$("#pickV button").forEach(b=>b.setAttribute("aria-pressed",b===el&&dlgState.v!==v?"true":"false"));dlgState.v=dlgState.v===v?null:v;break;
  case"pickA":$$("#pickA button").forEach(b=>b.setAttribute("aria-pressed",b===el?"true":"false"));dlgState.a=v;break;
  case"saveCell":saveCell(el.dataset.g,el.dataset.s,el.dataset.d);break;
  case"delGrade":{const d=G(el.dataset.g);const x=d.grades.find(y=>y.id===v);d.grades=d.grades.filter(y=>y.id!==v);openCell(el.dataset.g,x.s,x.d);pendingRender=true;if(await DB.del("grades",{id:v}))toast("Pažymys ištrintas");break;}
  case"delNote":{const d=G(el.dataset.g);const x=d.notes.find(y=>y.id===v);d.notes=d.notes.filter(y=>y.id!==v);openCell(el.dataset.g,x.s,x.d);pendingRender=true;await DB.del("notes",{id:v});break;}
  case"delLesson":{if(!confirm("Ištrinti šią pamoką?"))return;const d=G(el.dataset.g);d.lessons=d.lessons.filter(x=>x.d!==v);ui.lesson=null;lessonDirty=false;render();await DB.del("lessons",{group_id:el.dataset.g,date:v});break;}
  case"addLesson":{const dt=$("#newLesson").value;const g=grp(ui.gid);if(!dt||!inPeriod(dt,ui.pid)){toast("Data nepatenka į pasirinktą laikotarpį");return;}if(!canEditDate(g,dt)){toast("Šios dienos pamokų pildyti negalite");return;}
    const d=G(g.id);ui.lesson=dt;if(!d.lessons.find(l=>l.d===dt)){ensureLesson(d,dt,g.id);render();await DB.lesson(g.id,d.lessons.find(l=>l.d===dt));}else render();break;}
  case"setPg":{const g=grp(ui.gid);const d=G(g.id);const val=parseV(v);(d.pg[el.dataset.s]??={})[el.dataset.k]=val;render();await DB.pg(g.id,el.dataset.s,el.dataset.k,val);break;}
  case"delPg":{const g=grp(ui.gid);const d=G(g.id);if(d.pg[el.dataset.s])delete d.pg[el.dataset.s][el.dataset.k];render();await DB.delPg(g.id,el.dataset.s,el.dataset.k);break;}
  case"autoPg":{const g=grp(ui.gid);const d=G(g.id);const rows=[];g.students.forEach(sid=>{const s=v==="Y"?annual(g,sid).sug:suggest(g,sid,v);if(s!=null){(d.pg[sid]??={})[v]=s;rows.push({group_id:g.id,student_id:sid,period:v,value:String(s),updated_at:new Date().toISOString()});}});
    render();if(rows.length&&await DB.up("period_grades",rows,"group_id,student_id,period"))toast(`Įvesta vertinimų: ${rows.length}`);break;}
  case"groupDlg":groupDlg(v);break;
  case"selCls":$$(`input[name=gs][data-cls="${v}"]`).forEach(c=>c.checked=true);break;
  case"delGroup":{const d=G(v);if(d.grades.length||d.att.length){toast("Grupėje yra įvestų mokymosi duomenų — jos šalinti negalima");return;}if(!confirm("Ištrinti grupę?"))return;
    core.groups=core.groups.filter(g=>g.id!==v);core.timetable=core.timetable.filter(t=>t.g!==v);delete gd[v];render();await DB.del("groups",{id:v});break;}
  case"planDlg":planDlg(v);break;
  case"delPlan":if(!confirm("Ištrinti teminį planą?"))return;core.plans=core.plans.filter(p=>p.id!==v);core.groups.forEach(g=>{if(g.planId===v)g.planId="";});render();await DB.del("plans",{id:v});break;
  case"checkWork":case"saveWork":{const d=$("#wDate").value,gid=ui.gid;if(!d||!gid)return;const c=conflicts(gid,d);
    $("#workCheck").innerHTML=c.length?`<div class="note">Tą dieną jau suplanuota: ${c.map(x=>`${esc(x.name)} — sutampa ${x.n} mok.`).join("; ")}.</div>`:`<div class="note good">Tą dieną šie mokiniai kitų atsiskaitymų neturi.</div>`;
    if(a==="saveWork"){if(!canEditDate(grp(gid),d)){toast("Šios dienos pamokų pildyti negalite");return;}const w={id:uid(),g:gid,d,t:$("#wType").value,topic:$("#wTopic").value.trim()};core.works.push(w);
      const L=G(gid);ensureLesson(L,d,gid);const l=L.lessons.find(x=>x.d===d);l.t=w.t;if(w.topic)l.topic=w.topic;render();
      if(await DB.ins("works",R.work(w))&&await DB.lesson(gid,l))toast("Atsiskaitomasis darbas išsaugotas");}break;}
  case"delWork":core.works=core.works.filter(w=>w.id!==v);render();await DB.del("works",{id:v});break;
  case"socDlg":socDlg();break;
  case"delSoc":social.list=social.list.filter(x=>x.id!==v);render();await DB.del("social",{id:v});break;
  case"socStudent":{const list=social.list.filter(x=>x.hours[v]);openDlg(dlgHead(esc(uNameFL(v)),"Socialinė-pilietinė veikla")+`<div class="dlg-b"><div class="list">${list.map(x=>`<div class="li"><span>${x.d} · ${esc(x.type)}: ${esc(x.activity)}</span><b>${x.hours[v]} val.</b></div>`).join("")||"Veiklų nėra."}</div></div><div class="dlg-f"><button class="btn" data-act="close">Uždaryti</button></div>`);break;}

  /* ---------- klasės vadovas ---------- */
  case"pickSid":ui.sid=v;render();break;
  case"dayJust":openDayJust(v);break;
  case"doJust":case"unjust":{const code=a==="unjust"?null:$("#jCode").value;const to=$("#jTo").value||v;const picked=new Set($$("input[name=ja]:checked").map(c=>c.value));const ops=[];
    studentGroups(ui.sid).forEach(g=>G(g.id).att.forEach(x=>{if(x.s!==ui.sid||x.m!=="n")return;const hit=x.d===v?picked.has(x.id):(a==="doJust"&&x.d>v&&x.d<=to);if(hit){x.j=code;ops.push(DB.upd("attendance",{just:code},{group_id:g.id,student_id:x.s,date:x.d}));}}));
    closeDlg();render();await Promise.all(ops);toast(a==="unjust"?"Pateisinimas panaikintas":"Pamokos pateisintos");break;}
  case"groupJust":openGroupJust();break;
  case"doGroupJust":{const ids=$$("input[name=js]:checked").map(c=>c.value);const from=$("#gjFrom").value,to=$("#gjTo").value,j=$("#gjCode").value;if(!ids.length||!from||!to||to<from){toast("Pasirinkite mokinius ir teisingą laikotarpį");return;}
    const pre=ids.map(s=>({id:uid(),s,from,to,j}));core.prejust.push(...pre);const ops=[DB.ins("prejust",pre.map(R.prejust))];
    core.groups.forEach(g=>G(g.id).att.forEach(x=>{if(ids.includes(x.s)&&x.m==="n"&&!x.j&&x.d>=from&&x.d<=to){x.j=j;ops.push(DB.upd("attendance",{just:j},{group_id:g.id,student_id:x.s,date:x.d}));}}));
    closeDlg();render();await Promise.all(ops);toast("Pamokos pateisintos");break;}
  case"delPre":core.prejust=core.prejust.filter(p=>p.id!==v);openGroupJust();pendingRender=true;await DB.del("prejust",{id:v});break;

  /* ---------- mokinys, tėvai ---------- */
  case"stuLesson":{const g=grp(el.dataset.g),d=el.dataset.d,L=G(g.id);const l=L.lessons.find(x=>x.d===d)||{};const sid=viewedStudent();const gs=L.grades.filter(x=>x.s===sid&&x.d===d);const at=L.att.find(x=>x.s===sid&&x.d===d);const nt=L.notes.filter(x=>x.s===sid&&x.d===d);
    openDlg(dlgHead(esc(subjName(g.subjectId)),`${d} · ${esc(uNameFL(g.teacherId))}`)+`<div class="dlg-b"><div><div class="small muted">Tema</div>${esc(l.topic||"—")}${l.t?` <span class="tag bad">${esc(TYPE_NAME[l.t])}</span>`:""}</div>${l.cw?`<div><div class="small muted">Klasės darbas</div>${esc(l.cw)}</div>`:""}<div><div class="small muted">Namų darbai</div>${esc(l.hw||"—")}</div>
    <div><div class="small muted">Įvertinimai</div>${gs.map(x=>`<div>${chip(x,false)} ${esc(TYPE_NAME[x.t])}${x.c?` — ${esc(x.c)}`:""}</div>`).join("")||"—"}</div><div><div class="small muted">Lankomumas</div>${at?(at.m==="pv"?"Pavėlavo":at.j?`Nedalyvavo (${esc(JUST_NAME[at.j])})`:"Nedalyvavo, nepateisinta"):"Dalyvavo"}</div>
    ${nt.map(n=>`<div>${n.kind==="p"?"👍 Pagyrimas":"⚠️ Pastaba"}: ${esc(n.text)}</div>`).join("")}</div><div class="dlg-f"><button class="btn" data-act="close">Uždaryti</button></div>`);break;}

  /* ---------- pranešimai, paskyra ---------- */
  case"newMsg":newMsgDlg();break;
  case"msgTab":ui.msgTab=v;render();break;
  case"openMsg":openMsg(v);pendingRender=true;break;
  case"reply":{const m=msgs.list.find(x=>x.id===v);newMsgDlg(m.from,"Re: "+m.subj.replace(/^Re: /,""));break;}
  case"start2fa":start2fa();break;
  case"stop2fa":{if(!confirm("Išjungti dviejų faktorių autentifikaciją?"))return;const {error}=await sb.auth.mfa.unenroll({factorId:mfa.factorId});if(error){toast("Nepavyko: "+error.message);return;}mfa={enabled:false,factorId:null};render();toast("2FA išjungta");break;}
  }
});

document.addEventListener("submit",async e=>{const f=e.target.closest("form[data-form]");if(!f)return;e.preventDefault();const fd=new FormData(f);const k=f.dataset.form,v=f.dataset.v;const u=me();const S=n=>(fd.get(n)||"").toString().trim();
  const busy=on=>{authUi.busy=on;if(!me()||authUi.step!=="cred")renderAuth();};
  switch(k){
  /* ---------- prisijungimas ---------- */
  case"setup":{const pe=pwProblem(S("pw"))||(!/^[A-Za-z0-9._-]{3,}$/.test(S("login"))?"Prisijungimo vardas: bent 3 lotyniškos raidės, skaičiai, taškas, brūkšnys.":null);if(pe){authUi.err=pe;return renderAuth();}
    busy(true);const {data,error}=await sb.auth.signUp({email:loginEmail(S("login")),password:S("pw")});
    if(error||!data.session){busy(false);authUi.err=error?authError(error):authError({message:"Email not confirmed"});return renderAuth();}
    const r=await sb.rpc("bootstrap_admin",{p_first:S("first"),p_last:S("last"),p_login:S("login"),p_school:S("school")});busy(false);
    if(r.error){authUi.err=r.error.message;await sb.auth.signOut();return renderAuth();}
    authUi.needsSetup=false;await afterAuth();break;}
  case"login":{authUi.err="";authUi.info="";busy(true);const {error}=await sb.auth.signInWithPassword({email:loginEmail(S("login")),password:fd.get("pw")});busy(false);
    if(error){authUi.err=authError(error);return renderAuth();}await afterAuth();break;}
  case"otp":{busy(true);const f2=await sb.auth.mfa.listFactors();const t=(f2.data&&f2.data.totp||[])[0];
    const {error}=t?await sb.auth.mfa.challengeAndVerify({factorId:t.id,code:S("code").replace(/\s/g,"")}):{error:{message:"2FA nerasta"}};busy(false);
    if(error){authUi.err=authError(error);return renderAuth();}authUi.step="cred";await afterAuth();break;}
  case"forceChange":{const pe=pwProblem(S("pw"))||(S("pw")!==S("pw2")?"Slaptažodžiai nesutampa.":null);if(pe){authUi.err=pe;return renderAuth();}
    busy(true);const {error}=await sb.auth.updateUser({password:S("pw")});if(error){busy(false);authUi.err=authError(error);return renderAuth();}
    await sb.rpc("clear_must_change");busy(false);authUi.step="cred";await afterAuth();toast("Slaptažodis pakeistas");break;}
  case"checkKey":{busy(true);const {data,error}=await sb.rpc("check_key",{p_key:S("key")});busy(false);authUi.err="";
    if(error)authUi.err=error.message;else if(data.kind==="none")authUi.err="Toks raktas nerastas. Patikrinkite, ar teisingai įvedėte.";else if(data.kind==="used")authUi.err="Šis raktas jau panaudotas. Prisijunkite arba kreipkitės į administratorių.";else authUi.keyInfo={...data,key:S("key")};
    renderAuth();break;}
  case"register":{const ki=authUi.keyInfo;const login=S("login");const pe=pwProblem(S("pw"))||(S("pw")!==S("pw2")?"Slaptažodžiai nesutampa.":null)||(!/^[A-Za-z0-9._-]{3,}$/.test(login)?"Prisijungimo vardas: bent 3 lotyniškos raidės, skaičiai, taškas, brūkšnys.":null);
    if(pe){authUi.err=pe;return renderAuth();}
    busy(true);const {data,error}=await sb.auth.signUp({email:loginEmail(login),password:S("pw")});
    if(error||!data.session){busy(false);authUi.err=authError(error||{message:"Email not confirmed"});return renderAuth();}
    const r=await sb.rpc("register_with_key",{p_key:ki.key,p_login:login,p_first:S("first")||null,p_last:S("last")||null,p_email:S("email")||null});busy(false);
    if(r.error){authUi.err="Registracija nepavyko: "+r.error.message;await sb.auth.signOut();return renderAuth();}
    authUi.keyInfo=null;await afterAuth();toast("Paskyra sukurta");break;}

  /* ---------- administratorius ---------- */
  case"saveClass":{const obj={name:S("name").toUpperCase(),level:+S("level"),system:S("system"),headTeacherId:S("head")};if(core.classes.some(c=>c.name===obj.name&&c.id!==v)){toast("Tokia klasė jau yra");return;}
    let c;if(v){c=cls(v);Object.assign(c,obj);}else{c={id:uid(),...obj};core.classes.push(c);}closeDlg();render();await DB.up("classes",R.cls(c));break;}
  case"saveStudent":{const obj={first:S("first"),last:S("last"),classId:S("classId"),email:S("email"),birth:S("birth")};closeDlg();
    if(v){Object.assign(users[v],obj);render();await DB.upd("people",R.person(users[v]),{id:v});}
    else{const p={id:uid(),role:"student",...obj};if(await DB.ins("people",R.person(p))){await loadAll();render();toast("Mokinys pridėtas, raktai sugeneruoti");}}break;}
  case"importStudents":{const rows=[],newCls=[];S("data").split(/\r?\n/).forEach(line=>{const p=line.split(/[;\t,]/).map(x=>x.trim());if(p.length<3||!p[0]||!p[1]||!p[2])return;const cn=p[2].toUpperCase();
      let c=core.classes.find(x=>x.name===cn)||newCls.find(x=>x.name===cn);if(!c){c={id:uid(),name:cn,level:Math.min(12,Math.max(1,parseInt(cn)||1)),system:core.settings.system,headTeacherId:""};newCls.push(c);}
      rows.push(R.person({id:uid(),role:"student",first:p[0],last:p[1],classId:c.id}));});
    closeDlg();if(!rows.length){toast("Neatpažinta nė viena eilutė");return;}
    if(newCls.length&&!(await DB.ins("classes",newCls.map(R.cls))))return;if(!(await DB.bulk("people",rows)))return;
    await loadAll();render();toast(`Įkelta mokinių: ${rows.length}${newCls.length?`, sukurta klasių: ${newCls.length}`:""}`);break;}
  case"saveTeacher":{const head=S("head");closeDlg();let id=v;
    if(v){Object.assign(users[v],{first:S("first"),last:S("last"),email:S("email")});if(!(await DB.upd("people",R.person(users[v]),{id:v})))return;}
    else{id=uid();if(!(await DB.ins("people",R.person({id,role:"teacher",first:S("first"),last:S("last"),email:S("email")}))))return;}
    const ops=[];core.classes.forEach(c=>{if(c.headTeacherId===id&&c.id!==head){c.headTeacherId="";ops.push(DB.upd("classes",{head_teacher_id:null},{id:c.id}));}});
    if(head)ops.push(DB.upd("classes",{head_teacher_id:id},{id:head}));await Promise.all(ops);await loadAll();render();break;}
  case"saveSubject":{const kind=S("kind");if(kind==="modulis"&&!S("parentId")){toast("Moduliui nurodykite pagrindinį dalyką");return;}const obj={name:S("name"),kind,parentId:kind==="modulis"?S("parentId"):"",code:S("code")};
    if(core.subjects.some(s=>s.name.toLowerCase()===obj.name.toLowerCase()&&s.id!==v&&s.parentId===obj.parentId)){toast("Toks dalykas jau yra");return;}
    let s;if(v){s=subj(v);Object.assign(s,obj);}else{s={id:uid(),...obj};core.subjects.push(s);}closeDlg();render();await DB.up("subjects",R.subject(s));break;}
  case"saveSettings":{const s=core.settings;const y=+S("yearStart");s.school=S("school")||s.school;s.system=S("system");s.rounding=+S("rounding");
    if(y!==s.yearStart){const act=Object.fromEntries(Object.entries(s.periods).map(([kk,p])=>[kk,p.active]));s.yearStart=y;s.periods=defaultPeriodDates(y);Object.keys(act).forEach(kk=>s.periods[kk].active=act[kk]);}
    else["P1","P2","T1","T2","T3"].forEach(id=>{s.periods[id].from=S("from_"+id)||s.periods[id].from;s.periods[id].to=S("to_"+id)||s.periods[id].to;});
    _hol=null;const bad=[["P1","P2"],["T1","T2"],["T2","T3"]].find(([x,z])=>s.periods[x].to>=s.periods[z].from);render();
    if(await DB.settings())toast(bad?`Dėmesio: ${PNAME[bad[0]]} persidengia su ${PNAME[bad[1]]}`:"Nustatymai išsaugoti");break;}
  case"addHoliday":if(S("to")<S("from")){toast("Neteisingas laikotarpis");return;}core.settings.holidays.push({id:uid(),name:S("name"),from:S("from"),to:S("to")});_hol=null;render();await DB.settings();break;
  case"addSub":{if(S("from")===S("to")){toast("Mokytojas negali vaduoti pats savęs");return;}if(S("dTo")<S("dFrom")){toast("Neteisingos datos");return;}const x={id:uid(),from:S("from"),to:S("to"),dFrom:S("dFrom"),dTo:S("dTo")};core.subs.push(x);render();await DB.ins("subs",R.sub(x));break;}
  case"addHeadSub":{if(S("dTo")<S("dFrom")){toast("Neteisingos datos");return;}const x={id:uid(),classId:S("classId"),to:S("to"),dFrom:S("dFrom"),dTo:S("dTo")};core.headSubs.push(x);render();await DB.ins("head_subs",R.hsub(x));break;}
  case"addAdmin":{const id=uid();if(!(await DB.ins("people",R.person({id,role:"admin",first:S("first"),last:S("last")}))))return;await loadAll();render();
    openDlg(dlgHead("Administratorius sukurtas")+`<div class="dlg-b">Darbuotojo raktas registracijai: <div class="formula mono">${esc(users[id]&&users[id].key||"—")}</div></div><div class="dlg-f"><button class="btn pri" data-act="close">Gerai</button></div>`);break;}

  /* ---------- mokytojas ---------- */
  case"addTt":{const t={id:uid(),g:S("g"),wd:+S("wd"),no:+S("no"),from:S("from"),weeks:S("valid")==="weeks"?+S("weeks")||1:null,parity:S("parity")};core.timetable.push(t);ttEditDlg();pendingRender=true;if(await DB.ins("timetable",R.tt(t)))toast("Pamoka pridėta į tvarkaraštį");break;}
  case"saveLesson":{const gid=f.dataset.g,dt=f.dataset.d;const d=G(gid);ensureLesson(d,dt,gid);const l=d.lessons.find(x=>x.d===dt);l.topic=S("topic");l.t=S("t");l.cw=S("cw");l.hw=S("hw");
    if(await DB.lesson(gid,l)){lessonDirty=false;render();toast("Pamoka išsaugota");}break;}
  case"saveGroup":{const students=fd.getAll("gs");const programs={};students.forEach(s=>{const p=S("gp_"+s);if(p)programs[s]=p;});
    const obj={name:S("name"),subjectId:S("subjectId"),kind:S("kind"),level:S("level"),hours:+S("hours")||1,students,programs,planId:S("planId")};
    let g;if(v){g=grp(v);Object.assign(g,obj);}else{g={id:uid(),teacherId:u.id,evalSys:"10",extra:{},...obj};core.groups.push(g);ui.gid=g.id;}
    closeDlg();render();if(await DB.saveGroup(g,!v))toast("Grupė išsaugota");break;}
  case"savePlan":{const obj={name:S("name"),desc:S("desc"),subjectId:S("subjectId"),topics:S("topics").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)};
    let p;if(v){p=core.plans.find(x=>x.id===v);Object.assign(p,obj);}else{p={id:uid(),ownerId:u.id,...obj};core.plans.push(p);}closeDlg();render();await DB.up("plans",R.plan(p));break;}
  case"saveSoc":{const st=fd.getAll("st");if(!st.length){toast("Pridėkite mokinių");return;}const eq=!!fd.get("equal");const hours={};st.forEach(s=>{const h=eq?+S("hours"):+S("h_"+s);if(h>0)hours[s]=h;});
    if(!Object.keys(hours).length){toast("Nurodykite valandas");return;}const x={id:uid(),type:S("type"),partner:S("partner"),activity:S("activity"),comment:S("comment"),d:S("d"),hours,by:u.id};social.list.push(x);closeDlg();render();
    if(await DB.ins("social",{id:x.id,type:x.type,partner:x.partner,activity:x.activity,comment:x.comment,date:x.d,created_by:u.id}))await DB.ins("social_hours",Object.entries(hours).map(([s,h])=>({social_id:x.id,student_id:s,hours:h})));break;}

  /* ---------- tėvai ---------- */
  case"saveChild":{const s=users[viewedStudent()];Object.assign(s,{first:S("first"),last:S("last"),birth:S("birth"),email:S("email")});render();
    if(await DB.upd("people",{first_name:s.first,last_name:s.last,birth:s.birth||null,email:s.email||null},{id:s.id}))toast("Vaiko duomenys išsaugoti");break;}
  case"addChild":{const {data,error}=await sb.rpc("add_child",{p_key:S("key")});if(error){toast(error.message);return;}await loadAll();ui.child=data;render();toast(`Pridėtas vaikas: ${uNameFL(data)}`);break;}

  /* ---------- pranešimai, paskyra ---------- */
  case"sendMsg":{const to=fd.getAll("to");if(!to.length)return;const m={id:uid(),from:u.id,to,subj:S("subj"),body:S("body"),at:new Date().toISOString(),read:{}};
    closeDlg();if(!(await DB.ins("messages",{id:m.id,from_id:u.id,subject:m.subj,body:m.body})))return;if(!(await DB.ins("message_recipients",to.map(r=>({message_id:m.id,recipient_id:r})))))return;
    msgs.list.push(m);ui.msgTab="out";render();toast("Pranešimas išsiųstas");break;}
  case"saveEmail":u.email=S("email");if(await DB.upd("people",{email:u.email||null},{id:u.id}))toast("Išsaugota");break;
  case"changePw":{const pe=pwProblem(S("pw"))||(S("pw")!==S("pw2")?"Slaptažodžiai nesutampa.":null);if(pe){toast(pe);return;}const {error}=await sb.auth.updateUser({password:S("pw")});if(error){toast("Nepavyko: "+authError(error));return;}f.reset();toast("Slaptažodis pakeistas");break;}
  case"on2fa":{const {error}=await sb.auth.mfa.challengeAndVerify({factorId:dlgState.factorId,code:S("code").replace(/\s/g,"")});if(error){toast("Neteisingas kodas — patikrinkite laiką telefone");return;}
    mfa={enabled:true,factorId:dlgState.factorId};closeDlg();render();toast("2FA įjungta");break;}
  }
});

document.addEventListener("input",e=>{if(e.target.closest('form[data-form="saveLesson"]')){lessonDirty=true;const n=$("#lessonDirtyNote");if(n)n.textContent="Yra neišsaugotų pakeitimų";}});
window.addEventListener("beforeunload",e=>{if(lessonDirty){e.preventDefault();e.returnValue="";}});
