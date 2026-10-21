'use strict';
// ─────────────────────────────────────────────────────────────
// 제4장 「파도의 종」 맵: 잿빛 해안 길 · 항구 마을 마레아(+실내) · 얼어붙은 해식 동굴 · 등대 · 유령선 · 가라앉은 신전
//  진행도(Game.progress): 25 출발 · 26 마레아 도착 · 27 동굴 개방 · 28 서리엄니 격파
//                         29 카산드라 합류 · 30 오르카 격파 · 31 레비아 격파 · 32 4장 완료
// ─────────────────────────────────────────────────────────────
const SNOW_WEATHER = () => 'snow';

// ── 잿빛 해안 길 ──
defMap('coast', {
  name: '잿빛 해안 길', kind: 'field', bgm: 'northsea', base: 'σ', weather: SNOW_WEATHER,
  tiles: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', // 0
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~σσσσσ~', // 1
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~σσλσσ~', // 2
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~σσσσσ~', // 3
    'σσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσσ~~rrr~σσσσσ~', // 4
    'σσσσσσσσσσσσσσσσσσσσστσσστσττσστστσσ~~rrrr~~~~~~', // 5
    'σσσσσσστrσσσσσσστσσσσσσσσσrστσσσσσrrrrrrr~~~~~~~', // 6
    'στσσσσσσσσVσστσσσσσσσσrσrσσσσσσστσσσ~~~~~~~~~~~~', // 7
    'σσσστσσσσσ:σσστσσσσσrσσσσrσσσσσσσσσσ~~~~~~~~~~~~', // 8
    'σσσσστσσσσ:στσσσσστσσσσσσσσσσσ^^^^^^^^~~~~~~~~~~', // 9
    'σσσrσσσσσσ:σσrσσσστσσσσσσσσσσσ^^^^^^^^σσσ~~~~~~~', // 10
    'σσσσσσσσσσ:σσσσσσσσσσσσσσστσσ^^^^^^^^^σσσ~~~~~~~', // 11
    'στσσσσσσσσ:σσrσσσσσστσσσστσσσ^^^^^^^^^τσσσ~~~~~~', // 12
    'σσσσσσστσσ:σσσσστσστσσσστσσrτ^^^σθσ^^^σστ~~~~~~~', // 13
    'σσσσσσσσσσ:σσrσσσσσσστσσσσσσσστσσ:σσrssssss~~~~~', // 14
    'σσσσσσσσrσ:σσrσσσσσσσσστσσσσσσσσσ:σrσσsssσ~~~~~~', // 15
    'σσσσrστστσ:σστσσσσσσσσrτσστσσστσσ:σσrsssss~~~~~~', // 16
    'σσσσσστττσ:Sσσσσσσσσσσσσσστrσσσσσ:σσσσsssss~~~~~', // 17
    'σσσσσσστσσ:::::::::::::::στσσσσσσ:σσσssssσ~~~~~~', // 18
    'στσσσσσσσσσσσσσσσσσσσσσσ:σσσσσσσσ:σσσσssss~~~~~~', // 19
    'σσσσσσσσσσσσσσστσσσττσσσ:σσσσσσσσ:σσσssssss~~~~~', // 20
    'σσσσσσσσσσσστσrσσσστσσσσ:σσσσσσσσ:σσσσsssr~~~~~~', // 21
    'σσσσσσrσσσσσσσσσσσσσσσσσ::::::::::σσσsssssss~~~~', // 22
    'σσσσσστσσσσσσσσσσσσστrσσ:σσσσσσσσσσσσσssssss~~~~', // 23
    'στσσσσσσσσrσσσσσσσσσσσσσ:σσσrστσσσσσσsssssss~~~~', // 24
    'σσσσστσσσσσσσσσσσσσσσσσσ:σσστττσστσσσσssssss~~~~', // 25
    'σσσσσσσσσσσσσσσστσσσσrσσ:σστστσσστστσsssssss~~~~', // 26
    'σσστσσσσσσσσσσσσσσσσσστσ:σσσσσσσσσστσσssssss~~~~', // 27
    'σσσσσσστσσσσσσσσσσσσστσσ:σσσσσσστσσσσsssssss~~~~', // 28
    'σσσστσσσσσσσσσσσσσττσσσσ:σσσσσσστσσσσσssssss~~~~', // 29
    'σσσσσστσσrσσrστσττσσσστσ:σσσσσσσσσσσσσσσσsssssss', // 30
    'σσσσrσrσσσσσσσσσσσσσττσσ:σσσrσσστσσσσσσσσsssssss', // 31
    'σσσσσσσσττσσσσσσσσσσσσσσ:σσσσσσσσσσσσrσσσsssssss', // 32
    'σσσσσστσσσσσσσσσσσσσσσσS:στσσσσστσσσσσσσσsssssss', // 33
    'σσσσσσσσσσστσσσσσσσστστσ:σσσσσσστσσσσστσσsssssss', // 34
    'ττττττττττττττττττττττττ:τττττττττττττττττττττττ', // 35
  ],
  enc: {
    default: 'coast',
    zones: [
      { x: 20, y: 29, w: 9, h: 7, enc: null },       // 숲길 출구
      { x: 7, y: 6, w: 7, h: 6, enc: null },         // 마을 앞
      { x: 30, y: 13, w: 7, h: 4, enc: null },       // 동굴 입구
    ],
  },
  warps: [
    { x: 24, y: 35, to: 'highway', tx: 42, ty: 1, dir: 'up' },
    { x: 10, y: 7, to: 'marea', tx: 19, ty: 28, dir: 'up' },
    {
      x: 33, y: 13, to: 'icecave', tx: 12, ty: 22, dir: 'up', sfx: 'stairs', cond: () => Game.flag('cave4_open'),
      blocked: async () => { await S.say(null, '얼음으로 뒤덮인 동굴 입구다. 안쪽에서 바닷바람이 휘파람 소리를 낸다.\n…무턱대고 들어가기엔 길을 모른다.'); },
    },
  ],
  onEnter: async () => {
    if (!Game.flag('coast_first')) {
      Game.setFlag('coast_first');
      await S.say(null, '(숲을 빠져나오자 하얀 눈밭 너머로 잿빛 바다가 펼쳐졌다. 차가운 바람에 소금 냄새가 섞여 있다.)');
      await Story.line('bran', '으, 추워! 사막에선 덥다고 투덜댔는데… 다시 사막으로 보내 줘!');
      await Story.line('linette', '북쪽 바닷가를 따라가면 항구 마을 마레아예요. 해가 지기 전에 도착해야 해요.');
      await Story.line('mio', '…종의 노래가 들려요. 파도에 섞여서, 아주 깊은 곳에서.');
      await Story.line('nell', '…저 멀리 등대. 불이 꺼져 있네.');
    }
  },
  npcs: [
    {
      id: 'king_crab', x: 41, y: 26, look: 'monster:king_crab', scale: 0.4, dir: 'down', noTurn: true,
      show: () => Quests.isActive('s_crab') && Quests.stage('s_crab') === 0,
      talk: () => Story.kingCrab(),
    },
    {
      id: 'coast_fisher', x: 22, y: 18, look: 'sailor', dir: 'down', move: 'turn',
      talk: async () => {
        await S.say('얼음 낚시꾼', byP({
          25: ['이 추위에 바닷가를 걷다니, 별난 사람들이로군.', '마레아는 서쪽이야. 등대 쪽은 가지 마. 절벽길이 무너졌거든.'],
          27: '해식 동굴로 간다고? 얼음 위에서 미끄러지면 바위에 부딪힐 때까지 못 멈춘다네. 몸조심하게.',
          29: '등대에 불이 들어왔어! 오랜만에 밤바다가 무섭지 않군.',
          32: '배들이 다시 나간다더군. 나도 내일은 배를 타고 고기 잡으러 갈 거야!',
        }));
      },
    },
  ],
  objects: [
    { type: 'sign', x: 23, y: 33, text: '↑ 항구 마을 마레아 (북서쪽)\n↓ 은빛 가도' },
    { type: 'sign', x: 11, y: 17, text: '← 항구 마을 마레아\n→ 등대 곶 (절벽길 통행 금지)' },
    { type: 'event', x: 34, y: 6, solid: true, run: async () => { await S.say(null, ['무너진 절벽길이다. 바위가 겹겹이 쌓여 있어 지나갈 수 없다.', '저 너머 곶 끝에 꺼진 등대가 서 있다.']); } },
    { type: 'chest', id: 'cs_w', x: 2, y: 12, item: 'warm_soup', n: 3 },
    { type: 'chest', id: 'cs_ne', x: 28, y: 4, item: 'fur_hood' },
    { type: 'chest', id: 'cs_sw', x: 3, y: 33, item: 'elixir' },
    { type: 'chest', id: 'cs_beach', x: 39, y: 31, gold: 1200 },
    { type: 'search', id: 'cs_drift', x: 37, y: 20, item: 'pearl_ring', hidden: true, msg: '모래톱에 떠밀려 온 조개껍데기 안에서 진주 반지가 반짝인다!' },
  ],
});

