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
    console.log("Attempting to use level1 background image...");

    // Check if the sprite is available
    try {
      // Scale the background to cover the full screen height
      const scaleY = GAME_HEIGHT / 512; // Scale to fit screen height (600/2048)
      const scaleX = scaleY; // Keep aspect ratio square

      // Calculate how many background tiles we need to cover the level width
      const tileWidth = 2048 * scaleX; // Width of one scaled tile
      const numTiles = Math.ceil(LEVEL_WIDTH / tileWidth) + 1; // Add extra tile for safety

      console.log(
        `Creating ${numTiles} background tiles to cover level width, scale: ${scaleX}`
      );

      // Create multiple background tiles to cover the entire level width
      for (let i = 0; i < numTiles; i++) {
        const bgSprite = add([
          sprite("level1Background"),
          pos(i * tileWidth, 0),
          scale(scaleX, scaleY), // Scale to cover full screen height
          z(-20),
        ]);
      }
      console.log("✅ Successfully created tiled level1 background");
    } catch (error) {
      console.error("❌ Failed to create level1 background sprite:", error);
      // Fallback to colored background
      add([
        rect(LEVEL_WIDTH, GAME_HEIGHT),
        pos(0, 0),
        color(theme.baseColor[0], theme.baseColor[1], theme.baseColor[2]),
        z(-20),
      ]);
      console.log("Using colored background fallback for level 1");
    }
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
