// ============================================================
// BATTLE CITY — Full Game Engine
// 2 Players, 40+ Levels, Power-ups, Leaderboard
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const TILE = 16;
const COLS = 26;
const ROWS = 26;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;
document.getElementById('hud').style.width = canvas.width + 'px';

// ── Tile types ──────────────────────────────────────────────
const T = { EMPTY: 0, BRICK: 1, STEEL: 2, WATER: 3, TREES: 4, BASE: 5, BASE_DEAD: 6 };

// ── Power-up types ──────────────────────────────────────────
const PW = { STAR: 'star', SHIELD: 'shield', BOMB: 'bomb', TIMER: 'timer', LIFE: 'life', SHOVEL: 'shovel' };
const PW_LIST = Object.values(PW);
const PW_COLORS = { [PW.STAR]: '#fc0', [PW.SHIELD]: '#3cbcfc', [PW.BOMB]: '#f44', [PW.TIMER]: '#bcbcbc', [PW.LIFE]: '#4f4', [PW.SHOVEL]: '#d87050' };
const PW_LABELS = { [PW.STAR]: 'S', [PW.SHIELD]: 'A', [PW.BOMB]: 'B', [PW.TIMER]: 'T', [PW.LIFE]: '+', [PW.SHOVEL]: 'F' };

// ── Colors ──────────────────────────────────────────────────
const COLORS = { [T.BRICK]: '#b53120', [T.STEEL]: '#bcbcbc', [T.WATER]: '#3cbcfc', [T.TREES]: '#30a020', [T.BASE]: '#fcfc00', [T.BASE_DEAD]: '#888' };

// ── Directions ──────────────────────────────────────────────
const DIR = { UP: { dx: 0, dy: -1 }, DOWN: { dx: 0, dy: 1 }, LEFT: { dx: -1, dy: 0 }, RIGHT: { dx: 1, dy: 0 } };
const DIR_LIST = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];

// ── Base wall positions ─────────────────────────────────────
const BASE_WALLS = [
  { r: 23, c: 11 }, { r: 23, c: 12 }, { r: 23, c: 13 }, { r: 23, c: 14 },
  { r: 24, c: 11 }, { r: 25, c: 11 }, { r: 24, c: 14 }, { r: 25, c: 14 },
];

// ── Spawn points ────────────────────────────────────────────
const PLAYER_SPAWNS = [{ x: 9 * TILE, y: 24 * TILE }, { x: 15 * TILE, y: 24 * TILE }];
const ENEMY_SPAWNS = [{ x: 1 * TILE, y: 1 * TILE }, { x: 12 * TILE, y: 1 * TILE }, { x: 24 * TILE, y: 1 * TILE }];

// ── Game state ──────────────────────────────────────────────
let map, players, enemies, bullets, explosions, powerUps, notifications;
let score, lives1, lives2, enemiesLeft, currentLevel;
let gameState, twoPlayerMode, frameCount, spawnTimer, spawnIndex, totalSpawned;
let freezeTimer, shovelTimer;
let keys = {};

const MAX_ENEMIES = 4;
const SPAWN_INTERVAL = 180;
const FREEZE_DUR = 300;
const SHIELD_DUR = 300;
const SHOVEL_DUR = 600;

// ── Leaderboard ─────────────────────────────────────────────
const LB_KEY = 'battlecity_leaderboard';
let lastEntryIndex = -1;

function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; }
  catch { return []; }
}
function saveLeaderboard(lb) {
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}
function addToLeaderboard(name, score, level, mode) {
  const lb = loadLeaderboard();
  const entry = { name, score, level, mode, date: Date.now() };
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  const trimmed = lb.slice(0, 10);
  saveLeaderboard(trimmed);
  lastEntryIndex = trimmed.indexOf(entry);
  return trimmed;
}
function showLeaderboard() {
  hideAllScreens();
  const screen = document.getElementById('leaderboard-screen');
  screen.style.display = 'flex';
  const tbody = document.getElementById('lb-body');
  const lb = loadLeaderboard();
  if (lb.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:16px;">Пока пусто. Играй!</td></tr>';
  } else {
    tbody.innerHTML = lb.map((e, i) => {
      const cls = i === lastEntryIndex ? 'class="new-entry"' : '';
      return `<tr ${cls}><td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td><td>${e.level}</td><td>${e.mode}</td></tr>`;
    }).join('');
  }
  gameState = 'leaderboard';
  lastEntryIndex = -1;
}
function clearLeaderboard() {
  localStorage.removeItem(LB_KEY);
  showLeaderboard();
}

