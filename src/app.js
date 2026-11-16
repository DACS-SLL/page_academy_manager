import { marked } from './vendor/marked.esm.js';

const [config, tasks, documents, publishedState] = await Promise.all([
  fetch('./data/config.json').then((r) => r.json()),
  fetch('./data/tasks.json').then((r) => r.json()),
  fetch('./docs/manifest.json').then((r) => r.json()),
  fetch('./data/team-state.json').then((r) => r.json()),
]);

const people = [
  { key: 'Juan', name: 'Juan Alexis Quispe Luque', short: 'Juan Alexis', initials: 'JQ', role: 'Frontend · experiencia de uso', detail: 'Interfaz, formularios, tablero y calidad visual.' },
  { key: 'Fernando', name: 'Fernando Perez del Castillo', short: 'Fernando', initials: 'FP', role: 'Backend · datos y seguridad', detail: 'Modelo de datos, pagos, cálculos y permisos.' },
  { key: 'Yony', name: 'Yony Alex Vilca Mamani', short: 'Yony Alex', initials: 'YV', role: 'Integración · cloud', detail: 'Asistencia, integración, despliegue y entorno.' },
  { key: 'Daniel', name: 'Daniel Casas', short: 'Daniel', initials: 'DC', role: 'Proyecto · QA y documentación', detail: 'Alcance, pruebas, informe y entrega.' },
];
const days = [
  { n: 1, date: '16 NOV', title: 'Contrato funcional presentado', detail: 'Daniel presenta el flujo; el equipo registra viabilidad y contratos técnicos.' },
  { n: 2, date: '17 NOV', title: 'Base cloud y accesos', detail: 'Tres roles entran; vouchers y datos quedan protegidos.' },
  { n: 3, date: '18 NOV', title: 'Solicitud persistente', detail: 'Ciclo, cupo, alumno, inscripción y mensualidades sobreviven a una recarga.' },
  { n: 4, date: '19 NOV', title: 'Operación diaria real', detail: 'Voucher activa matrícula; pago cambia saldo; docente toma lista y traslado respeta cupo.' },
  { n: 5, date: '20 NOV', title: 'MVP completo en cloud', detail: 'Alertas de deuda/faltas, contactos y decisión funcionan de punta a punta.' },
  { n: 6, date: '21 NOV', title: 'Pruebas y estabilización', detail: 'A01–A14, dos academias y permisos sin defectos críticos.' },
  { n: 7, date: '22 NOV', title: 'Congelamiento y ensayo', detail: 'Informe, ZIP y demo ensayados; solo bloqueantes.' },
  { n: 8, date: '23 NOV', title: 'Entrega con margen', detail: 'Cargar dos archivos antes de las 20:00; límite 23:00.' },
];
const labels = { todo: 'Por hacer', doing: 'En curso', blocked: 'Bloqueado', done: 'Completado' };
const storageKey = 'academia-manager-dashboard-v2';
const view = document.getElementById('view');
const drawerRoot = document.getElementById('drawer-root');
const toastNode = document.getElementById('toast');
const taskById = Object.fromEntries(tasks.map((task) => [task.id, task]));

function readLocal() {
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); return { statuses: saved.statuses || {}, notes: saved.notes || {}, profile: saved.profile || 'all' }; }
  catch { return { statuses: {}, notes: {}, profile: 'all' }; }
}
const local = readLocal();
const ui = { owner: 'all', priority: 'all', query: '', docQuery: '', gitRepo: 'app', gitTask: 'B03' };
let toastTimer;

