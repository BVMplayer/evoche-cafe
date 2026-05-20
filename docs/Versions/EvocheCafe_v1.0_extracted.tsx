'use client'

import { useEffect, useRef, useCallback } from 'react'

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 390
const H = 700

// ─── Palette ──────────────────────────────────────────────────────────────────
type Palette = Record<string, string>
const P: Palette = {
  bg:        '#1a0f08',
  bgLight:   '#231510',
  panel:     '#2a1a0e',
  panelBright:'#3a2510',
  border:    '#5c3a1e',
  borderGlow:'#8b5e2f',
  espresso:  '#3d1f0a',
  cream:     '#f5e6c8',
  creamDim:  '#c4a87a',
  creamGhost:'#7a6040',
  gold:      '#d4a843',
  goldGlow:  'rgba(212,168,67,0.25)',
  amber:     '#e8821a',
  amberGlow: 'rgba(232,130,26,0.18)',
  warmRed:   '#c0392b',
  steam:     'rgba(245,230,200,0.15)',
  night:     '#0d0a1a',
  nightAccent:'#2a1f4a',
} as const

// ─── Pixel font bitmaps (5×7) ─────────────────────────────────────────────────
// Each char is 5 columns of 7-bit numbers (top=MSB)
const FONT: Record<string, number[]> = {
  // 5 cols, each col is 7 bits, bit0=top row
  '0':[0x3e,0x51,0x49,0x45,0x3e],'1':[0x00,0x42,0x7f,0x40,0x00],
  '2':[0x62,0x51,0x49,0x49,0x46],'3':[0x22,0x41,0x49,0x49,0x36],
  '4':[0x0c,0x0a,0x09,0x7f,0x08],'5':[0x4f,0x49,0x49,0x49,0x31],
  '6':[0x3e,0x49,0x49,0x49,0x32],'7':[0x01,0x01,0x71,0x09,0x07],
  '8':[0x36,0x49,0x49,0x49,0x36],'9':[0x26,0x49,0x49,0x49,0x3e],
  'A':[0x7e,0x09,0x09,0x09,0x7e],'B':[0x7f,0x49,0x49,0x49,0x36],
  'C':[0x3e,0x41,0x41,0x41,0x22],'D':[0x7f,0x41,0x41,0x41,0x3e],
  'E':[0x7f,0x49,0x49,0x49,0x41],'F':[0x7f,0x09,0x09,0x01,0x01],
  'G':[0x3e,0x41,0x49,0x49,0x7a],'H':[0x7f,0x08,0x08,0x08,0x7f],
  'I':[0x41,0x41,0x7f,0x41,0x41],'J':[0x20,0x40,0x41,0x3f,0x01],
  'K':[0x7f,0x08,0x14,0x22,0x41],'L':[0x7f,0x40,0x40,0x40,0x40],
  'M':[0x7f,0x02,0x04,0x02,0x7f],'N':[0x7f,0x03,0x04,0x18,0x7f],
  'O':[0x3e,0x41,0x41,0x41,0x3e],'P':[0x7f,0x09,0x09,0x09,0x06],
  'Q':[0x3e,0x41,0x51,0x21,0x5e],'R':[0x7f,0x09,0x09,0x29,0x46],
  'S':[0x26,0x49,0x49,0x49,0x32],'T':[0x01,0x01,0x7f,0x01,0x01],
  'U':[0x3f,0x40,0x40,0x40,0x3f],'V':[0x1f,0x20,0x40,0x20,0x1f],
  'W':[0x7f,0x20,0x10,0x20,0x7f],'X':[0x41,0x22,0x1c,0x22,0x41],
  'Y':[0x03,0x04,0x78,0x04,0x03],'Z':[0x61,0x51,0x49,0x45,0x43],
  'a':[0x20,0x54,0x54,0x54,0x78],'b':[0x7f,0x44,0x44,0x44,0x38],
  'c':[0x38,0x44,0x44,0x44,0x28],'d':[0x38,0x44,0x44,0x44,0x7f],
  'e':[0x38,0x54,0x54,0x54,0x18],'f':[0x04,0x04,0x7e,0x05,0x05],
  'g':[0x98,0xa4,0xa4,0xa4,0x7c],'h':[0x7f,0x04,0x04,0x04,0x78],
  'i':[0x00,0x44,0x7d,0x40,0x00],'j':[0x40,0x80,0x44,0x3d,0x00],
  'k':[0x7f,0x10,0x28,0x44,0x00],'l':[0x00,0x41,0x7f,0x40,0x00],
  'm':[0x7c,0x04,0x18,0x04,0x7c],'n':[0x7c,0x04,0x04,0x04,0x78],
  'o':[0x38,0x44,0x44,0x44,0x38],'p':[0xfc,0x14,0x14,0x14,0x08],
  'q':[0x08,0x14,0x14,0x14,0xfc],'r':[0x7c,0x04,0x04,0x04,0x00],
  's':[0x48,0x54,0x54,0x54,0x24],'t':[0x04,0x04,0x3f,0x44,0x44],
  'u':[0x3c,0x40,0x40,0x40,0x7c],'v':[0x1c,0x20,0x40,0x20,0x1c],
  'w':[0x7c,0x40,0x30,0x40,0x7c],'x':[0x44,0x28,0x10,0x28,0x44],
  'y':[0x9c,0xa0,0xa0,0xa0,0x7c],'z':[0x44,0x64,0x54,0x4c,0x44],
  ' ':[0x00,0x00,0x00,0x00,0x00],'.':[0x00,0x00,0x40,0x40,0x00],
  ',':[0x00,0x00,0xc0,0x40,0x00],':':[0x00,0x24,0x24,0x00,0x00],
  '!':[0x00,0x00,0x5f,0x00,0x00],'+':[0x08,0x08,0x3e,0x08,0x08],
  '-':[0x08,0x08,0x08,0x08,0x08],"'":[0x00,0x03,0x03,0x00,0x00],
  '/':[0x40,0x20,0x10,0x08,0x04],'(':[0x00,0x1c,0x22,0x41,0x00],
  ')':[0x00,0x41,0x22,0x1c,0x00],'×':[0x41,0x22,0x1c,0x22,0x41],
  '▲':[0x10,0x08,0x04,0x08,0x10],'►':[0x08,0x08,0x7f,0x08,0x08],
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1,
  align: 'left'|'center'|'right' = 'left'
) {
  const chars = text.split('')
  const charW = (5 + 1) * scale
  const totalW = chars.length * charW - scale
  let sx = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x
  ctx.fillStyle = color
  for (const ch of chars) {
    const bitmap = FONT[ch] ?? FONT[' ']
    for (let col = 0; col < 5; col++) {
      const bits = bitmap[col]
      for (let row = 0; row < 7; row++) {
        if (bits & (1 << row)) {
          ctx.fillRect(
            Math.floor(sx + col * scale),
            Math.floor(y + row * scale),
            scale, scale
          )
        }
      }
    }
    sx += charW
  }
}

function textWidth(text: string, scale = 1) {
  return text.length * (5 + 1) * scale - scale
}

// ─── Game data definitions ────────────────────────────────────────────────────

interface StationDef {
  id: string
  name: string
  emoji: string        // pixel sprite key
  baseCost: number
  baseRate: number     // covers/sec
  costMult: number
  flavor: string
  unlockAt: number     // total covers earned to unlock
}