// ── 항구 마을 마레아 ──
defMap('marea', {
  name: '항구 마을 마레아', kind: 'town', bgm: 'harbor', base: 'σ', weather: SNOW_WEATHER,
  tiles: [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', // 0
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ππρρρρρ~~~~', // 1
    '~~~~ρρρ~πππππ~~~~~~~~~~~~~~~~ππρδδδρ~~~~', // 2
    '~~~~ρδρ~ππ~~~~~~~~~~~~~~~~~~~ππρρρρρ~~~~', // 3
    '~~~~ρρρ~ππ~~~~~~~~~~~~~~~~~~~ππ~~~~~~~~~', // 4
    '~~~~~~~~ππ~~~~~~~~~~~~~~~~~~~ππ~~~~~~~~~', // 5
    'ππππππππππππππππππππππππππππππππππππππππ', // 6
    'σσXσσσσσσσXXσσσσσσσ::XxσσσσσσσσσσσσσσXxσ', // 7
    'σσQQQQQQQQσRRRRRRRR::σQQQQQQQQσGGGGGGGGσ', // 8
    'σσQQQQQQQQσRRRRRRRR::σQQQQQQQQσGGGGGGGGσ', // 9
    'σσQQQQQQQQσRRRRRRRR::σQQQQQQQQσGGGGGGGGσ', // 10
    'σσBNBDNBBBσBNBDNBBB::σBNBDNBBBσBNBDNBBBσ', // 11
    'σσσσσ:σσσσσσσσ:σσσσ::σσσσ:σσσσσσσσ:σσσσσ', // 12
    'σ::::::::::::::::::::::::::::::::::::::σ', // 13
    'σ::::::::::::::::::::::::::::::::::::::σ', // 14
    'σσσσσσσσσσσσσσlσσσσ::σσσσlσσσσσσσσσσσσσσ', // 15
    'σσσσσσσσσσσσσσσσσσσo:σσσσσσσσσσσσσσσσσσσ', // 16
    'σσRRRRRRRRσσσσσσσσσ::σQQQQQQσσσGGGGGGGGσ', // 17
    'σσRRRRRRRRσσσσσσσσσ::σQQQQQQσσσGGGGGGGGσ', // 18
    'σσRRRRRRRRσσσσσσσσσ::σQQQQQQσσσGGGGGGGGσ', // 19
    'σσBNBDNBBBσσσσσσσσσ::σBNDBNBσσσBNBDNBBBσ', // 20
    'σσσσσ:σσσσσσxσσσσσσ::σσσσσσσσσσσσσ:σσσσσ', // 21
    'σσσσσ::::::::::::::::::::::::::::::σσσσσ', // 22
    'σστσστσσσσσστσσσσσσ::σστσσσσσσσσστσσσσσσ', // 23
    'σσσσσσσστσσσσσlσσσσ::σσσσlσxσσσσσσττστσσ', // 24
    'σστσσσστσσσσσσσσττσ::σσσσσσσστστσσσσσστσ', // 25
    'σσσσστσσσσσσσσσστσσ::σσσστσσσσσσσσσστσσσ', // 26
    'σσστσσσσσσσσσσσσσσσ::Sσσσστσστσσσσσσσσσσ', // 27
    'σσσσσσσσσσσσσσσστσσ::σσσττσσστσσσσσστσσσ', // 28
    'τττττττττττττττττττ::τττττττττττττττττττ', // 29
  ],
  edge: { map: 'coast', x: 10, y: 8, dir: 'down' },
  warps: [
    { x: 5, y: 11, to: 'harbor_office', tx: 6, ty: 8, dir: 'up' },
    { x: 14, y: 11, to: 'marea_inn', tx: 6, ty: 8, dir: 'up' },
    { x: 25, y: 11, to: 'marea_shop', tx: 6, ty: 7, dir: 'up' },
    { x: 5, y: 20, to: 'tavern', tx: 6, ty: 8, dir: 'up' },
    { x: 34, y: 20, to: 'eda_house', tx: 4, ty: 5, dir: 'up' },
    { x: 34, y: 11, to: 'marea', tx: 34, ty: 12, cond: () => false, blocked: async () => { await S.say(null, '창고 문은 굳게 잠겨 있다. 「출항 금지 ─ 항만장」이라는 쪽지가 붙어 있다.'); } },
    { x: 24, y: 20, to: 'marea', tx: 24, ty: 21, cond: () => false, blocked: async () => { await S.say(null, '빈집이다. 창문 너머로 먼지 쌓인 그물이 보인다.'); } },
  ],
  onEnter: async () => {
    if (!Game.flag('reached_marea')) await Story.arriveMarea();
  },
  npcs: [
    {
      id: 'dock_sailor', x: 23, y: 7, look: 'sailor', dir: 'down', move: 'turn',
      talk: async () => {
        await S.say('부두의 뱃사람', byP({
          25: ['배를 타러 왔다고? 미안하지만 한 달째 출항 금지야.', '안개 낀 밤마다 회색 돛을 단 배가 나타나. 그 배를 본 배는 돌아오지 않았어.'],
          29: '등대에 불이 켜졌어! 그런데 불빛에 비친 만 한가운데에… 그 회색 배가 떠 있더군.',
          30: '회색 배가 가라앉았다고? 바다가 갑자기 잠잠해졌어.',
          32: '출항이다, 출항! 한 달 치 그물을 던져야지!',
        }));
      },
    },
    {
      id: 'marea_kid', x: 16, y: 16, look: 'northKid', dir: 'down', move: 'wander', radius: 3,
      talk: async () => {
        await S.say('마을 아이', byP({
          25: '분수가 꽁꽁 얼었어. 겨울이 끝나지 않는대. 바다가 화가 났대.',
          29: '등대 할아버지가 돌아왔대! 에다 언니가 엄청 울었대.',
          32: '분수가 녹았어! 봐, 물이 나와!',
        }));
      },
    },
    {
      id: 'marea_fisher', x: 30, y: 15, look: 'fisherF', dir: 'left', move: 'wander', radius: 2,
      talk: async () => {
        await S.say('생선 장수', byP({
          25: ['생선이 없어. 배가 못 나가니까. 남은 건 말린 대구뿐이야.', '선술집 엘사네 수프는 아직 끓고 있을 거야. 몸 녹이고 가.'],
          32: '오늘 아침 첫 배가 돌아왔어! 펄떡펄떡 뛰는 생선을 보니 눈물이 다 나네.',
        }));
      },
    },
    {
      id: 'marea_old', x: 10, y: 24, look: 'oldman', dir: 'down', move: 'turn',
      talk: async () => {
        await S.say('늙은 어부', byP({
          25: ['15년 전에도 이랬지. 바다가 울부짖던 해. 해군의 「은빛 갈매기호」가 그 폭풍에 가라앉았어.', '함장 오르카는 마지막까지 선원들을 구하려 했다더군. 결국 혼자 살아 돌아왔지만.'],
          30: '회색 배의 선장이 오르카였다고…? 그 사람, 15년 동안 바다에서 선원들을 찾아 헤맸던 건가.',
        }));
      },
    },
  ],
  objects: [
    { type: 'sign', x: 21, y: 27, text: '항구 마을 마레아\n「등불이 꺼지지 않는 북쪽의 항구」' },
    { type: 'event', x: 19, y: 16, solid: true, run: async () => { await S.say(null, Game.flag('chapter4_done') ? '분수가 녹아 맑은 물이 졸졸 흐른다.' : '광장의 분수가 꽁꽁 얼어 있다. 물줄기가 솟구친 모양 그대로 굳어 버렸다.'); } },
    {
      type: 'event', x: 31, y: 2, solid: true,
      run: async () => {
        if (!Game.flag('boat_ready')) { await S.say(null, '항만장의 작은 배다. 밧줄로 단단히 묶여 있다.'); return; }
        if (Game.flag('orca_defeated')) { await S.say(null, '그레고르의 작은 배다. 이제는 갈매기들의 쉼터가 되었다.'); return; }
        await Story.boardShip();
      },
    },
    { type: 'search', id: 'mr_crate', x: 10, y: 7, item: 'warm_soup', n: 2, msg: '나무 상자 안에 「얼지 않게 품에 넣어 갈 것」이라고 적힌 수프 통이 있다.', empty: '빈 상자다.' },
    { type: 'search', id: 'mr_barrel', x: 12, y: 21, item: 'hi_ether', msg: '술통 바닥에서 이슬병 하나가 굴러 나왔다.', empty: '얼음 낀 빈 술통이다.' },
  ],
});

