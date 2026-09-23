/* Dienynas — prisijungimas, registracija, 2FA ir programos karkasas */

/* ================= Prisijungimo langas ================= */
function authCard(){
  const err=authUi.err?`<div class="note bad">${esc(authUi.err)}</div>`:"";
  const info=authUi.info?`<div class="note good">${esc(authUi.info)}</div>`:"";
  const busy=authUi.busy?'disabled':'';
  if(authUi.dbError&&!authUser)return `<h2 style="margin-top:0">Nepavyko prisijungti prie duomenų bazės</h2><div class="note bad">${esc(authUi.dbError)}</div><p class="small muted">Patikrinkite <span class="mono">js/config.js</span> reikšmes ir ar paleistas SQL failas iš <span class="mono">supabase/migrations</span>.</p>`;
  if(authUi.step==="otp")return `<h2 style="margin-top:0">Dviejų faktorių patvirtinimas</h2><p class="small muted">Įveskite 6 skaitmenų kodą iš autentifikavimo programėlės.</p>
    <form data-form="otp"><label class="field">Kodas<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" required autofocus></label>${err}<button class="btn pri" ${busy}>Patvirtinti</button><button type="button" class="btn" data-act="logout">Atsijungti</button></form>`;
  if(authUi.step==="change"||(me()&&me().mustChange))return `<h2 style="margin-top:0">Pasikeiskite slaptažodį</h2><p class="small muted">Administratorius nustatė laikiną slaptažodį. Sugalvokite naują.</p>
    <form data-form="forceChange"><label class="field">Naujas slaptažodis<input name="pw" type="password" required autocomplete="new-password"></label><label class="field">Pakartokite<input name="pw2" type="password" required autocomplete="new-password"></label>${err}<button class="btn pri" ${busy}>Išsaugoti ir tęsti</button></form>`;
  if(authUi.step==="unlinked")return `<h2 style="margin-top:0">Paskyra nesusieta</h2><p>Esate prisijungę, bet ši paskyra nesusieta su jokiu dienyno asmeniu (pvz., administratorius panaikino registraciją arba asmenį). Kreipkitės į mokyklos administratorių.</p><button class="btn" data-act="logout">Atsijungti</button>`;
  if(authUi.needsSetup)return `<h2 style="margin-top:0">Pirmasis paleidimas</h2><p class="small muted">Duomenų bazėje dar nėra administratoriaus. Sukurkite mokyklos administratoriaus paskyrą — kiti naudotojai registruosis su raktais, kuriuos jis išduos.</p>
    <form data-form="setup"><label class="field">Mokyklos pavadinimas<input name="school" required value="${esc(core.settings.school)}"></label>
    <div class="row"><label class="field" style="flex:1">Vardas<input name="first" required></label><label class="field" style="flex:1">Pavardė<input name="last" required></label></div>
    <label class="field">Prisijungimo vardas<input name="login" required autocomplete="username" pattern="[A-Za-z0-9._\\-]{3,}"></label>
    <label class="field">Slaptažodis<input name="pw" type="password" required autocomplete="new-password"></label>
    ${err}<button class="btn pri" ${busy}>${authUi.busy?'<span class="spin"></span>':''}Sukurti administratorių</button></form>`;
  const tabs=`<div class="tabs" role="tablist"><button role="tab" aria-selected="${authUi.tab==="login"}" data-act="authTab" data-v="login">Prisijungti</button><button role="tab" aria-selected="${authUi.tab==="register"}" data-act="authTab" data-v="register">Registracija</button></div>`;
  if(authUi.tab==="login")return tabs+`<form data-form="login"><label class="field">Prisijungimo vardas<input name="login" required autocomplete="username" id="lgLogin"></label>
    <label class="field">Slaptažodis<input name="pw" type="password" required autocomplete="current-password" id="lgPw"></label>${err}${info}
    <button class="btn pri" ${busy}>${authUi.busy?'<span class="spin"></span>':''}Prisijungti</button><button type="button" class="btn" data-act="forgot">Pamiršote prisijungimo duomenis?</button></form>`;
  const ki=authUi.keyInfo;
  return tabs+`<p class="small muted" style="margin-top:0">Registracijos raktą (darbuotojo, mokinio arba tėvų) išduoda mokyklos administratorius arba klasės vadovas.</p>
    <form data-form="${ki?"register":"checkKey"}"><label class="field">Raktas<input name="key" class="mono" required value="${esc(ki?ki.key:"")}" ${ki?"readonly":""} placeholder="vardpavaM1a2b3c4d5e6"></label>
    ${ki?`<div class="note info">${ki.kind==="parent"?`Tėvų paskyra mokiniui <b>${esc(ki.first+" "+ki.last)}</b>${ki.class?` (${esc(ki.class)})`:""}`:`${ROLE_NAME[ki.role]}: <b>${esc(ki.first+" "+ki.last)}</b>${ki.class?` (${esc(ki.class)})`:""}`}</div>
      ${ki.kind==="parent"?`<div class="row"><label class="field" style="flex:1">Jūsų vardas<input name="first" required></label><label class="field" style="flex:1">Pavardė<input name="last" required></label></div>`:""}
      <label class="field">Prisijungimo vardas<input name="login" required autocomplete="username"></label>
      <label class="field">El. paštas (nebūtina)<input name="email" type="email"></label>
      <label class="field">Slaptažodis<input name="pw" type="password" required autocomplete="new-password"></label>
      <label class="field">Pakartokite slaptažodį<input name="pw2" type="password" required autocomplete="new-password"></label>`:""}
    ${err}<button class="btn pri" ${busy}>${authUi.busy?'<span class="spin"></span>':''}${ki?"Sukurti paskyrą":"Tikrinti raktą"}</button>${ki?`<button type="button" class="btn" data-act="keyReset">Kitas raktas</button>`:""}</form>`;
}
function renderAuth(){
  $("#root").innerHTML=`<div class="auth"><div class="auth-l"><div><div class="brand" style="padding:0;margin-bottom:34px"><b>Dienynas</b><span>elektroninis dienynas</span></div>
    <h1>${esc(core.settings.school||"Mokykla")}</h1><p>Pažymiai, lankomumas, tvarkaraštis ir pusmečiai vienoje vietoje — mokytojams, mokiniams, tėvams ir administracijai.</p>
    <div class="gr"><span>10</span><span>9</span><span>8</span><span style="font-size:13px">įsk.</span><span style="color:#FF9AA4">n</span><span style="color:#8BE0AE;font-size:14px">nl</span></div></div>
    <div class="small" style="opacity:.6">Mokslo metai ${core.settings.yearStart}–${core.settings.yearStart+1}</div></div>
    <div class="auth-r"><div class="auth-card">${authCard()}</div></div></div>`;
}
function authError(e){const m=(e&&e.message)||String(e);
  if(/Invalid login credentials/i.test(m))return"Neteisingas prisijungimo vardas arba slaptažodis.";
  if(/already registered|already been registered/i.test(m))return"Toks prisijungimo vardas jau užimtas.";
  if(/Email not confirmed/i.test(m))return"Supabase nustatymuose išjunkite el. pašto patvirtinimą (Authentication → Sign In / Providers → Email → Confirm email).";
  if(/invalid.*email|email.*invalid/i.test(m))return"Supabase atmetė techninį el. pašto adresą. Pakeiskite LOGIN_EMAIL_DOMAIN faile js/config.js.";
  if(/Invalid TOTP|invalid.*code/i.test(m))return"Neteisingas kodas.";
  return m;}
