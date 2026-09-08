/* SPME Web UI – client side */

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === name);
  });
}

function cmd(c, p) {
  let url = '/api/cmd?cmd=' + encodeURIComponent(c);
  if (p !== undefined) url += '&p=' + encodeURIComponent(p);
  fetch(url)
    .then(r => r.text())
    .then(() => setTimeout(refreshState, 80))
    .catch(e => console.error(e));
}

function buildVialGrid(vials) {
  const grid = document.getElementById('vial-grid');
  grid.innerHTML = '';
  for (let i = 1; i <= 32; i++) {
    const d = document.createElement('div');
    d.className = 'vial' + (vials[i-1] ? ' on' : '');
    d.textContent = i;
    d.onclick = () => cmd('vial', i);
    grid.appendChild(d);
  }
}

function updateUI(s) {
  // Dashboard
  document.getElementById('t_gc').innerHTML = s.t_gc.toFixed(1) + ' <small>min</small>';
  document.getElementById('t_hs').innerHTML = s.t_hs.toFixed(1) + ' <small>min</small>';
  document.getElementById('n_preload').textContent = s.n_preload;
  document.getElementById('mode').textContent = s.mode;
  document.getElementById('oven_cap').textContent = s.oven_capacity;
  document.getElementById('oven_used').textContent = s.oven_used + ' / ' + s.oven_capacity;
  document.getElementById('total_vials').textContent = s.total_vials;
  document.getElementById('enabled').textContent = s.enabled_vials;
  document.getElementById('completed').textContent = s.completed;
  document.getElementById('remaining').textContent = s.remaining;

  // Sequence
  document.getElementById('n_preload2').textContent = s.n_preload;
  document.getElementById('mode2').textContent = s.mode;
  document.getElementById('method').value = s.method_id;
  if (s.vials) buildVialGrid(s.vials);

  // Live
  document.getElementById('cur_vial').textContent =
    String(s.current_vial).padStart(2,'0') + ' / ' + s.enabled_vials;
  document.getElementById('prog_fill').style.width = s.progress + '%';
  document.getElementById('prog_pct').textContent = s.progress + '%';
  document.getElementById('phase').textContent = s.phase;
  document.getElementById('phase_time').textContent = s.phase_time;
  document.getElementById('events').textContent = s.events || '';

  // oven slots
  const slots = document.querySelectorAll('#oven-slots .slot');
  if (s.oven) {
    s.oven.forEach((occ, i) => {
      if (slots[i]) slots[i].classList.toggle('occ', occ);
    });
  }

  // Manual speed
  document.querySelectorAll('.btn.spd').forEach(b => b.classList.remove('active'));
  const spdMap = { LOW: 'spd_low', MED: 'spd_med', HIGH: 'spd_high' };
  const el = document.getElementById(spdMap[s.speed] || 'spd_med');
  if (el) el.classList.add('active');
}

function refreshState() {
  fetch('/api/state')
    .then(r => r.json())
    .then(updateUI)
    .catch(e => console.error('state', e));
}

function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-GB', { hour12: false });
  document.getElementById('clock').textContent = t;
  document.getElementById('clock2').textContent = t;
}

// init
document.addEventListener('DOMContentLoaded', () => {
  buildVialGrid(new Array(32).fill(false));
  refreshState();
  setInterval(refreshState, 1000);
  setInterval(updateClock, 1000);
  updateClock();
});
