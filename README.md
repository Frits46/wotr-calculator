# WotR Calculator

A mobile battle calculator for **War of the Ring** (the board game). Simulate battles, view detailed results, and find the smallest army compositions that achieve a target win rate.

Built with React Native + Expo. Runs on Android, iOS, and web.

## Features

### Battle Simulator
- Configure attacker and defender armies (regulars, elites, leaders, named characters)
- Field battles and siege battles with configurable rounds
- Two siege continuation modes:
  - **Extend** — downgrade 1 elite to a regular per extra round
  - **New Battle** — no unit cost per round (models spending action dice)
- Monte Carlo simulation (10,000 battles) with async chunked execution

### Results Dashboard
- Win rate pie chart (attacker / defender / draw)
- Key stats grid (win rates, average rounds, draw rate)
- Survivor distribution bar charts with mean and median indicators

### Force Optimizer
- Set army constraints (max regulars, elites, leaders, total units)
- Set a minimum win rate threshold
- Brute-force enumeration of all valid army compositions
- For siege battles: runs both continuation modes and shows results side by side
- Tap any result to load it into the Battle tab

### Stronghold Presets
- 21 pre-configured strongholds from the game (Free Peoples + Shadow)
- Tap to instantly load as the defender army

### Characters
- Named characters from both factions with leadership values
- Special abilities (Gandalf, Witch-king, Aragorn, etc.)
- Captain of the West designation for Free Peoples heroes

## Tech Stack

- **Framework:** React Native 0.81 + Expo SDK 54
- **Routing:** Expo Router (file-based tabs)
- **State:** Zustand v5
- **Charts:** react-native-gifted-charts
- **Testing:** Jest + ts-jest (96 tests)
- **Language:** TypeScript (strict mode)

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Battle tab — configure armies, run simulation
    results.tsx        # Results tab — charts and stats
    optimizer.tsx      # Optimizer tab — find smallest winning armies
    presets.tsx         # Presets tab — stronghold defenders
    _layout.tsx        # Tab navigation config
  _layout.tsx          # Root layout (SafeAreaProvider, StatusBar)

src/
  engine/
    types.ts           # Core types (Army, BattleConfig, etc.)
    battle.ts          # Battle loop (field + siege)
    combat.ts          # Single round resolution
    dice.ts            # Dice rolling and hit calculation
    hitAllocation.ts   # Damage allocation (regulars first, elites downgrade)
    siege.ts           # Siege extension and continuation helpers
    simulation.ts      # Monte Carlo runner (async + sync)
    optimizer.ts       # Brute-force army optimizer with dual siege mode
    constants.ts       # Characters, stronghold presets
  components/
    ArmyEditor.tsx     # Army configuration card
    BattleTypeToggle.tsx # Field/Siege toggle + siege options
    UnitStepper.tsx    # +/- stepper control with haptic feedback
    CharacterPicker.tsx # Character selection modal
    SimulateButton.tsx  # Simulate button with progress
  hooks/
    useSimulation.ts   # Async simulation hook
  store/
    battleStore.ts     # Zustand store for all app state

__tests__/engine/      # 96 unit tests covering all engine modules
```

## Game Rules Implemented

- **Dice:** Attacker hits on 5+ (field) or 6 (siege). Defender always hits on 5+. Max 5 dice.
- **Leaders:** Add re-rolls equal to leadership value. Characters may add additional leadership.
- **Hit Allocation:** Regulars die first. Elites downgrade to regulars on first hit (effectively 2 HP).
- **Siege:** Defender advantage (attacker hits only on 6). Attacker can extend by sacrificing elites or by spending action dice (new battle mode).
- **Combat Units Cap:** Max 10 combat units (regulars + elites) per army. Siege defenders max 5.

## Running Locally

```bash
npm install
npx expo start        # Start dev server
npx expo start --web  # Web version at localhost:8081
```

Scan the QR code with Expo Go on your phone, or press `w` to open in browser.

## Testing

```bash
npm test              # Run all 96 tests
npx tsc --noEmit      # TypeScript type check
```

## Building for Android

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview    # APK for sideloading
eas build --platform android --profile production  # AAB for Play Store
```

## Theme

Dark leather/wood aesthetic inspired by Middle-earth:
- Background: `#1a1410` (dark leather)
- Cards: `#252015` (aged wood)
- Accent: `#c9a84c` (One Ring gold)
- Text: `#d4c5a9` (parchment)
