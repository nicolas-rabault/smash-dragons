/*
 * Level System - Level creation, platforms, background, and camera
 * Handles environment setup and world building
 */

function createBackground() {
  // Dark cavern background
  add([rect(LEVEL_WIDTH, GAME_HEIGHT), pos(0, 0), color(15, 10, 30), z(-20)]);

  // Atmospheric layers
  for (let i = 0; i < 3; i++) {
    add([
      rect(LEVEL_WIDTH, 200),
      pos(0, GAME_HEIGHT - 200 + i * 50),
      color(25 + i * 15, 10 + i * 5, 40 + i * 10),
      z(-19 + i),
    ]);
  }

  // Lava floor with glow effect
  add([
    rect(LEVEL_WIDTH, 120),
    pos(0, GAME_HEIGHT - 120),
    color(255, 60, 0),
    z(-15),
  ]);

  // Lava glow
  add([
    rect(LEVEL_WIDTH, 40),
    pos(0, GAME_HEIGHT - 160),
    color(255, 120, 20, 0.7),
    z(-16),
  ]);
}

function createPlatforms() {
  const platformData = [
    { x: 150, y: 520, type: "start" },
    { x: 350, y: 450, type: "normal" },
    { x: 550, y: 380, type: "normal" },
    { x: 750, y: 320, type: "normal" },
    { x: 950, y: 450, type: "normal" },
    { x: 1200, y: 380, type: "normal" },
    { x: 1450, y: 320, type: "normal" },
    { x: 1700, y: 280, type: "normal" },
    { x: 1950, y: 450, type: "boss" },
    { x: 2200, y: 380, type: "end" },
  ];

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
      add([
        rect(120, 10),
        pos(data.x, data.y - 15),
        color(100, 200, 255, 0.6),
        z(5),
      ]);
    }
  });

  return platformData;
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
