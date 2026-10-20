'use strict';
// ─────────────────────────────────────────────────────────────
// 제3장 「사막의 종」 맵: 붉은 협곡 · 타는 모래 사막 · 오아시스 사미라(+실내) · 전갈 굴 · 모래시계 사원
//  진행도(Game.progress): 17 출발 · 18 사미라 도착 · 19 족장 면담 · 20 미오 납치
//                         21 전갈 여왕 격파 · 22 미오 구출 · 23 자히르 격파 · 24 3장 완료
// ─────────────────────────────────────────────────────────────
const SAND_WEATHER = () => (Game.flag('chapter3_done') ? null : 'sand');

// ── 붉은 협곡 ──
defMap('canyon', {
  name: '붉은 협곡', kind: 'field', bgm: 'desert', base: 's', weather: SAND_WEATHER,
  tiles: [
    '//////////sssss:2ssss/////////', // 0
    '//////////sssss:s2ss2/////////', // 1
    '//////////s2sss:sssss/////////', // 2
    '///////////ss2s:ssss//////////', // 3
    '///////////ssss:ssss//////////', // 4
    '///////////2rs2:ssss//////////', // 5
    '///////////ssss::22s//////////', // 6
    '///////////2ss2::sssss////////', // 7
    '//////////s224::sssss/////////', // 8
    '/////////4s2s::ssss2//////////', // 9
    '/////////ssss:sss2////////////', // 10
    '/////////sss::s2ss////////////', // 11
    '////////sss2:s2ss/////////////', // 12
    '////////s4s::ssss/////////////', // 13
    '//////s42s::sss4s/////////////', // 14
    '/////s2sss::ss2s//////////////', // 15
    '//////ss2ss::ssss/////////////', // 16
    '//////2ssss::ssss22///////////', // 17
    '/////sssssssssssssssss////////', // 18
    '/////ss22ss6s6ssssssss////////', // 19
    '////22sssssssss::sssss////////', // 20
    '////2sss2ssssssssssrss////////', // 21
    '///22s2sssssssssssssss////////', // 22
    '//ss22sss:sssssss/////////////', // 23
    '/////ss4::ss2s////////////////', // 24
    '////2sss::sss/////////////////', // 25
    '/////rss::s2ss////////////////', // 26
    '////ssss:ssss/////////////////', // 27
    '///2sss::ss22s////////////////', // 28
    '//2ss2s:sssrs/////////////////', // 29
    '//sssss:sssss/////////////////', // 30
    '///sss2::s2s//////////////////', // 31
    '////ssss:s22s/////////////////', // 32
    '////sss::ssss/////////////////', // 33
    '///ssss:ssss//////////////////', // 34
    '//ssrss:ssss2/////////////////', // 35
    '//sssss:sss4s/////////////////', // 36
    '//sssss:ss4ss/////////////////', // 37
    '///sss2:ss2s//////////////////', // 38
    '///s2sr:2ss2//////////////////', // 39
    '///222s:ssss//////////////////', // 40
    '///ssrs:s2s2//////////////////', // 41
    '//rssss:22sss/////////////////', // 42
    '//sssss:s2sss/////////////////', // 43
  ],
  enc: { default: 'canyon', zones: [{ x: 9, y: 17, w: 14, h: 6, enc: null }, { x: 0, y: 0, w: 30, h: 3, enc: null }] },
  warps: [
    { x: 15, y: 0, to: 'highway', tx: 48, ty: 30, dir: 'up' },
    { x: 7, y: 43, to: 'desert', tx: 30, ty: 1, dir: 'down' },
  ],
  onEnter: async () => {
    if (!Game.flag('canyon_first')) {
      Game.setFlag('canyon_first');
      await S.say(null, '(붉은 바위 절벽 사이로 뜨거운 바람이 불어온다. 발밑의 흙이 점점 모래로 바뀌어 간다.)');
      await Story.line('bran', '덥다… 갑옷 안이 찜통이야. 기사는 원래 이런 데서도 갑옷을 입는 거겠지…?');
      await Story.line('linette', '협곡 끝이 사막이에요. 물은 아껴 마셔요.');
      await Story.line('mio', '…노래가 들려요. 모래가 흘러내리는 소리 같은 노래. 그리고… 이상해요. 어딘가 익숙한 목소리예요.');
    }
  },
  npcs: [
    {
      id: 'nomad_rest', x: 12, y: 20, look: 'desertM', dir: 'down', move: 'turn',
      talk: async () => {
        await S.say('유목민 카림', byP({
          17: ['협곡을 넘어 사막으로 가는 건가? 모래 폭풍이 잦아든 건 열흘 만이라네.', '사막에선 신기루를 조심하게. 눈에 보이는 게 다 진짜는 아니거든. …사람이든, 길이든.'],
          20: '오아시스의 무녀 이야기를 들었네. 사원 쪽 모래가 요즘 이상하게 흘러. 마치 누가 모래시계를 뒤집은 것처럼.',
          24: '모래 폭풍이 그쳤어! 이렇게 맑은 사막 하늘은 십 년 만이야.',
        }));
      },
    },
  ],
  objects: [
    { type: 'chest', id: 'cn_mid', x: 20, y: 21, item: 'mega_potion', n: 2 },
    { type: 'chest', id: 'cn_low', x: 3, y: 29, item: 'hi_ether' },
    { type: 'search', id: 'cn_rock', x: 4, y: 22, gold: 400, hidden: true, msg: '바위 그늘의 모래 속에 낡은 돈주머니가 묻혀 있다.' },
  ],
});

