// 전체 플레이스루 E2E 테스트: 실제 키 입력으로 제1장 처음부터 끝까지 진행 + 저장/불러오기 검증
//  일반 전투는 실제로 싸우고, 보스 직전에는 '수련'을 대신해 경험치를 보정해 테스트 시간을 줄인다.
import { launch, sleep, ROOT } from './helpers.mjs';
import { Driver } from './driver.mjs';
import fs from 'fs';
const SHOTS = process.env.SHOTS || ROOT + '/tests/screens';
fs.mkdirSync(SHOTS, { recursive: true });
const { browser, page, errors } = await launch();
const log = (...a) => console.log(...a);
const d = new Driver(page, process.env.VERBOSE ? log : () => {});
let n = 0;
const shot = async (name) => { await page.screenshot({ path: `${SHOTS}/${String(++n).padStart(2, '0')}_${name}.png` }); };
let failures = 0;
const check = async (label, fn) => {
  const r = await d.ev(fn);
  if (r === true) log('  ✓ ' + label); else { failures++; log('  ✗ ' + label + ' → ' + JSON.stringify(r)); }
};
const J = (fn) => d.ev(fn);
const step = (t) => log('\n▶ ' + t);

// 보스전용 정책: 예고된 공격엔 방어, 위급하면 회복, 아니면 공격
d.battlePolicy = async (d, s) => {
  if (s.kind !== 'list' || !s.items || s.items[0] !== '공격') return false;
  const info = await J(() => {
    const B = __jr.Battle, core = B.core, a = B.active;
    if (!core || !a) return null;
    const ch = core.aliveEnemyList.find((e) => e.charging);
    const low = core.alivePartyList.filter((x) => x.hp / x.mhp < 0.4).length;
    const dead = core.party.filter((x) => !x.alive).length;
    return {
      id: a.id, defend: !!ch && (ch.charging === 'resonance' || (ch.mem && ch.mem.markTarget === a)),
      heal: low > 0 && a.ref.skills.includes('heal') && a.mp >= 3 && (a.id === 'mio' || a.id === 'hero'),
      revive: dead > 0 && a.ref.skills.includes('revive') && a.mp >= 10,
      healAll: low > 1 && a.ref.skills.includes('heal_all') && a.mp >= 9,
    };
  });
  if (!info) return false;
  const silenced = await J(() => !!(__jr.Battle.active && __jr.Battle.active.status.silence));
  const spell = async (name) => {
    if (silenced) return false;
    await d.pickInList(1); await sleep(120);
    const st = await d.state();
    if (!st.items || st.items[0] === '공격') return false;
    const idx = st.items.findIndex((l) => l === name);
    if (idx < 0) { await d.key('Escape'); return false; }
    await d.pickInList(idx); await sleep(120);
    await d.key('Enter'); await sleep(80);
    return true;
  };
  if (info.defend) { await d.pickInList(4); return true; }
  if (info.revive && (await spell('소생'))) return true;
  if (info.healAll && (await spell('치유의 비'))) return true;
  if (info.heal && (await spell('치유'))) return true;
  const ctx = await J(() => { const c = __jr.Battle.core, a = __jr.Battle.active; const boss = c.enemies.find((e) => e.def.boss && e.alive); return { boss: !!boss, phase: boss ? boss.mem.phase || 1 : 0, round: c.round, buffDef: c.party.some((p) => p.buffs.def), buffAtk: c.party.some((p) => p.buffs.atk), mp: a.mp, skills: a.ref.skills }; });
  const skill = async (name) => {
    await d.pickInList(2); await sleep(120);
    const st = await d.state();
    if (!st.items || st.items[0] === '공격') return false;
    const idx = st.items.findIndex((l) => l === name);
    if (idx < 0) { await d.key('Escape'); return false; }
    await d.pickInList(idx); await sleep(120);
    await d.key('Enter'); await sleep(80);
    return true;
  };
  if (ctx.boss) {
    if (info.id === 'mio' && !ctx.buffDef && ctx.mp >= 4 && ctx.skills.includes('protect') && (await spell('수호의 기도'))) return true;
    if (info.id === 'mio' && ctx.phase === 2 && ctx.mp >= 4 && (await spell('빛의 창'))) return true;
    if (info.id === 'bran' && !ctx.buffAtk && ctx.mp >= 3 && ctx.skills.includes('warcry') && (await skill('함성'))) return true;
    if (info.id === 'bran' && ctx.mp >= 2 && (await skill('강타'))) return true;
    if (info.id === 'linette' && ctx.mp >= 3 && (await spell('얼음 화살'))) return true;
    if (info.id === 'hero' && ctx.phase === 2 && ctx.mp >= 4 && (await skill('별빛 베기'))) return true;
    if (info.id === 'hero' && ctx.mp >= 5 && ctx.skills.includes('thunder') && (await spell('번개'))) return true;
  }
  await d.pickInList(0); await sleep(100); await d.key('Enter');
  return true;
};

