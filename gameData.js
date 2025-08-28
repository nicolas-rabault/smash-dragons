/*
 * Game Data - Configuration for levels, bosses, and powers
 * Centralized data structure for scalable game content
 */

// Power definitions - unified system for all abilities
const POWER_TYPES = {
  FIREBALL: {
    id: "fireball",
    name: "Fireball",
    sprite: "fireball",
    speed: 650,
    cooldown: 0.2,
    damage: 1,
    effectColors: [
      [255, 150, 0],
      [255, 100, 0],
    ],
    trailColors: [255, 150, 0, 255],
    sound: "fireballExplosion", // Explosion sound effect
    unlocked: true, // Player starts with this
  },
  WATERBALL: {
    id: "waterball",
    name: "Waterball",
    sprite: "waterball",
    speed: 380,
    cooldown: 1.2,
    damage: 1,
    effectColors: [
      [100, 150, 255],
      [0, 100, 255],
    ],
    trailColors: [0, 150, 255, 255],
    sound: "waterballExplosion", // Explosion sound effect
    unlocked: false, // Obtained from Water Dragon boss
  },
  ICEBALL: {
    id: "iceball",
    name: "Iceball",
    sprite: "iceball", // To be created
    speed: 450,
    cooldown: 0.8,
    damage: 1,
    effectColors: [
      [200, 255, 255],
      [150, 200, 255],
    ],
    trailColors: [200, 255, 255, 255],
    sound: null,
    unlocked: false, // Future ice boss power
  },
  LIGHTNING: {
    id: "lightning",
    name: "Lightning Bolt",
    sprite: "lightning", // To be created
    speed: 800,
    cooldown: 1.5,
    damage: 2,
    effectColors: [
      [255, 255, 0],
      [255, 200, 0],
    ],
    trailColors: [255, 255, 0, 255],
    sound: null,
    unlocked: false, // Future storm boss power
  },
};

// Boss definitions - scalable boss system
const BOSS_TYPES = {
  WATER_DRAGON: {
    id: "waterDragon",
    name: "Water Dragon",
    sprite: "level1Dragon",
    scale: 0.6,
    hp: 15,
    speed: 100,
    powerType: "WATERBALL",
    attackCooldown: 1.2,
    movePattern: "horizontal", // horizontal, vertical, circular, static
    spawnPos: { x: 1950, y: 200 },
    boundaryLeft: 1800,
    boundaryRight: 2100,
    rewardPower: "WATERBALL",
    defeatSound: "victoryFanfare",
    colors: {
      healthBar: [100, 150, 255],
      healthBg: [50, 75, 150],
      explosion: [100, 200, 255],
    },
  },
  FIRE_DRAGON: {
    id: "fireDragon",
    name: "Fire Dragon",
    sprite: "level2Dragon",
    scale: 0.7,
    hp: 20,
    speed: 120,
    powerType: "FIREBALL",
    attackCooldown: 1.0,
    movePattern: "circular",
    spawnPos: { x: 1950, y: 200 },
    circleRadius: 100,
    circleCenter: { x: 1950, y: 200 },
    rewardPower: "FIREBALL", // Player already has this, so no new power
    defeatSound: "victoryFanfare",
    colors: {
      healthBar: [255, 100, 0],
      healthBg: [150, 50, 0],
      explosion: [255, 150, 50],
    },
  },
  ICE_DRAGON: {
    id: "iceDragon",
    name: "Ice Dragon",
    sprite: "iceDragon", // To be created
    scale: 0.7,
    hp: 20,
    speed: 80,
    powerType: "ICEBALL",
    attackCooldown: 0.8,
    movePattern: "vertical",
    spawnPos: { x: 1950, y: 150 },
    boundaryTop: 100,
    boundaryBottom: 300,
    rewardPower: "ICEBALL",
    defeatSound: "victoryFanfare",
    colors: {
      healthBar: [0, 200, 255],
      healthBg: [0, 100, 150],
      explosion: [200, 255, 255],
    },
  },
  STORM_DRAGON: {
    id: "stormDragon",
    name: "Storm Dragon",
    sprite: "stormDragon", // To be created
    scale: 0.8,
    hp: 25,
    speed: 120,
    powerType: "LIGHTNING",
    attackCooldown: 1.5,
    movePattern: "circular",
    spawnPos: { x: 1950, y: 200 },
    circleRadius: 150,
    circleCenter: { x: 1950, y: 200 },
    rewardPower: "LIGHTNING",
    defeatSound: "victoryFanfare",
    colors: {
      healthBar: [255, 255, 0],
      healthBg: [150, 150, 0],
      explosion: [255, 255, 200],
    },
  },
};

