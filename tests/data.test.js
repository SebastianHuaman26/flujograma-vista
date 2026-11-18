import test from 'node:test';
import assert from 'node:assert/strict';
import { FLOWS, PROCESS_OPTIONS, FAENF_SILABOS_LANE } from '../js/data/flows.js';
import { PEOPLE } from '../js/data/people.js';
import { SYSTEMS } from '../js/data/systems.js';
import { STEP_MAP } from '../js/data/catalog.js';
import { filteredFlows, state } from '../js/services/filters.js';

test('siete flujos, catálogos y referencias válidas', () => {
  assert.deepEqual(FLOWS.map(f => f.n), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(PROCESS_OPTIONS.length, 8);
  assert.ok(FAENF_SILABOS_LANE);
  const ids = FLOWS.flatMap(f => (f.steps || []).map(s => s.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const f of FLOWS) {
    f.people.forEach(id => assert.ok(PEOPLE[id], id));
    f.systems.forEach(id => assert.ok(SYSTEMS[id], id));
    for (const s of f.steps || []) {
      assert.ok(PEOPLE[s.owner], s.id);
      (s.systems || []).forEach(id => assert.ok(SYSTEMS[id], id));
      if (s.linkFlow) assert.ok(FLOWS.some(f => f.n === s.linkFlow));
    }
  }
  function references(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['mainSteps', 'stepIds'].includes(key) || (key === 'steps' && child.every(s => typeof s === 'string'))) {
        child.forEach(id => assert.ok(STEP_MAP[id], id));
      } else if (key === 'linkStep') assert.ok(STEP_MAP[child], child);
      else references(child);
    }
  }
  references(FLOWS);
});

test('filtros individuales y todas las combinaciones de proceso, persona y sistema', () => {
  for (const process of PROCESS_OPTIONS.map(p => p.value)) {
    for (const person of [null, ...Object.keys(PEOPLE)]) {
      for (const system of [null, ...Object.keys(SYSTEMS)]) {
        state.process = process;
        state.people = new Set(person ? [person] : []);
        state.systems = new Set(system ? [system] : []);
        const expected = FLOWS.filter(f => (process === 'all' || f.groups.includes(process)) && (!person || f.people.includes(person)) && (!system || f.systems.includes(system)));
        assert.deepEqual(filteredFlows(), expected);
      }
    }
  }
  state.process = 'all'; state.people.clear(); state.systems.clear();
  assert.equal(filteredFlows().length, 7);
});

// Línea base anterior a esta actualización: commit 99930cc.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PLAN_2027 } from '../js/data/plan-2027.js';
import { ORGANIZATION } from '../js/data/organization.js';
const original = JSON.parse(readFileSync(new URL('./fixtures/preserved.json', import.meta.url)));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('flujos 01–06, FAENF, personas, catálogos, pasos históricos y Proyecto 02 intactos', () => {
  FLOWS.slice(0,6).forEach(flow => assert.equal(hash(flow), original.flows[flow.n]));
  assert.equal(hash(PEOPLE), original.people);
  assert.equal(hash(SYSTEMS), original.systems);
  assert.equal(hash(PROCESS_OPTIONS), original.processes);
  assert.equal(hash(FAENF_SILABOS_LANE), original.faenf);
  assert.equal(hash(FLOWS[6].projects[1]), original.project2);
  assert.equal(hash(FLOWS[6].steps), original.steps7);
  assert.equal(hash(FLOWS[6].projects[0].link), original.link);
});
test('Proyecto 01 finalizado, con historial explícito y sin fecha de cierre inventada', () => {
  const project = FLOWS[6].projects[0];
  assert.equal(project.status, 'Finalizado');
  assert.equal(project.time, '100%');
  assert.equal(project.progress.percent, 100);
  assert.equal(project.progress.blocks.filter(b => b.state === 'history').length, 3);
  assert.ok(!FLOWS[6].duration.includes('2 proyectos activos'));
  assert.match(project.progress.note, /No se ha informado una fecha exacta/);
});
test('organigrama sin titulares inventados y con las funciones oficiales', () => {
  assert.deepEqual(ORGANIZATION.map(r => r.parent), [null, 'secretaria', 'supervisor', 'supervisor']);
  assert.deepEqual(ORGANIZATION.map(r => r.functions.length), [0, 12, 12, 7]);
  assert.ok(ORGANIZATION.every(r => !('person' in r)));
});
test('seis actividades independientes, fechas y cifras oficiales sin avances ficticios', () => {
  assert.equal(PLAN_2027.length, 6);
  assert.deepEqual(PLAN_2027.map(a => [a.start,a.end,a.duration]), [
    ['2026-12-01','2027-04-27','98 días laborables'],
    ['2026-11-25','2026-12-15','4 semanas'],
    ['2026-10-20','2027-11-25','274 días laborables'],
    ['2027-04-28','2027-05-28','22 días laborables'],
    ['2027-04-28','2027-05-18','15 días laborables'],
    ['2027-04-28','2027-08-31','77 días laborables']
  ]);
  const metrics = PLAN_2027.map(a => a.metrics.map(m => m.value).join(' | '));
  assert.match(metrics[0], /597 sílabos · 7,173 hojas/);
  assert.match(metrics[2], /12,450 expedientes · 564,000 hojas/);
  assert.match(metrics[2], /141 en total · 76 de posgrado · 65 de pregrado/);
  assert.match(metrics[3], /2,567 expedientes/);
  assert.match(metrics[4], /877 expedientes/);
  assert.match(metrics[5], /373 expedientes administrativos · 68,977 hojas/);
  assert.ok(PLAN_2027.every(a => !('percent' in a) && !('people' in a)));
});