const STATIONS: StationDef[] = [
  { id:'espresso', name:'Espresso Machine', emoji:'☕', baseCost:15,    baseRate:0.1,  costMult:1.15, flavor:'The heartbeat of the café.',          unlockAt:0 },
  { id:'bread',    name:'Bread Oven',        emoji:'🍞', baseCost:100,   baseRate:0.5,  costMult:1.15, flavor:'Warm loaves before dawn.',            unlockAt:50 },
  { id:'pastry',   name:'Pastry Case',       emoji:'🥐', baseCost:500,   baseRate:2.0,  costMult:1.15, flavor:'Croissants that flake like secrets.',  unlockAt:250 },
  { id:'kitchen',  name:'Prep Kitchen',      emoji:'🍳', baseCost:2000,  baseRate:8.0,  costMult:1.15, flavor:'A chorus of knives in the back.',      unlockAt:1000 },
  { id:'bar',      name:'Bar Cart',           emoji:'🍷', baseCost:8000,  baseRate:25.0, costMult:1.15, flavor:'One more, they always say.',          unlockAt:5000 },
  { id:'cellar',   name:'Wine Cellar',        emoji:'🍾', baseCost:30000, baseRate:80.0, costMult:1.15, flavor:'Vintages older than the building.',   unlockAt:15000 },
  { id:'backroom', name:'The Back Room',      emoji:'🕯️', baseCost:100000,baseRate:250.0,costMult:1.15, flavor:"Nobody asks what's back there.",       unlockAt:50000 },
]

interface UpgradeDef {
  id: string
  name: string
  desc: string
  cost: number
  stationId: string
  multiplier: number
  unlockOwned: number  // must own this many of station
}

const UPGRADES: UpgradeDef[] = [
  { id:'e1', name:'Single Origin',    desc:'Espresso ×2',  cost:100,    stationId:'espresso', multiplier:2, unlockOwned:1 },
  { id:'e2', name:'Triple Shot',      desc:'Espresso ×3',  cost:500,    stationId:'espresso', multiplier:3, unlockOwned:5 },
  { id:'e3', name:'Ceremonial Blend', desc:'Espresso ×5',  cost:3000,   stationId:'espresso', multiplier:5, unlockOwned:15},
  { id:'b1', name:'Sourdough Starter',desc:'Oven ×2',      cost:1000,   stationId:'bread',    multiplier:2, unlockOwned:1 },
  { id:'b2', name:'Stone Mill',       desc:'Oven ×3',      cost:5000,   stationId:'bread',    multiplier:3, unlockOwned:10},
  { id:'p1', name:'Imported Butter',  desc:'Pastry ×2',   cost:5000,   stationId:'pastry',   multiplier:2, unlockOwned:1 },
  { id:'p2', name:'Laminated Dough',  desc:'Pastry ×4',   cost:25000,  stationId:'pastry',   multiplier:4, unlockOwned:8 },
  { id:'k1', name:'Sharp Knives',     desc:'Kitchen ×2',  cost:20000,  stationId:'kitchen',  multiplier:2, unlockOwned:1 },
  { id:'k2', name:'Mise en Place',    desc:'Kitchen ×4',  cost:100000, stationId:'kitchen',  multiplier:4, unlockOwned:10},
  { id:'w1', name:'House Pour',       desc:'Bar ×2',       cost:80000,  stationId:'bar',      multiplier:2, unlockOwned:1 },
  { id:'c1', name:'Grand Cru',        desc:'Cellar ×2',    cost:300000, stationId:'cellar',   multiplier:2, unlockOwned:1 },
  { id:'r1', name:'Red Thread',       desc:'Back Room ×3', cost:1000000,stationId:'backroom', multiplier:3, unlockOwned:1 },
]

interface RegularDef {
  id: string
  name: string
  title: string
  story: string
  bonus: string
  bonusDesc: string
  unlockCoversTotal: number
  multiplier: (owned: Record<string,number>) => number
}

const REGULARS: RegularDef[] = [
  {
    id:'mireille', name:'Mireille', title:'The Insomniac',
    story:"Orders the same thing every night. Never says why she can't sleep.",
    bonus:'Clicks', bonusDesc:'+1 cover per tap',
    unlockCoversTotal:100,
    multiplier:() => 0  // handled as flat bonus
  },
  {
    id:'theo', name:'Théo', title:'The Wine Writer',
    story:'Scribbles in a leather journal. Leaves a perfect review every time.',
    bonus:'Bar Cart', bonusDesc:'Bar ×1.5',
    unlockCoversTotal:2000,
    multiplier:(owned) => owned['bar'] > 0 ? 0.5 : 0
  },
  {
    id:'colette', name:'Colette', title:'The Baker\'s Ghost',
    story:'Comes in before the bread is ready. Waits without complaint.',
    bonus:'Bread Oven', bonusDesc:'Oven ×2',
    unlockCoversTotal:500,
    multiplier:(owned) => owned['bread'] > 0 ? 1.0 : 0
  },
  {
    id:'pascal', name:'Pascal', title:'The Regular Regular',
    story:'Has been coming here longer than you\'ve worked here. Longer than anyone.',
    bonus:'Global', bonusDesc:'All ×1.1 per prestige',
    unlockCoversTotal:5000,
    multiplier:() => 0  // handled in prestige calc
  },
  {
    id:'lena', name:'Léna', title:'The Night Shift',
    story:"Works somewhere nearby. You've never asked where. She never says.",
    bonus:'Late Night', bonusDesc:'After midnight: ×2',
    unlockCoversTotal:10000,
    multiplier:() => 0  // handled in shift calc
  },
  {
    id:'anatole', name:'Anatole', title:'The Cartographer',
    story:'Leaves a hand-drawn map of the neighborhood every visit. None of them match.',
    bonus:'Back Room', bonusDesc:'Back Room ×3',
    unlockCoversTotal:80000,
    multiplier:(owned) => owned['backroom'] > 0 ? 2.0 : 0
  },
]

type ShiftName = 'morning' | 'afternoon' | 'evening' | 'late'
interface ShiftDef { name: ShiftName; label: string; color: string; boostStation: string; boostMult: number; hours: [number,number] }
const SHIFTS: ShiftDef[] = [
  { name:'morning',   label:'Morning Rush',   color:'#e8821a', boostStation:'espresso', boostMult:3, hours:[6,11]  },
  { name:'afternoon', label:'Afternoon Lull',  color:'#d4a843', boostStation:'pastry',   boostMult:2, hours:[11,17] },
  { name:'evening',   label:'Evening Service', color:'#9b6dff', boostStation:'bar',      boostMult:2, hours:[17,22] },
  { name:'late',      label:'Late Night',      color:'#3a2580', boostStation:'backroom', boostMult:4, hours:[22,6]  },
]

interface Era { name: string; subtitle: string; palette: Palette; unlockPrestige: number }
const ERAS: Era[] = [
  { name:'ÉVOCHE CAFÉ',    subtitle:'est. whenever',      palette:{},              unlockPrestige:0 },
  { name:'LE JAZZ HOT',   subtitle:'the early years',     palette:{ bg:'#10080a', panel:'#2a0d14', gold:'#e8c47a', border:'#6b2838' }, unlockPrestige:1 },
  { name:'ALL NIGHT LONG',subtitle:'we never close',      palette:{ bg:'#080d1a', panel:'#0d1a2e', gold:'#6acdff', border:'#1a4a7a', cream:'#c8e8ff', creamDim:'#7aafcc' }, unlockPrestige:2 },
]

// ─── Toast / float text ───────────────────────────────────────────────────────
interface Toast { text: string; x: number; y: number; life: number; maxLife: number; color: string; scale: number }

// ─── Particle ─────────────────────────────────────────────────────────────────
interface Particle { x:number; y:number; vx:number; vy:number; life:number; color:string; size:number }

