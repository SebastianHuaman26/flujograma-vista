import { setupDialog } from './components/dialog.js';
import { renderFlow } from './components/flow-card.js';
import { renderTeam, renderKpiAvatars, renderFooterSystems, renderHeadCounts } from './components/team-card.js';
import { FLOWS } from './data/flows.js';
import { renderProcessMenu, renderPeopleMenu, renderSystemsMenu, applyFilters, setupFilterEvents } from './services/filters.js';
import { renderIndex, setActiveFlow, setupFlowEvents, setupObserver, setupTrackNav, setupChrome } from './services/navigation.js';
import { setupPrint } from './services/print.js';
import { $ } from './utils/dom.js';

function init() {
  renderProcessMenu();
  renderPeopleMenu();
  renderSystemsMenu();
  renderKpiAvatars();
  renderIndex();
  renderHeadCounts();
  renderFooterSystems();
  $('#flowsList').innerHTML = FLOWS.map(renderFlow).join('');
  renderTeam();

  setupFilterEvents();
  setupFlowEvents();
  setupDialog();
  setupTrackNav();
  setupChrome();
  setupPrint();

  applyFilters();
  setActiveFlow(1);
  setupObserver();
}

init();
