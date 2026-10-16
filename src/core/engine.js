'use strict';
// ─────────────────────────────────────────────────────────────
// Engine: 캔버스, 레이어 스택, 메인 루프, 화면 효과(페이드/흔들림/섬광)
//  논리 해상도 640x480 (UI·텍스트), 월드는 320x240 픽셀 버퍼를 2배 확대
// ─────────────────────────────────────────────────────────────
const Engine = (() => {
  const W = 640, H = 480, LW = 320, LH = 240;
  let canvas, ctx, low, lctx;
  let scale = 1;
  const layers = [];
  let last = 0;
  let time = 0;
  const fx = {
    fade: 0, fadeTarget: 0, fadeSpeed: 0, fadeResolve: null, fadeColor: '#000',
    shakeT: 0, shakeMag: 0, flashT: 0, flashDur: 0, flashColor: '#fff',
  };
  let errorCount = 0;
  let lastError = null;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    low = document.createElement('canvas');
    low.width = LW; low.height = LH;
    lctx = low.getContext('2d');
    lctx.imageSmoothingEnabled = false;
    resize();
    window.addEventListener('resize', resize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    Input.init(canvas, toLogical);
    Input.setPointerHandler((ev) => {
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        if (l.onPointer) { if (l.onPointer(ev) !== false) break; }
        if (l.modal !== false) break;
      }
    });
    requestAnimationFrame(loop);
  }

  function resize() {
    const wrap = canvas.parentElement;
    const r = wrap.getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H);
    const cssW = Math.max(1, Math.floor(W * s)), cssH = Math.max(1, Math.floor(H * s));
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    scale = canvas.width / W;
    document.documentElement.style.setProperty('--game-w', cssW + 'px');
    document.documentElement.style.setProperty('--game-h', cssH + 'px');
  }

  function toLogical(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
  }

  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    step(dt);
  }

  function step(dt) {
    time += dt;
    try {
      Input.update(dt);
      const actions = Input.consume();
      const top = layers[layers.length - 1];
      if (top && fx.fadeResolve === null) {
        for (const a of actions) if (top.onAction) top.onAction(a);
      }
      // 레이어 업데이트 (복사본으로 순회 — 업데이트 중 추가/삭제 대비)
      for (const l of layers.slice()) if (l.update) l.update(dt);
      updateFx(dt);
      draw();
    } catch (err) {
      errorCount++;
      lastError = err;
      if (errorCount < 20) console.error('[Engine] frame error:', err);
    }
  }

  function updateFx(dt) {
    if (fx.fadeSpeed !== 0) {
      fx.fade += fx.fadeSpeed * dt;
      if ((fx.fadeSpeed > 0 && fx.fade >= fx.fadeTarget) || (fx.fadeSpeed < 0 && fx.fade <= fx.fadeTarget)) {
        fx.fade = fx.fadeTarget; fx.fadeSpeed = 0;
        const r = fx.fadeResolve; fx.fadeResolve = null;
        if (r) r();
      }
    }
    if (fx.shakeT > 0) fx.shakeT -= dt;
    if (fx.flashT > 0) fx.flashT -= dt;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let ox = 0, oy = 0;
    if (fx.shakeT > 0) {
      const m = fx.shakeMag * Math.min(1, fx.shakeT * 4);
      ox = (Math.random() * 2 - 1) * m; oy = (Math.random() * 2 - 1) * m;
    }
    ctx.setTransform(scale, 0, 0, scale, ox * scale, oy * scale);
    ctx.imageSmoothingEnabled = false;
    const drawLayer = (l) => {
      ctx.save();
      try { l.draw(ctx); } catch (err) { errorCount++; lastError = err; if (errorCount < 20) console.error('[Engine] draw error:', err); }
      ctx.restore();
    };
    for (const l of layers) if (l.draw && !l.overFade) drawLayer(l);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (fx.flashT > 0) {
      ctx.globalAlpha = Math.max(0, fx.flashT / fx.flashDur) * 0.85;
      ctx.fillStyle = fx.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (fx.fade > 0) {
      ctx.globalAlpha = Math.min(1, fx.fade);
      ctx.fillStyle = fx.fadeColor;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    // 대화창·선택창은 페이드 위에 그린다 (검은 화면 위 내레이션)
    for (const l of layers) if (l.draw && l.overFade) drawLayer(l);
  }

  // 픽셀 월드 버퍼를 화면에 확대 출력
  function blitLow(c) {
    c.imageSmoothingEnabled = false;
    c.drawImage(low, 0, 0, W, H);
  }

  function fadeTo(target, ms = 300, color = '#000') {
    return new Promise((resolve) => {
      if (fx.fadeResolve) { const r = fx.fadeResolve; fx.fadeResolve = null; r(); }
      fx.fadeColor = color;
      if (ms <= 0 || Math.abs(fx.fade - target) < 0.001) { fx.fade = target; fx.fadeSpeed = 0; resolve(); return; }
      fx.fadeTarget = target;
      fx.fadeSpeed = (target - fx.fade) / (ms / 1000);
      fx.fadeResolve = resolve;
    });
  }

  return {
    W, H, LW, LH, init, resize, step,
    get ctx() { return ctx; }, get low() { return low; }, get lctx() { return lctx; },
    get time() { return time; },
    get layers() { return layers; },
    get lastError() { return lastError; },
    blitLow,
    push(layer) { layers.push(layer); if (layer.onPush) layer.onPush(); return layer; },
    remove(layer) {
      const i = layers.indexOf(layer);
      if (i >= 0) { layers.splice(i, 1); if (layer.onRemove) layer.onRemove(); }
    },
    top() { return layers[layers.length - 1]; },
    isTop(layer) { return layers[layers.length - 1] === layer; },
    setScene(layer) {
      for (const l of layers.splice(0)) if (l.onRemove) l.onRemove();
      layers.push(layer);
      if (layer.onPush) layer.onPush();
      Input.clearQueue();
    },
    fadeOut: (ms, color) => fadeTo(1, ms, color),
    fadeIn: (ms, color) => fadeTo(0, ms, color),
    get fading() { return fx.fadeResolve !== null; },
    get fadeLevel() { return fx.fade; },
    shake(mag = 4, sec = 0.3) { fx.shakeMag = mag; fx.shakeT = sec; },
    flash(color = '#fff', sec = 0.25) { fx.flashColor = color; fx.flashT = sec; fx.flashDur = sec; },
    wait(ms) { return new Promise((r) => setTimeout(r, ms)); },
    // 프레임 기반 대기 (탭 비활성 시에도 순서 보장)
    frames(n = 1) {
      return new Promise((resolve) => {
        let c = n;
        const tick = () => { if (--c <= 0) resolve(); else requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    },
  };
})();
