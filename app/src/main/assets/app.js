const $ = (id) => document.getElementById(id);

// ISO country : dial code. Where codes are shared, the earlier entry wins (US before CA, Russia before Kazakhstan).


const names = new Intl.DisplayNames(['en'], { type: 'region' });
const flagOf = (iso) => String.fromCodePoint(...[...iso].map((c) => 127397 + c.charCodeAt(0)));
const nameOf = (iso) => { try { return names.of(iso) || iso; } catch (e) { return iso; } };
const countries = DATA.split(',').map((s) => {
  const [iso, dial] = s.split(':');
  return { iso, dial, name: nameOf(iso), flag: flagOf(iso) };
});

// Dropdown: Bangladesh pinned at the top and selected, the rest alphabetical.
const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name));
const ordered = [countries.find((c) => c.iso === 'BD'), ...sorted.filter((c) => c.iso !== 'BD')];
for (const c of ordered) $('cc').add(new Option(`${c.flag} ${c.name} (+${c.dial})`, c.iso));
$('cc').value = 'BD';

const dialOf = (iso) => countries.find((c) => c.iso === iso).dial;

// Longest matching dial code wins: +1242 is Bahamas, +1 202 is the US.
function detect(digits) {
  let best = null;
  for (const c of countries) {
    if (digits.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) best = c;
  }
  return best;
}

// Typing "+" or "00" switches the dropdown to the country automatically.
$('num').addEventListener('input', () => {
  const raw = $('num').value.trim();
  $('note').textContent = '';
  if (!(raw.startsWith('+') || raw.startsWith('00'))) return;
  const digits = raw.startsWith('+') ? raw.replace(/\D/g, '') : raw.slice(2).replace(/\D/g, '');
  const hit = detect(digits);
  if (hit) {
    $('cc').value = hit.iso;
    $('note').textContent = `Country set to ${hit.flag} ${hit.name} (+${hit.dial}) from the number.`;
  }
});

// Full international numbers are used as typed; local numbers get the selected code.
function toIntl(dial, raw) {
  const s = raw.trim();
  if (s.startsWith('+')) return s.replace(/\D/g, '');
  if (s.startsWith('00')) return s.slice(2).replace(/\D/g, '');
  const d = s.replace(/\D/g, '');
  return d.startsWith(dial) ? d : dial + d.replace(/^0+/, '');
}

// Risk checklist. Each ticked sign adds points. This scores the signs, not anyone's real intent.
const FLAGS = { 'f-adv': 25, 'f-otp': 30, 'f-app': 15, 'f-urg': 15, 'f-noid': 15, 'f-deal': 15 };
const LEVELS = ['Very low', 'Low', 'Medium', 'Elevated', 'High', 'Very high'];
const BANDS = ['#66bb2a', '#92b923', '#f2e645', '#feb000', '#e65a00', '#cc2a1e'];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let shown = 0, anim = 0, lastN = '', current = '';

function risk() {
  let s = 0;
  for (const id in FLAGS) if ($(id).checked) s += FLAGS[id];
  return Math.min(100, s);
}

function countUp(to) {
  const id = ++anim, from = shown, t0 = performance.now();
  shown = to;
  if (reduce) { $('score').textContent = to; return; }
  const step = (now) => {
    if (id !== anim) return;
    const p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 3);
    $('score').textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function render() {
  const s = risk();
  const band = Math.min(5, Math.floor(s / 16.67));
  $('needle').style.transform = `rotate(${s * 1.8}deg)`;
  document.querySelectorAll('.seg').forEach((el, i) => el.classList.toggle('dim', i !== band));
  const lv = $('level');
  lv.textContent = LEVELS[band];
  lv.style.background = BANDS[band];
  lv.style.color = band >= 4 ? '#fff' : '#1d2a24';
  countUp(s);
}


function check() {
  const n = toIntl(dialOf($('cc').value), $('num').value);
  const ok = /^\d{8,15}$/.test(n);
  $('msg').textContent = ok ? '' : 'Enter a valid phone number.';
  $('result').hidden = !ok;
  $('meter').hidden = !ok;
  if (!ok) return;
  if (n !== lastN) { // new number: clear the checklist
    lastN = n;
    for (const id in FLAGS) $(id).checked = false;
  }
  current = '+' + n;
  $('formatted').textContent = current;
  $('open').href = 'https://wa.me/' + n;
  $('copy').textContent = 'Copy number';
  refreshScam(lastN);
  // Two frames so the needle animates from rest when the meter appears.
  requestAnimationFrame(() => requestAnimationFrame(render));
}

$('go').addEventListener('click', check);
$('num').addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(current);
    $('copy').textContent = 'Copied';
  } catch (e) {
    $('copy').textContent = 'Copy failed';
  }
});
document.querySelectorAll('.flag').forEach((el) => el.addEventListener('change', render));
// Scammer List: saved only in this browser (localStorage). Works in memory if storage is blocked.
const KEY = 'scammerList';
let scamList = [];
try { scamList = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { scamList = []; }
if (!Array.isArray(scamList)) scamList = [];

function saveList() {
  try { localStorage.setItem(KEY, JSON.stringify(scamList)); } catch (e) { /* storage blocked: list lasts for this session */ }
}

function refreshScam(n) {
  const on = scamList.some((x) => x.n === n);
  $('scam-btn').setAttribute('aria-pressed', on);
  $('listed').hidden = !on;
}

function renderList() {
  const box = $('list');
  box.textContent = '';
  for (const x of scamList) {
    const row = document.createElement('div');
    row.className = 'list-item';
    const info = document.createElement('div');
    const num = document.createElement('div');
    num.className = 'n';
    num.textContent = '+' + x.n;
    const date = document.createElement('div');
    date.className = 'd';
    date.textContent = 'Added ' + x.d;
    info.append(num, date);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Remove';
    del.addEventListener('click', () => {
      scamList = scamList.filter((y) => y.n !== x.n);
      saveList();
      renderList();
      refreshScam(lastN);
    });
    row.append(info, del);
    box.append(row);
  }
  $('list-count').textContent = scamList.length + (scamList.length === 1 ? ' number' : ' numbers');
  $('list-empty').hidden = scamList.length > 0;
}

$('scam-btn').addEventListener('click', () => {
  const i = scamList.findIndex((x) => x.n === lastN);
  if (i >= 0) scamList.splice(i, 1);
  else scamList.push({ n: lastN, d: new Date().toISOString().slice(0, 10) });
  saveList();
  renderList();
  refreshScam(lastN);
});

renderList();
