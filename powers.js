/*
 * Powers System - Unified power/projectile system
 * Handles all power types: player powers and boss abilities
 */

// Power timing management
const powerCooldowns = new Map();

// Unified power spawning system
function spawnPower(caster, powerType, targetPos = null) {
  const powerData = POWER_TYPES[powerType];
  if (!powerData) {
    console.error(`Unknown power type: ${powerType}`);
    return;
  }

  // Check cooldown - use a simpler key for players
  const isPlayer = caster.is && caster.is("player");
  const cooldownKey = isPlayer
    ? `player_${powerType}`
    : `${caster.id || "unknown"}_${powerType}`;
  const lastUseTime = powerCooldowns.get(cooldownKey) || 0;
  if (time() - lastUseTime < powerData.cooldown) {
    return;
  }
  powerCooldowns.set(cooldownKey, time());

  // Calculate direction and position
  let direction, spawnPos;

  if (isPlayer) {
    // Player projectile
    direction = vec2(caster.dir, -0.1).unit();
    spawnPos = caster.pos.add(vec2(caster.dir * 30, -10));
  } else {
    // Boss/enemy projectile
    const player = get("player")[0];
    if (!player || !player.exists()) return;

    direction = targetPos
      ? targetPos.sub(caster.pos).unit()
      : player.pos.sub(caster.pos).unit();
    spawnPos = caster.pos.add(vec2(-30, 10));
  }

  // Create projectile
  const projectile = add([
    sprite(powerData.sprite),
    pos(spawnPos),
    scale(0.4),
    area(),
    move(direction, powerData.speed),
    offscreen({ destroy: true }),
    powerData.id,
    {
      powerType: powerType,
      damage: powerData.damage,
      casterType: isPlayer ? "player" : "boss",
    },
  ]);

  // Create particle trail
  createPowerTrail(projectile, powerData);

  return projectile;
}

// Legacy functions for backward compatibility
function spawnFireball(player) {
  return spawnPower(player, "FIREBALL");
}

function spawnWaterball(boss) {
  return spawnPower(boss, "WATERBALL");
}

// Create particle trail for any power type
function createPowerTrail(projectile, powerData) {
  const trailTimer = loop(0.03, () => {
    if (!projectile.exists()) {
      trailTimer.cancel();
      return;
    }

    const colors = powerData.trailColors;
    add([
      rect(rand(2, 8), rand(2, 8)),
      pos(projectile.pos.x + rand(-5, 5), projectile.pos.y + rand(-5, 5)),
      color(colors[0], colors[1], colors[2], colors[3] || 255),
      lifespan(0.4, { fade: 0.3 }),
      z(8),
    ]);
  });

  projectile.onDestroy(() => trailTimer.cancel());
}

// Unified explosion system for all power types
function createPowerExplosion(x, y, powerType = "FIREBALL") {
  const powerData = POWER_TYPES[powerType];
  const colors = powerData
    ? powerData.effectColors
    : [
        [255, 150, 0],
        [255, 100, 0],
      ];

  // Play explosion sound if available
  if (powerData && powerData.sound && typeof audioManager !== 'undefined') {
    audioManager.playSFX(powerData.sound);
  }

  shake(15);

  // Main explosion burst - larger particles
  for (let i = 0; i < 40; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(200, 500);
    const vel = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    const color1 = colors[0];
    const color2 = colors[1] || colors[0];

    add([
      rect(rand(4, 12), rand(4, 12)),
      pos(x + rand(-5, 5), y + rand(-5, 5)),
      color(
        rand(color1[0] - 50, color1[0]),
        rand(color2[1] - 50, color2[1]),
        rand(color1[2], color2[2])
      ),
      move(vel, 1),
      lifespan(rand(0.6, 1.2), { fade: 0.8 }),
      z(16),
    ]);
  }

  // Secondary sparks - smaller, faster particles
  for (let i = 0; i < 25; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(300, 700);
    const vel = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    const sparkColor = colors[0];

    add([
      rect(rand(1, 4), rand(1, 4)),
      pos(x, y),
      color(sparkColor[0], sparkColor[1], sparkColor[2]),
      move(vel, 1),
      lifespan(rand(0.3, 0.8), { fade: 0.5 }),
      z(17),
    ]);
  }

  // Smoke particles - gray/white, slower, upward movement
  for (let i = 0; i < 15; i++) {
    const vel = vec2(rand(-50, 50), rand(-150, -50));
    const grayValue = rand(100, 200);

    add([
      rect(rand(6, 15), rand(6, 15)),
      pos(x + rand(-10, 10), y + rand(-10, 10)),
      color(grayValue, grayValue, grayValue, 0.7),
      move(vel, 1),
      lifespan(rand(1.0, 2.0), { fade: 1.5 }),
      z(14),
    ]);
  }

  // Central flash - bright white core
  add([
    rect(20, 20),
    pos(x, y),
    anchor("center"),
    color(255, 255, 255),
    lifespan(0.1, { fade: 0.05 }),
    z(18),
  ]);
}

// Legacy function for backward compatibility
function createFireballExplosion(x, y) {
  createPowerExplosion(x, y, "FIREBALL");
}

// Setup unified power collision system
function setupPowerCollisions(player) {
  // Set up collisions for all power types
  Object.keys(POWER_TYPES).forEach((powerKey) => {
    const powerData = POWER_TYPES[powerKey];

    // Power hits player (boss powers only)
    onCollide(powerData.id, "player", (projectile, player) => {
      if (projectile.casterType === "boss" && !player.invulnerable) {
        destroy(projectile);
        createPowerExplosion(projectile.pos.x, projectile.pos.y, powerKey);
        playerDies(player);
      }
    });

    // Power hits boss (player powers only)
    onCollide(powerData.id, "boss", (projectile, boss) => {
      if (projectile.casterType === "player") {
        destroy(projectile);
        boss.hp -= projectile.damage;
        updateScore(100 * projectile.damage);
        createPowerExplosion(projectile.pos.x, projectile.pos.y, powerKey);

        if (boss.hp <= 0) {
          onBossDefeated(boss, powerKey);
        }
      }
    });

    // Power hits platform
    onCollide(powerData.id, "platform", (projectile, platform) => {
      destroy(projectile);
      createPowerExplosion(projectile.pos.x, projectile.pos.y, powerKey);
    });
  });
}

// Handle boss defeat and power inheritance
function onBossDefeated(boss, defeatingPowerType) {
  const levelData = LEVEL_DATA[gameState.level];
  const bossData = BOSS_TYPES[levelData.boss];

  // Grant the boss's power to the player
  if (bossData.rewardPower) {
    PLAYER_PROGRESSION.unlockPower(bossData.rewardPower);

    // Show power acquisition message
    add([
      text(`NEW POWER ACQUIRED: ${POWER_TYPES[bossData.rewardPower].name}!`, {
        size: 24,
        font: "sink",
      }),
      color(255, 255, 0),
      pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50),
      anchor("center"),
      fixed(),
      z(201),
      lifespan(3, { fade: 1 }),
    ]);
  }

  // Update player powers and UI
  const player = get("player")[0];
  if (player) {
    updatePlayerPowers(player);
    updateCurrentPowerDisplay(player);
  }

  // Call the original boss defeat function
  killBoss(boss);
}
