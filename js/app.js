// ═══════════════════════════════════════════════════
//  app.js — Quran Speed Reader PWA
// ═══════════════════════════════════════════════════

// ── Constants ─────────────────────────────────────
const TOTAL_WORDS = 77430;
const AR = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
const EN = ["Al-Fatihah","Al-Baqarah","Aal-Imran","An-Nisa","Al-Maidah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus","Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha","Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir","Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf","Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah","As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad","Ash-Shams","Al-Layl","Ad-Duhaa","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat","Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr","Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas"];
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,45,58,22,24,13,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

// Tajweed color map — standard colors used in printed masaahif
const TAJWEED_COLORS = {
  ham_wasl:       '#9c9c9c',  // Hamzat ul Wasl — grey
  laam_shamsiyah: '#9c9c9c',  // Lam Shamsiyah — grey
  madda_normal:   '#537FFF',  // Madd Asli — blue
  madda_permissible:'#4050FF',
  madda_necessary:'#0000FF',  // Madd Lazim — dark blue
  madda_obligatory:'#2244CC',
  ghunnah:        '#FF7E1E',  // Ghunnah — orange
  idghaam_ghunnah:'#FF7E1E',
  idghaam_wo_ghunnah:'#008000',
  ikhfa:          '#9400D3',  // Ikhfa — purple
  ikhfa_shafawi:  '#9400D3',
  iqlab:          '#FF0080',  // Iqlab — pink
  idghaam_shafawi:'#008000',
  qalqalah:       '#DD6600',  // Qalqalah — dark orange
};

// ── App State ─────────────────────────────────────
let CFG = {};
let bookmarks = [];
let downloadedSurahs = new Set();

// Reader state
let words = [], idx = 0;
let playing = false, paused = false, pauseBy = null;
let ticker = null;
let frozen = false, wasPlayingBeforeFreeze = false;
let currentSurah = 1;

// ── DOM refs ──────────────────────────────────────
const $ = id => document.getElementById(id);

// ═══════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════
async function boot() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Load persisted data
  [CFG, bookmarks] = await Promise.all([DB.loadSettings(), DB.loadBookmarks()]);
  downloadedSurahs = new Set(await DB.getDownloaded());

  applyDisplaySettings();
  buildSurahGrid();
  buildBookmarkList();
  updateKhatmah();
  updateAyahMax();
  syncSettingsUI();
  initRailListeners();

  showScreen('setupScreen');
}

// ═══════════════════════════════════════════════════
//  FETCH & PARSE QURAN
// ═══════════════════════════════════════════════════

// Parse alquran.cloud quran-uthmani response into word array
// The uthmani text already contains full tashkeel (diacritics/harakat)
// We also split on word boundaries preserving every Unicode mark
function parseAyahsToWords(ayahs) {
  const words = [];
  for (const ay of ayahs) {
    // Split on whitespace — each "word" in Arabic includes its diacritics as combining chars
    const raw = ay.text.split(/\s+/).filter(w => w.length > 0);
    raw.forEach((w, wi) => {
      words.push({
        a: w,          // Arabic text with full tashkeel
        v: ay.numberInSurah,
        wi: wi + 1,    // word index within ayah
      });
    });
  }
  return words;
}

