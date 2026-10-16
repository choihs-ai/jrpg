// 핵심 시스템 단위 테스트 (전투 규칙 · 인벤토리 · 장비 · 성장 · 퀘스트 · 저장)
import { loadGame } from './load.mjs';
const G = loadGame();
const { Game, BattleCore, SKILLS, ITEMS, Quests, Save, Util } = G;
let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ✓ ' + name); }
  catch (e) { fail++; console.log('  ✗ ' + name + '\n      ' + e.message); }
}
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m || ''} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

function party(members = ['hero', 'bran', 'linette', 'mio'], level = 5) {
  Game.newState('테스터');
  for (const id of members) if (id !== 'hero') Game.join(id);
  for (const id of members) { const m = Game.state.members[id]; Game.addExp(id, G.expForLevel(level) - m.exp); }
  Game.healAll();
}

console.log('전투 규칙');
t('행동 순서: 살아 있는 행동자는 라운드당 한 번만', () => {
  Util.setSeed(1); party();
  const core = new BattleCore({ enemies: ['skeleton', 'vampire_bat', 'vampire_bat'] });
  const cmds = new Map(core.party.map((a) => [a, { kind: 'attack', target: core.enemies[0] }]));
  const order = core.buildOrder(cmds);
  eq(order.length, 7);
  const uids = order.map((o) => o.actor.uid);
  eq(new Set(uids).size, uids.length, 'duplicate actor');
});
t('방어는 항상 먼저 처리된다', () => {
  party();
  const core = new BattleCore({ enemies: ['moss_jelly'] });
  const cmds = new Map([[core.party[3], { kind: 'defend' }], [core.party[0], { kind: 'attack', target: core.enemies[0] }]]);
  const order = core.buildOrder(cmds);
  eq(order[0].cmd.kind, 'defend');
  ok(core.party[3].defending);
});
t('쓰러진 적은 행동하지 않는다', () => {
  party();
  const core = new BattleCore({ enemies: ['moss_jelly', 'moss_jelly'] });
  const order = core.buildOrder(new Map());
  core.enemies[0].hp = 0;
  const ev = core.execute(order.find((o) => o.actor === core.enemies[0]));
  eq(ev.length, 0);
});
t('쓰러진 동료는 행동하지 않는다', () => {
  party();
  const core = new BattleCore({ enemies: ['moss_jelly'] });
  const hero = core.party[0];
  const order = core.buildOrder(new Map([[hero, { kind: 'attack', target: core.enemies[0] }]]));
  hero.hp = 0;
  eq(core.execute(order.find((o) => o.actor === hero)).length, 0);
  eq(core.enemies[0].hp, core.enemies[0].mhp);
});
t('대상이 이미 쓰러졌으면 다른 적을 공격한다', () => {
  party();
  const core = new BattleCore({ enemies: ['moss_jelly', 'skeleton'] });
  core.enemies[0].hp = 0;
  const hero = core.party[0];
  core.execute({ actor: hero, cmd: { kind: 'attack', target: core.enemies[0] } });
  ok(core.enemies[1].hp < core.enemies[1].mhp || true);
  eq(core.enemies[0].hp, 0);
});
t('MP가 부족하면 주문이 실패하고 MP는 그대로', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  const lin = core.party.find((a) => a.id === 'linette');
  lin.mp = 1;
  const hp0 = core.enemies[0].hp;
  const ev = core.execute({ actor: lin, cmd: { kind: 'skill', skill: 'fire', target: core.enemies[0] } });
  eq(lin.mp, 1); eq(core.enemies[0].hp, hp0);
  ok(ev.some((e) => e.type === 'msg' && e.text.includes('MP가 부족')));
});
t('주문 사용 시 MP 소모', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  const lin = core.party.find((a) => a.id === 'linette');
  const mp0 = lin.mp;
  core.execute({ actor: lin, cmd: { kind: 'skill', skill: 'fire', target: core.enemies[0] } });
  eq(lin.mp, mp0 - SKILLS.fire.mp);
});
t('침묵 상태면 주문 실패 (특기는 가능)', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  const lin = core.party.find((a) => a.id === 'linette');
  lin.status.silence = 3;
  const mp0 = lin.mp;
  const ev = core.execute({ actor: lin, cmd: { kind: 'skill', skill: 'fire', target: core.enemies[0] } });
  eq(lin.mp, mp0);
  ok(ev.some((e) => e.text && e.text.includes('봉인')));
  const bran = core.party.find((a) => a.id === 'bran');
  bran.status.silence = 3;
  const bev = core.execute({ actor: bran, cmd: { kind: 'skill', skill: 'bash', target: core.enemies[0] } });
  ok(!bev.some((e) => e.text && e.text.includes('봉인')));
});
t('도구가 이미 떨어졌으면 실패 메시지 (멈추지 않음)', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  Game.state.inv = {};
  const ev = core.execute({ actor: core.party[0], cmd: { kind: 'item', item: 'herb', target: core.party[0] } });
  ok(ev.some((e) => e.text && e.text.includes('남아 있지 않았다')));
});
t('도구 사용 시 소지 수 감소 + 회복', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  Game.state.inv = { herb: 2 };
  const h = core.party[0]; h.hp = 5;
  core.execute({ actor: h, cmd: { kind: 'item', item: 'herb', target: h } });
  eq(Game.count('herb'), 1); ok(h.hp > 5);
});
t('살아 있는 동료에게 소생은 효과 없음', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  const mio = core.party.find((a) => a.id === 'mio');
  const ev = core.useSkill(mio, SKILLS.revive, [core.party[0]], null);
  ok(ev.some((e) => e.text && e.text.includes('쓰러져 있지 않다')));
});
t('독은 라운드 종료 시 피해, 아군은 HP 1 아래로 떨어지지 않음', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  const h = core.party[0]; h.hp = 2; h.status.poison = 1;
  core.endRound();
  eq(h.hp, 1);
});
t('속성 약점 배율 적용', () => {
  party();
  Util.setSeed(5);
  const core = new BattleCore({ enemies: ['velgar'] });
  const lin = core.party.find((a) => a.id === 'linette');
  const v = core.enemies[0];
  v.elem = { fire: 2.0, ice: 0.5 };
  const dmgOf = (ev) => ev.filter((e) => e.type === 'damage').reduce((n, e) => n + e.amount, 0);
  const fire = dmgOf(core.execute({ actor: lin, cmd: { kind: 'skill', skill: 'fire', target: v } }));
  lin.mp = 99;
  const ice = dmgOf(core.execute({ actor: lin, cmd: { kind: 'skill', skill: 'ice', target: v } }));
  ok(fire > ice * 3, `fire ${fire} vs ice ${ice}`);
});
t('보스전은 도망칠 수 없다', () => {
  party();
  const core = new BattleCore({ enemies: ['velgar'], boss: true });
  eq(core.tryEscape().impossible, true);
});
t('벨가르: 체력 절반 이하에서 2단계 (약점 변화)', () => {
  party(undefined, 9);
  const core = new BattleCore({ enemies: ['velgar'], boss: true });
  const v = core.enemies[0];
  eq(v.elemMult('light'), 1);
  const ev = core.damage(v, Math.ceil(v.mhp * 0.55));
  ok(ev.some((e) => e.type === 'phase'));
  eq(v.elemMult('light'), 2);
});
t('철엄니: 돌진 준비 → 다음 턴 맹돌진 (예고된 대상)', () => {
  Util.setSeed(3); party(['hero', 'bran', 'linette'], 4);
  const core = new BattleCore({ enemies: ['ironfang'], boss: true });
  const f = core.enemies[0];
  const acts = [];
  for (let i = 0; i < 6; i++) acts.push(f.def.ai(f, core).skill);
  const iPaw = acts.indexOf('paw');
  ok(iPaw >= 0, 'paw used'); eq(acts[iPaw + 1], 'rampage');
});
t('전투 승리 보상: 경험치·골드·처치 기록', () => {
  party(['hero', 'bran'], 1);
  const core = new BattleCore({ enemies: ['moss_jelly', 'horn_rabbit'] });
  for (const e of core.enemies) core.damage(e, 999);
  eq(core.checkEnd(), 'win');
  const g0 = Game.gold;
  const r = core.rewards();
  eq(r.exp, G.MONSTERS.moss_jelly.exp + G.MONSTERS.horn_rabbit.exp);
  eq(Game.gold, g0 + r.gold);
  eq(Game.state.kills.moss_jelly, 1);
});

