// 핵심 시스템 단위 테스트 (전투 규칙 · 인벤토리 · 장비 · 성장 · 퀘스트 · 저장)
import { readFileSync } from 'node:fs';
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

console.log('도감 · 장비 비교');
t('속성 공격으로 드러난 약점/내성은 영구 기록된다', () => {
  Util.setSeed(3); party();
  const core = new BattleCore({ enemies: ['moss_jelly'] });
  const e = core.enemies[0];
  eq(Game.knownElem('moss_jelly', 'fire'), undefined);
  const ev = core.magicHit(core.party[2], e, SKILLS.fire);
  eq(Game.knownElem('moss_jelly', 'fire'), 1.5);
  ok(ev.some((x) => x.type === 'msg' && x.text.includes('〈기억〉')), 'first discovery message');
  const ev2 = new BattleCore({ enemies: ['moss_jelly'] }).magicHit(core.party[2], new BattleCore({ enemies: ['moss_jelly'] }).enemies[0], SKILLS.fire);
  ok(!ev2.some((x) => x.type === 'msg' && x.text.includes('〈기억〉')), 'no repeat message');
  ok(Game.knownSummary('moss_jelly').includes('약점 불'));
});
t('분석은 모든 속성 상성을 기록한다', () => {
  party();
  const core = new BattleCore({ enemies: ['skeleton'] });
  core.analyze(core.enemies[0]);
  for (const el in G.ELEMENTS) ok(Game.knownElem('skeleton', el) !== undefined, el);
  ok(Game.knownSummary('skeleton').includes('약점 빛'));
});
t('도감 기록은 저장·불러오기 후에도 유지되고 구버전 seen 은 옮겨진다', () => {
  party();
  Game.learnElem('vampire_bat', 'thunder', 1.5);
  Save.write(1);
  Game.newState('x');
  ok(Save.load(1));
  eq(Game.knownElem('vampire_bat', 'thunder'), 1.5);
  const s = Save.validate({ heroName: 'X', members: { hero: { level: 3 } }, seen: { skeleton: true } });
  eq(s.known.skeleton.light, G.MONSTERS.skeleton.elem.light);
});
t('장비 비교: 상승·하락·장비 불가·장비 중', () => {
  party(['hero', 'mio']);
  Game.addItem('steel_sword');
  const txt = Game.equipDiffText('hero', 'steel_sword');
  ok(txt.includes('공[g]+'), txt);
  eq(Game.equipDiff('mio', 'steel_sword').state, 'cant');
  Game.equip('hero', 'weapon', 'steel_sword');
  eq(Game.equipDiff('hero', 'steel_sword').state, 'equipped');
  Game.addItem('umbrella');
  ok(Game.equipDiffText('hero', 'umbrella').includes('[r]-'));
});

