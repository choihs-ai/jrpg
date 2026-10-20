'use strict';
// ─────────────────────────────────────────────────────────────
// 리벨 마을 + 실내 맵
// ─────────────────────────────────────────────────────────────
const P = () => Game.progress();
const has = (id) => Game.inParty(id);

defMap('rivel', {
  name: '리벨 마을', kind: 'town', bgm: 'town', base: '.',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
    'T..TT.TT.TT.TT.TT.TT.TT.TT.TT.TT.TT.TT.T', // 1
    'TT.............GGGGGGG.TT.QQQQQQQ......T', // 2
    'TT..........TT.GGGGGGG....QQQQQQQ..T..TT', // 3
    'T.............SWnWDWnW...PBNBDBNBP....TT', // 4
    'TT..............:::::::::::::::........T', // 5
    'TT...........""....::...............T.TT', // 6
    'T..RRRRRRR...".....::.."".............TT', // 7
    'TT.RRRRRRR.T.......::...".T..GGGGGGG...T', // 8
    'TTxWnWDWnW..T......::....T...GGGGGGG..TT', // 9
    'T.x...:...S......l.::.l.....SWnWDWnWx.TT', // 10
    'TT...:::::::::::::::::::::::::::::::...T', // 11
    'TT.""...T..T....qqqqqqqq..............TT', // 12
    'T...............qqqqqqqq...T......."".TT', // 13
    'TT.RRRRRRRX.....qqqoqqqq.....RRRRR.""..T', // 14
    'TT.RRRRRRRx.....qqqqqqqq.....RRRRR..".TT', // 15
    'T..BNBDBNB..."".qqqqqqqq."".jWnDnWj...TT', // 16
    'TT....:...S........::......T...:.......T', // 17
    'TT....:::::::::::::::::::::::::::...T.TT', // 18
    'T.......T.....T....::.................TT', // 19
    'TT.RRRRR...mmm...l.::.l~~~~~........"..T', // 20
    'TT.RRRRR...mmm.....::..~~~~~..QQQQQ.".TT', // 21
    'T..WnDnW...mDm.T...::..~~~~~..QQQQQ...TT', // 22
    'TT...:......:......::...~~~...WnDnW....T', // 23
    'TT...::::::::::::::::::::::::::::.....TT', // 24
    'T.FFF:FFFFF........::.................TT', // 25
    'TTFuuuuuuuF...T..T.::..T"T.."""...T.T..T', // 26
    'TTFuuuuuuuF....""..::.S...............TT', // 27
    'T..TT.TT.TT.TT.TT..::.T.TT.TT.TT.TT.TT.T', // 28
    'TTTTTTTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTT', // 29
  ],
  edge: { map: 'field', x: 31, y: 39, dir: 'down' },
  warps: [
    { x: 18, y: 4, to: 'elder', tx: 5, ty: 7, dir: 'up' },
    { x: 29, y: 4, to: 'shrine', tx: 6, ty: 9, dir: 'up' },
    { x: 6, y: 9, to: 'inn', tx: 6, ty: 8, dir: 'up' },
    { x: 6, y: 16, to: 'smithy', tx: 5, ty: 7, dir: 'up' },
    { x: 32, y: 10, to: 'shop', tx: 5, ty: 7, dir: 'up' },
    { x: 31, y: 16, to: 'bakery', tx: 5, ty: 6, dir: 'up' },
    { x: 5, y: 22, to: 'farmhouse', tx: 4, ty: 5, dir: 'up' },
    { x: 32, y: 23, to: 'collector', tx: 5, ty: 5, dir: 'up' },
    {
      x: 12, y: 22, to: 'windmill', tx: 4, ty: 5, dir: 'up',
      cond: () => Quests.stage('s_thief') >= 2 || Quests.isDone('s_thief'),
      blocked: async () => {
        if (Quests.isActive('s_thief') && Quests.stage('s_thief') === 1) {
          await S.say(null, '풍차 문이 안쪽에서 잠겨 있다.');
          await S.say(null, '…문 앞 진흙에 작은 발자국이 찍혀 있다. 발자국은 문틈 아래로 이어진다.');
          await S.say(null, '(문을 두드리자 안에서 무언가 우당탕 넘어지는 소리가 났다. 빗장이 풀린 것 같다!)');
          S.stage('s_thief', 2);
        } else await S.say(null, '풍차 문이 굳게 잠겨 있다. 안쪽에서 빗장을 건 것 같다.');
      },
    },
  ],
  triggers: [
    {
      x: 18, y: 28, w: 4, h: 2, when: () => !Game.flag('met_elder'),
      run: async () => {
        await S.say('경비병 토마스', '어이, 거기! 아직 몸도 성치 않은 사람이 어딜 가나. 장로님을 먼저 뵙고 오게. 마을에서 제일 큰 집에 계시지.');
        await S.walk(['up', 'up']);
      },
    },
  ],
  npcs: [
    {
      id: 'tomas', x: 18, y: 26, look: 'guard', dir: 'down',
      talk: async () => {
        if (Quests.isDone('s_thief') && Quests.get('s_thief').outcome === 'jail' && P() >= 6) {
          await S.say('경비병 토마스', ['그 꼬마 도둑 말이야… 감옥 창살 사이로 빠져나가 사라졌어.', '벽에 삐뚤빼뚤한 글씨로 「고마웠어. 빵 맛있었어」라고 써 놓고 말이지. …허허.']);
          return;
        }
        await S.say('경비병 토마스', byP({
          0: '장로님을 먼저 뵙고 오게. 마을에서 제일 큰 집에 계시지.',
          1: '밖에 나가려고? 길마다 표지판이 서 있으니 잘 읽어 보게나. 숲 쪽으로 가면 고르도라는 사냥꾼이 살지.',
          2: '북쪽 고개의 철엄니? 그놈은 우리 경비대도 못 건드렸어. 단단히 준비하게.',
          3: '철엄니를 쫓아냈다고?! 대단하구먼! 덕분에 교역로가 다시 열렸어. 대장간에 쇠가 들어올 거야.',
          6: '유적 안은 어떤가? 조심하게. 해골이 돌아다닌다는 소문이…',
          7: '돌아왔군! 마을 사람들 모두 기다리고 있었어.',
          8: '자네들 덕분에 마을이 평화로워. 경비병은 할 일이 없어져서 심심할 지경이야. 하하!',
        }));
      },
    },
    {
      id: 'hans', x: 21, y: 26, look: 'guard', dir: 'down',
      talk: async () => {
        await S.say('경비병 한스', byP({
          0: '여기는 리벨 마을. 별이 노래하는 마을이라고들 하지. 요즘은 마물 울음소리가 더 크지만.',
          1: '마물마다 성질이 제각각이라네. {H} 자네의 그 눈으로 잘 살펴보면 뭔가 보일지도 모르겠군.',
          3: '적이 무언가 벼르는 낌새가 보이면, 몸을 사리는 것도 용기라네. 경비병의 기본이지!',
          8: '쉬는 날엔 낚시나 해야겠어. 연못에 물고기가 있긴 한가?',
        }));
      },
    },
    {
      id: 'bran_town', x: 12, y: 17, look: 'bran', dir: 'left', move: 'turn', show: () => !Game.flag('met_elder'),
      talk: async () => {
        await S.say('브란', ['흐읍! 하앗! …응? 처음 보는 얼굴이네. 아, 들판에서 쓰러져 있었다는 그 사람?', '나는 브란. 미래의 수호기사지! 지금은 장작 패기로 수련 중이야. 장로님 댁에 가 봐. 기다리고 계실걸?']);
      },
    },
    {
      id: 'rosa', x: 33, y: 18, look: 'bakerwife', dir: 'down', move: 'wander', radius: 2,
      mark: () => !Quests.get('s_thief') && P() >= 1,
      talk: async () => {
        const q = Quests.get('s_thief');
        if (!q) {
          if (P() < 1) { await S.say('로사', '어머, 손님이네요? 우리 빵집 빵은 리벨에서 제일 맛있답니다. 남편 핌의 솜씨예요!'); return; }
          await S.say('로사', ['어떡해… 결혼반지가 없어졌어요! 부엌 창가에 잠깐 뒀을 뿐인데…', '요즘 마을에서 물건이 자꾸 사라진대요. 혹시… 범인을 찾아 주실 수 있나요?']);
          await S.startQuest('s_thief');
          await S.say('로사', '제랄드 할아버지랑 신전의 세나 님도 물건을 잃어버리셨대요. 이야기를 들어 보세요.');
          return;
        }
        if (q.status === 'active') {
          await S.say('로사', '범인을 찾으면 꼭 알려 주세요. 그 반지… 핌이 3년 동안 모은 돈으로 사 준 거예요.');
          return;
        }
        if (Game.count('ring') > 0) {
          Game.removeItem('ring');
          await S.say('로사', ['내 반지! 정말 찾아 주셨군요…!', '넬이라는 아이가 돌려줬다고요? …배가 고팠던 거군요. 다음엔 그냥 빵 먹으러 오라고 전해 줘요.']);
          await S.gold(100);
          await S.say('로사', '얼마 안 되지만 사례예요. 정말 고마워요!');
          return;
        }
        await S.say('로사', q.outcome === 'join' ? '넬이 가끔 빵 부스러기를 얻으러 오면, 덤으로 하나씩 더 주고 있어요. 후후.' : '반지가 돌아와서 다행이에요. 그 아이는… 괜찮을까요.');
      },
    },
    {
      id: 'gerald', x: 24, y: 14, look: 'oldman', dir: 'left',
      talk: async () => {
        if (Quests.isActive('s_thief') && Quests.stage('s_thief') === 0 && !Game.flag('thief_gerald')) {
          await S.say('제랄드 할아버지', ['자네들, 도둑을 찾는다고? 내 파이프도 없어졌다네! 50년을 함께한 녀석인데…', '그러고 보니 며칠 전 밤에, 풍차 쪽으로 쪼르르 달려가는 작은 그림자를 본 것 같구먼.']);
          Game.setFlag('thief_gerald');
          await Thief.check();
          return;
        }
        if (Game.count('pipe') > 0) {
          Game.removeItem('pipe');
          await S.say('제랄드 할아버지', ['오오, 내 파이프! 이 손때, 이 냄새! 틀림없어!', '고맙네, 젊은이들. 이건 내가 젊을 적 모험가 시절에 쓰던 깃털이라네. 가져가게.']);
          await S.give('feather', 1);
          return;
        }
        await S.say('제랄드 할아버지', byP({
          0: '허허, 처음 보는 얼굴이군. 이 늙은이는 여기 앉아 마을을 구경하는 게 낙이라네.',
          1: '내가 젊었을 땐 말이야, 모험가였다네. 젤리 놈들은 불을 보면 질색하더군.',
          4: '별의 봉인이라… 내 할아버지의 할아버지 때 이야기로구먼. 신전의 무녀만이 열 수 있다고 들었네.',
          7: '종소리가 그쳤구먼. 이제야 밤에 푹 잘 수 있겠어.',
        }));
      },
    },
    {
      id: 'tia', x: 30, y: 19, look: 'child', dir: 'down', move: 'wander', radius: 3,
      mark: () => (!Quests.get('s_well') && P() >= 1) || (Quests.isActive('s_well') && Quests.stage('s_well') === 2),
      talk: async () => {
        const q = Quests.get('s_well');
        if (!q) {
          if (P() < 1) { await S.say('티아', '언니(오빠)는 누구야? 별에서 왔어? 손에 별이 그려져 있잖아!'); return; }
          await S.say('티아', ['있잖아, 있잖아! 광장 우물에서 목소리가 들렸어!', '"짐은… 배가 고프도다…" 이랬어! 진짜야! 엄마는 안 믿어 줘…', '같이 확인해 줄래?']);
          await S.startQuest('s_well');
          return;
        }
        if (q.status === 'active' && q.stage < 2) { await S.say('티아', '우물이야, 우물! 광장 한가운데! 무서우니까 나는 여기서 기다릴게…'); return; }
        if (q.status === 'active' && q.stage === 2) {
          await S.say('티아', ['버섯 임금님?! 진짜로?!', '우와… 내가 우물가에서 흘린 빵 부스러기를 먹고 있었구나!', '그럼 내일부턴 일부러 크게 떨어뜨려 줘야지! 헤헤. 이거 줄게, 우물가에서 주운 반짝이 돌이야!']);
          await S.completeQuest('s_well');
          return;
        }
        await S.say('티아', '오늘도 임금님한테 빵 떨어뜨려 줬어! "짐은 만족하도다!" 그랬어. 헤헤.');
      },
    },
    {
      id: 'owen', x: 6, y: 26, look: 'farmer', dir: 'down', move: 'wander', radius: 2,
      mark: () => (!Quests.get('s_boar') && P() >= 1) || (Quests.isActive('s_boar') && Quests.stage('s_boar') === 1),
      talk: async () => {
        const q = Quests.get('s_boar');
        if (!q) {
          if (P() < 1) { await S.say('농부 오웬', '올해는 순무가 잘 자랄 것 같았는데… 요즘 밤마다 뭔가가 밭을 파헤쳐.'); return; }
          await S.say('농부 오웬', ['범인은 가시멧돼지 녀석들이야! 밤마다 내려와서 밭을 엉망으로 만들어 놔!', '자네들, 평원의 가시멧돼지를 다섯 마리만 혼내 주겠나? 사례는 하겠네!']);
          await S.startQuest('s_boar');
          return;
        }
        if (q.status === 'active' && q.stage === 0) { await S.say('농부 오웬', `가시멧돼지는 마을 밖 평원에 나와. 놈들은 찬 걸 영 못 견딘다던데. (지금까지 ${q.data.kills || 0}/5마리)`); return; }
        if (q.status === 'active' && q.stage === 1) {
          await S.say('농부 오웬', ['다섯 마리나?! 이제 녀석들도 무서워서 안 내려오겠군!', '덕분에 올해 농사는 살았네. 이건 우리 집 가보… 라기엔 좀 그렇지만 튼튼한 방패야!']);
          await S.completeQuest('s_boar');
          return;
        }
        await S.say('농부 오웬', '올가을 순무 수확하면 한 바구니 보내 주지! …아, 모험가는 순무 안 먹나?');
      },
    },
    {
      id: 'lili', x: 27, y: 24, look: 'villagerB', dir: 'up', move: 'wander', radius: 2,
      talk: async () => {
        await S.say('리리', byP({
          0: '연못에 별이 비치는 밤이면 소원을 빌어요. 어젯밤엔 종소리 때문에 놀라서 소원을 까먹었지 뭐예요.',
          1: '있잖아요, 동쪽 꽃밭 한가운데에서 밤마다 뭔가 반짝여요. 별조각일까요? 조사해 보면 좋겠어요.',
          5: '미오가 마을 밖으로 나간다니… 그 애, 어릴 때부터 겁이 없었어요. 잘 부탁해요.',
          8: '요즘은 종소리 대신 새소리가 들려서 좋아요.',
        }));
      },
    },
    {
      id: 'leo', x: 18, y: 13, look: 'boy', dir: 'down', move: 'wander', radius: 3,
      talk: async () => {
        await S.say('꼬마 레오', byP({
          0: '나중에 커서 브란 형처럼 기사가 될 거야! …브란 형도 아직 기사는 아니지만.',
          1: '형아, 도구점 할머니 상처약 짱 좋대! 근데 재료가 없어서 못 만든대.',
          3: '철엄니를 이겼다고?! 우와아! 사인해 줘!',
          8: '나도 커서 형아들처럼 종을 지키는 모험가가 될 거야!',
        }));
      },
    },
    {
      id: 'merchant', x: 9, y: 12, look: 'merchant', dir: 'down', move: 'wander', radius: 2,
      talk: async () => {
        await S.say('떠돌이 상인', byP({
          0: '이 마을엔 장사하러 왔다가 발이 묶였지 뭔가. 고개에 큰 멧돼지가 버티고 있어서 말이야.',
          1: ['장사꾼의 팁 하나! 「귀환의 날개」는 꼭 하나씩 챙겨 다니게. 던전에서 길을 잃어도 단숨에 마을로 돌아올 수 있지.', '그리고 「정령의 향」을 피우면 한동안 마물이 다가오지 않아. 급할 때 요긴하다네.'],
          3: '고개가 열렸으니 이제 왕도로 돌아갈 수 있겠어! 고맙네. 대장간에 좋은 쇠를 넘겨주고 가지.',
          8: '왕도에 가면 내 가게에 들르게! …아직 가게는 없지만.',
        }));
      },
    },
    { id: 'chick1', x: 8, y: 24, look: 'critter:chicken', move: 'wander', radius: 2, talk: async () => { await S.say(null, '꼬꼬댁! (닭이 당신을 노려본다.)'); } },
    { id: 'chick2', x: 13, y: 26, look: 'critter:chicken', move: 'wander', radius: 2, talk: async () => { await S.say(null, '꼬끼오─! (어째서인지 의기양양하다.)'); } },
    { id: 'cat', x: 4, y: 11, look: 'critter:cat', move: 'wander', radius: 2, talk: async () => { await S.say(null, '냐아. (고양이가 다리에 몸을 비빈다.)'); } },
  ],
  objects: [
    { type: 'sign', x: 14, y: 4, text: '「하르도 장로의 집」' },
    { type: 'sign', x: 10, y: 10, text: '「여관 물레방아」 — 지친 여행자 환영! 따뜻한 수프 있음.' },
    { type: 'sign', x: 10, y: 17, text: '「망치와 모루」 무기·방어구 — 장인 드른' },
    { type: 'sign', x: 28, y: 10, text: '「초록 바구니」 도구점 — 약초, 해독초, 그 밖의 잡화' },
    { type: 'sign', x: 22, y: 27, text: '리벨 마을 — 별이 노래하는 마을\n남쪽 출구: 초록바람 평원' },
    { type: 'search', id: 'rv_barrel1', x: 2, y: 9, item: 'herb', msg: '술통 안을 들여다보았다…', empty: '빈 술통이다.' },
    { type: 'search', id: 'rv_barrel2', x: 2, y: 10, gold: 15, msg: '술통 밑바닥에 동전이 굴러다닌다.', empty: '빈 술통이다.' },
    { type: 'search', id: 'rv_barrel3', x: 36, y: 10, item: 'antidote', msg: '술통 안을 들여다보았다…', empty: '빈 술통이다.' },
    { type: 'search', id: 'rv_crate', x: 10, y: 14, item: 'firebomb', msg: '나무 상자 안에 기름병이 들어 있다.', empty: '빈 상자다.' },
    { type: 'search', id: 'rv_barrel4', x: 10, y: 15, item: 'star', msg: '술통 바닥에서 무언가 반짝인다…!', empty: '빈 술통이다.' },
    { type: 'search', id: 'rv_pot1', x: 28, y: 16, gold: 10, msg: '항아리 안에 동전이 들어 있다.', empty: '빈 항아리다.' },
    { type: 'search', id: 'rv_pot2', x: 34, y: 16, item: 'smelling', msg: '항아리 안을 들여다보았다…', empty: '빈 항아리다.' },
    { type: 'search', id: 'rv_flower', x: 36, y: 14, item: 'star', hidden: true, msg: '꽃밭 한가운데, 흙 속에서 무언가 반짝인다…!' },
    { type: 'deco', x: 12, y: 20, draw: 'windmill' },
    {
      type: 'event', x: 19, y: 14, solid: true,
      run: async () => {
        if (!Quests.get('s_well')) {
          await S.say(null, ['깊은 우물이다. 안에서 바람 소리가 올라온다.', '…아니, 바람 소리치고는 묘하게 코 고는 소리 같다.']);
          return;
        }
        if (await S.yesno(null, '우물 벽에 줄사다리가 걸려 있다. 내려가 볼까?')) {
          if (Quests.isActive('s_well') && Quests.stage('s_well') === 0) S.stage('s_well', 1);
          await S.warp('cellar', 1, 2, 'down', { sfx: 'stairs' });
        }
      },
    },
  ],
});

