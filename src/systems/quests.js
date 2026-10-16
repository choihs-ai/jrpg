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
    stages: [{ goal: '마을 북쪽 장로의 집에서 하르도 장로를 만난다', target: { map: 'rivel', x: 18, y: 5 } }],
    reward: { gold: 50, items: [['herb', 3], ['return_wing', 1]] },
  },
  main2: {
    name: '북쪽의 이변', type: 'main', giver: '하르도 장로',
    desc: '300년 동안 잠들어 있던 북쪽 유적의 종이 울린 뒤로 마물이 부쩍 늘었다. 장로는 원인을 조사해 달라고 부탁했다.',
    stages: [
      { goal: '동쪽 숲에 사는 사냥꾼 고르도를 찾아간다', target: { map: 'field', x: 50, y: 30 } },
      { goal: '북쪽 고개를 넘어 유적으로 향한다 (고개의 주인 「철엄니」를 조심)', target: { map: 'field', x: 31, y: 14 } },
      { goal: '북쪽 고대 유적의 입구를 조사한다', target: { map: 'field', x: 31, y: 5 } },
      { goal: '리벨 신전의 대신관 세나에게 별빛 방울에 대해 묻는다', target: { map: 'rivel', x: 28, y: 5 } },
      { goal: '별빛 방울로 유적의 봉인을 푼다', target: { map: 'field', x: 31, y: 5 } },
      { goal: '유적 깊은 곳, 종의 방을 조사한다', target: { map: 'ruins2', x: 15, y: 2 } },
      { goal: '리벨 마을로 돌아가 장로에게 보고한다', target: { map: 'rivel', x: 18, y: 5 } },
    ],
    reward: { gold: 500, items: [['courage_token', 1]] },
  },
  s_herb: {
    name: '달빛 풀 채집', type: 'sub', giver: '약초상 엘라 할머니',
    desc: '엘라 할머니는 상처약을 만들 「달빛 풀」이 필요하다. 평원 곳곳의 은은하게 빛나는 풀을 찾아 3개 모아 오자.',
    stages: [
      { goal: '평원에서 달빛 풀을 3개 모은다', count: () => Math.min(3, Game.count('moonherb')), max: 3 },
      { goal: '도구점의 엘라 할머니에게 달빛 풀을 가져간다', target: { map: 'rivel', x: 32, y: 10 } },
    ],
    reward: { gold: 100, items: [['potion', 3]], text: '도구점에서 「상처약」 판매 시작' },
  },
  s_boar: {
    name: '멧돼지 소동', type: 'sub', giver: '농부 오웬',
    desc: '가시멧돼지들이 밭을 망쳐 놓는다. 평원의 가시멧돼지를 5마리 퇴치해 달라는 부탁.',
    stages: [
      { goal: '가시멧돼지를 퇴치한다', count: () => Math.min(5, (Quests.data('s_boar').kills || 0)), max: 5 },
      { goal: '농부 오웬에게 보고한다', target: { map: 'rivel', x: 7, y: 24 } },
    ],
    reward: { gold: 80, items: [['leather_shield', 1]] },
  },
  s_thief: {
    name: '사라진 물건들', type: 'sub', giver: '빵집의 로사',
    desc: '요즘 마을에서 물건이 자꾸 사라진다. 로사의 결혼반지도 없어졌다. 범인을 찾아보자.',
    stages: [
      { goal: '물건을 잃어버린 사람들에게 이야기를 듣는다 (제랄드 할아버지, 신전의 세나)', count: () => (Quests.data('s_thief').heard || 0), max: 2 },
      { goal: '마을 남서쪽 풍차 주변을 조사한다', target: { map: 'rivel', x: 13, y: 22 } },
      { goal: '풍차 안으로 들어가 본다', target: { map: 'rivel', x: 13, y: 22 } },
    ],
    reward: { text: '선택에 따라 결과가 달라진다' },
  },
  s_well: {
    name: '우물 속 목소리', type: 'sub', giver: '꼬마 티아',
    desc: '티아는 광장 우물에서 "짐은 배가 고프도다…" 하는 목소리를 들었다고 한다. 정말일까?',
    stages: [
      { goal: '광장의 우물을 조사한다', target: { map: 'rivel', x: 19, y: 15 } },
      { goal: '우물 아래 목소리의 주인을 찾는다', target: { map: 'cellar', x: 9, y: 3 } },
      { goal: '티아에게 알려준다', target: { map: 'rivel', x: 31, y: 18 } },
    ],
    reward: { items: [['star', 1]] },
  },
  s_dog: {
    name: '사냥개 바우', type: 'sub', giver: '사냥꾼 고르도',
    desc: '고르도의 사냥개 바우가 사흘째 돌아오지 않는다. "서쪽 숲, 늙은 나무 사이로 바람이 지나가는 길"을 좋아했다는데…',
    stages: [
      { goal: '평원 서쪽 숲 어딘가에서 바우를 찾는다', target: { map: 'field', x: 8, y: 22 } },
      { goal: '사냥꾼 고르도에게 알린다', target: { map: 'field', x: 50, y: 30 } },
    ],
    reward: { items: [['swift_boots', 1]] },
  },
  s_letter: {
    name: '전하지 못한 편지', type: 'sub', giver: '여관 주인 마르타',
    desc: '마르타는 10년 전 크게 다툰 오빠 고르도에게 편지를 전해 달라고 했다. 직접 가기는 아직 용기가 나지 않는다고.',
    stages: [
      { goal: '사냥꾼 고르도에게 편지를 전한다', target: { map: 'field', x: 50, y: 30 } },
      { goal: '여관의 마르타에게 답장을 전한다', target: { map: 'rivel', x: 6, y: 10 } },
    ],
    reward: { items: [['guard_pendant', 1]], text: '여관 숙박 무료' },
  },
  s_star: {
    name: '별을 모으는 사람', type: 'sub', giver: '괴짜 수집가 피포',
    desc: '피포는 세계 곳곳에 떨어진 「별조각」을 모으고 있다. 모아 갈수록 멋진 보물과 바꿔 준다고 한다. (총 8개)',
    stages: [{ goal: '별조각을 찾아 피포에게 가져간다', count: () => Game.state.starsGiven + Game.count('star'), max: 8, target: { map: 'rivel', x: 32, y: 24 } }],
    reward: { text: '2·4·6·8개마다 보상' },
  },
};

const Quests = (() => {
  const st = () => Game.state.quests;
  const get = (id) => st()[id];
  return {
    get,
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
      let t = s.goal;
      if (s.count) t += ` (${s.count()}/${s.max})`;
      return t;
    },
    target(id) {
      const q = get(id);
      if (!q || q.status !== 'active') return null;
      const s = QUESTS[id].stages[Math.min(q.stage, QUESTS[id].stages.length - 1)];
      return s.target || null;
    },
    // 현재 화면에 띄울 대표 목표 (메인 우선)
    currentGoal() {
      for (const id of ['main1', 'main2']) if (this.isActive(id)) return { id, text: this.goal(id), target: this.target(id) };
      if (Game.flag('chapter1_done')) return { id: null, text: '자유 탐험 — 남은 의뢰를 해결하거나 별조각을 모아 보자', target: null };
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
      if (itemId === 'moonherb' && this.isActive('s_herb') && this.stage('s_herb') === 0 && Game.count('moonherb') >= 3) {
        this.setStage('s_herb', 1);
        return '[y]「달빛 풀 채집」 달빛 풀을 3개 모았다! 엘라 할머니에게 가져가자.[/][/]';
      }
      return null;
    },
  };
})();
