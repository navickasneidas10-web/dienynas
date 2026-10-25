/* Dienynas — konstantos, būsena ir skaičiavimai */
/* ================= Konstantos ================= */
/* Pamokų laikas (skambučiai). Direktorius gali pakeisti skiltyje „Laikotarpiai“ */
const DEFAULT_BELLS=[["08:00","08:45"],["08:55","09:40"],["09:50","10:35"],["10:55","11:40"],["12:00","12:45"],["12:55","13:40"],["13:50","14:35"],["14:45","15:30"],["15:40","16:25"]];
const bellOf=no=>{const b=(core.settings.bells||DEFAULT_BELLS)[(+no||0)-1];return b&&b[0]&&b[1]?b:null;};
const MONTHS_GEN=["sausio","vasario","kovo","balandžio","gegužės","birželio","liepos","rugpjūčio","rugsėjo","spalio","lapkričio","gruodžio"];
const WD_FULL=["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis","Sekmadienis"];
const dayGen=d=>`${MONTHS_GEN[+d.slice(5,7)-1]} ${d.slice(8,10)} d.`;
const ICON={
 burger:'<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2.2H3zm0 5h18v2.2H3zm0 5h18v2.2H3z"/></svg>',
 user:'<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="8" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.8 21c.6-4.3 4-6.6 8.2-6.6s7.6 2.3 8.2 6.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
 mail:'<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
 hw:'<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="9" y="2.5" width="6" height="3" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10h8M8 13.5h8M8 17h5" stroke="currentColor" stroke-width="1.6"/></svg>',
 note:'<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="M4 3h16a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 17H8l-4.5 4V4.5A1.5 1.5 0 0 1 4 3z"/><path d="M7.5 7.5h9M7.5 10.5h9M7.5 13.5h6" stroke="#fff" stroke-width="1.5"/></svg>',
 chev:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 chevL:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 close:'<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
/* Pažymių tipai (kodai suderinami su jau įrašytais pažymiais) */
const TYPES=[["KL","Klasės darbas"],["PR","Praktinis darbas"],["KD","Kontrolinis darbas"],["PP","Paprastas"],["SD","Savarankiškas darbas"],["ND","Namų darbas"],["TD","Teorinis darbas"],["IS","Įskaita"],["TA","Testas"],["KP","Kaupiamasis"],["KM","Pažymys iš kitos įstaigos"],["PJ","Projektinis darbas"],["RS","Rašinys"]];
/* Pažymių tipų spalvos — rodomos tik kaip juosta šone */
const TYPE_COLOR={KL:"#008080",PR:"#FF00FF",KD:"#FF0000",PP:"#666666",SD:"#800000",ND:"#0000FF",TD:"#808000",IS:"#00FF00",TA:"#6B4423",KP:"#00FFFF",KM:"#333333",PJ:"#0D2B52",RS:"#8EA9DB"};
const tc=t=>TYPE_COLOR[t]||TYPE_COLOR.KL;
const tStyle=t=>` style="--tc:${tc(t)}"`;
const typeLegend=()=>`<div class="tlegend"><b>Pažymių spalvos</b><div>${TYPES.map(([k,n])=>`<span><i style="background:${tc(k)}"></i>${n}</span>`).join("")}</div></div>`;
const TYPE_NAME=Object.fromEntries(TYPES);
const WORK_TYPES=TYPES.filter(([k])=>["KD","SD","PR","TD","IS","TA","PJ","RS"].includes(k));
const JUST=[["nt","Pateisinta tėvų (dėl ligos)"],["np","Pateisinta (kita priežastis)"],["nl","Pateisinta (dėl ligos)"],["nk","Pateisinta tėvų (ne dėl ligos)"],["ns","Pateisinta (direktoriaus įsakymu)"],["nv","Pateisinta (varžybos, olimpiados)"]];
const JUST_NAME=Object.fromEntries(JUST);
const KINDS={klase:"Mokomojo dalyko grupė",pogrupis:"Pogrupis (mobilioji grupė)",srautas:"Srautas"};
const MONTHS=["sausis","vasaris","kovas","balandis","gegužė","birželis","liepa","rugpjūtis","rugsėjis","spalis","lapkritis","gruodis"];
const WD=["Pr","An","Tr","Kt","Pn","Št","Sk"];
const WDL=["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis"];
const PDEF={pusm:[["P1","I pusmetis"],["P2","II pusmetis"]],trim:[["T1","I trimestras"],["T2","II trimestras"],["T3","III trimestras"]]};
const PNAME={P1:"I pusmetis",P2:"II pusmetis",T1:"I trimestras",T2:"II trimestras",T3:"III trimestras",Y:"Metinis"};
const SOC_TYPES=["Pagalba žmonėms","Aplinkosauginė veikla","Kultūrinė veikla","Pilietinė veikla","Savanorystė mokykloje","Sportinė veikla"];
const ROLE_NAME={admin:"Direktorius",deputy:"Direktoriaus pavaduotojas",teacher:"Mokytojas",student:"Mokinys",parent:"Tėvai"};
const STAFF_ROLES=["admin","deputy","teacher"];
const hasRole=(u,r)=>!!u&&(u.role===r||(u.roles||[]).includes(r));
const rolesOf=u=>u?[u.role,...(u.roles||[]).filter(r=>r!==u.role)]:[];
const roleNames=u=>{const rs=rolesOf(u);return STAFF_ROLES.filter(r=>rs.includes(r)).concat(rs.filter(r=>!STAFF_ROLES.includes(r))).map(r=>ROLE_NAME[r]).join(", ");};
const isStaff=u=>STAFF_ROLES.some(r=>hasRole(u,r));
const EVAL_SYS={"10":"Dešimtbalė sistema",isk:"Vertinimas įskaita"};

function defaultPeriodDates(y){return{
  P1:{from:`${y}-09-01`,to:`${y+1}-01-31`,active:false},P2:{from:`${y+1}-02-01`,to:`${y+1}-06-30`,active:false},
  T1:{from:`${y}-09-01`,to:`${y}-11-30`,active:false},T2:{from:`${y}-12-01`,to:`${y+1}-03-31`,active:false},T3:{from:`${y+1}-04-01`,to:`${y+1}-06-30`,active:false}};}
function emptyCore(){const y=2026;return{v:2,settings:{school:"Mokykla",system:"pusm",yearStart:y,rounding:0.5,periods:defaultPeriodDates(y),holidays:[],bells:DEFAULT_BELLS.slice(),demo:false},
  classes:[],subjects:[],groups:[],timetable:[],works:[],prejust:[],subs:[],headSubs:[],plans:[]};}

/* ================= Būsena ================= */
let core=emptyCore(), users={}, gd={}, social={list:[]}, msgs={list:[]};
let ready=false, dialogOpen=false, pendingRender=false;
let session=null;      // prisijungusio asmens (people.id) identifikatorius
let authUser=null;     // Supabase Auth naudotojas
let mfa={enabled:false,factorId:null};
const ui={ttDay:null,wMonth:null,hwTab:"next",dSubj:"*",repStuCls:null,repStu:null,dMonth:null,dTab:"days",lMonth:null,stPer:null,ltab:"pamoka",view:null,gid:null,pid:null,lpid:null,cls:null,sid:null,month:null,week:null,child:null,stPid:null,tab:null,repCls:null,repPid:null,rep:"keys",msgTab:"in",ttTeacher:null,evalCls:null,subTab:"t"};
const authUi={tab:"login",step:"cred",err:"",keyInfo:null,info:"",busy:false,needsSetup:false};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>crypto.randomUUID();
const realToday=()=>new Date().toISOString().slice(0,10);
const fmtD=d=>{const[y,m,dd]=String(d).slice(0,10).split("-");return `${dd}.${m}`};
/* Pamokos raktas: data, o antra ir trečia tos dienos pamoka — „data#2“, „data#3“ */
const lkey=(d,slot)=>(+slot||1)>1?`${d}#${+slot}`:d;
const kDate=k=>String(k||"").slice(0,10);
const kSlot=k=>+(String(k||"").split("#")[1]||1);
const fmtFull=d=>d||"";
const ms=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10));
const iso=t=>new Date(t).toISOString().slice(0,10);
const addDays=(d,n)=>iso(ms(d)+n*864e5);
const wdOf=d=>(new Date(ms(d)).getUTCDay()+6)%7; // 0=Pr
const mondayOf=d=>addDays(d,-wdOf(d));
const lsort=(a,b)=>String(a).localeCompare(String(b),"lt");
const fold=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z]/g,"");