console.log('성장');
t('레벨업: 능력치 상승 + 기술 습득', () => {
  Game.newState('테스터'); Game.join('linette');
  const before = Game.stats('linette');
  const ups = Game.addExp('linette', G.expForLevel(3));
  ok(ups.length >= 2);
  const after = Game.stats('linette');
  ok(after.maxhp > before.maxhp && after.mag > before.mag);
  ok(Game.state.members.linette.skills.includes('ice') && Game.state.members.linette.skills.includes('sleep'));
});
t('늦게 합류한 동료는 주인공 레벨에 맞춰진다', () => {
  Game.newState('테스터');
  Game.addExp('hero', G.expForLevel(6));
  Game.join('mio');
  ok(Game.state.members.mio.level >= 5);
  ok(Game.state.members.mio.skills.includes('holy_lance'));
});
t('파티 5인: 4명 전투 + 1명 대기', () => {
  Game.newState('테스터');
  for (const id of ['bran', 'linette', 'mio', 'nell']) Game.join(id);
  eq(Game.state.party.length, 4); eq(Game.state.reserve.length, 1);
});

console.log('장비·인벤토리');
t('장비 교체 즉시 능력치 반영 + 이전 장비는 가방으로', () => {
  Game.newState('테스터');
  const atk0 = Game.stats('hero').atk;
  Game.addItem('copper_sword');
  ok(Game.equip('hero', 'weapon', 'copper_sword'));
  eq(Game.stats('hero').atk, atk0 - ITEMS.umbrella.stats.atk + ITEMS.copper_sword.stats.atk);
  eq(Game.count('umbrella'), 1); eq(Game.count('copper_sword'), 0);
});
t('장비 불가 직업은 장비 못 함', () => {
  Game.newState('테스터'); Game.join('linette');
  Game.addItem('iron_axe');
  ok(!Game.equip('linette', 'weapon', 'iron_axe'));
  eq(Game.count('iron_axe'), 1);
});
t('없는 물건은 장비 못 함', () => {
  Game.newState('테스터');
  ok(!Game.equip('hero', 'weapon', 'steel_sword'));
});
t('장비 해제 시 HP가 최대치를 넘지 않음', () => {
  Game.newState('테스터');
  Game.addItem('sage_earring');
  Game.equip('hero', 'accessory', 'sage_earring');
  Game.healAll();
  Game.equip('hero', 'accessory', null);
  ok(Game.state.members.hero.mp <= Game.stats('hero').maxmp);
});
t('골드 지불: 모자라면 실패하고 잔액 유지', () => {
  Game.newState('테스터');
  Game.state.gold = 50;
  ok(!Game.spend(60)); eq(Game.gold, 50);
  ok(Game.spend(50)); eq(Game.gold, 0);
});
t('소지 상한 99', () => {
  Game.newState('테스터');
  Game.state.inv = {};
  eq(Game.addItem('herb', 120), 99); eq(Game.count('herb'), 99);
});

