'use strict';
// ─────────────────────────────────────────────────────────────
// Story: 주요 스토리 이벤트(컷신) 모음
// ─────────────────────────────────────────────────────────────
const Story = {
  // 동료가 일행에 있을 때만 대사
  async line(id, text) { if (Game.inParty(id)) await S.say(Game.name(id), text); },

  // ── 프롤로그 ──
  async prologue() {
    Game.setFlag('prologue', 1);
    Field.enter('inn', 8, 3, 'right');
    Field.refreshNpcs();
    Sound.stop();
    await Engine.fadeOut(0);
    await Engine.wait(400);
    await S.say(null, ['그날 밤, 나는 아르바이트를 마치고 막차 버스에 올랐다.', '창밖으로 유난히 커다란 별똥별이 떨어지는 게 보였다.\n소원을 빌 틈도 없이, 눈꺼풀이 무거워졌다…']);
    Sound.sfx('bell');
    await Engine.wait(900);
    await S.say(null, '──데에엥.\n어디선가, 아주 먼 곳에서 종소리가 들렸다.');
    await Engine.wait(400);
    Sound.bgm('town');
    await Engine.fadeIn(1200);
    await S.say('???', ['아, 깨어나셨군요! 다행이다…', '어젯밤 마을 밖 들판에 쓰러져 계셨어요. 제가 발견해서 여기 여관으로 모셨답니다.']);
    await S.say('미오', '저는 미오예요. 리벨 신전의 무녀예요. 저… 이름이 어떻게 되세요?');
    const name = await UI.prompt('당신의 이름은?', '하루', 6);
    Game.state.heroName = name;
    const c = await S.ask('미오', '{H} 님… 들어 본 적 없는 울림의 이름이네요. 어디서 오셨어요?', ['서울에서 왔는데요…', '…여기가 어디죠?'], 1);
    if (c === 0) await S.say('미오', '서, 서울…? 그런 왕국은 처음 들어요. 아주 먼 곳인가 봐요.');
    else await S.say('미오', '여기는 리벨 마을이에요. 아스텔 왕국 북쪽 끝의 작은 마을이죠.');
    await S.say('미오', '그리고 그 손등의 문양… 별 모양이네요.');
    Sound.sfx('chime');
    Engine.flash('#9fd3ff', 0.4);
    await S.say(null, '(손등을 보니, 본 적 없는 별 모양의 낙인이 희미하게 빛나고 있다.)');
    await S.say('미오', ['실은 어젯밤, 북쪽 유적의 종이 300년 만에 울렸어요.', '그리고 같은 밤에 {H} 님이 나타나셨고요.', '하르도 장로님께서 꼭 만나고 싶어 하세요. 마을 북쪽의 큰 집이에요.', '저는 신전에 돌아가 봐야 해요. 무슨 일 있으면 신전으로 오세요!']);
    await S.walkNpc('mio_inn', ['down', 'left', 'left', 'left', 'down', 'down', 'down', 'down'], 4);
    S.hideNpc('mio_inn');
    Sound.sfx('door');
    Game.setFlag('prologue', 2);
    await S.startQuest('main1');
    await S.say(null, '[d]조작: 방향키/WASD 이동 · Z/Enter 조사·대화 · X/Esc 메뉴 · Shift 걷기/달리기 전환 · M 지도\n마우스·터치로 원하는 곳을 눌러 이동할 수도 있다.[/]');
  },

  // ── 장로와의 만남 ──
  async meetElder() {
    await S.say('하르도 장로', '오오, 자네가 들판에서 발견된 그 젊은이로군. 이리 가까이 오게.');
    await S.walk(['up', 'right', 'right', 'right', 'up', 'up']);
    S.facePlayer('up');
    await S.say('하르도 장로', ['나는 이 마을의 장로 하르도라네. 어디, 그 손을 좀 보여 주겠나?', '(장로는 손등의 낙인을 한참 들여다보았다.)', '…역시. 신전의 옛 기록에 나오는 「별의 손님」의 표식과 똑같군.', '300년 전에도 북쪽의 종이 울린 밤, 하늘에서 손님이 내려왔다고 하지. 그 뒤의 이야기는… 기록이 찢겨 나가 알 수 없지만.']);
    const c = await S.ask('하르도 장로', '궁금한 게 있나?', ['집에 돌아갈 방법은 없나요?', '별의 손님이 뭔가요?'], 0);
    if (c === 0) await S.say('하르도 장로', '미안하네. 나도 모르네. 하지만 종이 자네를 불렀다면… 종에 답이 있을지도 모르지.');
    else await S.say('하르도 장로', '나도 전설로만 들었네. 종이 울릴 때 별에서 오는 손님… 그 손님이 세상을 구했다고도, 망쳤다고도 하지.');
    await S.say('하르도 장로', ['그런데 곤란한 일이 생겼네. 종이 울린 뒤로 마을 주변에 마물이 부쩍 늘었어.', '경비대장은 왕도에 가 있고, 남은 경비병만으로는…']);
    const bran = Field.npc('bran_burst');
    Sound.sfx('door');
    if (bran) { bran.visible = true; bran.x = bran.fromX = 5; bran.y = bran.fromY = 7; }
    await S.walkNpc('bran_burst', ['up', 'right', 'right', 'up'], 5);
    await S.say('???', '장로님! 그 일, 제가 맡겠습니다!');
    await S.say('하르도 장로', '브란! 노크 좀 하라고 몇 번을 말하나.');
    await S.say('브란', '죄송합니다! 하지만 들판의 마물 정도는 이 브란이 한 방에──');
    S.shake(6, 0.35); S.sfx('impact');
    await S.say(null, '(브란은 의자 다리에 걸려 화려하게 넘어졌다.)');
    await S.say('브란', '…하하. 바닥이 미끄럽네요.');
    await S.say('하르도 장로', ['에휴…', '{H} 군, 미안하지만 이 녀석과 함께 가 주겠나? 혼자 보내면 걱정이 돼서 말이야. 자네도 이 세계를 알아 가려면 길잡이가 필요할 테고.']);
    await S.say('브란', ['아, 당신이 그 들판의 이방인? 잘 부탁해!', '나는 브란. 대장장이 드른의 아들이자, 미래의 왕국 수호기사지!']);
    await S.join('bran');
    Game.setFlag('met_elder');
    await S.completeQuest('main1');
    await S.say('하르도 장로', ['우선 동쪽 숲에 사는 사냥꾼 고르도를 찾아가게. 그 친구라면 마물이 어디서 오는지 알 걸세.']);
    await S.startQuest('main2');
    await S.say('하르도 장로', ['무기와 방어구는 드른의 대장간에서, 약초는 엘라 할머니의 도구점에서 살 수 있네.', '여관에서 쉬면 기운이 돌아오고, 신전에서는 모험을 기록할 수 있지. 준비를 단단히 하게나.']);
    await S.say('브란', '헤헤, 아버지 대장간엔 내가 안내할게! …아버지한테 잔소리 듣는 건 덤이고.');
  },

  // ── 사냥꾼 고르도 ──
  async gordo() {
    if (!Game.flag('visited_hunter')) {
      await S.say('사냥꾼 고르도', '누구냐! …뭐야, 사람이군. 요즘 마물 때문에 신경이 곤두서서 말이야.');
      await Story.line('bran', '고르도 아저씨! 장로님 심부름 왔어요.');
      await S.say('사냥꾼 고르도', ['브란 꼬맹이 아니냐. 마물 얘기라면… 놈들은 북쪽에서 내려오고 있다.', '북쪽 고개 너머에 옛 유적이 있지. 종이 울린 그 밤부터 그쪽이 시끄러워.', '그리고 이상한 걸 봤어. 종이 울리기 전날 밤, 회색 외투를 입은 남자가 고개 쪽으로 올라가더군. 그런 밤중에 말이야.']);
      await S.say('사냥꾼 고르도', ['고개는 「철엄니」라는 거대한 멧돼지 두목이 지키고 있다.', '놈은 앞발로 땅을 긁은 다음, 다음 턴에 무시무시하게 돌진해. 그때는 「방어」하는 게 상책이야. 얼음에도 약하지.', '…내 눈엔 아직 풋내기들이야. 충분히 단련한 뒤에 가라.']);
      Game.setFlag('visited_hunter');
      S.stage('main2', 1);
      await S.say(null, '[y]목표 갱신: 북쪽 고개를 넘어 유적으로 향한다[/]');
      await S.say('사냥꾼 고르도', ['…그리고 하나 더. 혹시 숲에서 내 사냥개 바우를 보면 알려 주게. 사흘째 돌아오지 않아.', '녀석은 서쪽 숲의 「늙은 나무 사이로 바람이 지나가는 길」을 좋아했지.']);
      await S.startQuest('s_dog');
    }
    if (Quests.isActive('s_letter') && Quests.stage('s_letter') === 0 && Game.count('letter')) {
      Game.removeItem('letter');
      await S.say('사냥꾼 고르도', ['편지? 나한테? …이 글씨는.', '(고르도는 한참 동안 말없이 편지를 읽었다.)', '…10년이나 지났군. 그 녀석, 아직도 내가 어머니 펜던트 일로 화났다고 생각하나 보지.', '바보 같은 여동생. 화난 건 나 자신한테였는데.', '…잠깐 기다려라.']);
      await S.say(null, '(고르도는 서툰 글씨로 무언가를 한참 끄적였다.)');
      S.stage('s_letter', 1);
      await S.give('reply', 1);
      await S.say('사냥꾼 고르도', '이걸 마르타한테. …읽지 마라. 진짜로.');
      return;
    }
    if (Quests.isActive('s_dog') && Quests.stage('s_dog') === 1) {
      await S.say('사냥꾼 고르도', ['바우! 이 녀석… 돌아왔구나!', '(바우가 꼬리를 흔들며 고르도에게 뛰어올랐다.)', '고맙다, 정말로. 이건 내가 젊을 때 신던 장화다. 이걸 신으면 바람처럼 달릴 수 있지.']);
      await S.completeQuest('s_dog');
      return;
    }
    await S.say('사냥꾼 고르도', byP({
      1: '고개의 철엄니는 땅을 긁으면 다음 턴에 돌진한다. 「방어」를 잊지 마라.',
      3: '철엄니를 쫓아냈다고? …흥, 풋내기는 취소다.',
      6: '유적 안은 빛이 들지 않아. 해골들은 빛을 싫어한다는 얘기가 있지.',
      8: '왕도에 가는 길도 험할 거다. 바우랑 나는 여기서 숲을 지키마.',
      11: '왕도에 다녀왔다고? 사람 많은 데는 질색이다. 바우도 그렇고.',
    }));
  },

  // ── 북쪽 고개: 리네트와 철엄니 ──
  async passEvent() {
    S.facePlayer('up');
    S.shake(4, 0.3); S.sfx('fire');
    await S.say('???', '불꽃이여──! …칫, 마력이 바닥났어!');
    await S.say(null, '(고개 위에서 거대한 멧돼지와 마법사 소녀가 대치하고 있다!)');
    S.sfx('roar'); S.shake(6, 0.5);
    await S.say('철엄니', '꾸에에에엑──!!');
    await S.say('???', '거기 당신들! 멍하니 구경만 할 거야? 좀 도와줘요!');
    await Story.line('bran', '당연하지! 가자, {H}!');
    await S.join('linette');
    Game.setFlag('linette_joined');
    await S.say('리네트', ['(마력 회복약을 꿀꺽 삼킨다) …좋아, 조금은 회복했어.', '녀석은 얼음에 약해! 앞발로 땅을 긁으면 크게 돌진하니까, 노려진 사람은 「방어」해요!']);
    await Story.fightIronfang();
  },
  async fightIronfang() {
    const r = await S.battle(['ironfang'], { bg: 'forest', bgm: 'boss', boss: true, canEscape: false });
    if (r !== 'win') return;
    S.hideNpc('ironfang');
    Game.setFlag('ironfang_defeated');
    await S.say(null, '(철엄니는 비틀거리더니 숲속 깊이 달아났다!)');
    await S.say('리네트', ['후우… 고마워요. 덕분에 살았어.', '나는 리네트. 왕립 마도학원의 연구원이에요. 북쪽 유적의 종을 조사하러 왔어요.', '…실은 사람도 찾고 있어요. 제 스승님, 알드윈 교수님. 반년 전에 종을 조사하러 떠났다가 연락이 끊겼죠.', '교수님은 늘 이렇게 말씀하셨어요. 「질문은 등불이다. 어둠이 깊을수록 더 많이 물어라.」']);
    await Story.line('bran', '멋진 말이네! 그럼 같이 가자. 우리도 유적에 가는 길이거든.');
    await S.say('리네트', ['그 손등의 문양… 흥미롭네요. 좋아요, 동행하죠.', '연구 대상으로서.']);
    await Story.line('bran', '…연구 대상?');
    S.stage('main2', 2);
    await S.say(null, '[y]목표 갱신: 북쪽 고대 유적의 입구를 조사한다[/]\n[d](고개가 열려 마을 대장간과 도구점에 새 물건이 들어온 것 같다.)[/]');
  },

  // ── 유적의 봉인 ──
  async sealDoor() {
    if (Game.flag('seal_opened')) return;
    if (!Game.flag('mio_joined')) {
      if (!Game.flag('saw_seal')) {
        await S.say(null, ['(거대한 돌문이 길을 막고 있다. 가운데에 별 모양의 문양이 새겨져 있다.)']);
        Sound.sfx('chime'); Engine.flash('#9fd3ff', 0.4);
        await S.say(null, '(손등의 낙인이 문양에 반응하듯 희미하게 빛난다…!)');
        await Story.line('linette', ['이건… 「별의 봉인」이에요! 학원 문헌에서 봤어요. 종을 지키는 신관만이 열 수 있다는.', '리벨 신전이라면 봉인을 여는 도구가 전해지고 있을지도 몰라요. 분명 「별빛 방울」이라던가.']);
        await Story.line('bran', '신전이라면 미오네! 마을로 돌아가자.');
        Game.setFlag('saw_seal');
        S.stage('main2', 3);
        await S.say(null, '[y]목표 갱신: 리벨 신전의 대신관 세나에게 별빛 방울에 대해 묻는다[/]\n[d](「귀환의 날개」를 쓰면 마을까지 한 번에 돌아갈 수 있다.)[/]');
      } else await S.say(null, '별의 봉인이 굳게 닫혀 있다. 신전의 「별빛 방울」이 필요하다.');
      return;
    }
    await S.say('미오', '제가 해 볼게요.');
    await S.say(null, '(미오가 별빛 방울을 높이 들어 흔들었다.)');
    Sound.sfx('chime');
    await S.wait(700);
    await S.say(null, '…딸랑, 딸랑──');
    Engine.flash('#ffffff', 0.6); S.shake(5, 0.8); S.sfx('impact');
    Game.setFlag('seal_opened');
    Field.refreshTiles();
    await S.say(null, '(별의 문양이 빛나며 돌문이 천천히 땅속으로 가라앉았다!)');
    await S.say('미오', '…들려요. 종의 노래가. 아주… 슬픈 노래예요.');
    await Story.line('linette', '유적 안쪽에서 마력이 흘러나오고 있어. 다들 조심해.');
    S.stage('main2', 5);
  },

  // ── 신전: 별빛 방울과 미오 합류 ──
  async shrineChime() {
    await S.say('대신관 세나', ['어서 오세요. …유적의 봉인을 보셨다고요?', '별빛 방울은 이 신전의 보물이에요. 그리고 그 방울은 오직 「종의 무녀」만이 울릴 수 있지요.']);
    await S.say('미오', '할머니! 제가 갈게요!');
    await S.say('대신관 세나', '미오, 하지만 너는…');
    await S.say('미오', ['{H} 님을 처음 발견한 것도 저예요. 종이 울린 밤부터 계속 노래가 들려요.', '누군가 도와 달라고 부르는 노래가요. 가만히 있을 수 없어요. 무녀니까요!']);
    await S.say('대신관 세나', ['…고집은 엄마를 쏙 빼닮았구나.', '알았다. 이걸 가져가렴.']);
    Game.addItem('chime', 1);
    Sound.jingle('item');
    await S.say(null, '미오는 [y]별빛 방울[/]을 받았다!');
    await S.say('대신관 세나', '{H} 님, 이 아이를 부탁해요.');
    await S.join('mio');
    Game.setFlag('mio_joined');
    S.stage('main2', 4);
    await S.say('미오', ['잘 부탁드려요, 여러분! 다치면 바로 말씀하세요. 치유는 제 특기예요!']);
    await Story.line('linette', '치유사가 있으면 든든하지. …잘 부탁해, 미오.');
    await S.say(null, '[y]목표 갱신: 별빛 방울로 유적의 봉인을 푼다[/]');
  },

  // ── 풍차의 넬 (선택 분기) ──
  async nell() {
    await S.say('???', '…쳇, 들켰네.');
    await S.say(null, '(구석에 숨어 있던 건 후드를 쓴 소녀였다. 주위에 반지, 파이프 같은 물건들이 굴러다닌다.)');
    await Story.line('bran', '네가 도둑이었구나! 경비병한테 넘기겠어!');
    await S.say('넬', ['흥, 마음대로 해. …어차피 하나도 못 팔았어.', '아, 하나는 팔았다. 신전에서 가져온 낡은 지도. 회색 외투 아저씨가 금화를 잔뜩 주더라. 북쪽 유적 지도가 꼭 필요하다나.']);
    await Story.line('linette', '회색 외투… 사냥꾼이 봤다는 그 남자?');
    await S.say('넬', '…배가 고팠어. 그게 다야. 사과 같은 건 안 해.');
    let c = -1;
    while (c < 0) c = await S.ask('넬', '(넬을 어떻게 할까?)', ['경비병에게 넘긴다', '물건을 돌려주면 용서한다'], -1);
    if (c === 0) {
      await S.say('넬', '…그래. 그게 맞겠지.');
      await Engine.fadeOut(500);
      S.hideNpc('nell_hide');
      await Engine.fadeIn(500);
      await S.say(null, '(넬은 경비병 토마스에게 넘겨졌다. 훔친 물건들은 경비대가 주인에게 돌려주기로 했다.)');
      await S.say('경비병 토마스', '수고했네! 마을의 골칫거리를 해결해 줬구먼. 이건 경비대의 사례일세.');
      Game.addGold(300);
      Sound.sfx('coin');
      await S.say(null, '[y]300G[/]를 받았다!');
      await S.give('guard_badge', 1);
      Game.setFlag('thief_resolved');
      await S.completeQuest('s_thief', 'jail');
    } else {
      await S.say('넬', ['…진짜? 바보 아냐?', '…알았어. 돌려줄게.']);
      Game.addItem('ring'); Game.addItem('pipe');
      Sound.jingle('item');
      await S.say(null, '넬에게서 [y]로사의 반지[/]와 [y]제랄드의 파이프[/]를 돌려받았다!');
      await S.say('넬', ['…저기. 나도 데려가 줘.', '회색 외투 아저씨, 뭔가 수상했어. 그 지도를 볼 때 눈빛이 이상했거든.', '그리고… 이 마을, 나쁘지 않아. 갚을 건 갚을게.']);
      await Story.line('mio', '어서 와요, 넬! 이제 동료예요!');
      await S.join('nell');
      Game.setFlag('thief_resolved');
      await S.completeQuest('s_thief', 'join');
      await S.say(null, '[d](넬이 일행에 있으면 숨겨진 보물이 반짝여 보인다. 반지와 파이프는 주인에게 직접 돌려주자.)[/]');
    }
  },

  // ── 우물 아래 버섯왕 ──
  async mush() {
    if (Game.flag('mush_done')) {
      await S.say('버섯왕 머쉬', Util.pick(['짐은 오늘도 빵 부스러기에 만족하도다!', '지상의 영웅들이여, 언제든 놀러 오너라. 짐은 심심하도다.', '짐의 왕국은 넓도다! …이 동굴이 전부지만.']));
      return;
    }
    await S.say('???', '멈춰라! 짐은 지하 버섯 왕국의 국왕, 머쉬 1세로다!');
    await Story.line('bran', '…버섯이 말을 해.');
    await S.say('버섯왕 머쉬', ['짐은 배가 고프도다! 위에서 떨어지는 빵 부스러기만으로는 부족하단 말이다!', '그 주머니에 든 것을 바쳐라! 싫다면… 결투다!']);
    const opts = ['약초를 바친다', '결투다!'];
    const c = await S.ask('버섯왕 머쉬', '어찌하겠느냐!', opts, 1);
    if (c === 0 && Game.count('herb') > 0) {
      Game.removeItem('herb');
      await S.say('버섯왕 머쉬', ['음냐음냐… 쓰다! 하지만 그 정성이 갸륵하도다.', '상으로 왕국의 국보를 내리겠노라!']);
    } else {
      if (c === 0) await S.say('버섯왕 머쉬', '약초가 없잖느냐! 짐을 놀리는 게냐! 결투다!');
      const r = await S.battle(['king_mush', 'toxic_shroom', 'toxic_shroom'], { bg: 'cave', bgm: 'boss', boss: true, canEscape: false });
      if (r !== 'win') return;
      await S.say('버섯왕 머쉬', ['크윽… 짐이 졌도다. 그대들의 용맹을 인정하노라!', '이것은 왕국의 국보인 평온의 부적이다. 받거라!']);
    }
    await S.give('calm_charm', 1);
    await S.say('버섯왕 머쉬', ['그리고… 위의 꼬마에게 전해 다오.', '매일 떨어뜨려 주는 빵 부스러기… 고맙다고. 짐은 그 맛으로 버텼노라.']);
    Game.setFlag('mush_done');
    if (Quests.isActive('s_well')) { S.stage('s_well', 2); await S.say(null, '[g]티아에게 알려 주자.[/]'); }
  },

  // ── 숲의 바우 ──
  async bau() {
    await S.say(null, ['멍! 멍멍!', '(사냥개가 다리를 다쳐 움직이지 못하고 있다. 목걸이에 「바우」라고 적혀 있다.)']);
    if (Game.count('herb') > 0) {
      Game.removeItem('herb');
      await S.say(null, '(약초를 발라 주자 바우가 꼬리를 힘차게 흔든다!)');
    } else await S.say(null, '(천을 찢어 다리를 감싸 주자 바우가 꼬리를 흔든다!)');
    await S.say(null, '(바우는 고맙다는 듯 손을 핥더니, 오두막 쪽으로 힘차게 달려갔다!)');
    S.hideNpc('bau');
    Game.setFlag('bau_found');
    S.stage('s_dog', 1);
  },

  // ── 별조각 수집가 피포 ──
  async pippo() {
    if (!Quests.get('s_star')) {
      await S.say('수집가 피포', ['오오! 그대들, 혹시 「별조각」을 본 적 있나? 밤하늘에서 떨어진 작은 별의 파편이지!', '나는 세상의 별조각을 모두 모으는 게 꿈이라네! 모두 여덟 개가 이 근방에 떨어졌다는 계산이 나왔지.', '찾아오면 내 소장품과 바꿔 주겠네. 2개, 4개, 6개, 그리고 8개! 놀라운 보물이 기다리고 있다고!']);
      await S.startQuest('s_star');
    }
    // 우산 개그
    if (Game.count('umbrella') > 0 && !Game.flag('umbrella_traded')) {
      await S.say('수집가 피포', ['자, 잠깐! 그 가방 속의 물건은…! 접었다 폈다 하는 휴대용 지붕?!', '이세계의 유물이로군!! 내 「은방울 머리꽂이」와 바꾸지 않겠나?!']);
      if (await S.yesno('수집가 피포', '바꾸겠나?!')) {
        Game.removeItem('umbrella');
        Game.setFlag('umbrella_traded');
        await S.say('수집가 피포', '오오오… 이 투명한 막! 이 버튼! 누르면 펼쳐지다니! 가보로 삼겠네!');
        await S.give('hairpin', 1);
      }
    }
    const have = Game.count('star');
    if (have > 0) {
      Game.removeItem('star', have);
      const before = Game.state.starsGiven;
      Game.state.starsGiven += have;
      Sound.sfx('chime');
      await S.say('수집가 피포', `오오! 별조각을 ${have}개나! 이제 내 수집품은 모두 ${Game.state.starsGiven}개라네!`);
      const tiers = [[2, 'starwater'], [4, 'power_ring'], [6, 'sage_robe'], [8, 'star_blade']];
      for (const [n, item] of tiers) {
        if (before < n && Game.state.starsGiven >= n) {
          await S.say('수집가 피포', `${n}개를 모은 기념이라네! 받게나!`);
          await S.give(item, 1);
        }
      }
      if (Game.state.starsGiven >= 8) {
        await S.say('수집가 피포', ['여덟 개 전부… 드디어 완성이야! 이 별조각들을 모으니 밤하늘의 별자리가 하나 생기는군!', '…「종」 모양이로구먼. 묘한 우연이야.']);
        await S.completeQuest('s_star');
      }
      return;
    }
    const n = Game.state.starsGiven;
    await S.say('수집가 피포', n >= 8 ? '그대들 덕분에 내 꿈이 이루어졌네! 이제 다른 세계의 별조각도 모아 볼까…' : `지금까지 모은 별조각은 ${n}개. 마을의 술통 속, 꽃밭, 숲속 깊은 곳, 유적… 별은 어디에나 떨어진다네!`);
  },

  // ── 종의 방: 벨가르 ──
  async velgar() {
    S.facePlayer('up');
    Sound.stop();
    await S.say(null, '(거대한 종 앞에 돌로 된 거인이 서 있다. 가슴에 박힌 검은 수정이 불길하게 맥동한다.)');
    S.shake(3, 0.6);
    await S.say('???', '…침입자. …종을… 지킨다… 지켜야… 한다…');
    await Story.line('mio', '이 목소리… 울고 있어요. 종의 노래랑 똑같이…!');
    await Story.line('linette', '가슴의 검은 수정이 정신을 지배하고 있어. 저걸 부숴야 해!');
    await Story.line('bran', '유, 유령은 아니지? 돌덩이면 괜찮아! 덤벼라!');
    await Story.line('nell', '…저 수정, 값은 꽤 나가겠는데. 농담이야.');
    const r = await S.battle(['velgar'], { bg: 'bell', bgm: 'boss', boss: true, canEscape: false, intro: '타락한 종지기 벨가르' });
    if (r !== 'win') return;
    Game.setFlag('velgar_defeated');
    await Story.afterVelgar();
  },
  async afterVelgar() {
    Sound.bgm('sad');
    await S.say(null, '(벨가르의 가슴에서 검은 수정이 산산조각 났다.)');
    await S.say('벨가르', ['…아아. 머릿속이… 맑아졌다. 고맙다, 별의 아이여.', '나는 벨가르. 이 종을 지키도록 만들어진 파수꾼…', '검은 수정을 박은 자가 있었다. 회색 옷의… 남자…']);
    Sound.sfx('hit'); await S.wait(250); Sound.sfx('hit'); await S.wait(250); Sound.sfx('hit');
    const os = Field.npc('osric_bell');
    if (os) { os.visible = true; os.x = os.fromX = 9; os.y = os.fromY = 13; }
    await S.walkNpc('osric_bell', ['up', 'up', 'up'], 3);
    await S.say('???', ['훌륭해요. 정말 훌륭합니다.', '덕분에 귀찮은 파수꾼이 얌전해졌군요.']);
    await Story.line('bran', '당신은… 여관에 있던 학자 아저씨?!');
    await S.say('오스릭', ['다시 소개하지요. 잿빛 성가대의 오스릭.', '오늘은 이것만 받아 가겠습니다.']);
    Engine.flash('#c040ff', 0.5); Sound.sfx('summon');
    await S.say(null, '(오스릭이 손을 뻗자, 거대한 종에서 빛나는 구슬이 빠져나와 그의 손으로 날아갔다!)');
    await S.say('벨가르', '종의… 심장을…!');
    await S.say('오스릭', ['그리고 {H} 군. 자네가 이 세계에 온 건 우연이 아닙니다.', '300년 만에 종을 울린 건 우리였으니까요. 자네를 부르기 위해서.', '자네의 손등에 새겨진 건 「별의 열쇠」. 다섯 개의 종을 모두 울리고 나면… 그 열쇠로 장막을 열게 될 겁니다.']);
    if (Game.inParty('linette')) {
      await S.say('리네트', ['…그 목소리. 그 말투. 질문은 등불이라던 그 말…', '설마…', '알드윈 교수님…?']);
      await S.say(null, '(오스릭이 천천히 후드를 벗었다. 희끗한 머리, 그리고 리네트가 아는 얼굴.)');
      await S.say('오스릭', ['오랜만이구나, 리네트.', '질문은 등불이다… 아직 기억하고 있었구나. 하지만 어떤 등불은 세상을 태우지.']);
      await S.say('리네트', '왜… 왜 이런 짓을…!');
      await S.say('오스릭', '답이 궁금하면 쫓아오너라. 다음 종에서 기다리마.');
    } else {
      await S.say('오스릭', '궁금하다면 쫓아오십시오. 다음 종에서 기다리지요.');
    }
    Engine.flash('#ffffff', 0.6); Sound.sfx('thunder');
    S.hideNpc('osric_bell');
    await S.say(null, '(눈부신 빛과 함께 오스릭의 모습이 사라졌다.)');
    await S.say('벨가르', ['별의 아이여… 듣거라.', '이 세계에는 다섯 개의 종이 있다… 모두 울리면 장막이 찢어지고… 「그것」이 온다…', '막아다오… 그리고 이것을… 종의 조각을… 가져가라…']);
    await S.give('bell_shard', 1);
    Engine.shake(3, 1.0);
    S.hideNpc('velgar');
    await S.say(null, '(벨가르는 조용히 무너져 돌무더기가 되었다.)');
    await Story.line('mio', '…편히 쉬세요. 종의 노래가… 조금 따뜻해졌어요.');
    await Story.line('bran', '젠장, 그 아저씨… 처음부터 수상하다 했어! …아니, 사실 전혀 몰랐지만.');
    await Story.line('nell', '그러니까 내가 수상하다고 했잖아.');
    await Story.line('linette', '……. 가요. 장로님께 알려야 해요.');
    S.stage('main2', 6);
    Sound.bgm('dungeon');
    await S.say(null, '[y]목표 갱신: 리벨 마을로 돌아가 장로에게 보고한다[/]\n[d](「귀환의 날개」로 곧장 돌아갈 수도 있다.)[/]');
  },

  // ── 엔딩: 장로에게 보고 ──
  async ending() {
    await S.say('하르도 장로', ['돌아왔군! 모두 무사해서 다행일세.', '…무슨 일이 있었는지 들려주겠나?']);
    await S.say(null, '(일행은 유적에서 있었던 일을 이야기했다. 타락한 파수꾼, 검은 수정, 그리고 잿빛 성가대의 오스릭…)');
    await S.say('하르도 장로', '다섯 개의 종… 그리고 잿빛 성가대라. 이건 이제 리벨 마을만의 일이 아니로군.');
    await Story.line('linette', '교수님이… 아니, 오스릭이 종의 심장을 가져갔어요. 다음 종을 노릴 거예요. 왕도의 학원에 알려야 해요.');
    await Story.line('mio', '종의 노래가 아직 들려요. 아주 멀리서… 다른 종들이 울고 있어요.');
    await Story.line('bran', '그럼 정해졌네! 왕도로 가자! 수호기사단에 직접 알리는 거야!');
    await Story.line('nell', '…뭐, 나도 갈 데가 없으니까. 따라가 줄게.');
    await S.say('하르도 장로', ['{H} 군. 자네를 이 세계로 부른 게 그들이라 해도…', '이 마을을 구한 건 자네의 선택이었네. 그걸 잊지 말게.', '이건 마을을 지켜 준 답례일세. 자네들의 여정에 별의 가호가 있기를.']);
    await S.completeQuest('main2');
    Game.setFlag('chapter1_done');
    await Story.chapterCard();
    await S.say('하르도 장로', ['왕도로 떠나기 전에 마을 사람들에게 인사라도 하고 가게. 다들 자네들 이야기를 듣고 싶어 할 걸세.', '왕도는 평원 동쪽 끝, 은빛 가도를 따라가면 된다네.']);
    await Story.beginChapter2(true);
    if (await S.yesno(null, '여기까지의 모험을 기록할까요?')) await Menu.saveScreen();
  },
  async chapterCard(opts = {}) {
    const o = Object.assign({ num: '제1장', title: '잠든 종의 유적', next: 'To be continued ─ 제2장 「왕도로 가는 길」' }, opts);
    Sound.bgm('title');
    await Engine.fadeOut(800);
    const card = {
      modal: true, t: 0, done: false,
      update(dt) { this.t += dt; },
      onAction(a) { if (this.t > 1.2 && (a === 'confirm' || a === 'cancel')) this.done = true; },
      onPointer(ev) { if (ev.type === 'down' && this.t > 1.2) this.done = true; return true; },
      draw(ctx) {
        ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, Engine.W, Engine.H);
        for (let i = 0; i < 60; i++) { const x = (i * 97) % Engine.W, y = (i * 53) % 300; ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(Engine.time + i))})`; ctx.fillRect(x, y, 2, 2); }
        const a = Math.min(1, this.t / 1.2);
        ctx.globalAlpha = a;
        Text.draw(ctx, o.num, Engine.W / 2, 120, { size: 22, align: 'center', color: Theme.dim });
        Text.draw(ctx, o.title, Engine.W / 2, 152, { size: 38, bold: true, align: 'center', color: Theme.gold });
        Text.draw(ctx, '── 완 ──', Engine.W / 2, 208, { size: 20, align: 'center' });
        const s = Game.state;
        Text.draw(ctx, `플레이 시간 ${Util.fmtTime(s.playTime)}   ·   ${s.heroName} Lv ${s.members.hero.level}   ·   별조각 ${s.starsGiven + Game.count('star')}/8`, Engine.W / 2, 268, { size: 16, align: 'center', color: Theme.dim });
        Text.draw(ctx, o.next, Engine.W / 2, 330, { size: 18, align: 'center', color: '#bcd8ff' });
        Text.draw(ctx, '이후에도 자유롭게 탐험하며 남은 의뢰를 해결할 수 있습니다.', Engine.W / 2, 372, { size: 15, align: 'center', color: Theme.dim });
        if (this.t > 1.2 && Math.floor(Engine.time * 2) % 2 === 0) Text.draw(ctx, '▼', Engine.W / 2, 420, { size: 18, align: 'center', color: Theme.gold });
        ctx.globalAlpha = 1;
      },
    };
    Engine.push(card);
    await Engine.fadeIn(800);
    await new Promise((res) => { const iv = setInterval(() => { if (card.done) { clearInterval(iv); res(); } }, 50); });
    await Engine.fadeOut(500);
    Engine.remove(card);
    Sound.bgm('town');
    await Engine.fadeIn(500);
  },
};
