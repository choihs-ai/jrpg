'use strict';
// ─────────────────────────────────────────────────────────────
// 몬스터 데이터
//  elem: 속성 배율 (1.5 약점 / 0.5 내성 / 0 무효), resist: 상태이상 저항(1=완전 면역)
//  actions: 일반 AI 가중치 목록, ai: 보스 전용 행동 함수
// ─────────────────────────────────────────────────────────────
const MONSTERS = {
  // ── 초록바람 평원 (남쪽) ──
  moss_jelly: {
    name: '이끼 젤리', art: 'jelly', pal: { body: '#6cc04a', dark: '#3f8a35', light: '#a8e878' },
    hp: 10, mp: 0, atk: 7, def: 3, mag: 2, spd: 4, exp: 3, gold: 3,
    elem: { fire: 1.5, ice: 1 }, resist: {}, drops: [{ item: 'herb', p: 0.08 }], steal: { item: 'herb', p: 0.5 },
    actions: [{ s: 'attack', w: 7 }, { s: 'tackle', w: 3 }],
    desc: '초원의 이끼가 뭉쳐 생긴 말랑한 마물. 불에 약하다. 밟으면 신발이 초록색이 된다.',
  },
  horn_rabbit: {
    name: '뿔토끼', art: 'rabbit', pal: { body: '#e8dcc8', dark: '#b0a088', light: '#ffffff', horn: '#ffd75e' },
    hp: 13, mp: 0, atk: 9, def: 3, mag: 0, spd: 11, evade: 0.05, exp: 4, gold: 4,
    elem: {}, resist: {}, drops: [{ item: 'herb', p: 0.06 }], steal: { item: 'herb', p: 0.4 },
    actions: [{ s: 'attack', w: 6 }, { s: 'tackle', w: 2 }],
    desc: '이마에 뿔이 난 토끼. 재빠르게 먼저 공격해 온다. 약점은 딱히 없다.',
  },
  toxic_shroom: {
    name: '독갓', art: 'shroom', pal: { cap: '#9a4ab8', dark: '#6a2a88', spot: '#f0d8ff', stem: '#f2e0c0' },
    hp: 18, mp: 0, atk: 8, def: 5, mag: 6, spd: 3, exp: 5, gold: 6,
    elem: { fire: 1.5 }, resist: { poison: 1 }, drops: [{ item: 'antidote', p: 0.15 }], steal: { item: 'antidote', p: 0.6 },
    actions: [{ s: 'attack', w: 6 }, { s: 'spore', w: 3 }],
    desc: '독포자를 뿌리는 보라색 버섯. 독에 걸리면 해독초나 「정화」로 치료하자. 불에 약하다.',
  },
  screech_crow: {
    name: '비명까마귀', art: 'crow', pal: { body: '#2a2a3a', dark: '#14141e', light: '#4a4a62', eye: '#ff4040' },
    hp: 14, mp: 0, atk: 9, def: 3, mag: 0, spd: 13, evade: 0.12, exp: 5, gold: 5,
    elem: { thunder: 1.5 }, resist: {}, drops: [], steal: { item: 'herb', p: 0.3 },
    actions: [{ s: 'attack', w: 6 }, { s: 'peck', w: 3 }],
    desc: '날카롭게 우는 까마귀. 피하기를 잘하고, 쪼기로 방어력을 떨어뜨린다. 번개에 약하다.',
  },
  thorn_boar: {
    name: '가시멧돼지', art: 'boar', pal: { body: '#8a5a3a', dark: '#5e3a22', light: '#b4825a', tusk: '#f4f0e0', thorn: '#4a7a3a' },
    hp: 30, mp: 0, atk: 15, def: 7, mag: 0, spd: 6, exp: 8, gold: 9,
    elem: { ice: 1.5 }, resist: {}, drops: [{ item: 'herb', p: 0.12 }], steal: { item: 'herb', p: 0.5 },
    actions: [{ s: 'attack', w: 6 }, { s: 'tackle', w: 4 }],
    desc: '등에 가시덩굴이 자란 멧돼지. 밭을 망치는 골칫거리. 얼음에 약하다.',
  },
  // ── 강 북쪽 숲 ──
  vine_creeper: {
    name: '덩굴손', art: 'vine', pal: { body: '#3a8a3a', dark: '#1e5a24', light: '#6ac85a', flower: '#ff6b8a' },
    hp: 44, mp: 0, atk: 20, def: 8, mag: 5, spd: 5, exp: 12, gold: 10,
    elem: { fire: 2.0, ice: 0.5 }, resist: {}, drops: [{ item: 'antidote', p: 0.1 }, { item: 'smelling', p: 0.08 }], steal: { item: 'smelling', p: 0.4 },
    actions: [{ s: 'attack', w: 5 }, { s: 'bind', w: 3 }],
    desc: '꽃 모양 입을 가진 덩굴. 휘감아 마비시킨다. 불에 매우 약하고 얼음에는 강하다.',
  },
  goblin_scout: {
    name: '고블린 척후병', art: 'goblin', pal: { skin: '#6aa84a', dark: '#3a6a2a', cloth: '#7a4a2a', blade: '#c8ccd8' },
    hp: 36, mp: 0, atk: 21, def: 7, mag: 0, spd: 11, exp: 11, gold: 18,
    elem: {}, resist: {}, drops: [{ item: 'herb', p: 0.15 }, { item: 'hunting_knife', p: 0.02 }], steal: { item: 'return_wing', p: 0.35 },
    actions: [{ s: 'attack', w: 6 }, { s: 'pilfer', w: 2 }],
    desc: '숲을 정찰하는 고블린. 틈만 나면 금화를 훔쳐 달아난다. 빨리 쓰러뜨리자.',
  },
  drowsy_bloom: {
    name: '졸음꽃', art: 'bloom', pal: { petal: '#ff9ac8', dark: '#c8608a', center: '#ffe066', stem: '#4a9a3a' },
    hp: 26, mp: 0, atk: 12, def: 5, mag: 10, spd: 7, exp: 9, gold: 8,
    elem: { fire: 1.5 }, resist: { sleep: 1 }, drops: [{ item: 'smelling', p: 0.15 }], steal: { item: 'smelling', p: 0.5 },
    actions: [{ s: 'attack', w: 3 }, { s: 'sleep_powder', w: 3 }],
    desc: '향기로 잠을 부르는 꽃. 잠든 동료는 공격받거나 「정신 드는 향」으로 깨울 수 있다.',
  },
  // ── 미니 보스: 철엄니 ──
  ironfang: {
    name: '철엄니', art: 'ironboar', boss: true, pal: { body: '#5e3a2a', dark: '#3a2218', light: '#8a5a3a', tusk: '#c8ccd8', thorn: '#2e5a24', eye: '#ff3a3a' },
    hp: 400, mp: 0, atk: 29, def: 10, mag: 5, spd: 7, exp: 120, gold: 150,
    elem: { ice: 1.5 }, resist: { poison: 0.5, sleep: 0.7, paralyze: 1, silence: 1 }, drops: [{ item: 'potion', p: 1 }],
    desc: '북쪽 고개를 지키는 거대한 멧돼지 두목. 땅을 긁으면 다음 턴에 무시무시한 돌진이 온다. 얼음에 약하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n, target: m.markTarget }; }
      if (self.hp / self.maxhp <= 0.55 && !m.roared) { m.roared = true; return { skill: 'roar' }; }
      if (self.hp / self.maxhp <= 0.3 && !m.raged) { m.raged = true; return { skill: 'rage' }; }
      const cycle = m.turn % 3;
      if (cycle === 0) {
        // 가장 약한(방어가 낮은) 동료를 노린다
        const t = B.pickTarget('party', 'fragile');
        m.next = 'rampage'; m.markTarget = t;
        return { skill: 'paw', target: t };
      }
      return { skill: Util.chance(0.6) ? 'tusk' : 'attack' };
    },
  },
  // ── 잠든 종의 유적 ──
  skeleton: {
    name: '해골 병사', art: 'skeleton', pal: { bone: '#e8e4d8', dark: '#a8a090', eye: '#ff6040', rust: '#8a6a4a' },
    hp: 78, mp: 0, atk: 36, def: 14, mag: 0, spd: 8, exp: 20, gold: 18, undead: true,
    elem: { light: 2.0, dark: 0, fire: 1.0 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'herb', p: 0.15 }, { item: 'leather_shield', p: 0.03 }], steal: { item: 'antidote', p: 0.4 },
    actions: [{ s: 'attack', w: 6 }, { s: 'bone_slash', w: 3 }],
    desc: '옛 유적의 경비병이 죽어서도 자리를 지키는 모습. 빛에 매우 약하다. 독과 잠은 통하지 않는다.',
  },
  vampire_bat: {
    name: '흡혈박쥐', art: 'bat', pal: { body: '#5a3a7a', dark: '#2e1a44', wing: '#7a5aa0', eye: '#ffe040' },
    hp: 46, mp: 0, atk: 30, def: 9, mag: 0, spd: 16, evade: 0.2, exp: 16, gold: 12,
    elem: { thunder: 1.5, light: 1.25 }, resist: {}, drops: [{ item: 'herb', p: 0.1 }], steal: { item: 'smelling', p: 0.4 },
    actions: [{ s: 'attack', w: 4 }, { s: 'drain_bite', w: 4 }],
    desc: '피를 빨아 자신의 체력을 회복하는 박쥐. 회피율이 높다. 번개에 약하다.',
  },
  ruin_sentry: {
    name: '유적 파수인형', art: 'sentry', pal: { stone: '#8a8aa0', dark: '#5a5a70', light: '#b0b0c8', eye: '#7cc4ff' },
    hp: 105, mp: 0, atk: 36, def: 32, mag: 8, spd: 5, exp: 28, gold: 24,
    elem: { thunder: 2.0, ice: 1.25, fire: 0.5 }, resist: { poison: 1, sleep: 1, silence: 1 }, drops: [{ item: 'ether', p: 0.06 }], steal: { item: 'ether', p: 0.15 },
    actions: [{ s: 'attack', w: 4 }, { s: 'stone_fist', w: 3 }, { s: 'guard_stance', w: 2 }],
    desc: '돌로 만든 고대의 경비 인형. 물리 공격에 매우 단단하지만 번개에 약하다.',
  },
  shadow_echo: {
    name: '그림자 잔향', art: 'echo', pal: { body: '#4a2a6a', dark: '#24123a', light: '#8a5ab8', eye: '#ff70e0' },
    hp: 55, mp: 30, atk: 14, def: 10, mag: 22, spd: 10, exp: 22, gold: 16,
    elem: { light: 2.0, dark: 0 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'ether', p: 0.05 }, { item: 'panacea', p: 0.06 }], steal: { item: 'panacea', p: 0.3 },
    actions: [{ s: 'dark_bolt', w: 5 }, { s: 'whisper', w: 2 }, { s: 'attack', w: 2 }],
    desc: '검은 수정에서 흘러나온 어둠의 메아리. 어둠의 주문과 침묵을 쓴다. 빛에 매우 약하다.',
  },
  ember_lizard: {
    name: '불씨도마뱀', art: 'lizard', pal: { body: '#c4502a', dark: '#8a2a1a', light: '#ff8a4a', flame: '#ffd060' },
    hp: 70, mp: 0, atk: 32, def: 13, mag: 18, spd: 9, exp: 22, gold: 20,
    elem: { ice: 2.0, fire: 0 }, resist: {}, drops: [{ item: 'firebomb', p: 0.12 }], steal: { item: 'firebomb', p: 0.4 },
    actions: [{ s: 'attack', w: 5 }, { s: 'fire_breath', w: 3 }],
    desc: '꼬리에 불씨를 단 도마뱀. 일행 전체에 불꽃 숨결을 내뿜는다. 얼음에 매우 약하다.',
  },
  greed_chest: {
    name: '탐욕상자', art: 'mimic', pal: { wood: '#8a5a2c', dark: '#5e3818', gold: '#f2c84b', mouth: '#5a1020', tongue: '#e05a7a' },
    hp: 180, mp: 20, atk: 44, def: 18, mag: 20, spd: 12, exp: 90, gold: 120,
    elem: { light: 1.25, ice: 1.25 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'ether', p: 1 }],
    actions: [{ s: 'gnaw', w: 5 }, { s: 'attack', w: 3 }, { s: 'dark_bolt', w: 2 }],
    desc: '보물상자로 위장한 마물. 덥석 무는 공격이 아프다. 수상한 상자는 조심!',
  },
  glimmer_jelly: {
    name: '반짝젤리', art: 'jelly', pal: { body: '#c8d0e0', dark: '#8a92a8', light: '#ffffff' }, shiny: true,
    hp: 8, mp: 0, atk: 10, def: 250, mag: 0, spd: 30, evade: 0.1, exp: 350, gold: 30,
    elem: { fire: 0, ice: 0, thunder: 0, light: 0, dark: 0 }, resist: { poison: 1, sleep: 1, paralyze: 0.5, silence: 1 }, drops: [{ item: 'starwater', p: 0.25 }],
    actions: [{ s: 'attack', w: 2 }, { s: 'flee', w: 5 }],
    desc: '은빛으로 빛나는 희귀한 젤리. 엄청나게 단단하고 금방 도망친다. 회심의 일격만이 통한다는 소문.',
  },
  // ── 우물 아래 ──
  king_mush: {
    name: '버섯왕 머쉬', art: 'kingmush', boss: true, pal: { cap: '#c43a5a', dark: '#8c2440', spot: '#fff4e0', stem: '#f2e0c0', crown: '#ffd75e' },
    hp: 150, mp: 30, atk: 19, def: 8, mag: 12, spd: 6, exp: 70, gold: 60,
    elem: { fire: 1.5 }, resist: { poison: 1, sleep: 0.5, paralyze: 0.5, silence: 0.5 }, drops: [],
    desc: '우물 밑 지하 왕국(?)의 자칭 국왕. 체력이 줄면 버섯 수프를 마신다. 불에 약하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (self.hp / self.maxhp < 0.4 && (m.soups || 0) < 2 && Util.chance(0.6)) { m.soups = (m.soups || 0) + 1; return { skill: 'mush_soup' }; }
      if (m.turn % 3 === 2) return { skill: 'royal_decree' };
      return { skill: Util.chance(0.35) ? 'spore' : 'attack' };
    },
  },
  // ── 보스: 벨가르 ──
  velgar: {
    name: '타락한 종지기 벨가르', art: 'golem', boss: true, big: true, pal: { stone: '#7a7690', dark: '#4a465c', light: '#a8a4c0', crystal: '#2a0a3a', glow: '#c040ff', bell: '#c4a050' },
    hp: 900, mp: 99, atk: 48, def: 28, mag: 30, spd: 9, exp: 900, gold: 600,
    elem: { thunder: 1.25, fire: 0.75, ice: 1.0, light: 1.0, dark: 0 }, resist: { poison: 1, sleep: 1, paralyze: 1, silence: 1 }, drops: [],
    desc: '고대에 종을 지키던 돌의 파수꾼. 가슴에 박힌 검은 수정에 정신을 빼앗겼다. 종을 울리기 전에는 몸을 지켜라.',
    phases: [{ key: 'p2', below: 0.5 }],
    onPhase(self, B, key) {
      if (key === 'p2') {
        self.elem = Object.assign({}, self.elem, { light: 2.0, thunder: 1.5 });
        self.defMod = 0.75;
        self.mem.phase = 2;
        self.mem.turn = 0;
        return [
          { type: 'shake', mag: 6 },
          { type: 'msg', text: '벨가르의 가슴을 덮고 있던 돌껍질이 갈라졌다!' },
          { type: 'msg', text: '[p]검은 수정[/]이 드러나 섬뜩하게 맥동한다…!' },
          { type: 'msg', text: '[y]약점이 드러났다! 빛과 번개가 잘 통할 것 같다![/]' },
        ];
      }
      return [];
    },
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n }; }
      if ((m.phase || 1) === 1) {
        // 1단계: 철퇴 → 철퇴/수호 → 종 울릴 준비 → (공명파)
        const c = m.turn % 4;
        if (c === 3) { m.next = 'resonance'; return { skill: 'toll_charge' }; }
        if (c === 2 && self.buffTurns('def') <= 0 && Util.chance(0.5)) return { skill: 'stone_guard' };
        return { skill: Util.chance(0.75) ? 'crush' : 'attack', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
      }
      // 2단계
      const echoes = B.enemies.filter((e) => e.alive && e.defId === 'shadow_echo');
      if (m.turn === 1) return { skill: 'summon_echo' };
      if (echoes.length && self.hp / self.maxhp < 0.35 && !m.absorbed) { m.absorbed = true; return { skill: 'absorb_echo' }; }
      if (!echoes.length && m.turn % 5 === 0) return { skill: 'summon_echo' };
      const c = m.turn % 4;
      if (c === 0) { m.next = 'resonance'; return { skill: 'toll_charge' }; }
      if (c === 2) return { skill: 'dark_pulse' };
      return { skill: 'crush', target: B.pickTarget('party', Util.chance(0.5) ? 'fragile' : 'random') };
    },
    // 2단계에서는 한 턴에 두 번 행동하는 경우가 있다
    extraActions(self) { return (self.mem.phase === 2 && self.mem.turn % 3 === 2) ? 1 : 0; },
  },
};
for (const id in MONSTERS) MONSTERS[id].id = id;

