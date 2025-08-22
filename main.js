/*
 * Enhanced Smash Dragons - A Kaboom.js Platformer
 *
 * Improved version with high-quality sprites, enhanced gameplay mechanics,
 * proper UI elements, scoring system, multiple levels, and polished graphics.
 */

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const LEVEL_WIDTH = 2400;
const GRAVITY = 1800;
const PLAYER_SPEED = 280;
const JUMP_FORCE = 750;
const WALL_JUMP_X = 450;
const FIRE_SPEED = 650;
const FIRE_RATE = 0.2;
const WATER_SPEED = 380;
const WATER_RATE = 1.2;
const BOSS_HITS_REQUIRED = 15;

// Game state
let gameState = {
  score: 0,
  lives: 3,
  level: 1,
  bossDefeated: false,
  gameStarted: false,
};

// Utility functions that need to be available globally
function addJumpEffect(pos) {
  for (let i = 0; i < 8; i++) {
    add([
      rect(rand(2, 4), rand(2, 4)),
      pos(pos.x + rand(-15, 15), pos.y + 20),
      color(200, 200, 255),
      move(vec2(rand(-50, 50), rand(-100, -50)), 1),
      lifespan(0.3, { fade: 0.2 }),
      z(5),
    ]);
  }
}

function createExplosion(x, y, explosionColor = [255, 150, 0]) {
  shake(10);

  for (let i = 0; i < 30; i++) {
    const vel = vec2(rand(-1, 1), rand(-1, 1)).unit().scale(rand(150, 350));
    add([
      rect(rand(3, 10), rand(3, 10)),
      pos(x, y),
      color(explosionColor[0], explosionColor[1], explosionColor[2]),
      move(vel, 1),
      lifespan(0.8, { fade: 0.6 }),
      z(15),
    ]);
  }
}

// Load assets from JSON
async function loadGameAssets() {
  try {
    const response = await fetch("./assets_data_uris.json");
    const assets = await response.json();

    // Load all sprites
    loadSprite("hero", assets.hero);
    loadSprite("dragon", assets.dragon);
    loadSprite("fireball", assets.fireball);
    loadSprite("waterball", assets.waterball);
    loadSprite("platform", assets.platform);

    // Load mobile control icons from the assets folder
    loadSprite("leftArrow", "./assets/left.png");
    loadSprite("rightArrow", "./assets/left.png"); // We'll flip this
    loadSprite("fireIcon", "./assets/fireball.png");
    loadSprite("jumpIcon", "./assets/hero.png"); // Use hero sprite for jump

    console.log("Assets loaded successfully");
  } catch (error) {
    console.error("Failed to load assets:", error);
    // Fallback to basic shapes if assets fail to load
    loadFallbackAssets();
  }
}

function loadFallbackAssets() {
  // Create simple colored rectangles as fallbacks
  loadSprite(
    "hero",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "dragon",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "fireball",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "waterball",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "platform",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );

  // Fallback mobile control icons (simple shapes)
  loadSprite(
    "leftArrow",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "rightArrow",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "fireIcon",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
  loadSprite(
    "jumpIcon",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg=="
  );
}

// Initialize Kaboom with responsive settings
window.addEventListener("load", async () => {
  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    if (isMobile) {
      // On mobile, use actual viewport dimensions for full scaling
      const scaleX = window.innerWidth / GAME_WIDTH;
      const scaleY = window.innerHeight / GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      return {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        scale: scale,
      };
    } else if (isTablet) {
      // On tablet, scale appropriately
      return {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        scale:
          Math.min(
            window.innerWidth / GAME_WIDTH,
            window.innerHeight / GAME_HEIGHT
          ) * 0.9,
      };
    } else {
      // On desktop, use fixed size
      return {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        scale: 1,
      };
    }
  };

  const dimensions = getResponsiveDimensions();
  console.log("Game dimensions:", dimensions);

  kaboom({
    root: document.getElementById("game-container"),
    width: dimensions.width,
    height: dimensions.height,
    scale: dimensions.scale,
    background: [10, 5, 25],
    touchToMouse: true,
    focus: true,
    stretch: true, // Allow stretching to fit container
    letterbox: true, // Maintain aspect ratio with black bars if needed
  });

  setGravity(GRAVITY);

  // Load assets
  await loadGameAssets();

  // Initialize all scenes first
  initializeScenes();

  // Start with main menu
  go("menu");

  // Handle window resize
  window.addEventListener("resize", () => {
    const newDimensions = getResponsiveDimensions();
    console.log("Window resized, new dimensions:", newDimensions);
    // Note: Kaboom doesn't support dynamic resize, but we log for debugging
  });

  // Ensure canvas has focus for keyboard input
  setTimeout(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.focus();
      canvas.setAttribute("tabindex", "0");
      console.log("Canvas focused for keyboard input");

      // Make canvas responsive
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.objectFit = "contain";
    }
  }, 100);
});

