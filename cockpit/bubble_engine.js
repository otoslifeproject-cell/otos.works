/* ============================================================
   OTOS OneAction™ Bubble Engine v2 — bubble_engine.js
   Two-layer architecture:
     .bubble-wrap  → position (transform, width, height, z-index, transition)
     .bubble-sphere → visual (gradient, shadow, squeeze via scaleX/Y keyframes)
   These animate independently so position and squeeze never conflict.
   ============================================================ */

'use strict';

// --- CONFIG ---
const CONFIG = {
  timing: {
    inspect:   400,
    promote:   750,
    rebalance: 800,
    complete:  650,
    defer:     700,
    squeeze:   280,
  },
  easing: {
    spring: 'cubic-bezier(0.34,1.25,0.64,1)',
    smooth: 'cubic-bezier(0.25,0.46,0.45,0.94)',
    settle: 'cubic-bezier(0.22,1,0.36,1)',
  },
  // Sizes in vmin units
  size: {
    primary:    28,
    secondary:  13,
    tertiary:    8,
    inspecting: 20,
    action:     58,
  },
  // Tight cluster offsets in vmin from centre
  cluster: {
    secondary: [
      { dx: -16, dy: -11 },
      { dx:  13, dy: -15 },
      { dx:  20, dy:   4 },
      { dx: -18, dy:   8 },
      { dx:   5, dy:  19 },
      { dx:  -8, dy: -19 },
    ],
    tertiary: [
      { dx:  14, dy:  25 },
      { dx: -25, dy:  11 },
      { dx:  23, dy: -14 },
      { dx: -12, dy: -26 },
    ],
  },
  _reducedMotion: false,
  get reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches || this._reducedMotion;
  },
};

