'use strict';
// ─────────────────────────────────────────────────────────────
// Chars: 인물 스프라이트 생성기 (16x20, 4방향 x 2프레임)
//  기본 몸 템플릿 + 머리 모양(스타일) 오버레이 + 자동 외곽선/음영
// ─────────────────────────────────────────────────────────────
const Chars = (() => {
  const W = 16, H = 20;
  const T = {
    down: [
      '................', '................', '................', '................', '................',
      '.....hhhhhh.....', '....hhhhhhhh....', '....hhhhhhhh....', '....hssssssh....', '....ssessess....',
      '....ssssssss....', '.....ssssss.....', '....cccccccc....', '...cccccccccc...', '...sccccccccs...',
      '....aaaaaaaa....', '....pppppppp....', '....ppp..ppp....', '....bbb..bbb....', '................',
    ],
    downStep: [
      null, null, null, null, null, null, null, null, null, null, null, null,
      '....cccccccc....', '...cccccccccc...', '...sccccccccs...', '....aaaaaaaa....', '....pppppppp....',
      '....ppp..bbb....', '....bbb.........', '................',
    ],
    up: [
      '................', '................', '................', '................', '................',
      '.....hhhhhh.....', '....hhhhhhhh....', '....hhhhhhhh....', '....hhhhhhhh....', '....hhhhhhhh....',
      '....hhhhhhhh....', '.....hhhhhh.....', '....cccccccc....', '...cccccccccc...', '...sccccccccs...',
      '....aaaaaaaa....', '....pppppppp....', '....ppp..ppp....', '....bbb..bbb....', '................',
    ],
    upStep: [
      null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
      '....ppp..bbb....', '....bbb.........', '................',
    ],
    left: [
      '................', '................', '................', '................', '................',
      '.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhh....', '...hsshhhhhh....', '...sesshhhhh....',
      '...sssshhhhh....', '....ssssshh.....', '.....cccccc.....', '.....cccccc.....', '.....cscccc.....',
      '.....aaaaaa.....', '.....pppppp.....', '......pppp......', '.....bbbbb......', '................',
    ],
    leftStep: [
      null, null, null, null, null, null, null, null, null, null, null, null,
      '.....cccccc.....', '....ccccccc.....', '....sccccccs....', '.....aaaaaa.....', '.....pppppp.....',
      '....ppp..pp.....', '...bbb....bb....', '................',
    ],
  };

  function baseGrid(dir, step) {
    const key = dir === 'right' ? 'left' : dir;
    const rows = T[key].slice();
    if (step) {
      const s = T[key + 'Step'];
      for (let i = 0; i < s.length; i++) if (s[i]) rows[i] = s[i];
    }
    return rows.map((r) => r.split(''));
  }

  function set(g, x, y, ch) { if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = ch; }
  function fillRow(g, y, x0, x1, ch) { for (let x = x0; x <= x1; x++) set(g, x, y, ch); }

  // 머리/장식 스타일 적용
  function applyStyle(g, dir, style, extras) {
    const d = dir === 'right' ? 'left' : dir;
    switch (style) {
      case 'spiky':
        if (d === 'down') { set(g, 5, 4, 'h'); set(g, 7, 3, 'h'); set(g, 7, 4, 'h'); set(g, 10, 4, 'h'); set(g, 3, 8, 'h'); set(g, 12, 8, 'h'); set(g, 9, 8, 's'); set(g, 6, 8, 'h'); }
        if (d === 'up') { set(g, 5, 4, 'h'); set(g, 7, 3, 'h'); set(g, 7, 4, 'h'); set(g, 10, 4, 'h'); set(g, 3, 8, 'h'); set(g, 12, 8, 'h'); }
        if (d === 'left') { set(g, 6, 4, 'h'); set(g, 9, 3, 'h'); set(g, 9, 4, 'h'); set(g, 12, 6, 'h'); set(g, 12, 8, 'h'); }
        break;
      case 'long':
        if (d === 'down') for (let y = 7; y <= 14; y++) { set(g, 3, y, 'h'); set(g, 12, y, 'h'); }
        if (d === 'up') for (let y = 11; y <= 15; y++) fillRow(g, y, 4, 11, 'h');
        if (d === 'left') for (let y = 9; y <= 15; y++) fillRow(g, y, 9, 11, 'h');
        break;
      case 'pony':
        if (d === 'up') for (let y = 9; y <= 15; y++) fillRow(g, y, 7, 8, 'h');
        if (d === 'left') for (let y = 8; y <= 13; y++) set(g, 12, y, 'h');
        if (d === 'down') { set(g, 12, 9, 'h'); set(g, 12, 10, 'h'); set(g, 3, 9, 'h'); }
        break;
      case 'bun':
        fillRow(g, 3, 6, 9, 'h'); fillRow(g, 4, 6, 9, 'h');
        break;
      case 'bald':
        if (d === 'down') { fillRow(g, 5, 5, 10, 's'); fillRow(g, 6, 5, 10, 's'); fillRow(g, 7, 5, 10, 's'); }
        if (d === 'left') { fillRow(g, 5, 5, 8, 's'); fillRow(g, 6, 4, 8, 's'); fillRow(g, 7, 4, 7, 's'); }
        if (d === 'up') { fillRow(g, 5, 5, 10, 's'); fillRow(g, 6, 5, 10, 's'); }
        break;
      case 'hood':
        if (d === 'down') { fillRow(g, 4, 6, 9, 'h'); for (let y = 8; y <= 11; y++) { set(g, 3, y, 'h'); set(g, 12, y, 'h'); } set(g, 4, 9, 'h'); set(g, 11, 9, 'h'); }
        if (d === 'up') { fillRow(g, 4, 6, 9, 'h'); for (let y = 11; y <= 14; y++) fillRow(g, y, 5, 10, 'h'); }
        if (d === 'left') { fillRow(g, 4, 6, 9, 'h'); for (let y = 8; y <= 13; y++) fillRow(g, y, 9, 12, 'h'); }
        break;
      case 'hat':
        if (d === 'left') {
          set(g, 11, 0, 't'); fillRow(g, 1, 9, 11, 't'); fillRow(g, 2, 8, 10, 't'); fillRow(g, 3, 6, 10, 't'); fillRow(g, 4, 5, 10, 't');
          fillRow(g, 5, 2, 13, 't'); fillRow(g, 6, 3, 12, 'T');
        } else {
          set(g, 9, 0, 't'); fillRow(g, 1, 8, 9, 't'); fillRow(g, 2, 7, 9, 't'); fillRow(g, 3, 6, 10, 't'); fillRow(g, 4, 5, 10, 't');
          fillRow(g, 5, 2, 13, 't'); fillRow(g, 6, 4, 11, 'T');
        }
        break;
      case 'helmet':
        for (let y = 5; y <= 7; y++) for (let x = 3; x <= 12; x++) if (g[y][x] === 'h' || y === 7) { if (x >= 4 && x <= 11) set(g, x, y, 'm'); }
        fillRow(g, 4, 6, 9, 'm'); set(g, 7, 3, 'r'); set(g, 8, 3, 'r'); set(g, 7, 2, 'r');
        if (d === 'down') { set(g, 4, 8, 'm'); set(g, 11, 8, 'm'); }
        if (d === 'up') for (let y = 8; y <= 10; y++) fillRow(g, y, 4, 11, 'm');
        break;
      case 'bandana':
        if (d !== 'up') fillRow(g, 7, 4, 11, 't');
        else { fillRow(g, 7, 4, 11, 't'); set(g, 9, 8, 't'); set(g, 10, 9, 't'); }
        break;
      case 'cap':
        fillRow(g, 5, 5, 10, 't'); fillRow(g, 6, 4, 11, 't');
        if (d === 'down') fillRow(g, 7, 3, 12, 'T');
        if (d === 'left') { fillRow(g, 7, 1, 6, 'T'); }
        break;
    }
    for (const ex of extras || []) {
      if (ex === 'long') applyStyle(g, dir, 'long', []);
      if (ex === 'beard') {
        if (d === 'down') { fillRow(g, 10, 4, 11, 'h'); fillRow(g, 11, 5, 10, 'h'); fillRow(g, 12, 6, 9, 'h'); set(g, 6, 10, 's'); set(g, 9, 10, 's'); }
        if (d === 'left') { fillRow(g, 10, 3, 6, 'h'); fillRow(g, 11, 4, 7, 'h'); fillRow(g, 12, 5, 6, 'h'); }
      }
      if (ex === 'apron') {
        if (d === 'down') for (let y = 13; y <= 17; y++) fillRow(g, y, 5, 10, y === 15 ? 'W' : 'W');
        if (d === 'left') for (let y = 13; y <= 16; y++) fillRow(g, y, 5, 6, 'W');
      }
      if (ex === 'cape') {
        if (d === 'up') for (let y = 12; y <= 17; y++) fillRow(g, y, 4, 11, 'C');
        if (d === 'left') for (let y = 12; y <= 17; y++) fillRow(g, y, 10, 11, 'C');
        if (d === 'down') { set(g, 3, 12, 'C'); set(g, 12, 12, 'C'); }
      }
      if (ex === 'robe') {
        if (d !== 'left') { fillRow(g, 16, 4, 11, 'c'); fillRow(g, 17, 3, 12, 'c'); }
        else { fillRow(g, 16, 5, 10, 'c'); fillRow(g, 17, 4, 11, 'c'); }
      }
      if (ex === 'blush' && d === 'down') { set(g, 5, 10, 'k'); set(g, 10, 10, 'k'); }
      if (ex === 'glasses' && d === 'down') { set(g, 6, 9, 'G'); set(g, 9, 9, 'G'); fillRow(g, 9, 5, 10, 'G'); set(g, 6, 9, 'e'); set(g, 9, 9, 'e'); }
      if (ex === 'scarf') {
        if (d === 'down') fillRow(g, 12, 4, 11, 'r');
        if (d === 'left') { fillRow(g, 12, 5, 11, 'r'); set(g, 12, 13, 'r'); }
        if (d === 'up') { fillRow(g, 12, 4, 11, 'r'); set(g, 9, 13, 'r'); set(g, 9, 14, 'r'); }
      }
      if (ex === 'staff') {
        const sx = d === 'left' ? 4 : 13;
        if (d !== 'up') { for (let y = 6; y <= 18; y++) set(g, sx, y, 'S'); set(g, sx, 5, 'y'); set(g, sx, 4, 'y'); }
      }
      if (ex === 'sword') {
        if (d === 'down') { for (let y = 10; y <= 14; y++) set(g, 13, y, 'M'); set(g, 13, 15, 'S'); }
        if (d === 'up') { for (let y = 12; y <= 16; y++) set(g, 7, y, 'M'); }
      }
      if (ex === 'axe') {
        if (d === 'down') { for (let y = 9; y <= 15; y++) set(g, 13, y, 'S'); fillRow(g, 9, 13, 14, 'M'); fillRow(g, 10, 13, 15, 'M'); }
        if (d === 'up') { for (let y = 11; y <= 17; y++) set(g, 9, y, 'S'); fillRow(g, 11, 8, 10, 'M'); }
      }
    }
  }

  const DEF_PAL = {
    h: '#5a3a22', s: '#f6cfa6', e: '#1b1430', c: '#3f63b8', a: '#6b4426', p: '#3a3a48', b: '#5e3818',
    t: '#6a3fa0', T: '#4a2a78', m: '#b8bccc', r: '#c4473a', W: '#f4f4f4', C: '#a8304a', k: '#f4a0a0',
    G: '#3a3a48', S: '#7a4a22', y: '#7cc4ff', M: '#d8dce8',
  };

  function shadeGrid(c) {
    // 오른쪽·아래 가장자리 픽셀을 살짝 어둡게 (입체감)
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height);
    const w = c.width, h = c.height;
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d.data[(y * w + x) * 4 + 3]);
    const out = new Uint8ClampedArray(d.data);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (!d.data[i + 3]) continue;
        if (!A(x + 1, y)) { out[i] *= 0.78; out[i + 1] *= 0.78; out[i + 2] *= 0.8; }
        else if (!A(x - 1, y) || !A(x, y - 1)) { out[i] = Math.min(255, out[i] * 1.08 + 6); out[i + 1] = Math.min(255, out[i + 1] * 1.08 + 6); out[i + 2] = Math.min(255, out[i + 2] * 1.08 + 6); }
      }
    d.data.set(out);
    g.putImageData(d, 0, 0);
  }

  const cache = new Map();

  // look: {hair, skin, cloth, accent, pants, boots, hat, hatDark, style, extras:[...]}
  function build(look) {
    const key = JSON.stringify(look);
    if (cache.has(key)) return cache.get(key);
    const pal = Object.assign({}, DEF_PAL, {
      h: look.hair || DEF_PAL.h, s: look.skin || DEF_PAL.s, c: look.cloth || DEF_PAL.c, a: look.accent || DEF_PAL.a,
      p: look.pants || DEF_PAL.p, b: look.boots || DEF_PAL.b, t: look.hat || DEF_PAL.t,
      T: look.hatDark || (look.hat ? Pix.shade(look.hat, -0.3) : DEF_PAL.T), C: look.cape || DEF_PAL.C, m: look.metal || DEF_PAL.m,
      r: look.scarf || DEF_PAL.r, W: look.apron || DEF_PAL.W, e: look.eye || DEF_PAL.e,
    });
    const frames = {};
    for (const dir of ['down', 'up', 'left', 'right']) {
      frames[dir] = [0, 1].map((step) => {
        const g = baseGrid(dir, step);
        applyStyle(g, dir, look.style || 'short', look.extras);
        let c = Pix.fromTemplate(g.map((r) => r.join('')), pal);
        shadeGrid(c);
        Pix.outline(c, '#1a1226');
        if (dir === 'right') c = Pix.flipH(c);
        return c;
      });
    }
    // 위/아래 걷기: 디딤 프레임을 좌우반전해 반대 발도 표현
    frames.downAlt = Pix.flipH(frames.down[1]);
    frames.upAlt = Pix.flipH(frames.up[1]);
    cache.set(key, frames);
    return frames;
  }

  // 걷기 사이클: 서기 → 디딤 → 서기 → 반대 디딤
  function frameFor(frames, dir, phase) {
    const p = phase % 4;
    if (p === 0 || p === 2) return frames[dir][0];
    if (p === 1) return frames[dir][1];
    if (dir === 'down') return frames.downAlt;
    if (dir === 'up') return frames.upAlt;
    return frames[dir][1];
  }

  // ── 동물 / 특수 스프라이트 (좌향 템플릿) ──
  const CRITTERS = {
    dog: {
      pal: { f: '#c8945a', B: '#7a4a22', e: '#1b1430', n: '#1b1430', w: '#f4e4c8' },
      rows: [
        '................', '................', '................', '................', '................', '................', '................',
        '................', '................', '..BB............', '.BffB........f..', 'nfeff........f..', '.ffffffffffff...',
        '..fwwfffffffff..', '..fffffffffffff.', '..ff.ff...ff.ff.', '..ff.ff...ff.ff.', '..BB.BB...BB.BB.', '................', '................',
      ],
      step: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '..ff..ff..ff..f.', '.ff...ff.ff...ff', '.BB...BB.BB...BB'],
    },
    chicken: {
      pal: { f: '#f8f8f0', r: '#e04040', y: '#ffb020', e: '#1b1430', d: '#d8d8d0' },
      rows: [
        '................', '................', '................', '................', '................', '................', '................',
        '................', '................', '................', '....r...........', '...rff..........', '..yfeff.........', '...ffff....ff...',
        '...fffffffff....', '....fffdffff....', '.....ffffff.....', '......y..y......', '......y..y......', '................',
      ],
      step: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '.....y....y.....', '.....y....y.....'],
    },
    cat: {
      pal: { f: '#5a5a6a', B: '#3a3a48', e: '#ffd75e', n: '#f4a0a0', w: '#e8e8f0' },
      rows: [
        '................', '................', '................', '................', '................', '................', '................',
        '................', '................', '................', '.B.B............', '.fffB...........', 'nefef.......f...', '.ffff......f....',
        '..ffffffffff....', '..fwffffffff....', '..ff.f...f.f....', '..ff.f...f.f....', '................', '................',
      ],
      step: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '..f..f..f..f....', '.ff..f..f...f...'],
    },
    mushroom: {
      pal: { r: '#c43a5a', R: '#8c2440', w: '#fff4e0', s: '#f2e0c0', e: '#1b1430', y: '#ffd75e', m: '#6b4426' },
      rows: [
        '................', '................', '.....y.y.y......', '.....yyyyy......', '....rrrrrrr.....', '...rrwrrrwrr....', '..rrrrrrrrrrr...',
        '..rwrrrrrrwrr...', '..RRRRRRRRRRR...', '....sssssss.....', '....seesees.....', '....smmmmms.....', '....sssssss.....', '.....sssss......',
        '.....ss.ss......', '................', '................', '................', '................', '................',
      ],
      step: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, '....ss...ss.....'],
    },
  };
  const critterCache = new Map();
  function critter(kind) {
    if (critterCache.has(kind)) return critterCache.get(kind);
    const def = CRITTERS[kind];
    const mk = (step) => {
      const rows = def.rows.slice();
      if (step && def.step) def.step.forEach((r, i) => { if (r) rows[i] = r; });
      const c = Pix.fromTemplate(rows, def.pal);
      shadeGrid(c);
      return Pix.outline(c, '#1a1226');
    };
    const l0 = mk(0), l1 = mk(1);
    const r0 = Pix.flipH(l0), r1 = Pix.flipH(l1);
    const frames = { left: [l0, l1], right: [r0, r1], down: [l0, l1], up: [r0, r1], downAlt: l1, upAlt: r1, critter: true };
    critterCache.set(kind, frames);
    return frames;
  }

  return { build, frameFor, critter, W, H };
})();

