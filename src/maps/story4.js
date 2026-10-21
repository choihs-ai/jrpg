'use strict';
// ─────────────────────────────────────────────────────────────
// 제4장 「파도의 종」 스토리 이벤트
//  네 번째 종은 북해 깊은 곳에 가라앉은 파도 종.
//  넬은 언니 카산드라와 다시 만나고, 카산드라는 성가대를 떠나 동료가 된다.
//  유령선의 함장 오르카, 그리고 마지막 종이 있는 하늘섬이 모습을 드러낸다.
// ─────────────────────────────────────────────────────────────
Object.assign(Story, {
  // ── 4장 시작: 북해 배편 ──
  async beginChapter4() {
    if (Quests.get('main5')) return;
    await S.say('오필리아 학장', ['돌아왔구나! 사막 이야기는 사미라에서 온 편지로 먼저 들었단다. …모래의 심장까지. 수고했다.', '북해로 가는 배편 말인데. 알아보긴 했는데, 좋은 소식은 아니야.']);
    await S.say('오필리아 학장', ['북쪽 해안의 항구 마을 마레아에서 북해로 가는 배가 뜬다네. 그런데 한 달째 출항 금지래.', '등대가 꺼진 뒤로 안개 낀 밤마다 회색 돛을 단 배가 나타나 배들을 삼킨다는군.']);
    await Story.line('bran', '회, 회색 돛…? 그거 혹시 유령선 같은 건 아니죠…?');
    await Story.line('nell', '…잿빛이면 성가대야. 언제나 그랬어.');
    await S.say('오필리아 학장', ['이건 학원과 기사단의 승선 허가증이야. 바다가 열리면 이걸 보여 주렴.', '마레아로 가는 길은 은빛 가도 북쪽 숲길 끝에서 이어져. 눈이 많을 테니 따뜻하게 입고 가렴.']);
    await S.give('boarding_pass', 1);
    await S.say('오필리아 학장', '…그리고 넬. 왕도 보육원의 그레타 원장이 전해 달라더구나. 「언니 방은 늘 비워 두고 있다」고.');
    await Story.line('nell', '…알아. 바보 언니.');
    Game.setFlag('ch4_started');
    await S.startQuest('main5');
  },

  // ── 항구 마을 마레아 도착 ──
  async arriveMarea() {
    Game.setFlag('reached_marea');
    Game.state.respawn = { map: 'marea_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 힐다' };
    Sound.sfx('chime');
    await S.say(null, ['(눈 덮인 지붕 아래 등불들이 줄지어 있다. 부두에는 밧줄에 묶인 배들이 얼어붙은 바다 위에서 삐걱거린다.)', '(광장의 분수는 물줄기가 솟구친 모양 그대로 얼어 있다.)']);
    await Story.line('mio', '사람들이 다 바다를 보고 있어요. 기다리는 얼굴로…');
    await Story.line('linette', '항만 사무소부터 가 봐요. 배가 왜 묶여 있는지 알아야 해요.');
    S.stage('main5', 1);
    await S.goalUpdate('main5', '\n[d](쓰러지면 이제 마레아의 여관에서 깨어난다.)[/]');
  },

  // ── 항만장 그레고르 ──
  async gregor() {
    const p = Game.progress();
    if (Quests.isActive('s_crab') && Quests.stage('s_crab') === 1) {
      await S.say('항만장 그레고르', ['집게왕을 잡았다고? …이 집게발, 틀림없군. 해안 어부들이 한시름 놓겠어.', '약속한 현상금이다. 그리고 이건 덤이야. 바다 사람들의 매듭이지.']);
      Game.removeItem('crab_claw', 1);
      await S.completeQuest('s_crab');
      if (p !== 26 && p !== 31 && !(p === 29 && !Game.flag('boat_ready'))) return;
    }
    if (p === 26) {
      await S.say('항만장 그레고르', ['…승선 허가증? 학원과 기사단 인장이라. 별의 수호대라는 게 당신들이군.', '미안하지만 지금은 어떤 배도 못 띄워. 등대가 꺼진 뒤로 안개 속에서 회색 배가 나타나거든.']);
      await S.say('항만장 그레고르', ['그 배를 본 어선은 하나도 돌아오지 않았어. 등대만 다시 켜지면 안개 속에 숨지 못할 텐데…', '등대지기 바르톨 영감이 불을 고치러 곶에 간 지 일주일째야. 소식이 없어.', '영감의 손녀 에다가 마을 동쪽 집에 살아. 등대 일이라면 그 아이가 제일 잘 알 거다.']);
      Game.setFlag('met_gregor');
      S.stage('main5', 2);
      await S.goalUpdate('main5');
      return;
    }
    if (p === 29 && !Game.flag('boat_ready')) {
      await S.say('항만장 그레고르', ['등대가… 켜졌어! 십 년 넘게 본 불빛인데, 오늘처럼 반가운 적이 없군.', '그리고 그 불빛에 만 한가운데 떠 있는 회색 배가 비쳤지. 숨을 곳을 잃은 거야.']);
      await Story.line('cassandra', ['「회색 갈매기호」예요. 선장은 제4성부 오르카.', '…15년 전에 이 바다에서 선원 마흔 명을 잃은 함장이에요.']);
      await S.say('항만장 그레고르', ['…오르카? 은빛 갈매기호의 오르카 함장 말인가.', '(그레고르는 한참 동안 말이 없었다.)', '그 사람은 내 은인이야. 폭풍 속에서 내 고깃배를 끌어 주고, 자기 배로 돌아갔지. 그게 마지막이었어.']);
      await S.say('항만장 그레고르', ['부두 동쪽 끝에 내 배가 있어. 죽은 마누라 이름을 붙인 배라 아무도 안 태웠지만… 당신들은 타.', '그 사람을… 쉬게 해 줘.']);
      Game.setFlag('boat_ready');
      S.stage('main5', 6);
      await S.goalUpdate('main5');
      return;
    }
    if (p === 31) { await Story.chapter4Ending(); return; }
    await S.say('항만장 그레고르', byP({
      25: '항만 사무소다. 출항 금지 중이니 볼일이 없으면 돌아가.',
      27: '에다에게 이야기 들었나? 해식 동굴은 얼음판이야. 무턱대고 들어가면 벽에 처박힐 거다.',
      28: '동굴을 지났다고? 등대는 어떻게 됐나?',
      29: '부두 동쪽 끝의 배를 써. 노는 저어 두었다.',
      30: '회색 배가 가라앉았다더군. …오르카 함장, 이제 편히 쉬시오.',
      32: ['배들이 나간다. 한 달 만에. …바다가 이렇게 조용한 줄 몰랐어.', '마레아는 당신들을 잊지 않을 거다.'],
    }));
  },
  async bountyBoard() {
    await S.say(null, ['현상수배 게시판이다.', '「해안 동쪽 모래톱에 거대한 게가 나타나 어구를 부수고 있음. 일명 집게왕. 토벌 시 현상금 1800G ─ 항만장」']);
    if (!Quests.get('s_crab') && Game.progress() >= 26) await S.startQuest('s_crab');
  },

  // ── 등대지기의 손녀 에다 ──
  async eda() {
    if (Game.flag('met_gregor') && !Game.flag('cave4_open')) {
      await S.say('에다', ['…항만장님이 보내셨어요? 할아버지 일로요?', '할아버지는 등대 불이 꺼진 날, 렌즈를 고치러 곶에 가셨어요. 그 뒤로 일주일째 안 돌아오세요.']);
      await S.say('에다', ['곶으로 가는 절벽길은 지난겨울에 무너졌어요. 이제는 바닷가의 해식 동굴로만 갈 수 있어요.', '동굴 바닥은 전부 얼음이에요. 할아버지는 늘 그러셨어요.', '「얼음 위에선 멈추고 싶은 데서 멈출 수 없다. 멈춰 줄 것을 찾아라.」']);
      await Story.line('mio', '할아버지는 꼭 무사하실 거예요. 저희가 모셔 올게요.');
      await S.say('에다', ['…고마워요. 이거 가져가세요. 할아버지가 동굴에 갈 때마다 챙기시던 수프예요.', '동굴 입구는 해안 동쪽, 절벽 아래예요.']);
      await S.give('warm_soup', 3);
      Game.setFlag('cave4_open');
      S.stage('main5', 3);
      await S.goalUpdate('main5');
      return;
    }
    await S.say('에다', byP({
      25: '…누구세요? 할아버지는 지금 안 계세요.',
      28: '동굴을 지나셨어요? 할아버지는요? 할아버지는…!',
      29: ['할아버지가 돌아오셨어요! 흐아앙… 고마워요, 정말 고마워요.', '등대 불빛이 다시 바다를 비추고 있어요. 할아버지는 그게 제일 기쁘대요.'],
      32: '바다가 조용해졌어요. 할아버지가 그러는데, 이렇게 맑은 북해는 처음이래요.',
    }));
  },
  async bartol() {
    await S.say('등대지기 바르톨', byP({
      29: ['자네들이 날 녹여 줬다고? 허허, 이 늙은이가 얼음 조각이 될 뻔했군.', '그 잿빛 불꽃 말이야. 렌즈에 그걸 피운 순간부터 등대는 길을 비추는 게 아니라, 무언가를 부르기 시작했지.'],
      30: ['오르카 함장… 그 사람은 물때를 읽는 데 바다 제일이었지.', '바다 사람들은 말하지. 물이 차오를 땐 칼을 거두고, 물이 빠질 땐 입을 다물라고. …이제 다 끝난 얘기지만.'],
      32: '등대는 다시 밤바다를 지킬 거네. 자네들이 돌아오는 밤에도 말이야.',
    }));
    if (!Game.flag('bartol_gift')) {
      Game.setFlag('bartol_gift');
      await S.say('등대지기 바르톨', '이건 내 감사의 표시일세. 등대지기의 비상약이지. 몸이 얼어붙거든 들이켜게.');
      await S.give('elixir', 2);
    }
  },

  // ── 해식 동굴: 서리엄니 ──
  async walrus() {
    if (Game.flag('walrus_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    S.sfx('roar');
    await S.say(null, ['(동굴 출구 앞, 거대한 바다코끼리가 얼음 위에 몸을 누이고 있다. 엄니에 서리가 꽃처럼 피어 있다.)', '(바다코끼리가 천천히 고개를 들었다. 그 등 뒤로 등대로 이어지는 계단이 보인다.)']);
    await Story.line('nell', '…길을 막고 있어. 비켜 줄 생각은 없어 보이고.');
    await Story.line('bran', '덤벼라, 커다란 물개! 아, 바다코끼리였나? 아무튼!');
    const r = await S.battle(['frost_walrus'], { bg: 'icecave', bgm: 'boss', boss: true, canEscape: false, intro: '얼음 동굴의 주인 서리엄니' });
    if (r !== 'win') return;
    Game.setFlag('walrus_defeated');
    S.hideNpc('walrus');
    Sound.bgm('cave');
    await S.say(null, '(서리엄니가 쓰러지자, 동굴 천장의 고드름들이 녹아 똑똑 떨어지기 시작했다.)');
    await Story.line('linette', '이 바다코끼리… 날뛰던 게 아니라 무언가를 피해 이 동굴에 숨어 있었던 것 같아요. 등대 쪽에서 내려오는 냉기를요.');
    S.stage('main5', 4);
    await S.goalUpdate('main5');
  },

  // ── 등대 꼭대기: 카산드라 ──
  async cassandraLighthouse() {
    if (Game.flag('cassandra_joined')) return;
    S.facePlayer('up');
    Sound.stop();
    await S.say(null, '(등명실 한가운데, 거대한 렌즈 안에서 잿빛 불꽃이 차갑게 타오르고 있다. 그 앞에 한 여인이 등을 돌리고 서 있다.)');
    Sound.sfx('chime');
    await S.say('???', '…♪ 별이 잠들면 시계도 잠들고… 엄마가 오면… ♪');
    await S.say(null, '(노래가 중간에 끊겼다. 여인이 천천히 돌아섰다.)');
    if (Game.inParty('nell')) {
      await S.say('넬', '…언니.');
      await S.say('카산드라', ['넬. 역시 왔구나. 이 불을 켜면 네가 올 것 같았어.', '…아니, 거짓말이야. 오지 않기를 바랐어.']);
    } else {
      await S.say('카산드라', '…열쇠님. 넬은 같이 안 왔나요? 다행이에요. 그 아이한테는 보이고 싶지 않았으니까.');
    }
    await S.say('카산드라', ['이 잿빛 불꽃은 신호예요. 안개 속의 배를 이 바다로 부르는.', '오스릭 님의 명령이었어요. 「파도의 종으로 가는 배를 불러라」.']);
    await Story.line('linette', '그런데… 왜 불 앞에서 망설이고 있는 거예요?');
    await S.say('카산드라', ['…시계탑에서요. 종이 열쇠님에게 환영을 보여 줬을 때, 저한테도 보였어요.', '엄마가 있었어요. 마지막 날의 엄마. 침대에서 제 손을 잡고 이렇게 말했어요.', '「카스, 넬을 부탁해.」']);
    await S.say('카산드라', ['장막 너머에 엄마는 없었어요. 엄마가 남긴 건, 넬이었어요.', '그런데 나는 8년 동안 넬을 혼자 두고… 엄마를 찾겠다고…']);
    if (Game.inParty('nell')) {
      await S.say('넬', ['…바보 언니. 8년 늦었어.', '그래도… 늦어도 괜찮아. 이제 같이 가.']);
    }
    await S.say('카산드라', '……이 불은 끌게요. 내 손으로.');
    Sound.sfx('mist');
    await S.say(null, '(카산드라가 렌즈에 손을 뻗는 순간── 잿빛 불꽃이 거세게 일어나며 사람의 모양을 이루었다!)');
    const e1 = Field.npc('elite_lh1'), e2 = Field.npc('elite_lh2');
    if (e1) e1.visible = true; if (e2) e2.visible = true;
    await S.say('성가대 정예기사', ['제2성부. 배신은 처형이다. 오스릭 님의 명이다.', '신호의 불꽃이여, 배를 부르는 노래를 멈추지 마라!']);
    await Story.line('bran', '언니든 누구든 상관없어! 노래하는 사람한테 칼을 들이대는 놈들은 용서 못 해!');
    const r = await S.battle(['choir_elite', 'grey_wisp', 'choir_elite'], { bg: 'lighthouse', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 신호 불꽃과 성가대 정예기사' });
    if (r !== 'win') return;
    S.hideNpc('elite_lh1'); S.hideNpc('elite_lh2');
    Sound.bgm('sad');
    await S.say(null, '(잿빛 불꽃이 사그라들자, 렌즈는 텅 빈 채 어둠 속에 남았다.)');
    await S.say('카산드라', ['…불이 꺼졌어요. 하지만 이대로면 등대는 그냥 어두운 탑이에요.', '렌즈에 진짜 빛을 넣어야 해요. 별빛 같은 빛을.']);
    await Story.line('mio', '{H} 님, 손등이…!');
    Sound.sfx('chime'); Engine.flash('#fff4c0', 0.7);
    await S.say(null, ['({H}의 손등의 낙인이 저절로 빛나기 시작했다. 빛은 손등을 떠나 렌즈 한가운데로 날아들었다.)', '(──번쩍. 거대한 렌즈가 별빛을 머금고, 하얀 빛줄기가 밤바다를 가로질렀다.)']);
    Game.setFlag('cassandra_joined');
    Field.refreshNpcs();
    Sound.bgm('shrine');
    await S.say(null, '(빛줄기 끝, 안개가 걷힌 만 한가운데에… 회색 돛을 단 거대한 배가 떠 있다.)');
    await S.say('카산드라', ['「회색 갈매기호」. 제4성부 오르카의 배예요.', '…열쇠님. 저를 데려가 주세요. 성가대가 무엇을 하려는지, 저는 알아요. 그리고 넬 옆에 있고 싶어요.']);
    await S.join('cassandra');
    if (Game.inParty('nell')) {
      await S.say('넬', '…어서 와, 언니.');
      await S.say('카산드라', ['…응. 다녀왔어, 넬.', '이거, 엄마 로켓이야. 8년 동안 내가 가지고 있었는데… 이제 우리 둘 거야.']);
      await S.give('choir_locket', 1);
    }
    await Story.line('linette', '아래층의 할아버지! 냉기가 사라졌으니까──');
    await S.say(null, '(1층에서 얼음이 깨지는 소리와 함께, 노인의 기침 소리가 들려왔다.)');
    S.stage('main5', 5);
    await S.goalUpdate('main5', '\n[d](등대지기 바르톨은 마을로 돌아갔다. 렌즈 옆의 마법진으로 마레아까지 돌아갈 수 있다.)[/]');
  },

  // ── 유령선에 오르기 ──
  async boardShip() {
    if (!(await S.yesno(null, '그레고르의 배를 타고 만 한가운데의 회색 배로 갈까?'))) return;
    await Engine.fadeOut(500);
    Sound.sfx('step');
    await S.say(null, '(노 젓는 소리만이 얼어붙은 바다 위에 울린다. 회색 돛이 점점 가까워진다…)');
    await S.warp('ship_deck', 2, 7, 'right', { sfx: 'stairs' });
  },

  // ── 선장실: 알드윈의 수첩 ──
  async osricNotebook() {
    await S.say(null, ['(수첩을 펼치자, 첫 장에 크레용으로 그린 그림이 있다. 안경 쓴 남자와 작은 여자아이가 손을 잡고 있다.)', '(그림 아래 서툰 글씨: 「아빠, 질문은 등불이야! 모르는 게 있으면 불을 켜는 거야! ─ 엘리」)']);
    if (Game.inParty('linette')) {
      await Story.line('linette', ['……질문은 등불.', '교수님이 강의 첫날마다 하시던 말이에요. 제 인생을 바꾼 말이었어요.', '그게… 엘리가 한 말이었어요. 일곱 살 엘리가.']);
      await Story.line('linette', ['교수님은 엘리가 켜 준 등불을 들고, 20년 동안 같은 질문만 하신 거예요. 「왜 엘리가 죽어야 했나」.', '…그 수첩, 제가 가지고 있을게요. 마지막에 돌려드려야 하니까.']);
    }
    await S.say(null, '(뒷장에는 다섯 개의 종과 「열쇠」, 그리고 하늘에 떠 있는 섬 하나가 그려져 있다.)');
  },

  // ── 선미 갑판: 제4성부 오르카 ──
  async orca() {
    if (Game.flag('orca_defeated')) return;
    S.facePlayer('right');
    Sound.stop();
    await S.say(null, '(키를 잡은 사내가 천천히 돌아섰다. 낡은 해군 외투가 바람에 펄럭인다. 그 뒤로 초록빛 안개 속에서 선원들의 그림자가 일렁인다.)');
    await S.say('오르카', ['…등대를 켠 게 너희로군. 덕분에 안개가 걷혔다.', '나는 이 배의 함장, 잿빛 성가대의 제4성부 오르카.']);
    if (Game.inParty('cassandra')) await S.say('오르카', '제2성부. 노래를 그만두었다고 들었다. …아쉽군. 네 노래는 선원들이 좋아했는데.');
    await S.say('오르카', ['15년 전 오늘 같은 밤이었다. 바다가 울부짖고, 은빛 갈매기호는 두 동강이 났지.', '나는 마지막 한 명까지 끌어올리려 했다. 그러나 살아남은 건… 함장인 나 하나뿐이었다.']);
    await S.say('오르카', ['장막이 열리면 선원들이 돌아온다. 마흔 명 모두. 이번에는 내가 한 명도 놓치지 않는다.', '그러기 위해 파도의 종이 필요하다. 그리고 열쇠, 너도.']);
    if (Game.inParty('bran')) {
      await Story.line('bran', ['…우리 아버지도 동료를 잃었어. 지키지 못했다고, 기사를 그만두고 대장간을 열었어.', '아버지는 도끼를 내려놨는데… 당신은 닻을 들고 유령이 됐구나.']);
      await S.say('오르카', '…네 아버지는 현명했군. 나는 내려놓을 줄을 몰랐다.');
    }
    await S.say('오르카', '전원, 전투 배치!');
    const r = await S.battle(['orca'], { bg: 'ship', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 성가대 제4성부 오르카' });
    if (r !== 'win') return;
    Game.setFlag('orca_defeated');
    await Story.afterOrca();
  },
  async afterOrca() {
    Sound.bgm('sad');
    await S.say(null, '(오르카가 키에 기대어 무릎을 꿇었다. 손에서 녹슨 닻이 미끄러져 떨어졌다.)');
    await S.say('오르카', ['…15년. 15년 동안 매일 밤, 이 갑판에서 선원들의 이름을 불렀다.', '대답은… 한 번도 없었지.']);
    await S.say(null, ['(그때, 안개 속 그림자들이 하나둘 함장 곁으로 다가왔다. 그림자들은 아무 말 없이 함장의 어깨에 손을 얹었다.)', '(마흔 개의 손이 함장을 감쌌다.)']);
    await S.say('오르카', ['……너희는. 계속 여기 있었나. 내가 부르는 동안, 내내…', '그래. 그래, 이제 됐다. 다 같이 가자.']);
    if (Game.inParty('cassandra')) await Story.line('cassandra', '…진혼가를 불러 드릴게요. 선원들이 좋아하던 노래로.');
    Sound.sfx('chime');
    await S.say(null, '(노랫소리 속에서, 함장과 선원들의 그림자가 초록빛 안개와 함께 흩어졌다.)');
    Sound.sfx('thunder'); Engine.shake(8, 1.2);
    await S.say(null, '(콰아앙──! 함장이 사라진 순간, 배가 크게 기울었다. 갑판 틈으로 바닷물이 쏟아져 들어온다!)');
    await Story.line('bran', '가, 가라앉는다아아!!');
    await Story.line('mio', '아니에요…! 이 배, 우리를 데려가려는 거예요. 바닷속에서… 종이 부르고 있어요!');
    S.hideNpc('orca_helm');
    await Engine.fadeOut(900, '#0a2a3a');
    Sound.stop();
    await S.say(null, ['(차가운 물이 온몸을 감쌌다. 숨이 막히는 순간, 투명한 막이 일행을 감쌌다.)', '(배는 천천히, 아주 천천히 바다 밑으로 가라앉아 갔다──)']);
    S.stage('main5', 8);
    await S.warp('sunken1', 12, 18, 'up', { slow: true });
    await S.goalUpdate('main5');
  },

  // ── 파도 종의 방: 심해의 수호자 레비아 ──
  async levia() {
    if (Game.flag('levia_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    S.sfx('roar');
    await S.say(null, ['(청록빛 종 아래, 거대한 그림자가 똬리를 틀고 있다. 수많은 팔이 종을 휘감고, 몸 곳곳에서 잿빛 불꽃이 피어오른다.)', '(그림자가 눈을 떴다. 두 개의 거대한 눈동자가 일행을 내려다본다.)']);
    await Story.line('mio', ['종을 지키는 수호자예요…! 그런데 아파하고 있어요. 잿빛 불꽃이 몸을 태우고 있어요.', '벨가르 씨처럼… 원래는 종을 지키던 분이에요.']);
    if (Game.inParty('cassandra')) await Story.line('cassandra', '성가대가 등대에서 부른 불꽃이에요. 신호를 따라 종까지 흘러들어 온 거예요. …제 탓이에요.');
    await Story.line('linette', '「수호자의 팔이 많을수록 바다는 높이 일어난다」… 벽화가 그랬어요!');
    const r = await S.battle(['levia_tentacle', 'levia', 'levia_tentacle'], { bg: 'sunken', bgm: 'boss', boss: true, canEscape: false, intro: '심해의 수호자 레비아' });
    if (r !== 'win') return;
    Game.setFlag('levia_defeated');
    await Story.afterLevia();
  },
  async afterLevia() {
    Sound.stop();
    S.hideNpc('levia_npc');
    await S.say(null, '(레비아의 몸에서 잿빛 불꽃이 빠져나와 흩어졌다. 거대한 수호자는 조용히 팔을 거두고, 종을 한 번 쓰다듬은 뒤 깊은 어둠 속으로 가라앉았다.)');
    if (Game.inParty('mio') && Game.inParty('cassandra')) {
      await Story.line('mio', '카산드라 씨. …같이 불러 주실래요? 종이 잠들 수 있게.');
      await Story.line('cassandra', '…응. 같이 부르자.');
      Sound.sfx('chime');
      await S.say(null, '(두 사람의 노래가 겹쳐지자, 파도 종이 맑게 떨리기 시작했다.)');
    }
    Sound.sfx('bell');
    Engine.flash('#c8fff8', 0.6);
    await S.say(null, '──데에엥.\n(파도 종이 울렸다. 바닷속 깊은 곳까지, 잔잔하고 깊게.)');
    Sound.bgm('shrine');
    Engine.flash('#a8fff0', 0.4);
    Sound.jingle('item');
    await S.say(null, '[y]파도의 심장[/]이 {H}의 손에 내려앉았다. 귀를 기울이면 먼 바다의 파도 소리가 들린다.');
    Game.addItem('wave_heart', 1);
    await S.say(null, '(시간의 심장, 모래의 심장, 그리고 파도의 심장. 세 개의 구슬이 손안에서 서로를 부르듯 울린다.)');
    // 오스릭 등장
    Sound.sfx('hit'); await S.wait(250); Sound.sfx('hit');
    const os = Field.npc('osric_sea');
    if (os) { os.visible = true; os.x = os.fromX = 9; os.y = os.fromY = 11; }
    await S.walkNpc('osric_sea', ['up'], 3);
    await S.say('오스릭', ['네 번째 심장도 열쇠에게 모였군. 오르카는… 편히 쉬었나.', '그는 좋은 함장이었다. 선원들을 너무 사랑했을 뿐.']);
    if (Game.inParty('cassandra')) {
      await S.say('오스릭', '카산드라. 네 노래가 그리울 거다.');
      await Story.line('cassandra', '…저는 이제 제 노래를 불러요, 오스릭 님. 아니, 알드윈 교수님.');
    }
    if (Game.inParty('linette')) {
      await Story.line('linette', ['교수님. 「회색 갈매기호」 선장실에서 교수님 수첩을 찾았어요.', '「질문은 등불」. …엘리가 한 말이었죠.']);
      await S.say('오스릭', ['……그 수첩을 보았나.', '(오스릭은 처음으로 대답을 망설였다.)', '…그래. 엘리가 켜 준 등불이었다. 나는 20년 동안 그 불빛 하나로 어둠을 걸어왔지.']);
      await Story.line('linette', '그 등불은 엘리를 되살리라고 켜 준 게 아니에요. 계속 질문하라고 켜 준 거예요. 교수님이 저한테 그랬던 것처럼.');
      await S.say('오스릭', '…마지막 종에서 다시 물어라, 리네트. 그때는 답해 주마.');
    }
    await S.say('오스릭', ['마지막 종은 하늘에 있다. 들리나? 네 개의 심장이 부르는 소리가.', '보아라.']);
    Sound.sfx('thunder'); Engine.shake(6, 1.4); Engine.flash('#ffffff', 0.8);
    await S.say(null, ['(신전 천장 너머, 아득한 해수면 위로 빛이 쏟아졌다.)', '(바다 위 구름이 갈라지고── 거대한 섬 하나가 하늘로 떠오르는 것이 보였다.)']);
    await S.say('오스릭', ['「하늘섬 셀레스」. 다섯 번째, 마지막 종의 자리다.', '{H}. 저편의 시계 소리가 들리나? 서두르는 게 좋을 거다.']);
    // 환영: 원래 세계
    await Engine.fadeOut(600, '#ffffff');
    Sound.stop();
    await S.say(null, ['…삐─, 삐─, 삐─.', '「{H}, 의사 선생님이 수술을 해 보자고 하셨어. 다음 주 화요일이야.」', '「엄마는 무서워. 그래도… 너는 늘 엄마보다 용감했잖아. 그러니까, 꼭 깨어나야 해.」', '손을 잡은 손이 떨리고 있다──']);
    Sound.sfx('chime');
    await Engine.fadeIn(600, '#ffffff');
    S.hideNpc('osric_sea');
    await S.say(null, '(정신을 차리자 오스릭의 모습은 사라지고 없었다.)');
    Sound.bgm('shrine');
    const c = await S.ask(null, '(다음 주 화요일…)', ['…수술이래. 다음 주.', '…아무것도 아니야.'], 1);
    if (c === 0) {
      await Story.line('nell', '…다음 주. 그 전에 끝내자. 우리가 같이 있잖아.');
      await Story.line('bran', '기사의 약속이야. 화요일 전에 데려다줄게. 그러니까 그런 얼굴 하지 마!');
    } else {
      await Story.line('mio', '{H} 님. 말하지 않아도 알아요. …그래도 다음엔 말해 주세요.');
    }
    if (Game.inParty('cassandra')) await Story.line('cassandra', '…기다리는 사람이 있다는 거, 좋은 거예요. 늦기 전에 돌아가요. 저처럼 8년이나 늦지 말고.');
    S.stage('main5', 9);
    await S.goalUpdate('main5', '\n[d](종 옆의 마법진으로 마레아까지 돌아갈 수 있다.)[/]');
  },

  // ── 서브: 집게왕 현상수배 ──
  async kingCrab() {
    S.sfx('roar');
    await S.say(null, '(모래톱 위에 집채만 한 게가 버티고 있다. 집게 하나가 어선의 노를 장난감처럼 부러뜨린다.)');
    if (!(await S.yesno(null, '집게왕이 집게를 딱딱 부딪친다! 싸울까?'))) return;
    const r = await S.battle(['king_crab'], { bg: 'snowfield', bgm: 'boss', boss: true, canEscape: false, intro: '해안의 무법자 집게왕' });
    if (r !== 'win') return;
    S.hideNpc('king_crab');
    await S.say(null, '(집게왕이 거품을 물고 쓰러졌다. 거대한 집게발 하나가 모래 위에 떨어져 있다.)');
    await S.give('crab_claw', 1);
    S.stage('s_crab', 1);
    await S.goalUpdate('s_crab');
  },

  // ── 서브: 얼어붙은 편지 ──
  async frozenLetter() {
    await S.say(null, ['(겉봉에 번진 글씨: 「마레아의 엘사에게」)', '(뒷면에는 「은빛 갈매기호 갑판원 한스」라고 적혀 있다.)']);
    await Story.line('linette', '은빛 갈매기호… 15년 전에 가라앉은 배예요. 이 편지, 15년 동안 얼음 속에 있었던 거예요.');
    if (!Quests.get('s_frozen')) await S.startQuest('s_frozen');
  },
  async elsa() {
    if (Quests.isActive('s_frozen') && Game.count('frozen_letter')) {
      await S.say('엘사', ['…이 글씨. 한스의 글씨야.', '(엘사는 떨리는 손으로 편지를 펼쳤다.)']);
      await S.say(null, '「엘사. 이번 항해가 끝나면 그 반지를 정식으로 끼워 줄게. 갈매기호가 돌아오는 날, 등대 불빛 아래에서 기다려 줘. ─ 한스」');
      await S.say('엘사', ['…바보. 15년이나 늦었잖아.', '(엘사는 한참 동안 울다가, 앞치마에 얼굴을 닦고 웃었다.)', '고마워요. 이제야 기다림을 끝낼 수 있겠어요. 이건… 그 사람이 주려던 반지예요. 바다로 나가는 당신들이 가져가요.']);
      Game.removeItem('frozen_letter', 1);
      await S.completeQuest('s_frozen');
      return;
    }
    await S.say('엘사', byP({
      25: ['「갈매기」에 어서 와요. 수프 한 그릇 하고 가요. 몸이 녹을 거예요.', '…등대가 꺼지니까 이상하게 옛날 생각이 나네요.'],
      30: '유령선의 선장이 오르카 함장이었다고요? …그럼 그 배에는 한스도.',
      32: '등대 불빛 아래에서 15년 기다렸어요. 이제 바다를 미워하지 않을래요.',
    }));
  },

  // ── 4장 엔딩 ──
  async chapter4Ending() {
    await S.say('항만장 그레고르', ['돌아왔군…! 회색 배가 가라앉고 나서 바다가 거짓말처럼 잠잠해졌어.', '오늘 아침 첫 배가 나갔다. 한 달 만이야.']);
    await S.say(null, '(일행은 바닷속에서 있었던 일을 이야기했다. 오르카와 선원들, 레비아, 그리고 하늘로 떠오른 섬.)');
    await S.say('항만장 그레고르', ['…오르카 함장이 선원들과 함께 갔다고. 그래, 그 사람다운 끝이야.', '하늘섬이라… 오늘 새벽, 북쪽 하늘에 섬 그림자가 보였다고 어부들이 떠들더군. 술에 취한 줄 알았는데.']);
    await Story.line('linette', '네 개의 심장… 이제 마지막 하나예요. 교수님도 거기서 기다리고 있을 거예요.');
    if (Game.inParty('cassandra')) await Story.line('cassandra', '마지막 종에는 제1성부가 있어요. 성가대에서 오스릭 님 다음으로 강한 사람. …다들 각오해요.');
    await Story.line('nell', '언니가 있으니까 이번엔 좀 든든하네. …조금.');
    await Story.line('bran', '{H}, 화요일 전이야. 잊지 마!');
    await S.say('항만장 그레고르', '마레아는 당신들을 잊지 않을 거다. 이건 북해의 은인에게 주는 징표야.');
    await S.completeQuest('main5');
    Game.setFlag('chapter4_done');
    await Story.chapterCard({ num: '제4장', title: '파도의 종', next: 'To be continued ─ 제5장 「하늘의 종」', bgm: 'harbor' });
    await S.say('항만장 그레고르', ['하늘섬까지 가는 길은… 글쎄, 배로는 못 가겠지. 왕도 학장이라면 뭔가 알지도 모르겠군.', '그때까지 쉬어 가. 마레아의 등불은 이제 꺼지지 않으니까.']);
    if (await S.yesno(null, '여기까지의 모험을 기록할까요?')) await Menu.saveScreen();
  },
});
