'use strict';
// ─────────────────────────────────────────────────────────────
// Battle: 전투 화면 (연출 + 명령 입력). 규칙은 BattleCore가 담당.
// ─────────────────────────────────────────────────────────────
const BattleBG = (() => {
  const cache = {};
  function sky(p, top, bot, h) {
    for (let y = 0; y < h; y++) { const t = y / h; p.rect(0, y, 320, 1, Pix.mix(top, bot, t)); }
  }
  const DEFS = {
    plains(p, g) {
      sky(p, '#5ea8ec', '#bfe4ff', 110);
      g.fillStyle = '#ffffff'; for (const [x, y, w] of [[30, 20, 40], [200, 34, 56], [140, 12, 30]]) { g.fillRect(x, y, w, 6); g.fillRect(x + 6, y - 4, w - 14, 4); }
      g.fillStyle = '#7aa6c8'; g.beginPath(); g.moveTo(0, 100); for (let x = 0; x <= 320; x += 20) g.lineTo(x, 84 + Math.sin(x * 0.04) * 10); g.lineTo(320, 110); g.lineTo(0, 110); g.fill();
      g.fillStyle = '#4f9b3f'; g.beginPath(); g.moveTo(0, 104); for (let x = 0; x <= 320; x += 16) g.lineTo(x, 98 + Math.sin(x * 0.07 + 1) * 5); g.lineTo(320, 240); g.lineTo(0, 240); g.fill();
      p.rect(0, 112, 320, 128, '#5fae4c');
      p.noise(['#4f9b3f', '#76c45e'], 0.06, 3, [0, 112, 320, 128]);
      for (let i = 0; i < 6; i++) p.ellipse(40 + i * 50, 150 + (i % 2) * 12, 30, 6, 'rgba(60,120,50,0.5)');
    },
    forest(p, g) {
      sky(p, '#3a6a5a', '#9ad0a8', 110);
      for (let i = 0; i < 14; i++) { const x = i * 24 - 6, h = 60 + (i * 37) % 30; g.fillStyle = i % 2 ? '#1f5a30' : '#2a6a3a'; g.beginPath(); g.moveTo(x, 112); g.lineTo(x + 14, 112 - h); g.lineTo(x + 28, 112); g.fill(); }
      p.rect(0, 112, 320, 128, '#4a8a3a'); p.noise(['#3a7a30', '#5a9a48'], 0.08, 7, [0, 112, 320, 128]);
      for (let i = 0; i < 5; i++) p.ellipse(30 + i * 66, 160, 26, 5, 'rgba(30,70,30,0.5)');
    },
    ruins(p, g) {
      p.rect(0, 0, 320, 240, '#1c1a26');
      for (let y = 0; y < 112; y += 8) for (let x = (y / 8) % 2 ? 0 : 12; x < 320; x += 24) { p.rect(x, y, 23, 7, '#2e2a3c'); p.rect(x, y, 23, 1, '#3a3650'); }
      for (const x of [40, 270]) { p.rect(x, 20, 18, 92, '#4a465c'); p.rect(x, 20, 4, 92, '#5e5a72'); p.rect(x - 4, 16, 26, 6, '#5e5a72'); }
      for (const x of [100, 220]) { p.rect(x, 50, 3, 10, '#5e3818'); p.circle(x + 1, 46, 3, '#ff9030'); p.circle(x + 1, 45, 1, '#ffe080'); }
      p.rect(0, 112, 320, 128, '#3c384a'); for (let x = 0; x < 320; x += 32) p.rect(x, 112, 1, 128, '#2e2a3c'); for (let y = 112; y < 240; y += 16) p.rect(0, y, 320, 1, '#2e2a3c');
      g.fillStyle = 'rgba(124,196,255,0.08)'; g.beginPath(); g.ellipse(160, 150, 120, 26, 0, 0, Math.PI * 2); g.fill();
    },
    cave(p, g) {
      p.rect(0, 0, 320, 240, '#241c16');
      for (let i = 0; i < 12; i++) { const x = i * 30; g.fillStyle = '#3a2e22'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 15, 26 + (i * 13) % 20); g.lineTo(x + 30, 0); g.fill(); }
      p.rect(0, 112, 320, 128, '#4a3c2e'); p.noise(['#3a2e22', '#5a4a38'], 0.1, 11, [0, 112, 320, 128]);
      g.fillStyle = 'rgba(60,120,200,0.25)'; g.beginPath(); g.ellipse(250, 140, 50, 10, 0, 0, Math.PI * 2); g.fill();
    },
    bell(p, g) {
      sky(p, '#140c24', '#3a2050', 112);
      g.fillStyle = 'rgba(200,160,80,0.25)'; g.beginPath(); g.moveTo(130, 10); g.quadraticCurveTo(160, -4, 190, 10); g.lineTo(204, 96); g.lineTo(116, 96); g.fill();
      for (const x of [30, 280]) { p.rect(x, 10, 16, 102, '#3a3650'); p.rect(x, 10, 3, 102, '#4a465c'); }
      p.rect(0, 112, 320, 128, '#2a2438'); p.rect(120, 112, 80, 128, '#5a1a2a'); p.rect(120, 112, 3, 128, '#c4a050'); p.rect(197, 112, 3, 128, '#c4a050');
    },
  };
  function get(name) {
    if (!cache[name]) cache[name] = Pix.make(320, 240, (p, g) => (DEFS[name] || DEFS.plains)(p, g));
    return cache[name];
  }
  return { get };
})();