/* ---- Naudotojai ---- */
const U=id=>users[id];
const me=()=>session?users[session]:null;
const uName=id=>{const u=U(id);return u?`${u.last} ${u.first}`:"(pašalintas)";};
const uNameFL=id=>{const u=U(id);return u?`${u.first} ${u.last}`:"(pašalintas)";};
const byName=(a,b)=>lsort(uName(a),uName(b));
const students=()=>Object.values(users).filter(u=>u.role==="student");
const teachers=()=>Object.values(users).filter(u=>hasRole(u,"teacher")).sort((a,b)=>lsort(a.last,b.last));
const staff=()=>Object.values(users).filter(isStaff).sort((a,b)=>lsort(a.last+a.first,b.last+b.first));
const cls=id=>core.classes.find(c=>c.id===id);
const clsName=id=>{const c=cls(id);return c?c.name:"—";};
const classStudents=cid=>students().filter(s=>s.classId===cid).sort((a,b)=>lsort(a.last+a.first,b.last+b.first));
const subj=id=>core.subjects.find(s=>s.id===id);
const subjName=id=>{const s=subj(id);return s?s.name:"(dalykas)";};
const grp=id=>core.groups.find(g=>g.id===id);
const G=gid=>{if(!gd[gid])gd[gid]={lessons:[],grades:[],att:[],pg:{},notes:[]};const g=gd[gid];g.lessons??=[];g.grades??=[];g.att??=[];g.pg??={};g.notes??=[];return g;};