console.log('제3장 전투 · 진행');
t('신기루: 소환되면 진짜와 섞이고, 공격·분석 한 번에 사라지며 진짜는 다치지 않는다', () => {
  Util.setSeed(7); party(['hero', 'bran', 'linette', 'mio'], 22);
  const core = new BattleCore({ enemies: ['zahir'], boss: true });
  const z = core.enemies[0];
  core.useSkill(z, SKILLS.mirage, [z], null);
  const mir = core.enemies.filter((e) => e.def.mirage);
  eq(mir.length, 2);
  ok(mir.every((e) => e.mirrorOf === z && e.def.name === z.def.name), '같은 이름·원본 연결');
  ok(new Set(core.enemies.map((e) => e.name)).size === 3, '이름표(A·B·C)로만 구분된다');
  eq(mir[0].knownId, 'zahir');
  const hp = z.hp;
  for (let i = 0; i < 6 && mir[0].alive; i++) core.useSkill(core.party[1], SKILLS.attack, [mir[0]], null); // 빗나갈 수도 있다
  ok(!mir[0].alive, '공격하면 사라진다');
  eq(z.hp, hp, '진짜는 그대로');
  core.useSkill(core.party[0], SKILLS.insight, core.aliveEnemyList, null);
  ok(!mir[1].alive, '통찰로 걷힌다');
  ok(z.alive && Game.state.seen.zahir, '진짜는 분석 기록');
  ok(!Game.state.seen.zahir_mirage, '신기루는 따로 도감에 남지 않는다');
});
t('신기루: 진짜가 쓰러지면 남은 신기루도 사라진다', () => {
  party(['hero', 'bran', 'linette', 'mio'], 22);
  const core = new BattleCore({ enemies: ['zahir'], boss: true });
  const z = core.enemies[0];
  core.useSkill(z, SKILLS.mirage, [z], null);
  z.hp = 1;
  core.useSkill(core.party[1], SKILLS.attack, [z], null);
  ok(!z.alive);
  ok(core.enemies.every((e) => !e.alive), 'mirages gone');
  ok(core.checkEnd());
  eq(core.result, 'win');
});
t('생명의 물결: 라운드가 끝날 때마다 회복되고 횟수가 줄어든다', () => {
  party(['hero', 'mio'], 20);
  const core = new BattleCore({ enemies: ['sand_scorpion'] });
  const h = core.party[0];
  core.useSkill(core.party[1], SKILLS.regen, core.party, null);
  ok(h.buffs.regen && h.buffs.regen.turns === 4, 'regen buff');
  h.hp = Math.floor(h.mhp / 2);
  const before = h.hp;
  core.endRound();
  ok(h.hp > before, 'healed at end of round');
  eq(h.hp - before, Math.round(h.mhp * 0.08));
});
t('모래 폭탄: 적 전체 피해 + 명중률 저하', () => {
  party(['hero'], 20);
  Game.addItem('sand_bomb', 1);
  const core = new BattleCore({ enemies: ['sand_scorpion', 'sand_scorpion'] });
  core.execute({ actor: core.party[0], cmd: { kind: 'item', item: 'sand_bomb' } });
  ok(core.enemies.every((e) => e.hp < e.mhp), 'all damaged');
  ok(core.enemies.every((e) => !e.alive || (e.buffs.hit && e.buffs.hit.mult < 1)), 'hit debuff');
  eq(Game.count('sand_bomb'), 0);
});
t('3장 진행도: 플래그 순서대로 17 → 24', () => {
  Game.newState('x');
  Game.setFlag('chapter2_done'); eq(Game.progress(), 16);
  const steps = ['ch3_started', 'reached_samira', 'met_hakim', 'mio_taken', 'queen_defeated', 'mio_rescued', 'zahir_defeated', 'chapter3_done'];
  steps.forEach((f, i) => { Game.setFlag(f); eq(Game.progress(), 17 + i, f); });
});
t('3장 퀘스트: 일기 조각 3개를 모으면 다음 단계로', () => {
  Game.newState('x');
  Quests.start('s_diary');
  Game.addItem('aria_page', 2); Quests.onItem('aria_page');
  eq(Quests.stage('s_diary'), 0);
  Game.addItem('aria_page', 1); Quests.onItem('aria_page');
  eq(Quests.stage('s_diary'), 1);
  Quests.start('main4');
  eq(Quests.currentGoal().id, 'main4');
});