// 주요 인물 외형 정의
const LOOKS = {
  hero: { hair: '#2a2438', style: 'spiky', cloth: '#5a7fd0', accent: '#2f3a5a', pants: '#3a3a52', boots: '#4a3020', extras: ['scarf'], scarf: '#e0a030' },
  bran: { hair: '#c4622e', style: 'short', cloth: '#8a5a3a', accent: '#d8b040', pants: '#5a4030', boots: '#3d2410', skin: '#e8b890', extras: ['axe'] },
  linette: { hair: '#e8c060', style: 'hat', cloth: '#6a3fa0', accent: '#d8b040', pants: '#6a3fa0', boots: '#3d2440', hat: '#4a2a88', extras: ['robe', 'long'] },
  mio: { hair: '#1a1a2a', style: 'long', cloth: '#f4f4f4', accent: '#c4473a', pants: '#c4473a', boots: '#7a2a2a', extras: ['robe', 'blush'] },
  nell: { hair: '#4a5a8a', style: 'hood', cloth: '#3a4a3a', accent: '#8a6a3a', pants: '#2a2a32', boots: '#2a1a10', extras: ['cape'], cape: '#3a4a3a' },
  osric: { hair: '#7a7a88', style: 'hood', cloth: '#6a6a78', accent: '#3a3a48', pants: '#4a4a58', boots: '#2a2a32', extras: ['robe', 'glasses'] },
  elder: { hair: '#e8e8f0', style: 'bald', cloth: '#5a6a3a', accent: '#d8b040', pants: '#5a6a3a', extras: ['beard', 'robe', 'staff'] },
  priestess: { hair: '#d8d8e0', style: 'bun', cloth: '#f4f4f4', accent: '#d8b040', pants: '#f4f4f4', extras: ['robe'] },
  innkeeper: { hair: '#8a3a2a', style: 'bun', cloth: '#c46a4a', accent: '#6b4426', pants: '#6a4a3a', extras: ['apron'] },
  smith: { hair: '#3a2a20', style: 'bald', cloth: '#6a5a4a', accent: '#3a2a20', pants: '#4a3a30', skin: '#d8a070', extras: ['beard', 'apron'], apron: '#8a6a4a' },
  herbalist: { hair: '#c8c8d0', style: 'bun', cloth: '#5a8a4a', accent: '#d8b040', pants: '#5a8a4a', extras: ['robe', 'apron'] },
  guard: { hair: '#5a3a22', style: 'helmet', cloth: '#7a7a8a', accent: '#c4473a', pants: '#4a4a58', boots: '#3a3a48', metal: '#b8bccc' },
  farmer: { hair: '#8a5a2a', style: 'cap', hat: '#d8b860', cloth: '#5a8a3a', accent: '#6b4426', pants: '#4a5a8a', skin: '#e0a878' },
  baker: { hair: '#f0e0c0', style: 'cap', hat: '#f4f4f4', cloth: '#f4f4f4', accent: '#c4884a', pants: '#8a6a4a' },
  bakerwife: { hair: '#c86a3a', style: 'pony', cloth: '#d86a8a', accent: '#f4f4f4', pants: '#d86a8a', extras: ['apron', 'robe'] },
  child: { hair: '#e8a040', style: 'pony', cloth: '#ff8a5a', accent: '#f4f4f4', pants: '#4a6ac8', extras: ['blush'] },
  boy: { hair: '#3a2a20', style: 'short', cloth: '#4aa0c8', accent: '#f4f4f4', pants: '#5a4a3a' },
  oldman: { hair: '#c8c8d0', style: 'bald', cloth: '#7a6a8a', accent: '#4a3a5a', pants: '#5a4a6a', extras: ['beard'] },
  hunter: { hair: '#4a3020', style: 'bandana', hat: '#4a7a3a', cloth: '#6a5a3a', accent: '#3a2a1a', pants: '#4a4030', skin: '#d8a070', extras: ['beard'] },
  collector: { hair: '#8a4ab0', style: 'spiky', cloth: '#d8b040', accent: '#8a4ab0', pants: '#4a2a6a', extras: ['glasses', 'cape'], cape: '#8a4ab0' },
  villagerA: { hair: '#6a4a2a', style: 'short', cloth: '#8aa04a', accent: '#5a3a22', pants: '#5a5a6a' },
  villagerB: { hair: '#2a2a3a', style: 'long', cloth: '#c88ab0', accent: '#f4f4f4', pants: '#c88ab0', extras: ['robe'] },
  villagerC: { hair: '#b0702a', style: 'short', cloth: '#4a7ab0', accent: '#2a3a5a', pants: '#3a3a48' },
  merchant: { hair: '#3a3a20', style: 'cap', hat: '#c4473a', cloth: '#d8a040', accent: '#6b4426', pants: '#5a4a3a', extras: ['beard'] },
  // ── 제2장 인물 ──
  dean: { hair: '#c8c8d8', style: 'bun', cloth: '#3a3a7a', accent: '#d8b040', pants: '#3a3a7a', boots: '#2a2a48', extras: ['robe', 'glasses'] },
  commander: { hair: '#d8b860', style: 'short', cloth: '#b8bccc', accent: '#3f63b8', pants: '#4a4a58', boots: '#3a3a48', extras: ['cape', 'beard'], cape: '#3f63b8' },
  knight: { hair: '#5a3a22', style: 'helmet', cloth: '#b8bccc', accent: '#3f63b8', pants: '#4a4a58', boots: '#3a3a48', metal: '#d8dce8' },
  gawain: { hair: '#8a3a2a', style: 'short', cloth: '#b8bccc', accent: '#c4473a', pants: '#4a4a58', boots: '#3a3a48', extras: ['cape'], cape: '#c4473a' },
  vane: { hair: '#4a2a3a', style: 'hood', cloth: '#4a2a3a', accent: '#c4a050', pants: '#2a1420', boots: '#1a0a10', extras: ['robe', 'cape'], cape: '#2a1420' },
  acolyte: { hair: '#6a6a78', style: 'hood', cloth: '#6a6a78', accent: '#a8a8b8', pants: '#4a4a58', boots: '#2a2a32', extras: ['robe'] },
  cassandra: { hair: '#4a5a8a', style: 'long', cloth: '#4a3a6a', accent: '#ffd75e', pants: '#4a3a6a', boots: '#2a1e44', extras: ['robe'] },
  otto: { hair: '#a8a8b0', style: 'bald', cloth: '#5a5a3a', accent: '#3a3a20', pants: '#4a4a30', skin: '#d8a070', extras: ['beard'] },
  matron: { hair: '#a8a8b0', style: 'bun', cloth: '#6a8ab0', accent: '#f4f4f4', pants: '#6a8ab0', extras: ['apron', 'robe'] },
  orphanA: { hair: '#c86a3a', style: 'short', cloth: '#d8b040', accent: '#f4f4f4', pants: '#5a4a3a', extras: ['blush'] },
  orphanB: { hair: '#2a2a3a', style: 'pony', cloth: '#7cc4ff', accent: '#f4f4f4', pants: '#4a5a8a', extras: ['blush'] },
  luna: { hair: '#f0d070', style: 'pony', cloth: '#ff9ac8', accent: '#ffffff', pants: '#c8608a', extras: ['blush', 'robe'] },
  librarian: { hair: '#5a3a2a', style: 'short', cloth: '#5a3a2a', accent: '#d8b040', pants: '#3a2a20', extras: ['glasses', 'robe'] },
  noble: { hair: '#e8c060', style: 'long', cloth: '#a8304a', accent: '#f2c84b', pants: '#a8304a', extras: ['robe'] },
  bard: { hair: '#8a4a2a', style: 'cap', hat: '#4b8a4c', cloth: '#d86a3a', accent: '#f2c84b', pants: '#4a3a5a', extras: ['cape'], cape: '#4b8a4c' },
  student: { hair: '#3a2a20', style: 'hat', hat: '#3a3a7a', cloth: '#3a3a7a', accent: '#d8b040', pants: '#3a3a7a', extras: ['robe'] },
  capsmith: { hair: '#2a2a2a', style: 'bald', cloth: '#4a4a58', accent: '#c4473a', pants: '#3a3a48', skin: '#c88a5a', extras: ['beard', 'apron'], apron: '#6a4a3a' },
  pharmacist: { hair: '#4a2a5a', style: 'long', cloth: '#f4f4f4', accent: '#4b8a4c', pants: '#4b8a4c', extras: ['robe', 'glasses'] },
  capinnkeeper: { hair: '#3a2a20', style: 'short', cloth: '#7a3a2a', accent: '#f4f4f4', pants: '#3a2a20', extras: ['apron', 'beard'] },
  caravan: { hair: '#6a4a2a', style: 'bandana', hat: '#c4473a', cloth: '#5a7a9a', accent: '#d8b040', pants: '#4a3a2a', skin: '#d8a070' },
  // ── 제3장 인물 ──
  hakim: { hair: '#2a2a2a', style: 'bandana', hat: '#f4f0e0', cloth: '#3a6ab0', accent: '#d8b040', pants: '#e8dcc0', skin: '#a8704a', extras: ['beard', 'robe'] },
  desertM: { hair: '#2a2a2a', style: 'bandana', hat: '#e8dcc0', cloth: '#c8784a', accent: '#5a3a22', pants: '#e8dcc0', skin: '#b8804a' },
  desertF: { hair: '#1a1a2a', style: 'long', cloth: '#c4473a', accent: '#d8b040', pants: '#c4473a', skin: '#b8804a', extras: ['robe'] },
  desertKid: { hair: '#1a1a2a', style: 'short', cloth: '#e8dcc0', accent: '#3a6ab0', pants: '#7a5a3a', skin: '#b8804a', extras: ['blush'] },
  zahir: { hair: '#2a2a2a', style: 'hood', cloth: '#e8dcc0', accent: '#3a6ab0', pants: '#e8dcc0', boots: '#7a5a3a', skin: '#a8704a', extras: ['robe', 'beard'] },
  aria: { hair: '#1a1a2a', style: 'long', cloth: '#f4f4f4', accent: '#c4473a', pants: '#c4473a', boots: '#7a2a2a', extras: ['robe'] },
  messenger: { hair: '#2a2a2a', style: 'bandana', hat: '#d8b040', cloth: '#7a5a3a', accent: '#e8dcc0', pants: '#5a4030', skin: '#b8804a' },
  raider: { hair: '#2a2a2a', style: 'bandana', hat: '#3a3a3a', cloth: '#7a4a2a', accent: '#c4473a', pants: '#3a2a1a', skin: '#b07850' },
  nadia: { hair: '#b8b0a8', style: 'bun', cloth: '#c8a878', accent: '#3a6ab0', pants: '#a88858', skin: '#b07850', extras: ['robe'] },
  teller: { hair: '#4a2a5a', style: 'hood', cloth: '#6a3fa0', accent: '#ffd75e', pants: '#4a2a6a', skin: '#c88a5a', extras: ['robe'] },
  mushking: 'critter:mushroom',
};
