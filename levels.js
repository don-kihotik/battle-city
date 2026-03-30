// ============================================================
// BATTLE CITY — 40 Level Definitions
// Each level: { map: 2D array of tile rows, enemies: [{type, count}], totalEnemies }
// Tile codes: 0=empty 1=brick 2=steel 3=water 4=trees
// Base (5) is always placed at rows 24-25, cols 12-13
// Base walls are always at fixed positions
// Maps are 26x26, but we define the interior (rows 0-22)
// Row 23-25 = base area (auto-generated)
//
// Enemy types: 'normal', 'fast', 'armored', 'heavy'
// Difficulty increases via: more enemies, tougher types, less cover
// ============================================================

// Helper: create empty 26x26 map
function emptyMap() {
  const m = [];
  for (let r = 0; r < 26; r++) {
    m[r] = [];
    for (let c = 0; c < 26; c++) m[r][c] = 0;
  }
  return m;
}

// Helper: stamp a rectangle of tiles onto map
function stamp(m, type, r, c, h, w) {
  for (let dr = 0; dr < h; dr++)
    for (let dc = 0; dc < w; dc++)
      if (r + dr < 23 && c + dc < 26 && r + dr >= 0 && c + dc >= 0)
        m[r + dr][c + dc] = type;
}

// Helper: add the base area (rows 23-25) — always the same
function addBase(m) {
  // Base walls (brick by default)
  m[23][11] = 1; m[23][12] = 1; m[23][13] = 1; m[23][14] = 1;
  m[24][11] = 1; m[25][11] = 1;
  m[24][14] = 1; m[25][14] = 1;
  // Base eagle
  m[24][12] = 5; m[24][13] = 5;
  m[25][12] = 5; m[25][13] = 5;
}

// ── Level definitions ───────────────────────────────────────

