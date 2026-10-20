'use strict';
// ─────────────────────────────────────────────────────────────
// 제2장 「왕도로 가는 길」 맵: 은빛 가도 · 역참 · 왕도 아스테리온(+실내) · 지하수로 · 시계탑
//  진행도(Game.progress): 9 출발 · 10 베인 격파 · 11 왕도 도착 · 12 학장 면담
//                         13 브란 입단 · 14 늙은 이빨 격파 · 15 카산드라 격파 · 16 2장 완료
// ─────────────────────────────────────────────────────────────

// ── 은빛 가도 (필드) ──
defMap('highway', {
  name: '은빛 가도', kind: 'field', bgm: 'field', base: '.',
  tiles: [
    '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 0
    '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', // 1
    'TTY.T.TY".T.,.....,......s~~~..T.TYY..TT.T...YT..TYTYT.T', // 2
    'TT....TT.Y...;........,...~~~.,YY.YYTY.TYTYT.....rYTY,TT', // 3
    'T.Y.YTY.YY........."....".~~~s.TTTY..YT;TTT...r...Y.TTTT', // 4
    'T.T,.....Y.,.............s~~~..TTTTTYTTYYT.........T.TTT', // 5
    'T...YTYTTY......,.........~~~,..TT..TTYT.:::.......YTYTT', // 6
    'T.TY..T.TT;........,......~~~s.TYY.TTT,TT:T.......TT.T.T', // 7
    'T.YT.Y..Y..................~~~,.TT.YT.TYT:TYTTTY.TTYT.TT', // 8
    'T,..T.Y..Y.RRRRRRR.........~~~sYY.T.YY.TY:TYYTT.TTTT.;.T', // 9
    'T,..;..,;..RRRRRRR..,.,...s~~~...T.T..TTT:TYYTTY.Y.YTTTT', // 10
    'T..........RRRRRRR.......,.~~~,YYTY.""Y.":...TT.TTTTTYYT', // 11
    'T....".....WnWDWnW........~~~..TTTY..TT.T:.TT.YY.YTTTT.T', // 12
    'T,....,...x...:...Xx......~~~s......;"...:.............T', // 13
    'T.....;.....S.:..........s~~~............:....,.."..,TTT', // 14
    'T.S.;.......,.:.........S.~~~........"...:.....""""..TTT', // 15
    '::::::::::::::::::::::::::===:::::::::::::::::::::::CTTT', // 16
    'T.."..:.................,s~~~.....""...."..,..."""S".TTT', // 17
    'T.....:..........;........~~~......".,.......;.......TTT', // 18
    'T..TT.:,T.T...TTT.T.YTT...~~~s......Y.T"Y..TT.YTYT.T.T.T', // 19
    'TTYY.,:....TT.YT.T"TY....s~~~....T....T."....Y.....T...T', // 20
    'TT...,:.T..YY.TT..T..YY.s~~~..."....;.T~~~~~~~....,.Y.TT', // 21
    'T,T...:,.Y,TYT.Y.T.TTT...~~~..Y...,..T~~~~~~~~~.....YY.T', // 22
    'TTY..,:..T...TYTTTTTY....~~~s...T..T..~~~~~~~~~Y.Y.....T', // 23
    'T...T,:,."TT....TTTTTTT.s~~~.......;Y.~~~~~~~~~.Y.Y....T', // 24
    'TTTY.....T....TT.TYTY....~~~..,.r.r...~~~~~~~~~...,...YT', // 25
    'TYT......YTTTT,..YT.T.T..s~~~....r..".~~~~~~~~~...Y,...T', // 26
    'TY.,.....T..Y.TYT.,.,.T.".~~~"Y,...,Y,..~~~~~..Y.T.Y,TTT', // 27
    'TY..YTTYYTYT..T..YYTY.Y...~~~s.,...TYY.,...........Y.".T', // 28
    'T"...".,.....;...........s~~~.Y,.....T.............Y.".T', // 29
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 30
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 31
  ],
  enc: {
    default: 'highway',
    zones: [
      { x: 0, y: 12, w: 7, h: 8, enc: null },        // 평원 쪽 입구
      { x: 9, y: 7, w: 12, h: 10, enc: null },       // 역참 주변
      { x: 46, y: 13, w: 10, h: 7, enc: null },      // 왕도 성문 앞
      { x: 30, y: 2, w: 26, h: 11, enc: 'highway_wood' },
    ],
  },
  warps: [
    { x: 0, y: 16, to: 'field', tx: 62, ty: 30, dir: 'left' },
    { x: 14, y: 12, to: 'waystation', tx: 6, ty: 8, dir: 'up', sfx: 'door' },
    { x: 52, y: 16, to: 'capital', tx: 23, ty: 38, dir: 'up', cond: () => Game.flag('vane_defeated') },
  ],
  triggers: [
    { x: 23, y: 15, w: 2, h: 3, when: () => !Game.flag('vane_defeated'), run: () => Story.vane() },
  ],
  onEnter: async () => {
    if (!Game.flag('highway_first')) {
      Game.setFlag('highway_first');
      if (!Quests.get('main3')) await Story.beginChapter2(true);
      await S.say(null, '(마을을 벗어나자, 은빛으로 빛나는 넓은 가도가 동쪽으로 뻗어 있다.)');
      await Story.line('bran', '이 길 끝이 왕도 아스테리온이야! 우와, 진짜 간다…!');
      await Story.line('linette', '걸어서 이틀 거리예요. 중간에 역참이 있으니 거기서 쉬어 가요.');
      await Story.line('mio', '…종의 노래가 동쪽에서 들려요. 그런데 이상해요. 째깍, 째깍… 시계 소리가 섞여 있어요.');
    }
  },
  npcs: [
    { id: 'vane_hw', x: 27, y: 16, look: 'vane', dir: 'left', noTurn: true, show: () => !Game.flag('vane_defeated'), talk: () => Story.vane() },
    { id: 'acolyte_hw1', x: 25, y: 15, look: 'acolyte', dir: 'left', noTurn: true, show: () => false },
    { id: 'acolyte_hw2', x: 25, y: 17, look: 'acolyte', dir: 'left', noTurn: true, show: () => false },
    {
      id: 'greymane', x: 46, y: 5, look: 'monster:greymane', scale: 0.38, dir: 'down', noTurn: true,
      show: () => Quests.isActive('s_bounty') && Quests.stage('s_bounty') === 0,
      talk: () => Story.greymane(),
    },
    {
      id: 'caravan', x: 9, y: 15, look: 'caravan', dir: 'down', move: 'turn',
      talk: async () => {
        await S.say('행상인 로베르토', byP({
          9: ['어이, 왕도로 가는 길인가? 조심하게. 은빛 다리에 잿빛 옷을 입은 놈들이 진을 치고 있어.', '「검문」이라나 뭐라나. 지나가는 사람 손등을 하나하나 들여다본다더군. 대체 뭘 찾는 건지.'],
          10: '다리가 뚫렸다고? 자네들이 그 잿빛 놈들을 쫓아냈다니! 덕분에 장사를 다시 할 수 있겠어.',
          11: '왕도는 지금 「별내림 축제」로 떠들썩하지. 별사탕 하나 사 먹어 보게. 하늘 맛이 난다니까.',
          13: '숲 쪽에 늑대 우두머리가 산다는 소문, 들었나? 현상금까지 붙었다더군.',
        }));
      },
    },
  ],
  objects: [
    { type: 'sign', x: 2, y: 15, text: '← 초록바람 평원 · 리벨 마을\n→ 역참 「쉬어 가는 말」 · 은빛 다리 · 왕도 아스테리온' },
    { type: 'sign', x: 12, y: 14, text: '역참 「쉬어 가는 말」\n「따뜻한 수프와 푹신한 침대. 여행자의 친구」' },
    { type: 'sign', x: 24, y: 15, text: '은빛 다리\n「이 다리를 건너면 왕국의 심장, 아스테리온의 땅」' },
    { type: 'sign', x: 50, y: 17, text: '왕도 아스테리온\n「별이 내리는 도시에 오신 것을 환영합니다」 ─ 별내림 축제 개최 중!' },
    { type: 'chest', id: 'hw_sw', x: 5, y: 26, item: 'hi_potion', n: 2 },
    { type: 'chest', id: 'hw_nw', x: 21, y: 4, item: 'thunder_flask', n: 2 },
    { type: 'chest', id: 'hw_den', x: 49, y: 4, item: 'buckler' },
    { type: 'chest', id: 'hw_lake', x: 48, y: 26, gold: 300 },
    { type: 'chest', id: 'hw_ne', x: 52, y: 13, item: 'ether', n: 2 },
    { type: 'search', id: 'hw_rocks', x: 33, y: 25, item: 'feather', hidden: true, msg: '바위 틈에 깃털 하나가 끼어 있다. 은은하게 빛난다…!' },
    { type: 'search', id: 'hw_bridge', x: 29, y: 18, gold: 120, hidden: true, msg: '다리 아래 모래 속에 누군가 떨어뜨린 지갑이 묻혀 있다.' },
  ],
});

