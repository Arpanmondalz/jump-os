# 🚀 JUMP-OS

**A Real‑Time Motion‑Tracking Jump Counter with AI‑Powered Computer Vision**

Jump‑OS is a browser-based fitness tracker that uses your webcam and a frame‑differencing algorithm to count jumps in real time. No wearables or external sensors — just computer vision and the browser.

---

## ✨ Features

- **Zero setup required** — Runs entirely in the browser; no install necessary.
- **Adjustable sensitivity** — Slider to tune detection for different jump styles.
- **Gamification** — XP rewards, milestone badges, and dynamic color themes.
- **Sci‑Fi HUD** — Orbitron font, animated grid backgrounds, and real‑time progress bars.
- **Audio feedback** — Custom sound effects for jumps, milestones, and completion.
- **Mobile-friendly** — Responsive, with PWA support.

---

## 🎮 How to use

### Online (GitHub Pages)
1. Visit the live site: https://arpanmondalz.github.io/jump-os/
2. Grant camera permissions when prompted.
3. Set target jump count and sensitivity (default sensitivity is pretty good though)
4. Click **START SESSION** and stand still for 5 seconds (calibration).
5. Jump and watch the counter update in real time.

### Local development
```bash
git clone https://github.com/Arpanmondalz/jump-os.git
cd jump-os
# Serve locally (required for camera access)
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## 🧠 How it works

Jump‑OS uses frame differencing and simple physics to detect jump cycles:

1. **Calibration:** capture a baseline frame while still.
2. **Motion detection:** compare incoming frames to detect movement.
3. **Centroid calculation:** compute center-of-mass of moving pixels.
4. **Physics engine:** track vertical displacement to identify jump/landing cycles.
5. **Adaptive baseline:** continuously update to avoid drift.

**Algorithm highlights**
- Low‑pass filtering to remove noise (shadows, flicker).
- Hysteresis to avoid false positives (double counts).
- Dynamic sensitivity (typical range: 3–20 pixels displacement).

---

## ⚙️ Configuration

### Sensitivity slider
- **Low (3–5):** high sensitivity, detects small hops.  
- **Medium (8–10):** balanced for most users — *default: 8*.  
- **High (15–20):** requires larger jumps to count.

### Audio files
Place custom MP3 files in `audio/`:
- `coin.mp3` — every 10 jumps  
- `milestone.mp3` — 50% and 90% progress  
- `win.mp3` — mission complete


## 📁 Project structure

```
jump-os/
├── index.html          # Main HTML
├── style.css           # Sci‑fi UI (Orbitron, grid)
├── game.js             # Motion engine + game logic
├── manifest.json       # PWA config
├── icon.png            # App icon (192×192)
├── audio/
│   ├── coin.mp3
│   ├── milestone.mp3
│   └── win.mp3
└── README.md
```
---

### PWA (mobile)
1. Open site on mobile.  
2. Tap browser menu → **Add to Home Screen**.  
3. App launches fullscreen.

---

## 🛠️ Tech stack

- **Vanilla JavaScript (ES6+)**
- **Canvas API** (frame processing, 640×480 @ 30fps)
- **getUserMedia API** (webcam)
- **Web Audio API** (sounds)
- **CSS3 animations** and **Google Fonts (Orbitron)**

---

Created by **Arpan Mondal** — connecting art, tech, and the physical world.

---

**Enjoy jumping! 🦘**