function buildLevel(n) {
  const m = emptyMap();
  let enemyDef;

  switch (n) {
    // ── STAGE 1-5: Tutorial / Easy ──────────────────────────
    case 1:
      // Classic starter: symmetric brick columns
      stamp(m, 1, 2, 2, 4, 2); stamp(m, 1, 2, 6, 4, 2); stamp(m, 1, 2, 10, 4, 2);
      stamp(m, 1, 2, 14, 4, 2); stamp(m, 1, 2, 18, 4, 2); stamp(m, 1, 2, 22, 4, 2);
      stamp(m, 1, 8, 2, 4, 2); stamp(m, 1, 8, 10, 4, 2);
      stamp(m, 1, 8, 14, 4, 2); stamp(m, 1, 8, 22, 4, 2);
      stamp(m, 1, 8, 12, 2, 2);
      stamp(m, 1, 14, 2, 4, 2); stamp(m, 1, 14, 6, 4, 2);
      stamp(m, 1, 14, 18, 4, 2); stamp(m, 1, 14, 22, 4, 2);
      stamp(m, 1, 20, 2, 2, 2); stamp(m, 1, 20, 6, 2, 2); stamp(m, 1, 20, 10, 2, 2);
      stamp(m, 1, 20, 14, 2, 2); stamp(m, 1, 20, 18, 2, 2); stamp(m, 1, 20, 22, 2, 2);
      enemyDef = { normal: 16, fast: 2, armored: 2, heavy: 0 };
      break;

    case 2:
      // Brick maze with water center
      stamp(m, 1, 2, 2, 6, 2); stamp(m, 1, 2, 6, 2, 6); stamp(m, 1, 2, 18, 2, 6);
      stamp(m, 1, 2, 22, 6, 2);
      stamp(m, 3, 10, 10, 4, 6); // big water center
      stamp(m, 1, 6, 10, 2, 6); stamp(m, 1, 16, 10, 2, 6);
      stamp(m, 1, 10, 6, 4, 2); stamp(m, 1, 10, 18, 4, 2);
      stamp(m, 1, 18, 4, 2, 4); stamp(m, 1, 18, 18, 2, 4);
      stamp(m, 1, 20, 8, 2, 2); stamp(m, 1, 20, 16, 2, 2);
      enemyDef = { normal: 14, fast: 4, armored: 2, heavy: 0 };
      break;

    case 3:
      // Steel corners, brick grid
      stamp(m, 2, 2, 2, 2, 2); stamp(m, 2, 2, 22, 2, 2);
      stamp(m, 1, 4, 4, 2, 4); stamp(m, 1, 4, 12, 2, 2); stamp(m, 1, 4, 18, 2, 4);
      stamp(m, 1, 8, 2, 2, 4); stamp(m, 1, 8, 8, 2, 2); stamp(m, 1, 8, 16, 2, 2); stamp(m, 1, 8, 20, 2, 4);
      stamp(m, 4, 10, 10, 4, 6); // trees center
      stamp(m, 1, 12, 4, 2, 4); stamp(m, 1, 12, 18, 2, 4);
      stamp(m, 1, 16, 2, 4, 2); stamp(m, 1, 16, 8, 2, 2); stamp(m, 1, 16, 16, 2, 2); stamp(m, 1, 16, 22, 4, 2);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      stamp(m, 2, 20, 12, 2, 2); // steel near base
      enemyDef = { normal: 14, fast: 4, armored: 2, heavy: 0 };
      break;

    case 4:
      // Horizontal corridors
      stamp(m, 1, 2, 0, 2, 11); stamp(m, 1, 2, 15, 2, 11);
      stamp(m, 1, 6, 4, 2, 8); stamp(m, 1, 6, 14, 2, 8);
      stamp(m, 2, 6, 12, 2, 2); // steel center
      stamp(m, 1, 10, 0, 2, 8); stamp(m, 1, 10, 10, 2, 6); stamp(m, 1, 10, 18, 2, 8);
      stamp(m, 3, 14, 4, 2, 4); stamp(m, 3, 14, 18, 2, 4); // water
      stamp(m, 1, 14, 10, 2, 6);
      stamp(m, 1, 18, 2, 2, 10); stamp(m, 1, 18, 14, 2, 10);
      stamp(m, 1, 20, 6, 2, 2); stamp(m, 1, 20, 18, 2, 2);
      enemyDef = { normal: 12, fast: 6, armored: 2, heavy: 0 };
      break;

    case 5:
      // Diamond pattern
      stamp(m, 1, 2, 12, 2, 2);
      stamp(m, 1, 4, 10, 2, 2); stamp(m, 1, 4, 14, 2, 2);
      stamp(m, 1, 6, 8, 2, 2); stamp(m, 1, 6, 12, 2, 2); stamp(m, 1, 6, 16, 2, 2);
      stamp(m, 1, 8, 6, 2, 2); stamp(m, 1, 8, 18, 2, 2);
      stamp(m, 1, 10, 4, 2, 2); stamp(m, 1, 10, 12, 2, 2); stamp(m, 1, 10, 20, 2, 2);
      stamp(m, 1, 12, 6, 2, 2); stamp(m, 1, 12, 18, 2, 2);
      stamp(m, 1, 14, 8, 2, 2); stamp(m, 1, 14, 16, 2, 2);
      stamp(m, 1, 16, 10, 2, 2); stamp(m, 1, 16, 14, 2, 2);
      stamp(m, 1, 18, 12, 2, 2);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      stamp(m, 2, 10, 10, 2, 2); stamp(m, 2, 10, 14, 2, 2);
      enemyDef = { normal: 10, fast: 6, armored: 4, heavy: 0 };
      break;

    // ── STAGE 6-10: Medium ──────────────────────────────────
    case 6:
      // Heavy brick fortress
      stamp(m, 1, 2, 4, 6, 2); stamp(m, 1, 2, 20, 6, 2);
      stamp(m, 1, 2, 6, 2, 14);
      stamp(m, 1, 6, 10, 2, 6);
      stamp(m, 2, 8, 12, 2, 2); // steel core
      stamp(m, 1, 10, 4, 4, 2); stamp(m, 1, 10, 20, 4, 2);
      stamp(m, 1, 10, 8, 2, 2); stamp(m, 1, 10, 16, 2, 2);
      stamp(m, 3, 12, 10, 2, 6); // water moat
      stamp(m, 1, 16, 2, 2, 8); stamp(m, 1, 16, 16, 2, 8);
      stamp(m, 1, 18, 6, 4, 2); stamp(m, 1, 18, 18, 4, 2);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 10, fast: 4, armored: 4, heavy: 2 };
      break;

    case 7:
      // Checkerboard pattern
      for (let r = 2; r < 22; r += 4) {
        for (let c = 2; c < 24; c += 4) {
          if ((r + c) % 8 === 2) stamp(m, 1, r, c, 2, 2);
          else stamp(m, 2, r, c, 1, 1);
        }
      }
      stamp(m, 3, 10, 10, 4, 6); // water center
      stamp(m, 1, 20, 4, 2, 2); stamp(m, 1, 20, 20, 2, 2);
      enemyDef = { normal: 8, fast: 6, armored: 4, heavy: 2 };
      break;

    case 8:
      // Spiral
      stamp(m, 1, 2, 2, 2, 20);
      stamp(m, 1, 2, 22, 16, 2);
      stamp(m, 1, 6, 6, 2, 16);
      stamp(m, 1, 6, 6, 10, 2);
      stamp(m, 1, 10, 10, 2, 12);
      stamp(m, 1, 10, 10, 6, 2);
      stamp(m, 1, 14, 14, 2, 4);
      stamp(m, 2, 16, 2, 2, 4); stamp(m, 2, 16, 20, 2, 4);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 8, fast: 6, armored: 4, heavy: 2 };
      break;

    case 9:
      // Island fortress with water moat
      stamp(m, 3, 6, 6, 2, 14); // water top
      stamp(m, 3, 14, 6, 2, 14); // water bottom
      stamp(m, 3, 6, 6, 10, 2); // water left
      stamp(m, 3, 6, 18, 10, 2); // water right
      stamp(m, 1, 8, 8, 6, 2); stamp(m, 1, 8, 16, 6, 2);
      stamp(m, 1, 8, 10, 2, 6);
      stamp(m, 2, 10, 12, 2, 2); // steel center
      stamp(m, 1, 2, 2, 2, 4); stamp(m, 1, 2, 20, 2, 4);
      stamp(m, 1, 18, 4, 2, 4); stamp(m, 1, 18, 18, 2, 4);
      stamp(m, 1, 20, 8, 2, 4); stamp(m, 1, 20, 14, 2, 4);
      enemyDef = { normal: 6, fast: 6, armored: 6, heavy: 2 };
      break;

    case 10:
      // Steel maze
      stamp(m, 2, 2, 4, 2, 2); stamp(m, 2, 2, 12, 2, 2); stamp(m, 2, 2, 20, 2, 2);
      stamp(m, 1, 4, 2, 4, 2); stamp(m, 1, 4, 8, 2, 4); stamp(m, 1, 4, 14, 2, 4); stamp(m, 1, 4, 22, 4, 2);
      stamp(m, 2, 8, 6, 2, 2); stamp(m, 2, 8, 18, 2, 2);
      stamp(m, 1, 8, 10, 4, 6);
      stamp(m, 2, 10, 12, 2, 2);
      stamp(m, 1, 14, 4, 2, 6); stamp(m, 1, 14, 16, 2, 6);
      stamp(m, 2, 16, 8, 2, 2); stamp(m, 2, 16, 16, 2, 2);
      stamp(m, 1, 18, 2, 2, 4); stamp(m, 1, 18, 10, 2, 6); stamp(m, 1, 18, 20, 2, 4);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 6, fast: 4, armored: 6, heavy: 4 };
      break;

    // ── STAGE 11-15: Medium-Hard ────────────────────────────
    case 11:
      // Cross pattern
      stamp(m, 1, 2, 10, 20, 2); stamp(m, 1, 2, 14, 20, 2); // vertical bars
      stamp(m, 1, 10, 2, 2, 22); // horizontal bar
      stamp(m, 2, 10, 10, 2, 2); stamp(m, 2, 10, 14, 2, 2);
      stamp(m, 4, 4, 4, 4, 4); stamp(m, 4, 4, 18, 4, 4);
      stamp(m, 1, 16, 4, 2, 4); stamp(m, 1, 16, 18, 2, 4);
      stamp(m, 1, 20, 6, 2, 2); stamp(m, 1, 20, 18, 2, 2);
      enemyDef = { normal: 6, fast: 6, armored: 6, heavy: 2 };
      break;

    case 12:
      // Dense urban — lots of small brick blocks
      for (let r = 2; r < 20; r += 3) {
        for (let c = 2; c < 24; c += 3) {
          if (Math.abs(r - 12) + Math.abs(c - 12) > 4) stamp(m, 1, r, c, 2, 2);
        }
      }
      stamp(m, 3, 11, 11, 2, 4); // water center
      stamp(m, 2, 20, 4, 2, 2); stamp(m, 2, 20, 20, 2, 2);
      enemyDef = { normal: 6, fast: 8, armored: 4, heavy: 2 };
      break;

    case 13:
      // Tunnels with water channels
      stamp(m, 1, 2, 2, 2, 22);
      stamp(m, 3, 4, 4, 2, 4); stamp(m, 3, 4, 18, 2, 4);
      stamp(m, 1, 6, 6, 2, 14);
      stamp(m, 3, 8, 8, 2, 4); stamp(m, 3, 8, 14, 2, 4);
      stamp(m, 1, 10, 2, 2, 6); stamp(m, 1, 10, 18, 2, 6);
      stamp(m, 2, 10, 10, 2, 6);
      stamp(m, 1, 14, 4, 2, 18);
      stamp(m, 3, 16, 6, 2, 4); stamp(m, 3, 16, 16, 2, 4);
      stamp(m, 1, 18, 2, 2, 8); stamp(m, 1, 18, 16, 2, 8);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 4, fast: 8, armored: 4, heavy: 4 };
      break;

    case 14:
      // Four rooms
      stamp(m, 1, 2, 2, 8, 2); stamp(m, 1, 2, 2, 2, 10); stamp(m, 1, 10, 2, 2, 10);
      stamp(m, 1, 2, 14, 2, 10); stamp(m, 1, 2, 22, 8, 2); stamp(m, 1, 10, 14, 2, 10);
      stamp(m, 1, 12, 2, 8, 2); stamp(m, 1, 12, 2, 2, 10); stamp(m, 1, 20, 2, 2, 10);
      stamp(m, 1, 12, 14, 2, 10); stamp(m, 1, 12, 22, 8, 2); stamp(m, 1, 20, 14, 2, 10);
      // doorways
      m[6][12] = 0; m[6][13] = 0; m[6][14] = 0;
      m[16][12] = 0; m[16][13] = 0; m[16][14] = 0;
      m[11][6] = 0; m[11][7] = 0; m[12][6] = 0; m[12][7] = 0;
      m[11][18] = 0; m[11][19] = 0; m[12][18] = 0; m[12][19] = 0;
      stamp(m, 2, 6, 6, 2, 2); stamp(m, 2, 6, 18, 2, 2);
      stamp(m, 2, 16, 6, 2, 2); stamp(m, 2, 16, 18, 2, 2);
      enemyDef = { normal: 4, fast: 6, armored: 6, heavy: 4 };
      break;

    case 15:
      // Open field — minimal cover
      stamp(m, 1, 4, 4, 2, 2); stamp(m, 1, 4, 20, 2, 2);
      stamp(m, 2, 8, 8, 2, 2); stamp(m, 2, 8, 16, 2, 2);
      stamp(m, 1, 12, 12, 2, 2);
      stamp(m, 2, 16, 4, 2, 2); stamp(m, 2, 16, 20, 2, 2);
      stamp(m, 1, 20, 8, 2, 2); stamp(m, 1, 20, 16, 2, 2);
      stamp(m, 4, 10, 4, 4, 4); stamp(m, 4, 10, 18, 4, 4);
      enemyDef = { normal: 4, fast: 8, armored: 4, heavy: 4 };
      break;

    // ── STAGE 16-20: Hard ───────────────────────────────────
    case 16:
      // Steel fortress
      stamp(m, 2, 2, 2, 2, 22);
      stamp(m, 2, 2, 2, 10, 2); stamp(m, 2, 2, 22, 10, 2);
      stamp(m, 1, 4, 6, 6, 2); stamp(m, 1, 4, 18, 6, 2);
      stamp(m, 1, 4, 10, 2, 6);
      stamp(m, 2, 8, 12, 2, 2); // steel center
      stamp(m, 1, 12, 4, 4, 2); stamp(m, 1, 12, 20, 4, 2);
      stamp(m, 3, 12, 10, 2, 6); // water
      stamp(m, 1, 16, 8, 2, 4); stamp(m, 1, 16, 14, 2, 4);
      stamp(m, 2, 18, 6, 2, 2); stamp(m, 2, 18, 18, 2, 2);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      enemyDef = { normal: 2, fast: 6, armored: 8, heavy: 4 };
      break;

    case 17:
      // Zigzag walls
      stamp(m, 1, 2, 2, 2, 8); stamp(m, 1, 4, 8, 2, 8); stamp(m, 1, 6, 2, 2, 8);
      stamp(m, 1, 8, 8, 2, 8); stamp(m, 1, 10, 2, 2, 8); stamp(m, 1, 12, 8, 2, 8);
      stamp(m, 1, 2, 16, 2, 8); stamp(m, 1, 4, 16, 2, 8);
      stamp(m, 2, 14, 4, 2, 4); stamp(m, 2, 14, 18, 2, 4);
      stamp(m, 1, 16, 10, 2, 6);
      stamp(m, 1, 18, 4, 2, 4); stamp(m, 1, 18, 18, 2, 4);
      stamp(m, 1, 20, 8, 2, 4); stamp(m, 1, 20, 14, 2, 4);
      stamp(m, 3, 8, 16, 4, 4); // water
      enemyDef = { normal: 2, fast: 8, armored: 6, heavy: 4 };
      break;

    case 18:
      // Dense forest with steel pillars
      stamp(m, 4, 2, 2, 8, 8); stamp(m, 4, 2, 16, 8, 8);
      stamp(m, 4, 12, 2, 8, 8); stamp(m, 4, 12, 16, 8, 8);
      stamp(m, 2, 4, 4, 2, 2); stamp(m, 2, 4, 20, 2, 2);
      stamp(m, 2, 8, 8, 2, 2); stamp(m, 2, 8, 16, 2, 2);
      stamp(m, 2, 14, 4, 2, 2); stamp(m, 2, 14, 20, 2, 2);
      stamp(m, 1, 10, 10, 2, 6);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      enemyDef = { normal: 2, fast: 6, armored: 6, heavy: 6 };
      break;

    case 19:
      // Water world
      stamp(m, 3, 2, 2, 4, 4); stamp(m, 3, 2, 20, 4, 4);
      stamp(m, 3, 6, 8, 2, 4); stamp(m, 3, 6, 14, 2, 4);
      stamp(m, 3, 12, 2, 4, 4); stamp(m, 3, 12, 20, 4, 4);
      stamp(m, 3, 16, 8, 2, 4); stamp(m, 3, 16, 14, 2, 4);
      stamp(m, 1, 4, 8, 2, 2); stamp(m, 1, 4, 16, 2, 2);
      stamp(m, 1, 8, 4, 2, 2); stamp(m, 1, 8, 12, 2, 2); stamp(m, 1, 8, 20, 2, 2);
      stamp(m, 1, 14, 8, 2, 2); stamp(m, 1, 14, 16, 2, 2);
      stamp(m, 2, 10, 10, 2, 6);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      stamp(m, 2, 18, 12, 2, 2);
      enemyDef = { normal: 2, fast: 8, armored: 6, heavy: 4 };
      break;

    case 20:
      // Boss level — mostly open with steel border
      stamp(m, 2, 2, 2, 2, 22);
      stamp(m, 2, 18, 2, 2, 22);
      stamp(m, 2, 2, 2, 18, 2); stamp(m, 2, 2, 22, 18, 2);
      stamp(m, 1, 6, 6, 2, 4); stamp(m, 1, 6, 16, 2, 4);
      stamp(m, 1, 10, 10, 4, 6);
      stamp(m, 2, 12, 12, 2, 2);
      stamp(m, 1, 14, 6, 2, 4); stamp(m, 1, 14, 16, 2, 4);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 6, armored: 8, heavy: 6 };
      break;

    // ── STAGE 21-25: Very Hard ──────────────────────────────
    case 21:
      stamp(m, 1, 2, 4, 2, 2); stamp(m, 1, 2, 10, 2, 6); stamp(m, 1, 2, 20, 2, 2);
      stamp(m, 2, 4, 2, 2, 2); stamp(m, 2, 4, 22, 2, 2);
      stamp(m, 1, 6, 6, 2, 4); stamp(m, 1, 6, 16, 2, 4);
      stamp(m, 3, 8, 10, 4, 6);
      stamp(m, 2, 8, 4, 2, 4); stamp(m, 2, 8, 18, 2, 4);
      stamp(m, 1, 12, 2, 4, 2); stamp(m, 1, 12, 22, 4, 2);
      stamp(m, 1, 14, 8, 2, 4); stamp(m, 1, 14, 14, 2, 4);
      stamp(m, 2, 16, 10, 2, 6);
      stamp(m, 1, 18, 4, 2, 4); stamp(m, 1, 18, 18, 2, 4);
      stamp(m, 1, 20, 8, 2, 4); stamp(m, 1, 20, 14, 2, 4);
      enemyDef = { normal: 0, fast: 8, armored: 6, heavy: 6 };
      break;

    case 22:
      // Narrow passages
      stamp(m, 2, 2, 0, 2, 10); stamp(m, 2, 2, 16, 2, 10);
      stamp(m, 1, 2, 10, 6, 2); stamp(m, 1, 2, 14, 6, 2);
      stamp(m, 2, 8, 4, 2, 6); stamp(m, 2, 8, 16, 2, 6);
      stamp(m, 1, 10, 10, 2, 6);
      stamp(m, 3, 12, 6, 2, 4); stamp(m, 3, 12, 16, 2, 4);
      stamp(m, 2, 14, 2, 2, 4); stamp(m, 2, 14, 20, 2, 4);
      stamp(m, 1, 16, 8, 2, 4); stamp(m, 1, 16, 14, 2, 4);
      stamp(m, 1, 18, 4, 2, 4); stamp(m, 1, 18, 18, 2, 4);
      stamp(m, 2, 20, 10, 2, 6);
      enemyDef = { normal: 0, fast: 6, armored: 8, heavy: 6 };
      break;

    case 23:
      // X pattern
      for (let i = 0; i < 10; i++) {
        stamp(m, 1, 2 + i * 2, 2 + i * 2, 2, 2);
        stamp(m, 1, 2 + i * 2, 22 - i * 2, 2, 2);
      }
      stamp(m, 2, 10, 10, 4, 6);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 8, armored: 6, heavy: 6 };
      break;

    case 24:
      // Fortress defense
      stamp(m, 2, 4, 4, 2, 18);
      stamp(m, 2, 4, 4, 12, 2); stamp(m, 2, 4, 22, 12, 2);
      stamp(m, 1, 8, 8, 2, 4); stamp(m, 1, 8, 14, 2, 4);
      stamp(m, 1, 12, 10, 2, 6);
      stamp(m, 3, 10, 10, 2, 6);
      stamp(m, 1, 16, 4, 2, 4); stamp(m, 1, 16, 18, 2, 4);
      stamp(m, 1, 18, 8, 2, 4); stamp(m, 1, 18, 14, 2, 4);
      stamp(m, 2, 20, 10, 2, 6);
      // openings in fortress wall
      m[6][12] = 0; m[6][13] = 0;
      m[10][4] = 0; m[10][5] = 0; m[10][22] = 0; m[10][23] = 0;
      enemyDef = { normal: 0, fast: 6, armored: 8, heavy: 6 };
      break;

    case 25:
      // Empty arena — pure skill
      stamp(m, 2, 4, 4, 2, 2); stamp(m, 2, 4, 20, 2, 2);
      stamp(m, 2, 10, 12, 2, 2);
      stamp(m, 2, 16, 4, 2, 2); stamp(m, 2, 16, 20, 2, 2);
      stamp(m, 1, 20, 8, 2, 2); stamp(m, 1, 20, 16, 2, 2);
      enemyDef = { normal: 0, fast: 8, armored: 6, heavy: 6 };
      break;

    // ── STAGE 26-30: Expert ─────────────────────────────────
    case 26:
      // Water channels + steel grid
      for (let r = 2; r < 20; r += 6) {
        stamp(m, 3, r, 4, 2, 18);
      }
      for (let c = 4; c < 22; c += 6) {
        stamp(m, 2, 2, c, 1, 2);
        stamp(m, 2, 8, c, 1, 2);
        stamp(m, 2, 14, c, 1, 2);
      }
      stamp(m, 1, 4, 6, 2, 4); stamp(m, 1, 4, 16, 2, 4);
      stamp(m, 1, 10, 8, 2, 4); stamp(m, 1, 10, 14, 2, 4);
      stamp(m, 1, 16, 10, 2, 6);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      enemyDef = { normal: 0, fast: 6, armored: 8, heavy: 6 };
      break;

    case 27:
      // Concentric rings
      stamp(m, 1, 2, 2, 2, 22); stamp(m, 1, 18, 2, 2, 22);
      stamp(m, 1, 2, 2, 18, 2); stamp(m, 1, 2, 22, 18, 2);
      stamp(m, 2, 6, 6, 2, 14); stamp(m, 2, 14, 6, 2, 14);
      stamp(m, 2, 6, 6, 10, 2); stamp(m, 2, 6, 18, 10, 2);
      stamp(m, 1, 10, 10, 2, 6);
      // openings
      m[2][12] = 0; m[2][13] = 0; m[18][12] = 0; m[18][13] = 0;
      m[6][12] = 0; m[6][13] = 0; m[14][12] = 0; m[14][13] = 0;
      m[10][6] = 0; m[10][7] = 0; m[10][18] = 0; m[10][19] = 0;
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 4, armored: 8, heavy: 8 };
      break;

    case 28:
      // Forest maze
      stamp(m, 4, 2, 2, 4, 22);
      stamp(m, 4, 8, 2, 4, 22);
      stamp(m, 4, 14, 2, 4, 22);
      stamp(m, 2, 4, 6, 2, 2); stamp(m, 2, 4, 18, 2, 2);
      stamp(m, 2, 10, 10, 2, 6);
      stamp(m, 2, 16, 6, 2, 2); stamp(m, 2, 16, 18, 2, 2);
      // Clear paths through
      stamp(m, 0, 2, 10, 2, 6); stamp(m, 0, 8, 6, 2, 4); stamp(m, 0, 8, 16, 2, 4);
      stamp(m, 0, 14, 10, 2, 6);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 6, armored: 6, heavy: 8 };
      break;

    case 29:
      // Scattered steel pillars
      for (let r = 2; r < 20; r += 3) {
        for (let c = 2; c < 24; c += 4) {
          stamp(m, 2, r, c, 2, 2);
        }
      }
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 0, fast: 4, armored: 8, heavy: 8 };
      break;

    case 30:
      // Half steel, half brick labyrinth
      stamp(m, 2, 2, 2, 4, 2); stamp(m, 1, 2, 4, 2, 4); stamp(m, 2, 2, 8, 2, 2);
      stamp(m, 1, 2, 14, 2, 4); stamp(m, 2, 2, 18, 2, 2); stamp(m, 1, 2, 20, 2, 4);
      stamp(m, 1, 6, 4, 4, 2); stamp(m, 2, 6, 10, 2, 6); stamp(m, 1, 6, 20, 4, 2);
      stamp(m, 2, 10, 2, 2, 4); stamp(m, 1, 10, 8, 2, 4); stamp(m, 1, 10, 14, 2, 4); stamp(m, 2, 10, 20, 2, 4);
      stamp(m, 1, 14, 4, 2, 4); stamp(m, 2, 14, 10, 2, 6); stamp(m, 1, 14, 18, 2, 4);
      stamp(m, 3, 12, 10, 2, 6); // water
      stamp(m, 2, 18, 4, 2, 4); stamp(m, 2, 18, 18, 2, 4);
      stamp(m, 1, 20, 8, 2, 4); stamp(m, 1, 20, 14, 2, 4);
      enemyDef = { normal: 0, fast: 4, armored: 6, heavy: 10 };
      break;

    // ── STAGE 31-35: Nightmare ──────────────────────────────
    case 31:
      // Steel city
      stamp(m, 2, 2, 2, 4, 2); stamp(m, 2, 2, 6, 4, 2); stamp(m, 2, 2, 10, 4, 2);
      stamp(m, 2, 2, 14, 4, 2); stamp(m, 2, 2, 18, 4, 2); stamp(m, 2, 2, 22, 4, 2);
      stamp(m, 1, 8, 4, 2, 4); stamp(m, 1, 8, 12, 2, 2); stamp(m, 1, 8, 18, 2, 4);
      stamp(m, 2, 12, 2, 2, 4); stamp(m, 2, 12, 20, 2, 4);
      stamp(m, 3, 12, 10, 2, 6);
      stamp(m, 1, 14, 8, 2, 4); stamp(m, 1, 14, 14, 2, 4);
      stamp(m, 2, 18, 6, 2, 2); stamp(m, 2, 18, 18, 2, 2);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      enemyDef = { normal: 0, fast: 4, armored: 8, heavy: 8 };
      break;

    case 32:
      // Water cross + steel
      stamp(m, 3, 2, 12, 20, 2);
      stamp(m, 3, 10, 2, 2, 22);
      stamp(m, 2, 2, 4, 2, 2); stamp(m, 2, 2, 20, 2, 2);
      stamp(m, 1, 4, 4, 4, 4); stamp(m, 1, 4, 18, 4, 4);
      stamp(m, 1, 14, 4, 4, 4); stamp(m, 1, 14, 18, 4, 4);
      stamp(m, 2, 6, 8, 2, 2); stamp(m, 2, 6, 16, 2, 2);
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      // clear intersections
      stamp(m, 0, 10, 12, 2, 2);
      enemyDef = { normal: 0, fast: 6, armored: 6, heavy: 8 };
      break;

    case 33:
      // Sparse cover
      stamp(m, 2, 6, 6, 2, 2); stamp(m, 2, 6, 18, 2, 2);
      stamp(m, 1, 10, 12, 2, 2);
      stamp(m, 2, 14, 6, 2, 2); stamp(m, 2, 14, 18, 2, 2);
      stamp(m, 4, 4, 10, 4, 6); // trees center
      stamp(m, 1, 20, 8, 2, 2); stamp(m, 1, 20, 16, 2, 2);
      enemyDef = { normal: 0, fast: 4, armored: 8, heavy: 8 };
      break;

    case 34:
      // Full steel border + inner maze
      stamp(m, 2, 2, 2, 2, 22); stamp(m, 2, 18, 2, 2, 22);
      stamp(m, 2, 2, 2, 18, 2); stamp(m, 2, 2, 22, 18, 2);
      stamp(m, 1, 6, 6, 2, 6); stamp(m, 1, 6, 14, 2, 6);
      stamp(m, 3, 10, 8, 2, 4); stamp(m, 3, 10, 14, 2, 4);
      stamp(m, 2, 10, 12, 2, 2);
      stamp(m, 1, 14, 6, 2, 4); stamp(m, 1, 14, 16, 2, 4);
      // openings
      m[2][12] = 0; m[2][13] = 0; m[18][12] = 0; m[18][13] = 0;
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 2, armored: 8, heavy: 10 };
      break;

    case 35:
      // Total war — almost empty
      stamp(m, 2, 10, 12, 2, 2);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 0, fast: 4, armored: 6, heavy: 10 };
      break;

    // ── STAGE 36-40: Insane ─────────────────────────────────
    case 36:
      // Maze of steel and water
      for (let r = 2; r < 20; r += 4) {
        stamp(m, 2, r, 2, 2, 10); stamp(m, 3, r, 14, 2, 10);
      }
      stamp(m, 1, 4, 12, 12, 2);
      stamp(m, 1, 20, 4, 2, 4); stamp(m, 1, 20, 18, 2, 4);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 0, fast: 2, armored: 8, heavy: 10 };
      break;

    case 37:
      // Scattered chaos
      for (let i = 0; i < 20; i++) {
        const r = 2 + (i * 7) % 18;
        const c = 2 + (i * 11) % 22;
        stamp(m, (i % 3 === 0) ? 2 : (i % 3 === 1) ? 3 : 1, r, c, 2, 2);
      }
      stamp(m, 1, 20, 6, 2, 4); stamp(m, 1, 20, 16, 2, 4);
      enemyDef = { normal: 0, fast: 4, armored: 6, heavy: 10 };
      break;

    case 38:
      // Triple fortress
      // Top fortress
      stamp(m, 2, 2, 8, 2, 10);
      stamp(m, 2, 2, 8, 6, 2); stamp(m, 2, 2, 16, 6, 2);
      stamp(m, 1, 4, 10, 2, 6);
      m[2][12] = 0; m[2][13] = 0;
      // Mid section
      stamp(m, 3, 10, 4, 2, 8); stamp(m, 3, 10, 14, 2, 8);
      stamp(m, 1, 12, 10, 2, 6);
      // Bottom
      stamp(m, 2, 16, 4, 2, 4); stamp(m, 2, 16, 18, 2, 4);
      stamp(m, 1, 18, 8, 2, 4); stamp(m, 1, 18, 14, 2, 4);
      stamp(m, 1, 20, 10, 2, 6);
      enemyDef = { normal: 0, fast: 2, armored: 8, heavy: 10 };
      break;

    case 39:
      // Absolute minimal cover
      stamp(m, 2, 10, 12, 2, 2);
      stamp(m, 1, 20, 10, 2, 2); stamp(m, 1, 20, 14, 2, 2);
      enemyDef = { normal: 0, fast: 2, armored: 6, heavy: 12 };
      break;

    case 40:
      // Final level — surrounded
      stamp(m, 2, 2, 2, 2, 22);
      stamp(m, 2, 2, 2, 20, 2); stamp(m, 2, 2, 22, 20, 2);
      stamp(m, 2, 20, 2, 2, 22);
      // Small openings
      m[2][12] = 0; m[2][13] = 0;
      m[20][12] = 0; m[20][13] = 0;
      m[10][2] = 0; m[10][3] = 0; m[10][22] = 0; m[10][23] = 0;
      // Inner
      stamp(m, 1, 6, 6, 2, 4); stamp(m, 1, 6, 16, 2, 4);
      stamp(m, 3, 10, 10, 2, 6);
      stamp(m, 1, 14, 6, 2, 4); stamp(m, 1, 14, 16, 2, 4);
      stamp(m, 2, 10, 12, 2, 2);
      enemyDef = { normal: 0, fast: 0, armored: 8, heavy: 12 };
      break;

    default:
      // For levels beyond 40, generate procedurally
      return buildProceduralLevel(n);
  }

  addBase(m);
  // Override enemy composition with progressive difficulty curve
  enemyDef = calculateEnemies(n);
  const total = enemyDef.normal + enemyDef.fast + enemyDef.armored + enemyDef.heavy;
  return { map: m, enemies: enemyDef, totalEnemies: total };
}