// 실제 플레이어처럼 전투 사이에 회복한다 (약초·여관 대신 테스트에서는 즉시 회복)
let rests = 0;
const origPump = d.pump.bind(d);
d.pump = async (o) => {
  const s = await origPump(o);
  const low = await J(() => { const G = __jr.Game; return G.state.party.some((id) => { const m = G.state.members[id]; return m.hp < G.stats(id).maxhp * 0.45; }); });
  if (low && !(await J(() => __jr.Battle.core))) { rests++; await J(() => __jr.Game.healAll()); }
  return s;
};
try {
  await J(() => { __jr.Settings.set('textSpeed', 3); __jr.Settings.set('battleSpeed', 2); __jr.Settings.set('showGoal', 1); });
  step('1. 타이틀 → 새 게임');
  await sleep(500); await shot('title');
  await d.key('Enter'); await sleep(400);
  await shot('title_menu');
  await d.key('Enter'); await sleep(800);
  await d.pump();
  await check('여관에서 시작, 이름 입력 반영, 퀘스트 「낯선 하늘 아래」', () => __jr.Field.map.id === 'inn' && __jr.Game.state.heroName === '테스터' && __jr.Quests.isActive('main1'));
  await shot('inn_start');

  step('2. 마을 탐험 + 장로 (첫 퀘스트)');
  await d.stepOn(6, 9);
  await check('여관 문 → 마을 (문 앞 정위치)', () => __jr.Field.map.id === 'rivel' && __jr.Field.player.x === 6 && __jr.Field.player.y === 10);
  await d.interactAt(24, 14); // 제랄드 할아버지
  await d.interactAt(10, 15); // 술통: 별조각
  await check('숨겨진 별조각 획득 (술통)', () => __jr.Game.count('star') === 1);
  await d.stepOn(18, 4);
  await shot('elder');
  await check('장로 이벤트: 브란 합류 + 메인 퀘스트 「북쪽의 이변」', () => __jr.Game.state.party.join() === 'hero,bran' && __jr.Quests.isActive('main2') && __jr.Quests.isDone('main1'));
  await d.stepOn(5, 8);

  step('3. 상점: 대장간에서 장비 구매·장착, 도구점에서 약초 구매');
  await d.stepOn(6, 16);
  const atk0 = await J(() => __jr.Game.stats('hero').atk);
  d.choices.push('산다', '나무 몽둥이', '예', '테스터', '아니요', 'CANCEL', '나간다');
  await d.talkAcross(3, 3);
  await check('나무 몽둥이 구매 + 즉시 장착 → 공격력 상승', () => __jr.Game.state.members.hero.equip.weapon === 'club');
  log('    hero atk', atk0, '→', await J(() => __jr.Game.stats('hero').atk), ' gold', await J(() => __jr.Game.gold));
  await d.stepOn(5, 8);
  await d.stepOn(32, 10);
  const herb0 = await J(() => __jr.Game.count('herb'));
  d.choices.push('산다', '약초', 'CANCEL', '나간다');
  await d.talkAcross(3, 3);
  await check('약초 구매 (소지금 차감)', () => __jr.Game.count('herb') > 0);
  log('    herbs', herb0, '→', await J(() => __jr.Game.count('herb')), ' gold', await J(() => __jr.Game.gold));
  await check('엘라 할머니 의뢰 「달빛 풀 채집」 시작', () => __jr.Quests.isActive('s_herb'));
  await d.stepOn(5, 8);

  step('4. 마을 밖 평원 → 몬스터와 전투');
  await d.walkTo(19, 28);
  await d.walkTo(19, 29);
  await d.ev(() => { __jr.Field.player.dir = 'down'; });
  await page.keyboard.down('ArrowDown'); await sleep(250); await page.keyboard.up('ArrowDown');
  await d.pump();
  await check('마을 남쪽 출구 → 평원 (마을 아이콘 아래)', () => __jr.Field.map.id === 'field' && __jr.Field.player.y === 39);
  await shot('field');
  const kills0 = await J(() => Object.values(__jr.Game.state.kills).reduce((a, b) => a + b, 0));
  // 평원을 오가며 전투가 일어날 때까지 이동
  let guard = 0;
  while (((await J(() => Object.values(__jr.Game.state.kills).reduce((a, b) => a + b, 0))) < kills0 + 3 || (await J(() => __jr.Game.state.members.hero.level)) < 2) && guard++ < 40) {
    await d.walkTo(guard % 2 ? 22 : 28, 32 + (guard % 3));
  }
  await check('전투 승리로 처치 기록·경험치·골드 획득', () => Object.values(__jr.Game.state.kills).reduce((a, b) => a + b, 0) >= 3 && __jr.Game.state.members.hero.exp > 0);
  await check('레벨업 (Lv2 이상)', () => __jr.Game.state.members.hero.level >= 2);
  await d.interactAt(22, 35); // 달빛 풀
  await check('달빛 풀 채집', () => __jr.Game.count('moonherb') === 1);

  step('5. 사냥꾼 고르도');
  await d.stepOn(50, 30);
  await check('오두막 진입', () => __jr.Field.map.id === 'cabin');
  await d.interactAt(6, 3);
  await check('사냥꾼 방문 → 목표: 북쪽 고개 / 「사냥개 바우」 시작', () => __jr.Quests.stage('main2') === 1 && __jr.Quests.isActive('s_dog'));
  await shot('cabin');
  await d.stepOn(4, 6);

  step('6. 서쪽 숲 비밀 통로 → 바우 찾기');
  await d.walkTo(17, 27);
  await d.walkTo(10, 27);
  await check('비밀 나무 통로 통과', () => __jr.Field.player.x <= 10 && __jr.Field.player.y === 27);
  await d.interactAt(7, 27);
  await check('바우 발견 → 고르도에게 보고 단계', () => __jr.Quests.stage('s_dog') === 1);
  await d.interactAt(5, 26);
  await shot('grove');

  step('7. 장비·수련 보정 후 북쪽 고개 (리네트 합류 + 철엄니)');
  const lv = await J(() => __jr.Game.state.members.hero.level);
  await J(() => { const G = __jr.Game; for (const id of ['hero', 'bran']) { const m = G.state.members[id]; if (m.level < 5) G.addExp(id, 231 - m.exp); } G.healAll(); G.addGold(400); });
  log(`    (수련 보정: Lv${lv} → Lv5, 실제 플레이 수련 시간 단축)`);
  await d.walkTo(31, 17);
  await d.walkTo(31, 16);
  await d.pump({ timeout: 240000 });
  await shot('after_ironfang');
  await check('리네트 합류 + 철엄니 격파 → 목표: 유적 입구', () => __jr.Game.inParty('linette') && __jr.Game.flag('ironfang_defeated') && __jr.Quests.stage('main2') === 2);

  step('8. 유적 입구 → 별의 봉인');
  await d.stepOn(31, 5);
  await check('던전 진입 (잠든 종의 유적 B1)', () => __jr.Field.map.id === 'ruins1');
  await shot('ruins_enter');
  await d.interactAt(15, 17);
  await check('봉인 확인 → 목표: 신전', () => __jr.Game.flag('saw_seal') && __jr.Quests.stage('main2') === 3);

  step('9. 귀환의 날개 (메뉴 → 도구 → 사용)');
  d.choices.push('도구', '귀환의 날개', '사용');
  await page.keyboard.press('Escape'); await sleep(300);
  await d.pump();
  await check('귀환의 날개로 마을 귀환', () => __jr.Field.map.id === 'rivel');

  step('10. 신전: 별빛 방울 + 미오 합류');
  await d.stepOn(29, 4);
  await d.interactAt(6, 3);
  await check('미오 합류 + 별빛 방울', () => __jr.Game.inParty('mio') && __jr.Game.count('chime') === 1 && __jr.Quests.stage('main2') === 4);
  await d.stepOn(6, 10);

  step('11. 다시 유적으로 → 봉인 해제');
  await J(() => { const G = __jr.Game; for (const id of G.state.party) { const m = G.state.members[id]; if (m.level < 6) G.addExp(id, 396 - m.exp); } G.healAll(); });
  log('    (수련 보정: 전원 Lv6)');
  await d.walkTo(19, 29);
  await page.keyboard.down('ArrowDown'); await sleep(250); await page.keyboard.up('ArrowDown');
  await d.pump();
  await d.stepOn(31, 5);
  await d.interactAt(15, 17);
  await check('봉인 해제 → 목표: 유적 깊은 곳', () => __jr.Game.flag('seal_opened') && __jr.Quests.stage('main2') === 5);

  step('12. B1 탐험: 열쇠, 비밀 벽, 철창');
  await d.interactAt(3, 3);
  await check('녹슨 열쇠', () => __jr.Game.count('rusty_key') === 1);
  d.choices.push('예');
  await d.interactAt(3, 10);
  await check('금 간 벽 → 비밀 통로', () => __jr.Game.flag('crack_b1'));
  await d.interactAt(3, 14);
  await d.interactAt(5, 16);
  await check('비밀의 방 보물 (그림자 망토, 별조각)', () => __jr.Game.count('shadow_cloak') === 1 && __jr.Game.count('star') >= 2);
  await d.interactAt(16, 8);
  await d.interactAt(15, 5);
  await check('녹슨 열쇠로 철창 열기', () => __jr.Game.flag('gate_b1'));
  await shot('ruins_b1');
  await d.stepOn(15, 2);
  await check('B2 도착', () => __jr.Field.map.id === 'ruins2');

  step('13. B2: 레버 두 개 → 수정에서 회복·저장');
  await d.interactAt(5, 3);
  await d.interactAt(24, 3);
  await check('레버 두 개 → 철창 개방', () => __jr.Game.flag('lever_w') && __jr.Game.flag('lever_e'));
  await d.interactAt(3, 20);
  await d.interactAt(26, 20);
  d.choices.push('예', 0, '예');
  await d.interactAt(15, 7);
  await check('수정에서 기록 1에 저장', () => !!localStorage.getItem('starbell-jrpg.save.1'));
  await shot('ruins_b2');

  step('14. 종의 방: 벨가르');
  await J(() => {
    const G = __jr.Game;
    for (const id of G.state.party) { const m = G.state.members[id]; if (m.level < 9) G.addExp(id, 1285 - m.exp); }
    // 던전에서 모은 골드로 대장간 장비를 샀다고 가정
    const gear = { hero: ['steel_sword', 'chain_mail', 'iron_shield', 'iron_helm'], bran: ['iron_axe', 'chain_mail', 'leather_shield', 'iron_helm'], linette: ['spellbook', 'wizard_hat'], mio: ['blessed_staff', 'leather_hat'] };
    for (const id in gear) for (const it of gear[id]) { if (G.count(it) < 1) G.addItem(it, 1); G.equip(id, __jr.ITEMS[it].kind, it); }
    G.healAll(); G.addItem('potion', 3);
  });
  log('    (수련·장비 보정: 전원 Lv9 + 대장간 철 장비)');
  await d.stepOn(15, 2);
  await check('종의 방 진입', () => __jr.Field.map.id === 'bell');
  await d.walkTo(9, 10);
  await d.walkTo(9, 9);
  await d.pump({ timeout: 400000 });
  await shot('after_velgar');
  await check('벨가르 격파 + 종의 파편 + 목표: 장로에게 보고', () => __jr.Game.flag('velgar_defeated') && __jr.Game.count('bell_shard') === 1 && __jr.Quests.stage('main2') === 6);

  step('15. 귀환 마법진 → 장로에게 보고 (엔딩)');
  d.choices.push('예');
  await d.interactAt(12, 12);
  await check('마법진으로 마을 귀환', () => __jr.Field.map.id === 'rivel');
  await d.stepOn(18, 4);
  d.choices.push('아니요');
  await d.interactAt(8, 3);
  await shot('ending');
  await check('메인 퀘스트 완료 + 제1장 완료 + 보상', () => __jr.Quests.isDone('main2') && __jr.Game.flag('chapter1_done') && __jr.Game.count('courage_token') === 1);

  step('16. 저장 → 타이틀 → 이어하기');
  const snap = await J(() => ({ gold: __jr.Game.gold, lv: __jr.Game.state.members.hero.level, party: __jr.Game.state.party.join(), map: __jr.Field.map.id, x: __jr.Field.player.x, y: __jr.Field.player.y, flags: Object.keys(__jr.Game.state.flags).length, inv: JSON.stringify(__jr.Game.state.inv) }));
  const slot2 = await J(() => !!localStorage.getItem('starbell-jrpg.save.2'));
  d.choices.push('저장', 1, ...(slot2 ? ['예'] : []), 'CANCEL');
  await page.keyboard.press('Escape'); await sleep(300);
  await d.pump();
  const waitFor = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await J(fn)) return true; await sleep(100); } throw new Error('waitFor timeout'); };
  const isList = () => __jr.Engine.top() instanceof __jr.UI.ListWindow;
  await page.keyboard.press('Escape');
  await waitFor(isList);
  await d.pickInList('타이틀로');
  await waitFor(isList);
  await d.pickInList('예');
  await waitFor(() => !__jr.Engine.layers.includes(__jr.Field.layer) && !__jr.Engine.fading);
  await sleep(400);
  await shot('back_to_title');
  await d.key('Enter');
  await waitFor(isList);
  await d.pickInList('이어하기');
  await waitFor(() => __jr.Engine.top() instanceof __jr.UI.ListWindow && __jr.Engine.top().o.title && __jr.Engine.top().o.title.includes('불러올'));
  await d.pickInList(1);
  await sleep(300);
  if (await J(isList)) await d.pickInList('예');
  await waitFor(() => __jr.Engine.top() === __jr.Field.layer && !__jr.Engine.fading);
  await sleep(500);
  await shot('reloaded');
  const after = await J(() => ({ gold: __jr.Game.gold, lv: __jr.Game.state.members.hero.level, party: __jr.Game.state.party.join(), map: __jr.Field.map.id, x: __jr.Field.player.x, y: __jr.Field.player.y, flags: Object.keys(__jr.Game.state.flags).length, inv: JSON.stringify(__jr.Game.state.inv) }));
  log('    before', JSON.stringify(snap));
  log('    after ', JSON.stringify(after));
  if (JSON.stringify(snap) === JSON.stringify(after)) log('  ✓ 불러온 뒤 진행 상태가 완전히 일치'); else { failures++; log('  ✗ 상태 불일치'); }
} catch (e) {
  failures++;
  log('\n!! E2E aborted: ' + e.message);
  await shot('failure');
  log(JSON.stringify(await d.state()));
}
log(`\n(전투 사이 회복 ${rests}회)`);
const errs = errors.filter((e) => !e.includes('spawn'));
log('\nconsole errors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
log(failures ? `\nE2E FAILED (${failures})` : '\nE2E PASSED');
await browser.close();
process.exit(failures || errs.length ? 1 : 0);