// ── 역참 ──
defMap('waystation', {
  name: '역참 「쉬어 가는 말」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IfwixwpwiiwXXI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IkkkkwwkkkkkkI', // 4
    'IwwwwwwwwwwwwI', // 5
    'IwwwwwwwwwwwwI', // 6
    'IhthwwwwwwthwI', // 7
    'IwwwwwwwwwwwpI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'highway', tx: 14, ty: 13, dir: 'down' }],
  npcs: [
    {
      id: 'hector', x: 2, y: 3, look: 'capinnkeeper', dir: 'down',
      talk: async () => {
        await S.say('역참 주인 헥토르', byP({
          9: ['어서 오시오! 리벨에서 오셨다고? 그 「종이 울린 마을」 말이오?', '요즘 가도에 늑대가 부쩍 늘었소. 쉬어 가시오. 내 수프는 왕도에서도 알아준다오.'],
          10: '은빛 다리를 뚫었다고? 허허, 가도의 영웅들이시구먼!',
          11: '왕도 구경은 잘 했소? 축제 기간엔 숙박비가 세 배라 다들 여기서 묵고 들어간다오.',
        }));
        await S.inn(Math.max(10, Game.state.party.length * 6), '역참 주인 헥토르');
      },
    },
    {
      id: 'ws_merchant', x: 9, y: 3, look: 'merchant', dir: 'down',
      talk: async () => { await S.say('역참 상인', '왕도까지 가는 동안 필요한 건 여기서 사 가라고! 귀환의 날개도 있어.'); await Shop.open('waystation'); },
    },
    {
      id: 'ws_traveler', x: 11, y: 6, look: 'villagerC', dir: 'left', move: 'turn',
      talk: async () => {
        await S.say('여행자', byP({
          9: '다리의 잿빛 놈들 말이오, 「열쇠」를 찾는다더이다. 손등에 별 모양이 있는 사람을 봤냐고 묻더군.',
          10: '왕도의 시계탑, 아시오? 반년 전부터 시곗바늘이 딱 멈춰 버렸다오. 불길한 징조라고들 하지.',
          14: '시계탑이 다시 움직일 날이 올까. 그 종소리가 그립구먼.',
        }));
      },
    },
    { id: 'ws_cat', x: 4, y: 7, look: 'critter:cat', move: 'wander', radius: 2, talk: async () => { await S.say(null, '냐옹. (역참 고양이가 수프 냄새를 맡고 코를 씰룩인다.)'); } },
  ],
  objects: [
    { type: 'search', id: 'ws_barrel', x: 4, y: 2, item: 'potion', n: 2, msg: '통 안에 여행자용 상처약이 들어 있다. 「공짜로 가져가시오 ─ 헥토르」', empty: '빈 통이다.' },
    { type: 'search', id: 'ws_candy', x: 12, y: 8, item: 'star_candy', cond: () => Quests.isActive('s_candy'), msg: '화분 옆에 반짝이는 별사탕이 떨어져 있다!', empty: '화분에 작은 꽃이 피어 있다.' },
  ],
});

