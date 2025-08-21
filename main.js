/*
 * Kaboom‑powered pixel art platformer.
 *
 * This implementation uses the Kaboom.js library to build a fast
 * side‑scrolling platformer with bright, cartoon pixel art.  The
 * player can move left and right, jump, wall jump and shoot
 * fireballs.  A water dragon boss patrols the far end of the
 * level and shoots waterballs at the player.  When the player
 * falls into the lava or is hit by an enemy projectile they
 * explode and respawn after a brief delay.  Particle effects
 * and screen shake enhance the feeling of power.  On mobile
 * devices on‑screen touch controls allow for the same actions
 * available via the keyboard on desktop (AZERTY layout).
 */

// Dimensions and game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const LEVEL_WIDTH = 2000;
const GRAVITY = 1800;
const PLAYER_SPEED = 260;
const JUMP_FORCE = 700;
const WALL_JUMP_X = 450;
const FIRE_SPEED = 600;
const FIRE_RATE = 0.25;        // seconds between fireball shots
const WATER_SPEED = 320;
const WATER_RATE = 1.6;        // seconds between boss shots
const BOSS_HITS_REQUIRED = 10;

// Load external sprite images.  When serving via HTTP the
// relative paths will resolve to the assets folder.  Note that
// loading files from the local filesystem (file://) is blocked
// by the browser, so run a local server (e.g. python -m
// http.server) to serve this game.

// Entry point: wait for DOM ready before bootstrapping Kaboom
window.addEventListener('load', () => {
  // Initialize Kaboom.  We let Kaboom create its own canvas and
  // append it to the game container.  The clear color sets the
  // background of the canvas to black.
  kaboom({
    root: document.getElementById('game-container'),
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: 1,
    background: [0, 0, 0, 1],
    canvas: undefined,
    // Convert touch events to mouse events automatically so
    // onMouseDown handlers fire on mobile devices.
    touchToMouse: true,
  });

  // Set global gravity for physics bodies
  setGravity(GRAVITY);

  // Load all sprites from the embedded Data URIs defined in
  // assets_data_uris.js.  These URIs are attached to window as
  // heroDataURI, dragonDataURI, platformDataURI, fireballDataURI
  // and waterballDataURI.  Using Data URIs avoids the browser
  // restrictions on file:// loading and allows the game to run
  // from a local file without a web server.
  loadSprite('hero', heroDataURI);
  loadSprite('dragon', dragonDataURI);
  loadSprite('fireball', fireballDataURI);
  loadSprite('waterball', waterballDataURI);
  loadSprite('platform', platformDataURI);

  // Immediately start the game scene.  Kaboom will
  // automatically wait until assets are ready before
  // rendering the scene.
  startGame();
});