// 도둑 퀘스트 공용 처리
const Thief = {
  async check() {
    if (Quests.stage('s_thief') !== 0) return;
    const n = (Game.flag('thief_gerald') ? 1 : 0) + (Game.flag('thief_sena') ? 1 : 0);
    Quests.data('s_thief').heard = n;
    if (n >= 2) {
      S.stage('s_thief', 1);
      await S.say(null, '[g]단서: 밤에 풍차 쪽으로 달려가는 작은 그림자.[/]');
    }
  },
};

// ── 여관 ──
defMap('inn', {
  name: '여관 「물레방아」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'IfwpwLLIbwbwbI', // 2
    'IwwwwIwIwwwwwI', // 3
    'IkkkkwwwwwwwzI', // 4
    'IwwwwwwIwwwwwI', // 5
    'IIwIIIwIIwwIII', // 6
    'IwtwwwwwwwwtwI', // 7
    'IwhwwwwwwwwhwI', // 8
    'IIIIIIEIIIIIII', // 9
  ],
  warps: [{ x: 6, y: 9, to: 'rivel', tx: 6, ty: 10, dir: 'down' }],
  npcs: [
    { id: 'mio_inn', x: 9, y: 3, look: 'mio', dir: 'left', show: () => Game.flag('prologue') === 1 },
    {
      id: 'marta', x: 2, y: 3, look: 'innkeeper', dir: 'down',
      mark: () => (!Quests.get('s_letter') && P() >= 1) || (Quests.isActive('s_letter') && Quests.stage('s_letter') === 1),
      talk: async () => {
        const q = Quests.get('s_letter');
        if (q && q.status === 'active' && q.stage === 1 && Game.count('reply')) {
          Game.removeItem('reply');
          await S.say('마르타', ['오빠한테서 답장이…?', '(마르타는 떨리는 손으로 편지를 펼쳤다.)']);
          await S.say('마르타', ['「다음 달 어머니 기일에 내려가마. 따뜻한 수프나 끓여 놔라. ─고르도」', '…10년 만에 쓴 편지가 이게 다야? 정말… 바보 오빠.', '(마르타는 웃으면서 눈가를 훔쳤다.)', '고마워요, 정말로. 이건 어머니가 남기신 펜던트예요. 오빠랑 이걸로 다퉜었는데… 이제 당신들이 가져가 줘요.']);
          await S.completeQuest('s_letter');
          Game.setFlag('inn_free');
          await S.say('마르타', '그리고 앞으로 우리 여관 숙박은 평생 공짜예요! 사양하면 화낼 거예요.');
          return;
        }
        if (!q && P() >= 1) {
          await S.say('마르타', ['저기… 숙박 말고 부탁이 하나 있는데요.', '동쪽 숲의 사냥꾼 고르도… 사실 제 오빠예요. 10년 전에 크게 다툰 뒤로 한 번도 못 만났어요.', '이 편지를 전해 줄 수 있을까요? 직접 가기엔… 아직 용기가 안 나서요.']);
          await S.startQuest('s_letter');
          await S.give('letter', 1);
        }
        await S.inn(Math.max(6, Game.state.party.length * 4));
      },
    },
    {
      id: 'osric', x: 11, y: 8, look: 'osric', dir: 'up', show: () => P() < 2,
      talk: async () => {
        if (!Game.flag('met_osric')) {
          Game.setFlag('met_osric');
          await S.say('회색 외투의 학자', ['…오, 들판에서 발견되었다는 분이로군요. 저는 오스릭. 각지의 유적을 연구하는 떠돌이 학자입니다.', '실례지만, 그 손등의 문양… 조금만 보여 주시겠습니까?', '(오스릭은 안경 너머로 낙인을 오래 바라보았다. 눈빛이 묘하게 반짝인다.)', '…훌륭하군요. 아, 아닙니다. 학자의 호기심이지요. 질문은 등불이라고, 제 은사님이 늘 말씀하셨거든요.']);
          return;
        }
        await S.say('오스릭', byP({
          0: '장로님을 만나러 가시는군요. 이 마을 사람들은 친절하지요. …지나치게.',
          1: '북쪽 유적에는 거대한 종이 잠들어 있다지요. 종이 울리면 무엇이 깨어날지… 흥미롭지 않습니까?',
        }));
      },
    },
    {
      id: 'traveler', x: 2, y: 8, look: 'villagerC', dir: 'up',
      talk: async () => {
        await S.say('나그네', byP({
          0: '이 여관 수프는 일품이야. 감자가 듬뿍! …근데 저 회색 외투 아저씨, 밤새 한숨도 안 자고 뭔가 쓰더라고.',
          2: '회색 외투 아저씨? 오늘 새벽에 숙박비를 치르고 떠났어. 그런데 동전이 이상했어. 300년 전 아스트라 시대 금화였다니까?',
          4: '전투에서 「도구」 명령으로 약초를 쓸 수 있어. 주문이 없는 동료도 회복을 도울 수 있지.',
          8: '세상이 시끄러워지려나… 그래도 이 마을 수프 맛은 변하지 않았으면 좋겠어.',
        }));
      },
    },
    {
      id: 'gordo_inn', x: 10, y: 7, look: 'hunter', dir: 'down', show: () => Quests.isDone('s_letter') && P() >= 8,
      talk: async () => { await S.say('고르도', ['여, 이방인. 마르타 녀석 수프… 꽤 맛있더군.', '…이건 여동생한테는 비밀이다.']); },
    },
  ],
  objects: [
    { type: 'search', id: 'inn_dresser', x: 12, y: 4, item: 'pot_lid', msg: '서랍장 안에… 냄비 뚜껑이 들어 있다. 왜 여기에?', empty: '서랍장 안은 비어 있다.' },
    { type: 'event', x: 6, y: 2, solid: true, run: async () => { await S.say(null, '책장에 「맛있는 감자 수프 100선」이 꽂혀 있다. 마르타의 손글씨 메모가 가득하다.'); } },
  ],
});