// ── 타는 모래 사막 ──
defMap('desert', {
  name: '타는 모래 사막', kind: 'field', bgm: 'desert', base: 's', weather: SAND_WEATHER,
  tiles: [
    '//////////////////////////////://///////////////////////////', // 0
    '/s4sr2s2sss222ss2sssssssss2sss:2sss22sssssssrss2sssssr2s2ss/', // 1
    '/4ssss2ssss2ssss2ssssss4sssssS:ssss2ssssssss2s2ssssss24ssss/', // 2
    '/sssss2sss2ss2ss2sssssrsssssss:ssssss2s2r2sssss2ssss2ssssss/', // 3
    '/s22rsssssss22ssssssss2ssss4sr:s4ssssssrssssss2ssss2sss2ss2/', // 4
    '/sssssssssssssss2ss22sssss2sss:s2sssss2srssssssss2s22s2ss22/', // 5
    '/2ss2ss6sssss22sssss2s2sssr2s2:2ssrsssrsssr22222222r22sssss/', // 6
    '/sss2sssssssssssssss2sssssssss:ssssrsss2ss2222/r///222sssss/', // 7
    '/2s2ssss:srsssss2ssssss4ss2ss2:2ss42s2sss2222/r2222222sssss/', // 8
    '/2rsssXs:ssssss2s2ssssssssssss:ssss2ssss2s2r2rss)ss22222sss/', // 9
    '/sssssss:sssssssssssssss2ss2r4:ssss2ss2s222/22sssss222sssss/', // 10
    '/s2sssss:4s2sssrsss2ssss22s2ss:422ss22s2ss2/22sssssr22ss2ss/', // 11
    '/2sssss2:ssssrs2s222s22sssss2s:::::::::::::::::::ss222ssss2/', // 12
    '/2ssssss:sss22s2ss4ssrssrss2s::2s222sss42s222222222222sssss/', // 13
    '/s2sssss:sssss2ssssssssss2ss:::4224sss2s4s22/222rr/222sssss/', // 14
    '/ss22sss:sss2ss2ss2sss2sss2::s:s2ss22sssssssss4s22sssssssss/', // 15
    '/ss2ssss:::4ssss2sssssssss::ss:ssssss22ss2s2ssrssssss2s2sss/', // 16
    '/sssssssrs:::ssssssssss22::ss2:ss42s22ss2ssssssssss22rsssss/', // 17
    '/ssss2ss42ss:::sssss3ss2::sss2:sssssssssss2sssssss2sssss2ss/', // 18
    '/4sssssssss2ss:::ssss3s::s2s2s:ssss2sssssssssssssssssss2s2s/', // 19
    '/ssss2ssssssssss::::::::sssss2:22ss2sss4ssssssssssss2sssss2/', // 20
    '/sss2ss22s2ss2ssss?sssssss2sss:22222sssrssss2ssss2sssssssss/', // 21
    '/222ss22ss2ssssssssssssss2ss24:s:sssss2ssssss2sss2s2sss2sss/', // 22
    '/ss4ssss2srsssssssssssssrsss22:s:::2s2ssssssssssss22222ss2s/', // 23
    '/4s2sssssssssss3sssss3sss2ssss:222:::s222sssss2sss4sss4ssss/', // 24
    '/2ssssssss22sssss3ssssssss222s:sssss:::s22sssss2s22ssssssss/', // 25
    '/ss2sssss4sssssss22sss22sss42s:sssssss:::s22ssss22ssssss22s/', // 26
    '/2s2ssss2sssss2sssssssssss22ss:s2s2s4ss2:::ssssssss2sssssss/', // 27
    '/ssssssssss4s2sss2s22sss2sssss:ssssss2ssss:::ss2sssss4ss2ss/', // 28
    '/s2ssss2s22ss22ssssssr2sss4s2r:s2s4ssss4ssss:::2ssss2sssss2/', // 29
    '/ssss2ssssssss22ssssssss999999:999999ss2ssssss:::ssssssss2s/', // 30
    '/4ssssss2sss22ssssss22ss999999:999999ss2s22sssss::ss6ssssss/', // 31
    '/ssssssrsss4sssss2sssss299sssssssss99ssrrssssssss:ssssss2ss/', // 32
    '/2sss2sssssss24ss2ss2ssr99sPsssssPs99sss4ssssssss:sssssssss/', // 33
    '/s2sssss2ss2ssssssssss4299sssssssss9922ss2ssssssssxssXsss2s/', // 34
    '/s422ss2ssssssssssssssss99ssss(ssss99ssssss2sssssssssssssss/', // 35
    '/ssss2ss2ss4ssss2sssssss99ssss:ssss99ss22r2ssssssssssssssss/', // 36
    '/ss2ss2ssssss2s2sss22sss99sPss:ssPs99ssss2s22ssssssssssssss/', // 37
    '/ss2ss2s2sssssssss2sssr299ssss:ssss992s2sssss2sss2s2sss2sss/', // 38
    '/ssss4ss242ssss2s2s22sss999999:999999s4s2ssss222ssssss22sss/', // 39
    '/2s42s222rsss2s22sssssss999999:9999992ssrssssssss2s2ss22s42/', // 40
    '/42s2ss442sssssssrsssrs22srss2s2s2ssrs242s22sssssss24sss4ss/', // 41
    '/2ss22ssssssss2ssss42sssss2r422s2ss2s22sssssss24s2s2sssss22/', // 42
    '////////////////////////////////////////////////////////////', // 43
  ],
  enc: {
    default: 'desert',
    zones: [
      { x: 27, y: 0, w: 7, h: 4, enc: null },        // 협곡 출구
      { x: 13, y: 17, w: 11, h: 10, enc: null },     // 오아시스 주변
      { x: 25, y: 31, w: 11, h: 9, enc: null },      // 사원 앞마당
      { x: 45, y: 29, w: 12, h: 9, enc: null },      // 대상 야영지
    ],
  },
  warps: [
    { x: 30, y: 0, to: 'canyon', tx: 7, ty: 42, dir: 'up' },
    { x: 18, y: 21, to: 'samira', tx: 17, ty: 26, dir: 'up' },
    { x: 48, y: 9, to: 'sandcave', tx: 4, ty: 19, dir: 'right', sfx: 'stairs', cond: () => Game.flag('cave_told'), blocked: async () => { await S.say(null, '모래에 반쯤 묻힌 동굴 입구다. 안쪽에서 무언가 딸깍거리는 소리가 난다.\n…지금은 들어갈 이유가 없다.'); } },
    { x: 30, y: 35, to: 'temple1', tx: 12, ty: 18, dir: 'up', sfx: 'stairs', cond: () => Game.flag('sun_gate_open'), blocked: () => Story.sunGate() },
  ],
  onEnter: async () => {
    if (!Game.flag('desert_first')) {
      Game.setFlag('desert_first');
      await S.say(null, '(협곡을 빠져나오자 끝없는 모래 언덕이 펼쳐졌다. 하늘과 땅의 경계가 열기 속에 일렁인다.)');
      await Story.line('nell', '…넓다. 그리고 아무것도 없어. 훔칠 것도.');
      await Story.line('linette', '저 멀리 야자나무가 보여요. 오아시스예요. 사자가 말한 사미라일 거예요.');
    }
  },
  npcs: [
    {
      id: 'caravan_lead', x: 50, y: 33, look: 'caravan', dir: 'left',
      show: () => Quests.isActive('s_caravan') && Quests.stage('s_caravan') === 0,
      talk: () => Story.lostCaravan(),
    },
    { id: 'raider1', x: 49, y: 33, look: 'raider', dir: 'right', show: () => Quests.isActive('s_caravan') && Quests.stage('s_caravan') === 0 && !Game.flag('raiders_beaten'), talk: () => Story.lostCaravan() },
  ],
  objects: [
    { type: 'sign', x: 29, y: 2, text: '← 오아시스 사미라\n→ 오래된 우물 동굴 (출입 주의)\n↓ 모래시계 사원' },
    { type: 'search', id: 'ds_tent', x: 6, y: 9, item: 'aria_page', msg: '무너진 천막 옆 나무 상자 안에, 모래에 바랜 일기장 조각이 끼어 있다.', empty: '빈 상자다. 모래만 가득하다.', after: () => Story.ariaPage() },
    { type: 'chest', id: 'ds_nw', x: 3, y: 3, item: 'sand_garb' },
    { type: 'chest', id: 'ds_ne', x: 57, y: 2, item: 'hi_ether', n: 2 },
    { type: 'chest', id: 'ds_sw', x: 2, y: 40, item: 'desert_helm' },
    { type: 'chest', id: 'ds_se', x: 57, y: 41, gold: 800 },
    { type: 'chest', id: 'ds_mid', x: 40, y: 22, item: 'sand_bomb', n: 3 },
    { type: 'search', id: 'ds_oasis', x: 22, y: 22, item: 'mega_potion', hidden: true, msg: '야자나무 뿌리 근처, 모래 속에 병 하나가 묻혀 있다.' },
    { type: 'search', id: 'ds_dune', x: 44, y: 38, item: 'starwater', hidden: true, msg: '모래 언덕 꼭대기에서 별빛 한 방울이 반짝인다…!' },
  ],
});

