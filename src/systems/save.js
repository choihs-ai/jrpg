'use strict';
// ─────────────────────────────────────────────────────────────
// Save: localStorage 3슬롯 저장/불러오기 + 데이터 검증
// ─────────────────────────────────────────────────────────────
const Save = (() => {
  const PREFIX = 'starbell-jrpg.save.';
  const SLOTS = 3;
  const VERSION = 1;
  let memory = {}; // localStorage를 쓸 수 없는 환경용 대체 저장소

  function storageGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return memory[k] || null; }
  }
  function storageSet(k, v) {
    try { localStorage.setItem(k, v); return true; } catch (e) { memory[k] = v; return false; }
  }

  function summary() {
    const s = Game.state;
    const map = MAPS[s.pos.map];
    return {
      name: s.heroName,
      level: s.members.hero ? s.members.hero.level : 1,
      place: map ? map.name : '???',
      time: s.playTime,
      party: s.party.slice(),
      date: Date.now(),
      chapter: Game.flag('chapter1_done') ? '제1장 완료' : '제1장',
    };
  }

  function write(slot) {
    if (!Game.state) return false;
    const data = { v: VERSION, summary: summary(), state: Game.state };
    const ok = storageSet(PREFIX + slot, JSON.stringify(data));
    return ok !== null;
  }

  function readRaw(slot) {
    const raw = storageGet(PREFIX + slot);
    if (!raw) return null;
    try {
      const d = JSON.parse(raw);
      if (!d || typeof d !== 'object' || !d.state) return { corrupt: true };
      return d;
    } catch (e) { return { corrupt: true }; }
  }

  // 저장 데이터 검증 + 누락 필드 보정 (구버전 호환)
  function validate(s) {
    if (!s || typeof s !== 'object') return null;
    const base = (() => { const keep = Game.state; const fresh = Game.newState(s.heroName || '하루'); Game.state = keep; return fresh; })();
    const out = Object.assign({}, base, s);
    for (const k of ['members', 'inv', 'flags', 'quests', 'kills', 'seen', 'visited']) if (!out[k] || typeof out[k] !== 'object') out[k] = {};
    if (!Array.isArray(out.party)) out.party = ['hero'];
    if (!Array.isArray(out.reserve)) out.reserve = [];
    out.party = out.party.filter((id) => CHARACTERS[id] && out.members[id]);
    out.reserve = out.reserve.filter((id) => CHARACTERS[id] && out.members[id] && !out.party.includes(id));
    if (!out.members.hero) return null;
    if (!out.party.length) out.party = ['hero'];
    for (const id in out.members) {
      const m = out.members[id];
      if (!CHARACTERS[id]) { delete out.members[id]; continue; }
      m.level = Util.clamp(m.level | 0 || 1, 1, MAX_LEVEL);
      m.equip = m.equip || {};
      for (const sl of EQUIP_SLOTS) if (m.equip[sl] && !ITEMS[m.equip[sl]]) m.equip[sl] = null;
      m.status = m.status || {};
      m.skills = Array.isArray(m.skills) ? m.skills.filter((sk) => SKILLS[sk]) : [];
      if (typeof m.hp !== 'number') m.hp = 1;
      if (typeof m.mp !== 'number') m.mp = 0;
    }
    for (const it in out.inv) if (!ITEMS[it] || !(out.inv[it] > 0)) delete out.inv[it];
    out.gold = Util.clamp(out.gold | 0, 0, 999999);
    if (!out.pos || !MAPS[out.pos.map]) out.pos = { map: 'rivel', x: 19, y: 27, dir: 'up' };
    if (!out.respawn || !MAPS[out.respawn.map]) out.respawn = { map: 'shrine', x: 6, y: 6, dir: 'up' };
    return out;
  }

  return {
    SLOTS,
    write,
    info(slot) {
      const d = readRaw(slot);
      if (!d) return null;
      if (d.corrupt) return { corrupt: true };
      return d.summary || { name: '?', level: 1, place: '?', time: 0 };
    },
    any() { for (let i = 1; i <= SLOTS; i++) { const inf = this.info(i); if (inf && !inf.corrupt) return true; } return false; },
    latest() {
      let best = null, slot = 0;
      for (let i = 1; i <= SLOTS; i++) { const inf = this.info(i); if (inf && !inf.corrupt && (!best || inf.date > best.date)) { best = inf; slot = i; } }
      return slot;
    },
    load(slot) {
      const d = readRaw(slot);
      if (!d || d.corrupt) return false;
      const s = validate(d.state);
      if (!s) return false;
      Game.state = s;
      for (const id in s.members) Game.clampMember(id);
      return true;
    },
    remove(slot) { try { localStorage.removeItem(PREFIX + slot); } catch (e) { delete memory[PREFIX + slot]; } },
    validate,
  };
})();