/* ---- Laikotarpiai ---- */
function periodsSys(sys){const s=core.settings;return PDEF[sys].map(([id,name])=>({id,name,...s.periods[id]}));}
const sysOfClass=cid=>{const c=cls(cid);return (c&&c.system)||core.settings.system;};
const sysOfStudent=sid=>{const u=U(sid);return sysOfClass(u&&u.classId);};
const sysOfGroup=g=>g&&g.students.length?sysOfStudent(g.students[0]):core.settings.system;
const periodsG=g=>periodsSys(sysOfGroup(g));
function yearRange(){const p=core.settings.periods;const froms=[p.P1.from,p.T1.from].sort(),tos=[p.P2.to,p.T3.to].sort();return{from:froms[0],to:tos[1]};}
function TODAY(){const r=yearRange();const t=realToday();return t<r.from?r.from:t>r.to?r.to:t;}
function inPeriod(d,pid){d=kDate(d);if(pid==="Y"){const r=yearRange();return d>=r.from&&d<=r.to;}const p=core.settings.periods[pid];return p&&d>=p.from&&d<=p.to;}
function ltHolidays(){const y=core.settings.yearStart;return new Set([`${y}-11-01`,`${y}-11-02`,`${y}-12-24`,`${y}-12-25`,`${y}-12-26`,`${y+1}-01-01`,`${y+1}-02-16`,`${y+1}-03-11`,`${y+1}-05-01`]);}
let _hol=null;function isHoliday(d){d=kDate(d);_hol??=ltHolidays();return _hol.has(d)||core.settings.holidays.some(h=>d>=h.from&&d<=h.to);}

/* ---- Tvarkaraštis ---- */
const ttUntil=t=>t.to?t.to:t.weeks?addDays(t.from,t.weeks*7-1):yearRange().to;
function ttOccurs(t,d){if(d<t.from||d>ttUntil(t)||wdOf(d)!==t.wd||isHoliday(d))return false;const r=yearRange();if(d<r.from||d>r.to)return false;
  if(t.parity&&t.parity!=="all"){const idx=Math.floor((ms(d)-ms(mondayOf(r.from)))/(7*864e5));const odd=idx%2===0;if((t.parity==="odd")!==odd)return false;}return true;}