// ── 인카운터 테이블 ──
const ENCOUNTERS = {
  plains: {
    bg: 'plains', rate: [14, 26],
    groups: [
      { w: 10, e: ['moss_jelly'] }, { w: 8, e: ['moss_jelly', 'moss_jelly'] }, { w: 7, e: ['horn_rabbit'] },
      { w: 6, e: ['horn_rabbit', 'moss_jelly'] }, { w: 6, e: ['toxic_shroom'] }, { w: 5, e: ['screech_crow', 'moss_jelly'] },
      { w: 4, e: ['thorn_boar'] }, { w: 3, e: ['moss_jelly', 'moss_jelly', 'moss_jelly'] }, { w: 3, e: ['toxic_shroom', 'horn_rabbit'] },
      { w: 3, e: ['screech_crow', 'screech_crow'] },
    ],
  },
  forest: {
    bg: 'forest', rate: [12, 22],
    groups: [
      { w: 6, e: ['thorn_boar', 'thorn_boar'] }, { w: 6, e: ['vine_creeper'] }, { w: 6, e: ['goblin_scout'] },
      { w: 5, e: ['drowsy_bloom', 'thorn_boar'] }, { w: 4, e: ['goblin_scout', 'screech_crow'] }, { w: 4, e: ['vine_creeper', 'drowsy_bloom'] },
      { w: 3, e: ['goblin_scout', 'goblin_scout'] }, { w: 3, e: ['toxic_shroom', 'toxic_shroom', 'drowsy_bloom'] }, { w: 3, e: ['thorn_boar', 'vine_creeper'] },
    ],
  },
  pass: {
    bg: 'forest', rate: [12, 20],
    groups: [
      { w: 6, e: ['thorn_boar', 'thorn_boar'] }, { w: 5, e: ['thorn_boar', 'thorn_boar', 'thorn_boar'] }, { w: 5, e: ['goblin_scout', 'thorn_boar'] },
      { w: 4, e: ['vine_creeper', 'goblin_scout'] }, { w: 3, e: ['drowsy_bloom', 'drowsy_bloom'] },
    ],
  },
  ruins1: {
    bg: 'ruins', rate: [12, 22],
    groups: [
      { w: 7, e: ['skeleton'] }, { w: 6, e: ['vampire_bat', 'vampire_bat'] }, { w: 5, e: ['skeleton', 'vampire_bat'] },
      { w: 5, e: ['ruin_sentry'] }, { w: 4, e: ['shadow_echo', 'vampire_bat'] }, { w: 3, e: ['skeleton', 'skeleton'] },
      { w: 3, e: ['vampire_bat', 'vampire_bat', 'vampire_bat'] }, { w: 1, e: ['glimmer_jelly'] },
    ],
  },
  ruins2: {
    bg: 'ruins', rate: [12, 20],
    groups: [
      { w: 6, e: ['ember_lizard'] }, { w: 5, e: ['skeleton', 'shadow_echo'] }, { w: 5, e: ['ruin_sentry', 'vampire_bat'] },
      { w: 4, e: ['ember_lizard', 'skeleton'] }, { w: 4, e: ['shadow_echo', 'shadow_echo'] }, { w: 3, e: ['ruin_sentry', 'ruin_sentry'] },
      { w: 3, e: ['skeleton', 'skeleton', 'vampire_bat'] }, { w: 2, e: ['ember_lizard', 'ember_lizard'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  cellar: {
    bg: 'cave', rate: [10, 18],
    groups: [{ w: 5, e: ['toxic_shroom'] }, { w: 4, e: ['toxic_shroom', 'toxic_shroom'] }, { w: 3, e: ['moss_jelly', 'toxic_shroom'] }],
  },
};
