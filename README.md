# Carb Cycle PWA

A progressive web app for carb cycling diet management. Track daily carb intake across three tiers (refeed / regular / low-carb) based on your training schedule.

**Live**: [carb-cycle-pwa.vercel.app](https://carb-cycle-pwa.vercel.app)

## Features

- **Three-tier carb cycling** — automatically assigns refeed, regular, or low-carb days based on your weekly training schedule
- **Food logging** — 21 built-in foods across 4 categories (staples, meat & eggs, vegetables, drinks) with per-100g macro data
- **Smart units** — select by bowls, pieces, cups, or cans instead of weighing everything; manual gram input also available
- **Macro tracking** — real-time carb, protein, fat, and calorie totals with visual progress ring
- **Calendar overview** — color-coded month view showing day types and logged days at a glance
- **Science-based defaults** — carb targets calculated from body weight (3.5 / 3.0 / 1.8 g/kg), deficit guidance included
- **5-step onboarding** — calculates BMR, TDEE, and macro targets from your body data
- **Offline-first PWA** — all data stored locally in IndexedDB, works without internet, installable on home screen
- **Daily weigh-in** — track body weight trends alongside nutrition

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 8** + **vite-plugin-pwa**
- **Tailwind CSS v4**
- **Dexie.js** (IndexedDB wrapper)
- **Vue Router 4**

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/`. Deploy to any static host (Vercel, Netlify, GitHub Pages).

## Project Structure

```
src/
  views/           # Page components (Home, DayDetail, Settings, Onboarding)
  components/      # Reusable components (FoodIcon)
  composables/     # Vue composables (useProfile, useDailyLog)
  services/        # Pure functions (calculator)
  db/              # Dexie schema + seed data
  router/          # Vue Router config
```

## License

MIT
