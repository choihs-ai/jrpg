// 밸런스 시뮬레이션: 실제 BattleCore로 주요 전투를 수백 번 돌려 승률·턴 수를 확인
import { loadGame } from './load.mjs';
const G = loadGame();
const { Game, BattleCore, SKILLS, MONSTERS, ENCOUNTERS, Util } = G;

function setup(members, level, equip = {}, items = {}) {
  Game.newState('하루');
  for (const id of members) if (id !== 'hero') Game.join(id);
  for (const id of members) {
    const m = Game.state.members[id];
    m.level = level; m.exp = G.expForLevel(level);
    for (let l = 1; l <= level; l++) for (const sk of G.CHARACTERS[id].learn[l] || []) if (!m.skills.includes(sk)) m.skills.push(sk);
    for (const sl in (equip[id] || {})) m.equip[sl] = equip[id][sl];
  }
  Game.state.inv = Object.assign({}, items);
  Game.healAll();
}

// 플레이어 정책: 회복 → 예고된 강공 방어 → 약점 주문 → 강한 특기 → 공격
let NAIVE = false;
function policy(core, a) {
  const st = Game.state.members[a.id];
  if (NAIVE) {
    const low = core.alivePartyList.filter((x) => x.hp / x.mhp < 0.35);
    if (low.length && st.skills.includes('heal') && a.mp >= 3) return { kind: 'skill', skill: 'heal', target: low[0] };
    return { kind: 'attack', target: core.aliveEnemyList[0] };
  }
  const foes = core.aliveEnemyList;
  const allies = core.alivePartyList;
  const has = (s) => st.skills.includes(s) && (SKILLS[s].mp || 0) <= a.mp;
  const charging = foes.find((e) => e.charging);
  const low = allies.filter((x) => x.hp / x.mhp < 0.45).sort((x, y) => x.hp / x.mhp - y.hp / y.mhp);
  const dead = core.party.filter((x) => !x.alive);
  if (dead.length && has('revive')) return { kind: 'skill', skill: 'revive', target: dead[0] };
  // 4장: 얼거나 붙잡힌 동료 풀어 주기
  const stuck = allies.find((x) => x.status.freeze || (x.status.bind && x.status.bind > 1));
  if (stuck && a.id === 'mio' && has('chime_cleanse') && allies.filter((x) => x.status.freeze || x.status.bind).length >= 2) return { kind: 'skill', skill: 'chime_cleanse' };
  if (stuck && a.id === 'mio' && has('cure')) return { kind: 'skill', skill: 'cure', target: stuck };
  if (stuck && stuck.status.freeze && Game.count('warm_soup') && a.id !== 'linette') return { kind: 'item', item: 'warm_soup', target: stuck };
  // 카산드라: 보스전에서는 노래로 받쳐 준다
  if (a.id === 'cassandra') {
    if (low.length >= 2 && has('song_solace')) return { kind: 'skill', skill: 'song_solace' };
    if (core.boss && has('song_valor') && !allies.some((x) => x.buffs.mag && x.buffs.mag.mult > 1)) return { kind: 'skill', skill: 'song_valor' };
    if (core.boss && has('song_ward') && !allies.some((x) => x.buffs.regen)) return { kind: 'skill', skill: 'song_ward' };
    if (core.boss && has('stopped_time') && !foes.some((x) => x.buffs.spd)) return { kind: 'skill', skill: 'stopped_time' };
    if (has('dirge') && (foes.length >= 2 || core.boss)) return { kind: 'skill', skill: 'dirge' };
  }
  // 3장: 신기루는 통찰로 걷어낸다
  if (a.id === 'hero' && has('insight') && foes.some((e) => e.def.mirage)) return { kind: 'skill', skill: 'insight' };
  if (low.length >= 2 && has('mother_song')) return { kind: 'skill', skill: 'mother_song' };
  if (dead.length && Game.count('feather') && a.id !== 'bran') { return { kind: 'item', item: 'feather', target: dead[0] }; }
  if (low.length >= 2 && has('heal_all')) return { kind: 'skill', skill: 'heal_all' };
  if (low.length && has('heal_more') && (a.id === 'mio' || (a.id === 'hero' && low[0].hp / low[0].mhp < 0.3))) return { kind: 'skill', skill: 'heal_more', target: low[0] };
  if (low.length && has('heal') && (a.id === 'mio' || a.id === 'hero' && !allies.some((x) => x.id === 'mio' && x.mp >= 3))) return { kind: 'skill', skill: 'heal', target: low[0] };
  if (low.length && low[0] === a && Game.count('potion')) return { kind: 'item', item: 'potion', target: a };
  if (low.length && low[0] === a && Game.count('herb') && a.hp / a.mhp < 0.3) return { kind: 'item', item: 'herb', target: a };
  const rew = foes.find((e) => e.charging === 'rewind' && !e.status.silence);
  if (rew && has('seal')) return { kind: 'skill', skill: 'seal', target: rew };
  if (charging && ['execution', 'death_roll', 'heavy_blow'].includes(charging.charging) && (charging.mem.mark === a || core.party.length === 1)) return { kind: 'defend' };
  if (charging) {
    // 전체 공격이 예고되면 약한 동료는 방어, 단일 강공이면 노려진 대상이 방어
    if (charging.charging === 'resonance' && (a.mhp < 70 || a.hp / a.mhp < 0.6)) return { kind: 'defend' };
    if (charging.charging === 'rampage' && charging.mem.markTarget === a) return { kind: 'defend' };
  }
  if (a.id === 'bran' && charging && charging.charging === 'rampage' && has('cover') && charging.mem.markTarget !== a) return { kind: 'skill', skill: 'cover', target: charging.mem.markTarget };
  if (charging && ['queen_strike', 'tusk_crush', 'anchor_crash'].includes(charging.charging) && charging.mem.mark === a) return { kind: 'defend' };
  if (charging && charging.charging === 'falling_sand' && (a.mhp < 420 || a.hp / a.mhp < 0.6)) return { kind: 'defend' };
  if (charging && charging.charging === 'tidal_wave' && a.hp / a.mhp < 0.5) return { kind: 'defend' };
  if (a.id === 'mio' && has('regen') && core.boss && !allies.some((x) => x.buffs.regen) && core.round % 4 === 2) return { kind: 'skill', skill: 'regen' };
  if (a.id === 'mio' && has('protect') && core.boss && !allies.some((x) => x.buffs.def) && core.round % 4 === 1) return { kind: 'skill', skill: 'protect' };
  if (a.id === 'bran' && has('warcry') && core.boss && !allies.some((x) => x.buffs.atk) ) return { kind: 'skill', skill: 'warcry' };
  // 약점 공격 (물때 자세로 막히는 쪽은 피한다)
  const guardOf = (f) => (f.mem && f.mem.guard) || {};
  const spells = st.skills.filter((s) => has(s) && SKILLS[s].type === 'magic');
  let best = null, bestDmg = 0;
  for (const s of spells) {
    const sk = SKILLS[s];
    for (const t of sk.target === 'enemies' ? [foes[0]] : foes) {
      const n = sk.target === 'enemies' ? foes.reduce((acc, f) => acc + f.elemMult(sk.element) * core.barrierMult(f), 0) : t.elemMult(sk.element) * core.barrierMult(t);
      const dmg = (sk.power + a.mag * sk.scale) * n * (guardOf(t || foes[0]).mag || 1);
      if (dmg > bestDmg) { bestDmg = dmg; best = { kind: 'skill', skill: s, target: sk.target === 'enemies' ? null : t }; }
    }
  }
  const physAtk = (a.atk * a.atk) / (a.atk + foes[0].defense) * (guardOf(foes[0]).phys || 1);
  if (best && (bestDmg > physAtk * 1.1 || a.id === 'linette' || a.id === 'mio')) {
    if (a.id !== 'mio' || core.boss || bestDmg > physAtk * 1.5) return best;
  }
  if (a.id === 'mio' && !core.boss) return { kind: 'attack', target: foes[0] };
  // 4장: 동료를 휘감은 촉수를 먼저 끊는다
  const holder = (() => { const v = allies.find((x) => x.status.bind && x.bindBy); return v && foes.find((f) => f.uid === v.bindBy); })();
  if (holder && a.atk > a.mag) return has('bash') ? { kind: 'skill', skill: 'bash', target: holder } : { kind: 'attack', target: holder };
  const bossT = foes.find((f) => f.defId === 'clock_guardian') || foes.find((f) => f.def.boss) || foes[0];
  if (core.party.length === 1 && a.hp / a.mhp < 0.4 && (Game.count('hi_potion') || Game.count('potion'))) return { kind: 'item', item: Game.count('hi_potion') ? 'hi_potion' : 'potion', target: a };
  if (has('stellar_blade') && core.boss) return { kind: 'skill', skill: 'stellar_blade', target: bossT };
  if (has('meteor_slash') && core.boss) return { kind: 'skill', skill: 'meteor_slash', target: bossT };
  if (has('axe_storm') && foes.length >= 3) return { kind: 'skill', skill: 'axe_storm' };
  if (has('unbroken') && core.boss && !a.buffs.atk) return { kind: 'skill', skill: 'unbroken' };
  if (has('death_mark') && core.boss) return { kind: 'skill', skill: 'death_mark', target: bossT };
  if (has('star_slash') && core.boss) return { kind: 'skill', skill: 'star_slash', target: bossT };
  if (has('bash') && core.boss) return { kind: 'skill', skill: 'bash', target: bossT };
  if (has('quake') && foes.length >= 3) return { kind: 'skill', skill: 'quake' };
  // 결계를 만드는 수호자 > 졸개 우선
  const target = foes.find((f) => f.defId === 'clock_guardian') || foes.slice().sort((x, y) => x.hp - y.hp)[0];
  return { kind: 'attack', target };
}