// ── 왕도 아스테리온 ──
defMap('capital', {
  name: '왕도 아스테리온', kind: 'town', bgm: 'capital', base: '.',
  tiles: [
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', // 0
    'B.....BNB..,..QQQQQQQQQQQQQQQQQQQQ........,....B', // 1
    'B.,.,.BBB...,.BBQQQQQQQQQQQQQQQQBB..........,..B', // 2
    'B,GGGGGGGGGGG.NBQQQQQQQQQQQQQQQQBN.RRRRRRRRRRR.B', // 3
    'B.GGGGGGGGGGG.BBQQQQQQQQQQQQQQQQBB"RRRRRRRRRRR.B', // 4
    'B,GGGGGGGGGGG.BBBNBNBNBDDBNBNBNBBB.RRRRRRRRRRR.B', // 5
    'B.GGGGGGGGGGG......MMMMMMMMMM......RRRRRRRRRRR.B', // 6
    'B.GGGGGGGGGGGTT.,..MMMMMMMMMM....TTRRRRRRRRRRR.B', // 7
    'B.GGGGGGGGGGG....."MJMMMMMMJM...,..RRRRRRRRRRR.B', // 8
    'B.BNBNBDBNBNB......MMMMMMMMMM....."BNBNBDBNBNB.B', // 9
    'B......q....T....."MMMMMMMMMM.....T.....q......B', // 10
    'B.S.,..q..,........lMMMMMMMMl.,.....xx..q...S..B', // 11
    'B......q.......,...MMMMMMMMMM...........q......B', // 12
    'BqqqqqqqqqqqqqqqqqqqqqqMMqqqqqqqqqqqqqqqqqqqqqqB', // 13
    'B.....................,MM,.....................B', // 14
    'B,"............",....l.MM.l."..................B', // 15
    'B.RRRRRRRRR.....lMMMMMMMMMMMMMMl,...RRRRRRRRR..B', // 16
    'B.RRRRRRRRR.....MMddMSMMMMMMddMM.".,RRRRRRRRR..B', // 17
    'B.RRRRRRRRR,..,.MMMMMMMMMMMMMMMM....RRRRRRRRR..B', // 18
    'B.RRRRRRRRR,....MMMMMMM@@MMMMMMM....RRRRRRRRR..B', // 19
    'B.WnWnDnWnW...,.MMMMMMM@@MMMMMMM...XBNBNDNBNBx.B', // 20
    'B...".q......"..MMMMMMMMMMMMMMMM...,....q......B', // 21
    'B.....q......T..MMMMMMMMMMMMMMMM.,......q...,..B', // 22
    'B.....q..,......MMdMMMMMMMMMMdMM..T.....q,"...,B', // 23
    'B....,q,..,,T...lMMMMMMMMMMMMMMl.....".,q..,.T.B', // 24
    'B.,...q...,............MM...........,...q.,....B', // 25
    'B....,q...,..........l.MM.l...........".q......B', // 26
    'BqqqqqqqqqqqqqqqqqqqqqqMMqqqqqqqqqqqqqqqqqqqqqqB', // 27
    'B..........,..........TMMT.................,...B', // 28
    'B.RRRRRRRRR..QQQQQQQ,..MM"..RRRRRR..GGGGGGGGG..B', // 29
    'B.RRRRRRRRR..QQQQQQQ...MM..,RRRRRR..GGGGGGGGG..B', // 30
    'B.RRRRRRRRR..QQQQQQQ..TMMT..RRRRRR..GGGGGGGGG..B', // 31
    'B.RRRRRRRRR,.WnWDWnW.."MM...WnWWnW..GGGGGGGGG..B', // 32
    'B.WnWnDnWnWp,...q......MM..,......."WnWnDnWnW..B', // 33
    'B.....q.........q.....TMMT........."..,.q......B', // 34
    'BqqqqqqqqqqqqqqqqqqqqqqMMqqqqqqqqqqqqqqqqqqqqqqB', // 35
    'BXXxqqqqqqqqqxX...,....MM......................B', // 36
    'Bxqqqqqqqqqqqqq...""...MM,,,..T..".,T.....T....B', // 37
    'BqqqjqqqqqqqxqX.......lMMl.....".,."...........B', // 38
    'BBBBBBBBBBBBBBBBBBBBBBBMMBBBBBBBBBBBBBBBBBBBBBBB', // 39
  ],
  edge: { map: 'highway', x: 51, y: 16, dir: 'left' },
  warps: [
    { x: 7, y: 9, to: 'academy', tx: 11, ty: 14, dir: 'up' },
    { x: 40, y: 9, to: 'knights', tx: 10, ty: 14, dir: 'up' },
    { x: 6, y: 20, to: 'cap_inn', tx: 7, ty: 8, dir: 'up' },
    { x: 40, y: 20, to: 'cap_smithy', tx: 5, ty: 7, dir: 'up' },
    { x: 40, y: 33, to: 'cap_shop', tx: 5, ty: 7, dir: 'up' },
    { x: 6, y: 33, to: 'orphanage', tx: 6, ty: 8, dir: 'up' },
    { x: 16, y: 32, to: 'cap_house', tx: 4, ty: 5, dir: 'up' },
  ],
  onEnter: async () => {
    if (!Game.flag('reached_capital')) await Story.arriveCapital();
  },
  npcs: [
    { id: 'gate_knight1', x: 22, y: 6, look: 'knight', dir: 'down', talk: async () => { await S.say('성문 기사', byP({ 11: '축제 기간에는 성 안 출입이 금지되어 있다. 용건이 있다면 기사단 본부로 가라.', 13: '오, 견습 기사 브란인가! 입단 축하한다. …성 안 출입은 여전히 안 되지만.', 16: '「별의 수호대」! 국왕 폐하께서도 그대들 이야기를 들으셨다더군.' })); } },
    { id: 'gate_knight2', x: 25, y: 6, look: 'knight', dir: 'down', talk: async () => { await S.say('성문 기사', byP({ 11: '시계탑 쪽은 왕명으로 봉쇄 중이다. 반년째 시곗바늘이 멈춰 있지. 다가가지 않는 게 좋을 거다.', 15: '시계탑의 시곗바늘이 다시 움직이기 시작했다! 그대들이 한 일인가?' })); } },
    {
      id: 'luna', x: 26, y: 22, look: 'luna', dir: 'down', move: 'wander', radius: 2,
      mark: () => (!Quests.get('s_candy') && P() >= 11) || (Quests.isActive('s_candy') && Game.count('star_candy') >= 3),
      talk: () => Story.luna(),
    },
    {
      id: 'bard', x: 20, y: 22, look: 'bard', dir: 'right', move: 'turn',
      talk: async () => {
        await S.say('음유시인 페드로', byP({
          11: ['♪ 별이 내리는 밤에~ 종이 울리면~ 손님이 오리라~ ♪', '…아, 관객이군! 이건 「별내림의 노래」라오. 300년 전 별의 손님을 기리는 노래지.', '손님은 다섯 개의 종을 울리고, 마지막에… 음, 마지막 소절은 아무도 모른다오. 가사가 전해지지 않았거든.'],
          15: '♪ 시계탑의 종이 다시 노래하네~ ♪ 오늘 밤엔 새 노래를 지어야겠소. 「별의 수호대의 노래」라고!',
        }));
      },
    },
    { id: 'noble', x: 30, y: 14, look: 'noble', dir: 'left', move: 'wander', radius: 2, talk: async () => { await S.say('귀부인', byP({ 11: '어머, 시골에서 오셨나 봐요? 축제 기간의 왕도는 처음이죠? 별사탕은 광장 노점에서 팔아요.', 16: '「별의 수호대」라니, 근사한 이름이네요! 사인 좀 해 주시겠어요?' })); } },
    { id: 'student_out', x: 10, y: 11, look: 'student', dir: 'down', move: 'wander', radius: 2, talk: async () => { await S.say('학원생', byP({ 11: '마도학원은 이쪽이에요! 요즘 시계탑 출입 금지라 실험을 못 해서 다들 투덜거리고 있어요.', 15: '시계탑이 다시 움직여요! 오늘 밤 실험 재개래요. 밤샘 확정이에요… 흑.' })); } },
    { id: 'kid1', x: 18, y: 25, look: 'boy', dir: 'up', move: 'wander', radius: 3, talk: async () => { await S.say('꼬마', byP({ 11: '형아누나들 모험가야? 와아! 나도 크면 수호기사가 될 거야!', 13: '저 형아 견습 기사래! 우와아, 방패 만져 봐도 돼?' })); } },
    { id: 'old_merchant', x: 33, y: 24, look: 'merchant', dir: 'down', move: 'wander', radius: 2, talk: async () => { await S.say('떠돌이 상인', byP({ 11: ['오오! 리벨에서 만났던 그 친구들 아닌가! 여기서 또 보는군.', '왕도는 물가가 비싸니 조심하게. 약은 약방, 무기는 「강철 사자」가 제일이지.'], 16: '자네들 이야기가 벌써 상인들 사이에 쫙 퍼졌다네. 「별의 수호대」라고!' })); } },
    {
      id: 'otto', x: 11, y: 37, look: 'otto', dir: 'left', move: 'turn',
      mark: () => Quests.isActive('main3') && Quests.stage('main3') === 6,
      talk: () => Story.otto(),
    },
    { id: 'alley_cat', x: 5, y: 37, look: 'critter:cat', move: 'wander', radius: 2, talk: async () => { await S.say(null, '캬악! (뒷골목 고양이가 털을 곤두세운다.)'); } },
    { id: 'drunk', x: 3, y: 38, look: 'villagerA', dir: 'right', talk: async () => { await S.say('뒷골목 주정뱅이', byP({ 11: '딸꾹. 맨홀 아래엔… 「늙은 이빨」이 산다고… 딸꾹. 진짜야. 내가 봤어. 꿈에서.', 14: '뭐어? 늙은 이빨을 잡았다고? …딸꾹. 그럼 내 꿈은 예지몽이었던 거군.' })); } },
  ],
  objects: [
    { type: 'sign', x: 2, y: 11, text: '왕립 마도학원\n「질문하라. 그리고 끝까지 물어라.」' },
    { type: 'sign', x: 44, y: 11, text: '아스텔 왕국 수호기사단 본부\n「방패는 약한 자를 위해 있다」' },
    {
      type: 'event', x: 21, y: 17, solid: true,
      run: async () => {
        if (P() >= 11 && !Quests.get('s_bounty')) {
          await S.say(null, ['광장 게시판에 현상수배 전단이 붙어 있다.', '「[r]현상수배: 늑대 우두머리 「회색갈기」[/] ─ 은빛 가도 북동쪽 숲에 출몰. 상인 마차를 연달아 습격.\n토벌한 자에게 상금 600G. 기사단 본부로 보고할 것. ─ 수호기사단」']);
          if (await S.yesno(null, '현상수배를 맡을까?')) await S.startQuest('s_bounty');
          return;
        }
        await S.say(null, Quests.isDone('s_bounty') ? '게시판에 「회색갈기 토벌 완료! ─ 리벨에서 온 모험가들」이라는 소식이 붙어 있다.' : '게시판에 축제 일정과 분실물 안내가 빼곡히 붙어 있다. 「별사탕 노점: 광장 동서쪽」');
      },
    },
    { type: 'event', x: 23, y: 5, solid: true, run: async () => { await S.say(null, '성문은 굳게 닫혀 있다. 「축제 기간 중 일반인 출입 금지」라는 팻말이 걸려 있다.'); } },
    { type: 'event', x: 24, y: 5, solid: true, run: async () => { await S.say(null, '성문은 굳게 닫혀 있다. 「축제 기간 중 일반인 출입 금지」라는 팻말이 걸려 있다.'); } },
    { type: 'event', x: 23, y: 19, solid: true, run: async () => { await S.say(null, '「별내림의 분수」. 물속에 동전이 가득하다. 소원을 빌면 별이 들어준다고 한다.'); } },
    { type: 'event', x: 24, y: 20, solid: true, run: async () => { await S.say(null, '분수 바닥에 「하늘의 손님께 감사를」이라는 글귀가 새겨져 있다. 300년 전에 만들어진 분수라고 한다.'); } },
    { type: 'event', x: 20, y: 8, solid: true, run: async () => { await S.say(null, '「초대 수호기사 아스텔」의 석상. 방패를 든 모습이다. 받침대에 「별의 손님과 함께 싸웠노라」라고 새겨져 있다.'); } },
    { type: 'event', x: 27, y: 8, solid: true, run: async () => { await S.say(null, '「초대 학장 미라」의 석상. 책을 든 모습이다. 받침대에 「다섯 종의 비밀은 질문하는 자에게 열린다」라고 새겨져 있다.'); } },
    { type: 'event', x: 18, y: 17, solid: true, run: async () => { await S.say('노점 주인', '별사탕 사세요~! 별내림 축제의 명물! …아, 오늘 몫은 다 팔렸네요. 미안해요!'); } },
    { type: 'event', x: 29, y: 17, solid: true, run: async () => { await S.say('노점 주인', '별 모양 가면 팔아요! …쓰고 있으면 잠이 안 온다는 소문이 있지만요. 호호.'); } },
    {
      type: 'event', x: 9, y: 37, solid: true, art: 'manhole',
      run: async () => {
        if (Game.count('sewer_key') <= 0) { await S.say(null, '무거운 쇠 뚜껑이 덮인 맨홀이다. 자물쇠가 채워져 있다.\n(수로 관리인에게 열쇠가 있을 것 같다.)'); return; }
        if (!(await S.yesno(null, '맨홀 뚜껑을 열고 지하수로로 내려갈까?'))) return;
        await S.warp('sewer1', 2, 3, 'down', { sfx: 'stairs' });
      },
    },
    { type: 'search', id: 'cap_candy1', x: 46, y: 24, item: 'star_candy', cond: () => Quests.isActive('s_candy'), hidden: true, msg: '나무 아래 풀숲에서 별사탕을 발견했다!' },
    { type: 'search', id: 'cap_candy2', x: 14, y: 38, item: 'star_candy', cond: () => Quests.isActive('s_candy'), msg: '나무 상자 틈에 별사탕이 끼어 있다! (고양이가 물어다 놓은 걸까?)', empty: '빈 상자다.' },
    { type: 'search', id: 'cap_barrel', x: 36, y: 11, item: 'hi_potion', msg: '통 안에 기사단 보급품이 하나 남아 있다. 「자유롭게 쓰시오 ─ 보급관」', empty: '빈 통이다.' },
    { type: 'search', id: 'cap_crate', x: 2, y: 36, gold: 150, msg: '상자 안에 누군가 숨겨 둔 금화 주머니가 있다…!', empty: '빈 상자다.' },
  ],
});

