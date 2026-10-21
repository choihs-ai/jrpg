'use strict';
// ─────────────────────────────────────────────────────────────
// MonsterArt: 몬스터 그림을 캔버스 도형으로 그린 뒤 픽셀화 + 외곽선
// ─────────────────────────────────────────────────────────────
const MonsterArt = (() => {
  // 도형 도우미 (g = 2D context)
  const E = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); g.fill(); };
  const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const Poly = (g, pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
  const L = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  const eye = (g, x, y, r = 2.2, pupil = '#140c1c', white = '#ffffff') => { E(g, x, y, r, r * 1.2, white); E(g, x + r * 0.25, y + r * 0.2, r * 0.6, r * 0.8, pupil); E(g, x - r * 0.3, y - r * 0.45, 0.6, 0.6, '#ffffff'); };

  const ART = {
    jelly: { w: 44, h: 40, draw(g, p) {
      E(g, 22, 27, 18, 12, p.dark); E(g, 22, 25, 17, 11, p.body); E(g, 22, 17, 11, 9, p.body);
      E(g, 15, 18, 4, 3, p.light); E(g, 13, 22, 2, 2, p.light);
      eye(g, 17, 25, 2.4); eye(g, 27, 25, 2.4);
      L(g, 19, 31, 22, 33, '#1a1226'); L(g, 22, 33, 25, 31, '#1a1226');
      if (!p.shiny) { Poly(g, [22, 9, 17, 3, 21, 6], '#3f8a35'); Poly(g, [22, 9, 28, 2, 25, 7], '#5ab04a'); }
      else { Poly(g, [34, 6, 35, 10, 39, 11, 35, 12, 34, 16, 33, 12, 29, 11, 33, 10], '#ffffff'); }
    } },
    rabbit: { w: 44, h: 40, draw(g, p) {
      E(g, 26, 28, 13, 9, p.dark); E(g, 26, 27, 12, 8, p.body); E(g, 38, 25, 3, 3, p.light);
      E(g, 15, 22, 8, 7, p.body); E(g, 13, 20, 4, 3, p.light);
      E(g, 12, 9, 2.5, 7, p.body, -0.2); E(g, 18, 9, 2.5, 7, p.body, 0.2); E(g, 12, 9, 1, 5, '#f4a0b0', -0.2); E(g, 18, 9, 1, 5, '#f4a0b0', 0.2);
      Poly(g, [14, 16, 17, 16, 15, 7], p.horn);
      eye(g, 12, 22, 1.8, '#c02040'); E(g, 8, 25, 1.4, 1, '#f4a0b0');
      R(g, 18, 33, 4, 4, p.dark); R(g, 30, 33, 5, 4, p.dark);
    } },
    shroom: { w: 44, h: 44, draw(g, p) {
      R(g, 15, 22, 14, 16, p.stem); E(g, 22, 38, 8, 3, p.stem);
      E(g, 22, 20, 19, 12, p.dark); E(g, 22, 18, 18, 11, p.cap); R(g, 3, 20, 38, 4, p.dark);
      R(g, 2, 21, 40, 3, p.dark);
      E(g, 12, 14, 3, 2.5, p.spot); E(g, 24, 10, 4, 3, p.spot); E(g, 33, 15, 3, 2.5, p.spot); E(g, 18, 18, 2, 1.5, p.spot);
      E(g, 19, 28, 1.6, 2.2, '#140c1c'); E(g, 26, 28, 1.6, 2.2, '#140c1c'); L(g, 17, 25, 21, 27, '#140c1c'); L(g, 28, 25, 24, 27, '#140c1c');
      L(g, 19, 33, 26, 33, '#140c1c'); R(g, 14, 39, 5, 3, p.dark); R(g, 25, 39, 5, 3, p.dark);
    } },
    crow: { w: 48, h: 40, draw(g, p) {
      Poly(g, [22, 22, 2, 10, 6, 18, 1, 20, 8, 24, 4, 28, 16, 28], p.dark); Poly(g, [26, 22, 46, 10, 42, 18, 47, 20, 40, 24, 44, 28, 32, 28], p.dark);
      Poly(g, [20, 22, 6, 14, 10, 22, 16, 26], p.light); Poly(g, [28, 22, 42, 14, 38, 22, 32, 26], p.light);
      E(g, 24, 25, 8, 10, p.body); E(g, 24, 13, 6, 6, p.body);
      Poly(g, [24, 15, 31, 17, 24, 19], '#e0a020'); E(g, 22, 12, 1.6, 1.6, p.eye); E(g, 26, 12, 1.6, 1.6, p.eye);
      Poly(g, [20, 34, 24, 39, 28, 34], p.dark); L(g, 21, 34, 20, 38, '#e0a020'); L(g, 27, 34, 28, 38, '#e0a020');
    } },
    boar: { w: 52, h: 40, draw(g, p) {
      E(g, 30, 23, 17, 11, p.dark); E(g, 29, 22, 16, 10, p.body); E(g, 26, 18, 9, 4, p.light);
      for (let i = 0; i < 6; i++) Poly(g, [18 + i * 5, 14 - (i % 2), 21 + i * 5, 6 + (i % 2) * 2, 24 + i * 5, 14], p.thorn);
      E(g, 12, 25, 9, 8, p.body); E(g, 5, 27, 4, 4, p.light); E(g, 4, 26, 1, 1, '#140c1c'); E(g, 4, 28, 1, 1, '#140c1c');
      L(g, 8, 30, 3, 22, p.tusk, 2); L(g, 12, 31, 9, 24, p.tusk, 2);
      E(g, 12, 21, 1.6, 1.8, '#140c1c'); Poly(g, [14, 15, 18, 12, 17, 18], p.dark);
      R(g, 17, 30, 5, 8, p.dark); R(g, 26, 31, 5, 7, p.dark); R(g, 36, 30, 5, 8, p.dark); R(g, 42, 29, 4, 7, p.dark);
      L(g, 45, 20, 49, 17, p.dark, 2);
    } },
    vine: { w: 48, h: 48, draw(g, p) {
      for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) { const t = i / 25; E(g, 10 + k * 14 + Math.sin(t * 6 + k) * 4, 46 - t * 26, 3.2 - t, 3.2 - t, k === 1 ? p.body : p.dark); }
      Poly(g, [8, 32, 2, 28, 9, 26], p.light); Poly(g, [40, 30, 47, 26, 41, 24], p.light);
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; E(g, 24 + Math.cos(a) * 9, 16 + Math.sin(a) * 9, 5, 5, p.flower); }
      E(g, 24, 16, 7, 7, '#5a1020'); for (let i = 0; i < 5; i++) Poly(g, [19 + i * 2.4, 11, 21 + i * 2.4, 11, 20 + i * 2.4, 14], '#ffffff');
      for (let i = 0; i < 5; i++) Poly(g, [19 + i * 2.4, 21, 21 + i * 2.4, 21, 20 + i * 2.4, 18], '#ffffff');
      E(g, 21, 16, 1, 1, '#ffe040'); E(g, 27, 16, 1, 1, '#ffe040');
    } },
    goblin: { w: 44, h: 48, draw(g, p) {
      R(g, 15, 36, 5, 10, p.dark); R(g, 24, 36, 5, 10, p.dark);
      E(g, 22, 30, 10, 9, p.cloth); R(g, 14, 33, 16, 4, '#5a3418');
      Poly(g, [10, 14, 1, 8, 10, 20], p.skin); Poly(g, [34, 14, 43, 8, 34, 20], p.skin);
      E(g, 22, 16, 11, 10, p.skin); E(g, 18, 12, 4, 2, p.dark);
      E(g, 17, 16, 2.2, 2.4, '#ffe040'); E(g, 27, 16, 2.2, 2.4, '#ffe040'); E(g, 17, 16, 0.8, 1.6, '#140c1c'); E(g, 27, 16, 0.8, 1.6, '#140c1c');
      L(g, 16, 22, 28, 22, '#140c1c', 1.5); Poly(g, [18, 22, 19, 25, 20, 22], '#ffffff'); Poly(g, [24, 22, 25, 25, 26, 22], '#ffffff');
      E(g, 35, 30, 3, 3, p.skin); Poly(g, [36, 30, 42, 18, 44, 19, 38, 31], p.blade); R(g, 34, 30, 4, 2, '#5a3418');
      E(g, 9, 31, 3, 3, p.skin);
    } },
    bloom: { w: 44, h: 48, draw(g, p) {
      R(g, 21, 26, 3, 20, p.stem); Poly(g, [22, 38, 10, 32, 14, 40], p.stem); Poly(g, [23, 34, 35, 28, 31, 37], p.stem);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; E(g, 22 + Math.cos(a) * 10, 18 + Math.sin(a) * 10, 6.5, 6.5, i % 2 ? p.petal : p.dark); }
      E(g, 22, 18, 8, 8, p.center);
      L(g, 17, 17, 20, 18, '#140c1c', 1.2); L(g, 24, 18, 27, 17, '#140c1c', 1.2); E(g, 22, 22, 1.5, 1, '#c84040');
      E(g, 17, 20, 1.5, 1, '#ff9a9a'); E(g, 27, 20, 1.5, 1, '#ff9a9a');
    } },
    skeleton: { w: 44, h: 52, draw(g, p) {
      R(g, 17, 38, 3, 12, p.bone); R(g, 25, 38, 3, 12, p.bone); R(g, 15, 49, 6, 2, p.bone); R(g, 24, 49, 6, 2, p.bone);
      R(g, 21, 20, 3, 18, p.dark);
      for (let i = 0; i < 4; i++) { E(g, 22.5, 23 + i * 4, 8 - i, 1.4, p.bone); }
      E(g, 22.5, 37, 6, 2.5, p.bone);
      E(g, 22, 11, 9, 9, p.bone); R(g, 17, 16, 10, 6, p.bone); E(g, 18, 11, 2.6, 3, '#1a1020'); E(g, 26, 11, 2.6, 3, '#1a1020');
      E(g, 18, 11, 1, 1, p.eye); E(g, 26, 11, 1, 1, p.eye); for (let i = 0; i < 4; i++) R(g, 18 + i * 2.4, 19, 1, 3, '#1a1020');
      L(g, 14, 22, 9, 32, p.bone, 2.5); L(g, 31, 22, 36, 30, p.bone, 2.5);
      Poly(g, [36, 30, 40, 6, 42, 7, 38, 31], p.rust); R(g, 33, 29, 8, 2, '#5a3418');
      E(g, 8, 32, 6, 8, '#6a5a4a'); E(g, 8, 32, 4, 6, '#8a7a5a');
    } },
    bat: { w: 52, h: 36, draw(g, p) {
      Poly(g, [26, 16, 2, 6, 4, 14, 1, 22, 8, 20, 10, 26, 16, 22, 20, 26], p.dark); Poly(g, [26, 16, 50, 6, 48, 14, 51, 22, 44, 20, 42, 26, 36, 22, 32, 26], p.dark);
      Poly(g, [24, 16, 8, 10, 10, 18, 16, 20], p.wing); Poly(g, [28, 16, 44, 10, 42, 18, 36, 20], p.wing);
      E(g, 26, 18, 7, 8, p.body); Poly(g, [21, 12, 20, 4, 25, 11], p.body); Poly(g, [31, 12, 32, 4, 27, 11], p.body);
      E(g, 23, 16, 1.8, 1.8, p.eye); E(g, 29, 16, 1.8, 1.8, p.eye); Poly(g, [24, 22, 25, 25, 26, 22], '#ffffff'); Poly(g, [27, 22, 28, 25, 29, 22], '#ffffff');
    } },
    sentry: { w: 48, h: 56, draw(g, p) {
      R(g, 13, 40, 8, 14, p.dark); R(g, 27, 40, 8, 14, p.dark);
      R(g, 10, 20, 28, 22, p.stone); R(g, 10, 20, 28, 3, p.light); R(g, 34, 20, 4, 22, p.dark);
      L(g, 16, 28, 32, 28, p.eye, 1); L(g, 24, 24, 24, 38, p.eye, 1); E(g, 24, 31, 3, 3, p.eye);
      R(g, 2, 22, 8, 18, p.stone); R(g, 38, 22, 8, 18, p.stone); R(g, 1, 38, 10, 7, p.dark); R(g, 37, 38, 10, 7, p.dark);
      R(g, 14, 5, 20, 15, p.stone); R(g, 14, 5, 20, 3, p.light); R(g, 18, 11, 12, 4, '#1a1a28'); E(g, 24, 13, 2.5, 1.6, p.eye);
    } },
    echo: { w: 44, h: 48, draw(g, p) {
      Poly(g, [8, 22, 6, 40, 12, 34, 16, 44, 22, 36, 28, 44, 32, 34, 38, 40, 36, 22], p.dark);
      E(g, 22, 20, 14, 14, p.body); E(g, 18, 14, 6, 4, p.light);
      E(g, 17, 21, 2.5, 3.5, p.eye); E(g, 27, 21, 2.5, 3.5, p.eye); E(g, 17, 21, 1, 1.5, '#ffffff'); E(g, 27, 21, 1, 1.5, '#ffffff');
      E(g, 22, 29, 3, 2, '#140c1c');
      E(g, 5, 12, 2, 2, p.light); E(g, 40, 8, 1.5, 1.5, p.light); E(g, 38, 30, 1.5, 1.5, p.light);
    } },
    lizard: { w: 56, h: 40, draw(g, p) {
      for (let i = 0; i < 14; i++) E(g, 40 + i * 0.9, 26 - i * 1.3, 3.5 - i * 0.15, 3.5 - i * 0.15, p.body);
      E(g, 53, 7, 3, 4, p.flame); E(g, 53, 8, 1.5, 2, '#ffffff');
      E(g, 26, 26, 15, 8, p.dark); E(g, 25, 25, 14, 7, p.body); E(g, 22, 22, 8, 3, p.light);
      for (let i = 0; i < 5; i++) Poly(g, [16 + i * 5, 19, 18 + i * 5, 14, 20 + i * 5, 19], p.dark);
      E(g, 9, 24, 9, 6, p.body); E(g, 4, 26, 4, 3, p.body); eye(g, 9, 21, 2, '#140c1c', '#ffe060');
      L(g, 1, 27, 7, 28, '#5a1010', 1.2); Poly(g, [1, 26, -3, 24, -2, 29], p.flame);
      R(g, 13, 30, 4, 7, p.dark); R(g, 22, 31, 4, 6, p.dark); R(g, 31, 30, 4, 7, p.dark);
    } },
    mimic: { w: 48, h: 44, draw(g, p) {
      R(g, 6, 22, 36, 18, p.wood); R(g, 6, 22, 36, 3, p.gold); R(g, 6, 37, 36, 3, p.dark); R(g, 22, 26, 4, 6, p.gold);
      R(g, 6, 22, 3, 18, p.dark); R(g, 39, 22, 3, 18, p.dark);
      Poly(g, [6, 22, 10, 4, 38, 4, 42, 22], p.mouth);
      Poly(g, [4, 20, 8, 2, 40, 2, 44, 20, 40, 8, 8, 8], p.wood); R(g, 8, 2, 32, 3, p.gold);
      for (let i = 0; i < 7; i++) Poly(g, [9 + i * 4.4, 21, 11 + i * 4.4, 15, 13 + i * 4.4, 21], '#ffffff');
      for (let i = 0; i < 6; i++) Poly(g, [11 + i * 4.4, 9, 13 + i * 4.4, 14, 15 + i * 4.4, 9], '#ffffff');
      Poly(g, [22, 18, 30, 30, 34, 26, 26, 17], p.tongue);
      E(g, 16, 12, 2, 2, '#ffe040'); E(g, 32, 12, 2, 2, '#ffe040');
    } },
    kingmush: { w: 56, h: 60, draw(g, p) {
      R(g, 17, 30, 22, 22, p.stem); E(g, 28, 52, 12, 4, p.stem); R(g, 14, 51, 8, 6, '#6b4426'); R(g, 34, 51, 8, 6, '#6b4426');
      E(g, 28, 26, 25, 14, p.dark); E(g, 28, 24, 24, 13, p.cap); R(g, 3, 27, 50, 4, p.dark);
      E(g, 15, 18, 4, 3, p.spot); E(g, 30, 14, 5, 3.5, p.spot); E(g, 43, 20, 4, 3, p.spot); E(g, 22, 25, 2.5, 2, p.spot); E(g, 38, 26, 2.5, 2, p.spot);
      Poly(g, [18, 12, 18, 2, 23, 7, 28, 0, 33, 7, 38, 2, 38, 12], p.crown); E(g, 28, 7, 2, 2, '#e04040');
      eye(g, 23, 37, 2.2); eye(g, 33, 37, 2.2);
      Poly(g, [28, 42, 18, 46, 20, 42, 28, 40, 36, 42, 38, 46], '#5a3418');
      L(g, 40, 36, 50, 20, '#8a5a2c', 2.5); E(g, 50, 19, 3, 3, p.crown);
    } },
    ironboar: { w: 88, h: 64, draw(g, p) {
      E(g, 50, 36, 30, 20, p.dark); E(g, 49, 34, 29, 18, p.body); E(g, 44, 26, 16, 6, p.light);
      for (let i = 0; i < 9; i++) Poly(g, [28 + i * 6, 20 - (i % 2) * 2, 32 + i * 6, 6 + (i % 3) * 3, 36 + i * 6, 20], p.thorn);
      E(g, 20, 38, 15, 14, p.body); E(g, 8, 42, 7, 7, p.light); E(g, 6, 40, 1.5, 1.5, '#140c1c'); E(g, 6, 45, 1.5, 1.5, '#140c1c');
      L(g, 14, 48, 3, 30, p.tusk, 4); L(g, 22, 50, 15, 34, p.tusk, 4); L(g, 14, 48, 3, 30, '#ffffff', 1);
      E(g, 21, 32, 3, 3.5, p.eye); E(g, 21, 32, 1, 1.5, '#ffffff'); L(g, 16, 27, 26, 30, '#140c1c', 2);
      L(g, 30, 30, 38, 42, '#c8a0a0', 1.5); L(g, 58, 26, 64, 36, '#c8a0a0', 1.5);
      R(g, 28, 48, 9, 14, p.dark); R(g, 44, 50, 9, 12, p.dark); R(g, 60, 48, 9, 14, p.dark); R(g, 72, 46, 7, 12, p.dark);
      Poly(g, [24, 26, 30, 14, 32, 28], p.dark);
    } },
    golem: { w: 112, h: 112, draw(g, p) {
      // 다리
      R(g, 30, 80, 20, 28, p.dark); R(g, 62, 80, 20, 28, p.dark); R(g, 26, 102, 28, 8, p.stone); R(g, 58, 102, 28, 8, p.stone);
      // 몸통
      Poly(g, [18, 40, 94, 40, 86, 86, 26, 86], p.stone); Poly(g, [18, 40, 94, 40, 92, 46, 20, 46], p.light); Poly(g, [80, 46, 94, 40, 86, 86, 78, 86], p.dark);
      L(g, 30, 60, 44, 70, p.dark, 2); L(g, 70, 74, 82, 62, p.dark, 2);
      if (p.phase2) {
        E(g, 56, 62, 16, 14, '#140818'); E(g, 56, 62, 12, 11, p.crystal); E(g, 56, 62, 7, 7, p.glow); E(g, 53, 58, 2, 3, '#ffffff');
        L(g, 40, 50, 48, 58, '#140818', 2); L(g, 72, 52, 64, 60, '#140818', 2); L(g, 44, 76, 50, 70, '#140818', 2);
      } else {
        R(g, 44, 52, 24, 22, p.dark); R(g, 46, 54, 20, 18, p.stone); E(g, 56, 63, 5, 5, p.crystal); E(g, 56, 63, 2, 2, p.glow);
      }
      // 팔 + 철퇴
      Poly(g, [18, 42, 4, 48, 2, 78, 14, 80, 18, 56], p.stone); E(g, 8, 82, 8, 7, p.dark);
      Poly(g, [94, 42, 106, 46, 108, 70, 100, 72, 94, 56], p.stone); R(g, 100, 18, 4, 56, '#5e3818');
      E(g, 102, 16, 10, 10, '#4a4a58'); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; Poly(g, [102 + Math.cos(a) * 9, 16 + Math.sin(a) * 9, 102 + Math.cos(a) * 15, 16 + Math.sin(a) * 15, 102 + Math.cos(a + 0.3) * 9, 16 + Math.sin(a + 0.3) * 9], '#7a7a88'); }
      // 종 모양 머리
      Poly(g, [40, 40, 44, 14, 56, 6, 68, 14, 72, 40], p.bell); R(g, 36, 36, 40, 6, Pix.shade(p.bell, -0.3)); E(g, 56, 6, 4, 3, Pix.shade(p.bell, -0.2));
      L(g, 46, 18, 48, 34, Pix.shade(p.bell, 0.3), 2);
      R(g, 46, 24, 20, 7, '#140818'); E(g, 51, 27, 3, 2, p.phase2 ? p.glow : '#7cc4ff'); E(g, 61, 27, 3, 2, p.phase2 ? p.glow : '#7cc4ff');
    } },

    // ── 제2장 ──
    wolf: { w: 56, h: 44, draw(g, p) {
      Poly(g, [44, 18, 54, 8, 52, 20, 48, 24], p.dark); // 꼬리
      E(g, 30, 26, 16, 9, p.dark); E(g, 29, 24, 15, 8, p.body); E(g, 30, 19, 10, 3, p.light);
      for (let i = 0; i < 5; i++) Poly(g, [20 + i * 4, 18, 22 + i * 4, 12 - (i % 2) * 2, 25 + i * 4, 18], p.mane);
      E(g, 13, 20, 9, 7, p.body); Poly(g, [4, 22, 10, 18, 12, 26, 4, 26], p.body); E(g, 3, 23, 2, 2, '#140c1c');
      Poly(g, [10, 14, 12, 4, 16, 13], p.body); Poly(g, [15, 13, 19, 4, 20, 14], p.dark);
      E(g, 12, 18, 1.8, 1.4, p.eye); L(g, 5, 26, 11, 27, '#140c1c', 1);
      Poly(g, [6, 26, 7, 29, 8, 26], '#ffffff'); Poly(g, [9, 26, 10, 29, 11, 26], '#ffffff');
      R(g, 17, 30, 5, 11, p.dark); R(g, 25, 31, 5, 10, p.body); R(g, 35, 30, 5, 11, p.dark); R(g, 41, 29, 5, 11, p.body);
    } },
    beetle: { w: 52, h: 40, draw(g, p) {
      for (let i = 0; i < 3; i++) { L(g, 16 + i * 9, 30, 10 + i * 9, 38, p.dark, 2); L(g, 22 + i * 9, 30, 28 + i * 9, 38, p.dark, 2); }
      E(g, 28, 24, 20, 12, p.dark); E(g, 28, 22, 19, 11, p.shell); L(g, 28, 11, 28, 33, p.dark, 1.5);
      E(g, 21, 17, 6, 3, p.light); E(g, 36, 17, 5, 2.5, p.light);
      E(g, 9, 26, 7, 6, p.dark); Poly(g, [6, 22, 1, 6, 8, 14, 10, 21], p.horn); Poly(g, [3, 10, 0, 4, 5, 8], p.horn);
      E(g, 8, 25, 1.6, 1.6, p.eye);
    } },
    cultist: { w: 44, h: 56, draw(g, p) {
      Poly(g, [10, 54, 14, 24, 30, 24, 34, 54], p.robe); Poly(g, [22, 26, 30, 24, 34, 54, 24, 54], p.dark);
      R(g, 14, 40, 16, 2, p.trim); Poly(g, [19, 26, 25, 26, 23, 54, 21, 54], p.trim);
      E(g, 22, 16, 9, 10, p.robe); E(g, 22, 18, 6, 7, '#0c0814'); E(g, 19, 18, 1.4, 1.2, p.eye); E(g, 25, 18, 1.4, 1.2, p.eye);
      Poly(g, [13, 14, 22, 3, 31, 14, 22, 9], p.dark);
      if (p.scythe) {
        L(g, 38, 6, 36, 54, '#5e3818', 2.5);
        Poly(g, [37, 6, 20, 2, 8, 10, 22, 6, 36, 10], p.blade);
      } else {
        L(g, 36, 12, 36, 52, '#6b4426', 2); E(g, 36, 10, 4, 4, p.trim); E(g, 36, 10, 2, 2, p.eye);
      }
      E(g, 12, 34, 3, 3, p.skin); E(g, 33, 32, 3, 3, p.skin);
    } },
    rat: { w: 48, h: 32, draw(g, p) {
      for (let i = 0; i < 14; i++) E(g, 38 + i * 0.7, 24 - i * 1.1 + Math.sin(i * 0.6) * 1.5, 1.2, 1.2, p.tail);
      E(g, 24, 22, 13, 8, p.dark); E(g, 23, 21, 12, 7, p.body); E(g, 22, 17, 7, 2, p.light);
      E(g, 10, 22, 7, 5, p.body); Poly(g, [2, 23, 8, 19, 9, 26], p.body); E(g, 2, 23, 1.5, 1.5, '#e07a9a');
      E(g, 12, 15, 4, 4, p.dark); E(g, 12, 15, 2.5, 2.5, '#e07a9a');
      E(g, 8, 20, 1.5, 1.5, p.eye); L(g, 3, 24, 0, 22, '#d8d8d8', 0.6); L(g, 3, 24, 0, 26, '#d8d8d8', 0.6);
      R(g, 4, 26, 2, 3, '#ffffff'); R(g, 14, 27, 4, 4, p.dark); R(g, 27, 27, 4, 4, p.dark);
    } },
    toad: { w: 52, h: 40, draw(g, p) {
      E(g, 26, 30, 22, 10, p.dark); E(g, 26, 28, 21, 10, p.body); E(g, 26, 32, 14, 6, p.belly);
      for (const [x, y] of [[14, 24], [36, 22], [22, 20], [40, 30], [10, 30]]) E(g, x, y, 2.5, 2, p.spot);
      E(g, 15, 16, 7, 6, p.body); E(g, 37, 16, 7, 6, p.body); eye(g, 15, 15, 3.4, '#140c1c', p.eye); eye(g, 37, 15, 3.4, '#140c1c', p.eye);
      L(g, 12, 28, 40, 28, '#140c1c', 1.4); Poly(g, [24, 28, 28, 28, 27, 36, 25, 36], '#e05a7a');
      R(g, 4, 34, 10, 4, p.dark); R(g, 38, 34, 10, 4, p.dark);
    } },
    croc: { w: 104, h: 56, draw(g, p) {
      E(g, 52, 50, 50, 6, 'rgba(60,90,60,0.6)');
      for (let i = 0; i < 18; i++) E(g, 78 + i * 1.4, 40 - i * 0.6, 7 - i * 0.3, 5 - i * 0.2, i % 2 ? p.body : p.dark);
      E(g, 58, 38, 26, 12, p.dark); E(g, 57, 36, 25, 11, p.body); E(g, 57, 42, 18, 5, p.belly);
      for (let i = 0; i < 8; i++) Poly(g, [38 + i * 6, 27, 41 + i * 6, 21, 44 + i * 6, 27], p.ridge);
      Poly(g, [34, 30, 2, 34, 2, 40, 34, 44], p.body); Poly(g, [34, 40, 4, 40, 6, 47, 34, 48], p.dark);
      for (let i = 0; i < 7; i++) { Poly(g, [6 + i * 4, 40, 8 + i * 4, 43, 10 + i * 4, 40], '#f0ecd8'); Poly(g, [8 + i * 4, 41, 10 + i * 4, 38, 12 + i * 4, 41], '#f0ecd8'); }
      E(g, 30, 28, 5, 4, p.body); eye(g, 30, 27, 2.6, '#140c1c', p.eye); E(g, 5, 33, 1.4, 1, '#140c1c');
      R(g, 40, 44, 8, 9, p.dark); R(g, 64, 45, 8, 8, p.dark); L(g, 70, 20, 74, 34, '#8a6a4a', 1.5); E(g, 69, 19, 2.5, 2.5, '#c84040');
    } },
    knight: { w: 52, h: 60, draw(g, p) {
      R(g, 17, 42, 7, 16, p.dark); R(g, 28, 42, 7, 16, p.dark); R(g, 15, 55, 10, 4, p.metal); R(g, 27, 55, 10, 4, p.metal);
      Poly(g, [14, 22, 38, 22, 36, 44, 16, 44], p.metal); Poly(g, [30, 22, 38, 22, 36, 44, 30, 44], p.dark); R(g, 16, 30, 20, 3, p.trim);
      Poly(g, [16, 44, 36, 44, 38, 50, 14, 50], p.cloth);
      E(g, 26, 14, 9, 10, p.metal); R(g, 18, 13, 16, 4, '#140c1c'); E(g, 22, 15, 1.2, 1, p.eye); E(g, 30, 15, 1.2, 1, p.eye);
      Poly(g, [24, 4, 26, 0, 30, 2, 28, 6], p.plume); Poly(g, [26, 4, 32, -1, 36, 4, 30, 7], p.plume);
      R(g, 2, 24, 13, 18, p.shield); R(g, 2, 24, 13, 2, p.trim); R(g, 7, 28, 3, 10, p.trim); R(g, 4, 31, 9, 3, p.trim);
      L(g, 40, 30, 50, 6, p.blade, 3); R(g, 37, 29, 8, 3, p.trim); E(g, 40, 32, 3, 3, p.metal);
    } },
    sorceress: { w: 64, h: 76, draw(g, p) {
      E(g, 32, 72, 22, 4, 'rgba(255,215,94,0.25)');
      // 등 뒤 시계 고리
      g.strokeStyle = p.clock; g.lineWidth = 2; g.beginPath(); g.arc(32, 24, 22, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; R(g, 32 + Math.cos(a) * 22 - 1, 24 + Math.sin(a) * 22 - 1, 2, 2, p.clock); }
      L(g, 32, 24, 32, 6, p.clock, 2); L(g, 32, 24, 44, 30, p.clock, 2);
      Poly(g, [14, 72, 22, 36, 42, 36, 50, 72], p.dress); Poly(g, [34, 38, 42, 36, 50, 72, 36, 72], p.dark);
      for (let i = 0; i < 4; i++) R(g, 18 + i * 8, 66, 4, 6, p.trim);
      Poly(g, [22, 36, 42, 36, 38, 44, 26, 44], p.trim);
      E(g, 32, 24, 9, 10, p.hair); E(g, 32, 26, 6.5, 7, p.skin); Poly(g, [22, 22, 24, 44, 28, 30], p.hair); Poly(g, [42, 22, 40, 44, 36, 30], p.hair);
      E(g, 29, 26, 1.4, 1.6, p.eye); E(g, 35, 26, 1.4, 1.6, p.eye); L(g, 30, 31, 34, 31, '#8a3a4a', 1);
      Poly(g, [24, 17, 32, 12, 40, 17, 32, 15], p.trim);
      L(g, 18, 40, 8, 50, p.skin, 2.5); L(g, 46, 40, 56, 32, p.skin, 2.5);
      L(g, 56, 32, 60, 4, p.clock, 3); Poly(g, [60, 0, 63, 8, 57, 8], p.clock);
    } },
    gearguard: { w: 64, h: 68, draw(g, p) {
      const gear = (x, y, r, col) => { E(g, x, y, r, r, col); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; R(g, x + Math.cos(a) * r - 2, y + Math.sin(a) * r - 2, 4, 4, col); } E(g, x, y, r * 0.4, r * 0.4, p.dark); };
      R(g, 18, 48, 9, 18, p.dark); R(g, 37, 48, 9, 18, p.dark); R(g, 15, 62, 14, 5, p.brass); R(g, 35, 62, 14, 5, p.brass);
      R(g, 12, 18, 40, 32, p.brass); R(g, 12, 18, 40, 3, p.light); R(g, 46, 18, 6, 32, p.dark);
      gear(32, 34, 9, p.copper); E(g, 32, 34, 3, 3, p.eye);
      R(g, 0, 20, 12, 8, p.brass); gear(6, 36, 6, p.copper); R(g, 52, 20, 12, 8, p.brass); gear(58, 36, 6, p.copper);
      R(g, 20, 4, 24, 14, p.brass); R(g, 20, 4, 24, 2, p.light); E(g, 32, 11, 7, 4, '#140c1c'); E(g, 32, 11, 3, 2, p.eye);
      L(g, 32, 4, 32, 0, p.dark, 2); E(g, 32, 0, 2, 2, p.eye);
    } },

    // ── 제3장 ──
    scorpion: { w: 60, h: 44, draw(g, p) {
      // 꼬리 (등 위로 휘어 올라간 독침)
      for (let i = 0; i < 12; i++) { const t = i / 11; E(g, 44 + Math.sin(t * 2.6) * 10, 30 - t * 26, 4 - t * 1.2, 4 - t * 1.2, i % 2 ? p.body : p.dark); }
      Poly(g, [42, 2, 48, 0, 46, 8], p.sting); E(g, 47, 3, 1.4, 1.4, '#ffffff');
      for (let i = 0; i < 4; i++) { L(g, 22 + i * 6, 34, 16 + i * 6, 42, p.dark, 2); L(g, 24 + i * 6, 34, 30 + i * 6, 42, p.dark, 2); }
      E(g, 30, 30, 16, 8, p.dark); E(g, 30, 29, 15, 7, p.body); for (let i = 0; i < 4; i++) L(g, 20 + i * 6, 24, 20 + i * 6, 35, p.dark, 1);
      E(g, 14, 30, 6, 5, p.body); eye(g, 12, 27, 1.6, '#140c1c', p.eye); eye(g, 16, 27, 1.6, '#140c1c', p.eye);
      // 집게
      L(g, 10, 30, 4, 22, p.body, 3); E(g, 4, 19, 4.5, 3.5, p.light); Poly(g, [1, 16, 5, 13, 3, 19], p.dark);
      L(g, 12, 33, 6, 38, p.body, 3); E(g, 4, 39, 4.5, 3.5, p.light); Poly(g, [0, 41, 4, 44, 3, 38], p.dark);
      if (p.crown) Poly(g, [8, 24, 9, 18, 12, 22, 15, 17, 18, 22, 20, 18, 21, 24], p.crown);
    } },
    worm: { w: 52, h: 60, draw(g, p) {
      E(g, 26, 56, 22, 4, p.sand);
      for (let i = 0; i < 9; i++) { const y = 54 - i * 5.5, x = 26 + Math.sin(i * 0.7) * 5; E(g, x, y, 11 - i * 0.4, 6, p.dark); E(g, x, y - 1, 10 - i * 0.4, 5, i % 2 ? p.body : p.light); }
      E(g, 30, 10, 12, 9, p.body); E(g, 30, 11, 8, 6, '#3a1418');
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; Poly(g, [30 + Math.cos(a) * 8, 11 + Math.sin(a) * 6, 30 + Math.cos(a) * 4, 11 + Math.sin(a) * 3, 30 + Math.cos(a + 0.3) * 8, 11 + Math.sin(a + 0.3) * 6], '#f0e8d0'); }
      E(g, 30, 11, 2.5, 2, '#140c1c');
    } },
    mummy: { w: 44, h: 56, draw(g, p) {
      R(g, 15, 38, 6, 16, p.wrap); R(g, 24, 38, 6, 16, p.wrap);
      R(g, 12, 20, 21, 20, p.wrap); for (let y = 21; y < 54; y += 4) L(g, 11, y, 34, y + 2, p.dark, 1);
      E(g, 22, 12, 9, 10, p.wrap); L(g, 13, 8, 31, 12, p.dark, 1); L(g, 13, 15, 31, 11, p.dark, 1); L(g, 14, 18, 30, 16, p.dark, 1);
      E(g, 18, 12, 2, 1.6, p.eye); E(g, 26, 12, 2, 1.6, p.eye);
      L(g, 12, 22, 2, 30, p.wrap, 4); L(g, 33, 22, 42, 28, p.wrap, 4); L(g, 40, 28, 44, 36, p.loose, 1.5); L(g, 4, 30, 1, 40, p.loose, 1.5);
    } },
    cactus: { w: 44, h: 56, draw(g, p) {
      R(g, 16, 14, 13, 40, p.body); E(g, 22.5, 14, 6.5, 6, p.body); R(g, 16, 14, 3, 40, p.light); R(g, 26, 14, 3, 40, p.dark);
      R(g, 4, 24, 12, 6, p.body); R(g, 4, 12, 6, 14, p.body); E(g, 7, 12, 3, 3, p.body);
      R(g, 29, 30, 11, 6, p.body); R(g, 34, 18, 6, 14, p.body); E(g, 37, 18, 3, 3, p.body);
      for (let i = 0; i < 14; i++) { const x = 16 + (i * 7) % 14, y = 16 + (i * 11) % 36; R(g, x, y, 1, 2, p.spine); }
      E(g, 20, 24, 2, 2.5, '#140c1c'); E(g, 26, 24, 2, 2.5, '#140c1c'); L(g, 19, 31, 27, 31, '#140c1c', 1.2);
      E(g, 22.5, 7, 4, 3, p.flower); E(g, 22.5, 7, 1.5, 1.5, '#ffe060');
      E(g, 22, 54, 12, 2.5, p.sand);
    } },
    prophet: { w: 52, h: 72, draw(g, p) {
      E(g, 26, 70, 18, 3, 'rgba(232,200,120,0.35)');
      Poly(g, [10, 70, 16, 30, 36, 30, 42, 70], p.robe); Poly(g, [28, 32, 36, 30, 42, 70, 30, 70], p.dark);
      R(g, 14, 60, 26, 3, p.trim); Poly(g, [22, 30, 30, 30, 28, 70, 24, 70], p.sash);
      E(g, 26, 20, 10, 11, p.cloth); E(g, 26, 22, 6.5, 7, p.skin); Poly(g, [16, 18, 26, 6, 36, 18, 26, 13], p.cloth);
      R(g, 20, 26, 12, 4, p.beard); E(g, 23, 21, 1.3, 1.3, p.eye); E(g, 29, 21, 1.3, 1.3, p.eye);
      L(g, 14, 36, 6, 46, p.skin, 2.5); L(g, 38, 36, 44, 30, p.skin, 2.5);
      L(g, 44, 6, 44, 70, '#6b4426', 2.5);
      // 지팡이 끝의 모래시계
      Poly(g, [39, 2, 49, 2, 44, 8], p.glass); Poly(g, [39, 14, 49, 14, 44, 8], p.glass); R(g, 38, 0, 12, 2, p.trim); R(g, 38, 14, 12, 2, p.trim);
      Poly(g, [41, 4, 47, 4, 44, 7], p.sand); Poly(g, [42, 13, 46, 13, 44, 11], p.sand);
    } },
    bandit: { w: 44, h: 56, draw(g, p) {
      R(g, 15, 38, 6, 16, p.pants); R(g, 24, 38, 6, 16, p.pants);
      Poly(g, [12, 22, 33, 22, 31, 40, 14, 40], p.cloth); R(g, 13, 32, 19, 3, p.sash);
      E(g, 22, 14, 8, 9, p.skin); Poly(g, [13, 12, 22, 3, 31, 12, 30, 9, 14, 9], p.wrap); R(g, 14, 16, 16, 6, p.wrap);
      E(g, 19, 13, 1.4, 1.2, '#140c1c'); E(g, 25, 13, 1.4, 1.2, '#140c1c');
      L(g, 31, 26, 38, 32, p.skin, 3); Poly(g, [36, 32, 44, 14, 42, 12, 34, 30], p.blade); Poly(g, [43, 13, 44, 8, 40, 12], p.blade);
      L(g, 13, 26, 8, 34, p.skin, 3);
    } },

    // ── 제4장 ──
    crab: { w: 64, h: 44, draw(g, p) {
      for (let i = 0; i < 3; i++) { L(g, 22 + i * 6, 32, 14 + i * 5, 42, p.dark, 2.5); L(g, 42 - i * 6, 32, 50 - i * 5, 42, p.dark, 2.5); }
      E(g, 32, 28, 17, 10, p.dark); E(g, 32, 27, 16, 9, p.body); E(g, 28, 23, 8, 3, p.light);
      L(g, 27, 20, 25, 12, p.dark, 2); L(g, 37, 20, 39, 12, p.dark, 2); eye(g, 25, 11, 2.2, '#140c1c', p.eye); eye(g, 39, 11, 2.2, '#140c1c', p.eye);
      L(g, 18, 26, 8, 18, p.body, 4); E(g, 6, 13, 7, 6, p.claw); Poly(g, [0, 8, 6, 6, 4, 13], p.dark); E(g, 9, 10, 2, 1.5, p.light);
      L(g, 46, 26, 56, 18, p.body, 4); E(g, 58, 13, 7, 6, p.claw); Poly(g, [64, 8, 58, 6, 60, 13], p.dark); E(g, 55, 10, 2, 1.5, p.light);
      if (p.frost) { for (let i = 0; i < 6; i++) R(g, 20 + i * 4, 20 + (i % 2) * 2, 2, 1, '#ffffff'); }
      if (p.crown) Poly(g, [24, 19, 25, 12, 28, 16, 32, 10, 36, 16, 39, 12, 40, 19], p.crown);
    } },
    walrus: { w: 96, h: 76, draw(g, p) {
      E(g, 48, 72, 40, 4, 'rgba(160,200,230,0.4)');
      E(g, 52, 50, 38, 22, p.dark); E(g, 50, 48, 37, 21, p.body); E(g, 40, 40, 20, 10, p.light);
      E(g, 20, 66, 12, 5, p.dark); E(g, 80, 68, 12, 5, p.dark);
      E(g, 26, 34, 20, 18, p.body); E(g, 24, 40, 12, 8, p.muzzle); for (let i = 0; i < 6; i++) R(g, 16 + i * 3, 40 + (i % 2), 1, 1, p.dark);
      eye(g, 18, 26, 2.4, '#140c1c', p.eye); eye(g, 32, 25, 2.4, '#140c1c', p.eye);
      Poly(g, [18, 44, 22, 44, 19, 66], p.tusk); Poly(g, [28, 44, 32, 44, 31, 66], p.tusk);
      if (p.ice) { for (let i = 0; i < 5; i++) Poly(g, [50 + i * 8, 30, 54 + i * 8, 18 - (i % 2) * 6, 58 + i * 8, 30], p.ice); }
    } },
    captain: { w: 56, h: 76, draw(g, p) {
      E(g, 28, 74, 16, 3, 'rgba(120,200,180,0.3)');
      R(g, 18, 50, 8, 22, p.pants); R(g, 30, 50, 8, 22, p.pants); R(g, 16, 70, 11, 4, p.boots); R(g, 29, 70, 11, 4, p.boots);
      Poly(g, [10, 70, 14, 26, 42, 26, 46, 70], p.coat); Poly(g, [28, 26, 42, 26, 46, 70, 30, 70], p.dark);
      R(g, 24, 26, 8, 30, p.shirt); for (let i = 0; i < 4; i++) E(g, 22, 30 + i * 7, 1.2, 1.2, p.trim); R(g, 12, 46, 32, 3, p.trim);
      R(g, 10, 26, 8, 4, p.trim); R(g, 38, 26, 8, 4, p.trim);
      E(g, 28, 17, 8, 9, p.skin); R(g, 21, 20, 14, 6, p.beard); E(g, 25, 16, 1.4, 1.2, p.eye); E(g, 31, 16, 1.4, 1.2, p.eye); R(g, 30, 13, 4, 1, p.dark);
      Poly(g, [12, 10, 28, 2, 44, 10, 40, 13, 16, 13], p.hat); R(g, 16, 11, 24, 2, p.trim); E(g, 28, 7, 2, 2, p.trim);
      L(g, 44, 34, 52, 44, p.coat, 4); L(g, 52, 44, 50, 70, p.anchor, 3); Poly(g, [42, 66, 58, 66, 56, 72, 50, 68, 44, 72], p.anchor); R(g, 46, 46, 8, 2, p.anchor);
      L(g, 12, 34, 4, 46, p.coat, 4); L(g, 4, 46, 2, 30, p.blade, 2);
      if (p.ghost) { g.fillStyle = 'rgba(120,220,190,0.25)'; g.fillRect(8, 0, 40, 74); }
    } },
    kraken: { w: 120, h: 100, draw(g, p) {
      for (let k = 0; k < 4; k++) { const x0 = 30 + k * 20; for (let i = 0; i < 10; i++) E(g, x0 + Math.sin(i * 0.8 + k) * 8, 70 + i * 3, 6 - i * 0.4, 4, i % 2 ? p.body : p.dark); }
      E(g, 60, 44, 44, 34, p.dark); E(g, 60, 42, 42, 32, p.body); E(g, 48, 26, 22, 12, p.light);
      for (let i = 0; i < 7; i++) E(g, 32 + i * 9, 58 + (i % 2) * 3, 3, 2, p.spot);
      eye(g, 42, 46, 7, '#140c1c', p.eye); eye(g, 78, 46, 7, '#140c1c', p.eye);
      E(g, 60, 66, 14, 6, '#140c1c'); for (let i = 0; i < 6; i++) Poly(g, [48 + i * 5, 62, 51 + i * 5, 62, 49.5 + i * 5, 68], '#f0e8d0');
      if (p.flame) { g.fillStyle = 'rgba(160,160,170,0.45)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(36 + i * 12, 14); g.lineTo(42 + i * 12, 0); g.lineTo(48 + i * 12, 14); g.fill(); } }
    } },
    tentacle: { w: 40, h: 80, draw(g, p) {
      for (let i = 0; i < 16; i++) { const t = i / 15; E(g, 20 + Math.sin(t * 5) * 8, 76 - t * 70, 9 - t * 6, 6 - t * 3, i % 2 ? p.body : p.dark); }
      for (let i = 1; i < 14; i += 2) { const t = i / 15; E(g, 14 + Math.sin(t * 5) * 8, 76 - t * 70, 2 - t, 2 - t, p.sucker); }
    } },
    angler: { w: 60, h: 48, draw(g, p) {
      Poly(g, [52, 24, 60, 12, 60, 36], p.dark);
      E(g, 30, 26, 24, 18, p.dark); E(g, 30, 25, 23, 17, p.body); E(g, 26, 18, 12, 6, p.light);
      E(g, 12, 32, 12, 8, '#140c1c'); for (let i = 0; i < 6; i++) { Poly(g, [3 + i * 4, 26, 6 + i * 4, 26, 4.5 + i * 4, 31], '#f0e8d0'); Poly(g, [3 + i * 4, 38, 6 + i * 4, 38, 4.5 + i * 4, 34], '#f0e8d0'); }
      eye(g, 22, 18, 3, '#140c1c', p.eye);
      L(g, 24, 9, 16, 0, p.dark, 1.5); L(g, 16, 0, 6, 4, p.dark, 1.5); E(g, 5, 6, 4, 4, p.lure); E(g, 5, 6, 2, 2, '#ffffff');
      Poly(g, [32, 40, 40, 48, 44, 40], p.dark); Poly(g, [32, 10, 40, 2, 44, 10], p.dark);
    } },
  };

  const cache = new Map();
  function render(artId, pal, opts = {}) {
    const key = artId + JSON.stringify(pal) + (opts.scale || 1);
    if (cache.has(key)) return cache.get(key);
    const a = ART[artId] || ART.jelly;
    const scale = opts.scale || 1;
    const { c, g } = Pix.canvas(Math.ceil(a.w * scale) + 2, Math.ceil(a.h * scale) + 2);
    g.save();
    g.translate(1, 1);
    g.scale(scale, scale);
    a.draw(g, pal);
    g.restore();
    Pix.crisp(c, 100);
    Pix.outline(c, '#120a1a');
    cache.set(key, c);
    return c;
  }
  // 몬스터 ID로 그리기 (전투용)
  function forMonster(id, variant) {
    const m = MONSTERS[id];
    const pal = Object.assign({}, m.pal, m.shiny ? { shiny: true } : {}, variant === 2 ? { phase2: true } : {});
    return render(m.art, pal, { scale: m.artScale || 1 });
  }
  return { render, forMonster, ART };
})();