// ── 오아시스 사미라 ──
defMap('samira', {
  name: '오아시스 사미라', kind: 'town', bgm: 'oasis', base: 's',
  tiles: [
    '////////////////////////////////////', // 0
    '/ss3sssssssss[[[[[[[[[[sssssssss3ss/', // 1
    '/ssssssssssss[[[[[[[[[[ssssssssssss/', // 2
    '/s[[[[[[[[sss[[[[[[[[[[sss[[[[[[[[s/', // 3
    '/s[[[[[[[[sss5555D55555sss[[[[[[[[s/', // 4
    '/s555D5555sssssss::sssssss555D5555s/', // 5
    '/ssss:sssss3sssss::sssss3ssss:sssss/', // 6
    '/ssss:sssssssssss::ssssssssss:sssss/', // 7
    '/ssss:ssssssFFFFFFFFFFFFsssss:sssss/', // 8
    '/ssss:ssssssF2222~~2222Fsssss:sssss/', // 9
    '/ssss:ssssssF2222~~2222Fsssss:ssss3/', // 10
    '/ssss:ssssssF2222~~2222Fsssss:sssss/', // 11
    '/ssss:ssssssFFFFFFFFFFFFsssss:sssss/', // 12
    '/ssss:sssssssssss::ssssssssss:sssss/', // 13
    '/ss::::::::::::::::::::::::::::::ss/', // 14
    '/ss::::::::::::::::::::::::::::::ss/', // 15
    '/ssssssssssssssss::ssssssssssssssss/', // 16
    '/s[[[[[[[[ddsssss::ssssddss[[[[[[[s/', // 17
    '/s[[[[[[[[sssssss::ssssssss[[[[[[[s/', // 18
    '/s555D5555sssssss::ssssssss555D555s/', // 19
    '/ssssssssssssssss::ssssssssssssssss/', // 20
    '/ssssssssssssssss::sss6ssssssssssss/', // 21
    '/ssssssss6sssssss::ssssssssssssssss/', // 22
    '/ssssssssssssssss::ssssss6sssssssss/', // 23
    '/ss3ssssssssss3sS::ss3ssssssssss3ss/', // 24
    '/ssssssssssssssss::ssssssssssssssss/', // 25
    '/ssssssssssssssss::ssssssssssssssss/', // 26
    '/////////////////:://///////////////', // 27
  ],
  edge: { map: 'desert', x: 18, y: 22, dir: 'down' },
  warps: [
    { x: 17, y: 4, to: 'chief_house', tx: 6, ty: 8, dir: 'up' },
    { x: 5, y: 5, to: 'samira_inn', tx: 6, ty: 8, dir: 'up' },
    { x: 29, y: 5, to: 'water_shrine', tx: 5, ty: 7, dir: 'up' },
    { x: 5, y: 19, to: 'bazaar', tx: 6, ty: 7, dir: 'up' },
    { x: 30, y: 19, to: 'aria_house', tx: 4, ty: 5, dir: 'up' },
  ],
  tileFlags: [{ flag: 'spring_restored', at: [[13, 9], [14, 9], [15, 9], [16, 9], [19, 9], [20, 9], [21, 9], [22, 9], [13, 10], [14, 10], [15, 10], [16, 10], [19, 10], [20, 10], [21, 10], [22, 10], [13, 11], [14, 11], [15, 11], [16, 11], [19, 11], [20, 11], [21, 11], [22, 11]], tile: '~' }],
  onEnter: async () => {
    if (!Game.flag('reached_samira')) await Story.arriveSamira();
  },
  npcs: [
    {
      id: 'gate_guard', x: 16, y: 25, look: 'desertM', dir: 'down',
      talk: async () => {
        await S.say('오아시스 문지기', byP({
          17: '바깥사람이군. 사미라에 온 걸 환영한다. …물은 귀하니 아껴 쓰도록.',
          18: '족장님은 북쪽 큰 집에 계신다. 왕도에서 온 손님이라면 기다리고 계실 거다.',
          20: '어젯밤 모래 폭풍이 마을을 휩쓸었다. 그 와중에 사제님을 봤다는 사람도 있어… 설마.',
          24: '샘이 다시 솟았다! 내 평생 이렇게 물이 넘치는 건 처음 본다!',
        }));
      },
    },
    {
      id: 'well_girl', x: 14, y: 14, look: 'desertKid', dir: 'down', move: 'wander', radius: 2,
      talk: async () => {
        await S.say('물 긷는 아이', byP({
          17: '샘물이 매일 조금씩 줄어들어. 엄마는 물 긷는 줄이 매일 길어진대.',
          20: '사제님이… 무녀 언니를 데려갔대. 사제님은 좋은 분이었는데. 우리한테 물을 나눠 주던…',
          24: '언니 오빠들이 샘을 살렸다며? 이제 물놀이 해도 된대! 헤헤.',
        }));
      },
    },
    {
      id: 'teller', x: 23, y: 21, look: 'teller', dir: 'left', move: 'turn',
      talk: async () => {
        await S.say('점쟁이 사하라', byP({
          17: ['…별의 손님이로구나. 네 손등에서 별 냄새가 나.', '모래는 흐르고, 흐르면 다시 쌓이지. 위가 아래가 되고, 아래가 위가 되는 법.'],
          20: ['잃어버린 것을 찾는 얼굴이로군.', '모래시계는 뒤집어야 흐른다. 막힌 길은, 거꾸로 보면 열린 길이지.'],
          21: ['아지랑이는 칼로 벨 수 없단다. 꿰뚫어 보는 눈만이 진짜를 가려내지.', '…네게는 그런 눈이 있지 않니, 별의 손님?'],
          24: '네 별은 아직 다 타지 않았다. 하지만 서둘러야 할 거야. 저편의 시계는 이편보다 빠르게 흐르니까.',
        }));
      },
    },
    { id: 'samira_m1', x: 9, y: 15, look: 'desertM', dir: 'down', move: 'wander', radius: 3, talk: async () => { await S.say('오아시스 주민', byP({ 17: '십 년 전에도 바깥에서 무녀님이 왔었지. 아리아 님. 사원에 들어가서는 다시 나오지 않았어. 그 뒤로 모래 폭풍이 잦아들었지만, 샘은 조금씩 말라 갔어.', 24: '아리아 님의 딸이 샘을 살렸다며! 십 년 만에 은혜를 갚았어.' })); } },
    { id: 'samira_f1', x: 26, y: 15, look: 'desertF', dir: 'down', move: 'wander', radius: 3, talk: async () => { await S.say('오아시스 주민', byP({ 17: '자히르 사제님이 사라진 지 한 달이야. 떠나기 전에 「바다를 되찾겠다」고 중얼거렸다던데… 이 사막에 바다라니.', 20: '사제님이 잿빛 옷의 사람들과 함께 있었대. 그 사람들, 무슨 짓을 하려는 걸까.', 23: '사제님이 돌아오셨대. 사당에서 꼼짝 않고 기도만 하고 계신다더라.' })); } },
  ],
  objects: [
    { type: 'sign', x: 16, y: 24, text: '오아시스 사미라\n「모래 바다의 마지막 물방울」' },
    { type: 'event', x: 17, y: 8, solid: true, run: async () => { await S.say(null, Game.flag('spring_restored') ? '맑은 샘물이 울타리 너머까지 넘실거린다. 물속에서 작은 물고기가 반짝인다.' : '사미라의 샘. 울타리 안쪽 바닥이 갈라져 있다. 가운데에만 손바닥만 한 물웅덩이가 남아 있다.'); } },
    { type: 'event', x: 10, y: 17, solid: true, run: async () => { await S.say('과일 장수', '대추야자 사세요! …오늘 몫은 다 팔렸어요. 내일 또 오세요!'); } },
    { type: 'event', x: 23, y: 17, solid: true, run: async () => { await S.say('천 장수', '사막 천은 햇빛을 막아 주지요. …지금은 구경만 하세요. 바자르 안에 더 좋은 게 있어요.'); } },
    { type: 'search', id: 'sm_tent', x: 9, y: 22, item: 'hi_ether', msg: '천막 그늘에 누군가 두고 간 이슬병이 있다. 「목마른 여행자에게」.', empty: '천막 그늘이 시원하다.' },
  ],
});

