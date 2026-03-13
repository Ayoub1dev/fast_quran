// ═══════════════════════════════════════════════════
//  db.js — IndexedDB layer
//  Stores: quran data per surah, settings, bookmarks
//  Survives browser cache clears and SW updates
// ═══════════════════════════════════════════════════

const DB_NAME = 'QuranReaderDB';
const DB_VERSION = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      // Store full surah data keyed by surah number (1-114)
      if (!db.objectStoreNames.contains('quran')) {
        db.createObjectStore('quran', { keyPath: 'surah' });
      }
      // Key-value store for settings, bookmarks, meta
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv');
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

// ── Generic KV ───────────────────────────────────
async function kvGet(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readonly');
    const req = tx.objectStore('kv').get(key);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror = () => rej(req.error);
  });
}

async function kvSet(key, value) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('kv', 'readwrite');
    const req = tx.objectStore('kv').put(value, key);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

// ── Quran data ────────────────────────────────────
async function getSurahFromDB(surahNum) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('quran', 'readonly');
    const req = tx.objectStore('quran').get(surahNum);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror = () => rej(req.error);
  });
}

async function saveSurahToDB(surahNum, words) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('quran', 'readwrite');
    const req = tx.objectStore('quran').put({ surah: surahNum, words, savedAt: Date.now() });
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

async function getDownloadedSurahs() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('quran', 'readonly');
    const req = tx.objectStore('quran').getAllKeys();
    req.onsuccess = () => res(req.result ?? []);
    req.onerror = () => rej(req.error);
  });
}

async function deleteSurahFromDB(surahNum) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('quran', 'readwrite');
    const req = tx.objectStore('quran').delete(surahNum);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

// ── Settings ──────────────────────────────────────
const DEFAULT_CFG = {
  wpm: 200, centerSize: 58, sideOpacity: 38,
  sideSizeDiff: 4, tajweedDelay: 120, useEye: true
};

async function loadSettings() {
  const saved = await kvGet('settings');
  return Object.assign({}, DEFAULT_CFG, saved || {});
}

async function saveSettings(cfg) {
  await kvSet('settings', cfg);
}

// ── Bookmarks ─────────────────────────────────────
async function loadBookmarks() {
  return (await kvGet('bookmarks')) || [];
}

async function saveBookmarks(bms) {
  await kvSet('bookmarks', bms);
}

// Expose
window.DB = {
  getSurah: getSurahFromDB,
  saveSurah: saveSurahToDB,
  getDownloaded: getDownloadedSurahs,
  deleteSurah: deleteSurahFromDB,
  loadSettings, saveSettings,
  loadBookmarks, saveBookmarks,
};