// --- TASK DATA (exact OTOS data) ---
const TASK_DATA = [
  {
    id: 'cgl-roadmap',
    title: 'Call Inertiia / CGL roadmap',
    subline: 'Align scope and next steps.',
    why: 'This moves the work from build/prep into a real partner route.',
    nextStep: 'Open CRM notes, confirm the ask, then prepare the call or message.',
    priority: 1,
    lane: 'people',
    status: 'active',
  },
  {
    id: 'recost-150k',
    title: 'Re-cost £150k pre-pilot',
    subline: 'Clean working funding base.',
    why: 'The specification has matured, so old figures must be clarified before external use.',
    nextStep: 'Open Money / Funding and add each figure to the re-costing register.',
    priority: 2,
    lane: 'money',
    status: 'active',
  },
  {
    id: 'mark-emma-intro',
    title: 'Mark / Emma intro route',
    subline: 'Warm intro pathway.',
    why: 'A warm intro could shorten the credibility and funding route.',
    nextStep: 'Draft a two-sentence intro request and send to Mark.',
    priority: 3,
    lane: 'people',
    status: 'active',
  },
  {
    id: 'evidence-urls',
    title: 'Log evidence URLs',
    subline: 'Research and claims base.',
    why: 'Claims must not float without sources.',
    nextStep: 'Add URLs to the Claims Register and tag as sourced or needs verification.',
    priority: 4,
    lane: 'truth',
    status: 'active',
  },
  {
    id: 'partner-one-pager',
    title: 'Clean partner one-pager',
    subline: 'Keep ask simple.',
    why: 'A clean one-pager helps avoid overwhelming partners or drifting the ask.',
    nextStep: 'Open the partner pack and remove anything not needed for the first conversation.',
    priority: 5,
    lane: 'continuity',
    status: 'active',
  },
  {
    id: 'skyhawk-dry-run',
    title: 'SkyHawk dry-run QA',
    subline: 'Keep parked until safe.',
    why: 'SkyHawk is useful but should not add noise before the core Cockpit is stable.',
    nextStep: 'Check dry-run mode and confirm no uncontrolled collection is active.',
    priority: 6,
    lane: 'skyhawk',
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
  DEFERRED:    'DEFERRED',
};

let state = {
  current:     STATES.REST,
  oneActionId: null,
  inspectedId: null,
  tasks:       [],
};

// --- DOM REFERENCES ---
const field = document.getElementById('bubble-field');
const hint  = document.getElementById('engine-hint');

// ============================================================
// DURATION HELPER
// ============================================================

function durationForRole(role) {
  if (CONFIG.reducedMotion) return 80;
  const map = {
    action:     CONFIG.timing.inspect,
    inspecting: CONFIG.timing.inspect,
    primary:    CONFIG.timing.promote,
  };
  return map[role] ?? CONFIG.timing.rebalance;
}

// ============================================================
// INIT
// ============================================================

function init() {
  state.tasks = TASK_DATA
    .filter(t => t.status === 'active')
    .sort((a, b) => a.priority - b.priority);
  state.oneActionId = state.tasks[0]?.id ?? null;
  renderBubbleField();
  bindKeyboard();
}

// ============================================================
// RENDER
// ============================================================

function renderBubbleField() {
  // Diff: existing bubble-wraps vs active tasks
  const existingWraps = [...field.querySelectorAll('.bubble-wrap')];
  const existingIds   = new Set(existingWraps.map(el => el.dataset.taskId));
  const activeIds     = new Set(state.tasks.map(t => t.id));

  // Remove stale bubbles
  existingWraps.forEach(el => {
    if (!activeIds.has(el.dataset.taskId)) el.remove();
  });

  // Create new bubbles
  state.tasks.forEach(task => {
    if (!existingIds.has(task.id)) {
      field.appendChild(createBubble(task));
    }
  });

  positionAllBubbles();
  updateDebug();
}

function createBubble(task) {
  // --- WRAP (positioning layer) ---
  const wrap = document.createElement('div');
  wrap.className      = 'bubble-wrap';
  wrap.id             = `bubble-${task.id}`;
  wrap.dataset.taskId = task.id;
  wrap.dataset.lane   = task.lane;

  // --- SPHERE (visual layer) ---
  const sphere = document.createElement('div');
  sphere.className = 'bubble-sphere';

  // --- CONTENT: title + subline ---
  const content = document.createElement('div');
  content.className = 'bubble-content';

  const titleEl = document.createElement('div');
  titleEl.className   = 'bubble-title';
  titleEl.textContent = task.title;

  const sublineEl = document.createElement('div');
  sublineEl.className   = 'bubble-subline';
  sublineEl.textContent = task.subline;

  content.appendChild(titleEl);
  content.appendChild(sublineEl);

  // --- ACTIONS: inspect buttons ---
  const actions = document.createElement('div');
  actions.className = 'bubble-actions';

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

  // --- ACTION SURFACE: full execution mode ---
  const actionSurface = document.createElement('div');
  actionSurface.className = 'bubble-action-surface';

  const actionInner = document.createElement('div');
  actionInner.className = 'action-inner';
  actionInner.innerHTML = `
    <div class="action-title">${escapeHTML(task.title)}</div>
    <div class="action-subline">${escapeHTML(task.subline)}</div>
    <div class="action-rule"></div>
    <div class="action-label">Why this matters</div>
    <div class="action-body">${escapeHTML(task.why)}</div>
    <div class="action-rule"></div>
    <div class="action-label">Next step</div>
    <div class="action-body">${escapeHTML(task.nextStep)}</div>
    <div class="action-btns">
      <button class="btn btn-complete">Mark Complete</button>
      <button class="btn btn-defer">Defer</button>
      <button class="btn btn-back">← Back</button>
    </div>
  `;

  actionInner.querySelector('.btn-complete')
    .addEventListener('click', e => { e.stopPropagation(); completeCurrentAction(); });
  actionInner.querySelector('.btn-defer')
    .addEventListener('click', e => { e.stopPropagation(); deferCurrentAction(); });
  actionInner.querySelector('.btn-back')
    .addEventListener('click', e => { e.stopPropagation(); backFromAction(); });

  actionSurface.appendChild(actionInner);

  // Assemble sphere layers
  sphere.appendChild(content);
  sphere.appendChild(actions);
  sphere.appendChild(actionSurface);

  wrap.appendChild(sphere);

  // Click on wrap → handleClick
  wrap.addEventListener('click', () => handleClick(task.id));

  return wrap;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// LAYOUT CALCULATION
// ============================================================

function calculateBubbleLayout() {
  const u   = Math.min(window.innerWidth, window.innerHeight) / 100; // 1 vmin in px
  const map = new Map();

  // Separate oneAction from the rest
  const nonPrimary = state.tasks.filter(t => t.id !== state.oneActionId);

  state.tasks.forEach(task => {
    const isOneAction  = task.id === state.oneActionId;
    const isInspected  = task.id === state.inspectedId;
    const isActionMode = state.current === STATES.ACTION_MODE;
    const isInspecting = state.current === STATES.INSPECTING || state.current === STATES.PROMOTING;

    let role, diam, x, y;

    if (isActionMode && isInspected && isOneAction) {
      // Action mode: OneAction expands to large surface
      role  = 'action';
      diam  = CONFIG.size.action * u;
      x     = 0;
      y     = 0;
    } else if (isOneAction) {
      // Primary: always centred
      role = 'primary';
      diam = CONFIG.size.primary * u;
      x    = 0;
      y    = 0;
    } else {
      // Non-primary tasks: slot index in the nonPrimary array
      const slotIndex = nonPrimary.indexOf(task);
      const isThisInspected = isInspected && (state.current === STATES.INSPECTING);

      if (isThisInspected) {
        role = 'inspecting';
        diam = CONFIG.size.inspecting * u;
        // Inspecting bubble stays in its cluster slot (not pulled to centre)
        const offset = getClusterOffset(slotIndex, u);
        x = offset.x;
        y = offset.y;
      } else if (slotIndex < CONFIG.cluster.secondary.length) {
        role = 'secondary';
        diam = CONFIG.size.secondary * u;
        const offset = getClusterOffset(slotIndex, u);
        x = offset.x;
        y = offset.y;
      } else {
        role = 'tertiary';
        diam = CONFIG.size.tertiary * u;
        const tertiaryIndex = slotIndex - CONFIG.cluster.secondary.length;
        const offset = getTertiaryOffset(tertiaryIndex, u);
        x = offset.x;
        y = offset.y;
      }
    }

    map.set(task.id, { role, diam, x, y });
  });

  return map;
}

function getClusterOffset(slotIndex, u) {
  const slots = CONFIG.cluster.secondary;
  const slot  = slots[slotIndex % slots.length];
  return { x: slot.dx * u, y: slot.dy * u };
}

function getTertiaryOffset(tertiaryIndex, u) {
  const slots = CONFIG.cluster.tertiary;
  const slot  = slots[tertiaryIndex % slots.length];
  return { x: slot.dx * u, y: slot.dy * u };
}

// ============================================================
// POSITIONING
// ============================================================

function positionAllBubbles(transitionMs) {
  const layout = calculateBubbleLayout();
  layout.forEach((geometry, taskId) => {
    const wrap = document.getElementById(`bubble-${taskId}`);
    if (wrap) applyBubblePhysics(wrap, geometry, transitionMs);
  });
}

function applyBubblePhysics(wrap, { role, diam, x, y }, transitionMs) {
  const taskId   = wrap.dataset.taskId;
  const dur      = transitionMs !== undefined ? transitionMs : durationForRole(role);
  const easing   = CONFIG.easing.spring;
  const smooth   = CONFIG.easing.smooth;

  // Set transition on wrap only (position layer)
  wrap.style.transition = [
    `transform ${dur}ms ${easing}`,
    `width ${dur}ms ${easing}`,
    `height ${dur}ms ${easing}`,
    `opacity ${dur}ms ${smooth}`,
    `border-radius ${dur}ms ${smooth}`,
  ].join(', ');

  // Apply dimensions and position
  wrap.style.width     = `${diam}px`;
  wrap.style.height    = `${diam}px`;
  wrap.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

  // Compute softened state
  const isInspectingOrAction = state.current === STATES.INSPECTING || state.current === STATES.ACTION_MODE;
  const isSoftened = isInspectingOrAction
    && taskId !== state.inspectedId
    && taskId !== state.oneActionId;

  // Compute state-inspecting: OneAction is the inspected bubble in INSPECTING state
  const isStateInspecting = state.current === STATES.INSPECTING
    && state.inspectedId === state.oneActionId
    && taskId === state.oneActionId;

  // Rebuild class list cleanly
  const classes = ['bubble-wrap', `role-${role}`];
  if (state.current === STATES.REST && role === 'primary')  classes.push('state-rest');
  if (isStateInspecting)                                    classes.push('state-inspecting');
  if (isSoftened)                                           classes.push('softened');

  // Preserve completing class if present (managed by completeCurrentAction)
  if (wrap.classList.contains('completing')) classes.push('completing');

  wrap.className = classes.join(' ');

  // Show/hide buttons based on role and state
  const btnPromote = wrap.querySelector('.btn-promote');
  const btnOpen    = wrap.querySelector('.btn-open');
  if (btnPromote && btnOpen) {
    if (taskId === state.oneActionId) {
      // OneAction inspect: show Open/Do, hide Make this OneAction
      btnPromote.style.display = 'none';
      btnOpen.style.display    = '';
    } else {
      // Secondary inspect: show Make this OneAction, hide Open/Do
      btnPromote.style.display = '';
      btnOpen.style.display    = 'none';
    }
  }
}

// ============================================================
// CLICK HANDLING
// ============================================================

function handleClick(taskId) {
  // Guard: ignore clicks during transitions
  if (state.current === STATES.PROMOTING)  return;
  if (state.current === STATES.COMPLETING) return;
  if (state.current === STATES.ACTION_MODE) return;

  // Clicking already-inspected bubble collapses it
  if (state.current === STATES.INSPECTING && state.inspectedId === taskId) {
    collapseInspect();
    return;
  }

  // All bubbles (including OneAction) go to INSPECTING on first click.
  // Open/Do must be clicked deliberately to enter ACTION_MODE.
  inspectBubble(taskId);
}

// ============================================================
// STATE TRANSITIONS
// ============================================================

// REST → INSPECTING
function inspectBubble(taskId) {
  state.current     = STATES.INSPECTING;
  state.inspectedId = taskId;
  hint.classList.add('hidden');
  positionAllBubbles();
  updateDebug();
}

// INSPECTING → PROMOTING → REST
function promoteBubble(taskId) {
  if (state.current !== STATES.INSPECTING) return;

  const prevOneActionId = state.oneActionId;
  state.current         = STATES.PROMOTING;
  state.oneActionId     = taskId;
  state.inspectedId     = null;

  // Reorder: promoted first, old OneAction second, rest in order
  const promoted = state.tasks.find(t => t.id === taskId);
  const demoted  = state.tasks.find(t => t.id === prevOneActionId);
  const rest     = state.tasks.filter(t => t.id !== taskId && t.id !== prevOneActionId);
  state.tasks    = [promoted, demoted, ...rest].filter(Boolean);

  positionAllBubbles(CONFIG.timing.promote);
  updateDebug();

  // Trigger soft-body squeeze at ~52% through the promotion animation
  if (!CONFIG.reducedMotion) {
    setTimeout(() => {
      triggerSqueeze(taskId, prevOneActionId);
    }, CONFIG.timing.promote * 0.52);
  }

  // Return to REST once promotion is complete
  setTimeout(() => {
    state.current = STATES.REST;
    positionAllBubbles();
    hint.classList.remove('hidden');
    updateDebug();
  }, CONFIG.timing.promote + 120);
}

// Soft-body contact effect: squeeze promoted and yield demoted spheres
function triggerSqueeze(promotedId, demotedId) {
  const promotedSphere = document.querySelector(`#bubble-${promotedId} .bubble-sphere`);
  const demotedSphere  = document.querySelector(`#bubble-${demotedId} .bubble-sphere`);

  if (promotedSphere) {
    promotedSphere.classList.remove('squeeze-inward', 'squeeze-yield');
    // Force reflow so animation restarts cleanly
    void promotedSphere.offsetWidth;
    promotedSphere.classList.add('squeeze-inward');
  }

  if (demotedSphere) {
    demotedSphere.classList.remove('squeeze-inward', 'squeeze-yield');
    void demotedSphere.offsetWidth;
    demotedSphere.classList.add('squeeze-yield');
  }

  // Remove squeeze classes after animation completes
  const cleanupDelay = CONFIG.timing.squeeze + 60;
  setTimeout(() => {
    promotedSphere?.classList.remove('squeeze-inward');
    demotedSphere?.classList.remove('squeeze-yield');
  }, cleanupDelay);
}

// INSPECTING → ACTION_MODE (only for the current OneAction)
function openActionMode(taskId) {
  if (taskId !== state.oneActionId) return; // Guard: only OneAction can open action mode
  state.current     = STATES.ACTION_MODE;
  state.inspectedId = taskId;
  hint.classList.add('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
  updateDebug();
}

// ACTION_MODE → REST (back without completing)
function backFromAction() {
  state.current     = STATES.REST;
  state.inspectedId = null;
  hint.classList.remove('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
  updateDebug();
}

// INSPECTING → REST
function collapseInspect() {
  state.current     = STATES.REST;
  state.inspectedId = null;
  hint.classList.remove('hidden');
  positionAllBubbles(CONFIG.timing.inspect);
  updateDebug();
}

// ACTION_MODE → COMPLETING → REST
function completeCurrentAction() {
  if (state.current !== STATES.ACTION_MODE) return;

  state.current = STATES.COMPLETING;
  const completedId = state.oneActionId;
  const wrap        = document.getElementById(`bubble-${completedId}`);

  // Animate exit: add completing class, then scale down
  if (wrap) {
    wrap.classList.add('completing');
    wrap.style.transform = wrap.style.transform + ' scale(0.35)';
  }

  setTimeout(() => {
    // Remove completed task from list
    state.tasks       = state.tasks.filter(t => t.id !== completedId);
    state.inspectedId = null;
    state.oneActionId = state.tasks[0]?.id ?? null;
    state.current     = STATES.REST;
    wrap?.remove();

    renderBubbleField();
    hint.classList.remove('hidden');
    updateDebug();
  }, CONFIG.timing.complete + 80);
}

// ACTION_MODE → DEFERRED → REST
function deferCurrentAction() {
  if (state.current !== STATES.ACTION_MODE) return;

  const deferredId   = state.oneActionId;
  const deferredTask = state.tasks.find(t => t.id === deferredId);
  const rest         = state.tasks.filter(t => t.id !== deferredId);

  // Move deferred task to end of queue
  state.tasks       = [...rest, deferredTask].filter(Boolean);
  state.oneActionId = state.tasks[0]?.id ?? null;
  state.inspectedId = null;
  state.current     = STATES.DEFERRED;

  setTimeout(() => {
    state.current = STATES.REST;
    positionAllBubbles(CONFIG.timing.defer);
    hint.classList.remove('hidden');
    updateDebug();
  }, 50);
}

// Recalculate and animate all bubble positions
function rebalanceBubbles() {
  positionAllBubbles(CONFIG.timing.rebalance);
}

// ============================================================
// KEYBOARD
// ============================================================

function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state.current === STATES.ACTION_MODE) {
        backFromAction();
      } else if (state.current === STATES.INSPECTING) {
        collapseInspect();
      }
    }
  });
}