// ── 사미라 실내 ──
defMap('chief_house', {
  name: '족장의 집', kind: 'interior', bgm: 'oasis', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'ILLzwccccwzLLI', // 2
    'IwwwwccccwwwwI', // 3
    'IpwwwcttcwwwpI', // 4
    'IwwwwccccwwwwI', // 5
    'IhtwwccccwwthI', // 6
    'IwwwwccccwwwwI', // 7
    'IpwwwccccwwwpI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'samira', tx: 17, ty: 5, dir: 'down' }],
  npcs: [
    {
      id: 'hakim', x: 7, y: 3, look: 'hakim', dir: 'down',
      mark: () => P() === 18 || (P() === 20 && !Game.flag('cave_told')) || P() === 23,
      talk: () => Story.hakim(),
    },
    { id: 'hakim_guard', x: 2, y: 5, look: 'desertM', dir: 'right', talk: async () => { await S.say('족장의 호위', byP({ 18: '족장님은 하루에 한 잔의 물만 드신다. 마을 사람들 몫을 줄일 수 없다면서.', 21: '태양의 열쇠를 찾았다고? …그럼 이제 사원의 문이 열리는 건가.', 24: '족장님이 웃으시는 걸 십 년 만에 봤다.' })); } },
  ],
  objects: [
    { type: 'event', x: 1, y: 2, solid: true, run: async () => { await S.say(null, ['벽에 오래된 지도가 걸려 있다. 지금의 사막 자리에 커다란 바다가 그려져 있다.', '바다 한가운데에 「종의 섬」이라고 적혀 있다.']); } },
    { type: 'search', id: 'ch_dresser', x: 3, y: 2, item: 'mega_potion', msg: '서랍장 안에 「손님 대접용」이라고 적힌 물병이 있다.', empty: '서랍장 안은 비어 있다.' },
  ],
});