// ── Progressive enemy composition ───────────────────────────
// Level 1-2:   Normal only (intro)
// Level 3-4:   Fast introduced (1-2 per level)
// Level 5-7:   Armored introduced (1-2 per level)
// Level 8+:    Heavy introduced (1-2 at first)
// Level 20+:   No more normals, mostly armored + heavy
// Total enemies per level: 20 (constant, difficulty via composition + speed scaling)
function calculateEnemies(level) {
  const TOTAL = 20;
  let normal, fast, armored, heavy;

  if (level <= 2) {
    // Only normals — learn the game
    normal = TOTAL;
    fast = 0; armored = 0; heavy = 0;
  } else if (level <= 4) {
    // Fast tanks introduced
    fast = Math.min(level - 1, 4);       // 2-3
    normal = TOTAL - fast;
    armored = 0; heavy = 0;
  } else if (level <= 7) {
    // Armored introduced
    fast = 3 + Math.floor((level - 5) * 1.5);   // 3-6
    armored = level - 4;                          // 1-3
    normal = TOTAL - fast - armored;
    heavy = 0;
  } else {
    // Heavy introduced at level 8, normals phase out by level 20
    heavy = Math.min(1 + Math.floor((level - 8) * 0.75), 10); // 1→10 over levels 8-20
    armored = Math.min(2 + Math.floor((level - 5) * 0.6), 8); // 2→8
    fast = Math.min(3 + Math.floor((level - 5) * 0.4), 8);    // 3→8

    // Normal decreases linearly to 0 at level 20
    if (level >= 20) {
      normal = 0;
    } else {
      normal = Math.max(0, TOTAL - fast - armored - heavy);
    }

    // Ensure total = 20: redistribute overflow to heavy
    const sum = normal + fast + armored + heavy;
    if (sum > TOTAL) {
      // Trim from fast first, then armored
      const excess = sum - TOTAL;
      fast = Math.max(0, fast - excess);
      const sum2 = normal + fast + armored + heavy;
      if (sum2 > TOTAL) armored = Math.max(0, armored - (sum2 - TOTAL));
    } else if (sum < TOTAL) {
      // Fill remaining with heavy (post level 20) or fast
      if (level >= 20) heavy += (TOTAL - sum);
      else fast += (TOTAL - sum);
    }
  }

  return { normal, fast, armored, heavy };
}