/* Grąžina Map: pamokos raktas -> pamokos Nr. Kelios pamokos tą pačią dieną gauna raktus data, data#2, data#3 */
function occDates(gid,from,to){from=kDate(from);to=kDate(to);const byDay=new Map();core.timetable.filter(t=>t.g===gid).forEach(t=>{let d=t.from<from?from:t.from;const end=ttUntil(t)<to?ttUntil(t):to;
  d=addDays(d,(t.wd-wdOf(d)+7)%7);for(;d<=end;d=addDays(d,7))if(ttOccurs(t,d)){const a=byDay.get(d)||[];if(!a.includes(t.no))a.push(t.no);byDay.set(d,a);}});
  const out=new Map();[...byDay.keys()].sort().forEach(d=>byDay.get(d).sort((a,b)=>a-b).forEach((no,i)=>out.set(lkey(d,i+1),no)));return out;}

/* ---- Vertinimas ---- */
const numeric=gs=>gs.filter(g=>typeof g.v==="number");
function avgOf(gs){const n=numeric(gs);if(!n.length)return null;return n.reduce((a,g)=>a+g.v,0)/n.length;}
function roundBy(a,thr){if(a==null)return null;const f=Math.floor(a+1e-9);return Math.min(10,Math.max(1,(a-f)+1e-9>=thr?f+1:f));}
const fmtAvg=a=>a==null?"—":a.toFixed(2).replace(".",",");
const VLABEL={neat:"neat.",isk:"įsk.",neisk:"neįsk.",atl:"atl.",pp:"pp.",np:"np."};
const VTITLE={neat:"Neatsiskaitė",isk:"Įskaityta",neisk:"Neįskaityta",atl:"Atliko",pp:"Padarė pažangą",np:"Nepadarė pažangos"};
const GRADE_VALUES=["1","2","3","4","5","6","7","8","9","10","isk","neisk","atl","pp","np","neat"];
/* Pažymiai rodomi paprastu tekstu; raudonai — tik už kontrolinį darbą */
function gClass(v,t){return t==="KD"?"kd":"";}
function chip(g,title=true){const t=title&&g.d?` title="${esc(kDate(g.d))} · ${esc(TYPE_NAME[g.t]||g.t||"")}${g.c?" · "+esc(g.c):""}"`:"";return `<span class="g ${gClass(g.v,g.t)}"${t}>${VLABEL[g.v]??g.v}</span>`;}
const vchip=v=>v==null?'<span class="muted">—</span>':chip({v},false);
function sGrades(gid,sid,pid){return G(gid).grades.filter(g=>g.s===sid&&inPeriod(g.d,pid)).sort((a,b)=>lsort(a.d,b.d));}
function suggest(g,sid,pid){const gs=sGrades(g.id,sid,pid);if((g.evalSys||"10")==="isk"){const i=gs.filter(x=>x.v==="isk").length,n=gs.filter(x=>x.v==="neisk").length;return i+n?(i>=n?"isk":"neisk"):null;}return roundBy(avgOf(gs),core.settings.rounding);}
function annual(g,sid){const pg=G(g.id).pg[sid]||{};const ps=periodsG(g);const vals=ps.map(p=>pg[p.id]);
  if(vals.some(v=>v==null))return{avg:null,sug:null};
  if((g.evalSys||"10")==="isk")return{avg:null,sug:vals.every(v=>v==="isk")?"isk":"neisk"};
  const n=vals.filter(v=>typeof v==="number");if(n.length<vals.length)return{avg:null,sug:null};const a=n.reduce((x,y)=>x+y,0)/n.length;return{avg:a,sug:roundBy(a,0.5)};}

/* ---- Teisės ---- */
/* Pavadavimai galioja tik nurodytu laikotarpiu */
function activeSubsTo(uidT,d){d=d||TODAY();return core.subs.filter(s=>s.to===uidT&&d>=s.dFrom&&d<=s.dTo);}
function subsOverlapping(uidT,from,to){return core.subs.filter(s=>s.to===uidT&&s.dFrom<=to&&s.dTo>=from);}
/* Ar mokytojas (ne savininkas) šią dieną vaduoja grupę */
const isSubGroup=(g,u)=>!!u&&g.teacherId!==u.id;
/* Pamokų pildymui: savos grupės + vykstančių ir būsimų pavadavimų grupės (rodomos tik pavadavimo dienos) */
function journalGroups(tid){const t=TODAY();const subT=new Set(core.subs.filter(s=>s.to===tid&&s.dTo>=t).map(s=>s.from));
  return [...core.groups.filter(g=>g.teacherId===tid),...core.groups.filter(g=>subT.has(g.teacherId)&&g.teacherId!==tid)];}
