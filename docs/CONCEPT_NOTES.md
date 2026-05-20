# CONCEPT NOTES — Évoche Café

## Core Concept
Idle/clicker game set in the user's café workplace.  
Cookie Clicker structure — tap to earn, buy buildings, buy upgrades, prestige.  
Tone: warm, atmospheric, slightly mysterious. Not cute — cinematic.

## Currency
**Covers** — restaurant industry term for customers served.

## Aesthetic
- Pixel art canvas renderer (no DOM UI)
- Custom 5×7 bitmap font
- Palette: espresso brown, cream, gold, amber. Dark backgrounds.
- Eras shift the palette (jazz-bar red, deep blue night)

## Stations (buildings)
| Station | Flavor |
|---|---|
| Espresso Machine | The heartbeat of the café |
| Bread Oven | Warm loaves before dawn |
| Pastry Case | Croissants that flake like secrets |
| Prep Kitchen | A chorus of knives in the back |
| Bar Cart | One more, they always say |
| Wine Cellar | Vintages older than the building |
| The Back Room | Nobody asks what's back there |

## Regulars (passive bonuses with lore)
Unlock by total covers earned. Each has a name, title, one-line story, and a bonus.

| Name | Title | Bonus |
|---|---|---|
| Mireille | The Insomniac | +1 cover per tap |
| Colette | The Baker's Ghost | Bread Oven ×2 |
| Théo | The Wine Writer | Bar Cart ×1.5 |
| Pascal | The Regular Regular | All ×1.1 per prestige |
| Léna | The Night Shift | After midnight: ×2 |
| Anatole | The Cartographer | Back Room ×3 |

## Prestige (Eras)
Close the café for the season. Reset covers + stations. Regulars remember you.  
Each prestige unlocks a new visual era:
- Era 0: Évoche Café (est. whenever)
- Era 1: Le Jazz Hot (the early years)
- Era 2: All Night Long (we never close)

## Shifts
Real-time clock determines active shift. Each boosts one station.
- Morning Rush (6–11): Espresso ×3
- Afternoon Lull (11–17): Pastry ×2
- Evening Service (17–22): Bar ×2
- Late Night (22–6): Back Room ×4

## Design Pillars
1. **Atmosphere over mechanics** — every piece of text should feel like it belongs in the café
2. **No anxiety** — idle game, not stressful. You can close it and come back.
3. **Mystery earns its place** — The Back Room, Anatole's maps, Léna's job — don't explain everything
4. **Pixel art, not cutesy** — warm and adult, not bubbly

## Future Ideas
- Sound: ambient café hum, espresso click SFX, soft jazz at night
- Offline earnings: calculate covers while away
- More stations: rooftop terrace, private dining room
- More regulars: the chef who never speaks, the critic who only orders water
- Events: special nights (trivia night, private event) that temporarily boost everything
- Achievements panel