// ─── Steam puff ───────────────────────────────────────────────────────────────
interface Steam { x:number; y:number; vy:number; life:number; alpha:number; r:number }

// ─── Main game state ──────────────────────────────────────────────────────────
interface GameState {
  covers:           number
  totalCovers:      number
  coversPerSec:     number
  owned:            Record<string, number>
  upgrades:         Set<string>
  regulars:         Set<string>
  prestige:         number
  prestigeConfirm:  boolean
  coversAtPrestige: number

  tab:              'stations' | 'upgrades' | 'regulars'
  scrollY:          number
  scrollTarget:     number

  toasts:           Toast[]
  particles:        Particle[]
  steam:            Steam[]

  clickAnim:        number   // countdown for espresso machine tap flash
  lastTick:         number
  era:              number

  notif:            string   // bottom notification text
  notifLife:        number

  newRegular:       RegularDef | null   // popup
  newRegularLife:   number

  shiftOverride:    ShiftName | null    // for testing; null = use real time
}

function getShift(override: ShiftName | null): ShiftDef {
  if (override) return SHIFTS.find(s => s.name === override)!
  const h = new Date().getHours()
  return SHIFTS.find(s => {
    const [a,b] = s.hours
    return a < b ? (h >= a && h < b) : (h >= a || h < b)
  }) ?? SHIFTS[0]
}

function stationCost(def: StationDef, owned: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costMult, owned))
}

function getMultiplier(
  stationId: string,
  state: GameState,
): number {
  let m = 1
  for (const uid of state.upgrades) {
    const u = UPGRADES.find(x => x.id === uid)
    if (u && u.stationId === stationId) m *= u.multiplier
  }
  for (const rid of state.regulars) {
    const r = REGULARS.find(x => x.id === rid)
    if (r) m += r.multiplier(state.owned)
  }
  const shift = getShift(state.shiftOverride)
  if (shift.boostStation === stationId) m *= shift.boostMult
  if (state.prestige > 0 && state.regulars.has('pascal')) m *= 1 + state.prestige * 0.1
  return m
}

function calcCPS(state: GameState): number {
  let total = 0
  for (const def of STATIONS) {
    const n = state.owned[def.id] ?? 0
    if (n === 0) continue
    total += def.baseRate * n * getMultiplier(def.id, state)
  }
  return total
}

function clickBonus(state: GameState): number {
  let base = 1 + Math.floor(calcCPS(state) * 0.01)
  if (state.regulars.has('mireille')) base += 1
  return Math.max(1, base)
}

function prestigeThreshold(prestige: number): number {
  return 100000 * Math.pow(5, prestige)
}

function formatNum(n: number): string {
  if (n < 1000) return Math.floor(n).toString()
  if (n < 1e6)  return (n / 1000).toFixed(1) + 'k'
  if (n < 1e9)  return (n / 1e6).toFixed(2) + 'M'
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B'
  return (n / 1e12).toFixed(2) + 'T'
}

// ─── Save / Load ──────────────────────────────────────────────────────────────
const SAVE_KEY = 'evoche_v1'

function saveGame(s: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      covers: s.covers,
      totalCovers: s.totalCovers,
      owned: s.owned,
      upgrades: [...s.upgrades],
      regulars: [...s.regulars],
      prestige: s.prestige,
      coversAtPrestige: s.coversAtPrestige,
      era: s.era,
    }))
  } catch {}
}

function loadGame(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return {}
    const d = JSON.parse(raw)
    return {
      covers: d.covers ?? 0,
      totalCovers: d.totalCovers ?? 0,
      owned: d.owned ?? {},
      upgrades: new Set(d.upgrades ?? []),
      regulars: new Set(d.regulars ?? []),
      prestige: d.prestige ?? 0,
      coversAtPrestige: d.coversAtPrestige ?? 0,
      era: d.era ?? 0,
    }
  } catch { return {} }
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Pixel art sprites ────────────────────────────────────────────────────────
// Sprites are drawn procedurally with pixel-art style (2px blocks)

function drawEspressoMachine(ctx: CanvasRenderingContext2D, cx: number, cy: number, flash: number) {
  const B = 3
  const glow = flash > 0 ? flash / 10 : 0
  // body
  ctx.fillStyle = flash > 0 ? `rgba(245,166,35,${0.3*glow})` : 'transparent'
  if (flash > 0) { ctx.fillRect(cx-20, cy-22, 40, 38); }

  // machine body
  ctx.fillStyle = '#6b3a1f'
  ctx.fillRect(cx-14, cy-12, 28, 24)
  // chrome top
  ctx.fillStyle = '#c4a87a'
  ctx.fillRect(cx-14, cy-18, 28, 8)
  // portafilter
  ctx.fillStyle = '#8b5e2f'
  ctx.fillRect(cx-10, cy+6, 8, 6)
  ctx.fillRect(cx-10, cy+12, 12, 3)
  // steam wand
  ctx.fillStyle = '#a07840'
  ctx.fillRect(cx+8, cy-8, 3, 18)
  ctx.fillRect(cx+7, cy+10, 5, 3)
  // button
  ctx.fillStyle = glow > 0 ? `rgba(232,130,26,${0.6+0.4*glow})` : '#d4a843'
  ctx.fillRect(cx-4, cy-6, 8, 5)
  // cup
  ctx.fillStyle = '#f5e6c8'
  ctx.fillRect(cx-8, cy+16, 10, 6)
  ctx.fillStyle = '#3d1f0a'
  ctx.fillRect(cx-7, cy+17, 8, 4)
  void B
}