// ── 왕립 마도학원 ──
defMap('academy', {
  name: '왕립 마도학원', kind: 'interior', bgm: 'shrine', base: 'w',
  tiles: [
    'IIIIIIIIIIIIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIIIIIIIIIIIII', // 1
    'ILLLLLLLILLwwipIwwwDwwwI', // 2
    'IwwwwwwwIwttccwIwPcccPwI', // 3
    'ILLLwLLLIwccccwIwwcccwwI', // 4
    'IwwwwwwwIwccccwIwwcccwwI', // 5
    'ILLLwLLLIwwwwwzIpwwwwwpI', // 6
    'IwwwwwwwIIIIwIIIIIIwIIII', // 7
    'IwwwwwwwwwwccwwwwwwwwwwI', // 8
    'IpwwwwwtIpwccwpwwwwwwLLI', // 9
    'IwwwwwwwwwwccwwwwwwwwwwI', // 10
    'IwhhwhhwwwwccwwwwhhwhhwI', // 11
    'IwwwwwwwwwwccwwwwwwwwwwI', // 12
    'IwhhwhhwwwwccwwwwhhwhhwI', // 13
    'IpwwwwwwwwwccwwwwwwwwwpI', // 14
    'IIIIIIIIIIIEEIIIIIIIIIII', // 15
  ],
  warps: [
    { x: 11, y: 15, to: 'capital', tx: 7, ty: 10, dir: 'down' },
    { x: 12, y: 15, to: 'capital', tx: 7, ty: 10, dir: 'down' },
    { x: 19, y: 2, to: 'tower1', tx: 12, ty: 17, dir: 'up', cond: () => Game.flag('tower_unfrozen'), blocked: () => Story.towerDoor() },
  ],
  npcs: [
    {
      id: 'ophelia', x: 12, y: 3, look: 'dean', dir: 'down',
      mark: () => P() === 11 || P() === 15,
      talk: () => Story.dean(),
    },
    {
      id: 'felix', x: 4, y: 5, look: 'librarian', dir: 'down', move: 'turn',
      mark: () => (!Quests.get('s_book') && P() >= 12) || (Quests.isActive('s_book') && Game.count('veil_book') > 0),
      talk: () => Story.felix(),
    },
    { id: 'stud1', x: 5, y: 12, look: 'student', dir: 'up', talk: async () => { await S.say('학원생', byP({ 11: '리네트 선배님! 돌아오셨군요! …그런데 알드윈 교수님은요? 아, 죄송해요…', 15: '선배님, 시계탑 일 들었어요! 역시 우리 학원의 자랑이에요!' })); } },
    { id: 'stud2', x: 18, y: 12, look: 'villagerB', dir: 'up', talk: async () => { await S.say('학원생', byP({ 11: '시계탑 출입이 막혀서 천문 관측을 못 하고 있어요. 탑 안에서는 시간이 멈춘다는 소문까지…', 13: '탑 문에 손을 대면 손끝이 얼음처럼 차가워진대요. 시간이 얼어붙은 거래요.', 15: '탑 안에서 시간이 다시 흐르기 시작했대요! 시계가 반년 늦은 걸 맞추느라 정신없어요.' })); } },
    { id: 'stud3', x: 20, y: 9, look: 'student', dir: 'left', move: 'turn', talk: async () => { await S.say('학원생', '「분석」이라는 기술을 쓰신다고요? 마력의 흐름 없이요? …논문 공저자로 이름 올려 주시면 안 될까요?'); } },
  ],
  objects: [
    { type: 'event', x: 2, y: 2, solid: true, run: async () => { await S.say(null, ['「다섯 종의 전승」 ─ 학원 공식 기록.', '「아스트라 시대, 다섯 개의 종이 세계 곳곳에 세워졌다. 리벨의 별의 종, 아스테리온의 시간의 종, 사막의 모래 종, 북해의 파도 종, 그리고 하늘섬의 마지막 종.', '종은 세계와 「장막」 사이를 잇는 쐐기라 전해진다.」']); } },
    { type: 'event', x: 6, y: 2, solid: true, run: async () => { await S.say(null, '「시간의 종 연구」 ─ 「시계탑은 시간의 종 위에 세워졌다. 종이 잠든 동안 탑의 시계는 세상의 시간을, 종이 깨어나면 탑은 종의 시간을 가리킨다.」'); } },
    { type: 'event', x: 1, y: 6, solid: true, run: async () => { await S.say(null, '「마물 도감 (중급편)」 ─ 「태엽으로 움직이는 것은 번개에, 물에 사는 것은 얼음과 번개에, 잿빛 옷을 입은 자들은 빛에 약하다.」'); } },
    { type: 'event', x: 7, y: 9, solid: true, run: async () => { await S.say(null, '책상 위에 「알드윈 교수 ─ 반년 전 대출 기록」이 펼쳐져 있다.\n「장막 너머의 기록 / 회색병의 역사 / 죽은 자와의 대화에 관한 고찰」…'); } },
    { type: 'event', x: 13, y: 2, solid: true, run: async () => { await S.say(null, '진열장에 낡은 사진 한 장이 놓여 있다. 젊은 학자 두 명과 어린 여자아이. 뒷면에 「알드윈, 오필리아, 그리고 엘리」라고 적혀 있다.'); } },
    { type: 'search', id: 'ac_dresser', x: 14, y: 6, item: 'ether', n: 2, msg: '서랍 안에 「학장 비상용 ─ 손대지 말 것」이라고 적힌 이슬병이… 두 개. 하나만… 아니 둘 다?', empty: '서랍 안은 서류로 가득하다.' },
  ],
});

