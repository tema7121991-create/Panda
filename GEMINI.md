# GEMINI.md - Context & Architecture Guide for Panda Runner

Welcome! This document provides an architectural overview, development guidelines, and coding conventions for the **Panda Runner (Панда Раннер)** repository. It serves as instructional context for future AI agent interactions to ensure all updates, bug fixes, or enhancements remain consistent with the project's style and design.

---

## 📋 Project Overview
**Panda Runner** is an endless runner browser game inspired by the Google Chrome T-Rex Dino Runner. It features an animated panda running through a scenic bamboo forest, with dynamic day/night cycles, responsive touch controls, high score saving via browser storage, and real-time retro 8-bit sound effects synthesized on-the-fly.

### Key Features
- **Fluid Custom Canvas Animations:** Smooth 60 FPS rendering using standard HTML5 Canvas 2D. No external graphics assets are used; all visuals (panda, cranes, bamboo, mountains, clouds) are rendered dynamically with canvas path drawing.
- **Dynamic Parallax Backgrounds & Day/Night Cycle:** The background transitions dynamically through day, sunset, star-studded night (with moon), and sunrise every 700 points.
- **Web Audio API Synth:** Pure JS offline sound synthesis using oscillator nodes. Zero external audio file dependencies.
- **State Preservation:** Keeps track of high scores locally using the browser's `localStorage` (`panda_runner_hi`).
- **Responsive & Touch-Friendly:** Optimizations for mobile, tablet, and desktop viewports, with a custom overlay layout and screen-touch buttons.

---

## 🛠️ Tech Stack & Architecture
- **Frontend Technologies:** HTML5, CSS3, JavaScript (ES6+).
- **External Dependencies:** Google Fonts (`Press Start 2P`, `Comfortaa`). Zero JS frameworks (React, Vue, etc.) or visual libraries (Three.js, PixiJS, etc.) are used.
- **Main Components (organized as standard ES6 classes inside an IIFE in `game.js`):**
  1. `SoundController`: Synthesizes retro sounds on-the-fly (`playJump`, `playDuck`, `playMilestone`, `playBonus`, `playHit`, `playClick`) using `AudioContext` oscillators.
  2. `Panda`: Encapsulates physics (gravity, jump velocity), dimensions, hitboxes, and state-based custom drawing methods (`drawRunning`, `drawJumping`, `drawDucking`, `drawHit`, `drawHead`).
  3. `ObstacleManager`: Manages life cycles, movements, hitboxes, and drawings for obstacles (small/tall bamboo, bamboo clusters, rocks, and cranes flying at 3 heights) and golden bamboo collectibles (+100 points).
  4. `Environment`: Implements parallax scrolling for ground, forest, mountains, clouds, stars, and falling leaves, along with sky color interpolation based on score progression.
  5. `ParticleSystem`: Orchestrates run-time canvas dust trails, glowing sparkles upon collecting bonuses, and fading floating text (e.g., `+100`).
  6. `Game`: The orchestrator coordinating state management (`START`, `RUNNING`, `PAUSED`, `GAMEOVER`), keyboard/touch input bindings, delta-time game loop (`requestAnimationFrame`), and `localStorage` score persistence.

---

## 🚀 Running the Project
The application is entirely static and runs directly in any modern web browser.

### Key Execution Methods
1. **Direct Launch:**
   - Double-click `index.html` or drag and drop it into a browser.
2. **Local HTTP Server (Recommended for development):**
   - **Python 3:** `python3 -m http.server 8000` (or `python -m http.server 8000`)
   - **NodeJS/npm:** `npx serve .` or `npm install -g serve && serve`
   - **VS Code Extension:** Live Server.

There are no compiler steps or bundlers required to run this project.

---

## 🎨 Development Conventions & Guidelines

When modifying this repository, strictly adhere to the following principles:

### 1. Visual Drawing (HTML5 Canvas 2D)
- **Direct Path Drawing:** All game assets are drawn programmatically using canvas paths (`arc`, `ellipse`, `lineTo`, `quadraticCurveTo`, etc.). **Do not introduce image/sprite dependencies** (`.png`, `.jpg`, `.svg`) unless explicitly requested.
- **Scaling and Proportions:** Maintain relative proportions based on game constants. `CANVAS_WIDTH = 900` and `CANVAS_HEIGHT = 320`. Canvas dimensions are scaled down responsively using CSS aspect-ratio configurations.
- **Pixel/Retro Style:** Visuals should remain retro, friendly, and cohesive. Avoid high-fidelity textures.

### 2. Audio & Web Audio API
- **On-the-fly Synthesis:** All game sounds must be generated procedurally via the `SoundController`. Do not add audio file assets (`.mp3`, `.wav`).
- **Mute Preferences:** Always respect the user's mute state (`panda_runner_muted` in `localStorage`).

### 3. Localization & Language
- **Default Locale:** The game text, HUD prompts, hotkey hints, overlay headings, and author credits are localized in **Ukrainian (uk)**. Any new UI elements or alerts must maintain Ukrainian translations.

### 4. JavaScript Code Style
- **Encapsulation:** The entire codebase is wrapped in an immediately invoked function expression (IIFE) with `'use strict';` to prevent global scope pollution. Keep all logic contained within this scope.
- **Class-Based Structure:** Modularize new elements (e.g., new powerups, enemies, or indicators) by creating custom classes or extending existing managers. Keep game states (`START`, `RUNNING`, `PAUSED`, `GAMEOVER`) explicitly segregated.
- **No External Libraries:** Avoid adding third-party frameworks or libraries. Rely purely on vanilla JavaScript.