// ── 대장간 ──
defMap('smithy', {
  name: '「망치와 모루」', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'IfaXwwiiwwXI', // 2
    'IwwwwwwwIwwI', // 3
    'IkkkkkkkwwwI', // 4
    'IwwwwwwwwwxI', // 5
    'IwwwwwwwwwxI', // 6
    'IpwwwwwwwwpI', // 7
    'IIIIIEIIIIII', // 8
  ],
  warps: [{ x: 5, y: 8, to: 'rivel', tx: 6, ty: 17, dir: 'down' }],
  onEnter: async () => {
    if (P() >= 8 && !Game.flag('dorn_gift') && has('bran')) {
      Game.setFlag('dorn_gift');
      await S.say('드른', ['…브란. 이리 와 봐라.', '(드른은 묵직한 천에 싸인 무언가를 내밀었다.)', '밤새 벼린 도끼다. 대장장이 아들이 남이 만든 도끼를 들고 다니면 내 체면이 뭐가 되겠냐.']);
      await S.say('브란', ['아버지… 저는 대장간을 물려받지 않을 거라고…', '…고맙습니다. 이 도끼로, 꼭 수호기사가 될게요.']);
      await S.say('드른', '흥. 기사가 되든 뭐가 되든… 다치지만 마라.');
      await S.give('dorn_axe', 1);
    }
  },
  npcs: [
    {
      id: 'dorn', x: 3, y: 3, look: 'smith', dir: 'down',
      talk: async () => {
        const greet = byP({
          0: '어서 와라. …들판의 이방인이군. 맨손으로 다닐 생각은 아니겠지?',
          1: '브란 녀석을 데려간다고? …그 녀석, 덩치만 컸지 아직 애다. 잘 부탁한다.',
          3: '고개가 열려서 좋은 쇠가 들어왔다. 철로 만든 물건들을 새로 들여놨지.',
          8: '오늘은 무슨 일이냐. 브란 녀석은 밥은 잘 먹고 다니냐?',
        });
        await S.say('드른', greet);
        await Shop.open('smithy');
      },
    },
  ],
  objects: [
    { type: 'search', id: 'sm_crate', x: 10, y: 2, item: 'leather_hat', msg: '나무 상자 안에 쓸 만한 모자가 들어 있다.', empty: '쇳조각만 굴러다닌다.' },
    { type: 'search', id: 'sm_barrel', x: 10, y: 5, gold: 20, msg: '통 안에 동전 주머니가 숨겨져 있다. (드른의 비상금…?)', empty: '빈 통이다.' },
  ],
});

