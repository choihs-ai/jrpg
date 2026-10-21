'use strict';
// ─────────────────────────────────────────────────────────────
// 퀘스트: 정의 + 진행 관리
//  stage별 목표(goal)와 지도 표시 위치(target)를 가진다.
//  상태: Game.state.quests[id] = { status: 'active'|'done', stage, data }
// ─────────────────────────────────────────────────────────────
const QUESTS = {
  main1: {
    name: '낯선 하늘 아래', type: 'main', giver: '무녀 미오',
    desc: '눈을 떠 보니 모르는 마을의 여관이었다. 나를 발견한 무녀 미오는 장로님이 만나고 싶어 한다고 했다.',
    stages: [{ goal: '마을 북쪽 장로의 집에서 하르도 장로를 만난다', hint: '나를 만나고 싶어 한다는 마을의 어른을 찾아가 보자', target: { map: 'rivel', x: 18, y: 5 } }],
    reward: { gold: 50, items: [['herb', 3], ['return_wing', 1]] },
  },
  main2: {
    name: '북쪽의 이변', type: 'main', giver: '하르도 장로',
    desc: '300년 동안 잠들어 있던 북쪽 유적의 종이 울린 뒤로 마물이 부쩍 늘었다. 장로는 원인을 조사해 달라고 부탁했다.',
    stages: [
      { goal: '동쪽 숲에 사는 사냥꾼 고르도를 찾아간다', hint: '마물이 어디서 오는지 알고 있다는 사냥꾼을 수소문해 보자', target: { map: 'field', x: 50, y: 30 } },
      { goal: '북쪽 고개를 넘어 유적으로 향한다 (고개의 주인 「철엄니」를 조심)', hint: '마물들은 북쪽에서 내려온다고 했다. 길목을 지키는 무언가가 있다는데…', target: { map: 'field', x: 31, y: 14 } },
      { goal: '북쪽 고대 유적의 입구를 조사한다', hint: '고개 너머, 오래된 유적을 살펴보자', target: { map: 'field', x: 31, y: 5 } },
      { goal: '리벨 신전의 대신관 세나에게 별빛 방울에 대해 묻는다', hint: '굳게 닫힌 문을 열 방법을 아는 사람을 찾아보자. 종에 관한 일은 신전이 잘 알 것이다', target: { map: 'rivel', x: 29, y: 4 } },
      { goal: '별빛 방울로 유적의 봉인을 푼다', hint: '방울을 들고 닫힌 문 앞으로 돌아가 보자', target: { map: 'field', x: 31, y: 5 } },
      { goal: '유적 깊은 곳, 종의 방을 조사한다', hint: '노래가 들리는 곳으로, 더 깊이', target: { map: 'ruins2', x: 15, y: 2 } },
      { goal: '리벨 마을로 돌아가 장로에게 보고한다', hint: '본 것을 장로에게 알려야 한다', target: { map: 'rivel', x: 18, y: 5 } },
    ],
    reward: { gold: 500, items: [['courage_token', 1]] },
  },
  s_herb: {
    name: '달빛 풀 채집', type: 'sub', giver: '약초상 엘라 할머니',
    desc: '엘라 할머니는 상처약을 만들 「달빛 풀」이 필요하다. 평원 곳곳의 은은하게 빛나는 풀을 찾아 3개 모아 오자.',
    stages: [
      { goal: '평원에서 달빛 풀을 3개 모은다', hint: '달빛을 머금은 풀이 평원 곳곳에 있다고 한다', count: () => Math.min(3, Game.count('moonherb')), max: 3 },
      { goal: '도구점의 엘라 할머니에게 달빛 풀을 가져간다', hint: '모은 풀을 약초 할머니께 가져가 보자', target: { map: 'rivel', x: 32, y: 10 } },
    ],
    reward: { gold: 100, items: [['potion', 3]], text: '도구점에서 「상처약」 판매 시작' },
  },
  s_boar: {
    name: '멧돼지 소동', type: 'sub', giver: '농부 오웬',
    desc: '가시멧돼지들이 밭을 망쳐 놓는다. 평원의 가시멧돼지를 5마리 퇴치해 달라는 부탁.',
    stages: [
      { goal: '가시멧돼지를 퇴치한다', hint: '밭을 망치는 멧돼지들을 몰아내자', count: () => Math.min(5, (Quests.data('s_boar').kills || 0)), max: 5 },
      { goal: '농부 오웬에게 보고한다', hint: '농부에게 소식을 전하자', target: { map: 'rivel', x: 6, y: 26 } },
    ],
    reward: { gold: 80, items: [['leather_shield', 1]] },
  },
  s_thief: {
    name: '사라진 물건들', type: 'sub', giver: '빵집의 로사',
    desc: '요즘 마을에서 물건이 자꾸 사라진다. 로사의 결혼반지도 없어졌다. 범인을 찾아보자.',
    stages: [
      { goal: '물건을 잃어버린 사람들에게 이야기를 듣는다 (제랄드 할아버지, 신전의 세나)', hint: '물건을 잃어버린 사람들의 이야기를 들어 보자', count: () => (Quests.data('s_thief').heard || 0), max: 2 },
      { goal: '마을 남서쪽 풍차 주변을 조사한다', hint: '범인의 흔적이 어디로 이어지는지 살펴보자', target: { map: 'rivel', x: 12, y: 22 } },
      { goal: '풍차 안으로 들어가 본다', hint: '낡은 건물 안에서 인기척이 난다', target: { map: 'rivel', x: 12, y: 22 } },
    ],
    reward: { text: '선택에 따라 결과가 달라진다' },
  },
  s_well: {
    name: '우물 속 목소리', type: 'sub', giver: '꼬마 티아',
    desc: '티아는 광장 우물에서 "짐은 배가 고프도다…" 하는 목소리를 들었다고 한다. 정말일까?',
    stages: [
      { goal: '광장의 우물을 조사한다', hint: '우물에서 이상한 목소리가 들린다는 이야기를 확인해 보자', target: { map: 'rivel', x: 19, y: 14 } },
      { goal: '우물 아래 목소리의 주인을 찾는다', hint: '우물 밑에 무언가 살고 있는 듯하다', target: { map: 'cellar', x: 18, y: 8 } },
      { goal: '티아에게 알려준다', hint: '꼬마에게 소식을 전하자', target: { map: 'rivel', x: 30, y: 19 } },
    ],
    reward: { items: [['star', 1]] },
  },
  s_dog: {
    name: '사냥개 바우', type: 'sub', giver: '사냥꾼 고르도',
    desc: '고르도의 사냥개 바우가 사흘째 돌아오지 않는다. "서쪽 숲, 늙은 나무 사이로 바람이 지나가는 길"을 좋아했다는데…',
    stages: [
      { goal: '평원 서쪽 숲 어딘가에서 바우를 찾는다', hint: '사냥개가 좋아하던 바람 부는 길을 떠올려 보자', target: { map: 'field', x: 7, y: 27 } },
      { goal: '사냥꾼 고르도에게 알린다', hint: '개를 주인에게 데려다주자', target: { map: 'field', x: 50, y: 30 } },
    ],
    reward: { items: [['swift_boots', 1]] },
  },
  s_letter: {
    name: '전하지 못한 편지', type: 'sub', giver: '여관 주인 마르타',
    desc: '마르타는 10년 전 크게 다툰 오빠 고르도에게 편지를 전해 달라고 했다. 직접 가기는 아직 용기가 나지 않는다고.',
    stages: [
      { goal: '사냥꾼 고르도에게 편지를 전한다', hint: '편지를 받을 사람은 숲에 산다고 했다', target: { map: 'field', x: 50, y: 30 } },
      { goal: '여관의 마르타에게 답장을 전한다', hint: '답장을 가져다주자', target: { map: 'rivel', x: 6, y: 10 } },
    ],
    reward: { items: [['guard_pendant', 1]], text: '여관 숙박 무료' },
  },
  main3: {
    name: '왕도로 가는 길', type: 'main', giver: '하르도 장로',
    desc: '잿빛 성가대는 두 번째 종을 노리고 있다. 은빛 가도를 따라 왕도 아스테리온으로 가서, 마도학원과 수호기사단에 이 일을 알리자.',
    stages: [
      { goal: '은빛 가도를 따라 동쪽으로 향한다 (리벨 평원 동쪽 끝 → 은빛 가도)', hint: '평원 너머, 은빛으로 빛나는 길이 왕도로 이어진다고 한다', target: { map: 'highway', x: 24, y: 16 } },
      { goal: '은빛 가도를 따라 왕도 아스테리온에 들어간다', hint: '길 끝, 별내림 축제가 한창인 도시로', target: { map: 'highway', x: 52, y: 16 } },
      { goal: '왕립 마도학원의 학장을 만난다', hint: '리네트의 옛 스승의 동료를 찾아 학원으로', target: { map: 'capital', x: 7, y: 10 } },
      { goal: '수호기사단 본부의 기사단장을 만난다', hint: '탑을 봉쇄한 사람을 설득해야 한다. 기사단을 찾아가 보자', target: { map: 'capital', x: 40, y: 10 } },
      { goal: '훈련장의 시험관 가웨인에게 도전한다 (브란 혼자 싸운다)', hint: '기사단장이 내건 시험을 받아들이자. 이번에는 도움 없이', target: { map: 'knights', x: 10, y: 11 } },
      { goal: '마도학원 안쪽, 시계탑의 문을 조사한다', hint: '학원 안쪽에 시계탑으로 가는 문이 있다고 했다', target: { map: 'academy', x: 19, y: 3 } },
      { goal: '뒷골목의 수로 관리인 오토를 찾아간다', hint: '탑으로 가는 다른 길을 생각해 보자. 뒷골목의 누군가가 열쇠를 쥐고 있다던데', target: { map: 'capital', x: 11, y: 36 } },
      { goal: '지하수로를 지나 시계탑 아래로 향한다', hint: '지하의 낡은 물길이 탑 아래로 이어진다', target: { map: 'sewer2', x: 16, y: 2 } },
      { goal: '시계탑 꼭대기, 시간의 종으로 향한다', hint: '노래가 위에서 들린다. 탑의 맨 위로', target: { map: 'tower2', x: 3, y: 2 } },
      { goal: '마도학원의 오필리아 학장에게 보고한다', hint: '일어난 일을 학장에게 알리자', target: { map: 'capital', x: 7, y: 10 } },
    ],
    reward: { gold: 1500, items: [['warden_badge', 1]] },
  },
  main4: {
    name: '사막의 종', type: 'main', giver: '사미라의 사자 라시드',
    desc: '사막 너머 오아시스 사미라의 샘이 말라 가고, 물의 사제가 사라졌다. 사막 남쪽의 사원 근처에서 잿빛 옷의 무리가 목격되었다고 한다.',
    stages: [
      { goal: '은빛 가도 남쪽의 붉은 협곡을 지나 오아시스 사미라로 간다', hint: '사자가 걸어온 길을 거슬러, 가도의 남쪽으로', target: { map: 'highway', x: 48, y: 31 } },
      { goal: '사미라 북쪽의 큰 집에서 족장 하킴을 만난다', hint: '사자를 보낸 마을의 우두머리를 찾아가자', target: { map: 'samira', x: 17, y: 4 } },
      { goal: '여관 「사막의 별」에서 하룻밤 묵는다', hint: '긴 여정이었다. 오늘 밤은 쉬어 가자', target: { map: 'samira', x: 5, y: 5 } },
      { goal: '족장 하킴에게 미오가 사라진 일을 알린다', hint: '밤사이 일어난 일을 마을의 우두머리에게 알리자', target: { map: 'samira', x: 17, y: 4 } },
      { goal: '사막 동쪽의 옛 우물 동굴(전갈 굴)에서 태양의 열쇠를 찾는다', hint: '닫힌 문을 여는 열쇠는 말라 버린 옛 우물 어딘가에 잠들어 있다고 한다', target: { map: 'desert', x: 48, y: 9 } },
      { goal: '사막 남쪽의 모래시계 사원에서 해의 문을 연다', hint: '열쇠를 들고, 모래 바다의 남쪽으로', target: { map: 'desert', x: 30, y: 35 } },
      { goal: '흐르는 모래의 회랑을 지나 미오를 구한다', hint: '흐르는 모래 너머, 미오의 노래가 들리는 곳으로', target: { map: 'temple2', x: 12, y: 8 } },
      { goal: '사원 가장 아래, 모래 종의 방으로 향한다', hint: '종의 노래가 더 아래에서 들린다', target: { map: 'temple3', x: 9, y: 5 } },
      { goal: '사미라의 족장 하킴에게 돌아간다', hint: '물소리가 돌아온 마을로 돌아가자', target: { map: 'samira', x: 17, y: 4 } },
    ],
    reward: { gold: 3000, items: [['sand_badge', 1]] },
  },
  main5: {
    name: '파도의 종', type: 'main', giver: '오필리아 학장',
    desc: '북해로 가는 배가 한 달째 묶여 있다. 등대가 꺼진 뒤로 안개 속에서 회색 돛을 단 배가 나타나 배들을 삼킨다고 한다.',
    stages: [
      { goal: '은빛 가도 북쪽 숲길을 지나 항구 마을 마레아로 간다', hint: '숲 너머 북쪽, 눈 덮인 바닷가의 항구로', target: { map: 'highway', x: 42, y: 1 } },
      { goal: '마레아의 항만 사무소에서 항만장을 만난다', hint: '배가 묶인 사정을 아는 사람을 찾아가자', target: { map: 'marea', x: 5, y: 11 } },
      { goal: '마을 동쪽 집의 등대지기 손녀 에다를 찾아간다', hint: '꺼진 등대를 지키던 집안을 찾아가자', target: { map: 'marea', x: 34, y: 20 } },
      { goal: '해안 동쪽의 얼어붙은 해식 동굴을 지나 등대로 간다', hint: '무너진 절벽길 대신, 얼음 동굴을 지나 등대 곶으로', target: { map: 'coast', x: 33, y: 13 } },
      { goal: '등대 꼭대기 등명실로 올라간다', hint: '꺼진 등대 위에서 무언가가 차갑게 타고 있다', target: { map: 'lighthouse1', x: 5, y: 1 } },
      { goal: '마레아의 항만장 그레고르에게 돌아간다', hint: '바다 위의 그림자를 쫓으려면 배가 필요하다', target: { map: 'marea', x: 5, y: 11 } },
      { goal: '부두 동쪽 끝의 작은 배를 타고 유령선으로 간다', hint: '부두에서 기다리는 배에 오르자', target: { map: 'marea', x: 30, y: 2 } },
      { goal: '선창을 지나 선미 갑판의 함장을 찾는다', hint: '배의 주인은 키를 잡고 있다. 길은 배 밑바닥을 지나 이어진다', target: { map: 'ship_hold', x: 22, y: 2 } },
      { goal: '가라앉은 신전 깊은 곳, 파도 종의 방으로 간다', hint: '바닷속 깊은 곳에서 종의 노래가 들린다', target: { map: 'sunken1', x: 12, y: 1 } },
      { goal: '마레아의 항만장 그레고르에게 돌아간다', hint: '항구로 돌아가 소식을 전하자', target: { map: 'marea', x: 5, y: 11 } },
    ],
    reward: { gold: 4500, items: [['anchor_badge', 1]] },
  },
  s_crab: {
    name: '집게왕 현상수배', type: 'sub', giver: '항만 사무소 게시판',
    desc: '해안 동쪽 모래톱에 거대한 게 「집게왕」이 나타나 어구를 부수고 있다. 토벌하면 현상금 1800G.',
    stages: [
      { goal: '해안 동쪽 모래톱의 집게왕을 토벌한다', hint: '바닷가 모래톱에서 어구를 부수는 거대한 게를 찾아보자', target: { map: 'coast', x: 41, y: 26 } },
      { goal: '항만장 그레고르에게 보고한다', hint: '토벌 소식을 항만 사무소에 알리자', target: { map: 'marea', x: 5, y: 11 } },
    ],
    reward: { gold: 1800, items: [['sailor_knot', 1]] },
  },
  s_frozen: {
    name: '얼어붙은 편지', type: 'sub', giver: '해식 동굴의 얼음',
    desc: '해식 동굴의 얼음 속에서 15년 전의 편지를 꺼냈다. 「마레아의 엘사에게 ─ 은빛 갈매기호 갑판원 한스」',
    stages: [{ goal: '선술집 「갈매기」의 엘사에게 편지를 전한다', hint: '편지가 부르는 사람을 마을에서 찾아보자', target: { map: 'marea', x: 5, y: 20 } }],
    reward: { items: [['pearl_ring', 1], ['elixir', 2]] },
  },
  s_diary: {
    name: '무녀의 일기', type: 'sub', giver: '모래에 묻힌 일기장',
    desc: '사막에서 낡은 일기장의 찢어진 페이지를 발견했다. 단정한 글씨의 주인은 십 년 전 사미라에 왔던 사람인 듯하다.',
    stages: [
      { goal: '사막 곳곳에 흩어진 일기 조각을 모은다', hint: '모래 속에 흩어진 이야기의 나머지를 찾아보자', count: () => Math.min(3, Game.count('aria_page')), max: 3 },
      { goal: '사미라 동쪽, 무녀가 머물던 집의 나디아에게 일기를 보여 준다 (미오와 함께)', hint: '일기의 주인이 머물던 곳을 찾아가자. 일기가 부르는 사람과 함께', target: { map: 'samira', x: 30, y: 19 } },
    ],
    reward: { items: [['aria_chime', 1]] },
  },
  s_caravan: {
    name: '길 잃은 대상', type: 'sub', giver: '바자르의 상인 알리',
    desc: '알리의 대상 행렬이 사막에서 모래 도적에게 둘러싸였다. 매가 물어 온 편지에는 「동남쪽 바위 야영지」라고 적혀 있다.',
    stages: [
      { goal: '사막 동남쪽 바위 야영지에서 대상 행렬을 구한다', hint: '사막의 동남쪽, 바위 언덕 아래 야영지를 찾아가자', target: { map: 'desert', x: 50, y: 33 } },
      { goal: '바자르의 상인 알리에게 알린다', hint: '기다리는 사람에게 소식을 전하자', target: { map: 'samira', x: 5, y: 19 } },
    ],
    reward: { gold: 1000, items: [['oasis_ring', 1], ['mega_potion', 3]] },
  },
  s_bounty: {
    name: '회색갈기 현상수배', type: 'sub', giver: '수호기사단 게시판',
    desc: '은빛 가도 북동쪽 숲에 늑대 우두머리 「회색갈기」가 나타나 상인 마차를 습격하고 있다. 토벌하면 상금 600G.',
    stages: [
      { goal: '은빛 가도 북동쪽 숲의 굴에서 회색갈기를 토벌한다', hint: '숲 어딘가에서 마차를 노리는 거대한 늑대가 있다고 한다', target: { map: 'highway', x: 46, y: 6 } },
      { goal: '수호기사단 본부의 라인하르트 단장에게 보고한다', hint: '토벌 소식을 기사단에 알리자', target: { map: 'capital', x: 40, y: 10 } },
    ],
    reward: { gold: 600, items: [['wolf_fang', 1]] },
  },
  s_candy: {
    name: '축제의 별사탕', type: 'sub', giver: '축제 광장의 소녀 루나',
    desc: '루나는 할머니께 드릴 별사탕 세 개를 잃어버렸다. 고양이가 물어 갔을지도 모른다는데… 왕도와 그 주변을 찾아보자.',
    stages: [
      { goal: '잃어버린 별사탕을 찾는다 (왕도 안팎 어딘가)', hint: '고양이가 물어 갔을지도 모르는 별사탕을 찾아보자', count: () => Math.min(3, Game.count('star_candy')), max: 3 },
      { goal: '광장의 루나에게 별사탕을 돌려준다', hint: '소녀에게 별사탕을 돌려주자', target: { map: 'capital', x: 26, y: 22 } },
    ],
    reward: { items: [['festival_mask', 1], ['hi_potion', 3]] },
  },
  s_book: {
    name: '사라진 금서', type: 'sub', giver: '학원 사서 펠릭스',
    desc: '마도학원 금서고에서 「장막 너머의 기록」이 사라졌다. 지하수로에서 학원 표식이 찍힌 책을 봤다는 이야기가 있다.',
    stages: [
      { goal: '왕도 지하수로에서 금서를 찾는다', hint: '사라진 금서가 지하 어딘가에 굴러다닌다는 소문이 있다', target: { map: 'sewer1', x: 2, y: 18 } },
      { goal: '학원의 사서 펠릭스에게 금서를 돌려준다', hint: '책을 서고지기에게 돌려주자', target: { map: 'capital', x: 7, y: 10 } },
    ],
    reward: { items: [['veil_tome', 1]] },
  },
  s_star: {
    name: '별을 모으는 사람', type: 'sub', giver: '괴짜 수집가 피포',
    desc: '피포는 세계 곳곳에 떨어진 「별조각」을 모으고 있다. 모아 갈수록 멋진 보물과 바꿔 준다고 한다. (총 8개)',
    stages: [{ goal: '별조각을 찾아 피포에게 가져간다', hint: '반짝이는 별조각을 모아 수집가에게 가져가 보자', count: () => Game.state.starsGiven + Game.count('star'), max: 8, target: { map: 'rivel', x: 32, y: 24 } }],
    reward: { text: '2·4·6·8개마다 보상' },
  },
};