// ── 마레아 실내 ──
defMap('harbor_office', {
  name: '항만 사무소', kind: 'interior', bgm: 'harbor', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'ILLzwwttwwzLLI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IpwwkkkkkkwwpI', // 4
    'IwwwwwwwwwwwwI', // 5
    'IxwwccccccwwxI', // 6
    'IXwwccccccwwXI', // 7
    'IpwwccccccwwpI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'marea', tx: 5, ty: 12, dir: 'down' }],
  npcs: [
    {
      id: 'gregor', x: 6, y: 3, look: 'gregor', dir: 'down',
      mark: () => P() === 26 || (P() === 29 && !Game.flag('boat_ready')) || P() === 31 || (Quests.isActive('s_crab') && Quests.stage('s_crab') === 1),
      talk: () => Story.gregor(),
    },
    { id: 'office_clerk', x: 11, y: 6, look: 'sailor', dir: 'left', talk: async () => { await S.say('사무소 직원', byP({ 26: '항만장님은 무뚝뚝해 보여도 마을 사람들 걱정에 한 달째 잠을 못 주무세요.', 29: '항만장님이 배를 내주신다고요? 그분 배는 돌아가신 사모님 이름을 딴 거라 아무도 못 타게 했는데…', 32: '오늘 출항 허가서만 백 장째 쓰고 있어요! 행복한 비명이에요.' })); } },
  ],
  objects: [
    { type: 'event', x: 7, y: 2, solid: true, run: () => Story.bountyBoard() },
    { type: 'event', x: 1, y: 2, solid: true, run: async () => { await S.say(null, ['벽에 북해 해도가 걸려 있다. 마레아 북쪽 바다 한가운데에 붉은 동그라미가 그려져 있다.', '동그라미 옆에는 「은빛 갈매기호 침몰 지점」이라고 적혀 있다.']); } },
    { type: 'search', id: 'ho_drawer', x: 3, y: 2, item: 'hi_potion', n: 3, msg: '서랍장 안에 구급상자가 있다.', empty: '서랍장 안은 비어 있다.' },
  ],
});

