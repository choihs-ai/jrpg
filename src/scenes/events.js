'use strict';
// ─────────────────────────────────────────────────────────────
// Events / S: 이벤트 스크립트 실행기와 스크립트 API
//  모든 대화·연출·보상은 async 함수로 작성하고 Events.run()으로 실행한다.
//  예외가 나도 게임이 멈추지 않도록 busy 카운터를 항상 되돌린다.
// ─────────────────────────────────────────────────────────────
const Events = (() => {
  let running = 0;
  async function run(fn) {
    Field.busy = Field.busy + 1;
    running++;
    try {
      await fn();
    } catch (err) {
      if (!(err instanceof AbortSignalError)) {
        console.error('[Event] error:', err);
        try { await UI.message('[r](알 수 없는 문제가 생겼지만 모험은 계속된다.)[/]'); } catch (e) { /* */ }
      }
    } finally {
      running--;
      Field.busy = Math.max(0, Field.busy - 1);
      Field.refreshNpcs();
      Input.clearQueue();
    }
  }
  return { run, get running() { return running; } };
})();

const S = {
  // 대화: name이 null이면 지문
  say(name, text, opts = {}) {
    const pages = Array.isArray(text) ? text : [text];
    return UI.message(pages.map((t) => Util.fill(t)), Object.assign({ name: name ? Util.fill(name) : null }, opts));
  },
  async talk(seq) {
    for (const [name, text] of seq) await S.say(name, text);
  },
  // 선택지 — 선택한 인덱스 반환 (취소 시 cancelIndex)
  async ask(name, text, options, cancelIndex = options.length - 1) {
    const msg = new UI.MessageLayer([Util.fill(text)], { name: name ? Util.fill(name) : null, keepOpen: true });
    await msg.open();
    const w = Math.max(160, ...options.map((o) => Text.width(Engine.ctx, o, 18) + 60));
    const r = await UI.list({ x: Engine.W - w - 16, y: Engine.H - 150, anchor: 'bottom', w, items: options.map((o, i) => ({ label: o, value: i })), cancel: true });
    msg.close();
    return r ? r.value : cancelIndex;
  },
  async yesno(name, text) { return (await S.ask(name, text, ['예', '아니요'], 1)) === 0; },

  async give(itemId, n = 1, opts = {}) {
    const it = ITEMS[itemId];
    const got = Game.addItem(itemId, n);
    if (got < n) {
      await S.say(null, `${it.name}을(를) 더 가질 수 없다…`);
      return false;
    }
    if (!opts.silent) {
      const jingle = it.kind === 'key' || ['weapon', 'armor', 'shield', 'helm', 'accessory'].includes(it.kind) || itemId === 'starwater';
      if (jingle) Sound.jingle('item'); else Sound.sfx('chest');
      await S.say(null, `${opts.from || ''}[y]${it.name}[/]${n > 1 ? ` ${n}개` : ''}${Util.josa(it.name + (n > 1 ? `${n}개` : ''), '을')} 손에 넣었다!`);
    }
    const q = Quests.onItem(itemId);
    if (q) await S.say(null, q);
    return true;
  },
  take(itemId, n = 1) { return Game.removeItem(itemId, n); },
  async gold(n, fromChest) {
    Game.addGold(n);
    Sound.sfx('coin');
    await S.say(null, `[y]${n}G[/]를 손에 넣었다!`);
  },
  async join(id) {
    Game.join(id);
    Field.resetFollowers();
    Sound.jingle('join');
    await S.say(null, `[y]${Game.name(id)}[/]${Util.josa(Game.name(id), '이')} 동료가 되었다!`);
    if (!Game.state.party.includes(id)) await S.say(null, `(파티가 가득 차서 ${Game.name(id)}${Util.josa(Game.name(id), '은')} 대기 멤버가 되었다. 메뉴의 「편성」에서 바꿀 수 있다.)`);
  },
  flag: (k) => Game.flag(k),
  set(k, v = true) { Game.setFlag(k, v); },

  // 전투: 패배 시 게임오버 처리 후 스크립트 중단
  async battle(enemies, opts = {}) {
    const r = await Battle.run(Object.assign({ enemies }, opts));
    if (r === 'lose') {
      if (opts.loseOk) return 'lose';
      await GameOver.run();
      throw new AbortSignalError('gameover');
    }
    return r;
  },

  wait: (ms) => Engine.wait(ms),
  fadeOut: (ms = 400) => Engine.fadeOut(ms),
  fadeIn: (ms = 400) => Engine.fadeIn(ms),
  shake: (m = 4, s = 0.3) => Engine.shake(m, s),
  flash: (c = '#fff', s = 0.3) => Engine.flash(c, s),
  sfx: (n) => Sound.sfx(n),
  bgm: (n) => Sound.bgm(n),
  warp: (map, x, y, dir, opts) => Field.warp(map, x, y, dir, opts),
  walk: (dirs) => Field.walkPlayer(dirs.slice(), true),
  walkNpc: (id, dirs, speed) => Field.walkNpc(id, dirs.slice(), speed),
  face(id, dir) { const n = Field.npc(id); if (n) n.dir = dir; },
  facePlayer(dir) { Field.player.dir = dir; },
  hideNpc(id) { const n = Field.npc(id); if (n) n.visible = false; },

  // 퀘스트
  async startQuest(id) {
    if (!Quests.start(id)) return;
    Sound.jingle('quest');
    await S.say(null, `[${QUESTS[id].type === 'main' ? 'y' : 'g'}]${QUESTS[id].type === 'main' ? '메인' : '서브'} 퀘스트 「${QUESTS[id].name}」[/] 시작!\n[d]${Quests.goal(id)}[/]`);
  },
  stage(id, n) { Quests.setStage(id, n); },
  async completeQuest(id, outcome) {
    const r = Quests.complete(id, outcome);
    if (!r) return;
    Sound.jingle('quest');
    let t = `[${QUESTS[id].type === 'main' ? 'y' : 'g'}]퀘스트 「${QUESTS[id].name}」 완료![/]`;
    const parts = [];
    if (r.gold) parts.push(`${r.gold}G`);
    for (const [it, n] of r.items || []) parts.push(ITEMS[it].name + (n > 1 ? ` ×${n}` : ''));
    if (parts.length) t += `\n보상: ${parts.join(', ')}`;
    if (r.text) t += `\n[d]${r.text}[/]`;
    await S.say(null, t);
  },

  // 여관: 하룻밤 묵고 전원 회복
  async inn(price, keeper = '마르타') {
    const free = Game.flag('inn_free');
    const p = free ? 0 : price;
    const ok = await S.ask(keeper, free ? '어서 와요! 우리 은인에겐 숙박비 안 받아요. 쉬고 갈래요?' : `하룻밤에 [y]${p}G[/]예요. 쉬고 갈래요?`, ['묵는다', '그만둔다'], 1);
    if (ok !== 0) { await S.say(keeper, '언제든지 들러요!'); return false; }
    if (!Game.spend(p)) { Sound.sfx('buzzer'); await S.say(keeper, '어머, 돈이 모자라네요… 다음에 와요.'); return false; }
    await S.say(keeper, '편히 쉬어요. 좋은 꿈 꾸고요!');
    await Engine.fadeOut(600);
    Sound.stop();
    Game.healAll(true);
    await Sound.jingle('inn');
    await Engine.wait(300);
    Field.refreshNpcs();
    Sound.bgm(typeof Field.map.bgm === 'function' ? Field.map.bgm() : Field.map.bgm);
    await Engine.fadeIn(600);
    await S.say(keeper, '좋은 아침이에요! 오늘도 힘내요.');
    if (Events.afterInn) await Events.afterInn();
    return true;
  },

  // 저장 지점: 회복 + 저장
  async savePoint(healText) {
    if (healText) { Sound.sfx('save'); Game.healAll(true); Engine.flash('#9fe0ff', 0.4); await S.say(null, healText); }
    if (await S.yesno(null, '모험을 기록할까요?')) await Menu.saveScreen();
  },
};

// 게임오버: 신전에서 깨어나고 소지금 절반을 잃는다 (막힌 진행 없음)
const GameOver = {
  async run() {
    Sound.stop();
    Sound.jingle('gameover');
    await UI.message(['[r]일행은 모두 쓰러지고 말았다…[/]']);
    await Engine.fadeOut(900);
    const lost = Math.floor(Game.gold / 2);
    Game.addGold(-lost);
    Game.healAll(true);
    const r = Game.state.respawn;
    Field.enter(r.map, r.x, r.y, r.dir);
    await Engine.wait(400);
    await Engine.fadeIn(800);
    await S.say('대신관 세나', [`…정신이 드나요? 들판에 쓰러져 있던 걸 마을 사람들이 옮겨 왔어요.`, `소지금의 절반(${lost}G)은 치료비로 썼답니다. 무리하지 말고, 준비를 단단히 하세요.`]);
  },
};
