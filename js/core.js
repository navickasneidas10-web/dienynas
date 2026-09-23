/* Dienynas — konstantos, būsena ir skaičiavimai */
/* ================= Konstantos ================= */
const TYPES=[["KD","Kontrolinis darbas"],["SD","Savarankiškas darbas"],["KL","Klasės darbas"],["ND","Namų darbai"],["PR","Praktinis / laboratorinis darbas"],["PJ","Projektinis darbas"],["TA","Testas / apklausa"],["KM","Pažymys iš kitos mokyklos"]];
const TYPE_NAME=Object.fromEntries(TYPES);
const WORK_TYPES=TYPES.filter(([k])=>["KD","SD","PR","PJ","TA"].includes(k));
const JUST=[["nt","Pateisinta tėvų (dėl ligos)"],["np","Pateisinta (kita priežastis)"],["nl","Pateisinta (dėl ligos)"],["nk","Pateisinta tėvų (ne dėl ligos)"],["ns","Pateisinta (direktoriaus įsakymu)"],["nv","Pateisinta (varžybos, olimpiados)"]];
const JUST_NAME=Object.fromEntries(JUST);
const KINDS={klase:"Mokomojo dalyko grupė",pogrupis:"Pogrupis (mobilioji grupė)",srautas:"Srautas"};
const MONTHS=["sausis","vasaris","kovas","balandis","gegužė","birželis","liepa","rugpjūtis","rugsėjis","spalis","lapkritis","gruodis"];
const WD=["Pr","An","Tr","Kt","Pn","Št","Sk"];
const WDL=["Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis"];
const PDEF={pusm:[["P1","I pusmetis"],["P2","II pusmetis"]],trim:[["T1","I trimestras"],["T2","II trimestras"],["T3","III trimestras"]]};
const PNAME={P1:"I pusmetis",P2:"II pusmetis",T1:"I trimestras",T2:"II trimestras",T3:"III trimestras",Y:"Metinis"};
const SOC_TYPES=["Pagalba žmonėms","Aplinkosauginė veikla","Kultūrinė veikla","Pilietinė veikla","Savanorystė mokykloje","Sportinė veikla"];
const ROLE_NAME={admin:"Administratorius",teacher:"Mokytojas",student:"Mokinys",parent:"Tėvai"};
const EVAL_SYS={"10":"Dešimtbalė sistema",isk:"Vertinimas įskaita"};

function defaultPeriodDates(y){return{
  P1:{from:`${y}-09-01`,to:`${y+1}-01-31`,active:false},P2:{from:`${y+1}-02-01`,to:`${y+1}-06-30`,active:false},
  T1:{from:`${y}-09-01`,to:`${y}-11-30`,active:false},T2:{from:`${y}-12-01`,to:`${y+1}-03-31`,active:false},T3:{from:`${y+1}-04-01`,to:`${y+1}-06-30`,active:false}};}
function emptyCore(){const y=2026;return{v:2,settings:{school:"Mokykla",system:"pusm",yearStart:y,rounding:0.5,periods:defaultPeriodDates(y),holidays:[],demo:false},
  classes:[],subjects:[],groups:[],timetable:[],works:[],prejust:[],subs:[],headSubs:[],plans:[]};}