async function fetchSurahFromNetwork(n) {
  const url = `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  if (json.code !== 200 || !json.data) throw new Error('Bad API response');
  return parseAyahsToWords(json.data.ayahs);
}

// Get surah: IDB first, then network, then save to IDB
async function getSurah(n) {
  const cached = await DB.getSurah(n);
  if (cached) return cached.words;
  // Need network
  const words = await fetchSurahFromNetwork(n);
  await DB.saveSurah(n, words);
  downloadedSurahs.add(n);
  updateSurahGridItem(n);
  return words;
}

// ═══════════════════════════════════════════════════
//  DOWNLOAD MANAGER
// ═══════════════════════════════════════════════════
let downloadActive = false;

async function downloadAll() {
  if (downloadActive) return;
  downloadActive = true;
  const btn = $('downloadAllBtn');
  btn.disabled = true;

  const total = 114;
  for (let n = 1; n <= total; n++) {
    if (downloadedSurahs.has(n)) {
      updateDownloadProgress(n, total);
      continue;
    }
    btn.textContent = `Downloading ${n}/114 — ${AR[n-1]}…`;
    try {
      await fetchSurahFromNetwork(n).then(ws => DB.saveSurah(n, ws));
      downloadedSurahs.add(n);
      updateSurahGridItem(n);
    } catch (e) {
      // retry once
      try {
        await new Promise(r => setTimeout(r, 1500));
        await fetchSurahFromNetwork(n).then(ws => DB.saveSurah(n, ws));
        downloadedSurahs.add(n);
        updateSurahGridItem(n);
      } catch {
        toast(`Failed surah ${n} — will retry next time`);
      }
    }
    updateDownloadProgress(n, total);
    // Small throttle to not hammer the API
    await new Promise(r => setTimeout(r, 120));
  }

  downloadActive = false;
  btn.disabled = false;
  btn.textContent = '✓ Download Complete';
  toast('✓ Quran downloaded — works offline now!', 4000);
}

function updateDownloadProgress(n, total) {
  const pct = Math.round((n / total) * 100);
  $('downloadProgressBar').style.width = pct + '%';
  $('downloadProgressText').textContent = `${n}/${total} surahs`;
}

function updateSurahGridItem(n) {
  const el = document.querySelector(`.sgbtn[data-surah="${n}"]`);
  if (el) el.classList.toggle('downloaded', downloadedSurahs.has(n));
}

// ═══════════════════════════════════════════════════
//  SURAH GRID
// ═══════════════════════════════════════════════════
function buildSurahGrid() {
  const g = $('surahGrid');
  g.innerHTML = '';
  for (let i = 1; i <= 114; i++) {
    const b = document.createElement('button');
    b.className = 'sgbtn' + (i === (CFG.lastSurah || 1) ? ' sel' : '') + (downloadedSurahs.has(i) ? ' downloaded' : '');
    b.dataset.surah = i;
    b.innerHTML = `<span class="n">${i}</span>${AR[i-1]}`;
    b.onclick = () => selectSurah(i);
    g.appendChild(b);
  }
  updateAyahMax();
}

function selectSurah(n) {
  currentSurah = n;
  CFG.lastSurah = n;
  document.querySelectorAll('.sgbtn').forEach((x, j) => x.classList.toggle('sel', j + 1 === n));
  CFG.lastAyah = 1;
  $('ayahInput').value = 1;
  updateAyahMax();
  saveSettings();
}

function updateAyahMax() {
  const max = AYAH_COUNTS[(CFG.lastSurah || 1) - 1];
  $('ayahMax').textContent = '/ ' + max;
  $('ayahInput').max = max;
}

// ═══════════════════════════════════════════════════
//  BOOKMARKS
// ═══════════════════════════════════════════════════
function buildBookmarkList() {
  const c = $('bmList');
  c.innerHTML = '';
  if (!bookmarks.length) {
    c.innerHTML = '<div class="bm-empty">No bookmarks yet · لا علامات بعد</div>';
    return;
  }
  bookmarks.forEach((bm, i) => {
    const d = document.createElement('div');
    d.className = 'bm-item';
    d.innerHTML = `
      <div class="bm-go">
        <div class="bm-name">سورة ${AR[bm.surah - 1]}</div>
        <div class="bm-pos">Ayah ${bm.ayah} · Word ${bm.wordIdx + 1}</div>
      </div>
      <button class="bm-del" onclick="deleteBm(event,${i})">✕</button>`;
    d.addEventListener('click', e => { if (!e.target.closest('.bm-del')) loadBookmark(i); });
    c.appendChild(d);
  });
}

function loadBookmark(i) {
  const bm = bookmarks[i];
  selectSurah(bm.surah);
  $('ayahInput').value = bm.ayah;
  CFG.lastAyah = bm.ayah;
  saveSettings();
  toast(`📖 ${EN[bm.surah - 1]} · Ayah ${bm.ayah}`);
  const sel = document.querySelector('.sgbtn.sel');
  if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function deleteBm(e, i) {
  e.stopPropagation();
  bookmarks.splice(i, 1);
  DB.saveBookmarks(bookmarks);
  buildBookmarkList();
}

async function addBookmark() {
  if (!words.length) return;
  const w = words[idx];
  const exists = bookmarks.some(b => b.surah === currentSurah && b.ayah === w.v && Math.abs(b.wordIdx - idx) < 3);
  if (exists) { toast('Already bookmarked · موجود مسبقاً'); return; }
  bookmarks.unshift({ surah: currentSurah, ayah: w.v, wordIdx: idx });
  if (bookmarks.length > 30) bookmarks.pop();
  await DB.saveBookmarks(bookmarks);
  const btn = $('bmBtn');
  btn.textContent = '⭐';
  setTimeout(() => btn.textContent = '🔖', 900);
  toast(`🔖 ${EN[currentSurah - 1]} ${currentSurah}:${w.v}`);
}

// ═══════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════
function syncSettingsUI() {
  $('spdSlider').value = CFG.wpm;
  $('spdNum').textContent = CFG.wpm;
  $('miniSlider').value = CFG.wpm;
  $('miniVal').textContent = CFG.wpm;
  $('centerSizeSlider').value = CFG.centerSize;
  $('centerSizeVal').textContent = CFG.centerSize;
  $('sideOpacitySlider').value = CFG.sideOpacity;
  $('sideOpacityVal').textContent = CFG.sideOpacity + '%';
  $('sideSizeDiffSlider').value = CFG.sideSizeDiff;
  $('sideSizeDiffVal').textContent = CFG.sideSizeDiff + 'px';
  $('tajweedSlider').value = CFG.tajweedDelay;
  $('tajweedVal').textContent = CFG.tajweedDelay + 'ms';
  $('eyeToggle').checked = CFG.useEye;
  currentSurah = CFG.lastSurah || 1;
  $('ayahInput').value = CFG.lastAyah || 1;
  document.querySelectorAll('.sgbtn').forEach((x, j) => x.classList.toggle('sel', j + 1 === currentSurah));
}

function applyDisplaySettings() {
  const r = document.documentElement;
  r.style.setProperty('--center-size', (CFG.centerSize || 58) + 'px');
  r.style.setProperty('--side-opacity', (CFG.sideOpacity || 38) / 100);
  r.style.setProperty('--side-size-diff', (CFG.sideSizeDiff || 4) + 'px');
}

function saveSettings() {
  DB.saveSettings(CFG);
}

function setSpd(v) {
  CFG.wpm = v;
  $('spdSlider').value = v;
  $('spdNum').textContent = v;
  $('miniSlider').value = v;
  $('miniVal').textContent = v;
  updateKhatmah();
  saveSettings();
}

function updateKhatmah() {
  const m = TOTAL_WORDS / (CFG.wpm || 200);
  const h = Math.floor(m / 60), mm = Math.round(m % 60);
  $('kTime').textContent = h > 0 ? `~${h} hrs ${mm} min` : `~${mm} min`;
  $('kSub').textContent = `at ${CFG.wpm} wpm · القرآن ≈ 77,430 كلمة`;
}

// Settings event listeners — wired from HTML via oninput
function onSpdSlider(v) { setSpd(+v); }
function onMiniSpd(v) { CFG.wpm = +v; $('miniVal').textContent = v; saveSettings(); }
function onCenterSize(v) {
  CFG.centerSize = +v; $('centerSizeVal').textContent = v;
  applyDisplaySettings();
  if (words.length) { calcSlots(); buildRailDOM(); renderRail(); }
  saveSettings();
}
function onSideOpacity(v) { CFG.sideOpacity = +v; $('sideOpacityVal').textContent = v + '%'; applyDisplaySettings(); saveSettings(); }
function onSideSizeDiff(v) {
  CFG.sideSizeDiff = +v; $('sideSizeDiffVal').textContent = v + 'px';
  applyDisplaySettings();
  if (words.length) { calcSlots(); buildRailDOM(); renderRail(); }
  saveSettings();
}
function onTajweedDelay(v) { CFG.tajweedDelay = +v; $('tajweedVal').textContent = v + 'ms'; saveSettings(); }
function onEyeToggle(checked) { CFG.useEye = checked; saveSettings(); }
function onAyahInput(v) {
  CFG.lastAyah = Math.max(1, Math.min(+v || 1, AYAH_COUNTS[currentSurah - 1]));
  saveSettings();
}

// ═══════════════════════════════════════════════════
//  START READING
// ═══════════════════════════════════════════════════
async function startReading() {
  const btn = $('startBtn');
  btn.disabled = true;
  btn.textContent = '⏳ جاري التحميل...';

  try {
    words = await getSurah(currentSurah);
    if (!words.length) throw new Error('No words loaded');

    // Find start word by ayah
    const startAyah = parseInt($('ayahInput').value) || 1;
    idx = 0;
    for (let i = 0; i < words.length; i++) {
      if (words[i].v >= startAyah) { idx = i; break; }
    }

    playing = false; paused = false; pauseBy = null; frozen = false;
    $('rSurahName').textContent = `سورة ${AR[currentSurah - 1]}`;
    $('pbar').style.width = '0%';
    $('miniSlider').value = CFG.wpm;
    $('miniVal').textContent = CFG.wpm;
    applyDisplaySettings();

    showScreen('readerScreen');
    // Calculate responsive slots now that reader is visible and has real dimensions
    requestAnimationFrame(() => {
      calcSlots();
      buildRailDOM();
      renderRail();
    });

    if (CFG.useEye) {
      const ok = await EyeTracker.start(
        () => { // look away
          if (playing && !paused) {
            doPause('eye', '👁', 'نظرت بعيداً', 'عد للشاشة للمتابعة تلقائياً');
            $('eyeIco').className = 'iconbtn away';
            $('eyeIco').textContent = '😶';
          }
        },
        () => { // look back
          if (paused && pauseBy === 'eye') {
            $('eyeIco').className = 'iconbtn on';
            $('eyeIco').textContent = '👁';
            resume();
          }
        }
      );
      if (ok) {
        $('eyeIco').className = 'iconbtn on';
        $('eyeIco').textContent = '👁';
      }
    }

    resume();
  } catch (e) {
    toast(e.message || 'فشل التحميل — Check internet connection', 4000);
  } finally {
    btn.disabled = false;
    btn.textContent = 'ابدأ القراءة ▶';
  }
}

function goBack() {
  clearTimeout(ticker); ticker = null;
  EyeTracker.stop();
  $('eyeIco').className = 'iconbtn';
  $('eyeIco').textContent = '👁';
  playing = false; paused = false; frozen = false;
  buildBookmarkList();
  showScreen('setupScreen');
}

// ═══════════════════════════════════════════════════
//  PLAYBACK ENGINE
// ═══════════════════════════════════════════════════
function resume() {
  playing = true; paused = false; pauseBy = null;
  $('playBtn').textContent = '⏸';
  hidePause();
  scheduleTick();
}

function doPause(by, ico, txt, sub) {
  playing = false; paused = true; pauseBy = by;
  clearTimeout(ticker); ticker = null;
  $('playBtn').textContent = '▶';
  showPause(ico, txt, sub);
}

function togglePlay() {
  if (paused) resume();
  else doPause('user', '⏸', 'متوقف مؤقتاً', 'اضغط ▶ للمتابعة');
}

function scheduleTick() {
  clearTimeout(ticker);
  if (!playing || paused || frozen) return;
  const delay = Math.round(60000 / CFG.wpm) + (CFG.tajweedDelay || 0);
  ticker = setTimeout(advance, delay);
}

function advance() {
  if (!playing || paused || frozen) return;
  idx++;
  if (idx >= words.length) { finish(); return; }
  renderRail();
  scheduleTick();
}

// ═══════════════════════════════════════════════════
//  RESPONSIVE WORD RAIL
// ═══════════════════════════════════════════════════
//
//  Layout (Arabic RTL — reads right → left):
//    [past-4] [past-3] [past-2] [past-1] [CENTER] [next-1] [next-2] [next-3] [next-4]
//
//  "past" words are on the RIGHT (already read).
//  "next" words are on the LEFT  (coming up).
//
//  Slot count is calculated dynamically each render based on:
//    - Available stage width
//    - Estimated word widths at their rendered font sizes
//    - Minimum: 1 past + center + 1 next  (always shown)
//    - Maximum: 4 past + center + 4 next
//    - On wider screens, extra slots go to NEXT (upcoming) words first
//
//  Words are NEVER clipped — `overflow:visible` and `flex-shrink:0` on all slots.
//  The rail itself clips nothing; the stage has `overflow:hidden` only to prevent
//  the stage background from growing, not to cut words.

let railSlots = { past: 1, next: 1 }; // current slot counts, updated by calcSlots()

// Approximate character width ratio for Arabic at given font size (em-based estimate)
// Arabic characters with diacritics are roughly 0.65× the font size wide on average
const CHAR_WIDTH_RATIO = 0.62;
const AVG_WORD_CHARS = 4.5; // average Arabic word length in chars including diacritics

function estimateWordWidth(fontSize) {
  return AVG_WORD_CHARS * CHAR_WIDTH_RATIO * fontSize;
}

function calcSlots() {
  const rail = $('wordRail');
  const stageW = rail.parentElement.offsetWidth - 20; // subtract padding
  const cs = CFG.centerSize || 58;
  const diff = CFG.sideSizeDiff || 4;
  const gap = Math.min(22, Math.max(8, stageW * 0.02));

  // Widths at each distance from center
  const sideFontSizes = [
    cs - diff,          // distance 1
    cs - diff - 3,      // distance 2
    cs - diff - 6,      // distance 3
    cs - diff - 9,      // distance 4
  ];

  const centerW = estimateWordWidth(cs);
  let usedWidth = centerW;
  let pastSlots = 0, nextSlots = 0;

  // Greedily add slots — bias toward NEXT (upcoming) words first
  // since those are more useful for reading ahead.
  // We alternate next/past with 2:1 ratio favoring next.
  const MAX_SIDE = 4;
  let turn = 0; // 0=next, 1=next, 2=past (2:1 ratio)

  for (let i = 0; i < MAX_SIDE * 2; i++) {
    const addNext = (turn % 3 !== 2) && nextSlots < MAX_SIDE;
    const addPast = (turn % 3 === 2) && pastSlots < MAX_SIDE;
    turn++;

    if (addNext) {
      const fw = estimateWordWidth(sideFontSizes[nextSlots] || sideFontSizes[MAX_SIDE-1]);
      if (usedWidth + fw + gap > stageW) break;
      usedWidth += fw + gap;
      nextSlots++;
    } else if (addPast) {
      const fw = estimateWordWidth(sideFontSizes[pastSlots] || sideFontSizes[MAX_SIDE-1]);
      if (usedWidth + fw + gap > stageW) break;
      usedWidth += fw + gap;
      pastSlots++;
    }
  }

  // Enforce minimums: always show at least 1 on each side
  railSlots = {
    past: Math.max(1, Math.min(pastSlots, MAX_SIDE)),
    next: Math.max(1, Math.min(nextSlots, MAX_SIDE)),
  };
}

function buildRailDOM() {
  const past = $('railPast');
  const next = $('railNext');
  past.innerHTML = '';
  next.innerHTML = '';

  // Past slots: past-1 is closest to center, past-N is furthest right
  // We render them in order past-1 → past-N so the flex row
  // (justify-content: flex-end, direction: ltr) places past-1 nearest center
  for (let p = 1; p <= railSlots.past; p++) {
    const el = document.createElement('span');
    el.className = 'ws';
    el.id = 'ws-past-' + p;
    past.appendChild(el);
  }

  // Next slots: next-1 is closest to center, next-N is furthest left
  // direction:rtl + justify-content:flex-start places next-1 nearest center
  for (let n = 1; n <= railSlots.next; n++) {
    const el = document.createElement('span');
    el.className = 'ws';
    el.id = 'ws-next-' + n;
    next.appendChild(el);
  }
}

function renderRail() {
  const center = $('railCenter');

  // ── Center word ──
  if (words[idx]) {
    // Plain text only — tajweed colors removed per user request
    center.textContent = words[idx].a;
    const ws = center.querySelector('.ws-c') || (() => {
      center.innerHTML = '';
      const s = document.createElement('span');
      s.className = 'ws center';
      s.id = 'ws-center';
      center.appendChild(s);
      return s;
    })();
    // Simpler: just set directly on center div which already has .ws.center styles via JS
    center.innerHTML = '';
    const cspan = document.createElement('span');
    cspan.className = 'ws center';
    cspan.textContent = words[idx].a;
    cspan.classList.remove('pop');
    center.appendChild(cspan);
    // Trigger pop animation
    requestAnimationFrame(() => cspan.classList.add('pop'));
  }

  // ── Past words (right side) ──
  for (let p = 1; p <= railSlots.past; p++) {
    const el = $('ws-past-' + p);
    if (!el) continue;
    const wi = idx - p;
    if (wi < 0) {
      el.textContent = '';
      el.className = 'ws hidden-slot';
    } else {
      el.textContent = words[wi].a;
      el.className = 'ws past-' + Math.min(p, 4);
    }
  }

  // ── Next words (left side) ──
  for (let n = 1; n <= railSlots.next; n++) {
    const el = $('ws-next-' + n);
    if (!el) continue;
    const wi = idx + n;
    if (wi >= words.length) {
      el.textContent = '';
      el.className = 'ws hidden-slot';
    } else {
      el.textContent = words[wi].a;
      el.className = 'ws next-' + Math.min(n, 4);
    }
  }

  const w = words[idx];
  $('rInfo').textContent = `${EN[currentSurah-1]} ${currentSurah}:${w.v} · ${idx+1}/${words.length}`;
  $('pbar').style.width = ((idx + 1) / words.length * 100).toFixed(1) + '%';
}

// Recalculate slots + rebuild DOM on resize or orientation change
function onResize() {
  calcSlots();
  buildRailDOM();
  if (words.length) renderRail();
}

// Wire up resize/orientation listeners once DOM is ready
function initRailListeners() {
  window.addEventListener('resize', debounce(onResize, 120));
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Tajweed HTML builder ──────────────────────────
// alquran.cloud quran-uthmani returns plain text with full harakat (tashkeel).
// The text itself already contains: fatha, kasra, damma, sukun, shadda,
// tanwin, hamza forms, madda (~), special alif forms etc as Unicode combining chars.
// They are PART of the word string — no separate processing needed to SHOW them.
//
// For color-coded tajweed rules, we apply heuristic detection on the word text
// since we don't have the full tajweed annotation JSON.
// This covers the most visually important rules:
function buildTajweedHTML(text) {
  // Remove ayah number markers if present (e.g. ١٢٣)
  const clean = text.replace(/[\u06DD\u0660-\u0669\u06F0-\u06F9]/g, '');
  if (!clean) return '<span>' + text + '</span>';

  // Apply character-level tajweed spans
  let html = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const code = ch.codePointAt(0);
    let color = null;

    // Madd alif/waw/ya with madda sign (ـٰ, ا with fatha before, و/ي after)
    if (ch === '\u0670') color = TAJWEED_COLORS.madda_normal; // dagger alif
    else if (ch === '\u0653') color = TAJWEED_COLORS.madda_normal; // hamza above
    else if (ch === '\u0640') { // tatweel — often part of madd
      html += `<span style="color:${TAJWEED_COLORS.madda_normal}">${ch}</span>`;
      continue;
    }
    // Shadda + noon/meem = potential ghunnah
    else if (ch === '\u0651') { // shadda
      const base = i > 0 ? clean[i-1] : '';
      if (base === '\u0646' || base === '\u0645') color = TAJWEED_COLORS.ghunnah;
    }
    // Qalqalah letters: ق ط ب ج د
    else if ('\u0642\u0637\u0628\u062C\u062F'.includes(ch)) {
      // Check if followed by sukun
      const next = clean[i+1];
      if (next === '\u0652') color = TAJWEED_COLORS.qalqalah;
    }
    // Hamzat ul wasl — alif with wasla (ٱ)
    else if (code === 0x0671) color = TAJWEED_COLORS.ham_wasl;
    // Lam shamsiyah — lam followed by sun letters
    else if (ch === '\u0644') {
      const sun = 'تثدذرزسشصضطظلن';
      if (i + 1 < clean.length && sun.includes(clean[i+1])) color = TAJWEED_COLORS.laam_shamsiyah;
    }

    if (color) {
      html += `<span style="color:${color}">${ch}</span>`;
    } else {
      html += ch;
    }
  }
  return html || clean;
}

function finish() {
  playing = false;
  EyeTracker.stop();
  $('doneMsg').textContent = `Completed Surah ${EN[currentSurah-1]} · ${words.length} words`;
  showScreen('doneScreen');
}

function showPause(ico, txt, sub) {
  $('pIco').textContent = ico;
  $('pTxt').textContent = txt;
  $('pSub').textContent = sub;
  $('poverlay').classList.add('show');
}
function hidePause() { $('poverlay').classList.remove('show'); }

// ═══════════════════════════════════════════════════
//  HOLD TO FREEZE
// ═══════════════════════════════════════════════════
let holdTimer = null;

function onHoldStart(e) {
  if (e.target.closest('button') || e.target.closest('.poverlay')) return;
  holdTimer = setTimeout(() => {
    frozen = true;
    wasPlayingBeforeFreeze = playing && !paused;
    document.getElementById('stage').classList.add('frozen');
    clearTimeout(ticker);
  }, 130);
}

function onHoldEnd(e) {
  clearTimeout(holdTimer);
  if (frozen) {
    frozen = false;
    document.getElementById('stage').classList.remove('frozen');
    if (wasPlayingBeforeFreeze && !paused) scheduleTick();
  }
}

// ═══════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== id));
}

let toastTimer;
function toast(msg, dur = 2600) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), dur);
}
