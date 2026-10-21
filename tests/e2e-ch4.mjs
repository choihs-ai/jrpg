// 제4장 E2E 테스트: 제3장 완료 직후 상태에서 시작해 실제 키 입력으로 4장 끝까지 진행 + 서브 퀘스트 2개 + 저장/불러오기
//  일반 전투는 실제로 싸우고, 보스 직전에는 '수련'을 대신해 레벨을 보정해 테스트 시간을 줄인다.
//  FROM=ship 이면 카산드라 합류 직후부터 (유령선·레비아·엔딩만 빠르게 재검증)
import { launch, sleep, ROOT } from './helpers.mjs';
import { Driver } from './driver.mjs';
import fs from 'fs';
const SHOTS = process.env.SHOTS || ROOT + '/tests/screens/ch4';
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
const STUCK_CURE = '정화';
d.battlePolicy = async (d, s) => {
  if (s.kind !== 'list' || !s.items || s.items[0] !== '공격') return false;
  const info = await J(() => {
    const B = __jr.Battle, core = B.core, a = B.active;
    if (!core || !a) return null;
    const foes = core.aliveEnemyList;
    const charging = foes.find((e) => e.charging);
    const marked = charging && ((charging.mem.mark === a && ['execution', 'queen_strike', 'tusk_crush', 'anchor_crash'].includes(charging.charging)) || (charging.charging === 'falling_sand' && (a.mhp < 420 || a.hp / a.mhp < 0.6)) || (charging.charging === 'tidal_wave' && a.hp / a.mhp < 0.5));
    const low = core.alivePartyList.filter((x) => x.hp / x.mhp < 0.45);
    const dead = core.party.filter((x) => !x.alive).length;
    const boss = foes.find((e) => e.def.boss);
    // 졸개(정령·기사 등)가 있으면 먼저 정리한다 — 신기루는 보스와 같은 이름이라 졸개로 치지 않는다
    const add = foes.filter((e) => !e.def.boss).sort((x, y) => x.hp - y.hp)[0];
    const target = add || boss || foes[0];
    const weak = target ? Object.keys(target.elem).filter((k) => target.elem[k] > 1).sort((x, y) => target.elem[y] - target.elem[x]) : [];
    return {
      id: a.id, mp: a.mp, hp: a.hp / a.mhp, skills: a.ref.skills, silenced: !!a.status.silence,
      defend: !!marked, low: low.length, dead, mirage: foes.some((e) => e.def.mirage),
      targetId: target ? target.uid : null, weak, boss: !!boss, many: foes.length >= 3,
      buffDef: core.party.some((p) => p.buffs.def && p !== a), buffAtk: core.party.some((p) => p.buffs.atk), regen: core.party.some((p) => p.buffs.regen), buffMag: core.party.some((p) => p.buffs.mag && p.buffs.mag.mult > 1),
      stuck: core.alivePartyList.some((x) => x.status.freeze || x.status.bind),
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
  if (info.stuck && info.id === 'mio' && has('cure') && info.mp >= 2) {
    const stuckUid = await J(() => { const c = __jr.Battle.core; const s = c.alivePartyList.find((x) => x.status.freeze || x.status.bind); return s ? s.uid : null; });
    if (stuckUid) {
      await d.pickInList(1); await sleep(120);
      const st = await d.state();
      const idx = st.items ? st.items.findIndex((l) => l === STUCK_CURE) : -1;
      if (idx >= 0) {
        await d.pickInList(idx); await sleep(120);
        for (let i = 0; i < 6; i++) { const t = await J(() => { const tg = __jr.Battle.targeting; return tg ? tg.list[tg.index] && tg.list[tg.index].uid : null; }); if (t === stuckUid) break; await d.key('ArrowRight'); await sleep(40); }
        await d.key('Enter'); await sleep(80); return true;
      }
      await d.key('Escape'); await sleep(80);
    }
  }
  if (info.id === 'cassandra') {
    if (info.low > 1 && has('song_solace') && info.mp >= 12 && (await menu(1, '위로의 노래', false))) return true;
    if (info.boss && !info.buffMag && has('song_valor') && info.mp >= 8 && (await menu(1, '용기의 노래', false))) return true;
    if (info.boss && !info.regen && has('song_ward') && info.mp >= 9 && (await menu(1, '수호의 노래', false))) return true;
    if (has('dirge') && info.mp >= 12 && (await menu(1, '진혼가', false))) return true;
  }
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
// 마레아 「닻과 그물」에서 살 만한 장비로 갈아입는다 (실제 플레이어처럼)
const northGear = () => J(() => {
  const G = __jr.Game;
  const eq = {
    hero: { weapon: 'flame_saber', armor: 'whale_mail', shield: 'coral_shield', helm: 'fur_hood' },
    bran: { weapon: 'tide_axe', armor: 'whale_mail', helm: 'captain_hat' },
    linette: { weapon: 'pearl_staff', armor: 'seafoam_robe', helm: 'fur_hood' },
    mio: { weapon: 'pearl_staff', armor: 'seafoam_robe', helm: 'fur_hood' }, nell: { weapon: 'coral_dagger', armor: 'sealskin_coat', helm: 'fur_hood' },
    cassandra: { weapon: 'siren_harp', armor: 'seafoam_robe', helm: 'fur_hood' },
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
  step('0. 제3장 완료 상태 준비');
  await J(() => {
    const { Game, Quests, Field, Engine } = __jr;
    Game.newState('하루');
    for (const id of ['bran', 'linette', 'mio', 'nell']) Game.join(id);
    const ch1 = ['met_elder', 'visited_hunter', 'ironfang_defeated', 'linette_joined', 'saw_seal', 'mio_joined', 'seal_opened', 'velgar_defeated', 'chapter1_done', 'thief_resolved'];
    const ch2 = ['ch2_started', 'highway_first', 'vane_defeated', 'reached_capital', 'met_dean', 'bran_knight', 'croc_defeated', 'cassandra_defeated', 'tower_unfrozen', 'chapter2_done', 'nell_home'];
    const ch3 = ['ch3_started', 'canyon_first', 'desert_first', 'reached_samira', 'met_hakim', 'mio_taken', 'cave_told', 'queen_defeated', 'sun_gate_open', 'mio_rescued', 'zahir_defeated', 'spring_restored', 'chapter3_done'];
    Game.setFlag('prologue', 2);
    for (const f of ch1.concat(ch2, ch3)) Game.setFlag(f);
    for (const q of ['main1', 'main2', 'main3', 'main4']) { Quests.start(q); Quests.complete(q); }
    for (const id in Game.state.members) Game.addExp(id, __jr.expForLevel(23) - Game.state.members[id].exp);
    const m = Game.member('mio'); if (!m.skills.includes('mother_song')) m.skills.push('mother_song');
    const eq = {
      hero: { weapon: 'flame_saber', armor: 'desert_mail', shield: 'sun_shield', helm: 'desert_helm', accessory: 'courage_token' },
      bran: { weapon: 'sand_axe', armor: 'desert_mail', shield: 'squire_shield', helm: 'desert_helm' },
      linette: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban' },
      mio: { weapon: 'sun_staff', armor: 'mirage_robe', helm: 'turban', accessory: 'aria_chime' }, nell: { weapon: 'scorpion_dagger', armor: 'sand_garb', helm: 'turban' },
    };
    for (const id in eq) for (const sl in eq[id]) { Game.addItem(eq[id][sl]); Game.equip(id, sl, eq[id][sl]); }
    Game.addItem('mega_potion', 8); Game.addItem('hi_ether', 5); Game.addItem('return_wing', 3); Game.addItem('time_heart'); Game.addItem('sand_heart');
    Game.state.gold = 12000;
    Game.state.respawn = { map: 'samira_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 라일라' };
    Game.healAll();
    Engine.setScene(Field.layer);
    Field.enter('academy', 12, 8, 'up');
  });
  await d.pump();
  await check('진행도 24', () => __jr.Game.progress() === 24 || __jr.Game.progress());
  await check('북쪽 숲길은 아직 막혀 있다', () => !__jr.MAPS.highway.warps.find((w) => w.to === 'coast').cond() || 'open');

  if (process.env.FROM === 'ship') {
    await J(() => {
      const { Game, Quests, Field } = __jr;
      Quests.start('main5'); for (let i = 0; i <= 6; i++) Quests.setStage('main5', i);
      for (const f of ['ch4_started', 'coast_first', 'reached_marea', 'met_gregor', 'cave4_open', 'icecave_first', 'walrus_defeated', 'lighthouse_first', 'cassandra_joined', 'boat_ready']) Game.setFlag(f);
      Game.join('cassandra');
      Game.state.respawn = { map: 'marea_inn', x: 9, y: 7, dir: 'up', who: '여관 주인 힐다' };
      Field.enter('marea', 30, 3, 'up');
    });
    await d.pump();
    await train(26);
    await northGear();
  } else {
    step('1. 마도학원 — 북해 배편 → 제5 메인 퀘스트');
    await d.talkTo('ophelia');
    await check('main5 시작', () => __jr.Quests.isActive('main5') || __jr.Quests.get('main5'));
    await check('승선 허가증', () => __jr.Game.count('boarding_pass') === 1);
    await check('진행도 25', () => __jr.Game.progress() === 25);
    await shot('dean');

    step('2. 은빛 가도 북쪽 숲길 → 잿빛 해안 길');
    await J(() => __jr.Field.warp('highway', 42, 3, 'up'));
    await sleep(600); await d.pump();
    await d.stepOn(42, 0);
    await check('잿빛 해안 길 도착', () => __jr.Field.map.id === 'coast' || __jr.Field.map.id);
    await shot('coast');

    step('3. 해안을 걸어서 항구 마을 마레아로');
    await d.stepOn(10, 7);
    await check('마레아 도착', () => __jr.Field.map.id === 'marea' && __jr.Game.flag('reached_marea') === true || __jr.Field.map.id);
    await check('부활 지점 = 마레아 여관', () => __jr.Game.state.respawn.map === 'marea_inn');
    await shot('marea');

    step('4. 항만 사무소 — 그레고르 · 현상수배');
    await d.stepOn(5, 11);
    await d.talkTo('gregor');
    await check('항만장 면담', () => __jr.Game.flag('met_gregor') === true && __jr.Quests.stage('main5') === 2);
    await d.interactAt(7, 2);
    await check('집게왕 현상수배 시작', () => __jr.Quests.isActive('s_crab'));
    await d.stepOn(6, 9);

    step('5. 등대지기의 집 — 에다');
    await d.stepOn(34, 20);
    await d.talkTo('eda');
    await check('해식 동굴 개방 (진행도 27)', () => __jr.Game.flag('cave4_open') === true && __jr.Game.progress() === 27);
    await d.stepOn(4, 6);

    step('6. 해안 모래톱 — 집게왕');
    await train(25);
    await northGear();
    await J(() => __jr.Field.warp('coast', 39, 26, 'right'));
    await sleep(600); await d.pump();
    d.choices.push('예');
    await d.talkTo('king_crab');
    await check('집게왕 토벌', () => __jr.Game.count('crab_claw') === 1 && __jr.Quests.stage('s_crab') === 1);

    step('7. 얼어붙은 해식 동굴 (얼음 미끄러짐)');
    await d.stepOn(33, 13);
    await check('해식 동굴 진입', () => __jr.Field.map.id === 'icecave' || __jr.Field.map.id);
    await shot('icecave');
    await d.interactAt(3, 10);
    await check('얼어붙은 편지 · 퀘스트 시작', () => __jr.Game.count('frozen_letter') === 1 && __jr.Quests.isActive('s_frozen'));
    await d.interactAt(2, 9);
    await check('왼쪽 섬 보물 (서리의 검)', () => __jr.Game.count('frost_brand') >= 1);
    await d.interactAt(22, 16);
    await d.walkTo(12, 6);
    await check('미끄러져서 위쪽 방 입구 도착', () => { const p = __jr.Field.player; return (p.x === 12 && p.y === 6) || [p.x, p.y]; });
    await shot('icecave_top');

    step('8. 서리엄니');
    await bossFight('walrus_defeated', async () => { await d.walkTo(12, 5); await d.walkTo(12, 4); }, () => __jr.Field.warp('icecave', 12, 6, 'up'));
    await check('서리엄니 격파 (진행도 28)', () => __jr.Game.flag('walrus_defeated') === true && __jr.Game.progress() === 28);
    await d.stepOn(12, 0);
    await check('등대 1층', () => __jr.Field.map.id === 'lighthouse1' || __jr.Field.map.id);
    await shot('lighthouse1');

    step('9. 등명실 — 카산드라');
    await d.stepOn(5, 1);
    await check('등명실', () => __jr.Field.map.id === 'lighthouse2' || __jr.Field.map.id);
    await bossFight('cassandra_joined', async () => { await d.walkTo(5, 5); await d.walkTo(5, 4); }, () => __jr.Field.warp('lighthouse2', 5, 6, 'up'));
    await check('카산드라 합류 (진행도 29)', () => __jr.Game.flag('cassandra_joined') === true && __jr.Game.progress() === 29 && __jr.Game.inParty('cassandra'));
    await check('두 자매의 로켓', () => __jr.Game.count('choir_locket') === 1);
    await check('카산드라 노래 습득', () => __jr.Game.member('cassandra').skills.includes('stopped_time') || __jr.Game.member('cassandra').skills);
    await shot('lighthouse_lit');

    step('10. 마법진으로 마레아 → 그레고르 (배)');
    d.choices.push('예');
    await d.interactAt(9, 5);
    await d.pump();
    await check('마레아 귀환', () => __jr.Field.map.id === 'marea' || __jr.Field.map.id);
    await d.stepOn(5, 11);
    await d.talkTo('gregor');
    await check('배 준비', () => __jr.Game.flag('boat_ready') === true && __jr.Quests.stage('main5') === 6);
    await d.talkTo('gregor');
    await check('집게왕 현상수배 완료', () => __jr.Quests.isDone('s_crab') && __jr.Game.count('sailor_knot') >= 1);
    await d.stepOn(6, 9);

    step('11. 선술집 — 얼어붙은 편지');
    await d.stepOn(5, 20);
    await d.talkAcross(10, 3);
    await check('얼어붙은 편지 완료', () => __jr.Quests.isDone('s_frozen') && __jr.Game.count('pearl_ring') >= 1);
    await d.stepOn(6, 9);
    await J(() => { const s = __jr.Game.state; if (s.reserve.includes('cassandra')) { const i = s.party.indexOf('mio'); s.party[i] = 'cassandra'; s.reserve[s.reserve.indexOf('cassandra')] = 'mio'; } __jr.Field.resetFollowers(); });
    await check('카산드라를 전투 멤버로 편성', () => __jr.Game.state.party.includes('cassandra'));
    await J(() => { const s = __jr.Game.state; const i = s.party.indexOf('cassandra'); s.party[i] = 'mio'; s.reserve[s.reserve.indexOf('mio')] = 'cassandra'; __jr.Field.resetFollowers(); });
  }

  step('12. 부두의 배 → 유령선');
  await d.walkTo(30, 3);
  d.choices.push('예');
  await d.interactAt(31, 2);
  await d.pump();
  await check('유령선 갑판', () => __jr.Field.map.id === 'ship_deck' || __jr.Field.map.id);
  await check('갑판에서 바로는 키에 못 간다', () => __jr.Field.findPath(20, 7) === null);
  await shot('ship_deck');
  await d.stepOn(11, 7);
  await check('선창', () => __jr.Field.map.id === 'ship_hold' || __jr.Field.map.id);
  await d.interactAt(22, 9);
  await check('알드윈의 수첩', () => __jr.Game.count('osric_notebook') === 1);
  await d.stepOn(22, 2);
  await check('선미 갑판', () => __jr.Field.map.id === 'ship_deck' || __jr.Field.map.id);

  step('13. 제4성부 오르카');
  await train(27);
  await bossFight('orca_defeated', async () => { await d.walkTo(19, 7); if ((await d.state()).map === 'ship_deck') await d.walkTo(19, 6); }, () => __jr.Field.warp('ship_deck', 20, 8, 'up'));
  await d.pump();
  await check('오르카 격파 (진행도 30)', () => __jr.Game.flag('orca_defeated') === true && __jr.Game.progress() === 30);
  await check('가라앉은 신전', () => __jr.Field.map.id === 'sunken1' || __jr.Field.map.id);
  await shot('sunken1');

  step('14. 파도 종의 방 — 레비아');
  await d.stepOn(12, 1);
  await check('파도 종의 방', () => __jr.Field.map.id === 'sunken2' || __jr.Field.map.id);
  await train(28);
  await bossFight('levia_defeated', async () => { await d.walkTo(9, 10); if (!(await J(() => __jr.Game.flag('levia_defeated')))) await d.walkTo(9, 9); }, () => __jr.Field.warp('sunken2', 9, 11, 'up'));
  await check('레비아 격파 (진행도 31)', () => __jr.Game.flag('levia_defeated') === true && __jr.Game.progress() === 31);
  await check('파도의 심장', () => __jr.Game.count('wave_heart') === 1);
  await shot('wavebell');

  step('15. 마법진으로 마레아 → 그레고르 → 4장 엔딩');
  d.choices.push('예');
  await d.interactAt(12, 11);
  await d.pump();
  await check('마레아 귀환', () => __jr.Field.map.id === 'marea' || __jr.Field.map.id);
  await d.stepOn(5, 11);
  d.choices.push('CANCEL');
  await d.talkTo('gregor');
  await check('제4장 완료', () => __jr.Game.flag('chapter4_done') === true && __jr.Quests.isDone('main5') && __jr.Game.count('anchor_badge') === 1);
  await check('진행도 32', () => __jr.Game.progress() === 32);
  await shot('ending');
  await d.stepOn(6, 9);

  step('16. 저장 → 불러오기');
  await J(() => __jr.Save.write(2));
  await J(() => { __jr.Game.state.gold = 1; });
  await J(() => __jr.Main.loadSlot(2));
  await sleep(1200); await d.pump();
  await check('불러온 뒤 4장 완료 유지', () => __jr.Game.flag('chapter4_done') === true && __jr.Game.state.gold > 1 && __jr.Field.map.id === 'marea' && __jr.Game.inParty('cassandra'));
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
