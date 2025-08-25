/*
 * Boss System - Dragon boss management
 * Handles boss creation, AI behavior, health system, and defeat mechanics
 */

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

function killBoss(boss) {
  gameState.bossDefeated = true;
  updateScore(1000);

  // Play victory fanfare
  audioManager.playSFX("victoryFanfare");

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

// Boss collision setup
function setupBossCollisions() {
  // Fireball hits boss
  onCollide("fireball", "boss", (fb, boss) => {
    destroy(fb);
    boss.hp--;
    updateScore(100);

    // Create spectacular fireball explosion on boss
    createFireballExplosion(fb.pos.x, fb.pos.y);

    if (boss.hp <= 0) {
      killBoss(boss);
    }
  });
}