// ── 도구점 ──
defMap('shop', {
  name: '「초록 바구니」', kind: 'interior', bgm: 'town', base: 'w',
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
  warps: [{ x: 5, y: 8, to: 'rivel', tx: 32, ty: 11, dir: 'down' }],
  npcs: [
    {
      id: 'ella', x: 3, y: 3, look: 'herbalist', dir: 'down',
      mark: () => (!Quests.get('s_herb') && P() >= 1) || (Quests.isActive('s_herb') && Game.count('moonherb') >= 3),
      talk: async () => {
        const q = Quests.get('s_herb');
        if (q && q.status === 'active' && Game.count('moonherb') >= 3) {
          Game.removeItem('moonherb', 3);
          await S.say('엘라 할머니', ['어머나, 달빛 풀을 세 개나! 이 은은한 빛 좀 보렴.', '이제 상처약을 만들 수 있겠구나. 첫 솥은 너희 몫이란다!']);
          await S.completeQuest('s_herb');
          Game.setFlag('potion_stock');
          await S.say('엘라 할머니', '이제부터 우리 가게에서 「상처약」을 판단다. 많이 사 가렴!');
          return;
        }
        if (!q && P() >= 1) {
          await S.say('엘라 할머니', ['아이고, 마침 잘 왔구나. 상처약을 만들고 싶은데 「달빛 풀」이 다 떨어졌단다.', '평원 여기저기에 밤처럼 은은하게 빛나는 풀이 있어. 세 개만 모아다 주겠니?']);
          await S.startQuest('s_herb');
        }
        await S.say('엘라 할머니', byP({ 0: '어서 오렴. 약초 냄새가 좀 독하지? 금방 익숙해진단다.', 1: '필요한 게 있으면 골라 보렴.', 8: '왕도까지 가는 길은 멀단다. 약은 넉넉히 챙기렴.' }));
        await Shop.open('itemshop');
      },
    },
  ],
  objects: [
    { type: 'search', id: 'sh_jar1', x: 10, y: 5, item: 'antidote', n: 2, msg: '항아리 안에 해독초가 들어 있다.', empty: '빈 항아리다.' },
    { type: 'search', id: 'sh_jar2', x: 10, y: 6, empty: '말린 쑥 냄새가 난다. 아무것도 없다.' },
  ],
});

