/* Тренажёр карт «Каналсервис» — игровая логика */

'use strict';

/* ---------- Конфигурация уровней ---------- */

const LEVELS = [
  { id: 'msk-near',  num: 1, city: 'Москва', name: 'Ближний круг',
    desc: 'Города-спутники до 50 км от центра',
    type: 'city', center: 'msk', filter: c => c.dist <= 50, count: 8 },
  { id: 'msk-mid',   num: 2, city: 'Москва', name: 'Областной пояс',
    desc: 'Города 50–100 км от центра',
    type: 'city', center: 'msk', filter: c => c.dist > 50 && c.dist <= 100, count: 8 },
  { id: 'msk-far',   num: 3, city: 'Москва', name: 'Дальняя орбита',
    desc: 'Города 100–200 км: Тула, Калуга, Тверь, Рязань',
    type: 'city', center: 'msk', filter: c => c.dist > 100, count: 8 },
  { id: 'spb-near',  num: 4, city: 'Санкт-Петербург', name: 'Ближний круг',
    desc: 'Города до 60 км от центра',
    type: 'city', center: 'spb', filter: c => c.dist <= 60, count: 8 },
  { id: 'spb-far',   num: 5, city: 'Санкт-Петербург', name: 'Ленинградская область',
    desc: 'Города 60–200 км: Выборг, Луга, Новгород',
    type: 'city', center: 'spb', filter: c => c.dist > 60, count: 8 },
  { id: 'msk-okrugs', num: 6, city: 'Москва', name: 'Округи Москвы',
    desc: '12 административных округов и районы внутри МКАД',
    type: 'okrugs', center: 'msk', count: 8 },
  { id: 'spb-districts', num: 7, city: 'Санкт-Петербург', name: 'Районы Петербурга',
    desc: 'Все 18 районов города на карте',
    type: 'districts', center: 'spb', count: 10 },
  { id: 'msk-towns', num: 8, city: 'Москва', name: 'Города и посёлки',
    desc: 'Мелкие города и районы спутников: Сходня, Климовск, Лобня',
    type: 'locality', center: 'msk', count: 8 },
  { id: 'spb-towns', num: 9, city: 'Санкт-Петербург', name: 'Посёлки Ленобласти',
    desc: 'Янино, Вырица, Ивангород, Усть-Луга и другие',
    type: 'locality', center: 'spb', count: 8 },
  { id: 'msk-highways', num: 10, city: 'Москва', name: 'Трассы и шоссе',
    desc: 'Куда из Москвы ведёт Киевское, Минское, Варшавское шоссе?',
    type: 'highway', center: 'msk', count: 8 },
  { id: 'spb-highways', num: 11, city: 'Санкт-Петербург', name: 'Трассы и шоссе',
    desc: 'Приморское, Таллинское, Петергофское — куда они ведут?',
    type: 'highway', center: 'spb', count: 8 },
];

const QUESTION_TIME = 15;   // секунд на вопрос
const LIVES = 3;
const BASE_POINTS = 100;

const ACHIEVEMENTS = [
  { id: 'first',      name: 'Первая победа',     icon: 'flag' },
  { id: 'perfect',    name: 'Безупречно',        icon: 'gem' },
  { id: 'combo5',     name: 'Серия ×5',          icon: 'bolt' },
  { id: 'msk-master', name: 'Знаток Подмосковья', icon: 'home' },
  { id: 'spb-master', name: 'Свой в Питере',     icon: 'ship' },
  { id: 'geographer', name: 'Географ',           icon: 'globe' },
  { id: 'rich',       name: 'Счёт 10 000',       icon: 'cup' },
];

