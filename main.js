/*
 * Enhanced Smash Dragons - A Kaboom.js Platformer
 * MAIN SYSTEM FILE - Audio management, utilities, initialization, and scene management
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
  bossEncounterStarted: false,
  bossSpawned: false,
  playerInBossArea: false,
};

// Debug state
let debug = {
  enabled: true, // Enable debug mode in development
  inspectMode: false, // Show platform numbers and info
  levelSelector: false, // Show level selector overlay
};

// Audio Management System
class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.currentMusic = null;
    this.currentAmbience = null;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.ambienceVolume = 0.5;
    this.isMuted = false;
    this.isInitialized = false;
    this.userInteracted = false;
    this.currentScene = null;
  }

  // Initialize audio system
  async init() {
    try {
      console.log("Initializing AudioManager...");

      // Load all audio files
      await this.loadSound(
        "menuTheme",
        "./assets/audio/menu_theme_loop.wav",
        "music"
      );
      await this.loadSound(
        "magmaAmbience",
        "./assets/level1/level1_audio.wav",
        "ambience"
      );
      await this.loadSound(
        "fireAmbience",
        "./assets/level2/level2_audio.wav",
        "ambience"
      );
      await this.loadSound(
        "deathRespawn",
        "./assets/audio/death_respawn_stinger.wav",
        "sfx"
      );
      await this.loadSound(
        "victoryFanfare",
        "./assets/audio/victory_fanfare.wav",
        "sfx"
      );
      await this.loadSound(
        "fireballExplosion",
        "./assets/audio/fireball_explosion.wav",
        "sfx"
      );
      await this.loadSound(
        "windballExplosion",
        "./assets/audio/windball_explosion.wav",
        "sfx"
      );
      await this.loadSound(
        "waterballExplosion",
        "./assets/audio/waterball_explosion.wav",
        "sfx"
      );

      this.isInitialized = true;
      console.log("AudioManager initialized successfully");
    } catch (error) {
      console.error("Error initializing AudioManager:", error);
    }
  }

  // Load a sound with metadata
  async loadSound(id, path, type) {
    try {
      console.log(`Loading ${type}: ${id}`);
      loadSound(id, path);
      this.sounds.set(id, {
        id,
        path,
        type,
        isPlaying: false,
        instances: new Set(), // Track multiple instances
      });
    } catch (error) {
      console.error(`Error loading sound ${id}:`, error);
    }
  }

  // Enable user interaction for audio
  enableUserInteraction() {
    if (!this.userInteracted) {
      this.userInteracted = true;
      console.log("Audio user interaction enabled");
      // If we're in menu and no music is playing, start menu music
      this.startMenuMusicAfterInteraction();
    }
  }

  // Play music (stops current music first)
  playMusic(id, options = {}) {
    if (!this.isInitialized || !this.userInteracted || this.isMuted) {
      console.log(
        `Cannot play music ${id}: initialized=${this.isInitialized}, userInteracted=${this.userInteracted}, muted=${this.isMuted}`
      );
      return;
    }

    try {
      // Stop current music first
      if (this.currentMusic) {
        this.stopMusic();
      }

      // Force stop any existing instances of this sound
      this.forceStopSound(id);

      const volume = options.volume ?? this.musicVolume;
      console.log(`Playing music: ${id} at volume ${volume}`);

      const audioInstance = play(id, {
        loop: true,
        volume: volume,
        ...options,
      });

      this.currentMusic = id;
      const sound = this.sounds.get(id);
      if (sound) {
        sound.isPlaying = true;
        sound.instances.add(audioInstance);
      }

      console.log(`Music ${id} started successfully`);
      return audioInstance;
    } catch (error) {
      console.error(`Error playing music ${id}:`, error);
    }
  }

  // Play ambience (stops current ambience first)
  playAmbience(id, options = {}) {
    if (!this.isInitialized || this.isMuted) {
      console.log(
        `Cannot play ambience ${id}: initialized=${this.isInitialized}, muted=${this.isMuted}`
      );
      return;
    }

    try {
      // Stop current ambience first
      if (this.currentAmbience) {
        this.stopAmbience();
      }

      // Force stop any existing instances of this sound
      this.forceStopSound(id);

      const volume = options.volume ?? this.ambienceVolume;
      console.log(`Playing ambience: ${id} at volume ${volume}`);

      const audioInstance = play(id, {
        loop: true,
        volume: volume,
        ...options,
      });

      this.currentAmbience = id;
      const sound = this.sounds.get(id);
      if (sound) {
        sound.isPlaying = true;
        sound.instances.add(audioInstance);
      }

      console.log(`Ambience ${id} started successfully`);
      return audioInstance;
    } catch (error) {
      console.error(`Error playing ambience ${id}:`, error);
    }
  }

  // Play sound effect (one-shot)
  playSFX(id, options = {}) {
    if (!this.isInitialized || !this.userInteracted || this.isMuted) {
      console.log(
        `Cannot play SFX ${id}: initialized=${this.isInitialized}, userInteracted=${this.userInteracted}, muted=${this.isMuted}`
      );
      return;
    }

    try {
      const volume = options.volume ?? this.sfxVolume;
      console.log(`Playing SFX: ${id} at volume ${volume}`);

      const audioInstance = play(id, {
        loop: false,
        volume: volume,
        ...options,
      });

      // Track SFX instances for cleanup
      const sound = this.sounds.get(id);
      if (sound) {
        sound.instances.add(audioInstance);

        // Clean up instance when finished (for SFX)
        if (audioInstance && audioInstance.onEnd) {
          audioInstance.onEnd(() => {
            sound.instances.delete(audioInstance);
          });
        }
      }

      console.log(`SFX ${id} played successfully`);
      return audioInstance;
    } catch (error) {
      console.error(`Error playing SFX ${id}:`, error);
    }
  }

  // Force stop all instances of a sound
  forceStopSound(id) {
    const sound = this.sounds.get(id);
    if (sound && sound.instances.size > 0) {
      console.log(`Force stopping ${sound.instances.size} instances of ${id}`);

      // Stop each instance
      sound.instances.forEach((instance) => {
        try {
          if (instance && instance.stop) {
            instance.stop();
          }
        } catch (error) {
          console.error(`Error stopping instance of ${id}:`, error);
        }
      });

      // Clear all instances
      sound.instances.clear();
      sound.isPlaying = false;
    }

    // Also use Kaboom's stop function as backup
    try {
      stop(id);
    } catch (error) {
      console.error(`Error using Kaboom stop for ${id}:`, error);
    }
  }

  // Stop current music
  stopMusic() {
    if (this.currentMusic) {
      try {
        console.log(`Stopping music: ${this.currentMusic}`);
        this.forceStopSound(this.currentMusic);
        this.currentMusic = null;
        console.log("Music stopped successfully");
      } catch (error) {
        console.error(`Error stopping music:`, error);
      }
    }
  }

  // Stop current ambience
  stopAmbience() {
    if (this.currentAmbience) {
      try {
        console.log(`Stopping ambience: ${this.currentAmbience}`);
        this.forceStopSound(this.currentAmbience);
        this.currentAmbience = null;
        console.log("Ambience stopped successfully");
      } catch (error) {
        console.error(`Error stopping ambience:`, error);
      }
    }
  }

  // Stop all audio
  stopAll() {
    console.log("Stopping all audio");
    this.stopMusic();
    this.stopAmbience();

    // Force stop all other sounds
    this.sounds.forEach((sound, id) => {
      if (sound.instances.size > 0) {
        console.log(`Stopping all instances of ${id}`);
        this.forceStopSound(id);
      }
    });
  }

  // Scene transition helpers
  transitionToMenu() {
    console.log("Audio transition: -> Menu");
    this.currentScene = "menu";
    this.stopAll();
    if (this.userInteracted) {
      this.playMusic("menuTheme");
    } else {
      console.log(
        "Menu transition: waiting for user interaction to start music"
      );
    }
  }

  // Start menu music after user interaction
  startMenuMusicAfterInteraction() {
    if (
      this.userInteracted &&
      !this.currentMusic &&
      !this.isMuted &&
      this.currentScene === "menu"
    ) {
      console.log("Starting menu music after user interaction");
      this.playMusic("menuTheme");
    }
  }

  transitionToGame() {
    console.log("Audio transition: -> Game");
    this.currentScene = "game";
    this.stopAll();
    
    // Play appropriate ambience based on current level
    const ambienceId = gameState.level === 1 ? "magmaAmbience" : 
                      gameState.level === 2 ? "fireAmbience" : 
                      "magmaAmbience"; // fallback
    
    this.playAmbience(ambienceId);
  }

  transitionToGameOver() {
    console.log("Audio transition: -> Game Over");
    this.currentScene = "gameOver";
    this.stopAll();
  }

  // Volume controls
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    console.log(`Music volume set to: ${this.musicVolume}`);
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    console.log(`SFX volume set to: ${this.sfxVolume}`);
  }

  setAmbienceVolume(volume) {
    this.ambienceVolume = Math.max(0, Math.min(1, volume));
    console.log(`Ambience volume set to: ${this.ambienceVolume}`);
  }

  // Mute controls
  mute() {
    this.isMuted = true;
    this.stopAll();
    console.log("Audio muted");
  }

  unmute() {
    this.isMuted = false;
    console.log("Audio unmuted");
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // Get current state
  getState() {
    return {
      isInitialized: this.isInitialized,
      userInteracted: this.userInteracted,
      isMuted: this.isMuted,
      currentMusic: this.currentMusic,
      currentAmbience: this.currentAmbience,
      volumes: {
        music: this.musicVolume,
        sfx: this.sfxVolume,
        ambience: this.ambienceVolume,
      },
    };
  }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Utility functions that need to be available globally
function addJumpEffect(playerPos) {
  for (let i = 0; i < 8; i++) {
    add([
      rect(rand(2, 4), rand(2, 4)),
      pos(playerPos.x + rand(-15, 15), playerPos.y + 20),
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

// Load assets from JSON
async function loadGameAssets() {
  try {
    // Load PNG files directly instead of data URIs
    loadSprite("hero", "./assets/hero.png");
    loadSprite("level1Dragon", "./assets/level1/level1_dragon.png");
    loadSprite("level2Dragon", "./assets/level2/level2_dragon.png");
    loadSprite("windball", "./assets/powers/windball.png");
    loadSprite("fireball", "./assets/powers/fireball.png");
    loadSprite("waterball", "./assets/powers/waterball.png");
    loadSprite("level1Platform", "./assets/level1/level1_platform.png");
    loadSprite("level2Platform", "./assets/level2/level2_platform.png");

    // Load animated background frames
    loadSprite(
      "level1BackgroundFrame1",
      "./assets/level1/level1_background_frame_01.png"
    );
    loadSprite(
      "level1BackgroundFrame2",
      "./assets/level1/level1_background_frame_02.png"
    );
    loadSprite(
      "level1BackgroundFrame3",
      "./assets/level1/level1_background_frame_03.png"
    );
    loadSprite(
      "level1BackgroundFrame4",
      "./assets/level1/level1_background_frame_04.png"
    );
    loadSprite(
      "level1BackgroundFrame5",
      "./assets/level1/level1_background_frame_05.png"
    );
    loadSprite(
      "level1BackgroundFrame6",
      "./assets/level1/level1_background_frame_06.png"
    );
    loadSprite(
      "level1BackgroundFrame7",
      "./assets/level1/level1_background_frame_07.png"
    );
    loadSprite(
      "level1BackgroundFrame8",
      "./assets/level1/level1_background_frame_08.png"
    );

    // Load foreground for parallax effect
    loadSprite(
      "level1Foreground",
      "./assets/level1/level1_foreground.png"
    );

    // Load level 2 animated background frames
    loadSprite(
      "level2BackgroundFrame1",
      "./assets/level2/level2_background_frame_01.png"
    );
    loadSprite(
      "level2BackgroundFrame2",
      "./assets/level2/level2_background_frame_02.png"
    );
    loadSprite(
      "level2BackgroundFrame3",
      "./assets/level2/level2_background_frame_03.png"
    );
    loadSprite(
      "level2BackgroundFrame4",
      "./assets/level2/level2_background_frame_04.png"
    );
    loadSprite(
      "level2BackgroundFrame5",
      "./assets/level2/level2_background_frame_05.png"
    );
    loadSprite(
      "level2BackgroundFrame6",
      "./assets/level2/level2_background_frame_06.png"
    );
    loadSprite(
      "level2BackgroundFrame7",
      "./assets/level2/level2_background_frame_07.png"
    );
    loadSprite(
      "level2BackgroundFrame8",
      "./assets/level2/level2_background_frame_08.png"
    );
    loadSprite(
      "level2BackgroundFrame9",
      "./assets/level2/level2_background_frame_09.png"
    );
    loadSprite(
      "level2BackgroundFrame10",
      "./assets/level2/level2_background_frame_10.png"
    );
    loadSprite(
      "level2BackgroundFrame11",
      "./assets/level2/level2_background_frame_11.png"
    );
    loadSprite(
      "level2BackgroundFrame12",
      "./assets/level2/level2_background_frame_12.png"
    );

    // Load level 2 foreground for parallax effect
    loadSprite(
      "level2Foreground",
      "./assets/level2/level2_foreground.png"
    );

    console.log("Loading animated background frames and foreground for all levels...");

    // Load mobile control icons from the assets folder
    loadSprite("leftArrow", "./assets/left.png");
    loadSprite("rightArrow", "./assets/left.png"); // We'll flip this
    loadSprite("fireIcon", "./assets/powers/windball.png"); // Default power icon
    loadSprite("jumpIcon", "./assets/hero.png"); // Use hero sprite for jump

    // Initialize AudioManager
    await audioManager.init();

    console.log("PNG assets and audio loaded successfully");
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
    debug: true, // Enable debug mode to see collision boundaries
    touchToMouse: true,
    focus: true,
    stretch: true, // Allow stretching to fit container
    letterbox: true, // Maintain aspect ratio with black bars if needed
  });

  setGravity(GRAVITY);

  // Load assets
  await loadGameAssets();

  // Initialize all scenes (dependencies verified in HTML)
  initializeScenes();

  // Global audio controls (available in all scenes)
  onKeyPress("m", () => {
    audioManager.toggleMute();
    console.log(
      "Mute toggled:",
      audioManager.getState().isMuted ? "MUTED" : "UNMUTED"
    );
  });

  // Debug controls (available in all scenes)
  setupDebugControls();

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
  console.log("Initializing scenes...");
  // Main Menu Scene
  scene("menu", () => {
    // Use AudioManager for menu transition
    audioManager.transitionToMenu();

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

    // Audio controls info
    add([
      text("Press M to mute/unmute audio", {
        size: 14,
        font: "sink",
      }),
      color(180, 180, 180),
      pos(GAME_WIDTH / 2, 380),
      anchor("center"),
    ]);

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

      // Enable audio user interaction
      audioManager.enableUserInteraction();

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

      // Enable audio user interaction
      audioManager.enableUserInteraction();

      gameState.gameStarted = true;
      go("game");
    });

    onKeyPress("enter", () => {
      console.log("Enter pressed in menu - starting game");

      // Enable audio user interaction
      audioManager.enableUserInteraction();

      gameState.gameStarted = true;
      go("game");
    });

    // Add click to focus for better keyboard support
    onMousePress(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.focus();
      }

      // Enable audio user interaction
      audioManager.enableUserInteraction();
    });
  });

  // Game Over Scene
  scene("gameOver", () => {
    console.log("Game Over scene started");

    // Use AudioManager for game over transition
    audioManager.transitionToGameOver();

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
        bossEncounterStarted: false,
        bossSpawned: false,
        playerInBossArea: false,
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
        bossEncounterStarted: false,
        bossSpawned: false,
        playerInBossArea: false,
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
        bossEncounterStarted: false,
        bossSpawned: false,
        playerInBossArea: false,
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
        bossEncounterStarted: false,
        bossSpawned: false,
        playerInBossArea: false,
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
    // Use AudioManager for game transition
    audioManager.transitionToGame();

    // Enhanced background with multiple layers
    createBackground();

    // Create platforms with better positioning
    const platforms = createPlatforms();

    // Create player
    const player = createPlayer();

    // Boss will be created dynamically when player reaches encounter area
    // Reset boss encounter states for new game
    gameState.bossEncounterStarted = false;
    gameState.bossSpawned = false;
    gameState.playerInBossArea = false;

    // Create UI
    createUI();

    // Game mechanics
    setupPlayerMovement(player);
    setupPowerCollisions(player);
    setupBossCollisions();
    setupCamera(player);

    // Initialize power selector UI
    updatePowerSelector(player);

    // Mobile controls
    setupMobileControls(player);
  });
}

// Debug System for Development
function setupDebugControls() {
  console.log("🔧 Debug controls initialized:");
  console.log("  [F1] - Toggle platform debug info");
  console.log("  [F2] - Toggle level selector");
  console.log("  [1] - Quick switch to Level 1");
  console.log("  [2] - Quick switch to Level 2");

  // Toggle platform debug info
  onKeyPress("f1", () => {
    debug.inspectMode = !debug.inspectMode;
    console.log(`🔧 Platform debug mode: ${debug.inspectMode ? "ON" : "OFF"}`);
    
    if (debug.inspectMode) {
      showDebugInfo();
    } else {
      hideDebugInfo();
    }
  });

  // Toggle level selector
  onKeyPress("f2", () => {
    debug.levelSelector = !debug.levelSelector;
    
    if (debug.levelSelector) {
      showLevelSelector();
    } else {
      hideLevelSelector();
    }
  });

  // Quick level switches
  onKeyPress("1", () => {
    if (debug.enabled) {
      switchToLevel(1);
    }
  });

  onKeyPress("2", () => {
    if (debug.enabled) {
      switchToLevel(2);
    }
  });
}

function showDebugInfo() {
  // Clear existing debug elements
  get("debugPlatformNumber").forEach(destroy);
  get("debugPlatformType").forEach(destroy);
  get("debugPlatformCoords").forEach(destroy);
  get("debugInfo").forEach(destroy);

  // Show current level and position info
  add([
    text(`DEBUG MODE - Level ${gameState.level}`, {
      size: 14,
      font: "sink",
    }),
    pos(10, 110),
    color(255, 255, 0),
    fixed(),
    z(100),
    "debugInfo",
  ]);

  add([
    text("F1: Toggle debug | F2: Level selector | 1/2: Quick switch", {
      size: 12,
      font: "sink",
    }),
    pos(10, 130),
    color(200, 200, 200),
    fixed(),
    z(100),
    "debugInfo",
  ]);

  // Add player position tracker
  const player = get("player")[0];
  if (player) {
    player.onUpdate(() => {
      // Remove old position display
      get("debugPlayerPos").forEach(destroy);
      
      add([
        text(`Player: (${Math.round(player.pos.x)}, ${Math.round(player.pos.y)})`, {
          size: 12,
          font: "sink",
        }),
        pos(10, 150),
        color(100, 255, 100),
        fixed(),
        z(100),
        "debugPlayerPos",
      ]);
    });
  }

  // Recreate platforms with debug info
  if (getScene() === "game") {
    const levelData = LEVEL_DATA[gameState.level];
    if (levelData) {
      createLevelPlatforms(levelData.platforms);
    }
  }
}

function hideDebugInfo() {
  get("debugPlatformNumber").forEach(destroy);
  get("debugPlatformType").forEach(destroy);
  get("debugPlatformCoords").forEach(destroy);
  get("debugInfo").forEach(destroy);
  get("debugPlayerPos").forEach(destroy);
}

function showLevelSelector() {
  // Remove existing level selector
  hideLevelSelector();

  // Create level selector overlay
  add([
    rect(GAME_WIDTH, GAME_HEIGHT),
    pos(0, 0),
    color(0, 0, 0, 0.8),
    fixed(),
    z(150),
    "levelSelector",
  ]);

  add([
    text("LEVEL SELECTOR", {
      size: 32,
      font: "sink",
    }),
    pos(GAME_WIDTH / 2, 150),
    anchor("center"),
    color(255, 255, 0),
    fixed(),
    z(151),
    "levelSelector",
  ]);

  // Level buttons
  const levels = Object.keys(LEVEL_DATA);
  levels.forEach((levelId, index) => {
    const levelData = LEVEL_DATA[levelId];
    const y = 250 + index * 80;
    const isCurrentLevel = parseInt(levelId) === gameState.level;

    // Level button background
    const buttonColor = isCurrentLevel ? [100, 255, 100] : [100, 100, 200];
    add([
      rect(400, 60),
      pos(GAME_WIDTH / 2 - 200, y - 30),
      color(buttonColor[0], buttonColor[1], buttonColor[2], 0.3),
      outline(2, rgb(buttonColor[0], buttonColor[1], buttonColor[2])),
      fixed(),
      z(151),
      "levelSelector",
    ]);

    // Level info
    add([
      text(`Level ${levelId}: ${levelData.name}`, {
        size: 20,
        font: "sink",
      }),
      pos(GAME_WIDTH / 2, y - 10),
      anchor("center"),
      color(255, 255, 255),
      fixed(),
      z(152),
      "levelSelector",
    ]);

    add([
      text(`Boss: ${BOSS_TYPES[levelData.boss].name} | Platforms: ${levelData.platforms.length}`, {
        size: 14,
        font: "sink",
      }),
      pos(GAME_WIDTH / 2, y + 10),
      anchor("center"),
      color(200, 200, 200),
      fixed(),
      z(152),
      "levelSelector",
    ]);

    // Click area for level selection
    add([
      rect(400, 60),
      pos(GAME_WIDTH / 2 - 200, y - 30),
      area(),
      fixed(),
      z(153),
      "levelSelector",
      {
        level: parseInt(levelId),
      },
    ]).onClick(() => {
      switchToLevel(parseInt(levelId));
      hideLevelSelector();
    });
  });

  // Instructions
  add([
    text("Click a level to switch | Press F2 to close", {
      size: 16,
      font: "sink",
    }),
    pos(GAME_WIDTH / 2, GAME_HEIGHT - 100),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(152),
    "levelSelector",
  ]);

  // Close button
  add([
    rect(100, 40),
    pos(GAME_WIDTH / 2 - 50, GAME_HEIGHT - 60),
    color(200, 50, 50),
    area(),
    fixed(),
    z(153),
    "levelSelector",
  ]).onClick(() => {
    hideLevelSelector();
  });

  add([
    text("CLOSE", {
      size: 16,
      font: "sink",
    }),
    pos(GAME_WIDTH / 2, GAME_HEIGHT - 40),
    anchor("center"),
    color(255, 255, 255),
    fixed(),
    z(154),
    "levelSelector",
  ]);
}

function hideLevelSelector() {
  get("levelSelector").forEach(destroy);
  debug.levelSelector = false;
}

function switchToLevel(targetLevel) {
  if (!LEVEL_DATA[targetLevel]) {
    console.log(`🔧 Level ${targetLevel} does not exist`);
    return;
  }

  console.log(`🔧 Switching to Level ${targetLevel}`);
  
  // Update game state
  gameState.level = targetLevel;
  gameState.bossDefeated = false;
  gameState.bossEncounterStarted = false;
  gameState.bossSpawned = false;
  gameState.playerInBossArea = false;

  // Go to game scene to load the new level
  go("game");
}

// Level, Player, Boss, and UI creation functions are now in separate files

// Player movement, combat, collision, and camera setup functions are now in separate files

// Mobile controls, player death, and boss defeat functions are now in separate files