// ============================================================
// DEBUG
// ============================================================

function updateDebug() {
  const elState     = document.getElementById('dbg-state');
  const elOneAction = document.getElementById('dbg-oneaction');
  const elInspected = document.getElementById('dbg-inspected');
  if (elState)     elState.textContent     = `STATE: ${state.current}`;
  if (elOneAction) elOneAction.textContent = `OneAction: ${state.oneActionId ?? '—'}`;
  if (elInspected) elInspected.textContent = `Inspecting: ${state.inspectedId ?? '—'}`;
}

// ============================================================
// RESIZE (debounced)
// ============================================================

let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => positionAllBubbles(0), 120);
});

// ============================================================
// FIELD BACKGROUND CLICK — collapse inspect
// ============================================================

field.addEventListener('click', e => {
  if (e.target === field && state.current === STATES.INSPECTING) {
    collapseInspect();
  }
});

// ============================================================
// DEBUG PANEL WIRING
// ============================================================

document.getElementById('debug-toggle').addEventListener('click', () => {
  const strip = document.getElementById('debug-strip');
  strip.hidden = !strip.hidden;
});

document.getElementById('dbg-motion-toggle').addEventListener('click', () => {
  CONFIG._reducedMotion = !CONFIG._reducedMotion;
  document.getElementById('dbg-motion-toggle').textContent =
    `⚡ Motion: ${CONFIG._reducedMotion ? 'OFF' : 'ON'}`;
});

// ============================================================
// START
// ============================================================

init();
