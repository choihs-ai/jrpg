'use strict';
// ─────────────────────────────────────────────────────────────
// Main: 부팅, 새 게임/불러오기/타이틀 전환, 터치 버튼, 디버그 훅
// ─────────────────────────────────────────────────────────────
const Main = (() => {
  let touchSeen = false;

  function applyTouchSetting() {
    const el = document.getElementById('touch');
    if (!el) return;
    const mode = Settings.get('touch');
    const show = mode === 1 || (mode === 0 && touchSeen);
    document.body.classList.toggle('touch-on', show);
    Engine.resize();
  }

  function initTouch() {
    const dpad = document.getElementById('dpad');
    if (dpad) Input.bindDpad(dpad);
    document.querySelectorAll('#touch [data-act]').forEach((b) => Input.bindVirtualButton(b, b.dataset.act));
    const detect = (e) => {
      if (e.pointerType === 'touch' && !touchSeen) { touchSeen = true; applyTouchSetting(); }
    };
    window.addEventListener('pointerdown', detect, true);
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) touchSeen = true;
    applyTouchSetting();
  }

  async function newGame() {
    Game.newState('하루');
    Engine.setScene(Field.layer);
    await Events.run(() => Story.prologue());
  }

  async function loadSlot(slot) {
    if (!Save.load(slot)) {
      Sound.sfx('buzzer');
      await UI.message('[r]기록을 불러오지 못했습니다. 데이터가 손상되었을 수 있습니다.[/]');
      return false;
    }
    for (const l of Engine.layers.slice()) { if (l.close) l.close(); else Engine.remove(l); }
    await Engine.fadeOut(250);
    Engine.setScene(Field.layer);
    const p = Game.state.pos;
    Field.enter(p.map, p.x, p.y, p.dir);
    Sound.sfx('save');
    await Engine.fadeIn(350);
    Field.showToast('기록을 불러왔습니다.');
    return true;
  }

  async function toTitle() {
    await Engine.fadeOut(400);
    for (const l of Engine.layers.slice()) { if (l.close) l.close(); }
    Engine.setScene(Title.layer);
    await Engine.fadeIn(400);
  }

  function boot() {
    Settings.load();
    Engine.init(document.getElementById('game'));
    initTouch();
    Input.onAny(() => Sound.unlock());
    Settings.onChange(() => Sound.applyVolume());
    // 플레이 시간
    let last = performance.now();
    setInterval(() => {
      const now = performance.now();
      if (Game.state && Engine.layers.includes(Field.layer) && !document.hidden) Game.state.playTime += (now - last) / 1000;
      last = now;
    }, 1000);
    Engine.setScene(Title.layer);
    // 테스트·디버그용 훅
    window.__jr = { Game, Field, Engine, Battle, Save, Quests, Settings, Sound, Input, Menu, Story, MAPS, ITEMS, SKILLS, MONSTERS, Events, S, UI, Main, BattleCore, Util };
  }

  return { boot, newGame, loadSlot, toTitle, applyTouchSetting };
})();

window.addEventListener('load', Main.boot);
