# Development History

This document captures the design decisions and development phases of the WotR Calculator.

## Phase 1: Core Engine

### Battle Simulation Engine
Built a Monte Carlo simulation engine that resolves War of the Ring battles probabilistically.

**Key decisions:**
- **Pure functions for game logic** — `runBattle()`, `resolveCombatRound()`, `allocateHits()` are all pure functions that take input and return output without side effects. This makes them easy to test and reason about.
- **Separated concerns into small modules** — `dice.ts` handles rolling, `hitAllocation.ts` handles damage, `combat.ts` orchestrates a single round, `battle.ts` runs the full battle loop. Each can be tested independently.
- **Chunked async simulation** — The simulation runs 10,000 battles in chunks of 100 with `setTimeout(0)` between chunks, yielding to the UI thread so the app stays responsive during heavy computation.

### Hit Allocation: Elite Downgrade Mechanic
Per WotR rules, when an elite takes a hit it becomes a regular (not a "damaged elite"). This means elites effectively have 2 HP.

**Algorithm:**
1. Kill regulars first (cheapest units)
2. Downgrade surviving elites to regulars (first hit)
3. Kill newly created regulars with remaining hits (second hit on what were elites)

This was initially implemented with a `damagedElites` intermediate state, but was later simplified to direct elite-to-regular conversion, which matches the actual board game rules more closely.

### Dice Mechanics
- Field attacker: hits on 5+ (2/6 chance per die)
- Siege attacker: hits on 6 only (1/6 chance per die)
- Defender: always hits on 5+ (2/6 chance)
- Max 5 dice per side
- Leaders grant re-rolls equal to their leadership value

## Phase 2: UI and State Management

### Tab-Based Navigation
Chose Expo Router's file-based routing for simplicity. Four tabs:
1. **Battle** — Configure and simulate
2. **Results** — View charts and statistics
3. **Optimize** — Find smallest winning armies
4. **Presets** — Load stronghold defenders

### State Management with Zustand
Chose Zustand over React Context for global state because:
- No provider wrapper needed
- Simple API (just a hook)
- Supports selectors for performance (components only re-render when their selected state changes)
- Tiny bundle size

### Charts with react-native-gifted-charts
Selected for its donut pie chart and horizontal bar chart support. Used for:
- Win rate pie chart (attacker/defender/draw)
- Survivor distribution bar charts with mean/median indicators

## Phase 3: Optimizer

### Brute-Force Approach
The optimizer enumerates all valid army compositions within user-defined constraints and simulates each one against the defender.

**Why brute force?** The search space is small enough. With max 10 regulars, 10 elites, 5 leaders, the number of valid armies is typically in the hundreds. Each is simulated 1,000 times. Total computation time: ~2-10 seconds on a modern phone.

**Sorting:** Results are sorted by smallest army first (fewest combat units), with ties broken by higher win rate. This answers the most useful question: "What's the minimum force I need?"

### Dual Siege Mode
For siege battles, the optimizer runs both continuation modes and presents results side by side:
- **Extend mode:** Attacker downgrades 1 elite per extra round
- **New Battle mode:** No unit cost per round (models spending separate action dice)

This lets players compare strategies: "Should I bring elites for extending, or use separate action dice?"

## Phase 4: Polish and Deployment

### Stronghold Presets
21 strongholds from the game pre-configured with their canonical defenders. Grouped by faction (Free Peoples / Shadow). Tapping a preset loads the defender and switches to siege mode.

### Characters
Named characters with:
- Leadership values (grant re-rolls in combat)
- Faction assignment (Shadow / Free Peoples)
- Special abilities (flavor text, some affect gameplay)
- Captain of the West designation

### Theme: Dark Leather/Wood
Evolved from an initial dark navy tech theme to a Middle-earth inspired aesthetic:
- Dark leather backgrounds (`#1a1410`)
- Aged wood card surfaces (`#252015`)
- One Ring gold accents (`#c9a84c`)
- Parchment text (`#d4c5a9`)
- Dark wood borders (`#3d2e1f`)

### Mobile Deployment
Built with EAS Build (Expo Application Services):
- `preview` profile: Produces APK for direct installation
- `production` profile: Produces AAB for Google Play Store
- Cloud-based builds (no local Android SDK needed)

## Testing Strategy

96 unit tests covering:
- **Dice rolling** — Statistical validation of hit rates
- **Hit allocation** — Elite downgrade, kill order, edge cases
- **Combat rounds** — Non-mutation, hit ranges, siege disadvantage
- **Battle loop** — Win conditions, siege rounds, both continuation modes
- **Simulation** — Run counts, win rate bounds, statistical properties
- **Siege mechanics** — Extension, continuation, round limits
- **Optimizer** — Candidate generation, constraint enforcement, result ordering

All engine modules have pure function signatures, making them trivially testable without mocking.