const ICONS = {
  flag: '<svg viewBox="0 0 24 24"><path d="M5 3v18h2v-7h11l-2.5-4L18 6H7V3H5z"/></svg>',
  gem:  '<svg viewBox="0 0 24 24"><path d="M12 2L4 9l8 13 8-13-8-7zm0 3.2L16.6 9 12 17.6 7.4 9 12 5.2z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z"/></svg>',
  ship: '<svg viewBox="0 0 24 24"><path d="M4 15l-1 4c3 2 6 3 9 3s6-1 9-3l-1-4-8 3-8-3zm8-12v6h6l-6-6zM3 13l9-3 9 3-9 3-9-3z"/></svg>',
  globe:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7 6h-3.1a15 15 0 00-1.8-3.7A8 8 0 0119 8zM12 4.1c.9 1.1 1.7 2.5 2.2 3.9H9.8c.5-1.4 1.3-2.8 2.2-3.9zM4.3 14a8.2 8.2 0 010-4h3.4a16.4 16.4 0 000 4H4.3zm.7 2h3.1c.3 1.4 1 2.8 1.8 3.7A8 8 0 015 16zm3.1-8H5a8 8 0 014.9-3.7A15 15 0 009.8 8zM12 19.9c-.9-1.1-1.7-2.5-2.2-3.9h4.4c-.5 1.4-1.3 2.8-2.2 3.9zm2.5-5.9H9.5a14.5 14.5 0 010-4h5a14.5 14.5 0 010 4zm.4 5.7c.8-.9 1.5-2.3 1.8-3.7H19a8 8 0 01-4.9 3.7zm1.8-5.7a16.4 16.4 0 000-4h3.4a8.2 8.2 0 010 4h-3.4z"/></svg>',
  cup:  '<svg viewBox="0 0 24 24"><path d="M6 3v8a6 6 0 0012 0V3H6zm14 2h2v3a4 4 0 01-4 4v-2a2 2 0 002-2V5zM4 5h2v3a2 2 0 002 2v2a4 4 0 01-4-4V5zm8 12h2v3h3v2H7v-3h3v-2h2z"/></svg>',
};

/* ---------- Хранилище ---------- */

const store = {
  load() {
    try {
      return JSON.parse(localStorage.getItem('ks_trainer')) || {};
    } catch { return {}; }
  },
  save(data) { localStorage.setItem('ks_trainer', JSON.stringify(data)); },
};
let progress = Object.assign({ stars: {}, best: {}, ach: [], total: 0, sound: true }, store.load());

/* ---------- Звук ---------- */

let audioCtx = null;
function beep(freq, dur = 0.12, type = 'sine', gain = 0.06) {
  if (!progress.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const vol = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    vol.gain.setValueAtTime(gain, audioCtx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(vol).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
  } catch { /* звук недоступен */ }
}
const sfx = {
  correct: () => { beep(660, .1); setTimeout(() => beep(880, .14), 90); },
  wrong:   () => beep(180, .25, 'sawtooth', .05),
  win:     () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .16), i * 130)),
  lose:    () => [400, 300, 200].forEach((f, i) => setTimeout(() => beep(f, .18, 'triangle'), i * 140)),
  tick:    () => beep(1200, .04, 'sine', .025),
};

/* ---------- Конфетти ---------- */

const confetti = (() => {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf = null;

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  function burst(n = 120) {
    const colors = ['#0041A0', '#FF4200', '#0096F0', '#FF6100', '#FFFFFF', '#0064C8'];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: innerWidth / 2 + (Math.random() - .5) * 200,
        y: innerHeight * .35,
        vx: (Math.random() - .5) * 12,
        vy: -Math.random() * 13 - 3,
        size: Math.random() * 7 + 3,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - .5) * .3,
      });
    }
    if (!raf) loop();
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.y < canvas.height + 30);
    if (!particles.length) { cancelAnimationFrame(raf); raf = null; return; }
    for (const p of particles) {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .6);
      ctx.restore();
    }
  }
  return { burst };
})();

/* ---------- Утилиты ---------- */

const $ = sel => document.querySelector(sel);
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
const sample = (arr, n) => shuffle(arr).slice(0, n);

function showToast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), 2600);
}

/* ---------- Переключение экранов ---------- */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

/* ---------- Главный экран ---------- */

function isUnlocked() {
  return true;
}