defMap('samira_inn', {
  name: '여관 「사막의 별」', kind: 'interior', bgm: 'oasis', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IfwLLwpIbcbczI', // 2
    'IwwwwwwIcccccI', // 3
    'IkkkkwwwcccccI', // 4
    'IwwwwwwIcccccI', // 5
    'IwthwthIIccIII', // 6
    'IwwwwwwwwwwwpI', // 7
    'IpwwwwwwwwwwwI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'samira', tx: 5, ty: 6, dir: 'down' }],
  npcs: [
    {
      id: 'layla', x: 2, y: 3, look: 'desertF', dir: 'down',
      mark: () => P() === 19,
      talk: async () => {
        if (P() === 19) { await Story.innNight(); return; }
        await S.say('여관 주인 라일라', byP({ 17: '사막의 별에 어서 와요. 사막에선 물 한 잔도 귀하지만, 잠자리만큼은 넉넉하답니다.', 20: '어젯밤엔… 정말 미안해요. 우리 여관에서 그런 일이…', 24: '샘이 돌아왔어요! 오늘은 목욕물도 데워 드릴게요!' }));
        await S.inn(Math.max(15, Game.state.party.length * 8), '여관 주인 라일라');
      },
    },
    { id: 'inn_trader', x: 3, y: 7, look: 'merchant', dir: 'right', talk: async () => { await S.say('행상인', byP({ 17: '왕도에서 사막까지 오다니, 별난 사람들이로군. 나도 마찬가지지만.', 21: '전갈 굴의 여왕을 쓰러뜨렸다고? 그 굴엔 옛날 우물이 있었어. 사미라 사람들이 처음 물을 길었던 곳이지.' })); } },
  ],
  objects: [{ type: 'search', id: 'si_dresser', x: 12, y: 2, item: 'sand_bomb', n: 2, msg: '서랍 안에 모래 폭탄이 들어 있다. 「도적 퇴치용 ─ 라일라」', empty: '서랍 안은 비어 있다.' }],
});

defMap('water_shrine', {
  name: '물의 사당', kind: 'interior', bgm: 'shrine', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'IpwwwAAwwwpI', // 2
    'IwwwwccwwwwI', // 3
    'IwwwwccwwwwI', // 4
    'IjwwwccwwwjI', // 5
    'IwwwwccwwwwI', // 6
    'IpwwwccwwwpI', // 7
    'IIIIIEIIIIII', // 8
  ],
  warps: [{ x: 5, y: 8, to: 'samira', tx: 29, ty: 6, dir: 'down' }],
  npcs: [
    { id: 'zahir_pray', x: 6, y: 3, look: 'zahir', dir: 'up', noTurn: true, show: () => Game.flag('zahir_defeated'), talk: () => Story.zahirAfter() },
    { id: 'acolyte_water', x: 3, y: 5, look: 'desertF', dir: 'right', show: () => !Game.flag('zahir_defeated'), talk: async () => { await S.say('사당지기', byP({ 17: ['이곳은 물의 사당. 자히르 사제님이 지키던 곳이에요.', '사제님은 매일 밤 지도를 보며 「바다가 있었다」고 하셨어요. 이 사막이 옛날엔 바다였다고.'], 20: '사제님이 무녀님을 데려갔다니… 믿을 수 없어요. 사제님은 누구보다 이 마을을 사랑했는데.' })); } },
  ],
  objects: [
    { type: 'event', x: 5, y: 2, solid: true, run: async () => { await S.say(null, ['제단 위에 낡은 석판이 놓여 있다.', '「모래는 바다의 기억. 종이 노래하면 물은 돌아오고, 종이 울부짖으면 모래가 일어나리라.」']); } },
    { type: 'event', x: 6, y: 2, solid: true, run: async () => { await S.say(null, Game.flag('spring_restored') ? '제단의 물그릇이 찰랑찰랑 차 있다.' : '제단의 물그릇이 바싹 말라 있다.'); } },
    { type: 'note', id: 'zahir_note', x: 1, y: 5, text: '항아리 옆에 쪽지가 끼워져 있다.\n「모래 아래에는 바다가 잠들어 있다. 장막 너머에는 잃어버린 모든 것이 있다. 오스릭 님은 약속했다. 무녀의 목소리가 종을 깨우면, 바다가 돌아온다고. ─ 자히르」' },
  ],
});

