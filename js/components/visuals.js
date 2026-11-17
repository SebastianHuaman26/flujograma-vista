import { PEOPLE } from '../data/people.js';
import { SYSTEMS } from '../data/systems.js';
import { $ } from '../utils/dom.js';
import { esc } from '../utils/helpers.js';

function avatar(id, cls) {
  const p = PEOPLE[id];
  if (!p) return '';
  return `<span class="avatar ${cls || ''}" style="--av:${p.color}" title="${esc(p.name)} · ${esc(p.role)}" aria-label="${esc(p.name)}">${esc(p.initials)}</span>`;
}

function personMini(id) {
  const p = PEOPLE[id];
  if (!p) return '';
  return `<span class="person-mini">${avatar(id, 'avatar--xs')}<span>${esc(p.name)}</span></span>`;
}

function sysIcon(id, small) {
  const s = SYSTEMS[id];
  if (!s) return '';
  return `<span class="sys-icon ${small ? 'sys-icon--sm' : ''}" role="img" style="--sc:${s.color};--sb:${s.bg}" title="${esc(s.name)} · ${esc(s.desc)}" aria-label="${esc(s.name)}"><i class="fa-solid ${esc(s.icon)}" aria-hidden="true"></i></span>`;
}

function systemChips(ids) {
  return (ids || []).map(id => {
    const s = SYSTEMS[id];
    if (!s) return '';
    return `<span class="dialog-sys">${sysIcon(id)}<span>${esc(s.name)}</span></span>`;
  }).join('');
}

function statusClass(tone) {
  if (tone === 'gold') return 'status-pill--gold';
  if (tone === 'red') return 'status-pill--red';
  return 'status-pill--live';
}

export { avatar, personMini, sysIcon, systemChips, statusClass };
