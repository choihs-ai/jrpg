'use strict';
// ─────────────────────────────────────────────────────────────
// 제3장 「사막의 종」 스토리 이벤트
//  세 번째 종은 모래 바다 한가운데 「모래시계 사원」에 잠든 모래 종.
//  미오는 성가대에 납치되고, 종 안에서 노래하던 목소리의 주인을 만난다.
//  그리고 오스릭이 심장을 빼앗지 않는 이유가 드러난다.
// ─────────────────────────────────────────────────────────────
Object.assign(Story, {
  // ── 3장 시작: 사미라의 사자 ──
  async beginChapter3() {
    if (Quests.get('main4')) return;
    await S.say('오필리아 학장', ['마침 잘 왔네. 손님이 와 있어.', '사막 너머, 오아시스 사미라에서 온 사자일세. 모래 폭풍을 뚫고 열흘을 걸어왔다는군.']);
    await S.say('사자 라시드', ['별의 수호대 분들이시군요. 사미라의 족장 하킴 님의 부탁을 전하러 왔습니다.', '사미라의 샘이 말라 가고 있습니다. 한 달 전에는 샘을 지키던 물의 사제님이 사라졌고요.', '그 뒤로 사막 남쪽의 낡은 사원 근처에서 잿빛 옷을 입은 자들을 봤다는 사람이 있습니다.']);
    await Story.line('linette', '잿빛 옷… 성가대예요. 모래 종이 다음 표적이에요.');
    await Story.line('mio', '…노래가 들려요. 아주 멀리서. 모래가 흘러내리는 소리 같은 노래예요.');
    await S.say('사자 라시드', ['이것을 받아 주십시오. 족장님의 통행패입니다. 사미라 사람들이 길을 열어 줄 겁니다.', '은빛 가도 남쪽, 붉은 협곡을 지나면 사막입니다. 다행히 폭풍이 잠시 잦아들었습니다.']);
    await S.give('canyon_pass', 1);
    await S.say('오필리아 학장', ['사막의 종은 「모래 종」이라 불리지. 옛 기록에는 종이 울부짖던 날 바다가 모래가 되었다고 적혀 있어.', '…그리고 십 년 전, 그 종을 달래러 사막으로 간 무녀가 있었다는 이야기도 있고.']);
    await Story.line('mio', '무녀가…?');
    await S.say('오필리아 학장', '자세한 건 나도 모른다네. 조심해서 다녀오렴.');
    Game.setFlag('ch3_started');
    await S.startQuest('main4');
  },

  // ── 오아시스 사미라 도착 ──
  async arriveSamira() {
    Game.setFlag('reached_samira');
    Game.state.respawn = { map: 'samira_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 라일라' };
    Sound.sfx('chime');
    await S.say(null, ['(야자나무 그늘 아래 흙벽 집들이 옹기종기 모여 있다. 마을 한가운데의 울타리 안에는… 거의 말라 버린 샘이 있다.)', '(물동이를 든 사람들이 샘 앞에 길게 줄을 서 있다.)']);
    await Story.line('bran', '물 한 바가지에 저렇게 줄을 서다니…');
    await Story.line('nell', '…목마른 건 배고픈 거보다 더 괴로워. 알아.');
    await Story.line('linette', '족장님은 북쪽의 큰 집에 계실 거예요. 통행패를 보여 드려요.');
    S.stage('main4', 1);
    await S.goalUpdate('main4', '\n[d](쓰러지면 이제 사미라의 여관에서 깨어난다.)[/]');
  },

  // ── 족장 하킴 ──
  async hakim() {
    const p = Game.progress();
    if (p === 18) {
      await S.say('족장 하킴', ['…그 통행패. 왕도의 손님들이구려. 사막 끝까지 와 줘서 고맙소.', '나는 사미라의 족장 하킴. 먼저 물 한 잔 드시오. 이 마을에서 내놓을 수 있는 가장 귀한 대접이라오.']);
      await S.say('족장 하킴', ['샘은 십 년째 조금씩 말라 가고 있소.', '십 년 전, 바깥에서 온 무녀 한 분이 모래 종을 달래겠다며 남쪽 사원에 들어갔소. 그날 뒤로 모래 폭풍은 잦아들었지만… 무녀님은 돌아오지 않았고, 샘은 그때부터 마르기 시작했지.']);
      await S.say('족장 하킴', ['그리고 한 달 전, 샘을 지키던 물의 사제 자히르가 사라졌소.', '자히르는 누구보다 이 마을을 아끼던 사람이오. 매일 밤 옛 지도를 들여다보며 「바다가 있었다」고 중얼거리곤 했지.']);
      await Story.line('mio', '저… 족장님. 그 무녀님 성함이…');
      await S.say('족장 하킴', ['아리아 님이오. …음?', '(하킴은 한참 동안 미오의 얼굴을 바라보았다.)', '…아니, 실례했소. 노인네 눈이 침침해서 그런가 보오.']);
      await Story.line('linette', '사원에는 들어갈 수 없나요?');
      await S.say('족장 하킴', ['사원의 정문 「해의 문」은 아리아 님이 들어간 뒤로 굳게 닫혀 버렸소.', '…오늘은 이만 쉬시오. 사막의 밤은 춥고 길다오. 여관의 라일라에게 말해 두겠소.']);
      Game.setFlag('met_hakim');
      S.stage('main4', 2);
      await S.goalUpdate('main4');
      return;
    }
    if (p === 20 && !Game.flag('cave_told')) {
      await S.say('족장 하킴', '어젯밤의 모래 폭풍… 마을 한가운데까지 들이닥친 건 처음이오. 다들 무사하오?');
      await Story.line('bran', ['미오가… 미오가 끌려갔어요!', '모래 속에서 누가 「무녀의 목소리를 빌려 가겠다」고 했어요!']);
      await S.say('족장 하킴', ['…무녀의 목소리. 그렇다면 자히르일 거요.', '그는 물의 사제요. 모래와 물의 노래를 다룰 줄 알지. 그가 왜 그런 짓을…']);
      await S.say('족장 하킴', ['자히르가 무녀를 데려갔다면 갈 곳은 하나뿐이오. 모래시계 사원.', '해의 문을 여는 열쇠는 우리 조상이 사막 동쪽의 옛 우물에 숨겨 두었다고 전해지오. 마을 사람들이 처음 물을 길었던 곳이지.', '하지만 우물이 마른 뒤로 전갈들이 둥지를 틀었소. 특히 가장 깊은 곳의 「여왕」은… 마을의 사냥꾼들도 돌아오지 못했소.']);
      await Story.line('nell', '…전갈이든 여왕이든 상관없어. 미오를 데려올 거야.');
      await S.say('족장 하킴', '동굴 입구는 모래에 반쯤 묻혀 있소. 사막의 동쪽, 바위 언덕 사이를 살펴보시오.');
      Game.setFlag('cave_told');
      S.stage('main4', 4);
      await S.goalUpdate('main4');
      return;
    }
    if (p === 23) { await Story.chapter3Ending(); return; }
    await S.say('족장 하킴', byP({
      19: '라일라에게 말해 두었소. 오늘은 여관에서 쉬시오.',
      20: ['전갈 굴은 사막의 동쪽에 있소. 독을 조심하시오.', '여왕은 모래 속에 몸을 숨겼다가 단숨에 덮친다고 하오. 숨어 있을 때는 섣불리 덤비지 말고, 숨을 고르는 게 좋을 거요.'],
      21: '태양의 열쇠를 찾았구려…! 사원은 사막의 남쪽이오. 아리아 님도 그 길로 갔소.',
      22: ['무녀를 되찾았구려! …그런데 사원 깊은 곳의 모래가 아직도 울고 있소.', '자히르를… 부탁하오. 그는 악인이 아니오. 길을 잃었을 뿐이지.'],
      24: ['샘이 넘쳐흐르는 소리를 들으며 잠드는 게 이렇게 행복한 일인 줄 몰랐소.', '북쪽 바다로 가는 길은 왕도의 학장이 알 거요. 언제든 사미라에 들르시오. 그대들의 물은 늘 준비해 두겠소.'],
    }));
  },

  // ── 여관의 밤: 미오 납치 ──
  async innNight() {
    await S.say('여관 주인 라일라', ['족장님께 이야기 들었어요. 오늘 숙박비는 마을에서 낸대요.', '안쪽 방을 쓰세요. 창문은 꼭 닫고 자요. 밤에는 모래가 들어오거든요.']);
    await Engine.fadeOut(600);
    Sound.stop();
    Game.healAll(true);
    await Sound.jingle('inn');
    await Engine.wait(400);
    await S.say(null, ['(…한밤중.)', '(바람 소리가 점점 거세진다. 닫아 둔 창문 틈으로 모래가 사르르 흘러들어 온다.)', '(바람 소리에 섞여… 낮은 노랫소리가 들린다.)']);
    await Story.line('mio', ['……이 노래.', '어디서 들어 본 노래예요. 아주 오래전에… 누가 불러 줬던…']);
    Sound.sfx('thunder'); Engine.shake(6, 0.6);
    await Engine.fadeIn(400);
    await S.say(null, '(콰아아앙! 창문이 부서지며 모래 폭풍이 방 안으로 쏟아져 들어왔다!)');
    await S.say('???', '무녀의 목소리를… 잠시 빌려 가겠소.');
    const r = await S.battle(['sand_spirit', 'choir_knight', 'sand_spirit'], { bg: 'desert', bgm: 'battle', canEscape: false, loseOk: true });
    Sound.sfx('mist'); Engine.shake(5, 0.8);
    if (r === 'win') await S.say(null, '(모래 정령들이 흩어졌다. 그러나 모래 폭풍은 멈추지 않는다!)');
    else await S.say(null, '(모래가 눈과 입을 막는다. 몸이 움직이지 않는다…!)');
    await Story.line('mio', '{H} 님──!');
    await S.say('???', ['미안하오, 별의 열쇠. 바다를 되찾으려면 이 목소리가 필요하오.', '종의 노래를 끝까지 부를 수 있는 건… 같은 목소리뿐이니까.']);
    await Engine.fadeOut(500, '#e8c070');
    const slot = Game.state.party.indexOf('mio');
    Game.leave('mio');
    // 비어 버린 자리는 대기 멤버가 채운다 (구출 뒤 미오가 같은 자리로 돌아올 수 있게 기억해 둔다)
    if (slot >= 0 && Game.state.reserve.length && Game.state.party.length < Game.MAX_PARTY) {
      const sub = Game.state.reserve.shift();
      Game.state.party.splice(slot, 0, sub);
      Game.setFlag('mio_sub', sub);
    }
    Field.resetFollowers();
    Game.healAll(true);
    Game.setFlag('mio_taken');
    Sound.bgm('sad');
    await Engine.fadeIn(800, '#e8c070');
    await S.say(null, '(…폭풍이 지나간 아침. 부서진 창문 아래 모래가 수북이 쌓여 있다. 미오의 침대는 비어 있다.)');
    await Story.line('bran', '미오!! …젠장, 젠장! 바로 옆에 있었는데!');
    await Story.line('nell', '모래 위에 발자국이 없어. 걸어서 나간 게 아니야. 모래랑 같이… 사라졌어.');
    await Story.line('linette', ['「무녀의 목소리」라고 했어요. 「같은 목소리」라고도.', '…족장님께 가요. 이 사막에서 일어나는 일이라면 그분이 알 거예요.']);
    S.stage('main4', 3);
    await S.goalUpdate('main4');
    Sound.bgm('oasis');
  },

  // ── 전갈 굴: 전갈 여왕 ──
  async scorpionQueen() {
    if (Game.flag('queen_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    S.sfx('roar');
    await S.say(null, ['(동굴 가장 깊은 곳, 말라 버린 돌우물 위에 거대한 전갈이 웅크리고 있다.)', '(머리 위로 왕관처럼 솟은 껍데기. 그 뒤편에서 무언가가 금빛으로 반짝인다.)']);
    await Story.line('linette', '저 뒤예요. 태양 문양…! 열쇠는 저 너머에 있어요.');
    await Story.line('bran', '미오 몫까지 싸운다! 덤벼라, 왕관 전갈!');
    const r = await S.battle(['scorpion_queen'], { bg: 'sandcave', bgm: 'boss', boss: true, canEscape: false, intro: '옛 우물의 주인 전갈 여왕' });
    if (r !== 'win') return;
    Game.setFlag('queen_defeated');
    S.hideNpc('queen');
    Sound.bgm('cave');
    await S.say(null, '(여왕이 쓰러지자, 말라 버린 돌우물 바닥에서 서늘하고 축축한 바람이 올라왔다.)');
    await Story.line('linette', '…물 냄새. 이 아래엔 아직 물이 흐르고 있어요. 샘이 마른 건 물이 사라져서가 아니에요.');
    await Story.line('nell', '상자다. 저기, 안쪽.');
  },
  async sunKeyFound() {
    await Story.line('linette', '태양의 열쇠예요! 이걸로 해의 문을 열 수 있어요.');
    await Story.line('bran', '기다려, 미오. 금방 간다!');
    S.stage('main4', 5);
    await S.goalUpdate('main4');
  },

  // ── 모래시계 사원: 해의 문 ──
  async sunGate() {
    if (!Game.count('sun_key')) {
      await S.say(null, '거대한 석문에 둥근 홈이 파여 있다. 홈 둘레에 햇살 무늬가 새겨져 있다. 문은 꿈쩍도 하지 않는다.');
      if (Game.flag('mio_taken')) await Story.line('linette', '이 홈… 무언가를 끼워 넣는 자리예요. 문을 여는 「무언가」가 따로 있는 거예요.');
      return;
    }
    await S.say(null, '태양의 열쇠를 둥근 홈에 끼워 넣었다…');
    Sound.sfx('door'); Engine.shake(4, 0.8);
    Game.setFlag('sun_gate_open');
    Field.refreshTiles();
    await S.say(null, '(그르르르릉──! 모래를 쏟아내며 해의 문이 천천히 열렸다.)');
    await Story.line('nell', '…안에서 노래가 들려. 나한테도 들려. 미오 목소리야.');
  },
  async enterTemple() {
    if (Quests.isActive('main4') && Quests.stage('main4') === 5) {
      S.stage('main4', 6);
      await S.goalUpdate('main4');
    }
  },

  // ── 침묵의 제단: 베인 재전 ──
  async vaneRematch() {
    if (Game.flag('mio_rescued')) return;
    S.facePlayer('up');
    Sound.stop();
    await S.say(null, '(제단 앞에 붉은 낫을 든 사내가 서 있다. 그 뒤, 모래빛 철창 안에… 미오가 있다.)');
    await Story.line('bran', '미오!!');
    await S.say('미오', ['모두…! {H} 님!', '오면 안 돼요, 이 사람──']);
    await S.say('베인', ['…또 만났군, 열쇠. 왕도에서는 신세를 졌지.', '무녀는 제3성부께 필요하다. 모래 종을 깨울 목소리니까.']);
    await S.say('베인', ['그리고 너. 오스릭 님은 너를 건드리지 말라 하셨다. 「심장을 모으게 두어라」고.', '…나는 기다리는 게 싫다. 열쇠에 필요한 건 그 손뿐이니까.']);
    await Story.line('linette', '…심장을 모으게 둔다고요? 어째서…');
    await Story.line('nell', '말 많네. 미오 돌려줘.');
    const r = await S.battle(['choir_knight', 'vane2', 'choir_acolyte'], { bg: 'temple', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 성가대 집행자 베인' });
    if (r !== 'win') return;
    Game.setFlag('mio_rescued');
    Sound.bgm('sandtemple');
    await S.say('베인', ['크윽… 두 번이나…', '오스릭 님… 어째서 이런 녀석들을 내버려 두시는 겁니까…!']);
    Engine.flash('#c040ff', 0.4); Sound.sfx('summon');
    S.hideNpc('vane_t2');
    await S.say(null, '(베인은 붉은 연기와 함께 사라졌다. 동시에 철창의 종 모양 자물쇠가 모래가 되어 부서졌다.)');
    Sound.sfx('door');
    Field.refreshTiles();
    S.hideNpc('mio_caged');
    // 다시 합류 (떨어져 있던 동안의 경험치를 채워 준다)
    Game.join('mio');
    // 대신 자리를 채웠던 동료와 다시 자리를 바꾼다
    const sub = Game.flag('mio_sub'), st = Game.state;
    if (sub && st.reserve.includes('mio') && st.party.includes(sub)) {
      st.party[st.party.indexOf(sub)] = 'mio';
      st.reserve[st.reserve.indexOf('mio')] = sub;
    }
    const m = Game.member('mio');
    const want = Math.max(m.level, Game.member('hero').level - 1);
    if (want > m.level) Game.addExp('mio', expForLevel(want) - m.exp);
    Game.healAll(true);
    Field.resetFollowers();
    Sound.jingle('join');
    await S.say(null, '[y]미오[/]가 다시 일행에 합류했다!');
    await Story.line('mio', ['…와 줄 줄 알았어요.', '헤헤. 사실은 조금 무서웠어요. 아주 조금요.']);
    await Story.line('nell', '…다신 혼자 끌려가지 마. 심장 떨어지는 줄 알았네.');
    await Story.line('mio', ['자히르 님은… 나쁜 사람이 아니에요. 저한테 노래를 시키면서 계속 울고 계셨어요.', '가끔은 모습이 아지랑이처럼 여럿으로 흐려졌어요. 어느 쪽이 진짜인지, 저는 끝까지 몰랐어요.', '그리고 종 안에서, 누군가 같이 노래하고 있었어요. 그 목소리가…', '……아래로 가요. 종이 기다리고 있어요.']);
    S.stage('main4', 7);
    await S.goalUpdate('main4');
  },

  // ── 모래 종의 방: 제3성부 자히르 ──
  async zahir() {
    if (Game.flag('zahir_defeated')) return;
    S.facePlayer('up');
    Sound.stop();
    await S.say(null, '(거대한 모래 종 아래, 한 사내가 모래시계가 달린 지팡이를 짚고 서 있다. 종에서는 고운 모래가 끝없이 흘러내린다.)');
    await S.say('자히르', ['…무녀를 되찾아 갔군. 베인은 늘 서두르지.', '나는 물의 사제 자히르. 아니, 이제는 잿빛 성가대의 제3성부요.']);
    await S.say('자히르', ['이 사막은 옛날에 바다였소. 이 종이 울부짖던 날, 바다는 모래가 되었지.', '나는 바다를 돌려받고 싶을 뿐이오. 장막 너머에는 잃어버린 모든 것이 있다고, 오스릭 님이 약속했소.']);
    await Story.line('mio', '…자히르 님. 종 안에서 노래하는 사람. 그분은… 누구예요?');
    await S.say('자히르', ['……십 년 전, 리벨에서 온 무녀. 아리아 님이오.', '아리아 님은 울부짖는 종을 잠재우려고 스스로 종의 노래가 되었소. 그 덕에 모래 폭풍은 멎었지만, 종과 함께 샘도 잠들어 버렸지.', '그분의 노래로는 종을 재울 수밖에 없소. 종을 깨우려면 같은 목소리가 필요하오. …그분의 딸의 목소리가.']);
    await S.say('미오', '……딸.');
    await Story.line('bran', '미오…?');
    await Story.line('linette', '종을 깨우면 장막이 한 겹 더 찢어져요! 사막만의 일이 아니에요!');
    await S.say('자히르', ['알고 있소. …그래도 나는 십 년 동안 보아 왔소. 모래만 남은 마을에서, 아이들이 물 한 바가지를 두고 줄을 서는 것을.', '비켜 주시오. 아니면… 모래 속에서 길을 잃게 될 거요.']);
    const r = await S.battle(['zahir'], { bg: 'sandbell', bgm: 'boss', boss: true, canEscape: false, intro: '잿빛 성가대 제3성부 자히르' });
    if (r !== 'win') return;
    Game.setFlag('zahir_defeated');
    await Story.afterZahir();
  },
  async afterZahir() {
    Sound.stop();
    S.hideNpc('zahir_boss');
    const zd = Field.npc('zahir_down');
    if (zd) zd.visible = true;
    await S.say(null, '(자히르가 무릎을 꿇었다. 지팡이 끝의 모래시계가 산산이 부서지며 모래가 흩날렸다.)');
    Sound.sfx('bell');
    Engine.flash('#ffe9a0', 0.6);
    await S.say(null, '──데에엥.\n(모래 종이 울렸다. 울부짖음이 아니라, 맑고 깊은 소리였다.)');
    const ar = Field.npc('aria_spirit');
    if (ar) ar.visible = true;
    Sound.bgm('shrine');
    await S.say(null, '(종 아래에 빛으로 된 여인의 모습이 떠올랐다. 미오와 꼭 닮은 얼굴이다.)');
    await S.say('???', '…미오.');
    await Story.line('mio', '……엄마?');
    await S.say('아리아', ['많이 컸구나. 리벨에 너를 두고 와서 미안해.', '자장가도 끝까지 불러 주지 못하고.']);
    await Story.line('mio', ['…기억 안 나요. 엄마 얼굴도, 목소리도.', '그런데… 노래는 기억나요. 종의 노래가 들릴 때마다, 어딘가 익숙했어요. 그게… 엄마 노래였어요.']);
    await S.say('아리아', '그럼 같이 부르자. 이번엔 끝까지.');
    Sound.sfx('chime');
    await S.say(null, ['(두 사람의 노랫소리가 겹쳐졌다.)', '(종에서 흘러내리던 모래가 멈추었다. 그리고 종 안쪽에서… 똑, 똑. 물방울 소리가 들리기 시작했다.)']);
    const m = Game.member('mio');
    if (m && !m.skills.includes('mother_song')) m.skills.push('mother_song');
    Sound.jingle('item');
    await S.say(null, '[y]미오는 「어머니의 자장가」를 배웠다![/]');
    await S.say('아리아', ['별의 열쇠님. 내 딸을 지켜 줘서 고마워요.', '종의 심장은 당신에게 맡길게요. 다른 누구도 아닌, 당신에게.']);
    Engine.flash('#ffd890', 0.4);
    Sound.jingle('item');
    await S.say(null, '[y]모래의 심장[/]이 {H}의 손에 내려앉았다. 구슬 안에서 고운 모래가 끝없이 흘러내린다.');
    Game.addItem('sand_heart', 1);
    await S.say('아리아', ['자히르 님. 바다는 돌아오지 않아요. 하지만 샘은 돌아올 거예요.', '…이제 제가 노래하지 않아도 되니까요.']);
    await S.say('자히르', '아리아 님… 저는…');
    await S.say('아리아', '미오, 노래해. 네 목소리로. 엄마는 늘 그 노래 안에 있을게.');
    Sound.sfx('heal');
    S.hideNpc('aria_spirit');
    await S.say(null, '(빛이 모래알처럼 흩어지며 사라졌다.)');
    await Story.line('mio', '……네.');
    // 오스릭 등장
    Sound.sfx('hit'); await S.wait(250); Sound.sfx('hit');
    const os = Field.npc('osric_sand');
    if (os) { os.visible = true; os.x = os.fromX = 9; os.y = os.fromY = 12; }
    await S.walkNpc('osric_sand', ['up', 'up'], 3);
    await S.say('오스릭', '훌륭하군. 세 번째 심장도 열쇠의 손에 들어갔어.');
    await Story.line('linette', ['…교수님. 왜 심장을 빼앗지 않는 거예요? 시계탑에서도, 지금도.', '베인이 그랬어요. 「심장을 모으게 두어라」. …교수님은 일부러 기다리고 있는 거죠?']);
    await S.say('오스릭', ['역시 내 제자로군, 리네트.', '빼앗을 필요가 없다. 다섯 개의 심장은 열쇠에게 모인다. 그리고 다섯 개를 모두 쥔 열쇠는… 마지막 종 앞에서 스스로 문을 열게 될 거다.']);
    await S.say('오스릭', '{H}. 시간이 많지 않다는 건 자네도 알고 있겠지.');
    // 환영: 원래 세계
    await Engine.fadeOut(600, '#ffffff');
    Sound.stop();
    await S.say(null, ['…삐─, 삐─, 삐─.', '「…선생님, 그게 무슨 말씀이세요. 이번 주를 넘기기 어렵다니…」', '「{H}, 엄마 여기 있어. 들리지? 손 꼭 잡고 있을게. 그러니까…」', '목소리가 모래처럼 흩어진다──']);
    Sound.sfx('chime');
    await Engine.fadeIn(600, '#ffffff');
    await S.say('오스릭', ['저편의 시계는 이편보다 빠르게 흐른다.', '다음은 북해, 파도의 종이다. 자네가 오기를 기다리지.']);
    await S.say('자히르', '오스릭 님… 저는…');
    await S.say('오스릭', '자히르. 자네의 바다는 여기 없었던 모양이군. …쉬게.');
    Engine.flash('#ffffff', 0.6); Sound.sfx('thunder');
    S.hideNpc('osric_sand');
    await S.say(null, '(눈부신 빛과 함께, 오스릭의 모습이 사라졌다.)');
    await S.say('자히르', ['……무녀님. 아니, 미오 님.', '용서를 빌 자격은 없소. 하지만… 샘을 지켜보겠소. 남은 날 동안, 매일.']);
    if (zd) zd.visible = false;
    await S.say(null, '(자히르는 비틀거리며 계단 쪽으로 걸어 나갔다.)');
    Game.setFlag('spring_restored');
    Sound.bgm('shrine');
    await Story.line('bran', '{H}… 아까 그 얼굴. 또 뭔가 본 거지? 「이번 주」가 어쩌고…');
    const c = await S.ask(null, '(방금 들린 목소리는…)', ['…서둘러야 할 것 같아.', '…아무것도 아니야.'], 1);
    if (c === 0) await Story.line('linette', '…알겠어요. 남은 종은 두 개. 서두를게요. 대신 혼자 짊어지지 마요.');
    else await Story.line('nell', '…거짓말 못하는 거 알지? 얼굴에 다 써 있어.');
    await Story.line('mio', ['{H} 님에게도 기다리는 엄마가 있는 거죠.', '…그럼 꼭 돌아가야 해요. 그 전까지는 제가 지켜 드릴게요.']);
    S.stage('main4', 8);
    await S.goalUpdate('main4', '\n[d](종 옆의 마법진으로 사미라까지 돌아갈 수 있다.)[/]');
  },
  async zahirAfter() {
    await S.say('자히르', byP({
      23: ['…샘이 돌아왔다고 들었소. 아리아 님의 노래 덕이오.', '나는 이 사당에서 물을 지키며 지내겠소. 그게 내가 할 수 있는 유일한 속죄요.'],
      24: ['오스릭은 「바다」 이야기를 할 때면 늘 먼 곳을 보았소. 그에게도 잃어버린 바다가 있는 거겠지.', '…북해의 종은 등대 아래 잠들어 있다고 들었소. 파도가 노래를 삼키는 곳이라고.'],
    }));
  },

  // ── 서브: 무녀의 일기 ──
  async ariaPage() {
    const n = Game.count('aria_page');
    if (!Quests.get('s_diary')) await S.startQuest('s_diary');
    const pages = [
      ['(단정한 글씨가 적혀 있다.)', '「…사미라의 샘이 마르고 있다. 모래 종이 울부짖고 있다. 누군가 노래로 달래 줘야 해.」', '「나는 무녀니까, 가야겠지. 리벨에 두고 온 우리 아기에게는 미안하지만.」'],
      ['(일기의 다음 장이다.)', '「종은 노래하는 사람의 목소리를 기억한다. 내가 종 안에서 계속 노래하면, 모래는 잠들어 있을 거야.」', '「대신 나는 돌아갈 수 없겠지. …자장가를 끝까지 불러 주지 못한 게 마음에 걸린다.」'],
      ['(마지막 장이다. 글씨가 조금 떨리고 있다.)', '「미오에게. 엄마는 노래가 되어 너를 기다릴게.」', '「언젠가 네가 이 노래를 듣게 된다면, 그때는 같이 불러 주렴. ♪ 모래가 잠들면 바다가 꿈을 꾸고… ♪」'],
    ];
    await S.say(null, pages[Math.min(n, 3) - 1]);
    if (n === 1) {
      if (Game.inParty('mio')) await Story.line('mio', '…리벨에 두고 온 아기…? 리벨이면, 제가 자란 곳인데…');
      else await Story.line('linette', '리벨에 두고 온 아기… 설마.');
    } else if (n === 2) {
      await Story.line('linette', '이 일기를 쓴 사람… 사미라에 머물렀던 것 같아요. 일기를 맡겨 둘 만한 사람이 있었을까요.');
    } else if (n >= 3) {
      if (Game.inParty('mio')) await Story.line('mio', '……미오에게.');
      else await Story.line('bran', '「미오에게」…? 이거… 미오한테 보여 줘야 해.');
      if (Quests.isActive('s_diary')) { S.stage('s_diary', 1); await S.goalUpdate('s_diary'); }
    }
  },
  async nadia() {
    if (Quests.isActive('s_diary') && Quests.stage('s_diary') === 1) {
      if (!Game.inParty('mio')) {
        await S.say('나디아', ['그 일기… 아리아 님의 글씨예요. 십 년 동안 찾아도 없더니.', '아리아 님은 밤마다 「미오」라는 이름을 부르며 노래했어요. 그 아이를… 데려와 줄 수 있나요?']);
        return;
      }
      await S.say('나디아', ['…어머나.', '(나디아는 미오의 얼굴을 보자마자 입을 막았다.)', '그 눈매, 그 머리칼… 아리아 님을 꼭 닮았구나. 네가 미오로구나.']);
      await Story.line('mio', '엄마를… 아세요?');
      await S.say('나디아', ['아리아 님은 이 집에서 반년을 지냈단다. 매일 아침 우물가에서 아이들과 노래하셨지.', '사원으로 떠나던 날, 이걸 맡기셨어. 「언젠가 미오가 오면 전해 주세요」라고.']);
      await S.completeQuest('s_diary');
      await Story.line('mio', ['……방울. 엄마 방울.', '(미오가 방울을 흔들자, 맑은 소리가 방 안을 채웠다.)', '…고마워요, 나디아 할머니. 엄마 이야기, 더 들려주세요.']);
      return;
    }
    if (Quests.isDone('s_diary')) {
      await S.say('나디아', byP({ 0: '미오, 언제든 와서 쉬렴. 여긴 네 엄마의 집이기도 하니까.', 24: ['샘물 소리가 들리니? 아리아 님이 그토록 듣고 싶어 하던 소리야.', '미오, 언제든 와서 쉬렴. 여긴 네 엄마의 집이기도 하니까.'] }));
      return;
    }
    await S.say('나디아', byP({
      17: ['이 집에는 십 년 전 바깥에서 온 무녀님이 머물렀단다.', '노래를 참 좋아하는 분이었지. 떠나실 때 일기장을 들고 가셨는데… 사막 어딘가에 흩어져 버렸을까.'],
      20: '…무녀가 또 사라졌다고? 아아, 모래는 왜 늘 노래하는 사람을 데려가는지.',
      24: '샘이 돌아왔구나. 아리아 님… 이제 편히 쉬세요.',
    }));
  },

  // ── 서브: 길 잃은 대상 ──
  async ali() {
    if (!Quests.get('s_caravan') && Game.progress() >= 18) {
      await S.say('상인 알리', ['어서 오세요, 「모래 별 상회」입니다! …라고 말하고 싶지만, 지금은 그럴 기분이 아니에요.', '우리 대상 행렬이 닷새째 돌아오지 않아요. 오늘 아침 매가 이 편지를 물고 왔는데…']);
      await S.give('lost_letter', 1);
      await S.say(null, '「사막 동남쪽, 바위 야영지. 모래 도적들에게 둘러싸였다. 물은 사흘 치. ─ 카심」');
      await S.say('상인 알리', '부탁이에요! 카심 형님을 구해 주세요. 사례는 꼭 할게요!');
      await S.startQuest('s_caravan');
    } else if (Quests.isActive('s_caravan') && Quests.stage('s_caravan') === 1) {
      await S.say('상인 알리', ['형님이 돌아왔어요! 낙타도, 짐도 무사하고요!', '이건 약속한 사례예요. 그리고 앞으로 우리 상회에서 좋은 물건을 들여놓을게요!']);
      Game.removeItem('lost_letter', 1);
      await S.completeQuest('s_caravan');
    } else if (Quests.isActive('s_caravan')) {
      await S.say('상인 알리', '야영지는 사막 동남쪽이에요. 큰 바위 언덕 아래요. 서둘러 주세요…!');
    }
    await Shop.open('bazaar_items');
  },
  async lostCaravan() {
    if (!Quests.isActive('s_caravan') || Quests.stage('s_caravan') !== 0) return;
    if (!Game.flag('raiders_beaten')) {
      await S.say('모래 도적', ['뭐야, 너희는? 이 대상의 짐은 우리가 먼저 찜했다고!', '얘들아, 손님이다!']);
      const r = await S.battle(['sand_raider', 'sand_raider', 'sand_raider'], { bg: 'desert', canEscape: false });
      if (r !== 'win') return;
      Game.setFlag('raiders_beaten');
      S.hideNpc('raider1');
      await S.say(null, '(도적들은 모래 언덕 너머로 꽁지 빠지게 달아났다.)');
    }
    await S.say('대상 우두머리 카심', ['살았다…! 알리가 보냈소? 그 녀석, 매를 날리는 솜씨 하나는 일품이지.', '물은 바닥났지만 낙타도 짐도 무사하오. 우린 사미라로 돌아가겠소. 이 은혜는 잊지 않겠소!']);
    S.stage('s_caravan', 1);
    await S.goalUpdate('s_caravan');
  },

  // ── 3장 엔딩 ──
  async chapter3Ending() {
    await S.say('족장 하킴', ['돌아왔구려…! 샘이, 샘이 돌아왔소! 십 년 만이오!', '오늘 아침 마을 사람들이 울면서 물을 퍼 날랐다오. 아이들은 물장구를 치고.']);
    await S.say(null, '(일행은 사원에서 있었던 일을 이야기했다. 자히르, 종 안에서 노래하던 아리아, 그리고 오스릭의 말.)');
    await S.say('족장 하킴', ['…자히르는 사당에서 기도만 하고 있다더군. 그를 어찌할지는 마을 사람들과 의논하겠소.', '그는 이 마을을 누구보다 사랑했소. 사랑하는 방법을 잘못 골랐을 뿐이지.']);
    await S.say('족장 하킴', ['그리고 미오 양. …아리아 님의 딸이었구려.', '처음 봤을 때 알아봤어야 했는데. 노인네 눈이 침침해서 말이오.']);
    await Story.line('mio', '엄마는… 이 마을을 좋아했나요?');
    await S.say('족장 하킴', ['그럼. 매일 아침 우물가에서 아이들과 노래하셨지.', '이제 그 우물에서 다시 물이 솟을 거요. 아리아 님의 노래가 돌아온 거지.']);
    await Story.line('linette', ['다섯 개의 심장은 열쇠에게 모인다… 교수님은 처음부터 기다리고 있었던 거예요.', '…그래도 멈출 수는 없어요. 심장을 그냥 두면, 성가대가 종을 억지로 깨울 테니까.']);
    await Story.line('nell', '…언니 소식은 이번에도 없네. 다음엔 있겠지.');
    await Story.line('bran', '{H}. 「이번 주」든 뭐든, 끝까지 같이 간다. 기사의 약속이야.');
    await S.say('족장 하킴', '사미라는 그대들을 잊지 않을 거요. 이건 사막의 은인에게만 주는 징표요.');
    await S.completeQuest('main4');
    Game.setFlag('chapter3_done');
    await Story.chapterCard({ num: '제3장', title: '사막의 종', next: 'To be continued ─ 제4장 「파도의 종」', bgm: 'oasis' });
    await S.say('족장 하킴', ['북쪽 바다로 가는 배편은 왕도의 학장이 수소문해 줄 거요.', '그 전까지는 쉬어 가시오. 사미라의 물은 이제 넉넉하다오.']);
    if (await S.yesno(null, '여기까지의 모험을 기록할까요?')) await Menu.saveScreen();
  },
});
