import { renderStepCard, renderTrack } from './step-card.js';
import { avatar, sysIcon } from './visuals.js';
import { STEP_MAP } from '../data/catalog.js';
import { PEOPLE } from '../data/people.js';
import { pad2, esc } from '../utils/helpers.js';

function projectHead(project) {
  return `<div class="project-head">
    <span class="project-icon" aria-hidden="true"><i class="fa-solid ${esc(project.icon)}"></i></span>
    <div class="project-copy">
      <span class="project-tag">${esc(project.tag)} · ${esc(project.status)}</span>
      <h4 class="project-title">${esc(project.name)}</h4>
      <p class="project-desc">${esc(project.description)}</p>
    </div>
    <div class="project-time">
      <i class="fa-regular fa-clock" aria-hidden="true"></i>
      <strong>${esc(project.time)}</strong>
      ${project.timeNote ? `<small>${esc(project.timeNote)}</small>` : ''}
    </div>
  </div>`;
}

function projectMeta(project) {
  return `<div class="project-meta">
    <span class="project-team">
      ${project.people.map(id => {
        const p = PEOPLE[id];
        if (!p) return '';
        return `<span class="project-person">${avatar(id, 'avatar--xs')}${esc(p.name)}</span>`;
      }).join('')}
    </span>
    <span class="project-systems">${project.systems.map(id => sysIcon(id, true)).join('')}</span>
  </div>`;
}

function projectScope(project) {
  const groups = project.scopeGroups || [{ label: 'Alcance', items: project.scope || [] }];
  return groups.map(group => `<div class="project-scope">
    <span class="scope-label">${esc(group.label)}</span>
    ${group.items.map(item => `<span class="scope-chip">${esc(item)}</span>`).join('')}
  </div>`).join('');
}

function projectCoverage(block) {
  if (!block) return '';
  return `<div class="coverage">
    <div class="coverage-label">
      <span>${esc(block.label)}</span>
      <strong>${esc(block.title)}</strong>
    </div>
    <div class="coverage-chips">
      ${(block.items || []).map(item => {
        const text = typeof item === 'string' ? item : item.text;
        const icon = typeof item === 'string' ? 'fa-circle-check' : (item.icon || 'fa-circle-check');
        return `<span class="type-chip"><i class="fa-solid ${esc(icon)}" aria-hidden="true"></i>${esc(text)}</span>`;
      }).join('')}
    </div>
  </div>`;
}

function projectFoot(project) {
  return `<div class="project-foot">
    <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${esc(project.foot)}</span>
    <span class="project-foot-actions">
      ${project.link ? `<a class="project-link" href="${esc(project.link.url)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-google-drive" aria-hidden="true"></i>${esc(project.link.label)}</a>` : ''}
      <span class="close-date"><i class="fa-solid ${esc(project.footIcon)}" aria-hidden="true"></i>${esc(project.status)}</span>
    </span>
  </div>`;
}

function renderProjectProgress(progress) {
  if (!progress) return '';
  const percent = Number(progress.percent) || 0;
  return `<div class="project-progress" style="--p:${percent}">
    <div class="progress-dial" role="img" aria-label="${percent}% de avance reportado">
      <span class="progress-value">${percent}<small>%</small></span>
    </div>
    <div class="progress-main">
      <span class="progress-kicker">${esc(progress.kicker)}</span>
      <strong class="progress-title">${esc(progress.title)}</strong>
      <div class="progress-track" aria-hidden="true"><span></span></div>
      <span class="progress-note">${esc(progress.note)}</span>
    </div>
    <div class="progress-blocks">
      ${progress.blocks.map(block => `<span class="progress-block progress-block--${esc(block.state)}"><span class="progress-block-dot"></span><span><b>${esc(block.label)}</b><small>${esc(block.note)}</small></span></span>`).join('')}
    </div>
  </div>`;
}

function renderProjectLane(lane) {
  if (!lane) return '';
  const step = STEP_MAP[lane.stepId];
  if (!step) return '';
  const peopleIds = [step.owner, ...(step.support || [])].filter(id => PEOPLE[id]);
  return `<div class="project-lane" data-matchable data-people="${esc(peopleIds.join(','))}" data-systems="${esc((step.systems || []).join(','))}">
    <div class="project-lane-head">
      <span class="project-lane-kicker"><i class="fa-solid fa-code-branch" aria-hidden="true"></i>${esc(lane.kicker)}</span>
      <span class="project-lane-join"><i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>${esc(lane.join)}</span>
    </div>
    <div class="project-lane-body">
      ${renderStepCard(step, { compact: true })}
      <p class="project-lane-note">${esc(lane.note)}</p>
    </div>
  </div>`;
}

function renderProjectExtra(extra) {
  if (!extra) return '';
  return `<div class="project-extra">
    <div class="project-extra-head">
      <span class="project-extra-kicker"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i>${esc(extra.kicker)}</span>
      <span class="project-extra-title">${esc(extra.title)}</span>
      <span class="project-extra-from">${esc(extra.from)}</span>
      <span class="project-extra-status"><span class="dot"></span>${esc(extra.status)}</span>
    </div>
    ${renderTrack(extra.stepIds, { compact: true })}
    <p class="project-extra-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>${esc(extra.note)}</p>
  </div>`;
}

function renderProjectCompact(project) {
  return `<article class="project-card" data-matchable data-people="${esc(project.people.join(','))}" data-systems="${esc(project.systems.join(','))}" style="--tone:${project.tone}">
    ${projectHead(project)}
    ${projectMeta(project)}
    ${projectScope(project)}
    <div class="project-phases">
      ${project.phases.map((phase, i) => `<div class="phase">
        <span class="phase-num">FASE ${pad2(i + 1)}</span>
        <span class="phase-title">${esc(phase.title)}</span>
        <span class="phase-desc">${esc(phase.desc)}</span>
      </div>`).join('')}
    </div>
    ${projectFoot(project)}
  </article>`;
}

function renderProjectDetail(project) {
  const stepCount = (project.stepIds || []).length;
  return `<article class="project-card project-card--detail" data-matchable data-people="${esc(project.people.join(','))}" data-systems="${esc(project.systems.join(','))}" style="--tone:${project.tone}">
    ${projectHead(project)}
    ${projectMeta(project)}
    ${projectScope(project)}
    <div class="project-detail">
      ${renderProjectProgress(project.progress)}
      ${projectCoverage(project.teamWork)}
      <div class="project-flow-block">
        <div class="project-block-head">
          <span class="project-block-title"><i class="fa-solid fa-route" aria-hidden="true"></i>Ruta principal</span>
          <span class="project-block-count">${stepCount} pasos</span>
        </div>
        ${renderTrack(project.stepIds)}
      </div>
      ${renderProjectLane(project.parallel)}
      ${renderProjectExtra(project.extra)}
      ${projectCoverage(project.difficulties)}
      ${projectCoverage(project.expected)}
      ${projectCoverage(project.nextSteps)}
    </div>
    ${projectFoot(project)}
  </article>`;
}

function renderProjects(flow) {
  return `<div class="project-grid">
    ${flow.projects.map(project => (project.detail ? renderProjectDetail(project) : renderProjectCompact(project))).join('')}
  </div>`;
}

export { projectHead, projectMeta, projectScope, projectCoverage, projectFoot, renderProjectProgress, renderProjectLane, renderProjectExtra, renderProjectCompact, renderProjectDetail, renderProjects };
