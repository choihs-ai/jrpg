'use strict';
// ─────────────────────────────────────────────────────────────
// 주문(spell) · 특기(skill) · 적 기술(enemy) 데이터
//  target: enemy | enemies | ally | allies | self | deadAlly | allyOther | none
//  type: physical | magic | heal | mp | revive | cure | buff | debuff | status | analyze | steal | cover | drain | flee | pilfer | charge | summon | absorb | damage | full
//  msg: 기술 사용 문장 ({A}=사용자, {T}=대상). 없으면 기본 문장.
// ─────────────────────────────────────────────────────────────
const ELEMENTS = { fire: '불', ice: '얼음', thunder: '번개', light: '빛', dark: '어둠' };
const STATUS_NAMES = { poison: '독', sleep: '수면', paralyze: '마비', silence: '침묵' };
const BUFF_NAMES = { atk: '공격력', def: '방어력', spd: '민첩', hit: '명중률', mag: '마력', eva: '회피율' };

const SKILLS = {
  attack: { name: '공격', kind: 'basic', target: 'enemy', type: 'physical', mult: 1, anim: 'slash' },

  // ── 주인공 ──
  analyze: { name: '분석', kind: 'skill', mp: 0, target: 'enemy', type: 'analyze', priority: true, anim: 'scan', desc: '이방인의 눈으로 적의 약점과 능력을 꿰뚫어 본다. 가장 먼저 행동한다.' },
  star_slash: { name: '별빛 베기', kind: 'skill', mp: 4, target: 'enemy', type: 'physical', mult: 1.45, element: 'light', anim: 'starslash', desc: '별빛을 두른 일격. 빛 속성 물리 공격.' },
  twin_slash: { name: '연속 베기', kind: 'skill', mp: 5, target: 'enemy', type: 'physical', mult: 0.8, hits: 2, randomTargets: true, anim: 'slash', desc: '눈 깜짝할 새 두 번 벤다. (무작위 대상)' },
  heal: { name: '치유', kind: 'spell', mp: 3, target: 'ally', type: 'heal', power: 28, scale: 0.8, anim: 'heal', field: true, desc: '아군 한 명의 HP를 회복한다.' },
  heal_more: { name: '상급 치유', kind: 'spell', mp: 7, target: 'ally', type: 'heal', power: 80, scale: 1.2, anim: 'heal', field: true, desc: '아군 한 명의 HP를 크게 회복한다.' },
  starfall: { name: '별똥별', kind: 'spell', mp: 10, target: 'enemies', type: 'magic', element: 'light', power: 34, scale: 0.7, anim: 'light', desc: '하늘에서 별똥별을 쏟아붓는다. 적 전체에 빛 속성 피해.' },
  resolve: { name: '각오', kind: 'skill', mp: 4, target: 'self', type: 'buff', buff: { atk: 1.4, def: 1.3 }, turns: 4, anim: 'buff', desc: '마음을 다잡는다. 자신의 공격력과 방어력이 오른다. (4턴)' },
  meteor_slash: { name: '유성 베기', kind: 'skill', mp: 9, target: 'enemy', type: 'physical', mult: 2.1, element: 'light', anim: 'starslash', desc: '유성처럼 내리꽂는 일격. 강력한 빛 속성 물리 공격.' },
  thunder: { name: '번개', kind: 'spell', mp: 5, target: 'enemy', type: 'magic', element: 'thunder', power: 26, scale: 0.6, anim: 'thunder', desc: '하늘에서 번개를 내리꽂는다. 번개 속성.' },

  // ── 브란 ──
  bash: { name: '강타', kind: 'skill', mp: 2, target: 'enemy', type: 'physical', mult: 1.6, hit: -0.1, anim: 'bigslash', desc: '온 힘을 실어 내려친다. 위력이 크지만 조금 빗나가기 쉽다.' },
  cover: { name: '감싸기', kind: 'skill', mp: 0, target: 'allyOther', type: 'cover', priority: true, anim: 'guard', desc: '이번 턴 동안 동료 한 명이 받을 물리 공격을 대신 맞는다. 가장 먼저 행동한다.' },
  warcry: { name: '함성', kind: 'skill', mp: 3, target: 'allies', type: 'buff', buff: { atk: 1.25 }, turns: 4, anim: 'buff', desc: '우렁찬 함성으로 아군 전체의 공격력을 높인다. (4턴)' },
  quake: { name: '대지 가르기', kind: 'skill', mp: 5, target: 'enemies', type: 'physical', mult: 0.85, anim: 'quake', desc: '도끼로 땅을 갈라 적 전체를 공격한다.' },
  ironwall: { name: '철벽', kind: 'skill', mp: 2, target: 'self', type: 'buff', buff: { def: 2.0 }, turns: 1, taunt: true, priority: true, anim: 'guard', desc: '방패를 굳게 세운다. 이번 턴 방어력이 크게 오르고 적의 공격을 끌어당긴다.' },

  shield_bash: { name: '방패 치기', kind: 'skill', mp: 3, target: 'enemy', type: 'physical', mult: 1.1, status: { paralyze: 0.35 }, anim: 'impact', desc: '방패로 후려친다. 확률로 마비.' },
  guardian: { name: '수호의 맹세', kind: 'skill', mp: 6, target: 'allies', type: 'coverAll', priority: true, anim: 'guard', desc: '이번 턴, 동료 전원이 받을 단일 물리 공격을 대신 맞는다. 자신의 방어력도 오른다. 가장 먼저 행동한다.' },
  earthsplit: { name: '대지 분쇄', kind: 'skill', mp: 8, target: 'enemies', type: 'physical', mult: 1.25, anim: 'quake', desc: '도끼를 내리꽂아 대지를 부순다. 강력한 전체 공격.' },
  knight_oath: { name: '기사의 서약', kind: 'skill', mp: 8, target: 'allies', type: 'buff', buff: { atk: 1.25, def: 1.25 }, turns: 4, anim: 'buff', desc: '기사의 서약을 외친다. 아군 전체의 공격력과 방어력이 오른다. (4턴)' },

  // ── 리네트 ──
  fire: { name: '불꽃', kind: 'spell', mp: 3, target: 'enemy', type: 'magic', element: 'fire', power: 14, scale: 0.7, anim: 'fire', desc: '불덩이를 날린다. 불 속성.' },
  ice: { name: '얼음 화살', kind: 'spell', mp: 3, target: 'enemy', type: 'magic', element: 'ice', power: 14, scale: 0.7, anim: 'ice', desc: '날카로운 얼음 화살을 쏜다. 얼음 속성.' },
  sleep: { name: '잠의 안개', kind: 'spell', mp: 4, target: 'enemies', type: 'status', status: { sleep: 0.6 }, anim: 'mist', desc: '적 전체를 잠재운다. (확률)' },
  slow: { name: '둔화', kind: 'spell', mp: 3, target: 'enemies', type: 'debuff', buff: { spd: 0.6 }, turns: 4, chance: 0.75, anim: 'debuff', desc: '적 전체의 민첩을 떨어뜨린다. (확률)' },
  firestorm: { name: '화염 폭풍', kind: 'spell', mp: 7, target: 'enemies', type: 'magic', element: 'fire', power: 13, scale: 0.55, anim: 'fire', desc: '불길의 소용돌이로 적 전체를 태운다.' },
  seal: { name: '침묵의 봉인', kind: 'spell', mp: 3, target: 'enemy', type: 'status', status: { silence: 0.75 }, anim: 'debuff', desc: '적 하나의 주문을 봉인한다. (확률)' },
  blizzard: { name: '눈보라', kind: 'spell', mp: 9, target: 'enemies', type: 'magic', element: 'ice', power: 18, scale: 0.6, anim: 'ice', desc: '눈보라를 일으켜 적 전체를 얼린다.' },

  thunderstorm: { name: '번개 폭풍', kind: 'spell', mp: 10, target: 'enemies', type: 'magic', element: 'thunder', power: 26, scale: 0.65, anim: 'thunder', desc: '번개 폭풍으로 적 전체를 내리친다.' },
  mana_amp: { name: '마력 증폭', kind: 'spell', mp: 5, target: 'self', type: 'buff', buff: { mag: 1.5 }, turns: 4, priority: true, anim: 'buff', desc: '자신의 마력을 크게 끌어올린다. (4턴) 가장 먼저 행동한다.' },
  ice_lance: { name: '빙창', kind: 'spell', mp: 9, target: 'enemy', type: 'magic', element: 'ice', power: 55, scale: 1.1, anim: 'ice', desc: '거대한 얼음 창을 꽂는다. 강력한 얼음 속성 단일 공격.' },
  inferno: { name: '업화', kind: 'spell', mp: 9, target: 'enemy', type: 'magic', element: 'fire', power: 55, scale: 1.1, anim: 'fire', desc: '모든 것을 태우는 불길. 강력한 불 속성 단일 공격.' },

  // ── 미오 ──
  cure: { name: '정화', kind: 'spell', mp: 2, target: 'ally', type: 'cure', cures: ['poison', 'sleep', 'paralyze', 'silence'], anim: 'heal', field: true, desc: '아군 한 명의 독·수면·마비·침묵을 치료한다.' },
  protect: { name: '수호의 기도', kind: 'spell', mp: 4, target: 'allies', type: 'buff', buff: { def: 1.35 }, turns: 4, anim: 'buff', desc: '아군 전체의 방어력을 높인다. (4턴)' },
  holy_lance: { name: '빛의 창', kind: 'spell', mp: 4, target: 'enemy', type: 'magic', element: 'light', power: 22, scale: 0.7, anim: 'light', desc: '빛의 창을 내리꽂는다. 빛 속성. 언데드와 어둠의 존재에게 강하다.' },
  revive: { name: '소생', kind: 'spell', mp: 10, target: 'deadAlly', type: 'revive', pct: 0.5, anim: 'heal', field: true, desc: '쓰러진 동료를 HP 절반으로 되살린다.' },
  heal_all: { name: '치유의 비', kind: 'spell', mp: 9, target: 'allies', type: 'heal', power: 26, scale: 0.6, anim: 'heal', field: true, desc: '치유의 빛을 비처럼 내려 아군 전체를 회복한다.' },

  chime_cleanse: { name: '정화의 방울', kind: 'spell', mp: 6, target: 'allies', type: 'cure', cures: ['poison', 'sleep', 'paralyze', 'silence'], anim: 'heal', field: true, desc: '별빛 방울을 울려 아군 전체의 독·수면·마비·침묵을 치료한다.' },
  holy_burst: { name: '성광', kind: 'spell', mp: 10, target: 'enemies', type: 'magic', element: 'light', power: 30, scale: 0.7, anim: 'light', desc: '눈부신 빛을 터뜨려 적 전체에 빛 속성 피해.' },
  sanctuary: { name: '성역', kind: 'spell', mp: 10, target: 'allies', type: 'buff', buff: { def: 1.4, mag: 1.2 }, turns: 4, anim: 'buff', desc: '빛의 결계를 펼친다. 아군 전체의 방어력과 마력이 오른다. (4턴)' },

  // ── 넬 ──
  steal: { name: '훔치기', kind: 'skill', mp: 0, target: 'enemy', type: 'steal', anim: 'steal', desc: '적이 가진 물건을 훔친다. 민첩이 높을수록 성공하기 쉽다.' },
  venom_strike: { name: '독 찌르기', kind: 'skill', mp: 2, target: 'enemy', type: 'physical', mult: 1.0, status: { poison: 0.7 }, anim: 'slash', desc: '독을 바른 칼끝으로 찌른다. 높은 확률로 독.' },
  smoke: { name: '연막탄', kind: 'skill', mp: 3, target: 'enemies', type: 'debuff', buff: { hit: 0.65 }, turns: 3, chance: 1, anim: 'mist', desc: '연막을 터뜨려 적 전체의 명중률을 떨어뜨린다. (3턴)' },
  vital_strike: { name: '급소 찌르기', kind: 'skill', mp: 3, target: 'enemy', type: 'physical', mult: 1.0, crit: 0.5, anim: 'slash', desc: '급소를 노린다. 회심의 일격이 나오기 쉽다. (회심은 방어를 무시)' },
  numb_needle: { name: '마비침', kind: 'skill', mp: 3, target: 'enemy', type: 'physical', mult: 0.7, status: { paralyze: 0.5 }, anim: 'slash', desc: '마비 독침을 던진다. 확률로 마비.' },

  mug: { name: '강탈', kind: 'skill', mp: 2, target: 'enemy', type: 'physical', mult: 1.0, steal: true, anim: 'steal', desc: '공격하면서 물건을 훔친다.' },
  shadow_step: { name: '그림자 걸음', kind: 'skill', mp: 4, target: 'self', type: 'buff', buff: { spd: 1.5, eva: 1.45 }, turns: 4, priority: true, anim: 'buff', desc: '그림자에 녹아든다. 민첩과 회피율이 크게 오른다. (4턴)' },
  poison_cloud: { name: '독안개', kind: 'skill', mp: 6, target: 'enemies', type: 'status', status: { poison: 0.65 }, anim: 'mist', desc: '독안개를 퍼뜨려 적 전체를 중독시킨다. (확률)' },
  assassinate: { name: '암살', kind: 'skill', mp: 8, target: 'enemy', type: 'physical', mult: 1.6, crit: 0.45, anim: 'slash', desc: '그림자에서 급소를 꿰뚫는다. 강력하고 회심이 나오기 쉽다.' },

  // ── 적 기술 ──
  tackle: { name: '몸통박치기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.25, hit: -0.05, msg: '{A|이} 몸을 날려 부딪쳐 왔다!' },
  spore: { name: '독포자', kind: 'enemy', target: 'enemies', type: 'status', status: { poison: 0.4 }, anim: 'mist', msg: '{A|이} 독포자를 흩뿌렸다!' },
  peck: { name: '쪼기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 0.9, debuff: { def: 0.8, chance: 0.35, turns: 3 }, msg: '{A|이} 날카로운 부리로 쪼았다!' },
  bind: { name: '휘감기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 0.85, status: { paralyze: 0.3 }, msg: '{A|이} 덩굴로 휘감았다!' },
  sleep_powder: { name: '졸음 가루', kind: 'enemy', target: 'enemies', type: 'status', status: { sleep: 0.3 }, anim: 'mist', msg: '{A|이} 달콤한 졸음 가루를 뿌렸다…' },
  pilfer: { name: '소매치기', kind: 'enemy', target: 'enemy', type: 'pilfer', msg: '{A|이} 재빠르게 주머니를 노렸다!' },
  dark_bolt: { name: '어둠의 화살', kind: 'enemy', target: 'enemy', type: 'magic', element: 'dark', power: 16, scale: 0.5, anim: 'dark', msg: '{A|이} 어둠의 화살을 쏘았다!' },
  whisper: { name: '침묵의 속삭임', kind: 'enemy', target: 'enemies', type: 'status', status: { silence: 0.35 }, anim: 'dark', msg: '{A|이} 기분 나쁜 속삭임을 흘렸다…' },
  drain_bite: { name: '흡혈', kind: 'enemy', target: 'enemy', type: 'drain', mult: 0.9, msg: '{A|이} 목덜미를 물어 피를 빨았다!' },
  fire_breath: { name: '불꽃 숨결', kind: 'enemy', target: 'enemies', type: 'magic', element: 'fire', power: 12, scale: 0.4, anim: 'fire', msg: '{A|이} 불꽃 숨결을 내뿜었다!' },
  bone_slash: { name: '해골 베기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.3, hit: -0.05, msg: '{A|이} 녹슨 검을 크게 휘둘렀다!' },
  stone_fist: { name: '돌주먹', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.4, hit: -0.1, msg: '{A|이} 돌주먹을 내리꽂았다!' },
  guard_stance: { name: '방어 태세', kind: 'enemy', target: 'self', type: 'buff', buff: { def: 1.5 }, turns: 3, msg: '{A|이} 몸을 웅크려 방어 태세를 갖췄다!' },
  gnaw: { name: '덥석 물기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.5, msg: '{A|이} 뚜껑을 벌려 덥석 물었다!' },
  flee: { name: '도망', kind: 'enemy', target: 'self', type: 'flee', msg: '{A|은} 쏜살같이 도망쳤다!' },
  mush_soup: { name: '버섯 수프', kind: 'enemy', target: 'self', type: 'heal', power: 30, scale: 0, anim: 'heal', msg: '{A|은} 어디선가 버섯 수프를 꺼내 마셨다!' },
  royal_decree: { name: '왕의 칙령', kind: 'enemy', target: 'enemies', type: 'debuff', buff: { atk: 0.8 }, turns: 3, chance: 0.6, anim: 'debuff', msg: '{A|이} "짐 앞에 무릎 꿇어라!" 하고 외쳤다!' },

  // ── 제2장 적 기술 ──
  bite: { name: '물어뜯기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.2, msg: '{A|이} 날카로운 이빨로 물어뜯었다!' },
  howl: { name: '울부짖음', kind: 'enemy', target: 'self', type: 'buff', buff: { atk: 1.3 }, turns: 3, msg: '{A|이} 하늘을 향해 울부짖었다! 공격력이 올랐다!' },
  shell_guard: { name: '껍질 닫기', kind: 'enemy', target: 'self', type: 'buff', buff: { def: 1.8 }, turns: 2, msg: '{A|이} 단단한 껍질 속으로 몸을 숨겼다!' },
  horn_ram: { name: '뿔 들이받기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.5, hit: -0.1, msg: '{A|이} 뿔을 앞세워 들이받았다!' },
  storm_cry: { name: '폭풍의 울음', kind: 'enemy', target: 'enemies', type: 'magic', element: 'thunder', power: 22, scale: 0.4, anim: 'thunder', msg: '{A|이} 날카롭게 울자 번개가 쏟아졌다!' },
  grey_hymn: { name: '잿빛 찬송', kind: 'enemy', target: 'enemies', type: 'magic', element: 'dark', power: 20, scale: 0.4, anim: 'dark', msg: '{A|이} 음울한 찬송가를 불렀다…' },
  hush: { name: '쉿──', kind: 'enemy', target: 'enemy', type: 'status', status: { silence: 0.55 }, anim: 'dark', msg: '{A|이} 손가락을 입술에 댔다. "쉿──"' },
  choir_mend: { name: '위로의 성가', kind: 'enemy', target: 'ally', type: 'heal', power: 60, scale: 0.6, anim: 'heal', msg: '{A|이} 동료를 위해 성가를 불렀다.' },
  dark_wave: { name: '어둠의 물결', kind: 'enemy', target: 'enemies', type: 'magic', element: 'dark', power: 26, scale: 0.45, anim: 'dark', msg: '{A|이} 어둠의 물결을 일으켰다!' },
  plague_bite: { name: '병균 물기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 0.9, status: { poison: 0.45 }, msg: '{A|이} 더러운 이빨로 물었다!' },
  sludge_spit: { name: '오물 뱉기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.0, status: { poison: 0.4 }, debuff: { def: 0.8, chance: 0.3, turns: 3 }, msg: '{A|이} 끈적한 오물을 뱉었다!' },
  tongue_lash: { name: '혀 휘감기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 0.9, status: { paralyze: 0.3 }, msg: '{A|이} 기다란 혀로 휘감았다!' },
  drown_wail: { name: '익사자의 통곡', kind: 'enemy', target: 'enemies', type: 'status', status: { sleep: 0.3, silence: 0.2 }, anim: 'mist', msg: '{A|이} 물속에서 들려오는 듯한 통곡을 흘렸다…' },
  cog_shot: { name: '톱니 발사', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.3, msg: '{A|이} 가슴에서 톱니를 쏘아냈다!' },
  wind_up: { name: '태엽 감기', kind: 'enemy', target: 'self', type: 'buff', buff: { spd: 1.6, atk: 1.2 }, turns: 3, msg: '{A|이} 끼릭끼릭 태엽을 감았다! 움직임이 빨라졌다!' },
  time_slow: { name: '느린 시간', kind: 'enemy', target: 'enemies', type: 'debuff', buff: { spd: 0.6 }, turns: 3, chance: 0.5, anim: 'debuff', msg: '{A|의} 주위로 시간이 끈적하게 늘어졌다…' },
  chrono_bolt: { name: '시간의 화살', kind: 'enemy', target: 'enemy', type: 'magic', element: 'light', power: 34, scale: 0.5, anim: 'light', msg: '{A|이} 째깍이는 빛의 화살을 쏘았다!' },
  sword_arc: { name: '반월 베기', kind: 'enemy', target: 'enemies', type: 'physical', mult: 0.75, anim: 'quake', msg: '{A|이} 검을 크게 휘둘러 반월을 그렸다!' },

  // ── 미니 보스: 베인 · 회색갈기 · 늙은 이빨 · 가웨인 ──
  execution: { name: '처형', kind: 'enemy', target: 'enemy', type: 'physical', mult: 2.0, anim: 'bigslash', msg: '{A|이} 거대한 낫을 {T|에게} 내리찍었다!' },
  mark_doom: { name: '처형 선고', kind: 'enemy', target: 'enemy', type: 'charge', next: 'execution', msg: '{A|이} 낫끝으로 {T|을} 가리켰다. "다음은 네 차례다."', hint: '[y]다음 턴에 처형이 온다! 노려진 동료는 「방어」하거나 감싸자![/]' },
  acolyte_call: { name: '신도 소집', kind: 'enemy', target: 'none', type: 'summon', summon: ['choir_acolyte'], msg: '{A|이} 종을 흔들자 성가대 신도가 나타났다!' },
  pack_call: { name: '무리 부르기', kind: 'enemy', target: 'none', type: 'summon', summon: ['gray_wolf', 'gray_wolf'], msg: '{A|이} 길게 울부짖자 잿빛늑대들이 달려왔다!' },
  rend: { name: '갈기 찢기', kind: 'enemy', target: 'enemies', type: 'physical', mult: 0.8, anim: 'slash', msg: '{A|이} 회오리처럼 몸을 날려 일행을 할퀴었다!' },
  submerge: { name: '잠수', kind: 'enemy', target: 'self', type: 'charge', next: 'death_roll', buffSelf: { def: 2.5 }, msg: '{A|이} 오수 속으로 잠수했다! 수면 아래에서 무언가가 노린다…', hint: '[y]다음 턴에 강력한 공격이 온다! (방어하면 피해 감소)[/]' },
  death_roll: { name: '죽음의 회전', kind: 'enemy', target: 'enemy', type: 'physical', mult: 2.3, anim: 'impact', msg: '{A|이} 튀어 올라 {T|을} 물고 회전했다!' },
  tail_sweep: { name: '꼬리 휩쓸기', kind: 'enemy', target: 'enemies', type: 'physical', mult: 0.85, anim: 'quake', msg: '{A|이} 거대한 꼬리로 휩쓸었다!' },
  murk: { name: '오수 뿜기', kind: 'enemy', target: 'enemies', type: 'debuff', buff: { hit: 0.7 }, turns: 3, chance: 0.6, anim: 'mist', msg: '{A|이} 탁한 오수를 뿜어 시야를 가렸다!' },
  knight_stance: { name: '기사의 자세', kind: 'enemy', target: 'self', type: 'buff', buff: { def: 1.5 }, turns: 2, msg: '{A|이} 방패를 앞세워 자세를 가다듬었다.' },
  heavy_blow: { name: '중단 내려치기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 2.0, anim: 'bigslash', msg: '{A|이} 목검을 높이 들었다가 힘껏 내리쳤다!' },
  ready_blow: { name: '자세 잡기', kind: 'enemy', target: 'enemy', type: 'charge', next: 'heavy_blow', msg: '{A|이} 목검을 머리 위로 높이 들어 올렸다…', hint: '[y]큰 일격이 온다! 「방어」나 「철벽」으로 받아내자![/]' },

  // ── 보스: 카산드라 ──
  call_wisps: { name: '정령 소환', kind: 'enemy', target: 'none', type: 'summon', summon: ['time_wisp', 'time_wisp'], msg: '멈춘 시간의 틈새에서 째깍 정령들이 흘러나왔다!' },
  rewind_charge: { name: '되감기 준비', kind: 'enemy', target: 'none', type: 'charge', next: 'rewind', msg: '{A|이} 시계를 거꾸로 돌리기 시작했다… 째깍, 째깍, 째깍──', hint: '[y]시간을 되감으려 한다! 「침묵」으로 주문을 막을 수 있을지도…![/]' },
  rewind: { name: '시간 되감기', kind: 'enemy', target: 'self', type: 'heal', power: 420, scale: 0, anim: 'heal', msg: '{A|의} 상처가 거꾸로 흐르는 시간 속에서 아물었다!' },
  stop_toll: { name: '정지의 종소리', kind: 'enemy', target: 'enemies', type: 'debuff', buff: { spd: 0.55 }, turns: 3, chance: 0.85, anim: 'wave', msg: '데에엥──. 시간의 종이 울리자 세상이 느려졌다!' },
  shatter_hour: { name: '부서지는 시각', kind: 'enemy', target: 'enemies', type: 'magic', element: 'dark', power: 16, scale: 0.35, anim: 'dark', msg: '{A|이} 시곗바늘을 휘두르자 시간의 파편이 쏟아졌다!' },
  hour_hand: { name: '시침 찌르기', kind: 'enemy', target: 'enemy', type: 'magic', element: 'light', power: 26, scale: 0.4, anim: 'light', msg: '{A|이} 거대한 시침을 {T|에게} 꽂았다!' },

  // ── 보스: 철엄니 ──
  tusk: { name: '엄니 찌르기', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.2, msg: '{A|이} 쇠 같은 엄니로 들이받았다!' },
  paw: { name: '돌진 준비', kind: 'enemy', target: 'enemy', type: 'charge', next: 'rampage', msg: '{A|이} 앞발로 땅을 긁으며 {T|을} 노려본다!', hint: '[y]다음 턴에 강력한 돌진이 온다! (방어하면 피해 감소)[/]' },
  rampage: { name: '맹돌진', kind: 'enemy', target: 'enemy', type: 'physical', mult: 2.2, hit: 0.1, anim: 'impact', msg: '{A|이} 굉음과 함께 {T|에게} 돌진했다!' },
  roar: { name: '포효', kind: 'enemy', target: 'none', type: 'summon', summon: ['thorn_boar', 'thorn_boar'], msg: '{A|이} 숲이 울리도록 포효했다! 가시멧돼지들이 달려온다!' },
  rage: { name: '분노', kind: 'enemy', target: 'self', type: 'buff', buff: { atk: 1.3 }, turns: 99, msg: '{A|의} 눈이 시뻘겋게 타오른다! 공격력이 올랐다!' },

  // ── 보스: 벨가르 ──
  crush: { name: '종지기의 철퇴', kind: 'enemy', target: 'enemy', type: 'physical', mult: 1.25, anim: 'impact', msg: '{A|이} 거대한 철퇴를 내리쳤다!' },
  toll_charge: { name: '종 울릴 준비', kind: 'enemy', target: 'none', type: 'charge', next: 'resonance', msg: '{A|이} 철퇴를 높이 들어 등 뒤의 거대한 종을 겨눈다…', hint: '[y]공기가 떨린다! 다음 턴에 강력한 전체 공격이 온다! (방어하면 피해 감소)[/]' },
  resonance: { name: '공명파', kind: 'enemy', target: 'enemies', type: 'magic', element: null, power: 26, scale: 0.4, status: { paralyze: 0.2 }, anim: 'wave', msg: '데에엥──! 거대한 종소리가 공명파가 되어 휩쓸었다!' },
  stone_guard: { name: '돌의 수호', kind: 'enemy', target: 'self', type: 'buff', buff: { def: 1.4 }, turns: 3, msg: '{A|의} 몸이 단단한 바위처럼 굳었다!' },
  dark_pulse: { name: '어둠의 맥동', kind: 'enemy', target: 'enemies', type: 'magic', element: 'dark', power: 13, scale: 0.3, status: { silence: 0.3 }, anim: 'dark', msg: '검은 수정이 맥동하며 어둠의 파동을 뿜었다!' },
  summon_echo: { name: '그림자 소환', kind: 'enemy', target: 'none', type: 'summon', summon: ['shadow_echo', 'shadow_echo'], msg: '검은 수정에서 그림자 잔향들이 기어 나왔다!' },
  absorb_echo: { name: '그림자 흡수', kind: 'enemy', target: 'none', type: 'absorb', msg: '{A|이} 그림자 잔향을 검은 수정으로 빨아들였다!' },
};
for (const id in SKILLS) SKILLS[id].id = id;
