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
import { renderProjectDetail, renderProjectProgress } from '../js/components/project-card.js';
import { RESOLUTION_TYPES } from '../js/components/dialog.js';
const original = JSON.parse(readFileSync(new URL('./fixtures/preserved.json', import.meta.url)));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('flujos 01–06, FAENF, personas, catálogos, pasos históricos y estructura autorizada del Proyecto 02', () => {
  FLOWS.slice(0,6).forEach(flow => assert.equal(hash(flow), original.flows[flow.n]));
  assert.equal(hash(PEOPLE), original.people);
  assert.equal(hash(SYSTEMS), original.systems);
  assert.equal(hash(PROCESS_OPTIONS), original.processes);
  assert.equal(hash(FAENF_SILABOS_LANE), original.faenf);
  assert.equal(hash(FLOWS[6].projects[1]), original.project2);
  assert.equal(FLOWS[6].projects[1].mockup.url, './mockups/buscador-secretaria-general-mockup.html');
  assert.equal(FLOWS[6].projects[1].time, 'Pendiente por revisión');
  assert.equal(FLOWS[6].projects[1].foot, 'Pendiente por revisión');
  assert.equal(FLOWS[6].projects[1].timeNote, '');
  assert.equal(FLOWS[6].projects[1].status, 'Despliegue');
  assert.deepEqual(FLOWS[6].projects[1].phases.map(phase => phase.title), ['Fase 1 · Buscador MVP', 'Fase 2a · Ajustes e implementación', 'Fase 2b · Producción y despliegue']);
  assert.equal(hash(FLOWS[6].steps), original.steps7);
  assert.equal(hash(FLOWS[6].projects[0].link.label), hash(original.link ? 'Ver presentación' : ''));
});
test('Mockup del Proyecto 02 existe y se renderiza como enlace externo seguro', () => {
  const project = FLOWS[6].projects[1];
  const mockup = readFileSync(new URL('../mockups/buscador-secretaria-general-mockup.html', import.meta.url), 'utf8');
  const html = renderProjectDetail(project);
  assert.match(mockup, /<!doctype html>/i);
  assert.equal((html.match(/>Mockup<\/a>/g) || []).length, 1);
  assert.match(html, /href="\.\/mockups\/buscador-secretaria-general-mockup\.html" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-display/);
  assert.match(html, /Pendiente por revisión/);
  assert.doesNotMatch(html, /8–10 días|cierre objetivo: 10 días|Cierre objetivo: 10 días hábiles/);
});
test('Proyecto 01 con avance global promedio y tres avances específicos del reporte nuevo', () => {
  const project = FLOWS[6].projects[0];
  assert.equal(project.status, 'Finalizado');
  assert.equal(project.time, '78.33%');
  assert.deepEqual(project.activityProgress.map(activity => activity.percent), [100, 100, 35]);
  const renderedActivities = project.activityProgress.map(renderProjectProgress);
  assert.equal((renderedActivities[0].match(/Excel Index|Tipos de resoluciones/g) || []).length, 0);
  assert.equal((renderedActivities[1].match(/Excel Index|Tipos de resoluciones/g) || []).length, 0);
  assert.equal((renderedActivities[2].match(/Excel Index/g) || []).length, 1);
  assert.equal((renderedActivities[2].match(/Tipos de resoluciones/g) || []).length, 1);
  assert.match(renderedActivities[2], /https:\/\/drive\.google\.com\/drive\/u\/2\/folders\/1Tel4dZ2zFcSjjiIU_9gZ-yObuZjwrgYR/);
  assert.match(renderedActivities[2], /target="_blank" rel="noopener noreferrer"/);
  assert.deepEqual(RESOLUTION_TYPES.map(type => type.name), FLOWS[2].coverage.map(item => item.label));
  assert.deepEqual(RESOLUTION_TYPES[0].examples, ['Reincorporación o reinicio', 'Cambio de carrera', 'Traslado interno', 'Traslado externo', 'Ingreso por talento', 'Cambio de plan o carrera']);
  assert.equal((RESOLUTION_TYPES[0].examples.length), 6);
  assert.match(project.progressContext, /global calculado mediante promedio simple.*78\.33 %/i);
  assert.equal(project.link.url, 'https://docs.google.com/presentation/d/1cul4C7aiWsmqsD9W3auSDhQepUWVlfKimMdJ8FWLjYk/edit?usp=sharing');
  assert.match(project.activityProgress[0].blocks[3].note, /No incluye 2002/);
  assert.match(project.activityProgress[0].blocks[2].note, /6 resoluciones de 2002/);
  assert.match(project.activityProgress[1].blocks[0].note, /1\.936 resoluciones/);
  assert.match(project.activityProgress[2].title, /Consolidación del listado de alumnos/);
  assert.match(project.activityProgress[2].blocks[0].note, /610 resoluciones/);
  assert.equal(project.estimatedEnd, '2026-12-04');
  const html = renderProjectDetail(project);
  const panels = [...html.matchAll(/<div class="project-progress [^"]*" style="--p:(\d+)" data-progress="(\d+)">/g)];
  assert.equal(panels.length, 3);
  assert.deepEqual(panels.map(([, cssValue, dataValue]) => [Number(cssValue), Number(dataValue)]), [[100,100],[100,100],[35,35]]);
  assert.equal((html.match(/class="progress-dial"/g) || []).length, 3);
  assert.equal((html.match(/class="progress-track"/g) || []).length, 3);
  assert.match(html, /Fecha estimada de término: 04\/12\/2026/);
  assert.doesNotMatch(html, /50 % reportado|15 % reportado|25 % reportado/);
  assert.ok(!FLOWS[6].duration.includes('2 proyectos activos'));
});
test('organigrama sin titulares inventados y con las funciones oficiales', () => {
  assert.deepEqual(ORGANIZATION.map(r => r.parent), [null, 'secretaria', 'supervisor', 'supervisor']);
  assert.deepEqual(ORGANIZATION.map(r => r.functions.length), [0, 12, 13, 7]);
  assert.equal(ORGANIZATION.find(r => r.id === 'auxiliar').functions[0], 'Recepción de documentos y verificación.');
  assert.ok(ORGANIZATION.every(r => !('person' in r)));
});
test('seis actividades independientes, fechas y cifras oficiales sin avances ficticios', () => {
  assert.equal(PLAN_2027.length, 6);
  assert.equal(PLAN_2027[2].title, 'Digitalización de expedientes FAENF');
  assert.equal(PLAN_2027[5].title, 'Unificación de expedientes administrativos, inventario documental y propuesta para eliminación FAENF — I etapa');
  assert.ok(PLAN_2027.every(activity => !/\bFAEN\b/.test(activity.title)));
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
