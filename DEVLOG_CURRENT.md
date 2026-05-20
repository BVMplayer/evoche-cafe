# DEVLOG — CURRENT

## 2026-05-20 — Extraction from buddy-system

### What happened
Évoche Café had grown large enough inside buddy-system's showcase tab that continuing to dev it there was too costly (context, interaction risk with the main app). Extracted into its own project.

### What exists at extraction (v1.0)
**Stations (7):** Espresso Machine → Bread Oven → Pastry Case → Prep Kitchen → Bar Cart → Wine Cellar → The Back Room  
**Upgrades (12):** Chained to station ownership counts, multiply base rates  
**Regulars (6):** Mireille, Théo, Colette, Pascal, Léna, Anatole — each with story + passive bonus  
**Prestige system:** Reset at threshold, unlock new Era (3 eras: Évoche Café → Le Jazz Hot → All Night Long)  
**Shifts:** Morning Rush / Afternoon Lull / Evening Service / Late Night — real-time clock, boost one station  
**Save/load:** localStorage key `evoche_v1`  
**Visuals:** Full pixel-art canvas renderer, custom 5×7 bitmap font, procedural station sprites, steam particles, toasts, notifications, regular popup  

### What's NOT built yet
- PWA manifest + service worker (installable on phone)
- Sound (SFX + ambient)
- Offline earnings (calculate covers earned while away)
- More eras / regulars / stations
- Settings / debug panel
- Any backend (not planned yet — localStorage only)

### Files
- `prototype.html` — standalone single-file game, open in Safari
- `docs/Versions/EvocheCafe_v1.0_extracted.tsx` — original React source from buddy-system
- `docs/CONCEPT_NOTES.md` — design doc

### Next priorities (rough order)
1. Add PWA manifest + service worker to prototype.html so it installs cleanly
2. Offline earnings calculation on load
3. Sound layer (ambient café hum + click SFX)
4. More content (stations, regulars, eras)