function fight(enemies, opts = {}) {
  const core = new BattleCore({ enemies, boss: opts.boss, party: opts.party });
  let rounds = 0;
  while (!core.result && rounds < 60) {
    const cmds = new Map();
    for (const a of core.party) if (a.alive && !a.disabled) cmds.set(a, policy(core, a));
    const order = core.buildOrder(cmds);
    for (const e of order) { if (core.result) break; core.execute(e); if (core.checkEnd()) break; }
    if (!core.result) core.endRound();
    rounds++;
  }
  const hpLeft = core.party.reduce((n, a) => n + a.hp, 0) / core.party.reduce((n, a) => n + a.mhp, 0);
  const deaths = core.party.filter((a) => !a.alive).length;
  return { win: core.result === 'win', rounds, hpLeft, deaths, exp: core.killed.reduce((n, e) => n + e.def.exp, 0) };
}

const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; // 예: ONLY=오르카 node tests/sim-balance.mjs
function run(label, n, setupFn, enemiesFn, opts) {
  if (ONLY && !ONLY.test(label)) return 0;
  let wins = 0, rounds = 0, hp = 0, deaths = 0;
  for (let i = 0; i < n; i++) {
    setupFn();
    const r = fight(enemiesFn(), opts);
    if (r.win) wins++;
    rounds += r.rounds; hp += r.hpLeft; deaths += r.deaths;
  }
  console.log(`${label.padEnd(44)} win ${(wins / n * 100).toFixed(0).padStart(3)}%  rounds ${(rounds / n).toFixed(1).padStart(4)}  hpLeft ${(hp / n * 100).toFixed(0).padStart(3)}%  deaths ${(deaths / n).toFixed(2)}`);
  return wins / n;
}
const encounter = (zone) => () => Util.weighted(ENCOUNTERS[zone].groups).e;