defMap('bazaar', {
  name: '바자르', kind: 'interior', bgm: 'oasis', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IiaXwpwwiiijwI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IkkkkkwwkkkkkI', // 4
    'IwwwwwwwwwwwwI', // 5
    'IxwwwwwwwwwwxI', // 6
    'IpwwwwwwwwwwpI', // 7
    'IIIIIIEIIIIIII', // 8
  ],
  warps: [{ x: 6, y: 8, to: 'samira', tx: 5, ty: 20, dir: 'down' }],
  npcs: [
    { id: 'baz_weapon', x: 3, y: 3, look: 'capsmith', dir: 'down', talk: async () => { await S.say('대장장이 오마르', byP({ 17: '사막의 칼은 휘어져 있지. 모래를 베려면 그래야 하거든.', 24: '샘을 살린 손님들에게는… 흠, 할인은 못 해 주지만 칼은 정성껏 갈아 주마.' })); await Shop.open('bazaar_arms'); } },
    {
      id: 'baz_item', x: 10, y: 3, look: 'merchant', dir: 'down',
      mark: () => (!Quests.get('s_caravan') && P() >= 19) || (Quests.isActive('s_caravan') && Quests.stage('s_caravan') === 1),
      talk: () => Story.ali(),
    },
  ],
  objects: [{ type: 'search', id: 'bz_jar', x: 11, y: 2, item: 'sand_bomb', msg: '항아리 안에 모래 폭탄이 하나 굴러다닌다.', empty: '향신료 냄새가 난다.' }],
});

defMap('aria_house', {
  name: '나디아의 집', kind: 'interior', bgm: 'oasis', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IfwwzwwbwI', // 2
    'IwwwwwwwwI', // 3
    'IwhtthwwjI', // 4
    'IwwwwwwwpI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'samira', tx: 30, ty: 20, dir: 'down' }],
  npcs: [
    {
      id: 'nadia', x: 6, y: 3, look: 'nadia', dir: 'down',
      mark: () => Quests.isActive('s_diary') && Quests.stage('s_diary') === 1 && Game.inParty('mio'),
      talk: () => Story.nadia(),
    },
  ],
  objects: [
    { type: 'event', x: 7, y: 2, solid: true, run: async () => { await S.say(null, '정갈하게 정돈된 침대. 머리맡에 시든 꽃 한 송이가 놓여 있다. 십 년 동안 매일 바꿔 놓은 듯하다.'); } },
    { type: 'search', id: 'ah_jar', x: 8, y: 4, item: 'panacea', n: 2, msg: '항아리 안에 약병이 들어 있다. 「아리아 님이 두고 간 것」이라는 쪽지와 함께.', empty: '항아리 안은 비어 있다.' },
  ],
});

// ── 전갈 굴 (오래된 우물 동굴) ──
defMap('sandcave', {
  name: '전갈 굴', kind: 'dungeon', bgm: 'cave', base: 'y',
  tiles: [
    '##############################', // 0
    '#####yyyy#######yyyyyyyyyyy###', // 1
    '###yyyyyyyy####yyyyyyyyyyyyy##', // 2
    '##yyyy##yyyy##yyyyyPyyyyPyyy##', // 3
    '##yyy####yyyyyyyy##yyyyyyyyy##', // 4
    '##yyy####yyyyyyy####yyyyyyy###', // 5
    '##yy2yy##yyy##yy####yyyyyy####', // 6
    '###yyyy###yy####yyy##yy#######', // 7
    '####yyyy##yyy##yyyyy#yyy######', // 8
    '#####yyy###yyyyyyyyyyyyyy#####', // 9
    '#####yy####yyy2yy####yyyyyy###', // 10
    '####yyyy##yyyyyyy######yyyyy##', // 11
    '###yyyyyyyyy####yy######yyyy##', // 12
    '##yyyyy##yyy####yyyy####yy2y##', // 13
    '##yy2yy##yyyy##yyyyyyyyyyyyy##', // 14
    '##yyyyy###yyyyyyy##yyyyyyyyy##', // 15
    '###yyy######yyyy####yyyyy#####', // 16
    '##yyyyy######yy#######yyy#####', // 17
    '##yyyyyyy#####y######yyyyy####', // 18
    '##y<yyyyyyyyyyyyyyyyyyyyyyy###', // 19
    '###yyyyyy#####yyyy####yyyy####', // 20
    '##############################', // 21
  ],
  enc: { default: 'sandcave', zones: [{ x: 1, y: 17, w: 6, h: 4, enc: null }, { x: 15, y: 1, w: 13, h: 6, enc: null }] },
  warps: [{ x: 3, y: 19, to: 'desert', tx: 48, ty: 10, dir: 'down', sfx: 'stairs' }],
  triggers: [{ x: 15, y: 2, w: 13, h: 4, when: () => !Game.flag('queen_defeated'), run: () => Story.scorpionQueen() }],
  onEnter: async () => {
    if (!Game.flag('cave3_first')) {
      Game.setFlag('cave3_first');
      await S.say(null, '(서늘한 공기. 바닥 곳곳에 무너진 돌우물의 흔적이 있다. 어둠 속에서 딸깍, 딸깍… 무언가 집게를 부딪치는 소리.)');
      await Story.line('linette', '옛날 우물이에요. 사미라 사람들이 처음 물을 길던 곳… 지금은 완전히 말랐네요.');
      await Story.line('nell', '…미오가 있었으면 「조심하세요」라고 했겠지. 다들 조심해.');
    }
  },
  npcs: [
    { id: 'queen', x: 22, y: 2, look: 'monster:scorpion_queen', scale: 0.32, dir: 'down', noTurn: true, show: () => !Game.flag('queen_defeated'), talk: () => Story.scorpionQueen() },
  ],
  objects: [
    { type: 'chest', id: 'sc_key', x: 26, y: 1, item: 'sun_key', after: () => Story.sunKeyFound() },
    { type: 'chest', id: 'sc_page', x: 2, y: 6, item: 'aria_page', after: () => Story.ariaPage() },
    { type: 'chest', id: 'sc_w', x: 3, y: 12, item: 'scorpion_dagger' },
    { type: 'chest', id: 'sc_e', x: 27, y: 13, item: 'mega_potion', n: 2 },
    { type: 'chest', id: 'sc_mid', x: 14, y: 10, item: 'sun_staff' },
    { type: 'chest', id: 'sc_s', x: 24, y: 18, gold: 900 },
    { type: 'search', id: 'sc_sand', x: 4, y: 14, item: 'hi_ether', hidden: true, msg: '모래 속에서 단단한 무언가가 손에 걸렸다. 깨지지 않은 이슬병이다!' },
  ],
});