// ── 수호기사단 본부 ──
defMap('knights', {
  name: '수호기사단 본부', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIIIIIIIIIII', // 1
    'IaXxwiwLicccciLwbwbwbI', // 2
    'IwwwwwwcctttcccwwwwwwI', // 3
    'IxwwwwwccccccccwwwwwwI', // 4
    'IwwwwwwccccccccwwwwwzI', // 5
    'IIIIIIIwwwwwwwwIIIIIII', // 6
    'IFFFFFFFFFwwFFFFFFFFFI', // 7
    'IxssssssssssssssssssxI', // 8
    'IssssssssssssssssssssI', // 9
    'IssssssssssssssssssssI', // 10
    'IssssssssssssssssssssI', // 11
    'IssssssssssssssssssssI', // 12
    'IXssssssssssssssssssXI', // 13
    'IwwwwwwwwwccwwwwwwwwwI', // 14
    'IIIIIIIIIIEEIIIIIIIIII', // 15
  ],
  warps: [
    { x: 10, y: 15, to: 'capital', tx: 40, ty: 10, dir: 'down' },
    { x: 11, y: 15, to: 'capital', tx: 40, ty: 10, dir: 'down' },
  ],
  npcs: [
    {
      id: 'reinhardt', x: 12, y: 3, look: 'commander', dir: 'down',
      mark: () => P() === 12 || (Quests.isActive('s_bounty') && Quests.stage('s_bounty') === 1),
      talk: () => Story.commander(),
    },
    {
      id: 'gawain', x: 10, y: 10, look: 'gawain', dir: 'up',
      mark: () => Quests.isActive('main3') && Quests.stage('main3') === 4,
      talk: () => Story.gawainTalk(),
    },
    { id: 'kn1', x: 4, y: 4, look: 'knight', dir: 'right', talk: async () => { await S.say('기사', byP({ 11: '무기고에는 함부로 들어오면 안 된다. …구경만 하는 거라면 뭐, 괜찮다.', 13: '견습 기사 브란! 첫 임무가 시계탑이라니 운이 좋은 건지 나쁜 건지.' })); } },
    { id: 'kn2', x: 17, y: 4, look: 'knight', dir: 'left', talk: async () => { await S.say('기사', byP({ 11: '단장님은 무서워 보여도 정이 많으신 분이다. …가끔.', 13: '「강철팔 드른」 선배의 아들이라니! 선배는 이 기사단의 전설이었지. 열 명을 혼자 지켜 낸 적도 있다고.' })); } },
    { id: 'kn3', x: 16, y: 11, look: 'knight', dir: 'left', move: 'turn', talk: async () => { await S.say('수련 기사', byP({ 11: '하앗! 하앗! …시험관 가웨인 님은 목검으로도 바위를 쪼갠대요.', 13: '입단 시험 합격이라니! 저는 세 번째 떨어졌는데… 비결 좀 알려 주세요!' })); } },
  ],
  objects: [
    { type: 'event', x: 7, y: 2, solid: true, run: async () => { await S.say(null, '「기사단 연대기」 ─ 「20년 전, 북쪽 국경 수비대. 강철팔 드른 경, 마물 습격으로부터 마을 사람 열 명을 홀로 지켜 내다. 그러나 동료 기사 한 명을 잃고, 스스로 검을 꺾어 기사단을 떠나다.」'); } },
    { type: 'event', x: 14, y: 2, solid: true, run: async () => { await S.say(null, '「수호기사의 맹세」 ─ 「하나, 방패는 약한 자를 위해 든다. 둘, 등을 보이지 않는다. 셋, 함께 싸운 자를 홀로 두지 않는다.」'); } },
    { type: 'search', id: 'kn_crate', x: 2, y: 2, item: 'hi_potion', n: 2, msg: '보급 상자 안에 고급 상처약이 남아 있다.', empty: '빈 상자다.' },
    { type: 'search', id: 'kn_dresser', x: 20, y: 5, item: 'silver_helm', msg: '서랍장 안에 반짝이는 투구가… 「분실물 ─ 주인 없음」이라는 쪽지와 함께 들어 있다.', empty: '서랍 안에 낡은 양말만 들어 있다.' },
  ],
});

// ── 여관 「왕관과 별」 ──
defMap('cap_inn', {
  name: '여관 「왕관과 별」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIIIII', // 1
    'IfwLLwpwwIbwbwbI', // 2
    'IwwwwwwwwIwwwwwI', // 3
    'IkkkkkwwwwwwwwzI', // 4
    'IwwwwwwwwIwwwwwI', // 5
    'IwthwwthwIIwwIII', // 6
    'IwhwwwhwwwwwwwwI', // 7
    'IxwwwwwwwwwwwwpI', // 8
    'IIIIIIIEIIIIIIII', // 9
  ],
  warps: [{ x: 7, y: 9, to: 'capital', tx: 6, ty: 21, dir: 'down' }],
  npcs: [
    {
      id: 'wolf_inn', x: 2, y: 3, look: 'capinnkeeper', dir: 'down',
      talk: async () => {
        await S.say('여관 주인 볼프', byP({ 11: '어서 오쇼! 축제 기간이라 방이 거의 없는데… 리벨에서 왔다고? 마르타의 편지라도…? 하하, 농담이오. 한 방 남았소.', 16: '「별의 수호대」께서 우리 여관에! 오늘 밤은 서비스로 수프를 곱빼기로 드리지!' }));
        await S.inn(Math.max(12, Game.state.party.length * 7), '여관 주인 볼프');
      },
    },
    { id: 'inn_knight', x: 7, y: 7, look: 'knight', dir: 'left', talk: async () => { await S.say('비번 기사', byP({ 11: '축제 기간엔 일이 두 배야. 경비, 미아 찾기, 별사탕 도둑 잡기… 하아.', 14: '수로의 「늙은 이빨」을 잡았다고? 기사단도 몇 번이나 실패했는데!' })); } },
    { id: 'inn_scholar', x: 3, y: 7, look: 'oldman', dir: 'right', talk: async () => { await S.say('늙은 학자', byP({ 11: '회색병… 20년 전 왕도를 휩쓴 병이지. 몸이 잿빛으로 굳어 가는 병. 많은 아이들이 그 병으로 떠났다네.', 15: '죽은 자가 돌아오길 바라는 마음은 누구나 같지. 하지만 그걸 위해 세상을 걸 수는 없는 법이야.' })); } },
  ],
  objects: [{ type: 'search', id: 'ci_dresser', x: 14, y: 4, item: 'thunder_flask', msg: '서랍 안에 학원생이 두고 간 듯한 번개병이 있다.', empty: '서랍 안은 비어 있다.' }],
});

// ── 대장간 「강철 사자」 ──
defMap('cap_smithy', {
  name: '「강철 사자」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'IfaXwwiiwwaI', // 2
    'IwwwwwwwIwwI', // 3
    'IkkkkkkkwwwI', // 4
    'IwwwwwwwwwxI', // 5
    'IwwwwwwwwwxI', // 6
    'IpwwwwwwwwpI', // 7
    'IIIIIEIIIIII', // 8
  ],
  warps: [{ x: 5, y: 8, to: 'capital', tx: 40, ty: 21, dir: 'down' }],
  npcs: [
    {
      id: 'leon', x: 3, y: 3, look: 'capsmith', dir: 'down',
      talk: async () => {
        await S.say('대장장이 레온', byP({ 11: '「강철 사자」에 온 걸 환영한다. 왕도 기사들의 무기는 전부 내 손을 거쳤지.', 13: ['…그 도끼. 드른의 솜씨로군. 20년 전 같은 공방에서 일했던 녀석이지.', '아들이 기사가 됐다고? 허, 세월 참.'] }));
        await Shop.open('cap_smithy');
      },
    },
  ],
  objects: [{ type: 'search', id: 'cs_crate', x: 10, y: 5, item: 'power_ring', msg: '상자 안에서 「시제품 ─ 실패작?」이라는 꼬리표가 달린 반지를 발견했다.', empty: '쇳조각만 굴러다닌다.' }],
});