// ── 신전 ──
defMap('shrine', {
  name: '리벨 신전', kind: 'interior', bgm: 'shrine', base: 'w',
  tiles: [
    'IIIIIIIIIIIII', // 0
    'IIIIIIIIIIIII', // 1
    'IpwwwwAwwwwpI', // 2
    'IwPwwcccwwPwI', // 3
    'IwwwwcccwwwwI', // 4
    'IwttwcccwttwI', // 5
    'IwwwwcccwwwwI', // 6
    'IwttwcccwttwI', // 7
    'IwPwwcccwwPwI', // 8
    'IwwwwcccwwwwI', // 9
    'IIIIIIEIIIIII', // 10
  ],
  warps: [{ x: 6, y: 10, to: 'rivel', tx: 29, ty: 5, dir: 'down' }],
  npcs: [
    {
      id: 'sena', x: 6, y: 3, look: 'priestess', dir: 'down',
      mark: () => P() === 4,
      talk: async () => {
        if (Quests.isActive('s_thief') && Quests.stage('s_thief') === 0 && !Game.flag('thief_sena')) {
          await S.say('대신관 세나', ['도둑이요? …실은 신전에서도 옛 지도가 한 장 없어졌어요.', '북쪽 유적의 구조가 그려진 귀한 지도인데… 어느 밤 창문이 열려 있었어요. 아주 작은 발자국과 함께요.']);
          Game.setFlag('thief_sena');
          await Thief.check();
          return;
        }
        if (P() === 4) { await Story.shrineChime(); return; }
        const line = byP({
          0: '어서 오세요. 리벨 신전입니다. …아, 미오가 발견한 분이군요. 몸은 괜찮으신가요?',
          1: '신전에서는 모험의 기록을 남길 수 있어요. 여신님께 기도드리면 언제든 기록해 드리지요.',
          5: '미오를 잘 부탁해요. 그 아이는… 종의 노래를 듣는 아이예요.',
          8: '종이 다시 잠들었어요. 하지만 종의 노래는 아직 먼 곳에서 들린다고 미오가 그러더군요.',
        });
        await S.say('대신관 세나', line);
        const c = await S.ask('대신관 세나', '무엇을 도와드릴까요?', ['기록한다 (저장)', '해독 (무료)', '그만둔다'], 2);
        if (c === 0) await Menu.saveScreen();
        else if (c === 1) {
          let n = 0;
          for (const id in Game.state.members) { const m = Game.state.members[id]; if (m.status.poison) { delete m.status.poison; n++; } }
          Sound.sfx('heal');
          await S.say('대신관 세나', n ? '여신님의 가호로 독이 씻겨 나갔어요.' : '독에 걸린 분은 없으시네요. 다행이에요.');
        }
      },
    },
    {
      id: 'mio_shrine', x: 3, y: 4, look: 'mio', dir: 'right', move: 'turn', show: () => P() >= 1 && !Game.flag('mio_joined'),
      talk: async () => {
        await S.say('미오', byP({
          1: ['{H} 님! 장로님은 만나셨어요? …사냥꾼 고르도 아저씨를 찾아가신다고요?', '조심하세요. 종이 울린 뒤로 밤마다 노래가 들려요. 슬픈 노래가… 아, 아무것도 아니에요!'],
          3: '철엄니를 물리치셨다고요?! 대단해요! 다치신 데는 없어요?',
          4: '할머니께 별빛 방울 이야기를 들으러 오셨군요. 할머니는 제단 앞에 계세요!',
        }));
      },
    },
    {
      id: 'prayer', x: 9, y: 6, look: 'villagerA', dir: 'up',
      talk: async () => { await S.say('기도하는 마을 사람', byP({ 0: '여신님, 부디 마물들로부터 마을을 지켜 주세요…', 3: '고개의 멧돼지가 사라졌대요! 기도가 통했나 봐요!', 8: '여신님, 그리고 별의 손님께 감사를…' })); },
    },
  ],
  objects: [
    { type: 'event', x: 6, y: 2, solid: true, run: async () => { await S.say(null, '제단 위에 오래된 종 모양의 성물이 놓여 있다. 받침대에 글이 새겨져 있다.\n「별이 노래하고 종이 답하니, 다섯 소리가 하나 되는 날 장막이 걷히리라」'); } },
  ],
});

