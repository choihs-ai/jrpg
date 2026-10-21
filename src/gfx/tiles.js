'use strict';
// ─────────────────────────────────────────────────────────────
// Tiles: 16x16 타일을 코드로 그려 캐시한다 (자동 타일: 물가, 벽면, 지붕)
// ─────────────────────────────────────────────────────────────
const Tiles = (() => {
  const S = 16;
  const cache = new Map();
  // 벽면(앞면) 판정에 쓰는 벽 문자들
  const WALLS = '#&%017ΨΚρ';
  // 바닥 위에 올려 그리는 물체 타일
  const OBJ = new Set(['T', 'Y', 'Z', 'r', 'F', 'e', 'l', 'S', 'o', 'x', 'X', 'j', 'P', 'g', 'b', 't', 'h', 'p', 'a', 'z', '*', 'A', 'V', 'U', 'K', 'C', '|', 'O', '@', 'J', 'd', '3', '4', '6', '?', '(', ')', 'τ', 'μ', 'ς', 'λ', 'θ']);
  const ANIM = new Set(['~', '&', 'f', '*', 'V', 'C', '@', 'v', '1', 'Z', '9', '?', 'ς', 'λ', 'ι']);

  const C = {
    g0: '#5fae4c', g1: '#4f9b3f', g2: '#76c45e', g3: '#3f8a35',
    tree: '#2e7a3a', treeL: '#4aa048', treeD: '#1d5428', trunk: '#6b4426',
    pine: '#1f6038', pineL: '#2f7d48', pineD: '#123d24',
    water: '#3c7fd6', waterL: '#78b0f2', waterD: '#2b5fae', foam: '#d8ecff',
    path: '#c9a56a', pathD: '#b08c54', pathL: '#dcbd86',
    sand: '#e2cd90', sandD: '#cdb675',
    wood: '#b4783f', woodD: '#86542a', woodL: '#cf9658',
    stone: '#9d9cab', stoneD: '#727185', stoneL: '#bcbcca',
    roofR: '#c4473a', roofRD: '#8c2c26', roofRL: '#e06c52',
    roofB: '#3f63b8', roofBD: '#2b4587', roofBL: '#5f86d6',
    roofG: '#4b8a4c', roofGD: '#316235', roofGL: '#6aab66',
    floor: '#b98852', floorD: '#966838', floorL: '#cf9f66',
    wallIn: '#e2d2ae', wallInD: '#b7a27a', ceil: '#3b2b22',
    dWall: '#5e5a72', dWallD: '#433f55', dWallL: '#78748e', dTop: '#25222f',
    dFloor: '#4b4759', dFloorD: '#3c384a', dFloorL: '#5a566a',
    gold: '#f2c84b', dark: '#1a1424',
  };

  // ── 공용 그리기 조각 ──
  function grass(p, v) {
    p.fill(C.g0);
    p.noise([C.g1, C.g1, C.g2], 0.11, 3 + v);
    const tufts = [[3, 4], [11, 10], [6, 12], [12, 3]];
    for (let i = 0; i < 2 + (v % 2); i++) {
      const [x, y] = tufts[(i + v) % tufts.length];
      p.px(x, y + 1, C.g3); p.px(x + 1, y, C.g3); p.px(x + 2, y + 1, C.g3);
    }
  }
  function floorWood(p, v) {
    p.fill(C.floor);
    for (let y = 0; y < 16; y += 4) {
      p.rect(0, y + 3, 16, 1, C.floorD);
      const sx = ((y / 4 + v) % 2) * 8 + 3;
      p.px(sx, y, C.floorD); p.px(sx, y + 1, C.floorD); p.px(sx, y + 2, C.floorD);
      p.rect(0, y, 16, 1, C.floorL);
    }
  }
  function floorStone(p, v) {
    p.fill(C.dFloor);
    p.rect(0, 0, 16, 1, C.dFloorD); p.rect(0, 8, 16, 1, C.dFloorD);
    p.rect(v % 2 ? 4 : 10, 0, 1, 8, C.dFloorD); p.rect(v % 2 ? 12 : 6, 8, 1, 8, C.dFloorD);
    p.noise([C.dFloorL, C.dFloorD], 0.06, 20 + v);
  }
  function bricks(p, base, dark, light, rowH = 4) {
    p.fill(base);
    for (let y = 0; y < 16; y += rowH) {
      p.rect(0, y + rowH - 1, 16, 1, dark);
      const off = (y / rowH) % 2 ? 4 : 0;
      for (let x = off; x < 16; x += 8) p.rect(x, y, 1, rowH - 1, dark);
      p.rect(0, y, 16, 1, light);
    }
  }

  // ── 타일별 그리기 ── (p, v=변형, f=애니 프레임, nb=이웃)
  const D = {
    '.': (p, v) => grass(p, v),
    ',': (p, v) => { p.fill(C.g1); p.noise([C.g3, C.g0], 0.14, 9 + v); },
    '"': (p, v) => {
      grass(p, v);
      const cols = ['#ff6b8a', '#ffe066', '#ffffff', '#ff9a4d', '#b58cff'];
      const pts = [[3, 3], [10, 5], [5, 10], [12, 12], [8, 8]];
      for (let i = 0; i < 4; i++) {
        const [x, y] = pts[(i + v) % 5];
        const col = cols[(i + v * 2) % cols.length];
        p.px(x, y - 1, col); p.px(x - 1, y, col); p.px(x + 1, y, col); p.px(x, y + 1, col); p.px(x, y, '#ffd84a');
      }
    },
    ';': (p, v) => {
      p.fill(C.g1);
      for (let i = 0; i < 9; i++) {
        const x = (i * 5 + v * 3) % 15, y = 2 + ((i * 7) % 12);
        p.px(x, y, C.g2); p.px(x, y + 1, C.g3); p.px(x + 1, y - 1, C.g2); p.px(x + 1, y + 2, C.g3);
      }
    },
    'T': (p) => {
      p.ellipse(8, 14, 6, 2, 'rgba(0,0,0,0.25)');
      p.rect(7, 10, 3, 5, C.trunk); p.px(7, 10, '#4c2f18');
      p.circle(8, 6, 6, C.treeD); p.circle(8, 6, 5, C.tree);
      p.circle(6, 4, 3, C.treeL); p.px(5, 3, '#7ccc6c'); p.px(10, 8, C.treeD); p.px(11, 6, C.treeD);
    },
    // 비밀 나무 — 겉모습은 나무 그대로지만, 바람이 지나가는 길이라 잎이 살랑이며 날린다
    'Z': (p, v, f) => {
      D['T'](p);
      p.px(1 + f * 2, 9, '#9be07c'); p.px(3 + f, 11, '#7ccc6c'); p.px(0 + f * 3, 6, '#b8f09a');
      p.px(12 - f * 2, 12, '#9be07c'); p.px(14 - f, 8, '#7ccc6c');
    },
    'Y': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(0,0,0,0.25)');
      p.rect(7, 12, 2, 3, C.trunk);
      for (let y = 1; y < 13; y++) {
        const w = Math.floor(y / 2) + 1 - (y % 4 === 0 ? 1 : 0);
        p.rect(8 - w, y, w * 2, 1, y % 4 < 2 ? C.pine : C.pineD);
        p.px(8 - w, y, C.pineL);
      }
    },
    '~': (p, v, f, nb) => {
      p.fill(C.water);
      for (let i = 0; i < 3; i++) {
        const y = (i * 5 + f * 2 + v) % 16, x = (i * 6 + v * 3 + f * 3) % 12;
        p.rect(x, y, 4, 1, C.waterL); p.rect(x + 1, y + 1, 2, 1, C.waterD);
      }
      if (nb) {
        const land = (c) => c !== undefined && c !== '~' && c !== '=' && c !== 'H' && c !== '$';
        if (land(nb.u)) { p.rect(0, 0, 16, 2, C.sand); p.rect(0, 2, 16, 1, C.foam); }
        if (land(nb.d)) { p.rect(0, 14, 16, 2, C.sand); p.rect(0, 13, 16, 1, C.foam); }
        if (land(nb.l)) { p.rect(0, 0, 2, 16, C.sand); p.rect(2, 0, 1, 16, C.foam); }
        if (land(nb.r)) { p.rect(14, 0, 2, 16, C.sand); p.rect(13, 0, 1, 16, C.foam); }
      }
    },
    '=': (p) => {
      p.fill(C.water);
      p.rect(0, 1, 16, 14, C.wood);
      for (let x = 0; x < 16; x += 4) p.rect(x, 1, 1, 14, C.woodD);
      p.rect(0, 1, 16, 1, C.woodD); p.rect(0, 14, 16, 1, C.woodD);
      p.rect(0, 2, 16, 1, C.woodL);
    },
    'H': (p) => {
      p.fill(C.water);
      p.rect(1, 0, 14, 16, C.wood);
      for (let y = 0; y < 16; y += 4) p.rect(1, y, 14, 1, C.woodD);
      p.rect(1, 0, 1, 16, C.woodD); p.rect(14, 0, 1, 16, C.woodD);
    },
    ':': (p, v) => {
      p.fill(C.path);
      p.noise([C.pathD, C.pathL], 0.1, 31 + v);
      p.px(4 + v, 5, '#9c7b47'); p.px(11 - v, 11, '#9c7b47');
    },
    's': (p, v) => { p.fill(C.sand); p.noise([C.sandD, '#f0e0aa'], 0.12, 41 + v); },
    '^': (p, v) => {
      grass(p, v);
      for (let y = 1; y < 16; y++) {
        const w = Math.floor((y * 7) / 15) + 1;
        p.rect(8 - w, y, w, 1, '#a39176');
        p.rect(8, y, w, 1, '#6f6150');
      }
      p.rect(7, 1, 2, 3, '#f4f4f4'); p.px(6, 3, '#f4f4f4'); p.px(9, 3, '#dcdce6');
      p.line(3, 14, 7, 7, '#8a7a62');
    },
    'r': (p) => {
      p.ellipse(8, 13, 6, 2, 'rgba(0,0,0,0.25)');
      p.ellipse(8, 9, 6, 5, C.stoneD); p.ellipse(7, 8, 5, 4, C.stone); p.px(5, 6, C.stoneL); p.px(6, 6, C.stoneL); p.px(5, 7, C.stoneL);
    },
    'F': (p) => {
      p.rect(0, 5, 16, 2, '#9a6a38'); p.rect(0, 10, 16, 2, '#9a6a38');
      p.rect(0, 5, 16, 1, '#c08850');
      p.rect(2, 3, 3, 12, '#8a5a2c'); p.rect(11, 3, 3, 12, '#8a5a2c'); p.rect(2, 3, 3, 1, '#c08850'); p.rect(11, 3, 3, 1, '#c08850');
    },
    'e': (p) => {
      p.ellipse(8, 9, 7, 6, '#245e2c'); p.ellipse(8, 8, 7, 6, '#357a38'); p.circle(5, 6, 2, '#4f9a48'); p.circle(11, 8, 2, '#4f9a48');
    },
    'u': (p, v) => {
      p.fill('#8a5a34');
      for (let y = 1; y < 16; y += 4) { p.rect(0, y, 16, 2, '#6f4426'); }
      for (let x = 2 + v; x < 16; x += 5) { p.px(x, 0, '#5ea84a'); p.px(x, 4, '#5ea84a'); p.px(x + 1, 8, '#5ea84a'); p.px(x, 12, '#5ea84a'); }
    },
    'q': (p, v) => {
      p.fill('#a49f94');
      for (let y = 0; y < 16; y += 5) for (let x = (y / 5) % 2 ? 0 : 3; x < 16; x += 6) {
        p.rect(x, y, 5, 4, '#bdb8ac'); p.rect(x, y + 3, 5, 1, '#8a857a');
      }
      p.noise(['#8a857a'], 0.04, 50 + v);
    },
    'l': (p, v, f) => {
      p.rect(7, 6, 2, 9, '#3a3a48'); p.rect(6, 14, 4, 2, '#3a3a48');
      p.rect(5, 1, 6, 5, '#2a2a36'); p.rect(6, 2, 4, 3, f ? '#ffe9a0' : '#ffd86a');
    },
    'S': (p) => {
      p.rect(7, 8, 2, 8, '#6b4426');
      p.rect(2, 3, 12, 7, '#4c2f18'); p.rect(3, 4, 10, 5, '#c08a50');
      p.rect(4, 5, 7, 1, '#7a5230'); p.rect(4, 7, 5, 1, '#7a5230');
    },
    'o': (p) => {
      p.ellipse(8, 9, 7, 6, '#6f6e7c'); p.ellipse(8, 9, 6, 5, '#8e8d9c'); p.ellipse(8, 9, 4, 3, '#1d3e70'); p.ellipse(8, 10, 3, 2, '#2c5ca0');
      p.rect(2, 1, 1, 8, '#6b4426'); p.rect(13, 1, 1, 8, '#6b4426'); p.rect(1, 0, 14, 2, '#8e2e28');
    },
    'x': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(0,0,0,0.3)');
      p.rect(3, 3, 10, 11, '#8a5a2c'); p.rect(4, 2, 8, 1, '#8a5a2c'); p.rect(4, 14, 8, 1, '#6b4426');
      p.rect(3, 5, 10, 1, '#444'); p.rect(3, 11, 10, 1, '#444'); p.rect(5, 3, 2, 11, '#a8743e');
      p.ellipse(8, 3, 4, 1, '#6b4426');
    },
    'X': (p) => {
      p.rect(2, 3, 12, 12, '#a8743e'); p.rect(2, 3, 12, 1, '#cf9658'); p.rect(2, 14, 12, 1, '#6b4426');
      p.rect(2, 3, 1, 12, '#6b4426'); p.rect(13, 3, 1, 12, '#6b4426');
      p.line(3, 4, 12, 13, '#6b4426'); p.line(12, 4, 3, 13, '#6b4426');
    },
    'j': (p) => {
      p.ellipse(8, 14, 5, 1, 'rgba(0,0,0,0.3)');
      p.ellipse(8, 10, 5, 5, '#a8582e'); p.rect(6, 3, 5, 3, '#a8582e'); p.rect(5, 2, 7, 2, '#c8784a'); p.px(6, 8, '#d89068'); p.px(6, 9, '#d89068');
    },
    'P': (p) => {
      p.rect(3, 13, 10, 3, C.stoneD); p.rect(4, 2, 8, 12, C.stone); p.rect(4, 2, 2, 12, C.stoneL); p.rect(10, 2, 2, 12, C.stoneD);
      p.rect(3, 0, 10, 3, C.stoneL); p.rect(3, 2, 10, 1, C.stoneD);
    },
    'g': (p) => {
      p.rect(4, 4, 8, 11, '#8e8d9c'); p.ellipse(8, 4, 4, 3, '#8e8d9c'); p.rect(7, 5, 2, 6, '#5d5c6a'); p.rect(5, 7, 6, 2, '#5d5c6a');
      p.rect(3, 14, 10, 2, '#5d7a40');
    },
    'm': (p, v) => {
      p.fill('#d8c8a0');
      for (let y = 2; y < 16; y += 5) p.rect(0, y, 16, 1, '#b4a07a');
      p.rect(0, 0, 1, 16, '#b4a07a'); p.rect(15, 0, 1, 16, '#9c8a64');
      p.noise(['#c4b48c'], 0.08, 61 + v);
    },
    'W': (p, v, f, nb) => {
      p.fill(C.wood);
      for (let y = 0; y < 16; y += 4) { p.rect(0, y + 3, 16, 1, C.woodD); p.rect(0, y, 16, 1, C.woodL); }
      p.rect(0, 0, 2, 16, C.woodD);
      p.rect(0, 14, 16, 2, '#6f6e7c');
    },
    'B': (p) => { bricks(p, C.stone, C.stoneD, C.stoneL); p.rect(0, 14, 16, 2, '#5c5b6a'); },
    'n': (p, v, f, nb) => {
      D['W'](p, v, f, nb);
      p.rect(3, 3, 10, 8, '#5b3b1e'); p.rect(4, 4, 8, 6, '#9fd3ff'); p.rect(4, 4, 3, 2, '#e0f2ff');
      p.rect(7, 4, 1, 6, '#5b3b1e'); p.rect(4, 7, 8, 1, '#5b3b1e'); p.rect(2, 11, 12, 1, '#7a5230');
    },
    'N': (p, v, f, nb) => {
      D['B'](p, v, f, nb);
      p.rect(4, 2, 8, 9, '#3a3a48'); p.rect(5, 3, 6, 7, '#ffe9a0'); p.rect(5, 3, 6, 2, '#fff6cc'); p.rect(7, 3, 2, 7, '#3a3a48');
    },
    'R': (p, v, f, nb) => roof(p, nb, C.roofR, C.roofRD, C.roofRL, 'R'),
    'Q': (p, v, f, nb) => roof(p, nb, C.roofB, C.roofBD, C.roofBL, 'Q'),
    'G': (p, v, f, nb) => roof(p, nb, C.roofG, C.roofGD, C.roofGL, 'G'),
    'D': (p) => {
      p.fill(C.woodD);
      p.rect(2, 1, 12, 15, '#3d2410'); p.rect(3, 2, 10, 14, '#7a4a22');
      for (let x = 5; x < 13; x += 3) p.rect(x, 3, 1, 13, '#5e3818');
      p.rect(3, 2, 10, 1, '#9a6234'); p.px(11, 9, C.gold); p.px(11, 10, '#b88a2a');
    },
    'V': (p, v, f) => {
      grass(p, 1);
      // 작은 마을: 집 세 채 + 깃발
      const house = (x, y, roofCol) => {
        p.rect(x, y + 3, 6, 4, '#e8dcc0'); p.rect(x + 2, y + 5, 2, 2, '#5b3b1e');
        for (let i = 0; i < 4; i++) p.rect(x - 1 + i, y + 3 - i, 8 - i * 2, 1, roofCol);
      };
      house(1, 7, C.roofR); house(9, 6, C.roofB); house(5, 1, C.roofR);
      p.rect(14, 0, 1, 6, '#5b3b1e'); p.rect(11, 0 + f, 3, 2, '#ffd75e');
    },
    'U': (p) => {
      grass(p, 2);
      p.rect(1, 2, 14, 13, C.stoneD); p.rect(2, 1, 12, 2, C.stone);
      p.rect(2, 3, 3, 12, C.stone); p.rect(11, 3, 3, 12, C.stone);
      p.rect(5, 5, 6, 10, '#100c18'); p.rect(6, 4, 4, 1, '#100c18');
      p.px(3, 6, C.stoneL); p.px(12, 9, C.stoneL); p.rect(7, 2, 2, 1, '#7cc4ff');
    },
    'K': (p) => {
      grass(p, 3);
      p.rect(3, 8, 10, 7, '#8a5a2c'); p.rect(3, 8, 10, 1, '#a8743e'); p.rect(7, 11, 3, 4, '#3d2410');
      for (let i = 0; i < 5; i++) p.rect(2 + i, 7 - i, 12 - i * 2, 1, '#6b4426');
      p.rect(11, 1, 2, 4, '#5d5c6a'); p.px(12, 0, '#ddd');
    },
    'C': (p, v, f) => {
      grass(p, 0);
      // 왕도: 성벽 + 탑 두 개 + 깃발
      p.rect(1, 8, 14, 7, C.stone); p.rect(1, 8, 14, 1, C.stoneL); p.rect(6, 11, 4, 4, '#3d2410');
      for (let x = 1; x < 15; x += 3) p.rect(x, 6, 2, 2, C.stone);
      p.rect(2, 3, 4, 6, C.stoneD); p.rect(10, 3, 4, 6, C.stoneD);
      for (let i = 0; i < 3; i++) { p.rect(2 + i, 3 - i, 4 - i * 2, 1, C.roofB); p.rect(10 + i, 3 - i, 4 - i * 2, 1, C.roofB); }
      p.rect(7, 0, 1, 7, '#5b3b1e'); p.rect(8, 0 + f, 3, 2, '#ffd75e');
    },
    'M': (p, v) => {
      p.fill('#d8d4cc');
      p.rect(0, 0, 16, 1, '#b8b4ac'); p.rect(0, 0, 1, 16, '#b8b4ac'); p.rect(8, 8, 8, 1, '#c4c0b8'); p.rect(8, 8, 1, 8, '#c4c0b8');
      p.noise(['#e8e4dc', '#c8c4bc'], 0.06, 111 + v);
    },
    '@': (p, v, f) => {
      p.fill('#d8d4cc');
      p.ellipse(8, 9, 7, 6, '#9d9cab'); p.ellipse(8, 9, 6, 5, '#3c7fd6'); p.ellipse(8, 9, 3, 2, f ? '#78b0f2' : '#5a98e8');
      p.rect(7, 2, 2, 7, '#bcbcca'); p.rect(6, 1, 4, 2, '#bcbcca');
      p.px(5 + f, 3, '#d8ecff'); p.px(10 - f, 4, '#d8ecff'); p.px(8, 0 + f, '#d8ecff');
    },
    'J': (p) => {
      p.rect(3, 12, 10, 4, C.stoneD); p.rect(4, 11, 8, 2, C.stone);
      p.rect(6, 4, 4, 8, C.stoneL); p.rect(5, 6, 6, 3, C.stoneL); p.circle(8, 3, 2, C.stoneL);
      p.rect(11, 1, 1, 9, C.stone); p.px(11, 0, '#ffd75e'); p.rect(6, 9, 1, 2, C.stone);
    },
    'd': (p, v) => {
      p.rect(1, 8, 14, 7, '#9a6234'); p.rect(1, 8, 14, 1, '#c08050');
      const cols = [['#c4473a', '#f4f4f4'], ['#3f63b8', '#f4f4f4'], ['#4b8a4c', '#ffd75e']][v % 3];
      for (let x = 0; x < 16; x += 4) { p.rect(x, 2, 2, 5, cols[0]); p.rect(x + 2, 2, 2, 5, cols[1]); }
      p.rect(0, 6, 16, 1, '#5e3818'); p.rect(1, 7, 1, 8, '#5e3818'); p.rect(14, 7, 1, 8, '#5e3818');
      p.rect(4, 9, 3, 2, ['#ff6b8a', '#ffd75e', '#7cc4ff'][v % 3]); p.rect(9, 9, 3, 2, '#e8dcc0');
    },
    'v': (p, v, f, nb) => {
      p.fill('#4a5a2a');
      for (let i = 0; i < 3; i++) { const y = (i * 5 + f * 2 + v) % 16, x = (i * 6 + v * 3 + f * 3) % 12; p.rect(x, y, 4, 1, '#6a7a3a'); p.rect(x + 1, y + 1, 2, 1, '#3a4a1e'); }
      if (nb) {
        const land = (c) => c !== undefined && c !== 'v' && c !== '+';
        if (land(nb.u)) { p.rect(0, 0, 16, 2, '#5a5a62'); p.rect(0, 2, 16, 1, '#8a9a5a'); }
        if (land(nb.d)) { p.rect(0, 14, 16, 2, '#5a5a62'); }
        if (land(nb.l)) p.rect(0, 0, 2, 16, '#5a5a62');
        if (land(nb.r)) p.rect(14, 0, 2, 16, '#5a5a62');
      }
    },
    '+': (p) => {
      p.fill('#4a5a2a');
      p.rect(0, 1, 16, 14, '#5a5a66'); for (let x = 1; x < 16; x += 3) p.rect(x, 1, 1, 14, '#2a2a32'); p.rect(0, 1, 16, 1, '#8a8a96'); p.rect(0, 14, 16, 1, '#3a3a44');
    },
    '1': (p, v, f, nb) => {
      D['#'](p, v, f, { ...nb, d: '_' });
      const cx = 8, cy = 8, r = 5;
      p.circle(cx, cy, r, '#8a6a2a'); p.circle(cx, cy, r - 1, '#c4a050');
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + (f ? Math.PI / 8 : 0); p.rect(Math.round(cx + Math.cos(a) * r) - 1, Math.round(cy + Math.sin(a) * r) - 1, 2, 2, '#c4a050'); }
      p.circle(cx, cy, 2, '#5a4418'); p.px(cx, cy, '#e8d080');
    },
    // ── 사막 ──
    '2': (p, v) => {
      p.fill(C.sand); p.noise([C.sandD, '#f0e0aa'], 0.08, 131 + v);
      for (let i = 0; i < 2; i++) { const y = 4 + i * 7 + (v % 2); for (let x = 0; x < 16; x++) p.px(x, y + Math.round(Math.sin((x + v * 3) * 0.6)), C.sandD); }
    },
    '3': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(0,0,0,0.25)');
      for (let y = 5; y < 15; y++) p.rect(7 + Math.round(Math.sin(y * 0.4)), y, 2, 1, y % 3 ? '#8a6a3a' : '#6b4426');
      const leaf = '#3f9a4a', leafD = '#2a7038';
      p.line(8, 4, 1, 7, leaf); p.line(8, 4, 15, 7, leaf); p.line(8, 4, 3, 1, leafD); p.line(8, 4, 13, 1, leafD); p.line(8, 4, 8, 0, leaf);
      p.line(8, 5, 2, 9, leafD); p.line(8, 5, 14, 9, leafD); p.circle(8, 4, 2, '#5ab85a'); p.px(7, 6, '#8a5a2a'); p.px(9, 6, '#8a5a2a');
    },
    '4': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(0,0,0,0.25)');
      p.rect(6, 3, 4, 12, '#4a9a4a'); p.rect(6, 3, 1, 12, '#6aba5a'); p.rect(9, 3, 1, 12, '#2a6a2a'); p.rect(7, 2, 2, 1, '#4a9a4a');
      p.rect(2, 7, 4, 2, '#4a9a4a'); p.rect(2, 4, 2, 4, '#4a9a4a'); p.rect(10, 9, 4, 2, '#4a9a4a'); p.rect(12, 5, 2, 5, '#4a9a4a');
      p.px(7, 1, '#ff6b8a'); p.px(8, 6, '#f0e8c0'); p.px(7, 10, '#f0e8c0');
    },
    '5': (p) => { bricks(p, '#d8b884', '#a88a5a', '#ecd4a4', 4); p.rect(0, 14, 16, 2, '#9a7a4a'); },
    '[': (p, v, f, nb) => {
      p.fill('#e8d0a0'); p.noise(['#d8c090', '#f4e0b4'], 0.1, 141 + v);
      if (nb) { if (nb.d !== '[') { p.rect(0, 13, 16, 3, '#a88a5a'); p.rect(0, 12, 16, 1, '#c8a878'); } if (nb.u !== '[') p.rect(0, 0, 16, 2, '#f8ecc8'); }
    },
    '6': (p, v) => {
      const cols = [['#c4473a', '#e8dcc0'], ['#3f63b8', '#e8dcc0'], ['#d8a040', '#7a3a2a']][v % 3];
      p.ellipse(8, 14, 7, 2, 'rgba(0,0,0,0.25)');
      for (let y = 1; y < 14; y++) { const w = Math.min(7, y); for (let x = 8 - w; x < 8 + w; x++) p.px(x, y, ((x + 16) >> 1) % 2 ? cols[0] : cols[1]); }
      p.rect(6, 9, 4, 5, '#2a1a10'); p.px(8, 0, '#6b4426');
    },
    '?': (p, v, f) => {
      p.fill(C.sand); p.noise([C.sandD], 0.06, 151);
      p.ellipse(8, 11, 6, 3, C.water); p.ellipse(8, 11, 4, 2, f ? C.waterL : C.water);
      p.line(4, 10, 4, 3, '#8a6a3a'); p.line(4, 3, 1, 5, '#3f9a4a'); p.line(4, 3, 8, 4, '#3f9a4a'); p.line(4, 3, 4, 0, '#2a7038');
      p.line(12, 10, 12, 4, '#8a6a3a'); p.line(12, 4, 9, 6, '#3f9a4a'); p.line(12, 4, 15, 6, '#3f9a4a');
      p.rect(6, 5, 4, 3, '#e8dcc0'); p.rect(7, 6, 2, 2, '#5b3b1e');
    },
    '(': (p) => {
      p.fill(C.sand);
      for (let y = 2; y < 15; y++) { const w = Math.floor((y - 1) * 0.58); p.rect(8 - w, y, w * 2, 1, y % 3 ? '#d8b884' : '#a88a5a'); }
      p.rect(6, 10, 4, 5, '#2a1a10'); p.px(8, 2, '#ffd75e');
    },
    ')': (p) => {
      p.fill(C.sand);
      p.ellipse(8, 9, 7, 6, '#a88a5a'); p.ellipse(8, 8, 6, 5, '#c8a878'); p.ellipse(8, 11, 3, 3, '#1a1010'); p.rect(5, 11, 6, 3, '#1a1010');
      p.px(4, 5, '#e8d0a0'); p.px(11, 6, '#e8d0a0');
    },
    '7': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && !WALLS.includes(nb.d);
      if (face) { bricks(p, '#b89868', '#8a6a40', '#d8b884', 4); p.rect(0, 0, 16, 2, '#4a3a24'); p.rect(0, 15, 16, 1, '#3a2a18'); p.px(4 + v, 7, '#e8c070'); }
      else {
        p.fill('#4a3a24'); p.noise(['#5a4830', '#3a2a18'], 0.18, 161 + v);
        if (nb) { const open = (c) => c !== undefined && !(WALLS + ' ').includes(c); if (open(nb.l)) p.rect(0, 0, 1, 16, '#6a5838'); if (open(nb.r)) p.rect(15, 0, 1, 16, '#6a5838'); if (open(nb.u)) p.rect(0, 0, 16, 1, '#6a5838'); }
      }
    },
    '8': (p, v) => {
      p.fill('#c8a878'); p.rect(0, 0, 16, 1, '#a88a5a'); p.rect(0, 0, 1, 16, '#a88a5a'); p.rect(8, 8, 8, 1, '#b89868'); p.rect(8, 8, 1, 8, '#b89868');
      p.noise(['#d8b884', '#b89868'], 0.06, 171 + v);
    },
    '/': (p, v) => {
      p.fill('#a8583a');
      for (let y = 0; y < 16; y += 4) { p.rect(0, y + (v % 2), 16, 1, '#7a3a24'); p.rect(0, y + 2, 16, 1, '#c8784a'); }
      p.noise(['#8a4a2a', '#c87050'], 0.12, 181 + v); p.px(3 + v * 2, 6, '#e8a070');
    },
    '9': (p, v, f) => {
      p.fill('#b8925a');
      for (let r = 7; r > 0; r -= 2) p.ellipse(8, 8, r, r * 0.8, r % 4 === 1 ? '#8a6a3a' : '#a88048');
      const a = f ? 1 : 0; p.px(4 + a, 6, '#d8b884'); p.px(11 - a, 10, '#d8b884'); p.px(8, 4 + a, '#d8b884'); p.ellipse(8, 8, 1.5, 1.2, '#5a4020');
    },
    // 실내
    'I': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && nb.d !== 'I';
      if (face) {
        p.fill(C.wallIn);
        p.rect(0, 0, 16, 2, '#6b4a30'); p.rect(0, 13, 16, 3, '#8a6440'); p.rect(0, 13, 16, 1, '#a88058');
        p.noise([C.wallInD], 0.05, 71 + v);
      } else {
        p.fill(C.ceil); p.noise(['#33251d', '#45342a'], 0.15, 73 + v);
      }
    },
    'w': (p, v) => floorWood(p, v),
    'c': (p, v, f, nb) => {
      p.fill('#a8304a'); p.noise(['#962840', '#b83c58'], 0.12, 81 + v);
      const edge = (c) => c !== undefined && c !== 'c';
      if (nb) {
        if (edge(nb.u)) p.rect(0, 0, 16, 2, C.gold);
        if (edge(nb.d)) p.rect(0, 14, 16, 2, C.gold);
        if (edge(nb.l)) p.rect(0, 0, 2, 16, C.gold);
        if (edge(nb.r)) p.rect(14, 0, 2, 16, C.gold);
      }
    },
    'k': (p, v) => {
      floorWood(p, v);
      p.rect(0, 0, 16, 10, '#c8925a'); p.rect(0, 0, 16, 2, '#e0aa70'); p.rect(0, 10, 16, 6, '#7a4a22'); p.rect(0, 10, 16, 1, '#5e3818');
      p.px(3 + v * 3, 4, '#a8743e');
    },
    'L': (p) => {
      p.fill('#5e3818'); p.rect(1, 1, 14, 14, '#3d2410');
      const cols = ['#c0443a', '#3f63b8', '#4b8a4c', '#d8b040', '#8a4ab0', '#e07a40'];
      for (let row = 0; row < 3; row++) {
        let x = 2;
        let i = row * 2;
        while (x < 14) {
          const w = 1 + ((i * 7) % 3 === 0 ? 1 : 0);
          p.rect(x, 2 + row * 5, w, 4, cols[i % cols.length]);
          x += w + (i % 4 === 0 ? 1 : 0); i++;
        }
        p.rect(1, 6 + row * 5, 14, 1, '#7a4a22');
      }
    },
    'b': (p) => {
      p.rect(1, 0, 14, 16, '#7a4a22'); p.rect(2, 1, 12, 14, '#f0f0f0'); p.rect(3, 2, 10, 4, '#ffffff'); p.rect(3, 5, 10, 1, '#c8c8d8');
      p.rect(2, 7, 12, 8, '#4a6ec8'); p.rect(2, 7, 12, 1, '#6a8ee8'); p.rect(2, 14, 12, 1, '#2b4587');
    },
    't': (p) => {
      p.ellipse(8, 14, 6, 1, 'rgba(0,0,0,0.3)');
      p.rect(1, 3, 14, 9, '#9a6234'); p.rect(1, 3, 14, 2, '#c08050'); p.rect(2, 12, 2, 3, '#5e3818'); p.rect(12, 12, 2, 3, '#5e3818');
      p.rect(6, 5, 4, 3, '#f0f0f0'); p.px(7, 4, '#ffd75e');
    },
    'h': (p) => { p.ellipse(8, 12, 4, 1, 'rgba(0,0,0,0.3)'); p.ellipse(8, 8, 4, 3, '#8a5a2c'); p.ellipse(8, 7, 3, 2, '#b4783f'); p.rect(5, 9, 1, 4, '#5e3818'); p.rect(10, 9, 1, 4, '#5e3818'); },
    'p': (p) => {
      p.rect(5, 10, 6, 5, '#a8582e'); p.rect(4, 10, 8, 2, '#c8784a');
      p.circle(8, 6, 4, '#2e7a3a'); p.circle(6, 4, 2, '#4aa048'); p.circle(10, 5, 2, '#4aa048'); p.px(8, 2, '#ff6b8a');
    },
    'f': (p, v, f) => {
      bricks(p, '#8a6a5a', '#5e463a', '#a88878', 4);
      p.rect(3, 6, 10, 10, '#1a1010');
      const fl = f ? ['#ffb040', '#ff7020', '#ffe080'] : ['#ff9030', '#ff5a20', '#ffd060'];
      p.rect(5, 11, 6, 4, fl[1]); p.rect(6, 9 + f, 4, 4, fl[0]); p.rect(7, 8 - f, 2, 3, fl[2]);
      p.rect(4, 14, 8, 2, '#5e3818');
    },
    'E': (p, v) => { floorWood(p, v); p.rect(2, 4, 12, 10, '#7a3a2a'); p.rect(3, 5, 10, 8, '#a8503a'); p.rect(3, 8, 10, 1, '#c8784a'); },
    'A': (p) => {
      p.rect(1, 5, 14, 11, '#9d9cab'); p.rect(1, 5, 14, 2, '#bcbcca'); p.rect(3, 7, 10, 8, '#f0e8d0'); p.rect(7, 7, 2, 8, '#c4473a');
      p.rect(3, 1, 2, 4, '#f4f4f4'); p.px(3, 0, '#ffd75e'); p.rect(11, 1, 2, 4, '#f4f4f4'); p.px(12, 0, '#ffd75e');
    },
    'a': (p) => {
      p.ellipse(8, 14, 6, 1, 'rgba(0,0,0,0.3)');
      p.rect(2, 4, 12, 4, '#4a4a58'); p.rect(2, 4, 12, 1, '#7a7a88'); p.rect(0, 5, 3, 2, '#4a4a58'); p.rect(5, 8, 6, 3, '#3a3a48'); p.rect(3, 11, 10, 4, '#3a3a48');
    },
    'i': (p) => {
      p.fill('#5e3818'); p.rect(1, 1, 14, 14, '#7a4a22');
      const cols = ['#ff5a6a', '#5ab4ff', '#7cf08a', '#ffd75e', '#d59bff'];
      for (let row = 0; row < 3; row++) {
        for (let k = 0; k < 4; k++) {
          const col = cols[(row * 3 + k) % cols.length];
          const x = 2 + k * 3 + (row % 2);
          p.rect(x, 3 + row * 5, 2, 3, col); p.px(x, 2 + row * 5, '#ddd');
        }
        p.rect(1, 6 + row * 5, 14, 1, '#3d2410');
      }
    },
    'z': (p) => {
      p.rect(1, 2, 14, 13, '#8a5a2c'); p.rect(1, 2, 14, 1, '#b4783f'); p.rect(2, 4, 12, 4, '#a8743e'); p.rect(2, 9, 12, 4, '#a8743e');
      p.rect(7, 5, 2, 1, C.gold); p.rect(7, 10, 2, 1, C.gold); p.rect(1, 14, 14, 1, '#5e3818');
    },
    // 던전
    '#': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && !WALLS.includes(nb.d);
      if (face) {
        bricks(p, C.dWall, C.dWallD, C.dWallL, 4);
        p.rect(0, 0, 16, 2, C.dTop); p.rect(0, 15, 16, 1, '#1e1b28');
      } else {
        p.fill(C.dTop); p.noise(['#2f2c3a', '#1d1a26'], 0.18, 91 + v);
        if (nb) {
          const open = (c) => c !== undefined && !(WALLS + ' ').includes(c);
          if (open(nb.l)) p.rect(0, 0, 1, 16, '#3a3648');
          if (open(nb.r)) p.rect(15, 0, 1, 16, '#3a3648');
          if (open(nb.u)) p.rect(0, 0, 16, 1, '#3a3648');
        }
      }
    },
    '&': (p, v, f, nb) => {
      D['#'](p, v, f, { ...nb, d: '_' });
      p.rect(7, 7, 2, 6, '#5e3818'); p.rect(6, 6, 4, 2, '#3a3a48');
      const fl = f ? ['#ffe080', '#ff9030'] : ['#ffd060', '#ff6a20'];
      p.rect(6, 3 + f, 4, 3, fl[1]); p.rect(7, 2 + f, 2, 3, fl[0]);
    },
    '%': (p, v, f, nb) => {
      D['#'](p, v, f, { ...nb, d: '_' });
      p.line(5, 3, 8, 8, '#1a1724'); p.line(8, 8, 6, 13, '#1a1724'); p.line(8, 8, 12, 10, '#1a1724'); p.px(9, 6, '#1a1724');
    },
    '_': (p, v) => floorStone(p, v),
    '-': (p, v) => { floorStone(p, v); p.rect(3, 9, 3, 2, C.dWallL); p.rect(10, 4, 2, 2, C.dWallL); p.px(12, 12, C.dWallD); p.rect(4, 11, 3, 1, C.dWallD); },
    '|': (p) => {
      for (let x = 1; x < 16; x += 4) { p.rect(x, 0, 2, 16, '#55556a'); p.px(x, 0, '#9a9ab0'); }
      p.rect(0, 2, 16, 2, '#44445a'); p.rect(0, 12, 16, 2, '#44445a');
    },
    '*': (p, v, f) => {
      p.ellipse(8, 14, 5, 2, f ? 'rgba(124,196,255,0.5)' : 'rgba(124,196,255,0.3)');
      const cA = f ? '#bfe6ff' : '#9fd3ff', cB = f ? '#5ab4ff' : '#3a8ae0';
      for (let y = 1; y < 14; y++) { const w = y < 7 ? y / 1.6 : (14 - y) / 1.2; p.rect(8 - w, y, w, 1, cA); p.rect(8, y, w, 1, cB); }
      p.px(6, 4, '#ffffff'); p.px(7, 3, '#ffffff');
    },
    '>': (p) => {
      p.fill(C.dFloor);
      for (let i = 0; i < 5; i++) { const c = ['#5a566a', '#46425a', '#363248', '#26223a', '#16122a'][i]; p.rect(1 + i, 1 + i * 3, 14 - i * 2, 3, c); }
    },
    '<': (p) => {
      p.fill(C.dFloor);
      for (let i = 0; i < 5; i++) { const c = ['#8a86a0', '#7a7690', '#6a6680', '#5a5670', '#4a4660'][i]; p.rect(1, 1 + i * 3, 14, 2, c); p.rect(1, 3 + i * 3, 14, 1, C.dTop); }
    },
    '0': (p, v, f, nb) => {
      p.fill('#4a465c'); p.rect(1, 0, 14, 16, '#6a6680'); p.rect(7, 0, 2, 16, '#3a3648');
      p.px(8, 5, '#9fd3ff'); p.px(7, 6, '#9fd3ff'); p.px(9, 6, '#9fd3ff'); p.px(8, 7, '#9fd3ff'); p.px(6, 6, '#5ab4ff'); p.px(10, 6, '#5ab4ff'); p.px(8, 4, '#5ab4ff'); p.px(8, 8, '#5ab4ff');
    },
    '$': (p, v) => { p.fill('#07050c'); p.noise(['#2a1a40', '#1a1028'], 0.05, 97 + v); },
    'y': (p, v) => { p.fill('#5a4a3a'); p.noise(['#4a3c2e', '#6a5a48'], 0.15, 99 + v); },
    'O': (p) => { p.rect(0, 2, 16, 14, '#6a6680'); p.rect(0, 2, 16, 2, '#9a96b0'); p.rect(0, 14, 16, 2, '#3a3648'); p.rect(3, 6, 10, 1, '#c4a050'); },
    // 북쪽 바다
    'σ': (p, v) => {
      p.fill('#e6edf6'); p.noise(['#d2dbe8', '#f6f9fd'], 0.12, 201 + v);
      if (v % 2) { p.px(4, 5, '#c4cfe0'); p.px(5, 5, '#c4cfe0'); p.px(11, 11, '#c4cfe0'); }
      p.px(3 + v * 3, 9, '#ffffff');
    },
    'τ': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(60,80,110,0.25)');
      p.rect(7, 12, 2, 3, '#5a3a24');
      for (let y = 1; y < 13; y++) { const w = Math.floor(1 + (y % 5) * 0.9 + y * 0.35); p.rect(8 - w, y, w * 2, 1, y % 5 === 0 ? '#e8f0fa' : y % 5 === 1 ? '#f6f9fd' : '#2a5a46'); }
      p.px(8, 0, '#f6f9fd'); p.px(5, 6, '#f6f9fd'); p.px(11, 11, '#f6f9fd');
    },
    'ι': (p, v, f) => {
      p.fill('#a8d8f0'); p.noise(['#98cce8', '#bce4f6'], 0.08, 211 + v);
      p.line(2 + v, 13, 9 + v, 6, '#d8f2ff'); p.line(5, 15, 13, 7, '#c8ecfc');
      p.px(11 - v, 3, '#78b0d0'); p.px(12 - v, 4, '#78b0d0');
      if (f && v === 1) p.px(4, 4, '#ffffff');
    },
    'Ψ': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && !WALLS.includes(nb.d);
      if (face) {
        bricks(p, '#7ab8d8', '#4a88a8', '#a8dcf0', 4); p.rect(0, 0, 16, 2, '#1e3a52'); p.rect(0, 15, 16, 1, '#163048');
        p.line(3 + v, 3, 5 + v, 12, '#d8f2ff');
      } else {
        p.fill('#1e3a52'); p.noise(['#28485e', '#163048'], 0.18, 221 + v);
        if (nb) { const open = (c) => c !== undefined && !(WALLS + ' ').includes(c); if (open(nb.l)) p.rect(0, 0, 1, 16, '#4a7898'); if (open(nb.r)) p.rect(15, 0, 1, 16, '#4a7898'); if (open(nb.u)) p.rect(0, 0, 16, 1, '#4a7898'); }
      }
    },
    'π': (p, v) => {
      p.fill('#8a6a4a');
      for (let y = 0; y < 16; y += 4) { p.rect(0, y + 3, 16, 1, '#5a4430'); p.rect(0, y, 16, 1, '#a8885e'); p.px(((y / 4 + v) % 2) * 8 + 2, y + 1, '#4a3420'); }
    },
    'δ': (p, v) => {
      p.fill('#6a4a30');
      for (let x = 0; x < 16; x += 4) { p.rect(x + 3, 0, 1, 16, '#4a3020'); p.rect(x, 0, 1, 16, '#80603e'); }
      p.px(5 + v * 2, (v * 5) % 16, '#3a2414'); p.noise(['#5a3e28'], 0.04, 231 + v);
    },
    'ρ': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && !WALLS.includes(nb.d);
      if (face) {
        p.fill('#4a3020');
        for (let y = 2; y < 16; y += 3) { p.rect(0, y, 16, 1, '#2e1c10'); p.rect(0, y + 1, 16, 1, '#5a3c28'); }
        p.rect(0, 0, 16, 2, '#7a5a3a'); p.rect(0, 0, 16, 1, '#a08060'); p.px(3 + v * 3, 8, '#8a8a98');
      } else {
        p.fill('#24160c'); p.noise(['#2e1c10', '#1a0e06'], 0.15, 241 + v);
        if (nb) { const open = (c) => c !== undefined && !(WALLS + ' ').includes(c); if (open(nb.l)) p.rect(0, 0, 2, 16, '#7a5a3a'); if (open(nb.r)) p.rect(14, 0, 2, 16, '#7a5a3a'); if (open(nb.u)) p.rect(0, 0, 16, 2, '#7a5a3a'); }
      }
    },
    'μ': (p) => {
      p.ellipse(8, 14, 5, 2, 'rgba(0,0,0,0.3)');
      p.rect(6, 0, 4, 15, '#5a3a20'); p.rect(6, 0, 1, 15, '#8a6040'); p.rect(4, 12, 8, 3, '#3a2414');
      p.line(1, 0, 6, 6, '#c8b890'); p.line(15, 0, 10, 6, '#c8b890');
    },
    'κ': (p, v) => {
      p.fill('#2e5a68'); p.noise(['#28505e', '#3a6a78'], 0.12, 251 + v);
      p.ellipse(4 + v * 2, 11, 2, 1, '#4a8090'); p.px(12 - v, 4, '#88c8d8');
    },
    'Κ': (p, v, f, nb) => {
      const face = nb && nb.d !== undefined && !WALLS.includes(nb.d);
      if (face) {
        bricks(p, '#3a6878', '#20485a', '#5a8a98', 4); p.rect(0, 0, 16, 2, '#0e2a34'); p.rect(0, 15, 16, 1, '#0a2028');
        p.px(4 + v * 2, 6, '#e87a8a'); p.px(5 + v * 2, 5, '#e87a8a'); p.px(11, 10, '#f0a0a8');
      } else {
        p.fill('#0e2a34'); p.noise(['#143440', '#0a2028'], 0.18, 261 + v);
        if (nb) { const open = (c) => c !== undefined && !(WALLS + ' ').includes(c); if (open(nb.l)) p.rect(0, 0, 1, 16, '#2a5a6a'); if (open(nb.r)) p.rect(15, 0, 1, 16, '#2a5a6a'); if (open(nb.u)) p.rect(0, 0, 16, 1, '#2a5a6a'); }
      }
    },
    'ς': (p, v, f) => {
      p.ellipse(8, 14, 5, 1, 'rgba(0,0,0,0.3)');
      const sw = f ? 1 : -1;
      for (const [x0, h, c] of [[4, 11, '#2a8a5a'], [8, 13, '#3aa86a'], [12, 9, '#2a8a5a']]) {
        for (let y = 0; y < h; y++) p.px(x0 + Math.round(Math.sin((y + x0) * 0.6) * 1.2 * sw), 14 - y, c);
      }
    },
    'λ': (p, v, f) => {
      p.ellipse(8, 15, 5, 1, 'rgba(60,80,110,0.3)');
      for (let y = 4; y < 15; y++) { const w = 2 + Math.floor((y - 4) * 0.3); p.rect(8 - w, y, w * 2, 1, Math.floor(y / 3) % 2 ? '#c4473a' : '#f4f4f4'); }
      p.rect(5, 2, 6, 2, '#3a3a48'); p.rect(6, 0, 4, 2, f ? '#fff4a0' : '#ffd75e');
    },
    'θ': (p) => {
      p.ellipse(8, 9, 7, 6, '#7ab8d8'); p.ellipse(8, 8, 6, 5, '#a8dcf0'); p.ellipse(8, 11, 3, 3, '#10202e'); p.rect(5, 11, 6, 3, '#10202e');
      p.px(3, 6, '#ffffff'); p.px(12, 5, '#ffffff'); p.line(6, 3, 7, 6, '#d8f2ff');
    },
    ' ': (p) => p.fill('#000'),
  };

  function roof(p, nb, base, dark, light, self) {
    p.fill(base);
    for (let y = 0; y < 16; y += 4) {
      const off = (y / 4) % 2 ? 2 : 0;
      for (let x = -off; x < 16; x += 4) { p.rect(x, y + 3, 4, 1, dark); p.px(x + 3, y + 1, dark); p.px(x + 3, y + 2, dark); p.rect(x, y, 3, 1, light); }
    }
    if (nb) {
      if (nb.d !== self) { p.rect(0, 13, 16, 3, dark); p.rect(0, 15, 16, 1, '#2a1a1a'); }
      if (nb.u !== self) { p.rect(0, 0, 16, 2, light); p.rect(0, 2, 16, 1, dark); }
      if (nb.l !== self) p.rect(0, 0, 1, 16, dark);
      if (nb.r !== self) p.rect(15, 0, 1, 16, dark);
    }
  }

  const NB_TILES = new Set(['~', 'I', '#', '&', '%', 'R', 'Q', 'G', 'c', 'v', '1', '7', '[', 'Ψ', 'Κ', 'ρ']);

  function get(ch, v, f, nbKey, nb) {
    const key = ch + v + '|' + f + '|' + (nbKey || '');
    let c = cache.get(key);
    if (c) return c;
    c = Pix.make(S, S, (p) => {
      const fn = D[ch] || D[' '];
      fn(p, v, f, nb);
    });
    cache.set(key, c);
    return c;
  }

  // 맵 타일 하나를 그린다 (tiles: 문자열 배열, base: 물체 아래 바닥 문자)
  function drawAt(g, map, tx, ty, sx, sy, time) {
    const rows = map.rt;
    const ch = rows[ty][tx];
    const v = Math.floor(Util.hash2(tx, ty, 5) * 4);
    const f = ANIM.has(ch) ? Math.floor(time * (ch === '~' ? 1.5 : 4)) % 2 : 0;
    if (OBJ.has(ch)) {
      const b = map.baseAt ? map.baseAt(tx, ty) : map.base || '.';
      g.drawImage(get(b, v, 0), sx, sy);
    }
    let nb = null, nbKey = '';
    if (NB_TILES.has(ch)) {
      const at = (x, y) => (y < 0 || y >= rows.length || x < 0 || x >= rows[0].length ? undefined : rows[y][x]);
      nb = { u: at(tx, ty - 1), d: at(tx, ty + 1), l: at(tx - 1, ty), r: at(tx + 1, ty) };
      if (ch === 'v') nbKey = ['u', 'd', 'l', 'r'].map((k) => (nb[k] === undefined || 'v+'.includes(nb[k]) ? 0 : 1)).join('');
      else if (ch === '~') nbKey = ['u', 'd', 'l', 'r'].map((k) => (nb[k] === undefined || '~=H$'.includes(nb[k]) ? 0 : 1)).join('');
      else if (ch === 'R' || ch === 'Q' || ch === 'G') nbKey = ['u', 'd', 'l', 'r'].map((k) => (nb[k] === ch ? 1 : 0)).join('');
      else if (ch === 'c') nbKey = ['u', 'd', 'l', 'r'].map((k) => (nb[k] === undefined || nb[k] === 'c' ? 0 : 1)).join('');
      else if (ch === '[') nbKey = (nb.d === '[' ? 'T' : 'F') + (nb.u === '[' ? 'T' : 'F');
      else if (ch === 'I') nbKey = nb.d !== undefined && nb.d !== 'I' ? 'F' : 'T';
      else nbKey = (nb.d !== undefined && !WALLS.includes(nb.d) ? 'F' : 'T') + ['u', 'l', 'r'].map((k) => (nb[k] !== undefined && !(WALLS + ' ').includes(nb[k]) ? 1 : 0)).join('');
    }
    g.drawImage(get(ch, OBJ.has(ch) ? 0 : v, f, nbKey, nb), sx, sy);
  }

  // 미니맵용 대표 색
  const MINI = {
    '.': '#5fae4c', ',': '#4f9b3f', '"': '#7cc760', ';': '#4f9b3f', 'T': '#2e7a3a', 'Y': '#1f6038', 'Z': '#2e7a3a',
    '~': '#3c7fd6', '=': '#b4783f', 'H': '#b4783f', ':': '#c9a56a', 's': '#e2cd90', '^': '#8a7a64', 'r': '#9d9cab',
    'F': '#9a6a38', 'e': '#357a38', 'u': '#8a5a34', 'q': '#b0aa9c', 'V': '#ff6b5a', 'U': '#c0c0d0', 'K': '#c08a50',
    'W': '#b4783f', 'B': '#9d9cab', 'n': '#b4783f', 'N': '#9d9cab', 'R': '#c4473a', 'Q': '#3f63b8', 'G': '#4b8a4c', 'D': '#5e3818',
    'I': '#3b2b22', 'w': '#b98852', 'c': '#a8304a', '#': '#25222f', '_': '#4b4759', '-': '#4b4759', '>': '#ffd75e', '<': '#ffd75e',
    '$': '#07050c', 'y': '#5a4a3a', '*': '#7cc4ff', ' ': '#000',
    '2': '#e2cd90', '3': '#3f9a4a', '4': '#4a9a4a', '5': '#d8b884', '6': '#c4473a', '[': '#e8d0a0', '?': '#3c7fd6', '(': '#ffd75e', ')': '#8a6a40', '7': '#4a3a24', '8': '#c8a878', '9': '#8a6a3a', '/': '#a8583a',
    'C': '#ffd75e', 'M': '#d8d4cc', '@': '#3c7fd6', 'J': '#bcbcca', 'd': '#c4473a', 'v': '#4a5a2a', '+': '#5a5a66', '1': '#c4a050',
    'O': '#6a6680', 'P': '#9d9cab', '|': '#55556a', '0': '#6a6680', '&': '#25222f', '%': '#25222f', 'k': '#c8925a', 'L': '#5e3818',
    'σ': '#e6edf6', 'τ': '#2a5a46', 'ι': '#a8d8f0', 'Ψ': '#1e3a52', 'π': '#8a6a4a', 'δ': '#6a4a30', 'ρ': '#24160c', 'μ': '#5a3a20',
    'κ': '#2e5a68', 'Κ': '#0e2a34', 'ς': '#3aa86a', 'λ': '#ffd75e', 'θ': '#7ab8d8',
  };

  return { get, drawAt, OBJ, MINI, S };
})();