// ── 약방 「백합」 ──
defMap('cap_shop', {
  name: '약방 「백합」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'IiiipwwiiiiI', // 2
    'IwwwwwwwIwwI', // 3
    'IkkkkkkkwwwI', // 4
    'IwwwwwwwwwjI', // 5
    'IwwwwwwwwwjI', // 6
    'IpwwwwwwwwpI', // 7
    'IIIIIEIIIIII', // 8
  ],
  warps: [{ x: 5, y: 8, to: 'capital', tx: 40, ty: 34, dir: 'down' }],
  npcs: [
    {
      id: 'lily', x: 3, y: 3, look: 'pharmacist', dir: 'down',
      talk: async () => {
        await S.say('약사 릴리', byP({ 11: '어서 오세요, 약방 「백합」이에요. 리벨의 엘라 할머니 아세요? 제 스승님이세요!', 14: '수로에 다녀오셨어요? 해독초 넉넉히 챙기세요. 그리고 목욕도요.' }));
        await Shop.open('cap_shop');
      },
    },
  ],
  objects: [{ type: 'search', id: 'cp_jar', x: 10, y: 5, item: 'panacea', n: 2, msg: '항아리 안에 「견본품」이라 적힌 만능약이 들어 있다.', empty: '약초 냄새가 은은하게 난다.' }],
});

// ── 별바라기 보육원 ──
defMap('orphanage', {
  name: '별바라기 보육원', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IfwbbwbbwzwwpI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IwwwwwwwwwwwwI', // 4
    'IwwhttthwwLLwI', // 5
    'IwwwwwwwwwwwwI', // 6
    'IXwwwwwwwwwwjI', // 7
    'IwwwwwwwwwwwwI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'capital', tx: 6, ty: 34, dir: 'down' }],
  onEnter: async () => {
    if (has('nell') && !Game.flag('nell_home')) await Story.nellHome();
  },
  npcs: [
    {
      id: 'greta', x: 6, y: 3, look: 'matron', dir: 'down',
      mark: () => !Game.flag('greta_met') && P() >= 11,
      talk: () => Story.greta(),
    },
    {
      id: 'nell_orphan', x: 10, y: 3, look: 'nell', dir: 'left',
      show: () => !Game.inParty('nell') && Quests.isDone('s_thief') && Quests.get('s_thief').outcome === 'jail' && P() >= 11,
      talk: () => Story.nellRecruit(),
    },
    { id: 'orph1', x: 3, y: 6, look: 'orphanA', dir: 'down', move: 'wander', radius: 2, talk: async () => { await S.say('보육원 아이', byP({ 11: '형아들 누구야? 넬 누나 친구야? 넬 누나는 옛날에 여기 살았대! 지붕에서 별 보는 걸 좋아했대!', 15: '카스 누나 얘기 들었어? 원장님이 밤새 우셨어…' })); } },
    { id: 'orph2', x: 9, y: 7, look: 'orphanB', dir: 'up', move: 'wander', radius: 2, talk: async () => { await S.say('보육원 아이', '별사탕 하나만… 아니, 괜찮아. 원장님이 축제 마지막 날에 사 준댔어!'); } },
  ],
  objects: [
    { type: 'event', x: 10, y: 5, solid: true, run: async () => { await S.say(null, '책장 구석에 아이들이 그린 그림이 붙어 있다. 키 큰 소녀와 작은 소녀가 손을 잡고 별을 보는 그림. 「카스 언니랑 나」라고 삐뚤빼뚤 적혀 있다.'); } },
    { type: 'search', id: 'or_jar', x: 12, y: 7, item: 'star_candy', cond: () => Quests.isActive('s_candy'), msg: '항아리 안에 별사탕이 하나… 아이들이 숨겨 둔 걸까? 대신 쪽지를 남겨 두자.', empty: '항아리 안에 단추와 구슬이 들어 있다. 아이들의 보물 상자인 듯하다.' },
  ],
});

// ── 음유시인의 집 ──
defMap('cap_house', {
  name: '음유시인의 집', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IfwwzwwbwI', // 2
    'IwwwwwwwwI', // 3
    'IwhtthwwjI', // 4
    'IwwwwwwwpI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'capital', tx: 16, ty: 33, dir: 'down' }],
  npcs: [
    { id: 'bard_wife', x: 6, y: 3, look: 'villagerB', dir: 'down', move: 'wander', radius: 1, talk: async () => { await S.say('페드로의 아내', byP({ 11: '남편은 광장에서 노래하고 있어요. 300년 전 별의 손님 노래요. 마지막 소절이 없어서 매일 새로 지어 부른다나요.', 16: '남편이 「별의 수호대의 노래」를 짓겠다고 밤을 새우고 있어요. 여러분 이야기를 들려주시면 좋아할 거예요.' })); } },
  ],
  objects: [
    { type: 'event', x: 4, y: 2, solid: true, run: async () => { await S.say(null, ['서랍장 위에 오래된 악보가 놓여 있다. 「별내림의 노래 ─ 원본(?)」', '「…손님은 다섯 종을 울리고 / 장막 앞에 서서 / 열쇠를 돌려 ───」', '그 뒤는 잉크가 번져 읽을 수 없다.']); } },
    { type: 'search', id: 'bh_jar', x: 8, y: 4, item: 'star_candy', cond: () => Quests.isActive('s_candy'), msg: '항아리 뚜껑 위에 별사탕이 올려져 있다. 「축제 기념 ─ 손님 환영용」이라고 적혀 있다!', empty: '항아리에 꿀이 들어 있다. 달콤한 냄새.' },
  ],
});

// ── 왕도 지하수로 ──
defMap('sewer1', {
  name: '왕도 지하수로 상층', kind: 'dungeon', bgm: 'cave', base: '_',
  tiles: [
    '##################################', // 0
    '###&#######&#######&######&####&##', // 1
    '#_<__#_________vv___#_______#____#', // 2
    '#____#_________vv___#_______#____#', // 3
    '#____#_________vv___#_-_____#____#', // 4
    '#____#___#_____++___#___#___#____#', // 5
    '#________#_____vv_______#________#', // 6
    '#________#___-_vv_______#________#', // 7
    '#________#_____vv_______#________#', // 8
    '#vvvv++vvvvvvvvvvvvvvvvvvvvvvvvvv#', // 9
    '#vvvv++vvvvvvvvvvvvvvvvvvvvvvvvvv#', // 10
    '#vvvv++vvvvvvvvvvvvvvvvvvvvvvvvvv#', // 11
    '#_________#____vvv_________#_____#', // 12
    '#_________#____vvv_________#_____#', // 13
    '#_________#____vvv_________#_____#', // 14
    '#####_____#____vvv____#____#_____#', // 15
    '#_________#____vvv____#__________#', // 16
    '#___-__________vvv____#__-_______#', // 17
    '#______________vvv____#_______>__#', // 18
    '#______________vvv____#__________#', // 19
    '#######&################&#########', // 20
    '##################################', // 21
  ],
  enc: { default: 'sewer', zones: [{ x: 1, y: 2, w: 4, h: 4, enc: null }] },
  warps: [
    { x: 2, y: 2, to: 'capital', tx: 9, ty: 36, dir: 'down', sfx: 'stairs' },
    { x: 30, y: 18, to: 'sewer2', tx: 3, ty: 18, dir: 'right' },
  ],
  tileFlags: [{ flag: 'valve_1', at: [[25, 9], [26, 9], [25, 10], [26, 10], [25, 11], [26, 11]], tile: '+' }],
  onEnter: async () => {
    if (!Game.flag('sewer_first')) {
      Game.setFlag('sewer_first');
      await S.say(null, '(코를 찌르는 냄새. 어둠 속에서 물 흐르는 소리와 무언가 찍찍거리는 소리가 들린다.)');
      await Story.line('bran', '우욱… 이 냄새… 유령보다 이게 더 무서워…');
      await Story.line('nell', '…여기 그대로네. 어릴 때 언니랑 숨바꼭질하던 곳이야. 저 수로 끝까지 가면 학원 지하가 나와.');
      await Story.line('linette', '옛날 물시계용 수로예요. 수문을 조작하면 물길이 바뀔 거예요.');
    }
  },
  objects: [
    {
      type: 'lever', x: 31, y: 2, flag: 'valve_1', art: 'valve',
      after: async (on) => {
        Field.refreshTiles();
        if (on) { Sound.sfx('impact'); Engine.shake(3, 0.5); await S.say(null, '[y]콰르르르…! 수문이 열리며 동쪽 수로의 물이 빠졌다! 쇠창살 발판이 드러났다.[/]'); }
        else await S.say(null, '수문이 닫히며 물이 다시 차올랐다.');
      },
    },
    { type: 'chest', id: 'sw1_book', x: 2, y: 19, item: 'veil_book' },
    { type: 'chest', id: 'sw1_sw', x: 13, y: 13, item: 'hi_potion', n: 2 },
    { type: 'chest', id: 'sw1_n', x: 13, y: 2, item: 'panacea', n: 2 },
    { type: 'chest', id: 'sw1_ne', x: 18, y: 2, gold: 350 },
    { type: 'chest', id: 'sw1_se', x: 32, y: 12, item: 'mystic_robe' },
    { type: 'chest', id: 'sw1_mimic', x: 19, y: 19, item: 'feather_hat', color: 'red', mimic: true },
    { type: 'search', id: 'sw1_spot', x: 4, y: 17, item: 'ether', hidden: true, msg: '오물 속에서 무언가 반짝인다… 깨끗한 병에 담긴 마력의 이슬이다!' },
  ],
});