// Initialize all game scenes
function initializeScenes() {
  // Main Menu Scene
  scene("menu", () => {
    // Background gradient
    add([rect(GAME_WIDTH, GAME_HEIGHT), pos(0, 0), color(15, 10, 40), z(-10)]);

    // Title
    add([
      text("SMASH DRAGONS", {
        size: 48,
        font: "sink",
      }),
      color(255, 200, 50),
      pos(GAME_WIDTH / 2, 150),
      anchor("center"),
    ]);

    // Subtitle
    add([
      text("Enhanced Edition", {
        size: 24,
        font: "sink",
      }),
      color(200, 150, 255),
      pos(GAME_WIDTH / 2, 200),
      anchor("center"),
    ]);

    // Instructions
    const instructions = [
      "ARROW KEYS or Q/D - Move",
      "Z or UP - Jump",
      "SPACE or E - Shoot Fireballs",
      "Defeat the Dragon Boss!",
    ];

    instructions.forEach((line, i) => {
      add([
        text(line, {
          size: 16,
          font: "sink",
        }),
        color(255, 255, 255),
        pos(GAME_WIDTH / 2, 280 + i * 25),
        anchor("center"),
      ]);
    });

    // Create clickable start button
    const startButton = add([
      rect(200, 60),
      pos(GAME_WIDTH / 2, 420),
      anchor("center"),
      color(50, 150, 50),
      area(),
      "startButton",
      {
        isHovered: false,
      },
    ]);

    // Button text
    const buttonText = add([
      text("START GAME", {
        size: 20,
        font: "sink",
      }),
      pos(GAME_WIDTH / 2, 420),
      anchor("center"),
      color(255, 255, 255),
      z(10),
    ]);

    // Enhanced button interaction for mobile
    startButton.onUpdate(() => {
      const mouse = mousePos();
      const buttonWidth = 200;
      const buttonHeight = 60;
      const isHovering =
        mouse.x >= startButton.pos.x - buttonWidth / 2 &&
        mouse.x <= startButton.pos.x + buttonWidth / 2 &&
        mouse.y >= startButton.pos.y - buttonHeight / 2 &&
        mouse.y <= startButton.pos.y + buttonHeight / 2;

      if (isHovering && !startButton.isHovered) {
        startButton.isHovered = true;
        startButton.color = rgb(70, 200, 70);
        buttonText.color = rgb(255, 255, 255);
        document.body.style.cursor = "pointer";
      } else if (!isHovering && startButton.isHovered) {
        startButton.isHovered = false;
        startButton.color = rgb(50, 150, 50);
        buttonText.color = rgb(255, 255, 255);
        document.body.style.cursor = "default";
      }
    });

    // Enhanced click handler with better touch support
    startButton.onClick(() => {
      console.log("Start button clicked - starting game");
      gameState.gameStarted = true;
      go("game");
    });

    // Add touch events for mobile
    startButton.onMouseDown(() => {
      console.log("Start button pressed");
      startButton.color = rgb(30, 100, 30);
    });

    startButton.onMouseRelease(() => {
      console.log("Start button released");
      startButton.color = rgb(50, 150, 50);
    });

    // Keep keyboard support for accessibility
    onKeyPress("space", () => {
      console.log("Space pressed in menu - starting game");
      gameState.gameStarted = true;
      go("game");
    });

    onKeyPress("enter", () => {
      console.log("Enter pressed in menu - starting game");
      gameState.gameStarted = true;
      go("game");
    });

    // Add click to focus for better keyboard support
    onMousePress(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.focus();
      }
    });
  });

  // Game Over Scene
  scene("gameOver", () => {
    console.log("Game Over scene started");

    // Dark red background
    add([rect(GAME_WIDTH, GAME_HEIGHT), pos(0, 0), color(50, 0, 0), z(-10)]);

    // Game Over title
    add([
      text("GAME OVER", {
        size: 48,
        font: "sink",
      }),
      color(255, 0, 0),
      pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100),
      anchor("center"),
    ]);

    // Final Score
    add([
      text(`Final Score: ${gameState.score}`, {
        size: 24,
        font: "sink",
      }),
      color(255, 255, 255),
      pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50),
      anchor("center"),
    ]);

    // Restart button
    const restartButton = add([
      rect(180, 50),
      pos(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 20),
      anchor("center"),
      color(50, 150, 50),
      area(),
      "restartButton",
      {
        isHovered: false,
      },
    ]);

    const restartText = add([
      text("RESTART", {
        size: 18,
        font: "sink",
      }),
      pos(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 20),
      anchor("center"),
      color(255, 255, 255),
      z(10),
    ]);

    // Menu button
    const menuButton = add([
      rect(180, 50),
      pos(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 20),
      anchor("center"),
      color(150, 50, 50),
      area(),
      "menuButton",
      {
        isHovered: false,
      },
    ]);

    const menuText = add([
      text("MAIN MENU", {
        size: 18,
        font: "sink",
      }),
      pos(GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 20),
      anchor("center"),
      color(255, 255, 255),
      z(10),
    ]);

    // Button hover effects
    restartButton.onUpdate(() => {
      const mouse = mousePos();
      const isHovering =
        mouse.x >= restartButton.pos.x - 90 &&
        mouse.x <= restartButton.pos.x + 90 &&
        mouse.y >= restartButton.pos.y - 25 &&
        mouse.y <= restartButton.pos.y + 25;

      if (isHovering && !restartButton.isHovered) {
        restartButton.isHovered = true;
        restartButton.color = rgb(70, 200, 70);
        document.body.style.cursor = "pointer";
      } else if (!isHovering && restartButton.isHovered) {
        restartButton.isHovered = false;
        restartButton.color = rgb(50, 150, 50);
        document.body.style.cursor = "default";
      }
    });

    menuButton.onUpdate(() => {
      const mouse = mousePos();
      const isHovering =
        mouse.x >= menuButton.pos.x - 90 &&
        mouse.x <= menuButton.pos.x + 90 &&
        mouse.y >= menuButton.pos.y - 25 &&
        mouse.y <= menuButton.pos.y + 25;

      if (isHovering && !menuButton.isHovered) {
        menuButton.isHovered = true;
        menuButton.color = rgb(200, 70, 70);
        document.body.style.cursor = "pointer";
      } else if (!isHovering && menuButton.isHovered) {
        menuButton.isHovered = false;
        menuButton.color = rgb(150, 50, 50);
        document.body.style.cursor = "default";
      }
    });

    // Button click handlers
    restartButton.onClick(() => {
      console.log("Restart button clicked");
      gameState = {
        score: 0,
        lives: 3,
        level: 1,
        bossDefeated: false,
        gameStarted: true,
      };
      go("game");
    });

    menuButton.onClick(() => {
      console.log("Menu button clicked");
      gameState = {
        score: 0,
        lives: 3,
        level: 1,
        bossDefeated: false,
        gameStarted: false,
      };
      go("menu");
    });

    // Keep keyboard support for accessibility
    onKeyPress("space", () => {
      console.log("Restarting game from game over");
      gameState = {
        score: 0,
        lives: 3,
        level: 1,
        bossDefeated: false,
        gameStarted: true,
      };
      go("game");
    });

    onKeyPress("enter", () => {
      console.log("Returning to menu from game over");
      gameState = {
        score: 0,
        lives: 3,
        level: 1,
        bossDefeated: false,
        gameStarted: false,
      };
      go("menu");
    });

    // Focus canvas for input
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.focus();
    }
  });

  // Main Game Scene
  scene("game", () => {
    // Enhanced background with multiple layers
    createBackground();

    // Create platforms with better positioning
    const platforms = createPlatforms();

    // Create player
    const player = createPlayer();

    // Create boss
    const boss = createBoss();

    // Create UI
    createUI();

    // Game mechanics
    setupPlayerMovement(player);
    setupCombat(player, boss);
    setupCollisions(player);
    setupCamera(player);

    // Mobile controls
    setupMobileControls(player);
  });
}

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

