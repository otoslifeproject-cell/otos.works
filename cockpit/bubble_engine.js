/* ============================================================
   OTOS OneAction™ Bubble Engine v1 — bubble_engine.js
   ============================================================ */

// --- CONFIG ---
const CONFIG = {
  timing: {
    inspect:   450,
    promote:   800,
    rebalance: 900,
    complete:  700,
    hover:     200,
  },
  easing: {
    spring: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  // Bubble diameters as fraction of min(vw, vh)
  size: {
    primary:    0.28,
    secondary:  0.135,
    tertiary:   0.085,
    inspecting: 0.22,
    action:     0.62,
  },
  // Orbital distances from centre as fraction of min(vw, vh)
  orbit: {
    secondary: 0.295,
    tertiary:  0.440,
  },
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

// --- TASK DATA ---
// Replace with real data when integrating with the Cockpit
const TASK_DATA = [
  {
    id: 'task-1',
    title: 'Call Inertiia / CGL roadmap',
    subline: 'Partnership alignment',
    why: 'Inertiia and CGL are key delivery partners — keeping them aligned unlocks the pilot.',
    nextStep: 'Book a 30-min call and share the updated roadmap doc.',
    priority: 1,
    lane: 'focus',
    status: 'active',
  },
  {
    id: 'task-2',
    title: 'Re-cost £150k pre-pilot',
    subline: 'Budget refresh needed',
    why: 'Costs have shifted — presenting outdated numbers risks credibility.',
    nextStep: 'Open the budget sheet and update three line items.',
    priority: 2,
    lane: 'admin',
    status: 'active',
  },
  {
    id: 'task-3',
    title: 'Mark / Emma intro route',
    subline: 'Warm intro pathway',
    why: 'A warm intro through Mark or Emma shortens the sales cycle significantly.',
    nextStep: 'Draft a two-sentence intro request and send to Mark.',
    priority: 3,
    lane: 'support',
    status: 'active',
  },
  {
    id: 'task-4',
    title: 'Log evidence URLs',
    subline: 'Research & evidence base',
    why: 'Evidence URLs are needed for the grant application due end of month.',
    nextStep: 'Add five URLs to the evidence log document.',
    priority: 4,
    lane: 'learning',
    status: 'active',
  },
  {
    id: 'task-5',
    title: 'Clean partner one-pager',
    subline: 'Partner comms refresh',
    why: 'The current one-pager is outdated — partners are asking questions it should answer.',
    nextStep: 'Update the header, stats and call to action.',
    priority: 5,
    lane: 'admin',
    status: 'active',
  },
  {
    id: 'task-6',
    title: 'SkyHawk dry-run QA',
    subline: 'Pre-demo testing',
    why: 'A clean dry-run prevents live demo failures in front of commissioners.',
    nextStep: 'Run through the full SkyHawk flow and log any issues.',
    priority: 6,
    lane: 'focus',
    status: 'active',
  },
];

// --- STATE MACHINE ---
const STATES = {
  REST:        'REST',
  INSPECTING:  'INSPECTING',
  PROMOTING:   'PROMOTING',
  ACTION_MODE: 'ACTION_MODE',
  COMPLETING:  'COMPLETING',
};

let state = {
  current:         STATES.REST,
  oneActionId:     null,   // task id currently in OneAction position
  inspectedId:     null,   // task id currently being inspected
  tasks:           [],     // live working copy of tasks
  slotAngles:      [],     // computed orbital angles per slot index
};

// --- ORBITAL SLOT ANGLES ---
// Predefined so secondary bubbles have stable, organic positions
const SECONDARY_ANGLES_DEG = [315, 40, 130, 225, 355, 80, 170, 260];
const TERTIARY_ANGLES_DEG  = [20, 110, 200, 290];

// --- DOM REFERENCES ---
const field = document.getElementById('bubble-field');
const hint  = document.getElementById('engine-hint');

// --- INIT ---
function init() {
  state.tasks = TASK_DATA.filter(t => t.status === 'active')
                         .sort((a, b) => a.priority - b.priority);
  state.oneActionId = state.tasks[0]?.id ?? null;
  renderBubbleField();
}

// ============================================================
// RENDER
// ============================================================

function renderBubbleField() {
  const existing = new Set([...field.querySelectorAll('.bubble')].map(el => el.dataset.taskId));
  const active   = new Set(state.tasks.map(t => t.id));

  // Remove bubbles for completed/removed tasks
  existing.forEach(id => {
    if (!active.has(id)) field.querySelector(`#bubble-${id}`)?.remove();
  });

  // Create bubbles for new tasks
  state.tasks.forEach(task => {
    if (!existing.has(task.id)) {
      field.appendChild(createBubbleElement(task));
    }
  });

  // Position and style all bubbles
  positionAllBubbles();
}

function createBubbleElement(task) {
  const el = document.createElement('div');
  el.className    = 'bubble';
  el.id           = `bubble-${task.id}`;
  el.dataset.taskId = task.id;
  el.dataset.lane   = task.lane;

  // Standard content (title + subline)
  const content = document.createElement('div');
  content.className = 'bubble-content';

  const title = document.createElement('div');
  title.className = 'bubble-title';
  title.textContent = task.title;

  const subline = document.createElement('div');
  subline.className = 'bubble-subline';
  subline.textContent = task.subline;

  content.appendChild(title);
  content.appendChild(subline);

  // Inspect-state buttons (hidden until inspecting)
  const actions = document.createElement('div');
  actions.className = 'bubble-inspect-actions';

  const btnPromote = document.createElement('button');
  btnPromote.className   = 'btn btn-promote';
  btnPromote.textContent = 'Make this OneAction';
  btnPromote.addEventListener('click', e => { e.stopPropagation(); promoteBubble(task.id); });

  const btnOpen = document.createElement('button');
  btnOpen.className   = 'btn btn-open';
  btnOpen.textContent = 'Open / Do';
  btnOpen.addEventListener('click', e => { e.stopPropagation(); openActionMode(task.id); });

  const btnCollapse = document.createElement('button');
  btnCollapse.className   = 'btn btn-collapse';
  btnCollapse.textContent = 'Collapse';
  btnCollapse.addEventListener('click', e => { e.stopPropagation(); collapseInspect(); });

  actions.appendChild(btnPromote);
  actions.appendChild(btnOpen);
  actions.appendChild(btnCollapse);

  // Action-mode surface (hidden until ACTION_MODE)
  const actionContent = document.createElement('div');
  actionContent.className = 'bubble-action-content';
  actionContent.innerHTML = buildActionHTML(task);

  actionContent.querySelector('.btn-complete')
    .addEventListener('click', e => { e.stopPropagation(); completeCurrentAction(); });
  actionContent.querySelector('.btn-defer')
    .addEventListener('click', e => { e.stopPropagation(); deferCurrentAction(); });
  actionContent.querySelector('.btn-back')
    .addEventListener('click', e => { e.stopPropagation(); backFromAction(); });

  el.appendChild(content);
  el.appendChild(actions);
  el.appendChild(actionContent);

  // Click to inspect (only when not already the OneAction in action mode)
  el.addEventListener('click', () => handleBubbleClick(task.id));

  return el;
}

function buildActionHTML(task) {
  return `
    <div class="action-title">${task.title}</div>
    <div class="action-subline">${task.subline}</div>
    <div class="action-divider"></div>
    <div class="action-label">Why this matters</div>
    <div class="action-text">${task.why}</div>
    <div class="action-divider"></div>
    <div class="action-label">Next step</div>
    <div class="action-text">${task.nextStep}</div>
    <div class="action-buttons">
      <button class="btn btn-complete">Mark Complete</button>
      <button class="btn btn-defer">Defer</button>
      <button class="btn btn-back">← Back</button>
    </div>
  `;
}

// ============================================================
// POSITIONING
// ============================================================

function positionAllBubbles(transitionOverride) {
  const u    = Math.min(window.innerWidth, window.innerHeight);
  const tasks = state.tasks;

  let secIdx = 0;
  let terIdx = 0;

  tasks.forEach(task => {
    const el = document.getElementById(`bubble-${task.id}`);
    if (!el) return;

    const isOneAction   = task.id === state.oneActionId;
    const isInspecting  = task.id === state.inspectedId && state.current === STATES.INSPECTING;
    const isAction      = task.id === state.inspectedId && state.current === STATES.ACTION_MODE;

    // Determine role
    let role, size, x, y;

    if (isAction) {
      role = 'action';
      size = CONFIG.size.action * u;
      x = 0; y = 0;
    } else if (isInspecting) {
      role = 'inspecting';
      size = CONFIG.size.inspecting * u;
      // Shift toward centre slightly
      const slot = getSlotPosition(task.id, isOneAction, secIdx, terIdx, u);
      x = slot.x * 0.35;
      y = slot.y * 0.35;
    } else if (isOneAction) {
      role = 'primary';
      size = CONFIG.size.primary * u;
      x = 0; y = 0;
    } else if (task.priority <= 4) {
      role = 'secondary';
      size = CONFIG.size.secondary * u;
      const angle = SECONDARY_ANGLES_DEG[secIdx % SECONDARY_ANGLES_DEG.length] * (Math.PI / 180);
      const dist  = CONFIG.orbit.secondary * u;
      x = Math.cos(angle) * dist;
      y = Math.sin(angle) * dist;
      secIdx++;
    } else {
      role = 'tertiary';
      size = CONFIG.size.tertiary * u;
      const angle = TERTIARY_ANGLES_DEG[terIdx % TERTIARY_ANGLES_DEG.length] * (Math.PI / 180);
      const dist  = CONFIG.orbit.tertiary * u;
      x = Math.cos(angle) * dist;
      y = Math.sin(angle) * dist;
      terIdx++;
    }

    applyBubbleState(el, { role, size, x, y, transitionOverride });
  });
}

function getSlotPosition(taskId, isOneAction, secIdx, terIdx, u) {
  // Returns raw orbital position before inspect shift
  if (isOneAction) return { x: 0, y: 0 };
  const idx = secIdx;
  const angle = SECONDARY_ANGLES_DEG[idx % SECONDARY_ANGLES_DEG.length] * (Math.PI / 180);
  const dist  = CONFIG.orbit.secondary * u;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
}

function applyBubbleState(el, { role, size, x, y, transitionOverride }) {
  // Set transition timing
  const dur = transitionOverride ?? transitionForRole(role);
  el.style.transition = [
    `transform ${dur}ms ${CONFIG.easing.spring}`,
    `width ${dur}ms ${CONFIG.easing.spring}`,
    `height ${dur}ms ${CONFIG.easing.spring}`,
    `opacity ${dur}ms ${CONFIG.easing.smooth}`,
    `box-shadow ${dur}ms ${CONFIG.easing.smooth}`,
    `border-radius ${dur}ms ${CONFIG.easing.smooth}`,
  ].join(', ');

  // Dimensions (position centres the bubble on x,y relative to field centre)
  el.style.width  = `${size}px`;
  el.style.height = `${size}px`;
  el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

  // Softened state: dim non-inspected bubbles during INSPECTING
  const isSoftened = state.current === STATES.INSPECTING
    && el.dataset.taskId !== state.inspectedId;

  // Role classes
  el.classList.remove('role-primary','role-secondary','role-tertiary','role-inspecting','role-action','softened','state-rest');
  el.classList.add(`role-${role}`);
  if (state.current === STATES.REST && role === 'primary') el.classList.add('state-rest');
  if (isSoftened) el.classList.add('softened');
}

function transitionForRole(role) {
  if (CONFIG.reducedMotion) return 80;
  switch (role) {
    case 'action':     return CONFIG.timing.inspect;
    case 'inspecting': return CONFIG.timing.inspect;
    case 'primary':    return CONFIG.timing.promote;
    default:           return CONFIG.timing.rebalance;
  }
}

// ============================================================
// STATE TRANSITIONS
// ============================================================

function handleBubbleClick(taskId) {
  if (state.current === STATES.PROMOTING || state.current === STATES.COMPLETING) return;
  if (state.current === STATES.ACTION_MODE) return;

  // Clicking an already-inspected bubble collapses it
  if (state.current === STATES.INSPECTING && state.inspectedId === taskId) {
    collapseInspect();
    return;
  }

  // All bubbles — including the current OneAction — go to INSPECTING first.
  // The user must deliberately click Open / Do to enter ACTION_MODE.
  inspectBubble(taskId);
}

// Transition: REST → INSPECTING
function inspectBubble(taskId) {
  state.current     = STATES.INSPECTING;
  state.inspectedId = taskId;
  hint.classList.add('hidden');

  // Hide "Make this OneAction" for the bubble that is already the OneAction
  const el = document.getElementById(`bubble-${taskId}`);
  if (el) {
    const btnPromote = el.querySelector('.btn-promote');
    if (btnPromote) btnPromote.style.display = taskId === state.oneActionId ? 'none' : '';
  }

  positionAllBubbles();
}

// Transition: INSPECTING → PROMOTING → REST
function promoteBubble(taskId) {
  if (state.current !== STATES.INSPECTING) return;

  state.current = STATES.PROMOTING;

  const prevOneActionId = state.oneActionId;
  state.oneActionId     = taskId;
  state.inspectedId     = null;

  // Re-sort: new OneAction gets priority 0, previous OneAction takes demoted slot
  const promoted  = state.tasks.find(t => t.id === taskId);
  const demoted   = state.tasks.find(t => t.id === prevOneActionId);
  const rest      = state.tasks.filter(t => t.id !== taskId && t.id !== prevOneActionId);

  // Rebuild priority order: promoted first, demoted second, others in order
  state.tasks = [promoted, demoted, ...rest].filter(Boolean);

  positionAllBubbles(CONFIG.timing.promote);

  setTimeout(() => {
    state.current = STATES.REST;
    positionAllBubbles();
    hint.classList.remove('hidden');
  }, CONFIG.timing.promote + 100);
}

// Transition: INSPECTING / REST → ACTION_MODE
function openActionMode(taskId) {
  if (state.current === STATES.PROMOTING || state.current === STATES.COMPLETING) return;

  // If the task isn't already the OneAction, promote silently first
  if (taskId !== state.oneActionId) {
    state.oneActionId = taskId;
    const promoted = state.tasks.find(t => t.id === taskId);
    const rest     = state.tasks.filter(t => t.id !== taskId);
    state.tasks    = [promoted, ...rest].filter(Boolean);
  }

  state.current     = STATES.ACTION_MODE;
  state.inspectedId = taskId;
  hint.classList.add('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
}

// Transition: ACTION_MODE → REST (back without completing)
function backFromAction() {
  state.current     = STATES.REST;
  state.inspectedId = null;
  hint.classList.remove('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
}

// Transition: INSPECTING → REST
function collapseInspect() {
  state.current     = STATES.REST;
  state.inspectedId = null;
  hint.classList.remove('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
}

// Transition: ACTION_MODE → COMPLETING → REST
function completeCurrentAction() {
  if (state.current !== STATES.ACTION_MODE) return;

  state.current = STATES.COMPLETING;

  const completedId = state.oneActionId;
  const completedEl = document.getElementById(`bubble-${completedId}`);

  // Mark task done
  const completedTask = state.tasks.find(t => t.id === completedId);
  if (completedTask) completedTask.status = 'done';

  // Animate outgoing bubble
  if (completedEl) {
    completedEl.style.transition = `transform ${CONFIG.timing.complete}ms ${CONFIG.easing.smooth}, opacity ${CONFIG.timing.complete}ms ${CONFIG.easing.smooth}`;
    completedEl.classList.add('completing');
    completedEl.style.transform += ' scale(0.4)';
  }

  setTimeout(() => {
    // Remove completed task
    state.tasks       = state.tasks.filter(t => t.id !== completedId);
    state.inspectedId = null;
    completedEl?.remove();

    // Next OneAction is the new first task
    state.oneActionId = state.tasks[0]?.id ?? null;
    state.current     = STATES.REST;

    renderBubbleField();
    hint.classList.remove('hidden');
  }, CONFIG.timing.complete + 80);
}

// Transition: defer — move OneAction to back of queue
function deferCurrentAction() {
  if (state.current !== STATES.ACTION_MODE) return;

  const deferredId   = state.oneActionId;
  const deferredTask = state.tasks.find(t => t.id === deferredId);
  const rest         = state.tasks.filter(t => t.id !== deferredId);

  // Move to end of tasks
  state.tasks       = [...rest, deferredTask].filter(Boolean);
  state.oneActionId = state.tasks[0]?.id ?? null;
  state.inspectedId = null;
  state.current     = STATES.REST;

  positionAllBubbles(CONFIG.timing.promote);
  hint.classList.remove('hidden');
}

// Recalculates and animates all bubble positions (called after data changes)
function rebalanceBubbles() {
  positionAllBubbles(CONFIG.timing.rebalance);
}

// ============================================================
// RESIZE
// ============================================================

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => positionAllBubbles(0), 120);
});

// ============================================================
// START
// ============================================================

init();
