/* Dienynas — Supabase duomenų sluoksnis: įkėlimas, rašymas, realaus laiko atnaujinimai */
const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "dienynas-auth" },
});

/* ---------- Įkėlimas ---------- */
const ORDER = { targets: ["student_id", "group_id"], contacts: ["person_id"], 
  group_students: ["group_id", "student_id"], parent_children: ["parent_id", "student_id"],
  period_grades: ["group_id", "student_id", "period"], social_hours: ["social_id", "student_id"],
  message_recipients: ["message_id", "recipient_id"],
};
const OPTIONAL_TABLES = ["targets", "contacts", "events"]; // jei SQL dar nepaleistas, dienynas veikia be jų
async function fetchAll(table) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select("*");
    (ORDER[table] || ["id"]).forEach(c => { q = q.order(c); });
    const { data, error } = await q.range(from, from + 999);
    if (error) { if (OPTIONAL_TABLES.includes(table)) return out; throw error; }
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}
const TABLES = ["settings","people","reg_keys","parent_children","classes","subjects","plans","groups","group_students","timetable",
  "lessons","grades","attendance","notes","period_grades","works","prejust","subs","head_subs","social","social_hours","messages","message_recipients","targets","contacts","events"];

async function loadSettingsPublic() {
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();
  if (data) core.settings = mapSettings(data);
  const r = await sb.rpc("has_admin");
  authUi.needsSetup = r.error ? false : !r.data;
  if (r.error) authUi.dbError = r.error.message;
}
function mapSettings(s) {
  return { school: s.school, yearStart: s.year_start, system: s.system, rounding: Number(s.rounding), periods: s.periods, holidays: s.holidays || [], bells: Array.isArray(s.bells) ? s.bells : DEFAULT_BELLS.slice(), attWarn: s.att_warn == null ? 10 : Number(s.att_warn), demo: false };
}
async function loadAll(guard) {
  const res = await Promise.all(TABLES.map(fetchAll));
  if (guard && !guard()) return false;
  const D = Object.fromEntries(TABLES.map((t, i) => [t, res[i]]));
  const c = emptyCore();
  if (D.settings[0]) c.settings = mapSettings(D.settings[0]);
  c.classes = D.classes.map(x => ({ id: x.id, name: x.name, level: x.level, system: x.system, headTeacherId: x.head_teacher_id || "", socialPlan: x.social_plan == null ? null : Number(x.social_plan) }));
  c.subjects = D.subjects.map(x => ({ id: x.id, name: x.name, kind: x.kind, parentId: x.parent_id || "", code: x.code || "" }));
  c.plans = D.plans.map(x => ({ id: x.id, ownerId: x.owner_id, name: x.name, desc: x.descr || "", subjectId: x.subject_id || "", topics: x.topics || [] }));
  c.groups = D.groups.map(x => ({ id: x.id, name: x.name, subjectId: x.subject_id, teacherId: x.teacher_id, kind: x.kind, level: x.level || "", hours: x.hours,
    evalSys: x.eval_sys, extra: x.extra || {}, planId: x.plan_id || "", students: [], programs: {} }));
  const gi = Object.fromEntries(c.groups.map(g => [g.id, g]));
  D.group_students.forEach(x => { const g = gi[x.group_id]; if (!g) return; g.students.push(x.student_id); if (x.program) g.programs[x.student_id] = x.program; });
  c.timetable = D.timetable.map(x => ({ id: x.id, g: x.group_id, wd: x.wd, no: x.no, from: x.date_from, to: x.date_to || null, weeks: x.weeks, parity: x.parity }));
  c.works = D.works.map(x => ({ id: x.id, g: x.group_id, d: x.date, t: x.type, topic: x.topic }));
  c.prejust = D.prejust.map(x => ({ id: x.id, s: x.student_id, from: x.date_from, to: x.date_to, j: x.code }));
  c.subs = D.subs.map(x => ({ id: x.id, from: x.from_teacher, to: x.to_teacher, dFrom: x.date_from, dTo: x.date_to }));
  c.headSubs = D.head_subs.map(x => ({ id: x.id, classId: x.class_id, to: x.to_teacher, dFrom: x.date_from, dTo: x.date_to }));

  const u = {};
  D.people.forEach(p => { u[p.id] = { id: p.id, role: p.role, roles: Array.isArray(p.roles) ? p.roles : [], first: p.first_name, last: p.last_name, classId: p.class_id || "", email: p.email || "",
    birth: p.birth || "", login: p.login || null, userId: p.user_id || null, mustChange: p.must_change, lastSeen: p.last_seen || "", key: null, parentKeys: [], childIds: [] }; });
  D.reg_keys.forEach(k => { const p = u[k.person_id]; if (!p) return; if (k.kind === "own") p.key = k.key; else p.parentKeys.push({ id: k.id, key: k.key, usedBy: k.used_by }); });
  D.parent_children.forEach(x => { if (u[x.parent_id]) u[x.parent_id].childIds.push(x.student_id); });

  (D.targets || []).forEach(x => { c.targets[x.student_id + "|" + x.group_id] = Number(x.target); });
  (D.contacts || []).forEach(x => { c.contacts[x.person_id] = { phone: x.phone || "", note: x.note || "" }; });
  c.events = (D.events || []).map(x => ({ id: x.id, title: x.title, descr: x.descr || "", from: x.date_from, to: x.date_to, classId: x.class_id || "", by: x.created_by }));
  const g = {};
  const GG = id => (g[id] ??= { lessons: [], grades: [], att: [], pg: {}, notes: [] });
  D.lessons.forEach(x => GG(x.group_id).lessons.push({ id: x.id, d: lkey(x.date, x.slot), no: x.no, t: x.type, topic: x.topic, cw: x.classwork || "", hw: x.hw, hwDue: x.hw_due || "", hwAt: x.hw_at || "" }));
  D.grades.forEach(x => GG(x.group_id).grades.push({ id: x.id, s: x.student_id, d: lkey(x.date, x.slot), t: x.type, v: parseV(x.value), c: x.comment, by: x.created_by, at: x.created_at }));
  D.attendance.forEach(x => GG(x.group_id).att.push({ id: x.id, s: x.student_id, d: lkey(x.date, x.slot), m: x.mark, j: x.just, at: x.created_at || "" }));
  D.notes.forEach(x => GG(x.group_id).notes.push({ id: x.id, s: x.student_id, d: lkey(x.date, x.slot), kind: x.kind, text: x.text, by: x.created_by, at: x.created_at || "" }));
  D.period_grades.forEach(x => { const pg = GG(x.group_id).pg; (pg[x.student_id] ??= {})[x.period] = parseV(x.value); });

  const hours = {};
  D.social_hours.forEach(h => { (hours[h.social_id] ??= {})[h.student_id] = Number(h.hours); });
  const soc = { list: D.social.map(x => ({ id: x.id, type: x.type, partner: x.partner, activity: x.activity, comment: x.comment, d: x.date, by: x.created_by, hours: hours[x.id] || {} })) };

  const rec = {};
  D.message_recipients.forEach(r => { (rec[r.message_id] ??= []).push(r); });
  const ms = { list: D.messages.map(m => ({ id: m.id, from: m.from_id, subj: m.subject, body: m.body, at: m.created_at,
    to: (rec[m.id] || []).map(r => r.recipient_id), read: Object.fromEntries((rec[m.id] || []).filter(r => r.read_at).map(r => [r.recipient_id, true])),
    deleted: Object.fromEntries((rec[m.id] || []).filter(r => r.deleted_at).map(r => [r.recipient_id, true])) })) };

  core = c; users = u; gd = g; social = soc; msgs = ms; _hol = null;
  const mine = Object.values(u).find(p => authUser && p.userId === authUser.id);
  session = mine ? mine.id : null;
}