function persist() { localStorage.setItem(storageKey, JSON.stringify(local)); }
function esc(value = '') { return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function statusOf(task) { const status = local.statuses[task.id] || publishedState.statuses?.[task.id]; return labels[status] ? status : 'todo'; }
function noteOf(task) { return local.notes[task.id] ?? publishedState.notes?.[task.id] ?? ''; }
function ownerName(key) { return people.find((person) => person.key === key)?.short || key; }
function initials(key) { return people.find((person) => person.key === key)?.initials || 'EQ'; }
function repoUrl(which) { return which === 'dashboard' ? config.dashboardRepository : config.appRepository; }
function repoClone(which) { return `${repoUrl(which)}.git`; }
function projectDay() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const date = new Date(`${parts}T12:00:00-05:00`);
  const start = new Date('2026-11-16T12:00:00-05:00');
  return Math.floor((date - start) / 86400000) + 1;
}
function remainingDays() {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' });
  const dayNumber = (date) => { const parts = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)])); return Date.UTC(parts.year, parts.month - 1, parts.day); };
  return Math.max(0, Math.round((dayNumber(new Date(config.deliveryDate)) - dayNumber(new Date())) / 86400000));
}
function pct(value, total) { return total ? Math.round((value / total) * 100) : 0; }
function stat() {
  const p0 = tasks.filter((task) => task.priority === 'P0');
  return { total: tasks.length, done: tasks.filter((task) => statusOf(task) === 'done').length, doing: tasks.filter((task) => statusOf(task) === 'doing').length, blocked: tasks.filter((task) => statusOf(task) === 'blocked').length, p0: p0.length, p0Done: p0.filter((task) => statusOf(task) === 'done').length };
}
function notify(message) {
  toastNode.textContent = message;
  toastNode.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastNode.classList.remove('show'), 3200);
}
async function copyText(value) {
  try { await navigator.clipboard.writeText(value); notify('Copiado al portapapeles'); }
  catch { notify('No se pudo copiar; selecciona el texto manualmente'); }
}
function routeInfo() {
  const path = (location.hash || '#/resumen').replace(/^#\/?/, '').split('/');
  const name = ['resumen', 'tablero', 'cronograma', 'documentos', 'git', 'equipo'].includes(path[0]) ? path[0] : 'resumen';
  return { name, arg: path.slice(1).join('/') };
}
function pageHead(label, title, description, actions = '') {
  return `<div class="page-head"><div><div class="eyebrow">${esc(label)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</div>`;
}
function taskMini(task) {
  return `<button class="task-mini" data-task="${esc(task.id)}" type="button"><span class="tiny-prio ${task.priority === 'P0' ? 'p0' : ''}"></span><span><strong>${esc(task.title)}</strong><small>${esc(task.id)} · ${esc(ownerName(task.owner))} · Día ${task.day}</small></span><span class="mini-arrow">↗</span></button>`;
}
function avatar(key) { return `<span class="avatar ${esc(key)}">${esc(initials(key))}</span>`; }

function renderSummary() {
  const s = stat();
  const day = projectDay();
  const today = days.find((item) => item.n === day);
  const relevant = tasks.filter((task) => task.day <= Math.max(1, Math.min(8, day + 1)) && statusOf(task) !== 'done').sort((a, b) => a.day - b.day).slice(0, 5);
  const p0Percent = pct(s.p0Done, s.p0);
  view.innerHTML = `${pageHead('CENTRO DE PROYECTO', 'Un equipo. Un MVP que funciona.', 'Todo lo necesario para coordinar el desarrollo, la documentación y la entrega.', `<a class="btn btn-light" href="#/documentos/00_GUIA_VISUAL_CONTRATO_MVP.md">Ver contrato visual ↗</a>`)}
    <section class="hero"><div class="hero-content"><span class="hero-label"><i></i> SPRINT DE 8 DÍAS · 16—23 NOV</span><h2>De la matrícula al seguimiento, sin perder el hilo.</h2><p>La meta es mostrar cuotas, pagos, asistencia y alertas reales en una aplicación cloud. Cada tarea debe aportar al recorrido de demostración.</p><div class="hero-actions"><a href="#/tablero" class="btn btn-lime">Ver tareas <span>↗</span></a><a href="#/cronograma" class="btn btn-light" style="background:transparent;color:#e4f0ee;border-color:#48606c">Ver cronograma</a></div></div><div class="hero-metric"><strong>${remainingDays()}</strong><span>DÍAS PARA ENTREGA</span></div></section>
    <section class="stat-grid" aria-label="Indicadores del proyecto"><div class="stat-card"><div class="stat-top">Tareas completadas <span class="stat-icon">✓</span></div><span class="stat-value">${s.done}<small style="font-size:13px;color:#9aa9ae"> / ${s.total}</small></span><span class="stat-foot">Estado personal del navegador</span></div><div class="stat-card"><div class="stat-top">En curso <span class="stat-icon">↗</span></div><span class="stat-value">${s.doing}</span><span class="stat-foot">Trabajo activo</span></div><div class="stat-card"><div class="stat-top">P0 completado <span class="stat-icon">⚑</span></div><span class="stat-value">${p0Percent}%</span><span class="stat-foot">${s.p0Done} de ${s.p0} tareas críticas</span></div><div class="stat-card"><div class="stat-top">Bloqueos <span class="stat-icon">!</span></div><span class="stat-value">${s.blocked}</span><span class="stat-foot">Resolver antes de P1</span></div></section>
    <section class="content-grid"><div class="panel"><div class="panel-heading"><h3>Avance del sprint</h3><a href="#/tablero">Abrir tablero ↗</a></div><div class="progress-top"><span>Recorrido P0</span><strong>${p0Percent}%</strong></div><div class="bar"><span style="width:${p0Percent}%"></span></div><div class="progress-top"><span>Todo el plan</span><strong>${pct(s.done, s.total)}%</strong></div><div class="bar cyan"><span style="width:${pct(s.done, s.total)}%"></span></div><div class="section-split"></div><div class="panel-heading"><h3>${today ? `Puerta de salida · Día ${day}` : day < 1 ? 'Primer hito · Día 1' : 'Sprint finalizado'}</h3><a href="#/cronograma">Todos los días ↗</a></div><div class="callout"><span>✳</span><div><strong>${esc(today?.title || (day < 1 ? days[0].title : 'Revisar entrega y evidencias'))}</strong><p>${esc(today?.detail || (day < 1 ? days[0].detail : 'La fecha de entrega ya pasó; conserva el histórico del proyecto.'))}</p></div></div><div class="section-split"></div><div class="panel-heading"><h3>Próximas tareas</h3><a href="#/tablero">Ver todas ↗</a></div><div class="task-mini-list">${relevant.length ? relevant.map(taskMini).join('') : '<div class="empty-state"><strong>Todo al día</strong>No quedan tareas pendientes en este tramo.</div>'}</div></div><div class="panel"><div class="panel-heading"><h3>Hitos de entrega</h3><a href="#/cronograma">Cronograma completo ↗</a></div><div class="milestone-list">${days.map((item) => `<div class="milestone ${day === item.n ? 'active' : day > item.n ? 'past' : ''}"><span class="milestone-date">D${item.n}</span><span class="milestone-track"><i></i></span><div><strong>${esc(item.title)}</strong><p>${esc(item.date)} · ${esc(item.detail)}</p></div></div>`).join('')}</div><div class="callout warning"><span>ⓘ</span><div><strong>Estado compartido por Git</strong><p>La base del tablero se publica desde data/team-state.json. Tus cambios siguen siendo locales hasta integrar ese JSON por PR.</p></div></div></div></section>`;
}

function filteredTasks() {
  const q = ui.query.toLocaleLowerCase('es');
  return tasks.filter((task) => (ui.owner === 'all' || task.owner === ui.owner) && (ui.priority === 'all' || task.priority === ui.priority) && (!q || `${task.id} ${task.title} ${task.summary} ${task.owner}`.toLocaleLowerCase('es').includes(q)));
}
function taskCard(task) {
  return `<article class="task-card" data-task="${esc(task.id)}" tabindex="0" role="button" aria-label="Abrir tarea ${esc(task.id)}"><div class="card-top"><span class="task-id">${esc(task.id)} · ${esc(task.area.toUpperCase())}</span><span class="priority-badge ${task.priority === 'P0' ? 'p0' : task.priority === 'P1' ? 'p1' : 'parallel'}">${esc(task.priority)}</span></div><h3>${esc(task.title)}</h3><p>${esc(task.summary)}</p><div class="card-bottom">${avatar(task.owner)}<small>${esc(ownerName(task.owner))}</small><small class="due">DÍA ${task.day}</small></div></article>`;
}
function renderKanbanColumns() {
  const visible = filteredTasks();
  const board = document.getElementById('kanban');
  if (!board) return;
  board.innerHTML = Object.entries(labels).map(([key, label]) => {
    const items = visible.filter((task) => statusOf(task) === key);
    return `<section class="kanban-col" aria-label="${label}"><div class="kanban-head"><strong>${label}</strong><span>${items.length}</span></div><div class="kanban-list">${items.length ? items.map(taskCard).join('') : '<div class="empty-state">Sin tareas en esta columna</div>'}</div></section>`;
  }).join('');
}
function renderBoard() {
  view.innerHTML = `${pageHead('EJECUCIÓN', 'Tablero del sprint', 'Tareas del plan final, responsables y criterios de entrega.', `<button class="btn btn-light" id="import-state">Importar JSON</button><button class="btn btn-dark" id="export-state">Exportar estado ↗</button>`)}<div class="callout" style="margin-bottom:17px"><span>ⓘ</span><div><strong>Seguimiento personal sin base de datos</strong><p>Los cambios aquí se guardan solo en este navegador. Para el estado común del equipo, usen Issues y Pull Requests en GitHub o compartan el JSON exportado.</p></div></div><div class="toolbar"><label class="search-wrap"><input id="task-search" type="search" placeholder="Buscar tarea, ID o módulo..." value="${esc(ui.query)}" aria-label="Buscar tareas" /></label><select id="owner-filter" class="filter-select" aria-label="Filtrar por integrante"><option value="all">Todo el equipo</option>${people.map((p) => `<option value="${p.key}" ${ui.owner === p.key ? 'selected' : ''}>${esc(p.short)}</option>`).join('')}</select><select id="priority-filter" class="filter-select" aria-label="Filtrar por prioridad"><option value="all">Todas las prioridades</option><option value="P0" ${ui.priority === 'P0' ? 'selected' : ''}>Crítico · P0</option><option value="P1" ${ui.priority === 'P1' ? 'selected' : ''}>Mejora · P1</option></select></div><div id="kanban" class="kanban"></div><input type="file" id="state-file" accept="application/json,.json" hidden />`;
  const guidance = view.querySelector('.callout');
  guidance.querySelector('strong').textContent = 'Estado publicado + cambios locales';
  guidance.querySelector('p').textContent = 'Todos leen data/team-state.json del repositorio del panel. Para compartir tus cambios, exporta el JSON y abre un PR que reemplace ese archivo.';
  const syncButton = document.createElement('button');
  syncButton.className = 'btn btn-light';
  syncButton.textContent = 'Usar estado publicado';
  syncButton.addEventListener('click', () => {
    if (syncButton.dataset.confirm !== 'yes') { syncButton.dataset.confirm = 'yes'; syncButton.textContent = 'Confirmar: descartar cambios locales'; return; }
    local.statuses = {}; local.notes = {}; persist(); render(); notify('Estado publicado cargado');
  });
  view.querySelector('.page-actions').prepend(syncButton);
  renderKanbanColumns();
  document.getElementById('task-search').addEventListener('input', (event) => { ui.query = event.target.value; renderKanbanColumns(); });
  document.getElementById('owner-filter').addEventListener('change', (event) => { ui.owner = event.target.value; renderKanbanColumns(); });
  document.getElementById('priority-filter').addEventListener('change', (event) => { ui.priority = event.target.value; renderKanbanColumns(); });
  document.getElementById('export-state').addEventListener('click', exportState);
  document.getElementById('import-state').addEventListener('click', () => document.getElementById('state-file').click());
  document.getElementById('state-file').addEventListener('change', importState);
}

function renderTimeline() {
  const day = projectDay();
  view.innerHTML = `${pageHead('RUTA CRÍTICA', 'Ocho días. Ocho puertas de salida.', 'Cada día termina con una versión integrada y un resultado que se puede comprobar.', `<a href="#/documentos/PLAN_FINAL.md" class="btn btn-light">Leer plan completo ↗</a>`)}<div class="timeline-layout">${days.map((item) => {
    const items = tasks.filter((task) => task.day === item.n);
    return `<article class="timeline-card ${day === item.n ? 'today' : ''}"><div class="date-box"><strong>${item.date.split(' ')[0]}</strong><small>NOV</small></div><div><h3>Día ${item.n} · ${esc(item.title)}</h3><p>${esc(item.detail)}</p><div class="task-chips">${items.map((task) => `<button class="chip" data-task="${esc(task.id)}" type="button">${esc(task.id)} · ${esc(ownerName(task.owner))}</button>`).join('')}</div></div>${day === item.n ? '<span class="today-tag">HOY</span>' : ''}</article>`;
  }).join('')}</div><div class="callout warning" style="margin-top:18px"><span>⚑</span><div><strong>Congelamiento: 22 de noviembre al mediodía</strong><p>El 23 se corrigen solo fallos que impiden la demo o la entrega. La carga en Classroom debe quedar confirmada antes de las 20:00.</p></div></div>`;
}

function safeHref(value) {
  const href = String(value || '').trim();
  if (/^[a-z0-9_-]+\.md$/i.test(href)) return `#/documentos/${encodeURIComponent(href)}`;
  if (/^assets\/[a-z0-9_-]+\.(png|svg|pdf)$/i.test(href)) return `./docs/${href}`;
  return /^(https?:\/\/|mailto:|#)/i.test(href) ? href : '';
}
marked.use({ renderer: {
  html() { return ''; },
  image(token) { const href = safeHref(token.href); return /^\.\/docs\/assets\/[a-z0-9_-]+\.png$/i.test(href) ? `<a class="doc-image-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><img src="${esc(href)}" alt="${esc(token.text || 'Infografía del documento')}" loading="lazy"></a>` : `<span class="image-placeholder">[Imagen: ${esc(token.text || '')}]</span>`; },
  link(token) { const href = safeHref(token.href); const external = /^(https?:\/\/|\.\/docs\/assets\/)/i.test(href); return href ? `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(token.text || href)}</a>` : esc(token.text || 'enlace'); },
} });

function renderDocList() {
  const list = document.getElementById('doc-list');
  if (!list) return;
  const query = ui.docQuery.toLocaleLowerCase('es');
  const selected = decodeURIComponent(routeInfo().arg || 'PLAN_FINAL.md');
  const items = documents.filter((doc) => `${doc.title} ${doc.file} ${doc.description}`.toLocaleLowerCase('es').includes(query));
  list.innerHTML = items.length ? items.map((doc) => `<a class="doc-item ${selected === doc.file ? 'active' : ''}" href="#/documentos/${encodeURIComponent(doc.file)}"><span class="doc-glyph">▤</span><span><strong>${esc(doc.title)}</strong><small>${esc(doc.file)} · ${(doc.bytes / 1024).toFixed(1)} KB</small></span></a>`).join('') : '<div class="empty-state">No hay documentos que coincidan.</div>';
}
async function loadDoc(file) {
  const doc = documents.find((item) => item.file === file) || documents[0];
  const target = document.getElementById('doc-viewer');
  if (!target || !doc) return;
  target.innerHTML = '<div class="empty-state">Cargando documento…</div>';
  try {
    const response = await fetch(`./docs/${encodeURIComponent(doc.file)}`);
    if (!response.ok) throw new Error('No se pudo cargar');
    const markdown = await response.text();
    if (!target.isConnected) return;
    target.innerHTML = `<div class="doc-viewer-head"><div><strong>${esc(doc.title)}</strong><small>${esc(doc.file)} · Markdown versionado en el repositorio del panel</small></div><a class="btn btn-light" href="./docs/${encodeURIComponent(doc.file)}" download>Descargar .md ↓</a></div><article class="doc-body markdown">${marked.parse(markdown)}</article>`;
    target.querySelector('.doc-body').scrollTop = 0;
  } catch { target.innerHTML = '<div class="empty-state"><strong>Documento no disponible</strong>Revisa que exista en docs/ y vuelve a desplegar.</div>'; }
}
function renderDocs(file) {
  const selected = decodeURIComponent(file || 'PLAN_FINAL.md');
  view.innerHTML = `${pageHead('BIBLIOTECA', 'Documentación viva', 'Todos los archivos .md de docs/ aparecen aquí después de integrarse y desplegarse.', `<a class="btn btn-dark" href="${esc(repoUrl('dashboard'))}/tree/main/docs" target="_blank" rel="noopener noreferrer">Abrir carpeta en GitHub ↗</a>`)}<div class="doc-layout"><aside class="doc-list-panel"><h3>Archivos del proyecto <span style="color:#9aabb1">· ${documents.length}</span></h3><label class="search-wrap"><input id="doc-search" type="search" placeholder="Buscar documento..." aria-label="Buscar documento" /></label><div class="doc-list" id="doc-list"></div><div class="callout" style="margin-top:16px"><span>ⓘ</span><div><strong>¿Subir un .md?</strong><p>Añádelo a docs/ del repositorio del panel y abre un PR. Vercel lo mostrará tras el deploy.</p></div></div></aside><section class="doc-viewer" id="doc-viewer" aria-label="Documento seleccionado"></section></div>`;
  renderDocList();
  document.getElementById('doc-search').addEventListener('input', (event) => { ui.docQuery = event.target.value; renderDocList(); });
  loadDoc(selected);
}

function branchFor(task, which) {
  if (which === 'dashboard') return `docs/${task.id.toLowerCase()}-${task.title.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28)}`;
  const prefix = task.area === 'QA' ? 'test' : task.area === 'Documentación' ? 'docs' : 'feat';
  return `${prefix}/${task.id.toLowerCase()}-${task.title.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28)}`;
}
function gitCommands(which, task) {
  const folder = which === 'dashboard' ? 'page_academy_manager' : 'cloud_project_academy';
  const branch = branchFor(task, which);
  return `cd ${folder}\ngit remote -v\ngit switch main\ngit pull origin main\ngit switch -c ${branch}\n# Edita, prueba y revisa tus cambios\ngit status\ngit diff\ngit add .\ngit commit -m "${which === 'dashboard' ? 'docs' : 'feat'}(${task.id}): ${task.title.toLocaleLowerCase('es')}"\ngit push -u origin ${branch}`;
}
function renderGitGuide() {
  const task = taskById[ui.gitTask] || tasks[0];
  const code = gitCommands(ui.gitRepo, task);
  const panel = document.getElementById('git-guide');
  if (!panel) return;
  const repo = repoUrl(ui.gitRepo);
  panel.innerHTML = `<div class="guide-grid"><div class="code-panel"><div class="code-head"><span>TERMINAL · ${ui.gitRepo === 'dashboard' ? 'REPOSITORIO DEL PANEL' : 'REPOSITORIO DEL SAAS'}</span><button class="btn btn-ghost" id="copy-git" style="color:#d7f3e0">Copiar comandos ⧉</button></div><pre id="git-command-text">${esc(code)}</pre></div><div class="guide-box"><h3>Antes del push</h3><ol><li><strong>Comprueba el remoto.</strong> Debe coincidir con el repositorio elegido.</li><li><strong>Trabaja en tu rama.</strong> No hagas push directo a main.</li><li><strong>Ejecuta pruebas.</strong> Revisa cambios con <code>git diff</code>.</li><li><strong>Abre un PR.</strong> Incluye ID, evidencia y revisor.</li><li><strong>Verifica integración.</strong> SaaS y panel tienen despliegues separados.</li></ol><a href="${esc(repo)}/compare" target="_blank" rel="noopener noreferrer" class="btn btn-dark" style="margin-top:13px">Abrir Pull Request ↗</a></div></div>`;
  const firstTime = document.createElement('p');
  firstTime.style.cssText = 'font-size:10px;color:#82949e;line-height:1.5;margin:0 0 12px';
  firstTime.textContent = `Si aún no tienes este repositorio, clónalo una vez: git clone ${repoClone(ui.gitRepo)}`;
  panel.querySelector('.guide-box ol').before(firstTime);
  document.getElementById('copy-git').addEventListener('click', () => copyText(code));
}
function renderGit() {
  view.innerHTML = `${pageHead('FLUJO DE EQUIPO', 'Dos repositorios. Una forma de trabajar.', 'El código del SaaS y esta página se publican en lugares diferentes.', `<a href="#/documentos/GUIA_GIT_Y_VERCEL.md" class="btn btn-light">Leer guía completa ↗</a>`)}<div class="repo-grid"><article class="repo-card"><span class="repo-eyebrow">01 / PRODUCTO</span><h3>Aplicación SaaS</h3><p>Matrícula, pagos, asistencia, backend, base de datos y pruebas.</p><span class="repo-url">${esc(config.appRepository)}.git</span><div class="repo-actions"><a class="btn btn-dark" href="${esc(config.appRepository)}" target="_blank" rel="noopener noreferrer">Repositorio ↗</a><a class="btn btn-light" href="${esc(config.appRepository)}/issues" target="_blank" rel="noopener noreferrer">Issues ↗</a><a class="btn btn-light" href="${esc(config.appRepository)}/pulls" target="_blank" rel="noopener noreferrer">PRs ↗</a></div></article><article class="repo-card"><span class="repo-eyebrow">02 / COORDINACIÓN</span><h3>Este panel</h3><p>Interfaz de seguimiento, archivos Markdown y despliegue en Vercel.</p><span class="repo-url">${esc(config.dashboardRepository)}.git</span><div class="repo-actions"><a class="btn btn-dark" href="${esc(config.dashboardRepository)}" target="_blank" rel="noopener noreferrer">Repositorio ↗</a><a class="btn btn-light" href="${esc(config.dashboardRepository)}/tree/main/docs" target="_blank" rel="noopener noreferrer">Documentos ↗</a><a class="btn btn-light" href="${esc(config.dashboardRepository)}/pulls" target="_blank" rel="noopener noreferrer">PRs ↗</a></div></article></div><div class="panel" style="margin-bottom:16px"><div class="panel-heading"><h3>Comandos para mi tarea</h3><span class="eyebrow" style="font-size:9px">LISTO PARA COPIAR</span></div><div class="toolbar"><select id="git-repo-choice" class="filter-select" aria-label="Elegir repositorio"><option value="app" ${ui.gitRepo === 'app' ? 'selected' : ''}>Aplicación SaaS</option><option value="dashboard" ${ui.gitRepo === 'dashboard' ? 'selected' : ''}>Panel de gestión</option></select><select id="git-task-choice" class="filter-select" aria-label="Elegir tarea">${tasks.map((item) => `<option value="${esc(item.id)}" ${ui.gitTask === item.id ? 'selected' : ''}>${esc(item.id)} · ${esc(item.title)}</option>`).join('')}</select></div><div id="git-guide"></div><div class="callout warning" style="margin-top:15px"><span>!</span><div><strong>Comprueba la rama base</strong><p>Estos comandos usan main. Si GitHub muestra otra rama predeterminada, sustitúyela antes de ejecutarlos. Los repositorios deben existir y tu cuenta necesita permisos de escritura.</p></div></div></div><div class="panel"><div class="panel-heading"><h3>Actividad compartida de GitHub</h3><span class="eyebrow" style="font-size:9px">SOLO LECTURA · REPOSITORIOS PÚBLICOS</span></div><div id="github-activity" class="callout"><span>⌁</span><div><strong>Consultando GitHub…</strong><p>Si el repositorio es privado, abre Issues y PRs desde los enlaces anteriores con tu sesión de GitHub.</p></div></div></div>`;
  renderGitGuide();
  document.getElementById('git-repo-choice').addEventListener('change', (event) => { ui.gitRepo = event.target.value; renderGitGuide(); });
  document.getElementById('git-task-choice').addEventListener('change', (event) => { ui.gitTask = event.target.value; renderGitGuide(); });
  loadGithubActivity();
}
async function loadGithubActivity() {
  const target = document.getElementById('github-activity');
  const repositories = [config.appRepository, config.dashboardRepository].map((url) => url.replace(/^https:\/\/github\.com\//, ''));
  try {
    const results = await Promise.all(repositories.map(async (repository) => {
      const response = await fetch(`https://api.github.com/repos/${repository}`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error('No visible');
      const item = await response.json();
      return { name: repository.split('/')[1], issues: item.open_issues_count, url: item.html_url };
    }));
    if (!target?.isConnected) return;
    target.innerHTML = `<span>⌁</span><div><strong>Repositorios públicos disponibles</strong><p>${results.map((item) => `<a href="${esc(item.url)}/issues" target="_blank" rel="noopener noreferrer">${esc(item.name)}: ${item.issues} Issues/PR abiertos ↗</a>`).join(' · ')}</p></div>`;
  } catch {
    if (!target?.isConnected) return;
    target.innerHTML = '<span>ⓘ</span><div><strong>Actividad no disponible desde esta página</strong><p>Puede ser un repositorio privado o una limitación de la API. Usa los enlaces de GitHub; allí sí se verá el estado compartido con tu sesión.</p></div>';
  }
}

function renderTeam() {
  view.innerHTML = `${pageHead('PERSONAS Y RESPONSABILIDADES', 'Cuatro dueños. Entregas claras.', 'Cada integrante lidera un área y revisa personalmente el trabajo de su agente de IA.', `<a href="#/documentos/REGLAS_DE_EQUIPO.md" class="btn btn-light">Reglas de equipo ↗</a>`)}<div class="team-grid">${people.map((person) => {
    const own = tasks.filter((task) => task.owner === person.key);
    const done = own.filter((task) => statusOf(task) === 'done').length;
    return `<article class="team-card">${avatar(person.key)}<div><h3>${esc(person.name)}</h3><div class="role">${esc(person.role)}</div><p>${esc(person.detail)}</p><div class="team-metrics"><span><strong>${own.length}</strong> tareas asignadas</span><span><strong>${done}</strong> completadas en este navegador</span></div><button class="btn btn-ghost" data-owner-jump="${esc(person.key)}" style="padding-left:0;margin-top:13px">Ver sus tareas ↗</button></div></article>`;
  }).join('')}</div><div class="callout" style="margin-top:18px"><span>✳</span><div><strong>Regla de integración</strong><p>Fernando aprueba datos y seguridad; Juan responde por la interfaz; Yony por la versión publicada; Daniel verifica el recorrido, el informe y la entrega. Ningún agente de IA sustituye esa revisión.</p></div></div>`;
}

function openTask(id) {
  const task = taskById[id];
  if (!task) return;
  const status = statusOf(task);
  drawerRoot.innerHTML = `<div class="drawer-backdrop" data-close-drawer></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><div class="drawer-head"><div><span class="priority-badge ${task.priority === 'P0' ? 'p0' : task.priority === 'P1' ? 'p1' : 'parallel'}">${esc(task.id)} · ${esc(task.priority)}</span><h2 id="drawer-title">${esc(task.title)}</h2></div><button class="drawer-close" aria-label="Cerrar detalle" data-close-drawer>✕</button></div><div class="drawer-body"><div class="drawer-section"><h3>Objetivo</h3><p>${esc(task.summary)}</p></div><div class="drawer-section"><h3>Se considera terminado cuando…</h3><p>${esc(task.doneWhen)}</p></div><div class="drawer-section"><h3>Estado local</h3><div class="status-picks">${Object.entries(labels).map(([key, label]) => `<button type="button" data-set-status="${key}" class="${status === key ? 'selected' : ''}">${label}</button>`).join('')}</div><p style="font-size:10px;color:#96a6ad;margin-top:9px">Solo cambia en este navegador. Publica avances compartidos en GitHub.</p></div><div class="drawer-section"><h3>Nota de seguimiento local</h3><textarea id="task-note" class="form-textarea" maxlength="2000" placeholder="Qué falta, decisión tomada o bloqueo…">${esc(local.notes[id] || '')}</textarea><button class="btn btn-dark" id="save-note" style="margin-top:9px">Guardar nota</button></div><div class="drawer-section drawer-meta"><div><small>RESPONSABLE</small><strong>${esc(ownerName(task.owner))}</strong></div><div><small>FECHA OBJETIVO</small><strong>Día ${task.day} · ${15 + task.day} nov</strong></div><div><small>ÁREA</small><strong>${esc(task.area)}</strong></div><div><small>DEPENDE DE</small><strong>${task.depends.length ? esc(task.depends.join(', ')) : 'Ninguna'}</strong></div></div><div class="drawer-section"><a href="#/documentos/PLAN_FINAL.md" class="btn btn-light" data-close-drawer>Ver plan completo ↗</a><a href="${esc(config.appRepository)}/issues/new" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">Abrir Issue en GitHub ↗</a></div></div></aside>`;
  drawerRoot.querySelector('#task-note').value = noteOf(task);
  drawerRoot.querySelectorAll('[data-close-drawer]').forEach((element) => element.addEventListener('click', closeDrawer));
  drawerRoot.querySelectorAll('[data-set-status]').forEach((element) => element.addEventListener('click', () => {
    local.statuses[id] = element.dataset.setStatus;
    persist();
    notify(`Tarea ${id}: ${labels[element.dataset.setStatus]} (estado local)`);
    closeDrawer();
    render();
  }));
  drawerRoot.querySelector('#save-note').addEventListener('click', () => { local.notes[id] = drawerRoot.querySelector('#task-note').value.trim(); persist(); notify('Nota guardada en este navegador'); });
  document.addEventListener('keydown', escapeDrawer, { once: true });
}
function escapeDrawer(event) { if (event.key === 'Escape') closeDrawer(); else document.addEventListener('keydown', escapeDrawer, { once: true }); }
function closeDrawer() { drawerRoot.innerHTML = ''; }

function exportState() {
  const payload = { format: 'academia-manager-state-v1', updatedAt: new Date().toISOString(), statuses: Object.fromEntries(tasks.map((task) => [task.id, statusOf(task)])), notes: Object.fromEntries(tasks.filter((task) => noteOf(task)).map((task) => [task.id, noteOf(task)])) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: 'team-state.json' });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('team-state.json exportado. Revísalo y súbelo por PR al repositorio del panel.');
}
async function importState(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    if (payload.format !== 'academia-manager-state-v1' || typeof payload.statuses !== 'object' || !payload.statuses) throw new Error('Formato inválido');
    local.statuses = Object.fromEntries(Object.entries(payload.statuses).filter(([id, status]) => taskById[id] && labels[status]));
    local.notes = Object.fromEntries(Object.entries(payload.notes || {}).filter(([id, note]) => taskById[id] && typeof note === 'string').map(([id, note]) => [id, note.slice(0, 2000)]));
    persist(); render(); notify('Estado importado en este navegador');
  } catch { notify('El archivo no es un estado válido del panel'); }
  event.target.value = '';
}

function render() {
  const { name, arg } = routeInfo();
  const titles = { resumen: 'Resumen', tablero: 'Tablero', cronograma: 'Cronograma', documentos: 'Documentos', git: 'Git y repositorios', equipo: 'Equipo' };
  document.getElementById('breadcrumb').textContent = titles[name];
  document.querySelectorAll('#nav-main a').forEach((link) => link.classList.toggle('active', link.dataset.route === name));
  document.getElementById('nav-task-count').textContent = String(tasks.length);
  document.getElementById('profile-select').value = local.profile;
  document.getElementById('profile-avatar').textContent = local.profile === 'all' ? 'EQ' : initials(local.profile);
  if (name === 'resumen') renderSummary();
  else if (name === 'tablero') renderBoard();
  else if (name === 'cronograma') renderTimeline();
  else if (name === 'documentos') renderDocs(arg);
  else if (name === 'git') renderGit();
  else renderTeam();
}

document.getElementById('side-app-repo').href = config.appRepository;
document.getElementById('side-panel-repo').href = config.dashboardRepository;
document.getElementById('top-repo').href = config.appRepository;
document.getElementById('profile-select').addEventListener('change', (event) => {
  local.profile = event.target.value;
  ui.owner = local.profile;
  persist();
  render();
  notify(local.profile === 'all' ? 'Viendo todo el equipo' : `Viendo tareas de ${ownerName(local.profile)}`);
});
view.addEventListener('click', (event) => {
  const taskElement = event.target.closest('[data-task]');
  if (taskElement) openTask(taskElement.dataset.task);
  const ownerElement = event.target.closest('[data-owner-jump]');
  if (ownerElement) { ui.owner = ownerElement.dataset.ownerJump; location.hash = '#/tablero'; }
});
view.addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.task-card[data-task]')) { event.preventDefault(); openTask(event.target.dataset.task); } });
window.addEventListener('hashchange', () => { closeDrawer(); render(); window.scrollTo(0, 0); });
if (!location.hash) location.hash = '#/resumen';
render();