async function afterAuth(){
  const {data:{user}}=await sb.auth.getUser();authUser=user;
  if(!user){session=null;authUi.step="cred";ready=true;render();return;}
  const aal=await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal.data&&aal.data.nextLevel==="aal2"&&aal.data.currentLevel!=="aal2"){authUi.step="otp";ready=true;renderAuth();return;}
  try{await loadAll();}catch(e){authUi.err="Nepavyko įkelti duomenų: "+e.message;authUi.step="cred";ready=true;renderAuth();return;}
  const f=await sb.auth.mfa.listFactors();const t=(f.data&&f.data.totp||[]).find(x=>x.status==="verified");mfa={enabled:!!t,factorId:t?t.id:null};
  if(!me()){authUi.step="unlinked";ready=true;renderAuth();return;}
  authUi.step=me().mustChange?"change":"cred";authUi.err="";authUi.info="";authUi.keyInfo=null;
  subscribeRealtime();ready=true;render();
}
async function logout(){unsubscribeRealtime();await sb.auth.signOut();authUser=null;session=null;users={};gd={};social={list:[]};msgs={list:[]};
  Object.assign(authUi,{step:"cred",err:"",info:"",keyInfo:null,tab:"login"});ui.view=null;await loadSettingsPublic();render();}

/* ================= Karkasas ================= */
function menuFor(u){
  if(u.role==="admin")return[["Mokykla",[["a_home","Pradžia"],["a_classes","Klasės"],["a_students","Mokiniai"],["a_teachers","Mokytojai"],["a_subjects","Dalykai"]]],
    ["Nustatymai",[["a_periods","Laikotarpiai"],["a_status","Vertinimo būsenos"],["a_evalsys","Vertinimo sistemos"],["a_subs","Pavadavimai"],["a_tt","Mokytojų tvarkaraščiai"]]],
    ["Ataskaitinės veiklos",[["a_reports","Ataskaitos"],["a_users","Naudotojai"],["a_data","Duomenys"]]],["Paskyra",[["msg","Pranešimai"],["acc","Mano paskyra"]]]];
  if(u.role==="teacher"){const m=[["Mano dienynas",[["t_tt","Tvarkaraštis"],["t_journal","Pamokos"],["t_grid","Žurnalas"],["t_groups","Grupės"],["t_plans","Pamokų teminiai planai"],["t_works","Atsiskaitomieji darbai"],["t_soc","Socialinė-pilietinė veikla"],["t_subs","Pavadavimai"]]],["Ataskaitinės veiklos",[["t_periods","Trimestrai / pusmečiai"]]]];
    if(headClassesOf(u.id).length)m.push(["Klasės vadovui",[["h_just","N pateisinimas"],["h_summary","Klasės suvestinė"],["h_keys","Tėvų raktai"],["h_soc","Soc.-pilietinės veiklos ataskaita"]]]);
    m.push(["Paskyra",[["msg","Pranešimai"],["acc","Mano paskyra"]]]);return m;}
  const base=[["s_grades","Pažymiai"],["s_tt","Tvarkaraštis"],["s_att","Lankomumas"],["s_works","Atsiskaitymai"],["s_notes","Pagyrimai / pastabos"],["s_soc","Soc.-pilietinė veikla"]];
  if(u.role==="parent")return[["Vaiko dienynas",base],["Tėvams",[["p_child","Vaiko duomenys"],["p_add","Pridėti vaiką"]]],["Paskyra",[["msg","Pranešimai"],["acc","Mano paskyra"]]]];
  return[["Mano dienynas",base],["Paskyra",[["msg","Pranešimai"],["acc","Mano paskyra"]]]];
}
const unread=u=>msgs.list.filter(m=>m.to.includes(u.id)&&!(m.read||{})[u.id]).length;
function render(){
  pendingRender=false;
  if(!ready){$("#root").innerHTML=`<div class="empty" style="padding-top:30vh"><span class="spin"></span>Įkeliami dienyno duomenys…</div>`;return;}
  const u=me();if(!u||authUi.step!=="cred"||u.mustChange){renderAuth();return;}
  const menu=menuFor(u);const all=menu.flatMap(s=>s[1].map(x=>x[0]));if(!all.includes(ui.view))ui.view=all[0];
  const un=unread(u);
  let who=`<b>${esc(u.first)} ${esc(u.last)}</b>${ROLE_NAME[u.role]}${u.role==="student"?` · ${esc(clsName(u.classId))}`:""}`;
  if(u.role==="teacher"){const hc=headClassesOf(u.id);if(hc.length)who+=` · kl. vadovas ${hc.map(c=>esc(c.name)).join(", ")}`;}
  if(u.role==="parent"){const kids=(u.childIds||[]).filter(id=>U(id));viewedStudent();who+=kids.length>1?`<select data-ch="child" aria-label="Vaikas">${kids.map(k=>`<option value="${k}" ${k===ui.child?"selected":""}>${esc(uNameFL(k))} (${esc(clsName(U(k).classId))})</option>`).join("")}</select>`:kids.length?`<div class="small" style="opacity:.8;margin-top:2px">Vaikas: ${esc(uNameFL(kids[0]))}</div>`:"";}
  $("#root").innerHTML=`<div class="app"><aside class="side"><div class="brand"><b>Dienynas</b><span>${esc(core.settings.school)}</span></div><div class="who">${who}</div>
   <nav class="nav">${menu.map(([sec,items])=>`<div class="sec">${sec}</div>`+items.map(([k,n])=>`<button data-act="view" data-v="${k}" aria-current="${ui.view===k}"><span>${n}</span>${k==="msg"&&un?`<span class="badge">${un}</span>`:""}</button>`).join("")).join("")}</nav>
   <div class="foot"><div><span class="dot ok"></span>Supabase · ${core.settings.yearStart}–${core.settings.yearStart+1} m. m.</div><button data-act="logout">Atsijungti</button></div></aside>
   <main id="main"></main></div>`;
  const V=VIEWS[ui.view];let html="";try{html=V?V(u):"";}catch(e){console.error(e);html=`<div class="note bad">Klaida rodant puslapį: ${esc(e.message)}</div>`;}
  $("#main").innerHTML=html;afterRender();
}
let afterHooks=[];function afterRender(){const h=afterHooks;afterHooks=[];h.forEach(f=>{try{f();}catch(e){}});}