// Level definitions - scalable level system
const LEVEL_DATA = {
  1: {
    id: 1,
    name: "Lava Caverns",
    boss: "WATER_DRAGON",
    background: "lava",
    platforms: [
      { x: 150, y: 520, type: "start" },
      { x: 350, y: 450, type: "normal" },
      { x: 550, y: 380, type: "normal" },
      { x: 750, y: 320, type: "normal" },
      { x: 950, y: 450, type: "normal" },
      { x: 1200, y: 380, type: "normal" },
      { x: 1450, y: 320, type: "normal" },
      { x: 1700, y: 280, type: "normal" },
      { x: 1950, y: 350, type: "boss" },
      { x: 2200, y: 380, type: "end" },
    ],
    ambientMusic: "magmaAmbience",
    colors: {
      background: [15, 10, 30],
      lava: [255, 60, 0],
      lavaGlow: [255, 120, 20],
    },
  },
  2: {
    id: 2,
    name: "Fire Caverns",
    boss: "FIRE_DRAGON",
    background: "fire",
    platforms: [
      { x: 150, y: 520, type: "start" },
      { x: 400, y: 400, type: "normal" },
      { x: 650, y: 320, type: "normal" },
      { x: 900, y: 250, type: "normal" },
      { x: 1150, y: 380, type: "normal" },
      { x: 1400, y: 300, type: "normal" },
      { x: 1650, y: 220, type: "normal" },
      { x: 1900, y: 350, type: "boss" },
      { x: 2150, y: 280, type: "end" },
    ],
    ambientMusic: "fireAmbience",
    colors: {
      background: [20, 10, 15],
      fire: [255, 100, 50],
      fireGlow: [255, 150, 100],
    },
  },
  3: {
    id: 3,
    name: "Storm Clouds",
    boss: "STORM_DRAGON",
    background: "storm",
    platforms: [
      { x: 150, y: 520, type: "start" },
      { x: 450, y: 420, type: "normal" },
      { x: 750, y: 350, type: "normal" },
      { x: 1050, y: 280, type: "normal" },
      { x: 1350, y: 400, type: "normal" },
      { x: 1650, y: 320, type: "normal" },
      { x: 1950, y: 250, type: "boss" },
      { x: 2250, y: 380, type: "end" },
    ],
    ambientMusic: "stormAmbience", // To be added
    colors: {
      background: [20, 10, 30],
      storm: [100, 100, 150],
      lightning: [255, 255, 200],
    },
  },
};

// Background themes for different level types
const BACKGROUND_THEMES = {
  lava: {
    baseColor: [15, 10, 30],
    layers: [
      { color: [25, 10, 40], offset: 0 },
      { color: [40, 15, 50], offset: 50 },
      { color: [55, 20, 60], offset: 100 },
    ],
    hazard: {
      color: [255, 60, 0],
      glowColor: [255, 120, 20],
    },
  },
  fire: {
    baseColor: [20, 10, 15],
    layers: [
      { color: [40, 20, 25], offset: 0 },
      { color: [60, 30, 35], offset: 50 },
      { color: [80, 40, 45], offset: 100 },
    ],
    hazard: {
      color: [255, 100, 50],
      glowColor: [255, 150, 100],
    },
  },
  ice: {
    baseColor: [10, 15, 30],
    layers: [
      { color: [20, 25, 40], offset: 0 },
      { color: [30, 35, 50], offset: 50 },
      { color: [40, 45, 60], offset: 100 },
    ],
    hazard: {
      color: [200, 230, 255],
      glowColor: [150, 200, 255],
    },
  },
  storm: {
    baseColor: [20, 10, 30],
    layers: [
      { color: [30, 20, 40], offset: 0 },
      { color: [40, 30, 50], offset: 50 },
      { color: [50, 40, 60], offset: 100 },
    ],
    hazard: {
      color: [100, 100, 150],
      glowColor: [255, 255, 200],
    },
  },
};

// Player progression system
const PLAYER_PROGRESSION = {
  unlockedPowers: ["FIREBALL"], // Powers the player currently has
  completedLevels: [], // Levels the player has completed
  currentLevel: 1,

  // Function to unlock a power
  unlockPower: function (powerType) {
    if (!this.unlockedPowers.includes(powerType)) {
      this.unlockedPowers.push(powerType);
      POWER_TYPES[powerType].unlocked = true;
      console.log(`Power unlocked: ${POWER_TYPES[powerType].name}`);
    }
  },

  // Function to complete a level
  completeLevel: function (levelId) {
    if (!this.completedLevels.includes(levelId)) {
      this.completedLevels.push(levelId);
      console.log(`Level ${levelId} completed!`);
    }
  },

  // Function to get available powers
  getAvailablePowers: function () {
    return this.unlockedPowers.map((powerKey) => POWER_TYPES[powerKey]);
  },
};