// ── Name entry ──────────────────────────────────────────────
let nameEntry = '';
let awaitingName = false;

function promptName() {
  awaitingName = true;
  nameEntry = '';
  const msg = document.getElementById('end-stats');
  msg.innerHTML += '<br><br><span style="color:#fc0;">ВВЕДИ ИМЯ (буквы, потом ENTER):</span><br><span id="name-input" style="color:#fff;font-size:16px;">_</span>';
}

function updateNameDisplay() {
  const el = document.getElementById('name-input');
  if (el) el.textContent = (nameEntry || '') + '_';
}

// ── Tank drawing ────────────────────────────────────────────
function drawTankPixels(x, y, dir, c1, c2, size) {
  const s = size, hs = s / 2;
  ctx.save();
  ctx.translate(x + hs, y + hs);
  if (dir === DIR.RIGHT) ctx.rotate(Math.PI / 2);
  else if (dir === DIR.DOWN) ctx.rotate(Math.PI);
  else if (dir === DIR.LEFT) ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = c1;
  ctx.fillRect(-hs + 1, -hs + 3, 4, s - 4);
  ctx.fillRect(hs - 5, -hs + 3, 4, s - 4);
  ctx.fillStyle = c2;
  ctx.fillRect(-hs + 5, -hs + 4, s - 10, s - 6);
  ctx.fillStyle = c1;
  ctx.fillRect(-2, -hs + 2, 4, hs);
  ctx.fillRect(-4, -2, 8, 8);
  ctx.fillStyle = '#000';
  for (let i = 0; i < 4; i++) {
    const ty = -hs + 5 + i * 6;
    ctx.fillRect(-hs + 1, ty, 4, 1);
    ctx.fillRect(hs - 5, ty, 4, 1);
  }
  ctx.restore();
}

// ── Tank class ──────────────────────────────────────────────
class Tank {
  constructor(x, y, dir, speed, c1, c2, playerIndex, hp) {
    this.x = x; this.y = y; this.dir = dir;
    this.speed = speed; this.c1 = c1; this.c2 = c2;
    this.playerIndex = playerIndex; // -1=enemy, 0=P1, 1=P2
    this.isPlayer = playerIndex >= 0;
    this.size = TILE * 2;
    this.alive = true;
    this.hp = hp || 1;
    this.maxHp = this.hp;
    this.shootCooldown = 0;
    this.aiChangeDir = 0;
    this.shieldTimer = this.isPlayer ? 120 : 0;
    this.starLevel = 0;
    this.hasPowerUp = false;
  }

  get bulletSpeed() { return this.isPlayer ? 4 + this.starLevel : 3; }
  get shootCD() { return this.isPlayer ? Math.max(8, 15 - this.starLevel * 4) : 40; }

  draw() {
    if (!this.alive) return;
    drawTankPixels(this.x, this.y, this.dir, this.c1, this.c2, this.size);
    // Shield
    if (this.shieldTimer > 0) {
      ctx.strokeStyle = this.shieldTimer % 8 < 4 ? '#fff' : '#3cbcfc';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 1, this.y - 1, this.size + 2, this.size + 2);
    }
    // Power-up enemy flashes
    if (!this.isPlayer && this.hasPowerUp && frameCount % 16 < 8) {
      ctx.fillStyle = 'rgba(255,0,0,0.4)';
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    // HP bar for heavy enemies
    if (!this.isPlayer && this.maxHp > 1 && this.hp > 0) {
      const barW = this.size - 4;
      const filled = (this.hp / this.maxHp) * barW;
      ctx.fillStyle = '#400';
      ctx.fillRect(this.x + 2, this.y - 4, barW, 3);
      ctx.fillStyle = this.hp > this.maxHp / 2 ? '#4f4' : '#f44';
      ctx.fillRect(this.x + 2, this.y - 4, filled, 3);
    }
    // Star indicators
    if (this.isPlayer && this.starLevel > 0) {
      ctx.fillStyle = '#fc0';
      for (let i = 0; i < this.starLevel; i++)
        ctx.fillRect(this.x + 2 + i * 6, this.y - 5, 4, 3);
    }
  }

