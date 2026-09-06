// Panda Runner - Browser Game
// Inspired by Google Chrome Dino Runner

(function() {
  'use strict';

  // Canvas roundRect Polyfill for broader browser support
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
      if (!radii) radii = 0;
      if (typeof radii === 'number') radii = [radii, radii, radii, radii];
      const r = Array.isArray(radii) ? radii : [0,0,0,0];
      const tl = r[0] || 0, tr = r[1] || r[0] || 0, br = r[2] || r[0] || 0, bl = r[3] || r[1] || r[0] || 0;
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      this.closePath();
      return this;
    };
  }

  // --- SOUND SYSTEM (Web Audio API) ---
  class SoundController {
    constructor() {
      this.ctx = null;
      this.isMuted = localStorage.getItem('panda_runner_muted') === 'true';
      this.initAudio();
    }

    initAudio() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      localStorage.setItem('panda_runner_muted', this.isMuted);
      return this.isMuted;
    }

    playJump() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playDuck() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    }

    playMilestone() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // First tone (C6: 1046 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1046, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Second tone (E6: 1318 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318, now + 0.11);
      gain2.gain.setValueAtTime(0.15, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.11);
      osc2.stop(now + 0.29);
    }

    playBonus() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.13);
      });
    }

    playHit() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    playClick() {
      if (this.isMuted) return;
      this.resume();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  // --- GAME CONSTANTS ---
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 320;
  const GROUND_Y = 260;
  const INITIAL_SPEED = 6.5;
  const MAX_SPEED = 14.5;
  const GRAVITY = 0.65;
  const JUMP_FORCE = -12.5;

  // --- PANDA CHARACTER ---
  class Panda {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = 80;
      this.y = GROUND_Y;
      this.vy = 0;
      this.isGrounded = true;
      this.isDucking = false;
      this.isHit = false;

      this.standWidth = 46;
      this.standHeight = 52;
      this.duckWidth = 58;
      this.duckHeight = 28;

      this.width = this.standWidth;
      this.height = this.standHeight;

      this.animTick = 0;
      this.blinkTimer = Math.random() * 150 + 100;
      this.isBlinking = false;
      this.rollAngle = 0;
    }

    getHitbox() {
      if (this.isDucking) {
        return {
          x: this.x + 4,
          y: this.y - this.height + 4,
          width: this.width - 8,
          height: this.height - 4
        };
      }
      return {
        x: this.x + 8,
        y: this.y - this.height + 4,
        width: this.width - 16,
        height: this.height - 6
      };
    }

    jump(sound) {
      if (this.isGrounded && !this.isHit) {
        this.vy = JUMP_FORCE;
        this.isGrounded = false;
        if (sound) sound.playJump();
        return true;
      }
      return false;
    }

    cutJump() {
      if (!this.isGrounded && this.vy < -4) {
        this.vy = -4;
      }
    }

    duck(isDucking, sound) {
      if (this.isHit) return;
      if (isDucking && !this.isDucking && sound) {
        sound.playDuck();
      }
      this.isDucking = isDucking;

      if (!this.isGrounded && isDucking) {
        this.vy += 1.2;
      }

      this.width = this.isDucking ? this.duckWidth : this.standWidth;
      this.height = this.isDucking ? this.duckHeight : this.standHeight;
    }

    update(particleSystem) {
      if (this.isHit) {
        if (!this.isGrounded) {
          this.vy += GRAVITY;
          this.y += this.vy;
          if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.vy = 0;
            this.isGrounded = true;
          }
        }
        return;
      }

      if (!this.isGrounded) {
        this.vy += GRAVITY;
        this.y += this.vy;

        if (this.y >= GROUND_Y) {
          this.y = GROUND_Y;
          this.vy = 0;
          this.isGrounded = true;
          particleSystem.createDust(this.x + this.width / 2, GROUND_Y, 5);
        }
      }

      this.animTick++;
      if (this.isGrounded && this.animTick % 7 === 0) {
        particleSystem.createDust(this.x + 4, GROUND_Y - 2, 1);
      }

      this.blinkTimer--;
      if (this.blinkTimer <= 0) {
        this.isBlinking = true;
        if (this.blinkTimer <= -8) {
          this.isBlinking = false;
          this.blinkTimer = Math.random() * 160 + 100;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.isHit) {
        this.drawHit(ctx);
      } else if (this.isDucking) {
        this.drawDucking(ctx);
      } else if (!this.isGrounded) {
        this.drawJumping(ctx);
      } else {
        this.drawRunning(ctx);
      }

      ctx.restore();
    }

    drawRunning(ctx) {
      const legPhase = Math.sin(this.animTick * 0.35);
      const bobY = Math.abs(Math.sin(this.animTick * 0.35)) * -3;

      ctx.translate(0, bobY);

      // Tail
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-2, -18, 5, 0, Math.PI * 2);
      ctx.fill();

      // Back leg
      ctx.fillStyle = '#1e1e1e';
      ctx.beginPath();
      ctx.roundRect(8 + legPhase * 7, -12, 10, 14, 5);
      ctx.fill();

      // Back arm
      ctx.beginPath();
      ctx.roundRect(28 - legPhase * 7, -22, 9, 14, 4);
      ctx.fill();

      // Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(20, -22, 18, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black shoulder saddle
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(23, -24, 11, 15, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // White belly overlay
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(15, -20, 11, 13, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Front leg
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.roundRect(10 - legPhase * 7, -12, 11, 14, 5);
      ctx.fill();

      // Front arm
      ctx.beginPath();
      ctx.roundRect(26 + legPhase * 7, -22, 10, 15, 5);
      ctx.fill();

      // Head
      this.drawHead(ctx, 32, -36, 0);
    }

    drawJumping(ctx) {
      // Tail
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-2, -18, 5, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(20, -24, 18, 16, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Black saddle
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(23, -25, 11, 15, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // White belly
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(15, -22, 10, 13, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Back legs spread
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.roundRect(4, -14, 12, 12, 5);
      ctx.fill();

      // Front arms reached
      ctx.beginPath();
      ctx.roundRect(30, -26, 14, 9, 4);
      ctx.fill();

      // Head
      this.drawHead(ctx, 34, -38, -0.1);
    }

    drawDucking(ctx) {
      ctx.translate(28, -14);
      this.rollAngle += 0.25;

      // Compact body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black saddle band
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(3, 0, 14, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // White inner belly
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6, 1, 13, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small tucked ears
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(14, -12, 4.5, 0, Math.PI * 2);
      ctx.arc(4, -13, 4, 0, Math.PI * 2);
      ctx.fill();

      // Low ducking face
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(16, -2, 5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(17, -2.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(22, 1, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tucked paws
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(-14, 8, 8, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(8, 8, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHit(ctx) {
      // Slumped back body
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-2, -10, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(18, -16, 18, 16, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(20, -18, 10, 14, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(14, -15, 11, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(4, -4, 9, 5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(28, -6, 9, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      const hx = 24;
      const hy = -32;

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(hx - 10, hy - 7, 5, 0, Math.PI * 2);
      ctx.arc(hx + 8, hy - 11, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(hx + 4, hy - 1, 5, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(hx - 5, hy - 1, 4.5, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Dizzy X eyes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(hx + 2, hy - 3);
      ctx.lineTo(hx + 6, hy + 1);
      ctx.moveTo(hx + 6, hy - 3);
      ctx.lineTo(hx + 2, hy + 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(hx - 7, hy - 3);
      ctx.lineTo(hx - 3, hy + 1);
      ctx.moveTo(hx - 3, hy - 3);
      ctx.lineTo(hx - 7, hy + 1);
      ctx.stroke();

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(hx, hy + 4, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx, hy + 8, 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Sweat drop
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      ctx.arc(hx + 15, hy - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHead(ctx, hx, hy, tilt) {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(tilt);

      // Black fluffy ears
      ctx.fillStyle = '#151515';
      ctx.beginPath();
      ctx.arc(-8, -12, 5.5, 0, Math.PI * 2);
      ctx.arc(9, -12, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e8a598';
      ctx.beginPath();
      ctx.arc(-8, -12, 2.5, 0, Math.PI * 2);
      ctx.arc(9, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // White fluffy head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Black eye patches
      ctx.fillStyle = '#181818';
      ctx.beginPath();
      ctx.ellipse(-5, -2, 4.5, 5.5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, -2, 5, 5.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      if (this.isBlinking) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-7, -2);
        ctx.lineTo(-3, -2);
        ctx.moveTo(4, -2);
        ctx.lineTo(8, -2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4.5, -2.5, 2, 0, Math.PI * 2);
        ctx.arc(6.5, -2.5, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-4.2, -2.5, 1.2, 0, Math.PI * 2);
        ctx.arc(6.8, -2.5, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4.6, -3, 0.7, 0, Math.PI * 2);
        ctx.arc(6.4, -3, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nose
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(1, 3, 2.2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smiling kawaii mouth
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-1.5, 6, 2, 0.1, Math.PI * 0.9);
      ctx.arc(2.5, 6, 2, 0.1, Math.PI * 0.9);
      ctx.stroke();

      // Pink blush
      ctx.fillStyle = 'rgba(255, 140, 160, 0.35)';
      ctx.beginPath();
      ctx.arc(-9, 3, 3, 0, Math.PI * 2);
      ctx.arc(10, 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- OBSTACLES & COLLECTIBLES ---
  class ObstacleManager {
    constructor() {
      this.obstacles = [];
      this.collectibles = [];
      this.distSinceLast = 0;
    }

    reset() {
      this.obstacles = [];
      this.collectibles = [];
      this.distSinceLast = 0;
    }

    update(speed, score, sound, panda, particleSystem, onBonusPickup) {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= speed;
        obs.animTick = (obs.animTick || 0) + 1;

        if (obs.x + obs.width < -60) {
          this.obstacles.splice(i, 1);
        }
      }

      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const col = this.collectibles[i];
        col.x -= speed;
        col.animTick = (col.animTick || 0) + 1;

        if (!col.collected && this.checkPandaCollision(panda, col.hitbox(col.x, col.y))) {
          col.collected = true;
          sound.playBonus();
          particleSystem.createSparkles(col.x + 15, col.y - 10, 12);
          particleSystem.createFloatingText('+100', col.x + 10, col.y - 20, '#f1c40f');
          onBonusPickup(100);
        }

        if (col.x < -60 || col.collected) {
          this.collectibles.splice(i, 1);
        }
      }

      this.distSinceLast += speed;
      const dynamicMinDist = Math.max(260, 340 + speed * 9);
      const spawnChance = Math.random();

      if (this.distSinceLast > dynamicMinDist && spawnChance < 0.08) {
        this.spawnObstacle(score);
        this.distSinceLast = 0;

        if (Math.random() < 0.28) {
          this.spawnCollectible();
        }
      }
    }

    spawnObstacle(score) {
      const types = ['bamboo_small', 'bamboo_tall', 'bamboo_cluster', 'rock'];

      if (score > 180) {
        types.push('crane');
        if (score > 400) types.push('crane');
      }

      const selectedType = types[Math.floor(Math.random() * types.length)];
      let obstacle;

      if (selectedType === 'bamboo_small') {
        obstacle = {
          type: 'bamboo_small',
          x: CANVAS_WIDTH + 20,
          y: GROUND_Y,
          width: 24,
          height: 44,
          hitbox: (x, y) => ({ x: x + 4, y: y - 44, width: 16, height: 44 })
        };
      } else if (selectedType === 'bamboo_tall') {
        obstacle = {
          type: 'bamboo_tall',
          x: CANVAS_WIDTH + 20,
          y: GROUND_Y,
          width: 26,
          height: 64,
          hitbox: (x, y) => ({ x: x + 4, y: y - 64, width: 18, height: 64 })
        };
      } else if (selectedType === 'bamboo_cluster') {
        obstacle = {
          type: 'bamboo_cluster',
          x: CANVAS_WIDTH + 20,
          y: GROUND_Y,
          width: 52,
          height: 52,
          hitbox: (x, y) => ({ x: x + 6, y: y - 52, width: 40, height: 52 })
        };
      } else if (selectedType === 'rock') {
        obstacle = {
          type: 'rock',
          x: CANVAS_WIDTH + 20,
          y: GROUND_Y,
          width: 38,
          height: 28,
          hitbox: (x, y) => ({ x: x + 3, y: y - 28, width: 32, height: 26 })
        };
      } else if (selectedType === 'crane') {
        const heights = [
          GROUND_Y - 24,
          GROUND_Y - 54,
          GROUND_Y - 95
        ];
        const flyY = heights[Math.floor(Math.random() * heights.length)];
        obstacle = {
          type: 'crane',
          x: CANVAS_WIDTH + 20,
          y: flyY,
          width: 44,
          height: 28,
          animTick: 0,
          hitbox: (x, y) => ({ x: x + 6, y: y - 20, width: 32, height: 20 })
        };
      }

      this.obstacles.push(obstacle);
    }

    spawnCollectible() {
      const hoverY = Math.random() < 0.5 ? GROUND_Y - 40 : GROUND_Y - 80;
      this.collectibles.push({
        x: CANVAS_WIDTH + 140,
        y: hoverY,
        width: 26,
        height: 32,
        collected: false,
        animTick: 0,
        hitbox: (x, y) => ({ x: x, y: y - 28, width: 26, height: 30 })
      });
    }

    checkPandaCollision(panda, targetBox) {
      const pBox = panda.getHitbox();
      return (
        pBox.x < targetBox.x + targetBox.width &&
        pBox.x + pBox.width > targetBox.x &&
        pBox.y < targetBox.y + targetBox.height &&
        pBox.y + pBox.height > targetBox.y
      );
    }

    checkCollisions(panda) {
      for (const obs of this.obstacles) {
        const oBox = obs.hitbox(obs.x, obs.y);
        if (this.checkPandaCollision(panda, oBox)) {
          return true;
        }
      }
      return false;
    }

    draw(ctx) {
      for (const col of this.collectibles) {
        this.drawCollectible(ctx, col);
      }

      for (const obs of this.obstacles) {
        if (obs.type === 'bamboo_small') {
          this.drawBamboo(ctx, obs.x, obs.y, 44);
        } else if (obs.type === 'bamboo_tall') {
          this.drawBamboo(ctx, obs.x, obs.y, 64);
        } else if (obs.type === 'bamboo_cluster') {
          this.drawBambooCluster(ctx, obs.x, obs.y);
        } else if (obs.type === 'rock') {
          this.drawRock(ctx, obs.x, obs.y);
        } else if (obs.type === 'crane') {
          this.drawCrane(ctx, obs.x, obs.y, obs.animTick);
        }
      }
    }

    drawBamboo(ctx, x, y, height) {
      ctx.save();
      const stalkWidth = 14;

      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.roundRect(x + 5, y - height, stalkWidth, height, [4, 4, 0, 0]);
      ctx.fill();

      ctx.strokeStyle = '#1e8449';
      ctx.lineWidth = 2.5;
      const segments = Math.floor(height / 14);
      for (let s = 1; s < segments; s++) {
        const segY = y - s * 14;
        ctx.beginPath();
        ctx.moveTo(x + 3, segY);
        ctx.lineTo(x + 5 + stalkWidth + 2, segY);
        ctx.stroke();
      }

      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.ellipse(x + 3, y - height + 16, 9, 3, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + stalkWidth + 7, y - height + 26, 11, 4, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + stalkWidth / 2 + 5, y - height - 2, 10, 4, -0.3, 0, Math.PI * 2);
      ctx.ellipse(x + stalkWidth / 2 + 7, y - height - 4, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawBambooCluster(ctx, x, y) {
      this.drawBamboo(ctx, x, y, 40);
      this.drawBamboo(ctx, x + 16, y, 56);
      this.drawBamboo(ctx, x + 34, y, 36);
    }

    drawRock(ctx, x, y) {
      ctx.save();
      ctx.fillStyle = '#5d6d7e';
      ctx.beginPath();
      ctx.ellipse(x + 19, y - 12, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.ellipse(x + 18, y - 20, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(x + 22, y - 24);
      ctx.lineTo(x + 26, y - 32);
      ctx.lineTo(x + 29, y - 24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawCrane(ctx, x, y, tick) {
      ctx.save();
      ctx.translate(x, y);

      const wingCycle = Math.sin(tick * 0.25);

      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.ellipse(20, -8, 16, 8, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(-4, -12);
      ctx.lineTo(2, -4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f8f9fa';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(32, -8);
      ctx.quadraticCurveTo(38, -14, 40, -18);
      ctx.stroke();

      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(40, -19, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(42, -18);
      ctx.lineTo(50, -17);
      ctx.lineTo(42, -16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ecf0f1';
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (wingCycle > 0) {
        ctx.moveTo(14, -8);
        ctx.quadraticCurveTo(20, -26, 28, -24);
        ctx.lineTo(22, -8);
      } else {
        ctx.moveTo(14, -8);
        ctx.quadraticCurveTo(20, 8, 28, 6);
        ctx.lineTo(22, -8);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    drawCollectible(ctx, col) {
      ctx.save();
      const floatY = Math.sin(col.animTick * 0.1) * 4;
      ctx.translate(col.x, col.y + floatY);

      ctx.shadowColor = 'rgba(241, 196, 15, 0.7)';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(13, -26);
      ctx.quadraticCurveTo(26, -10, 22, 2);
      ctx.lineTo(4, 2);
      ctx.quadraticCurveTo(0, -10, 13, -26);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.quadraticCurveTo(13, -12, 20, -2);
      ctx.lineTo(17, 2);
      ctx.lineTo(9, 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.ellipse(13, -28, 5, 2.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(15, -29, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // --- ENVIRONMENT & PARALLAX ---
  class Environment {
    constructor() {
      this.groundX = 0;
      this.forestX = 0;
      this.mountainX = 0;
      this.clouds = [
        { x: 120, y: 50, scale: 1.0, speed: 0.3 },
        { x: 380, y: 80, scale: 0.7, speed: 0.2 },
        { x: 700, y: 40, scale: 1.2, speed: 0.35 }
      ];
      this.ambientLeaves = [];
      for (let i = 0; i < 10; i++) {
        this.ambientLeaves.push(this.createLeaf(Math.random() * CANVAS_WIDTH));
      }
      this.stars = [];
      for (let i = 0; i < 40; i++) {
        this.stars.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * (GROUND_Y - 80),
          size: Math.random() * 1.8 + 0.8,
          blinkOffset: Math.random() * Math.PI * 2
        });
      }
    }

    createLeaf(startX) {
      return {
        x: startX,
        y: Math.random() * (GROUND_Y - 40),
        vx: Math.random() * 1.5 + 2.0,
        vy: Math.random() * 0.8 + 0.3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: Math.random() * 4 + 5
      };
    }

    update(speed, score) {
      this.groundX = (this.groundX - speed) % 60;
      this.forestX = (this.forestX - speed * 0.3) % 400;
      this.mountainX = (this.mountainX - speed * 0.08) % 600;

      for (const cloud of this.clouds) {
        cloud.x -= cloud.speed + speed * 0.05;
        if (cloud.x < -120) {
          cloud.x = CANVAS_WIDTH + 60;
          cloud.y = Math.random() * 70 + 30;
        }
      }

      for (const leaf of this.ambientLeaves) {
        leaf.x -= leaf.vx + speed * 0.3;
        leaf.y += leaf.vy;
        leaf.rot += leaf.rotSpeed;

        if (leaf.x < -20 || leaf.y > GROUND_Y) {
          Object.assign(leaf, this.createLeaf(CANVAS_WIDTH + Math.random() * 80));
          leaf.y = Math.random() * 100;
        }
      }
    }

    getCycleProgress(score) {
      const cycleLength = 700;
      return (score % cycleLength) / cycleLength;
    }

    draw(ctx, score) {
      const cycle = this.getCycleProgress(score);
      let skyTop, skyBottom, isNight = false, nightOpacity = 0;

      if (cycle < 0.4) {
        skyTop = '#c7ecee';
        skyBottom = '#dff9fb';
      } else if (cycle < 0.55) {
        const t = (cycle - 0.4) / 0.15;
        skyTop = '#e056fd';
        skyBottom = '#ffbe76';
        nightOpacity = t * 0.4;
      } else if (cycle < 0.85) {
        skyTop = '#0c1024';
        skyBottom = '#1e2749';
        isNight = true;
        nightOpacity = 1;
      } else {
        const t = (cycle - 0.85) / 0.15;
        skyTop = '#2c3e50';
        skyBottom = '#f39c12';
        nightOpacity = 1 - t;
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

      if (nightOpacity > 0.05) {
        ctx.save();
        ctx.globalAlpha = nightOpacity;
        for (const star of this.stars) {
          const twinkle = (Math.sin(Date.now() * 0.003 + star.blinkOffset) + 1) * 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }

        const moonX = CANVAS_WIDTH - 120;
        const moonY = 60;
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = skyTop;
        ctx.beginPath();
        ctx.arc(moonX - 7, moonY - 4, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.65)';
      for (const cloud of this.clouds) {
        this.drawCloud(ctx, cloud.x, cloud.y, cloud.scale);
      }
      ctx.restore();

      this.drawMountains(ctx, this.mountainX, isNight);
      this.drawBambooSilhouette(ctx, this.forestX, isNight);
      this.drawGround(ctx, this.groundX, isNight);

      ctx.fillStyle = isNight ? '#27ae60' : '#2ecc71';
      for (const leaf of this.ambientLeaves) {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawCloud(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.arc(16, -6, 20, 0, Math.PI * 2);
      ctx.arc(36, 0, 15, 0, Math.PI * 2);
      ctx.arc(18, 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawMountains(ctx, offsetX, isNight) {
      ctx.save();
      ctx.fillStyle = isNight ? '#161e38' : '#a4b0be';
      ctx.globalAlpha = 0.55;

      const mWidth = 600;
      for (let i = -1; i < 3; i++) {
        const mx = offsetX + i * mWidth;
        ctx.beginPath();
        ctx.moveTo(mx, GROUND_Y);
        ctx.lineTo(mx + 150, GROUND_Y - 100);
        ctx.lineTo(mx + 300, GROUND_Y - 60);
        ctx.lineTo(mx + 450, GROUND_Y - 120);
        ctx.lineTo(mx + 600, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    drawBambooSilhouette(ctx, offsetX, isNight) {
      ctx.save();
      ctx.fillStyle = isNight ? '#1a2e22' : '#7bed9f';
      ctx.globalAlpha = isNight ? 0.6 : 0.35;

      const chunk = 400;
      for (let i = -1; i < 4; i++) {
        const fx = offsetX + i * chunk;

        for (let j = 0; j < 6; j++) {
          const sx = fx + j * 60;
          ctx.fillRect(sx, GROUND_Y - 75, 4, 75);
          ctx.beginPath();
          ctx.ellipse(sx + 6, GROUND_Y - 60, 10, 3, 0.4, 0, Math.PI * 2);
          ctx.ellipse(sx - 6, GROUND_Y - 45, 8, 2.5, -0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        const px = fx + 240;
        ctx.beginPath();
        ctx.moveTo(px, GROUND_Y - 50);
        ctx.lineTo(px + 30, GROUND_Y - 70);
        ctx.lineTo(px + 60, GROUND_Y - 50);
        ctx.fill();
        ctx.fillRect(px + 12, GROUND_Y - 50, 36, 50);
      }
      ctx.restore();
    }

    drawGround(ctx, offsetX, isNight) {
      ctx.fillStyle = isNight ? '#101712' : '#273c2c';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      ctx.strokeStyle = isNight ? '#27ae60' : '#55efc4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();

      ctx.fillStyle = isNight ? '#2ecc71' : '#a8e6cf';
      for (let x = offsetX; x < CANVAS_WIDTH + 60; x += 30) {
        ctx.fillRect(x, GROUND_Y + 4, 3, 3);
        ctx.fillRect(x + 12, GROUND_Y + 7, 2, 2);
        ctx.fillRect(x + 20, GROUND_Y + 12, 4, 2);
      }
    }
  }

  // --- PARTICLE SYSTEM ---
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.floatingTexts = [];
    }

    reset() {
      this.particles = [];
      this.floatingTexts = [];
    }

    createDust(x, y, count) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          type: 'dust',
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 4,
          vx: -(Math.random() * 2 + 1.5),
          vy: -(Math.random() * 1.5 + 0.2),
          size: Math.random() * 3 + 2,
          alpha: 0.7,
          decay: 0.04
        });
      }
    }

    createSparkles(x, y, count) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.particles.push({
          type: 'sparkle',
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 2,
          color: Math.random() < 0.5 ? '#f1c40f' : '#2ecc71',
          alpha: 1,
          decay: 0.03
        });
      }
    }

    createFloatingText(text, x, y, color) {
      this.floatingTexts.push({
        text: text,
        x: x,
        y: y,
        vy: -1.2,
        alpha: 1,
        color: color || '#f1c40f'
      });
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const t = this.floatingTexts[i];
        t.y += t.vy;
        t.alpha -= 0.02;

        if (t.alpha <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();

      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        if (p.type === 'dust') {
          ctx.fillStyle = '#bdc3c7';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'sparkle') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      for (const t of this.floatingTexts) {
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.fillStyle = t.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
      }

      ctx.restore();
    }
  }

  // --- MAIN GAME CONTROLLER ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');

      this.scoreDisplay = document.getElementById('scoreDisplay');
      this.hiScoreDisplay = document.getElementById('hiScoreDisplay');
      this.startOverlay = document.getElementById('startOverlay');
      this.gameOverOverlay = document.getElementById('gameOverOverlay');
      this.pauseOverlay = document.getElementById('pauseOverlay');
      this.finalScore = document.getElementById('finalScore');
      this.finalHiScore = document.getElementById('finalHiScore');
      this.newRecordAlert = document.getElementById('newRecordAlert');

      this.soundBtn = document.getElementById('soundBtn');
      this.soundIcon = document.getElementById('soundIcon');
      this.pauseBtn = document.getElementById('pauseBtn');
      this.pauseIcon = document.getElementById('pauseIcon');
      this.startGameBtn = document.getElementById('startGameBtn');
      this.restartBtn = document.getElementById('restartBtn');
      this.resumeBtn = document.getElementById('resumeBtn');
      this.touchJumpBtn = document.getElementById('touchJumpBtn');
      this.touchDuckBtn = document.getElementById('touchDuckBtn');

      this.sound = new SoundController();
      this.panda = new Panda();
      this.obstacles = new ObstacleManager();
      this.env = new Environment();
      this.particles = new ParticleSystem();

      this.state = 'START';
      this.score = 0;
      this.distance = 0;
      this.speed = INITIAL_SPEED;
      this.hiScore = parseInt(localStorage.getItem('panda_runner_hi') || '0', 10);
      this.lastMilestone = 0;

      this.keys = {};

      this.updateHiScoreDisplay();
      this.updateSoundButton();
      this.bindEvents();

      this.render();
    }

    updateHiScoreDisplay() {
      const padded = String(this.hiScore).padStart(5, '0');
      this.hiScoreDisplay.textContent = `HI ${padded}`;
    }

    updateScoreDisplay() {
      const padded = String(Math.floor(this.score)).padStart(5, '0');
      this.scoreDisplay.textContent = padded;
    }

    updateSoundButton() {
      this.soundIcon.textContent = this.sound.isMuted ? '🔇' : '🔊';
    }

    bindEvents() {
      window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        this.keys[e.code] = true;

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          this.handleJumpPress();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          this.handleDuckPress(true);
        } else if (e.code === 'KeyP') {
          e.preventDefault();
          this.togglePause();
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          this.toggleSound();
        } else if (e.code === 'KeyR' && this.state === 'GAMEOVER') {
          e.preventDefault();
          this.restart();
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.panda.cutJump();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          this.handleDuckPress(false);
        }
      });

      this.canvas.addEventListener('pointerdown', () => {
        this.handleJumpPress();
      });

      this.canvas.addEventListener('pointerup', () => {
        this.panda.cutJump();
      });

      this.startGameBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.start();
      });

      this.restartBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.restart();
      });

      this.resumeBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.togglePause();
      });

      this.soundBtn.addEventListener('click', () => {
        this.toggleSound();
      });

      this.pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });

      this.touchJumpBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleJumpPress();
      });

      this.touchJumpBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.panda.cutJump();
      });

      this.touchDuckBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleDuckPress(true);
      });

      this.touchDuckBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.handleDuckPress(false);
      });

      window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
          e.preventDefault();
        }
      }, { passive: false });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'RUNNING') {
          this.togglePause();
        }
      });
    }

    handleJumpPress() {
      if (this.state === 'START') {
        this.start();
      } else if (this.state === 'GAMEOVER') {
        this.restart();
      } else if (this.state === 'RUNNING') {
        this.panda.jump(this.sound);
      }
    }

    handleDuckPress(isDucking) {
      if (this.state === 'RUNNING') {
        this.panda.duck(isDucking, this.sound);
      }
    }

    toggleSound() {
      this.sound.toggleMute();
      this.updateSoundButton();
    }

    togglePause() {
      if (this.state === 'RUNNING') {
        this.state = 'PAUSED';
        this.pauseOverlay.classList.add('active');
        this.pauseIcon.textContent = '▶️';
      } else if (this.state === 'PAUSED') {
        this.state = 'RUNNING';
        this.pauseOverlay.classList.remove('active');
        this.pauseIcon.textContent = '⏸️';
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
      }
    }

    start() {
      this.state = 'RUNNING';
      this.startOverlay.classList.remove('active');
      this.gameOverOverlay.classList.remove('active');
      this.pauseOverlay.classList.remove('active');
      this.panda.jump(this.sound);
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    restart() {
      this.score = 0;
      this.distance = 0;
      this.speed = INITIAL_SPEED;
      this.lastMilestone = 0;
      this.panda.reset();
      this.obstacles.reset();
      this.particles.reset();
      this.updateScoreDisplay();

      this.scoreDisplay.classList.remove('score-flash');
      this.newRecordAlert.style.display = 'none';
      this.start();
    }

    gameOver() {
      this.state = 'GAMEOVER';
      this.panda.isHit = true;
      this.sound.playHit();

      const finalVal = Math.floor(this.score);
      this.finalScore.textContent = finalVal;

      let isNewRecord = false;
      if (finalVal > this.hiScore) {
        this.hiScore = finalVal;
        localStorage.setItem('panda_runner_hi', this.hiScore);
        this.updateHiScoreDisplay();
        isNewRecord = true;
      }

      this.finalHiScore.textContent = this.hiScore;
      this.newRecordAlert.style.display = isNewRecord ? 'block' : 'none';

      setTimeout(() => {
        this.gameOverOverlay.classList.add('active');
      }, 400);
    }

    loop(timestamp) {
      if (this.state !== 'RUNNING') return;

      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      if (this.state === 'RUNNING') {
        requestAnimationFrame(this.loop.bind(this));
      }
    }

    update(dt) {
      this.speed = Math.min(MAX_SPEED, INITIAL_SPEED + (this.score / 100) * 0.45);

      this.distance += this.speed;
      this.score = this.distance / 10;
      this.updateScoreDisplay();

      const currentHundred = Math.floor(this.score / 100);
      if (currentHundred > this.lastMilestone && currentHundred > 0) {
        this.lastMilestone = currentHundred;
        this.sound.playMilestone();
        this.scoreDisplay.classList.add('score-flash');
        setTimeout(() => {
          this.scoreDisplay.classList.remove('score-flash');
        }, 1200);
      }

      this.env.update(this.speed, this.score);
      this.panda.update(this.particles);
      this.obstacles.update(
        this.speed,
        this.score,
        this.sound,
        this.panda,
        this.particles,
        (bonusPoints) => {
          this.distance += bonusPoints * 10;
          this.score += bonusPoints;
          this.updateScoreDisplay();
        }
      );
      this.particles.update();

      if (this.obstacles.checkCollisions(this.panda)) {
        this.gameOver();
      }
    }

    render() {
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      this.env.draw(this.ctx, this.score);
      this.obstacles.draw(this.ctx);
      this.panda.draw(this.ctx);
      this.particles.draw(this.ctx);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.pandaGame = new Game();
  });
})();
