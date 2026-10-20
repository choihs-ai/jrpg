// 제3장 E2E 테스트: 제2장 완료 직후 상태에서 시작해 실제 키 입력으로 3장 끝까지 진행 + 서브 퀘스트 2개 + 저장/불러오기
//  일반 전투는 실제로 싸우고, 보스 직전에는 '수련'을 대신해 레벨을 보정해 테스트 시간을 줄인다.
//  FROM=temple 이면 모래시계 사원 입구부터 (퍼즐·베인·자히르·엔딩만 빠르게 재검증)
import { launch, sleep, ROOT } from './helpers.mjs';
import { Driver } from './driver.mjs';
import fs from 'fs';
const SHOTS = process.env.SHOTS || ROOT + '/tests/screens/ch3';
fs.mkdirSync(SHOTS, { recursive: true });
const { browser, page, errors } = await launch();
const log = (...a) => console.log(...a);
const d = new Driver(page, process.env.VERBOSE ? log : () => {});
d.defaultTimeout = 1800000; // 보스전은 실시간으로 길다
let n = 0;
const shot = async (name) => { await page.screenshot({ path: `${SHOTS}/${String(++n).padStart(2, '0')}_${name}.png` }); };
let failures = 0;
const J = (fn, arg) => d.ev(fn, arg);
const check = async (label, fn) => {
  const r = await d.ev(fn);
  if (r === true) log('  ✓ ' + label); else { failures++; log('  ✗ ' + label + ' → ' + JSON.stringify(r)); }
};
const step = (t) => log('\n▶ ' + t);

// ── 전투 정책: 예고 공격엔 방어, 위급하면 회복, 신기루는 통찰로 걷어내고, 약점을 찌른다 ──
const SPELLS = { fire: ['inferno', '업화'], ice: ['ice_lance', '빙창'], thunder: ['thunder_lance', '뇌창'], light: ['holy_lance', '빛의 창'] };
d.battlePolicy = async (d, s) => {
  if (s.kind !== 'list' || !s.items || s.items[0] !== '공격') return false;
  const info = await J(() => {
    const B = __jr.Battle, core = B.core, a = B.active;
    if (!core || !a) return null;
    const foes = core.aliveEnemyList;
    const charging = foes.find((e) => e.charging);
    const marked = charging && ((charging.mem.mark === a && ['execution', 'queen_strike'].includes(charging.charging)) || (charging.charging === 'falling_sand' && (a.mhp < 420 || a.hp / a.mhp < 0.6)));
    const low = core.alivePartyList.filter((x) => x.hp / x.mhp < 0.45);
    const dead = core.party.filter((x) => !x.alive).length;
    const boss = foes.find((e) => e.def.boss);
    const target = boss || foes[0];
    const weak = target ? Object.keys(target.elem).filter((k) => target.elem[k] > 1).sort((x, y) => target.elem[y] - target.elem[x]) : [];
    return {
      id: a.id, mp: a.mp, hp: a.hp / a.mhp, skills: a.ref.skills, silenced: !!a.status.silence,
      defend: !!marked, low: low.length, dead, mirage: foes.some((e) => e.def.mirage),
      targetId: target ? target.uid : null, weak, boss: !!boss, many: foes.length >= 3,
      buffDef: core.party.some((p) => p.buffs.def && p !== a), buffAtk: core.party.some((p) => p.buffs.atk), regen: core.party.some((p) => p.buffs.regen),
    };
  });
  if (!info) return false;
  if (process.env.TRACE) log('   [policy] ' + JSON.stringify(info));
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
  if (info.id === 'hero' && info.mirage && has('insight') && info.mp >= 6 && (await menu(2, '통찰', false))) return true;
  if (info.dead && has('revive') && info.mp >= 10 && (await menu(1, '소생', false))) return true;
  if (info.low > 1 && has('mother_song') && info.mp >= 24 && (await menu(1, '어머니의 자장가', false))) return true;
  if (info.low > 1 && has('heal_all') && info.mp >= 9 && (await menu(1, '치유의 비', false))) return true;
  if (info.low > 0 && has('heal_more') && info.mp >= 7 && (info.id === 'mio' || info.id === 'hero') && (await menu(1, '상급 치유', false))) return true;
  if (info.low > 0 && has('heal') && info.mp >= 3 && info.id === 'mio' && (await menu(1, '치유', false))) return true;
  if (info.boss) {
    if (info.id === 'mio' && !info.regen && has('regen') && info.mp >= 8 && (await menu(1, '생명의 물결', false))) return true;
    if (info.id === 'mio' && !info.buffDef && has('protect') && info.mp >= 4 && (await menu(1, '수호의 기도', false))) return true;
    if (info.id === 'bran' && !info.buffAtk && has('warcry') && info.mp >= 3 && (await menu(2, '함성', false))) return true;
    if (info.id === 'linette') for (const el of info.weak) { const sp = SPELLS[el]; if (sp && has(sp[0]) && info.mp >= 10 && (await menu(1, sp[1]))) return true; }
    if (info.id === 'hero' && info.weak.includes('thunder') && info.mp >= 5 && (await menu(1, '번개'))) return true;
    if (info.id === 'hero' && info.mp >= 14 && has('stellar_blade') && (await menu(2, '성운 가르기'))) return true;
    if (info.id === 'hero' && info.weak.includes('light') && info.mp >= 9 && has('meteor_slash') && (await menu(2, '유성 베기'))) return true;
    if (info.id === 'bran' && info.many && has('axe_storm') && info.mp >= 12 && (await menu(2, '도끼 폭풍', false))) return true;
    if (info.id === 'bran' && info.mp >= 2 && (await menu(2, '강타'))) return true;
    if (info.id === 'nell' && info.mp >= 3 && (await menu(2, '급소 찌르기'))) return true;
  }
  await d.pickInList(0); await sleep(100); await aimAndConfirm();
  return true;
};

