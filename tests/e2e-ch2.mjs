// 제2장 E2E 테스트: 제1장 완료 직후 상태에서 시작해 실제 키 입력으로 2장 끝까지 진행 + 저장/불러오기
//  일반 전투는 실제로 싸우고, 보스 직전에는 '수련'을 대신해 레벨을 보정해 테스트 시간을 줄인다.
//  NELL=jail 이면 넬을 감옥에 보낸 경로(왕도 보육원에서 다시 동료가 되는 경로)를 검증한다.
import { launch, sleep, ROOT } from './helpers.mjs';
import { Driver } from './driver.mjs';
import fs from 'fs';
const SHOTS = process.env.SHOTS || ROOT + '/tests/screens/ch2';
fs.mkdirSync(SHOTS, { recursive: true });
const NELL_JAIL = process.env.NELL === 'jail';
const { browser, page, errors } = await launch();
const log = (...a) => console.log(...a);
const d = new Driver(page, process.env.VERBOSE ? log : () => {});
let n = 0;
const shot = async (name) => { await page.screenshot({ path: `${SHOTS}/${String(++n).padStart(2, '0')}_${name}.png` }); };
let failures = 0;
const J = (fn, arg) => d.ev(fn, arg);
const check = async (label, fn) => {
  const r = await d.ev(fn);
  if (r === true) log('  ✓ ' + label); else { failures++; log('  ✗ ' + label + ' → ' + JSON.stringify(r)); }
};
const step = (t) => log('\n▶ ' + t);