// ── 장로의 집 ──
defMap('elder', {
  name: '장로의 집', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIIIII', // 0
    'IIIIIIIIIIIIII', // 1
    'ILLLwwfwwwLLbI', // 2
    'IwwwwwwwwwwwwI', // 3
    'IwwhtthwwwwwzI', // 4
    'IwwhtthwwcccwI', // 5
    'IwwwwwwwwcccwI', // 6
    'IpwwwwwwwwwwpI', // 7
    'IIIIIEIIIIIIII', // 8
  ],
  warps: [{ x: 5, y: 8, to: 'rivel', tx: 18, ty: 5, dir: 'down' }],
  onEnter: async () => {
    if (!Game.flag('met_elder')) await Story.meetElder();
  },
  npcs: [
    {
      id: 'haldor', x: 8, y: 3, look: 'elder', dir: 'down',
      mark: () => P() === 7,
      talk: async () => {
        if (P() === 7) { await Story.ending(); return; }
        if (P() === 8 && !Quests.get('main3')) { await Story.beginChapter2(false); return; }
        await S.say('하르도 장로', byP({
          1: ['숲속에 고르도라는 사냥꾼이 혼자 산다네. 이 부근 마물 사정은 그 친구가 제일 잘 알지.', '길이 헷갈리거든 갈림길의 표지판을 잘 읽어 보게. 메뉴의 「지도」도 도움이 될 걸세.'],
          2: '고개에 철엄니가 버티고 있다고? 무리하지 말게나. 몸도 장비도 단단히 갖추고 가게.',
          3: '유적까지 갔단 말인가! 장하구먼. 무엇을 보았는지 신전의 세나에게도 알려 주게.',
          4: '봉인된 문이라… 신전의 세나에게 물어보게. 옛날부터 종에 관한 일은 신전이 맡아 왔다네.',
          5: '미오까지 함께라니 든든하군. 하지만 그 아이는 우리 마을의 보물이야. 부디 지켜 주게.',
          6: '유적 깊은 곳에 무엇이 있을지… 부디 모두 무사히 돌아오게.',
          8: ['자네들은 이 마을의 자랑일세. 왕도로 떠날 준비가 되면… 아니, 서두를 것 없지.', '남은 마을 사람들의 부탁도 들어 주면 좋겠구먼. 허허.'],
          9: '왕도로 가는 은빛 가도는 이 평원 너머에서 시작한다네. 리네트 양, 학원에 안부 전해 주게.',
          11: '왕도까지 다녀오다니! 축제는 어떻던가? 별사탕이라도 하나 사 오지 그랬나. 허허.',
          13: '브란이 기사가 되었다고?! 드른 녀석, 오늘 밤엔 대장간 불을 안 끄겠군.',
          16: ['「별의 수호대」라… 자네들 소식이 이 시골까지 들려오는군.', '{H} 군. 어떤 선택을 하든, 이 마을은 언제나 자네 편일세.'],
        }));
      },
    },
    { id: 'bran_burst', x: 5, y: 7, look: 'bran', dir: 'up', show: () => false },
  ],
  objects: [
    { type: 'event', x: 1, y: 2, solid: true, run: async () => { await S.say(null, ['낡은 책 「리벨 신전 연대기」를 펼쳤다.', '「…종이 울리는 밤, 별의 손님이 내려오리라. 손님의 손에는 별의 열쇠가 새겨져 있으니,', '그 열쇠는 닫힌 것을 열고 열린 것을 닫으리라…」', '뒷장은 누군가 찢어 간 듯 사라져 있다.']); } },
    { type: 'event', x: 2, y: 2, solid: true, run: async () => { await S.say(null, '「마물 도감 (초급편)」 — 젤리는 뜨거운 것을, 멧돼지는 차가운 것을 싫어한다고 적혀 있다. 언데드 항목은 누군가 뜯어 갔다.'); } },
    { type: 'event', x: 3, y: 2, solid: true, run: async () => { await S.say(null, '「장로의 일기」… 남의 일기를 읽는 건 그만두자.'); } },
    { type: 'search', id: 'el_dresser', x: 12, y: 4, item: 'ether', msg: '서랍 깊숙이 작은 병이 들어 있다. 「비상용」이라고 적혀 있다.', empty: '서랍 안은 비어 있다.' },
  ],
});