// Main game logic encapsulated in a function to avoid
// polluting the global scope.  Called after assets load.
function startGame() {
  // Scene definition.  We use a single scene for the entire
  // level.  Kaboom automatically clears and resets state when
  // changing scenes, but here there is only one.
  scene('main', () => {
    // Draw a dark cavern background and a glowing lava floor.  The
    // cavern colour fills the entire level behind everything.  The
    // lava is a bright strip along the bottom of the screen to
    // indicate danger.  Negative z values ensure these shapes
    // appear behind all other game objects.
    add([
      rect(LEVEL_WIDTH, GAME_HEIGHT),
      pos(0, 0),
      color(25, 5, 40),
      z(-20),
    ]);
    add([
      rect(LEVEL_WIDTH, 150),
      pos(0, GAME_HEIGHT - 150),
      color(255, 80, 0),
      z(-19),
    ]);

    // Array describing where to place each floating platform.
    const platformPositions = [
      { x: 200, y: 520 },
      { x: 400, y: 420 },
      { x: 650, y: 320 },
      { x: 900, y: 470 },
      { x: 1150, y: 370 },
      { x: 1400, y: 270 },
      { x: 1600, y: 470 },
      { x: 1800, y: 370 },
    ];
    platformPositions.forEach(posData => {
      add([
        sprite('platform'),
        pos(posData.x, posData.y),
        area(),
        body({ isStatic: true }),
        'platform',
      ]);
    });

    // Create the player character.  We attach custom state
    // properties for direction and dead status.  The origin is
    // centred so that flipping horizontally doesn’t distort the
    // position when scaling negative on the x axis.
    const player = add([
      sprite('hero'),
      scale(0.4),
      pos(100, 400),
      area(),
      body(),
      // Use anchor instead of origin (renamed in Kaboom v3000)
      anchor('center'),
      {
        dir: 1,
        dead: false,
      },
      'player',
    ]);

    // The boss enemy.  We give it a hit counter and a horizontal
    // speed.  No body component is added so gravity doesn’t
    // affect it; instead we move it manually.  Assigning a tag
    // 'boss' allows us to reference it in collisions.
    const boss = add([
      sprite('dragon'),
      scale(0.5),
      pos(1700, 220),
      area(),
      { hp: BOSS_HITS_REQUIRED, speed: 80 },
      'boss',
    ]);

    // Timer for boss attacks.  Kaboom’s loop() will repeatedly
    // execute the callback every WATER_RATE seconds.
    loop(WATER_RATE, () => {
      if (!boss.exists()) return;
      spawnWaterball();
    });

    // Move the boss back and forth between two x positions
    boss.onUpdate(() => {
      boss.move(boss.speed, 0);
      if (boss.pos.x < 1600) {
        boss.speed = Math.abs(boss.speed);
      } else if (boss.pos.x > 1850) {
        boss.speed = -Math.abs(boss.speed);
      }
    });

    // Groups to manage projectiles.  Tags on the game objects
    // provide categorisation for collisions.
    // Player fireballs will carry tag 'fireball' and enemy
    // projectiles tag 'waterball'.

    // Helper variables for firing rate limiting
    let nextFireTime = 0;

    /**
     * Spawn a fireball in front of the player.  The projectile
     * moves horizontally with a slight upward bias.  Each
     * fireball is given the tag 'fireball' for collision
     * detection.
     */
    function spawnFireball() {
      if (time() < nextFireTime) return;
      nextFireTime = time() + FIRE_RATE;
      const dirVec = vec2(player.dir, -0.2).unit();
      const fb = add([
        sprite('fireball'),
        pos(player.pos.add(vec2(player.dir * 40, -10))),
        scale(0.3),
        area(),
        move(dirVec, FIRE_SPEED),
        offscreen({ destroy: true }),
        'fireball',
      ]);
      // Add a simple particle tail using random coloured rects
      const tailTimer = loop(0.05, () => {
        add([
          rect(rand(2, 5), rand(2, 5)),
          pos(fb.pos.x, fb.pos.y),
          color(255, rand(100, 200), 0),
          area(),
          lifespan(0.3, { fade: 0.2 }),
          z(5),
        ]);
      });
      fb.onDestroy(() => tailTimer.cancel());
    }

    /**
     * Spawn a waterball from the boss directed at the player.
     */
    function spawnWaterball() {
      const direction = player.pos.sub(boss.pos).unit();
      const wb = add([
        sprite('waterball'),
        pos(boss.pos.add(vec2(-40, 0))),
        scale(0.35),
        area(),
        move(direction, WATER_SPEED),
        offscreen({ destroy: true }),
        'waterball',
      ]);
      // Blue particle trail
      const trailTimer = loop(0.06, () => {
        add([
          rect(rand(2, 5), rand(2, 5)),
          pos(wb.pos.x, wb.pos.y),
          color(0, rand(100, 200), 255),
          area(),
          lifespan(0.4, { fade: 0.3 }),
          z(5),
        ]);
      });
      wb.onDestroy(() => trailTimer.cancel());
    }

    /**
     * Create an explosion effect at the given position.  Lots of
     * small coloured squares fly outwards and fade away.  A
     * camera shake emphasises the impact.
     */
    function explode(x, y) {
      shake(12);
      for (let i = 0; i < 40; i++) {
        const vel = vec2(rand(-1, 1), rand(-1, 1)).unit().scale(rand(200, 400));
        add([
          rect(rand(4, 8), rand(4, 8)),
          pos(x, y),
          color(rand(200, 255), rand(100, 200), 0),
          area(),
          move(vel, 1),
          lifespan(0.6, { fade: 0.4 }),
          z(10),
        ]);
      }
    }

    /**
     * Handle player death: spawn explosion, hide player,
     * clear projectiles, then respawn after a second.  Prevent
     * repeated deaths with the dead flag.
     */
    function playerDies() {
      if (player.dead) return;
      player.dead = true;
      explode(player.pos.x, player.pos.y);
      // Remove all projectiles
      every('fireball', (fb) => destroy(fb));
      every('waterball', (wb) => destroy(wb));
      // Temporarily hide player and disable body collisions
      player.opacity = 0;
      player.pos = vec2(100, 400);
      player.vel = vec2(0, 0);
      wait(1, () => {
        player.opacity = 1;
        player.dead = false;
      });
    }

    /**
     * Handle boss death: create explosion, remove boss, and
     * display victory text.  Cancel boss attacks afterwards.
     */
    function killBoss() {
      explode(boss.pos.x, boss.pos.y);
      destroy(boss);
      add([
        text('You defeated the dragon!', {
          size: 32,
          font: 'sink',
        }),
        color(255, 255, 255),
        pos(player.pos.x, player.pos.y - 80),
        fixed(),
      ]);
    }

    // Player collisions with platforms keep them grounded
    player.onUpdate(() => {
      // Scroll camera with player but clamp within level
      const camX = clamp(player.pos.x, GAME_WIDTH / 2, LEVEL_WIDTH - GAME_WIDTH / 2);
      camPos(camX, GAME_HEIGHT / 2);
    });

    // Fireball hits boss
    onCollide('fireball', 'boss', (fb, b) => {
      destroy(fb);
      b.hp--;
      explode(fb.pos.x, fb.pos.y);
      if (b.hp <= 0) {
        killBoss();
      }
    });

    // Waterball hits player
    onCollide('waterball', 'player', (wb, p) => {
      destroy(wb);
      playerDies();
    });

    // Lava floor: if player falls below the screen they die
    player.onUpdate(() => {
      if (player.pos.y > GAME_HEIGHT + 100) {
        playerDies();
      }
    });

    // Input handling
    onKeyDown('q', () => {
      if (!player.dead) player.move(-PLAYER_SPEED, 0);
      player.dir = -1;
    });
    onKeyDown('d', () => {
      if (!player.dead) player.move(PLAYER_SPEED, 0);
      player.dir = 1;
    });
    onKeyDown('left', () => {
      if (!player.dead) player.move(-PLAYER_SPEED, 0);
      player.dir = -1;
    });
    onKeyDown('right', () => {
      if (!player.dead) player.move(PLAYER_SPEED, 0);
      player.dir = 1;
    });
    onKeyRelease(['q', 'd', 'left', 'right'], () => {
      if (!player.dead) player.move(0, player.vel.y);
    });

    // Jump and wall jump with Z and Up keys
    onKeyPress('z', () => {
      if (player.dead) return;
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
      } else if (isKeyDown('q')) {
        player.vel.x = -WALL_JUMP_X;
        player.vel.y = -JUMP_FORCE;
      } else if (isKeyDown('d')) {
        player.vel.x = WALL_JUMP_X;
        player.vel.y = -JUMP_FORCE;
      }
    });
    onKeyPress('up', () => {
      if (player.dead) return;
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
      }
    });

    // Fire action on E or Space
    onKeyPress('e', () => {
      if (!player.dead) spawnFireball();
    });
    onKeyPress('space', () => {
      if (!player.dead) spawnFireball();
    });

    /**
     * Mobile input handling: track whether a pointer is
     * currently held down and update directional / action
     * flags based on its position.  When the pointer is
     * released all flags reset.  The four virtual buttons are
     * located in the corners of the screen.
     */
    let pointerDown = false;
    function updateMobileInput(pos) {
      const x = pos.x;
      const y = pos.y;
      const bottom = GAME_HEIGHT - 100;
      // Left button: bottom left quadrant
      mobile.left = x < 120 && y > bottom;
      // Right button: next to left button
      mobile.right = x >= 120 && x < 240 && y > bottom;
      // Jump button: bottom right quadrant
      mobile.jump = x >= GAME_WIDTH - 200 && x < GAME_WIDTH - 100 && y > bottom;
      // Fire button: far bottom right corner
      mobile.fire = x >= GAME_WIDTH - 100 && y > bottom;
    }
    const mobile = { left: false, right: false, jump: false, fire: false };
    onMouseDown(() => {
      pointerDown = true;
      updateMobileInput(mousePos());
    });
    onMouseMove(() => {
      if (pointerDown) updateMobileInput(mousePos());
    });
    onMouseRelease(() => {
      pointerDown = false;
      mobile.left = mobile.right = mobile.jump = mobile.fire = false;
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
      mobile.left = mobile.right = mobile.jump = mobile.fire = false;
    });

    // Mobile button updates each frame.  When a flag is true
    // emulate keyboard actions.
    onUpdate(() => {
      if (player.dead) return;
      // Horizontal movement via mobile
      if (mobile.left) {
        player.move(-PLAYER_SPEED, 0);
        player.dir = -1;
      } else if (mobile.right) {
        player.move(PLAYER_SPEED, 0);
        player.dir = 1;
      }
      // Jump
      if (mobile.jump && player.isGrounded()) {
        player.jump(JUMP_FORCE);
      }
      // Fire
      if (mobile.fire) {
        spawnFireball();
      }
    });
  });

  // Start the game scene
  go('main');
}