'use strict';
// ─────────────────────────────────────────────────────────────
// 동료 캐릭터 정의: 기본 능력치, 성장률, 습득 기술, 초기 장비, 소개
// ─────────────────────────────────────────────────────────────
const CHARACTERS = {
  hero: {
    name: '하루', job: '이방인', look: 'hero', color: '#7cc4ff',
    base: { hp: 30, mp: 6, atk: 10, def: 6, mag: 6, spd: 8 },
    grow: { hp: 6, mp: 2.2, atk: 2.2, def: 1.6, mag: 1.5, spd: 1.5 },
    learn: { 1: ['analyze'], 3: ['heal'], 5: ['star_slash'], 7: ['thunder'], 9: ['twin_slash'], 11: ['heal_more'], 13: ['resolve'], 15: ['starfall'], 17: ['meteor_slash'] },
    equip: { weapon: 'umbrella', armor: 'hoodie' },
    bio: '어느 밤 막차 버스에서 잠들었다가 이세계의 들판에서 눈을 뜬 사람. 손등에 별 모양의 낙인이 새겨져 있다. 균형 잡힌 능력과 적을 꿰뚫어 보는 「분석」이 특기.',
  },
  bran: {
    name: '브란', job: '수호기사 지망생', look: 'bran', color: '#ff9a5a',
    base: { hp: 38, mp: 3, atk: 12, def: 8, mag: 1, spd: 5 },
    grow: { hp: 8, mp: 1, atk: 2.6, def: 2.0, mag: 0.4, spd: 1.0 },
    learn: { 1: ['bash'], 3: ['cover'], 5: ['warcry'], 7: ['quake'], 9: ['ironwall'], 11: ['shield_bash'], 13: ['guardian'], 15: ['earthsplit'], 17: ['knight_oath'] },
    equip: { weapon: 'club', armor: 'leather_armor', shield: 'pot_lid' },
    bio: '대장장이 드른의 아들. 대장간을 물려받기보다 왕국의 수호기사가 되기를 꿈꾼다. 힘세고 우직하지만 유령 이야기에는 약하다. 동료를 지키는 기술이 특기.',
  },
  linette: {
    name: '리네트', job: '마도학자', look: 'linette', color: '#d59bff',
    base: { hp: 22, mp: 14, atk: 5, def: 4, mag: 12, spd: 7 },
    grow: { hp: 4.2, mp: 3.6, atk: 0.9, def: 1.0, mag: 2.5, spd: 1.3 },
    learn: { 1: ['fire'], 2: ['ice'], 3: ['sleep'], 5: ['slow'], 6: ['firestorm'], 8: ['seal'], 10: ['blizzard'], 12: ['thunderstorm'], 14: ['mana_amp'], 16: ['ice_lance', 'inferno'] },
    equip: { weapon: 'oak_staff', armor: 'mage_robe', helm: 'wizard_hat' },
    bio: '왕립 마도학원의 젊은 연구자. 실종된 스승 알드윈 교수의 흔적을 좇아 종의 유적을 조사하고 있다. 말투는 날카롭지만 정이 많다. 속성 공격 주문의 전문가.',
  },
  mio: {
    name: '미오', job: '종의 무녀', look: 'mio', color: '#ff8aa8',
    base: { hp: 25, mp: 12, atk: 6, def: 5, mag: 9, spd: 6 },
    grow: { hp: 4.8, mp: 3.2, atk: 1.0, def: 1.2, mag: 2.0, spd: 1.2 },
    learn: { 1: ['heal'], 2: ['cure'], 4: ['protect'], 5: ['holy_lance'], 6: ['revive'], 8: ['heal_all'], 11: ['heal_more'], 13: ['chime_cleanse'], 15: ['holy_burst'], 17: ['sanctuary'] },
    equip: { weapon: 'oak_staff', armor: 'vestment' },
    bio: '리벨 신전의 무녀. 들판에 쓰러진 주인공을 처음 발견했다. 상냥하지만 한번 정하면 물러서지 않는다. 가끔 아무도 듣지 못하는 「종의 노래」를 듣는다.',
  },
  nell: {
    name: '넬', job: '떠돌이 도적', look: 'nell', color: '#7cf08a',
    base: { hp: 26, mp: 6, atk: 9, def: 5, mag: 3, spd: 13 },
    grow: { hp: 5, mp: 1.6, atk: 1.9, def: 1.3, mag: 0.6, spd: 2.2 },
    learn: { 1: ['steal', 'venom_strike'], 4: ['smoke'], 6: ['vital_strike'], 8: ['numb_needle'], 10: ['mug'], 12: ['shadow_step'], 14: ['poison_cloud'], 16: ['assassinate'] },
    equip: { weapon: 'hunting_knife', armor: 'thief_garb' },
    bio: '리벨 마을에 숨어들었던 좀도둑. 날렵한 몸놀림과 독·마비 기술, 훔치기가 특기. 일행에 있으면 숨겨진 보물이 반짝여 보인다.',
  },
};
for (const id in CHARACTERS) CHARACTERS[id].id = id;

// 다음 레벨까지 필요한 경험치 (누적 아님)
function expToNext(level) { return Math.round(8 * Math.pow(level, 1.8) + 4 * level); }
// 레벨 L 도달에 필요한 누적 경험치
function expForLevel(level) { let t = 0; for (let l = 1; l < level; l++) t += expToNext(l); return t; }
const MAX_LEVEL = 50;
