// 서브 퀘스트·분기·시스템 E2E: 실제 키 입력으로 대화/선택/전투를 진행해 각 결말을 검증
import { launch, sleep } from './helpers.mjs';
import { Driver } from './driver.mjs';
const { browser, page, errors } = await launch();
const log = (...a) => console.log(...a);
const d = new Driver(page, process.env.VERBOSE ? log : () => {});
let failures = 0;
const J = (fn, arg) => d.ev(fn, arg);
const check = async (label, fn) => { const r = await J(fn); if (r === true) log('  ✓ ' + label); else { failures++; log('  ✗ ' + label + ' → ' + JSON.stringify(r)); } };
const step = (t) => log('\n▶ ' + t);

// 기본 상태: 장로를 만난 뒤 (Lv5 2인)
async function fresh(extra) {
  d.choices.length = 0;
  await J((ex) => {
    const J = __jr;
    J.Settings.set('textSpeed', 3); J.Settings.set('battleSpeed', 2);
    J.Game.newState('테스터');
    J.Game.setFlag('met_elder'); J.Game.setFlag('prologue', 2);
    J.Quests.start('main1'); J.Quests.complete('main1'); J.Quests.start('main2');
    J.Game.join('bran');
    for (const id of ['hero', 'bran']) J.Game.addExp(id, 300);
    J.Game.healAll(); J.Game.state.gold = 500;
    J.Game.setFlag('debug_noenc');
    J.Engine.setScene(J.Field.layer); J.Field.enter('rivel', 19, 20, 'down');
    if (ex) new Function(ex)();
  }, extra || '');
  await sleep(300);
  await d.pump();
}

