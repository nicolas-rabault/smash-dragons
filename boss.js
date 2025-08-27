/*
 * Boss System - Scalable boss management
 * Handles creation, AI behavior, health system, and defeat mechanics for all boss types
 */

// Create boss based on current level data
function createBoss() {
  const levelData = LEVEL_DATA[gameState.level];
  if (!levelData) {
    console.error(`No level data found for level ${gameState.level}`);
    return null;
  }

  const bossData = BOSS_TYPES[levelData.boss];
  if (!bossData) {
    console.error(`No boss data found for boss type: ${levelData.boss}`);
    return null;
  }

  return createBossEntity(bossData);
}

// Create specific boss entity
function createBossEntity(bossData) {
  const boss = add([
    sprite(bossData.sprite),
    scale(bossData.scale),
    pos(bossData.spawnPos.x, bossData.spawnPos.y),
    area(),
    anchor("center"),
    {
      bossType: bossData.id,
      hp: bossData.hp,
      maxHp: bossData.hp,
      speed: bossData.speed,
      lastShotTime: 0,
      phase: 1,
      movePattern: bossData.movePattern,
      powerType: bossData.powerType,
      attackCooldown: bossData.attackCooldown,
      // Movement boundaries
      boundaryLeft: bossData.boundaryLeft,
      boundaryRight: bossData.boundaryRight,
      boundaryTop: bossData.boundaryTop,
      boundaryBottom: bossData.boundaryBottom,
      // Circular movement data
      circleRadius: bossData.circleRadius,
      circleCenter: bossData.circleCenter,
      circleAngle: 0,
    },
    "boss",
  ]);

  // Create boss health bar
  createBossHealthBar(bossData);

  // Setup boss AI based on movement pattern
  setupBossAI(boss, bossData);

  return boss;
}

// Create health bar for boss
function createBossHealthBar(bossData) {
  const colors = bossData.colors;

  const bossHealthBg = add([
    rect(200, 20),
    pos(GAME_WIDTH / 2 - 100, 50),
    color(colors.healthBg[0], colors.healthBg[1], colors.healthBg[2]),
    fixed(),
    z(100),
    "bossHealthBg",
  ]);

  const bossHealth = add([
    rect(200, 20),
    pos(GAME_WIDTH / 2 - 100, 50),
    color(colors.healthBar[0], colors.healthBar[1], colors.healthBar[2]),
    fixed(),
    z(101),
    "bossHealth",
  ]);

  // Boss name display
  add([
    text(bossData.name, {
      size: 16,
      font: "sink",
    }),
    color(255, 255, 255),
    pos(GAME_WIDTH / 2, 30),
    anchor("center"),
    fixed(),
    z(102),
    "bossName",
  ]);
}

// Setup AI behavior based on movement pattern
function setupBossAI(boss, bossData) {
  boss.onUpdate(() => {
    if (!boss.exists()) return;

    // Update movement based on pattern
    updateBossMovement(boss, bossData);

    // Update boss health bar
    const healthPercent = boss.hp / boss.maxHp;
    if (get("bossHealth")[0]) {
      get("bossHealth")[0].width = 200 * healthPercent;
    }

    // Boss attacking (only if attack delay has passed)
    if (
      boss.canAttack !== false &&
      time() - boss.lastShotTime > boss.attackCooldown
    ) {
      const powerType = POWER_TYPES[boss.powerType];
      if (powerType) {
        spawnPower(boss, boss.powerType);
        boss.lastShotTime = time();
      }
    }
  });
}

// Handle different movement patterns
function updateBossMovement(boss, bossData) {
  switch (boss.movePattern) {
    case "horizontal":
      boss.move(boss.speed, 0);
      if (boss.pos.x < boss.boundaryLeft) {
        boss.speed = Math.abs(boss.speed);
      } else if (boss.pos.x > boss.boundaryRight) {
        boss.speed = -Math.abs(boss.speed);
      }
      break;

    case "vertical":
      boss.move(0, boss.speed);
      if (boss.pos.y < boss.boundaryTop) {
        boss.speed = Math.abs(boss.speed);
      } else if (boss.pos.y > boss.boundaryBottom) {
        boss.speed = -Math.abs(boss.speed);
      }
      break;

    case "circular":
      boss.circleAngle += 0.02;
      const newX =
        boss.circleCenter.x + Math.cos(boss.circleAngle) * boss.circleRadius;
      const newY =
        boss.circleCenter.y + Math.sin(boss.circleAngle) * boss.circleRadius;
      boss.pos = vec2(newX, newY);
      break;

    case "static":
      // Boss doesn't move
      break;

    default:
      console.warn(`Unknown movement pattern: ${boss.movePattern}`);
      break;
  }
}

function killBoss(boss) {
  const levelData = LEVEL_DATA[gameState.level];
  const bossData = BOSS_TYPES[levelData.boss];

  gameState.bossDefeated = true;
  updateScore(1000);

  // Mark level as completed
  PLAYER_PROGRESSION.completeLevel(gameState.level);

  // Play victory fanfare
  audioManager.playSFX(bossData.defeatSound);

  // Create boss-specific explosion
  const explosionColor = bossData.colors.explosion;
  createExplosion(boss.pos.x, boss.pos.y, explosionColor);
  destroy(boss);

  // Remove boss UI safely
  try {
    get("bossHealthBg").forEach((bg) => destroy(bg));
    get("bossHealth").forEach((health) => destroy(health));
    get("bossName").forEach((name) => destroy(name));
    console.log("Boss UI removed successfully");
  } catch (error) {
    console.error("Error removing boss UI:", error);
  }

  // Create elegant victory screen with proper spacing and no overlaps
  createVictoryScreen(bossData);

  onKeyPress("space", () => {
    // Restart level 1 but keep the unlocked powers and current score
    gameState.level = 1;
    gameState.bossDefeated = false;
    gameState.bossEncounterStarted = false;
    gameState.bossSpawned = false;
    gameState.playerInBossArea = false;
    // Keep score and lives, don't reset them
    go("game");
  });
}