defMap('marea_inn', {
  name: '여관 「등불」', kind: 'interior', bgm: 'harbor', base: 'w',
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
  warps: [{ x: 6, y: 9, to: 'marea', tx: 14, ty: 12, dir: 'down' }],
  npcs: [
    {
      id: 'inn_hilda', x: 2, y: 3, look: 'matron', dir: 'down',
      talk: async () => {
        await S.say('여관 주인 힐다', byP({ 25: '「등불」에 어서 와요. 등대가 꺼진 뒤로 우리 간판 이름이 좀 민망해졌지만요.', 29: '등대에 불이 들어왔어요! 오늘은 간판도 반짝반짝 닦아야지.', 32: '바다가 열렸으니 손님이 넘쳐나겠네요. 당신들 방은 늘 비워 둘게요.' }));
        await S.inn(Math.max(18, Game.state.party.length * 8), '여관 주인 힐다');
      },
    },
    { id: 'inn_traveler', x: 4, y: 7, look: 'merchant', dir: 'right', talk: async () => { await S.say('발 묶인 상인', byP({ 25: '배가 안 떠서 한 달째 여기서 먹고 자고 있다오. 지갑이 얼어붙을 지경이야.', 30: '유령선이 가라앉았다고? 그럼 배가 뜨는 건가! 짐을 싸야겠군.' })); } },
  ],
  objects: [{ type: 'search', id: 'mi_dresser', x: 12, y: 2, item: 'warm_soup', n: 2, msg: '서랍 안에 보온병에 담긴 수프가 있다. 「밤바다 지킴이들에게 ─ 힐다」', empty: '서랍 안은 비어 있다.' }],
});

defMap('marea_shop', {
  name: '잡화점 「닻과 그물」', kind: 'interior', bgm: 'harbor', base: 'w',
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
  warps: [{ x: 6, y: 8, to: 'marea', tx: 25, ty: 12, dir: 'down' }],
  npcs: [
    { id: 'shop_smith', x: 3, y: 3, look: 'capsmith', dir: 'down', talk: async () => { await S.say('대장장이 비욘', byP({ 25: '북쪽 바다에선 칼보다 먼저 손이 얼어. 장갑부터 사라고 하고 싶지만… 우린 무기만 팔지.', 32: '고래뼈 갑옷이 잘 맞나? 바다 사람들의 지혜라고.' })); await Shop.open('marea_arms'); } },
    { id: 'shop_keeper', x: 10, y: 3, look: 'fisherF', dir: 'down', talk: async () => { await S.say('잡화점 주인 잉가', byP({ 25: '수프 사 가요, 수프! 얼어붙은 몸도 한 번에 녹아요.', 32: '바다가 열렸으니 이제 귀한 물건도 들어올 거예요!' })); await Shop.open('marea_items'); } },
  ],
  objects: [{ type: 'search', id: 'ms_jar', x: 11, y: 2, item: 'warm_charm', msg: '항아리 안에 따뜻한 기운이 도는 부적이 들어 있다.', empty: '소금 냄새가 난다.' }],
});

defMap('tavern', {
  name: '선술집 「갈매기」', kind: 'interior', bgm: 'harbor', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IfjjwwxxwwiiiI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IwwwwwwwkkkkkI', // 4
    'IwthwthwwwwwwI', // 5
    'IwwwwwwwwwwwwI', // 6
    'IwthwthwwthwwI', // 7
    'IpwwwwwwwwwwpI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'marea', tx: 5, ty: 21, dir: 'down' }],
  npcs: [
    {
      id: 'elsa', x: 10, y: 3, look: 'innkeeper', dir: 'down',
      mark: () => Quests.isActive('s_frozen'),
      talk: () => Story.elsa(),
    },
    { id: 'tavern_sailor1', x: 2, y: 6, look: 'sailor', dir: 'right', talk: async () => { await S.say('취한 뱃사람', byP({ 25: ['해식 동굴의 서리엄니 녀석? 얼음 갑옷을 두르면 작살도 튕겨 나가지.', '그 녀석을 녹이는 건… 뻔하지 않나? 여기 엘사 수프처럼 뜨거운 거. 딸꾹.'], 30: '유령선 선장이 오르카였다니… 그 함장은 우리 아버지 세대의 영웅이었어.' })); } },
    { id: 'tavern_sailor2', x: 5, y: 8, look: 'sailor', dir: 'up', talk: async () => { await S.say('노련한 항해사', byP({ 25: ['바다 사람들은 물때를 읽지.', '물이 차오를 땐 칼을 거두고, 물이 빠질 땐 입을 다무는 거야. 바다가 가르쳐 준 거라네.'], 32: '물때를 읽을 줄 아는 녀석들이었군. 한잔 사지!' })); } },
  ],
  objects: [{ type: 'search', id: 'tv_jar', x: 3, y: 2, item: 'warm_soup', n: 2, msg: '항아리 안에 수프 통조림이 있다. 「손님용 아님 ─ 엘사」 …라고 적혀 있지만.', empty: '항아리 안은 비어 있다.' }],
});

