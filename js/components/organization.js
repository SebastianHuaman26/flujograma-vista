import { ORGANIZATION } from '../data/organization.js';
import { esc } from '../utils/helpers.js';

function roleCard(role) {
  const children = ORGANIZATION.filter(item => item.parent === role.id);
  return `<li class="organization-node">
    <article class="organization-card">
      <h4>${esc(role.title)}</h4>
      ${role.subtitle ? `<p>${esc(role.subtitle)}</p>` : ''}
      ${role.functions.length ? `<details><summary>Consultar ${role.functions.length} funciones</summary><ul>${role.functions.map(text => `<li>${esc(text)}</li>`).join('')}</ul></details>` : ''}
    </article>
    ${children.length ? `<ul class="organization-level" aria-label="Cargos que dependen de ${esc(role.title)}">${children.map(roleCard).join('')}</ul>` : ''}
  </li>`;
}

export function renderOrganization() {
  document.getElementById('organization').innerHTML = `
    <div class="section-head">
      <div><span class="section-eyebrow">Archivo FAMEE · Facultades Integradas</span><h3 id="organizationTitle">Organigrama funcional</h3><p>Funciones por cargo y dependencia jerárquica, sin asignaciones nominales.</p></div>
      <a class="project-link" href="https://docs.google.com/document/d/1ZsvacVqIgq_-iCaKCMDvYzJR1gbJ518U/edit?usp=drive_link&amp;ouid=113476078554077449725&amp;rtpof=true&amp;sd=true" target="_blank" rel="noopener noreferrer">Ver organigrama <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
    </div>
    <ul class="organization-level organization-root">${ORGANIZATION.filter(role => !role.parent).map(roleCard).join('')}</ul>`;
}