// Create beautiful victory screen with perfect spacing and no overlaps
function createVictoryScreen(bossData) {
  // Semi-transparent dark overlay for better readability
  add([
    rect(GAME_WIDTH, GAME_HEIGHT),
    pos(0, 0),
    color(0, 0, 0, 0.7),
    fixed(),
    z(190),
    "victoryOverlay",
  ]);

  // Victory title - well positioned at top
  add([
    text("VICTORY!", {
      size: 48,
      font: "sink",
    }),
    color(255, 215, 0),
    pos(GAME_WIDTH / 2, 80),
    anchor("center"),
    fixed(),
    z(200),
    "victoryText",
  ]);

  // Boss defeated message
  add([
    text(`${bossData.name.toUpperCase()} DEFEATED!`, {
      size: 28,
      font: "sink",
    }),
    color(255, 100, 100),
    pos(GAME_WIDTH / 2, 130),
    anchor("center"),
    fixed(),
    z(200),
    "victoryText",
  ]);

  // Score gained message
  add([
    text(`+1000 POINTS`, {
      size: 20,
      font: "sink",
    }),
    color(100, 255, 100),
    pos(GAME_WIDTH / 2, 170),
    anchor("center"),
    fixed(),
    z(200),
    "victoryText",
  ]);

  // Display the newly acquired power
  const newPowerData = POWER_TYPES[bossData.rewardPower];
  if (newPowerData) {
    // Power acquisition section title
    add([
      text("NEW POWER ACQUIRED!", {
        size: 32,
        font: "sink",
      }),
      color(255, 215, 0),
      pos(GAME_WIDTH / 2, 230),
      anchor("center"),
      fixed(),
      z(200),
      "victoryText",
    ]);

    // Power name with elegant styling
    add([
      text(newPowerData.name.toUpperCase(), {
        size: 40,
        font: "sink",
      }),
      color(255, 255, 255),
      pos(GAME_WIDTH / 2, 280),
      anchor("center"),
      fixed(),
      z(200),
      "victoryText",
    ]);

    // Large power icon - NO BACKGROUND, perfectly centered
    add([
      sprite(newPowerData.sprite),
      pos(GAME_WIDTH / 2, 360),
      scale(5.0), // Even larger for maximum impact
      anchor("center"),
      fixed(),
      z(201),
      "victoryPowerIcon",
    ]);

    // Subtle decorative elements around the icon (no background)
    // Add elegant corner decorations instead of background
    const iconRadius = 60;
    const corners = [
      { x: -iconRadius, y: -iconRadius }, // top-left
      { x: iconRadius, y: -iconRadius },  // top-right
      { x: -iconRadius, y: iconRadius },  // bottom-left
      { x: iconRadius, y: iconRadius },   // bottom-right
    ];

    corners.forEach((corner) => {
      add([
        rect(8, 8),
        pos(GAME_WIDTH / 2 + corner.x, 360 + corner.y),
        anchor("center"),
        color(255, 215, 0),
        fixed(),
        z(202),
        "victoryDecoration",
      ]);
    });

    // Add elegant lines extending from corners
    // Horizontal lines
    add([
      rect(30, 2),
      pos(GAME_WIDTH / 2 - iconRadius - 20, 360 - iconRadius),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(30, 2),
      pos(GAME_WIDTH / 2 + iconRadius + 20, 360 - iconRadius),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(30, 2),
      pos(GAME_WIDTH / 2 - iconRadius - 20, 360 + iconRadius),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(30, 2),
      pos(GAME_WIDTH / 2 + iconRadius + 20, 360 + iconRadius),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);

    // Vertical lines
    add([
      rect(2, 30),
      pos(GAME_WIDTH / 2 - iconRadius, 360 - iconRadius - 20),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(2, 30),
      pos(GAME_WIDTH / 2 + iconRadius, 360 - iconRadius - 20),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(2, 30),
      pos(GAME_WIDTH / 2 - iconRadius, 360 + iconRadius + 20),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
    add([
      rect(2, 30),
      pos(GAME_WIDTH / 2 + iconRadius, 360 + iconRadius + 20),
      anchor("center"),
      color(255, 215, 0, 0.8),
      fixed(),
      z(202),
      "victoryDecoration",
    ]);
  }

  // Instructions - well-spaced at bottom
  add([
    text("Press SPACE to continue your adventure", {
      size: 20,
      font: "sink",
    }),
    color(200, 200, 255),
    pos(GAME_WIDTH / 2, 480),
    anchor("center"),
    fixed(),
    z(200),
    "victoryText",
  ]);

  add([
    text("with your new power!", {
      size: 20,
      font: "sink",
    }),
    color(200, 200, 255),
    pos(GAME_WIDTH / 2, 510),
    anchor("center"),
    fixed(),
    z(200),
    "victoryText",
  ]);

  console.log("✨ Beautiful victory screen created with perfect spacing!");
}

// Boss collision setup (now handled in powers.js unified system)
function setupBossCollisions() {
  // Collisions are now handled by the unified power system in powers.js
  // This function remains for compatibility and can be used for boss-specific collisions
  console.log("Boss collision system initialized (handled by powers.js)");
}