  canMoveTo(nx, ny) {
    if (nx < 0 || ny < 0 || nx + this.size > COLS * TILE || ny + this.size > ROWS * TILE) return false;
    const sc = Math.floor(nx / TILE), ec = Math.floor((nx + this.size - 1) / TILE);
    const sr = Math.floor(ny / TILE), er = Math.floor((ny + this.size - 1) / TILE);
    for (let r = sr; r <= er; r++)
      for (let c = sc; c <= ec; c++) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
        const t = map[r][c];
        if (t === T.BRICK || t === T.STEEL || t === T.WATER || t === T.BASE) return false;
      }
    const all = [...players.filter(p => p !== this), ...enemies.filter(e => e !== this)];
    for (const o of all)
      if (o && o.alive && rectsOverlap(nx, ny, this.size, this.size, o.x, o.y, o.size, o.size)) return false;
    return true;
  }

  move(dir) {
    this.dir = dir;
    const nx = this.x + dir.dx * this.speed;
    const ny = this.y + dir.dy * this.speed;
    let ax = nx, ay = ny;
    if (dir.dx !== 0) { ay = Math.round(ny / (TILE / 2)) * (TILE / 2); if (!this.canMoveTo(nx, ay)) ay = ny; }
    if (dir.dy !== 0) { ax = Math.round(nx / (TILE / 2)) * (TILE / 2); if (!this.canMoveTo(ax, ny)) ax = nx; }
    if (this.canMoveTo(dir.dx !== 0 ? nx : ax, dir.dy !== 0 ? ny : ay)) {
      this.x = dir.dx !== 0 ? nx : ax;
      this.y = dir.dy !== 0 ? ny : ay;
    }
  }

  shoot() {
    if (this.shootCooldown > 0) return;
    this.shootCooldown = this.shootCD;
    const cx = this.x + this.size / 2, cy = this.y + this.size / 2;
    bullets.push(new Bullet(cx - 2 + this.dir.dx * (this.size / 2), cy - 2 + this.dir.dy * (this.size / 2), this.dir, this.bulletSpeed, this.playerIndex));
  }

  update() {
    if (!this.alive) return;
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.shieldTimer > 0) this.shieldTimer--;
  }

  aiUpdate() {
    if (!this.alive || freezeTimer > 0) return;
    this.aiChangeDir--;
    if (this.aiChangeDir <= 0) {
      this.dir = Math.random() < 0.4 ? DIR.DOWN : DIR_LIST[Math.floor(Math.random() * 4)];
      this.aiChangeDir = 60 + Math.floor(Math.random() * 120);
    }
    this.move(this.dir);
    if (!this.canMoveTo(this.x + this.dir.dx * this.speed, this.y + this.dir.dy * this.speed)) {
      this.dir = DIR_LIST[Math.floor(Math.random() * 4)];
      this.aiChangeDir = 30 + Math.floor(Math.random() * 60);
    }
    if (Math.random() < 0.025) this.shoot();
  }
}

// ── Bullet class ────────────────────────────────────────────
class Bullet {
  constructor(x, y, dir, speed, ownerIndex) {
    this.x = x; this.y = y; this.dir = dir; this.speed = speed;
    this.ownerIndex = ownerIndex;
    this.isPlayer = ownerIndex >= 0;
    this.alive = true; this.size = 4;
  }

