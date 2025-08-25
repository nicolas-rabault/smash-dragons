/*
 * UI System - User interface elements, mobile controls, and displays
 * Handles score display, lives, mobile touch controls, and UI updates
 */

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

  // Get screen dimensions and calculate button properties
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
