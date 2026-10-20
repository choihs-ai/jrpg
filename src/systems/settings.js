'use strict';
// ─────────────────────────────────────────────────────────────
// Settings: 사용자 설정 (게임 진행과 별도로 저장)
// ─────────────────────────────────────────────────────────────
const Settings = (() => {
  const KEY = 'starbell-jrpg.settings';
  const DEFAULTS = { bgm: 6, sfx: 7, textSpeed: 1, battleSpeed: 1, autoRun: 1, showGoal: 1, touch: 0, padSize: 1, padPos: 0, padSens: 1 };
  const LABELS = {
    bgm: { name: '음악 볼륨', values: null, max: 10 },
    sfx: { name: '효과음 볼륨', values: null, max: 10 },
    textSpeed: { name: '메시지 속도', values: ['느림', '보통', '빠름', '즉시'] },
    battleSpeed: { name: '전투 속도', values: ['느림', '보통', '빠름'] },
    autoRun: { name: '항상 달리기', values: ['끄기', '켜기'] },
    showGoal: { name: '목표 표시', values: ['끄기', '암시', '자세히'] },
    touch: { name: '터치 버튼', values: ['자동', '항상 표시', '숨기기'] },
    padSize: { name: '터치 버튼 크기', values: ['보통', '크게', '아주 크게'] },
    padPos: { name: '터치 버튼 높이', values: ['기본', '높게', '아주 높게'] },
    padSens: { name: '방향 패드 감도', values: ['민감', '보통', '둔감'] },
  };
  let data = Object.assign({}, DEFAULTS);
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const o = JSON.parse(raw);
        for (const k in DEFAULTS) if (typeof o[k] === 'number' && isFinite(o[k])) data[k] = o[k];
      }
    } catch (e) { /* 저장소를 못 써도 기본값으로 동작 */ }
    clampAll();
  }
  function clampAll() {
    for (const k in LABELS) {
      const L = LABELS[k];
      const max = L.values ? L.values.length - 1 : L.max;
      data[k] = Util.clamp(Math.round(data[k]), 0, max);
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 무시 */ }
  }
  return {
    load, save, LABELS,
    get: (k) => data[k],
    set(k, v) { data[k] = v; clampAll(); save(); for (const l of listeners) l(k, data[k]); },
    step(k, d) {
      const L = LABELS[k];
      const max = L.values ? L.values.length - 1 : L.max;
      const nv = Util.clamp(data[k] + d, 0, max);
      if (nv === data[k]) return false;
      this.set(k, nv);
      return true;
    },
    display(k) { const L = LABELS[k]; return L.values ? L.values[data[k]] : '■'.repeat(data[k]) + '□'.repeat(L.max - data[k]); },
    onChange(fn) { listeners.push(fn); },
  };
})();