// ── 모래시계 사원 ──
const HOURGLASS = {
  A: [[5,16],[12,13],[20,5]],
  B: [[19,16],[4,11],[14,8]],
};
defMap('temple1', {
  name: '모래시계 사원 · 흐르는 모래의 회랑', kind: 'dungeon', bgm: 'sandtemple', base: '8',
  tiles: [
    '7777&77777&7777&77777&777', // 0
    '7888888888888888888888887', // 1
    '788888P88888>88888P888887', // 2
    '7888888888888888888888887', // 3
    '7888888888888888888888887', // 4
    '7999999999999999999999997', // 5
    '7888888888888898888888887', // 6
    '7888888888888898888888887', // 7
    '788888888P888898888888887', // 8
    '7888888888888898888P88887', // 9
    '7888888888888898888888887', // 10
    '7999999999999999999999997', // 11
    '7888888888889888888888887', // 12
    '788888P888889888888888887', // 13
    '788888888888988888P888887', // 14
    '7888888888889888888888887', // 15
    '7999999999999999999999997', // 16
    '7888888888888888888888887', // 17
    '788888P88888888888P888887', // 18
    '788888888888<888888888887', // 19
    '7777777777777777777777777', // 20
    '7777777777777777777777777', // 21
  ],
  enc: { default: 'temple', zones: [{ x: 1, y: 17, w: 23, h: 3, enc: null }] },
  warps: [
    { x: 12, y: 19, to: 'desert', tx: 30, ty: 36, dir: 'down', sfx: 'stairs' },
    { x: 12, y: 2, to: 'temple2', tx: 12, ty: 15, dir: 'up' },
  ],
  tileFlags: [
    { flag: () => !!Game.flag('hg_flip'), at: HOURGLASS.A, tile: '8' },
    { flag: () => !Game.flag('hg_flip'), at: HOURGLASS.B, tile: '8' },
  ],
  onEnter: async () => {
    await Story.enterTemple();
    if (!Game.flag('temple1_first')) {
      Game.setFlag('temple1_first');
      await S.say(null, '(사원 안은 고요하다. 바닥 곳곳의 구덩이에서 모래가 소리 없이 소용돌이친다. 회랑 여기저기에 커다란 모래시계가 놓여 있다.)');
      await Story.line('linette', '흐르는 모래예요. 빠지면 끝이에요. …모래시계랑 무슨 관계가 있는 것 같은데.');
      await Story.line('bran', '미오… 기다려. 금방 갈게.');
    }
  },
  objects: [
    { type: 'hourglass', x: 2, y: 17 },
    { type: 'hourglass', x: 22, y: 13 },
    { type: 'hourglass', x: 2, y: 13 },
    { type: 'hourglass', x: 2, y: 7 },
    { type: 'hourglass', x: 22, y: 8 },
    { type: 'chest', id: 't1_page', x: 9, y: 9, item: 'aria_page', after: () => Story.ariaPage() },
    { type: 'chest', id: 't1_e', x: 23, y: 10, item: 'mirage_robe' },
    { type: 'chest', id: 't1_w', x: 1, y: 15, item: 'hi_ether', n: 2 },
    { type: 'chest', id: 't1_top', x: 23, y: 1, item: 'sun_shield' },
    { type: 'chest', id: 't1_mimic', x: 1, y: 1, item: 'turban', color: 'red', mimic: true, monster: 'cursed_chest' },
    { type: 'event', x: 12, y: 17, art: 'plaque', solid: true, run: async () => { await S.say(null, ['바닥에 새겨진 글귀.', '「흐르는 모래는 시간을 따른다. 시간을 뒤집는 자만이 길을 걷는다.」']); } },
  ],
});