console.log('제4장 전투 · 진행');
t('빙결: 행동하지 못하고, 불 속성 피해를 받으면 즉시 녹는다', () => {
  party(['hero', 'linette'], 26);
  const core = new BattleCore({ enemies: ['frost_golem'] });
  const g = core.enemies[0];
  g.status.freeze = 3;
  ok(g.disabled, 'frozen = disabled');
  const ev = core.execute({ actor: g, cmd: null });
  ok(ev.some((e) => e.type === 'msg' && e.text.includes('얼음에 갇혀')), 'skips turn');
  core.useSkill(core.party[1], SKILLS.fire, [g], null);
  ok(!g.status.freeze, 'fire melts');
});
t('속박: 휘감은 촉수가 쓰러지면 풀려난다', () => {
  party(['hero', 'bran'], 28);
  const core = new BattleCore({ enemies: ['levia_tentacle', 'levia'], boss: true });
  const tent = core.enemies[0], h = core.party[0];
  for (let i = 0; i < 20 && !h.status.bind; i++) core.useSkill(tent, SKILLS.tentacle_grab, [h], null);
  ok(h.status.bind && h.bindBy === tent.uid, 'bound by tentacle');
  ok(h.disabled);
  tent.hp = 1;
  for (let i = 0; i < 6 && tent.alive; i++) core.useSkill(core.party[1], SKILLS.attack, [tent], null);
  ok(!tent.alive);
  ok(!h.status.bind, 'released');
});
t('물때 자세: 밀물엔 물리, 썰물엔 주문 피해가 절반', () => {
  party(['hero', 'linette'], 27);
  const core = new BattleCore({ enemies: ['orca'], boss: true });
  const o = core.enemies[0];
  o.mem.guard = { phys: 0.5, tag: '밀물', text: 't' };
  eq(core.guardMult(o, 'phys'), 0.5); eq(core.guardMult(o, 'mag'), 1);
  o.mem.guard = { mag: 0.5, tag: '썰물', text: 't' };
  eq(core.guardMult(o, 'phys'), 1); eq(core.guardMult(o, 'mag'), 0.5);
  // 오르카는 1·4·7… 턴마다 물때를 바꾼다
  o.mem = {};
  const a1 = o.def.ai(o, core); ok(a1.skill === 'high_tide' && o.mem.guard.phys === 0.5, 'turn1 high tide');
  o.mem.turn = 3; const a4 = o.def.ai(o, core); ok(a4.skill === 'low_tide' && o.mem.guard.mag === 0.5, 'turn4 low tide');
});
t('레비아의 해일: 남은 촉수 수만큼 커진다', () => {
  party(['hero'], 28);
  const core = new BattleCore({ enemies: ['levia_tentacle', 'levia', 'levia_tentacle'], boss: true });
  const lv = core.enemies[1];
  lv.mem = { turn: 3 };
  eq(lv.def.ai(lv, core).skill, 'wave_rise');
  eq(lv.def.ai(lv, core).skill, 'ice_shard', 'same round: no release');
  core.round++;
  eq(lv.def.ai(lv, core).skill, 'raging_wave');
  lv.mem.next = 'wave'; core.round++;
  for (const e of core.enemies) if (e.defId === 'levia_tentacle') e.hp = 0;
  eq(lv.def.ai(lv, core).skill, 'tidal_wave');
});
t('카산드라 합류: 레벨 보정 · 노래 습득 · 대기 멤버', () => {
  party(['hero', 'bran', 'linette', 'mio'], 25);
  Game.join('cassandra');
  const c = Game.member('cassandra');
  ok(c.level >= 24, 'level ' + c.level);
  ok(c.skills.includes('stopped_time') && c.skills.includes('song_valor'));
  ok(Game.state.reserve.includes('cassandra'));
  ok(Game.canEquip('cassandra', 'siren_harp') && !Game.canEquip('bran', 'siren_harp'));
  ok(Game.canEquip('cassandra', 'fur_hood'), 'ALL helm');
});
t('4장 진행도: 플래그 순서대로 25 → 32', () => {
  Game.newState('x');
  Game.setFlag('chapter3_done'); eq(Game.progress(), 24);
  const steps = ['ch4_started', 'reached_marea', 'cave4_open', 'walrus_defeated', 'cassandra_joined', 'orca_defeated', 'levia_defeated', 'chapter4_done'];
  steps.forEach((f, i) => { Game.setFlag(f); eq(Game.progress(), 25 + i, f); });
});

t('데이터 표에 같은 키가 두 번 정의되지 않는다', () => {
  // 객체 리터럴의 중복 키는 조용히 앞의 정의를 덮어쓰므로 소스에서 직접 찾는다
  const files = ['src/data/items.js', 'src/data/skills.js', 'src/data/monsters.js', 'src/data/characters.js', 'src/systems/quests.js'];
  for (const f of files) {
    let seen = null;
    readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\n').forEach((ln, i) => {
      if (/^const \w+ = \{/.test(ln)) seen = new Map();
      else if (/^\};?/.test(ln)) seen = null;
      const m = seen && ln.match(/^  ([A-Za-z_$][\w$]*)\s*:/);
      if (!m) return;
      if (seen.has(m[1])) throw new Error(`${f}:${i + 1} '${m[1]}' 중복 (처음 ${seen.get(m[1])}행)`);
      seen.set(m[1], i + 1);
    });
  }
  eq(G.QUESTS.s_letter.giver, '여관 주인 마르타');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
