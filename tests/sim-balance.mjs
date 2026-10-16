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
  if (dead.length && Game.count('feather') && a.id !== 'bran') { return { kind: 'item', item: 'feather', target: dead[0] }; }
  if (low.length >= 2 && has('heal_all')) return { kind: 'skill', skill: 'heal_all' };
  if (low.length && has('heal') && (a.id === 'mio' || a.id === 'hero' && !allies.some((x) => x.id === 'mio' && x.mp >= 3))) return { kind: 'skill', skill: 'heal', target: low[0] };
  if (low.length && low[0] === a && Game.count('potion')) return { kind: 'item', item: 'potion', target: a };
  if (low.length && low[0] === a && Game.count('herb') && a.hp / a.mhp < 0.3) return { kind: 'item', item: 'herb', target: a };
  if (charging) {
    // 전체 공격이 예고되면 약한 동료는 방어, 단일 강공이면 노려진 대상이 방어
    if (charging.charging === 'resonance' && (a.mhp < 70 || a.hp / a.mhp < 0.6)) return { kind: 'defend' };
    if (charging.charging === 'rampage' && charging.mem.markTarget === a) return { kind: 'defend' };
  }
  if (a.id === 'bran' && charging && charging.charging === 'rampage' && has('cover') && charging.mem.markTarget !== a) return { kind: 'skill', skill: 'cover', target: charging.mem.markTarget };
  if (a.id === 'mio' && has('protect') && core.boss && !allies.some((x) => x.buffs.def) && core.round % 4 === 1) return { kind: 'skill', skill: 'protect' };
  if (a.id === 'bran' && has('warcry') && core.boss && !allies.some((x) => x.buffs.atk) ) return { kind: 'skill', skill: 'warcry' };
  // 약점 공격
  const spells = st.skills.filter((s) => has(s) && SKILLS[s].type === 'magic');
  let best = null, bestDmg = 0;
  for (const s of spells) {
    const sk = SKILLS[s];
    for (const t of sk.target === 'enemies' ? [foes[0]] : foes) {
      const n = sk.target === 'enemies' ? foes.reduce((acc, f) => acc + f.elemMult(sk.element), 0) : t.elemMult(sk.element);
      const dmg = (sk.power + a.mag * sk.scale) * n;
      if (dmg > bestDmg) { bestDmg = dmg; best = { kind: 'skill', skill: s, target: sk.target === 'enemies' ? null : t }; }
    }
  }
  const physAtk = (a.atk * a.atk) / (a.atk + foes[0].defense);
  if (best && (bestDmg > physAtk * 1.1 || a.id === 'linette' || a.id === 'mio')) {
    if (a.id !== 'mio' || core.boss || bestDmg > physAtk * 1.5) return best;
  }
  if (a.id === 'mio' && !core.boss) return { kind: 'attack', target: foes[0] };
  if (has('star_slash') && core.boss) return { kind: 'skill', skill: 'star_slash', target: foes.find((f) => f.def.boss) || foes[0] };
  if (has('bash') && core.boss) return { kind: 'skill', skill: 'bash', target: foes.find((f) => f.def.boss) || foes[0] };
  if (has('quake') && foes.length >= 3) return { kind: 'skill', skill: 'quake' };
  // 졸개 우선
  const target = foes.slice().sort((x, y) => x.hp - y.hp)[0];
  return { kind: 'attack', target };
}

function fight(enemies, opts = {}) {
  const core = new BattleCore({ enemies, boss: opts.boss });
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

function run(label, n, setupFn, enemiesFn, opts) {
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
const N = 300;
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