defMap('sewer2', {
  name: '왕도 지하수로 하층', kind: 'dungeon', bgm: 'cave', base: '_',
  tiles: [
    '##################################', // 0
    '############&#######&#############', // 1
    '#########_______<________#########', // 2
    '#########__-_____________#########', // 3
    '###&#####________________#####&###', // 4
    '#________vvvvvvvvvvvvvvvv________#', // 5
    '#________vvvvvvvvvvvvvvvv________#', // 6
    '#________vvvvvvvvvvvvvvvv________#', // 7
    '#________vvvvvvvvvvvvvvvv________#', // 8
    '#________vvvvvvvvvvvvvvvv________#', // 9
    '####_##__vvvvvvvvvvvvvvvv__##_####', // 10
    '#________vvvvvvvvvvvvvvvv________#', // 11
    '#__*_____vvvvvvvvvvvvvvvv________#', // 12
    '#________vvvvvvvvvvvvvvvv___-____#', // 13
    '#________vvvvvvvvvvvvvvvv________#', // 14
    '#________vvvvvvvvvvvvvvvv________#', // 15
    '#________________________________#', // 16
    '#_____________-__________________#', // 17
    '#_<__________________-___________#', // 18
    '#________________________________#', // 19
    '########&################&########', // 20
    '##################################', // 21
  ],
  enc: { default: 'sewer', zones: [{ x: 1, y: 11, w: 7, h: 4, enc: null }, { x: 9, y: 2, w: 16, h: 3, enc: null }] },
  warps: [
    { x: 2, y: 18, to: 'sewer1', tx: 30, ty: 17, dir: 'up' },
    { x: 16, y: 2, to: 'tower1', tx: 12, ty: 17, dir: 'up', sfx: 'stairs' },
  ],
  tileFlags: [{ flag: () => Game.flag('valve_w') && Game.flag('valve_e'), at: [[16, 5], [16, 6], [16, 7], [16, 8], [16, 9], [16, 10], [16, 11], [16, 12], [16, 13], [16, 14], [16, 15]], tile: '+' }],
  onEnter: async () => {
    if (!Game.flag('sewer2_first')) {
      Game.setFlag('sewer2_first');
      await S.say(null, '(넓은 저수조가 펼쳐져 있다. 탁한 수면 아래로 무언가 거대한 것이 지나가며 물결이 일었다…)');
      await Story.line('mio', '저 건너편 위쪽에서 노래가 들려요. 째깍, 째깍… 탑이 바로 위예요!');
      await Story.line('linette', '수문이 어딘가에 있을 거예요. 이 물이 빠지면 길이 드러날지도 몰라요.');
    }
  },
  npcs: [
    { id: 'old_fang', x: 16, y: 11, look: 'monster:old_fang', scale: 0.4, dir: 'down', noTurn: true, show: () => Game.flag('valve_w') && Game.flag('valve_e') && !Game.flag('croc_defeated'), talk: () => Story.oldFang() },
  ],
  triggers: [
    { x: 16, y: 13, w: 1, h: 3, when: () => Game.flag('valve_w') && Game.flag('valve_e') && !Game.flag('croc_defeated'), run: () => Story.oldFang() },
  ],
  objects: [
    { type: 'lever', x: 2, y: 5, flag: 'valve_w', art: 'valve', after: async () => { await Story.sewerValves(); } },
    { type: 'lever', x: 31, y: 5, flag: 'valve_e', art: 'valve', after: async () => { await Story.sewerValves(); } },
    { type: 'event', x: 3, y: 12, solid: true, run: () => S.savePoint('수정이 차가운 빛을 내뿜는다… 일행의 HP와 MP가 모두 회복되었다!') },
    {
      type: 'note', id: 'elly_note', x: 30, y: 14, item: 'elly_letter',
      text: '누군가 야영한 흔적이 있다. 꺼진 모닥불 옆에 빛바랜 편지가 놓여 있다.\n「아빠, 오늘은 기침이 덜 나요. 별내림 축제에는 같이 갈 수 있겠죠? ─ 엘리」',
      after: async () => {
        if (Game.flag('elly_seen')) return;
        Game.setFlag('elly_seen');
        await S.say(null, '편지 뒷면에는 단정한, 끝을 살짝 말아 올리는 필체로 이렇게 적혀 있다.\n「미안하다, 엘리. 이번 축제에는 꼭 데리러 가마. ─ 아빠가」');
        await Story.line('linette', '…교수님의 글씨예요. 엘리… 교수님에게 딸이 있었다니.');
        await Story.line('mio', '이 편지… 아주 오래됐어요. 20년은 된 것 같아요.');
      },
    },
    { type: 'chest', id: 'sw2_w', x: 1, y: 15, item: 'night_garb' },
    { type: 'chest', id: 'sw2_e', x: 32, y: 6, item: 'hi_potion', n: 3 },
    { type: 'chest', id: 'sw2_s', x: 32, y: 19, item: 'rune_staff' },
    { type: 'chest', id: 'sw2_n', x: 23, y: 2, item: 'ether', n: 2 },
    { type: 'search', id: 'sw2_spot', x: 21, y: 18, gold: 280, hidden: true, msg: '바닥의 돌 틈에 금화가 잔뜩 끼어 있다. 「늙은 이빨」이 삼킨 지갑에서 나온 걸까…?' },
  ],
});

// ── 시계탑 ──
defMap('tower1', {
  name: '시계탑 1층', kind: 'dungeon', bgm: 'tower', base: '_',
  tiles: [
    '########################', // 0
    '###1####&######1#####1##', // 1
    '#___________________<__#', // 2
    '#_P____________________#', // 3
    '#___________P__________#', // 4
    '#______________________#', // 5
    '#####_####____####_#####', // 6
    '#______________________#', // 7
    '#________##11##________#', // 8
    '#_____-__######________#', // 9
    '#________######__-_____#', // 10
    '#______________________#', // 11
    '####_####______####_####', // 12
    '#______________________#', // 13
    '#______________________#', // 14
    '#______P________P______#', // 15
    '#______________________#', // 16
    '#______________________#', // 17
    '#___________>__________#', // 18
    '########################', // 19
  ],
  enc: { default: 'tower', zones: [{ x: 9, y: 13, w: 6, h: 6, enc: null }] },
  warps: [
    { x: 12, y: 18, to: 'sewer2', tx: 16, ty: 3, dir: 'down', sfx: 'stairs' },
    { x: 20, y: 2, to: 'tower2', tx: 20, ty: 17, dir: 'up' },
  ],
  onEnter: async () => {
    if (!Game.flag('tower_first')) {
      Game.setFlag('tower_first');
      Game.setFlag('tower_reached');
      if (Quests.isActive('main3')) S.stage('main3', 8);
      await S.say(null, '(사다리를 올라오자 거대한 톱니바퀴들이 멈춘 채 늘어선 공간이 나왔다. 공중에 먼지가 떠 있다. …떨어지지 않고, 그대로 멈춰서.)');
      await Story.line('linette', '먼지가… 공중에 멈춰 있어요. 이 탑 안에서는 정말로 시간이 멈춘 거예요.');
      await Story.line('mio', '노래가 위에서 들려요. 누군가… 종 옆에서 함께 노래하고 있어요.');
      await Story.line('nell', '…이 노래. 알아. 언니가 자장가로 불러 주던 노래야.');
      await S.goalUpdate('main3');
    }
  },
  objects: [
    { type: 'chest', id: 'tw1_nw', x: 1, y: 2, item: 'mythril_mail' },
    { type: 'chest', id: 'tw1_w', x: 1, y: 11, item: 'hi_potion', n: 2 },
    { type: 'chest', id: 'tw1_e', x: 22, y: 11, item: 'thunder_flask', n: 3 },
    { type: 'chest', id: 'tw1_se', x: 22, y: 17, item: 'silver_dagger' },
    { type: 'chest', id: 'tw1_mimic', x: 1, y: 17, item: 'knight_shield', color: 'red', mimic: true },
    { type: 'search', id: 'tw1_dust', x: 6, y: 9, item: 'starwater', hidden: true, msg: '멈춘 먼지 사이에 별빛 한 방울이 떠 있다… 손을 뻗자 병 속으로 쏙 들어갔다!' },
  ],
});