const Quests = (() => {
  const st = () => Game.state.quests;
  const get = (id) => st()[id];
  // 목표 표시 설정: 2(자세히)면 정확한 목표, 그 외에는 암시만
  const detailed = () => Settings.get('showGoal') >= 2;
  return {
    get,
    stageText: (stg) => (detailed() ? stg.goal : stg.hint || stg.goal),
    status: (id) => (get(id) ? get(id).status : 'none'),
    isActive: (id) => !!get(id) && get(id).status === 'active',
    isDone: (id) => !!get(id) && get(id).status === 'done',
    stage: (id) => (get(id) ? get(id).stage : -1),
    data(id) { const q = get(id); return q ? q.data : {}; },
    start(id) {
      if (get(id)) return false;
      st()[id] = { status: 'active', stage: 0, data: {}, t: Date.now() };
      return true;
    },
    setStage(id, n) { const q = get(id); if (q && q.status === 'active') q.stage = Math.max(q.stage, n); },
    complete(id, outcome) {
      const q = get(id);
      if (!q || q.status === 'done') return null;
      q.status = 'done';
      q.outcome = outcome || null;
      const r = QUESTS[id].reward || {};
      if (r.gold) Game.addGold(r.gold);
      for (const [it, n] of r.items || []) Game.addItem(it, n);
      return r;
    },
    // 현재 목표 텍스트 (진행 수치 포함)
    goal(id) {
      const q = get(id);
      if (!q) return '';
      if (q.status === 'done') return '완료';
      const s = QUESTS[id].stages[Math.min(q.stage, QUESTS[id].stages.length - 1)];
      let t = Quests.stageText(s);
      if (s.count) t += ` (${s.count()}/${s.max})`;
      return t;
    },
    target(id) {
      const q = get(id);
      if (!q || q.status !== 'active') return null;
      const s = QUESTS[id].stages[Math.min(q.stage, QUESTS[id].stages.length - 1)];
      return detailed() ? s.target || null : null;
    },
    // 현재 화면에 띄울 대표 목표 (메인 우선)
    currentGoal() {
      for (const id of ['main1', 'main2', 'main3', 'main4', 'main5']) if (this.isActive(id)) return { id, text: this.goal(id), target: this.target(id) };
      if (Game.flag('chapter4_done')) return { id: null, text: '자유 탐험 — 다음 이야기를 기다리며 남은 일을 정리해 보자', target: null };
      if (Game.flag('chapter3_done')) return { id: null, text: detailed() ? '마도학원의 오필리아 학장을 찾아가 북해 배편에 대해 듣자' : '사막의 일을 왕도에 전하자. 학원에서 새 소식이 기다리고 있을지도 모른다', target: detailed() ? { map: 'capital', x: 7, y: 10 } : null };
      if (Game.flag('chapter2_done')) return { id: null, text: detailed() ? '마도학원의 오필리아 학장을 찾아가 다음 여정에 대해 듣자' : '왕도에서 쉬는 동안, 학원에서 새 소식이 기다리고 있을지도 모른다', target: detailed() ? { map: 'capital', x: 7, y: 10 } : null };
      if (Game.flag('chapter1_done')) return { id: null, text: detailed() ? '리벨의 하르도 장로에게 작별 인사를 하고 왕도로 떠나자' : '새로운 여정을 앞두고, 마을의 어른께 인사를 드리자', target: detailed() ? { map: 'rivel', x: 18, y: 5 } : null };
      return null;
    },
    list(type) {
      return Object.keys(QUESTS).filter((id) => get(id) && (!type || QUESTS[id].type === type));
    },
    // 전투 처치 기록 연동
    onKill(monsterId) {
      if (monsterId === 'thorn_boar' && this.isActive('s_boar') && this.stage('s_boar') === 0) {
        const d = get('s_boar').data;
        d.kills = (d.kills || 0) + 1;
        if (d.kills >= 5) { this.setStage('s_boar', 1); return '[y]「멧돼지 소동」 가시멧돼지를 5마리 퇴치했다! 오웬에게 보고하자.[/]'; }
      }
      return null;
    },
    // 아이템 획득 연동
    onItem(itemId) {
      if (itemId === 'star_candy' && this.isActive('s_candy') && this.stage('s_candy') === 0 && Game.count('star_candy') >= 3) {
        this.setStage('s_candy', 1);
        return '[y]「축제의 별사탕」 별사탕을 3개 모두 찾았다! 광장의 루나에게 가져가자.[/]';
      }
      if (itemId === 'aria_page' && this.isActive('s_diary') && this.stage('s_diary') === 0 && Game.count('aria_page') >= 3) {
        this.setStage('s_diary', 1);
        return null; // 안내는 일기 장면(Story.ariaPage)에서
      }
      if (itemId === 'veil_book' && this.isActive('s_book') && this.stage('s_book') === 0) {
        this.setStage('s_book', 1);
        return '[y]「사라진 금서」 학원의 사서 펠릭스에게 돌려주자.[/]';
      }
      if (itemId === 'moonherb' && this.isActive('s_herb') && this.stage('s_herb') === 0 && Game.count('moonherb') >= 3) {
        this.setStage('s_herb', 1);
        return '[y]「달빛 풀 채집」 달빛 풀을 3개 모았다! 엘라 할머니에게 가져가자.[/]';
      }
      return null;
    },
  };
})();
