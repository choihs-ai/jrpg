'use strict';
// ─────────────────────────────────────────────────────────────
// Game: 진행 상태(파티·인벤토리·골드·플래그·위치) 단일 관리 지점
//  저장되는 것은 Game.state 하나뿐 — 모든 시스템이 이 객체를 통해 연결된다.
// ─────────────────────────────────────────────────────────────
const Game = (() => {
  const MAX_PARTY = 4;
  const MAX_STACK = 99;
  let state = null;

  function newState(heroName = '하루') {
    state = {
      version: 1,
      heroName,
      members: {},
      party: [],
      reserve: [],
      gold: 30,
      inv: {},
      flags: {},
      quests: {},
      pos: { map: 'inn', x: 3, y: 3, dir: 'down' },
      respawn: { map: 'shrine', x: 6, y: 6, dir: 'up' },
      playTime: 0,
      steps: 0,
      ward: 0,
      kills: {},
      seen: {},
      visited: {},
      starsGiven: 0,
      created: Date.now(),
    };
    join('hero', 1, true);
    addItem('herb', 2);
    return state;
  }

  // ── 동료 ──
  function makeMember(id, level) {
    const def = CHARACTERS[id];
    const m = { id, level: 1, exp: 0, hp: 1, mp: 0, equip: {}, status: {}, skills: [] };
    for (const s of EQUIP_SLOTS) m.equip[s] = def.equip[s] || null;
    m.level = level;
    m.exp = expForLevel(level);
    for (let l = 1; l <= level; l++) for (const sk of def.learn[l] || []) if (!m.skills.includes(sk)) m.skills.push(sk);
    return m;
  }
  function join(id, level, silent) {
    if (state.members[id]) {
      // 이미 있던 동료(예: 재합류) — 파티에 다시 넣기만 한다
      if (!state.party.includes(id) && !state.reserve.includes(id)) placeMember(id);
      return state.members[id];
    }
    const heroLv = state.members.hero ? state.members.hero.level : 1;
    const lv = Math.max(level || 1, heroLv - 1);
    const m = makeMember(id, lv);
    state.members[id] = m;
    const st = stats(id);
    m.hp = st.maxhp; m.mp = st.maxmp;
    placeMember(id);
    return m;
  }
  function placeMember(id) {
    if (state.party.length < MAX_PARTY) state.party.push(id);
    else state.reserve.push(id);
  }
  function leave(id) {
    state.party = state.party.filter((x) => x !== id);
    state.reserve = state.reserve.filter((x) => x !== id);
    if (!state.party.length && state.reserve.length) state.party.push(state.reserve.shift());
  }
  const member = (id) => state.members[id];
  const name = (id) => (id === 'hero' ? state.heroName : CHARACTERS[id].name);

  // 능력치 계산: 레벨 성장 + 장비
  function baseStats(id, level) {
    const def = CHARACTERS[id];
    const L = level - 1;
    const o = {};
    for (const k of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) o[k] = Math.floor(def.base[k] + def.grow[k] * L + def.grow[k] * 0.015 * L * L);
    return { maxhp: o.hp, maxmp: o.mp, atk: o.atk, def: o.def, mag: o.mag, spd: o.spd };
  }
  function stats(id, equipOverride) {
    const m = state.members[id];
    const s = baseStats(id, m.level);
    const eq = equipOverride || m.equip;
    s.resist = {};
    s.element = null;
    s.onHit = null;
    s.healBonus = 0;
    for (const slot of EQUIP_SLOTS) {
      const it = eq[slot] && ITEMS[eq[slot]];
      if (!it) continue;
      const st = it.stats || {};
      s.atk += st.atk || 0; s.def += st.def || 0; s.mag += st.mag || 0; s.spd += st.spd || 0;
      s.maxhp += st.hp || 0; s.maxmp += st.mp || 0;
      if (it.resist) for (const k in it.resist) s.resist[k] = Math.max(s.resist[k] || 0, it.resist[k]);
      if (it.element) s.element = it.element;
      if (it.onHit) s.onHit = it.onHit;
      if (it.healBonus) s.healBonus += it.healBonus;
    }
    return s;
  }
  // HP/MP를 최대치 이내로 보정 (장비 변경 후 등)
  function clampMember(id) {
    const m = state.members[id];
    const s = stats(id);
    m.hp = Util.clamp(m.hp, 0, s.maxhp);
    m.mp = Util.clamp(m.mp, 0, s.maxmp);
  }

  // 경험치 → 레벨업. 레벨업 정보 배열 반환
  function addExp(id, amount) {
    const m = state.members[id];
    const ups = [];
    if (!m || amount <= 0) return ups;
    m.exp += amount;
    while (m.level < MAX_LEVEL && m.exp >= expForLevel(m.level + 1)) {
      const before = baseStats(id, m.level);
      m.level++;
      const after = baseStats(id, m.level);
      const gains = {};
      for (const k of ['maxhp', 'maxmp', 'atk', 'def', 'mag', 'spd']) gains[k] = after[k] - before[k];
      const learned = [];
      for (const sk of CHARACTERS[id].learn[m.level] || []) if (!m.skills.includes(sk)) { m.skills.push(sk); learned.push(sk); }
      // 레벨업 시 늘어난 만큼 HP/MP도 함께 오른다
      if (m.hp > 0) m.hp += gains.maxhp;
      m.mp += gains.maxmp;
      ups.push({ id, level: m.level, gains, learned });
    }
    clampMember(id);
    return ups;
  }

  // ── 장비 ──
  function canEquip(id, itemId) {
    const it = ITEMS[itemId];
    return !!(it && EQUIP_SLOTS.includes(it.kind) && (!it.who || it.who.includes(id)));
  }
  function equip(id, slot, itemId) {
    const m = state.members[id];
    if (!m) return false;
    if (itemId) {
      if (!canEquip(id, itemId) || ITEMS[itemId].kind !== slot) return false;
      if (count(itemId) <= 0) return false;
      removeItem(itemId, 1);
    }
    const old = m.equip[slot];
    if (old) addItem(old, 1, true);
    m.equip[slot] = itemId || null;
    clampMember(id);
    return true;
  }

  // ── 인벤토리 ──
  function count(itemId) { return state.inv[itemId] || 0; }
  function addItem(itemId, n = 1, force = false) {
    if (!ITEMS[itemId]) { console.warn('unknown item', itemId); return 0; }
    const cur = state.inv[itemId] || 0;
    const cap = force ? 999 : MAX_STACK;
    const add = Math.max(0, Math.min(n, cap - cur));
    state.inv[itemId] = cur + add;
    return add;
  }
  function removeItem(itemId, n = 1) {
    const cur = state.inv[itemId] || 0;
    if (cur < n) return false;
    if (cur - n <= 0) delete state.inv[itemId];
    else state.inv[itemId] = cur - n;
    return true;
  }
  function itemList(filter) {
    const order = ['consumable', 'weapon', 'armor', 'shield', 'helm', 'accessory', 'key'];
    return Object.keys(state.inv)
      .filter((id) => state.inv[id] > 0 && ITEMS[id] && (!filter || filter(ITEMS[id])))
      .sort((a, b) => order.indexOf(ITEMS[a].kind) - order.indexOf(ITEMS[b].kind) || ITEMS[a].price - ITEMS[b].price);
  }
  // 장착 중인 것까지 포함한 소지 수
  function ownedTotal(itemId) {
    let n = count(itemId);
    for (const id in state.members) for (const s of EQUIP_SLOTS) if (state.members[id].equip[s] === itemId) n++;
    return n;
  }

  // ── 플래그 ──
  const flag = (k) => state.flags[k];
  function setFlag(k, v = true) { if (v === false || v === null) delete state.flags[k]; else state.flags[k] = v; }

  // ── 파티 상태 ──
  const activeIds = () => state.party.slice();
  const aliveIds = () => state.party.filter((id) => state.members[id].hp > 0);
  function healAll(revive = true) {
    for (const id in state.members) {
      const m = state.members[id];
      if (m.hp <= 0 && !revive) continue;
      const s = stats(id);
      m.hp = s.maxhp; m.mp = s.maxmp; m.status = {};
    }
  }
  function partyAvgLevel() {
    const ids = state.party;
    return ids.reduce((n, id) => n + state.members[id].level, 0) / Math.max(1, ids.length);
  }

  // 메인 스토리 진행도 (NPC 대사 분기 기준)
  //  0 깨어남 · 1 장로 만남 · 2 사냥꾼 방문 · 3 철엄니 격파 · 4 봉인 확인 · 5 미오 합류 · 6 봉인 해제 · 7 벨가르 격파 · 8 1장 완료
  function progress() {
    const f = state.flags;
    if (f.chapter1_done) return 8;
    if (f.velgar_defeated) return 7;
    if (f.seal_opened) return 6;
    if (f.mio_joined) return 5;
    if (f.saw_seal) return 4;
    if (f.ironfang_defeated) return 3;
    if (f.visited_hunter) return 2;
    if (f.met_elder) return 1;
    return 0;
  }

  return {
    MAX_PARTY,
    get state() { return state; },
    set state(s) { state = s; },
    newState, join, leave, member, name, stats, baseStats, clampMember, addExp,
    canEquip, equip, count, addItem, removeItem, itemList, ownedTotal,
    flag, setFlag, activeIds, aliveIds, healAll, partyAvgLevel, progress,
    heroName: () => (state ? state.heroName : '하루'),
    get gold() { return state.gold; },
    addGold(n) { state.gold = Util.clamp(state.gold + n, 0, 999999); },
    spend(n) { if (state.gold < n) return false; state.gold -= n; return true; },
    inParty: (id) => !!state && (state.party.includes(id) || state.reserve.includes(id)),
  };
})();
