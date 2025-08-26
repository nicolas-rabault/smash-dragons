/*
 * Level System - Scalable level creation, platforms, background, and camera
 * Handles environment setup and world building for all level types
 */

// Create background based on current level data
function createBackground() {
  const levelData = LEVEL_DATA[gameState.level];
  if (!levelData) {
    console.error(`No level data found for level ${gameState.level}`);
    return;
  }

  const theme = BACKGROUND_THEMES[levelData.background];
  if (!theme) {
    console.error(`No background theme found: ${levelData.background}`);
    return;
  }

  createThemedBackground(theme, levelData);
}

// Create themed background based on level type
function createThemedBackground(theme, levelData) {
  // Use animated level1 background for level 1, colored rectangles for other levels
  if (gameState.level === 1) {
    console.log("Creating animated level1 background...");
    createAnimatedBackground();
  } else {
    // Fallback to colored background for other levels
    add([
      rect(LEVEL_WIDTH, GAME_HEIGHT),
      pos(0, 0),
      color(theme.baseColor[0], theme.baseColor[1], theme.baseColor[2]),
      z(-20),
    ]);
    console.log("Using colored background for level", gameState.level);
  }

  // Only draw colored layers if we don't have a proper background image
  if (gameState.level !== 1) {
    // Atmospheric layers
    theme.layers.forEach((layer, i) => {
      add([
        rect(LEVEL_WIDTH, 200),
        pos(0, GAME_HEIGHT - 200 + layer.offset),
        color(layer.color[0], layer.color[1], layer.color[2]),
        z(-19 + i),
      ]);
    });

    // Hazard floor (lava, ice, storm clouds, etc.)
    add([
      rect(LEVEL_WIDTH, 120),
      pos(0, GAME_HEIGHT - 120),
      color(
        theme.hazard.color[0],
        theme.hazard.color[1],
        theme.hazard.color[2]
      ),
      z(-15),
    ]);

    // Hazard glow effect
    add([
      rect(LEVEL_WIDTH, 40),
      pos(0, GAME_HEIGHT - 160),
      color(
        theme.hazard.glowColor[0],
        theme.hazard.glowColor[1],
        theme.hazard.glowColor[2],
        0.7
      ),
      z(-16),
    ]);
  } else {
    console.log(
      "Skipping colored layers for level 1 - using background image instead"
    );
  }

  // Level-specific decorative elements
  createLevelDecorations(levelData, theme);
}

// Create level-specific decorative elements
function createLevelDecorations(levelData, theme) {
  switch (levelData.background) {
    case "lava":
      createLavaDecorations();
      break;
    case "ice":
      createIceDecorations();
      break;
    case "storm":
      createStormDecorations();
      break;
    default:
      console.log(
        `No decorations defined for background: ${levelData.background}`
      );
      break;
  }
}

// Lava level decorations
function createLavaDecorations() {
  // Add some lava bubbles or steam effects here in the future
  console.log("Lava decorations created");
}

// Ice level decorations
function createIceDecorations() {
  // Add some ice crystals or snow effects here in the future
  console.log("Ice decorations created");
}

// Storm level decorations
function createStormDecorations() {
  // Add some lightning or cloud effects here in the future
  console.log("Storm decorations created");
}

// Create platforms based on current level data
function createPlatforms() {
  const levelData = LEVEL_DATA[gameState.level];
  if (!levelData) {
    console.error(`No level data found for level ${gameState.level}`);
    return [];
  }

  return createLevelPlatforms(levelData.platforms);
}

// Create platforms from level data
function createLevelPlatforms(platformData) {
  platformData.forEach((data) => {
    const platform = add([
      sprite("platform"),
      pos(data.x, data.y),
      scale(0.8),
      area(),
      body({ isStatic: true }),
      "platform",
      { platformType: data.type },
    ]);

    // Platform glow effects removed - they were causing green squares
  });

  return platformData;
}

// Get platform glow color based on type
function getPlatformGlowColor(platformType) {
  switch (platformType) {
    case "start":
      return [100, 255, 100]; // Green for start
    case "boss":
      return [255, 100, 100]; // Red for boss
    case "end":
      return [100, 200, 255]; // Blue for end
    default:
      return [100, 200, 255]; // Default blue
  }
}

function setupCamera(player) {
  // Camera state management
  let cameraLocked = false;
  let lockedPosition = null;

  // Get level data for boundary calculation
  const levelData = LEVEL_DATA[gameState.level];
  const endPlatform = levelData.platforms.find((p) => p.type === "end");
  const bossEncounterArea = endPlatform
    ? endPlatform.x - 300
    : LEVEL_WIDTH - 500; // Area before end platform

  // Calculate optimal camera lock position to show end platform
  const optimalCameraX = endPlatform
    ? endPlatform.x - GAME_WIDTH / 2 + 100 // Position camera to show end platform on right side
    : LEVEL_WIDTH - GAME_WIDTH / 2;

  player.onUpdate(() => {
    // Check if player has reached the boss encounter area
    if (!cameraLocked && player.pos.x >= bossEncounterArea) {
      console.log("🎬 Player reached boss encounter area - locking camera");
      cameraLocked = true;
      lockedPosition = optimalCameraX; // Lock camera to show encounter area properly

      // Trigger boss encounter sequence
      if (!gameState.bossEncounterStarted) {
        gameState.bossEncounterStarted = true;
        gameState.playerInBossArea = true; // Set respawn flag
        triggerBossEncounter(player);
      }
    }

    // Update camera position
    if (cameraLocked && lockedPosition) {
      camPos(lockedPosition, GAME_HEIGHT / 2);
    } else {
      const camX = clamp(
        player.pos.x,
        GAME_WIDTH / 2,
        LEVEL_WIDTH - GAME_WIDTH / 2
      );
      camPos(camX, GAME_HEIGHT / 2);
    }
  });

  // Function to unlock camera (for future use)
  return {
    unlock: () => {
      cameraLocked = false;
      lockedPosition = null;
      console.log("🎬 Camera unlocked");
    },
    lock: (position) => {
      cameraLocked = true;
      lockedPosition = position;
      console.log("🎬 Camera locked at position:", position);
    },
  };
}