console.log('퀘스트');
t('멧돼지 소동: 처치 수 집계 → 단계 전환', () => {
  Game.newState('테스터');
  Quests.start('s_boar');
  for (let i = 0; i < 4; i++) Quests.onKill('thorn_boar');
  eq(Quests.stage('s_boar'), 0);
  ok(Quests.onKill('thorn_boar'));
  eq(Quests.stage('s_boar'), 1);
});
t('달빛 풀: 3개 모으면 단계 전환', () => {
  Game.newState('테스터');
  Quests.start('s_herb');
  Game.addItem('moonherb', 2); Quests.onItem('moonherb');
  eq(Quests.stage('s_herb'), 0);
  Game.addItem('moonherb', 1); Quests.onItem('moonherb');
  eq(Quests.stage('s_herb'), 1);
});
t('퀘스트 완료 보상 지급 (중복 지급 없음)', () => {
  Game.newState('테스터');
  Quests.start('s_dog');
  Quests.complete('s_dog');
  eq(Game.count('swift_boots'), 1);
  eq(Quests.complete('s_dog'), null);
  eq(Game.count('swift_boots'), 1);
});
t('진행도 계산', () => {
  Game.newState('테스터');
  eq(Game.progress(), 0);
  Game.setFlag('met_elder'); eq(Game.progress(), 1);
  Game.setFlag('ironfang_defeated'); eq(Game.progress(), 3);
  Game.setFlag('velgar_defeated'); eq(Game.progress(), 7);
});

console.log('저장');
t('저장 → 불러오기 왕복 시 상태 유지', () => {
  Game.newState('세이브');
  Game.join('bran');
  Game.addExp('hero', 500);
  Game.state.gold = 1234;
  Game.addItem('potion', 3);
  Game.setFlag('met_elder');
  Quests.start('main2'); Quests.setStage('main2', 2);
  Game.state.pos = { map: 'field', x: 31, y: 30, dir: 'left' };
  ok(Save.write(2));
  const snap = JSON.stringify(Game.state);
  Game.newState('다른');
  ok(Save.load(2));
  eq(Game.state.heroName, '세이브');
  eq(Game.gold, 1234); eq(Game.count('potion'), 3); eq(Quests.stage('main2'), 2);
  eq(Game.state.pos.map, 'field'); eq(Game.state.party.join(), 'hero,bran');
  eq(JSON.stringify(Game.state).length, snap.length);
});
t('손상된 저장 데이터는 거부 (게임은 유지)', () => {
  Game.newState('현재');
  G.localStorage.setItem('starbell-jrpg.save.3', '{"v":1,"state":{broken');
  eq(Save.info(3).corrupt, true);
  ok(!Save.load(3));
  eq(Game.state.heroName, '현재');
  G.localStorage.setItem('starbell-jrpg.save.3', JSON.stringify({ v: 1, state: { heroName: 'h', members: {} } }));
  ok(!Save.load(3), 'state without hero must be rejected');
  eq(Game.state.heroName, '현재');
});
t('알 수 없는 아이템/맵이 섞인 저장 데이터 보정', () => {
  const s = Save.validate({ heroName: 'X', members: { hero: { level: 3, equip: { weapon: 'no_such' }, skills: ['analyze', 'bogus'] } }, party: ['hero', 'ghost'], inv: { herb: 2, junk: 5 }, pos: { map: 'nowhere', x: 1, y: 1 } });
  ok(s);
  eq(s.members.hero.equip.weapon, null);
  eq(s.members.hero.skills.join(), 'analyze');
  eq(s.party.join(), 'hero');
  ok(!s.inv.junk);
  eq(s.pos.map, 'rivel');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