function createPlayer() {
  const player = add([
    sprite("hero"),
    scale(0.5),
    pos(180, 400),
    area(),
    body(),
    anchor("center"),
    {
      dir: 1,
      dead: false,
      canShoot: true,
      lastShotTime: 0,
      invulnerable: false,
      invulnerabilityTime: 0,
    },
    "player",
  ]);

  // Debug player creation
  console.log("Player created:", player);
  console.log("Player has jump method:", typeof player.jump === "function");
  console.log(
    "Player has isGrounded method:",
    typeof player.isGrounded === "function"
  );

  return player;
}

function createBoss() {
  const boss = add([
    sprite("dragon"),
    scale(0.6),
    pos(1950, 200),
    area(),
    anchor("center"),
    {
      hp: BOSS_HITS_REQUIRED,
      maxHp: BOSS_HITS_REQUIRED,
      speed: 100,
      lastShotTime: 0,
      phase: 1,
    },
    "boss",
  ]);

  // Boss health bar
  const bossHealthBg = add([
    rect(200, 20),
    pos(GAME_WIDTH / 2 - 100, 50),
    color(100, 0, 0),
    fixed(),
    z(100),
    "bossHealthBg",
  ]);

  const bossHealth = add([
    rect(200, 20),
    pos(GAME_WIDTH / 2 - 100, 50),
    color(255, 0, 0),
    fixed(),
    z(101),
    "bossHealth",
  ]);

  // Boss AI
  boss.onUpdate(() => {
    if (!boss.exists()) return;

    // Move boss
    boss.move(boss.speed, 0);
    if (boss.pos.x < 1800) {
      boss.speed = Math.abs(boss.speed);
    } else if (boss.pos.x > 2100) {
      boss.speed = -Math.abs(boss.speed);
    }

    // Update boss health bar
    const healthPercent = boss.hp / boss.maxHp;
    if (get("bossHealth")[0]) {
      get("bossHealth")[0].width = 200 * healthPercent;
    }

    // Boss shooting
    if (time() - boss.lastShotTime > WATER_RATE) {
      spawnWaterball(boss);
      boss.lastShotTime = time();
    }
  });

  return boss;
}