// ── 전투 정책: 예고 공격엔 방어, 위급하면 회복, 결계가 있으면 수호자부터, 약점을 찌른다 ──
const SPELL_ELEM = { fire: '업화', ice: '빙창', thunder: '번개 폭풍', light: '빛의 창' };
d.battlePolicy = async (d, s) => {
  if (s.kind !== 'list' || !s.items || s.items[0] !== '공격') return false;
  const info = await J(() => {
    const B = __jr.Battle, core = B.core, a = B.active;
    if (!core || !a) return null;
    const foes = core.aliveEnemyList;
    const charging = foes.find((e) => e.charging);
    const marked = charging && ((charging.mem.mark === a) || (charging.mem.markTarget === a) || ['resonance', 'heavy_blow'].includes(charging.charging) || (charging.charging === 'death_roll' && charging.mem.mark === a));
    const low = core.alivePartyList.filter((x) => x.hp / x.mhp < 0.45);
    const dead = core.party.filter((x) => !x.alive).length;
    const guardian = foes.find((e) => e.defId === 'clock_guardian');
    const rewinding = foes.find((e) => e.charging === 'rewind' && !e.status.silence);
    const boss = foes.find((e) => e.def.boss);
    const target = guardian || foes.find((e) => e.defId === 'choir_acolyte' && boss && boss.defId === 'vane') || boss || foes[0];
    const weak = target ? Object.keys(target.elem).filter((k) => target.elem[k] > 1).sort((x, y) => target.elem[y] - target.elem[x]) : [];
    return {
      id: a.id, mp: a.mp, hp: a.hp / a.mhp, skills: a.ref.skills, silenced: !!a.status.silence,
      defend: !!marked, low: low.length, dead, solo: core.party.length === 1,
      rewinding: !!rewinding, targetId: target ? target.uid : null, weak, boss: !!boss,
      buffDef: core.party.some((p) => p.buffs.def && p !== a), buffAtk: core.party.some((p) => p.buffs.atk),
      items: { hi_potion: __jr.Game.count('hi_potion'), potion: __jr.Game.count('potion') },
    };
  });
  if (!info) return false;
  // 원하는 대상까지 커서를 옮긴 뒤 결정
  const aimAndConfirm = async () => {
    for (let i = 0; i < 6; i++) {
      const t = await J(() => { const tg = __jr.Battle.targeting; return tg ? { all: tg.all, uid: tg.list[tg.index] && tg.list[tg.index].uid, side: tg.side } : null; });
      if (!t || t.all || t.side !== 'enemy' || t.uid === info.targetId) break;
      await d.key('ArrowRight'); await sleep(40);
    }
    await d.key('Enter'); await sleep(80);
  };
  const menu = async (col, name, aim = true) => {
    if (col === 1 && info.silenced) return false;
    await d.pickInList(col); await sleep(120);
    const st = await d.state();
    if (!st.items || st.items[0] === '공격') return false;
    const idx = st.items.findIndex((l) => l === name);
    if (idx < 0) { await d.key('Escape'); await sleep(80); return false; }
    await d.pickInList(idx); await sleep(120);
    if (aim) await aimAndConfirm(); else { await d.key('Enter'); await sleep(80); }
    return true;
  };
  const has = (sk) => info.skills.includes(sk);
  if (info.defend) { await d.pickInList(4); return true; }
  // 일대일 시험: 위급하면 상처약, 아니면 강타
  if (info.solo) {
    if (info.hp < 0.4 && (info.items.hi_potion || info.items.potion)) {
      await d.pickInList(3); await sleep(150);
      const st = await d.state();
      const idx = st.items ? st.items.findIndex((l) => l.includes(info.items.hi_potion ? '고급 상처약' : '상처약')) : -1;
      if (idx >= 0) { await d.pickInList(idx); await sleep(120); await d.key('Enter'); await sleep(80); return true; }
      await d.key('Escape');
    }
    if (info.mp >= 2 && (await menu(2, '강타'))) return true;
    await d.pickInList(0); await sleep(100); await aimAndConfirm();
    return true;
  }
  if (info.dead && has('revive') && info.mp >= 10 && (await menu(1, '소생', false))) return true;
  if (info.low > 1 && has('heal_all') && info.mp >= 9 && (await menu(1, '치유의 비', false))) return true;
  if (info.low > 0 && has('heal_more') && info.mp >= 7 && (info.id === 'mio' || info.id === 'hero') && (await menu(1, '상급 치유', false))) return true;
  if (info.low > 0 && has('heal') && info.mp >= 3 && info.id === 'mio' && (await menu(1, '치유', false))) return true;
  if (info.rewinding && has('seal') && info.mp >= 3 && (await J(() => { __jr.Battle.__aim = 'cassandra'; return true; })) && (await (async () => {
    const tgt = await J(() => __jr.Battle.core.aliveEnemyList.find((e) => e.defId === 'cassandra').uid);
    info.targetId = tgt; return menu(1, '침묵의 봉인');
  })())) return true;
  if (info.boss) {
    if (info.id === 'mio' && !info.buffDef && has('protect') && info.mp >= 4 && (await menu(1, '수호의 기도', false))) return true;
    if (info.id === 'bran' && !info.buffAtk && has('warcry') && info.mp >= 3 && (await menu(2, '함성', false))) return true;
    if (info.id === 'linette') for (const el of info.weak) { const sp = SPELL_ELEM[el]; if (sp && has(sp === '업화' ? 'inferno' : sp === '빙창' ? 'ice_lance' : sp === '번개 폭풍' ? 'thunderstorm' : 'holy_lance') && info.mp >= 10 && (await menu(1, sp))) return true; }
    if (info.id === 'linette' && info.weak.includes('ice') && info.mp >= 3 && (await menu(1, '얼음 화살'))) return true;
    if (info.id === 'hero' && info.weak.includes('thunder') && info.mp >= 5 && (await menu(1, '번개'))) return true;
    if (info.id === 'hero' && info.weak.includes('light') && info.mp >= 9 && has('meteor_slash') && (await menu(2, '유성 베기'))) return true;
    if (info.id === 'mio' && info.weak.includes('light') && info.mp >= 4 && (await menu(1, '빛의 창'))) return true;
    if (info.id === 'bran' && info.mp >= 2 && (await menu(2, '강타'))) return true;
    if (info.id === 'nell' && info.mp >= 3 && (await menu(2, '급소 찌르기'))) return true;
  }
  await d.pickInList(0); await sleep(100); await aimAndConfirm();
  return true;
};