/* ---- dialogai ---- */
let dlgState={};
function openDlg(html,wide=false){const d=$("#dlg");d.className=wide?"wide":"";d.innerHTML=html;if(!d.open)d.showModal();dialogOpen=true;}
function closeDlg(){const d=$("#dlg");if(d.open)d.close();}
const dlgHead=(t,sub="")=>`<div class="dlg-h"><div><h3>${t}</h3>${sub?`<div class="small muted">${sub}</div>`:""}</div><button class="x" type="button" data-act="close" aria-label="Uždaryti">×</button></div>`;

/* ---- bendri valdikliai ---- */
function sel(ch,opts,val,label,extra=""){return `<label class="field">${label}<select data-ch="${ch}" ${extra}>${opts.map(([v,n])=>`<option value="${esc(v)}" ${String(v)===String(val)?"selected":""}>${esc(n)}</option>`).join("")}</select></label>`;}
function ensureIn(key,list,fallback){if(!list.some(x=>x[0]===ui[key]))ui[key]=fallback!==undefined?fallback:(list[0]?list[0][0]:null);return ui[key];}
function periodOpts(sys,withY){const o=periodsSys(sys).map(p=>[p.id,p.name]);if(withY)o.push(["Y","Visi metai"]);return o;}
function curPeriod(sys){const t=TODAY();const ps=periodsSys(sys);return(ps.find(p=>t>=p.from&&t<=p.to)||ps[ps.length-1]).id;}
function progTag(g,sid){const p=(g.programs||{})[sid];return p?`<span class="tag i" title="${p==="I"?"Individualizuota programa":"Pritaikyta programa"}">${p}</span>`:"";}
const gLabel=g=>`${g.name}${g.teacherId!==(me()||{}).id&&me()&&me().role==="teacher"?" (pavadavimas)":""}`;
