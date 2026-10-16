'use strict';
// ─────────────────────────────────────────────────────────────
// MapView: 지도 화면 — 현재 지역 / 평원 전도, 현재 위치와 목적지 표시
// ─────────────────────────────────────────────────────────────
const MapView = (() => {
  const LABELS = {
    field: [[31, 38, '리벨 마을'], [50, 30, '사냥꾼의 오두막'], [31, 13, '북쪽 고개'], [31, 4, '잠든 종의 유적'], [8, 26, '서쪽 숲'], [8, 42, '은빛 호수'], [54, 36, '동쪽 숲']],
    rivel: [[18, 3, '장로의 집'], [29, 3, '신전'], [6, 8, '여관'], [6, 15, '대장간'], [32, 9, '도구점'], [31, 15, '빵집'], [5, 21, '오웬의 집'], [12, 21, '풍차'], [32, 22, '피포의 집'], [19, 14, '우물']],
  };
  // 실내 → 바깥 지도와 위치
  function outerOf(mapId) {
    const m = MAPS[mapId];
    if (!m || m.kind !== 'interior') return null;
    const w = m.warps[0];
    return w ? { map: w.to, x: w.tx, y: w.ty } : null;
  }
  const cache = {};
  function mini(mapId, fog) {
    const m = MAPS[mapId];
    const key = mapId + (fog ? Game.state.visited[mapId] || '' : '');
    if (cache[mapId] && cache[mapId].key === key) return cache[mapId].c;
    const vis = fog ? Game.state.visited[mapId] : null;
    const c = Pix.make(m.w, m.h, (p) => {
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        if (vis && vis[y * m.w + x] !== '1') { p.px(x, y, '#0a0a14'); continue; }
        p.px(x, y, Tiles.MINI[m.tiles[y][x]] || '#808080');
      }
    });
    cache[mapId] = { key, c };
    return c;
  }

  async function open() {
    const cur = Field.map.id;
    const outer = outerOf(cur);
    const views = [];
    if (Field.map.kind === 'interior') { if (outer) views.push({ map: outer.map, at: [outer.x, outer.y] }); }
    else views.push({ map: cur, at: [Field.player.x, Field.player.y] });
    if (!views.length || views[0].map !== 'field') {
      const fieldAt = views[0] && views[0].map === 'rivel' ? [31, 38] : cur.startsWith('ruins') || cur === 'bell' ? [31, 5] : cur === 'cellar' ? [31, 38] : cur === 'cabin' ? [50, 30] : [31, 38];
      views.push({ map: 'field', at: fieldAt });
    }
    let vi = 0;
    Sound.sfx('menu');
    await new Promise((resolve) => {
      const L = {
        modal: true,
        onAction(a) {
          if (a === 'left' || a === 'right') { if (views.length > 1) { vi = (vi + 1) % views.length; Sound.sfx('cursor'); } }
          else if (a === 'cancel' || a === 'confirm' || a === 'map' || a === 'menu') { Sound.sfx('cancel'); Engine.remove(L); resolve(); }
        },
        onPointer(ev) {
          if (ev.type !== 'down') return true;
          if (ev.y < 60 && views.length > 1) { vi = (vi + 1) % views.length; Sound.sfx('cursor'); return true; }
          Sound.sfx('cancel'); Engine.remove(L); resolve();
          return true;
        },
        draw(ctx) {
          ctx.fillStyle = 'rgba(0,0,10,0.75)'; ctx.fillRect(0, 0, Engine.W, Engine.H);
          const v = views[vi];
          const m = MAPS[v.map];
          UI.drawWindow(ctx, 12, 12, 616, 456);
          Text.draw(ctx, `🗺 ${m.name}`, 32, 26, { size: 20, bold: true, color: Theme.gold });
          if (views.length > 1) Text.draw(ctx, `◀ ▶ ${views.map((x, i) => (i === vi ? `[y]${MAPS[x.map].name}[/]` : MAPS[x.map].name)).join(' · ')}`, 608, 30, { size: 13, align: 'right', color: Theme.dim });
          const fog = m.kind === 'dungeon';
          const img = mini(v.map, fog);
          const s = Math.min(580 / m.w, 340 / m.h);
          const ox = Math.round(320 - (m.w * s) / 2), oy = Math.round(62 + (340 - m.h * s) / 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, ox, oy, m.w * s, m.h * s);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.strokeRect(ox - 1, oy - 1, m.w * s + 2, m.h * s + 2);
          for (const [x, y, t] of LABELS[v.map] || []) {
            const px = ox + (x + 0.5) * s, py = oy + (y + 0.5) * s;
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; const tw = Text.width(ctx, t, 12) + 8; ctx.fillRect(px - tw / 2, py - 22, tw, 16);
            Text.draw(ctx, t, px, py - 21, { size: 12, align: 'center', shadow: false });
          }
          // 목적지
          const goal = Quests.currentGoal();
          const marks = [];
          if (goal && goal.target) marks.push([goal.target, Theme.gold, '★']);
          for (const id of Object.keys(QUESTS)) if (QUESTS[id].type === 'sub' && Quests.isActive(id)) { const t = Quests.target(id); if (t) marks.push([t, Theme.green, '◆']); }
          for (const [t, col, ch] of marks) {
            let tm = t.map, tx = t.x, ty = t.y;
            const o = outerOf(tm);
            if (o) { tm = o.map; tx = o.x; ty = o.y; }
            if (tm !== v.map) {
              // 다른 지도 안의 목적지 → 입구 쪽으로 표시
              if (v.map === 'field' && (tm === 'rivel' || tm === 'cellar')) { tx = 31; ty = 38; }
              else if (v.map === 'field' && (tm.startsWith('ruins') || tm === 'bell')) { tx = 31; ty = 5; }
              else continue;
            }
            const px = ox + (tx + 0.5) * s, py = oy + (ty + 0.5) * s;
            const pulse = 1 + Math.sin(Engine.time * 5) * 0.2;
            Text.draw(ctx, ch, px, py - 10 * pulse, { size: Math.round(18 * pulse), align: 'center', color: col, outline: 3, shadow: false });
          }
          // 현재 위치
          const [ax, ay] = v.at;
          const px = ox + (ax + 0.5) * s, py = oy + (ay + 0.5) * s;
          if (Math.floor(Engine.time * 3) % 2 === 0) { ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(px, py, Math.max(4, s * 0.6), 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
          // 범례
          UI.drawWindow(ctx, 24, 406, 592, 52, { alpha: 0.9 });
          Text.draw(ctx, '[r]●[/] 현재 위치   [y]★[/] 메인 목적지   [g]◆[/] 서브 퀘스트', 40, 412, { size: 14 });
          Text.draw(ctx, goal ? '목표: ' + goal.text : '', 40, 434, { size: 13, color: '#ffe9a8', maxW: 560 });
        },
      };
      Engine.push(L);
    });
  }
  return { open };
})();
