import { FLOWS } from './flows.js';
import { PEOPLE } from './people.js';
import { SYSTEMS } from './systems.js';

const STEP_MAP = {};
FLOWS.forEach(flow => (flow.steps || []).forEach(step => {
  STEP_MAP[step.id] = Object.assign({}, step, { flowId: flow.n });
}));

const TOTAL_FLOWS = FLOWS.length;
const COLLABORATORS = Object.keys(PEOPLE).filter(id => !PEOPLE[id].lead);
const DIGITACION_FLOW = FLOWS.find(flow => flow.kind === 'digitacion');
const DIGITADORES = DIGITACION_FLOW
  ? DIGITACION_FLOW.people
  : Object.keys(PEOPLE).filter(id => PEOPLE[id].role === 'Digitadora');
const TOTAL_SYSTEMS = Object.keys(SYSTEMS).length;


export { STEP_MAP, TOTAL_FLOWS, COLLABORATORS, DIGITACION_FLOW, DIGITADORES, TOTAL_SYSTEMS };