  update() {
    if (!this.alive) return;
    this.x += this.dir.dx * this.speed;
    this.y += this.dir.dy * this.speed;
    if (this.x < 0 || this.y < 0 || this.x >= COLS * TILE || this.y >= ROWS * TILE) { this.alive = false; return; }

    const c1 = Math.floor(this.x / TILE), r1 = Math.floor(this.y / TILE);
    const c2 = Math.floor((this.x + this.size - 1) / TILE), r2 = Math.floor((this.y + this.size - 1) / TILE);
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
        const tile = map[r][c];
        if (tile === T.BRICK) { map[r][c] = T.EMPTY; this.alive = false; addExplosion(c * TILE + TILE / 2, r * TILE + TILE / 2, 8); }
        else if (tile === T.STEEL) { this.alive = false; addExplosion(c * TILE + TILE / 2, r * TILE + TILE / 2, 4); }
        else if (tile === T.BASE) { map[r][c] = T.BASE_DEAD; this.alive = false; addExplosion(c * TILE + TILE / 2, r * TILE + TILE / 2, 20); endGame(false); }
      }

    if (this.isPlayer) {
      for (const e of enemies) {
        if (!e.alive || e.shieldTimer > 0) continue;
        if (pointInRect(this.x, this.y, e.x, e.y, e.size, e.size)) {
          this.alive = false;
          e.hp--;
          if (e.hp <= 0) {
            if (e.hasPowerUp) spawnPowerUp();
            e.alive = false;
            const pts = e.maxHp >= 4 ? 400 : e.maxHp >= 2 ? 200 : e.speed >= 2 ? 150 : 100;
            score += pts;
            addExplosion(e.x + e.size / 2, e.y + e.size / 2, 16);
          } else {
            addExplosion(this.x, this.y, 6);
          }
          updateHUD();
        }
      }
    } else {
      for (const p of players) {
        if (!p || !p.alive || p.shieldTimer > 0) continue;
        if (pointInRect(this.x, this.y, p.x, p.y, p.size, p.size)) {
          this.alive = false;
          addExplosion(p.x + p.size / 2, p.y + p.size / 2, 16);
          playerDie(p.playerIndex);
        }
      }
    }
    for (const o of bullets) {
      if (o === this || !o.alive) continue;
      if (rectsOverlap(this.x, this.y, this.size, this.size, o.x, o.y, o.size, o.size)) { this.alive = false; o.alive = false; }
    }
  }

  draw() {
    if (!this.alive) return;
    ctx.fillStyle = this.isPlayer ? '#fcfc00' : '#fc6';
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// ── Power-up class ──────────────────────────────────────────
class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.alive = true; this.timer = 600; this.size = TILE * 2;
  }
  draw() {
    if (!this.alive) return;
    ctx.fillStyle = frameCount % 20 < 10 ? 'rgba(0,0,0,0.7)' : 'rgba(50,50,50,0.7)';
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.strokeStyle = PW_COLORS[this.type]; ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 1, this.y + 1, this.size - 2, this.size - 2);
    ctx.fillStyle = PW_COLORS[this.type];
    ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(PW_LABELS[this.type], this.x + this.size / 2, this.y + this.size / 2 + 1);
  }
  update() {
    if (!this.alive) return;
    this.timer--;
    if (this.timer <= 0) { this.alive = false; return; }
    for (const p of players) {
      if (!p || !p.alive) continue;
      if (rectsOverlap(this.x, this.y, this.size, this.size, p.x, p.y, p.size, p.size)) {
        this.alive = false;
        applyPowerUp(this.type, p);
        addExplosion(this.x + this.size / 2, this.y + this.size / 2, 10);
      }
    }
  }
}

function spawnPowerUp() {
  const type = PW_LIST[Math.floor(Math.random() * PW_LIST.length)];
  for (let a = 0; a < 50; a++) {
    const c = 2 + Math.floor(Math.random() * (COLS - 4));
    const r = 2 + Math.floor(Math.random() * (ROWS - 6));
    if (map[r][c] === T.EMPTY && map[r + 1][c] === T.EMPTY && map[r][c + 1] === T.EMPTY && map[r + 1][c + 1] === T.EMPTY) {
      powerUps.push(new PowerUp(c * TILE, r * TILE, type));
      return;
    }
  }
}