defMap('eda_house', {
  name: '등대지기의 집', kind: 'interior', bgm: 'harbor', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IfwwzwwbwI', // 2
    'IwwwwwwwwI', // 3
    'IwhtthwwjI', // 4
    'IwwwwwwwpI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'marea', tx: 34, ty: 21, dir: 'down' }],
  npcs: [
    {
      id: 'eda', x: 6, y: 3, look: 'eda', dir: 'down',
      mark: () => Game.flag('met_gregor') && !Game.flag('cave4_open'),
      talk: () => Story.eda(),
    },
    { id: 'bartol_home', x: 2, y: 3, look: 'bartol', dir: 'down', show: () => Game.flag('cassandra_joined'), talk: () => Story.bartol() },
  ],
  objects: [
    { type: 'event', x: 7, y: 2, solid: true, run: async () => { await S.say(null, '할아버지의 침대. 머리맡에 등대 렌즈를 닦던 낡은 헝겊이 개어져 있다.'); } },
    { type: 'search', id: 'eh_jar', x: 8, y: 4, item: 'elixir', msg: '항아리 안에 「등대지기의 비상약」이라고 적힌 작은 병이 있다.', empty: '항아리 안은 비어 있다.' },
  ],
});

// ── 얼어붙은 해식 동굴 ──
defMap('icecave', {
  name: '얼어붙은 해식 동굴', kind: 'dungeon', bgm: 'cave', base: 'ι',
  tiles: [
    'ΨΨΨΨΨΨΨΨΨΨΨΨσΨΨΨΨΨΨΨΨΨΨΨΨΨ', // 0
    'ΨσσσσΨΨσσσσσσσσσσσσΨΨσσσσΨ', // 1
    'ΨσσσσΨΨσσσσσσσσσσσσΨΨσσσσΨ', // 2
    'ΨσσσσσσσσσσσσσσσσσσσσσσσσΨ', // 3
    'ΨσσσσΨΨσσσσσσσσσσσσΨΨσσσσΨ', // 4
    'ΨΨΨΨΨΨΨσσσσσσσσσσσσΨΨΨΨΨΨΨ', // 5
    'ΨΨΨΨΨΨΨΨΨΨΨΨσΨΨΨΨΨΨΨΨΨΨΨΨΨ', // 6
    'ΨιιιιιιιιιιιιιιιιιιrιιιιιΨ', // 7
    'ΨιιιrιιιιιrιιιιιιιιιιιιιιΨ', // 8
    'ΨισσιιιιιιιιιιιιιrιιιιιιιΨ', // 9
    'ΨισσιιιιιιιrιιιιιιιιιιιιιΨ', // 10
    'ΨιιιιιιιrιιιιιιιιιιιιιιιιΨ', // 11
    'ΨrιιιιιιιιιιιιιιιιιιιιrιιΨ', // 12
    'ΨιιιιιιιιιιιrιιιιιιιιιιιιΨ', // 13
    'ΨιιιιrιιιιιιιιιιιιrιιιιιιΨ', // 14
    'ΨιιιιιιιιιιrιιιιιιιιισσιιΨ', // 15
    'ΨιιιιιιιιιιιιιιrιιιιισσιιΨ', // 16
    'ΨιιιιιrιιιιιιιιιιιιιrιιιιΨ', // 17
    'ΨιιιιιιιιιιιιrιιιιιιιιιιιΨ', // 18
    'ΨΨΨΨΨΨΨΨΨΨΨΨσΨΨΨΨΨΨΨΨΨΨΨΨΨ', // 19
    'ΨΨΨΨΨΨΨΨσσσσσσσσσΨΨΨΨΨΨΨΨΨ', // 20
    'ΨΨΨΨΨΨΨΨσσσσσσσσσΨΨΨΨΨΨΨΨΨ', // 21
    'ΨΨΨΨΨΨΨΨσσσσσσσσσΨΨΨΨΨΨΨΨΨ', // 22
    'ΨΨΨΨΨΨΨΨΨΨΨΨσΨΨΨΨΨΨΨΨΨΨΨΨΨ', // 23
  ],
  enc: { default: 'icecave', zones: [{ x: 7, y: 19, w: 11, h: 5, enc: null }, { x: 0, y: 0, w: 26, h: 7, enc: null }] },
  warps: [
    { x: 12, y: 23, to: 'coast', tx: 33, ty: 14, dir: 'down', sfx: 'stairs' },
    { x: 12, y: 0, to: 'lighthouse1', tx: 5, ty: 8, dir: 'up', sfx: 'stairs' },
  ],
  triggers: [{ x: 7, y: 3, w: 12, h: 3, when: () => !Game.flag('walrus_defeated'), run: () => Story.walrus() }],
  onEnter: async () => {
    if (!Game.flag('icecave_first')) {
      Game.setFlag('icecave_first');
      await S.say(null, '(동굴 바닥이 거울처럼 매끈한 얼음으로 뒤덮여 있다. 천장에서 고드름이 우는 소리가 난다.)');
      await Story.line('linette', '전부 얼음이에요. 한번 미끄러지면… 무언가에 부딪힐 때까지 멈추지 못할 거예요.');
      await Story.line('bran', '미끄럼틀이네! …아, 아니, 신중하게 가자. 신중하게.');
    }
  },
  npcs: [
    { id: 'walrus', x: 12, y: 1, look: 'monster:frost_walrus', scale: 0.3, dir: 'down', noTurn: true, show: () => !Game.flag('walrus_defeated'), talk: () => Story.walrus() },
  ],
  objects: [
    { type: 'chest', id: 'ic_isle_w', x: 2, y: 9, item: 'frost_brand' },
    { type: 'search', id: 'ic_letter', x: 3, y: 10, item: 'frozen_letter', msg: '얼음 속에 편지 한 통이 갇혀 있다. 조심스럽게 얼음을 깨서 꺼냈다.', empty: '얼음 조각만 남아 있다.', after: () => Story.frozenLetter() },
    { type: 'chest', id: 'ic_isle_e', x: 22, y: 16, item: 'sealskin_coat' },
    { type: 'search', id: 'ic_isle_e2', x: 21, y: 15, item: 'hi_ether', n: 2, hidden: true, msg: '눈 속에 파묻힌 이슬병 두 개를 찾았다!' },
    { type: 'chest', id: 'ic_nw', x: 1, y: 1, item: 'warm_soup', n: 3 },
    { type: 'chest', id: 'ic_ne', x: 24, y: 1, item: 'coral_shield' },
    { type: 'chest', id: 'ic_entry', x: 16, y: 22, item: 'hi_potion', n: 3 },
  ],
});

