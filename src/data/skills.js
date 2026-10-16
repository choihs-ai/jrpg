'use strict';
// ─────────────────────────────────────────────────────────────
// 주문(spell) · 특기(skill) · 적 기술(enemy) 데이터
//  target: enemy | enemies | ally | allies | self | deadAlly | allyOther | none
//  type: physical | magic | heal | mp | revive | cure | buff | debuff | status | analyze | steal | cover | drain | flee | pilfer | charge | summon | absorb | damage | full
//  msg: 기술 사용 문장 ({A}=사용자, {T}=대상). 없으면 기본 문장.
// ─────────────────────────────────────────────────────────────
const ELEMENTS = { fire: '불', ice: '얼음', thunder: '번개', light: '빛', dark: '어둠' };
const STATUS_NAMES = { poison: '독', sleep: '수면', paralyze: '마비', silence: '침묵' };
const BUFF_NAMES = { atk: '공격력', def: '방어력', spd: '민첩', hit: '명중률', mag: '마력' };

const SKILLS = {
  attack: { name: '공격', kind: 'basic', target: 'enemy', type: 'physical', mult: 1, anim: 'slash' },

  // ── 주인공 ──
  analyze: { name: '분석', kind: 'skill', mp: 0, target: 'enemy', type: 'analyze', priority: true, anim: 'scan', desc: '이방인의 눈으로 적의 약점과 능력을 꿰뚫어 본다. 가장 먼저 행동한다.' },
  star_slash: { name: '별빛 베기', kind: 'skill', mp: 4, target: 'enemy', type: 'physical', mult: 1.45, element: 'light', anim: 'starslash', desc: '별빛을 두른 일격. 빛 속성 물리 공격.' },
  twin_slash: { name: '연속 베기', kind: 'skill', mp: 5, target: 'enemy', type: 'physical', mult: 0.8, hits: 2, randomTargets: true, anim: 'slash', desc: '눈 깜짝할 새 두 번 벤다. (무작위 대상)' },
  heal: { name: '치유', kind: 'spell', mp: 3, target: 'ally', type: 'heal', power: 28, scale: 0.8, anim: 'heal', field: true, desc: '아군 한 명의 HP를 회복한다.' },
  thunder: { name: '번개', kind: 'spell', mp: 5, target: 'enemy', type: 'magic', element: 'thunder', power: 26, scale: 0.6, anim: 'thunder', desc: '하늘에서 번개를 내리꽂는다. 번개 속성.' },

  // ── 브란 ──
  bash: { name: '강타', kind: 'skill', mp: 2, target: 'enemy', type: 'physical', mult: 1.6, hit: -0.1, anim: 'bigslash', desc: '온 힘을 실어 내려친다. 위력이 크지만 조금 빗나가기 쉽다.' },
  cover: { name: '감싸기', kind: 'skill', mp: 0, target: 'allyOther', type: 'cover', priority: true, anim: 'guard', desc: '이번 턴 동안 동료 한 명이 받을 물리 공격을 대신 맞는다. 가장 먼저 행동한다.' },
  warcry: { name: '함성', kind: 'skill', mp: 3, target: 'allies', type: 'buff', buff: { atk: 1.25 }, turns: 4, anim: 'buff', desc: '우렁찬 함성으로 아군 전체의 공격력을 높인다. (4턴)' },
  quake: { name: '대지 가르기', kind: 'skill', mp: 5, target: 'enemies', type: 'physical', mult: 0.85, anim: 'quake', desc: '도끼로 땅을 갈라 적 전체를 공격한다.' },
  ironwall: { name: '철벽', kind: 'skill', mp: 2, target: 'self', type: 'buff', buff: { def: 2.0 }, turns: 1, taunt: true, priority: true, anim: 'guard', desc: '방패를 굳게 세운다. 이번 턴 방어력이 크게 오르고 적의 공격을 끌어당긴다.' },

  // ── 리네트 ──
  fire: { name: '불꽃', kind: 'spell', mp: 3, target: 'enemy', type: 'magic', element: 'fire', power: 14, scale: 0.7, anim: 'fire', desc: '불덩이를 날린다. 불 속성.' },
  ice: { name: '얼음 화살', kind: 'spell', mp: 3, target: 'enemy', type: 'magic', element: 'ice', power: 14, scale: 0.7, anim: 'ice', desc: '날카로운 얼음 화살을 쏜다. 얼음 속성.' },
  sleep: { name: '잠의 안개', kind: 'spell', mp: 4, target: 'enemies', type: 'status', status: { sleep: 0.6 }, anim: 'mist', desc: '적 전체를 잠재운다. (확률)' },
  slow: { name: '둔화', kind: 'spell', mp: 3, target: 'enemies', type: 'debuff', buff: { spd: 0.6 }, turns: 4, chance: 0.75, anim: 'debuff', desc: '적 전체의 민첩을 떨어뜨린다. (확률)' },
  firestorm: { name: '화염 폭풍', kind: 'spell', mp: 7, target: 'enemies', type: 'magic', element: 'fire', power: 13, scale: 0.55, anim: 'fire', desc: '불길의 소용돌이로 적 전체를 태운다.' },
  seal: { name: '침묵의 봉인', kind: 'spell', mp: 3, target: 'enemy', type: 'status', status: { silence: 0.75 }, anim: 'debuff', desc: '적 하나의 주문을 봉인한다. (확률)' },
  blizzard: { name: '눈보라', kind: 'spell', mp: 9, target: 'enemies', type: 'magic', element: 'ice', power: 18, scale: 0.6, anim: 'ice', desc: '눈보라를 일으켜 적 전체를 얼린다.' },

  // ── 미오 ──
  cure: { name: '정화', kind: 'spell', mp: 2, target: 'ally', type: 'cure', cures: ['poison', 'sleep', 'paralyze', 'silence'], anim: 'heal', field: true, desc: '아군 한 명의 독·수면·마비·침묵을 치료한다.' },
  protect: { name: '수호의 기도', kind: 'spell', mp: 4, target: 'allies', type: 'buff', buff: { def: 1.35 }, turns: 4, anim: 'buff', desc: '아군 전체의 방어력을 높인다. (4턴)' },
  holy_lance: { name: '빛의 창', kind: 'spell', mp: 4, target: 'enemy', type: 'magic', element: 'light', power: 22, scale: 0.7, anim: 'light', desc: '빛의 창을 내리꽂는다. 빛 속성. 언데드와 어둠의 존재에게 강하다.' },
  revive: { name: '소생', kind: 'spell', mp: 10, target: 'deadAlly', type: 'revive', pct: 0.5, anim: 'heal', field: true, desc: '쓰러진 동료를 HP 절반으로 되살린다.' },
  heal_all: { name: '치유의 비', kind: 'spell', mp: 9, target: 'allies', type: 'heal', power: 26, scale: 0.6, anim: 'heal', field: true, desc: '치유의 빛을 비처럼 내려 아군 전체를 회복한다.' },

  // ── 넬 ──
  steal: { name: '훔치기', kind: 'skill', mp: 0, target: 'enemy', type: 'steal', anim: 'steal', desc: '적이 가진 물건을 훔친다. 민첩이 높을수록 성공하기 쉽다.' },
  venom_strike: { name: '독 찌르기', kind: 'skill', mp: 2, target: 'enemy', type: 'physical', mult: 1.0, status: { poison: 0.7 }, anim: 'slash', desc: '독을 바른 칼끝으로 찌른다. 높은 확률로 독.' },
  smoke: { name: '연막탄', kind: 'skill', mp: 3, target: 'enemies', type: 'debuff', buff: { hit: 0.65 }, turns: 3, chance: 1, anim: 'mist', desc: '연막을 터뜨려 적 전체의 명중률을 떨어뜨린다. (3턴)' },
  vital_strike: { name: '급소 찌르기', kind: 'skill', mp: 3, target: 'enemy', type: 'physical', mult: 1.0, crit: 0.5, anim: 'slash', desc: '급소를 노린다. 회심의 일격이 나오기 쉽다. (회심은 방어를 무시)' },
  numb_needle: { name: '마비침', kind: 'skill', mp: 3, target: 'enemy', type: 'physical', mult: 0.7, status: { paralyze: 0.5 }, anim: 'slash', desc: '마비 독침을 던진다. 확률로 마비.' },

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