function applyPowerUp(type, p) {
  const who = p.playerIndex === 0 ? 'P1' : 'P2';
  switch (type) {
    case PW.STAR:
      if (p.starLevel < 3) p.starLevel++;
      notify(who, 'УСИЛЕНИЕ!', '#fc0');
      break;
    case PW.SHIELD:
      p.shieldTimer = SHIELD_DUR;
      notify(who, 'ЩИТ!', '#3cbcfc');
      break;
    case PW.BOMB:
      for (const e of enemies) { if (e.alive) { addExplosion(e.x + e.size / 2, e.y + e.size / 2, 16); e.alive = false; score += 100; } }
      notify(who, 'БОМБА!', '#f44');
      break;
    case PW.TIMER:
      freezeTimer = FREEZE_DUR;
      notify(who, 'ЗАМОРОЗКА!', '#bcbcbc');
      break;
    case PW.LIFE:
      if (p.playerIndex === 0) lives1++; else lives2++;
      notify(who, '+1 ЖИЗНЬ!', '#4f4');
      break;
    case PW.SHOVEL:
      for (const { r, c } of BASE_WALLS) if (map[r][c] !== T.BASE && map[r][c] !== T.BASE_DEAD) map[r][c] = T.STEEL;
      shovelTimer = SHOVEL_DUR;
      notify(who, 'УКРЕПЛЕНИЕ!', '#d87050');
      break;
  }
  updateHUD();
}

