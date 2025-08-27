# 🐉 Smash Dragons

A retro-style pixel art platformer built with [Kaboom.js](https://kaboomjs.com/). Take control of a heroic character as you navigate floating platforms, battle a fierce water dragon boss, and survive in a dangerous lava cavern!

![Game Preview](https://img.shields.io/badge/Game-Playable-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Kaboom.js](https://img.shields.io/badge/Engine-Kaboom.js-blue)

## 🎮 Game Features

- **Fluid Platformer Movement**: Move left/right, jump, and perform wall jumps
- **Combat System**: Shoot fireballs at enemies with particle effects
- **Boss Battle**: Face off against a water dragon that shoots waterballs
- **Mobile Support**: Touch controls for mobile devices
- **Particle Effects**: Explosions, projectile trails, and screen shake
- **Pixel Art Style**: Beautiful retro graphics with smooth animations
- **Responsive Design**: Scales to different screen sizes

## 🕹️ Controls

### Desktop (AZERTY Layout)

- **Q / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Z / Up Arrow**: Jump (wall jump when holding left/right)
- **E / Space**: Shoot fireball

### Mobile

Touch the virtual buttons displayed on screen:

- **Bottom Left**: Move left
- **Bottom Left-Center**: Move right
- **Bottom Right-Center**: Jump
- **Bottom Right**: Shoot fireball

## 🚀 Getting Started

### Play Online

The game is automatically deployed to GitHub Pages: [Play Smash Dragons](https://nicolas-rabault.github.io/smash-dragons/)

### Run Locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/nicolas-rabault/smash-dragons.git
   cd smash-dragons
   ```

2. **Serve the files** (required due to browser security restrictions):

   **Option A - Python 3:**

   ```bash
   python -m http.server 8000
   ```

   **Option B - Python 2:**

   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Option C - Node.js (if you have npx):**

   ```bash
   npx serve .
   ```

   **Option D - PHP:**

   ```bash
   php -S localhost:8000
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

## 🎯 Gameplay Tips

- **Wall Jumping**: Hold left or right while pressing jump to wall jump
- **Boss Strategy**: Hit the dragon 10 times with fireballs to defeat it
- **Avoid Dangers**: Don't fall into the lava or get hit by waterballs
- **Mobile Play**: The game works great on touch devices!

## 🛠️ Technical Details

### Built With

- **[Kaboom.js](https://kaboomjs.com/)**: Lightweight 2D game engine
- **HTML5 Canvas**: For rendering
- **Vanilla JavaScript**: No additional dependencies
- **Data URIs**: Assets embedded for offline play

### Project Structure

```
smash-dragons/
├── index.html              # Main game page
├── main.js                 # Game logic and mechanics
├── assets_data_uris.json   # Embedded sprite assets
├── assets/                 # Original asset files
│   ├── hero.png
│   ├── left.png
│   ├── powers/                 # Power-related sprites
│   │   ├── fireball.png
│   │   └── waterball.png
│   ├── level1/                 # Level 1 specific assets
│   │   ├── dragon.png
│   │   ├── platform.png
│   │   ├── magma_ambience_loop.wav
│   │   ├── level1_background_frame_01-08.png
│   │   └── level1_foreground.png
│   └── level2/                 # Level 2 background frames
└── .github/workflows/      # Auto-deployment to GitHub Pages
```

### Key Features Implementation

- **Physics**: Gravity, collision detection, and platform interaction
- **Camera**: Smooth scrolling that follows the player
- **Performance**: Efficient sprite rendering and particle systems
- **Cross-Platform**: Works on desktop and mobile browsers

## 🔧 Development

### Making Changes

1. Edit `main.js` for game logic
2. Update `index.html` for page structure
3. Modify assets in the `assets/` folder
4. Regenerate `assets_data_uris.json` if needed

### Asset Pipeline

The game uses Data URIs for assets to avoid CORS issues when running locally. Original PNG files are in the `assets/` folder, and their base64-encoded versions are stored in `assets_data_uris.json`.

### Deployment

The game automatically deploys to GitHub Pages via GitHub Actions whenever code is pushed to the `main` branch.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test locally
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Open a Pull Request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🎨 Credits

- Game engine: [Kaboom.js](https://kaboomjs.com/)
- Pixel art assets: Custom created
- Sound effects: None (currently a silent game)

---

**Enjoy smashing dragons!** 🔥🐉

_Made with ❤️ and JavaScript_