// Trigger boss encounter sequence
function triggerBossEncounter(player) {
  console.log("🎬 Starting boss encounter sequence");

  // Wait for player to stop moving
  waitForPlayerToStop(player, () => {
    console.log("🎬 Player stopped - starting boss entrance animation");
    startBossEntranceAnimation();
  });
}

// Wait for player to stop moving before starting boss encounter
function waitForPlayerToStop(player, callback) {
  let lastPlayerPos = player.pos.clone();
  let stillTime = 0;
  const REQUIRED_STILL_TIME = 1.0; // Player must be still for 1 second

  const checkStillness = setInterval(() => {
    const currentPos = player.pos;
    const distance =
      Math.abs(currentPos.x - lastPlayerPos.x) +
      Math.abs(currentPos.y - lastPlayerPos.y);

    if (distance < 5) {
      // Player is mostly still (accounting for small physics jitter)
      stillTime += 0.1;
      if (stillTime >= REQUIRED_STILL_TIME) {
        clearInterval(checkStillness);
        callback();
      }
    } else {
      stillTime = 0; // Reset timer if player moves
    }

    lastPlayerPos = currentPos.clone();
  }, 100); // Check every 100ms
}

// Start the dramatic boss entrance animation
function startBossEntranceAnimation() {
  const levelData = LEVEL_DATA[gameState.level];
  const bossData = BOSS_TYPES[levelData.boss];

  // Show text announcement
  const announcement = add([
    text(`${bossData.name.toUpperCase()} APPROACHES!`, {
      size: 32,
      font: "sink",
    }),
    color(255, 255, 0),
    pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100),
    anchor("center"),
    fixed(),
    z(150),
    lifespan(3, { fade: 1 }),
  ]);

  // Shake screen for drama
  shake(20);

  // Start boss entrance after announcement
  wait(2, () => {
    animateBossEntrance(bossData);
  });
}

// Animate boss flying in from the right to center screen
function animateBossEntrance(bossData) {
  console.log("🐉 Animating boss entrance");

  // Calculate boss target position (center of screen relative to camera)
  const cameraX = camPos().x;
  const targetX = cameraX;
  const targetY = GAME_HEIGHT / 2 - 50;

  // Start boss off-screen to the right
  const startX = cameraX + GAME_WIDTH;
  const startY = targetY;

  // Create boss sprite for animation (without AI initially)
  const animatingBoss = add([
    sprite(bossData.sprite),
    scale(bossData.scale),
    pos(startX, startY),
    anchor("center"),
    z(10),
    "animatingBoss",
  ]);

  // Animate boss flying to center
  const flyDuration = 2.0;
  const startTime = time();

  animatingBoss.onUpdate(() => {
    const elapsed = time() - startTime;
    const progress = elapsed / flyDuration;

    if (progress >= 1) {
      // Animation complete - spawn actual boss
      const finalPos = vec2(targetX, targetY);
      destroy(animatingBoss);
      spawnActualBoss(bossData, finalPos);
    } else {
      // Continue animation
      const currentX = lerp(startX, targetX, progress);
      const currentY = lerp(startY, targetY, progress);
      animatingBoss.pos = vec2(currentX, currentY);
    }
  });
}

// Spawn the actual boss entity for combat
function spawnActualBoss(bossData, position) {
  console.log("🐉 Spawning actual boss for combat");

  // Update boss spawn position to center
  const modifiedBossData = { ...bossData };
  modifiedBossData.spawnPos = { x: position.x, y: position.y };

  // Create actual boss with AI and health bar
  const boss = createBossEntity(modifiedBossData);
  createBossHealthBar(bossData);

  // Add attack delay - boss waits 2 seconds before attacking
  boss.attackStartTime = time() + 2.0; // Boss won't attack for first 2 seconds
  boss.canAttack = false;

  // Set up delayed attack enabling
  wait(2, () => {
    if (boss.exists()) {
      boss.canAttack = true;
      console.log("🐉 Boss can now attack!");
    }
  });

  // Update boss boundaries to be camera-relative for better movement
  const cameraX = camPos().x;
  boss.boundaryLeft = cameraX - GAME_WIDTH / 2 + 100; // Left edge of screen + margin
  boss.boundaryRight = cameraX + GAME_WIDTH / 2 - 100; // Right edge of screen - margin
  console.log(
    `🐉 Boss boundaries updated: ${boss.boundaryLeft} to ${boss.boundaryRight}`
  );

  setupBossAI(boss, modifiedBossData);
  setupBossCollisions();

  gameState.bossSpawned = true;
  console.log("🎮 Boss fight started!");
}

// Level-specific collision setup
function setupLevelCollisions(player) {
  // Player falls into lava (handled in character.js player update)
  // Platform interactions are handled by Kaboom's built-in physics
}
