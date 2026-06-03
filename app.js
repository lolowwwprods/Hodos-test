/* ============================================================
   app.js — Hodos Prototype
   ============================================================ */

// ── Theme ────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('hodos-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  refreshToggleLabel(saved);
}

function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme');
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('hodos-theme', next);
  refreshToggleLabel(next);
}

function refreshToggleLabel(theme) {
  document.querySelectorAll('.theme-toggle-label').forEach(el => {
    el.textContent = theme === 'light' ? 'Mode sombre' : 'Mode clair';
  });
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.textContent = theme === 'light' ? '🌙' : '☀️';
  });
}

// ── Onboarding ───────────────────────────────────────────────
let obStep   = 1;
const OB_MAX = 3;
const obAnswers = {};

function obSelect(step, value, el) {
  obAnswers[step] = value;
  document.querySelectorAll(`[data-step="${step}"] .opt-btn`).forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const btn = document.getElementById(`ob-next-${step}`);
  if (btn) { btn.disabled = false; btn.classList.remove('opacity-50'); }
}

function obNext(step) {
  if (!obAnswers[step]) return;
  document.querySelector(`[data-step="${step}"]`).classList.remove('active');
  if (step < OB_MAX) {
    obStep = step + 1;
    const next = document.querySelector(`[data-step="${obStep}"]`);
    if (next) next.classList.add('active');
    setObProgress(obStep);
  } else {
    document.getElementById('ob-success').classList.add('active');
    setObProgress(OB_MAX + 1);
  }
}

function setObProgress(step) {
  const pct = Math.min(Math.round((step / (OB_MAX + 1)) * 100), 100);
  const el  = document.getElementById('ob-prog-fill');
  if (el) el.style.width = pct + '%';
}

// ── Timer (Mode 10 min) ───────────────────────────────────────
let timerInterval = null;
let timerSecs     = 10 * 60;
let timerOn       = false;

function toggleTimer() {
  const w  = document.getElementById('timer-widget');
  if (!w) return;
  timerOn = !timerOn;
  w.classList.toggle('active', timerOn);

  if (timerOn) {
    timerSecs = 10 * 60;
    renderTimer();
    timerInterval = setInterval(() => {
      timerSecs--;
      renderTimer();
      if (timerSecs <= 0) { endTimer(w); }
    }, 1000);
  } else {
    clearInterval(timerInterval);
    timerSecs = 10 * 60;
    renderTimer();
  }
}

function renderTimer() {
  const el = document.getElementById('timer-val');
  if (!el) return;
  const m = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const s = String(timerSecs % 60).padStart(2, '0');
  el.textContent = m + ':' + s;
}

function endTimer(w) {
  clearInterval(timerInterval);
  timerOn = false;
  w.classList.remove('active');
  timerSecs = 10 * 60;
  renderTimer();
  showToast('⏱ Temps écoulé ! Bonne session d\'apprentissage !');
}

// ── Toast notification ─────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('hodos-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'hodos-toast';
    t.style.cssText = [
      'position:fixed','bottom:28px','left:50%','transform:translateX(-50%)',
      'background:#1B2A6B','color:#fff','padding:12px 28px','border-radius:50px',
      'font-family:Montserrat,sans-serif','font-size:.85rem','font-weight:600',
      'box-shadow:0 8px 32px rgba(0,0,0,.25)','z-index:999',
      'transition:opacity .4s','pointer-events:none'
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => { t.style.opacity = '0'; }, 3200);
}

// ── Manager filter ────────────────────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter || 'all';
      document.querySelectorAll('.m-row').forEach(row => {
        row.style.display = (f === 'all' || row.dataset.status === f) ? '' : 'none';
      });
    });
  });
}

// ── Bar chart ─────────────────────────────────────────────────
function initChart() {
  const MAX_PX = 120; // max bar height in pixels (fits in 150px area minus labels)
  document.querySelectorAll('.chart-bar[data-pct]').forEach(bar => {
    const pct = parseInt(bar.dataset.pct, 10);
    const px  = Math.max(4, Math.round((pct / 100) * MAX_PX));
    bar.style.height = '0px';
    setTimeout(() => { bar.style.height = px + 'px'; }, 200);
  });
}

// ── Animated progress bars ────────────────────────────────────
function animateBars() {
  document.querySelectorAll('[data-w]').forEach(el => {
    const target = el.dataset.w;
    el.style.width = '0%';
    setTimeout(() => { el.style.width = target; }, 150);
  });
}

// ── Module click (formation page) ────────────────────────────
function initModules() {
  document.querySelectorAll('.module-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('disabled-mod')) return;
      showToast('📖 Module en cours de chargement…');
    });
  });
}

// ── Video player mock ─────────────────────────────────────────
function initVideoPlayer() {
  const vp = document.getElementById('video-player');
  if (!vp) return;
  let playing = false;
  vp.addEventListener('click', () => {
    playing = !playing;
    const icon = document.getElementById('play-icon');
    if (icon) icon.innerHTML = playing
      ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
      : '<polygon points="5,3 19,12 5,21"/>';
    showToast(playing ? '▶ Lecture en cours…' : '⏸ Vidéo en pause');
  });
}

// ── Splash connect button ──────────────────────────────────────
function goToOnboarding() {
  const visited = localStorage.getItem('hodos-visited');
  window.location.href = visited ? 'dashboard.html' : 'onboarding.html';
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  animateBars();
  initFilterTabs();
  initChart();
  initModules();
  initVideoPlayer();
  if (document.getElementById('ob-prog-fill')) setObProgress(1);
  renderTimer();
});
