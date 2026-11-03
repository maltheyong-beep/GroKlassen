import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, ACTIONS, FINANCE, dayKey, weekKey, weekStart, shiftDay, emptyState, normalizeState, stats, submit, moderate, reserved, history, ranking, finance, seedDemo, cupStatus } from './core.js';

test('Copenhagen dates handle summer, winter and the DST boundary', () => {
  assert.equal(dayKey('2026-11-02T23:30:00Z'), '2026-11-03');
  assert.equal(dayKey('2026-07-02T22:30:00Z'), '2026-07-03');
  assert.equal(dayKey('2026-03-28T23:30:00Z'), '2026-03-29');
});
test('ISO weeks retain their week-year across New Year', () => {
  assert.equal(weekKey('2027-01-01'), '2026-W53');
  assert.equal(weekKey('2027-01-04'), '2027-W01');
  assert.equal(weekStart('2027-01-03'), '2026-12-28');
  assert.equal(shiftDay('2026-03-29', 1), '2026-03-30');
});
test('A submission reserves points without changing approved results', () => {
  const before = emptyState(), after = submit(before,'7.A','bike','2026-11-03T10:00:00Z','one');
  assert.equal(before.classes['7.A'].entries.length,0);
  assert.equal(stats(after.classes['7.A'],'2026-11-03').total,0);
  assert.equal(stats(after.classes['7.A'],'2026-11-03').used,3);
  assert.equal(stats(after.classes['7.A'],'2026-11-03').co2,0);
});
test('Pending and approved points jointly enforce the 15-point limit', () => {
  let s=emptyState();
  for(let i=0;i<5;i++)s=submit(s,'7.A','bike','2026-11-03T10:00:00Z','entry-'+i);
  assert.throws(()=>submit(s,'7.A','screens','2026-11-03T10:00:00Z','extra'),/15 point/);
  const approved=moderate(s,'7.A',['entry-0'],'approved','2026-11-03T11:00:00Z').state;
  assert.equal(reserved(approved.classes['7.A'],'2026-11-03'),15);
});
test('Rejecting a pending action releases its reservation', () => {
  let s=submit(emptyState(),'7.A','repair','2026-11-03T10:00:00Z','one');
  s=moderate(s,'7.A',['one'],'rejected').state;
  assert.equal(reserved(s.classes['7.A'],'2026-11-03'),0);
  assert.equal(stats(s.classes['7.A'],'2026-11-03').pending,0);
});
test('A review is idempotent and keeps submitted and reviewed times separate', () => {
  let s=submit(emptyState(),'7.A','bike','2026-11-03T10:00:00Z','one');
  let r=moderate(s,'7.A',['one'],'approved','2026-11-04T11:00:00Z');
  assert.equal(r.updated,1);assert.equal(r.state.classes['7.A'].entries[0].date,'2026-11-03');
  assert.equal(r.state.classes['7.A'].entries[0].reviewedAt,'2026-11-04T11:00:00.000Z');
  r=moderate(r.state,'7.A',['one'],'approved');
  assert.equal(r.updated,0);assert.equal(r.skipped,1);assert.equal(stats(r.state.classes['7.A'],'2026-11-03').co2,400);
});
test('Late approvals belong to the submission week, not the review week', () => {
  let s=submit(emptyState(),'7.A','bike','2026-10-25T10:00:00Z','old');
  s=moderate(s,'7.A',['old'],'approved','2026-11-03T10:00:00Z').state;
  const now=stats(s.classes['7.A'],'2026-11-03');assert.equal(now.today,0);assert.equal(now.week,0);assert.equal(now.total,3);
  assert.equal(history(s.classes['7.A'],'2026-11-03').find(r=>r.key==='2026-W43').points,3);
});
test('Bulk approval cannot exceed a historical daily cap even with malformed reservations', () => {
  let s=emptyState();
  for(let i=0;i<4;i++)s.classes['7.A'].entries.push({id:String(i),action:'repair',date:'2026-10-25',status:'pending',submittedAt:'2026-10-25T10:00:00Z',reviewedAt:null});
  const r=moderate(s,'7.A',['0','1','2','3'],'approved','2026-11-03T10:00:00Z');
  assert.equal(r.updated,3);assert.equal(r.skipped,1);assert.equal(stats(r.state.classes['7.A'],'2026-11-03').total,12);
});
test('Demo is internally consistent, bounded per day and independent from own data', () => {
  const own=emptyState(),s=seedDemo('2026-11-03T10:00:00Z');
  assert.equal(own.classes['7.A'].entries.length,0);assert.equal(stats(s.classes['7.A'],'2026-11-03').total,178);
  for(const c of CLASSES){const days=new Set(s.classes[c].entries.map(e=>e.date));for(const day of days)assert.ok(reserved(s.classes[c],day)<=15);}
  for(const date of ['2026-11-02','2026-11-08','2027-01-01']){const d=seedDemo(date+'T10:00:00Z');for(const c of CLASSES)for(const e of d.classes[c].entries)assert.ok(e.date<=date);}
  assert.deepEqual(normalizeState(s),s);
});
test('Tied classes share a place and a new week starts with zero weekly points', () => {
  const s=emptyState();assert.deepEqual(ranking(s,'2026-11-03').map(r=>r.rank),[1,1,1]);
  let one=submit(s,'7.A','bike','2026-11-01T10:00:00Z','one');one=moderate(one,'7.A',['one'],'approved').state;
  assert.equal(ranking(one,'2026-11-02')[0].points,0);assert.equal(stats(one.classes['7.A'],'2026-11-02').total,3);
});
test('Cup boundaries do not show an expired example as live', () => {
  assert.equal(cupStatus('2026-11-01'),'upcoming');assert.equal(cupStatus('2026-11-29'),'active');assert.equal(cupStatus('2026-11-30'),'ended');
});
test('Finance expected example matches revenue, all school costs and break-even', () => {
  const r=finance(FINANCE.expected);assert.equal(r.revenue,49500);assert.equal(r.costs,35250);assert.equal(r.profit,14250);assert.equal(r.totalSchools,35);assert.equal(r.breakEven,15);
  assert.equal(finance({...FINANCE.expected,municipalities:0}).breakEven,23);
});
test('Finance handles no contribution, salary and already covered fixed costs', () => {
  assert.equal(finance({...FINANCE.expected,price:150,municipalities:0}).breakEven,null);
  assert.equal(finance({...FINANCE.expected,price:100,municipalities:0}).breakEven,null);
  assert.equal(finance({...FINANCE.expected,salary:120000}).costs,155250);
  assert.equal(finance({...FINANCE.expected,hosting:0,support:0,development:0}).breakEven,0);
});
test('Invalid data and fractional school counts are rejected', () => {
  assert.throws(()=>normalizeState({version:2}),/Dataformat/);
  assert.throws(()=>finance({...FINANCE.expected,schools:1.5}),/hele tal/);
  assert.throws(()=>finance({...FINANCE.expected,price:NaN}),/Brug tal/);
  assert.throws(()=>finance({...FINANCE.expected,schools:-1}),/Brug tal/);
  const bad=emptyState();bad.classes['7.A'].entries.push({id:'x',action:'unknown'});assert.throws(()=>normalizeState(bad),/indsendelse/);
  assert.equal(ACTIONS.length,9);
});
