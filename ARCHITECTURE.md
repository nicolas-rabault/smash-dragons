# 🏗️ Smash Dragons - Modular Architecture

This document describes the refactored architecture of Smash Dragons, where the code has been split into multiple maintainable modules.

## 📁 File Structure

```
smash-dragons/
├── index.html          # Main HTML page with module imports
├── main.js            # Core system: audio, utilities, initialization, scenes
├── gameData.js        # 🆕 Game configuration: levels, bosses, powers data
├── character.js       # Player character: movement, combat, power cycling
├── boss.js           # Scalable boss system: multiple boss types and AI
├── powers.js         # Unified power system: all projectile types and effects
├── level.js          # Environment: themed backgrounds, platforms, camera
├── ui.js             # Interface: score, power display, mobile controls
└── assets/           # Game assets (sprites, audio)
```

## 🎯 Module Responsibilities

### `main.js` - Core System

**Contains only system-level code:**

- Game constants and global state
- AudioManager class (complete audio system)
- Utility functions (explosion effects, jump effects)
- Asset loading and fallback systems
- Scene management (menu, game, game over)
- Kaboom.js initialization

### `character.js` - Player Character

**Player-specific functionality:**

- `createPlayer()` - Player entity creation with physics
- `setupPlayerMovement()` - Keyboard controls and movement logic
- `playerDies()` - Death, respawn, and game over handling
- Player state management (invulnerability, direction, etc.)

### `boss.js` - Dragon Boss

**Boss-specific functionality:**

- `createBoss()` - Boss entity creation with AI behavior
- `killBoss()` - Victory handling and level progression
- `setupBossCollisions()` - Boss-specific collision detection
- Boss health bar management

### `powers.js` - Combat System

**Projectile and combat mechanics:**

- `spawnFireball()` - Player projectile creation and effects
- `spawnWaterball()` - Boss projectile creation and effects
- `createFireballExplosion()` - Enhanced explosion effects
- `setupPowerCollisions()` - Projectile collision handling

### `level.js` - Environment

**World and level management:**

- `createBackground()` - Multi-layered background with lava effects
- `createPlatforms()` - Platform generation with special types
- `setupCamera()` - Camera following system
- Environment collision setup

### `ui.js` - User Interface

**Interface and controls:**

- `createUI()` - Score, lives, level display
- `updateScore()` / `updateLives()` - UI update functions
- `setupMobileControls()` - Complete mobile touch control system
- Responsive mobile button layout

## 🔗 Module Dependencies

```
main.js (core system)
├── gameData.js (data definitions)
├── level.js (depends on: main constants, gameData)
├── powers.js (depends on: main utilities, gameData)
├── character.js (depends on: powers, gameData, main utilities)
├── boss.js (depends on: powers, gameData, main utilities)
└── ui.js (depends on: powers, gameData, character, main state)
```

## 🎮 Game Flow

1. **Initialization** (`main.js`)

   - Load assets and initialize audio
   - Setup Kaboom.js with responsive dimensions
   - Initialize all scenes

2. **Menu Scene** (`main.js`)

   - Audio transition and UI setup
   - Start button interaction

3. **Game Scene** (modular)

   ```javascript
   // Create game world
   createBackground(); // level.js
   createPlatforms(); // level.js

   // Create entities
   const player = createPlayer(); // character.js
   const boss = createBoss(); // boss.js

   // Setup UI and controls
   createUI(); // ui.js
   setupMobileControls(player); // ui.js

   // Setup game mechanics
   setupPlayerMovement(player); // character.js
   setupPowerCollisions(player); // powers.js
   setupBossCollisions(); // boss.js
   setupCamera(player); // level.js
   ```

4. **Game Over Scene** (`main.js`)
   - Audio transition and restart/menu options

## 🔧 Key Benefits of Modular Architecture

### ✅ **Maintainability**

- Each module has a single responsibility
- Easy to locate and modify specific functionality
- Reduced code complexity per file

### ✅ **Extensibility**

- Add new powers by extending `powers.js`
- Add new boss types by extending `boss.js`
- Add new levels by extending `level.js`
- Add new UI elements in `ui.js`

### ✅ **Debugging**

- Issues can be isolated to specific modules
- Easier to test individual components
- Clear separation of concerns

### ✅ **Collaboration**

- Multiple developers can work on different modules
- Reduced merge conflicts
- Clear module boundaries

## 🚀 How to Extend the Game

### Adding a New Power

1. Add the power function to `powers.js`
2. Add collision handling in `setupPowerCollisions()`
3. Add UI controls if needed in `character.js` or `ui.js`

### Adding a New Boss

1. Create new boss type in `boss.js`
2. Add specific AI behavior and health management
3. Update level data in `level.js` if needed

### Adding New Levels

1. Extend platform data in `level.js`
2. Add new background variations
3. Update game state management in `main.js`

### Adding Mobile Features

1. Extend `setupMobileControls()` in `ui.js`
2. Add new button types and interactions
3. Update responsive layout calculations

## 🎮 New Game Features

### Power Inheritance System

- **Boss Defeat Rewards:** Each boss drops their unique power when defeated
- **Power Cycling:** Press `C` or `X` to cycle through unlocked powers
- **Visual Feedback:** Current power displayed in UI with color coding
- **Mobile Support:** Dedicated power cycle button on touch devices

### Scalable Content System

- **3 Levels Defined:** Lava Caverns, Frozen Peaks, Storm Clouds
- **3 Boss Types:** Water Dragon, Ice Dragon, Storm Dragon
- **4 Power Types:** Fireball, Waterball, Iceball, Lightning
- **Multiple Themes:** Lava, Ice, Storm backgrounds with unique aesthetics

### Enhanced Controls

- **Desktop:** QWERTY/Arrow movement + C/X power cycling + Space/E shooting
- **Mobile:** 4-button layout (Left, Right, Jump, Shoot, Power Cycle)
- **Real-time UI:** Current power display updates dynamically

## 📝 Development Guidelines

1. **Data-Driven Design** - All content defined in `gameData.js` for easy expansion
2. **Consistent Naming** - Use UPPER_CASE for data keys, camelCase for functions
3. **Module Dependencies** - Follow import order: `main` → `gameData` → others
4. **Power System** - All powers use unified `spawnPower()` function
5. **Boss System** - All bosses use data-driven `createBossEntity()` function
6. **Level System** - All levels use themed `createThemedBackground()` function

### Future-Proof Architecture ✅

The new architecture is **fully prepared** for:

- ✅ **Multiple levels** (data-driven level system)
- ✅ **Multiple boss types** (scalable boss configurations)
- ✅ **Multiple power types** (unified power management)
- ✅ **Power inheritance** (boss defeat → player gains power)
- ✅ **Consistent naming** (standardized conventions throughout)
- ✅ **Easy expansion** (just add data, no code changes needed)

---

**🎯 Mission Accomplished: The architecture is now fully scalable and ready for unlimited content expansion while maintaining clean, consistent code organization!**
