/*
 * Character System - Player character management
 * Handles player creation, movement, combat, and state management
 */

// Character creation and management
function createPlayer() {
  const player = add([
    sprite("hero"),
    scale(0.5),
    pos(180, 400),
    // Custom collision area - smaller than full sprite for better gameplay
    // Original sprite: 94x106, scaled by 0.5 = 47x53
    // Custom area: centered, reduced size focusing on torso
    area({
      shape: new Rect(vec2(10, 0), 30, 106), // x_offset, y_offset, width, height
    }),
    body(),
    anchor("center"),
    {
      dir: 1,
      dead: false,
      canShoot: true,
      lastShotTime: 0,
      invulnerable: false,
      invulnerabilityTime: 0,
      currentPowerIndex: 0, // Index of currently selected power
      unlockedPowers: ["FIREBALL"], // Powers available to player
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

  // Shooting with current power
  onKeyPress("space", () => {
    console.log("Space pressed for shooting");
    if (!player.dead && player.canShoot) {
      playerShoot(player);
    }
  });

  onKeyPress("e", () => {
    console.log("E pressed for shooting");
    if (!player.dead && player.canShoot) {
      playerShoot(player);
    }
  });

  // Power cycling
  onKeyPress("c", () => {
    console.log("C pressed for power cycling");
    if (!player.dead) {
      cyclePower(player);
    }
  });

  onKeyPress("x", () => {
    console.log("X pressed for power cycling (alternative)");
    if (!player.dead) {
      cyclePower(player);
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

function playerDies(player) {
  try {
    if (player.dead) return;

    console.log("Player dies! Lives before:", gameState.lives);
    player.dead = true;
    gameState.lives--;
    updateLives();
    console.log("Lives after death:", gameState.lives);

    // Play death/respawn sound
    audioManager.playSFX("deathRespawn");

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

      // Choose respawn point based on game progress
      let respawnPos;
      if (gameState.playerInBossArea) {
        // Respawn near boss area if player has reached it
        const levelData = LEVEL_DATA[gameState.level];
        const endPlatform = levelData.platforms.find((p) => p.type === "end");
        respawnPos = endPlatform
          ? vec2(endPlatform.x - 150, endPlatform.y - 50)
          : vec2(1800, 400);
        console.log("Respawning in boss area");
      } else {
        // Respawn at start of level
        respawnPos = vec2(180, 400);
        console.log("Respawning at level start");
      }

      player.pos = respawnPos;
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

// Player shooting with current power
function playerShoot(player) {
  const availablePowers = PLAYER_PROGRESSION.getAvailablePowers();
  if (availablePowers.length === 0) {
    console.warn("No powers available to player");
    return;
  }

  const currentPower = availablePowers[player.currentPowerIndex];
  if (!currentPower) {
    console.warn("Invalid power index:", player.currentPowerIndex);
    return;
  }

  // Find the power type key that matches this id
  const powerTypeKey = Object.keys(POWER_TYPES).find(
    (key) => POWER_TYPES[key].id === currentPower.id
  );
  spawnPower(player, powerTypeKey);
}

// Cycle through available powers
function cyclePower(player) {
  const availablePowers = PLAYER_PROGRESSION.getAvailablePowers();
  if (availablePowers.length <= 1) {
    console.log("Only one power available, no cycling needed");
    return;
  }

  // Cycle to next power
  player.currentPowerIndex =
    (player.currentPowerIndex + 1) % availablePowers.length;
  const newPower = availablePowers[player.currentPowerIndex];

  // Show power change notification
  add([
    text(`Power: ${newPower.name}`, {
      size: 18,
      font: "sink",
    }),
    color(255, 255, 0),
    pos(GAME_WIDTH / 2, GAME_HEIGHT - 100),
    anchor("center"),
    fixed(),
    z(150),
    lifespan(2, { fade: 1 }),
  ]);

  console.log(`Power switched to: ${newPower.name}`);
}

// Update player's available powers (called when boss is defeated)
function updatePlayerPowers(player) {
  const availablePowers = PLAYER_PROGRESSION.getAvailablePowers();
  player.unlockedPowers = availablePowers.map((power) => power.id);

  // Keep current power index valid
  if (player.currentPowerIndex >= availablePowers.length) {
    player.currentPowerIndex = 0;
  }
}
