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
  // Use level1 background image for level 1, colored rectangles for other levels
  if (gameState.level === 1) {
    // Use the level1 background image
    add([
      sprite("level1Background"),
      pos(0, 0),
      scale(LEVEL_WIDTH / 800, GAME_HEIGHT / 600), // Scale to fit level width
      z(-20),
    ]);
    console.log("Using level1 background image");
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
    color(theme.hazard.color[0], theme.hazard.color[1], theme.hazard.color[2]),
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

    // Add platform glow for special platforms
    if (data.type === "start" || data.type === "boss" || data.type === "end") {
      const glowColor = getPlatformGlowColor(data.type);
      add([
        rect(120, 10),
        pos(data.x, data.y - 15),
        color(glowColor[0], glowColor[1], glowColor[2], 0.6),
        z(5),
      ]);
    }
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
  player.onUpdate(() => {
    const camX = clamp(
      player.pos.x,
      GAME_WIDTH / 2,
      LEVEL_WIDTH - GAME_WIDTH / 2
    );
    camPos(camX, GAME_HEIGHT / 2);
  });
}

// Level-specific collision setup
function setupLevelCollisions(player) {
  // Player falls into lava (handled in character.js player update)
  // Platform interactions are handled by Kaboom's built-in physics
}