/* ================= Būsena ================= */
let core=emptyCore(), users={}, gd={}, social={list:[]}, msgs={list:[]};
let ready=false, dialogOpen=false, pendingRender=false;
let session=null;      // prisijungusio asmens (people.id) identifikatorius
let authUser=null;     // Supabase Auth naudotojas
let mfa={enabled:false,factorId:null};
const ui={view:null,gid:null,pid:null,lpid:null,cls:null,sid:null,month:null,week:null,child:null,stPid:null,tab:null,repCls:null,repPid:null,rep:"keys",msgTab:"in",ttTeacher:null,evalCls:null,subTab:"t"};
const authUi={tab:"login",step:"cred",err:"",keyInfo:null,info:"",busy:false,needsSetup:false};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>crypto.randomUUID();
const realToday=()=>new Date().toISOString().slice(0,10);
const fmtD=d=>{const[y,m,dd]=d.split("-");return `${dd}.${m}`};
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
const teachers=()=>Object.values(users).filter(u=>u.role==="teacher").sort((a,b)=>lsort(a.last,b.last));
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
function inPeriod(d,pid){if(pid==="Y"){const r=yearRange();return d>=r.from&&d<=r.to;}const p=core.settings.periods[pid];return p&&d>=p.from&&d<=p.to;}
function ltHolidays(){const y=core.settings.yearStart;return new Set([`${y}-11-01`,`${y}-11-02`,`${y}-12-24`,`${y}-12-25`,`${y}-12-26`,`${y+1}-01-01`,`${y+1}-02-16`,`${y+1}-03-11`,`${y+1}-05-01`]);}
let _hol=null;function isHoliday(d){_hol??=ltHolidays();return _hol.has(d)||core.settings.holidays.some(h=>d>=h.from&&d<=h.to);}

/* ---- Tvarkaraštis ---- */
const ttUntil=t=>t.weeks?addDays(t.from,t.weeks*7-1):yearRange().to;
function ttOccurs(t,d){if(d<t.from||d>ttUntil(t)||wdOf(d)!==t.wd||isHoliday(d))return false;const r=yearRange();if(d<r.from||d>r.to)return false;
  if(t.parity&&t.parity!=="all"){const idx=Math.floor((ms(d)-ms(mondayOf(r.from)))/(7*864e5));const odd=idx%2===0;if((t.parity==="odd")!==odd)return false;}return true;}
function occDates(gid,from,to){const out=new Map();core.timetable.filter(t=>t.g===gid).forEach(t=>{let d=t.from<from?from:t.from;const end=ttUntil(t)<to?ttUntil(t):to;
  d=addDays(d,(t.wd-wdOf(d)+7)%7);for(;d<=end;d=addDays(d,7))if(ttOccurs(t,d))out.set(d,t.no);});return out;}

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
function chip(g,title=true){const t=title&&g.d?` title="${esc(g.d)} · ${esc(TYPE_NAME[g.t]||g.t||"")}${g.c?" · "+esc(g.c):""}"`:"";return `<span class="g ${gClass(g.v,g.t)}"${t}>${VLABEL[g.v]??g.v}</span>`;}
const vchip=v=>v==null?'<span class="muted">—</span>':chip({v},false);
function sGrades(gid,sid,pid){return G(gid).grades.filter(g=>g.s===sid&&inPeriod(g.d,pid)).sort((a,b)=>lsort(a.d,b.d));}
function suggest(g,sid,pid){const gs=sGrades(g.id,sid,pid);if((g.evalSys||"10")==="isk"){const i=gs.filter(x=>x.v==="isk").length,n=gs.filter(x=>x.v==="neisk").length;return i+n?(i>=n?"isk":"neisk"):null;}return roundBy(avgOf(gs),core.settings.rounding);}
function annual(g,sid){const pg=G(g.id).pg[sid]||{};const ps=periodsG(g);const vals=ps.map(p=>pg[p.id]);
  if(vals.some(v=>v==null))return{avg:null,sug:null};
  if((g.evalSys||"10")==="isk")return{avg:null,sug:vals.every(v=>v==="isk")?"isk":"neisk"};
  const n=vals.filter(v=>typeof v==="number");if(n.length<vals.length)return{avg:null,sug:null};const a=n.reduce((x,y)=>x+y,0)/n.length;return{avg:a,sug:roundBy(a,0.5)};}

/* ---- Teisės ---- */
function activeSubsTo(uidT){return core.subs.filter(s=>s.to===uidT);}
function canEditDate(g,d){const u=me();if(!u||u.role!=="teacher")return false;if(g.teacherId===u.id)return true;return core.subs.some(s=>s.from===g.teacherId&&s.to===u.id&&d>=s.dFrom&&d<=s.dTo);}
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
