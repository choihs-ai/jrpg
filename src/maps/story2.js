'use strict';
// ─────────────────────────────────────────────────────────────
// 제2장 「왕도로 가는 길」 스토리 이벤트
//  잿빛 성가대의 두 번째 표적은 왕도 시계탑 아래 잠든 「시간의 종」.
//  브란은 아버지의 과거와 마주하고, 넬은 헤어진 언니와 재회한다.
//  그리고 오스릭(알드윈)이 장막을 열려는 이유가 드러난다.
// ─────────────────────────────────────────────────────────────
Object.assign(Story, {
  // ── 2장 시작: 장로의 배웅 ──
  async beginChapter2(onRoad) {
    if (Quests.get('main3')) return;
    if (!onRoad) {
      await S.say('하르도 장로', ['그래, 떠날 때가 되었군.', '동쪽 숲을 지나 은빛 가도를 따라가면 왕도 아스테리온일세. 마침 「별내림 축제」 기간이라 길이 붐빌 게야.', '왕도의 마도학원과 수호기사단에 이 일을 알리게. 리네트 양이라면 학원에 아는 이가 있겠지.']);
      await Story.line('bran', '수호기사단…! 드디어 왕도에 가는구나!');
    }
    Game.setFlag('ch2_started');
    await S.startQuest('main3');
  },

  // ── 은빛 다리: 집행자 베인 ──
  async vane() {
    if (Game.flag('vane_defeated')) return;
    S.facePlayer('right');
    Sound.stop();
    for (const id of ['acolyte_hw1', 'acolyte_hw2']) { const n = Field.npc(id); if (n) n.visible = true; }
    await S.say(null, '(다리 한가운데에 잿빛 옷을 입은 자들이 길을 막고 서 있다. 가운데의 사내는 거대한 낫을 쥐고 있다.)');
    await S.say('???', ['…왔군. 손등에 별을 새긴 자.', '나는 잿빛 성가대의 집행자, 베인. 이 다리에서 사흘을 기다렸다.']);
    await Story.line('bran', '잿빛 성가대…! 그 오스릭이라는 아저씨 패거리지!');
    await S.say('베인', ['오스릭 님께서는 너를 상처 없이 데려오라 하셨지.', '하지만 나는 생각이 다르다. 열쇠에 필요한 건 그 손뿐이니까.']);
    await Story.line('nell', '…손만? 으, 기분 나빠.');
    await Story.line('linette', '교수님이… 당신들한테 그런 걸 시켰다고요?');
    await S.say('베인', '물러서라, 학자 계집. 제2성부께서 시간의 종 아래에서 기다리고 계신다. 열쇠는 그분께 바쳐질 것이다!');
    await Story.line('mio', '{H} 님은 물건이 아니에요!');
    const r = await S.battle(['choir_acolyte', 'vane', 'choir_acolyte'], { bg: 'plains', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 성가대 집행자 베인' });
    if (r !== 'win') return;
    Game.setFlag('vane_defeated');
    for (const id of ['vane_hw', 'acolyte_hw1', 'acolyte_hw2']) S.hideNpc(id);
    Sound.bgm('field');
    await S.say('베인', ['크윽… 이 정도일 줄이야…', '하지만 늦었다. 제2성부께서는 이미 탑에 계신다. 시간은… 이미 멈췄다…!']);
    Engine.flash('#c040ff', 0.4); Sound.sfx('summon');
    await S.say(null, '(베인은 잿빛 연기와 함께 사라졌다. 그 자리에 찢어진 악보 한 장이 떨어져 있다.)');
    await S.give('choir_score', 1);
    await Story.line('linette', ['「제2성부는 시간의 종 아래에서 노래하리라」…', '시간의 종. 왕도에서 시계라면… 학원의 시계탑밖에 없어요.']);
    await Story.line('mio', '종의 노래가 그쪽에서 들려요. 째깍, 째깍… 점점 느려지고 있어요.');
    S.stage('main3', 1);
    await S.say(null, '[y]목표 갱신: 은빛 가도를 따라 왕도 아스테리온에 들어간다[/]');
  },

  // ── 현상수배: 회색갈기 ──
  async greymane() {
    S.sfx('roar');
    await S.say(null, '(굴 앞에 은빛 갈기를 가진 거대한 늑대가 웅크리고 있다. 주위에 부서진 마차 바퀴가 흩어져 있다.)');
    if (!(await S.yesno(null, '회색갈기가 이빨을 드러낸다! 싸울까?'))) return;
    const r = await S.battle(['greymane'], { bg: 'forest', bgm: 'boss', boss: true, canEscape: false, intro: '늑대 우두머리 회색갈기' });
    if (r !== 'win') return;
    S.hideNpc('greymane');
    await S.say(null, '(회색갈기는 마지막으로 길게 울부짖더니 쓰러졌다. 송곳니 하나가 바닥에 떨어져 있다.)');
    S.stage('s_bounty', 1);
    await S.say(null, '[g]왕도의 수호기사단 본부에 보고하자.[/]');
  },

  // ── 왕도 도착 ──
  async arriveCapital() {
    Game.setFlag('reached_capital');
    Game.state.respawn = { map: 'cap_inn', x: 7, y: 7, dir: 'up', who: '여관 주인 볼프' };
    Sound.sfx('chime');
    await S.say(null, ['(성문을 지나자 형형색색의 깃발과 별 모양 등불이 거리를 가득 메우고 있다.)', '(어디선가 음악 소리와 아이들의 웃음소리. 하늘에서는 축포 대신 반짝이는 가루가 흩날린다.)']);
    await Story.line('bran', '우와아아…! 이게 왕도…! 저기 봐, 성이야! 진짜 성이라고!');
    await Story.line('nell', '…변한 게 없네. 사람 많은 것도, 냄새도.');
    await Story.line('mio', '넬, 왕도에 와 본 적 있어요?');
    await Story.line('nell', '…여기서 태어났어. 나중에 얘기해 줄게.');
    await Story.line('linette', ['학원은 서쪽, 기사단 본부는 동쪽이에요.', '먼저 학원의 오필리아 학장님을 찾아가요. 교수님의 옛 동료셨어요. 시간의 종에 대해서도 아실 거예요.']);
    S.stage('main3', 2);
    await S.say(null, '[y]목표 갱신: 왕립 마도학원의 학장을 만난다[/]\n[d](쓰러지면 이제 왕도의 여관에서 깨어난다. 귀환의 날개로 왕도에 돌아올 수도 있다.)[/]');
  },

  // ── 마도학원: 오필리아 학장 ──
  async dean() {
    const p = Game.progress();
    if (p === 11) {
      await S.say('오필리아 학장', '…리네트? 리네트 아니니! 반년 동안 연락도 없이, 대체 어디서 뭘──');
      await Story.line('linette', '학장님. 교수님을… 알드윈 교수님을 찾았어요.');
      await S.say(null, '(리네트는 리벨의 유적에서 있었던 일을 이야기했다. 오스릭이라는 이름, 잿빛 성가대, 그리고 빼앗긴 종의 심장.)');
      await S.say('오필리아 학장', ['…그랬구나. 알드윈이.', '반년 전, 그가 금서고에 드나드는 걸 봤어. 「장막 너머의 기록」이라는 책이 그 뒤로 사라졌지.']);
      await S.say('오필리아 학장', ['{H} 군이라고 했나. 그 손등을 보여 주겠나.', '(학장은 한참 동안 낙인을 들여다보았다.)', '「별의 열쇠」… 학원의 기록에도 나와. 「열쇠는 닫힌 것을 열고, 열린 것을 닫는다」고.', '열 수 있다는 건, 닫을 수도 있다는 뜻이지. 그걸 잊지 말게.']);
      await S.say('오필리아 학장', ['두 번째 종 말인데. 「시간의 종」은 이 학원의 시계탑 아래에 잠들어 있다네. 탑이 종 위에 세워졌지.', '리벨의 종이 울린 그 밤부터 탑의 시계가 멈췄어. 탑 안에서는 시간이 얼어붙고, 문은 꿈쩍도 하지 않아.', '그래서 왕명으로 기사단이 탑을 봉쇄했다네. 탑에 들어가려면 수호기사단장 라인하르트의 허가가 필요해.']);
      await Story.line('bran', '기사단! 제가 갈게요! 아니, 우리가 갈게요!');
      await S.say('오필리아 학장', ['…그리고 리네트. 알드윈에 대해 네가 모르는 게 있어.', '그에게는 딸이 있었단다. 엘리. 20년 전 왕도에 「회색병」이 돌았을 때… 일곱 살이었지.', '그 뒤로 그는 연구에만 매달렸어. 너를 제자로 받은 것도 그 무렵이고.']);
      await Story.line('linette', '…교수님에게, 딸이…? 한 번도… 한 번도 그런 말씀은…');
      await S.say('오필리아 학장', '라인하르트에게 가 보게. 기사단 본부는 광장 동쪽일세. 그 고집쟁이가 쉽게 허락하진 않겠지만.');
      Game.setFlag('met_dean');
      S.stage('main3', 3);
      await S.say(null, '[y]목표 갱신: 수호기사단 본부의 기사단장을 만난다[/]');
      return;
    }
    if (p === 15) { await Story.chapter2Ending(); return; }
    await S.say('오필리아 학장', byP({
      12: '라인하르트는 기사단 본부에 있을 걸세. 그 고집쟁이를 설득하는 건 자네들 몫이야.',
      13: ['탑 문이 열리지 않는다고? …그렇겠지. 탑 안의 시간이 멈춰 있으니까.', '하지만 길은 있네. 탑은 원래 거대한 물시계였어. 지하의 옛 수로가 탑의 기초까지 이어져 있지.', '뒷골목의 수로 관리인 오토에게 기사단 문장을 보여 주게. 맨홀 열쇠를 갖고 있을 걸세.'],
      14: '시계탑 위층으로 갈수록 시간의 흐름이 이상해질 거야. 조심하게.',
      16: ['남은 세 개의 종… 사막, 북해, 그리고 하늘섬. 길은 멀지만, 자네들이라면 갈 수 있을 걸세.', '리네트, 가끔은 편지를 보내렴. 이번엔 꼭.'],
    }));
    if (p === 13 && Quests.isActive('main3') && Quests.stage('main3') === 5) {
      S.stage('main3', 6);
      await S.say(null, '[y]목표 갱신: 뒷골목의 수로 관리인 오토를 찾아간다[/]');
    }
  },

  async towerDoor() {
    if (!Game.flag('bran_knight')) {
      await S.say(null, '시계탑으로 이어지는 문이다. 손을 대자 얼음처럼 차갑다. 문고리는 시간이 멈춘 듯 꿈쩍도 하지 않는다.');
      await S.say(null, '[d](기사단의 봉인 표식도 붙어 있다.)[/]');
      return;
    }
    await S.say(null, '문에 손을 대자 손끝이 얼어붙을 듯 차갑다. 문은 멈춘 시간 속에 갇혀 꿈쩍도 하지 않는다.');
    if (Quests.isActive('main3') && Quests.stage('main3') === 5) {
      await Story.line('linette', '이건 힘으로 열 수 있는 문이 아니에요. 문 자체의 시간이 멈춰 있어요.');
      await Story.line('bran', '단장님도 기사단이 못 열었다고 했지… 학장님께 다른 길이 없는지 물어보자.');
    }
  },

  // ── 서고: 사서 펠릭스 (금서 회수) ──
  async felix() {
    const q = Quests.get('s_book');
    if (!q && Game.progress() >= 12) {
      await S.say('사서 펠릭스', ['아, 리네트 양의 일행이군요. 학장님께 들었어요.', '실은… 금서고에서 책이 한 권 사라졌어요. 「장막 너머의 기록」. 알드윈 교수님이 마지막으로 빌려 가신 책이에요.', '그런데 얼마 전, 수로 관리인 오토 씨가 지하수로에서 학원 도서 표식이 찍힌 책을 봤다고 했어요. 혹시 수로에 가시면… 찾아봐 주시겠어요?']);
      await S.startQuest('s_book');
      return;
    }
    if (q && q.status === 'active' && Game.count('veil_book') > 0) {
      Game.removeItem('veil_book');
      await S.say('사서 펠릭스', ['이 책이에요! 「장막 너머의 기록」…! 오물 냄새가 좀 나지만… 무사해서 다행이에요.', '(펠릭스는 조심스럽게 책장을 넘겼다.)', '「…다섯 종이 모두 울리면 장막은 찢어지고, 죽은 자의 땅과 산 자의 땅이 하나가 되리라.」', '「그러나 별의 열쇠를 지닌 자는 장막을 닫을 수도 있으니, 그는 마지막 종 앞에서 선택하게 되리라.」']);
      await Story.line('linette', '…선택. 열 것인지, 닫을 것인지.');
      await S.say('사서 펠릭스', '고마워요. 이건 학원의 답례예요. 금서와 함께 봉인되어 있던 마도서인데, 리네트 양이라면 잘 쓰실 거예요.');
      await S.completeQuest('s_book');
      return;
    }
    await S.say('사서 펠릭스', q && q.status === 'done' ? '책을 찾아 주셔서 정말 감사해요. 학장님이 이번 일로 금서고 자물쇠를 세 개로 늘리셨어요.' : byP({ 11: '쉿, 서고에서는 조용히요. …리네트 양이 돌아왔다고요? 학장님이 기다리고 계세요.', 12: '수로에 가시면 학원 표식이 찍힌 책을 찾아봐 주세요.' }));
  },

  // ── 기사단 본부: 라인하르트 단장 ──
  async commander() {
    if (Quests.isActive('s_bounty') && Quests.stage('s_bounty') === 1) {
      await S.say('라인하르트 단장', ['회색갈기를 토벌했다고? …이 송곳니, 틀림없군.', '기사단이 두 번이나 놓친 놈이다. 상금은 약속대로 주마. 송곳니는 자네들이 가져가라. 증표로.']);
      await S.completeQuest('s_bounty');
      return;
    }
    const p = Game.progress();
    if (p === 12) {
      await S.say('라인하르트 단장', ['…학원의 학장이 보낸 자들인가. 용건은 알고 있다. 시계탑이지.', '안 된다. 그 탑은 왕명으로 봉쇄되어 있다. 외부인을 들일 수는 없다.']);
      await Story.line('linette', '하지만 잿빛 성가대가 이미 탑 안에 있을지도 몰라요!');
      await S.say('라인하르트 단장', '그렇다면 더더욱 기사단의 일이다. 시골에서 온 아이들이 나설 일이 아니야.');
      if (Game.inParty('bran')) {
        await S.say('브란', ['…그럼 기사단이 되면 되는 거죠?', '저는 리벨의 브란! 대장장이 드른의 아들입니다! 수호기사단 입단 시험을 보게 해 주십시오!']);
        await S.say('라인하르트 단장', ['…드른? 리벨의 드른이라고 했나?', '(단장의 눈빛이 달라졌다.)', '「강철팔 드른」의 아들이 기사가 되겠다고 왕도까지 왔다는 건가. 하하… 하하하!']);
        await S.say('브란', '아, 아버지를 아세요…?');
        await S.say('라인하르트 단장', ['알다마다. 20년 전, 내 부대의 부대장이었다. 북쪽 국경에서 마을 사람 열 명을 혼자 지켜 낸 사내지.', '…그리고 그날 동료 하나를 잃고, 스스로 검을 꺾어 기사단을 떠났다. 「지키지 못한 자에게 방패를 들 자격은 없다」면서.']);
        await S.say('브란', ['…아버지가… 기사였어요…?', '한 번도… 그런 얘기는 한 번도…']);
        await Story.line('mio', '브란…');
        await S.say('라인하르트 단장', ['좋다. 시험을 허락하지. 훈련장의 시험관 가웨인과 일대일로 겨뤄라. 동료의 도움은 없다.', '이기면 견습 기사로 인정하고, 견습 기사와 그 일행으로서 탑 출입을 허가하겠다.', '…드른의 아들이 어떤 방패를 드는지, 보여 다오.']);
      } else {
        await S.say('라인하르트 단장', '…기사단원이 아닌 자에게는 허가할 수 없다. 돌아가라.');
        return;
      }
      S.stage('main3', 4);
      await S.say(null, '[y]목표 갱신: 훈련장의 시험관 가웨인에게 도전한다 (브란 혼자 싸운다)[/]');
      return;
    }
    await S.say('라인하르트 단장', byP({
      11: '학원의 일이라면 학장을 먼저 만나라. 기사단은 바쁘다.',
      13: ['견습 기사 브란. 첫 임무다. 시계탑을 조사하고, 성가대가 있다면 막아라.', '탑 정문은 시간이 멈춘 채 꿈쩍도 하지 않는다. 기사단도 열지 못했다. 학원에 다른 길이 있는지 물어봐라.'],
      14: '수로의 「늙은 이빨」을 쓰러뜨렸다고? 드른의 아들답군.',
      16: ['「별의 수호대」라. 학장 녀석, 이름 하나는 잘 짓는군.', '브란. 드른에게 편지를 써라. 아들이 기사가 됐다고. …녀석, 울지도 모르겠군.'],
    }));
  },

  // ── 입단 시험: 브란 vs 가웨인 ──
  async gawainTalk() {
    if (Game.flag('bran_knight')) {
      await S.say('시험관 가웨인', Util.pick(['견습 기사 브란, 수련을 게을리하지 마라.', '그 방패 다루는 솜씨, 아버지를 쏙 빼닮았더군.', '언젠가 다시 겨뤄 보자. 그때는 봐주지 않겠다. …지난번에도 안 봐줬지만.']));
      return;
    }
    if (!(Quests.isActive('main3') && Quests.stage('main3') === 4)) {
      await S.say('시험관 가웨인', '훈련 중이다. 용건이 없다면 물러나라.');
      return;
    }
    await S.say('시험관 가웨인', ['네가 드른 선배의 아들인가. 덩치는 제법이군.', '규칙은 간단하다. 일대일. 쓰러지면 패배. 도구는 써도 좋다.', '…내가 목검을 높이 들면, 그다음 일격은 피할 수 없다. 받아 내는 법을 알아 둬라.']);
    if (!(await S.yesno('시험관 가웨인', '준비됐나?'))) { await S.say('시험관 가웨인', '준비가 되면 다시 와라.'); return; }
    // 시험 전에 브란을 회복시킨다
    const m = Game.state.members.bran;
    const st = Game.stats('bran');
    m.hp = st.maxhp; m.mp = st.maxmp; m.status = {};
    await S.say('브란', '…아버지. 보고 계세요.');
    const r = await S.battle(['gawain'], { bg: 'arena', bgm: 'boss', boss: true, canEscape: false, loseOk: true, party: ['bran'], intro: '입단 시험 ─ 시험관 기사 가웨인' });
    if (r === 'lose') {
      m.hp = Math.max(1, Math.round(st.maxhp * 0.5));
      await S.say('시험관 가웨인', ['…아직이다.', '하지만 눈은 죽지 않았군. 몇 번이고 다시 와라. 시험관은 도망가지 않는다.']);
      await Story.line('linette', '브란, 녀석이 목검을 높이 들면 「방어」나 「철벽」이에요! 그리고 체력이 줄면 도구를 아끼지 마요!');
      return;
    }
    Game.setFlag('bran_knight');
    await S.say('시험관 가웨인', ['…훌륭하다. 합격이다.', '마지막 순간, 등을 보이지 않더군. 「강철팔」의 방패 그대로다.']);
    await Engine.fadeOut(400);
    await Engine.fadeIn(400);
    await S.say('라인하르트 단장', ['보았다. 리벨의 브란, 오늘부터 너를 수호기사단 견습 기사로 임명한다.', '이것이 기사단 문장이다. 그리고 이건… 견습 기사의 방패다. 20년 전, 드른이 처음 받았던 것과 같은 모양이지.']);
    await S.give('knight_crest', 1);
    await S.give('squire_shield', 1);
    await S.say('브란', ['…감사합니다!', '(브란은 방패를 꼭 끌어안았다.)', '아버지는 지키지 못한 게 부끄러워서 검을 꺾었지만… 그래도 열 명을 지켰잖아요. 저는 그걸 자랑스러워할 거예요.', '그리고 언젠가… 아버지한테 이 방패를 보여 드릴 거예요.']);
    await Story.line('nell', '…울어? 너 지금 우는 거지?');
    await S.say('브란', '아, 안 울어! 땀이야! 땀!');
    await S.say('라인하르트 단장', ['견습 기사 브란과 그 일행에게 시계탑 출입을 허가한다.', '…다만 탑 정문은 시간이 멈춘 채 꿈쩍도 하지 않는다. 기사단도 열지 못했다. 직접 확인해 봐라.']);
    S.stage('main3', 5);
    await S.say(null, '[y]목표 갱신: 마도학원 안쪽, 시계탑의 문을 조사한다[/]\n[d](브란이 「견습 기사의 방패」를 받았다. 메뉴의 「장비」에서 바꿔 들 수 있다.)[/]');
  },

  // ── 뒷골목: 수로 관리인 오토 ──
  async otto() {
    if (Game.count('sewer_key') > 0 || Game.flag('croc_defeated')) {
      await S.say('수로 관리인 오토', byP({ 13: '맨홀은 바로 옆에 있다. 수로 깊은 곳엔 「늙은 이빨」이 산다. 조심해라.', 14: ['늙은 이빨을 잡았다고?! 30년 동안 수로를 지켜 왔지만 그런 놈을 잡을 줄은…', '…고맙다. 이제 밤에 다리 뻗고 자겠군.'] }));
      return;
    }
    if (!Game.flag('bran_knight')) {
      await S.say('수로 관리인 오토', byP({ 11: '뭘 봐. 여긴 구경할 데가 아니다. 맨홀? 아무나 들어갈 수 있는 곳이 아니야.', 12: '수로에 들어가고 싶으면 기사단이나 학원의 허가를 받아 와라.' }));
      return;
    }
    await S.say('수로 관리인 오토', ['…그 문장. 기사단이군. 수로에 들어가겠다고?', '시계탑의 기초까지 가겠다니, 학장의 심부름인가. 좋다, 열쇠를 주마.', '단, 하층 저수조에는 「늙은 이빨」이라는 거대한 악어가 산다. 수문을 함부로 열면 놈이 깨어날 거다.']);
    await S.give('sewer_key', 1);
    if (Quests.isActive('main3')) S.stage('main3', 7);
    await Story.line('nell', '…늙은 이빨. 아직 살아 있었구나. 어릴 때 다들 무서워했어. 진짜 있는 줄은 몰랐는데.');
    await S.say(null, '[y]목표 갱신: 지하수로를 지나 시계탑 아래로 향한다[/]');
  },

  // ── 보육원 ──
  async greta() {
    if (!Game.flag('greta_met')) {
      Game.setFlag('greta_met');
      await S.say('마더 그레타', ['어서 오세요, 「별바라기 보육원」에. 저는 원장 그레타예요.', '축제 구경 오셨어요? 우리 아이들도 별사탕 노래를 부르며 들떠 있답니다.']);
      if (!Game.inParty('nell') && Quests.isDone('s_thief') && Quests.get('s_thief').outcome === 'jail') {
        await S.say('마더 그레타', ['…그런데 혹시, 리벨이라는 마을에서 오셨나요?', '며칠 전에 오래전 이곳을 떠났던 아이가 돌아왔어요. 리벨에서 감옥을 빠져나왔다나… 저 안쪽에 있어요.']);
      }
      return;
    }
    await S.say('마더 그레타', byP({
      11: '이 보육원은 20년 전 회색병으로 부모를 잃은 아이들을 위해 세워졌어요. 지금은… 그 아이들의 아이들도 있지요.',
      15: ['카산드라 이야기, 들었어요… 그 아이가 성가대에 있었다니.', '떠나던 날, 그 아이는 「엄마를 데려올게」라고 했어요. 아직도… 그 약속을 지키려고 했던 거군요.'],
      16: '넬과 카산드라가 다시 함께 별을 볼 날이 오기를, 매일 밤 기도할게요.',
    }));
  },
  async nellHome() {
    Game.setFlag('nell_home');
    Game.setFlag('greta_met');
    await S.say('마더 그레타', '어머, 손님이──');
    await S.say('마더 그레타', ['……넬? 넬이니? 세상에, 우리 넬…!', '(원장은 넬을 끌어안았다.)']);
    await S.say('넬', ['…원장님, 숨 막혀. 놔 줘.', '…다녀왔어.']);
    await S.say('마더 그레타', ['8년 동안 소식 한 번 없더니… 키가 이만큼 컸구나.', '카스가 떠나고 나서 너까지 사라졌을 때… 얼마나 걱정했는지.']);
    await Story.line('mio', '카스…?');
    await S.say('넬', ['…언니야. 카산드라. 친언니.', '엄마가 회색병으로 죽고, 우린 여기서 컸어. 8년 전에 언니는 「엄마를 데려올게」라고 하고 떠났어. 잿빛 옷을 입은 사람들이랑.', '그래서 언니를 찾으려고 나왔는데… 배가 고파서, 훔치고, 또 훔치고… 그러다 리벨까지 간 거야.']);
    await Story.line('bran', '…넬. 그래서 그 회색 외투 아저씨를 수상하다고 했던 거구나.');
    await S.say('마더 그레타', ['이걸 가져가렴, 넬. 아이들이 만든 부적이야. 언젠가 너희 둘이 돌아오면 주려고 만들어 뒀단다.', '…그리고 동료분들, 우리 넬을 잘 부탁드려요.']);
    await S.give('orphan_charm', 1);
  },
  async nellRecruit() {
    await S.say('넬', ['…또 너희야? 진짜 끈질기네.', '감옥 빵은 맛없었어. 그래서 나왔어. 창살 사이로.', '…리벨 사람들한테 미안하다고는 전해 줘. 진짜로.']);
    await S.say('넬', ['여긴 내가 자란 곳이야. 우리 언니는 8년 전에 잿빛 옷을 입은 사람들이랑 떠났어. 「엄마를 데려온다」면서.', '너희, 그 회색 외투 아저씨를 쫓고 있지? 나도 데려가. 언니를 찾아야 해.', '…이번엔 안 훔칠게. 아마.']);
    if (!(await S.yesno(null, '넬을 동료로 맞이할까?'))) { await S.say('넬', '…흥. 마음 바뀌면 와. 여기 있을 테니까.'); return; }
    await Story.line('mio', '어서 와요, 넬! 이번엔 진짜 동료예요!');
    await S.join('nell');
    Game.setFlag('nell_home');
    await S.say('마더 그레타', '넬… 이번엔 꼭 돌아오렴. 언니도 함께.');
    await S.give('orphan_charm', 1);
    await S.say(null, '[d](넬이 일행에 있으면 숨겨진 보물이 반짝여 보인다.)[/]');
  },

  // ── 축제의 소녀 루나 (별사탕 찾기) ──
  async luna() {
    const q = Quests.get('s_candy');
    if (!q) {
      if (Game.progress() < 11) return;
      await S.say('루나', ['흑… 흐윽…', '아, 아무것도 아니에요. 할머니 드리려고 산 별사탕을 잃어버렸을 뿐이에요.', '할머니는 다리가 아파서 축제에 못 오시거든요. 그래서 별사탕 세 개를… 그런데 주머니에 구멍이…', '고양이가 물어 갔을지도 몰라요. 혹시 보시면… 찾아 주실 수 있어요?']);
      await S.startQuest('s_candy');
      await Story.line('nell', '…고양이라. 뒷골목 상자 틈 같은 데 잘 숨기지.');
      return;
    }
    if (q.status === 'active' && Game.count('star_candy') >= 3) {
      Game.removeItem('star_candy', Game.count('star_candy'));
      await S.say('루나', ['우와아…! 세 개 다 찾아 주셨어요?! 고맙습니다!', '할머니가 엄청 좋아하실 거예요! 이건 제 보물인데… 드릴게요! 축제 가면이에요. 쓰면 하나도 안 졸려요!']);
      await S.completeQuest('s_candy');
      return;
    }
    await S.say('루나', q.status === 'done' ? '할머니가 별사탕을 드시고 「하늘 맛이 나는구나」 하셨어요! 헤헤.' : `별사탕… 지금 ${Game.count('star_candy')}개 찾으셨어요? 세 개였어요! 왕도 안 어딘가에… 축제 손님 집이나, 아이들 있는 곳이나…`);
  },

  // ── 지하수로 ──
  async sewerValves() {
    const w = Game.flag('valve_w'), e = Game.flag('valve_e');
    Field.refreshTiles();
    Field.refreshNpcs();
    if (w && e) {
      Sound.sfx('impact'); Engine.shake(6, 1.0);
      await S.say(null, '[y]쿠르르르르…! 저수조의 물이 빠지며 가운데에 쇠창살 다리가 드러났다![/]');
      await S.wait(300);
      Sound.sfx('roar'); Engine.shake(8, 0.8);
      await S.say(null, '(…그리고 다리 위로 거대한 무언가가 기어 올라왔다!)');
      await Story.line('bran', '아, 악어?! 저게 악어야?! 집채만 하잖아!');
    } else await S.say(null, '…수위가 조금 내려갔다. 반대편 수문도 열어야 할 것 같다.');
  },
  async oldFang() {
    if (Game.flag('croc_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    S.sfx('roar'); Engine.shake(6, 0.5);
    await S.say(null, '(늙은 이빨이 쩍 벌린 입에서 썩은 물 냄새가 훅 끼쳐 온다. 수십 년 묵은 이빨 사이에 녹슨 갑옷 조각이 끼어 있다.)');
    await Story.line('linette', '물에 사는 것은 번개에 약해요! 잠수하면 다음 공격은 「방어」로 받아요!');
    const r = await S.battle(['old_fang'], { bg: 'sewer', bgm: 'boss', boss: true, canEscape: false, intro: '수로의 주인 「늙은 이빨」' });
    if (r !== 'win') return;
    Game.setFlag('croc_defeated');
    S.hideNpc('old_fang');
    Sound.bgm('cave');
    await S.say(null, '(늙은 이빨은 길게 몸부림치더니 깊은 물속으로 가라앉았다. 다리 끝, 위로 이어지는 사다리가 보인다.)');
    await Story.line('nell', '…진짜 있었네, 늙은 이빨. 언니한테 말해 주면 안 믿을 거야.');
    await S.say(null, '[y]목표 갱신: 사다리를 올라 시계탑으로 향한다[/]');
  },

  // ── 시간의 종: 제2성부 카산드라 ──
  async cassandra() {
    if (Game.flag('cassandra_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    await S.say(null, '(금빛 시계판이 박힌 거대한 종 앞에서, 한 여인이 노래하고 있다. 곁에는 태엽 거인이 묵묵히 서 있다.)');
    Sound.sfx('chime');
    await S.say('???', ['…♪ 별이 잠들면 시계도 잠들고, 엄마가 오면 아침이 오지 ♪', '…오셨네요, 열쇠님. 베인은 실패했나 봐요.']);
    await Story.line('mio', '이 노래… 종의 노래랑 똑같아요. 아니, 이 사람이 종이랑 같이 노래하고 있어요…!');
    await S.say('카산드라', ['저는 잿빛 성가대의 제2성부, 카산드라.', '시간의 종은 이미 제 목소리에 맞춰 울고 있어요. 이제 열쇠님이 종에 손만 대 주면, 두 번째 종이 울려요.']);
    if (Game.inParty('nell')) {
      await S.say('넬', '……카스 언니?');
      await S.say('카산드라', ['…넬?', '(카산드라의 노래가 뚝 끊겼다.)', '넬… 네가 왜 여기에… 왜 열쇠랑 같이…']);
      await S.say('넬', ['8년이야. 8년 전에 보육원 앞에서, 엄마를 데려온다고 했잖아. 금방 돌아온다고 했잖아!', '그래서 찾았어. 계속 찾았어. 훔치고, 도망치고, 배고프고… 그래도 찾았어!']);
      await S.say('카산드라', ['…그래서 데려올 거야. 지금 데려오는 중이야, 넬.', '장막이 열리면 엄마도 돌아와. 오스릭 님의 엘리도. 회색병으로 사라진 모두가.', '그러니까 비켜. 너는 다치게 하고 싶지 않아.']);
      await S.say('넬', '…싫어. 이번엔 내가 언니를 데려갈 거야.');
    } else {
      await S.say('카산드라', ['보육원에 동생을 두고 왔어요. 엄마를 데려오겠다고 약속했죠.', '장막이 열리면 엄마도 돌아와요. 회색병으로 사라진 모두가. 그러니까… 비켜 주세요.']);
      await Story.line('linette', '죽은 사람은 돌아오지 않아요! 그건… 교수님도 알고 계실 거예요!');
    }
    await S.say('카산드라', '…그럼 시간을 멈춰 드릴게요. 영원히.');
    const r = await S.battle(['clock_guardian', 'cassandra'], { bg: 'clock', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 성가대 제2성부 카산드라' });
    if (r !== 'win') return;
    Game.setFlag('cassandra_defeated');
    await Story.afterCassandra();
  },
  async afterCassandra() {
    Sound.bgm('sad');
    S.hideNpc('cassandra'); S.hideNpc('guardian_npc');
    const cd = Field.npc('cass_down');
    if (cd) cd.visible = true;
    await S.say(null, '(태엽 거인이 멈추고, 카산드라가 무릎을 꿇었다. 손에서 시곗바늘 지팡이가 굴러떨어졌다.)');
    if (Game.inParty('nell')) {
      await S.say('카산드라', ['…강해졌네, 넬. 언제 이렇게…', '빵은… 잘 챙겨 먹고 다녔어?']);
      await S.say('넬', '……바보 언니.');
    }
    Sound.sfx('bell');
    Engine.flash('#ffe9a0', 0.6);
    await S.say(null, '──데에엥.\n(멈춰 있던 시간의 종이 저절로 울렸다. 그리고 {H}의 손등의 낙인이 눈부시게 빛났다.)');
    // 환영: 원래 세계
    await Engine.fadeOut(600, '#ffffff');
    Sound.stop();
    await S.say(null, ['…삐─, 삐─, 삐─.', '규칙적인 기계음. 하얀 천장. 소독약 냄새.', '「…{H}! {H}, 들려? 손가락이 움직였어요! 선생님, 선생님!」', '누군가 내 손을 꼭 잡고 울고 있다. 그 목소리는… 아주 익숙한──']);
    Sound.sfx('chime');
    await Engine.fadeIn(600, '#ffffff');
    await Story.line('mio', '{H} 님! {H} 님, 정신 차리세요!');
    await S.say(null, '(정신을 차려 보니 미오가 어깨를 붙잡고 있다. 방금 본 것은… 원래 세계의 병실이었다.)');
    const c = await S.ask(null, '(지금 본 것은…)', ['…병원이었어. 내가 누워 있었어.', '…아무것도 아니야.'], 1);
    if (c === 0) await Story.line('linette', '…원래 세계의 당신이요? 그럼 당신의 몸은 아직 그쪽에…');
    else await Story.line('mio', '…거짓말. {H} 님, 울고 계세요.');
    // 오스릭 등장
    Sound.sfx('hit'); await S.wait(250); Sound.sfx('hit');
    const os = Field.npc('osric_tower');
    if (os) { os.visible = true; os.x = os.fromX = 9; os.y = os.fromY = 12; }
    await S.walkNpc('osric_tower', ['up', 'up', 'up', 'up', 'up'], 3);
    await S.say('오스릭', ['보았나, 열쇠여. 시간의 종은 자네에게 진실을 보여 주었지.', '자네의 몸은 저편에서 잠들어 있다. 장막 저편과 이편은 이어져 있어. 다섯 종이 모두 울리면 장막이 열리고… 자네는 돌아갈 수 있다.', '우리는 같은 것을 원하는 걸세. 돌아가고 싶은 곳이 있는 거지.']);
    await Story.line('linette', ['교수님. …엘리 이야기, 학장님께 들었어요.', '교수님은 엘리를 되살리려는 거죠. 그래서 장막을 여는 거예요.']);
    await S.say('오스릭', ['…오필리아는 여전히 말이 많군.', '그래, 리네트. 나는 엘리를 데리러 간다. 20년 전, 축제에 데려가겠다는 약속을 지키지 못했으니까.']);
    await Story.line('linette', '죽은 사람은 돌아오지 않아요! 교수님이 그렇게 가르치셨잖아요! 증명할 수 없는 것을 믿지 말라고!');
    await S.say('오스릭', ['그건 아직 아무도 장막을 열어 보지 않았기 때문이다, 리네트.', '질문은 등불이다. 나는 마지막 질문의 답을 보러 갈 뿐이야.']);
    Engine.flash('#c040ff', 0.4);
    await S.say(null, '(오스릭이 손을 뻗자 종에서 빛나는 구슬이 빠져나왔다. 그러나 구슬은 오스릭이 아니라 {H}의 손으로 날아들었다.)');
    Sound.jingle('item');
    await S.say(null, '[y]시간의 심장[/]이 {H}의 손안에서 째깍, 째깍 고동친다.');
    Game.addItem('time_heart', 1);
    await S.say('오스릭', ['…그런가. 종이 열쇠를 택했군.', '좋다, 지금은 맡겨 두지. 어차피 다섯 개의 심장은 모두 열쇠에게 모이게 되어 있으니.', '카산드라, 돌아가자.']);
    if (Game.inParty('nell')) {
      await S.say('넬', '언니! 가지 마! 이번엔… 이번엔 안 보낼 거야!');
      await S.say('카산드라', ['…미안, 넬.', '엄마를 데려오면, 그때 같이 별 보자. 보육원 지붕에서.']);
    }
    Engine.flash('#ffffff', 0.6); Sound.sfx('thunder');
    S.hideNpc('osric_tower'); S.hideNpc('cass_down');
    await S.say(null, '(눈부신 빛과 함께, 오스릭과 카산드라의 모습이 사라졌다.)');
    Sound.bgm('shrine');
    await S.say(null, '(멈춰 있던 먼지가 천천히 떨어지기 시작했다. 탑 곳곳에서 톱니바퀴가 맞물려 돌아가는 소리가 울려 퍼진다.)');
    await Story.line('mio', '…종의 노래가 바뀌었어요. 고맙다고… 다시 흐를 수 있어서 고맙다고 해요.');
    await Story.line('bran', '{H}… 괜찮아? 아까 그 병원 얘기…');
    await Story.line('nell', '……다음엔 꼭 데려올 거야. 언니.');
    await Story.line('linette', '…학장님께 돌아가요. 알려야 할 게 너무 많아요.');
    Game.setFlag('tower_unfrozen');
    S.stage('main3', 9);
    await S.say(null, '[y]목표 갱신: 마도학원의 오필리아 학장에게 보고한다[/]\n[d](종 옆의 마법진으로 학원 앞까지 돌아갈 수 있다.)[/]');
  },

  // ── 2장 엔딩 ──
  async chapter2Ending() {
    await S.say('오필리아 학장', ['돌아왔구나! 시계탑의 시계가 반년 만에 움직이기 시작했어. 왕도 전체가 난리란다.', '…무슨 일이 있었는지 들려주겠니.']);
    await S.say(null, '(일행은 탑에서 있었던 일을 이야기했다. 카산드라, 시간의 종이 보여 준 환영, 그리고 오스릭의 목적.)');
    await S.say('오필리아 학장', ['…엘리를 되살리려고. 알드윈, 이 바보.', '{H} 군. 시간의 종이 보여 준 것은 아마 사실일 거야. 자네의 몸은 저편에서 잠들어 있겠지.', '그리고 오스릭의 말도 반은 맞아. 다섯 종이 모두 울리면 장막이 열리고, 자네는 돌아갈 수 있을지도 몰라.', '하지만 장막이 열리면 이 세계도, 자네의 세계도 무사하지 못할 거야. 「그것」이 온다고… 리벨의 파수꾼이 그랬다지.']);
    await S.say('오필리아 학장', ['그래서 「시간의 심장」이 자네를 택한 거야. 열쇠는 열 수도, 닫을 수도 있으니까.', '…답은 서두르지 않아도 돼. 남은 종은 세 개. 사막의 모래 종, 북해의 파도 종, 그리고 하늘섬의 마지막 종.']);
    Sound.sfx('door');
    await S.say('라인하르트 단장', ['늦었군. 보고는 들었다. …견습 기사 브란, 첫 임무 수고했다.', '방금 국왕 폐하의 칙명이 내려왔다. 그대들에게 남은 종의 조사를 맡긴다고.']);
    await S.say('오필리아 학장', ['그러려면 이름이 필요하겠지. 학원과 기사단이 함께 보증하는, 그대들만의 이름이.', '…「별의 수호대」. 어떤가?']);
    await Story.line('bran', '별의… 수호대! 크으, 멋지다! 완전 기사 같아!');
    await Story.line('mio', '별의 수호대… 종을 지키는 사람들이네요. 좋아요!');
    await Story.line('nell', '…나쁘지 않네. 언니를 찾는 데도 도움이 되겠지.');
    await Story.line('linette', '교수님을… 아니, 오스릭을 막을 거예요. 그리고 마지막에 꼭 물어볼 거예요. 왜냐고.');
    await S.say('라인하르트 단장', '이것이 「별의 수호대」의 문장이다. 왕국 어디서든 그대들의 이름이 길을 열어 줄 것이다.');
    await S.completeQuest('main3');
    Game.setFlag('chapter2_done');
    await Story.chapterCard({ num: '제2장', title: '왕도로 가는 길', next: 'To be continued ─ 제3장 「사막의 종」' });
    await S.say('오필리아 학장', ['사막으로 가는 길은 아직 모래 폭풍으로 막혀 있어. 길이 열리면 알려 주마.', '그때까지 왕도에서 쉬어 가렴. 축제도 아직 끝나지 않았으니까.']);
    if (await S.yesno(null, '여기까지의 모험을 기록할까요?')) await Menu.saveScreen();
  },
});