// ── 등대 ──
defMap('lighthouse1', {
  name: '등대 · 1층', kind: 'dungeon', bgm: () => (Game.flag('cassandra_joined') ? 'shrine' : 'tower'), base: '_',
  tiles: [
    '############', // 0
    '#####<######', // 1
    '###______###', // 2
    '##________##', // 3
    '#_x______X_#', // 4
    '#__________#', // 5
    '##________##', // 6
    '###______###', // 7
    '#####_######', // 8
    '#####_######', // 9
  ],
  warps: [
    { x: 5, y: 9, to: 'icecave', tx: 12, ty: 1, dir: 'down', sfx: 'stairs' },
    { x: 5, y: 1, to: 'lighthouse2', tx: 5, ty: 6, dir: 'up', sfx: 'stairs' },
  ],
  onEnter: async () => {
    if (!Game.flag('lighthouse_first')) {
      Game.setFlag('lighthouse_first');
      await S.say(null, '(등대 안은 바깥보다 더 춥다. 벽을 타고 잿빛 서리가 피어 있다. 그리고 계단 아래에…)');
      await Story.line('mio', '누가 있어요! 사람이… 얼어붙어 있어요!');
    }
  },
  npcs: [
    { id: 'bartol_frozen', x: 3, y: 5, look: 'bartol', dir: 'up', noTurn: true, show: () => !Game.flag('cassandra_joined'), talk: async () => { await S.say(null, ['잿빛 서리에 뒤덮인 노인이다. 희미하게 숨을 쉬고 있다.', '서리는 위층에서부터 흘러내린 것 같다.']); await Story.line('linette', '이 냉기… 그냥 얼음이 아니에요. 위에 있는 무언가가 내뿜고 있어요.'); } },
  ],
  objects: [
    { type: 'chest', id: 'lh_chest', x: 8, y: 6, item: 'captain_hat' },
    { type: 'search', id: 'lh_crate', x: 9, y: 4, item: 'warm_soup', n: 2, msg: '상자 안에 등대지기의 비상식량이 있다.', empty: '빈 상자다.' },
  ],
});

defMap('lighthouse2', {
  name: '등대 · 등명실', kind: 'dungeon', bgm: () => (Game.flag('cassandra_joined') ? 'shrine' : 'tower'), base: '_',
  tiles: [
    '############', // 0
    '####&##&####', // 1
    '###______###', // 2
    '##________##', // 3
    '#__________#', // 4
    '#__________#', // 5
    '##________##', // 6
    '###__>___###', // 7
    '############', // 8
  ],
  warps: [{ x: 5, y: 7, to: 'lighthouse1', tx: 5, ty: 2, dir: 'down', sfx: 'stairs' }],
  triggers: [{ x: 1, y: 4, w: 10, h: 3, when: () => !Game.flag('cassandra_joined'), run: () => Story.cassandraLighthouse() }],
  npcs: [
    { id: 'cass_lh', x: 6, y: 3, look: 'cassandra', dir: 'up', noTurn: true, show: () => !Game.flag('cassandra_joined'), talk: () => Story.cassandraLighthouse() },
    { id: 'elite_lh1', x: 3, y: 4, look: 'knight', dir: 'down', show: () => false },
    { id: 'elite_lh2', x: 8, y: 4, look: 'knight', dir: 'down', show: () => false },
  ],
  objects: [
    { type: 'event', x: 5, y: 2, solid: true, art: 'lens', run: async () => { await S.say(null, Game.flag('cassandra_joined') ? '거대한 등대 렌즈가 별빛처럼 빛나며 밤바다를 비추고 있다.' : '거대한 등대 렌즈. 렌즈 안쪽에서 잿빛 불꽃이 차갑게 타고 있다.'); } },
    { type: 'event', x: 6, y: 2, solid: true, run: async () => { await S.say(null, '렌즈를 받치는 놋쇠 받침대다. 꽁꽁 얼어 있다.'); } },
    {
      type: 'event', x: 9, y: 5, art: 'circle', show: () => Game.flag('cassandra_joined'),
      run: async () => { if (await S.yesno(null, '등대 불빛 아래 마법진이 빛나고 있다. 항구 마을 마레아로 돌아갈까?')) await S.warp('marea', 19, 15, 'down', { sfx: 'chime', slow: true }); },
    },
  ],
});