### 5. CSS Guidelines
- **CSS Variables:** Colors, fonts, and borders are centralized as CSS custom properties in `:root` inside `style.css`. Always use these variables (e.g., `var(--accent-green)`, `var(--font-retro)`) when adding styles.
- **Responsive Flexbox/Grid:** Ensure overlays, HUD bars, and layouts remain completely adaptive to desktop, tablet, and mobile dimensions.

---

## 📜 Журнал змін (Changelog)

### 🚀 Версія 1.5 — «Pac-Man Power-Up»
- **Режим їжі (Eating Mode)**:
  - Додано новий колекційний предмет — **Power Pellet** (синя сфера)
  - При підборі активується режим їжі на 8 секунд
  - Качки (журлі) стають синіми і можуть бути з'їдені за **+100 очок** кожна
  - HUD: бейдж 👻 з таймером зворотного відліку
  - Звуки: `playPowerUp()` (активація) та `playEat()` (з'їдання качки)

### 🚀 Версія 1.5 — «Pac-Man Power-Up»
- **Power Pellet**: новий колекційний предмет (синя сфера, ~12% шанс появи)
- **Eating Mode**: 8 секунд, крани стають синіми, дають +100 за з'їдання
- **Звуки**: playPowerUp() (rising chime), playEat() (descending square)
- **HUD**: 👻 бейдж з таймером

### 🚀 Версія 1.4 — «Shop & SkinPoint Update»
- **Магазин скінів**: виправлений null-редерект при кліку (shopCoins), автозакриття після покупки, повторна покупка заблокована, вибір вже придбаних скінів, повідомлення про помилки
- **SkinPoint система**: 1 SP за кожні 1000 балів, збереження у localStorage, відображення в HUD та магазині, покупка скінів за SP
- **Головне меню**: кнопка на екрані Game Over для повернення до стартового екрану
- **Адаптивність**: overflow-y auto на оверлеях, щоб вміст не виходив за межі екрану

### 🚀 Версія 1.3 — Shield fix
- Додано методи `activateShield()` та `breakShield()` до Panda класу
- Виправлене зависання гри при підборі бамбукового щита

## 🎋 Майбутній розвиток та ідеї (Roadmap & Ideas)
Тут зібрані перспективні ідеї для майбутнього розвитку нескінченного раннера з пандою. Усі елементи мають розроблятися програмно (HTML5 Canvas 2D, Web Audio API) без використання зовнішніх медіа-активів.

### 1. ✨ Суперздібності та бафи (Power-ups)
- **🛡️ Бамбуковий щит (Shield):** *(Реалізовано ✅)*
  - **Ефект:** Захищає від одного зіткнення. Надає 1 секунду невразливості після знищення щита.
  - **Візуалізація:** Зелене напівпрозоре коло навколо панди (`ctx.arc()`), яке пульсує.
  - **Звук:** Особливий дзвінкий тон при активації та тріск ламаного бамбука при руйнуванні.
- **🧲 Магніт золотого бамбука (Magnet):**
  - **Ефект:** Протягом 10 секунд автоматично притягує всі золоті стебла бамбука до панди.
  - **Візуалізація:** Світлове тяжіння навколо панди, бонуси змінюють траєкторію в її бік.
- **👟 Подвійний стрибок (Double Jump):**
  - **Ефект:** Дозволяє зробити другий стрибок у повітрі. Скидається при торканні землі.
  - **Візуалізація:** Невелика хмарка пилу/листя під лапами панди при здійсненні другого стрибка.

### 2. 🦔 Нові типи перешкод та динаміка
- **🪨 Каміння, що котиться (Rolling Rocks):**
  - **Опис:** Котиться назустріч панді з власною швидкістю.
  - **Візуалізація:** Колоподібний камінь із тріщинами, що крутиться під час руху (`ctx.rotate()`).
- **🐝 Рой диких бджіл (Bee Swarm):**
  - **Опис:** Летюча перешкода на середній висоті, що вимагає точного присідання (duck) або стрибка.
  - **Візуалізація:** Скупчення дрібних жовто-чорних точок з випадковими коливаннями координат.

### 3. 🌧️ Атмосферні та погодні ефекти
- **🌦️ Динамічна погода (Дощ та Гроза):**
  - **Опис:** Змінюється разом із циклом дня/ночі.
  - **Візуалізація:** Напівпрозорі похилі лінії дощу. Під час грози — випадкові миттєві спалахи світла (блискавки), що створюють ефект контрастних силуетів.
- **🍃 Ефект листя, що кружляє:**
  - **Опис:** Додаткові частинки в `ParticleSystem`, що створюють шлейф при підкатах панди або збиранні бонусів.

### 4. 🛒 Кастомізація та прогресія (Магазин скінів)
- **🪙 Валюта «Золотий бамбук»:**
  - Зібраний бамбук накопичується в `localStorage` (ключ `panda_runner_coins`).
- **🦊 Скіни для панди:**
  - *Червона панда (Red Panda)* — рудий колір, пухнастий хвіст.
  - *Панда Кунг-Фу* — червона пов'язка на голові.
  - *Кібер-панда* — темно-сіре тіло з неоново-зеленими елементами.

### 5. 🎶 Фонова музика (BGM)
- **🎹 Процедурний 8-бітний саундтрек:** *(Реалізовано ✅)*
  - **Опис:** Легка пентатонічна мелодія у східному стилі за допомогою Web Audio API.
  - **Особливість:** Музика динамічно прискорюється разом зі зростанням швидкості гри.