// 실제 플레이어처럼 전투 사이에 회복한다 (약·여관 대신 테스트에서는 즉시 회복)
const origPump = d.pump.bind(d);
d.pump = async (o) => {
  const s = await origPump(o);
  const low = await J(() => { const G = __jr.Game; return G.state.party.some((id) => { const m = G.state.members[id]; return m.hp < G.stats(id).maxhp * 0.5 || m.mp < G.stats(id).maxmp * 0.3; }); });
  if (low && !(await J(() => __jr.Battle.core))) await J(() => __jr.Game.healAll());
  return s;
};
const train = (lv) => J((L) => { const G = __jr.Game; for (const id in G.state.members) { const m = G.state.members[id]; if (m.level < L) G.addExp(id, __jr.expForLevel(L) - m.exp); } G.healAll(); }, lv);
// 바자르에서 살 만한 장비로 갈아입는다 (실제 플레이어처럼)
const desertGear = () => J(() => {
  const G = __jr.Game;
  const eq = {
    hero: { weapon: 'flame_saber', armor: 'desert_mail', shield: 'sun_shield', helm: 'desert_helm' },
    bran: { weapon: 'sand_axe', armor: 'desert_mail', helm: 'desert_helm' },
    linette: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban' },
    mio: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban' }, nell: { weapon: 'scorpion_dagger', armor: 'sand_garb', helm: 'turban' },
  };
  for (const id in eq) if (G.state.members[id]) for (const sl in eq[id]) { G.addItem(eq[id][sl]); G.equip(id, sl, eq[id][sl]); }
  G.healAll();
});

// 보스전: 지면 여관에서 깨어나므로 보스 앞으로 돌아가 다시 도전한다 (실제 플레이어처럼, 최대 3번)
const bossFight = async (flag, approach, back) => {
  for (let i = 0; i < 3; i++) {
    await approach();
    await d.pump({ timeout: 2400000 });
    if (await J((f) => __jr.Game.flag(f) === true, flag)) return;
    log(`  (패배 → 재도전 ${i + 1})`);
    await J(() => __jr.Game.healAll());
    await J(back);
    await sleep(600); await d.pump();
  }
};

if (process.env.TRACE) setInterval(async () => {
  try { log('   [trace] ' + await J(() => { const c = __jr.Battle.core; if (!c) return '-'; return `R${c.round} ` + c.party.map((a) => a.name[0] + a.hp + '/' + a.mp).join(' ') + ' | ' + c.enemies.filter((e) => e.alive).map((e) => e.defId + e.hp + (e.charging ? '!' + e.charging : '')).join(' '); })); } catch (e) { log('   [trace-err] ' + e.message); }
}, 8000);

