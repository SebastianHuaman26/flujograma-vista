import { PLAN_2027 } from '../data/plan-2027.js';
import { esc, pad2 } from '../utils/helpers.js';

const displayDate = date => date.split('-').reverse().join('/');
const day = date => Date.parse(`${date}T00:00:00Z`);
const start = day('2026-10-20');
const span = day('2027-11-25') - start;

export function renderPlan2027() {
  document.getElementById('plan-2027').innerHTML = `
    <div class="section-head">
      <div><span class="section-eyebrow">Programación del Archivo</span><h2 id="plan2027Title">Plan de Trabajo 2027</h2><p>Seis actividades programadas. Las metas y fechas de culminación son estimaciones de la fuente; no indican avance real ni se actualizan automáticamente.</p></div>
      <a class="project-link" href="https://docs.google.com/document/d/1V9FOa9wd4dI9xsDxYoXxPxBvf7UBf-qA/edit?usp=drive_link&amp;ouid=113476078554077449725&amp;rtpof=true&amp;sd=true" target="_blank" rel="noopener noreferrer">Ver plan 2027 <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
    </div>
    <p class="plan-2027-note">FAMED: Facultad de Medicina · FAENF: Facultad de Enfermería · FAEST: Facultad de Estomatología · FAMEE: Facultades Integradas. FAEN se conserva como denominación de la fuente, sin equipararla a FAENF.</p>
    <div class="plan-2027-grid">${PLAN_2027.map(activity => `
      <article class="plan-2027-card" aria-labelledby="plan-activity-${activity.id}">
        <span class="section-eyebrow">Actividad ${pad2(activity.id)}</span>
        <h3 id="plan-activity-${activity.id}">${esc(activity.title)}</h3>
        <dl>${activity.metrics.map(metric => `<div><dt>${esc(metric.label)}</dt><dd>${esc(metric.value)}</dd></div>`).join('')}
          <div><dt>Duración estimada</dt><dd>${esc(activity.duration)}</dd></div>
          <div><dt>Inicio programado</dt><dd><time datetime="${activity.start}">${displayDate(activity.start)}</time></dd></div>
          <div><dt>Culminación estimada</dt><dd><time datetime="${activity.end}">${displayDate(activity.end)}</time></dd></div>
        </dl>
        <div class="plan-2027-period" role="img" aria-label="Periodo programado del ${displayDate(activity.start)} al ${displayDate(activity.end)}; no representa avance" style="--plan-start:${100*(day(activity.start)-start)/span}%;--plan-span:${100*(day(activity.end)-day(activity.start))/span}%"><span></span></div>
        <p class="plan-2027-scale">Periodo programado · octubre 2026 — noviembre 2027</p>
      </article>`).join('')}</div>`;
}