defMap('tower2', {
  name: '시계탑 2층 ─ 자정의 문', kind: 'dungeon', bgm: 'tower', base: '_',
  tiles: [
    '########################', // 0
    '#####1####&###&####1####', // 1
    '#__<___#_______________#', // 2
    '#______#_______________#', // 3
    '#______#_______________#', // 4
    '###||###_______________#', // 5
    '#______________________#', // 6
    '#________1_____1_______#', // 7
    '#______________________#', // 8
    '#______________________#', // 9
    '###########__###########', // 10
    '#______________________#', // 11
    '#________________-_____#', // 12
    '#___________*__________#', // 13
    '#_P__________________P_#', // 14
    '#______________________#', // 15
    '#_____-________________#', // 16
    '#______________________#', // 17
    '#___________________>__#', // 18
    '########################', // 19
  ],
  enc: { default: 'tower', zones: [{ x: 1, y: 2, w: 6, h: 3, enc: null }, { x: 9, y: 11, w: 7, h: 5, enc: null }] },
  warps: [
    { x: 20, y: 18, to: 'tower1', tx: 20, ty: 3, dir: 'down' },
    { x: 3, y: 2, to: 'tower3', tx: 9, ty: 12, dir: 'up' },
  ],
  tileFlags: [{ flag: () => Dials.solved(), at: [[3, 5], [4, 5]], tile: '_' }],
  onEnter: async () => {
    if (!Game.flag('tower2_first')) {
      Game.setFlag('tower2_first');
      await S.say(null, '(벽에 거대한 시계판 세 개가 박혀 있다. 시곗바늘은 저마다 다른 시각을 가리킨 채 멈춰 있다.)');
      await Story.line('linette', '저 철창… 이 시계판들과 관련 있어 보이지 않아요?');
    }
  },
  objects: [
    {
      type: 'event', x: 12, y: 6, solid: true, art: 'plaque',
      run: async () => { await S.say(null, ['청동 명판에 글귀가 새겨져 있다.', '「[y]자정의 문[/] ─ 세 개의 바늘이 모두 하늘을 가리킬 때, 종으로 가는 길이 열리리라.」']); },
    },
    { type: 'dial', id: 'dial_a', x: 6, y: 8, start: 1 },
    { type: 'dial', id: 'dial_b', x: 12, y: 8, start: 2 },
    { type: 'dial', id: 'dial_c', x: 18, y: 8, start: 3 },
    { type: 'event', x: 3, y: 5, solid: true, show: () => !Dials.solved(), run: async () => { await S.say(null, '두꺼운 철창이 내려와 있다. 철창에 작은 시계 문양이 새겨져 있다. 「자정」.'); } },
    { type: 'event', x: 4, y: 5, solid: true, show: () => !Dials.solved(), run: async () => { await S.say(null, '두꺼운 철창이 내려와 있다. 철창에 작은 시계 문양이 새겨져 있다. 「자정」.'); } },
    { type: 'event', x: 12, y: 13, solid: true, run: () => S.savePoint('수정이 째깍이며 금빛으로 빛난다… 일행의 HP와 MP가 모두 회복되었다!') },
    { type: 'chest', id: 'tw2_nw', x: 1, y: 3, item: 'starwater' },
    { type: 'chest', id: 'tw2_ne', x: 22, y: 2, item: 'mythril_sword' },
    { type: 'chest', id: 'tw2_sw', x: 1, y: 18, item: 'hi_potion', n: 3 },
    { type: 'chest', id: 'tw2_se', x: 22, y: 11, item: 'war_axe' },
  ],
});

const Dials = {
  pos(id) { const v = Game.flag(id); return typeof v === 'number' ? v : MAPS.tower2.objects.find((o) => o.id === id).start; },
  solved() { return ['dial_a', 'dial_b', 'dial_c'].every((id) => Dials.pos(id) % 4 === 0); },
  async turn(o) {
    const before = Dials.solved();
    const n = (Dials.pos(o.id) + 1) % 4;
    Game.setFlag(o.id, n === 0 ? 4 : n);
    Sound.sfx('door'); Engine.shake(1, 0.15);
    await S.say(null, `끼릭… 시곗바늘을 돌렸다. 바늘이 [y]${['12', '3', '6', '9'][n]}시[/]를 가리킨다.`);
    Field.refreshTiles();
    if (!before && Dials.solved()) {
      Sound.sfx('chime'); await S.wait(300); Sound.sfx('impact'); Engine.shake(4, 0.6);
      await S.say(null, '[y]데엥──! 세 바늘이 겹치자 탑 전체가 울리고, 철창이 천천히 올라갔다![/]');
      await Story.line('mio', '노래가… 조금 더 또렷해졌어요. 바로 위예요.');
    }
  },
};

defMap('tower3', {
  name: '시간의 종', kind: 'dungeon', bgm: () => (Game.flag('cassandra_defeated') ? 'shrine' : 'tower'), base: '_',
  tiles: [
    '##################', // 0
    '########OO########', // 1
    '###1###OOOO###1###', // 2
    '###____cccc____###', // 3
    '###____cccc____###', // 4
    '###_P__cccc__P_###', // 5
    '###____cccc____###', // 6
    '###____cccc____###', // 7
    '##1____cccc____1##', // 8
    '###____cccc____###', // 9
    '###_P__cccc__P_###', // 10
    '###____cccc____###', // 11
    '###____cccc____###', // 12
    '###____cc>c____###', // 13
    '##################', // 14
  ],
  warps: [{ x: 9, y: 13, to: 'tower2', tx: 3, ty: 3, dir: 'down' }],
  triggers: [{ x: 3, y: 3, w: 12, h: 7, when: () => !Game.flag('cassandra_defeated'), run: () => Story.cassandra() }],
  npcs: [
    { id: 'cassandra', x: 9, y: 4, look: 'cassandra', dir: 'up', noTurn: true, show: () => !Game.flag('cassandra_defeated'), talk: () => Story.cassandra() },
    { id: 'guardian_npc', x: 7, y: 4, look: 'monster:clock_guardian', scale: 0.3, dir: 'down', noTurn: true, show: () => !Game.flag('cassandra_defeated'), talk: () => Story.cassandra() },
    { id: 'osric_tower', x: 9, y: 12, look: 'osric', dir: 'up', show: () => false },
    { id: 'cass_down', x: 9, y: 5, look: 'cassandra', dir: 'down', show: () => false },
  ],
  objects: [
    { type: 'deco', x: 9, y: 2, draw: 'timebell' },
    {
      type: 'event', x: 12, y: 12, art: 'circle', show: () => Game.flag('cassandra_defeated'),
      run: async () => { if (await S.yesno(null, '시간의 종이 남긴 마법진이 빛나고 있다. 왕도의 마도학원으로 돌아갈까?')) await S.warp('capital', 7, 10, 'down', { sfx: 'chime', slow: true }); },
    },
  ],
});