// ── Notifications ───────────────────────────────────────────
function notify(who, text, color) { notifications.push({ who, text, color, timer: 90 }); }
function drawNotifications() {
  for (let i = 0; i < notifications.length; i++) {
    const n = notifications[i];
    ctx.globalAlpha = Math.min(1, n.timer / 30);
    ctx.fillStyle = n.color;
    ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${n.who}: ${n.text}`, canvas.width / 2, 40 + i * 18);
    ctx.globalAlpha = 1;
  }
}

// ── Explosions ──────────────────────────────────────────────
function addExplosion(x, y, size) { explosions.push({ x, y, maxSize: size, timer: 12 }); }
function drawExplosions() {
  for (const ex of explosions) {
    const t = ex.timer / 12, s = ex.maxSize * (1.5 - Math.abs(t - 0.5));
    ctx.fillStyle = t > 0.5 ? '#fc0' : '#f60';
    ctx.beginPath(); ctx.arc(ex.x, ex.y, s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex.x, ex.y, s * 0.4, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Utility ─────────────────────────────────────────────────
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) { return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2; }
function pointInRect(px, py, rx, ry, rw, rh) { return px >= rx && px < rx + rw && py >= ry && py < ry + rh; }

// ── Draw map ────────────────────────────────────────────────
function drawMap() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const tile = map[r][c]; if (tile === T.EMPTY || tile === T.TREES) continue;
    const x = c * TILE, y = r * TILE;
    if (tile === T.BRICK) {
      ctx.fillStyle = '#b53120'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#d87050';
      ctx.fillRect(x, y, TILE, 1); ctx.fillRect(x, y + TILE / 2, TILE, 1);
      ctx.fillRect(x + TILE / 2, y, 1, TILE / 2); ctx.fillRect(x, y + TILE / 2, 1, TILE / 2);
    } else if (tile === T.STEEL) {
      ctx.fillStyle = '#bcbcbc'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, TILE / 2 - 1, TILE / 2 - 1);
      ctx.fillStyle = '#808080'; ctx.fillRect(x + TILE / 2, y + TILE / 2, TILE / 2 - 1, TILE / 2 - 1);
    } else if (tile === T.WATER) {
      ctx.fillStyle = '#3cbcfc'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#6cf';
      const off = (frameCount >> 3) % 4;
      for (let i = 0; i < 4; i++) { ctx.fillRect(x + ((i * 4 + off) % TILE), y + 4, 3, 1); ctx.fillRect(x + ((i * 4 + off + 2) % TILE), y + 10, 3, 1); }
    } else if (tile === T.BASE) {
      ctx.fillStyle = '#fcfc00'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 4, y + 3, 8, 2); ctx.fillRect(x + 6, y + 5, 4, 6); ctx.fillRect(x + 3, y + 7, 10, 2);
    } else if (tile === T.BASE_DEAD) {
      ctx.fillStyle = '#888'; ctx.fillRect(x, y, TILE, TILE); ctx.fillStyle = '#444'; ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
    }
  }
}
function drawTrees() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (map[r][c] !== T.TREES) continue;
    const x = c * TILE, y = r * TILE;
    ctx.fillStyle = '#30a020'; ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = '#1a8010';
    for (let i = 0; i < 3; i++) { ctx.fillRect(x + i * 5 + 1, y + 2, 3, 3); ctx.fillRect(x + i * 5 + 3, y + 8, 3, 3); }
  }
}

// ── HUD ─────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('lives1').textContent = lives1;
  document.getElementById('stars1').textContent = players[0] ? players[0].starLevel : 0;
  document.getElementById('score').textContent = score;
  document.getElementById('hud-level').textContent = currentLevel;
  const alive = enemies.filter(e => e.alive).length;
  document.getElementById('enemies-left').textContent = enemiesLeft + alive;
  if (twoPlayerMode) {
    document.getElementById('lives2').textContent = lives2;
    document.getElementById('stars2').textContent = players[1] ? players[1].starLevel : 0;
  }
}

// ── Player death ────────────────────────────────────────────
function playerDie(idx) {
  if (idx === 0) { lives1--; if (lives1 > 0) respawn(0); else players[0].alive = false; }
  else { lives2--; if (lives2 > 0) respawn(1); else players[1].alive = false; }
  updateHUD();
  const p1d = !players[0] || (!players[0].alive && lives1 <= 0);
  const p2d = !twoPlayerMode || !players[1] || (!players[1].alive && lives2 <= 0);
  if (p1d && p2d) endGame(false);
}

function respawn(idx) {
  const p = players[idx];
  p.x = PLAYER_SPAWNS[idx].x; p.y = PLAYER_SPAWNS[idx].y;
  p.dir = DIR.UP; p.shieldTimer = 120; p.starLevel = 0; p.alive = true;
}

// ── Screen management ───────────────────────────────────────
function hideAllScreens() {
  ['start-screen', 'level-screen', 'end-screen', 'leaderboard-screen'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('game-wrapper').style.display = 'none';
}

// ── Enemy types factory ─────────────────────────────────────
function createEnemy(spawnPt, type) {
  switch (type) {
    case 'fast':    return new Tank(spawnPt.x, spawnPt.y, DIR.DOWN, 2, '#e06060', '#901010', -1, 1);
    case 'armored': return new Tank(spawnPt.x, spawnPt.y, DIR.DOWN, 1, '#30a020', '#1a6010', -1, 2);
    case 'heavy':   return new Tank(spawnPt.x, spawnPt.y, DIR.DOWN, 1, '#a020a0', '#601060', -1, 4);
    default:        return new Tank(spawnPt.x, spawnPt.y, DIR.DOWN, 1, '#bcbcbc', '#808080', -1, 1);
  }
}

// ── Enemy spawn queue ───────────────────────────────────────
let enemyQueue = [];

function buildEnemyQueue(def) {
  const q = [];
  for (let i = 0; i < (def.normal || 0); i++) q.push('normal');
  for (let i = 0; i < (def.fast || 0); i++) q.push('fast');
  for (let i = 0; i < (def.armored || 0); i++) q.push('armored');
  for (let i = 0; i < (def.heavy || 0); i++) q.push('heavy');
  // Shuffle
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q[i], q[j]] = [q[j], q[i]];
  }
  return q;
}

function trySpawnEnemy() {
  if (enemyQueue.length === 0) return;
  const alive = enemies.filter(e => e.alive).length;
  if (alive >= MAX_ENEMIES) return;

  const sp = ENEMY_SPAWNS[spawnIndex % ENEMY_SPAWNS.length];
  spawnIndex++;

  const blocked = [...players, ...enemies].some(t =>
    t && t.alive && rectsOverlap(sp.x, sp.y, TILE * 2, TILE * 2, t.x, t.y, t.size, t.size)
  );
  if (blocked) return;

  const type = enemyQueue.shift();
  const enemy = createEnemy(sp, type);
  enemy.shieldTimer = 30;

  // Every 4th enemy carries a power-up
  totalSpawned++;
  if (totalSpawned % 4 === 0) enemy.hasPowerUp = true;

  enemies.push(enemy);
  enemiesLeft = enemyQueue.length;
  updateHUD();
}

// ── Shovel timer ────────────────────────────────────────────
function updateShovel() {
  if (shovelTimer > 0) {
    shovelTimer--;
    if (shovelTimer === 0) {
      for (const { r, c } of BASE_WALLS) if (map[r][c] === T.STEEL) map[r][c] = T.BRICK;
    }
  }
}

// ── Level transition ────────────────────────────────────────
let levelTransitionTimer = 0;

function showLevelScreen(lvl) {
  currentLevel = lvl;
  hideAllScreens();
  document.getElementById('level-screen').style.display = 'flex';
  document.getElementById('stage-num').textContent = lvl;
  gameState = 'level-transition';
  levelTransitionTimer = 120; // ~2 sec
}

function startLevel(lvl) {
  currentLevel = lvl;
  const levelData = buildLevel(lvl);

  // Deep copy map
  map = levelData.map.map(row => [...row]);

  const p1 = new Tank(PLAYER_SPAWNS[0].x, PLAYER_SPAWNS[0].y, DIR.UP, 2, '#fcfc00', '#d89000', 0);
  players = [p1];
  if (twoPlayerMode) {
    players.push(new Tank(PLAYER_SPAWNS[1].x, PLAYER_SPAWNS[1].y, DIR.UP, 2, '#40e040', '#208020', 1));
    document.getElementById('hud-p2').style.display = '';
  } else {
    document.getElementById('hud-p2').style.display = 'none';
  }

  enemies = []; bullets = []; explosions = []; powerUps = []; notifications = [];
  enemyQueue = buildEnemyQueue(levelData.enemies);
  enemiesLeft = enemyQueue.length;
  frameCount = 0; spawnTimer = 0; spawnIndex = 0; totalSpawned = 0;
  freezeTimer = 0; shovelTimer = 0;

  hideAllScreens();
  document.getElementById('game-wrapper').style.display = 'flex';
  gameState = 'playing';
  updateHUD();
}

// ── End game ────────────────────────────────────────────────
function endGame(won) {
  if (gameState === 'gameover' || gameState === 'win') return;
  gameState = won ? 'win' : 'gameover';

  // Small delay before showing screen
  setTimeout(() => {
    hideAllScreens();
    const screen = document.getElementById('end-screen');
    const title = document.getElementById('end-title');
    const stats = document.getElementById('end-stats');
    screen.style.display = 'flex';

    if (won && currentLevel < 40) {
      title.textContent = `УРОВЕНЬ ${currentLevel} ПРОЙДЕН!`;
      title.style.color = '#4f4';
      stats.innerHTML = `Счёт: ${score}<br>Жизни P1: ${lives1}${twoPlayerMode ? ' | P2: ' + lives2 : ''}<br><br><span style="color:#fc0;">Нажми ENTER для следующего уровня</span>`;
      gameState = 'level-complete';
    } else if (won) {
      title.textContent = 'ИГРА ПРОЙДЕНА!';
      title.style.color = '#fc0';
      stats.innerHTML = `Все 40 уровней пройдены!<br>Финальный счёт: ${score}`;
      gameState = 'win';
      promptName();
    } else {
      title.textContent = 'GAME OVER';
      title.style.color = '#e44';
      stats.innerHTML = `Уровень: ${currentLevel}<br>Счёт: ${score}`;
      gameState = 'gameover';
      promptName();
    }
  }, 1000);
}

// ── Input ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  keys[e.code] = true;

  // Name entry mode
  if (awaitingName) {
    if (e.code === 'Enter' && nameEntry.length > 0) {
      awaitingName = false;
      addToLeaderboard(nameEntry, score, currentLevel, twoPlayerMode ? '2P' : '1P');
      showLeaderboard();
      return;
    }
    if (e.code === 'Backspace') {
      nameEntry = nameEntry.slice(0, -1);
      updateNameDisplay();
      return;
    }
    if (e.key.length === 1 && nameEntry.length < 10 && /[a-zA-Zа-яА-Я0-9 _\-]/.test(e.key)) {
      nameEntry += e.key.toUpperCase();
      updateNameDisplay();
      return;
    }
    return;
  }

  if (gameState === 'start' || gameState === 'gameover' || gameState === 'win') {
    if (e.code === 'Digit1' || e.code === 'Numpad1') { twoPlayerMode = false; lives1 = 3; lives2 = 3; score = 0; showLevelScreen(1); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { twoPlayerMode = true; lives1 = 3; lives2 = 3; score = 0; showLevelScreen(1); }
    else if (e.code === 'KeyL') showLeaderboard();
  }

  if (gameState === 'level-complete') {
    if (e.code === 'Enter') showLevelScreen(currentLevel + 1);
  }

  if (gameState === 'leaderboard') {
    if (e.code === 'Escape') { hideAllScreens(); document.getElementById('start-screen').style.display = 'flex'; gameState = 'start'; }
    else if (e.code === 'KeyC') clearLeaderboard();
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// ── Player input ────────────────────────────────────────────
function handleInput() {
  const p1 = players[0];
  if (p1 && p1.alive) {
    // In 1-player mode, arrows also control P1
    const useArrows = !twoPlayerMode;
    if (keys['KeyW'] || (useArrows && keys['ArrowUp'])) p1.move(DIR.UP);
    else if (keys['KeyS'] || (useArrows && keys['ArrowDown'])) p1.move(DIR.DOWN);
    else if (keys['KeyA'] || (useArrows && keys['ArrowLeft'])) p1.move(DIR.LEFT);
    else if (keys['KeyD'] || (useArrows && keys['ArrowRight'])) p1.move(DIR.RIGHT);
    if (keys['Space']) p1.shoot();
    p1.update();
  }
  if (twoPlayerMode && players[1]) {
    const p2 = players[1];
    if (p2.alive) {
      if (keys['ArrowUp']) p2.move(DIR.UP);
      else if (keys['ArrowDown']) p2.move(DIR.DOWN);
      else if (keys['ArrowLeft']) p2.move(DIR.LEFT);
      else if (keys['ArrowRight']) p2.move(DIR.RIGHT);
      if (keys['Numpad0'] || keys['NumpadEnter'] || keys['ShiftRight']) p2.shoot();
      p2.update();
    }
  }
}

// ── Main loop ───────────────────────────────────────────────
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // Level transition countdown
  if (gameState === 'level-transition') {
    levelTransitionTimer--;
    if (levelTransitionTimer <= 0) startLevel(currentLevel);
    return;
  }

  if (gameState !== 'playing') return;
  frameCount++;

  handleInput();
  if (freezeTimer > 0) freezeTimer--;
  updateShovel();

  // Enemy spawn
  spawnTimer++;
  if (spawnTimer >= SPAWN_INTERVAL) { spawnTimer = 0; trySpawnEnemy(); }
  if (frameCount === 1) { trySpawnEnemy(); trySpawnEnemy(); trySpawnEnemy(); }

  for (const e of enemies) { e.update(); e.aiUpdate(); }
  for (const b of bullets) b.update();
  bullets = bullets.filter(b => b.alive);
  for (const pw of powerUps) pw.update();
  powerUps = powerUps.filter(pw => pw.alive);

  for (const n of notifications) n.timer--;
  notifications = notifications.filter(n => n.timer > 0);
  for (const ex of explosions) ex.timer--;
  explosions = explosions.filter(ex => ex.timer > 0);

  enemies = enemies.filter(e => e.alive);

  // Win condition
  if (enemyQueue.length === 0 && enemies.length === 0 && gameState === 'playing') {
    endGame(true);
  }

  // ── Render ──
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMap();

  // Freeze overlay
  if (freezeTimer > 0 && frameCount % 40 < 20) {
    ctx.fillStyle = 'rgba(60,188,252,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (const p of players) if (p && p.alive) p.draw();
  for (const e of enemies) e.draw();
  for (const b of bullets) b.draw();
  for (const pw of powerUps) pw.draw();

  drawTrees(); // trees on top
  drawExplosions();
  drawNotifications();
}

// ── Start ───────────────────────────────────────────────────
gameState = 'start';
currentLevel = 1;
gameLoop();