function createUI() {
  // Score display
  add([
    text(`Score: ${gameState.score}`, {
      size: 20,
      font: "sink",
    }),
    color(255, 255, 255),
    pos(20, 20),
    fixed(),
    z(100),
    "scoreText",
  ]);

  // Lives display
  add([
    text(`Lives: ${gameState.lives}`, {
      size: 20,
      font: "sink",
    }),
    color(255, 255, 255),
    pos(20, 50),
    fixed(),
    z(100),
    "livesText",
  ]);

  // Level display
  add([
    text(`Level: ${gameState.level}`, {
      size: 20,
      font: "sink",
    }),
    color(255, 255, 255),
    pos(20, 80),
    fixed(),
    z(100),
    "levelText",
  ]);
}

function updateScore(points) {
  gameState.score += points;
  if (get("scoreText")[0]) {
    get("scoreText")[0].text = `Score: ${gameState.score}`;
  }
}

function updateLives() {
  if (get("livesText")[0]) {
    get("livesText")[0].text = `Lives: ${gameState.lives}`;
  }
}

function setupPlayerMovement(player) {
  // Debug keyboard events
  console.log("Setting up player movement controls");

  // Keyboard controls with better key handling
  onKeyDown("q", () => {
    console.log("Q key pressed");
    if (!player.dead) {
      player.move(-PLAYER_SPEED, 0);
      player.dir = -1;
      player.scale.x = -Math.abs(player.scale.x);
    }
  });

  onKeyDown("left", () => {
    console.log("Left arrow pressed");
    if (!player.dead) {
      player.move(-PLAYER_SPEED, 0);
      player.dir = -1;
      player.scale.x = -Math.abs(player.scale.x);
    }
  });

  onKeyDown("d", () => {
    console.log("D key pressed");
    if (!player.dead) {
      player.move(PLAYER_SPEED, 0);
      player.dir = 1;
      player.scale.x = Math.abs(player.scale.x);
    }
  });

  onKeyDown("right", () => {
    console.log("Right arrow pressed");
    if (!player.dead) {
      player.move(PLAYER_SPEED, 0);
      player.dir = 1;
      player.scale.x = Math.abs(player.scale.x);
    }
  });

  // Jump mechanics
  onKeyPress("z", () => {
    console.log("Z key pressed for jump");
    try {
      if (player.dead) return;

      if (player.isGrounded()) {
        console.log("Player is grounded, jumping");
        player.jump(JUMP_FORCE);
        addJumpEffect(player.pos);
      } else if (isKeyDown("q") || isKeyDown("left")) {
        console.log("Wall jump left");
        player.vel.x = -WALL_JUMP_X;
        player.vel.y = -JUMP_FORCE;
        addJumpEffect(player.pos);
      } else if (isKeyDown("d") || isKeyDown("right")) {
        console.log("Wall jump right");
        player.vel.x = WALL_JUMP_X;
        player.vel.y = -JUMP_FORCE;
        addJumpEffect(player.pos);
      }
    } catch (error) {
      console.error("Error in Z jump:", error);
    }
  });

  onKeyPress("up", () => {
    console.log("Up arrow pressed for jump");
    try {
      if (player.dead) return;

      if (player.isGrounded()) {
        console.log("Player is grounded, jumping with up arrow");
        player.jump(JUMP_FORCE);
        addJumpEffect(player.pos);
      }
    } catch (error) {
      console.error("Error in Up jump:", error);
    }
  });

  // Shooting
  onKeyPress("space", () => {
    console.log("Space pressed for shooting");
    if (!player.dead && player.canShoot) {
      spawnFireball(player);
    }
  });

  onKeyPress("e", () => {
    console.log("E pressed for shooting");
    if (!player.dead && player.canShoot) {
      spawnFireball(player);
    }
  });

  // Player update loop
  player.onUpdate(() => {
    // Handle invulnerability
    if (player.invulnerable) {
      player.opacity = Math.sin(time() * 30) * 0.5 + 0.5;
      if (time() - player.invulnerabilityTime > 2) {
        player.invulnerable = false;
        player.opacity = 1;
      }
    }

    // Death check (fell into lava)
    if (player.pos.y > GAME_HEIGHT + 50) {
      playerDies(player);
    }
  });
}