// ── 빵집 ──
defMap('bakery', {
  name: '빵집', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'IfkkwwwiibwI', // 2
    'IwwwwwwwwwwI', // 3
    'IwhttwwwwwbI', // 4
    'IwhttwwwwwjI', // 5
    'IpwwwwwwwwpI', // 6
    'IIIIIEIIIIII', // 7
  ],
  warps: [{ x: 5, y: 7, to: 'rivel', tx: 31, ty: 17, dir: 'down' }],
  npcs: [
    {
      id: 'pim', x: 3, y: 3, look: 'baker', dir: 'down', move: 'wander', radius: 2,
      talk: async () => {
        await S.say('빵집 주인 핌', byP({
          0: '갓 구운 빵 냄새 좋지? 한 조각 줄까? …아, 돈은 안 받아. 들판에서 쓰러졌었다며. 많이 먹어야지!',
          1: ['아내 로사가 반지를 잃어버려서 기운이 없어. 범인을 찾으면 내가 평생 빵을 굽지!', '참, 빵 먹고 기운 좀 차려!'],
          8: '모험가들을 위한 신메뉴 「별빛 크림빵」을 개발 중이야! 맛은… 아직 비밀!',
        }));
        const m = Game.state.members;
        let healed = false;
        for (const id of Game.state.party) { const s = Game.stats(id); if (m[id].hp > 0 && m[id].hp < s.maxhp) { m[id].hp = Math.min(s.maxhp, m[id].hp + 20); healed = true; } }
        if (healed) { Sound.sfx('heal'); await S.say(null, '(따끈한 빵을 먹고 일행의 HP가 조금 회복되었다.)'); }
      },
    },
  ],
  objects: [
    { type: 'search', id: 'bk_jar', x: 10, y: 5, item: 'herb', n: 2, msg: '항아리 안에 약초가 들어 있다.', empty: '밀가루 냄새가 난다.' },
  ],
});

