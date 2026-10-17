'use strict';
// ─────────────────────────────────────────────────────────────
// ObjArt: 필드 오브젝트 그림 (보물상자, 레버, 약초, 쪽지, 반짝임, 풍차 날개, 거대한 종)
// ─────────────────────────────────────────────────────────────
const ObjArt = (() => {
  const cache = {};
  const once = (k, w, h, fn) => cache[k] || (cache[k] = (() => { const c = Pix.make(w, h, fn); return c; })());

  function chest(open, color = 'wood') {
    return once('chest' + open + color, 16, 16, (p) => {
      const body = color === 'red' ? '#a8304a' : '#a8743e', dark = color === 'red' ? '#701a30' : '#6b4426', band = '#f2c84b';
      p.ellipse(8, 14, 7, 2, 'rgba(0,0,0,0.3)');
      p.rect(1, 7, 14, 8, dark); p.rect(2, 8, 12, 6, body);
      if (!open) {
        p.rect(1, 3, 14, 5, dark); p.rect(2, 3, 12, 4, body); p.rect(2, 3, 12, 1, '#d8a060');
        p.rect(1, 7, 14, 1, band); p.rect(7, 6, 2, 4, band); p.px(7, 8, '#5a3418');
      } else {
        p.rect(1, 1, 14, 4, dark); p.rect(2, 2, 12, 2, body); p.rect(2, 5, 12, 3, '#1a1010'); p.rect(1, 7, 14, 1, band);
      }
      p.rect(1, 13, 14, 1, band);
    });
  }
  function lever(on) {
    return once('lever' + on, 16, 16, (p) => {
      p.rect(3, 10, 10, 5, '#4a4658'); p.rect(3, 10, 10, 1, '#8a86a0'); p.rect(6, 11, 4, 2, '#1a1724');
      if (on) { p.line(8, 11, 12, 3, '#8a8aa0'); p.circle(12, 3, 2, '#e04040'); }
      else { p.line(8, 11, 4, 3, '#8a8aa0'); p.circle(4, 3, 2, '#e04040'); }
    });
  }
  function herb(frame) {
    return once('herb' + frame, 16, 16, (p) => {
      const glow = frame ? '#c8f0ff' : '#9fe0ff';
      p.ellipse(8, 13, 5, 2, 'rgba(160,230,255,0.35)');
      p.line(8, 14, 8, 6, '#3f8a35'); p.line(8, 10, 4, 7, '#4aa048'); p.line(8, 11, 12, 8, '#4aa048');
      p.circle(8, 5, 2, glow); p.px(4, 6, glow); p.px(12, 7, glow); p.px(8, 4, '#ffffff');
    });
  }
  function note() {
    return once('note', 16, 16, (p) => { p.rect(4, 7, 9, 6, '#e8e0c8'); p.rect(4, 7, 9, 1, '#fff8e0'); p.rect(5, 9, 6, 1, '#7a6a5a'); p.rect(5, 11, 4, 1, '#7a6a5a'); p.px(12, 12, '#b0a080'); });
  }
  function rope() {
    return once('rope', 16, 16, (p) => { for (let y = 0; y < 16; y += 2) { p.px(7, y, '#c8a060'); p.px(8, y + 1, '#a07a40'); } p.rect(5, 0, 6, 2, '#6b4426'); });
  }
  function sparkle(t) {
    // 숨겨진 보물 반짝임 (넬이 일행일 때)
    const f = Math.floor(t * 6) % 4;
    return once('spk' + f, 16, 16, (p) => {
      const s = [2, 3, 2, 1][f];
      const c = '#fff6a0';
      p.px(8, 8, '#ffffff');
      for (let i = 1; i <= s; i++) { p.px(8 - i, 8, c); p.px(8 + i, 8, c); p.px(8, 8 - i, c); p.px(8, 8 + i, c); }
    });
  }
  // 풍차 날개 (중심 기준 회전)
  function windmill(g, cx, cy, t) {
    g.save();
    g.translate(cx, cy);
    g.rotate(t * 0.8);
    for (let i = 0; i < 4; i++) {
      g.rotate(Math.PI / 2);
      g.fillStyle = '#6b4426'; g.fillRect(-1, 0, 2, 22);
      g.fillStyle = '#f0e8d0'; g.fillRect(1, 5, 5, 16);
      g.fillStyle = '#c8b890'; g.fillRect(1, 5, 5, 1); g.fillRect(1, 12, 5, 1);
    }
    g.restore();
    g.fillStyle = '#4a3020'; g.fillRect(cx - 2, cy - 2, 4, 4);
  }
  // 종의 방의 거대한 종
  function bell(rung) {
    return once('bell' + rung, 48, 48, (p, g) => {
      const body = rung ? '#d8b860' : '#b89848', dark = '#7a6028', light = '#f0d888';
      g.fillStyle = dark; g.fillRect(22, 0, 4, 6);
      g.fillStyle = body;
      g.beginPath(); g.moveTo(14, 8); g.quadraticCurveTo(24, 0, 34, 8); g.lineTo(38, 34); g.lineTo(44, 40); g.lineTo(4, 40); g.lineTo(10, 34); g.closePath(); g.fill();
      g.fillStyle = dark; g.fillRect(4, 38, 40, 4);
      g.fillStyle = light; g.fillRect(15, 10, 3, 24);
      g.fillStyle = dark; g.fillRect(10, 26, 28, 2);
      g.fillStyle = '#5a4818'; g.beginPath(); g.ellipse(24, 43, 4, 3, 0, 0, Math.PI * 2); g.fill();
      // 별 문양
      g.fillStyle = rung ? '#ffffff' : '#7cc4ff';
      g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.5 : 6, a = -Math.PI / 2 + (i * Math.PI) / 5; g.lineTo(24 + Math.cos(a) * r, 18 + Math.sin(a) * r); } g.fill();
    });
  }
  // 수로의 수문 밸브
  function valve(on) {
    return once('valve' + on, 16, 16, (p) => {
      p.rect(7, 8, 2, 7, '#4a4a58'); p.rect(4, 13, 8, 2, '#3a3a48');
      p.circle(8, 6, 5, on ? '#4b8a4c' : '#a8304a'); p.circle(8, 6, 3, '#1a1724'); p.circle(8, 6, 1, '#bcbcca');
      if (on) { p.line(8, 6, 12, 2, '#bcbcca'); p.line(8, 6, 4, 10, '#bcbcca'); } else { p.line(8, 1, 8, 11, '#bcbcca'); p.line(3, 6, 13, 6, '#bcbcca'); }
    });
  }
  // 시계판 (pos: 0=12시 · 1=3시 · 2=6시 · 3=9시)
  function dial(pos) {
    return once('dial' + pos, 16, 16, (p, g) => {
      p.ellipse(8, 14, 7, 2, 'rgba(0,0,0,0.3)');
      p.rect(7, 12, 2, 3, '#7a5a2a');
      p.circle(8, 7, 7, '#7a5a2a'); p.circle(8, 7, 6, '#f0e8d0');
      for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 2; p.px(Math.round(8 + Math.cos(a) * 5), Math.round(7 + Math.sin(a) * 5), '#7a5a2a'); }
      const a = -Math.PI / 2 + (pos * Math.PI) / 2;
      g.strokeStyle = pos === 0 ? '#c4473a' : '#1a1424'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(8, 7); g.lineTo(8 + Math.cos(a) * 4.5, 7 + Math.sin(a) * 4.5); g.stroke();
      p.px(8, 7, '#c4a050');
    });
  }
  function manhole() {
    return once('manhole', 16, 16, (p) => {
      p.ellipse(8, 9, 7, 5, '#3a3a44'); p.ellipse(8, 8, 6, 4, '#5a5a66');
      for (let x = 4; x <= 12; x += 2) p.rect(x, 6, 1, 5, '#3a3a44');
      p.px(8, 4, '#8a8a96');
    });
  }
  function plaque() {
    return once('plaque', 16, 16, (p) => {
      p.rect(7, 10, 2, 5, '#5a4418'); p.rect(2, 2, 12, 9, '#8a6a2a'); p.rect(3, 3, 10, 7, '#c4a050');
      p.rect(4, 4, 8, 1, '#7a5a2a'); p.rect(4, 6, 6, 1, '#7a5a2a'); p.rect(4, 8, 7, 1, '#7a5a2a');
    });
  }
  // 시간의 종 (시계판이 박힌 금빛 종)
  function timebell(rung, t) {
    const f = rung ? Math.floor(t * 2) % 12 : 0;
    return once('tbell' + rung + f, 48, 48, (p, g) => {
      const body = rung ? '#e8d080' : '#a89060', dark = '#6a5428', light = '#fff0b0';
      g.fillStyle = dark; g.fillRect(22, 0, 4, 6);
      g.fillStyle = body;
      g.beginPath(); g.moveTo(14, 8); g.quadraticCurveTo(24, 0, 34, 8); g.lineTo(38, 34); g.lineTo(44, 40); g.lineTo(4, 40); g.lineTo(10, 34); g.closePath(); g.fill();
      g.fillStyle = dark; g.fillRect(4, 38, 40, 4);
      g.fillStyle = light; g.fillRect(14, 10, 2, 24);
      g.fillStyle = '#f8f0dc'; g.beginPath(); g.arc(24, 22, 8, 0, Math.PI * 2); g.fill();
      g.strokeStyle = dark; g.lineWidth = 1; g.beginPath(); g.arc(24, 22, 8, 0, Math.PI * 2); g.stroke();
      const a = -Math.PI / 2 + (f * Math.PI) / 6;
      g.strokeStyle = '#1a1424'; g.beginPath(); g.moveTo(24, 22); g.lineTo(24, 16); g.moveTo(24, 22); g.lineTo(24 + Math.cos(a) * 6, 22 + Math.sin(a) * 6); g.stroke();
      g.fillStyle = '#5a4818'; g.beginPath(); g.ellipse(24, 43, 4, 3, 0, 0, Math.PI * 2); g.fill();
    });
  }
  return { chest, lever, herb, note, rope, sparkle, windmill, bell, valve, dial, manhole, plaque, timebell };
})();
