'use strict';
// ─────────────────────────────────────────────────────────────
// Util: 난수, 수학 보조, 한국어 조사 처리, 텍스트 치환
// ─────────────────────────────────────────────────────────────
const Util = (() => {
  // 시드 고정이 가능한 난수 (mulberry32) — 테스트에서 재현성을 위해 사용
  let seed = (Date.now() ^ 0x9e3779b9) >>> 0;
  function rand() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const setSeed = (s) => { seed = s >>> 0; };
  const randInt = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const randRange = (a, b) => a + rand() * (b - a);
  const chance = (p) => rand() < p;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function weighted(list, key = 'w') {
    let total = 0;
    for (const e of list) total += e[key] || 0;
    if (total <= 0) return list[0];
    let r = rand() * total;
    for (const e of list) { r -= e[key] || 0; if (r < 0) return e; }
    return list[list.length - 1];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 결정적 해시 (타일 변형 선택 등)
  function hash2(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // ── 한국어 조사 ──
  const DIGIT = { '0': [1, 0], '1': [1, 1], '2': [0, 0], '3': [1, 0], '4': [0, 0], '5': [0, 0], '6': [1, 0], '7': [1, 1], '8': [1, 1], '9': [0, 0] };
  function finalInfo(word) {
    const s = String(word).replace(/[\s)\]」』'"!?.]+$/u, '');
    if (!s) return { has: false, rieul: false };
    const ch = s[s.length - 1];
    const c = ch.charCodeAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) {
      const j = (c - 0xac00) % 28;
      return { has: j !== 0, rieul: j === 8 };
    }
    if (DIGIT[ch]) return { has: !!DIGIT[ch][0], rieul: !!DIGIT[ch][1] };
    if (/[lmnr]$/i.test(ch)) return { has: true, rieul: /[lr]$/i.test(ch) };
    return { has: false, rieul: false };
  }
  function josa(word, type) {
    const { has, rieul } = finalInfo(word);
    switch (type) {
      case '이': case '가': return has ? '이' : '가';
      case '을': case '를': return has ? '을' : '를';
      case '은': case '는': return has ? '은' : '는';
      case '과': case '와': return has ? '과' : '와';
      case '으로': case '로': return has && !rieul ? '으로' : '로';
      case '아': case '야': return has ? '아' : '야';
      case '이여': case '여': return has ? '이여' : '여';
      case '이랑': case '랑': return has ? '이랑' : '랑';
      case '이에요': case '예요': return has ? '이에요' : '예요';
      case '이야': return has ? '이야' : '야';
      case '이라고': case '라고': return has ? '이라고' : '라고';
      default: return type;
    }
  }
  // word + 조사
  const j = (word, type) => word + josa(word, type);

  // 텍스트 치환: {H} → 주인공 이름, {H|이} → 이름+조사, {키|을} 등
  function fill(text, vars) {
    if (text == null) return '';
    return String(text).replace(/\{([A-Za-z_][\w]*)(?:\|([^}]+))?\}/g, (m, key, jo) => {
      let v = vars && key in vars ? vars[key] : undefined;
      if (v === undefined && typeof Game !== 'undefined' && key === 'H') v = Game.heroName();
      if (v === undefined) return m;
      return jo ? v + josa(v, jo) : String(v);
    });
  }

  function fmtTime(sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const deepCopy = (o) => JSON.parse(JSON.stringify(o));

  return {
    rand, setSeed, randInt, randRange, chance, pick, clamp, lerp, weighted, shuffle, hash2,
    josa, j, fill, fmtTime, sleep, deepCopy,
  };
})();

// 진행 중인 스크립트를 중단하기 위한 신호 (게임오버, 타이틀 복귀 등)
class AbortSignalError extends Error {
  constructor(reason) { super('abort:' + reason); this.reason = reason; }
}
