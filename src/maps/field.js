'use strict';
// ─────────────────────────────────────────────────────────────
// 초록바람 평원 (필드) + 사냥꾼의 오두막
// ─────────────────────────────────────────────────────────────
defMap('field', {
  name: '초록바람 평원', kind: 'field', bgm: 'field', base: '.',
  tiles: [
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 0
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 1
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^...,...^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 2
      '^^^^^^^^^^^^^^^^^^^^^^^^^^,...,,.,,.,^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 3
      '^^^^^^^^^^^^^^^^^^^^^^^^^.,.,P.,.P..,.^^^^^^^^^^^^^^^^^^^^^^^^^^', // 4
      '^^^^^^^^^^^^^^^^^^^^^^^^^..,...U...,..^^^^^^^^^^^^^^^^^^^^^^^^^^', // 5
      '^^^^^^^^^^^^^^^^^^^^^^^^^...,..:...,..^^^^^^^^^^^^^^^^^^^^^^^^^^', // 6
      '^^^^^^^^^^^^^^^^^^^^^^^^^^...^.:.^...^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 7
      '^^^^^^^^^^^....^.^^^^^^^^^^^.^.:.^,^^^^^^^^^^^^...^,"^^^^^^^^^^^', // 8
      '^.^^^^^^..^,........^^^^^^^^^^...^^^^^^^^^^^.^..,......^^^^^^^.^', // 9
      '^....^......".......^^^^^^^^^^...^^^^^^^^^^........,.......,^..^', // 10
      '^...................^^^^^^^^^^...^^^^^^^^^^T..T.T...TT..TT.T.T.^', // 11
      'T,T..T.T.T...TT.TT.,........^^r.r^^...T,..T,TT....TT"TTT.....T.T', // 12
      'TTT...TTTTYY.TT.T.Y"....,...^^...^^.."T.T.TT.T..,TT.....,TT..T.T', // 13
      'T.YYT.YTY..T.T,YTY....,...".^^...^^....TT..,.....T..TT..T..TT..T', // 14
      'TY.T.YT.TYYY.TTTT.T......"..^^...^^..,..T.T.TT.TTTT..TT..TTT.T.T', // 15
      'TY..TYYT..TT..YT.Y..".......^^...^^...T..,,..T...TT,T.TTT..T.T.T', // 16
      'TT"YT.T.,TT.TT.T.Y,...,.,...^r...r^.,.T.TT....T".,.T..T....TT..T', // 17
      'TYTTTTTTT.YYY..YTTT.......,..,":..,,....,.T...,..T"..T.T.T.."T.T', // 18
      'TTT..T..T..YYYTT..T.."..,...,.S:..~~~~....T.".T...TTTTTT.TTT.T.T', // 19
      'TT...T....T..YT...Y.........~~~H~~~~~~~~~~~~.,.................T', // 20
      '~~~~....".Y..YYY.YT.....~~~~~~~H~~....~~~~~~~~~..,..,..........T', // 21
      '~~~~~~~~TY..Y....T.~~~~~~~~~...H......~.....~~~~~~"............T', // 22
      'TTT~~~~~~~~~~~~~~~~~~~~~~....,.:,........,...~.~~~H~~~.........T', // 23
      'TTTTTTTT~~~~~~~~~~~..........".:........T...TYY.,YH~~~~~~~~YY".T', // 24
      'TTTT.".."..TTTT.Y~Y".......,,..:.....,...Y........YT~.~~~~~~~~~~', // 25
      'TTTT"..".."TTT,TS.T......".....:........"YT.YY..YY.T..TY..Y~~~~~', // 26
      'TYTT.."..".ZZZZZ...,..",.....,.:........T...TT.........Y,.T~Y.YT', // 27
      'T.TT.".."..TTTTY.T.."..........:........YY..Y...........Y..."Y.T', // 28
      'TTTT"..".."TTTT.T.Y.,".........:...,....YTT.....,...,,.T......YT', // 29
      'T.TTTTTTTTTTTTY"T.T...."..,....:::::::::::::::::::K:::::::::::::', // 30
      'TTTTTTTTTTTTTT.Y..............S:............"..,......,.......YT', // 31
      'T.Y..T..TT..,TYT"TT............:.....,..T.T...,.,......T..YTY..T', // 32
      'T"YT.T.YY.T,TT...T.........."..:............YT....,....YY..TYY.T', // 33
      'T,....,................"".....,:......".TTTT,.YTT..YTT.YTTTTY.YT', // 34
      'T................,.......,....":........Y.YYTTT.YYTYYYYY..Y....T', // 35
      'T.."...."....,............,....:.S......T.Y,YTTYY.Y.YT.Y..Y,.T.T', // 36
      'T.,......"....."........,......:........,TY..YYY...TTY..T.TTY.YT', // 37
      'T.....sss.........,,.."..."....V........YTTY..YTY...YYY....TY,YT', // 38
      'T.sss~~~~~sss.",...,..................."..Y....Y.,...Y..TYY.T.TT', // 39
      'Tss~~~~~~~~~ss."........."..............Y...T,Y.Y..TT.YYYYY.rTYT', // 40
      'T~~~~~~~~~~~~~s......,..........,........,..........,.r..,r....T', // 41
      'T~~~~~ss~~~~~~ss.,........,...........,.........,......,rr.....T', // 42
      'T~~~~~ssssssssss............................,.,......,...,...r.T', // 43
      'T~~~~~~~~~~~~~ss.......,.....................,.........r".,r..,T', // 44
      'T~~~~~~~~~~~~~s..............,...........,..,..."..".....,...,.T', // 45
      'Tss~~~~~~~~~ss......................,..............,...........T', // 46
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 47
  ],
  enc: {
    default: 'plains',
    zones: [
      { x: 25, y: 33, w: 13, h: 15, enc: null },      // 마을 주변은 안전
      { x: 24, y: 1, w: 15, h: 8, enc: null },        // 유적 앞마당
      { x: 28, y: 7, w: 7, h: 12, enc: 'pass' },      // 북쪽 고개
      { x: 0, y: 0, w: 64, h: 22, enc: 'forest' },    // 강 북쪽
      { x: 44, y: 22, w: 20, h: 22, enc: 'forest' },  // 동쪽 숲
      { x: 0, y: 12, w: 19, h: 22, enc: 'forest' },   // 서쪽 숲
    ],
  },
  warps: [
    { x: 31, y: 38, to: 'rivel', tx: 19, ty: 27, dir: 'up' },
    { x: 50, y: 30, to: 'cabin', tx: 4, ty: 5, dir: 'up', sfx: 'door' },
    { x: 31, y: 5, to: 'ruins1', tx: 15, ty: 21, dir: 'up', sfx: 'stairs' },
    {
      x: 63, y: 30, to: 'highway', tx: 1, ty: 16, dir: 'right', cond: () => Game.flag('chapter1_done'),
      blocked: async () => { await S.say(null, '동쪽 가도로 이어지는 길이다. 리벨 경비대의 통제 표지판이 서 있다.\n「마물 출몰로 통행 금지 ─ 마을의 일이 정리될 때까지」'); },
    },
  ],
  triggers: [
    { x: 30, y: 15, w: 3, h: 2, when: () => !Game.flag('linette_joined'), run: () => Story.passEvent() },
  ],
  npcs: [
    {
      id: 'ironfang', x: 31, y: 12, look: 'monster:ironfang', scale: 0.32, dir: 'down', noTurn: true, show: () => !Game.flag('ironfang_defeated'),
      talk: async () => {
        S.sfx('roar');
        if (!Game.flag('linette_joined')) { await Story.passEvent(); return; }
        if (await S.yesno(null, '철엄니가 길을 막고 콧김을 뿜는다! 싸울까?')) await Story.fightIronfang();
      },
    },
    { id: 'linette_pass', x: 31, y: 14, look: 'linette', dir: 'up', noTurn: true, show: () => !Game.flag('linette_joined'), talk: async () => { await Story.passEvent(); } },
    { id: 'bau', x: 7, y: 27, look: 'critter:dog', dir: 'left', move: 'turn', show: () => Quests.isActive('s_dog') && Quests.stage('s_dog') === 0, talk: async () => { await Story.bau(); } },
  ],
  objects: [
    { type: 'sign', x: 30, y: 31, text: '↑ 북쪽 고개 · 고대 유적\n→ 동쪽 숲 · 사냥꾼의 오두막 · 은빛 가도(왕도 방면)\n↓ 리벨 마을' },
    { type: 'sign', x: 30, y: 19, text: '경고! 이 앞 북쪽 고개에 거대 멧돼지 「철엄니」 출몰.\n충분히 준비하지 않은 여행자는 돌아갈 것. ─ 리벨 경비대' },
    { type: 'sign', x: 16, y: 26, text: '서쪽 숲으로 가는 오솔길.\n「늙은 나무들 사이로 바람이 지나가는 길이 있다는데…」\n(바람에 잎이 살랑이는 나무를 향해 걸어 보자.)' },
    { type: 'sign', x: 33, y: 36, text: '↓ 리벨 마을\n「별이 노래하는 마을에 오신 것을 환영합니다」' },
    { type: 'gather', id: 'mh1', x: 22, y: 35, item: 'moonherb', msg: '은은하게 빛나는 풀을 발견했다.' },
    { type: 'gather', id: 'mh2', x: 43, y: 43, item: 'moonherb', msg: '은은하게 빛나는 풀을 발견했다.' },
    { type: 'gather', id: 'mh3', x: 13, y: 36, item: 'moonherb', msg: '은은하게 빛나는 풀을 발견했다.' },
    { type: 'gather', id: 'mh4', x: 36, y: 26, item: 'moonherb', msg: '은은하게 빛나는 풀을 발견했다.' },
    { type: 'gather', id: 'mh5', x: 52, y: 13, item: 'moonherb', msg: '은은하게 빛나는 풀을 발견했다.' },
    { type: 'chest', id: 'f_island', x: 6, y: 42, item: 'star' },
    { type: 'chest', id: 'f_grove', x: 5, y: 26, item: 'star' },
    { type: 'chest', id: 'f_grove2', x: 9, y: 29, item: 'feather' },
    { type: 'chest', id: 'f_ne', x: 57, y: 16, item: 'potion', n: 2 },
    { type: 'chest', id: 'f_se', x: 58, y: 43, gold: 120 },
    { type: 'chest', id: 'f_west', x: 3, y: 10, item: 'firebomb', n: 2 },
    { type: 'chest', id: 'f_bridge', x: 51, y: 20, item: 'smelling', n: 3 },
    { type: 'search', id: 'f_basin', x: 35, y: 3, item: 'star', hidden: true, msg: '풀숲 사이에서 무언가 반짝인다…!' },
    { type: 'search', id: 'f_lake', x: 16, y: 41, item: 'ether', hidden: true, msg: '모래 속에 작은 병이 묻혀 있다.' },
  ],
});