function renderHome() {
  $('#total-score').textContent = progress.total.toLocaleString('ru-RU');
  const totalStars = LEVELS.reduce((s, l) => s + (progress.stars[l.id] || 0), 0);
  $('#total-stars').textContent = `${totalStars}/${LEVELS.length * 3}`;

  const wrap = $('#levels');
  wrap.innerHTML = '';
  LEVELS.forEach((level, idx) => {
    const stars = progress.stars[level.id] || 0;
    const locked = !isUnlocked(idx);
    const card = document.createElement('button');
    card.className = 'level-card' + (locked ? ' level-card--locked' : '');
    card.innerHTML = `
      <div class="level-card__num">${level.num}</div>
      <div class="level-card__city">${level.city}</div>
      <div class="level-card__name">${level.name}</div>
      <div class="level-card__desc">${level.desc}</div>
      <div class="level-card__footer">
        <div class="level-card__stars">${[1, 2, 3]
          .map(i => `<span class="${i <= stars ? 'star--on' : 'star--off'}">★</span>`).join('')}</div>
        <div class="level-card__best">${progress.best[level.id] ? 'рекорд: ' + progress.best[level.id] : ''}</div>
      </div>
      ${locked ? '<div class="level-card__lock">пройдите уровень ' + (idx) + '</div>' : ''}`;
    if (!locked) card.addEventListener('click', () => startLevel(level));
    wrap.appendChild(card);
  });

  const achWrap = $('#achievements');
  achWrap.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const on = progress.ach.includes(a.id);
    const el = document.createElement('div');
    el.className = 'ach' + (on ? ' ach--on' : '');
    el.title = on ? 'Получено!' : 'Ещё не получено';
    el.innerHTML = `<span class="ach__icon">${ICONS[a.icon]}</span>${a.name}`;
    achWrap.appendChild(el);
  });
}

/* ---------- Игра ---------- */

var map = null;
var layerGroup = null;
var game = null;

const CENTER_ZOOM = { msk: 8, spb: 8 };

