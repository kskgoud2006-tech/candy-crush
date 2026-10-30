# 🍬 Candy Crush Saga - Static Web Game

A vibrant, juicy Candy Crush match-3 puzzle game built with pure **HTML5, CSS3, and modern JavaScript**. It has zero external dependencies, requires no build steps, and is 100% ready for instant deployment to **GitHub Pages**.

---

## 🎮 Features

- **Juicy Candy Graphics**: 6 custom glossy SVG candies (Strawberry Jelly, Blueberry Drop, Orange Lozenge, Lime Chiclet, Lemon Star, Grape Cluster).
- **Special Candies**:
  - ⚡ **Striped Candy (Match 4)**: Blasts an entire row or column.
  - 🎁 **Wrapped Candy (L or T Shape)**: Creates a double 3x3 explosive shockwave.
  - 🌈 **Rainbow Color Bomb (Match 5)**: Swapping with any candy eliminates all candies of that color from the board with lightning arcs.
  - 💥 **Special Combos**: Swap special candies together for super board wipes (Color Bomb + Color Bomb, Color Bomb + Striped, Striped + Wrapped, etc.)!
- **Dynamic Cascades & Combos**: Gravity drops new candies; consecutive cascade chains unlock praise popups (*"SWEET!"*, *"TASTY!"*, *"DELICIOUS!"*, *"DIVINE!"*).
- **Procedural Sound FX (Web Audio API)**: Zero external audio files required! Instantaneous, high-fidelity sound synthesis for candy pops, laser beams, explosions, combo chimes, and victory fanfares. Includes mute toggle.
- **Canvas Particle FX Overlay**: Dynamic sugar bursts, laser wipe beams, shockwaves, rainbow lightning, and victory confetti.
- **Hint & Auto-Shuffle**:
  - Automatically pulses a valid move if idle for 6 seconds (or click the **Hint** button).
  - Automatically reshuffles the board if no valid moves are possible.
- **5 Progressive Levels**: Star rating meter (1 to 3 stars), move limits, and score targets.
- **Responsive & Touch-Ready**: Seamlessly playable on desktop (mouse drag or click-to-swap) and mobile phones/tablets (touch swipe with `touch-action: none`).

---

## 🚀 How to Deploy to GitHub Pages

### Method 1: Deploy from Branch (Recommended & Easiest)

1. Create a new repository on [GitHub](https://github.com/new).
2. In your terminal inside this project folder, push the code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Candy Crush static game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Navigate to **Settings** -> **Pages** (under Code and automation).
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch: `main` and folder: `/ (root)`.
   - Click **Save**.
4. In 1–2 minutes, your game will be live at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

### Method 2: Deploy with GitHub Actions

A ready-to-run GitHub Actions workflow is already included in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. In GitHub, go to **Settings** -> **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main`, and GitHub will automatically deploy your site!

---

## 💻 Local Testing

You can play the game locally immediately:

- **Option 1**: Simply double-click `index.html` in your file explorer to open it in any web browser.
- **Option 2** (Local HTTP server):
  ```bash
  # Using Python:
  python -m http.server 8000

  # Or using Node.js:
  npx serve
  ```
  Then visit `http://localhost:8000` in your browser.

---

## 📁 Project Structure

```
├── index.html                 # Main game HTML structure and modals
├── css/
│   └── style.css              # Glossy candy UI styling, animations, responsive CSS
├── js/
│   ├── candy-types.js         # SVG candy vector designs and specials
│   ├── audio.js               # Web Audio API procedural sound synthesizer
│   ├── particles.js           # High-performance Canvas visual FX engine
│   ├── board.js               # Match detection, specials, cascade & solver logic
│   └── game.js                # Game controller, event handlers, HUD & level progression
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions automated Pages deployment
└── README.md                  # Documentation and deployment guide
```

---

## 📜 License

MIT License - feel free to customize, extend, and share!

