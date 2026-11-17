import { avatar, sysIcon } from './visuals.js';
import { TOTAL_FLOWS, COLLABORATORS, DIGITADORES, TOTAL_SYSTEMS } from '../data/catalog.js';
import { FLOWS } from '../data/flows.js';
import { PEOPLE } from '../data/people.js';
import { SYSTEMS } from '../data/systems.js';
import { $ } from '../utils/dom.js';
import { pad2, esc } from '../utils/helpers.js';

function flowsForPerson(id) {
  return FLOWS.filter(flow => flow.people.includes(id));
}

function renderTeam() {
  const grid = $('#teamGrid');
  grid.innerHTML = Object.keys(PEOPLE).map(id => {
    const p = PEOPLE[id];
    const flows = flowsForPerson(id);
    const systems = Array.from(new Set(flows.flatMap(flow => flow.systems)));
    return `<button type="button" class="person-card ${p.lead ? 'person-card--lead' : ''}" data-person-filter="${esc(id)}" style="--pc:${p.color};--pc-bg:${p.bg}">
      <span class="person-cta"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span>
      <span class="person-avatar">${esc(p.initials)}</span>
      <span class="person-name">${esc(p.name)}</span>
      <span class="person-role">${esc(p.role)}</span>
      ${p.lead ? '<span class="supervisor-badge"><i class="fa-solid fa-star" aria-hidden="true"></i>Supervisión</span>' : ''}
      <span class="person-desc">${esc(p.desc)}</span>
      <span class="person-flows">${flows.map(flow => `<span class="flow-mini">${esc(flow.shortName)}</span>`).join('')}</span>
      <span class="person-foot">
        <span class="person-systems">${systems.map(sysId => sysIcon(sysId, true)).join('')}</span>
        <span>${flows.length} ${flows.length === 1 ? 'flujo' : 'flujos'} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
      </span>
    </button>`;
  }).join('');
}

function renderKpiAvatars() {
  $('#kpiAvatars').innerHTML = COLLABORATORS.map(id => avatar(id)).join('');
}

function renderFooterSystems() {
  const list = $('#footerSystems');
  if (!list) return;
  list.innerHTML = Object.keys(SYSTEMS).map(id => {
    const s = SYSTEMS[id];
    return `<div class="footer-row"><i class="fa-solid ${esc(s.icon)}" aria-hidden="true"></i><span><b>${esc(s.name)}</b><br>${esc(s.desc)}</span></div>`;
  }).join('');
}

function renderHeadCounts() {
  const supervisors = Object.keys(PEOPLE).length - COLLABORATORS.length;
  const projects = FLOWS.filter(flow => flow.kind === 'projects')
    .reduce((total, flow) => total + (flow.projects || []).length, 0);
  const setText = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value;
  };
  setText('#metaFlowCount', TOTAL_FLOWS);
  setText('#metaTeamCount', COLLABORATORS.length);
  setText('#orbitFlowCount', pad2(TOTAL_FLOWS));
  setText('#orbitSubline', `${TOTAL_SYSTEMS} sistemas · ${projects} proyectos`);
  setText('#kpiTeamCount', COLLABORATORS.length);
  setText('#flowsEyebrowCount', TOTAL_FLOWS);
  setText('#statCollaborators', COLLABORATORS.length);
  setText('#statSupervisors', supervisors);
  setText('#statDigitadores', DIGITADORES.length);
}

export { flowsForPerson, renderTeam, renderKpiAvatars, renderFooterSystems, renderHeadCounts };
