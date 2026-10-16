// 맵 정적 검증: 크기, 타일, 워프, NPC/오브젝트 배치, 도달 가능성, 아이템 참조
import { loadGame } from './load.mjs';
const G = loadGame();
const { MAPS, TILES, ITEMS, QUESTS } = G;
let errors = 0, warns = 0;
const err = (m) => { errors++; console.log('ERROR', m); };
const warn = (m) => { warns++; console.log('warn ', m); };
const D4 = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function grid(map, allFlags) {
  const rt = map.tiles.map((r) => r.split(''));
  if (allFlags) for (const tf of map.tileFlags) for (const [x, y] of tf.at || [[tf.x, tf.y]]) rt[y][x] = tf.tile;
  return rt;
}
function solidObj(map, x, y, allFlags) {
  return map.objects.some((o) => o.x === x && o.y === y && (o.type === 'chest' || o.type === 'lever' || o.solid === true) && !(allFlags && o.show));
}
function walkable(map, rt, x, y, allFlags) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
  const t = TILES[rt[y][x]];
  if (!t || t.solid) return false;
  if (solidObj(map, x, y, allFlags)) return false;
  return true;
}
function bfs(map, starts, allFlags) {
  const rt = grid(map, allFlags);
  const seen = new Set();
  const q = [];
  for (const [x, y] of starts) if (walkable(map, rt, x, y, allFlags)) { seen.add(x + ',' + y); q.push([x, y]); }
  while (q.length) {
    const [x, y] = q.shift();
    // 워프 칸에서는 더 나아가지 않는다(밟으면 이동)
    if (map.warps.some((w) => w.x === x && w.y === y) && !starts.some(([sx, sy]) => sx === x && sy === y)) continue;
    for (const [dx, dy] of D4) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (seen.has(k) || !walkable(map, rt, nx, ny, allFlags)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}

// 각 맵으로 들어오는 위치 수집
const entries = {};
const addEntry = (m, x, y, from) => { (entries[m] = entries[m] || []).push([x, y, from]); };
for (const id in MAPS) {
  const m = MAPS[id];
  for (const w of m.warps) addEntry(w.to, w.tx, w.ty, id);
  if (m.edge) addEntry(m.edge.map, m.edge.x, m.edge.y, id + '(edge)');
}
addEntry('inn', 8, 3, 'newgame');
addEntry('shrine', 6, 6, 'respawn');
addEntry('cellar', 1, 2, 'well');
addEntry('rivel', 19, 27, 'returnwing');

const usedIds = new Set();
for (const id in MAPS) {
  const m = MAPS[id];
  m.tiles.forEach((r, y) => { if (r.length !== m.w) err(`${id} row ${y} width`); for (const ch of r) if (!TILES[ch]) err(`${id} unknown tile '${ch}' row ${y}`); });
  const rtAll = grid(m, true);
  // 워프
  for (const w of m.warps) {
    if (!MAPS[w.to]) { err(`${id} warp → unknown map ${w.to}`); continue; }
    const t = MAPS[w.to];
    const trt = grid(t, true);
    if (!walkable(t, trt, w.tx, w.ty, true)) err(`${id} warp(${w.x},${w.y}) → ${w.to}(${w.tx},${w.ty}) lands on solid`);
    if (t.warps.some((x) => x.x === w.tx && x.y === w.ty)) err(`${id} warp → ${w.to}(${w.tx},${w.ty}) lands on another warp (ping-pong)`);
    if (TILES[m.tiles[w.y][w.x]].solid) err(`${id} warp source (${w.x},${w.y}) on solid tile`);
  }
  // 진입 위치
  const ents = entries[id] || [];
  if (!ents.length) warn(`${id} has no entry`);
  for (const [x, y, from] of ents) if (!walkable(m, rtAll, x, y, true)) err(`${id} entry (${x},${y}) from ${from} is solid`);
  const reach = bfs(m, ents.map(([x, y]) => [x, y]), true);
  const adjReach = (x, y) => D4.some(([dx, dy]) => reach.has(x + dx + ',' + (y + dy))) || reach.has(x + ',' + y);
  for (const w of m.warps) if (!adjReach(w.x, w.y)) err(`${id} warp (${w.x},${w.y}) unreachable`);
  for (const n of m.npcs) {
    if (n.x < 0 || n.y < 0 || n.x >= m.w || n.y >= m.h) { err(`${id} npc ${n.id} out of bounds`); continue; }
    if (TILES[m.tiles[n.y][n.x]].solid) err(`${id} npc ${n.id} on solid tile '${m.tiles[n.y][n.x]}'`);
    // 카운터 너머 대화 허용
    const counterAdj = D4.some(([dx, dy]) => { const cx = n.x + dx, cy = n.y + dy; return TILES[m.tiles[cy] && m.tiles[cy][cx]] && TILES[m.tiles[cy][cx]].counter && reach.has((cx + dx) + ',' + (cy + dy)); });
    if (n.talk && !adjReach(n.x, n.y) && !counterAdj && n.show !== undefined && n.id !== 'bran_burst') warn(`${id} npc ${n.id} may be unreachable`);
    else if (n.talk && !adjReach(n.x, n.y) && !counterAdj) err(`${id} npc ${n.id} unreachable`);
  }
  for (const o of m.objects) {
    const ch = m.tiles[o.y] && m.tiles[o.y][o.x];
    if (!ch) { err(`${id} object out of bounds ${o.type} (${o.x},${o.y})`); continue; }
    const key = (o.type === 'chest' ? 'chest:' : 'got:') + o.id;
    if (o.id) { if (usedIds.has(key)) err(`duplicate object id ${key}`); usedIds.add(key); }
    if (o.item && !ITEMS[o.item]) err(`${id} object ${o.id} unknown item ${o.item}`);
    if (o.type === 'chest' && TILES[ch].solid) err(`${id} chest ${o.id} on solid tile '${ch}'`);
    if (o.type === 'sign' && ch !== 'S') warn(`${id} sign at (${o.x},${o.y}) on '${ch}'`);
    if (o.type === 'deco') continue;
    if (!adjReach(o.x, o.y)) err(`${id} object ${o.type} ${o.id || ''} (${o.x},${o.y}) unreachable`);
    if ((o.type === 'gather' || (o.type === 'search' && o.hidden)) && TILES[ch].solid) err(`${id} ground object ${o.id} on solid '${ch}'`);
  }
  for (const t of m.triggers) {
    let ok = false;
    for (let y = t.y; y < t.y + (t.h || 1); y++) for (let x = t.x; x < t.x + (t.w || 1); x++) if (reach.has(x + ',' + y)) ok = true;
    if (!ok) err(`${id} trigger at (${t.x},${t.y}) unreachable`);
  }
  console.log(`ok   ${id.padEnd(10)} ${m.w}x${m.h} reach=${reach.size} npcs=${m.npcs.length} objs=${m.objects.length}`);
}
// 퀘스트 목표 좌표
for (const qid in QUESTS) for (const st of QUESTS[qid].stages) {
  const t = st.target;
  if (!t) continue;
  if (!MAPS[t.map]) err(`quest ${qid} target map ${t.map}`);
  else if (t.x >= MAPS[t.map].w || t.y >= MAPS[t.map].h) err(`quest ${qid} target out of bounds`);
}
// 진행 관문 확인: 봉인 전에는 유적 안쪽에 갈 수 없어야 한다
{
  const m = MAPS.ruins1;
  const r = bfs(m, [[15, 21]], false);
  if (r.has('15,2')) err('ruins1: stairs reachable without opening seal/gate');
  const f = MAPS.field;
  const rf = bfs(f, [[31, 39]], false);
  const ironNpc = f.npcs.find((n) => n.id === 'ironfang');
  // 철엄니(NPC)가 막고 있는 칸을 막힌 칸으로 취급
  const rf2 = (() => { const save = f.objects; f.objects = save.concat([{ type: 'block', x: ironNpc.x, y: ironNpc.y, solid: true }]); const r2 = bfs(f, [[31, 39]], false); f.objects = save; return r2; })();
  if (rf2.has('31,6')) err('field: ruins reachable while Ironfang blocks the pass');
  if (!rf.has('31,6')) err('field: ruins not reachable even after Ironfang');
}
// 별조각 8개
const stars = [];
for (const id in MAPS) for (const o of MAPS[id].objects) if (o.item === 'star') stars.push(`${id}:${o.id}`);
console.log(`stars placed in maps: ${stars.length} (+1 from Tia quest) → ${stars.join(', ')}`);
if (stars.length + 1 !== 8) err(`star count ${stars.length + 1} != 8`);
console.log(`\n${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