// Global combat functions
let nextFireTime = 0;

function spawnFireball(player) {
  if (time() < nextFireTime) return;
  nextFireTime = time() + FIRE_RATE;

  const dirVec = vec2(player.dir, -0.1).unit();
  const fb = add([
    sprite("fireball"),
    pos(player.pos.add(vec2(player.dir * 30, -10))),
    scale(0.4),
    area(),
    move(dirVec, FIRE_SPEED),
    offscreen({ destroy: true }),
    "fireball",
  ]);

  // Enhanced fire particle trail
  const trailTimer = loop(0.03, () => {
    if (!fb.exists()) {
      trailTimer.cancel();
      return;
    }

    add([
      rect(rand(3, 8), rand(3, 8)),
      pos(fb.pos.x + rand(-5, 5), fb.pos.y + rand(-5, 5)),
      color(255, rand(150, 255), rand(0, 100)),
      lifespan(0.4, { fade: 0.3 }),
      z(8),
    ]);
  });

  fb.onDestroy(() => trailTimer.cancel());
}

function spawnWaterball(boss) {
  const player = get("player")[0];
  if (!player || !player.exists()) return;

  const direction = player.pos.sub(boss.pos).unit();
  const wb = add([
    sprite("waterball"),
    pos(boss.pos.add(vec2(-30, 10))),
    scale(0.4),
    area(),
    move(direction, WATER_SPEED),
    offscreen({ destroy: true }),
    "waterball",
  ]);

  // Water particle trail
  const trailTimer = loop(0.04, () => {
    if (!wb.exists()) {
      trailTimer.cancel();
      return;
    }

    add([
      rect(rand(2, 6), rand(2, 6)),
      pos(wb.pos.x + rand(-3, 3), wb.pos.y + rand(-3, 3)),
      color(rand(0, 100), rand(150, 255), 255),
      lifespan(0.5, { fade: 0.4 }),
      z(8),
    ]);
  });

  wb.onDestroy(() => trailTimer.cancel());
}

