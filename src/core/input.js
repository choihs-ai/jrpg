'use strict';
// ─────────────────────────────────────────────────────────────
// Input: 키보드 / 마우스 / 터치를 공통 '액션'으로 변환
//  액션: up down left right confirm cancel menu run map
// ─────────────────────────────────────────────────────────────
const Input = (() => {
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'confirm', Enter: 'confirm', NumpadEnter: 'confirm', Space: 'confirm', KeyJ: 'confirm',
    KeyX: 'cancel', Escape: 'cancel', Backspace: 'cancel', KeyK: 'cancel',
    KeyC: 'menu', KeyI: 'menu', Tab: 'menu',
    KeyM: 'map',
    ShiftLeft: 'run', ShiftRight: 'run',
    KeyQ: 'pageup', PageUp: 'pageup', KeyE: 'pagedown', PageDown: 'pagedown',
  };
  const DIRS = ['up', 'down', 'left', 'right'];
  const REPEAT_DELAY = 0.32, REPEAT_RATE = 0.075;

  const held = {};          // action → 눌린 소스 수
  const heldOrder = [];     // 방향키 누른 순서 (마지막이 우선)
  const queue = [];         // 이번 프레임에 처리할 액션
  const repeatT = {};
  let pointerHandler = null;
  let lastPointerType = 'mouse';
  let enabled = true;
  const listeners = new Set(); // 최초 입력 감지(오디오 잠금 해제 등)

  function press(action) {
    held[action] = (held[action] || 0) + 1;
    if (held[action] === 1) {
      if (DIRS.includes(action)) {
        const i = heldOrder.indexOf(action);
        if (i >= 0) heldOrder.splice(i, 1);
        heldOrder.push(action);
        repeatT[action] = -REPEAT_DELAY;
      }
      if (enabled) queue.push(action);
    }
    for (const l of listeners) l(action);
  }
  function release(action) {
    if (!held[action]) return;
    held[action] = Math.max(0, held[action] - 1);
    if (held[action] === 0) {
      const i = heldOrder.indexOf(action);
      if (i >= 0) heldOrder.splice(i, 1);
    }
  }
  function releaseAll() {
    for (const k in held) held[k] = 0;
    heldOrder.length = 0;
  }

  const keysDown = new Set();
  function onKeyDown(e) {
    // 이름 입력창 등 DOM 입력 중에는 게임 입력을 막는다
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const a = KEYMAP[e.code];
    if (!a) return;
    e.preventDefault();
    if (keysDown.has(e.code)) return; // 키 자동반복은 자체 처리
    keysDown.add(e.code);
    press(a);
  }
  function onKeyUp(e) {
    const a = KEYMAP[e.code];
    if (!a) return;
    if (keysDown.has(e.code)) { keysDown.delete(e.code); release(a); }
  }

  function init(canvas, toLogical) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => { keysDown.clear(); releaseAll(); });
    const send = (type, e) => {
      const p = toLogical(e.clientX, e.clientY);
      lastPointerType = e.pointerType || 'mouse';
      if (pointerHandler) pointerHandler({ type, x: p.x, y: p.y, button: e.button, pointerType: lastPointerType });
    };
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      for (const l of listeners) l('pointer');
      if (e.button === 2) { press('cancel'); release('cancel'); return; }
      send('down', e);
    });
    canvas.addEventListener('pointermove', (e) => send('move', e));
    canvas.addEventListener('pointerup', (e) => { if (e.button !== 2) send('up', e); });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (pointerHandler) {
        const p = toLogical(e.clientX, e.clientY);
        pointerHandler({ type: 'wheel', x: p.x, y: p.y, dy: Math.sign(e.deltaY) });
      }
    }, { passive: false });
  }

  // 터치 가상 버튼
  function bindVirtualButton(el, action) {
    const down = (e) => { e.preventDefault(); el.classList.add('on'); press(action); lastPointerType = 'touch'; };
    const up = (e) => { e.preventDefault(); if (el.classList.contains('on')) { el.classList.remove('on'); release(action); } };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // 방향 패드: 손가락 위치에 따라 방향 결정 (슬라이드 지원)
  function bindDpad(el) {
    let cur = null;
    const setDir = (d) => {
      if (d === cur) return;
      if (cur) release(cur);
      cur = d;
      if (cur) press(cur);
      el.dataset.dir = cur || '';
    };
    const fromEvent = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return null;
      return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); lastPointerType = 'touch'; setDir(fromEvent(e)); });
    el.addEventListener('pointermove', (e) => { if (cur !== null || e.buttons) setDir(fromEvent(e)); });
    const end = (e) => { e.preventDefault(); setDir(null); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function update(dt) {
    // 방향키 자동 반복 (메뉴 커서용)
    const d = heldOrder[heldOrder.length - 1];
    if (d && held[d]) {
      repeatT[d] += dt;
      while (repeatT[d] >= REPEAT_RATE) {
        repeatT[d] -= REPEAT_RATE;
        if (enabled) queue.push(d);
      }
    }
  }

  return {
    init, update, bindVirtualButton, bindDpad, press, release, releaseAll,
    consume() { const q = queue.splice(0); return q; },
    clearQueue() { queue.length = 0; },
    isHeld: (a) => !!held[a],
    dir() { for (let i = heldOrder.length - 1; i >= 0; i--) if (held[heldOrder[i]]) return heldOrder[i]; return null; },
    setPointerHandler(fn) { pointerHandler = fn; },
    onAny(fn) { listeners.add(fn); },
    get pointerType() { return lastPointerType; },
    setEnabled(v) { enabled = v; if (!v) queue.length = 0; },
  };
})();
