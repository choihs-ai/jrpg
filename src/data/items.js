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
  return_wing: { name: '귀환의 날개', kind: 'consumable', price: 20, desc: '던지면 가 본 적 있는 마을(리벨·왕도·사미라)로 돌아간다. (필드·던전에서 사용)', use: { type: 'return', target: 'none' }, battle: false, field: true },
  hi_potion: { name: '고급 상처약', kind: 'consumable', price: 90, desc: '왕도 약방의 고급 상처약. HP를 약 200 회복한다.', use: { type: 'heal', amount: 200, target: 'ally' }, battle: true, field: true },
  thunder_flask: { name: '번개병', kind: 'consumable', price: 80, desc: '마도학원 실험실에서 나온 번개를 가둔 병. 적 전체에 번개 속성 피해(약 60).', use: { type: 'damage', power: 60, element: 'thunder', target: 'enemies', anim: 'thunder' }, battle: true, field: false },
  mega_potion: { name: '오아시스의 물', kind: 'consumable', price: 220, desc: '사미라 오아시스의 맑은 샘물. HP를 약 400 회복한다.', use: { type: 'heal', amount: 400, target: 'ally' }, battle: true, field: true },
  hi_ether: { name: '사막의 이슬', kind: 'consumable', price: 320, desc: '선인장 꽃에 맺힌 진한 이슬. MP를 60 회복한다.', use: { type: 'mp', amount: 60, target: 'ally' }, battle: true, field: true },
  sand_bomb: { name: '모래 폭탄', kind: 'consumable', price: 140, desc: '모래와 화약을 섞은 폭탄. 적 전체에 피해(약 110)를 주고 명중률을 떨어뜨린다.', use: { type: 'damage', power: 110, target: 'enemies', anim: 'impact', debuffAll: { hit: 0.75 } }, battle: true, field: false },
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
  mythril_sword: { name: '미스릴 검', kind: 'weapon', price: 1150, stats: { atk: 32 }, who: ['hero', 'bran'], desc: '가볍고 단단한 미스릴로 벼린 검. 왕도 기사들이 동경하는 한 자루.' },
  war_axe: { name: '전투 도끼', kind: 'weapon', price: 1300, stats: { atk: 36, spd: -2 }, who: ['bran'], desc: '양날의 거대한 도끼. 묵직해서 조금 느려진다. 민첩 -2.' },
  silver_dagger: { name: '은빛 단검', kind: 'weapon', price: 980, stats: { atk: 26, spd: 5 }, who: ['nell', 'hero', 'linette'], element: 'light', desc: '은으로 도금한 단검. 공격에 빛 속성이 깃든다. 민첩 +5.' },
  rune_staff: { name: '룬 지팡이', kind: 'weapon', price: 1100, stats: { atk: 8, mag: 16 }, who: ['linette', 'mio'], desc: '마도학원 교수들이 쓰는 룬 지팡이. 마력 +16.' },
  veil_tome: { name: '장막의 마도서', kind: 'weapon', price: 0, stats: { atk: 4, mag: 22, mp: 15 }, who: ['linette'], desc: '금서를 되찾아 준 답례로 받은 마도서. 마력 +22, 최대 MP +15.' },
  flame_saber: { name: '화염 시미터', kind: 'weapon', price: 2600, stats: { atk: 42 }, who: ['hero', 'bran', 'nell'], element: 'fire', desc: '사막 장인이 벼린 휘어진 칼. 공격에 불 속성이 깃든다.' },
  sand_axe: { name: '사구의 도끼', kind: 'weapon', price: 2900, stats: { atk: 48, spd: -2 }, who: ['bran'], desc: '모래 바람에도 녹슬지 않는 검은 쇠 도끼. 민첩 -2.' },
  scorpion_dagger: { name: '전갈 꼬리 단검', kind: 'weapon', price: 2400, stats: { atk: 36, spd: 7 }, who: ['nell', 'hero'], onHit: { poison: 0.3 }, desc: '전갈 여왕의 꼬리를 깎아 만든 단검. 공격 시 가끔 독. 민첩 +7.' },
  sun_staff: { name: '태양의 지팡이', kind: 'weapon', price: 2500, stats: { atk: 12, mag: 22 }, who: ['linette', 'mio'], desc: '꼭대기에 태양석이 박힌 지팡이. 마력 +22.' },
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
  mythril_mail: { name: '미스릴 갑옷', kind: 'armor', price: 1200, stats: { def: 22 }, who: ['hero', 'bran'], desc: '미스릴 비늘을 엮은 갑옷. 가볍고 튼튼하다.' },
  mystic_robe: { name: '신비의 로브', kind: 'armor', price: 1050, stats: { def: 15, mag: 7 }, who: ['linette', 'mio'], desc: '별빛 실로 짠 로브. 마력 +7.' },
  night_garb: { name: '밤그림자 옷', kind: 'armor', price: 980, stats: { def: 16, spd: 7 }, who: ['nell', 'hero'], desc: '왕도 뒷골목의 장인이 지은 검은 옷. 민첩 +7.' },
  desert_mail: { name: '사막 비늘 갑옷', kind: 'armor', price: 2700, stats: { def: 29 }, who: ['hero', 'bran'], desc: '모래도마뱀 비늘을 엮은 갑옷. 가볍고 시원하다.' },
  mirage_robe: { name: '신기루 로브', kind: 'armor', price: 2500, stats: { def: 20, mag: 9 }, who: ['linette', 'mio'], desc: '보는 각도에 따라 색이 일렁이는 로브. 마력 +9.' },
  sand_garb: { name: '모래바람 옷', kind: 'armor', price: 2300, stats: { def: 21, spd: 9 }, who: ['nell', 'hero'], desc: '사막 유목민의 가벼운 옷. 민첩 +9.' },
  sage_robe: { name: '현자의 로브', kind: 'armor', price: 450, stats: { def: 10, mag: 5 }, who: ['linette', 'mio'], desc: '별무늬가 수놓인 고대 로브. 마력 +5.' },

  // ── 방패 ──
  pot_lid: { name: '냄비 뚜껑', kind: 'shield', price: 10, stats: { def: 2 }, who: ['hero', 'bran', 'nell'], desc: '여관 주방에서 굴러다니던 냄비 뚜껑. 없는 것보단 낫다.' },
  wood_shield: { name: '나무 방패', kind: 'shield', price: 45, stats: { def: 4 }, who: ['hero', 'bran'], desc: '둥근 나무 방패.' },
  leather_shield: { name: '가죽 방패', kind: 'shield', price: 95, stats: { def: 6 }, who: ['hero', 'bran', 'nell'], desc: '가죽을 덧댄 가벼운 방패.' },
  iron_shield: { name: '철 방패', kind: 'shield', price: 300, stats: { def: 10 }, who: ['hero', 'bran'], desc: '무겁지만 믿음직한 철 방패.' },

  knight_shield: { name: '기사의 방패', kind: 'shield', price: 900, stats: { def: 15 }, who: ['hero', 'bran'], desc: '수호기사단 문장이 새겨진 방패.' },
  squire_shield: { name: '견습 기사의 방패', kind: 'shield', price: 0, stats: { def: 13, hp: 20 }, who: ['bran'], desc: '입단 시험을 통과한 견습 기사에게 주어지는 방패. 최대 HP +20.' },
  buckler: { name: '은 버클러', kind: 'shield', price: 620, stats: { def: 9, spd: 2 }, who: ['hero', 'bran', 'nell', 'linette'], desc: '가벼운 은 방패. 민첩 +2.' },

  sun_shield: { name: '태양의 방패', kind: 'shield', price: 2200, stats: { def: 20 }, who: ['hero', 'bran'], resist: { sleep: 0.5 }, desc: '태양 문양이 새겨진 둥근 방패. 수면에 조금 강해진다.' },

  // ── 투구 ──
  leather_hat: { name: '가죽 모자', kind: 'helm', price: 30, stats: { def: 2 }, who: ALL, desc: '햇볕도 막아주는 가죽 모자.' },
  wizard_hat: { name: '별무늬 모자', kind: 'helm', price: 110, stats: { def: 2, mag: 3 }, who: ['linette', 'mio'], desc: '마도학원 학생들이 쓰는 모자. 마력 +3.' },
  iron_helm: { name: '철 투구', kind: 'helm', price: 240, stats: { def: 6 }, who: ['hero', 'bran'], desc: '머리를 단단히 지켜주는 투구.' },
  hairpin: { name: '은방울 머리꽂이', kind: 'helm', price: 260, stats: { def: 4, mag: 2 }, who: ['mio', 'linette', 'nell'], resist: { silence: 1 }, desc: '맑은 소리가 나는 머리꽂이. 침묵에 걸리지 않는다.' },

  silver_helm: { name: '은 투구', kind: 'helm', price: 760, stats: { def: 10 }, who: ['hero', 'bran'], desc: '은으로 덧댄 투구.' },
  feather_hat: { name: '깃털 모자', kind: 'helm', price: 680, stats: { def: 6, mag: 3, spd: 3 }, who: ['linette', 'mio', 'nell', 'hero'], desc: '축제 기간에 유행하는 깃털 모자. 마력 +3, 민첩 +3.' },
  festival_mask: { name: '축제 가면', kind: 'helm', price: 0, stats: { def: 5, spd: 6 }, who: ALL, resist: { sleep: 1 }, desc: '별내림 축제의 가면. 쓰면 기분이 들떠 잠이 오지 않는다. 민첩 +6.' },

  turban: { name: '사막 터번', kind: 'helm', price: 1600, stats: { def: 9, mag: 2, spd: 2 }, who: ALL, resist: { paralyze: 0.5 }, desc: '머리를 시원하게 지켜 주는 터번. 마비에 조금 강해진다.' },
  desert_helm: { name: '모래 투구', kind: 'helm', price: 1900, stats: { def: 14 }, who: ['hero', 'bran'], desc: '모래가 들어가지 않게 만든 투구.' },

  // ── 장신구 ──
  swift_boots: { name: '날쌘 장화', kind: 'accessory', price: 300, stats: { spd: 10 }, who: ALL, desc: '사냥꾼 고르도가 아끼던 장화. 민첩 +10.' },
  guard_pendant: { name: '수호의 펜던트', kind: 'accessory', price: 300, stats: { def: 6 }, who: ALL, desc: '마르타 남매의 어머니가 남긴 펜던트. 방어 +6.' },
  calm_charm: { name: '평온의 부적', kind: 'accessory', price: 250, stats: { def: 1 }, who: ALL, resist: { sleep: 1 }, desc: '버섯 왕국의 국보(?). 잠에 빠지지 않는다.' },
  power_ring: { name: '힘의 반지', kind: 'accessory', price: 350, stats: { atk: 6 }, who: ALL, desc: '끼면 주먹에 힘이 들어간다. 공격 +6.' },
  sage_earring: { name: '지혜의 귀걸이', kind: 'accessory', price: 380, stats: { mag: 6, mp: 10 }, who: ALL, desc: '마력 +6, 최대 MP +10.' },
  antidote_bangle: { name: '해독의 팔찌', kind: 'accessory', price: 180, stats: {}, who: ALL, resist: { poison: 1 }, desc: '독에 걸리지 않게 해주는 팔찌.' },
  guard_badge: { name: '경비대 증표', kind: 'accessory', price: 200, stats: { def: 3, spd: 3 }, who: ALL, desc: '리벨 경비대가 공로자에게 주는 증표. 방어 +3, 민첩 +3.' },
  wolf_fang: { name: '회색갈기의 송곳니', kind: 'accessory', price: 600, stats: { atk: 7, spd: 4 }, who: ALL, desc: '가도를 공포에 떨게 한 늑대 우두머리의 송곳니. 공격 +7, 민첩 +4.' },
  orphan_charm: { name: '별바라기 부적', kind: 'accessory', price: 0, stats: { def: 4, mag: 4 }, who: ALL, resist: { paralyze: 1 }, desc: '보육원 아이들이 한 땀 한 땀 꿰매 만든 부적. 마비에 걸리지 않는다.' },
  warden_badge: { name: '별의 수호대 문장', kind: 'accessory', price: 0, stats: { atk: 6, def: 6, mag: 6, spd: 6 }, who: ALL, desc: '왕국이 「별의 수호대」에게 내린 문장. 모든 능력 +6.' },
  oasis_ring: { name: '오아시스의 반지', kind: 'accessory', price: 1800, stats: { hp: 40, mp: 15 }, who: ALL, desc: '맑은 물빛 보석 반지. 최대 HP +40, 최대 MP +15.' },
  queen_fang: { name: '여왕의 독침', kind: 'accessory', price: 0, stats: { atk: 9, spd: 4 }, who: ALL, resist: { poison: 1 }, desc: '전갈 여왕의 독침을 다듬은 장신구. 공격 +9, 민첩 +4, 독에 걸리지 않는다.' },
  aria_chime: { name: '아리아의 방울', kind: 'accessory', price: 0, stats: { mag: 10, mp: 20, def: 5 }, who: ['mio'], healBonus: 0.2, desc: '미오의 어머니가 쓰던 작은 방울. 마력 +10, 최대 MP +20, 회복 주문 효과 +20%.' },
  sand_badge: { name: '사막의 은인 징표', kind: 'accessory', price: 0, stats: { atk: 8, def: 8, mag: 8, spd: 8 }, who: ALL, desc: '사미라 오아시스가 은인에게 주는 징표. 모든 능력 +8.' },
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
  choir_score: { name: '성가대의 악보', kind: 'key', price: 0, desc: '집행자 베인이 떨어뜨린 악보 조각. 「제2성부는 시간의 종 아래에서 노래하리라」라고 적혀 있다.' },
  knight_crest: { name: '기사단 문장', kind: 'key', price: 0, desc: '입단 시험을 통과한 견습 기사의 증표. 왕도의 통제 구역에 드나들 수 있다.' },
  sewer_key: { name: '수로 열쇠', kind: 'key', price: 0, desc: '왕도 지하수로의 맨홀을 여는 무거운 열쇠.' },
  veil_book: { name: '금서 「장막 너머의 기록」', kind: 'key', price: 0, desc: '마도학원 금서고에서 사라진 책. 표지에 회색 손자국이 묻어 있다.' },
  star_candy: { name: '별사탕', kind: 'key', price: 0, desc: '별내림 축제의 별사탕. 축제 광장의 소녀 루나가 찾고 있다.' },
  elly_letter: { name: '빛바랜 편지', kind: 'key', price: 0, desc: '「아빠, 오늘은 기침이 덜 나요. 별내림 축제에는 같이 갈 수 있겠죠? ─ 엘리」' },
  time_heart: { name: '시간의 심장', kind: 'key', price: 0, desc: '시간의 종에서 빠져나온 빛나는 구슬. 째깍, 째깍… 손안에서 고동친다.' },
  canyon_pass: { name: '족장의 통행패', kind: 'key', price: 0, desc: '사미라 오아시스 족장의 인장이 찍힌 나무패. 사자가 왕도까지 들고 온 것.' },
  sun_key: { name: '태양의 열쇠', kind: 'key', price: 0, desc: '태양 문양이 새겨진 황금 열쇠. 모래시계 사원의 「해의 문」을 연다.' },
  aria_page: { name: '아리아의 일기 조각', kind: 'key', price: 0, desc: '모래에 바랜 일기장의 찢어진 페이지. 단정한 글씨로 「미오에게」라고 적혀 있다.' },
  sand_heart: { name: '모래의 심장', kind: 'key', price: 0, desc: '모래 종에서 빠져나온 구슬. 안에서 고운 모래가 끝없이 흘러내린다.' },
  lost_letter: { name: '대상의 편지', kind: 'key', price: 0, desc: '사막에서 길을 잃은 대상 행렬이 남긴 구조 요청 편지.' },
  star: { name: '별조각', kind: 'key', price: 0, desc: '밤하늘에서 떨어졌다는 작은 별조각. 괴짜 수집가 피포가 모으고 있다.' },
};
for (const id in ITEMS) ITEMS[id].id = id;

const EQUIP_SLOTS = ['weapon', 'armor', 'shield', 'helm', 'accessory'];
const SLOT_NAMES = { weapon: '무기', armor: '갑옷', shield: '방패', helm: '투구', accessory: '장신구' };
const KIND_NAMES = { consumable: '소모품', weapon: '무기', armor: '갑옷', shield: '방패', helm: '투구', accessory: '장신구', key: '귀중품' };