// ── 유령선 「회색 갈매기호」 ──
defMap('ship_deck', {
  name: '유령선 · 갑판', kind: 'dungeon', bgm: 'ghostship', base: 'δ', weather: () => 'snow',
  tiles: [
    'ρρρρρρρρρρρρρρρρρρρρρρρρρρ', // 0
    'ρρρδδδδδδδδδδδδδδρδδδρρρρρ', // 1
    'ρρρδδδδδδδδδδδδδδρδδδρρρρρ', // 2
    'ρδδδδδδδδδδδδδδxδρδδδδδδρρ', // 3
    'ρδδδxxδδδδδδδδXδδρδδδδδδρρ', // 4
    'ρδδδδδδδδμδδδδδδδρδδδδδδρρ', // 5
    'ρδδδδδδδδδδδδδδδδρδδδδδδρρ', // 6
    'ρδδδδδδδδδδ>δδδδδρδδδδδδρρ', // 7
    'ρδδδδδδδδδδδδδδδδρδδδδδδρρ', // 8
    'ρδδδδδδδδδδδδμδδδρδδδδδδρρ', // 9
    'ρδδδxδδδδδδδδδδδδρδδδδδδρρ', // 10
    'ρδδδδδδXδδδδδδδxδρδδδδδδρρ', // 11
    'ρρρδδδδδδδδδδδδδδρδδδρρρρρ', // 12
    'ρρρδδδδδδδδδδδδδδρδδδρρρρρ', // 13
    'ρρρρρρρρρρρρρρρρρρρρρρρρρρ', // 14
  ],
  enc: { default: 'ship', zones: [{ x: 1, y: 5, w: 4, h: 5, enc: null }, { x: 18, y: 1, w: 7, h: 13, enc: null }] },
  warps: [
    { x: 11, y: 7, to: 'ship_hold', tx: 11, ty: 3, dir: 'down', sfx: 'stairs' },
  ],
  triggers: [{ x: 18, y: 3, w: 4, h: 9, when: () => !Game.flag('orca_defeated'), run: () => Story.orca() }],
  onEnter: async () => {
    if (!Game.flag('ship_first')) {
      Game.setFlag('ship_first');
      S.stage('main5', 7);
      await S.say(null, '(밧줄 사다리를 타고 오르자, 축축한 갑판 위로 안개가 깔려 있다. 돛대 끝의 등불이 초록빛으로 흔들린다.)');
      await Story.line('cassandra', ['…이 배야. 성가대가 「회색 갈매기호」라고 부르던 배.', '선장은 늘 선미 갑판에서 키를 잡고 있어. 하지만 갑판에서 바로는 못 가. 선창을 지나야 해.']);
      await Story.line('bran', '유, 유령선… 진짜 유령선이잖아…!');
      await S.goalUpdate('main5');
    }
  },
  npcs: [
    { id: 'orca_helm', x: 22, y: 7, look: 'orca', dir: 'left', noTurn: true, show: () => !Game.flag('orca_defeated'), talk: () => Story.orca() },
  ],
  objects: [
    {
      type: 'event', x: 1, y: 7, art: 'rope',
      run: async () => { if (await S.yesno(null, '밧줄 사다리가 작은 배로 이어져 있다. 마레아로 돌아갈까?')) await S.warp('marea', 30, 3, 'down', { sfx: 'stairs' }); },
    },
    { type: 'chest', id: 'sd_bow', x: 3, y: 1, item: 'tide_axe' },
    { type: 'chest', id: 'sd_stern', x: 20, y: 13, item: 'siren_harp' },
    { type: 'search', id: 'sd_barrel', x: 4, y: 10, item: 'hi_ether', msg: '술통 안에 이슬병이 떠 있다. 아직 마실 수 있을 것 같다.', empty: '바닷물이 찰랑거린다.' },
  ],
});

defMap('ship_hold', {
  name: '유령선 · 선창', kind: 'dungeon', bgm: 'ghostship', base: 'δ',
  tiles: [
    'ρρρρρρρρρρρρρρρρρρρρρρρρρρ', // 0
    'ρδδδδδδδδδδδδδρδδδδδδδδδδρ', // 1
    'ρδXXδδδδδδδ<δδρδXXδδδδ<δδρ', // 2
    'ρδXδδδδδδδδδδδρδδδδδδδδδδρ', // 3
    'ρδδδδδδδδδδδδδδδδδδδδδδδδρ', // 4
    'ρδδδδδδδδδδδδδρδxδδδδδδδXρ', // 5
    'ρδδδδδδδδδδδXδρδδδδδδδδδδρ', // 6
    'ρδδδxδδδδδδδδδρρρρρδρρρρρρ', // 7
    'ρδδδδδδδδδδδδδρδδδδδδδδδδρ', // 8
    'ρδδδδδδδδxδδδδρδttδδδδLLδρ', // 9
    'ρδδδδδδδδδδδδδδδδδδδδδδδδρ', // 10
    'ρδδδδδXXδδδδδδρδδδδδδδδδδρ', // 11
    'ρδxδδδδδδδδδxδρδδδδδδδδbδρ', // 12
    'ρρρρρρρρρρρρρρρρρρρρρρρρρρ', // 13
  ],
  enc: { default: 'ship', zones: [{ x: 9, y: 1, w: 5, h: 4, enc: null }, { x: 15, y: 8, w: 10, h: 5, enc: null }] },
  warps: [
    { x: 11, y: 2, to: 'ship_deck', tx: 11, ty: 8, dir: 'up', sfx: 'stairs' },
    { x: 22, y: 2, to: 'ship_deck', tx: 20, ty: 7, dir: 'up', sfx: 'stairs' },
  ],
  objects: [
    { type: 'search', id: 'sh_notebook', x: 22, y: 9, item: 'osric_notebook', msg: '책장 사이에 낡은 수첩 한 권이 꽂혀 있다. 이 배의 항해일지는 아닌 것 같다.', empty: '젖은 해도와 항해일지만 꽂혀 있다.', after: () => Story.osricNotebook() },
    { type: 'chest', id: 'sh_cabin', x: 16, y: 12, item: 'whale_mail' },
    { type: 'chest', id: 'sh_mimic', x: 18, y: 11, item: 'sailor_knot', color: 'red', mimic: true, monster: 'barnacle_chest', bg: 'ship' },
    { type: 'chest', id: 'sh_fore', x: 1, y: 12, item: 'coral_dagger' },
    { type: 'chest', id: 'sh_mid', x: 13, y: 1, item: 'mega_potion', n: 3 },
    { type: 'chest', id: 'sh_aft', x: 24, y: 1, item: 'pearl_staff' },
    { type: 'event', x: 23, y: 12, solid: true, run: async () => { await S.say(null, ['선장의 침대. 베개맡에 빛바랜 사진 한 장이 놓여 있다.', '마흔 명 남짓한 선원들이 갑판에 모여 웃고 있다. 가운데에 젊은 함장이 서 있다.']); } },
  ],
});