const Battle = (() => {
  let core = null;
  let opts = null;
  let disp = new Map();       // actor → 표시 상태
  let popups = [];
  let effects = [];
  let msgLines = [];
  let msgShown = 0;
  let msgTotal = 0;
  let skipWait = false;
  let active = null;          // 명령 입력 중인 동료
  let targeting = null;       // {list, index, all}
  let introText = null;
  let darken = 0;
  let resultText = null;
  const PANEL_W = 152;

  const speedDelay = () => [900, 520, 240][Settings.get('battleSpeed')] || 520;

  // ── 레이어 ──
  const layer = {
    modal: true,
    update(dt) {
      for (const p of popups) p.t += dt;
      popups = popups.filter((p) => p.t < p.dur);
      for (const e of effects) e.t += dt;
      effects = effects.filter((e) => e.t < e.dur);
      for (const [, d] of disp) {
        if (d.flash > 0) d.flash -= dt;
        if (d.shake > 0) d.shake -= dt;
        if (d.dying > 0) d.dying = Math.max(0, d.dying - dt);
        if (d.appear < 1) d.appear = Math.min(1, d.appear + dt * 3);
      }
      if (msgShown < msgTotal) msgShown = Math.min(msgTotal, msgShown + dt * [70, 120, 260][Settings.get('battleSpeed')]);
    },
    onAction(a) { if (a === 'confirm' || a === 'cancel') skipWait = true; },
    onPointer(ev) { if (ev.type === 'down') skipWait = true; return true; },
    draw(ctx) { draw(ctx); },
  };

  // ── 배치 ──
  function layoutEnemies() {
    const list = core.enemies.filter((e) => e.alive || (disp.get(e) && disp.get(e).dying > 0));
    let total = 0;
    const imgs = list.map((e) => { const d = disp.get(e) || {}; const img = MonsterArt.forMonster(e.defId, d.variant); total += img.width; return img; });
    total += (list.length - 1) * 10;
    let x = Math.max(4, (320 - total) / 2);
    list.forEach((e, i) => {
      const img = imgs[i];
      let d = disp.get(e);
      if (!d) { d = { flash: 0, shake: 0, dying: 0, appear: 0, variant: 1 }; disp.set(e, d); }
      d.img = img; d.w = img.width; d.h = img.height;
      d.x = Math.round(x); d.y = Math.round(170 - img.height);
      x += img.width + 10;
    });
  }
  function partyPanelX(i) {
    const n = core.party.length;
    const total = n * PANEL_W + (n - 1) * 6;
    return (Engine.W - total) / 2 + i * (PANEL_W + 6);
  }
  function actorCenter(a) {
    if (a.isParty) { const i = core.party.indexOf(a); return { x: partyPanelX(i) + PANEL_W / 2, y: 46 }; }
    const d = disp.get(a);
    if (!d) return { x: 320, y: 220 };
    return { x: (d.x + d.w / 2) * 2, y: (d.y + d.h / 2) * 2 };
  }

  // ── 메시지 ──
  async function say(text, opts2 = {}) {
    const ctx = Engine.ctx;
    const lines = Text.layout(ctx, Util.fill(text), Engine.W - 60, 18);
    for (const l of lines) msgLines.push(l);
    while (msgLines.length > 3) msgLines.shift();
    msgTotal = msgLines.reduce((n, l) => n + Text.lineLen(l), 0);
    msgShown = Math.max(0, msgTotal - lines.reduce((n, l) => n + Text.lineLen(l), 0));
    skipWait = false;
    while (msgShown < msgTotal) { if (skipWait) { msgShown = msgTotal; skipWait = false; break; } await Engine.frames(1); }
    await hold(opts2.wait !== undefined ? opts2.wait : speedDelay());
  }
  async function hold(ms) {
    skipWait = false;
    const end = performance.now() + ms;
    while (performance.now() < end) { if (skipWait) { skipWait = false; return; } await Engine.frames(1); }
  }
  async function waitConfirm() {
    skipWait = false;
    resultText = '▼';
    while (!skipWait) await Engine.frames(1);
    resultText = null;
    skipWait = false;
  }
  function clearMsg() { msgLines = []; msgShown = msgTotal = 0; }

  function popup(a, text, color, big) {
    const c = actorCenter(a);
    popups.push({ x: c.x + Util.randInt(-8, 8), y: a.isParty ? 70 : c.y - 10, text, color, t: 0, dur: 0.9, big });
  }

  // ── 연출 이벤트 재생 ──
  async function present(events) {
    for (const e of events) {
      switch (e.type) {
        case 'msg': await say(e.text); break;
        case 'anim': await playAnim(e); break;
        case 'damage': {
          const d = disp.get(e.target);
          if (e.target.isParty) {
            d.hp = e.hpAfter; d.shake = 0.35; d.flash = 0.3;
            if (!e.poison) { Sound.sfx(e.crit ? 'crit' : 'hurt'); Engine.shake(e.crit ? 6 : 3, 0.25); }
            else Sound.sfx('poison');
          } else {
            d.flash = 0.35;
            if (e.poison) Sound.sfx('poison'); else Sound.sfx(e.crit ? 'crit' : 'hit');
            if (e.crit) Engine.shake(5, 0.25);
          }
          popup(e.target, String(e.amount), e.poison ? Theme.purple : e.crit ? Theme.gold : e.weak ? '#ffb347' : '#ffffff', e.crit || e.weak);
          await Engine.wait(120);
          break;
        }
        case 'heal': { const d = disp.get(e.target); if (d) d.hp = e.hpAfter; popup(e.target, '+' + e.amount, Theme.green); break; }
        case 'mp': { const d = disp.get(e.target); if (d) d.mp = e.mpAfter; if (e.gain) popup(e.target, '+' + e.gain + ' MP', Theme.blue); break; }
        case 'miss': popup(e.target, 'MISS', '#b0b0c0'); Sound.sfx('miss'); break;
        case 'die': {
          const d = disp.get(e.target);
          if (e.target.isParty) { d.hp = 0; Sound.sfx('hurt'); }
          else { d.dying = 0.5; Sound.sfx('enemyDie'); await Engine.wait(e.silent ? 150 : 350); }
          break;
        }
        case 'revive': { const d = disp.get(e.target); d.hp = e.hpAfter; Sound.sfx('heal'); break; }
        case 'status': Sound.sfx(e.on ? 'status' : 'heal'); break;
        case 'buff': Sound.sfx(e.reset ? 'cursor' : e.up ? 'buff' : 'debuff'); effects.push({ name: e.up ? 'up' : 'down', pos: [actorCenter(e.target)], t: 0, dur: 0.6 }); break;
        case 'summon': for (const a of e.actors) disp.set(a, { flash: 0, shake: 0, dying: 0, appear: 0, variant: 1 }); layoutEnemies(); Engine.flash('#c040ff', 0.3); await Engine.wait(300); break;
        case 'flee': { const d = disp.get(e.target); d.dying = 0.5; Sound.sfx('escape'); await say(Util.fill(SKILLS.flee.msg, { A: e.target.name })); break; }
        case 'phase': { const d = disp.get(e.target); d.variant = e.variant; d.flash = 0.6; layoutEnemies(); break; }
        case 'shake': Engine.shake(e.mag || 5, 0.5); break;
        case 'sfx': Sound.sfx(e.name); break;
        case 'analyze': effects.push({ name: 'scan', pos: [actorCenter(e.target)], t: 0, dur: 0.6 }); Sound.sfx('confirm'); await Engine.wait(350); break;
      }
      // 적이 모두 사라지면 남은 사망 연출만 정리
    }
    layoutEnemies();
  }

  async function playAnim(e) {
    const pos = (e.targets || []).filter(Boolean).map(actorCenter);
    const name = e.name;
    const dur = { slash: 0.25, bigslash: 0.35, starslash: 0.4, fire: 0.6, ice: 0.6, thunder: 0.5, light: 0.6, dark: 0.6, heal: 0.6, buff: 0.5, debuff: 0.5, mist: 0.7, wave: 0.8, impact: 0.4, quake: 0.6, guard: 0.4, scan: 0.5, steal: 0.3 }[name] || 0.4;
    const sfx = { fire: 'fire', ice: 'ice', thunder: 'thunder', light: 'light', dark: 'dark', heal: 'heal', buff: 'buff', debuff: 'debuff', mist: 'mist', wave: 'bell', impact: 'impact', quake: 'impact', guard: 'buff', starslash: 'light' }[name];
    if (sfx) Sound.sfx(sfx);
    if (name === 'thunder') Engine.flash('#fff6b0', 0.25);
    if (name === 'wave') { Engine.shake(7, 0.7); Engine.flash('#c8a0ff', 0.3); }
    if (name === 'impact' || name === 'quake') Engine.shake(6, 0.4);
    // 적 공격은 화면 흔들림만 (아군 패널이 흔들림)
    if (e.user && !e.user.isParty && (name === 'slash' || !name)) return;
    effects.push({ name, pos, t: 0, dur, miss: e.miss });
    await Engine.wait(dur * 1000 * (e.miss ? 0.5 : 0.85));
  }

  // ── 그리기 ──
  function draw(ctx) {
    const g = Engine.lctx;
    g.drawImage(BattleBG.get(opts.bg || 'plains'), 0, 0);
    // 적
    for (const e of core.enemies) {
      const d = disp.get(e);
      if (!d || !d.img) continue;
      if (!e.alive && !(d.dying > 0)) continue;
      let alpha = d.appear;
      if (d.dying > 0) alpha = d.dying / 0.5;
      if (!e.alive && d.dying <= 0) continue;
      g.globalAlpha = Util.clamp(alpha, 0, 1);
      const bob = e.def.boss ? Math.round(Math.sin(Engine.time * 2) * 1.5) : Math.round(Math.sin(Engine.time * 3 + e.uid) * 1);
      const flash = d.flash > 0 && Math.floor(d.flash * 20) % 2 === 0;
      const dx = d.x + (d.flash > 0 ? Math.round(Math.sin(d.flash * 60) * 2) : 0);
      if (d.dying > 0) {
        // 사라질 때 아래로 녹아내림
        const k = 1 - d.dying / 0.5;
        const h = Math.round(d.h * (1 - k));
        g.drawImage(d.img, 0, 0, d.w, h, dx, d.y + (d.h - h), d.w, h);
      } else g.drawImage(flash ? Pix.silhouette(d.img) : d.img, dx, d.y + bob);
      g.globalAlpha = 1;
      if (e.status.sleep) { g.fillStyle = '#ffffff'; g.font = '8px sans-serif'; g.fillText('z', d.x + d.w - 6, d.y + 6 + Math.sin(Engine.time * 3) * 2); }
    }
    Engine.blitLow(ctx);
    if (darken > 0) { ctx.fillStyle = `rgba(0,0,0,${darken})`; ctx.fillRect(0, 0, Engine.W, Engine.H); }
    // 적 상태 표시 (차지·상태이상)
    for (const e of core.enemies) {
      const d = disp.get(e);
      if (!d || !e.alive) continue;
      const cx = (d.x + d.w / 2) * 2, top = d.y * 2;
      const tags = [];
      if (e.charging) tags.push(['!!', '#ff5050']);
      for (const s of ['poison', 'sleep', 'paralyze', 'silence']) if (e.status[s]) tags.push([STATUS_NAMES[s], { poison: '#c070ff', sleep: '#70a8ff', paralyze: '#ffd050', silence: '#a0a0b0' }[s]]);
      if (e.buffs.atk && e.buffs.atk.mult > 1) tags.push(['공↑', '#ff8a5a']);
      if (e.buffs.def && e.buffs.def.mult > 1) tags.push(['방↑', '#ffd050']);
      if (e.buffs.spd && e.buffs.spd.mult < 1) tags.push(['속↓', '#70a8ff']);
      if (e.buffs.hit && e.buffs.hit.mult < 1) tags.push(['명↓', '#a0a0b0']);
      let tx = cx - (tags.length * 34) / 2;
      for (const [t, c] of tags) { drawTag(ctx, tx, top - 4, t, c); tx += 34; }
      // 보스/분석된 적은 HP 막대
      if (e.def.boss || Game.state.seen[e.defId]) UI.gauge(ctx, cx - 40, d.y * 2 + d.h * 2 + 4, 80, 5, e.hp / e.mhp, e.def.boss ? '#ff6060' : '#63e07a');
    }
    // 아군 패널
    core.party.forEach((a, i) => drawPanel(ctx, a, i));
    // 이펙트
    for (const fx of effects) drawEffect(ctx, fx);
    // 팝업 숫자
    for (const p of popups) {
      const k = p.t / p.dur;
      const y = p.y - 26 * Math.min(1, k * 2.5) + (k > 0.5 ? 0 : 0);
      ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
      Text.draw(ctx, p.text, p.x, y, { size: p.big ? 30 : 24, bold: true, align: 'center', color: p.color, outline: 4, outlineColor: '#1a1020', shadow: false });
      ctx.globalAlpha = 1;
    }
    // 메시지 창
    const my = Engine.H - 124;
    UI.drawWindow(ctx, 8, my, Engine.W - 16, 116);
    if (active) {
      Text.draw(ctx, `[y]${active.name}[/]${Util.josa(active.name, '은')} 어떻게 할까?`, 224, my + 18, { size: 18 });
      const sk = targeting && targeting.skill;
      if (sk && sk.desc) { const lines = Text.layout(ctx, sk.desc, Engine.W - 250, 15); Text.drawLines(ctx, lines.slice(0, 3), 224, my + 48, 21, 15); }
    } else {
      Text.drawLines(ctx, msgLines, 26, my + 16, 30, 18, Math.floor(msgShown));
      if (resultText && Math.floor(Engine.time * 2.5) % 2 === 0) Text.draw(ctx, '▼', Engine.W - 34, Engine.H - 36, { size: 16, color: Theme.gold });
    }
    if (introText) {
      const a = Math.min(1, introText.t * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 196, Engine.W, 56);
      Text.draw(ctx, introText.text, Engine.W / 2, 208, { size: 28, bold: true, align: 'center', color: '#ff8a8a', outline: 3 });
      ctx.globalAlpha = 1;
    }
  }

  function drawTag(ctx, x, y, text, color) {
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    UI.roundRect(ctx, x, y - 16, 32, 17, 4); ctx.fill();
    Text.draw(ctx, text, x + 16, y - 15, { size: 12, align: 'center', color, bold: true, shadow: false });
  }

  function drawPanel(ctx, a, i) {
    let d = disp.get(a);
    const x = partyPanelX(i) + (d.shake > 0 ? Math.sin(d.shake * 70) * 4 : 0), y = 6, w = PANEL_W, h = 82;
    const isActive = active === a;
    const isTarget = targeting && targeting.side === 'party' && (targeting.all || targeting.list[targeting.index] === a);
    UI.drawWindow(ctx, x, y + (isActive ? -2 : 0), w, h, {
      border: isTarget ? '#7cf08a' : isActive ? Theme.gold : Theme.border,
      top: d.hp <= 0 ? 'rgba(70,20,30,0.95)' : d.flash > 0 ? 'rgba(140,40,40,0.95)' : undefined,
    });
    const dead = d.hp <= 0;
    const col = dead ? Theme.red : CHARACTERS[a.id].color;
    Text.draw(ctx, a.name, x + 10, y + 7, { size: 16, bold: true, color: col, maxW: 80 });
    Text.draw(ctx, 'Lv' + a.ref.level, x + w - 10, y + 9, { size: 13, color: Theme.dim, align: 'right' });
    const st = a.st;
    const low = d.hp > 0 && d.hp <= st.maxhp * 0.25;
    Text.draw(ctx, 'HP', x + 10, y + 31, { size: 12, color: Theme.dim });
    Text.draw(ctx, String(d.hp), x + w - 10, y + 28, { size: 16, bold: true, align: 'right', color: dead ? Theme.red : low ? '#ffb347' : Theme.text });
    UI.gauge(ctx, x + 34, y + 44, w - 44, 4, d.hp / st.maxhp, low ? '#ffb347' : Theme.hp);
    Text.draw(ctx, 'MP', x + 10, y + 53, { size: 12, color: Theme.dim });
    Text.draw(ctx, String(d.mp), x + w - 10, y + 50, { size: 16, bold: true, align: 'right' });
    UI.gauge(ctx, x + 34, y + 66, w - 44, 4, st.maxmp ? d.mp / st.maxmp : 0, Theme.mp);
    // 상태 태그
    const tags = [];
    if (dead) tags.push(['전투불능', Theme.red]);
    for (const s of ['poison', 'sleep', 'paralyze', 'silence']) if (a.status[s]) tags.push([STATUS_NAMES[s], { poison: '#c070ff', sleep: '#70a8ff', paralyze: '#ffd050', silence: '#a0a0b0' }[s]]);
    if (a.defending) tags.push(['방어', '#7cc4ff']);
    if (a.buffs.atk) tags.push(['공↑', '#ff8a5a']);
    if (a.buffs.def && a.buffs.def.mult > 1) tags.push(['방↑', '#ffd050']);
    if (a.buffs.def && a.buffs.def.mult < 1) tags.push(['방↓', '#a0a0b0']);
    let tx = x + 4;
    for (const [t, c] of tags.slice(0, 4)) { const tw = Math.max(32, Text.width(ctx, t, 12) + 10); ctx.fillStyle = 'rgba(10,10,20,0.85)'; UI.roundRect(ctx, tx, y + h - 2, tw, 17, 4); ctx.fill(); Text.draw(ctx, t, tx + tw / 2, y + h - 1, { size: 12, align: 'center', color: c, bold: true, shadow: false }); tx += tw + 3; }
  }

  function drawEffect(ctx, fx) {
    const k = fx.t / fx.dur;
    for (const p of fx.pos) {
      ctx.save();
      switch (fx.name) {
        case 'slash': case 'bigslash': case 'starslash': {
          if (fx.miss) break;
          const big = fx.name !== 'slash';
          ctx.strokeStyle = fx.name === 'starslash' ? '#fff6a0' : '#ffffff';
          ctx.lineWidth = big ? 6 : 4;
          ctx.globalAlpha = 1 - k;
          const r = big ? 50 : 36;
          ctx.beginPath();
          ctx.moveTo(p.x - r + k * 20, p.y - r);
          ctx.lineTo(p.x + r * (k * 2 - 1), p.y + r * (k * 2 - 1));
          ctx.stroke();
          if (big) { ctx.beginPath(); ctx.moveTo(p.x + r, p.y - r + 10); ctx.lineTo(p.x - r * (k * 2 - 1), p.y + r * (k * 2 - 1) + 10); ctx.stroke(); }
          if (fx.name === 'starslash') for (let i = 0; i < 6; i++) { const a = i * 1.05 + k * 4; ctx.fillStyle = '#ffe680'; ctx.fillRect(p.x + Math.cos(a) * k * 60, p.y + Math.sin(a) * k * 60, 4, 4); }
          break;
        }
        case 'fire':
          for (let i = 0; i < 16; i++) {
            const a = i * 0.39, rr = 10 + ((i * 13) % 30);
            const yy = p.y + 30 - k * 80 - (i % 4) * 8;
            ctx.globalAlpha = 1 - k;
            ctx.fillStyle = i % 3 === 0 ? '#ffe080' : i % 3 === 1 ? '#ff8030' : '#ff4020';
            ctx.beginPath(); ctx.arc(p.x + Math.cos(a + k * 3) * rr, yy, 8 - k * 5, 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'ice':
          for (let i = 0; i < 10; i++) {
            const xx = p.x - 50 + i * 11, yy = p.y - 70 + k * 90 + ((i * 17) % 30);
            ctx.globalAlpha = 1 - k * 0.8; ctx.fillStyle = i % 2 ? '#bfe6ff' : '#5ab4ff';
            ctx.beginPath(); ctx.moveTo(xx, yy - 14); ctx.lineTo(xx + 5, yy); ctx.lineTo(xx, yy + 6); ctx.lineTo(xx - 5, yy); ctx.fill();
          }
          break;
        case 'thunder': {
          ctx.strokeStyle = '#fff6b0'; ctx.lineWidth = 5; ctx.globalAlpha = k < 0.6 ? 1 : (1 - k) * 2.5;
          ctx.beginPath(); let xx = p.x, yy = 0; ctx.moveTo(xx, yy);
          while (yy < p.y) { xx += ((yy * 7) % 23) - 11; yy += 22; ctx.lineTo(xx, Math.min(yy, p.y)); }
          ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
          break;
        }
        case 'light': {
          ctx.globalAlpha = Math.sin(k * Math.PI);
          const gr = ctx.createLinearGradient(p.x - 30, 0, p.x + 30, 0);
          gr.addColorStop(0, 'rgba(255,240,160,0)'); gr.addColorStop(0.5, 'rgba(255,250,210,0.95)'); gr.addColorStop(1, 'rgba(255,240,160,0)');
          ctx.fillStyle = gr; ctx.fillRect(p.x - 30, 0, 60, p.y + 40);
          for (let i = 0; i < 8; i++) { ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 30 + ((i * 23 + k * 100) % 60), p.y - ((i * 37 + k * 200) % 120), 3, 3); }
          break;
        }
        case 'dark':
          for (let i = 0; i < 14; i++) {
            const a = i * 0.45 + k * 6, rr = (1 - k) * 60 + 6;
            ctx.globalAlpha = 0.8; ctx.fillStyle = i % 2 ? '#8a40c0' : '#4a1a70';
            ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * 0.7, 7, 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'heal': case 'up':
          for (let i = 0; i < 10; i++) {
            ctx.globalAlpha = 1 - k; ctx.fillStyle = fx.name === 'heal' ? (i % 2 ? '#a0ffb0' : '#ffffff') : '#ffd75e';
            const xx = p.x - 40 + i * 9, yy = p.y + 30 - k * 60 - (i % 3) * 10;
            if (fx.name === 'up') { ctx.beginPath(); ctx.moveTo(xx, yy - 6); ctx.lineTo(xx + 5, yy); ctx.lineTo(xx - 5, yy); ctx.fill(); }
            else ctx.fillRect(xx, yy, 4, 4);
          }
          break;
        case 'down':
          for (let i = 0; i < 6; i++) { ctx.globalAlpha = 1 - k; ctx.fillStyle = '#7cc4ff'; const xx = p.x - 30 + i * 12, yy = p.y - 20 + k * 40; ctx.beginPath(); ctx.moveTo(xx, yy + 6); ctx.lineTo(xx + 5, yy); ctx.lineTo(xx - 5, yy); ctx.fill(); }
          break;
        case 'buff': case 'debuff': case 'guard':
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = fx.name === 'debuff' ? '#7cc4ff' : '#ffd75e'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(p.x, p.y, 20 + k * 40, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'mist':
          for (let i = 0; i < 8; i++) { ctx.globalAlpha = Math.sin(k * Math.PI) * 0.6; ctx.fillStyle = i % 2 ? '#e0c8ff' : '#c8c8d8'; ctx.beginPath(); ctx.arc(p.x - 40 + i * 12 + Math.sin(k * 6 + i) * 10, p.y + Math.cos(i) * 20, 20, 0, Math.PI * 2); ctx.fill(); }
          break;
        case 'wave':
          for (let i = 0; i < 3; i++) { const r = ((k + i * 0.25) % 1) * 400; ctx.globalAlpha = 1 - ((k + i * 0.25) % 1); ctx.strokeStyle = '#e0c0ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(Engine.W / 2, 200, r, 0, Math.PI * 2); ctx.stroke(); }
          break;
        case 'impact': case 'quake':
          ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 8; i++) { const a = i * 0.785; ctx.fillRect(p.x + Math.cos(a) * k * 50, p.y + Math.sin(a) * k * 50, 6, 6); }
          break;
        case 'scan':
          ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 2;
          ctx.strokeRect(p.x - 50, p.y - 50, 100, 100);
          ctx.fillStyle = 'rgba(124,196,255,0.5)'; ctx.fillRect(p.x - 50, p.y - 50 + k * 100, 100, 3);
          break;
        case 'steal':
          ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 2 + k * 40, p.y - 2 - k * 20, 5, 5);
          break;
      }
      ctx.restore();
    }
  }

  // ── 명령 입력 ──
  function battleItems(reserved) {
    return Game.itemList((it) => it.kind === 'consumable' && it.battle).map((id) => ({ id, n: Game.count(id) - (reserved[id] || 0) }));
  }

  async function selectTarget(user, kind, skill) {
    let side, list, all = false;
    if (kind === 'enemy') { side = 'enemy'; list = core.aliveEnemyList; }
    else if (kind === 'enemies') { side = 'enemy'; list = core.aliveEnemyList; all = true; }
    else if (kind === 'allies') { side = 'party'; list = core.alivePartyList; all = true; }
    else if (kind === 'ally') { side = 'party'; list = core.alivePartyList; }
    else if (kind === 'allyOther') { side = 'party'; list = core.alivePartyList.filter((a) => a !== user); }
    else if (kind === 'deadAlly') { side = 'party'; list = core.party.filter((a) => !a.alive); }
    else if (kind === 'self' || kind === 'none') return user;
    if (!list.length) { Sound.sfx('buzzer'); return null; }
    if (side === 'enemy') list = list.slice().sort((a, b) => disp.get(a).x - disp.get(b).x);
    let index = 0;
    if (side === 'party' && list.includes(user) && kind === 'ally' && skill && skill.type !== 'heal') index = list.indexOf(user);
    if (side === 'party' && skill && skill.type === 'heal') { let worst = 0; list.forEach((a, i) => { if (a.hp / a.mhp < list[worst].hp / list[worst].mhp) worst = i; }); index = worst; }
    targeting = { side, list, index, all, skill };
    return new Promise((resolve) => {
      const tl = {
        modal: true,
        onAction(a) {
          if (a === 'left' || a === 'up') { if (!all) { targeting.index = (targeting.index - 1 + list.length) % list.length; Sound.sfx('cursor'); } }
          else if (a === 'right' || a === 'down') { if (!all) { targeting.index = (targeting.index + 1) % list.length; Sound.sfx('cursor'); } }
          else if (a === 'confirm') { Sound.sfx('confirm'); done(all ? 'all' : list[targeting.index]); }
          else if (a === 'cancel') { Sound.sfx('cancel'); done(null); }
        },
        onPointer(ev) {
          if (ev.type !== 'down' && ev.type !== 'move') return true;
          let hit = -1;
          list.forEach((a, i) => {
            if (a.isParty) { const x = partyPanelX(core.party.indexOf(a)); if (ev.x >= x && ev.x <= x + PANEL_W && ev.y < 92) hit = i; }
            else { const d = disp.get(a); if (ev.x >= d.x * 2 && ev.x <= (d.x + d.w) * 2 && ev.y >= d.y * 2 - 20 && ev.y <= (d.y + d.h) * 2) hit = i; }
          });
          if (hit >= 0 && !all) targeting.index = hit;
          if (ev.type === 'down') { if (hit >= 0) { Sound.sfx('confirm'); done(all ? 'all' : list[targeting.index]); } else if (ev.y < 340) { Sound.sfx('cancel'); done(null); } }
          return true;
        },
        draw(ctx) {
          const targets = all ? list : [list[targeting.index]];
          for (const t of targets) {
            if (t.isParty) continue;
            const d = disp.get(t);
            const cx = (d.x + d.w / 2) * 2, top = d.y * 2 - 14 + Math.sin(Engine.time * 8) * 4;
            ctx.fillStyle = Theme.gold;
            ctx.beginPath(); ctx.moveTo(cx - 10, top - 12); ctx.lineTo(cx + 10, top - 12); ctx.lineTo(cx, top); ctx.closePath(); ctx.fill();
          }
          const label = all ? (side === 'enemy' ? '적 전체' : '아군 전체') : list[targeting.index].name;
          let extra = '';
          const t0 = list[targeting.index];
          if (!all && !t0.isParty && skill && skill.element && Game.state.seen[t0.defId]) {
            const m = t0.elemMult(skill.element);
            extra = m > 1 ? ' [y]약점![/]' : m === 0 ? ' [r]무효[/]' : m < 1 ? ' [d]내성[/]' : '';
          }
          const w = Text.width(ctx, label + Text.strip(extra), 18, true) + 40;
          UI.drawWindow(ctx, Engine.W / 2 - w / 2, 100, w, 38);
          Text.draw(ctx, label + extra, Engine.W / 2, 109, { size: 18, bold: true, align: 'center' });
        },
      };
      function done(v) { Engine.remove(tl); targeting = null; resolve(v); }
      Engine.push(tl);
    });
  }

  async function chooseCommand(a, reserved) {
    const spells = a.ref.skills.filter((s) => SKILLS[s].kind === 'spell');
    const skills = a.ref.skills.filter((s) => SKILLS[s].kind === 'skill');
    const items = [
      { label: '공격', value: 'attack' },
      { label: '주문', value: 'spell', disabled: !spells.length || !!a.status.silence },
      { label: '특기', value: 'skill', disabled: !skills.length },
      { label: '도구', value: 'item', disabled: !battleItems(reserved).some((x) => x.n > 0) },
      { label: '방어', value: 'defend' },
      { label: '도망', value: 'escape', disabled: !core.canEscape },
    ];
    const menu = new UI.ListWindow({ x: 8, y: Engine.H - 124, w: 208, h: 116, cols: 2, rowH: 32, items, initial: a.lastCmd || 0, cancel: true, size: 18, padY: 10 });
    Engine.push(menu);
    try {
      for (;;) {
        const r = await menu.choose();
        if (r === null) return 'back';
        a.lastCmd = r.index;
        if (r.value === 'attack') {
          const t = await selectTarget(a, 'enemy', SKILLS.attack);
          if (t) return { kind: 'attack', target: t };
          continue;
        }
        if (r.value === 'defend') return { kind: 'defend' };
        if (r.value === 'escape') return { escape: true };
        if (r.value === 'spell' || r.value === 'skill') {
          const ids = r.value === 'spell' ? spells : skills;
          const deadCount = core.party.filter((x) => !x.alive).length;
          const sub = new UI.ListWindow({
            x: 224, y: Engine.H - 132, anchor: 'bottom', w: 400, maxRows: 6, rowH: 30, cancel: true,
            title: r.value === 'spell' ? `${a.name}의 주문 (MP ${a.mp})` : `${a.name}의 특기 (MP ${a.mp})`,
            items: ids.map((id) => {
              const sk = SKILLS[id];
              const bad = (sk.mp || 0) > a.mp || (sk.target === 'deadAlly' && !deadCount);
              return { label: sk.name, right: sk.mp ? `MP ${sk.mp}` : '-', value: id, disabled: bad, desc: sk.desc };
            }),
            initial: a['last_' + r.value] || 0,
            onHover: (it) => { targeting = it ? { skill: SKILLS[it.value], side: null, list: [] } : null; },
          });
          Engine.push(sub);
          let chosen = null;
          for (;;) {
            const s = await sub.choose();
            if (s === null) break;
            a['last_' + r.value] = s.index;
            const sk = SKILLS[s.value];
            const t = await selectTarget(a, sk.target, sk);
            if (t) { chosen = { kind: 'skill', skill: s.value, target: t === 'all' ? null : t }; break; }
          }
          sub.close();
          targeting = null;
          if (chosen) return chosen;
          continue;
        }
        if (r.value === 'item') {
          const list = battleItems(reserved).filter((x) => x.n > 0);
          const sub = new UI.ListWindow({
            x: 224, y: Engine.H - 132, anchor: 'bottom', w: 400, maxRows: 6, rowH: 30, cancel: true, title: '도구',
            items: list.map((x) => ({ label: ITEMS[x.id].name, right: '×' + x.n, value: x.id, desc: ITEMS[x.id].desc, disabled: ITEMS[x.id].use.target === 'deadAlly' && !core.party.some((p) => !p.alive) })),
            onHover: (it) => { targeting = it ? { skill: { desc: ITEMS[it.value].desc }, side: null, list: [] } : null; },
          });
          Engine.push(sub);
          let chosen = null;
          for (;;) {
            const s = await sub.choose();
            if (s === null) break;
            const use = ITEMS[s.value].use;
            const t = await selectTarget(a, use.target, Object.assign({ type: use.type }, use));
            if (t) { chosen = { kind: 'item', item: s.value, target: t === 'all' ? null : t }; break; }
          }
          sub.close();
          targeting = null;
          if (chosen) return chosen;
          continue;
        }
      }
    } finally {
      menu.close();
    }
  }

  async function commandPhase() {
    const cmds = new Map();
    const reserved = {};
    const list = core.party;
    let i = 0;
    const can = (a) => a.alive && !a.disabled;
    while (i < list.length) {
      const a = list[i];
      if (!can(a)) { i++; continue; }
      active = a;
      const r = await chooseCommand(a, reserved);
      if (r === 'back') {
        let j = i - 1;
        while (j >= 0 && !can(list[j])) j--;
        if (j >= 0) {
          const prev = cmds.get(list[j]);
          if (prev && prev.kind === 'item') reserved[prev.item]--;
          cmds.delete(list[j]);
          i = j;
        }
        continue;
      }
      if (r.escape) { active = null; return { escape: true }; }
      cmds.set(a, r);
      if (r.kind === 'item') reserved[r.item] = (reserved[r.item] || 0) + 1;
      i++;
    }
    active = null;
    return { cmds };
  }

  // ── 전투 진행 ──
  async function loop() {
    let first = true;
    let preempt = false, ambush = false;
    if (!core.boss && !opts.ambushSafe) {
      const r = Util.rand();
      if (r < 0.07) preempt = true;
      else if (r < 0.12) ambush = true;
    }
    const names = core.enemies.map((e) => e.name);
    if (opts.intro) {
      introText = { text: opts.intro, t: 0 };
      Engine.shake(6, 0.8); Sound.sfx('roar');
      await Engine.wait(1300);
      introText = null;
    }
    const groupName = (() => {
      const u = [...new Set(core.enemies.map((e) => e.def.name))];
      if (u.length === 1 && core.enemies.length > 1) return `${u[0]} 무리가`;
      if (u.length === 1) return `${u[0]}${Util.josa(u[0], '이')}`;
      return `${u[0]} 일행이`;
    })();
    await say(core.boss ? `${groupName} 앞을 가로막았다!` : `${groupName} 나타났다!`);
    if (preempt) await say('[y]마물들은 아직 이쪽을 눈치채지 못했다! (선제공격)[/]');
    if (ambush) await say('[r]기습이다! 마물들이 먼저 덤벼든다![/]');
    for (;;) {
      let cmds = null;
      let enemiesAct = true;
      if (ambush && first) { cmds = new Map(); }
      else {
        clearMsg();
        const r = await commandPhase();
        if (r.escape) {
          clearMsg();
          await say(`${Game.heroName()} 일행은 도망쳤다!`, { wait: 200 });
          const er = core.tryEscape();
          if (er.impossible) { await say('그러나 도망칠 수 없다!'); continue; }
          if (er.ok) { Sound.sfx('escape'); await hold(500); return 'escape'; }
          await say('그러나 마물들이 길을 막아섰다!');
          cmds = new Map();
        } else cmds = r.cmds;
        if (preempt && first) enemiesAct = false;
      }
      first = false;
      clearMsg();
      const order = core.buildOrder(cmds, { enemiesAct });
      for (const entry of order) {
        if (core.result) break;
        if (!entry.actor.alive) continue;
        const ev = core.execute(entry);
        if (ev.length) { clearMsg(); await present(ev); }
        if (core.checkEnd()) break;
      }
      if (core.checkEnd()) break;
      const er = core.endRound();
      if (er.length) await present(er);
      if (core.checkEnd()) break;
    }
    return core.result;
  }

  async function victory() {
    clearMsg();
    Sound.stop();
    Sound.jingle('victory');
    const u = [...new Set(core.killed.map((e) => e.def.name))];
    await say(u.length === 1 && core.killed.length === 1 ? `${u[0]}${Util.josa(u[0], '을')} 물리쳤다!` : '마물들을 물리쳤다!', { wait: 300 });
    const r = core.rewards();
    if (r.exp) await say(`경험치 [y]${r.exp}[/]을 얻었다!`, { wait: 300 });
    if (r.gold) await say(`[y]${r.gold}G[/]를 손에 넣었다!`, { wait: 300 });
    for (const it of r.drops) await say(`마물이 [y]${ITEMS[it].name}[/]${Util.josa(ITEMS[it].name, '을')} 떨어뜨렸다!`, { wait: 400 });
    for (const up of r.ups) {
      Sound.jingle('levelup');
      const nm = Game.name(up.id);
      await say(`[y]${nm}의 레벨이 ${up.level}${Util.josa(String(up.level), '으로')} 올랐다![/]`, { wait: 400 });
      const g = up.gains;
      const parts = [['최대HP', g.maxhp], ['최대MP', g.maxmp], ['공격', g.atk], ['방어', g.def], ['마력', g.mag], ['민첩', g.spd]].filter(([, v]) => v > 0).map(([k, v]) => `${k}+${v}`);
      await say(`[d]${parts.join('  ')}[/]`, { wait: 500 });
      for (const sk of up.learned) {
        const s = SKILLS[sk];
        await say(`[g]${nm}${Util.josa(nm, '은')} 새로운 ${s.kind === 'spell' ? '주문' : '특기'} 「${s.name}」${Util.josa(s.name, '을')} 익혔다![/]`, { wait: 600 });
      }
      for (const [id] of disp) if (id.isParty) { const d = disp.get(id); d.hp = id.hp; d.mp = id.mp; }
    }
    for (const m of r.questMsgs) await say(m, { wait: 600 });
    await waitConfirm();
  }

  async function run(o) {
    opts = Object.assign({ bg: 'plains' }, o);
    core = new BattleCore(opts);
    disp = new Map();
    popups = []; effects = []; clearMsg(); active = null; targeting = null; introText = null; darken = 0;
    for (const a of core.party) disp.set(a, { hp: a.hp, mp: a.mp, flash: 0, shake: 0 });
    layoutEnemies();
    // 진입 연출
    Sound.sfx('encounter');
    Sound.bgm(opts.bgm || 'battle');
    for (let i = 0; i < 3; i++) { Engine.flash('#ffffff', 0.12); await Engine.wait(110); }
    await Engine.fadeOut(180);
    Engine.push(layer);
    await Engine.fadeIn(220);
    let result;
    try {
      result = await loop();
      if (result === 'win') await victory();
      else if (result === 'lose') {
        clearMsg();
        await say(`[r]${Game.heroName()} 일행은 전멸했다…[/]`, { wait: 900 });
      }
    } catch (err) {
      console.error('[Battle] error', err);
      result = 'escape';
    }
    await Engine.fadeOut(260);
    Engine.remove(layer);
    // 전투 후 상태 정리 (일시 상태 제거)
    for (const id of Game.state.party) { const m = Game.state.members[id]; for (const k of ['sleep', 'paralyze', 'silence']) delete m.status[k]; }
    if (result !== 'lose' && Field.map) Sound.bgm(typeof Field.map.bgm === 'function' ? Field.map.bgm() : Field.map.bgm);
    if (result !== 'lose') await Engine.fadeIn(260);
    core = null;
    return result;
  }

  return { run, get core() { return core; }, layer };
})();
