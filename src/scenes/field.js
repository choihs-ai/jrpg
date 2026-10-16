'use strict';
// ─────────────────────────────────────────────────────────────
// Field: 맵 탐험 장면 — 이동, 충돌, NPC, 오브젝트, 동료 따라오기, 인카운터, 맵 전환
// ─────────────────────────────────────────────────────────────
const Field = (() => {
  const TS = 16, VW = 20, VH = 15;
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const SPEED_WALK = 4.6, SPEED_RUN = 7.6, NPC_SPEED = 2.6;

  let map = null, rt = null;
  const pl = { x: 0, y: 0, dir: 'down', fromX: 0, fromY: 0, t: 1, moving: false, phase: 0, speed: SPEED_WALK };
  let npcs = [];
  let followers = [];
  let busy = 0;
  let encLeft = 20;
  let grace = 0;
  let banner = null;
  let toast = null;
  let path = null;
  let pathInteract = null;
  let bumpT = 0;
  let lastMapId = null;
  let poisonWarned = false;
  const tintCache = new WeakMap();
  function poisonTint(img) {
    let t = tintCache.get(img);
    if (!t) { t = Pix.silhouette(img, '#a040c0'); tintCache.set(img, t); }
    return t;
  }
  let mapTime = 0;
  const cam = { x: 0, y: 0 };
  const layer = { modal: true, update: (dt) => update(dt), draw: (c) => draw(c), onAction: (a) => onAction(a), onPointer: (e) => onPointer(e) };

  // ── 맵 정보 조회 ──
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h;
  const tileAt = (x, y) => (inBounds(x, y) ? rt[y][x] : ' ');
  function objectsAt(x, y) { return map.objects.filter((o) => o.x === x && o.y === y && objVisible(o)); }
  function objVisible(o) {
    if (o.show && !o.show()) return false;
    if (o.type === 'gather' && Game.flag('got:' + o.id)) return false;
    if (o.type === 'note' && o.item && Game.flag('got:' + o.id)) return false;
    return true;
  }
  function objSolid(o) {
    return ['chest', 'lever', 'note-solid', 'block'].includes(o.type) || o.solid === true;
  }
  const npcAt = (x, y) => npcs.find((n) => n.visible && ((n.x === x && n.y === y) || (n.moving && n.fromX === x && n.fromY === y)));
  function blocked(x, y, who) {
    if (!inBounds(x, y)) return true;
    const ch = rt[y][x];
    const td = TILES[ch];
    if (!td || td.solid) return true;
    if (objectsAt(x, y).some(objSolid)) return true;
    const n = npcAt(x, y);
    if (n && n !== who) return true;
    if (who && who !== 'player' && ((pl.x === x && pl.y === y) || (pl.moving && pl.fromX === x && pl.fromY === y))) return true;
    return false;
  }
  const warpAt = (x, y) => map.warps.find((w) => w.x === x && w.y === y);

  // ── 맵 진입 ──
  function buildRuntime() {
    rt = map.tiles.map((r) => r.split(''));
    for (const tf of map.tileFlags) {
      const on = typeof tf.flag === 'function' ? tf.flag() : Game.flag(tf.flag);
      if (on) for (const [x, y] of tf.at || [[tf.x, tf.y]]) rt[y][x] = tf.tile;
    }
  }
  function refreshTiles() { buildRuntime(); }

  function makeNpc(def) {
    return {
      def, id: def.id, x: def.x, y: def.y, dir: def.dir || 'down', fromX: def.x, fromY: def.y, t: 1, moving: false,
      homeX: def.x, homeY: def.y, wait: 1 + Util.rand() * 2, phase: 0, visible: true, frames: null,
    };
  }
  function npcFrames(n) {
    if (n.frames) return n.frames;
    const look = n.def.look;
    if (typeof look === 'string' && look.startsWith('critter:')) n.frames = Chars.critter(look.slice(8));
    else if (typeof look === 'string' && look.startsWith('monster:')) {
      const id = look.slice(8);
      const m = MONSTERS[id];
      const img = MonsterArt.render(m.art, m.pal, { scale: n.def.scale || 0.4 });
      n.frames = { big: img };
    } else n.frames = Chars.build(typeof look === 'string' ? LOOKS[look] : look);
    return n.frames;
  }
  function refreshNpcs() {
    for (const n of npcs) n.visible = !n.def.show || !!n.def.show();
  }

  function findOpen(x, y) {
    // 목표 칸이 막혀 있으면 가까운 빈 칸을 찾는다 (잘못된 위치 생성 방지)
    if (!blocked(x, y, 'player') && !warpAt(x, y)) return [x, y];
    const seen = new Set([x + ',' + y]);
    const q = [[x, y]];
    while (q.length) {
      const [cx, cy] = q.shift();
      for (const d of Object.values(DIRV)) {
        const nx = cx + d[0], ny = cy + d[1];
        const k = nx + ',' + ny;
        if (seen.has(k) || !inBounds(nx, ny)) continue;
        seen.add(k);
        if (!blocked(nx, ny, 'player') && !warpAt(nx, ny)) return [nx, ny];
        q.push([nx, ny]);
      }
    }
    return [x, y];
  }

  function enter(mapId, x, y, dir) {
    if (!MAPS[mapId]) { console.error('unknown map', mapId); mapId = 'rivel'; x = 19; y = 27; }
    map = MAPS[mapId];
    buildRuntime();
    npcs = map.npcs.map(makeNpc);
    refreshNpcs();
    if (!inBounds(x, y) || blocked(x, y, 'player')) {
      const [ox, oy] = findOpen(Util.clamp(x, 0, map.w - 1), Util.clamp(y, 0, map.h - 1));
      console.warn(`[Field] spawn ${mapId}(${x},${y}) blocked → (${ox},${oy})`);
      x = ox; y = oy;
    }
    pl.x = pl.fromX = x; pl.y = pl.fromY = y; pl.dir = dir || 'down'; pl.t = 1; pl.moving = false;
    resetFollowers();
    Game.state.pos = { map: mapId, x, y, dir: pl.dir };
    path = null; pathInteract = null;
    grace = 4;
    resetEnc();
    mapTime = 0;
    if (lastMapId !== mapId && map.kind !== 'interior') banner = { text: map.name, t: 2.6 };
    else if (lastMapId !== mapId && map.kind === 'interior') banner = { text: map.name, t: 1.6 };
    lastMapId = mapId;
    if (map.bgm) Sound.bgm(typeof map.bgm === 'function' ? map.bgm() : map.bgm);
    markVisited();
    updateCamera();
  }

  function resetFollowers() {
    followers = Game.state.party.slice(1).map((id) => ({ id, x: pl.x, y: pl.y, fromX: pl.x, fromY: pl.y, dir: pl.dir }));
  }
  function resetEnc() {
    const z = encZone(pl.x, pl.y);
    const rate = z ? ENCOUNTERS[z].rate : [16, 26];
    encLeft = Util.randInt(rate[0], rate[1]);
  }
  function encZone(x, y) {
    const e = map.enc;
    if (!e) return null;
    if (typeof e === 'string') return e;
    for (const z of e.zones || []) if (x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h) return z.enc;
    return e.default || null;
  }

  async function warp(mapId, x, y, dir, opts = {}) {
    busy++;
    try {
      path = null;
      if (opts.sfx) Sound.sfx(opts.sfx);
      await Engine.fadeOut(opts.slow ? 500 : 200);
      enter(mapId, x, y, dir);
      if (opts.during) await opts.during();
      await Engine.fadeIn(opts.slow ? 500 : 200);
      if (map.onEnter) await Events.run(map.onEnter);
    } finally { busy--; }
  }

  // ── 방문 기록 (던전 미니맵) ──
  function markVisited() {
    if (map.kind !== 'dungeon') return;
    const v = Game.state.visited;
    let s = v[map.id];
    if (!s || s.length !== map.w * map.h) s = '0'.repeat(map.w * map.h);
    const arr = s.split('');
    for (let dy = -3; dy <= 3; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = pl.x + dx, y = pl.y + dy;
      if (inBounds(x, y)) arr[y * map.w + x] = '1';
    }
    v[map.id] = arr.join('');
  }

  // ── 이동 ──
  function startMove(dir) {
    pl.dir = dir;
    const [dx, dy] = DIRV[dir];
    const nx = pl.x + dx, ny = pl.y + dy;
    if (!inBounds(nx, ny)) {
      if (map.edge) {
        const e = typeof map.edge === 'function' ? map.edge(dir) : map.edge;
        if (e) { Events.run(() => warp(e.map, e.x, e.y, e.dir || dir)); return true; }
      }
      bump();
      return false;
    }
    if (blocked(nx, ny, 'player')) {
      bump();
      return false;
    }
    // 동료 이동 (앞 사람의 이전 위치로)
    let px = pl.x, py = pl.y, pdir = pl.dir;
    for (const f of followers) {
      const ox = f.x, oy = f.y, od = f.dir;
      f.fromX = f.x; f.fromY = f.y;
      if (f.x !== px || f.y !== py) { f.dir = px > f.x ? 'right' : px < f.x ? 'left' : py > f.y ? 'down' : 'up'; }
      f.x = px; f.y = py;
      px = ox; py = oy; pdir = od;
    }
    pl.fromX = pl.x; pl.fromY = pl.y;
    pl.x = nx; pl.y = ny;
    pl.t = 0; pl.moving = true;
    pl.speed = (Input.isHeld('run') ? !Settings.get('autoRun') : Settings.get('autoRun')) ? SPEED_RUN : SPEED_WALK;
    return true;
  }
  function bump() {
    if (bumpT <= 0) { Sound.sfx('bump'); bumpT = 0.3; }
  }

  function onStepEnd() {
    const st = Game.state;
    st.steps++;
    st.pos = { map: map.id, x: pl.x, y: pl.y, dir: pl.dir };
    pl.phase++;
    markVisited();
    if (grace > 0) grace--;
    // 독: 4걸음마다 HP 감소 (1 미만으로는 떨어지지 않음)
    if (!st.party.some((id) => st.members[id].status.poison)) poisonWarned = false;
    if (st.steps % 4 === 0) {
      let hurt = false;
      for (const id of st.party) {
        const m = st.members[id];
        if (m.hp > 0 && m.status.poison) { const loss = Math.max(1, Math.floor(Game.stats(id).maxhp * 0.03)); if (m.hp > 1) { m.hp = Math.max(1, m.hp - loss); hurt = true; } }
      }
      if (hurt) {
        Sound.sfx('poison');
        // 화면 전체 섬광 대신 캐릭터 색조로 표시하고, 처음 한 번만 치료 방법을 알려 준다
        if (!poisonWarned) { poisonWarned = true; showToast('독 피해! 해독초·정화 주문·신전에서 치료할 수 있다.', 3.5); }
      }
    }
    if (st.ward > 0) {
      st.ward--;
      if (st.ward === 0) showToast('정령의 향의 효과가 사라졌다.');
    }
    // 워프
    const w = warpAt(pl.x, pl.y);
    if (w) {
      if (w.cond && !w.cond()) {
        if (w.blocked) Events.run(async () => { await w.blocked(); await stepBack(); });
        return true;
      }
      const sfx = w.sfx || ({ D: 'door', E: 'door', '<': 'stairs', '>': 'stairs' }[tileAt(pl.x, pl.y)] || null);
      Events.run(() => warp(w.to, w.tx, w.ty, w.dir || pl.dir, { sfx }));
      return true;
    }
    // 밟으면 발동하는 이벤트
    for (const tr of map.triggers) {
      if (pl.x >= tr.x && pl.y >= tr.y && pl.x < tr.x + (tr.w || 1) && pl.y < tr.y + (tr.h || 1)) {
        if (tr.once && Game.flag(tr.once)) continue;
        if (tr.when && !tr.when()) continue;
        path = null;
        Events.run(async () => { await tr.run(); if (tr.once) Game.setFlag(tr.once); });
        return true;
      }
    }
    // 인카운터
    const z = encZone(pl.x, pl.y);
    if (z && grace <= 0 && st.ward <= 0 && !Game.flag('debug_noenc')) {
      encLeft -= TILES[tileAt(pl.x, pl.y)].road ? 0.6 : 1;
      if (encLeft <= 0) {
        resetEnc();
        path = null;
        const zone = ENCOUNTERS[z];
        const group = Util.weighted(zone.groups);
        Events.run(async () => { await S.battle(group.e, { bg: zone.bg }); grace = 3; });
        return true;
      }
    }
    return false;
  }

  // 막힌 문 등에서 한 칸 뒤로
  async function stepBack() {
    const back = { up: 'down', down: 'up', left: 'right', right: 'left' }[pl.dir];
    await walkPlayer([back], true);
  }

  // ── 상호작용 ──
  function frontTile() { const [dx, dy] = DIRV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
  function interact() {
    if (pl.moving || busy) return;
    let [fx, fy] = frontTile();
    let n = npcAt(fx, fy);
    if (!n && TILES[tileAt(fx, fy)] && TILES[tileAt(fx, fy)].counter) {
      const [dx, dy] = DIRV[pl.dir];
      n = npcAt(fx + dx, fy + dy);
    }
    if (n && n.def.talk) {
      path = null;
      Events.run(async () => {
        const prev = n.dir;
        if (!n.def.noTurn) n.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[pl.dir];
        n.talking = true;
        try { await n.def.talk(n); } finally { n.talking = false; if (n.def.move === 'static') n.dir = n.def.keepDir ? prev : n.dir; }
      });
      return;
    }
    const objs = objectsAt(fx, fy);
    if (objs.length) { Events.run(() => useObject(objs[0])); return; }
    // 발밑 조사
    const feet = objectsAt(pl.x, pl.y).filter((o) => o.type === 'search' || o.type === 'gather' || o.type === 'note');
    if (feet.length) { Events.run(() => useObject(feet[0])); return; }
  }

  async function useObject(o) {
    switch (o.type) {
      case 'sign': Sound.sfx('cursor'); await S.say(null, o.text); break;
      case 'chest': {
        const key = 'chest:' + o.id;
        if (Game.flag(key)) { await S.say(null, '빈 상자다.'); break; }
        if (o.mimic) {
          await S.say(null, '상자를 열려고 하자 뚜껑이 저절로 덜컹거린다…!');
          Engine.shake(5, 0.4);
          const r = await S.battle(['greed_chest'], { bg: map.kind === 'dungeon' ? 'ruins' : 'plains', ambushSafe: true });
          if (r !== 'win') break;
          Game.setFlag(key);
          await S.say(null, '탐욕상자가 품고 있던 보물이 쏟아졌다!');
        } else {
          Sound.sfx('chest');
          Game.setFlag(key);
          await Engine.wait(250);
        }
        if (o.gold) await S.gold(o.gold, true);
        if (o.item) await S.give(o.item, o.n || 1, { from: '보물상자에서 ' });
        if (o.after) await o.after();
        break;
      }
      case 'search': {
        const key = 'got:' + o.id;
        if (Game.flag(key)) { if (o.empty) await S.say(null, o.empty); break; }
        if (o.cond && !o.cond()) { if (o.empty) await S.say(null, o.empty); break; }
        Game.setFlag(key);
        if (o.msg) await S.say(null, o.msg);
        if (o.gold) await S.gold(o.gold, true);
        if (o.item) await S.give(o.item, o.n || 1);
        if (o.after) await o.after();
        break;
      }
      case 'gather': {
        const key = 'got:' + o.id;
        if (Game.flag(key)) break;
        Game.setFlag(key);
        if (o.msg) await S.say(null, o.msg);
        await S.give(o.item, o.n || 1);
        break;
      }
      case 'note': {
        await S.say(null, o.text);
        if (o.item && !Game.flag('got:' + o.id)) { Game.setFlag('got:' + o.id); await S.give(o.item, 1); }
        if (o.after) await o.after();
        break;
      }
      case 'lever': {
        const on = !Game.flag(o.flag);
        Game.setFlag(o.flag, on);
        Sound.sfx('door');
        Engine.shake(2, 0.15);
        await S.say(null, on ? '레버를 당겼다. 어딘가에서 철컥 하는 소리가 났다.' : '레버를 원래대로 되돌렸다.');
        if (o.after) await o.after(on);
        refreshTiles();
        break;
      }
      case 'event':
      case 'block':
        if (o.run) await o.run(o);
        break;
    }
    refreshNpcs();
  }

  // ── 자동 이동 (마우스/터치 클릭) ──
  function findPath(tx, ty, adjacent) {
    const goal = (x, y) => (adjacent ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
    const start = [pl.x, pl.y];
    if (goal(pl.x, pl.y)) return [];
    const prev = new Map();
    const key = (x, y) => x + ',' + y;
    prev.set(key(pl.x, pl.y), null);
    const q = [start];
    let found = null;
    let guard = 0;
    while (q.length && guard++ < 4000) {
      const [cx, cy] = q.shift();
      for (const dname of ['up', 'down', 'left', 'right']) {
        const [dx, dy] = DIRV[dname];
        const nx = cx + dx, ny = cy + dy;
        const k = key(nx, ny);
        if (prev.has(k) || !inBounds(nx, ny)) continue;
        if (blocked(nx, ny, 'player')) continue;
        // 워프 칸은 목적지일 때만 통과
        if (warpAt(nx, ny) && !(nx === tx && ny === ty)) continue;
        prev.set(k, [cx, cy, dname]);
        if (goal(nx, ny)) { found = [nx, ny]; q.length = 0; break; }
        q.push([nx, ny]);
      }
    }
    if (!found) return null;
    const dirs = [];
    let cur = found;
    while (true) {
      const p = prev.get(key(cur[0], cur[1]));
      if (!p) break;
      dirs.unshift(p[2]);
      cur = [p[0], p[1]];
    }
    return dirs;
  }

  function onPointer(ev) {
    if (ev.type !== 'down' || busy || !Engine.isTop(layer) || Engine.fading) return true;
    // 메뉴 버튼
    if (ev.x > Engine.W - 54 && ev.y < 50) { openMenu(); return true; }
    const wx = Math.floor((ev.x / 2 + cam.x) / TS), wy = Math.floor((ev.y / 2 + cam.y) / TS);
    if (wx === pl.x && wy === pl.y) { interact(); return true; }
    const target = npcAt(wx, wy) || objectsAt(wx, wy)[0];
    const solid = blocked(wx, wy, 'player') || !!target;
    let dirs = findPath(wx, wy, solid);
    if (dirs === null && solid && TILES[tileAt(wx, wy)] && TILES[tileAt(wx, wy)].counter) dirs = null;
    if (dirs === null) { bump(); return true; }
    path = dirs;
    pathInteract = solid ? [wx, wy] : null;
    if (!path.length && pathInteract) { faceToward(wx, wy); interact(); path = null; }
    return true;
  }
  function faceToward(x, y) {
    if (x > pl.x) pl.dir = 'right'; else if (x < pl.x) pl.dir = 'left'; else if (y > pl.y) pl.dir = 'down'; else if (y < pl.y) pl.dir = 'up';
  }

  function onAction(a) {
    if (busy || Engine.fading) return;
    if (a === 'confirm') interact();
    else if (a === 'cancel' || a === 'menu') { if (!pl.moving) openMenu(); }
    else if (a === 'map') { if (!pl.moving) Events.run(() => MapView.open()); }
    if (['up', 'down', 'left', 'right'].includes(a)) path = null;
  }

  function openMenu() {
    if (busy) return;
    path = null;
    Sound.sfx('menu');
    Events.run(() => Menu.open());
  }

  // ── 업데이트 ──
  function update(dt) {
    if (!map) return;
    mapTime += dt;
    if (bumpT > 0) bumpT -= dt;
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    updateNpcs(dt);
    const canControl = Engine.isTop(layer) && !busy && !Engine.fading;
    if (pl.moving) {
      pl.t += dt * pl.speed;
      if (pl.t >= 1) {
        pl.t = 1; pl.moving = false;
        for (const f of followers) { f.fromX = f.x; f.fromY = f.y; }
        if (pl.onArrive) { const cb = pl.onArrive; pl.onArrive = null; cb(); }
        else {
          const stop = onStepEnd();
          if (!stop && canControl && !busy) continueMove();
        }
      }
    } else if (canControl) {
      continueMove();
    }
    updateCamera();
  }
  function continueMove() {
    const d = Input.dir();
    if (d) { path = null; if (!startMove(d)) pl.dir = d; return; }
    if (path && path.length) {
      const nd = path.shift();
      if (!startMove(nd)) { path = null; pathInteract = null; }
      return;
    }
    if (path && !path.length) {
      path = null;
      if (pathInteract) { const [ix, iy] = pathInteract; pathInteract = null; faceToward(ix, iy); interact(); }
    }
  }

  function updateNpcs(dt) {
    for (const n of npcs) {
      if (!n.visible) continue;
      if (n.moving) {
        n.t += dt * (n.speed || NPC_SPEED);
        if (n.t >= 1) { n.t = 1; n.moving = false; n.phase++; if (n.onArrive) { const f = n.onArrive; n.onArrive = null; f(); } }
        continue;
      }
      if (n.scripted || n.talking || busy) continue;
      const mv = n.def.move || 'static';
      if (mv === 'static') continue;
      n.wait -= dt;
      if (n.wait > 0) continue;
      n.wait = 1.2 + Util.rand() * 2.5;
      const dname = Util.pick(['up', 'down', 'left', 'right']);
      if (mv === 'turn') { n.dir = dname; continue; }
      const [dx, dy] = DIRV[dname];
      const nx = n.x + dx, ny = n.y + dy;
      const r = n.def.radius || 2;
      n.dir = dname;
      if (Math.abs(nx - n.homeX) > r || Math.abs(ny - n.homeY) > r) continue;
      if (blocked(nx, ny, n) || warpAt(nx, ny)) continue;
      if (followers.some((f) => f.x === nx && f.y === ny)) continue;
      n.fromX = n.x; n.fromY = n.y; n.x = nx; n.y = ny; n.t = 0; n.moving = true;
    }
  }

  // 스크립트용: NPC 이동 (충돌 무시)
  function walkNpc(id, dirs, speed = NPC_SPEED) {
    const n = npcs.find((x) => x.id === id);
    if (!n) return Promise.resolve();
    n.scripted = true;
    return new Promise((resolve) => {
      const next = () => {
        if (!dirs.length) { n.scripted = false; resolve(); return; }
        const d = dirs.shift();
        n.dir = d;
        const [dx, dy] = DIRV[d];
        n.fromX = n.x; n.fromY = n.y; n.x += dx; n.y += dy; n.t = 0; n.moving = true; n.speed = speed;
        n.onArrive = next;
      };
      next();
    });
  }
  // 스크립트용: 주인공 이동 (동료도 따라온다). 이동 중 워프·인카운터는 발생하지 않는다.
  function walkPlayer(dirs, ignoreBlock = false) {
    return new Promise((resolve) => {
      const step = () => {
        if (!dirs.length) { resolve(); return; }
        const d = dirs.shift();
        const [dx, dy] = DIRV[d];
        pl.dir = d;
        if (!ignoreBlock && blocked(pl.x + dx, pl.y + dy, 'player')) { resolve(); return; }
        let px = pl.x, py = pl.y;
        for (const f of followers) { const ox = f.x, oy = f.y; f.fromX = f.x; f.fromY = f.y; if (f.x !== px || f.y !== py) f.dir = px > f.x ? 'right' : px < f.x ? 'left' : py > f.y ? 'down' : 'up'; f.x = px; f.y = py; px = ox; py = oy; }
        pl.fromX = pl.x; pl.fromY = pl.y; pl.x += dx; pl.y += dy; pl.t = 0; pl.moving = true; pl.speed = SPEED_WALK;
        pl.onArrive = () => {
          pl.phase++;
          Game.state.pos = { map: map.id, x: pl.x, y: pl.y, dir: pl.dir };
          step();
        };
      };
      step();
    });
  }

  function updateCamera() {
    const ppx = Util.lerp(pl.fromX, pl.x, pl.t) * TS, ppy = Util.lerp(pl.fromY, pl.y, pl.t) * TS;
    const mw = map.w * TS, mh = map.h * TS;
    cam.x = mw <= Engine.LW ? -(Engine.LW - mw) / 2 : Util.clamp(ppx + 8 - Engine.LW / 2, 0, mw - Engine.LW);
    cam.y = mh <= Engine.LH ? -(Engine.LH - mh) / 2 : Util.clamp(ppy + 8 - Engine.LH / 2, 0, mh - Engine.LH);
    cam.x = Math.round(cam.x); cam.y = Math.round(cam.y);
  }

  // ── 그리기 ──
  function hasNell() { return Game.state.party.includes('nell'); }
  function draw(ctx) {
    if (!map) return;
    const g = Engine.lctx;
    g.fillStyle = '#000';
    g.fillRect(0, 0, Engine.LW, Engine.LH);
    const x0 = Math.max(0, Math.floor(cam.x / TS)), y0 = Math.max(0, Math.floor(cam.y / TS));
    const x1 = Math.min(map.w - 1, Math.floor((cam.x + Engine.LW) / TS)), y1 = Math.min(map.h - 1, Math.floor((cam.y + Engine.LH) / TS));
    const T = Engine.time;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) Tiles.drawAt(g, { rt, base: map.base, baseAt: map.baseAt }, x, y, x * TS - cam.x, y * TS - cam.y, T);
    // 오브젝트
    for (const o of map.objects) {
      if (!objVisible(o)) continue;
      const sx = o.x * TS - cam.x, sy = o.y * TS - cam.y;
      if (sx < -48 || sy < -48 || sx > Engine.LW + 48 || sy > Engine.LH + 48) continue;
      if (o.type === 'chest') g.drawImage(ObjArt.chest(Game.flag('chest:' + o.id), o.color), sx, sy);
      else if (o.type === 'lever') g.drawImage(ObjArt.lever(!!Game.flag(o.flag)), sx, sy);
      else if (o.type === 'gather') g.drawImage(ObjArt.herb(Math.floor(T * 2) % 2), sx, sy);
      else if (o.type === 'note') g.drawImage(ObjArt.note(), sx, sy);
      else if (o.type === 'rope') g.drawImage(ObjArt.rope(), sx, sy);
      else if (o.type === 'deco' && o.draw === 'windmill') ObjArt.windmill(g, sx + 8, sy + 6, T);
      else if (o.type === 'deco' && o.draw === 'bell') g.drawImage(ObjArt.bell(!!Game.flag('velgar_defeated')), sx - 24, sy - 30);
      else if (o.type === 'search' && o.hidden && hasNell() && !Game.flag('got:' + o.id)) g.drawImage(ObjArt.sparkle(T + o.x), sx, sy);
      else if (o.art === 'circle') {
        // 귀환의 마법진
        g.save();
        g.globalAlpha = 0.55 + 0.25 * Math.sin(T * 3);
        g.strokeStyle = '#9fd3ff'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(sx + 8, sy + 9, 7, 4, 0, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.ellipse(sx + 8, sy + 9, 4, 2, 0, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#ffffff'; g.fillRect(sx + 7, sy + 1 + ((T * 12) % 8), 1, 2); g.fillRect(sx + 4, sy + 3 + ((T * 9) % 6), 1, 1); g.fillRect(sx + 11, sy + 2 + ((T * 10) % 7), 1, 1);
        g.restore();
      }
    }
    // 인물 (y 정렬)
    const sprites = [];
    const party = Game.state.party;
    const lead = party[0];
    sprites.push({ y: Util.lerp(pl.fromY, pl.y, pl.t), x: Util.lerp(pl.fromX, pl.x, pl.t), frames: Chars.build(LOOKS[CHARACTERS[lead].look]), dir: pl.dir, moving: pl.moving, phase: pl.phase, t: pl.t, alpha: 1, order: 2, poison: !!Game.state.members[lead].status.poison });
    followers.forEach((f, i) => {
      const m = Game.state.members[f.id];
      if (!m) return;
      const t = pl.t;
      sprites.push({ y: Util.lerp(f.fromY, f.y, t), x: Util.lerp(f.fromX, f.x, t), frames: Chars.build(LOOKS[CHARACTERS[f.id].look]), dir: f.dir, moving: pl.moving, phase: pl.phase + i + 1, t: pl.t, alpha: m.hp > 0 ? 1 : 0.45, order: 1, poison: !!m.status.poison });
    });
    for (const n of npcs) {
      if (!n.visible) continue;
      const fr = npcFrames(n);
      sprites.push({ y: Util.lerp(n.fromY, n.y, n.t), x: Util.lerp(n.fromX, n.x, n.t), frames: fr, dir: n.dir, moving: n.moving, phase: n.phase, t: n.t, alpha: 1, order: 0, npc: n });
    }
    sprites.sort((a, b) => a.y - b.y || a.order - b.order);
    for (const s of sprites) {
      const sx = Math.round(s.x * TS - cam.x), sy = Math.round(s.y * TS - cam.y);
      g.globalAlpha = s.alpha;
      if (s.frames.big) {
        const img = s.frames.big;
        const bob = Math.sin(T * 3) > 0.6 ? 1 : 0;
        g.drawImage(img, sx + 8 - Math.floor(img.width / 2), sy + 16 - img.height - bob);
      } else {
        const img = s.frames.critter ? (s.moving ? s.frames[s.dir][s.phase % 2] : s.frames[s.dir][0]) : Chars.frameFor(s.frames, s.dir, s.moving ? s.phase * 2 + (s.t < 0.5 ? 1 : 0) : 0);
        g.drawImage(img, sx, sy - 4);
        if (s.poison) { g.globalAlpha = s.alpha * (0.3 + 0.1 * Math.sin(T * 6)); g.drawImage(poisonTint(img), sx, sy - 4); }
      }
      g.globalAlpha = 1;
      if (s.npc && s.npc.def.mark && s.npc.def.mark()) {
        // 퀘스트 표시 (!)
        const by = sy - 12 + Math.sin(T * 5) * 1.5;
        g.fillStyle = '#ffd75e'; g.fillRect(sx + 7, by, 2, 5); g.fillRect(sx + 7, by + 6, 2, 2);
      }
    }
    Engine.blitLow(ctx);
    drawHud(ctx);
  }

  function drawHud(ctx) {
    const top = Engine.isTop(layer) && !busy;
    if (banner) {
      const a = Math.min(1, banner.t * 2);
      ctx.globalAlpha = a;
      const w = Math.max(200, Text.width(ctx, banner.text, 22, true) + 60);
      UI.drawWindow(ctx, Engine.W / 2 - w / 2, 18, w, 46);
      Text.draw(ctx, banner.text, Engine.W / 2, 29, { size: 22, bold: true, align: 'center', color: Theme.gold });
      ctx.globalAlpha = 1;
    }
    if (top && Settings.get('showGoal') && !banner) {
      const g = Quests.currentGoal();
      if (g) {
        ctx.fillStyle = 'rgba(10,12,30,0.62)';
        const tw = Math.min(520, Text.width(ctx, g.text, 15) + 40);
        UI.roundRect(ctx, 8, 8, tw, 28, 6); ctx.fill();
        Text.draw(ctx, '★ ' + g.text, 18, 14, { size: 15, color: '#ffe9a8', maxW: tw - 20 });
      }
    }
    if (top) {
      // 메뉴 버튼
      ctx.fillStyle = 'rgba(10,12,30,0.6)';
      UI.roundRect(ctx, Engine.W - 48, 8, 40, 36, 7); ctx.fill();
      ctx.fillStyle = '#f4f1e6';
      for (let i = 0; i < 3; i++) ctx.fillRect(Engine.W - 38, 16 + i * 8, 20, 3);
    }
    if (toast) {
      ctx.globalAlpha = Math.min(1, toast.t * 2);
      const w = Text.width(ctx, toast.text, 17) + 40;
      UI.drawWindow(ctx, Engine.W / 2 - w / 2, Engine.H - 70, w, 40);
      Text.draw(ctx, toast.text, Engine.W / 2, Engine.H - 60, { size: 17, align: 'center' });
      ctx.globalAlpha = 1;
    }
  }

  function showToast(text, sec = 2.2) { toast = { text, t: sec }; }

  return {
    layer, enter, warp, walkNpc, walkPlayer, refreshNpcs, refreshTiles, showToast, findPath, interact,
    get map() { return map; }, get player() { return pl; }, get npcs() { return npcs; },
    get busy() { return busy; }, set busy(v) { busy = v; },
    npc: (id) => npcs.find((n) => n.id === id),
    blocked: (x, y) => blocked(x, y, 'player'),
    tileAt, objectsAt, warpAt, resetFollowers, encZone,
    setBanner(text) { banner = { text, t: 2.4 }; },
    get cam() { return cam; },
    get encLeft() { return encLeft; },
    set encLeft(v) { encLeft = v; },
  };
})();