const E_START = { hero: { weapon: 'umbrella', armor: 'hoodie' }, bran: { weapon: 'club', armor: 'leather_armor', shield: 'pot_lid' } };
const E_EARLY = { hero: { weapon: 'copper_sword', armor: 'leather_armor', shield: 'wood_shield', helm: 'leather_hat' }, bran: { weapon: 'copper_sword', armor: 'leather_armor', shield: 'wood_shield', helm: 'leather_hat' }, linette: { weapon: 'oak_staff', armor: 'mage_robe', helm: 'wizard_hat' } };
const E_MID = {
  hero: { weapon: 'steel_sword', armor: 'chain_mail', shield: 'iron_shield', helm: 'leather_hat' },
  bran: { weapon: 'iron_axe', armor: 'chain_mail', shield: 'leather_shield', helm: 'iron_helm' },
  linette: { weapon: 'spellbook', armor: 'mage_robe', helm: 'wizard_hat' },
  mio: { weapon: 'oak_staff', armor: 'vestment', helm: 'leather_hat' },
};
const E_LATE = {
  hero: { weapon: 'steel_sword', armor: 'chain_mail', shield: 'iron_shield', helm: 'iron_helm', accessory: 'guard_pendant' },
  bran: { weapon: 'iron_axe', armor: 'chain_mail', shield: 'iron_shield', helm: 'iron_helm' },
  linette: { weapon: 'spellbook', armor: 'mage_robe', helm: 'wizard_hat', accessory: 'sage_earring' },
  mio: { weapon: 'blessed_staff', armor: 'vestment', helm: 'wizard_hat' },
};
const N = +(process.env.N || 300);
console.log('── EXP 곡선 ──');
for (const L of [2, 3, 4, 5, 6, 7, 8, 9, 10]) process.stdout.write(`Lv${L}:${G.expForLevel(L)}  `);
console.log('\n── 평원 (남쪽) ──');
run('Lv1 hero+bran start gear', N, () => setup(['hero', 'bran'], 1, E_START, { herb: 4 }), encounter('plains'));
run('Lv2 hero+bran start gear', N, () => setup(['hero', 'bran'], 2, E_START, { herb: 4 }), encounter('plains'));
run('Lv3 hero+bran early gear', N, () => setup(['hero', 'bran'], 3, E_EARLY, { herb: 4 }), encounter('plains'));
console.log('── 숲 (북쪽·동쪽) ──');
run('Lv3 hero+bran start gear', N, () => setup(['hero', 'bran'], 3, E_START, { herb: 4 }), encounter('forest'));
run('Lv3 hero+bran early gear', N, () => setup(['hero', 'bran'], 3, E_EARLY, { herb: 4 }), encounter('forest'));
run('Lv4 hero+bran early gear', N, () => setup(['hero', 'bran'], 4, E_EARLY, { herb: 4 }), encounter('forest'));
console.log('── 철엄니 ──');
run('Lv3 hero+bran+linette early', N, () => setup(['hero', 'bran', 'linette'], 3, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
run('Lv4 hero+bran+linette early', N, () => setup(['hero', 'bran', 'linette'], 4, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
run('Lv5 hero+bran+linette early', N, () => setup(['hero', 'bran', 'linette'], 5, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
run('Lv6 hero+bran+linette early', N, () => setup(['hero', 'bran', 'linette'], 6, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
console.log('── 버섯왕 ──');
run('Lv4 hero+bran early', N, () => setup(['hero', 'bran'], 4, E_EARLY, { herb: 4 }), () => ['king_mush', 'toxic_shroom', 'toxic_shroom'], { boss: true });
console.log('── 유적 ──');
run('Lv5 4인 early gear ruins1', N, () => setup(['hero', 'bran', 'linette', 'mio'], 5, E_EARLY, { herb: 5 }), encounter('ruins1'));
run('Lv6 4인 mid gear ruins1', N, () => setup(['hero', 'bran', 'linette', 'mio'], 6, E_MID, { herb: 5 }), encounter('ruins1'));
run('Lv7 4인 mid gear ruins2', N, () => setup(['hero', 'bran', 'linette', 'mio'], 7, E_MID, { herb: 5 }), encounter('ruins2'));
run('Lv6 4인 mid gear mimic', N, () => setup(['hero', 'bran', 'linette', 'mio'], 6, E_MID, { herb: 5 }), () => ['greed_chest']);
console.log('── 벨가르 ──');
for (const L of [6, 7, 8, 9, 10]) run(`Lv${L} 4인 mid gear velgar`, N, () => setup(['hero', 'bran', 'linette', 'mio'], L, E_MID, { herb: 5, potion: 3, ether: 1 }), () => ['velgar'], { boss: true });
for (const L of [7, 8, 9]) run(`Lv${L} 4인 late gear velgar`, N, () => setup(['hero', 'bran', 'linette', 'mio'], L, E_LATE, { herb: 5, potion: 3, ether: 1, feather: 1 }), () => ['velgar'], { boss: true });
console.log('── 단순 플레이(공격+회복만) ──');
NAIVE = true;
run('NAIVE Lv4 철엄니 early', N, () => setup(['hero', 'bran', 'linette'], 4, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
run('NAIVE Lv5 철엄니 early', N, () => setup(['hero', 'bran', 'linette'], 5, E_EARLY, { herb: 5 }), () => ['ironfang'], { boss: true });
run('NAIVE Lv8 벨가르 late', N, () => setup(['hero', 'bran', 'linette', 'mio'], 8, E_LATE, { herb: 5 }), () => ['velgar'], { boss: true });
run('NAIVE Lv10 벨가르 late', N, () => setup(['hero', 'bran', 'linette', 'mio'], 10, E_LATE, { herb: 5 }), () => ['velgar'], { boss: true });
run('NAIVE Lv6 ruins1 mid', N, () => setup(['hero', 'bran', 'linette', 'mio'], 6, E_MID, { herb: 5 }), encounter('ruins1'));
NAIVE = false;
// 평균 EXP
const avgExp = (zone) => { let t = 0; for (let i = 0; i < 2000; i++) t += Util.weighted(ENCOUNTERS[zone].groups).e.reduce((n, e) => n + MONSTERS[e].exp, 0); return (t / 2000).toFixed(1); };
const avgGold = (zone) => { let t = 0; for (let i = 0; i < 2000; i++) t += Util.weighted(ENCOUNTERS[zone].groups).e.reduce((n, e) => n + MONSTERS[e].gold, 0); return (t / 2000).toFixed(1); };
console.log('── 평균 보상 (EXP / G per battle) ──');
for (const z of ['plains', 'forest', 'pass', 'ruins1', 'ruins2', 'cellar']) console.log(`${z.padEnd(8)} ${avgExp(z)} EXP  ${avgGold(z)} G`);

// ════════ 제2장 ════════
const E_CH2 = {
  hero: { weapon: 'steel_sword', armor: 'chain_mail', shield: 'iron_shield', helm: 'iron_helm', accessory: 'courage_token' },
  bran: { weapon: 'dorn_axe', armor: 'chain_mail', shield: 'iron_shield', helm: 'iron_helm' },
  linette: { weapon: 'spellbook', armor: 'sage_robe', helm: 'wizard_hat', accessory: 'sage_earring' },
  mio: { weapon: 'blessed_staff', armor: 'vestment', helm: 'wizard_hat' },
  nell: { weapon: 'venom_dagger', armor: 'shadow_cloak', helm: 'leather_hat' },
};
const E_CH2B = {
  hero: { weapon: 'mythril_sword', armor: 'mythril_mail', shield: 'knight_shield', helm: 'silver_helm', accessory: 'courage_token' },
  bran: { weapon: 'war_axe', armor: 'mythril_mail', shield: 'squire_shield', helm: 'silver_helm' },
  linette: { weapon: 'rune_staff', armor: 'mystic_robe', helm: 'feather_hat', accessory: 'sage_earring' },
  mio: { weapon: 'rune_staff', armor: 'mystic_robe', helm: 'wizard_hat' },
  nell: { weapon: 'silver_dagger', armor: 'night_garb', helm: 'feather_hat' },
};
const P4 = ['hero', 'bran', 'linette', 'mio'];
const POT = { potion: 5, hi_potion: 3, ether: 3, feather: 1 };
console.log('\n── 제2장: 은빛 가도 ──');
run('Lv11 4인 ch1 gear highway', N, () => setup(P4, 11, E_CH2, POT), encounter('highway'));
run('Lv12 4인 ch1 gear highway_wood', N, () => setup(P4, 12, E_CH2, POT), encounter('highway_wood'));
for (const L of [11, 12, 13]) run(`Lv${L} 4인 ch1 gear 베인`, N, () => setup(P4, L, E_CH2, POT), () => ['choir_acolyte', 'vane', 'choir_acolyte'], { boss: true });
for (const L of [13, 14]) run(`Lv${L} 4인 ch2 gear 회색갈기`, N, () => setup(P4, L, E_CH2B, POT), () => ['greymane'], { boss: true });
console.log('── 입단 시험 (브란 혼자) ──');
for (const L of [12, 13, 14]) run(`Lv${L} bran solo ch1 gear 가웨인`, N, () => setup(P4, L, E_CH2, { potion: 5, hi_potion: 2 }), () => ['gawain'], { boss: true, party: ['bran'] });
run('Lv13 bran solo squire 가웨인', N, () => setup(P4, 13, Object.assign({}, E_CH2, { bran: Object.assign({}, E_CH2.bran, { shield: 'squire_shield' }) }), { potion: 5 }), () => ['gawain'], { boss: true, party: ['bran'] });
console.log('── 지하수로 ──');
run('Lv13 4인 ch1 gear sewer', N, () => setup(P4, 13, E_CH2, POT), encounter('sewer'));
run('Lv14 4인 ch2 gear sewer', N, () => setup(P4, 14, E_CH2B, POT), encounter('sewer'));
for (const L of [14, 15, 16]) run(`Lv${L} 4인 ch1 gear 늙은 이빨`, N, () => setup(P4, L, E_CH2, POT), () => ['old_fang'], { boss: true });
for (const L of [14, 15]) run(`Lv${L} 4인 ch2 gear 늙은 이빨`, N, () => setup(P4, L, E_CH2B, POT), () => ['old_fang'], { boss: true });
console.log('── 시계탑 ──');
run('Lv15 4인 ch2 gear tower', N, () => setup(P4, 15, E_CH2B, POT), encounter('tower'));
run('Lv16 4인 ch2 gear tower', N, () => setup(P4, 16, E_CH2B, POT), encounter('tower'));
for (const L of [15, 16, 17, 18]) run(`Lv${L} 4인 ch2 gear 카산드라`, N, () => setup(P4, L, E_CH2B, POT), () => ['clock_guardian', 'cassandra'], { boss: true });
run('Lv17 넬 포함 ch2 gear 카산드라', N, () => setup(['hero', 'nell', 'linette', 'mio'], 17, E_CH2B, POT), () => ['clock_guardian', 'cassandra'], { boss: true });
NAIVE = true;
run('NAIVE Lv13 베인', N, () => setup(P4, 13, E_CH2, POT), () => ['choir_acolyte', 'vane', 'choir_acolyte'], { boss: true });
run('NAIVE Lv16 늙은 이빨', N, () => setup(P4, 16, E_CH2B, POT), () => ['old_fang'], { boss: true });
run('NAIVE Lv18 카산드라', N, () => setup(P4, 18, E_CH2B, POT), () => ['clock_guardian', 'cassandra'], { boss: true });
NAIVE = false;
console.log('── 평균 보상 (2장) ──');
for (const z of ['highway', 'highway_wood', 'sewer', 'tower']) console.log(`${z.padEnd(12)} ${avgExp(z)} EXP  ${avgGold(z)} G`);
for (const L of [10, 12, 14, 16, 18]) process.stdout.write(`Lv${L}:${G.expForLevel(L)}  `);
console.log();

// ════════ 제3장 ════════
const E_CH3 = {
  hero: { weapon: 'flame_saber', armor: 'desert_mail', shield: 'sun_shield', helm: 'desert_helm', accessory: 'courage_token' },
  bran: { weapon: 'sand_axe', armor: 'desert_mail', shield: 'squire_shield', helm: 'desert_helm' },
  linette: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban', accessory: 'sage_earring' },
  mio: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban' },
  nell: { weapon: 'scorpion_dagger', armor: 'sand_garb', helm: 'turban' },
};
const NOMIO = ['hero', 'bran', 'linette', 'nell'];
const POT3 = { potion: 5, hi_potion: 5, mega_potion: 3, ether: 3, hi_ether: 2, feather: 2 };
console.log('\n── 제3장: 협곡 · 사막 ──');
run('Lv17 4인 ch2 gear canyon', N, () => setup(P4, 17, E_CH2B, POT3), encounter('canyon'));
run('Lv18 4인 ch2 gear desert', N, () => setup(P4, 18, E_CH2B, POT3), encounter('desert'));
run('Lv18 4인 ch2 gear 여관 습격', N, () => setup(P4, 18, E_CH2B, POT3), () => ['sand_spirit', 'choir_knight', 'sand_spirit']);
console.log('── 전갈 굴 (미오 없음) ──');
run('Lv18 미오없음 ch2 gear sandcave', N, () => setup(NOMIO, 18, E_CH2B, POT3), encounter('sandcave'));
run('Lv19 미오없음 ch3 gear sandcave', N, () => setup(NOMIO, 19, E_CH3, POT3), encounter('sandcave'));
for (const L of [18, 19, 20, 21]) run(`Lv${L} 미오없음 ch2 gear 전갈 여왕`, N, () => setup(NOMIO, L, E_CH2B, POT3), () => ['scorpion_queen'], { boss: true });
for (const L of [19, 20]) run(`Lv${L} 미오없음 ch3 gear 전갈 여왕`, N, () => setup(NOMIO, L, E_CH3, POT3), () => ['scorpion_queen'], { boss: true });
console.log('── 모래시계 사원 ──');
run('Lv20 미오없음 ch3 gear temple', N, () => setup(NOMIO, 20, E_CH3, POT3), encounter('temple'));
run('Lv20 미오없음 ch3 gear 황금 탐욕상자', N, () => setup(NOMIO, 20, E_CH3, POT3), () => ['cursed_chest']);
for (const L of [20, 21, 22]) run(`Lv${L} 미오없음 ch3 gear 베인(재전)`, N, () => setup(NOMIO, L, E_CH3, POT3), () => ['choir_knight', 'vane2'], { boss: true });
run('Lv21 4인 ch3 gear temple', N, () => setup(P4, 21, E_CH3, POT3), encounter('temple'));
for (const L of [21, 22, 23]) run(`Lv${L} 4인 ch3 gear 자히르`, N, () => setup(P4, L, E_CH3, POT3), () => ['zahir'], { boss: true });
for (const L of [21, 22]) run(`Lv${L} 넬 포함 ch3 gear 자히르`, N, () => setup(['hero', 'nell', 'linette', 'mio'], L, E_CH3, POT3), () => ['zahir'], { boss: true });
NAIVE = true;
run('NAIVE Lv20 전갈 여왕', N, () => setup(NOMIO, 20, E_CH3, POT3), () => ['scorpion_queen'], { boss: true });
run('NAIVE Lv21 베인(재전)', N, () => setup(NOMIO, 21, E_CH3, POT3), () => ['choir_knight', 'vane2'], { boss: true });
run('NAIVE Lv22 자히르', N, () => setup(P4, 22, E_CH3, POT3), () => ['zahir'], { boss: true });
NAIVE = false;
console.log('── 평균 보상 (3장) ──');
for (const z of ['canyon', 'desert', 'sandcave', 'temple']) console.log(`${z.padEnd(12)} ${avgExp(z)} EXP  ${avgGold(z)} G`);
for (const L of [17, 18, 19, 20, 21, 22, 23, 24]) process.stdout.write(`Lv${L}:${G.expForLevel(L)}  `);
console.log();

// ════════ 제4장 ════════
const E_CH4 = {
  hero: { weapon: 'flame_saber', armor: 'whale_mail', shield: 'coral_shield', helm: 'fur_hood', accessory: 'courage_token' },
  bran: { weapon: 'tide_axe', armor: 'whale_mail', shield: 'squire_shield', helm: 'captain_hat' },
  linette: { weapon: 'pearl_staff', armor: 'seafoam_robe', helm: 'fur_hood', accessory: 'sage_earring' },
  mio: { weapon: 'pearl_staff', armor: 'seafoam_robe', helm: 'fur_hood', accessory: 'aria_chime' },
  nell: { weapon: 'coral_dagger', armor: 'sealskin_coat', helm: 'fur_hood' },
  cassandra: { weapon: 'siren_harp', armor: 'seafoam_robe', helm: 'fur_hood' },
};
const POT4 = { hi_potion: 5, mega_potion: 4, hi_ether: 3, feather: 2, warm_soup: 4 };
const P4C = ['hero', 'bran', 'linette', 'cassandra'];
const P4M = ['hero', 'bran', 'mio', 'cassandra'];
console.log('\n── 제4장: 해안 · 해식 동굴 ──');
run('Lv23 4인 ch3 gear coast', N, () => setup(P4, 23, E_CH3, POT4), encounter('coast'));
run('Lv24 4인 ch4 gear icecave', N, () => setup(P4, 24, E_CH4, POT4), encounter('icecave'));
for (const L of [23, 24, 25]) run(`Lv${L} 4인 ch3 gear 서리엄니`, N, () => setup(P4, L, E_CH3, POT4), () => ['frost_walrus'], { boss: true });
for (const L of [23, 24]) run(`Lv${L} 4인 ch4 gear 서리엄니`, N, () => setup(P4, L, E_CH4, POT4), () => ['frost_walrus'], { boss: true });
run('Lv25 4인 ch4 gear 집게왕', N, () => setup(P4, 25, E_CH4, POT4), () => ['king_crab'], { boss: true });
console.log('── 등대 · 유령선 ──');
for (const L of [24, 25, 26]) run(`Lv${L} 4인 ch4 gear 잿빛 불꽃`, N, () => setup(P4, L, E_CH4, POT4), () => ['choir_elite', 'grey_wisp', 'choir_elite'], { boss: true });
run('Lv26 4인 ch4 gear ship', N, () => setup(P4, 26, E_CH4, POT4), encounter('ship'));
run('Lv26 4인 ch4 gear 따개비 탐욕상자', N, () => setup(P4, 26, E_CH4, POT4), () => ['barnacle_chest']);
for (const L of [25, 26, 27]) run(`Lv${L} 4인 ch4 gear 오르카`, N, () => setup(P4, L, E_CH4, POT4), () => ['orca'], { boss: true });
for (const L of [25, 26, 27]) run(`Lv${L} 카산드라 포함 ch4 gear 오르카`, N, () => setup(P4C, L, E_CH4, POT4), () => ['orca'], { boss: true });
for (const L of [25, 26, 27]) run(`Lv${L} 미오+카산드라 ch4 gear 오르카`, N, () => setup(P4M, L, E_CH4, POT4), () => ['orca'], { boss: true });
console.log('── 가라앉은 신전 ──');
run('Lv27 4인 ch4 gear sunken', N, () => setup(P4, 27, E_CH4, POT4), encounter('sunken'));
for (const L of [26, 27, 28, 29]) run(`Lv${L} 4인 ch4 gear 레비아`, N, () => setup(P4, L, E_CH4, POT4), () => ['levia_tentacle', 'levia', 'levia_tentacle'], { boss: true });
for (const L of [27, 28]) run(`Lv${L} 카산드라 포함 ch4 gear 레비아`, N, () => setup(P4C, L, E_CH4, POT4), () => ['levia_tentacle', 'levia', 'levia_tentacle'], { boss: true });
for (const L of [28, 29, 30]) run(`Lv${L} 미오+카산드라 ch4 gear 레비아`, N, () => setup(P4M, L, E_CH4, POT4), () => ['levia_tentacle', 'levia', 'levia_tentacle'], { boss: true });
NAIVE = true;
run('NAIVE Lv24 서리엄니', N, () => setup(P4, 24, E_CH4, POT4), () => ['frost_walrus'], { boss: true });
run('NAIVE Lv27 오르카', N, () => setup(P4, 27, E_CH4, POT4), () => ['orca'], { boss: true });
run('NAIVE Lv28 레비아', N, () => setup(P4, 28, E_CH4, POT4), () => ['levia_tentacle', 'levia', 'levia_tentacle'], { boss: true });
NAIVE = false;
console.log('── 평균 보상 (4장) ──');
for (const z of ['coast', 'icecave', 'ship', 'sunken']) console.log(`${z.padEnd(12)} ${avgExp(z)} EXP  ${avgGold(z)} G`);
for (const L of [24, 25, 26, 27, 28, 29, 30]) process.stdout.write(`Lv${L}:${G.expForLevel(L)}  `);
console.log();
