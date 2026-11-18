import { openStep, closeDialog } from '../components/dialog.js';
import { FLOWS } from '../data/flows.js';
import { PEOPLE } from '../data/people.js';
import { state, applyFilters, clearFilters, closeAllDropdowns } from './filters.js';
import { $, $$ } from '../utils/dom.js';
import { pad2, esc } from '../utils/helpers.js';

function renderIndex() {
  $('#flowIndexList').innerHTML = FLOWS.map(flow => `
    <a href="#flujo-${Number(flow.n)}" class="index-link" data-flow-link="${Number(flow.n)}">
      <span class="index-num">${pad2(flow.n)}</span>
      <span class="index-copy">
        <span class="index-name">${esc(flow.shortName)}</span>
        <span class="index-people">
          ${flow.people.map(id => {
            const p = PEOPLE[id];
            if (!p) return '';
            return `<span class="index-dot" style="--c:${p.color}" title="${esc(p.name)}"></span>`;
          }).join('')}
          <span>${flow.people.length} resp.</span>
        </span>
      </span>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </a>`).join('');
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function openFlowAndScroll(n) {
  const target = document.getElementById(`flujo-${n}`);
  if (!target) return;
  if (target.hidden) clearFilters();
  target.open = true;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    setActiveFlow(n);
  });
}

function setActiveFlow(n) {
  $$('#flowIndexList .index-link').forEach(link => {
    const active = link.dataset.flowLink === String(n);
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

const NAV_SECTIONS = [
  ['flujos', '#flujos'],
  ['flujo-7', '#flujo-7'],
  ['plan-2027', '#plan-2027'],
  ['organization', '#organization'],
  ['equipo', '#equipo']
];

function setActiveNav(id) {
  $$('.nav-links a[href^="#"]').forEach(link => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function focusAfterScroll(node) {
  if (!node) return;
  const focus = () => node.focus({ preventScroll: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', focus, { once: true });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(focus));
  }
}

function setupFlowEvents() {
  $('#flowsList').addEventListener('click', event => {
    const step = event.target.closest('[data-step-id]');
    if (step) {
      event.preventDefault();
      openStep(step.dataset.stepId, step.dataset.owner, step.dataset.n);
    }
  });

  // Listener separado del de filtros: gestiona navegación, modal y anclas del mapa.
  document.addEventListener('click', event => {
    const goto = event.target.closest('[data-goto-flow]');
    if (goto) {
      event.preventDefault();
      closeDialog();
      openFlowAndScroll(goto.dataset.gotoFlow);
      return;
    }

    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) {
      event.preventDefault();
      closeDialog();
      return;
    }

    const anchor = event.target.closest('a[href^="#flujo-"]');
    if (anchor) {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target && target.tagName === 'DETAILS') {
        if (target.hidden) clearFilters();
        target.open = true;
        setActiveFlow(target.dataset.flow);
      }
    }
  });

  $('#teamGrid').addEventListener('click', event => {
    const card = event.target.closest('[data-person-filter]');
    if (!card) return;
    const id = card.dataset.personFilter;
    state.process = 'all';
    state.people = new Set([id]);
    state.systems.clear();
    applyFilters();
    closeAllDropdowns();
    document.getElementById('flujos').scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    focusAfterScroll($('#resultsNote'));
  });

  $('#expandAll').addEventListener('click', () => {
    $$('#flowsList .flow-card:not([hidden])').forEach(card => { card.open = true; });
  });
  $('#collapseAll').addEventListener('click', () => {
    $$('#flowsList .flow-card:not([hidden])').forEach(card => { card.open = false; });
  });

  $$('.flow-card').forEach(card => {
    card.addEventListener('toggle', () => {
      if (card.open) setActiveFlow(card.dataset.flow);
    });
  });
}

function setupObserver() {
  if (!('IntersectionObserver' in window)) return;
  const activeSections = new Set();
  let scheduled = false;
  const syncActiveNav = () => {
    scheduled = false;
    const priority = ['equipo', 'organization', 'plan-2027', 'flujo-7', 'flujos'];
    const selected = priority.find(id => activeSections.has(id));
    if (selected) setActiveNav(selected);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.hidden) {
        activeSections.add(entry.target.id);
      } else {
        activeSections.delete(entry.target.id);
      }
      if (entry.target.classList.contains('flow-card')) {
        if (entry.isIntersecting && !entry.target.hidden) {
        setActiveFlow(entry.target.dataset.flow);
        }
      }
    });
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(syncActiveNav);
    }
  }, { rootMargin: '-86px 0px -72% 0px', threshold: 0 });
  $$('#flowsList .flow-card').forEach(card => observer.observe(card));
  NAV_SECTIONS.forEach(([id]) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
  const syncFromHash = () => {
    const id = location.hash.slice(1);
    if (NAV_SECTIONS.some(([sectionId]) => sectionId === id)) setActiveNav(id);
  };
  window.addEventListener('hashchange', syncFromHash);
  window.addEventListener('popstate', syncFromHash);
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => {
    const id = link.hash.slice(1);
    setActiveNav(id);
  }));
  syncFromHash();
}

function setupTrackNav() {
  const syncShell = shell => {
    const track = $('.flow-track', shell);
    const prev = $('[data-track-prev]', shell);
    const next = $('[data-track-next]', shell);
    if (!track || !prev || !next) return;
    const max = track.scrollWidth - track.clientWidth;
    const scrollable = max > 4;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= max - 2;
    shell.classList.toggle('is-start', !scrollable || atStart);
    shell.classList.toggle('is-end', !scrollable || atEnd);
    prev.disabled = !scrollable || atStart;
    next.disabled = !scrollable || atEnd;
  };

  $$('[data-track-shell]').forEach(shell => {
    const track = $('.flow-track', shell);
    const prev = $('[data-track-prev]', shell);
    const next = $('[data-track-next]', shell);
    if (!track || !prev || !next) return;
    const page = () => Math.max(track.clientWidth * 0.8, 160);
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';
    prev.addEventListener('click', () => track.scrollBy({ left: -page(), behavior }));
    next.addEventListener('click', () => track.scrollBy({ left: page(), behavior }));
    track.addEventListener('scroll', () => syncShell(shell), { passive: true });
    window.addEventListener('resize', () => syncShell(shell));
    syncShell(shell);
  });
}

function setupChrome() {
  const backTop = $('#backTop');
  const onScroll = () => backTop.classList.toggle('is-visible', window.scrollY > 620);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  $('#backTopFooter').addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  // Los enlaces del índice los gestiona el listener delegado de setupFlowEvents().
  if (location.hash && location.hash.startsWith('#flujo-')) {
    const target = document.querySelector(location.hash);
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
      setTimeout(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }), 160);
    }
  }
}

export { renderIndex, openFlowAndScroll, setActiveFlow, focusAfterScroll, setupFlowEvents, setupObserver, setupTrackNav, setupChrome };