// ── 가라앉은 신전 ──
defMap('sunken1', {
  name: '가라앉은 신전', kind: 'dungeon', bgm: 'ghostship', base: 'κ',
  tiles: [
    'ΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚ', // 0
    'Κκκκκκκκκκκκ>κςκκκκκκκκΚ', // 1
    'ΚκκκκκκκκςκκκκςκκκκκκκκΚ', // 2
    'ΚκκPκκκκκκςκκκκκκκκκPκκΚ', // 3
    'ΚκκςκκκκςκκκκκκκκκκκκκκΚ', // 4
    'ΚκκςκκκκκκκκκκκκκκκκκςκΚ', // 5
    'ΚΚΚΚΚκΚΚΚΚκκκκΚΚΚΚκΚΚΚΚΚ', // 6
    'ΚκκκκκκκκκκΚΚκκκκκκκκκκΚ', // 7
    'ΚκκκκκκκκςκΚΚκκςκκκκκκκΚ', // 8
    'ΚκκPκκκκκκκΚΚκκςκκκκPκςΚ', // 9
    'ΚκκκκκκκκκκΚΚκκςκςκκκκκΚ', // 10
    'ΚκκκκκκκκκκΚΚκκκκκκκκκκΚ', // 11
    'ΚκκκκκκΚΚΚΚΚΚΚΚΚΚκκκκςκΚ', // 12
    'ΚςκκκκκκκκκκκκκκκκκκκκκΚ', // 13
    'ΚκκκκκκκκκκκκκςκκκκκκκκΚ', // 14
    'ΚκκκκκκκPκκκκκςPκκκκκκκΚ', // 15
    'ΚκςPκκκκκκκκκκκκκκκκPκκΚ', // 16
    'ΚκκκκκκκκκκκκκκκκκκκκκκΚ', // 17
    'ΚκκκκκκκκκκκκκκκςκκκκκκΚ', // 18
    'ΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚ', // 19
  ],
  enc: { default: 'sunken', zones: [{ x: 9, y: 14, w: 7, h: 6, enc: null }, { x: 9, y: 1, w: 7, h: 3, enc: null }] },
  warps: [{ x: 12, y: 1, to: 'sunken2', tx: 9, ty: 11, dir: 'up', sfx: 'stairs' }],
  onEnter: async () => {
    if (!Game.flag('sunken_first')) {
      Game.setFlag('sunken_first');
      await S.say(null, '(정신을 차리자, 일행은 거대한 공기 방울 안에 서 있었다. 머리 위로 물고기 떼가 지나간다.)');
      await Story.line('mio', '숨을 쉴 수 있어요…! 종이… 우리를 받아 준 거예요.');
      await Story.line('linette', '바닷속 신전이에요. 파도 종이 이 깊은 곳에 있었던 거예요.');
    }
  },
  objects: [
    { type: 'event', x: 8, y: 15, solid: true, art: 'plaque', run: async () => { await S.say(null, ['벽에 새겨진 오래된 벽화. 거대한 문어 같은 수호자가 종을 감싸 안고 있다.', '「수호자의 팔이 많을수록 바다는 높이 일어난다. 팔을 거두어라, 그러면 파도도 눕는다.」', '그 아래에 반쯤 지워진 글귀가 이어진다. 「…하늘이 으르렁대는 밤이면, 수호자는 깊은 곳으로 몸을 숨겼다…」']); } },
    { type: 'chest', id: 'sk_ne', x: 22, y: 1, item: 'seafoam_robe' },
    { type: 'chest', id: 'sk_nw', x: 1, y: 1, item: 'elixir' },
    { type: 'chest', id: 'sk_w', x: 1, y: 11, item: 'mega_potion', n: 3 },
    { type: 'chest', id: 'sk_e', x: 22, y: 11, item: 'pearl_ring' },
    { type: 'search', id: 'sk_shell', x: 15, y: 17, item: 'elixir', hidden: true, msg: '커다란 조개가 입을 벌리자 안에서 영약이 반짝인다!' },
  ],
});

defMap('sunken2', {
  name: '파도 종의 방', kind: 'dungeon', bgm: () => (Game.flag('levia_defeated') ? 'shrine' : 'ghostship'), base: 'κ',
  tiles: [
    'ΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚ', // 0
    'ΚΚΚΚΚΚΚΚOOΚΚΚΚΚΚΚΚ', // 1
    'ΚΚΚΚΚΚΚOOOOΚΚΚΚΚΚΚ', // 2
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 3
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 4
    'ΚΚΚκPκκccccκκPκΚΚΚ', // 5
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 6
    'ΚΚΚκςκκccccκκςκΚΚΚ', // 7
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 8
    'ΚΚΚκPκκccccκκPκΚΚΚ', // 9
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 10
    'ΚΚΚκκκκccccκκκκΚΚΚ', // 11
    'ΚΚΚκκκκcc<cκκκκΚΚΚ', // 12
    'ΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚΚ', // 13
  ],
  warps: [{ x: 9, y: 12, to: 'sunken1', tx: 12, ty: 2, dir: 'down' }],
  triggers: [{ x: 3, y: 3, w: 12, h: 7, when: () => !Game.flag('levia_defeated'), run: () => Story.levia() }],
  npcs: [
    { id: 'levia_npc', x: 9, y: 4, look: 'monster:levia', scale: 0.28, dir: 'down', noTurn: true, show: () => !Game.flag('levia_defeated'), talk: () => Story.levia() },
    { id: 'osric_sea', x: 9, y: 11, look: 'osric', dir: 'up', show: () => false },
  ],
  objects: [
    { type: 'deco', x: 9, y: 2, draw: 'wavebell' },
    {
      type: 'event', x: 12, y: 11, art: 'circle', show: () => Game.flag('levia_defeated'),
      run: async () => { if (await S.yesno(null, '파도 종이 남긴 마법진이 빛나고 있다. 항구 마을 마레아로 돌아갈까?')) await S.warp('marea', 19, 15, 'down', { sfx: 'chime', slow: true }); },
    },
  ],
});