defMap('temple2', {
  name: '모래시계 사원 · 침묵의 제단', kind: 'dungeon', bgm: 'sandtemple', base: '8',
  tiles: [
    '777&7777777&7777777&7777', // 0
    '78888888888888887777>777', // 1
    '78888888888888887888|887', // 2
    '788888877cccccc778888887', // 3
    '788888878cccccc878888887', // 4
    '78888P878888888878P88887', // 5
    '788888878888888878888887', // 6
    '788888877778877778888887', // 7
    '788888888888888888888887', // 8
    '7888P8888888888888888P87', // 9
    '777787778888888877787777', // 10
    '788888888888888888888887', // 11
    '78888P888888888888P88887', // 12
    '788888888888888888888887', // 13
    '788888888888888888888887', // 14
    '788888888888888888888887', // 15
    '788888888888<88888888887', // 16
    '777777777777777777777777', // 17
  ],
  enc: { default: 'temple', zones: [{ x: 7, y: 1, w: 17, h: 9, enc: null }] },
  warps: [
    { x: 12, y: 16, to: 'temple1', tx: 12, ty: 3, dir: 'down' },
    { x: 20, y: 1, to: 'temple3', tx: 9, ty: 12, dir: 'up', sfx: 'stairs' },
  ],
  tileFlags: [{ flag: 'mio_rescued', at: [[20, 2]], tile: '8' }],
  triggers: [{ x: 9, y: 8, w: 6, h: 2, when: () => !Game.flag('mio_rescued'), run: () => Story.vaneRematch() }],
  npcs: [
    { id: 'vane_t2', x: 12, y: 7, look: 'vane', dir: 'down', noTurn: true, show: () => !Game.flag('mio_rescued'), talk: () => Story.vaneRematch() },
    { id: 'mio_caged', x: 11, y: 4, look: 'mio', dir: 'down', noTurn: true, show: () => !Game.flag('mio_rescued') },
  ],
  objects: [
    { type: 'event', x: 20, y: 2, solid: true, show: () => !Game.flag('mio_rescued'), run: async () => { await S.say(null, '아래로 내려가는 계단을 모래빛 철창이 막고 있다. 철창에 종 모양의 자물쇠가 달려 있다.'); } },
    { type: 'chest', id: 't2_w', x: 1, y: 1, item: 'desert_mail' },
    { type: 'chest', id: 't2_sw', x: 1, y: 15, item: 'mega_potion', n: 2 },
    { type: 'chest', id: 't2_se', x: 22, y: 15, item: 'oasis_ring' },
    { type: 'chest', id: 't2_e', x: 22, y: 8, item: 'flame_saber' },
    { type: 'search', id: 't2_sand', x: 6, y: 12, item: 'starwater', hidden: true, msg: '바닥의 모래 무늬 사이에서 별빛이 새어 나온다…!' },
  ],
});

defMap('temple3', {
  name: '모래 종의 방', kind: 'dungeon', bgm: () => (Game.flag('zahir_defeated') ? 'shrine' : 'sandtemple'), base: '8',
  tiles: [
    '777777777777777777', // 0
    '77777777OO77777777', // 1
    '777&777OOOO777&777', // 2
    '7778888cccc8888777', // 3
    '7778888cccc8888777', // 4
    '7778P88cccc88P8777', // 5
    '7778888cccc8888777', // 6
    '7778888cccc8888777', // 7
    '77&8888cccc8888&77', // 8
    '7778888cccc8888777', // 9
    '7778P88cccc88P8777', // 10
    '7778888cccc8888777', // 11
    '7778888cccc8888777', // 12
    '7778888cc<c8888777', // 13
    '777777777777777777', // 14
  ],
  warps: [{ x: 9, y: 13, to: 'temple2', tx: 20, ty: 3, dir: 'down' }],
  triggers: [{ x: 3, y: 3, w: 12, h: 7, when: () => !Game.flag('zahir_defeated'), run: () => Story.zahir() }],
  npcs: [
    { id: 'zahir_boss', x: 9, y: 5, look: 'zahir', dir: 'up', noTurn: true, show: () => !Game.flag('zahir_defeated'), talk: () => Story.zahir() },
    { id: 'zahir_down', x: 9, y: 5, look: 'zahir', dir: 'down', show: () => false },
    { id: 'aria_spirit', x: 9, y: 3, look: 'aria', dir: 'down', show: () => false },
    { id: 'osric_sand', x: 9, y: 12, look: 'osric', dir: 'up', show: () => false },
  ],
  objects: [
    { type: 'deco', x: 9, y: 2, draw: 'sandbell' },
    {
      type: 'event', x: 12, y: 12, art: 'circle', show: () => Game.flag('zahir_defeated'),
      run: async () => { if (await S.yesno(null, '모래 종이 남긴 마법진이 빛나고 있다. 오아시스 사미라로 돌아갈까?')) await S.warp('samira', 17, 25, 'up', { sfx: 'chime', slow: true }); },
    },
  ],
});

// 모래시계: 뒤집으면 흐르는 모래의 길이 바뀐다
const Hourglass = {
  async flip() {
    const p = Field.player;
    const on = !Game.flag('hg_flip');
    const willSink = (on ? HOURGLASS.B : HOURGLASS.A).some(([x, y]) => x === p.x && y === p.y);
    if (willSink) { Sound.sfx('buzzer'); await S.say(null, '발밑이 모래로 꺼질 것 같다. 여기서는 뒤집을 수 없다.'); return; }
    Game.setFlag('hg_flip', on);
    Sound.sfx('mist'); Engine.shake(3, 0.5);
    Field.refreshTiles();
    await S.say(null, on ? '커다란 모래시계를 뒤집었다. 쏴아아── 사원 곳곳에서 모래가 반대로 흐르기 시작했다.' : '모래시계를 다시 뒤집었다. 모래의 흐름이 원래대로 돌아왔다.');
  },
};