defMap('cabin', {
  name: '사냥꾼의 오두막', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IfwwwXxbbI', // 2
    'IwwwwwwwwI', // 3
    'IwhtthwwjI', // 4
    'IwwwwwwwpI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'field', tx: 50, ty: 31, dir: 'down' }],
  npcs: [
    {
      id: 'gordo', x: 6, y: 3, look: 'hunter', dir: 'down',
      mark: () => !Game.flag('visited_hunter') || (Quests.isActive('s_letter') && Quests.stage('s_letter') === 0) || (Quests.isActive('s_dog') && Quests.stage('s_dog') === 1),
      talk: async () => { await Story.gordo(); },
    },
    { id: 'bau_home', x: 2, y: 3, look: 'critter:dog', dir: 'right', move: 'wander', radius: 1, show: () => Game.flag('bau_found'), talk: async () => { await S.say(null, '멍! 멍멍! (바우가 꼬리를 세차게 흔든다.)'); } },
  ],
  objects: [
    { type: 'search', id: 'cb_crate', x: 5, y: 2, item: 'firebomb', msg: '상자 안에 사냥용 화염병이 들어 있다.', empty: '빈 상자다.' },
    { type: 'search', id: 'cb_barrel', x: 6, y: 2, item: 'antidote', n: 2, msg: '통 안에 해독초가 들어 있다.', empty: '빈 통이다.' },
    { type: 'search', id: 'cb_pot', x: 8, y: 4, item: 'herb', n: 2, msg: '항아리 안에 약초가 들어 있다.', empty: '빈 항아리다.' },
  ],
});