try {
  step('사라진 물건들 — 결말 A: 경비병에게 넘긴다');
  await fresh();
  await d.talkTo('rosa');
  await check('퀘스트 시작', () => __jr.Quests.isActive('s_thief'));
  await d.talkTo('gerald');
  await d.stepOn(29, 4); await d.talkTo('sena'); await d.stepOn(6, 10); // 세나
  await check('단서 2개 → 풍차 조사 단계', () => __jr.Quests.stage('s_thief') === 1);
  await d.walkTo(12, 23); await d.face('up'); await d.key('ArrowUp', 250); await d.pump(); // 잠긴 문
  await check('발자국 발견 → 풍차 진입 가능', () => __jr.Quests.stage('s_thief') === 2);
  d.choices.push(0);
  await d.stepOn(12, 22);
  await check('결말 A: 300G + 경비대 증표, 넬은 합류하지 않음', () => __jr.Quests.isDone('s_thief') && __jr.Quests.get('s_thief').outcome === 'jail' && __jr.Game.count('guard_badge') === 1 && !__jr.Game.inParty('nell'));

  step('사라진 물건들 — 결말 B: 용서하고 동료로');
  await fresh('__jr.Quests.start("s_thief"); __jr.Quests.setStage("s_thief", 2);');
  d.choices.push(1);
  await d.stepOn(12, 22);
  await check('결말 B: 넬 합류 + 반지·파이프 회수', () => __jr.Game.inParty('nell') && __jr.Game.count('ring') === 1 && __jr.Game.count('pipe') === 1 && __jr.Quests.get('s_thief').outcome === 'join');
  await d.stepOn(4, 6);
  await d.talkTo('rosa');
  await check('로사에게 반지 반환 → 사례금', () => __jr.Game.count('ring') === 0);
  await d.talkTo('gerald');
  await check('제랄드에게 파이프 반환 → 되살림 깃털', () => __jr.Game.count('pipe') === 0 && __jr.Game.count('feather') >= 1);
  await check('넬 합류 시 숨겨진 보물 반짝임 대상 존재', () => __jr.MAPS.rivel.objects.some((o) => o.hidden));
  await d.walkTo(36, 14);
  await d.key('Enter'); await sleep(200); await d.pump();
  await check('꽃밭 숨겨진 별조각 (발밑 조사)', () => __jr.Game.count('star') === 1);

  step('우물 속 목소리 + 버섯왕 (결투)');
  await fresh();
  await d.talkTo('tia');
  await check('티아 의뢰 시작', () => __jr.Quests.isActive('s_well'));
  d.choices.push('예');
  await d.interactAt(19, 14);
  await check('우물 → 지하 동굴', () => __jr.Field.map.id === 'cellar' && __jr.Quests.stage('s_well') === 1);
  d.choices.push('결투다!');
  await d.talkTo('mush');
  await check('버섯왕 격파 → 평온의 부적', () => __jr.Game.count('calm_charm') === 1 && __jr.Quests.stage('s_well') === 2);
  await d.stepOn(1, 1);
  await check('동굴 → 우물 앞으로 복귀', () => __jr.Field.map.id === 'rivel' && __jr.Field.player.y === 15);
  await d.talkTo('tia');
  await check('티아 보고 → 별조각', () => __jr.Quests.isDone('s_well') && __jr.Game.count('star') === 1);

  step('전하지 못한 편지 + 여관');
  await fresh('__jr.Game.setFlag("visited_hunter");');
  await d.stepOn(6, 9);
  d.choices.push('묵는다');
  await d.talkAcross(2, 3);
  await check('편지 받음 + 여관 숙박 (골드 차감, 전원 회복)', () => __jr.Game.count('letter') === 1 && __jr.Game.gold < 500);
  await J(() => __jr.Field.enter('cabin', 4, 5, 'up'));
  await d.pump();
  await d.talkTo('gordo');
  await check('고르도에게 편지 → 답장', () => __jr.Game.count('reply') === 1 && __jr.Quests.stage('s_letter') === 1);
  await J(() => __jr.Field.enter('inn', 6, 8, 'up'));
  await d.pump();
  d.choices.push('그만둔다');
  await d.talkAcross(2, 3);
  await check('답장 전달 → 수호의 펜던트 + 숙박 무료', () => __jr.Quests.isDone('s_letter') && __jr.Game.count('guard_pendant') === 1 && __jr.Game.flag('inn_free'));

  step('달빛 풀 / 멧돼지 소동 완료');
  await fresh('__jr.Quests.start("s_herb"); __jr.Game.addItem("moonherb", 3); __jr.Quests.onItem("moonherb"); __jr.Quests.start("s_boar"); __jr.Quests.get("s_boar").data.kills = 5; __jr.Quests.setStage("s_boar", 1);');
  await d.stepOn(32, 10);
  d.choices.push('나간다');
  await d.talkAcross(3, 3);
  await check('엘라: 달빛 풀 3개 → 상처약 판매 시작', () => __jr.Quests.isDone('s_herb') && __jr.Game.flag('potion_stock') && __jr.Game.count('moonherb') === 0);
  await d.stepOn(5, 8);
  await d.talkTo('owen');
  await check('오웬: 멧돼지 5마리 보고 → 가죽 방패', () => __jr.Quests.isDone('s_boar') && __jr.Game.count('leather_shield') === 1);

  step('별조각 수집가 피포 + 우산 교환');
  await fresh('__jr.Game.addItem("star", 4); __jr.Game.equip("hero", "weapon", null);');
  d.choices.push('예');
  await d.stepOn(32, 23);
  await d.talkTo('pippo');
  await check('우산 → 은방울 머리꽂이 교환', () => __jr.Game.flag('umbrella_traded') && __jr.Game.count('hairpin') === 1);
  await check('별조각 4개 → 별의 물 + 힘의 반지', () => __jr.Game.state.starsGiven === 4 && __jr.Game.count('starwater') === 1 && __jr.Game.count('power_ring') === 1);

  step('필드 메뉴: 주문으로 회복, 편성 변경');
  await fresh('__jr.Game.join("linette"); __jr.Game.join("mio"); __jr.Game.join("nell"); __jr.Game.healAll(); __jr.Game.state.members.bran.hp = 5;');
  d.choices.push('주문·특기', '미오', '치유', '브란', 'CANCEL', 'CANCEL');
  await page.keyboard.press('Escape'); await sleep(300);
  await d.pump();
  await check('미오의 치유로 브란 회복 (MP 소모)', () => __jr.Game.state.members.bran.hp > 5 && __jr.Game.state.members.mio.mp < __jr.Game.stats('mio').maxmp);
  d.choices.push('편성', 4, 1, 'CANCEL', 'CANCEL');
  await page.keyboard.press('Escape'); await sleep(300);
  await d.pump();
  await check('넬(대기) ↔ 브란 교체', () => __jr.Game.state.party.includes('nell') && __jr.Game.state.reserve.includes('bran'));

  step('게임 오버 → 신전에서 부활 (소지금 절반)');
  await fresh('__jr.Game.state.gold = 300; for (const id of __jr.Game.state.party) __jr.Game.state.members[id].hp = 1;');
  await J(() => { __jr.Events.run(() => __jr.S.battle(['velgar'], { boss: true, canEscape: false, bg: 'bell' })); });
  await d.pump({ timeout: 200000 });
  await check('패배 후 신전에서 깨어남, 전원 회복, 골드 150', () => __jr.Field.map.id === 'shrine' && __jr.Game.gold === 150 && __jr.Game.state.party.every((id) => __jr.Game.state.members[id].hp > 0));

  step('도망 (일반 전투)');
  await fresh();
  let escaped = false;
  for (let tries = 0; tries < 5 && !escaped; tries++) {
    await J(() => { window.__res = null; __jr.Events.run(async () => { window.__res = await __jr.S.battle(['moss_jelly']); }); });
    d.battlePolicy = async (d, s) => { if (s.kind === 'list' && s.items && s.items[0] === '공격') { await d.pickInList(5); return true; } return false; };
    await d.pump();
    escaped = (await J(() => window.__res)) === 'escape';
  }
  d.battlePolicy = null;
  if (escaped) log('  ✓ 도망 성공'); else { failures++; log('  ✗ 도망 실패 (5회)'); }
} catch (e) {
  failures++;
  log('\n!! aborted: ' + e.message);
  log(JSON.stringify(await d.state()));
  await page.screenshot({ path: '/tmp/side_fail.png' });
}
const errs = errors;
log('\nconsole errors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
log(failures ? `\nSIDE E2E FAILED (${failures})` : '\nSIDE E2E PASSED');
await browser.close();
process.exit(failures || errs.length ? 1 : 0);
