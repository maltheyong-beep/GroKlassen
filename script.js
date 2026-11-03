import { ACTIONS, CLASSES, LIMIT, CUP, STAGES, FINANCE, actionById, dayKey, weekKey, ageDays, emptyState, normalizeState, stats, submit, moderate, stageFor, history, ranking, cupStatus, finance, seedDemo } from './core.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const number = n => new Intl.NumberFormat('da-DK', { maximumFractionDigits: 1 }).format(n);
const money = n => new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 }).format(n) + ' kr.';
const PATHS = {
  leaf: '<path d="M20 4c-8-1-15 2-15 8a6 6 0 0 0 6 6c6 0 9-6 9-14Z"/><path d="M4 21 15 10"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-4M9 14l6 4"/>',
  play: '<path d="m9 5 11 7-11 7V5Z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  bike: '<circle cx="5" cy="16" r="4"/><circle cx="19" cy="16" r="4"/><path d="m5 16 5-9 5 9h4l-4-12h-3m-6 3h6m-7 9h10"/>',
  recycle: '<path d="m9 4 3-2 4 6m-1-4 1 4-4-1M20 10l2 3-4 6m4-2-4 2v-4M11 21H7l-4-7m1 5-1-5 5 1"/>',
  drop: '<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  box: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M3 11h18M9 7V5a3 3 0 0 1 6 0v2m-5 7h4"/>',
  bulb: '<path d="M9 18h6m-6 3h6M8 14a7 7 0 1 1 8 0l-1 4H9l-1-4Z"/>',
  tool: '<path d="M14 4a6 6 0 0 0-7 8l-5 5a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-4 3-3-3 2-5Z"/>',
  arrows: '<path d="M4 8h15l-4-4m4 4-4 4M20 16H5l4 4m-4-4 4-4"/>',
  power: '<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
  trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm5 11v6m-5 1h10M7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4"/>',
  chart: '<path d="M3 3v18h18M8 16v-5m5 5V7m5 9V4"/>',
  school: '<path d="m3 9 9-6 9 6v12H3V9Z"/><path d="M9 21v-7h6v7M7 10h.01M17 10h.01"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  print: '<path d="M7 8V3h10v5M7 17H3V9h18v8h-4M7 14h10v7H7v-7Zm10-3h.01"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5Z"/><path d="M14 2v5h5M8 12h8m-8 4h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
};
function icon(name, cls = '') { return `<svg ${cls ? `class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || PATHS.leaf}</svg>`; }
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
hydrateIcons();

const KEYS = { own: 'groklassen.own.v1', demo: 'groklassen.demo.v1', ui: 'groklassen.ui.v1' };
const blockedKeys = new Set();
function storageWarning(message) { const el = $('#storage-warning'); el.textContent = message; el.hidden = false; }
function readState(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? normalizeState(JSON.parse(raw)) : fallback(); }
  catch { blockedKeys.add(key); storageWarning('Gemte data kunne ikke læses. De er bevaret urørt. Nye ændringer virker kun i denne session, indtil browserlagringen fungerer igen.'); return fallback(); }
}
let prefs = {};
try { prefs = JSON.parse(localStorage.getItem(KEYS.ui) || '{}') || {}; } catch { storageWarning('Browserens lagring er ikke tilgængelig. Ændringer kan forsvinde, når siden lukkes.'); }
let mode = prefs.mode === 'own' ? 'own' : 'demo';
let currentClass = CLASSES.includes(prefs.class) ? prefs.class : '7.A';
let ownState = readState(KEYS.own, emptyState), demoState = readState(KEYS.demo, seedDemo);
let unlocked = false, today = dayKey(), toastTimer, lastFocus = null, pitchIndex = null, printHtml = '', lastPlantKey = '', actionFilter = 'Alle';
const cooldown = new Set();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = () => mode === 'demo' ? demoState : ownState;
const klass = () => state().classes[currentClass];
function persistUI() {
  try { localStorage.setItem(KEYS.ui, JSON.stringify({ mode, class: currentClass, theme: document.documentElement.dataset.theme })); }
  catch { storageWarning('Browseren kan ikke gemme. Ændringer virker i denne session, men kan forsvinde, når siden lukkes.'); }
}
function save(next) {
  if (mode === 'demo') demoState = next; else ownState = next;
  const key = KEYS[mode];
  try { if (blockedKeys.has(key)) return; localStorage.setItem(key, JSON.stringify(next)); }
  catch { storageWarning('Browseren kan ikke gemme. Ændringer virker i denne session, men kan forsvinde, når siden lukkes.'); }
}
document.documentElement.dataset.theme = ['light', 'dark'].includes(prefs.theme) ? prefs.theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function toast(message, error = false) {
  const el = $('#toast'); el.textContent = message; el.hidden = false; el.classList.toggle('error', error); clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, error ? 6500 : 4500);
}
function dateLabel(key, long = false) { return new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: long ? 'long' : 'short', ...(long ? {} : { weekday: 'short' }), timeZone: 'Europe/Copenhagen' }).format(new Date(key + 'T12:00:00Z')); }
function timeLabel(instant) { return new Intl.DateTimeFormat('da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' }).format(new Date(instant)); }
function ageLabel(date) { const days = ageDays(date, today); return days === 0 ? 'I dag' : days === 1 ? 'I går' : `${days} dage siden`; }
function activeTeacher() { if (unlocked) return true; location.hash = '#laerer'; toast('Åbn lærerområdet for at ændre klassens data.'); return false; }
function setPage() {
  const hash = location.hash.slice(1) || 'klassen';
  const page = hash === 'laerer' ? 'laerer' : hash.startsWith('skoler') ? 'skoler' : 'klassen';
  $$('[data-page]').forEach(el => { el.hidden = el.dataset.page !== page; });
  $$('[data-nav]').forEach(a => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.title = `${page === 'skoler' ? 'For skoler' : page === 'laerer' ? 'Lærerområdet' : 'Små handlinger. Stor forskel.'} — GroKlassen`;
  const target = document.getElementById(hash);
  if (target && target.id !== page) requestAnimationFrame(() => target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' }));
  else if (!['handlinger', 'konkurrence'].includes(hash)) window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', setPage);

function treeSvg(stage) {
  const colors = ['#32513a', '#6c9662', '#89af6a', '#abc484', '#c5d793'];
  const layers = [[290,185,94,75,0],[364,202,89,77,1],[232,228,80,72,1],[320,126,65,67,2],[397,159,54,59,2],[194,174,45,58,3],[278,107,42,52,3],[362,99,42,44,4],[425,221,45,47,2]];
  const showTree = stage >= 2;
  const canopy = layers.slice(0, stage === 2 ? 4 : stage === 3 ? 7 : 9).map(([x,y,rx,ry,c],i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${colors[c]}" opacity="${i ? .92 : 1}"/><path d="M${x-rx*.5} ${y+ry*.3}q${rx*.3} ${-ry*.65} ${rx} ${-ry*.45}" fill="none" stroke="#e0eabd" stroke-opacity=".15" stroke-width="1"/>`).join('');
  return `<svg viewBox="0 0 600 480" role="img" aria-label="Klassens plante: ${STAGES[stage].name}"><defs><radialGradient id="sunhalo"><stop stop-color="#f7f8d6"/><stop offset="1" stop-color="#e7eedf" stop-opacity="0"/></radialGradient><linearGradient id="trunk" x1="0" x2="1"><stop stop-color="#7f7755"/><stop offset="1" stop-color="#a79a70"/></linearGradient><linearGradient id="ground" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d3dfbf"/><stop offset="1" stop-color="#e0e9d3"/></linearGradient></defs><circle cx="340" cy="205" r="180" fill="url(#sunhalo)"/><circle cx="330" cy="210" r="137" fill="none" stroke="#d5dfc6" stroke-width="1"/><circle cx="330" cy="210" r="170" fill="none" stroke="#d5dfc6" stroke-dasharray="2 9"/><path d="M35 351q110-80 232-33t304 9" fill="none" stroke="#cfdbc1"/><ellipse cx="310" cy="368" rx="183" ry="33" fill="url(#ground)"/><ellipse cx="309" cy="366" rx="74" ry="10" fill="#7d9b6320"/>
  <g class="tree-growing">${showTree ? `<g transform="translate(${stage===2?77:0} ${stage===2?95:0}) scale(${stage===2?.76:1})"><path d="M297 367q14-77 8-136l-42-53 46 37 21-79-5 100 51-44-48 65q-6 71 5 110Z" fill="url(#trunk)"/><path d="m314 354 2-106" stroke="#b8ac7c" fill="none"/><g class="sway">${canopy}</g><path d="M297 368q-20 0-31 7m65-7q22 0 38 6" fill="none" stroke="#938d64" stroke-width="2" stroke-linecap="round"/></g>` : stage === 1 ? `<g class="sprout"><path d="M310 368v-83" stroke="#6a8a4e" stroke-width="7" stroke-linecap="round"/><path d="M310 329c-58 0-71-45-71-45s68-9 71 45" fill="#789b58"/><path d="M310 307c56 1 66-56 66-56s-65 0-66 56" fill="#9db974"/><path d="m250 291 57 35m61-68-54 44" stroke="#d3e0b5" stroke-width="1.5" fill="none"/></g>` : `<g class="sprout"><ellipse cx="310" cy="354" rx="18" ry="13" transform="rotate(-20 310 354)" fill="#a19365"/><path d="m310 350 7-7" stroke="#f1e6bf" stroke-width="2" stroke-linecap="round"/><path d="M300 339q9-25 24-29" fill="none" stroke="#8caa64" stroke-width="2" stroke-dasharray="4 6"/><path d="M326 310q-9-18-19-14 0 15 19 14" fill="#9ebc76"/></g>`}</g><g fill="#9bb777"><path d="m162 364-8-18 14 12-1-20 8 24m290-4 2-16 7 18 10-9-5 14"/><path d="m205 379-2-12 9 8 4-11 2 14"/></g><g fill="#c0cf96"><ellipse cx="399" cy="361" rx="10" ry="3" transform="rotate(-20 399 361)"/><ellipse cx="234" cy="352" rx="8" ry="3" transform="rotate(20 234 352)"/></g><g stroke="#8aa36c" stroke-linecap="round" opacity=".5"><path d="M440 100h8m-4-4v8M176 260h6m-3-3v6"/></g></svg>`;
}
function metric(value, label, iconName, extra = '', suffix = '') { return `<div class="stat-card"><span class="stat-icon">${icon(iconName)}</span><span class="stat-number" data-value="${value}" data-suffix="${esc(suffix)}">${number(value)}${suffix}</span><p class="caption">${label}${extra}</p></div>`; }
function animateMetrics(oldValues) {
  if (reduced.matches) return;
  $$('[data-value]').forEach((el,i) => {
    const to = Number(el.dataset.value), from = oldValues[i] ?? to;
    if (from === to) return;
    const start = performance.now(), suffix = el.dataset.suffix || '';
    const tick = now => { if (!el.isConnected) return; const t = Math.min(1, (now - start) / 400); el.textContent = number(to >= 100 || Number.isInteger(to) ? Math.round(from + (to-from)*(1-(1-t)**3)) : from+(to-from)*(1-(1-t)**3)) + suffix; if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}
function renderActions() {
  const s = stats(klass(), today);
  $('#action-cards').innerHTML = ACTIONS.filter(a => actionFilter === 'Alle' || a.category === actionFilter).map((a,i) => {
    const sent = cooldown.has(currentClass + a.id), full = s.used + a.points > LIMIT;
    return `<article class="action-card enter" style="--i:${i}"><div class="action-card-top"><span class="action-icon">${icon(a.icon)}</span><span class="point-pill">+${a.points} point</span></div><span class="category">${a.category}</span><h3>${a.title}</h3><p>${a.description}</p><div class="impact-row"><span>${icon('leaf')} ca. ${a.co2} g CO₂*</span>${a.water ? `<span>${icon('drop')} ${a.water} L*</span>` : ''}<button class="text-button" data-method="${a.id}" aria-label="Se beregning for ${esc(a.subtitle)}">* Beregning</button></div><button class="action-submit${sent?' sent':''}" data-submit="${a.id}" ${sent || full ? 'disabled' : ''} aria-label="${sent ? 'Indsendt' : 'Send'}: ${esc(a.subtitle)}">${sent ? 'Sendt til lærer' : full ? 'Dagens plads er brugt' : 'Send forespørgsel'} ${icon(sent?'check':'arrow')}</button></article>`;
  }).join('');
  $('#daily-description').textContent = `${currentClass}: ${s.used} af ${LIMIT} point brugt i dag · ${s.today} godkendt, ${s.used-s.today} afventer`;
  $('#daily-progress').style.width = Math.min(100,s.used/LIMIT*100)+'%';
}
function historyChart(k, key) {
  const rows = history(k, today), max = Math.max(k.goal, ...rows.map(r => r.points), 10) * 1.2;
  const y = v => 180 - v/max*145;
  const lines = [0,.5,1].map(f => `<path class="chart-grid" d="M33 ${y(f*max)}H500"/><text x="25" y="${y(f*max)+3}" text-anchor="end">${Math.round(f*max)}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 520 225" role="img" aria-labelledby="chart-title-${key}"><title id="chart-title-${key}">Godkendte point de seneste otte uger. Ugemål: ${k.goal} point.</title>${lines}<path class="goal-line" d="M33 ${y(k.goal)}H500"/><text x="500" y="${y(k.goal)-5}" text-anchor="end">Mål ${k.goal}</text>${rows.map((r,i) => `<g><rect class="chart-bar ${i<7?'old':''}" x="${46+i*57}" y="${y(r.points)}" width="29" height="${r.points/max*145}" rx="5"/><text x="${60+i*57}" y="${y(r.points)-8}" text-anchor="middle">${r.points}</text><text x="${60+i*57}" y="201" text-anchor="middle">${r.label}</text></g>`).join('')}</svg><details class="chart-data"><summary>Vis som tabel</summary><table><caption class="sr-only">Ugens godkendte point og klassens ugemål</caption><thead><tr><th>Uge</th><th>Point</th><th>Ugemål</th></tr></thead><tbody>${rows.map(r => `<tr><th>${r.key}</th><td>${r.points}</td><td>${k.goal}</td></tr>`).join('')}</tbody></table></details>`;
}
function leagueHtml(cup = false) {
  const rows = ranking(state(), today, cup);
  if (!rows.length) return '<p class="caption">Ingen klasser er tilmeldt endnu.</p>';
  return rows.map(r => `<div class="league-row${r.c===currentClass?' current':''}"><span class="league-rank">${r.rank}</span><div><strong>${r.c}</strong><small>${cup ? esc(r.team || 'Klassens grønne hold') : r.c===currentClass ? 'Jeres klasse' : number(stats(state().classes[r.c],today).total)+' point i alt'}${mode==='demo'?' · demo':''}</small></div><strong>${r.points} pt.</strong></div>`).join('');
}
function renderCup() {
  const status = cupStatus(today), k = klass(), days = ageDays(today, CUP.end)+1;
  $('#cup-period').textContent = `${dateLabel(CUP.start,true)} – ${dateLabel(CUP.end,true)} 2026 · ${status==='ended'?'Afsluttet':status==='upcoming'?'Starter snart':`${days} dage tilbage`}`;
  $('#cup-join').innerHTML = k.joined ? `<p>${currentClass} er tilmeldt som <strong style="color:inherit">${esc(k.team || 'Klassens grønne hold')}</strong>.</p>` : `<button class="button" data-command="join" ${status==='ended'?'disabled':''}>${status==='ended'?'Eksempelperioden er slut':'Tilmeld klassen'} ${icon('arrow')}</button>`;
  $('#cup-league').innerHTML = leagueHtml(true);
}
function pendingRow(e, teacher = false) {
  const a = actionById(e.action);
  return `<div class="${teacher?'review-row':''}"><div class="pending-row"><span class="action-icon">${icon(a.icon)}</span><div><strong>${a.subtitle}</strong><small>${a.points} point · ${dateLabel(e.date)}${teacher?' kl. '+timeLabel(e.submittedAt):''}</small></div><span class="age-label">${ageLabel(e.date)}</span></div>${teacher?`<div class="review-actions"><button class="button approve" data-review="${esc(e.id)}" data-status="approved">${icon('check')} Godkend</button><button class="button outline" data-review="${esc(e.id)}" data-status="rejected">Afvis</button></div>`:''}</div>`;
}
function renderTeacher() {
  $('#teacher-lock').hidden = unlocked; $('#teacher-content').hidden = !unlocked;
  const s = stats(klass(), today);
  $('#teacher-stats').innerHTML = metric(s.pending,'Afventer godkendelse','clock')+metric(s.old,'Fra tidligere dage','file')+metric(s.today,'Godkendte point i dag','check','',` / ${LIMIT}`)+metric(s.total,'Godkendte point i alt','leaf');
  const pending = klass().entries.filter(e => e.status==='pending').sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  $('#queue-today').innerHTML = pending.filter(e=>e.date===today).map(e=>pendingRow(e,true)).join('') || '<p class="empty">Ingen handlinger fra i dag afventer. Godt overblik!</p>';
  $('#queue-old').innerHTML = pending.filter(e=>e.date<today).map(e=>pendingRow(e,true)).join('') || '<p class="empty">Ingen gamle handlinger venter på jer.</p>';
  $$('[data-bulk]').forEach(b=>{b.disabled=!pending.some(e=>b.dataset.bulk==='today'?e.date===today:e.date<today);});
  $('#teacher-chart').innerHTML = historyChart(klass(),'teacher');
  if(document.activeElement!==$('#goal-input')) $('#goal-input').value = klass().goal;
  $('#reset-mode').textContent = mode==='demo'?'i demoen':'(egne data)';
}
function celebrateIfNeeded() {
  if (!unlocked) return;
  const key = currentClass+':'+weekKey(today), s = stats(klass(),today);
  if (s.week < klass().goal || state().celebrated.includes(key)) return;
  const next = structuredClone(state()); next.celebrated.push(key); save(next);
  toast('Ugemålet er nået! Se, hvad I kan, når I gør det sammen.');
  if(reduced.matches) return;
  $('#confetti').innerHTML = Array.from({length:22},(_,i)=>`<i class="confetti-leaf" style="left:${(i*47)%100}%;animation-delay:${i*.035}s;background:${['#39734b','#d5ec91','#9cbb73'][i%3]}"></i>`).join('');
  setTimeout(()=>{$('#confetti').innerHTML='';},3000);
}
function render() {
  const old = $$('[data-value]').map(el=>Number(el.dataset.value));
  $('#demo-banner').hidden = mode!=='demo';
  $$('[data-bind="class"]').forEach(el=>{el.textContent=currentClass;});
  $$('.class-switch').forEach(el=>{el.innerHTML=CLASSES.map(c=>`<button data-class="${c}" aria-pressed="${c===currentClass}">${c}</button>`).join('');});
  const s = stats(klass(),today), stage = stageFor(s.total), plantKey = mode+currentClass+stage;
  if(plantKey!==lastPlantKey){$('#hero-plant').innerHTML=treeSvg(stage);lastPlantKey=plantKey;}
  $('#plant-stage').textContent=STAGES[stage].name;
  $('#plant-stage-pill').textContent=stage===4?`${s.total} point · I gror videre`:`${STAGES[stage+1].min-s.total} point til næste stadie`;
  $('#class-stats').innerHTML=metric(s.total,'Godkendte point','leaf')+metric(s.co2/1000,'Anslået CO₂ sparet','arrows','<span class="tag">Vejledende</span>',' kg')+metric(s.water,'Anslået vand sparet','drop','<span class="tag">Vejledende</span>',' L')+metric(s.pending,'Afventer lærer','clock');
  $('#goal-current').textContent=s.week;$('#goal-target').textContent=klass().goal;$('#goal-percent').textContent=Math.round(s.week/klass().goal*100)+'%';$('#goal-progress').style.width=Math.min(100,s.week/klass().goal*100)+'%';
  $('#goal-text').textContent=STAGES[stage].text;
  $('#goal-remaining').textContent=s.week>=klass().goal?'I har nået ugens fælles mål. Godt gået!':`${klass().goal-s.week} point til ugens fælles mål.`;
  $('#week-badge').textContent='Uge '+Number(weekKey(today).slice(6));$('#class-chart').innerHTML=historyChart(klass(),'class');
  $('#league').innerHTML=leagueHtml();$('#pending-badge').textContent=s.pending;
  const pending=klass().entries.filter(e=>e.status==='pending').sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
  $('#class-pending').innerHTML=pending.slice(0,4).map(e=>pendingRow(e)).join('') || `<div class="empty"><span class="round-icon">${icon('check')}</span>Alt er fulgt til dørs.<br>Klar til næste grønne handling?</div>`;
  if(pending.length>4)$('#class-pending').innerHTML+=`<p class="caption">Og ${pending.length-4} mere i lærerområdet.</p>`;
  renderActions();renderCup();renderTeacher();animateMetrics(old);
}
function focusAction(selector) { requestAnimationFrame(()=>{const el=$(selector); if(el&&!el.disabled)el.focus();else $('#actions-title').setAttribute('tabindex','-1');}); }
function commit(next, message) { save(next); render(); if(message)toast(message); }
function startDemo() { mode='demo'; unlocked=false; persistUI(); render();location.hash='#klassen';toast('Demo er aktiv. Alle tal og klasser her er fiktive.'); }
function review(ids,status) {
  if(!activeTeacher())return;
  const r=moderate(state(),currentClass,ids,status);
  commit(r.state,`${r.updated} ${r.updated===1?'handling':'handlinger'} ${status==='approved'?'godkendt':'afvist'}.${r.skipped?` ${r.skipped} sprunget over pga. status eller dagsloft.`:''}`);
  celebrateIfNeeded();
  requestAnimationFrame(()=>{$('#teacher-title').setAttribute('tabindex','-1');$('#teacher-title').focus({preventScroll:true});});
}
const dialog=$('#app-dialog');
function openDialog(html,eyebrow='GroKlassen',keepFocus=false) {
  if(!dialog.open&&!keepFocus)lastFocus=document.activeElement;
  $('#dialog-content').innerHTML=html;$('#dialog-eyebrow').textContent=eyebrow;
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
}
function closeDialog() { pitchIndex=null; dialog.close(); if(lastFocus?.isConnected)lastFocus.focus(); }
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
const PITCH=[
  ['Gode vaner skal kunne ses.','Bæredygtighed fylder i temauger og på plakater. Men hvad gør vi sammen, når ugen er slut? Vores hypotese er, at klassen mangler et enkelt overblik i hverdagen.','01 / Problemet'],
  ['Lad fællesskabet gro.','Eleverne registrerer små grønne handlinger. Læreren godkender. Klassens plante vokser. Ét fælles mål — uden at rangere den enkelte elev.','02 / Løsningen'],
  ['Fra handling til samtale.','Ni handlinger, et ugemål og en klasseliga. En kort ugerapport hjælper læreren med at tale om vaner, muligheder og de valg, klassen kan tage sammen.','03 / Oplevelsen'],
  ['En enkel forretningsidé.','Gratis prøve til én klasse. En mulig skolelicens på cirka 1.500 kr. om året eller en kommuneaftale fra cirka 12.000 kr. for ti skoler. Priser og betalingsvilje er endnu ikke valideret.','04 / Forretningsmodellen'],
  ['Grønt. Socialt. Holdbart.','Grønne vaner i hverdagen. Flere måder at være med på. En mulig indtægt, der skal betale for udviklingen. CO₂ og vand er åbne prototypeestimater, ikke dokumenterede resultater.','05 / Bæredygtighed'],
  ['Nu skal idéen møde hverdagen.','Vi arbejder med lærerinterviews. Næste skridt er en planlagt fireugers pilot, fagligt faktatjek og test af betalingsvilje. Prøv prototypen og se, hvordan en lille handling bliver synlig.','06 / Næste skridt']
];
function renderPitch(){const p=PITCH[pitchIndex];openDialog(`<h2 id="dialog-title" class="pitch-title">${p[0]}</h2><p class="pitch-body">${p[1]}</p><div class="pitch-controls"><button class="button outline small" data-command="pitch-prev" ${pitchIndex===0?'disabled':''}>Tilbage</button><span class="pitch-count">${pitchIndex+1} / 6</span><span class="pitch-dots" aria-hidden="true">${PITCH.map((_,i)=>`<i class="${i===pitchIndex?'active':''}"></i>`).join('')}</span><button class="button dark small" data-command="${pitchIndex===5?'pitch-demo':'pitch-next'}">${pitchIndex===5?'Prøv demoen':'Næste'} ${icon('arrow')}</button></div>`,p[2],true);}
dialog.addEventListener('keydown',e=>{if(pitchIndex===null||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowRight'&&pitchIndex<5){e.preventDefault();pitchIndex++;renderPitch();}if(e.key==='ArrowLeft'&&pitchIndex>0){e.preventDefault();pitchIndex--;renderPitch();}});
function methodDialog(id){const a=actionById(id);if(!a)return;openDialog(`<span class="round-icon">${icon(a.icon)}</span><h2 id="dialog-title">${a.subtitle}</h2><div class="method-number">${a.co2} g CO₂ <span style="font-size:18px">· ${a.water} L vand</span></div><p><strong>Pr. godkendt handling · ${a.points} point.</strong></p><p>${a.assumption}</p><p>Samlet estimat = antal godkendte handlinger × ${a.co2} g CO₂${a.water?' og × '+a.water+' L vand':''}. 0 L betyder, at vi ikke beregner vand for handlingen.</p><div class="notice"><strong>Foreløbigt skøn – ikke faktatjekket.</strong><p class="caption" style="margin:8px 0 0">Der er ikke udleveret dokumenterede emissionsfaktorer til disse estimater. De skal efterprøves af en fagperson. Pointene belønner indsats og er ikke direkte proportionale med CO₂.</p></div>`,'Åbne beregninger');}
$('#methods').innerHTML=ACTIONS.map(a=>`<article class="method-item"><h3>${a.subtitle}</h3><p>${a.assumption}</p><p><strong>Foreløbigt skøn:</strong> ${a.co2} g CO₂ og ${a.water} L vand pr. godkendt handling. Dokumentationsstatus: ikke faktatjekket.</p></article>`).join('');

const canvas=[
  ['Aktivitet','Nøglepartnere','activity',['Pilotlærere og skoler','Mulige klimaenheder og grønne organisationer','Fagpersoner til faktatjek','Fremtidig EU-hosting — ingen aftaler endnu']],
  ['Aktivitet','Nøgleaktiviteter','activity',['Udvikle og vedligeholde appen','Efterprøve udfordringer og beregninger','Pilotforsøg og lærersupport','Undersøge salg til skoler og kommuner']],
  ['Aktivitet','Nøgleressourcer','activity',['Den lette webapp','Holdets tid og kompetencer','Beregningsmetoder og kildearbejde','Feedback fra fremtidige pilotklasser']],
  ['Værdi','Værditilbud','value',['Synlige grønne vaner og fælles plante','Fællesskab uden individuelle ranglister','Lærergodkendelse, ugemål og rapport','Åbne beregninger uden elevprofiler']],
  ['Kunde','Kunderelationer','customer',['Gratis prøve som indgang','Selvbetjening i den tænkte løsning','Ugentlige mål og klassesamtaler','Personlig hjælp under pilotperioden']],
  ['Kunde','Kanaler','customer',['Pilotlærere og lærernetværk','Kommunale klimaenheder','Grønne skolenetværk og fagmesser','Webapp direkte i browseren']],
  ['Kunde','Kundesegmenter','customer',['Brugere: grundskolens elever','Administratorer: lærere','Betalere: skoler og kommuner','Præcise klassetrin skal testes']],
  ['Økonomi','Omkostningsstruktur','money',['Udvikling og vedligehold','Hosting/database og support','Onboarding og databeskyttelsesarbejde','0 kr. i løn er frivilligt prototypearbejde']],
  ['Økonomi','Indtægtsstrømme','money',['Skolelicens: ca. 1.500 kr./år','Kommuneaftale: fra ca. 12.000 kr./år','Gratis pilot som indgang','Priser er hypoteser; betalingsvilje er ukendt']]
];
$('#business-canvas').innerHTML=canvas.map(([p,title,style,items])=>`<article class="card perspective-${style}"><p class="eyebrow">${p}</p><h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul></article>`).join('');
const financeFields={schools:'Selvstændige skolelicenser',price:'Licenspris (kr.)',municipalities:'Kommuneaftaler',municipalPrice:'Aftalepris (kr.)',municipalSchools:'Skoler pr. kommuneaftale',variable:'Variabel pris pr. skole (kr.)',hosting:'Hosting og database (kr.)',support:'Support (kr.)',development:'Udvikling (kr.)',salary:'Løn, valgfri (kr.)'};
Object.entries(financeFields).forEach(([key,label],i)=>{const box=i<5?'#finance-revenue-fields':'#finance-cost-fields';$(box).insertAdjacentHTML('beforeend',`<label for="finance-${key}">${label}<input type="number" id="finance-${key}" name="${key}" value="${FINANCE.expected[key]}" min="0" max="100000000" step="${['schools','municipalities','municipalSchools'].includes(key)?'1':'any'}" inputmode="numeric" required></label>`);});
$('#finance-cost-fields').insertAdjacentHTML('beforeend','<p class="caption">0 kr. i løn betyder frivilligt arbejde i prototypefasen. Variabel omkostning gælder alle skoler, også kommunernes.</p>');
function readFinance(){const o={};for(const k of Object.keys(FINANCE.expected)){const el=$('#finance-'+k);if(el.value.trim()==='')throw new Error('Udfyld alle felter med et tal.');o[k]=Number(el.value);}return o;}
function updateFinance(){
  try {
    const v=readFinance(),r=finance(v);$('#finance-error').textContent='';$('.finance-results').hidden=false;
    $('#finance-totals').innerHTML=`<div class="finance-metric"><strong>${money(r.revenue)}</strong><span>Årlig indtægt</span></div><div class="finance-metric"><strong>${money(r.costs)}</strong><span>Årlige omkostninger</span></div><div class="finance-metric ${r.profit>=0?'positive':'negative'}"><strong>${r.profit>=0?'+':''}${money(r.profit)}</strong><span>Resultat pr. år</span></div><div class="finance-metric"><strong>${r.breakEven===null?'Intet break-even':number(r.breakEven)+' skoler'}</strong><span>Selvstændige licenser + ${v.municipalities} kommuneaftaler</span></div>`;
    $('#finance-explanation').textContent=`${v.schools} selvstændige skoler + ${v.municipalities} × ${v.municipalSchools} kommuneskoler = ${r.totalSchools} forskellige skoler. Faste omkostninger: ${money(r.fixed)}. Dækningsbidrag pr. skolelicens: ${money(r.contribution)}.${r.contribution<=0?' Licensen giver ikke positivt dækningsbidrag. Flere licenser forbedrer derfor ikke resultatet.':''} ${v.salary===0?'Holdets arbejde er ulønnet i dette scenarie.':''}`;
    const maximum=Math.max(30,v.schools*1.4,r.breakEven===null?0:r.breakEven*1.5),maxSchools=Math.ceil(maximum/10)*10;
    const rows=Array.from({length:6},(_,i)=>{const count=Math.round(i*maxSchools/5);return{count,revenue:count*v.price+v.municipalities*v.municipalPrice,costs:r.fixed+(count+v.municipalities*v.municipalSchools)*v.variable};});
    const maxY=Math.max(100,...rows.flatMap(x=>[x.revenue,x.costs]))*1.12, x=n=>45+n/maxSchools*440,y=n=>185-n/maxY*150;
    $('#finance-chart').innerHTML=`<svg class="chart" viewBox="0 0 520 230" role="img" aria-labelledby="finance-chart-title"><title id="finance-chart-title">Indtægt og omkostninger ved flere selvstændige skolelicenser. Se datatabellen for alle værdier.</title>${[0,.5,1].map(f=>`<path class="chart-grid" d="M45 ${y(f*maxY)}H490"/><text x="37" y="${y(f*maxY)+3}" text-anchor="end">${number(Math.round(f*maxY/1000))}k</text>`).join('')}<polyline points="${rows.map(r=>`${x(r.count)},${y(r.revenue)}`).join(' ')}" fill="none" stroke="var(--green)" stroke-width="3"/><polyline points="${rows.map(r=>`${x(r.count)},${y(r.costs)}`).join(' ')}" fill="none" stroke="var(--gold)" stroke-width="2"/>${rows.map(r=>`<text x="${x(r.count)}" y="205" text-anchor="middle">${number(r.count)}</text>`).join('')}<text x="270" y="224" text-anchor="middle">Selvstændige skolelicenser</text>${r.breakEven!==null&&r.breakEven<=maxSchools?`<path class="goal-line" d="M${x(r.breakEven)} 20V185"/>`:''}</svg><p class="caption">Grøn: indtægt · Gylden: omkostninger${r.breakEven===null?'':` · Break-even: ${r.breakEven} licenser`}</p><details class="chart-data"><summary>Vis som tabel</summary><table><thead><tr><th>Licenser</th><th>Indtægt</th><th>Omkostning</th><th>Resultat</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${r.count}</th><td>${money(r.revenue)}</td><td>${money(r.costs)}</td><td>${money(r.revenue-r.costs)}</td></tr>`).join('')}</tbody></table></details>`;
  }catch(e){$('#finance-error').textContent=e.message;$('.finance-results').hidden=true;}
}
$('#finance-form').addEventListener('input',()=>{$$('[data-scenario]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});updateFinance();});
$('#finance-form').addEventListener('submit',e=>e.preventDefault());
function scenario(name){for(const[k,v]of Object.entries(FINANCE[name]))$('#finance-'+k).value=v;$$('[data-scenario]').forEach(b=>{b.classList.toggle('active',b.dataset.scenario===name);b.setAttribute('aria-pressed',String(b.dataset.scenario===name));});updateFinance();}

function reportHtml(){const k=klass(),s=stats(k,today),approved=k.entries.filter(e=>e.status==='approved'&&weekKey(e.date)===weekKey(today));return `<div class="report-heading"><div><p class="eyebrow">${mode==='demo'?'Fiktive demo-data':'Klassens lokale data'} · ${weekKey(today)}</p><h1>Sådan gror ${currentClass}.</h1></div><img class="report-logo" src="./favicon.svg" alt="GroKlassen"></div><p>Godkendte handlinger, ført på indsendelsesdagen. Rapportdato: ${dateLabel(today,true)}.</p><div class="print-grid"><div class="print-box"><h2>${s.week} / ${k.goal} point</h2><p>Godkendt denne uge · ${s.pending} indsendelser afventer i alt.</p></div><div class="print-box"><h2>Vejledende miljøtal</h2><p>${number(approved.reduce((n,e)=>n+actionById(e.action).co2,0)/1000)} kg CO₂ · ${number(approved.reduce((n,e)=>n+actionById(e.action).water,0))} L vand denne uge.</p></div></div><h2>Ugens handlinger</h2><table><thead><tr><th>Handling</th><th>Antal</th><th>Point</th></tr></thead><tbody>${ACTIONS.map(a=>({a,n:approved.filter(e=>e.action===a.id).length})).filter(x=>x.n).map(({a,n})=>`<tr><th>${a.subtitle}</th><td>${n}</td><td>${n*a.points}</td></tr>`).join('')||'<tr><td colspan="3">Ingen godkendte handlinger denne uge.</td></tr>'}</tbody></table><h2>Tre spørgsmål til klassen</h2><ol><li>Hvilken grøn handling var nemmest at få ind i hverdagen?</li><li>Hvilke muligheder er forskellige for os, og hvordan får vi alle med?</li><li>Hvad vil vi prøve sammen i næste uge?</li></ol><p class="caption">CO₂ og vand er foreløbige, ikke faktatjekkede prototypeestimater. Point er ikke dokumentation for en faktisk besparelse. Ingen individuelle elevoplysninger. Data er kun fra denne browser.</p>`;}
function showReport(){if(!activeTeacher())return;printHtml=reportHtml();openDialog(`<h2 id="dialog-title">Klassens ugerapport</h2><div class="report-preview">${printHtml}</div><button class="button dark" data-command="print">${icon('print')} Print / gem som PDF</button>`,'Rapport · '+currentClass);}
function showA4(){
  const siteUrl=new URL('./',location.href).href;
  printHtml=`<div class="report-heading"><div><p class="eyebrow">Business Mind Programme 2026 · prototype</p><h1>GroKlassen</h1><p><strong>Små handlinger. Stor forskel.</strong></p></div><img src="./favicon.svg" class="report-logo" alt=""></div><p>Gør grønne handlinger synlige i hverdagen: elever registrerer, læreren godkender, og klassens fælles plante vokser. Ét fælles mål uden individuelle elevprofiler.</p><div class="print-grid"><div class="print-box"><h2>Problem → løsning</h2><p>Vores hypotese: klasser mangler et fælles overblik efter temauger. Planten, ugemålet og rapporten gør de daglige handlinger synlige og giver anledning til samtale.</p></div><div class="print-box"><h2>Tre roller</h2><p>Elever er brugere. Lærere godkender og følger op. Skoler og kommuner er de tænkte betalende kunder. Klassetrin skal testes.</p></div><div class="print-box"><h2>Prishypoteser</h2><p>Prøve: 1 klasse i 3 måneder, 0 kr.<br>Skole: ca. 1.500 kr./år.<br>Kommune: fra ca. 12.000 kr./år for op til 10 skoler. Alle priser ekskl. moms.</p></div><div class="print-box"><h2>Et forventet scenarie</h2><p>25 skolelicenser + 1 kommuneaftale:<br>Indtægt: 49.500 kr./år.<br>Omkostning: 35.250 kr./år.<br>Resultat: +14.250 kr./år. Break-even: 15 licenser + aftalen. Løn: 0 kr.</p></div><div class="print-box"><h2>Bæredygtighed</h2><p>Miljø: grønne hverdagsvaner.<br>Socialt: fælles mål og forskellige bidrag.<br>Økonomi: mulig licens til drift og udvikling.<br>Fokus på verdensmål 4.7, 12 og 13.</p></div><div class="print-box"><h2>Næste skridt</h2><p>Lærerinterviews er i gang. Fireugers pilot er planlagt, ikke gennemført. Faktatjek, pristest og senere lærerlogin og fælles EU-database skal følge.</p></div></div><p class="caption">Priser, scenarier og partnerskaber er hypoteser. Ingen indgåede partneraftaler eller dokumenterede effekter. Miljøtal er foreløbige skøn. Prototypen gemmer data i én browser og synkroniserer ikke mellem enheder.</p><div class="print-footer"><div><strong>Prøv prototypen</strong><p class="print-url">${esc(siteUrl)}</p></div><img src="./qr.svg" class="print-qr" alt="QR-kode til GroKlassens GitHub Pages-side"></div>`;
  openDialog(`<h2 id="dialog-title">Én side. Hele idéen.</h2><p>A4-overblik med værdi, kunder, prisskitse, standardscenarie, bæredygtighed og næste skridt.</p><p class="caption">QR-koden peger på projektets GitHub Pages-side.</p><button class="button dark" data-command="print">${icon('print')} Print / gem som PDF</button>`,'Overblik til dommerne');
}
function exportCSV(){if(!activeTeacher())return;const status={pending:'Afventer',approved:'Godkendt',rejected:'Afvist'};const safe=v=>'"'+String(v).replace(/"/g,'""')+'"';const rows=[['Klasse','Handling','Point','Status','Indsendelsesdato','Indsendt (Europe/Copenhagen)','Behandlet (Europe/Copenhagen)','CO2-estimat (g)','Vand-estimat (L)','Tilstand'],...klass().entries.map(e=>{const a=actionById(e.action),f=x=>new Intl.DateTimeFormat('da-DK',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Copenhagen'}).format(new Date(x));return[currentClass,a.subtitle,a.points,status[e.status],e.date,f(e.submittedAt),e.reviewedAt?f(e.reviewedAt):'',e.status==='approved'?a.co2:0,e.status==='approved'?a.water:0,mode==='demo'?'Fiktive demo-data':'Egne lokale data'];})];const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(safe).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`GroKlassen_${currentClass}_${today}_${mode}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSV er hentet med den valgte klasses data.');}

document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.class){currentClass=b.dataset.class;persistUI();render();const page=$('[data-page]:not([hidden])');page?.querySelector(`[data-class="${currentClass}"]`)?.focus();return;}
  if(b.dataset.method){methodDialog(b.dataset.method);return;}
  if(b.dataset.submit){
    const id=b.dataset.submit,key=currentClass+id;if(cooldown.has(key))return;
    try{const next=submit(state(),currentClass,id);cooldown.add(key);commit(next,'Sendt til læreren. Handlingen tæller, når den bliver godkendt.');focusAction(`[data-method="${id}"]`);setTimeout(()=>{cooldown.delete(key);renderActions();},5000);}catch(error){toast(error.message,true);}return;
  }
  if(b.dataset.review){review([b.dataset.review],b.dataset.status);return;}
  if(b.dataset.bulk){const ids=klass().entries.filter(e=>e.status==='pending'&&(b.dataset.bulk==='today'?e.date===today:e.date<today)).map(e=>e.id);review(ids,b.dataset.status);return;}
  if(b.dataset.scenario){scenario(b.dataset.scenario);return;}
  const command=b.dataset.command;if(!command)return;
  if(command==='theme'){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';persistUI();return;}
  if(command==='demo'){startDemo();return;}
  if(command==='exit-demo'){mode='own';unlocked=false;persistUI();render();toast('Du ser nu klassens egne data i denne browser.');return;}
  if(command==='reset-demo'){demoState=seedDemo();if(mode==='demo')save(demoState);render();toast('Demoen er nulstillet. Egne data er urørt.');return;}
  if(command==='unlock'){unlocked=true;renderTeacher();toast('Lærerområdet er åbent i denne session.');return;}
  if(command==='lock'){unlocked=false;renderTeacher();return;}
  if(command==='share'){const url=new URL('./',location.href).href;try{if(navigator.share)await navigator.share({title:'GroKlassen — Små handlinger. Stor forskel.',url});else{await navigator.clipboard.writeText(url);toast('Linket er kopieret.');}}catch(error){if(error.name!=='AbortError')openDialog(`<h2 id="dialog-title">Del GroKlassen</h2><label for="share-url">Kopiér linket</label><input id="share-url" value="${esc(url)}" readonly style="width:100%">`);}return;}
  if(command==='pitch'){lastFocus=b;pitchIndex=0;renderPitch();return;}
  if(command==='pitch-prev'){pitchIndex=Math.max(0,pitchIndex-1);renderPitch();return;}
  if(command==='pitch-next'){pitchIndex=Math.min(5,pitchIndex+1);renderPitch();return;}
  if(command==='pitch-demo'){closeDialog();startDemo();return;}
  if(command==='close-dialog'){closeDialog();return;}
  if(command==='join'){openDialog(`<h2 id="dialog-title">Et hold for hele ${currentClass}.</h2><p>Tilmeld klassen til den fiktive Grøn Klasse-Cup. Præmien er et eksempel; der er ingen sponsor.</p><form id="join-form"><label for="team-name">Valgfrit holdnavn — ingen elevnavne</label><input id="team-name" maxlength="40" placeholder="Fx De Grønne Spirer" style="width:100%;margin-top:8px"><button class="button dark" type="submit">Tilmeld ${currentClass} ${icon('arrow')}</button></form>`,'Fiktiv konkurrence');return;}
  if(command==='reset-finance'){scenario('expected');return;}
  if(command==='csv'){exportCSV();return;}
  if(command==='report'){showReport();return;}
  if(command==='a4'){showA4();return;}
  if(command==='print'){$('#print-content').innerHTML=printHtml;window.print();return;}
  if(command==='reset-class'){if(!activeTeacher())return;openDialog(`<h2 id="dialog-title">Nulstil ${currentClass}?</h2><p>Du sletter klassens indsendelser, mål og cup-tilmelding ${mode==='demo'?'i demoen':'i klassens egne lokale data'}. Det kan ikke fortrydes.</p><p><strong>${mode==='demo'?'Egne data bliver ikke ændret.':'De andre klassers data bliver ikke ændret.'}</strong></p><div class="dialog-actions"><button class="button danger-outline" data-command="confirm-reset">Slet data for ${currentClass}</button><button class="button outline" data-command="close-dialog">Behold data</button></div>`,'Nulstil klasse');return;}
  if(command==='confirm-reset'){if(!activeTeacher())return;const next=structuredClone(state());next.classes[currentClass]=emptyState().classes[currentClass];next.celebrated=next.celebrated.filter(x=>!x.startsWith(currentClass+':'));closeDialog();commit(next,`${currentClass} er nulstillet ${mode==='demo'?'i demoen':'i egne data'}.`);return;}
  if(command==='about'){openDialog(`<h2 id="dialog-title">Lidt grønnere. Sammen.</h2><p>GroKlassen er en undervisningsprototype fra et gymnasiehold til Business Mind Programme 2026.</p><p>Ingen elevnavne, e-mails, elevprofiler eller tracking. Indsendelser og indstillinger gemmes lokalt i denne browser. De deles ikke mellem elevernes og lærerens enheder.</p><p>Demoen har separat lagring. Første besøg viser fiktive data, så idéen kan opleves med det samme. Vælg “Afslut demo” for at bruge egne data.</p><p>Lærerområdet har en lokal lås, som er en prototypebarriere. Det er ikke sikker loginbeskyttelse. En fælles database og rigtigt lærerlogin er fremtidige trin.</p><p>Appen kan bruges offline efter første onlinebesøg, hvis browseren understøtter og tillader service workers. CO₂- og vandtal er foreløbige, ikke faktatjekkede skøn.</p>`,'Om prototypen');}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='goal-form'){e.preventDefault();if(!activeTeacher())return;const value=Number($('#goal-input').value);if(!Number.isInteger(value)||value<1||value>1000){toast('Vælg et helt ugemål mellem 1 og 1.000 point.',true);return;}const next=structuredClone(state());next.classes[currentClass].goal=value;commit(next,'Klassens ugemål er gemt.');celebrateIfNeeded();}
  if(e.target.id==='join-form'){e.preventDefault();if(cupStatus(today)==='ended'){toast('Eksempelkonkurrencen er afsluttet.',true);return;}const next=structuredClone(state());next.classes[currentClass].joined=true;next.classes[currentClass].team=$('#team-name').value.trim().slice(0,40);closeDialog();commit(next,currentClass+' er tilmeldt den fiktive klasse-cup.');}
});
$('#action-filter').addEventListener('change',e=>{actionFilter=e.target.value;renderActions();});
document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('page-hidden',document.hidden);});
setInterval(()=>{const day=dayKey();if(day!==today){today=day;render();}},30000);
window.addEventListener('storage',e=>{if(e.key===KEYS.own||e.key===KEYS.demo){try{const value=e.newValue?normalizeState(JSON.parse(e.newValue)):emptyState();if(e.key===KEYS.own)ownState=value;else demoState=value;render();}catch{storageWarning('Data i en anden fane kunne ikke læses. Opdatér ikke siden, før vigtige data er eksporteret.');}}});
render();scenario('expected');setPage();
if('serviceWorker' in navigator&&['https:','http:'].includes(location.protocol))navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