function setupCombat(player, boss) {
  // Combat setup is now handled by the global functions above
}

function setupCollisions(player) {
  // Fireball hits boss
  onCollide("fireball", "boss", (fb, boss) => {
    destroy(fb);
    boss.hp--;
    updateScore(100);

    // Create hit effect
    createExplosion(fb.pos.x, fb.pos.y, [255, 100, 0]);
    shake(8);

    if (boss.hp <= 0) {
      killBoss(boss);
    }
  });

  // Waterball hits player
  onCollide("waterball", "player", (wb, player) => {
    destroy(wb);
    if (!player.invulnerable) {
      playerDies(player);
    }
  });
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

function setupMobileControls(player) {
  // Detect if device is mobile/tablet
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768;

  console.log("Is mobile device:", isMobile);
  console.log("Window dimensions:", window.innerWidth, "x", window.innerHeight);

  // Only setup mobile controls on actual mobile devices
  if (!isMobile) {
    console.log("Desktop detected - skipping mobile controls");
    return;
  }

  let mobile = { left: false, right: false, jump: false, fire: false };
  let pointerDown = false;

  function updateMobileInput(pos) {
    const x = pos.x;
    const y = pos.y;
    const bottom = screenHeight - buttonSize * 2;

    // Use the actual button positions for touch detection
    mobile.left =
      x < buttonSpacing * 2 + buttonSize && x > buttonSpacing && y > bottom;
    mobile.right =
      x >= buttonSpacing * 2 + buttonSize &&
      x < buttonSpacing * 3 + buttonSize * 2 &&
      y > bottom;
    mobile.jump =
      x >= screenWidth - buttonSpacing * 2 - buttonSize * 2 &&
      x < screenWidth - buttonSpacing * 2 - buttonSize &&
      y > bottom;
    mobile.fire = x >= screenWidth - buttonSpacing - buttonSize && y > bottom;
  }

  onMouseDown(() => {
    pointerDown = true;
    updateMobileInput(mousePos());
  });

  onMouseMove(() => {
    if (pointerDown) updateMobileInput(mousePos());
  });

  onMouseRelease(() => {
    pointerDown = false;
    Object.keys(mobile).forEach((key) => (mobile[key] = false));
  });

  onTouchStart(() => {
    pointerDown = true;
    updateMobileInput(mousePos());
  });

  onTouchMove(() => {
    if (pointerDown) updateMobileInput(mousePos());
  });

  onTouchEnd(() => {
    pointerDown = false;
    Object.keys(mobile).forEach((key) => (mobile[key] = false));
  });

  onUpdate(() => {
    if (player.dead) return;

    if (mobile.left) {
      player.move(-PLAYER_SPEED, 0);
      player.dir = -1;
      player.scale.x = -Math.abs(player.scale.x);
    } else if (mobile.right) {
      player.move(PLAYER_SPEED, 0);
      player.dir = 1;
      player.scale.x = Math.abs(player.scale.x);
    }

    if (mobile.jump && player.isGrounded()) {
      try {
        player.jump(JUMP_FORCE);
        addJumpEffect(player.pos);
      } catch (error) {
        console.error("Error in mobile jump:", error);
      }
    }

    if (mobile.fire && player.canShoot) {
      spawnFireball(player);
    }
  });

  // Create mobile control buttons with proper sizing
  const screenWidth = width();
  const screenHeight = height();
  const isPortrait = screenHeight > screenWidth;

  // Smaller buttons that don't interfere with gameplay
  const buttonSize = isPortrait
    ? Math.min(screenWidth * 0.08, 60) // Portrait: 8% of width, max 60px
    : Math.min(screenWidth * 0.06, 50); // Landscape: 6% of width, max 50px

  const buttonSpacing = Math.min(screenWidth * 0.015, 12); // Smaller spacing
  const bottomMargin = isPortrait
    ? Math.min(screenHeight * 0.03, 25) // Portrait: 3% margin
    : Math.min(screenHeight * 0.05, 30); // Landscape: 5% margin

  console.log("Mobile controls sizing:", {
    screenWidth,
    screenHeight,
    isPortrait,
    buttonSize,
    buttonSpacing,
    bottomMargin,
  });

  // Left arrow button
  const leftBtn = add([
    rect(buttonSize, buttonSize),
    pos(buttonSpacing, screenHeight - buttonSize - bottomMargin),
    color(0, 0, 0, 0.3),
    outline(2, rgb(255, 255, 255, 0.6)),
    area(),
    fixed(),
    z(110),
    "mobileControl",
    "leftBtn",
  ]);

  add([
    sprite("leftArrow"),
    pos(
      buttonSpacing + buttonSize / 2,
      screenHeight - buttonSize / 2 - bottomMargin
    ),
    scale(buttonSize * 0.012),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(111),
    "mobileControl",
  ]);

  // Right arrow button
  const rightBtn = add([
    rect(buttonSize, buttonSize),
    pos(
      buttonSpacing * 2 + buttonSize,
      screenHeight - buttonSize - bottomMargin
    ),
    color(0, 0, 0, 0.3),
    outline(2, rgb(255, 255, 255, 0.6)),
    area(),
    fixed(),
    z(110),
    "mobileControl",
    "rightBtn",
  ]);

  add([
    sprite("leftArrow"),
    pos(
      buttonSpacing * 2 + buttonSize + buttonSize / 2,
      screenHeight - buttonSize / 2 - bottomMargin
    ),
    scale(-buttonSize * 0.012, buttonSize * 0.012), // Flip horizontally for right arrow
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(111),
    "mobileControl",
  ]);

  // Jump button
  const jumpBtn = add([
    rect(buttonSize, buttonSize),
    pos(
      screenWidth - buttonSpacing * 2 - buttonSize * 2,
      screenHeight - buttonSize - bottomMargin
    ),
    color(0, 0, 0, 0.3),
    outline(2, rgb(255, 255, 255, 0.6)),
    area(),
    fixed(),
    z(110),
    "mobileControl",
    "jumpBtn",
  ]);

  add([
    sprite("jumpIcon"),
    pos(
      screenWidth - buttonSpacing * 2 - buttonSize * 2 + buttonSize / 2,
      screenHeight - buttonSize / 2 - bottomMargin
    ),
    scale(buttonSize * 0.01),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(111),
    "mobileControl",
  ]);

  // Fire button
  const fireBtn = add([
    rect(buttonSize, buttonSize),
    pos(
      screenWidth - buttonSpacing - buttonSize,
      screenHeight - buttonSize - bottomMargin
    ),
    color(0, 0, 0, 0.3),
    outline(2, rgb(255, 255, 255, 0.6)),
    area(),
    fixed(),
    z(110),
    "mobileControl",
    "fireBtn",
  ]);

  add([
    sprite("fireIcon"),
    pos(
      screenWidth - buttonSpacing - buttonSize / 2,
      screenHeight - buttonSize / 2 - bottomMargin
    ),
    scale(buttonSize * 0.011),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(111),
    "mobileControl",
  ]);

  // Enhanced touch detection with press/release for movement buttons
  leftBtn.onMouseDown(() => {
    console.log("Left button pressed");
    mobile.left = true;
  });

  leftBtn.onMouseRelease(() => {
    console.log("Left button released");
    mobile.left = false;
  });

  rightBtn.onMouseDown(() => {
    console.log("Right button pressed");
    mobile.right = true;
  });

  rightBtn.onMouseRelease(() => {
    console.log("Right button released");
    mobile.right = false;
  });

  // Jump and fire use click events (one-time actions)
  jumpBtn.onClick(() => {
    console.log("Jump button clicked");
    if (player.isGrounded()) {
      try {
        player.jump(JUMP_FORCE);
        addJumpEffect(player.pos);
      } catch (error) {
        console.error("Error in mobile jump:", error);
      }
    }
  });

  fireBtn.onClick(() => {
    console.log("Fire button clicked");
    if (player.canShoot) {
      spawnFireball(player);
    }
  });

  // Add visual feedback for button presses
  leftBtn.onUpdate(() => {
    leftBtn.color = mobile.left ? rgb(100, 100, 100, 0.6) : rgb(0, 0, 0, 0.3);
  });

  rightBtn.onUpdate(() => {
    rightBtn.color = mobile.right ? rgb(100, 100, 100, 0.6) : rgb(0, 0, 0, 0.3);
  });
}

function playerDies(player) {
  try {
    if (player.dead) return;

    console.log("Player dies! Lives before:", gameState.lives);
    player.dead = true;
    gameState.lives--;
    updateLives();
    console.log("Lives after death:", gameState.lives);

    createExplosion(player.pos.x, player.pos.y, [255, 0, 0]);

    // Clear projectiles safely
    try {
      get("fireball").forEach((fb) => destroy(fb));
      get("waterball").forEach((wb) => destroy(wb));
      console.log("Projectiles cleared successfully");
    } catch (error) {
      console.error("Error clearing projectiles:", error);
    }

    // Respawn or game over
    if (gameState.lives > 0) {
      console.log("Player has lives left, respawning...");
      player.opacity = 0;
      player.pos = vec2(180, 400);
      player.vel = vec2(0, 0);

      wait(2, () => {
        try {
          player.opacity = 1;
          player.dead = false;
          player.invulnerable = true;
          player.invulnerabilityTime = time();
          console.log("Player respawned");
        } catch (error) {
          console.error("Error during respawn:", error);
        }
      });
    } else {
      console.log("No lives left - going to game over screen");
      wait(2, () => {
        try {
          console.log("Transitioning to gameOver scene");
          go("gameOver");
        } catch (error) {
          console.error("Error transitioning to game over:", error);
          // Force game over if normal transition fails
          window.location.reload();
        }
      });
    }
  } catch (error) {
    console.error("Critical error in playerDies:", error);
    // Force game over screen on any critical error
    console.log("Force transitioning to game over due to error");
    go("gameOver");
  }
}

function killBoss(boss) {
  gameState.bossDefeated = true;
  updateScore(1000);

  createExplosion(boss.pos.x, boss.pos.y, [255, 0, 255]);
  destroy(boss);

  // Remove boss health bar safely
  try {
    get("bossHealthBg").forEach((bg) => destroy(bg));
    get("bossHealth").forEach((health) => destroy(health));
    console.log("Boss health bar removed successfully");
  } catch (error) {
    console.error("Error removing boss health bar:", error);
  }

  // Victory message
  add([
    text("DRAGON DEFEATED!", {
      size: 36,
      font: "sink",
    }),
    color(255, 255, 0),
    pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50),
    anchor("center"),
    fixed(),
    z(200),
  ]);

  add([
    text("Press SPACE for next level", {
      size: 20,
      font: "sink",
    }),
    color(255, 255, 255),
    pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
    anchor("center"),
    fixed(),
    z(200),
  ]);

  onKeyPress("space", () => {
    gameState.level++;
    gameState.bossDefeated = false;
    go("game");
  });
}