// 실제 플레이어처럼 전투 사이에 회복한다 (약초·여관 대신 테스트에서는 즉시 회복)
const origPump = d.pump.bind(d);
d.pump = async (o) => {
  const s = await origPump(o);
  const low = await J(() => { const G = __jr.Game; return G.state.party.some((id) => { const m = G.state.members[id]; return m.hp < G.stats(id).maxhp * 0.5 || m.mp < G.stats(id).maxmp * 0.3; }); });
  if (low && !(await J(() => __jr.Battle.core))) await J(() => __jr.Game.healAll());
  return s;
};
// 레벨 보정 (수련 대신)
const train = (lv) => J((L) => { const G = __jr.Game; for (const id in G.state.members) { const m = G.state.members[id]; if (m.level < L) G.addExp(id, __jr.expForLevel ? __jr.expForLevel(L) - m.exp : 0); } G.healAll(); }, lv);

try {
  await J(() => { __jr.Settings.set('textSpeed', 3); __jr.Settings.set('battleSpeed', 2); __jr.Settings.set('showGoal', 1); });
  step('0. 제1장 완료 상태 준비');
  await J((jail) => {
    const { Game, Quests, Field, Engine } = __jr;
    Game.newState('하루');
    for (const id of ['bran', 'linette', 'mio']) Game.join(id);
    if (!jail) Game.join('nell');
    for (const f of ['prologue', 'met_elder', 'visited_hunter', 'ironfang_defeated', 'linette_joined', 'saw_seal', 'mio_joined', 'seal_opened', 'velgar_defeated', 'chapter1_done', 'thief_resolved']) Game.setFlag(f, f === 'prologue' ? 2 : true);
    for (const q of ['main1', 'main2', 's_thief']) { Quests.start(q); Quests.complete(q, q === 's_thief' ? (jail ? 'jail' : 'join') : undefined); }
    for (const id in Game.state.members) Game.addExp(id, 9000 - Game.state.members[id].exp);
    Game.addItem('steel_sword'); Game.equip('hero', 'weapon', 'steel_sword');
    Game.addItem('dorn_axe'); Game.equip('bran', 'weapon', 'dorn_axe');
    Game.addItem('blessed_staff'); Game.equip('mio', 'weapon', 'blessed_staff');
    Game.addItem('spellbook'); Game.equip('linette', 'weapon', 'spellbook');
    for (const [id, sl, it] of [['hero', 'armor', 'chain_mail'], ['bran', 'armor', 'chain_mail'], ['linette', 'armor', 'sage_robe'], ['mio', 'armor', 'mage_robe'], ['hero', 'shield', 'iron_shield'], ['bran', 'shield', 'iron_shield']]) { Game.addItem(it); Game.equip(id, sl, it); }
    Game.addItem('potion', 10); Game.addItem('ether', 5); Game.addItem('return_wing', 3); Game.addItem('hi_potion', 3);
    Game.state.gold = 3000;
    Game.healAll();
    Engine.setScene(Field.layer);
    Field.enter('rivel', 18, 5, 'up');
  }, NELL_JAIL);
  await d.pump();
  await check('레벨 확인 (Lv 10 이상)', () => __jr.Game.state.members.hero.level >= 10 || __jr.Game.state.members.hero.level);

  step('1. 장로에게 인사 → 제3 메인 퀘스트 시작');
  await d.walkTo(18, 5);
  await d.ev(() => { __jr.Field.warp('elder', 5, 6, 'up'); });
  await sleep(600); await d.pump();
  await d.talkTo('haldor');
  await check('main3 시작', () => __jr.Quests.isActive('main3') || __jr.Quests.get('main3'));

  step('2. 평원 동쪽 끝 → 은빛 가도');
  await J(() => __jr.Field.warp('field', 58, 30, 'right'));
  await sleep(600); await d.pump();
  await d.stepOn(63, 30);
  await d.pump();
  await check('은빛 가도 도착', () => __jr.Field.map.id === 'highway' || __jr.Field.map.id);
  await shot('highway');

  step('3. 역참 둘러보기');
  await d.stepOn(14, 12);
  await check('역참 내부', () => __jr.Field.map.id === 'waystation' || __jr.Field.map.id);
  await shot('waystation');
  await d.talkAcross(2, 3); // 여관 (묵지 않음)
  await d.stepOn(6, 9);

  step('4. 은빛 다리 — 집행자 베인');
  await train(12);
  await d.walkTo(22, 16);
  await d.walkTo(23, 16);
  await d.pump({ timeout: 240000 });
  await check('베인 격파', () => __jr.Game.flag('vane_defeated') === true || __jr.Game.flag('vane_defeated'));
  await check('악보 획득', () => __jr.Game.count('choir_score') === 1);

  step('5. 왕도 도착');
  await d.stepOn(52, 16);
  await d.pump();
  await check('왕도 도착', () => __jr.Field.map.id === 'capital' && __jr.Game.flag('reached_capital') === true || __jr.Field.map.id);
  await check('부활 지점 = 왕도 여관', () => __jr.Game.state.respawn.map === 'cap_inn');
  await shot('capital');

  if (NELL_JAIL) {
    step('5b. 보육원에서 넬 재합류');
    await d.stepOn(6, 33);
    await d.talkTo('greta');
    d.choices.push('예');
    await d.talkTo('nell_orphan');
    await check('넬 합류', () => __jr.Game.inParty('nell'));
    await d.stepOn(6, 9);
  } else {
    step('5b. 보육원 방문 (넬의 귀향)');
    await d.stepOn(6, 33);
    await d.pump();
    await check('넬 귀향 이벤트', () => __jr.Game.flag('nell_home') === true && __jr.Game.count('orphan_charm') === 1);
    await d.stepOn(6, 9);
  }

  step('6. 마도학원 — 오필리아 학장');
  await d.stepOn(7, 9);
  await d.walkTo(12, 5);
  await d.talkTo('ophelia');
  await check('학장 면담', () => __jr.Game.flag('met_dean') === true);
  await shot('academy');
  await d.stepOn(11, 15);

  step('7. 기사단 본부 — 라인하르트 단장 → 입단 시험');
  await d.stepOn(40, 9);
  await d.talkTo('reinhardt');
  await check('시험 허가 (stage 4)', () => __jr.Quests.stage('main3') === 4 || __jr.Quests.stage('main3'));
  await train(13);
  d.choices.push('예');
  await d.talkTo('gawain');
  let tries = 0;
  while (!(await J(() => __jr.Game.flag('bran_knight'))) && tries++ < 3) { log('  (재도전)'); d.choices.push('예'); await d.talkTo('gawain'); }
  await check('브란 입단 (견습 기사)', () => __jr.Game.flag('bran_knight') === true && __jr.Game.count('knight_crest') === 1);
  await shot('knight');
  await d.stepOn(10, 15);

  step('8. 시계탑 문 → 학장 → 수로 관리인 오토');
  await d.stepOn(7, 9);
  await d.walkTo(19, 3);
  await d.face('up');
  await d.walkTo(19, 3);
  await d.ev(() => { __jr.Field.player.dir = 'up'; });
  await d.key('ArrowUp', 200);
  await d.pump();
  await d.talkTo('ophelia');
  await check('수로 경로 안내 (stage 6)', () => __jr.Quests.stage('main3') === 6 || __jr.Quests.stage('main3'));
  await d.stepOn(11, 15);
  await d.talkTo('otto');
  await check('수로 열쇠', () => __jr.Game.count('sewer_key') === 1);

  step('9. 지하수로 상층 — 수문');
  d.choices.push('예');
  await d.interactAt(9, 37);
  await check('수로 진입', () => __jr.Field.map.id === 'sewer1' || __jr.Field.map.id);
  await shot('sewer1');
  await d.interactAt(31, 2);
  await check('수문 개방', () => __jr.Game.flag('valve_1') === true);
  await d.interactAt(2, 19); // 금서 상자 (서쪽 수로)
  await d.stepOn(30, 18);
  await check('하층 도착', () => __jr.Field.map.id === 'sewer2' || __jr.Field.map.id);

  step('10. 지하수로 하층 — 늙은 이빨');
  await d.interactAt(2, 5);
  await d.interactAt(31, 5);
  await check('다리 출현', () => __jr.Field.npc('old_fang').visible === true);
  await shot('sewer2');
  await train(15);
  await d.walkTo(16, 16);
  await d.walkTo(16, 15);
  await d.pump({ timeout: 300000 });
  await check('늙은 이빨 격파', () => __jr.Game.flag('croc_defeated') === true);
  await d.stepOn(16, 2);
  await d.pump();
  await check('시계탑 1층', () => __jr.Field.map.id === 'tower1' || __jr.Field.map.id);
  await shot('tower1');

  step('11. 시계탑 2층 — 자정의 문');
  await d.stepOn(20, 2);
  await check('시계탑 2층', () => __jr.Field.map.id === 'tower2' || __jr.Field.map.id);
  for (const [x, times] of [[6, 3], [12, 2], [18, 1]]) for (let i = 0; i < times; i++) await d.interactAt(x, 8);
  await check('시계판 해결', () => __jr.Dials ? __jr.Dials.solved() : (typeof Dials !== 'undefined' && Dials.solved()));
  await shot('tower2');
  await d.stepOn(3, 2);
  await check('시간의 종', () => __jr.Field.map.id === 'tower3' || __jr.Field.map.id);

  step('12. 제2성부 카산드라');
  await train(17);
  await d.walkTo(9, 9);
  await d.pump({ timeout: 400000 });
  await check('카산드라 격파', () => __jr.Game.flag('cassandra_defeated') === true);
  await check('시간의 심장', () => __jr.Game.count('time_heart') === 1);
  await shot('timebell');

  step('13. 학원으로 귀환 → 2장 엔딩');
  d.choices.push('예');
  await d.interactAt(12, 12);
  await d.pump();
  await check('왕도 귀환', () => __jr.Field.map.id === 'capital' || __jr.Field.map.id);
  await d.stepOn(7, 9);
  d.choices.push('CANCEL');
  await d.talkTo('ophelia');
  await check('제2장 완료', () => __jr.Game.flag('chapter2_done') === true && __jr.Quests.isDone('main3') && __jr.Game.count('warden_badge') === 1);
  await check('진행도 16', () => __jr.Game.progress() === 16);
  await shot('ending');

  step('14. 저장 → 불러오기');
  await J(() => __jr.Save.write(2));
  await J(() => { __jr.Game.state.gold = 1; });
  await J(() => __jr.Main.loadSlot(2));
  await sleep(1200); await d.pump();
  await check('불러온 뒤 2장 완료 유지', () => __jr.Game.flag('chapter2_done') === true && __jr.Game.state.gold > 1 && __jr.Field.map.id === 'academy');
} catch (e) {
  failures++;
  log('  ✗ EXCEPTION ' + e.message);
  await shot('exception');
}
const errs = errors.filter((e) => !e.includes('AudioContext'));
if (errs.length) { failures++; log('\n콘솔 오류:\n' + errs.join('\n')); }
log(`\n${failures ? '✗ 실패 ' + failures : '✓ 모두 통과'}`);
await browser.close();
process.exit(failures ? 1 : 0);
