# قارئ القرآن السريع — Quran Speed Reader PWA

A Progressive Web App for speed-reading the Quran word by word.

## File Structure

```
quran-pwa/
├── index.html          ← Main app (single page)
├── manifest.json       ← PWA manifest (install to home screen)
├── sw.js               ← Service Worker (offline app shell)
├── css/
│   └── style.css
├── js/
│   ├── db.js           ← IndexedDB layer (Quran + settings + bookmarks)
│   ├── eye.js          ← Eye/face tracking module
│   └── app.js          ← Main app logic
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Deployment (Cloudflare Pages — Free)

1. Create account at https://pages.cloudflare.com
2. New project → connect GitHub repo OR upload folder directly
3. Upload the entire `quran-pwa/` folder
4. Deploy — your app is live at `https://yourname.pages.dev`
5. Share the URL — users open it in any mobile browser and tap "Add to Home Screen"

## How Offline Works

- **App shell** (HTML/CSS/JS): cached by Service Worker on first visit
- **Quran text**: stored in IndexedDB on user's device when they press "Download All 114 Surahs"
- **Settings & bookmarks**: stored in IndexedDB
- **Why IndexedDB?** Unlike Service Worker cache or browser HTTP cache, IndexedDB data is NOT cleared when the user clears browser cache. It only gets deleted if the user explicitly clears "Site Data" or uninstalls the browser. This makes the offline Quran data persistent.

## Data Source

Quran text: [alquran.cloud API](https://api.alquran.cloud) — `quran-uthmani` edition
- Full Uthmani script with complete tashkeel (diacritics)
- Free, no API key required
- ~2.5MB total for all 114 surahs stored in IndexedDB

## Features

- ✅ Word-by-word reading with 4 context words on each side
- ✅ Color-coded tajweed rules on the center word
- ✅ Adjustable speed (50–800 wpm) with khatmah time estimate
- ✅ Eye tracking — pauses when you look away
- ✅ Hold-to-freeze — press and hold stage to read context at your pace
- ✅ Bookmarks (up to 30, stored in IndexedDB)
- ✅ Start from any surah + ayah
- ✅ Works offline after downloading (IndexedDB)
- ✅ Installable as PWA (Add to Home Screen)
- ✅ Focus guide lines above/below to anchor eyes to center

## Tajweed Colors

| Color | Rule |
|-------|------|
| 🔵 Blue | Madd (elongation) |
| 🟠 Orange | Ghunnah (nasalization) |
| 🟣 Purple | Ikhfa (concealment) |
| 🟤 Dark orange | Qalqalah (echo) |
| 🩷 Pink | Iqlab |
| ⚫ Grey | Hamzat ul Wasl, Lam Shamsiyah |
| 🟢 Green | Idghaam |

## Permissions

- **Camera** (optional): only requested if Eye Tracking is enabled in settings

## Hosting Cost

Cloudflare Pages free tier:
- 500 deployments/month
- Unlimited bandwidth
- Global CDN

At 10,000 users downloading all 114 surahs (~2.5MB each) = ~25GB bandwidth total = **free**.
