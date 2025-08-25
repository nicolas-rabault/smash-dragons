/*
 * Powers System - Fireball and Waterball projectiles
 * Handles projectile creation, movement, effects, and collisions
 */

// Global combat variables
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

function createFireballExplosion(x, y) {
  shake(15);

  // Main explosion burst - larger particles
  for (let i = 0; i < 40; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(200, 500);
    const vel = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);

    add([
      rect(rand(4, 12), rand(4, 12)),
      pos(x + rand(-5, 5), y + rand(-5, 5)),
      color(rand(200, 255), rand(100, 200), rand(0, 50)),
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

    add([
      rect(rand(1, 4), rand(1, 4)),
      pos(x, y),
      color(255, rand(200, 255), rand(100, 200)),
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

// Setup projectile collisions
function setupPowerCollisions(player) {
  // Waterball hits player
  onCollide("waterball", "player", (wb, player) => {
    destroy(wb);
    if (!player.invulnerable) {
      playerDies(player);
    }
  });

  // Fireball hits platform
  onCollide("fireball", "platform", (fb, platform) => {
    destroy(fb);
    // Create spectacular fireball explosion on platform
    createFireballExplosion(fb.pos.x, fb.pos.y);
  });

  // Waterball hits platform
  onCollide("waterball", "platform", (wb, platform) => {
    destroy(wb);
    // Create water splash effect on platform
    createExplosion(wb.pos.x, wb.pos.y, [100, 150, 255]);
  });
}
