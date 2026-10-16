'use strict';
// ─────────────────────────────────────────────────────────────
// 아이템 데이터
//  kind: consumable | weapon | armor | shield | helm | accessory | key
//  가격(price) = 구매가. 판매가는 절반. key 종류는 팔 수 없다.
// ─────────────────────────────────────────────────────────────
const ALL = ['hero', 'bran', 'linette', 'mio', 'nell'];
const ITEMS = {
  // ── 소모품 ──
  herb: { name: '약초', kind: 'consumable', price: 8, desc: '아군 한 명의 HP를 약 35 회복한다.', use: { type: 'heal', amount: 35, target: 'ally' }, battle: true, field: true },
  potion: { name: '상처약', kind: 'consumable', price: 30, desc: '엘라 할머니의 특제 상처약. HP를 약 90 회복한다.', use: { type: 'heal', amount: 90, target: 'ally' }, battle: true, field: true },
  ether: { name: '마력의 이슬', kind: 'consumable', price: 120, desc: '새벽 이슬에 마력이 깃든 것. MP를 25 회복한다.', use: { type: 'mp', amount: 25, target: 'ally' }, battle: true, field: true },
  antidote: { name: '해독초', kind: 'consumable', price: 6, desc: '쓴맛이 강한 풀. 독을 치료한다.', use: { type: 'cure', cures: ['poison'], target: 'ally' }, battle: true, field: true },
  smelling: { name: '정신 드는 향', kind: 'consumable', price: 15, desc: '코를 찌르는 향. 수면과 마비를 치료한다.', use: { type: 'cure', cures: ['sleep', 'paralyze'], target: 'ally' }, battle: true, field: true },
  panacea: { name: '만능약', kind: 'consumable', price: 60, desc: '독·수면·마비·침묵을 모두 치료한다.', use: { type: 'cure', cures: ['poison', 'sleep', 'paralyze', 'silence'], target: 'ally' }, battle: true, field: true },
  feather: { name: '되살림 깃털', kind: 'consumable', price: 150, desc: '불사조의 깃털이라 불리는 물건. 쓰러진 동료를 HP 절반으로 되살린다.', use: { type: 'revive', pct: 0.5, target: 'deadAlly' }, battle: true, field: true },
  starwater: { name: '별의 물', kind: 'consumable', price: 400, desc: '별빛을 머금은 물. 아군 한 명의 HP와 MP를 모두 회복한다.', use: { type: 'full', target: 'ally' }, battle: true, field: true },
  firebomb: { name: '화염병', kind: 'consumable', price: 45, desc: '던지면 터지는 기름병. 적 전체에 불 속성 피해(약 30).', use: { type: 'damage', power: 30, element: 'fire', target: 'enemies', anim: 'fire' }, battle: true, field: false },
  return_wing: { name: '귀환의 날개', kind: 'consumable', price: 20, desc: '던지면 리벨 마을로 돌아간다. (필드·던전에서 사용)', use: { type: 'return', target: 'none' }, battle: false, field: true },
  incense: { name: '정령의 향', kind: 'consumable', price: 25, desc: '마물이 싫어하는 향. 한동안(약 120걸음) 마물과 마주치지 않는다.', use: { type: 'ward', steps: 120, target: 'none' }, battle: false, field: true },

  // ── 무기 ──
  umbrella: { name: '비닐우산', kind: 'weapon', price: 2, stats: { atk: 3 }, who: ['hero'], desc: '이세계로 올 때 손에 쥐고 있던 편의점 우산. 의외로 튼튼하다.' },
  club: { name: '나무 몽둥이', kind: 'weapon', price: 15, stats: { atk: 6 }, who: ['hero', 'bran', 'nell'], desc: '단단한 참나무를 깎은 몽둥이.' },
  hunting_knife: { name: '사냥 단검', kind: 'weapon', price: 75, stats: { atk: 9, spd: 2 }, who: ['hero', 'nell', 'linette'], desc: '가볍고 날렵한 단검. 민첩 +2.' },
  copper_sword: { name: '구리 검', kind: 'weapon', price: 110, stats: { atk: 12 }, who: ['hero', 'bran'], desc: '드른이 벼린 구리 검. 초보 모험가의 든든한 친구.' },
  oak_staff: { name: '떡갈나무 지팡이', kind: 'weapon', price: 50, stats: { atk: 3, mag: 4 }, who: ['linette', 'mio'], desc: '마력이 잘 흐르는 떡갈나무 지팡이. 마력 +4.' },
  iron_axe: { name: '철 도끼', kind: 'weapon', price: 320, stats: { atk: 19 }, who: ['bran'], desc: '묵직한 철 도끼. 휘두르는 데 힘이 필요하다.' },
  steel_sword: { name: '강철 검', kind: 'weapon', price: 420, stats: { atk: 20 }, who: ['hero', 'bran'], desc: '잘 단련된 강철 검.' },
  spellbook: { name: '불씨의 마도서', kind: 'weapon', price: 380, stats: { atk: 2, mag: 9 }, who: ['linette'], desc: '페이지마다 작은 불씨가 깃든 마도서. 마력 +9.' },
  blessed_staff: { name: '축복의 지팡이', kind: 'weapon', price: 500, stats: { atk: 6, mag: 10 }, who: ['mio', 'linette'], healBonus: 0.15, desc: '고대 신관의 지팡이. 마력 +10, 회복 주문 효과 +15%.' },
  venom_dagger: { name: '독니 단검', kind: 'weapon', price: 480, stats: { atk: 16, spd: 3 }, who: ['nell', 'hero'], onHit: { poison: 0.25 }, desc: '칼날에 독이 스민 단검. 공격 시 가끔 독을 입힌다.' },
  star_blade: { name: '별빛 검', kind: 'weapon', price: 0, stats: { atk: 26, mag: 4 }, who: ['hero'], element: 'light', desc: '별조각을 녹여 만든 검. 공격에 빛 속성이 깃든다.' },
  dorn_axe: { name: '드른의 도끼', kind: 'weapon', price: 0, stats: { atk: 28, def: 3 }, who: ['bran'], desc: '아버지 드른이 아들을 위해 밤새 벼린 도끼. 방어 +3.' },

  // ── 갑옷 ──
  hoodie: { name: '후드티', kind: 'armor', price: 2, stats: { def: 2 }, who: ['hero'], desc: '이세계로 올 때 입고 있던 후드티. 주머니에 영수증이 들어 있다.' },
  clothes: { name: '여행자의 옷', kind: 'armor', price: 20, stats: { def: 4 }, who: ALL, desc: '질긴 천으로 만든 평범한 여행복.' },
  thief_garb: { name: '도둑의 옷', kind: 'armor', price: 90, stats: { def: 6, spd: 2 }, who: ['nell', 'hero'], desc: '움직이기 편한 검은 옷. 민첩 +2.' },
  leather_armor: { name: '가죽 갑옷', kind: 'armor', price: 110, stats: { def: 8 }, who: ['hero', 'bran', 'nell'], desc: '무두질한 가죽으로 만든 갑옷.' },
  mage_robe: { name: '마도 로브', kind: 'armor', price: 140, stats: { def: 6, mag: 3 }, who: ['linette', 'mio'], desc: '마력을 머금은 실로 짠 로브. 마력 +3.' },
  vestment: { name: '무녀복', kind: 'armor', price: 160, stats: { def: 7, mag: 2 }, who: ['mio'], desc: '리벨 신전의 무녀복. 마력 +2.' },
  chain_mail: { name: '사슬 갑옷', kind: 'armor', price: 380, stats: { def: 14 }, who: ['hero', 'bran'], desc: '쇠사슬을 촘촘히 엮은 갑옷.' },
  shadow_cloak: { name: '그림자 망토', kind: 'armor', price: 420, stats: { def: 11, spd: 5 }, who: ['nell', 'hero'], desc: '어둠에 녹아드는 망토. 민첩 +5.' },
  sage_robe: { name: '현자의 로브', kind: 'armor', price: 450, stats: { def: 10, mag: 5 }, who: ['linette', 'mio'], desc: '별무늬가 수놓인 고대 로브. 마력 +5.' },

  // ── 방패 ──
  pot_lid: { name: '냄비 뚜껑', kind: 'shield', price: 10, stats: { def: 2 }, who: ['hero', 'bran', 'nell'], desc: '여관 주방에서 굴러다니던 냄비 뚜껑. 없는 것보단 낫다.' },
  wood_shield: { name: '나무 방패', kind: 'shield', price: 45, stats: { def: 4 }, who: ['hero', 'bran'], desc: '둥근 나무 방패.' },
  leather_shield: { name: '가죽 방패', kind: 'shield', price: 95, stats: { def: 6 }, who: ['hero', 'bran', 'nell'], desc: '가죽을 덧댄 가벼운 방패.' },
  iron_shield: { name: '철 방패', kind: 'shield', price: 300, stats: { def: 10 }, who: ['hero', 'bran'], desc: '무겁지만 믿음직한 철 방패.' },

  // ── 투구 ──
  leather_hat: { name: '가죽 모자', kind: 'helm', price: 30, stats: { def: 2 }, who: ALL, desc: '햇볕도 막아주는 가죽 모자.' },
  wizard_hat: { name: '별무늬 모자', kind: 'helm', price: 110, stats: { def: 2, mag: 3 }, who: ['linette', 'mio'], desc: '마도학원 학생들이 쓰는 모자. 마력 +3.' },
  iron_helm: { name: '철 투구', kind: 'helm', price: 240, stats: { def: 6 }, who: ['hero', 'bran'], desc: '머리를 단단히 지켜주는 투구.' },
  hairpin: { name: '은방울 머리꽂이', kind: 'helm', price: 260, stats: { def: 4, mag: 2 }, who: ['mio', 'linette', 'nell'], resist: { silence: 1 }, desc: '맑은 소리가 나는 머리꽂이. 침묵에 걸리지 않는다.' },

  // ── 장신구 ──
  swift_boots: { name: '날쌘 장화', kind: 'accessory', price: 300, stats: { spd: 10 }, who: ALL, desc: '사냥꾼 고르도가 아끼던 장화. 민첩 +10.' },
  guard_pendant: { name: '수호의 펜던트', kind: 'accessory', price: 300, stats: { def: 6 }, who: ALL, desc: '마르타 남매의 어머니가 남긴 펜던트. 방어 +6.' },
  calm_charm: { name: '평온의 부적', kind: 'accessory', price: 250, stats: { def: 1 }, who: ALL, resist: { sleep: 1 }, desc: '버섯 왕국의 국보(?). 잠에 빠지지 않는다.' },
  power_ring: { name: '힘의 반지', kind: 'accessory', price: 350, stats: { atk: 6 }, who: ALL, desc: '끼면 주먹에 힘이 들어간다. 공격 +6.' },
  sage_earring: { name: '지혜의 귀걸이', kind: 'accessory', price: 380, stats: { mag: 6, mp: 10 }, who: ALL, desc: '마력 +6, 최대 MP +10.' },
  antidote_bangle: { name: '해독의 팔찌', kind: 'accessory', price: 180, stats: {}, who: ALL, resist: { poison: 1 }, desc: '독에 걸리지 않게 해주는 팔찌.' },
  guard_badge: { name: '경비대 증표', kind: 'accessory', price: 200, stats: { def: 3, spd: 3 }, who: ALL, desc: '리벨 경비대가 공로자에게 주는 증표. 방어 +3, 민첩 +3.' },
  courage_token: { name: '용기의 증표', kind: 'accessory', price: 0, stats: { atk: 4, def: 4, spd: 4 }, who: ALL, desc: '리벨 마을을 구한 영웅에게 장로가 건넨 증표. 공격·방어·민첩 +4.' },

  // ── 귀중품 (퀘스트) ──
  moonherb: { name: '달빛 풀', kind: 'key', price: 0, desc: '달빛을 받으면 은은하게 빛나는 약초. 엘라 할머니가 찾고 있다.' },
  letter: { name: '마르타의 편지', kind: 'key', price: 0, desc: '여관 주인 마르타가 사냥꾼 고르도에게 보내는 편지. 봉투가 꼭 봉해져 있다.' },
  reply: { name: '고르도의 답장', kind: 'key', price: 0, desc: '고르도가 서툰 글씨로 쓴 답장.' },
  ring: { name: '로사의 반지', kind: 'key', price: 0, desc: '빵집 로사의 결혼반지.' },
  pipe: { name: '제랄드의 파이프', kind: 'key', price: 0, desc: '제랄드 할아버지가 50년 동안 쓴 파이프.' },
  oldmap: { name: '신전의 옛 지도', kind: 'key', price: 0, desc: '북쪽 유적의 구조가 그려진 낡은 지도. 일부가 찢겨 있다.' },
  rusty_key: { name: '녹슨 열쇠', kind: 'key', price: 0, desc: '유적에서 찾은 녹슨 열쇠. 어딘가의 문을 열 수 있을 것 같다.' },
  chime: { name: '별빛 방울', kind: 'key', price: 0, desc: '리벨 신전에 전해지는 방울. 흔들면 별이 노래하는 듯한 소리가 난다.' },
  note_a: { name: '찢어진 쪽지', kind: 'key', price: 0, desc: '"종은 열쇠를 부르고, 열쇠는 문을 연다. ─ A." 단정한 필체다.' },
  bell_shard: { name: '종의 파편', kind: 'key', price: 0, desc: '벨가르가 남긴 빛나는 종의 파편. 희미하게 따뜻하다.' },
  star: { name: '별조각', kind: 'key', price: 0, desc: '밤하늘에서 떨어졌다는 작은 별조각. 괴짜 수집가 피포가 모으고 있다.' },
};
for (const id in ITEMS) ITEMS[id].id = id;

const EQUIP_SLOTS = ['weapon', 'armor', 'shield', 'helm', 'accessory'];
const SLOT_NAMES = { weapon: '무기', armor: '갑옷', shield: '방패', helm: '투구', accessory: '장신구' };
const KIND_NAMES = { consumable: '소모품', weapon: '무기', armor: '갑옷', shield: '방패', helm: '투구', accessory: '장신구', key: '귀중품' };