// ── 오웬의 집 ──
defMap('farmhouse', {
  name: '오웬의 집', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IfwwzwwbwI', // 2
    'IwwwwwwwwI', // 3
    'IwhtthwwjI', // 4
    'IwwwwwwwpI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'rivel', tx: 5, ty: 23, dir: 'down' }],
  npcs: [
    {
      id: 'hilda', x: 6, y: 3, look: 'villagerB', dir: 'down', move: 'wander', radius: 1,
      talk: async () => { await S.say('힐다', byP({ 0: '우리 그이, 멧돼지 때문에 밤에 잠을 못 자요. 문단속 단단히 하세요.', 1: '가시멧돼지는 겉보기보다 단단해요. 둘 이상 나오면 조심하세요.', 8: '올해 순무는 풍년이에요! 다 당신들 덕분이에요.' })); },
    },
  ],
  objects: [
    { type: 'search', id: 'fh_jar', x: 8, y: 4, item: 'herb', msg: '항아리에 말린 약초가 들어 있다.', empty: '순무 피클 냄새가 난다.' },
    { type: 'search', id: 'fh_dresser', x: 4, y: 2, gold: 30, msg: '서랍 안에 「멧돼지 퇴치 사례금」이라고 적힌 봉투가… 아니, 이건 가져가면 안 될 것 같다.\n…라고 생각했는데 봉투에 「모험가님께」라고 적혀 있다!', empty: '서랍 안은 비어 있다.' },
  ],
});

// ── 풍차 ──
defMap('windmill', {
  name: '낡은 풍차', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIII', // 0
    'IIIIIIIIII', // 1
    'IXXwwwxXXI', // 2
    'IXwwwwwwxI', // 3
    'IwwwwwwwwI', // 4
    'IxwwwwwXXI', // 5
    'IIIIEIIIII', // 6
  ],
  warps: [{ x: 4, y: 6, to: 'rivel', tx: 12, ty: 23, dir: 'down' }],
  onEnter: async () => {
    if (Quests.isActive('s_thief') && Quests.stage('s_thief') === 2) await Story.nell();
  },
  npcs: [
    { id: 'nell_hide', x: 4, y: 3, look: 'nell', dir: 'down', show: () => Quests.isActive('s_thief') },
  ],
  objects: [
    { type: 'search', id: 'wm_crate', x: 1, y: 3, item: 'smelling', msg: '상자 틈에 작은 꾸러미가 끼어 있다. 넬이 숨겨 둔 걸까?', empty: '먼지만 가득하다.' },
    { type: 'search', id: 'wm_barrel', x: 8, y: 3, gold: 25, msg: '통 안에 동전이 조금 들어 있다.', empty: '빈 통이다.' },
  ],
});

// ── 피포의 집 ──
defMap('collector', {
  name: '피포의 수집관', kind: 'interior', bgm: 'town', base: 'w',
  tiles: [
    'IIIIIIIIIIII', // 0
    'IIIIIIIIIIII', // 1
    'ILiLiwwLiLzI', // 2
    'IwwwwwwwwwwI', // 3
    'IpwwttwwwwjI', // 4
    'IwwwwwwwwwwI', // 5
    'IIIIIEIIIIII', // 6
  ],
  warps: [{ x: 5, y: 6, to: 'rivel', tx: 32, ty: 24, dir: 'down' }],
  npcs: [
    {
      id: 'pippo', x: 6, y: 3, look: 'collector', dir: 'down',
      mark: () => !Quests.get('s_star') || Game.count('star') > 0,
      talk: async () => { await Story.pippo(); },
    },
  ],
  objects: [
    { type: 'event', x: 1, y: 2, solid: true, run: async () => { await S.say(null, '진열장에 「세계의 신기한 돌」이 가득하다. 그중 하나는 아무리 봐도 그냥 감자다.'); } },
    { type: 'event', x: 2, y: 2, solid: true, run: async () => { await S.say(null, '선반에 이름표가 붙은 병들이 있다. 「용의 비늘(?)」, 「인어의 눈물(소금물)」…'); } },
    { type: 'search', id: 'co_jar', x: 10, y: 4, empty: '항아리 안에 「만지지 마시오」라고 적힌 쪽지만 들어 있다.' },
  ],
});
