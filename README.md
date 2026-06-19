# 🌍 CarbonCringe

> **AI-powered carbon footprint tracker with GenZ energy.** Understand, track, and reduce your environmental impact — one affectionate roast at a time.

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![NVIDIA Nemotron](https://img.shields.io/badge/AI-NVIDIA%20Nemotron-76b900?logo=nvidia)](https://build.nvidia.com/)
[![Tests](https://img.shields.io/badge/Tests-124%20passing-brightgreen)](/__tests__)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Chosen Vertical

**Sustainability & Climate Action** — Personal carbon footprint tracking with AI-powered behavioral nudging.

CarbonCringe targets the gap between "knowing climate change is real" and "actually changing daily habits." Most carbon trackers feel like homework. CarbonCringe feels like a brutally honest friend who roasts your choices AND gives you a concrete plan to do better.

---

## 🧠 Approach & Logic

### The Core Problem
The average person has no intuitive feel for what "1 kg CO₂e" means. Numbers alone don't change behavior — emotional context does.

### The Solution
1. **Log → Calculate → Contextualize**: Activities are mapped to calibrated emission factors (DEFRA 2023, IEA, Poore & Nemecek 2018). Raw kg CO₂e is immediately translated into relatable equivalents ("= 847 phone charges", "= 3.2 trees needed").

2. **AI Roasting as Behavioral Nudging**: NVIDIA Nemotron provides personalized, GenZ-toned feedback. The roast isn't mean — it's the tone of a friend who genuinely cares. Humor lowers defensiveness; concrete tips create action.

3. **Streak Mechanics**: Daily logging streaks leverage loss aversion. Users are more motivated by not breaking a streak than by abstract "improving" metrics.

4. **Actions Library**: 22 curated micro-habits, each with estimated CO₂ savings, filtered by category. Low friction, high impact choices surfaced first.

### Emission Factor Sources
| Activity | Factor | Source |
|----------|--------|--------|
| Car (petrol avg) | 0.192 kg CO₂e / km | DEFRA 2023 |
| Bus | 0.089 kg CO₂e / km | DEFRA 2023 |
| Short-haul flight | 0.255 kg CO₂e / km | DEFRA 2023 |
| Long-haul flight | 0.195 kg CO₂e / km | DEFRA 2023 |
| Beef meal | 3.3 kg CO₂e / meal | Poore & Nemecek 2018 |
| Chicken meal | 0.86 kg CO₂e / meal | Poore & Nemecek 2018 |
| Vegetarian meal | 0.5 kg CO₂e / meal | Poore & Nemecek 2018 |
| Vegan meal | 0.3 kg CO₂e / meal | Poore & Nemecek 2018 |
| Food delivery | 1.5 kg CO₂e / order | MIT study |
| AC (1 hr) | 0.6 kg CO₂e / hr | IEA grid avg |
| Online order | 1.5 kg CO₂e / order | MIT study |
| Fast fashion item | 12 kg CO₂e / item | WRAP 2022 |

⚠️ All values are estimates based on global averages. Actual values vary by region and provider.

---

## ⚙️ How the Solution Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js App Router — client components)           │
│                                                             │
│  useActivityLog ──► useFootprint ──► Dashboard/Charts       │
│       │                                                     │
│       ▼                                                     │
│  localStorage (persisted state — no backend DB needed)      │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch
┌──────────────────────────▼──────────────────────────────────┐
│  Next.js API Routes (Edge-compatible, server-side only)     │
│                                                             │
│  POST /api/chat      ──► NVIDIA Nemotron (streaming SSE)    │
│  POST /api/analyze   ──► NVIDIA Nemotron (daily roast)      │
│  POST /api/personalize ► NVIDIA Nemotron (weekly report)    │
│  POST /api/suggestions ► NVIDIA Nemotron (action ranking)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ OpenAI-compatible SDK
┌──────────────────────────▼──────────────────────────────────┐
│  NVIDIA NIM API (integrate.api.nvidia.com)                  │
│  Model: nvidia/nemotron-ultra-253b-v1                       │
└─────────────────────────────────────────────────────────────┘
```

### User Flow
1. **Dashboard** — See today's total footprint, category breakdown, 7-day chart, streak, and AI roast
2. **Log** — One-tap activity logging (4 categories, 17 activity types) with optional notes
3. **Chat** — Real-time streaming conversation with the AI carbon coach
4. **Insights** — Weekly patterns, best/worst days, trends, AI-generated personal report
5. **Actions** — 22 curated habits ranked by CO₂ savings; mark complete to build progress

### Key Technical Details

- **Streaming AI**: `/api/chat` returns a `ReadableStream`. The client reads chunks token-by-token for a real-time typewriter effect — identical to ChatGPT's streaming UX.
- **Demo Mode**: If `NVIDIA_API_KEY` is not set, all AI routes fall back to deterministic mock responses. The app is fully functional without a key.
- **State Management**: `useActivityLog` + `useFootprint` hooks manage all state via `localStorage`. No external DB, no sign-up required.
- **Performance**: `FootprintChart` and `CategoryBreakdown` use `React.lazy` / dynamic imports to keep the initial bundle lean.
- **Type Safety**: Strict TypeScript throughout. All API inputs validated with typed guard functions (no Zod dependency). No `any` types in production code.

---

## 🔐 Security

| Measure | Implementation |
|---------|---------------|
| API key isolation | `NVIDIA_API_KEY` is server-side only — never sent to the client or exposed in responses |
| Input sanitization | `sanitizeUserInput()` strips HTML, JS protocol, event handlers, and LLM role-injection tokens before any input reaches the AI |
| Input validation | All API routes validate request shape with typed guard functions before processing |
| Rate limiting | In-memory token bucket: 10 requests / 60 seconds per `x-session-id` header |
| CSP headers | `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` set in `next.config.mjs` |
| Prompt injection defence | LLM control tokens (`[INST]`, `</s>`, role prefixes) stripped from user messages before forwarding to the model |
| Quantity clamping | All numeric inputs clamped to `[0, 100_000]` range; non-finite values rejected |

---

## ♿ Accessibility

- All interactive elements have `aria-label` attributes
- Semantic HTML throughout (`<header>`, `<nav>`, `<main>`, `<footer>`, `role="log"` for chat)
- Keyboard navigation: all buttons/links focusable, `focus-visible` outline styles applied
- Chat window uses `aria-live="polite"` for screen reader streaming announcements
- Color contrast ratios meet WCAG AA for all text on dark backgrounds
- Mobile tab bar uses `aria-current="page"` for active state
- Motion respects `prefers-reduced-motion` via Framer Motion defaults

---

## 🧪 Testing

```
Test Suites: 16 passed
Tests:       124 passed
```

| Suite | What it covers |
|-------|---------------|
| `sanitize.test.ts` | XSS stripping, LLM injection, length clamping, quantity validation |
| `validators.test.ts` | All API route validators — valid/invalid inputs, edge cases |
| `rate-limiter.test.ts` | Token bucket logic, window reset, concurrent sessions |
| `carbonCalculator.test.ts` | Emission factor math, floating-point precision |
| `prompts.test.ts` | System prompt construction, context injection |
| `streak.test.ts` | Consecutive day counting, gap detection, timezone handling |
| `useChatThreads.test.tsx` | Thread creation, deletion, message streaming state |
| `ActivitySelector.test.tsx` | Category filtering, selection state, accessibility |
| `StreakCounter.test.tsx` | Render states (0, active, milestone streaks) |
| `CategoryBreakdown.test.tsx` | Empty state, category percentages, bar widths |
| `personalize.test.ts` | API route mock response validation |
| `patternDetector.test.ts` | User activity frequency, day-of-week pattern suggestions |
| `QuickPrompts.test.tsx` | UI interaction and callbacks for empty state conversational prompts |
| `extract-log.test.ts` | Natural language logging API parser and fallback edge cases |
| `ActivityConfirmCard.test.tsx` | Countdown timer ticks, logging states, and undo button triggers |

Run tests:
```bash
npm test              # All 124 tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

---

## 🚀 Getting Started

```bash
# 1. Clone & install
git clone https://github.com/your-username/carboncringe
cd carboncringe
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local — add your NVIDIA_API_KEY from https://build.nvidia.com
# (Skip this step to run in demo mode — fully functional without a key)

# 3. Run locally
npm run dev
# → http://localhost:3000
```

### Available Scripts
```bash
npm run dev      # Development server (hot reload)
npm run build    # Production build
npm run start    # Start production build
npm run lint     # ESLint check
npm test         # Jest unit tests
npx tsc --noEmit # TypeScript check (0 errors)
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + custom CSS variables |
| UI Components | shadcn/ui + custom GlassCard system |
| AI | NVIDIA Nemotron Ultra 253B via NVIDIA NIM |
| Charts | Recharts |
| Animation | Framer Motion |
| State | React hooks + localStorage (no external DB) |
| Testing | Jest + React Testing Library |
| Fonts | Inter + Plus Jakarta Sans (Google Fonts) |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # Server-side API routes (chat, analyze, personalize, suggestions)
│   ├── chat/               # AI chat companion page
│   ├── insights/           # Weekly pattern analysis page
│   ├── log/                # Activity logging page
│   └── actions/            # Habit suggestions page
├── components/
│   ├── layout/             # Navbar, MobileNav, Footer, ConditionalMain
│   ├── shared/             # GlassCard, LoadingSpinner, AnimatedBackground, ErrorBoundary
│   ├── dashboard/          # FootprintChart, CategoryBreakdown, StreakCounter, QuickStats
│   ├── logging/            # ActivitySelector, QuickLogButton
│   ├── chat/               # ChatWindow, ChatInput, ChatSidebar, MessageBubble
│   └── actions/            # Habit suggestions page
├── hooks/                  # useActivityLog, useFootprint, useChatThreads, useChatHandler
├── lib/                    # carbonCalculator, sanitize, validators, rate-limiter, prompts, nvidia
└── types/                  # Shared TypeScript interfaces
__tests__/                  # 16 test suites, 124 tests
```

---

## 🤔 Assumptions Made

1. **Client-side persistence is acceptable** — `localStorage` is used instead of a database. This means data is per-browser and not synced across devices. For a hackathon scope this is intentional (no sign-up friction, instant start).

2. **Emission factors are global averages** — Region-specific grids (e.g., nuclear-heavy France vs coal-heavy Poland) would change energy emissions significantly. We use global IEA averages and disclose this prominently.

3. **"Today" is determined by local device time** — No timezone normalization. A log entry at 11:59 PM and 12:01 AM in different timezones might count on different days.

4. **Demo mode is first-class** — The app must work without an NVIDIA API key for evaluators who don't have one. All AI routes have realistic mock responses.

5. **Rate limiting is in-memory** — The token bucket resets on server restart. A production version would use Redis. For a single-server hackathon demo this is sufficient.

---

*made with anxiety about the climate 💚*