// Procedural level generator for levels beyond 40
function buildProceduralLevel(n) {
  const m = emptyMap();
  const seed = n * 13 + 7;
  const rng = mulberry32(seed);

  // Difficulty scales with level
  const steelChance = Math.min(0.3, 0.05 + n * 0.005);
  const waterChance = Math.min(0.15, 0.02 + n * 0.003);
  const brickChance = Math.max(0.05, 0.25 - n * 0.003);

  for (let r = 2; r < 22; r += 2) {
    for (let c = 2; c < 24; c += 2) {
      // Don't block spawn points
      if (r <= 3 && (c <= 3 || (c >= 11 && c <= 14) || c >= 23)) continue;
      // Don't block player spawn
      if (r >= 22 && c >= 8 && c <= 17) continue;

      const val = rng();
      if (val < steelChance) stamp(m, 2, r, c, 2, 2);
      else if (val < steelChance + waterChance) stamp(m, 3, r, c, 2, 2);
      else if (val < steelChance + waterChance + brickChance) stamp(m, 1, r, c, 2, 2);
    }
  }

  // Always add some base protection
  stamp(m, 1, 20, 8, 2, 4); stamp(m, 1, 20, 14, 2, 4);

  addBase(m);

  const enemyDef = calculateEnemies(n);
  const total = enemyDef.normal + enemyDef.fast + enemyDef.armored + enemyDef.heavy;

  return {
    map: m,
    enemies: enemyDef,
    totalEnemies: total
  };
}

// Deterministic RNG
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Total number of designed levels
const TOTAL_LEVELS = 40;
