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

// Huella de los datos originales, antes de la refactorización.
import { createHash } from 'node:crypto';
test('datos originales conservados íntegramente', () => {
  assert.equal(createHash('sha256').update(JSON.stringify({PEOPLE,SYSTEMS,PROCESS_OPTIONS,FLOWS})).digest('hex'), 'c5febb279dfadc8f35d07214ee66b1c54f697dc711b17377d5ac3bf49ea548e4');
});
