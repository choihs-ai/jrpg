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
          { type: 'msg', text: '[y]갈라진 껍질 속에서 무언가 반응한다… 약점이 드러난 것 같다![/]' },
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

  // ════════ 제2장 ════════
  // ── 은빛 가도 ──
  gray_wolf: {
    name: '잿빛늑대', art: 'wolf', pal: { body: '#8a8a98', dark: '#5a5a6a', light: '#b8b8c8', mane: '#4a4a58', eye: '#ffd040' },
    hp: 120, mp: 0, atk: 46, def: 18, mag: 0, spd: 20, exp: 48, gold: 30,
    elem: { fire: 1.5 }, resist: {}, drops: [{ item: 'herb', p: 0.15 }, { item: 'potion', p: 0.06 }], steal: { item: 'potion', p: 0.4 },
    actions: [{ s: 'attack', w: 5 }, { s: 'bite', w: 4 }, { s: 'howl', w: 1 }],
    desc: '가도를 떼지어 떠도는 늑대. 재빠르고, 울부짖으면 공격력이 오른다. 불을 무서워한다.',
  },
  stone_beetle: {
    name: '바위딱정벌레', art: 'beetle', pal: { shell: '#7a6a5a', dark: '#4a3e34', light: '#a89880', horn: '#c8b090', eye: '#ff8040' },
    hp: 140, mp: 0, atk: 44, def: 58, mag: 0, spd: 6, exp: 52, gold: 34,
    elem: { thunder: 2.0, ice: 1.25, fire: 0.5 }, resist: { poison: 0.5 }, drops: [{ item: 'potion', p: 0.1 }], steal: { item: 'ether', p: 0.15 },
    actions: [{ s: 'attack', w: 4 }, { s: 'horn_ram', w: 3 }, { s: 'shell_guard', w: 2 }],
    desc: '바위처럼 단단한 껍질을 가진 딱정벌레. 물리 공격은 잘 통하지 않지만 번개에 매우 약하다.',
  },
  storm_crow: {
    name: '폭풍까마귀', art: 'crow', pal: { body: '#3a4a6a', dark: '#1e2a44', light: '#7a9ad0', eye: '#ffe040' },
    hp: 90, mp: 20, atk: 40, def: 16, mag: 28, spd: 22, evade: 0.12, exp: 44, gold: 28,
    elem: { ice: 1.5, thunder: 0 }, resist: {}, drops: [{ item: 'smelling', p: 0.15 }], steal: { item: 'thunder_flask', p: 0.2 },
    actions: [{ s: 'peck', w: 4 }, { s: 'storm_cry', w: 3 }, { s: 'attack', w: 2 }],
    desc: '날개에 번개를 머금은 까마귀. 일행 전체에 번개를 떨어뜨린다. 번개는 통하지 않지만 얼음에 약하다.',
  },
  hob_goblin: {
    name: '홉고블린 강도', art: 'goblin', pal: { skin: '#6a8a4a', dark: '#3e5a2a', cloth: '#6a3a2a', blade: '#d8dce8' },
    hp: 150, mp: 0, atk: 50, def: 22, mag: 0, spd: 12, exp: 56, gold: 70,
    elem: { ice: 1.25, light: 1.25 }, resist: {}, drops: [{ item: 'potion', p: 0.15 }, { item: 'buckler', p: 0.03 }], steal: { item: 'hi_potion', p: 0.3 },
    actions: [{ s: 'attack', w: 5 }, { s: 'tackle', w: 2 }, { s: 'pilfer', w: 2 }],
    desc: '가도를 지나는 마차를 노리는 덩치 큰 고블린. 주머니를 노린다. 쓰러뜨리면 빼앗긴 돈을 되찾을 수 있다.',
  },
  choir_acolyte: {
    name: '성가대 신도', art: 'cultist', pal: { robe: '#6a6a78', dark: '#3a3a48', trim: '#a8a8b8', eye: '#c040ff', skin: '#d8c0a8' },
    hp: 110, mp: 60, atk: 30, def: 18, mag: 34, spd: 12, exp: 60, gold: 40,
    elem: { light: 1.5, dark: 0 }, resist: { poison: 0.3 }, drops: [{ item: 'ether', p: 0.08 }, { item: 'panacea', p: 0.08 }], steal: { item: 'panacea', p: 0.4 },
    actions: [{ s: 'grey_hymn', w: 4 }, { s: 'hush', w: 2 }, { s: 'choir_mend', w: 2 }, { s: 'attack', w: 2 }],
    desc: '잿빛 성가대의 말단 신도. 어둠의 찬송과 침묵을 쓰고, 동료를 치료한다. 빛에 약하다.',
  },
  // ── 미니 보스: 집행자 베인 ──
  vane: {
    name: '집행자 베인', art: 'cultist', boss: true, artScale: 1.35, pal: { robe: '#4a2a3a', dark: '#2a1420', trim: '#c4a050', eye: '#ff4060', skin: '#c8b0a0', blade: '#d8dce8', scythe: true },
    hp: 1500, mp: 999, atk: 58, def: 26, mag: 40, spd: 14, exp: 900, gold: 500,
    elem: { light: 1.5, dark: 0 }, resist: { poison: 0.5, sleep: 1, paralyze: 0.5, silence: 0.5 }, drops: [],
    desc: '잿빛 성가대의 집행자. 처형 선고를 받은 자는 다음 턴에 큰 낫에 베인다. 빛에 약하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      const acolytes = B.enemies.filter((e) => e.alive && e.defId === 'choir_acolyte').length;
      if (!acolytes && self.hp / self.maxhp < 0.6 && (m.calls || 0) < 2) { m.calls = (m.calls || 0) + 1; return { skill: 'acolyte_call' }; }
      if (m.turn % 3 === 0) { const t = B.pickTarget('party', 'weakest'); m.next = 'execution'; m.mark = t; return { skill: 'mark_doom', target: t }; }
      if (m.turn % 3 === 1 && Util.chance(0.5)) return { skill: 'dark_wave' };
      return { skill: 'attack' };
    },
  },
  // ── 현상수배: 회색갈기 ──
  greymane: {
    name: '회색갈기', art: 'wolf', boss: true, artScale: 1.6, pal: { body: '#6a6a78', dark: '#3a3a48', light: '#a0a0b0', mane: '#e8e8f0', eye: '#ff3a3a' },
    hp: 1700, mp: 0, atk: 66, def: 24, mag: 0, spd: 24, exp: 800, gold: 400,
    elem: { fire: 1.5 }, resist: { poison: 0.5, sleep: 0.7, paralyze: 0.5, silence: 1 }, drops: [{ item: 'hi_potion', p: 1 }],
    desc: '가도를 공포에 떨게 한 늑대 무리의 우두머리. 무리를 부르고, 일행 전체를 할퀸다. 불에 약하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      const pack = B.enemies.filter((e) => e.alive && e.defId === 'gray_wolf').length;
      if (!pack && (m.calls || 0) < 2 && m.turn > 1) { m.calls = (m.calls || 0) + 1; return { skill: 'pack_call' }; }
      if (m.turn % 3 === 0) return { skill: 'rend' };
      if (self.hp / self.maxhp < 0.5 && !m.howled) { m.howled = true; return { skill: 'howl' }; }
      return { skill: Util.chance(0.6) ? 'bite' : 'attack', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
    },
  },
  // ── 입단 시험: 가웨인 ──
  gawain: {
    name: '시험관 기사 가웨인', art: 'knight', boss: true, pal: { metal: '#b8bccc', dark: '#7a7e90', trim: '#d8b040', cloth: '#3f63b8', shield: '#3f63b8', blade: '#c8a070', plume: '#c4473a', eye: '#7cc4ff' },
    hp: 380, mp: 0, atk: 64, def: 24, mag: 0, spd: 12, exp: 300, gold: 0,
    elem: {}, resist: { poison: 1, sleep: 1, paralyze: 0.6, silence: 1 }, drops: [],
    desc: '수호기사단의 시험관. 목검이라지만 한 방 한 방이 무겁다. 목검 끝을 잘 보자.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n }; }
      if (m.turn % 3 === 0) { m.next = 'heavy_blow'; return { skill: 'ready_blow' }; }
      if (self.hp / self.maxhp < 0.5 && !m.stance) { m.stance = true; return { skill: 'knight_stance' }; }
      return { skill: 'attack' };
    },
  },
  // ── 왕도 지하수로 ──
  sewer_rat: {
    name: '하수구 쥐', art: 'rat', pal: { body: '#6a5a5a', dark: '#3e3232', light: '#8a7a7a', tail: '#d89a9a', eye: '#ff4040' },
    hp: 95, mp: 0, atk: 48, def: 18, mag: 0, spd: 22, exp: 40, gold: 18,
    elem: { fire: 1.25, ice: 1.25 }, resist: {}, drops: [{ item: 'antidote', p: 0.2 }], steal: { item: 'antidote', p: 0.6 },
    actions: [{ s: 'attack', w: 4 }, { s: 'plague_bite', w: 4 }],
    desc: '수로에 우글거리는 큰 쥐. 물리면 병균이 옮는다. 떼로 몰려다닌다.',
  },
  sludge: {
    name: '오물 슬라임', art: 'jelly', pal: { body: '#7a8a4a', dark: '#4a5a2a', light: '#a8b878' },
    hp: 160, mp: 0, atk: 44, def: 22, mag: 20, spd: 6, exp: 55, gold: 30,
    elem: { fire: 2.0, ice: 0.5 }, resist: { poison: 1 }, drops: [{ item: 'antidote', p: 0.2 }, { item: 'firebomb', p: 0.08 }], steal: { item: 'firebomb', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'sludge_spit', w: 4 }],
    desc: '하수가 뭉쳐 생긴 젤리. 독을 뱉는다. 불에 매우 약하고 얼음은 잘 통하지 않는다.',
  },
  drain_toad: {
    name: '수로두꺼비', art: 'toad', pal: { body: '#4a7a6a', dark: '#2a4a3e', belly: '#c8d8a8', spot: '#2a3a2a', eye: '#ffe040' },
    hp: 180, mp: 0, atk: 52, def: 26, mag: 0, spd: 10, exp: 64, gold: 36,
    elem: { ice: 1.5, fire: 0.75 }, resist: { poison: 1 }, drops: [{ item: 'smelling', p: 0.15 }], steal: { item: 'smelling', p: 0.5 },
    actions: [{ s: 'attack', w: 4 }, { s: 'tongue_lash', w: 3 }],
    desc: '수로에 사는 커다란 두꺼비. 긴 혀로 휘감아 마비시킨다. 얼음에 약하다.',
  },
  drowned: {
    name: '수로의 망령', art: 'echo', pal: { body: '#2a4a6a', dark: '#14243a', light: '#5a8ab8', eye: '#7cf0ff' },
    hp: 130, mp: 40, atk: 30, def: 20, mag: 38, spd: 12, exp: 66, gold: 30, undead: true,
    elem: { light: 2.0, dark: 0, ice: 0.5 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'ether', p: 0.08 }], steal: { item: 'panacea', p: 0.3 },
    actions: [{ s: 'dark_bolt', w: 4 }, { s: 'drown_wail', w: 2 }, { s: 'attack', w: 2 }],
    desc: '수로에 빠진 이들의 서글픈 잔향. 잠과 침묵을 부르는 통곡을 흘린다. 빛에 매우 약하다.',
  },
  // ── 보스: 늙은 이빨 ──
  old_fang: {
    name: '수로의 주인 「늙은 이빨」', art: 'croc', boss: true, pal: { body: '#4a6a3a', dark: '#2a3e22', belly: '#a8b888', ridge: '#2a3a1a', eye: '#ffd040' },
    hp: 3000, mp: 0, atk: 74, def: 30, mag: 0, spd: 10, exp: 1600, gold: 700,
    elem: { thunder: 1.5, ice: 1.25, fire: 0.75 }, resist: { poison: 0.5, sleep: 0.6, paralyze: 0.6, silence: 1 }, drops: [{ item: 'hi_potion', p: 1 }],
    desc: '수십 년 동안 왕도 지하에 살아온 거대한 악어. 물속으로 사라질 때가 가장 위험하다. 번개에 약하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      if (m.turn % 4 === 0) { m.next = 'death_roll'; m.mark = B.pickTarget('party', 'fragile'); return { skill: 'submerge' }; }
      if (m.turn % 4 === 2) return { skill: Util.chance(0.5) ? 'tail_sweep' : 'murk' };
      return { skill: Util.chance(0.6) ? 'bite' : 'attack' };
    },
  },
  // ── 시계탑 ──
  clock_soldier: {
    name: '태엽 병정', art: 'sentry', pal: { stone: '#c4a050', dark: '#8a6a2a', light: '#e8d080', eye: '#ff7040' },
    hp: 200, mp: 0, atk: 60, def: 50, mag: 0, spd: 10, exp: 80, gold: 48,
    elem: { thunder: 2.0, ice: 1.25, fire: 0.75 }, resist: { poison: 1, sleep: 1, silence: 1 }, drops: [{ item: 'ether', p: 0.08 }], steal: { item: 'thunder_flask', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'cog_shot', w: 3 }, { s: 'wind_up', w: 2 }],
    desc: '시계탑을 지키는 놋쇠 병정. 태엽을 감으면 빨라진다. 번개에 매우 약하다.',
  },
  time_wisp: {
    name: '째깍 정령', art: 'echo', pal: { body: '#c4a050', dark: '#7a5a2a', light: '#fff0a0', eye: '#ffffff' },
    hp: 140, mp: 60, atk: 30, def: 24, mag: 44, spd: 20, exp: 78, gold: 40,
    elem: { dark: 1.5, light: 0 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'ether', p: 0.1 }], steal: { item: 'ether', p: 0.3 },
    actions: [{ s: 'chrono_bolt', w: 4 }, { s: 'time_slow', w: 2 }, { s: 'attack', w: 1 }],
    desc: '멈춘 시간 속에서 태어난 정령. 빛의 화살을 쏘고 시간을 늦춘다. 어둠에 약하고 빛은 통하지 않는다.',
  },
  gear_bat: {
    name: '태엽박쥐', art: 'bat', pal: { body: '#a8803a', dark: '#6a4a1a', wing: '#d8b060', eye: '#7cf0ff' },
    hp: 120, mp: 0, atk: 54, def: 26, mag: 0, spd: 26, evade: 0.18, exp: 62, gold: 36,
    elem: { thunder: 1.75 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'smelling', p: 0.1 }], steal: { item: 'smelling', p: 0.4 },
    actions: [{ s: 'attack', w: 4 }, { s: 'cog_shot', w: 2 }],
    desc: '태엽으로 움직이는 박쥐 인형. 아주 재빠르다. 번개에 약하다.',
  },
  choir_knight: {
    name: '성가대 기사', art: 'knight', pal: { metal: '#6a6a78', dark: '#3a3a48', trim: '#a8a8b8', cloth: '#4a2a3a', shield: '#4a4a58', blade: '#d8dce8', plume: '#6a6a78', eye: '#c040ff' },
    hp: 230, mp: 0, atk: 64, def: 40, mag: 20, spd: 14, exp: 96, gold: 60,
    elem: { light: 1.5, thunder: 1.25, dark: 0 }, resist: { poison: 0.5, sleep: 0.5 }, drops: [{ item: 'hi_potion', p: 0.1 }, { item: 'silver_helm', p: 0.02 }], steal: { item: 'hi_potion', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'sword_arc', w: 3 }, { s: 'knight_stance', w: 1 }],
    desc: '잿빛 성가대에 몸담은 타락한 기사. 일행 전체를 베는 반월 베기를 쓴다. 빛에 약하다.',
  },
  // ── 보스: 제2성부 카산드라 ──
  clock_guardian: {
    name: '시계태엽 수호자', art: 'gearguard', pal: { brass: '#c4a050', dark: '#7a5a2a', light: '#f0dc90', copper: '#c8784a', eye: '#7cf0ff' },
    hp: 700, mp: 0, atk: 50, def: 46, mag: 30, spd: 8, exp: 400, gold: 0,
    elem: { thunder: 2.0, ice: 1.25, fire: 0.5 }, resist: { poison: 1, sleep: 1, paralyze: 0.5, silence: 1 }, drops: [],
    actions: [{ s: 'attack', w: 4 }, { s: 'cog_shot', w: 3 }, { s: 'wind_up', w: 1 }],
    desc: '카산드라를 지키는 태엽 거인. 살아 있는 동안 카산드라가 받는 피해를 크게 줄인다. 번개에 매우 약하다.',
  },
  cassandra: {
    name: '제2성부 카산드라', art: 'sorceress', boss: true, pal: { dress: '#4a3a6a', dark: '#2a1e44', trim: '#ffd75e', hair: '#4a5a8a', skin: '#f0d8c0', eye: '#c040ff', clock: '#e8d080' },
    hp: 2600, mp: 999, atk: 50, def: 30, mag: 46, spd: 20, exp: 2600, gold: 1200,
    elem: { ice: 1.25, thunder: 1.25, light: 0.75, dark: 0 }, resist: { poison: 0.5, sleep: 1, paralyze: 1, silence: 0.3 }, drops: [],
    desc: '잿빛 성가대의 「제2성부」. 곁을 지키는 태엽 거인이 서 있는 한 그녀의 몸에는 칼날이 잘 들어가지 않는다. 시간을 되감는 주문은… 입을 막을 수 있다면 좋을 텐데.',
    barrier: (self, B) => B.enemies.some((e) => e.alive && e.defId === 'clock_guardian'),
    phases: [{ key: 'p2', below: 0.5 }],
    onPhase(self, B, key) {
      if (key !== 'p2') return [];
      self.mem.phase = 2;
      self.mem.turn = 0;
      return [
        { type: 'shake', mag: 6 },
        { type: 'msg', text: '카산드라가 시곗바늘 지팡이로 바닥을 내리쳤다!' },
        { type: 'msg', text: '[p]"멈춰. 전부 멈춰 버려. 그날처럼."[/]' },
        { type: 'msg', text: '[y]시간의 종이 공명한다… 카산드라의 움직임이 빨라졌다![/]' },
      ];
    },
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n }; }
      if ((m.phase || 1) === 1) {
        if (m.turn % 4 === 0 && self.hp < self.maxhp * 0.9 && (m.rewinds || 0) < 3) { m.rewinds = (m.rewinds || 0) + 1; m.next = 'rewind'; return { skill: 'rewind_charge' }; }
        if (m.turn % 4 === 2) return { skill: 'shatter_hour' };
        return { skill: Util.chance(0.6) ? 'hour_hand' : 'attack', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
      }
      if (m.turn === 1) return { skill: 'stop_toll' };
      const wisps = B.enemies.filter((e) => e.alive && e.defId === 'time_wisp').length;
      if (m.turn === 2 && !wisps) return { skill: 'call_wisps' };
      const c = m.turn % 5;
      if (c === 0 && (m.rewinds || 0) < 3) { m.rewinds = (m.rewinds || 0) + 1; m.next = 'rewind'; return { skill: 'rewind_charge' }; }
      if (c === 3) return { skill: 'stop_toll' };
      if (c === 1) return { skill: 'shatter_hour' };
      return { skill: 'hour_hand', target: B.pickTarget('party', Util.chance(0.5) ? 'fragile' : 'random') };
    },
    extraActions(self) { return self.mem.phase === 2 && self.mem.turn % 2 === 1 ? 1 : 0; },
  },

  // ════════ 제3장 ════════
  // ── 붉은 협곡 · 타는 모래 사막 ──
  sand_scorpion: {
    name: '모래전갈', art: 'scorpion', pal: { body: '#c8904a', dark: '#8a5a2a', light: '#e8b878', sting: '#5a1a2a', eye: '#ff4040' },
    hp: 230, mp: 0, atk: 72, def: 40, mag: 0, spd: 14, exp: 120, gold: 60,
    elem: { ice: 1.5, fire: 0.5 }, resist: { poison: 1 }, drops: [{ item: 'antidote', p: 0.2 }, { item: 'hi_potion', p: 0.05 }], steal: { item: 'hi_potion', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'sting', w: 4 }, { s: 'pincer', w: 2 }],
    desc: '모래 속에 숨어 지나가는 것을 노리는 전갈. 독침에 찔리면 독에 걸린다. 차가운 것을 싫어한다.',
  },
  dune_worm: {
    name: '사구 지렁이', art: 'worm', pal: { body: '#b87a5a', dark: '#7a4a3a', light: '#d89a7a', sand: '#d8b878' },
    hp: 320, mp: 0, atk: 78, def: 30, mag: 0, spd: 8, exp: 150, gold: 70,
    elem: { ice: 1.5, thunder: 1.25, fire: 0.75 }, resist: { sleep: 0.5 }, drops: [{ item: 'mega_potion', p: 0.05 }], steal: { item: 'potion', p: 0.5 },
    actions: [{ s: 'attack', w: 3 }, { s: 'burrow_bite', w: 4 }, { s: 'sand_spray', w: 2 }],
    desc: '모래 언덕 아래를 헤엄치는 거대한 지렁이. 모래를 뿜어 시야를 가린다.',
  },
  cactus_man: {
    name: '가시선인장', art: 'cactus', pal: { body: '#5a9a4a', dark: '#3a6a2a', light: '#7aba6a', spine: '#f0e8c0', flower: '#ff6b8a', sand: '#d8b878' },
    hp: 200, mp: 0, atk: 64, def: 36, mag: 30, spd: 12, exp: 110, gold: 50,
    elem: { fire: 2.0, ice: 0.75 }, resist: { poison: 0.5 }, drops: [{ item: 'hi_ether', p: 0.04 }], steal: { item: 'hi_ether', p: 0.12 },
    actions: [{ s: 'attack', w: 4 }, { s: 'needle_rain', w: 3 }],
    desc: '사막을 걸어 다니는 선인장. 온몸의 가시를 일행 전체에 쏘아 댄다. 불을 보면 질색한다.',
  },
  desert_hawk: {
    name: '사막매', art: 'crow', pal: { body: '#a87a4a', dark: '#6a4a2a', light: '#e8c890', eye: '#ffe040' },
    hp: 170, mp: 0, atk: 70, def: 26, mag: 0, spd: 30, evade: 0.15, exp: 105, gold: 50,
    elem: { thunder: 1.5, ice: 1.25 }, resist: {}, drops: [{ item: 'feather', p: 0.04 }], steal: { item: 'feather', p: 0.15 },
    actions: [{ s: 'attack', w: 4 }, { s: 'dive', w: 3 }, { s: 'peck', w: 2 }],
    desc: '모래 위를 낮게 나는 사나운 매. 아주 빠르고 피하기를 잘한다.',
  },
  sand_raider: {
    name: '모래 약탈자', art: 'bandit', pal: { skin: '#c88a5a', cloth: '#8a3a2a', pants: '#4a3a2a', sash: '#d8b040', wrap: '#e8dcc0', blade: '#d8dce8' },
    hp: 260, mp: 0, atk: 74, def: 32, mag: 0, spd: 20, exp: 130, gold: 140,
    elem: { light: 1.25 }, resist: {}, drops: [{ item: 'mega_potion', p: 0.06 }, { item: 'turban', p: 0.03 }], steal: { item: 'sand_bomb', p: 0.35 },
    actions: [{ s: 'attack', w: 5 }, { s: 'plunder', w: 3 }, { s: 'tackle', w: 2 }],
    desc: '대상 행렬을 노리는 사막의 도적. 주머니를 노린다. 쓰러뜨리면 빼앗긴 돈을 되찾을 수 있다.',
  },
  heat_lizard: {
    name: '열기도마뱀', art: 'lizard', pal: { body: '#d8a040', dark: '#9a6a2a', light: '#f0c870', flame: '#ff7020' },
    hp: 240, mp: 0, atk: 70, def: 34, mag: 40, spd: 14, exp: 125, gold: 60,
    elem: { ice: 2.0, fire: 0 }, resist: {}, drops: [{ item: 'firebomb', p: 0.15 }], steal: { item: 'sand_bomb', p: 0.2 },
    actions: [{ s: 'attack', w: 4 }, { s: 'heat_wave', w: 3 }],
    desc: '모래 열기를 머금은 도마뱀. 일행 전체에 열풍을 일으킨다.',
  },
  // ── 전갈 굴의 주인 ──
  scorpion_queen: {
    name: '모래전갈 여왕', art: 'scorpion', boss: true, artScale: 1.9, pal: { body: '#8a4a6a', dark: '#5a2a44', light: '#c87aa0', sting: '#ffd040', eye: '#ff3a3a', crown: '#ffd75e' },
    hp: 3600, mp: 0, atk: 84, def: 42, mag: 30, spd: 16, exp: 2600, gold: 1200,
    elem: { ice: 1.5, fire: 0.5 }, resist: { poison: 1, sleep: 0.7, paralyze: 0.5, silence: 1 }, drops: [{ item: 'mega_potion', p: 1 }],
    desc: '오래된 우물 동굴을 차지한 전갈들의 여왕. 모래 속으로 사라질 때가 가장 위험하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      if (self.hp / self.maxhp < 0.6 && !m.brood) { m.brood = true; return { skill: 'brood_call' }; }
      if (m.turn % 4 === 0) { m.next = 'queen_strike'; m.mark = B.pickTarget('party', 'fragile'); return { skill: 'dig_in' }; }
      if (m.turn % 4 === 2) return { skill: 'tail_lash' };
      return { skill: Util.chance(0.55) ? 'sting' : 'pincer', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
    },
  },
  // ── 모래시계 사원 ──
  mummy: {
    name: '사원의 미라', art: 'mummy', pal: { wrap: '#e0d4b0', dark: '#a89870', loose: '#c8bc98', eye: '#7cf0ff' },
    hp: 300, mp: 30, atk: 76, def: 34, mag: 34, spd: 10, exp: 150, gold: 70, undead: true,
    elem: { fire: 2.0, light: 1.5, dark: 0 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'panacea', p: 0.12 }], steal: { item: 'panacea', p: 0.4 },
    actions: [{ s: 'attack', w: 4 }, { s: 'wrap', w: 3 }, { s: 'curse_word', w: 2 }],
    desc: '사원을 지키다 잠든 신관의 미라. 붕대로 휘감아 마비시키고 저주를 중얼거린다.',
  },
  temple_guardian: {
    name: '사암 수호상', art: 'sentry', pal: { stone: '#c8a070', dark: '#8a6a40', light: '#e8c898', eye: '#ffd040' },
    hp: 360, mp: 0, atk: 80, def: 70, mag: 36, spd: 8, exp: 170, gold: 80,
    elem: { thunder: 1.5, ice: 1.25, fire: 0.5 }, resist: { poison: 1, sleep: 1, silence: 1 }, drops: [{ item: 'hi_ether', p: 0.05 }], steal: { item: 'hi_ether', p: 0.15 },
    actions: [{ s: 'attack', w: 3 }, { s: 'stone_beam', w: 3 }, { s: 'stone_fist', w: 2 }, { s: 'guard_stance', w: 1 }],
    desc: '사암을 깎아 만든 사원의 수호상. 매우 단단하고, 눈에서 빛줄기를 쏜다.',
  },
  sand_spirit: {
    name: '모래 정령', art: 'echo', pal: { body: '#d8b070', dark: '#9a7040', light: '#f8e0a0', eye: '#ff8a40' },
    hp: 220, mp: 40, atk: 40, def: 30, mag: 50, spd: 22, exp: 140, gold: 60,
    elem: { ice: 1.5, light: 0.5, dark: 1.25 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'hi_ether', p: 0.05 }], steal: { item: 'sand_bomb', p: 0.3 },
    actions: [{ s: 'heat_wave', w: 3 }, { s: 'sand_spray', w: 2 }, { s: 'attack', w: 2 }],
    desc: '사막의 모래가 뭉쳐 생긴 정령. 열풍과 모래로 일행을 괴롭힌다.',
  },
  cursed_chest: {
    name: '황금 탐욕상자', art: 'mimic', pal: { wood: '#c8a040', dark: '#8a6a20', gold: '#fff0a0', mouth: '#5a1020', tongue: '#e05a7a' },
    hp: 420, mp: 30, atk: 86, def: 40, mag: 40, spd: 18, exp: 300, gold: 400,
    elem: { light: 1.25, ice: 1.25 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'hi_ether', p: 1 }],
    actions: [{ s: 'gnaw', w: 5 }, { s: 'attack', w: 3 }, { s: 'curse_word', w: 2 }],
    desc: '황금으로 치장한 탐욕상자. 사원의 보물 사이에 숨어 있다.',
  },
  // ── 베인 (재전) ──
  vane2: {
    name: '집행자 베인', art: 'cultist', boss: true, artScale: 1.35, pal: { robe: '#3a1420', dark: '#1a0a10', trim: '#d8b040', eye: '#ff2040', skin: '#c8b0a0', blade: '#ff8a8a', scythe: true },
    hp: 3800, mp: 999, atk: 92, def: 36, mag: 56, spd: 18, exp: 2400, gold: 900,
    elem: { light: 1.5, dark: 0 }, resist: { poison: 0.5, sleep: 1, paralyze: 0.5, silence: 0.5 }, drops: [],
    desc: '잿빛 성가대의 집행자. 왕도에서의 패배 이후 낫이 붉게 물들었다. 처형 선고는 여전하다.',
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next && m.aimRound !== B.round) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      if (m.next) return { skill: 'attack', target: B.pickTarget('party', 'random') };
      if (m.turn % 3 === 0) { const t = B.pickTarget('party', 'weakest'); m.next = 'execution'; m.aimRound = B.round; m.mark = t; return { skill: 'mark_doom', target: t }; }
      if (m.turn % 3 === 2) return { skill: Util.chance(0.5) ? 'blood_scythe' : 'dark_wave' };
      return { skill: 'attack', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
    },
    extraActions(self) { return self.hp / self.maxhp < 0.4 && self.mem.turn % 2 === 0 ? 1 : 0; },
  },
  // ── 보스: 제3성부 자히르 ──
  zahir: {
    name: '제3성부 자히르', art: 'prophet', boss: true, pal: { robe: '#e8dcc0', dark: '#a89870', trim: '#d8b040', sash: '#3a6ab0', cloth: '#f4f0e0', skin: '#a8704a', beard: '#2a2a2a', eye: '#40c0ff', glass: '#c8e8f8', sand: '#e8c070' },
    hp: 4200, mp: 999, atk: 60, def: 36, mag: 64, spd: 22, exp: 4000, gold: 2000,
    elem: { ice: 1.25, thunder: 1.25, fire: 0.5, light: 0.75 }, resist: { poison: 0.5, sleep: 1, paralyze: 0.7, silence: 0.3 }, drops: [],
    desc: '오아시스 사미라의 물의 사제였던 남자. 지금은 잿빛 성가대의 「제3성부」. 아지랑이처럼 모습을 흐린다. 진짜를 꿰뚫어 볼 눈이 있다면…',
    phases: [{ key: 'p2', below: 0.5 }],
    onPhase(self, B, key) {
      if (key !== 'p2') return [];
      self.mem.phase = 2;
      self.mem.turn = 0;
      const ev = [
        { type: 'shake', mag: 6 },
        { type: 'msg', text: '자히르가 지팡이 끝의 모래시계를 높이 들었다!' },
        { type: 'msg', text: '[p]"모래가 다 떨어지기 전에… 바다를 돌려받겠다!"[/]' },
      ];
      const mio = B.party.find((a) => a.id === 'mio' && a.alive);
      if (mio) {
        for (const a of B.alivePartyList) a.buffs.regen = { mult: 1.08, turns: 99 };
        ev.push({ type: 'msg', text: '…그때, 종 안쪽에서 노랫소리가 흘러나왔다. 미오의 목소리와 똑같은, 그러나 조금 더 낮은 목소리.' });
        ev.push({ type: 'buff', target: mio, up: true });
        ev.push({ type: 'msg', text: '[g]일행이 따뜻한 노랫소리에 감싸였다! (생명의 물결)[/]' });
      }
      return ev;
    },
    ai(self, B) {
      const m = self.mem;
      m.turn = (m.turn || 0) + 1;
      if (m.next && m.aimRound !== B.round) { const n = m.next; m.next = null; return { skill: n }; }
      if (m.next) return { skill: 'dune_spear', target: B.pickTarget('party', 'random') };
      const mirages = B.enemies.filter((e) => e.alive && e.def.mirage).length;
      if ((m.phase || 1) === 1) {
        if (m.turn === 1 || (!mirages && m.turn % 4 === 0)) return { skill: 'mirage' };
        if (m.turn % 4 === 2) return { skill: 'sandstorm' };
        return { skill: 'dune_spear', target: B.pickTarget('party', Util.chance(0.4) ? 'fragile' : 'random') };
      }
      if (m.turn === 1) return { skill: 'spirit_call' };
      if (m.turn % 4 === 0) { m.next = 'falling_sand'; m.aimRound = B.round; return { skill: 'hourglass_flip' }; }
      if (!mirages && m.turn % 4 === 2) return { skill: 'mirage' };
      if (m.turn % 4 === 3) return { skill: 'sandstorm' };
      return { skill: 'dune_spear', target: B.pickTarget('party', Util.chance(0.5) ? 'fragile' : 'random') };
    },
    extraActions(self) { return self.mem.phase === 2 && self.mem.turn % 3 === 1 ? 1 : 0; },
  },
  zahir_mirage: {
    name: '제3성부 자히르', art: 'prophet', boss: true, mirage: true, knownAs: 'zahir', pal: { robe: '#e8dcc0', dark: '#a89870', trim: '#d8b040', sash: '#3a6ab0', cloth: '#f4f0e0', skin: '#a8704a', beard: '#2a2a2a', eye: '#40c0ff', glass: '#c8e8f8', sand: '#e8c070' },
    hp: 4400, mp: 0, atk: 20, def: 36, mag: 10, spd: 22, exp: 0, gold: 0,
    elem: { ice: 1.25, thunder: 1.25, fire: 0.5, light: 0.75 }, resist: { poison: 1, sleep: 1, paralyze: 1, silence: 1 }, drops: [],
    desc: '…',
    actions: [{ s: 'idle_shimmer', w: 3 }, { s: 'mirage_spear', w: 2 }],
  },

  // ════════ 제4장: 북쪽 바다 ════════
  frost_gull: {
    name: '서리갈매기', art: 'crow', pal: { body: '#e8eef6', dark: '#8a9ab4', light: '#ffffff', eye: '#ffb040' },
    hp: 360, mp: 0, atk: 116, def: 40, mag: 42, spd: 32, exp: 160, gold: 70,
    elem: { thunder: 1.5, ice: 0.5 }, resist: {}, drops: [{ item: 'warm_soup', p: 0.1 }], steal: { item: 'warm_soup', p: 0.4 },
    actions: [{ s: 'gull_dive', w: 3 }, { s: 'attack', w: 3 }],
    desc: '눈보라 속을 나는 갈매기. 하늘에서 내리꽂힌다. 번개에 약하다.',
  },
  ice_crab: {
    name: '얼음게', art: 'crab', pal: { body: '#5a8ab8', dark: '#2a4a78', light: '#a8d0f0', claw: '#7aaad8', eye: '#ffe040', frost: true },
    hp: 510, mp: 0, atk: 118, def: 82, mag: 42, spd: 10, exp: 190, gold: 90,
    elem: { fire: 1.5, thunder: 1.5, ice: 0 }, resist: { poison: 0.5 }, drops: [{ item: 'hi_potion', p: 0.1 }], steal: { item: 'warm_soup', p: 0.3 },
    actions: [{ s: 'pinch', w: 4 }, { s: 'shell_up', w: 1 }, { s: 'attack', w: 2 }],
    desc: '얼음처럼 단단한 등딱지를 가진 게. 껍데기를 굳히면 거의 상처가 나지 않는다. 불과 번개에 약하다.',
  },
  snow_wolf: {
    name: '설원늑대', art: 'wolf', pal: { body: '#e0e6f0', dark: '#9aa8c0', light: '#ffffff', mane: '#b8c4d8', eye: '#5ab4ff' },
    hp: 450, mp: 0, atk: 124, def: 46, mag: 32, spd: 26, exp: 180, gold: 80,
    elem: { fire: 1.5, ice: 0 }, resist: { freeze: 1 }, drops: [{ item: 'hi_potion', p: 0.08 }], steal: { item: 'hi_potion', p: 0.3 },
    actions: [{ s: 'snow_bite', w: 3 }, { s: 'attack', w: 3 }],
    desc: '하얀 털의 늑대. 서리 낀 이빨에 물리면 얼어붙는다. 불에 약하다.',
  },
  brine_jelly: {
    name: '소금물젤리', art: 'jelly', pal: { body: '#5ab4d8', dark: '#2a7aa8', light: '#c8f0ff' },
    hp: 390, mp: 40, atk: 102, def: 44, mag: 66, spd: 14, exp: 160, gold: 60,
    elem: { thunder: 1.5, ice: 0.5, fire: 0.75 }, resist: { poison: 1 }, drops: [{ item: 'hi_ether', p: 0.06 }], steal: { item: 'ether', p: 0.4 },
    actions: [{ s: 'ice_shard', w: 3 }, { s: 'attack', w: 2 }],
    desc: '짠 바닷물이 뭉친 젤리. 얼음 파편을 쏜다. 번개에 약하다.',
  },
  ice_bat: {
    name: '얼음박쥐', art: 'bat', pal: { body: '#5a8ab8', dark: '#2a4a78', wing: '#a8d0f0', eye: '#ffffff' },
    hp: 340, mp: 0, atk: 114, def: 38, mag: 42, spd: 36, exp: 150, gold: 60,
    elem: { fire: 1.5, thunder: 1.25, ice: 0 }, resist: { freeze: 1 }, drops: [{ item: 'warm_soup', p: 0.1 }], steal: { item: 'warm_soup', p: 0.3 },
    actions: [{ s: 'snow_bite', w: 3 }, { s: 'attack', w: 3 }],
    desc: '얼음 동굴 천장에 매달려 사는 박쥐. 재빠르다.',
  },
  frost_golem: {
    name: '서리 골렘', art: 'sentry', pal: { stone: '#a8d8f0', dark: '#4a88a8', light: '#e0f6ff', eye: '#ffffff' },
    hp: 720, mp: 0, atk: 126, def: 92, mag: 52, spd: 8, exp: 240, gold: 110,
    elem: { fire: 2.0, ice: 0, thunder: 0.75 }, resist: { poison: 1, sleep: 1, freeze: 1, silence: 1 }, drops: [{ item: 'hi_ether', p: 0.06 }], steal: { item: 'hi_ether', p: 0.15 },
    actions: [{ s: 'attack', w: 3 }, { s: 'stone_fist', w: 3 }, { s: 'ice_armor', w: 1 }],
    desc: '얼음 덩어리에 혼이 깃든 골렘. 무척 단단하지만 불에 녹는다.',
  },
  frost_wisp: {
    name: '서리 도깨비불', art: 'echo', pal: { body: '#a8d8f0', dark: '#4a88a8', light: '#ffffff', eye: '#5ab4ff' },
    hp: 360, mp: 60, atk: 82, def: 40, mag: 72, spd: 22, exp: 170, gold: 70,
    elem: { fire: 1.5, light: 1.25, ice: 0 }, resist: { poison: 1, freeze: 1 }, drops: [{ item: 'hi_ether', p: 0.08 }], steal: { item: 'ether', p: 0.4 },
    actions: [{ s: 'ice_shard', w: 3 }, { s: 'frost_breath', w: 1 }, { s: 'attack', w: 1 }],
    desc: '동굴의 냉기가 모여 생긴 도깨비불. 숨결에 닿으면 얼어붙는다.',
  },
  choir_elite: {
    name: '성가대 정예기사', art: 'knight', pal: { metal: '#5a5a68', dark: '#2a2a38', trim: '#8a8a98', cloth: '#3a1a2a', shield: '#3a3a48', blade: '#c8ccd8', plume: '#5a5a68', eye: '#c040ff' },
    hp: 780, mp: 0, atk: 122, def: 60, mag: 40, spd: 18, exp: 300, gold: 140,
    elem: { light: 1.5, thunder: 1.25, dark: 0 }, resist: { poison: 0.5, sleep: 0.5 }, drops: [{ item: 'hi_potion', p: 0.2 }], steal: { item: 'mega_potion', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'sword_arc', w: 3 }, { s: 'knight_stance', w: 1 }],
    desc: '오스릭 직속의 정예 기사. 일행 전체를 베는 반월 베기를 쓴다.',
  },
  grey_wisp: {
    name: '잿빛 불꽃', art: 'echo', boss: true, artScale: 1.5, pal: { body: '#8a8a98', dark: '#4a4a58', light: '#d8d8e0', eye: '#c040ff' },
    hp: 1700, mp: 999, atk: 60, def: 46, mag: 66, spd: 20, exp: 900, gold: 400,
    elem: { ice: 1.5, light: 1.25, fire: 0, dark: 0 }, resist: { poison: 1, sleep: 1, paralyze: 1, freeze: 0.5 }, drops: [],
    desc: '유령선을 부르는 잿빛 신호 불꽃. 차갑게 타오른다. 불로는 꺼지지 않는다.',
    ai(self, B) {
      const m = self.mem; m.turn = (m.turn || 0) + 1;
      return { skill: m.turn % 2 === 0 ? 'lantern_wail' : 'grey_flame' };
    },
  },
  drowned_sailor: {
    name: '물에 빠진 선원', art: 'skeleton', pal: { bone: '#c8dcd8', dark: '#6a8a88', eye: '#5ae0b0', rust: '#3a5a6a' },
    hp: 540, mp: 0, atk: 124, def: 50, mag: 42, spd: 16, exp: 200, gold: 90, undead: true,
    elem: { light: 1.5, fire: 1.25, dark: 0, ice: 0.5 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'panacea', p: 0.12 }], steal: { item: 'panacea', p: 0.4 },
    actions: [{ s: 'attack', w: 4 }, { s: 'drowned_grab', w: 2 }],
    desc: '15년 전 폭풍에 가라앉은 선원. 아직도 배를 지키고 있다. 붙잡히면 꼼짝할 수 없다.',
  },
  ghost_lantern: {
    name: '유령 등불', art: 'echo', pal: { body: '#5ae0b0', dark: '#2a8a6a', light: '#c8fff0', eye: '#ffe040' },
    hp: 390, mp: 60, atk: 82, def: 40, mag: 74, spd: 20, exp: 190, gold: 80,
    elem: { light: 2.0, dark: 0 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'hi_ether', p: 0.08 }], steal: { item: 'ether', p: 0.4 },
    actions: [{ s: 'lantern_wail', w: 3 }, { s: 'attack', w: 2 }],
    desc: '유령선의 돛대에 매달린 등불. 곡소리로 주문을 막는다. 빛에 약하다.',
  },
  barnacle_chest: {
    name: '따개비 탐욕상자', art: 'mimic', pal: { wood: '#5a6a6a', dark: '#2a3a3a', gold: '#c8d8d0', mouth: '#1a3a3a', tongue: '#5ae0b0' },
    hp: 840, mp: 30, atk: 132, def: 60, mag: 52, spd: 18, exp: 420, gold: 500,
    elem: { thunder: 1.25, light: 1.25 }, resist: { poison: 1, sleep: 0.5 }, drops: [{ item: 'elixir', p: 1 }],
    actions: [{ s: 'gnaw', w: 5 }, { s: 'attack', w: 3 }, { s: 'curse_word', w: 2 }],
    desc: '따개비가 잔뜩 붙은 탐욕상자. 유령선의 보물 사이에 숨어 있다.',
  },
  deep_jelly: {
    name: '심해 해파리', art: 'jelly', pal: { body: '#a87ad8', dark: '#6a3aa8', light: '#e8c8ff' },
    hp: 480, mp: 50, atk: 102, def: 46, mag: 76, spd: 16, exp: 210, gold: 90,
    elem: { thunder: 1.5, fire: 0.75 }, resist: { poison: 1 }, drops: [{ item: 'hi_ether', p: 0.08 }], steal: { item: 'hi_ether', p: 0.3 },
    actions: [{ s: 'ink_spray', w: 2 }, { s: 'ice_shard', w: 2 }, { s: 'attack', w: 2 }],
    desc: '깊은 바다를 떠도는 해파리. 먹물로 눈을 가린다. 번개에 약하다.',
  },
  angler: {
    name: '등불아귀', art: 'angler', pal: { body: '#3a4a6a', dark: '#1a2440', light: '#5a6a8a', eye: '#ffe040', lure: '#a8ffe0' },
    hp: 630, mp: 30, atk: 130, def: 54, mag: 62, spd: 14, exp: 250, gold: 110,
    elem: { thunder: 1.5, light: 1.25 }, resist: { sleep: 1 }, drops: [{ item: 'mega_potion', p: 0.1 }], steal: { item: 'mega_potion', p: 0.3 },
    actions: [{ s: 'gnaw', w: 3 }, { s: 'lure_light', w: 2 }, { s: 'attack', w: 2 }],
    desc: '머리 위 불빛으로 먹이를 잠재운 뒤 통째로 삼킨다.',
  },
  drowned_knight: {
    name: '가라앉은 기사', art: 'knight', pal: { metal: '#3a6878', dark: '#1a3a48', trim: '#5ae0b0', cloth: '#1a3a3a', shield: '#2a5a6a', blade: '#a8d8d0', plume: '#2a8a6a', eye: '#5ae0b0' },
    hp: 780, mp: 0, atk: 132, def: 72, mag: 42, spd: 14, exp: 280, gold: 120, undead: true,
    elem: { light: 1.5, thunder: 1.25, dark: 0 }, resist: { poison: 1, sleep: 1 }, drops: [{ item: 'mega_potion', p: 0.12 }], steal: { item: 'mega_potion', p: 0.3 },
    actions: [{ s: 'attack', w: 4 }, { s: 'sword_arc', w: 2 }, { s: 'knight_stance', w: 1 }],
    desc: '가라앉은 신전을 지키던 옛 기사. 몸이 산호로 뒤덮였다.',
  },
  // ── 현상수배: 집게왕 ──
  king_crab: {
    name: '집게왕', art: 'crab', boss: true, artScale: 1.8, pal: { body: '#c4473a', dark: '#7a2a24', light: '#f08070', claw: '#e05a4a', eye: '#ffe040', crown: '#ffd75e' },
    hp: 3800, mp: 0, atk: 128, def: 96, mag: 52, spd: 12, exp: 2600, gold: 1500,
    elem: { thunder: 1.5, ice: 0.5 }, resist: { poison: 0.5, sleep: 0.7, paralyze: 0.5 }, drops: [{ item: 'elixir', p: 1 }],
    desc: '해안의 바위를 집게 한 번에 부순다는 거대한 게. 껍데기를 굳히고 있을 때는 무엇도 통하지 않는다.',
    ai(self, B) {
      const m = self.mem; m.turn = (m.turn || 0) + 1;
      if (m.turn % 4 === 1 && !self.buffs.def) return { skill: 'shell_up' };
      if (self.hp / self.maxhp < 0.5 && !m.called) { m.called = true; return { skill: 'crab_call' }; }
      return { skill: Util.chance(0.6) ? 'pinch' : 'tentacle_lash', target: B.pickTarget('party', 'random') };
    },
  },
  // ── 보스: 서리엄니 ──
  frost_walrus: {
    name: '서리엄니', art: 'walrus', boss: true, artScale: 1.2, pal: { body: '#8a7a6a', dark: '#5a4a3a', light: '#b8a898', muzzle: '#d8c8b0', tusk: '#f8f0e0', eye: '#5ab4ff', ice: '#c8ecff' },
    hp: 4900, mp: 0, atk: 134, def: 52, mag: 64, spd: 14, exp: 3200, gold: 1500,
    elem: { fire: 1.5, thunder: 1.25, ice: 0 }, resist: { poison: 0.5, sleep: 0.7, paralyze: 0.5, freeze: 1 }, drops: [{ item: 'warm_charm', p: 1 }],
    desc: '해식 동굴의 얼음을 다스리는 거대한 바다코끼리. 얼음 갑옷을 두르면 단단해지지만, 불에는 약하다.',
    ai(self, B) {
      const m = self.mem; m.turn = (m.turn || 0) + 1;
      // 예고한 공격은 다음 라운드에 (같은 라운드 2회 행동으로 몰아치지 않는다)
      if (m.next && m.aimRound !== B.round) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      if (m.next) return { skill: 'snow_bite', target: B.pickTarget('party', 'random') };
      if (m.turn % 4 === 0) { m.next = 'tusk_crush'; m.aimRound = B.round; m.mark = B.pickTarget('party', 'fragile'); return { skill: 'tusk_aim', target: m.mark }; }
      if (m.turn % 4 === 2) return { skill: 'frost_breath' };
      if (m.turn % 5 === 3 && !self.buffs.def) return { skill: 'ice_armor' };
      return { skill: Util.chance(0.5) ? 'snow_bite' : 'attack', target: B.pickTarget('party', 'random') };
    },
    extraActions(self) { return self.hp / self.maxhp < 0.4 && self.mem.turn % 2 === 0 ? 1 : 0; },
  },
  // ── 보스: 제4성부 오르카 ──
  orca: {
    name: '제4성부 오르카', art: 'captain', boss: true, artScale: 1.15, pal: { coat: '#2a3a5a', dark: '#141e34', shirt: '#d8d4c8', trim: '#d8b040', pants: '#2a2a38', boots: '#1a1424', skin: '#a8b8b0', beard: '#6a7a78', eye: '#5ae0b0', hat: '#1a2440', anchor: '#5a6a6a', blade: '#a8b0b8', ghost: true },
    hp: 5600, mp: 999, atk: 138, def: 52, mag: 76, spd: 20, exp: 4800, gold: 2400,
    elem: { thunder: 1.25, light: 1.25, dark: 0 }, resist: { poison: 0.5, sleep: 1, paralyze: 0.5, silence: 0.5, freeze: 1 }, drops: [],
    desc: '15년 전 폭풍에 선원 전원을 잃은 해군 함장. 지금은 잿빛 성가대의 「제4성부」. 밀물과 썰물이 그를 지킨다.',
    ai(self, B) {
      const m = self.mem; m.turn = (m.turn || 0) + 1;
      if (m.next && m.aimRound !== B.round) { const n = m.next; m.next = null; return { skill: n, target: m.mark }; }
      if (m.next) return { skill: 'saber_slash', target: B.pickTarget('party', 'random') };
      // 물때가 바뀐다: 밀물(칼날을 흘려보냄) ↔ 썰물(주문을 흩뜨림)
      if (m.turn % 3 === 1) {
        m.high = !m.high;
        m.guard = m.high ? { phys: 0.5, tag: '밀물', color: '#5ab4ff', text: '밀물이 칼날을 흘려보냈다' } : { mag: 0.5, tag: '썰물', color: '#e8c070', text: '썰물의 소용돌이가 주문을 흩뜨렸다' };
        return { skill: m.high ? 'high_tide' : 'low_tide' };
      }
      if (self.hp / self.maxhp < 0.6 && !m.crew1) { m.crew1 = true; return { skill: 'crew_call' }; }
      if (self.hp / self.maxhp < 0.3 && !m.crew2) { m.crew2 = true; return { skill: 'crew_call' }; }
      if (m.turn % 3 === 2) { m.next = 'anchor_crash'; m.aimRound = B.round; m.mark = B.pickTarget('party', 'fragile'); return { skill: 'anchor_aim', target: m.mark }; }
      return { skill: Util.chance(0.5) ? 'cold_command' : 'saber_slash', target: B.pickTarget('party', 'random') };
    },
    extraActions(self) { return self.hp / self.maxhp < 0.5 && self.mem.turn % 2 === 0 ? 1 : 0; },
  },
  // ── 보스: 심해의 수호자 레비아 ──
  levia: {
    name: '심해의 수호자 레비아', art: 'kraken', boss: true, pal: { body: '#5a3a7a', dark: '#2a1a44', light: '#8a6ab0', spot: '#c8a8e8', eye: '#ffe040', flame: true },
    hp: 7000, mp: 999, atk: 134, def: 54, mag: 80, spd: 16, exp: 6400, gold: 3000,
    elem: { thunder: 1.5, ice: 0.5, fire: 0.75, dark: 0.5 }, resist: { poison: 0.5, sleep: 1, paralyze: 0.7, silence: 0.5, freeze: 1 }, drops: [],
    desc: '파도 종을 지키던 심해의 수호자. 잿빛 불꽃에 물들어 날뛰고 있다. 촉수가 많을수록 파도가 높아진다.',
    phases: [{ key: 'p2', below: 0.5 }],
    onPhase(self, B, key) {
      if (key !== 'p2') return [];
      self.mem.phase = 2;
      const ev = [{ type: 'shake', mag: 6 }, { type: 'msg', text: '레비아가 몸을 뒤틀며 깊은 바닷속의 노래를 부르기 시작했다…' }];
      const cas = B.party.find((a) => a.id === 'cassandra' && a.alive);
      if (cas) {
        for (const a of B.alivePartyList) a.buffs.def = { mult: 1.3, turns: 4 };
        ev.push({ type: 'msg', text: '[g]카산드라가 그 노래 위로 자신의 노래를 겹쳐 불렀다! 일행의 방어력이 올랐다![/]' });
      }
      return ev;
    },
    ai(self, B) {
      const m = self.mem; m.turn = (m.turn || 0) + 1;
      const tentacles = B.enemies.filter((e) => e.alive && e.defId === 'levia_tentacle').length;
      // 해일: 터지는 순간 살아 있는 촉수가 있으면 대해일
      if (m.next === 'wave' && m.aimRound !== B.round) { m.next = null; return { skill: ['tidal_wave', 'great_wave', 'raging_wave'][Math.min(2, tentacles)] }; }
      if (m.next === 'wave') return { skill: 'ice_shard', target: B.pickTarget('party', 'random') };
      if (tentacles < 2 && m.turn % 4 === 2 && m.turn > 2) return { skill: 'regrow' };
      if (m.turn % 4 === 0) { m.next = 'wave'; m.aimRound = B.round; return { skill: 'wave_rise' }; }
      if ((m.phase || 1) === 2 && m.turn % 4 === 1) return { skill: 'abyss_song' };
      return { skill: Util.chance(0.5) ? 'ice_shard' : 'attack', target: B.pickTarget('party', 'random') };
    },
    extraActions(self) { return self.mem.phase === 2 && self.mem.turn % 3 === 0 ? 1 : 0; },
  },
  levia_tentacle: {
    name: '레비아의 촉수', art: 'tentacle', pal: { body: '#6a4a8a', dark: '#3a2a54', sucker: '#e8c8ff' },
    hp: 560, mp: 0, atk: 124, def: 46, mag: 40, spd: 18, exp: 0, gold: 0,
    elem: { thunder: 1.5, fire: 1.25, ice: 0.5 }, resist: { poison: 0.5, sleep: 0.5, freeze: 0.5 }, drops: [],
    desc: '레비아의 촉수. 사람을 휘감아 놓아주지 않는다. 쓰러뜨리면 붙잡힌 동료가 풀려난다.',
    ai(self, B) {
      const holding = B.party.some((a) => a.alive && a.status.bind && a.bindBy === self.uid);
      if (!holding && Util.chance(0.5)) return { skill: 'tentacle_grab', target: B.pickTarget('party', 'random') };
      return { skill: Util.chance(0.3) ? 'tentacle_lash' : 'tentacle_strike', target: B.pickTarget('party', 'random') };
    },
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
  highway: {
    bg: 'plains', rate: [14, 24],
    groups: [
      { w: 7, e: ['gray_wolf', 'gray_wolf'] }, { w: 5, e: ['stone_beetle'] }, { w: 5, e: ['storm_crow', 'storm_crow'] },
      { w: 5, e: ['hob_goblin'] }, { w: 4, e: ['gray_wolf', 'storm_crow'] }, { w: 4, e: ['stone_beetle', 'gray_wolf'] },
      { w: 3, e: ['gray_wolf', 'gray_wolf', 'gray_wolf'] }, { w: 3, e: ['hob_goblin', 'storm_crow'] }, { w: 1, e: ['glimmer_jelly'] },
    ],
  },
  highway_wood: {
    bg: 'forest', rate: [12, 20],
    groups: [
      { w: 7, e: ['gray_wolf', 'gray_wolf'] }, { w: 5, e: ['gray_wolf', 'gray_wolf', 'gray_wolf'] }, { w: 4, e: ['hob_goblin', 'gray_wolf'] },
      { w: 4, e: ['stone_beetle', 'stone_beetle'] }, { w: 3, e: ['choir_acolyte', 'gray_wolf'] },
    ],
  },
  sewer: {
    bg: 'sewer', rate: [12, 20],
    groups: [
      { w: 7, e: ['sewer_rat', 'sewer_rat', 'sewer_rat'] }, { w: 6, e: ['sludge'] }, { w: 5, e: ['drain_toad'] },
      { w: 5, e: ['sludge', 'sewer_rat'] }, { w: 4, e: ['drowned', 'sewer_rat'] }, { w: 4, e: ['drain_toad', 'sludge'] },
      { w: 3, e: ['drowned', 'drowned'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  tower: {
    bg: 'tower', rate: [12, 20],
    groups: [
      { w: 6, e: ['clock_soldier'] }, { w: 6, e: ['time_wisp', 'gear_bat'] }, { w: 5, e: ['gear_bat', 'gear_bat', 'gear_bat'] },
      { w: 5, e: ['choir_knight'] }, { w: 4, e: ['clock_soldier', 'time_wisp'] }, { w: 4, e: ['choir_knight', 'choir_acolyte'] },
      { w: 3, e: ['clock_soldier', 'clock_soldier'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  canyon: {
    bg: 'canyon', rate: [14, 22],
    groups: [
      { w: 7, e: ['sand_scorpion', 'sand_scorpion'] }, { w: 6, e: ['desert_hawk', 'desert_hawk'] }, { w: 5, e: ['sand_raider'] },
      { w: 5, e: ['cactus_man', 'sand_scorpion'] }, { w: 4, e: ['sand_raider', 'desert_hawk'] }, { w: 3, e: ['sand_scorpion', 'sand_scorpion', 'desert_hawk'] },
      { w: 1, e: ['glimmer_jelly'] },
    ],
  },
  desert: {
    bg: 'desert', rate: [14, 22],
    groups: [
      { w: 7, e: ['dune_worm'] }, { w: 6, e: ['cactus_man', 'cactus_man'] }, { w: 6, e: ['heat_lizard', 'sand_scorpion'] },
      { w: 5, e: ['sand_raider', 'sand_raider'] }, { w: 4, e: ['desert_hawk', 'heat_lizard'] }, { w: 4, e: ['dune_worm', 'cactus_man'] },
      { w: 3, e: ['heat_lizard', 'heat_lizard', 'desert_hawk'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  sandcave: {
    bg: 'sandcave', rate: [12, 20],
    groups: [
      { w: 7, e: ['sand_scorpion', 'sand_scorpion', 'sand_scorpion'] }, { w: 6, e: ['dune_worm', 'sand_scorpion'] }, { w: 5, e: ['heat_lizard', 'heat_lizard'] },
      { w: 4, e: ['dune_worm', 'dune_worm'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  temple: {
    bg: 'temple', rate: [12, 20],
    groups: [
      { w: 6, e: ['mummy', 'mummy'] }, { w: 6, e: ['temple_guardian'] }, { w: 5, e: ['sand_spirit', 'mummy'] },
      { w: 5, e: ['choir_knight', 'choir_acolyte'] }, { w: 4, e: ['temple_guardian', 'sand_spirit'] }, { w: 3, e: ['mummy', 'mummy', 'sand_spirit'] },
      { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  coast: {
    bg: 'snowfield', rate: [14, 22],
    groups: [
      { w: 7, e: ['frost_gull', 'frost_gull'] }, { w: 6, e: ['snow_wolf', 'snow_wolf'] }, { w: 6, e: ['ice_crab'] },
      { w: 5, e: ['brine_jelly', 'frost_gull'] }, { w: 4, e: ['snow_wolf', 'ice_crab'] }, { w: 3, e: ['frost_gull', 'frost_gull', 'brine_jelly'] },
      { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  icecave: {
    bg: 'icecave', rate: [12, 20],
    groups: [
      { w: 7, e: ['ice_bat', 'ice_bat', 'ice_bat'] }, { w: 6, e: ['frost_golem'] }, { w: 6, e: ['frost_wisp', 'ice_bat'] },
      { w: 5, e: ['ice_crab', 'frost_wisp'] }, { w: 3, e: ['frost_golem', 'frost_wisp'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  ship: {
    bg: 'ship', rate: [12, 20],
    groups: [
      { w: 7, e: ['drowned_sailor', 'drowned_sailor'] }, { w: 6, e: ['ghost_lantern', 'drowned_sailor'] }, { w: 5, e: ['ghost_lantern', 'ghost_lantern'] },
      { w: 4, e: ['drowned_sailor', 'drowned_sailor', 'ghost_lantern'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  sunken: {
    bg: 'sunken', rate: [12, 20],
    groups: [
      { w: 7, e: ['deep_jelly', 'deep_jelly'] }, { w: 6, e: ['angler'] }, { w: 6, e: ['drowned_knight'] },
      { w: 5, e: ['angler', 'deep_jelly'] }, { w: 3, e: ['drowned_knight', 'deep_jelly'] }, { w: 1, e: ['glimmer_jelly', 'glimmer_jelly'] },
    ],
  },
  cellar: {
    bg: 'cave', rate: [10, 18],
    groups: [{ w: 5, e: ['toxic_shroom'] }, { w: 4, e: ['toxic_shroom', 'toxic_shroom'] }, { w: 3, e: ['moss_jelly', 'toxic_shroom'] }],
  },
};
