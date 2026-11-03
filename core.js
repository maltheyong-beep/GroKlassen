export const CLASSES = ['7.A', '7.B', '8.A'];
export const LIMIT = 15;
export const CUP = { start: '2026-11-02', end: '2026-11-29' };
export const STAGES = [
  { min: 0, name: 'Frø', text: 'Alle store forandringer begynder med noget småt.' },
  { min: 30, name: 'Spire', text: 'Jeres nye vaner er begyndt at slå rødder.' },
  { min: 80, name: 'Lille plante', text: 'Lidt hver dag. Se, hvor langt I er kommet.' },
  { min: 140, name: 'Ungt træ', text: 'I er ved at skabe stærke vaner. Sammen.' },
  { min: 180, name: 'Stort træ', text: 'Et stærkt fællesskab med plads til at vokse videre.' }
];
export const ACTIONS = [
  { id: 'bike', icon: 'bike', title: 'Tag den grønne vej', subtitle: 'Cykel eller gå i skole', description: 'Lad bilen stå, og gå eller cykl til skole, hvis du har mulighed for det.', category: 'Transport', points: 3, co2: 400, water: 0, assumption: 'En kort biltur erstattes af gang eller cykling. Afstand og biltype er ikke registreret, så den reelle effekt kan variere meget.' },
  { id: 'sort', icon: 'recycle', title: 'Giv affaldet en chance', subtitle: 'Sortér affald korrekt', description: 'Find den rigtige beholder til papir, plast, metal eller madaffald i klassen.', category: 'Affald', points: 2, co2: 50, water: 0, assumption: 'Et lille bidrag til korrekt affaldssortering. Mængde, materiale og lokal behandling er ikke målt.' },
  { id: 'shower', icon: 'drop', title: 'To minutter gør en forskel', subtitle: 'Tag et kortere bad', description: 'Gør dit bad cirka to minutter kortere, og spar på det varme vand.', category: 'Vand', points: 3, co2: 20, water: 15, assumption: 'Prototypeantagelse: 2 minutter × 7,5 liter/minut = 15 liter. CO₂ er et selvstændigt, foreløbigt skøn; varmtvandskilde og temperatur er ikke målt.' },
  { id: 'lunchbox', icon: 'box', title: 'Pak ind med omtanke', subtitle: 'Madpakke uden engangsplast', description: 'Brug en madkasse og en drikkedunk, du allerede har, i stedet for engangsplast.', category: 'Forbrug', points: 3, co2: 20, water: 0, assumption: 'Et lille stykke engangsplast erstattes af en eksisterende madkasse eller drikkedunk. Produktion og opvask er ikke beregnet.' },
  { id: 'light', icon: 'bulb', title: 'Sidste mand slukker', subtitle: 'Sluk lyset', description: 'Sluk lyset, når alle forlader klasselokalet, og ingen har brug for det.', category: 'Energi', points: 2, co2: 10, water: 0, assumption: 'Lyset slukkes i et tomt lokale. Effekt, varighed og elproduktion er ikke registreret. Besparelsen er et foreløbigt skøn.' },
  { id: 'repair', icon: 'tool', title: 'Giv tingene et liv mere', subtitle: 'Reparér frem for at smide ud', description: 'Sy et hul, lim noget sammen, eller giv en brugsting lidt ekstra levetid.', category: 'Forbrug', points: 4, co2: 500, water: 0, assumption: 'En mindre reparation kan udsætte et nykøb. Produktets type og levetid er ukendt; skønnet er ikke en livscyklusanalyse.' },
  { id: 'plants', icon: 'leaf', title: 'Mere grønt på menuen', subtitle: 'Plantebaseret frokost', description: 'Prøv en frokost uden kød og ost, fx med bønner, linser eller grøntsager.', category: 'Mad', points: 3, co2: 100, water: 0, assumption: 'En plantebaseret frokost erstatter en frokost med kød eller ost. Ingredienser, portioner og alternativ er ikke registreret.' },
  { id: 'reuse', icon: 'arrows', title: 'Nyt for dig. Godt for alle.', subtitle: 'Byt, lån eller køb brugt', description: 'Brug noget, der allerede findes, når det kan erstatte et nyt køb.', category: 'Forbrug', points: 4, co2: 500, water: 0, assumption: 'Genbrug eller lån erstatter et nykøb. Produkt og transport er ukendt. Effekten afhænger af, om nykøbet faktisk undgås.' },
  { id: 'screens', icon: 'power', title: 'Giv strømmen en pause', subtitle: 'Sluk skærme og opladere', description: 'Sluk projektor og skærme, og afbryd unødvendige opladere efter timen.', category: 'Energi', points: 1, co2: 7, water: 0, assumption: 'Noget unødvendigt standbyforbrug undgås. Udstyr, effekt, varighed og strømtype er ikke målt.' }
];
export const actionById = id => ACTIONS.find(a => a.id === id);
const copy = value => JSON.parse(JSON.stringify(value));
export function dayKey(instant = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(instant));
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type).value).join('-');
}
export function shiftDay(key, offset) {
  const d = new Date(key + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10);
}
export function weekKey(key) {
  const d = new Date(key + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y = d.getUTCFullYear(), start = new Date(Date.UTC(y, 0, 1, 12));
  return `${y}-W${String(Math.ceil((((d - start) / 86400000) + 1) / 7)).padStart(2, '0')}`;
}
export function weekStart(key) {
  const d = new Date(key + 'T12:00:00Z'); return shiftDay(key, 1 - (d.getUTCDay() || 7));
}
export function ageDays(key, today) {
  return Math.round((new Date(today + 'T12:00:00Z') - new Date(key + 'T12:00:00Z')) / 86400000);
}
export function emptyState() {
  return { version: 1, classes: Object.fromEntries(CLASSES.map(c => [c, { goal: 30, entries: [], joined: false, team: '' }])), celebrated: [] };
}
export function normalizeState(value) {
  if (!value || value.version !== 1 || !value.classes) throw new Error('Dataformatet kunne ikke læses.');
  const state = emptyState(), ids = new Set();
  for (const c of CLASSES) {
    const from = value.classes[c];
    if (!from || !Array.isArray(from.entries)) throw new Error('Klassedata er ufuldstændige.');
    state.classes[c].goal = Number.isInteger(from.goal) && from.goal >= 1 && from.goal <= 1000 ? from.goal : 30;
    state.classes[c].joined = from.joined === true;
    state.classes[c].team = typeof from.team === 'string' ? from.team.slice(0, 40) : '';
    for (const e of from.entries) {
      if (!e || typeof e.id !== 'string' || ids.has(e.id) || !actionById(e.action) || !['pending', 'approved', 'rejected'].includes(e.status) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || Number.isNaN(Date.parse(e.date)) || Number.isNaN(Date.parse(e.submittedAt))) throw new Error('En indsendelse kunne ikke læses.');
      ids.add(e.id);
      state.classes[c].entries.push({ id: e.id, action: e.action, status: e.status, date: e.date, submittedAt: e.submittedAt, reviewedAt: typeof e.reviewedAt === 'string' ? e.reviewedAt : null });
    }
  }
  state.celebrated = Array.isArray(value.celebrated) ? value.celebrated.filter(v => typeof v === 'string').slice(-200) : [];
  return state;
}
export function points(entries) { return entries.reduce((n, e) => n + actionById(e.action).points, 0); }
export function reserved(klass, date) { return points(klass.entries.filter(e => e.date === date && e.status !== 'rejected')); }
export function stats(klass, date = dayKey()) {
  const approved = klass.entries.filter(e => e.status === 'approved');
  const pending = klass.entries.filter(e => e.status === 'pending');
  return { total: points(approved), co2: approved.reduce((n, e) => n + actionById(e.action).co2, 0), water: approved.reduce((n, e) => n + actionById(e.action).water, 0), pending: pending.length, old: pending.filter(e => e.date < date).length, today: points(approved.filter(e => e.date === date)), used: reserved(klass, date), week: points(approved.filter(e => weekKey(e.date) === weekKey(date))) };
}
export function submit(state, c, action, now = new Date(), id = crypto.randomUUID()) {
  const a = actionById(action); if (!a || !state.classes[c]) throw new Error('Vælg en gyldig handling og klasse.');
  const date = dayKey(now), klass = state.classes[c];
  if (reserved(klass, date) + a.points > LIMIT) throw new Error('Klassen har ikke plads til denne handling inden for dagens 15 point.');
  const next = copy(state);
  next.classes[c].entries.push({ id, action, status: 'pending', date, submittedAt: new Date(now).toISOString(), reviewedAt: null });
  return next;
}
export function moderate(state, c, ids, status, now = new Date()) {
  if (!['approved', 'rejected'].includes(status) || !state.classes[c]) throw new Error('Ugyldig godkendelse.');
  const next = copy(state), klass = next.classes[c], chosen = new Set(ids); let updated = 0, skipped = 0;
  for (const e of klass.entries) {
    if (!chosen.has(e.id)) continue;
    if (e.status !== 'pending') { skipped++; continue; }
    const dayApproved = points(klass.entries.filter(x => x.status === 'approved' && x.date === e.date));
    if (status === 'approved' && dayApproved + actionById(e.action).points > LIMIT) { skipped++; continue; }
    e.status = status; e.reviewedAt = new Date(now).toISOString(); updated++;
  }
  return { state: next, updated, skipped };
}
export function stageFor(total) { return STAGES.reduce((chosen, s, i) => total >= s.min ? i : chosen, 0); }
export function history(klass, today = dayKey()) {
  const start = weekStart(today);
  return Array.from({ length: 8 }, (_, i) => {
    const key = weekKey(shiftDay(start, (i - 7) * 7));
    return { key, label: 'Uge ' + Number(key.slice(6)), points: points(klass.entries.filter(e => e.status === 'approved' && weekKey(e.date) === key)) };
  });
}
export function ranking(state, today = dayKey(), cup = false) {
  const rows = CLASSES.filter(c => !cup || state.classes[c].joined).map(c => ({ c, team: state.classes[c].team, points: cup ? points(state.classes[c].entries.filter(e => e.status === 'approved' && e.date >= CUP.start && e.date <= CUP.end)) : stats(state.classes[c], today).week }));
  rows.sort((a, b) => b.points - a.points || a.c.localeCompare(b.c));
  rows.forEach((r, i) => { r.rank = i && r.points === rows[i - 1].points ? rows[i - 1].rank : i + 1; }); return rows;
}
export function cupStatus(today = dayKey()) { return today < CUP.start ? 'upcoming' : today > CUP.end ? 'ended' : 'active'; }
export const FINANCE = {
  cautious: { schools: 8, price: 1500, municipalities: 0, municipalPrice: 12000, municipalSchools: 10, variable: 150, hosting: 4000, support: 6000, development: 20000, salary: 0 },
  expected: { schools: 25, price: 1500, municipalities: 1, municipalPrice: 12000, municipalSchools: 10, variable: 150, hosting: 4000, support: 6000, development: 20000, salary: 0 },
  optimistic: { schools: 60, price: 1500, municipalities: 3, municipalPrice: 12000, municipalSchools: 10, variable: 150, hosting: 5000, support: 12000, development: 30000, salary: 0 }
};
export function finance(input) {
  for (const k of Object.keys(FINANCE.expected)) if (!Number.isFinite(input[k]) || input[k] < 0 || input[k] > 100000000) throw new Error('Brug tal mellem 0 og 100.000.000.');
  for (const k of ['schools', 'municipalities', 'municipalSchools']) if (!Number.isInteger(input[k])) throw new Error('Antal skoler og aftaler skal være hele tal.');
  const totalSchools = input.schools + input.municipalities * input.municipalSchools;
  const revenue = input.schools * input.price + input.municipalities * input.municipalPrice;
  const fixed = input.hosting + input.support + input.development + input.salary;
  const costs = fixed + totalSchools * input.variable;
  const contribution = input.price - input.variable;
  const remaining = fixed - input.municipalities * (input.municipalPrice - input.municipalSchools * input.variable);
  return { revenue, costs, profit: revenue - costs, totalSchools, fixed, contribution, remaining, breakEven: remaining <= 0 ? 0 : contribution > 0 ? Math.ceil(remaining / contribution) : null };
}
export function seedDemo(now = new Date()) {
  const state = emptyState(), today = dayKey(now), monday = weekStart(today); let serial = 0;
  const seedEntry = (c, action, date, status = 'approved') => state.classes[c].entries.push({ id: `demo-${++serial}`, action, date, status, submittedAt: date + 'T10:30:00Z', reviewedAt: status === 'approved' ? date + 'T11:00:00Z' : null });
  seedEntry('7.A', 'shower', today, 'pending'); seedEntry('7.A', 'light', today, 'pending'); seedEntry('7.A', 'sort', shiftDay(today, -8), 'pending');
  const targets = [10, 15, 22, 26, 30, 33, 18, 24];
  CLASSES.forEach((c, ci) => {
    targets.forEach((target, wi) => {
      let left = Math.round(target * [1, .79, .54][ci]);
      for (let d = 0; d < 7 && left; d++) {
        const date = shiftDay(monday, (wi - 7) * 7 + d); if (date > today) break;
        let slot = Math.min(LIMIT - reserved(state.classes[c], date), left);
        while (slot) {
          const options = ACTIONS.filter(a => a.points <= slot);
          const a = options[(serial + wi + d) % options.length];
          seedEntry(c, a.id, date); slot -= a.points; left -= a.points;
        }
      }
    });
    if (ci) { state.classes[c].joined = true; state.classes[c].team = ci === 1 ? 'De Grønne Lyn' : 'Team Træstamme'; }
  });
  return state;
}