/* ---------- Rašymas ---------- */
/* Vykstantys įrašymai: kol jie nesibaigė, duomenų iš serverio iš naujo neįkeliame,
   kad ką tik įvesti įrašai neišnyktų ir vėl neatsirastų. */
let pendingWrites = 0, writeSeq = 0, lastWrite = 0;
async function W(promise, quiet) {
  pendingWrites++; writeSeq++; lastWrite = Date.now();
  let res;
  try { res = await promise; } catch (e) { res = { data: null, error: e }; }
  finally { pendingWrites--; writeSeq++; lastWrite = Date.now(); }
  const { data, error } = res;
  if (error) {
    console.error(error);
    if (!quiet) toast("Nepavyko išsaugoti: " + (error.message || "klaida"));
    scheduleReload(300);
    return null;
  }
  return data ?? true;
}
const R = {
  cls: c => ({ id: c.id, name: c.name, level: c.level, system: c.system, head_teacher_id: c.headTeacherId || null, social_plan: c.socialPlan == null ? null : c.socialPlan }),
  subject: s => ({ id: s.id, name: s.name, kind: s.kind, parent_id: s.parentId || null, code: s.code || null }),
  person: p => ({ id: p.id, role: p.role, ...(p.roles ? { roles: p.roles } : {}), first_name: p.first, last_name: p.last, class_id: p.classId || null, email: p.email || null, birth: p.birth || null }),
  group: g => ({ id: g.id, name: g.name, subject_id: g.subjectId, teacher_id: g.teacherId, kind: g.kind, level: g.level || null, hours: g.hours,
    eval_sys: g.evalSys || "10", extra: g.extra || {}, plan_id: g.planId || null }),
  members: g => g.students.map(s => ({ group_id: g.id, student_id: s, program: (g.programs || {})[s] || null })),
  tt: t => ({ id: t.id, group_id: t.g, wd: t.wd, no: t.no, date_from: t.from, weeks: t.weeks, parity: t.parity || "all", ...(t.to ? { date_to: t.to } : {}) }),
  lesson: (gid, l) => ({ group_id: gid, date: kDate(l.d), slot: kSlot(l.d), no: l.no || null, type: l.t || "", topic: l.topic || "", classwork: l.cw || "", hw: l.hw || "", hw_due: l.hwDue || null, ...(l.hwAt ? { hw_at: l.hwAt } : {}) }),
  grade: (gid, x) => ({ id: x.id, group_id: gid, student_id: x.s, date: kDate(x.d), slot: kSlot(x.d), type: x.t, value: String(x.v), comment: x.c || "", created_by: x.by || null }),
  att: (gid, a) => ({ group_id: gid, student_id: a.s, date: kDate(a.d), slot: kSlot(a.d), mark: a.m, just: a.j || null, ...(a.at ? { created_at: a.at } : {}) }),
  note: (gid, n) => ({ id: n.id, group_id: gid, student_id: n.s, date: kDate(n.d), slot: kSlot(n.d), kind: n.kind, text: n.text, created_by: n.by || null, ...(n.at ? { created_at: n.at } : {}) }),
  work: w => ({ id: w.id, group_id: w.g, date: w.d, type: w.t, topic: w.topic || "" }),
  prejust: p => ({ id: p.id, student_id: p.s, date_from: p.from, date_to: p.to, code: p.j }),
  sub: s => ({ id: s.id, from_teacher: s.from, to_teacher: s.to, date_from: s.dFrom, date_to: s.dTo }),
  hsub: s => ({ id: s.id, class_id: s.classId, to_teacher: s.to, date_from: s.dFrom, date_to: s.dTo }),
  plan: p => ({ id: p.id, owner_id: p.ownerId, name: p.name, descr: p.desc || "", subject_id: p.subjectId || null, topics: p.topics }),
  settings: s => ({ school: s.school, year_start: s.yearStart, system: s.system, rounding: s.rounding, periods: s.periods, holidays: s.holidays, bells: s.bells || DEFAULT_BELLS, att_warn: s.attWarn == null ? 10 : s.attWarn }),
};
const DB = {
  ins: (t, rows) => W(sb.from(t).insert(rows)),
  up: (t, rows, onConflict) => W(sb.from(t).upsert(rows, onConflict ? { onConflict } : {})),
  upd: (t, patch, match) => W(sb.from(t).update(patch).match(match)),
  del: (t, match) => W(sb.from(t).delete().match(match)),
  rpc: (fn, args) => W(sb.rpc(fn, args || {})),
  settings: () => W(sb.from("settings").update(R.settings(core.settings)).eq("id", 1)),
  async saveGroup(g, isNew) {
    if (!(await (isNew ? DB.ins("groups", R.group(g)) : DB.upd("groups", R.group(g), { id: g.id })))) return false;
    if (!(await DB.del("group_students", { group_id: g.id }))) return false;
    if (g.students.length && !(await DB.ins("group_students", R.members(g)))) return false;
    return true;
  },
  lesson: (gid, l) => DB.up("lessons", R.lesson(gid, l), "group_id,date,slot"),
  att: (gid, a) => DB.up("attendance", R.att(gid, a), "group_id,student_id,date,slot"),
  delAtt: (gid, sid, d) => DB.del("attendance", { group_id: gid, student_id: sid, date: kDate(d), slot: kSlot(d) }),
  pg: (gid, sid, period, v) => DB.up("period_grades", { group_id: gid, student_id: sid, period, value: String(v), updated_at: new Date().toISOString() }, "group_id,student_id,period"),
  delPg: (gid, sid, period) => DB.del("period_grades", { group_id: gid, student_id: sid, period }),
  async bulk(table, rows, size = 500) {
    for (let i = 0; i < rows.length; i += size) { if (!(await DB.ins(table, rows.slice(i, i + size)))) return false; }
    return true;
  },
  async adminFn(action, personId, extra) {
    const { data, error } = await sb.functions.invoke("admin-users", { body: { action, personId, ...(extra || {}) } });
    if (error || (data && data.error)) {
      let msg = (data && data.error) || error.message || "klaida";
      try { const b = await error.context.json(); if (b && b.error) msg = b.error; } catch (e) {}
      toast("Nepavyko: " + msg + ". Ar įdiegta Edge funkcija „admin-users“?");
      return null;
    }
    return data || {};
  },
};

/* ---------- Realaus laiko atnaujinimai ---------- */
let reloadT = null, channel = null;
function scheduleReload(ms = 1200) {
  clearTimeout(reloadT);
  reloadT = setTimeout(async () => {
    if (!authUser) return;
    // Palaukiame, kol baigsis visi įrašymai ir 2,5 s nebus naujų
    if (pendingWrites > 0 || Date.now() - lastWrite < 2500) { scheduleReload(1000); return; }
    const seq = writeSeq;
    try {
      const ok = await loadAll(() => seq === writeSeq && pendingWrites === 0);
      if (ok === false) { scheduleReload(1000); return; }
      softRender();
    } catch (e) { console.error(e); }
  }, ms);
}
function subscribeRealtime() {
  if (channel) return;
  channel = sb.channel("dienynas-db")
    .on("postgres_changes", { event: "*", schema: "public" }, () => scheduleReload(1500))
    .subscribe();
}
function unsubscribeRealtime() { if (channel) { sb.removeChannel(channel); channel = null; } }

/* ---------- Eksportas ---------- */
function exportFile(filename, data, mime) {
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const csv = rows => rows.map(r => r.map(c => { c = String(c ?? ""); return /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c; }).join(";")).join("\n");