try {
  await J(() => { __jr.Settings.set('textSpeed', 3); __jr.Settings.set('battleSpeed', 2); __jr.Settings.set('showGoal', 1); });
  step('0. 제2장 완료 상태 준비');
  await J(() => {
    const { Game, Quests, Field, Engine } = __jr;
    Game.newState('하루');
    for (const id of ['bran', 'linette', 'mio', 'nell']) Game.join(id);
    const ch1 = ['met_elder', 'visited_hunter', 'ironfang_defeated', 'linette_joined', 'saw_seal', 'mio_joined', 'seal_opened', 'velgar_defeated', 'chapter1_done', 'thief_resolved'];
    const ch2 = ['ch2_started', 'highway_first', 'vane_defeated', 'reached_capital', 'met_dean', 'bran_knight', 'croc_defeated', 'cassandra_defeated', 'tower_unfrozen', 'chapter2_done', 'nell_home'];
    Game.setFlag('prologue', 2);
    for (const f of ch1.concat(ch2)) Game.setFlag(f);
    for (const q of ['main1', 'main2', 'main3']) { Quests.start(q); Quests.complete(q); }
    for (const id in Game.state.members) Game.addExp(id, __jr.expForLevel(17) - Game.state.members[id].exp);
    const eq = {
      hero: { weapon: 'mythril_sword', armor: 'mythril_mail', shield: 'knight_shield', helm: 'silver_helm', accessory: 'courage_token' },
      bran: { weapon: 'war_axe', armor: 'mythril_mail', shield: 'squire_shield', helm: 'silver_helm' },
      linette: { weapon: 'rune_staff', armor: 'mystic_robe', helm: 'feather_hat' },
      mio: { weapon: 'rune_staff', armor: 'mystic_robe', helm: 'wizard_hat' }, nell: { weapon: 'silver_dagger', armor: 'night_garb', helm: 'feather_hat' },
    };
    for (const id in eq) for (const sl in eq[id]) { Game.addItem(eq[id][sl]); Game.equip(id, sl, eq[id][sl]); }
    Game.addItem('hi_potion', 10); Game.addItem('ether', 5); Game.addItem('return_wing', 3); Game.addItem('time_heart'); Game.addItem('warden_badge');
    Game.state.gold = 8000;
    Game.state.respawn = { map: 'cap_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 볼프' };
    Game.healAll();
    Engine.setScene(Field.layer);
    Field.enter('academy', 12, 8, 'up');
  });
  await d.pump();
  await check('진행도 16', () => __jr.Game.progress() === 16 || __jr.Game.progress());
  await check('사막 길은 아직 막혀 있다', () => !__jr.MAPS.highway.warps.find((w) => w.to === 'canyon').cond() || 'open');

  if (process.env.FROM === 'temple') {
    await J(() => {
      const { Game, Quests, Field } = __jr;
      Quests.start('main4'); for (let i = 0; i <= 5; i++) Quests.setStage('main4', i);
      for (const f of ['ch3_started', 'canyon_first', 'desert_first', 'reached_samira', 'met_hakim', 'cave3_first', 'cave_told', 'queen_defeated', 'sun_gate_open']) Game.setFlag(f);
      Game.state.party = Game.state.party.filter((x) => x !== 'mio'); Game.state.reserve = Game.state.reserve.filter((x) => x !== 'mio');
      while (Game.state.party.length < 4 && Game.state.reserve.length) Game.state.party.push(Game.state.reserve.shift());
      Game.setFlag('mio_sub', 'nell'); Game.setFlag('mio_taken');
      Game.addItem('sun_key');
      Game.state.respawn = { map: 'samira_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 라일라' };
      Field.enter('desert', 30, 34, 'up');
    });
    await d.pump();
    await train(19);
  } else {
    step('1. 마도학원 — 사미라의 사자 → 제4 메인 퀘스트');
    await d.talkTo('ophelia');
    await check('main4 시작', () => __jr.Quests.isActive('main4') || __jr.Quests.get('main4'));
    await check('통행패', () => __jr.Game.count('canyon_pass') === 1);
    await check('진행도 17', () => __jr.Game.progress() === 17);
    await shot('messenger');

    step('2. 은빛 가도 남쪽 → 붉은 협곡');
    await J(() => __jr.Field.warp('highway', 48, 28, 'down'));
    await sleep(600); await d.pump();
    await d.stepOn(48, 31);
    await check('붉은 협곡 도착', () => __jr.Field.map.id === 'canyon' || __jr.Field.map.id);
    await shot('canyon');

    step('3. 협곡을 지나 사막으로 (실제 걸어서)');
    await d.stepOn(7, 43);
    await check('타는 모래 사막', () => __jr.Field.map.id === 'desert' || __jr.Field.map.id);
    await shot('desert');

    step('4. 무너진 천막의 일기 조각 → 오아시스 사미라');
    await d.interactAt(6, 9);
    await check('일기 조각 1 · 무녀의 일기 시작', () => __jr.Game.count('aria_page') === 1 && __jr.Quests.isActive('s_diary'));
    await d.stepOn(18, 21);
    await check('사미라 도착', () => __jr.Field.map.id === 'samira' && __jr.Game.flag('reached_samira') === true || __jr.Field.map.id);
    await check('부활 지점 = 사미라 여관', () => __jr.Game.state.respawn.map === 'samira_inn');
    await shot('samira');

    step('5. 족장 하킴 → 여관의 밤 (미오 납치)');
    await d.stepOn(17, 4);
    await d.talkTo('hakim');
    await check('족장 면담 (진행도 19)', () => __jr.Game.progress() === 19);
    await d.stepOn(6, 9);
    await d.stepOn(5, 5);
    await d.talkAcross(2, 3);
    await check('미오 납치 (진행도 20)', () => __jr.Game.progress() === 20);
    await check('미오가 파티에서 빠지고 넬이 자리를 채운다', () => !__jr.Game.inParty('mio') && __jr.Game.state.party.includes('nell') && __jr.Game.state.party.length === 4 || __jr.Game.state.party);
    await shot('night');

    step('6. 족장에게 알림 → 전갈 굴 안내');
    await d.stepOn(6, 9);
    await d.stepOn(17, 4);
    await d.talkTo('hakim');
    await check('전갈 굴 안내', () => __jr.Game.flag('cave_told') === true && __jr.Quests.stage('main4') === 4);
    await d.stepOn(6, 9);

    step('7. 바자르 — 상인 알리의 부탁 (길 잃은 대상)');
    await d.stepOn(5, 19);
    d.choices.push('CANCEL');
    await d.talkAcross(10, 3);
    await check('s_caravan 시작', () => __jr.Quests.isActive('s_caravan') && __jr.Game.count('lost_letter') === 1);
    await d.stepOn(6, 8);
    await J(() => __jr.Field.warp('desert', 48, 31, 'down'));
    await sleep(600); await d.pump();
    await d.talkTo('caravan_lead');
    await check('도적 격퇴 · 대상 구출', () => __jr.Game.flag('raiders_beaten') === true && __jr.Quests.stage('s_caravan') === 1);

    step('8. 전갈 굴 — 전갈 여왕');
    await d.stepOn(48, 9);
    await check('전갈 굴 진입', () => __jr.Field.map.id === 'sandcave' || __jr.Field.map.id);
    await shot('sandcave');
    await d.interactAt(2, 6);
    await check('일기 조각 2', () => __jr.Game.count('aria_page') === 2);
    await train(19);
    await desertGear(); // 바자르에서 사막 장비를 사 입었다고 가정
    await bossFight('queen_defeated', async () => { await d.walkTo(20, 6); await d.walkTo(20, 5); }, () => __jr.Field.warp('sandcave', 20, 7, 'up'));
    await check('전갈 여왕 격파 (진행도 21)', () => __jr.Game.flag('queen_defeated') === true && __jr.Game.progress() === 21);
    await d.interactAt(26, 1);
    await check('태양의 열쇠', () => __jr.Game.count('sun_key') === 1 && __jr.Quests.stage('main4') === 5);
    await shot('sunkey');

    step('9. 사미라로 돌아가 알리에게 보고 → 해의 문');
    await d.stepOn(3, 19);
    await J(() => __jr.Field.warp('samira', 5, 20, 'up'));
    await sleep(600); await d.pump();
    await d.stepOn(5, 19);
    d.choices.push('CANCEL');
    await d.talkAcross(10, 3);
    await check('길 잃은 대상 완료', () => __jr.Quests.isDone('s_caravan') && __jr.Game.count('oasis_ring') >= 1);
    await d.stepOn(6, 8);
    await J(() => __jr.Field.warp('desert', 30, 33, 'down'));
    await sleep(600); await d.pump();
  }

  step('10. 해의 문 → 흐르는 모래의 회랑 (모래시계 퍼즐)');
  await d.walkTo(30, 34);
  await d.stepOn(30, 35); // 처음엔 막힌 문 → 열쇠로 연다 (걷기 재시도로 바로 들어갈 수도 있다)
  await check('해의 문 개방', () => __jr.Game.flag('sun_gate_open') === true);
  if ((await d.state()).map === 'desert') await d.stepOn(30, 35);
  await check('사원 1층', () => __jr.Field.map.id === 'temple1' || __jr.Field.map.id);
  await check('목표: 미오 구출 단계', () => __jr.Quests.stage('main4') === 6);
  await check('뒤집지 않으면 위층에 갈 수 없다', () => __jr.Field.findPath(12, 2) === null);
  await shot('temple1');
  await d.interactAt(22, 13);
  await check('모래시계 1 뒤집음', () => __jr.Game.flag('hg_flip') === true);
  await d.interactAt(2, 13);
  await check('모래시계 2 되돌림', () => !__jr.Game.flag('hg_flip'));
  await d.interactAt(9, 9);
  if (process.env.FROM !== 'temple') await check('일기 조각 3 → 나디아에게', () => __jr.Game.count('aria_page') === 3 && __jr.Quests.stage('s_diary') === 1);
  await d.interactAt(22, 8);
  await check('모래시계 3 뒤집음', () => __jr.Game.flag('hg_flip') === true);
  await shot('hourglass');
  await d.stepOn(12, 2);
  await check('침묵의 제단', () => __jr.Field.map.id === 'temple2' || __jr.Field.map.id);

  step('11. 침묵의 제단 — 베인 재전 → 미오 구출');
  await train(20);
  await desertGear();
  await bossFight('mio_rescued', async () => { await d.walkTo(12, 10); await d.walkTo(12, 9); }, () => __jr.Field.warp('temple2', 12, 11, 'up'));
  await check('베인 격파 · 미오 구출 (진행도 22)', () => __jr.Game.flag('mio_rescued') === true && __jr.Game.progress() === 22);
  await check('미오가 원래 자리로 (넬은 대기)', () => __jr.Game.state.party.includes('mio') && __jr.Game.state.reserve.includes('nell') || [__jr.Game.state.party, __jr.Game.state.reserve]);
  await check('미오 레벨 보정', () => __jr.Game.member('mio').level >= __jr.Game.member('hero').level - 1 || __jr.Game.member('mio').level);
  await check('철창이 열렸다', () => __jr.Field.findPath(20, 1) !== null);
  await shot('mio_rescued');
  await d.stepOn(20, 1);
  await check('모래 종의 방', () => __jr.Field.map.id === 'temple3' || __jr.Field.map.id);

  step('12. 제3성부 자히르');
  await train(22);
  await J(() => __jr.Game.addItem('hi_ether', 5));
  await bossFight('zahir_defeated', async () => { await d.walkTo(9, 10); await d.walkTo(9, 9); }, () => __jr.Field.warp('temple3', 9, 11, 'up'));
  await check('자히르 격파 (진행도 23)', () => __jr.Game.flag('zahir_defeated') === true && __jr.Game.progress() === 23);
  await check('모래의 심장', () => __jr.Game.count('sand_heart') === 1);
  await check('미오: 어머니의 자장가', () => __jr.Game.member('mio').skills.includes('mother_song'));
  await check('샘 복원', () => __jr.Game.flag('spring_restored') === true);
  await shot('sandbell');

  step('13. 마법진으로 사미라 → 족장 → 3장 엔딩');
  d.choices.push('예');
  await d.interactAt(12, 12);
  await d.pump();
  await check('사미라 귀환', () => __jr.Field.map.id === 'samira' || __jr.Field.map.id);
  await shot('spring');
  await d.stepOn(17, 4);
  d.choices.push('CANCEL');
  await d.talkTo('hakim');
  await check('제3장 완료', () => __jr.Game.flag('chapter3_done') === true && __jr.Quests.isDone('main4') && __jr.Game.count('sand_badge') === 1);
  await check('진행도 24', () => __jr.Game.progress() === 24);
  await shot('ending');
  await d.stepOn(6, 9);

  if (process.env.FROM !== 'temple') {
    step('14. 나디아의 집 — 무녀의 일기 완료');
    await d.stepOn(30, 19);
    await d.talkTo('nadia');
    await check('무녀의 일기 완료 → 아리아의 방울', () => __jr.Quests.isDone('s_diary') && __jr.Game.count('aria_chime') === 1);
    await d.stepOn(4, 6);
  }

  step('15. 물의 사당 — 자히르의 속죄');
  await d.stepOn(29, 5);
  await d.talkTo('zahir_pray');
  await d.stepOn(5, 8);

  step('16. 저장 → 불러오기');
  await J(() => __jr.Save.write(2));
  await J(() => { __jr.Game.state.gold = 1; });
  await J(() => __jr.Main.loadSlot(2));
  await sleep(1200); await d.pump();
  await check('불러온 뒤 3장 완료 유지', () => __jr.Game.flag('chapter3_done') === true && __jr.Game.state.gold > 1 && __jr.Field.map.id === 'samira');
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