function initMap(centerKey) {
  flyToken++;
  if (map) { map.remove(); map = null; }
  const c = CENTERS[centerKey];
  map = L.map('map', { zoomControl: true, attributionControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  map.setView([c.lat, c.lon], CENTER_ZOOM[centerKey]);
  layerGroup = L.layerGroup().addTo(map);
  L.marker([c.lat, c.lon], {
    icon: L.divIcon({ className: '', html: '<div class="pulse-dot"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
  }).addTo(layerGroup).bindTooltip(c.name, { direction: 'top', offset: [0, -10] });
}

function drawRings(centerKey) {
  const c = CENTERS[centerKey];
  [[50, '#0096F0'], [100, '#0064C8'], [200, '#0041A0']].forEach(([km, color]) => {
    L.circle([c.lat, c.lon], {
      radius: km * 1000,
      color, weight: 2, opacity: .55, fill: false, dashArray: '12 10',
      className: 'ring-animated', interactive: false,
    }).addTo(layerGroup);
  });
}

function startLevel(level) {
  game = {
    level,
    questions: buildQuestions(level),
    idx: 0, score: 0, lives: LIVES, streak: 0,
    correct: 0, mistakes: 0, maxStreak: 0,
    locked: false, timerId: null, lastTick: -1,
  };
  $('#game-level-name').textContent = `${level.num}. ${level.city} — ${level.name}`;
  renderProgressDots();
  renderLives();
  updateScorePanel();

  showScreen('#screen-game');
  initMap(level.center);
  drawRings(level.center);
  buildTargets(level);

  setTimeout(() => { map.invalidateSize(); nextQuestion(); }, 120);
}

function buildQuestions(level) {
  const qs = [];
  if (level.type === 'city') {
    const pool = (level.center === 'msk' ? CITIES_MSK : CITIES_SPB).filter(level.filter);
    sample(pool, Math.min(level.count, pool.length)).forEach(city => {
      qs.push({ kind: 'city', target: city, text: `Найдите на карте: ${city.name}`,
        hint: `${level.city} · около ${city.dist} км от центра` });
    });
  } else if (level.type === 'okrugs') {
    const byName = sample(OKRUGS_MSK, 4).map(o => ({
      kind: 'okrugs', target: o, text: `Найдите на карте: ${o.full} округ`,
      hint: `Сокращённо — ${o.name}`,
    }));
    const byCity = sample(OKRUG_CITY_QUIZ, level.count - byName.length).map(q => {
      const o = OKRUGS_MSK.find(x => x.name === q.okrug);
      return { kind: 'okrugs', target: o, text: `В каком округе Москвы находится район «${q.city}»?`,
        hint: 'Кликните по нужному округу на карте' };
    });
    return shuffle([...byName, ...byCity]);
  } else if (level.type === 'districts') {
    sample(DISTRICTS_SPB, level.count).forEach(d => {
      qs.push({ kind: 'districts', target: d, text: `Найдите на карте: район ${d.name}`,
        hint: 'Всего 18 районов — ориентируйтесь по центру, окраинам и заливу' });
    });
  } else if (level.type === 'locality') {
    const pool = level.center === 'msk' ? LOCALITIES_MSK : LOCALITIES_SPB;
    sample(pool, level.count).forEach(loc => {
      qs.push({ kind: 'city', target: loc, text: `Найдите: ${loc.name} (${loc.parent})`,
        hint: 'Кликните по нужной точке на карте' });
    });
  } else if (level.type === 'highway') {
    const pool = level.center === 'msk' ? HIGHWAYS_MSK : HIGHWAYS_SPB;
    sample(pool, level.count).forEach(hw => {
      const distractors = sample(pool.filter(h => h.dest !== hw.dest), 3)
        .map(h => ({ name: h.dest, lat: h.lat, lon: h.lon }));
      qs.push({
        kind: 'highway', target: hw,
        options: shuffle([{ name: hw.dest, lat: hw.lat, lon: hw.lon }, ...distractors]),
        text: `Куда из ${level.center === 'msk' ? 'Москвы' : 'Петербурга'} ведёт ${hw.name}?`,
        hint: 'Выберите город, в который приведёт эта трасса',
      });
    });
  }
  return qs;
}

/* Кликабельные объекты на карте */
var targets = { markers: new Map(), polygons: new Map() };

function buildTargets(level) {
  targets.markers.clear();
  targets.polygons.clear();

  if (level.type === 'city') {
    const pool = (level.center === 'msk' ? CITIES_MSK : CITIES_SPB).filter(level.filter);
    pool.forEach(city => {
      const icon = L.divIcon({ className: '', html: '<div class="city-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      const m = L.marker([city.lat, city.lon], { icon })
        .addTo(layerGroup)
        .bindTooltip(city.name, { direction: 'top', offset: [0, -8], className: 'city-label' });
      m.on('click', () => onAnswer(city, m));
      targets.markers.set(city.name, { data: city, marker: m });
    });
    map.flyToBounds(L.latLngBounds(pool.map(c => [c.lat, c.lon])).pad(0.15), { duration: .8 });
  }

  if (level.type === 'locality') {
    const pool = level.center === 'msk' ? LOCALITIES_MSK : LOCALITIES_SPB;
    pool.forEach(loc => {
      const icon = L.divIcon({ className: '', html: '<div class="city-marker" style="border-color:#0064C8;width:14px;height:14px"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      const m = L.marker([loc.lat, loc.lon], { icon })
        .addTo(layerGroup)
        .bindTooltip(loc.name, { direction: 'top', offset: [0, -6], className: 'city-label' });
      m.on('click', () => onAnswer(loc, m));
      targets.markers.set(loc.name, { data: loc, marker: m });
    });
    map.flyToBounds(L.latLngBounds(pool.map(l => [l.lat, l.lon])).pad(0.15), { duration: .8 });
  }

  if (level.type === 'highway') {
    map.setView([CENTERS[level.center].lat, CENTERS[level.center].lon], 7);
    return;
  }

  if (level.type === 'okrugs') {
    OKRUGS_MSK.forEach(o => {
      const p = L.polygon(o.path, {
        color: '#0041A0', weight: 2, fillColor: '#0041A0', fillOpacity: .12,
        className: 'okrug-polygon',
      }).addTo(layerGroup);
      p.bindTooltip(`${o.name} · ${o.full}`, { className: 'okrug-label', sticky: true });
      p.on('mouseover', () => p.setStyle({ fillColor: '#0096F0', fillOpacity: .3 }));
      p.on('mouseout', () => p.setStyle({ fillColor: '#0041A0', fillOpacity: .12 }));
      p.on('click', () => onAnswer(o, p));
      targets.polygons.set(o.name, { data: o, polygon: p });
    });
    map.setView([55.75, 37.55], 9);
  }

  if (level.type === 'districts') {
    DISTRICTS_SPB.forEach(d => {
      const icon = L.divIcon({ className: '', html: '<div class="city-marker" style="border-color:#0096F0"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      const m = L.marker([d.lat, d.lon], { icon }).addTo(layerGroup);
      m.on('click', () => onAnswer(d, m));
      targets.markers.set(d.name, { data: d, marker: m });
    });
    map.setView([59.92, 30.32], 9);
  }
}

/* ---------- Вопросы и ответы ---------- */

function renderProgressDots() {
  const wrap = $('#progress-dots');
  wrap.innerHTML = '';
  game.questions.forEach((q, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' +
      (i === game.idx ? ' progress-dot--current' : '') +
      (q.result === true ? ' progress-dot--ok' : '') +
      (q.result === false ? ' progress-dot--fail' : '');
    wrap.appendChild(dot);
  });
}

function renderLives() {
  const wrap = $('#lives');
  wrap.innerHTML = '';
  for (let i = 0; i < LIVES; i++) {
    const el = document.createElement('div');
    el.className = 'life' + (i < game.lives ? '' : ' life--lost');
    wrap.appendChild(el);
  }
}

function updateScorePanel() {
  $('#score').textContent = game.score.toLocaleString('ru-RU');
  const comboEl = $('#combo');
  const mult = comboMult();
  if (game.streak >= 2) {
    comboEl.textContent = `×${mult.toFixed(2).replace(/\.?0+$/, '')}`;
    comboEl.classList.remove('hidden');
  } else {
    comboEl.classList.add('hidden');
  }
}

function comboMult() { return Math.min(3, 1 + game.streak * 0.25); }

function nextQuestion() {
  if (game.idx >= game.questions.length) return finishLevel(true);
  const q = game.questions[game.idx];
  game.locked = false;
  game.lastTick = -1;

  const card = $('.question-card');
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';

  $('#question-text').textContent = q.text;
  $('#question-hint').textContent = q.hint;
  const fb = $('#feedback');
  fb.textContent = ''; fb.className = 'question-card__feedback';
  renderOptions(q);
  renderProgressDots();

  startTimer();
}

/* Варианты ответа (для уровней-трасс) */
function renderOptions(q) {
  const wrap = $('#options');
  wrap.innerHTML = '';
  if (!q.options) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  const letters = ['А', 'Б', 'В', 'Г'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-btn__letter">${letters[i]}</span>${opt.name}`;
    btn.addEventListener('click', () => answerHighway(opt, btn));
    btn._dest = opt;
    wrap.appendChild(btn);
  });
}

function disableOptions(pickedBtn, correctName) {
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b._dest.name === correctName) b.classList.add('option-btn--correct');
    else if (b === pickedBtn) b.classList.add('option-btn--wrong');
  });
}

function startTimer() {
  stopTimer();
  const fill = $('#timer-bar');
  fill.classList.remove('question-card__timer-fill--low');
  let ticks = 0;
  game.timerId = setInterval(() => {
    ticks++;
    const elapsed = (ticks * 50) / 1000;
    const left = Math.max(0, 1 - elapsed / QUESTION_TIME);
    fill.style.transform = `scaleX(${left})`;
    if (left < .3) fill.classList.add('question-card__timer-fill--low');
    const whole = Math.ceil(QUESTION_TIME - elapsed);
    if (whole <= 3 && whole > 0 && whole !== game.lastTick) { game.lastTick = whole; sfx.tick(); }
    if (left <= 0) { stopTimer(); onTimeout(); }
  }, 50);
}

function stopTimer() { if (game && game.timerId) { clearInterval(game.timerId); game.timerId = null; } }

function findTargetEntry(obj) {
  if (targets.markers.has(obj.name)) return targets.markers.get(obj.name);
  if (targets.polygons.has(obj.name)) return targets.polygons.get(obj.name);
  return null;
}

/* Общая логика очков и жизней */
function scoreCorrect() {
  const m = ($('#timer-bar').style.transform.match(/scaleX\(([\d.]+)\)/) || [0, '1'])[1];
  const timeLeft = parseFloat(m) || 0;
  const points = Math.round((BASE_POINTS + BASE_POINTS * timeLeft) * comboMult());
  game.correct++; game.streak++;
  game.maxStreak = Math.max(game.maxStreak, game.streak);
  game.score += points;
  return points;
}

function penalize() {
  game.mistakes++; game.streak = 0; game.lives--;
  renderLives();
}

function scheduleAdvance(isCorrect) {
  setTimeout(() => {
    if (game.lives <= 0) return finishLevel(false);
    game.idx++;
    nextQuestion();
  }, isCorrect ? 1500 : 2200);
}

function onAnswer(picked, layerEl) {
  if (!game || game.locked) return;
  const q = game.questions[game.idx];
  const isCorrect = picked.name === q.target.name;
  game.locked = true;
  stopTimer();
  q.result = isCorrect;

  const entry = findTargetEntry(picked);
  const correctEntry = findTargetEntry(q.target);

  if (isCorrect) {
    const points = scoreCorrect();
    feedback(`Верно! +${points} очков`, 'ok');
    sfx.correct();
    if (entry && entry.marker) {
      entry.marker.setZIndexOffset(1000);
      entry.marker.getElement()?.querySelector('.city-marker')?.classList.add('marker-correct');
    }
    if (entry && entry.polygon) entry.polygon.setStyle({ fillColor: '#1FA85C', fillOpacity: .35, color: '#1FA85C' });
    flyToTarget(q.target, () => showTargetInfo(q.target));
  } else {
    penalize();
    feedback(`Неверно. Это ${targetTitle(q.target)}.`, 'fail');
    sfx.wrong();
    if (entry && entry.marker) {
      entry.marker.getElement()?.querySelector('.city-marker')?.classList.add('marker-shake');
    }
    if (correctEntry && correctEntry.marker) {
      correctEntry.marker.setZIndexOffset(1000);
      correctEntry.marker.getElement()?.querySelector('.city-marker')?.classList.add('marker-correct');
    }
    if (correctEntry && correctEntry.polygon) correctEntry.polygon.setStyle({ fillColor: '#1FA85C', fillOpacity: .35, color: '#1FA85C' });
    if (entry && entry.polygon) entry.polygon.setStyle({ fillColor: '#E03131', fillOpacity: .3 });
  }

  updateScorePanel();
  renderProgressDots();
  scheduleAdvance(isCorrect);
}

/* Ответ на вопрос про трассу (варианты выбора) */
function answerHighway(opt, btn) {
  if (!game || game.locked) return;
  const q = game.questions[game.idx];
  const isCorrect = opt.name === q.target.dest;
  game.locked = true;
  stopTimer();
  q.result = isCorrect;
  disableOptions(btn, q.target.dest);

  if (isCorrect) {
    const points = scoreCorrect();
    feedback(`Верно! +${points} очков`, 'ok');
    sfx.correct();
  } else {
    penalize();
    feedback(`Неверно. ${q.target.name} ведёт в ${q.target.dest}.`, 'fail');
    sfx.wrong();
    drawHighway(opt, false);
  }
  drawHighway(q.target, true);

  updateScorePanel();
  renderProgressDots();
  scheduleAdvance(isCorrect);
}

/* Линия маршрута от центра к пункту назначения */
function drawHighway(dest, ok) {
  if (!map) return;
  const c = CENTERS[game.level.center];
  L.polyline([[c.lat, c.lon], [dest.lat, dest.lon]], {
    color: ok ? '#1FA85C' : '#E03131',
    weight: 4, opacity: .8, dashArray: '10 8',
    className: 'ring-animated', interactive: false,
  }).addTo(layerGroup);
  L.circleMarker([dest.lat, dest.lon], {
    radius: 9, color: '#FFFFFF', weight: 2,
    fillColor: ok ? '#1FA85C' : '#E03131', fillOpacity: .9,
  }).addTo(layerGroup).bindTooltip(dest.name, { direction: 'top', offset: [0, -8], className: 'city-label' });
}

function onTimeout() {
  if (!game || game.locked) return;
  const q = game.questions[game.idx];
  game.locked = true;
  q.result = false;
  penalize();
  feedback(q.kind === 'highway'
    ? `Время вышло! ${q.target.name} ведёт в ${q.target.dest}.`
    : `Время вышло! Это ${targetTitle(q.target)}.`, 'fail');
  sfx.wrong();
  const correctEntry = findTargetEntry(q.target);
  if (correctEntry && correctEntry.marker) {
    correctEntry.marker.setZIndexOffset(1000);
    correctEntry.marker.getElement()?.querySelector('.city-marker')?.classList.add('marker-correct');
  }
  if (correctEntry && correctEntry.polygon) correctEntry.polygon.setStyle({ fillColor: '#1FA85C', fillOpacity: .35, color: '#1FA85C' });
  if (q.kind === 'highway') {
    disableOptions(null, q.target.dest);
    drawHighway(q.target, true);
  }
  updateScorePanel();
  renderProgressDots();
  scheduleAdvance(false);
}

function feedback(text, kind) {
  const fb = $('#feedback');
  fb.textContent = text;
  fb.className = `question-card__feedback question-card__feedback--${kind}`;
}

function targetTitle(target) {
  if (target.full) return `${target.full} округ (${target.name})`;
  if (target.parent) return `${target.name} (${target.parent})`;
  if (target.dist != null) return `${target.name}, ~${target.dist} км от центра`;
  return target.name;
}

function showTargetInfo(target) {
  const text = targetTitle(target);
  const entry = findTargetEntry(target);
  if (entry && entry.marker) {
    entry.marker.bindPopup(`<b>${text}</b>`).openPopup();
  } else if (entry && entry.polygon) {
    entry.polygon.bindPopup(`<b>${text}</b>`).openPopup();
  }
}

/* Анимация «перелёта» от центра к цели (интерполяция координат) */
var flyToken = 0;
function flyToTarget(target, done) {
  if (!map) { done && done(); return; }
  const token = flyToken;
  const c = CENTERS[game.level.center];
  const [tLat, tLon] = centerOf(target);
  if (![c.lat, c.lon, tLat, tLon].every(Number.isFinite)) { done && done(); return; }

  const line = L.polyline([[c.lat, c.lon], [c.lat, c.lon]], {
    color: '#FF4200', weight: 3, opacity: .8, dashArray: '6 8', interactive: false,
  }).addTo(layerGroup);
  const dot = L.marker([c.lat, c.lon], {
    icon: L.divIcon({ className: '', html: '<div class="fly-dot"></div>', iconSize: [12, 12], iconAnchor: [6, 6] }),
    interactive: false,
  }).addTo(layerGroup);

  const start = performance.now();
  const dur = 650;
  (function frame(now) {
    if (token !== flyToken || !map) { line.remove(); dot.remove(); return; }
    const t = Math.min(1, (now - start) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    const lat = c.lat + (tLat - c.lat) * ease;
    const lon = c.lon + (tLon - c.lon) * ease;
    dot.setLatLng([lat, lon]);
    line.setLatLngs([[c.lat, c.lon], [lat, lon]]);
    if (t < 1) requestAnimationFrame(frame);
    else setTimeout(() => {
      if (token !== flyToken || !map) { line.remove(); dot.remove(); return; }
      line.remove(); dot.remove();
      done && done();
    }, 250);
  })(start);
}

function centerOf(polygon) {
  if (polygon.path) {
    const lats = polygon.path.map(p => p[0]);
    const lons = polygon.path.map(p => p[1]);
    return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lons) + Math.max(...lons)) / 2];
  }
  return [polygon.lat, polygon.lon];
}

/* ---------- Финиш уровня ---------- */

function finishLevel(completed) {
  stopTimer();
  const g = game;
  const total = g.questions.length;
  const accuracy = g.correct / total;

  let stars = 0;
  if (completed) {
    stars = accuracy >= 1 ? 3 : accuracy >= .7 ? 2 : accuracy >= .5 ? 1 : 0;
  }

  // Сохранение прогресса
  progress.stars[g.level.id] = Math.max(progress.stars[g.level.id] || 0, stars);
  progress.best[g.level.id] = Math.max(progress.best[g.level.id] || 0, g.score);
  progress.total += g.score;
  store.save(progress);

  checkAchievements(g, completed, stars);

  // Экран результата
  $('#result-title').textContent = !completed
    ? 'Жизни закончились'
    : stars === 3 ? 'Блестяще!' : stars === 2 ? 'Отличный результат!' : stars === 1 ? 'Уровень пройден!' : 'Нужна практика';
  $('#result-score').textContent = `${g.score.toLocaleString('ru-RU')} очков · верно ${g.correct} из ${total}`;
  $('#result-text').textContent = !completed
    ? 'Не расстраивайтесь: географию запоминают повторением. Попробуйте ещё раз!'
    : stars === 3 ? 'Идеально — ни одной ошибки. Менеджер может смело ехать к клиенту!'
    : stars === 2 ? 'Очень хорошо! Один шаг до идеала.'
    : stars === 1 ? 'Базу вы знаете, но карту стоит подучить.'
    : 'Ответов маловато — пройдите уровень заново.';

  const starsWrap = $('#result-stars');
  starsWrap.innerHTML = '';
  for (let i = 1; i <= 3; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i <= stars ? ' star--on' : '');
    s.textContent = '★';
    starsWrap.appendChild(s);
    if (i <= stars) {
      setTimeout(() => { s.classList.add('star--show'); beep(700 + i * 120, .12); }, 400 + i * 350);
    } else {
      setTimeout(() => { s.classList.add('star--show'); }, 400 + i * 350);
    }
  }

  const achWrap = $('#result-achievements');
  achWrap.innerHTML = '';
  (finishLevel._newAch || []).forEach(a => {
    const el = document.createElement('div');
    el.className = 'result-ach';
    el.innerHTML = `<span class="result-ach__icon">${ICONS[a.icon]}</span>Достижение: ${a.name}`;
    achWrap.appendChild(el);
  });
  finishLevel._newAch = [];

  showScreen('#screen-result');
  if (completed) { sfx.win(); confetti.burst(stars === 3 ? 160 : 80); }
  else sfx.lose();
}

function checkAchievements(g, completed, stars) {
  const fresh = [];
  const grant = id => {
    if (!progress.ach.includes(id)) {
      progress.ach.push(id);
      fresh.push(ACHIEVEMENTS.find(a => a.id === id));
    }
  };
  if (completed && stars >= 1) grant('first');
  if (completed && g.mistakes === 0) grant('perfect');
  if (g.maxStreak >= 5) grant('combo5');
  if (['msk-near', 'msk-mid', 'msk-far'].every(id => (progress.stars[id] || 0) >= 1)) grant('msk-master');
  if (['spb-near', 'spb-far'].every(id => (progress.stars[id] || 0) >= 1)) grant('spb-master');
  if (LEVELS.every(l => (progress.stars[l.id] || 0) >= 1)) grant('geographer');
  if (progress.total >= 10000) grant('rich');
  finishLevel._newAch = fresh;
  store.save(progress);
}

/* ---------- Привязка событий ---------- */

$('#btn-exit').addEventListener('click', () => { stopTimer(); renderHome(); showScreen('#screen-home'); });
$('#btn-to-menu').addEventListener('click', () => { renderHome(); showScreen('#screen-home'); });
$('#btn-retry').addEventListener('click', () => startLevel(game.level));

/* ---------- Старт ---------- */

renderHome();
showScreen('#screen-home');
setTimeout(() => $('#splash').remove(), 3000);

