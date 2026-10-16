'use strict';
// ─────────────────────────────────────────────────────────────
// 맵 레지스트리
//  각 맵: { name, kind(town|interior|field|dungeon), bgm, base, tiles[], enc, edge, warps[], npcs[], objects[], triggers[], tileFlags[], onEnter }
// ─────────────────────────────────────────────────────────────
const MAPS = {};
function defMap(id, def) {
  def.id = id;
  const w = def.tiles[0].length;
  def.tiles.forEach((r, i) => { if (r.length !== w) console.error(`[map ${id}] row ${i} width ${r.length} != ${w}`); });
  def.w = w; def.h = def.tiles.length;
  def.warps = def.warps || [];
  def.npcs = def.npcs || [];
  def.objects = def.objects || [];
  def.triggers = def.triggers || [];
  def.tileFlags = def.tileFlags || [];
  MAPS[id] = def;
  return def;
}

// 대사 진행도 분기 도우미: byP({0:'…', 3:'…'}) → 현재 진행도 이하 중 가장 큰 키
function byP(table) {
  const p = Game.progress();
  let best = null;
  for (const k of Object.keys(table).map(Number).sort((a, b) => a - b)) if (k <= p) best = table[k];
  return best;
}