function canEditDate(g,d){d=kDate(d);const u=me();if(!u||!hasRole(u,"teacher"))return false;if(g.teacherId===u.id)return true;return core.subs.some(s=>s.from===g.teacherId&&s.to===u.id&&d>=s.dFrom&&d<=s.dTo);}
function teacherGroups(tid,withSubs=true){const own=core.groups.filter(g=>g.teacherId===tid);if(!withSubs)return own;const subT=new Set(activeSubsTo(tid).map(s=>s.from));return [...own,...core.groups.filter(g=>subT.has(g.teacherId)&&g.teacherId!==tid)];}
function headClassesOf(tid){const d=TODAY();const own=core.classes.filter(c=>c.headTeacherId===tid);const sub=core.headSubs.filter(h=>h.to===tid&&d>=h.dFrom&&d<=h.dTo).map(h=>cls(h.classId)).filter(Boolean);return [...own,...sub.filter(c=>!own.includes(c))];}
function studentGroups(sid){return core.groups.filter(g=>g.students.includes(sid));}
function viewedStudent(){const u=me();if(!u)return null;if(u.role==="student")return u.id;if(u.role==="parent"){const kids=(u.childIds||[]).filter(id=>U(id));if(!kids.includes(ui.child))ui.child=kids[0]||null;return ui.child;}return null;}


/* ================= Pagalbinės ================= */
function softRender(){if(dialogOpen||(typeof lessonDirty!=="undefined"&&lessonDirty&&ui.view==="t_journal")){pendingRender=true;return;}render();}
let toastT;function toast(msg){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");t.style.cssText="position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:9px 16px;border-radius:20px;font-size:14px;z-index:99;max-width:90vw;text-align:center";document.body.appendChild(t);}t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3200);}
function rndStr(n,al="abcdefghijkmnpqrstuvwxyz23456789"){const a=new Uint32Array(n);crypto.getRandomValues(a);return [...a].map(x=>al[x%al.length]).join("");}
function genKey(first,last,letter){const f=(fold(first)+"xxxx").slice(0,4),l=(fold(last)+"xxxx").slice(0,4);return f+l+letter+rndStr(11,"abcdefghijkmnpqrstuvwxyz0123456789");}
function pwProblem(pw){if(pw.length<8)return"Slaptažodis turi būti bent 8 simbolių.";if(!/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/.test(pw)||!/\d/.test(pw))return"Slaptažodyje turi būti ir raidžių, ir skaičių.";return null;}
const loginEmail=l=>{l=String(l).trim().toLowerCase();return l.includes("@")?l:`${l}@${CONFIG.LOGIN_EMAIL_DOMAIN}`;};
const parseV=v=>/^\d+$/.test(v)?+v:v;

const TRASH_SVG=`<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M6 1.5h4l.5 1H14v1.5H2V2.5h3.5zM3.2 5h9.6l-.7 9.1c-.05.5-.47.9-.98.9H4.88c-.51 0-.93-.4-.98-.9zm2.6 1.6v6.6h1.1V6.6zm3.3 0v6.6h1.1V6.6z"/></svg>`;

/* Socialinė-pilietinė veikla: atlikta / planas */
const socDone=sid=>social.list.reduce((t,x)=>t+(x.hours[sid]||0),0);
const socPlan=sid=>{const c=cls((U(sid)||{}).classId);return c&&c.socialPlan!=null?c.socialPlan:null;};
const fmtH=h=>String(Math.round(h*10)/10).replace(".",",");
function socProgress(sid){const d=socDone(sid),p=socPlan(sid);if(p==null)return `<b>${fmtH(d)}</b> val.`;const pct=Math.min(100,p?d/p*100:100);
  return `<span class="socp"><b>${fmtH(d)} / ${fmtH(p)}</b> val.<span class="socbar" role="img" aria-label="Atlikta ${fmtH(d)} iš ${fmtH(p)} valandų"><i style="width:${pct}%"></i></span>${d>=p?'<span class="tag ok">Įvykdyta</span>':`<span class="small muted">liko ${fmtH(p-d)}</span>`}</span>`;}