function drawBreadOven(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#7a4520'
  ctx.fillRect(cx-16, cy-10, 32, 22)
  ctx.fillStyle = '#4a2810'
  ctx.fillRect(cx-12, cy-6, 24, 14)
  // glow inside
  const grad = ctx.createRadialGradient(cx, cy+1, 2, cx, cy+1, 12)
  grad.addColorStop(0, 'rgba(255,120,20,0.6)')
  grad.addColorStop(1, 'rgba(255,60,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(cx-12, cy-6, 24, 14)
  // door handle
  ctx.fillStyle = '#c4a87a'
  ctx.fillRect(cx+8, cy-2, 6, 3)
  // loaves
  ctx.fillStyle = '#d4a843'
  ctx.fillRect(cx-8, cy-3, 7, 8)
  ctx.fillRect(cx+1, cy-3, 7, 8)
  ctx.fillStyle = '#b8832a'
  ctx.fillRect(cx-8, cy-3, 7, 2)
  ctx.fillRect(cx+1, cy-3, 7, 2)
  // feet
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(cx-14, cy+12, 6, 4)
  ctx.fillRect(cx+8, cy+12, 6, 4)
}

function drawPastryCase(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // glass case
  ctx.fillStyle = 'rgba(200,220,255,0.15)'
  ctx.fillRect(cx-16, cy-14, 32, 20)
  ctx.strokeStyle = '#a07840'
  ctx.lineWidth = 2
  ctx.strokeRect(cx-16, cy-14, 32, 20)
  // croissant
  ctx.fillStyle = '#d4a843'
  ctx.beginPath(); ctx.ellipse(cx-5, cy-4, 7, 4, -0.3, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#b8832a'
  ctx.beginPath(); ctx.ellipse(cx-5, cy-4, 7, 4, -0.3, 0, Math.PI)
  ctx.fill()
  // tart
  ctx.fillStyle = '#c0392b'
  ctx.beginPath(); ctx.arc(cx+7, cy-3, 5, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#e8821a'
  ctx.beginPath(); ctx.arc(cx+7, cy-3, 3, 0, Math.PI*2); ctx.fill()
  // shelf
  ctx.fillStyle = '#7a4520'
  ctx.fillRect(cx-16, cy+6, 32, 3)
  // base
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(cx-18, cy+9, 36, 6)
}

function drawKitchen(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // counter
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(cx-18, cy+4, 36, 10)
  ctx.fillStyle = '#7a4520'
  ctx.fillRect(cx-18, cy-2, 36, 8)
  // pan
  ctx.fillStyle = '#3a3030'
  ctx.beginPath(); ctx.ellipse(cx-4, cy-8, 9, 5, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#4a4040'
  ctx.beginPath(); ctx.ellipse(cx-4, cy-8, 7, 4, 0, 0, Math.PI*2); ctx.fill()
  // handle
  ctx.fillStyle = '#2a2020'
  ctx.fillRect(cx-14, cy-10, 5, 3)
  // steam
  ctx.strokeStyle = 'rgba(245,230,200,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx-6, cy-14); ctx.quadraticCurveTo(cx-4, cy-18, cx-6, cy-22); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx-2, cy-15); ctx.quadraticCurveTo(cx, cy-20, cx-2, cy-24); ctx.stroke()
  // knife
  ctx.fillStyle = '#c4a87a'
  ctx.fillRect(cx+10, cy-16, 2, 18)
  ctx.fillStyle = '#e8e0d0'
  ctx.fillRect(cx+9, cy-16, 3, 2)
}

function drawBarCart(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // cart body
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(cx-14, cy-8, 28, 16)
  // bottles
  const bottleColors = ['#6b3a8b','#c0392b','#d4a843']
  for (let i = 0; i < 3; i++) {
    const bx = cx - 10 + i * 10
    ctx.fillStyle = bottleColors[i]
    ctx.fillRect(bx-2, cy-18, 5, 12)
    ctx.fillStyle = '#f5e6c8'
    ctx.fillRect(bx-1, cy-20, 3, 3)
  }
  // glass
  ctx.fillStyle = 'rgba(200,220,255,0.4)'
  ctx.fillRect(cx+10, cy-14, 6, 10)
  ctx.strokeStyle = 'rgba(200,220,255,0.6)'
  ctx.lineWidth = 1
  ctx.strokeRect(cx+10, cy-14, 6, 10)
  // wheels
  ctx.fillStyle = '#3a2510'
  ctx.beginPath(); ctx.arc(cx-10, cy+10, 4, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx+10, cy+10, 4, 0, Math.PI*2); ctx.fill()
}

function drawWineCellar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // archway
  ctx.fillStyle = '#4a2810'
  ctx.fillRect(cx-18, cy-8, 36, 24)
  ctx.fillStyle = '#2a1508'
  ctx.beginPath(); ctx.arc(cx, cy-8, 14, Math.PI, 0); ctx.fill()
  ctx.fillStyle = '#1a0d05'
  ctx.fillRect(cx-10, cy-8, 20, 24)
  // racks
  ctx.fillStyle = '#5c3a1e'
  for (let row = 0; row < 3; row++) {
    ctx.fillRect(cx-8, cy-4 + row*7, 16, 2)
  }
  // bottles in rack
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = row===0 ? '#8b2030' : '#1a4a70'
      ctx.fillRect(cx-6 + col*8, cy-2 + row*7, 4, 5)
    }
  }
  // glow inside
  const g2 = ctx.createRadialGradient(cx, cy+8, 0, cx, cy+8, 14)
  g2.addColorStop(0, 'rgba(155,109,255,0.1)')
  g2.addColorStop(1, 'rgba(155,109,255,0)')
  ctx.fillStyle = g2
  ctx.fillRect(cx-10, cy-8, 20, 24)
}

function drawBackRoom(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // door
  ctx.fillStyle = '#2a1508'
  ctx.fillRect(cx-10, cy-18, 20, 30)
  ctx.fillStyle = '#1a0d05'
  ctx.fillRect(cx-8, cy-16, 16, 26)
  // keyhole
  ctx.fillStyle = '#d4a843'
  ctx.beginPath(); ctx.arc(cx, cy-4, 3, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#d4a843'
  ctx.fillRect(cx-2, cy-2, 4, 5)
  // candle
  ctx.fillStyle = '#f5e6c8'
  ctx.fillRect(cx-16, cy+4, 4, 8)
  ctx.fillStyle = '#d4a843'
  ctx.fillRect(cx-15, cy+1, 2, 4)
  // flame flicker
  const flicker = 0.5 + 0.5 * Math.sin(Date.now() * 0.01)
  ctx.fillStyle = `rgba(255,${140+Math.floor(flicker*40)},20,0.9)`
  ctx.beginPath(); ctx.ellipse(cx-14, cy+1, 2, 3, 0, 0, Math.PI*2); ctx.fill()
  // mysterious glow
  const mg = ctx.createRadialGradient(cx, cy+4, 0, cx, cy+4, 20)
  mg.addColorStop(0, 'rgba(212,168,67,0.2)')
  mg.addColorStop(1, 'rgba(212,168,67,0)')
  ctx.fillStyle = mg
  ctx.fillRect(cx-22, cy-20, 44, 44)
}

function drawStation(ctx: CanvasRenderingContext2D, id: string, cx: number, cy: number, flash = 0) {
  ctx.save()
  switch(id) {
    case 'espresso': drawEspressoMachine(ctx, cx, cy, flash); break
    case 'bread':    drawBreadOven(ctx, cx, cy); break
    case 'pastry':   drawPastryCase(ctx, cx, cy); break
    case 'kitchen':  drawKitchen(ctx, cx, cy); break
    case 'bar':      drawBarCart(ctx, cx, cy); break
    case 'cellar':   drawWineCellar(ctx, cx, cy); break
    case 'backroom': drawBackRoom(ctx, cx, cy); break
  }
  ctx.restore()
}

// ─── UI layout constants ───────────────────────────────────────────────────────
const HEADER_H   = 130
const TAB_H      = 36
const CONTENT_Y  = HEADER_H + TAB_H
const CONTENT_H  = H - CONTENT_Y - 60  // 60 = bottom nav space in parent

// ─── Component ───────────────────────────────────────────────────────────────

export default function EvocheCafe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef  = useRef<GameState | null>(null)
  const rafRef    = useRef<number>(0)
  const saveTimer = useRef<number>(0)

  function initState(saved: Partial<GameState> = {}): GameState {
    const base: GameState = {
      covers:           0,
      totalCovers:      0,
      coversPerSec:     0,
      owned:            {},
      upgrades:         new Set(),
      regulars:         new Set(),
      prestige:         0,
      prestigeConfirm:  false,
      coversAtPrestige: 0,
      tab:              'stations',
      scrollY:          0,
      scrollTarget:     0,
      toasts:           [],
      particles:        [],
      steam:            [],
      clickAnim:        0,
      lastTick:         performance.now(),
      era:              0,
      notif:            '',
      notifLife:        0,
      newRegular:       null,
      newRegularLife:   0,
      shiftOverride:    null,
    }
    return { ...base, ...saved }
  }

  const spawnParticles = useCallback((x: number, y: number, color: string, n = 6) => {
    const s = stateRef.current; if (!s) return
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 30 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 2
      })
    }
  }, [])

  const addToast = useCallback((text: string, x: number, y: number, color: string, scale = 1) => {
    const s = stateRef.current; if (!s) return
    s.toasts.push({ text, x, y, life: 50, maxLife: 50, color, scale })
  }, [])

  const setNotif = useCallback((text: string) => {
    const s = stateRef.current; if (!s) return
    s.notif = text
    s.notifLife = 180
  }, [])

  const handleTap = useCallback((canvasX: number, canvasY: number) => {
    const s = stateRef.current
    if (!s) return

    // prestige confirm overlay
    if (s.prestigeConfirm) {
      // confirm button area: center ~350-420, y ~310-340
      const cx = W/2
      if (canvasX >= cx-60 && canvasX <= cx+60 && canvasY >= 310 && canvasY <= 340) {
        // do prestige
        const nextPrestige = s.prestige + 1
        s.covers = 0
        s.totalCovers = 0
        s.owned = {}
        s.upgrades = new Set()
        s.prestige = nextPrestige
        s.coversAtPrestige = s.coversAtPrestige + s.coversAtPrestige
        s.era = Math.min(nextPrestige, ERAS.length - 1)
        s.prestigeConfirm = false
        setNotif(`${ERAS[s.era].name} — a new era begins`)
        spawnParticles(W/2, H/2, P.gold, 30)
        return
      }
      // cancel
      s.prestigeConfirm = false
      return
    }

    // new regular popup dismiss
    if (s.newRegular && s.newRegularLife > 0) {
      s.newRegular = null
      s.newRegularLife = 0
      return
    }

    // tab bar
    if (canvasY >= HEADER_H && canvasY <= HEADER_H + TAB_H) {
      const tabW = W / 3
      const tabIdx = Math.floor(canvasX / tabW)
      const tabs: GameState['tab'][] = ['stations','upgrades','regulars']
      s.tab = tabs[tabIdx]
      s.scrollY = 0
      s.scrollTarget = 0
      return
    }

    // header tap (espresso machine) — roughly center area
    if (canvasY < HEADER_H) {
      // click machine zone: 100–200 x, 30–110 y
      if (canvasX >= 90 && canvasX <= 200 && canvasY >= 20 && canvasY <= 110) {
        const bonus = clickBonus(s)
        s.covers += bonus
        s.totalCovers += bonus
        s.clickAnim = 10
        spawnParticles(150, 80, P.gold, 4)
        addToast(`+${bonus}`, 150, 60, P.gold, 1)
        // add steam
        for (let i = 0; i < 3; i++) {
          s.steam.push({
            x: 140 + Math.random()*20,
            y: 35,
            vy: -(0.5 + Math.random()),
            life: 40 + Math.random()*20,
            alpha: 0.4,
            r: 3 + Math.random()*3
          })
        }
        checkUnlocks(s)
      }
      // prestige button top-right
      if (canvasX >= W-70 && canvasX <= W-8 && canvasY >= 8 && canvasY <= 30) {
        if (s.totalCovers >= prestigeThreshold(s.prestige)) {
          s.prestigeConfirm = true
        } else {
          setNotif(`Need ${formatNum(prestigeThreshold(s.prestige))} total covers`)
        }
      }
      return
    }

    // content area taps
    if (canvasY < CONTENT_Y || canvasY > H - 60) return
    const relY = canvasY - CONTENT_Y + s.scrollY

    if (s.tab === 'stations') {
      const rowH = 86
      const idx = Math.floor(relY / rowH)
      const def = STATIONS[idx]
      if (!def) return
      if ((s.totalCovers < def.unlockAt)) return
      const cost = stationCost(def, s.owned[def.id] ?? 0)
      if (s.covers >= cost) {
        s.covers -= cost
        s.owned[def.id] = (s.owned[def.id] ?? 0) + 1
        spawnParticles(W/2, CONTENT_Y + idx * rowH - s.scrollY + 40, P.amber, 8)
        addToast(`+1 ${def.name}`, W/2, CONTENT_Y + idx * rowH - s.scrollY + 20, P.amber)
        checkUnlocks(s)
        setNotif(def.flavor)
      }
    }

    if (s.tab === 'upgrades') {
      const available = UPGRADES.filter(u => {
        if (s.upgrades.has(u.id)) return false
        const owned = s.owned[u.stationId] ?? 0
        return owned >= u.unlockOwned
      })
      const rowH = 72
      const idx = Math.floor(relY / rowH)
      const u = available[idx]
      if (!u) return
      if (s.covers >= u.cost) {
        s.covers -= u.cost
        s.upgrades.add(u.id)
        spawnParticles(W/2, CONTENT_Y + idx * rowH - s.scrollY + 30, P.gold, 10)
        addToast(u.name, W/2, CONTENT_Y + idx * rowH - s.scrollY + 10, P.gold)
        setNotif(`${u.name}: ${u.desc}`)
      }
    }
  }, [spawnParticles, addToast, setNotif])

  function checkUnlocks(s: GameState) {
    // check regulars
    for (const r of REGULARS) {
      if (!s.regulars.has(r.id) && s.totalCovers >= r.unlockCoversTotal) {
        s.regulars.add(r.id)
        s.newRegular = r
        s.newRegularLife = 300
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const saved = loadGame()
    stateRef.current = initState(saved)
    const s = stateRef.current

    // touch scroll
    let lastTouchY = 0
    let touchStartY = 0
    let isTap = true

    function onTouchStart(e: TouchEvent) {
      lastTouchY = e.touches[0].clientY
      touchStartY = lastTouchY
      isTap = true
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const el = canvasRef.current; if (!el) return
      const dy = e.touches[0].clientY - lastTouchY
      if (Math.abs(e.touches[0].clientY - touchStartY) > 8) isTap = false
      const s = stateRef.current; if (!s) return
      if (s.tab !== 'stations' && s.tab !== 'upgrades' && s.tab !== 'regulars') return
      const canvasY = e.touches[0].clientY - el.getBoundingClientRect().top
      const ratio = el.clientHeight > 0 ? H / el.clientHeight : 1
      const cy = canvasY * ratio
      if (cy > CONTENT_Y && cy < H - 60) {
        s.scrollTarget = Math.max(0, s.scrollTarget - dy * ratio)
      }
      lastTouchY = e.touches[0].clientY
    }
    function onTouchEnd(e: TouchEvent) {
      if (!isTap) return
      const el = canvasRef.current; if (!el) return
      const touch = e.changedTouches[0]
      const rect = el.getBoundingClientRect()
      const ratio = el.clientHeight > 0 ? H / el.clientHeight : 1
      const cx = (touch.clientX - rect.left) * ratio
      const cy = (touch.clientY - rect.top) * ratio
      handleTap(cx, cy)
    }
    function onClick(e: MouseEvent) {
      const el = canvasRef.current; if (!el) return
      const rect = el.getBoundingClientRect()
      const ratio = el.clientHeight > 0 ? H / el.clientHeight : 1
      const cx = (e.clientX - rect.left) * ratio
      const cy = (e.clientY - rect.top) * ratio
      handleTap(cx, cy)
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    canvas.addEventListener('click', onClick)

    // ─── Main loop ────────────────────────────────────────────────────────────
    function loop(now: number) {
      rafRef.current = requestAnimationFrame(loop)
      const s = stateRef.current
      if (!s) return

      const dt = Math.min((now - s.lastTick) / 1000, 0.1)
      s.lastTick = now

      // tick
      s.coversPerSec = calcCPS(s)
      const earned = s.coversPerSec * dt
      s.covers += earned
      s.totalCovers += earned

      // smooth scroll
      s.scrollY += (s.scrollTarget - s.scrollY) * 0.18

      // click anim
      if (s.clickAnim > 0) s.clickAnim--

      // notif
      if (s.notifLife > 0) s.notifLife--

      // new regular popup
      if (s.newRegularLife > 0) s.newRegularLife--

      // update steam
      s.steam = s.steam.filter(st => st.life > 0)
      for (const st of s.steam) {
        st.y += st.vy
        st.x += (Math.random() - 0.5) * 0.5
        st.life--
        st.alpha = (st.life / 60) * 0.4
        st.r += 0.05
      }

      // update particles
      s.particles = s.particles.filter(p => p.life > 0)
      for (const p of s.particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--
      }

      // update toasts
      s.toasts = s.toasts.filter(t => t.life > 0)
      for (const t of s.toasts) {
        t.y -= 0.5; t.life--
      }

      // check regulars
      checkUnlocks(s)

      // auto-save every 5s
      saveTimer.current += dt
      if (saveTimer.current > 5) {
        saveTimer.current = 0
        saveGame(s)
      }

      draw(ctx as CanvasRenderingContext2D, s, now)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('click', onClick)
      if (stateRef.current) saveGame(stateRef.current)
    }
  }, [handleTap])

  // ─── Draw ──────────────────────────────────────────────────────────────────
  function draw(ctx: CanvasRenderingContext2D, s: GameState, now: number) {
    const era = ERAS[s.era]
    const pal = { ...P, ...era.palette }
    const shift = getShift(s.shiftOverride)

    // background
    ctx.fillStyle = pal.bg
    ctx.fillRect(0, 0, W, H)

    // subtle grain texture
    ctx.save()
    ctx.globalAlpha = 0.025
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
      ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1)
    }
    ctx.restore()

    drawHeader(ctx, s, pal, shift, now)
    drawTabBar(ctx, s, pal, shift)
    drawContent(ctx, s, pal, now)
    drawSteam(ctx, s)
    drawParticles(ctx, s)
    drawToasts(ctx, s)
    if (s.notifLife > 0) drawNotif(ctx, s, pal)
    if (s.newRegular && s.newRegularLife > 0) drawRegularPopup(ctx, s.newRegular, s.newRegularLife, pal)
    if (s.prestigeConfirm) drawPrestigeConfirm(ctx, s, pal)
  }

  function drawHeader(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P, shift: ShiftDef, now: number) {
    // header bg with warm gradient
    const hGrad = ctx.createLinearGradient(0, 0, 0, HEADER_H)
    hGrad.addColorStop(0, pal.panelBright)
    hGrad.addColorStop(1, pal.panel)
    ctx.fillStyle = hGrad
    ctx.fillRect(0, 0, W, HEADER_H)
    ctx.fillStyle = pal.border
    ctx.fillRect(0, HEADER_H - 1, W, 1)

    // title
    const era = ERAS[s.era]
    drawText(ctx, era.name, W/2, 8, pal.gold, 2, 'center')
    drawText(ctx, era.subtitle, W/2, 22, pal.creamGhost, 1, 'center')

    // espresso machine (tappable) — left side
    ctx.save()
    ctx.translate(0, 0)
    drawStation(ctx, 'espresso', 148, 75, s.clickAnim)
    ctx.restore()

    // shift badge
    const shiftGrad = ctx.createLinearGradient(210, 28, 380, 28)
    shiftGrad.addColorStop(0, 'rgba(0,0,0,0)')
    shiftGrad.addColorStop(0.3, `${shift.color}22`)
    shiftGrad.addColorStop(1, `${shift.color}22`)
    ctx.fillStyle = shiftGrad
    ctx.fillRect(210, 24, 170, 18)
    drawText(ctx, shift.label, 220, 28, shift.color, 1)
    drawText(ctx, `${shift.boostStation} boost`, 220, 39, pal.creamGhost, 1)

    // covers display
    drawText(ctx, formatNum(Math.floor(s.covers)), 220, 58, pal.cream, 2)
    drawText(ctx, 'COVERS', 220, 74, pal.creamDim, 1)
    const cpsStr = `${formatNum(s.coversPerSec)}/s`
    drawText(ctx, cpsStr, 220, 86, pal.gold, 1)

    // total covers small
    drawText(ctx, `total: ${formatNum(s.totalCovers)}`, 220, 98, pal.creamGhost, 1)

    // prestige button top-right
    const pthr = prestigeThreshold(s.prestige)
    const pReady = s.totalCovers >= pthr
    const pColor = pReady ? pal.gold : pal.creamGhost
    ctx.fillStyle = pReady ? `${pal.gold}22` : `${pal.border}44`
    roundRect(ctx, W-72, 6, 64, 26, 4)
    ctx.fill()
    ctx.strokeStyle = pReady ? pal.gold : pal.border
    ctx.lineWidth = 1
    roundRect(ctx, W-72, 6, 64, 26, 4)
    ctx.stroke()
    drawText(ctx, 'PRESTIGE', W-40, 10, pColor, 1, 'center')
    drawText(ctx, `×${s.prestige + 1}`, W-40, 21, pColor, 1, 'center')

    // prestige indicator stars
    for (let i = 0; i < s.prestige; i++) {
      drawText(ctx, '+', 10 + i * 10, 8, pal.gold, 1)
    }
  }

  function drawTabBar(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P, shift: ShiftDef) {
    ctx.fillStyle = pal.espresso
    ctx.fillRect(0, HEADER_H, W, TAB_H)
    ctx.fillStyle = pal.border
    ctx.fillRect(0, HEADER_H + TAB_H - 1, W, 1)

    const tabs: Array<{ key: GameState['tab']; label: string }> = [
      { key:'stations', label:'STATIONS' },
      { key:'upgrades', label:'MENU' },
      { key:'regulars', label:'REGULARS' },
    ]
    const tabW = W / 3
    for (let i = 0; i < tabs.length; i++) {
      const t = tabs[i]
      const active = s.tab === t.key
      const tx = i * tabW
      if (active) {
        ctx.fillStyle = pal.panelBright
        ctx.fillRect(tx, HEADER_H, tabW, TAB_H)
        ctx.fillStyle = shift.color
        ctx.fillRect(tx, HEADER_H + TAB_H - 2, tabW, 2)
      }
      drawText(ctx, t.label, tx + tabW/2, HEADER_H + 13, active ? pal.cream : pal.creamGhost, 1, 'center')
    }
  }

  function drawContent(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P, now: number) {
    // clip to content area
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, CONTENT_Y, W, CONTENT_H)
    ctx.clip()

    if (s.tab === 'stations') drawStationsTab(ctx, s, pal, now)
    if (s.tab === 'upgrades') drawUpgradesTab(ctx, s, pal)
    if (s.tab === 'regulars') drawRegularsTab(ctx, s, pal)

    // fade edges
    const topFade = ctx.createLinearGradient(0, CONTENT_Y, 0, CONTENT_Y + 18)
    topFade.addColorStop(0, pal.bg)
    topFade.addColorStop(1, 'transparent')
    ctx.fillStyle = topFade
    ctx.fillRect(0, CONTENT_Y, W, 18)
    const botFade = ctx.createLinearGradient(0, H - 78, 0, H - 60)
    botFade.addColorStop(0, 'transparent')
    botFade.addColorStop(1, pal.bg)
    ctx.fillStyle = botFade
    ctx.fillRect(0, H - 78, W, 18)

    ctx.restore()
  }

  function drawStationsTab(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P, now: number) {
    const rowH = 86
    for (let i = 0; i < STATIONS.length; i++) {
      const def = STATIONS[i]
      const ry = CONTENT_Y + i * rowH - s.scrollY
      if (ry + rowH < CONTENT_Y || ry > H - 60) continue

      const owned = s.owned[def.id] ?? 0
      const locked = s.totalCovers < def.unlockAt
      const cost = stationCost(def, owned)
      const canAfford = s.covers >= cost && !locked

      // row bg
      ctx.fillStyle = locked ? `${pal.bg}cc` : (canAfford ? `${pal.panelBright}cc` : `${pal.panel}cc`)
      roundRect(ctx, 8, ry + 4, W - 16, rowH - 8, 6)
      ctx.fill()
      ctx.strokeStyle = locked ? pal.border + '44' : (canAfford ? pal.gold + '88' : pal.border + '88')
      ctx.lineWidth = 1
      roundRect(ctx, 8, ry + 4, W - 16, rowH - 8, 6)
      ctx.stroke()

      if (locked) {
        // locked state
        drawText(ctx, '???', W/2, ry + 30, pal.creamGhost, 2, 'center')
        drawText(ctx, `Unlock at ${formatNum(def.unlockAt)} covers`, W/2, ry + 52, pal.creamGhost, 1, 'center')
        continue
      }

      // sprite
      ctx.save()
      if (!canAfford) ctx.globalAlpha = 0.55
      drawStation(ctx, def.id, 50, ry + rowH/2, def.id === 'espresso' ? 0 : 0)
      ctx.restore()

      // name + count
      const cpsContrib = def.baseRate * owned * getMultiplier(def.id, s)
      drawText(ctx, def.name, 88, ry + 14, pal.cream, 1)
      drawText(ctx, `${formatNum(cpsContrib)}/s`, 88, ry + 26, pal.gold, 1)
      drawText(ctx, def.flavor, 88, ry + 40, pal.creamGhost, 1)

      // cost pill
      const costColor = canAfford ? pal.amber : pal.creamGhost
      const costStr = formatNum(cost)
      const pillW = textWidth(costStr, 1) + 14
      ctx.fillStyle = canAfford ? `${pal.amber}22` : `${pal.espresso}88`
      roundRect(ctx, W - pillW - 12, ry + rowH - 28, pillW, 16, 4)
      ctx.fill()
      ctx.strokeStyle = costColor + '88'
      ctx.lineWidth = 1
      roundRect(ctx, W - pillW - 12, ry + rowH - 28, pillW, 16, 4)
      ctx.stroke()
      drawText(ctx, costStr, W - pillW/2 - 12, ry + rowH - 24, costColor, 1, 'center')

      // owned badge
      if (owned > 0) {
        const badge = `×${owned}`
        const bw = textWidth(badge, 1) + 10
        ctx.fillStyle = pal.gold + '33'
        roundRect(ctx, W - bw - 12, ry + 10, bw, 14, 3)
        ctx.fill()
        drawText(ctx, badge, W - bw/2 - 12, ry + 13, pal.gold, 1, 'center')
      }

      // cps contribution bar
      const totalCPS = s.coversPerSec
      const pct = totalCPS > 0 ? Math.min(1, cpsContrib / totalCPS) : 0
      ctx.fillStyle = pal.border + '44'
      ctx.fillRect(88, ry + 54, W - 100, 3)
      if (pct > 0) {
        const barGrad = ctx.createLinearGradient(88, 0, 88 + (W-100)*pct, 0)
        barGrad.addColorStop(0, pal.gold + '88')
        barGrad.addColorStop(1, pal.amber + 'cc')
        ctx.fillStyle = barGrad
        ctx.fillRect(88, ry + 54, (W - 100) * pct, 3)
      }
    }
  }

  function drawUpgradesTab(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P) {
    const available = UPGRADES.filter(u => {
      if (s.upgrades.has(u.id)) return false
      const owned = s.owned[u.stationId] ?? 0
      return owned >= u.unlockOwned
    })
    const purchased = UPGRADES.filter(u => s.upgrades.has(u.id))

    if (available.length === 0 && purchased.length === 0) {
      drawText(ctx, 'Build stations to', W/2, CONTENT_Y + 30, pal.creamGhost, 1, 'center')
      drawText(ctx, 'unlock menu upgrades.', W/2, CONTENT_Y + 45, pal.creamGhost, 1, 'center')
      return
    }

    const rowH = 72
    let y = CONTENT_Y - s.scrollY

    if (available.length > 0) {
      drawText(ctx, 'AVAILABLE', 16, y + 10, pal.creamDim, 1)
      y += 24
      for (const u of available) {
        if (y + rowH > CONTENT_Y && y < H - 60) {
          drawUpgradeRow(ctx, u, y, s, pal, false)
        }
        y += rowH
      }
    }

    if (purchased.length > 0) {
      y += 8
      drawText(ctx, 'ADDED TO MENU', 16, y + 10, pal.creamGhost, 1)
      y += 24
      for (const u of purchased) {
        if (y + rowH > CONTENT_Y && y < H - 60) {
          drawUpgradeRow(ctx, u, y, s, pal, true)
        }
        y += rowH
      }
    }
  }

  function drawUpgradeRow(ctx: CanvasRenderingContext2D, u: UpgradeDef, y: number, s: GameState, pal: typeof P, bought: boolean) {
    const canAfford = !bought && s.covers >= u.cost
    ctx.fillStyle = bought ? `${pal.espresso}88` : (canAfford ? `${pal.panelBright}cc` : `${pal.panel}cc`)
    roundRect(ctx, 8, y + 4, W - 16, rowH - 8, 5)
    ctx.fill()
    ctx.strokeStyle = bought ? pal.border + '44' : (canAfford ? pal.gold + '66' : pal.border + '55')
    ctx.lineWidth = 1
    roundRect(ctx, 8, y + 4, W - 16, rowH - 8, 5)
    ctx.stroke()

    if (bought) {
      ctx.globalAlpha = 0.5
    }

    // station sprite mini
    const stDef = STATIONS.find(st => st.id === u.stationId)!
    ctx.save()
    ctx.scale(0.6, 0.6)
    drawStation(ctx, u.stationId, (44) / 0.6, (y + 36) / 0.6)
    ctx.restore()

    drawText(ctx, u.name, 72, y + 14, bought ? pal.creamGhost : pal.cream, 1)
    drawText(ctx, u.desc, 72, y + 27, pal.gold, 1)
    drawText(ctx, `${stDef.name}`, 72, y + 40, pal.creamGhost, 1)

    if (!bought) {
      const costStr = formatNum(u.cost)
      const costColor = canAfford ? pal.amber : pal.creamGhost
      const pillW = textWidth(costStr, 1) + 14
      ctx.fillStyle = canAfford ? `${pal.amber}22` : `${pal.espresso}88`
      roundRect(ctx, W - pillW - 12, y + 14, pillW, 16, 4)
      ctx.fill()
      ctx.strokeStyle = costColor + '88'
      ctx.lineWidth = 1
      roundRect(ctx, W - pillW - 12, y + 14, pillW, 16, 4)
      ctx.stroke()
      drawText(ctx, costStr, W - pillW/2 - 12, y + 18, costColor, 1, 'center')
    } else {
      drawText(ctx, 'ON MENU', W - 60, y + 18, pal.creamGhost, 1)
    }

    if (bought) ctx.globalAlpha = 1
  }

  function drawRegularsTab(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P) {
    const rowH = 100
    let y = CONTENT_Y - s.scrollY

    for (const r of REGULARS) {
      if (y + rowH > CONTENT_Y && y < H - 60) {
        const unlocked = s.regulars.has(r.id)
        const locked = s.totalCovers < r.unlockCoversTotal

        ctx.fillStyle = unlocked ? `${pal.panelBright}cc` : `${pal.panel}88`
        roundRect(ctx, 8, y + 4, W - 16, rowH - 8, 6)
        ctx.fill()
        ctx.strokeStyle = unlocked ? pal.gold + '66' : pal.border + '44'
        ctx.lineWidth = 1
        roundRect(ctx, 8, y + 4, W - 16, rowH - 8, 6)
        ctx.stroke()

        if (locked) {
          drawText(ctx, '???', W/2, y + 30, pal.creamGhost, 2, 'center')
          drawText(ctx, `Arrives after ${formatNum(r.unlockCoversTotal)} covers`, W/2, y + 52, pal.creamGhost, 1, 'center')
          y += rowH
          continue
        }

        // portrait placeholder — pixel face
        drawPixelFace(ctx, 36, y + 46, unlocked ? pal.gold : pal.creamGhost)

        drawText(ctx, r.name, 68, y + 14, unlocked ? pal.cream : pal.creamDim, 1)
        drawText(ctx, r.title, 68, y + 26, unlocked ? pal.gold : pal.creamGhost, 1)

        if (unlocked) {
          const lines = wrapText(r.story, 36)
          for (let li = 0; li < Math.min(lines.length, 2); li++) {
            drawText(ctx, lines[li], 68, y + 40 + li*12, pal.creamGhost, 1)
          }
          drawText(ctx, r.bonusDesc, W - 100, y + 14, pal.amber, 1)
        } else {
          drawText(ctx, `Not yet a regular`, 68, y + 42, pal.creamGhost, 1)
        }
      }
      y += rowH
    }
  }

  function drawPixelFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
    ctx.fillStyle = color
    // head
    for (let px = -4; px <= 4; px++) {
      for (let py = -5; py <= 4; py++) {
        const onEdge = Math.abs(px) === 4 || Math.abs(py) === 5 || (py === 4 && Math.abs(px) <= 3)
        const isEye = (py === -2 && (px === -2 || px === 2))
        const isMouth = py === 2 && Math.abs(px) <= 2 && !(px === 0)
        if ((Math.abs(px) <= 3 && Math.abs(py) <= 4) && !onEdge) {
          ctx.fillStyle = isEye ? (color === P.gold ? '#f5e6c8' : color) : (color + '44')
          ctx.fillRect(cx + px*2, cy + py*2, 2, 2)
        }
        if (isEye || isMouth) {
          ctx.fillStyle = color
          ctx.fillRect(cx + px*2, cy + py*2, 2, 2)
        }
      }
    }
  }

  function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      if (cur.length + w.length + 1 > maxChars) { lines.push(cur.trim()); cur = '' }
      cur += w + ' '
    }
    if (cur.trim()) lines.push(cur.trim())
    return lines
  }

  function drawSteam(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const st of s.steam) {
      ctx.save()
      ctx.globalAlpha = st.alpha
      ctx.fillStyle = P.steam.replace('0.15', String(st.alpha))
      ctx.beginPath()
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function drawParticles(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const p of s.particles) {
      ctx.save()
      ctx.globalAlpha = p.life / 50
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size)
      ctx.restore()
    }
  }

  function drawToasts(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const t of s.toasts) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, t.life / 15)
      drawText(ctx, t.text, t.x, t.y, t.color, t.scale, 'center')
      ctx.restore()
    }
  }

  function drawNotif(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P) {
    const alpha = Math.min(1, s.notifLife / 20)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = pal.panel + 'ee'
    roundRect(ctx, 12, H - 72, W - 24, 20, 4)
    ctx.fill()
    ctx.strokeStyle = pal.border
    ctx.lineWidth = 1
    roundRect(ctx, 12, H - 72, W - 24, 20, 4)
    ctx.stroke()
    drawText(ctx, s.notif, W/2, H - 68, pal.creamDim, 1, 'center')
    ctx.restore()
  }

  function drawRegularPopup(ctx: CanvasRenderingContext2D, r: RegularDef, life: number, pal: typeof P) {
    const alpha = Math.min(1, life / 30)
    ctx.save()
    ctx.globalAlpha = alpha

    // dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, W, H)

    const pw = W - 48
    const ph = 200
    const px = 24
    const py = H/2 - ph/2

    ctx.fillStyle = pal.panelBright
    roundRect(ctx, px, py, pw, ph, 8)
    ctx.fill()
    ctx.strokeStyle = pal.gold
    ctx.lineWidth = 2
    roundRect(ctx, px, py, pw, ph, 8)
    ctx.stroke()

    // gold top bar
    ctx.fillStyle = pal.gold + '44'
    roundRect(ctx, px, py, pw, 32, 8)
    ctx.fill()
    ctx.fillStyle = pal.gold + '44'
    ctx.fillRect(px, py + 16, pw, 16)

    drawText(ctx, 'A REGULAR ARRIVES', W/2, py + 10, pal.gold, 1, 'center')

    drawPixelFace(ctx, W/2, py + 72, pal.gold)

    drawText(ctx, r.name, W/2, py + 100, pal.cream, 2, 'center')
    drawText(ctx, r.title, W/2, py + 116, pal.creamDim, 1, 'center')

    const storyLines = wrapText(r.story, 40)
    for (let i = 0; i < Math.min(2, storyLines.length); i++) {
      drawText(ctx, storyLines[i], W/2, py + 132 + i * 13, pal.creamGhost, 1, 'center')
    }

    drawText(ctx, `BONUS: ${r.bonusDesc}`, W/2, py + 164, pal.amber, 1, 'center')

    drawText(ctx, 'tap to continue', W/2, py + 184, pal.creamGhost, 1, 'center')
    ctx.restore()
  }

  function drawPrestigeConfirm(ctx: CanvasRenderingContext2D, s: GameState, pal: typeof P) {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, 0, W, H)

    const nextEra = ERAS[Math.min(s.prestige + 1, ERAS.length - 1)]

    const pw = W - 40
    const ph = 220
    const px = 20
    const py = H/2 - ph/2 - 20

    ctx.fillStyle = pal.panel
    roundRect(ctx, px, py, pw, ph, 10)
    ctx.fill()
    ctx.strokeStyle = pal.gold
    ctx.lineWidth = 2
    roundRect(ctx, px, py, pw, ph, 10)
    ctx.stroke()

    drawText(ctx, 'CLOSE FOR THE SEASON', W/2, py + 14, pal.gold, 1, 'center')
    drawText(ctx, 'All covers and stations reset.', W/2, py + 34, pal.cream, 1, 'center')
    drawText(ctx, 'Your regulars remember you.', W/2, py + 48, pal.creamDim, 1, 'center')

    drawText(ctx, 'NEW ERA:', W/2, py + 72, pal.creamGhost, 1, 'center')
    drawText(ctx, nextEra.name, W/2, py + 88, pal.cream, 2, 'center')
    drawText(ctx, nextEra.subtitle, W/2, py + 106, pal.creamDim, 1, 'center')

    drawText(ctx, `Prestige bonus: ×${(1 + (s.prestige+1)*0.5).toFixed(1)} global`, W/2, py + 126, pal.amber, 1, 'center')

    // confirm button
    const cx2 = W/2
    ctx.fillStyle = pal.gold + '33'
    roundRect(ctx, cx2-60, py + 148, 120, 32, 6)
    ctx.fill()
    ctx.strokeStyle = pal.gold
    ctx.lineWidth = 1.5
    roundRect(ctx, cx2-60, py + 148, 120, 32, 6)
    ctx.stroke()
    drawText(ctx, 'CLOSE UP SHOP', cx2, py + 158, pal.gold, 1, 'center')
    drawText(ctx, '(confirm)', cx2, py + 170, pal.creamGhost, 1, 'center')

    // cancel
    drawText(ctx, 'tap outside to cancel', W/2, py + 200, pal.creamGhost, 1, 'center')

    ctx.restore()
  }

  const rowH = 72

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a0f08' }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          touchAction: 'none',
          cursor: 'pointer',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}
