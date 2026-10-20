'use strict';
// ─────────────────────────────────────────────────────────────
// Menu: 필드 메뉴 (도구·주문·장비·상태·편성·퀘스트·지도·대화·저장·불러오기·설정)
// ─────────────────────────────────────────────────────────────
const Menu = (() => {
  const STAT_LABEL = [['maxhp', '최대 HP'], ['maxmp', '최대 MP'], ['atk', '공격력'], ['def', '방어력'], ['mag', '마력'], ['spd', '민첩']];

  function charIcon(ctx, id, x, y, scale = 2, dir = 'down') {
    const fr = Chars.build(LOOKS[CHARACTERS[id].look]);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fr[dir][0], x, y, 16 * scale, 20 * scale);
  }

  function memberRow(ctx, id, x, y, w, opts = {}) {
    const m = Game.state.members[id];
    const s = Game.stats(id);
    charIcon(ctx, id, x, y - 4, 2);
    const dead = m.hp <= 0;
    Text.draw(ctx, Game.name(id), x + 42, y, { size: 18, bold: true, color: dead ? Theme.red : CHARACTERS[id].color });
    Text.draw(ctx, `${CHARACTERS[id].job}  Lv ${m.level}`, x + 42, y + 22, { size: 14, color: Theme.dim });
    const bx = x + Math.min(200, w * 0.45);
    const bw = w - (bx - x) - 4;
    Text.draw(ctx, 'HP', bx, y + 1, { size: 13, color: Theme.dim });
    Text.draw(ctx, `${m.hp}/${s.maxhp}`, bx + bw, y - 1, { size: 15, align: 'right', color: dead ? Theme.red : Theme.text });
    UI.gauge(ctx, bx + 26, y + 17, bw - 26, 4, m.hp / s.maxhp, Theme.hp);
    Text.draw(ctx, 'MP', bx, y + 25, { size: 13, color: Theme.dim });
    Text.draw(ctx, `${m.mp}/${s.maxmp}`, bx + bw, y + 23, { size: 15, align: 'right' });
    UI.gauge(ctx, bx + 26, y + 41, bw - 26, 4, s.maxmp ? m.mp / s.maxmp : 0, Theme.mp);
    const tags = [];
    if (dead) tags.push(['전투불능', Theme.red]);
    if (m.status.poison) tags.push(['독', '#c070ff']);
    if (opts.reserve) tags.push(['대기', Theme.dim]);
    let tx = x + 46 + Text.width(ctx, Game.name(id), 18, true);
    for (const [t, c] of tags) { Text.draw(ctx, `[${t}]`, tx, y + 2, { size: 13, color: c }); tx += Text.width(ctx, `[${t}]`, 13) + 4; }
  }

  // 메뉴 배경 레이어 (파티 요약)
  const base = {
    modal: true,
    draw(ctx) {
      ctx.fillStyle = 'rgba(0,0,10,0.35)'; ctx.fillRect(0, 0, Engine.W, Engine.H);
      UI.drawWindow(ctx, 176, 12, 452, 388);
      const st = Game.state;
      const ids = st.party.concat(st.reserve);
      const rowH = ids.length > 5 ? 60 : ids.length > 4 ? 72 : 90;
      ids.forEach((id, i) => memberRow(ctx, id, 196, 30 + i * rowH, 412, { reserve: i >= st.party.length }));
      UI.drawWindow(ctx, 176, 406, 452, 62);
      Text.draw(ctx, `[y]${Game.gold}G[/]`, 196, 416, { size: 20, bold: true });
      Text.draw(ctx, `⏱ ${Util.fmtTime(st.playTime)}`, 196, 442, { size: 14, color: Theme.dim });
      Text.draw(ctx, `📍 ${Field.map ? Field.map.name : ''}`, 608, 418, { size: 15, align: 'right' });
      const g = Settings.get('showGoal') ? Quests.currentGoal() : null;
      if (g) Text.draw(ctx, '★ ' + g.text, 608, 442, { size: 13, align: 'right', color: '#ffe9a8', maxW: 300 });
    },
  };

  async function open() {
    Engine.push(base);
    const items = [
      { label: '도구', value: 'items' }, { label: '주문·특기', value: 'magic' }, { label: '장비', value: 'equip' }, { label: '상태', value: 'status' },
      { label: '편성', value: 'formation' }, { label: '퀘스트', value: 'quests' }, { label: '지도', value: 'map' }, { label: '대화', value: 'talk' },
      { label: '저장', value: 'save' }, { label: '불러오기', value: 'load' }, { label: '설정', value: 'settings' }, { label: '타이틀로', value: 'title' },
    ];
    const lw = new UI.ListWindow({ x: 12, y: 12, w: 156, items, rowH: 30, maxRows: 12, cancel: true, menuCancels: true });
    Engine.push(lw);
    try {
      for (;;) {
        items[1].disabled = !Game.state.party.concat(Game.state.reserve).some((id) => Game.state.members[id].skills.length);
        const r = await lw.choose();
        if (!r) break;
        const v = r.value;
        if (v === 'items') await itemsScreen();
        else if (v === 'magic') await magicScreen();
        else if (v === 'equip') await equipScreen();
        else if (v === 'status') await statusScreen();
        else if (v === 'formation') await formationScreen();
        else if (v === 'quests') await questScreen();
        else if (v === 'map') { lw.close(); Engine.remove(base); await MapView.open(); return; }
        else if (v === 'talk') { lw.close(); Engine.remove(base); await partyTalk(); return; }
        else if (v === 'save') await saveScreen();
        else if (v === 'load') { if (await loadScreen()) { lw.close(); Engine.remove(base); return; } }
        else if (v === 'settings') await settingsScreen();
        else if (v === 'title') {
          if (await confirm('타이틀 화면으로 돌아갈까요?\n[d](저장하지 않은 진행은 사라집니다)[/]')) { lw.close(); Engine.remove(base); await Main.toTitle(); return; }
        }
      }
    } finally {
      lw.close();
      Engine.remove(base);
    }
  }

  async function confirm(text) {
    const msg = new UI.MessageLayer([text], { keepOpen: true });
    await msg.open();
    const r = await UI.list({ x: Engine.W - 180, y: Engine.H - 150, anchor: 'bottom', w: 160, items: [{ label: '예', value: true }, { label: '아니요', value: false }], initial: 1 });
    msg.close();
    return !!(r && r.value);
  }
  async function notice(text) { await UI.message(text); }

  // 동료 선택
  async function pickMember(opts = {}) {
    const ids = (opts.ids || Game.state.party.concat(Game.state.reserve));
    const items = ids.map((id) => {
      const m = Game.state.members[id], s = Game.stats(id);
      return { label: Game.name(id), right: opts.right ? opts.right(id) : `HP ${m.hp}/${s.maxhp}  MP ${m.mp}/${s.maxmp}`, value: id, disabled: opts.filter ? !opts.filter(id) : false, color: m.hp <= 0 ? Theme.red : undefined };
    });
    if (opts.all) items.unshift({ label: '전원', right: '', value: '__all' });
    const r = await UI.list({ x: opts.x || (opts.right ? 120 : 200), y: opts.y || 120, w: opts.right ? 480 : 400, items, title: opts.title || '누구에게?', rowH: 32, cancel: true });
    return r ? r.value : null;
  }

  // ── 필드에서 효과 적용 ──
  function applyField(effect, targetId, casterId) {
    const m = Game.state.members[targetId];
    const s = Game.stats(targetId);
    const nm = Game.name(targetId);
    switch (effect.type) {
      case 'heal': {
        if (m.hp <= 0) return { ok: false, text: `${nm}${Util.josa(nm, '은')} 쓰러져 있어서 효과가 없다.` };
        if (m.hp >= s.maxhp) return { ok: false, text: `${nm}의 HP는 이미 가득하다.` };
        let amt = effect.amount;
        if (!amt) { const cs = Game.stats(casterId); amt = Math.round((effect.power + cs.mag * (effect.scale || 0)) * (1 + (cs.healBonus || 0))); }
        const before = m.hp; m.hp = Math.min(s.maxhp, m.hp + amt);
        return { ok: true, text: `${nm}의 HP가 ${m.hp - before} 회복되었다!` };
      }
      case 'mp': {
        if (m.mp >= s.maxmp) return { ok: false, text: `${nm}의 MP는 이미 가득하다.` };
        const before = m.mp; m.mp = Math.min(s.maxmp, m.mp + effect.amount);
        return { ok: true, text: `${nm}의 MP가 ${m.mp - before} 회복되었다!` };
      }
      case 'full': {
        if (m.hp <= 0) return { ok: false, text: `${nm}${Util.josa(nm, '은')} 쓰러져 있어서 효과가 없다.` };
        m.hp = s.maxhp; m.mp = s.maxmp;
        return { ok: true, text: `${nm}의 HP와 MP가 모두 회복되었다!` };
      }
      case 'cure': {
        const cured = (effect.cures || []).filter((k) => m.status[k]);
        if (!cured.length || m.hp <= 0) return { ok: false, text: `${nm}에게는 효과가 없다.` };
        for (const k of cured) delete m.status[k];
        return { ok: true, text: `${nm}의 ${cured.map((k) => STATUS_NAMES[k]).join('·')} 상태가 나았다!` };
      }
      case 'revive': {
        if (m.hp > 0) return { ok: false, text: `${nm}${Util.josa(nm, '은')} 쓰러져 있지 않다.` };
        m.hp = Math.max(1, Math.round(s.maxhp * effect.pct)); m.status = {};
        return { ok: true, text: `${nm}${Util.josa(nm, '이')} 되살아났다!` };
      }
    }
    return { ok: false, text: '아무 일도 일어나지 않았다.' };
  }

  // ── 도구 ──
  const TABS = [['소모품', (it) => it.kind === 'consumable'], ['장비품', (it) => EQUIP_SLOTS.includes(it.kind)], ['귀중품', (it) => it.kind === 'key']];
  async function itemsScreen() {
    let tab = 0;
    const header = {
      modal: false,
      draw(ctx) {
        UI.drawWindow(ctx, 12, 12, 616, 44);
        TABS.forEach(([n], i) => {
          const x = 30 + i * 130;
          if (i === tab) { ctx.fillStyle = Theme.select; ctx.fillRect(x - 10, 18, 120, 32); }
          Text.draw(ctx, n, x + 50, 24, { size: 18, bold: i === tab, align: 'center', color: i === tab ? Theme.gold : Theme.dim });
        });
        Text.draw(ctx, '◀ ▶ 탭 전환', 610, 26, { size: 13, align: 'right', color: Theme.dim });
      },
      onPointer(ev) {
        if (ev.type === 'down' && ev.y >= 12 && ev.y <= 56) {
          const i = Math.floor((ev.x - 20) / 130);
          if (i >= 0 && i < TABS.length && i !== tab) { tab = i; Sound.sfx('cursor'); refresh(); }
          return true;
        }
        return false;
      },
    };
    const build = () => Game.itemList(TABS[tab][1]).map((id) => {
      const it = ITEMS[id];
      if (EQUIP_SLOTS.includes(it.kind)) {
        // 장비품: 동료별로 바꿔 끼면 능력치가 어떻게 변하는지 함께 보여준다
        const diffs = Game.state.party.concat(Game.state.reserve).filter((mid) => Game.canEquip(mid, id)).map((mid) => `${Game.name(mid)} ${Game.equipDiffText(mid, id)}`);
        return { label: it.name, right: '×' + Game.count(id), value: id, desc: `[d]${KIND_NAMES[it.kind]}[/] ${diffs.join('  ·  ') || '[d]장비할 수 있는 동료가 없다[/]'}\n[d]${it.desc}[/]` };
      }
      return { label: it.name, right: '×' + Game.count(id), value: id, desc: `[d]${KIND_NAMES[it.kind]}[/] ${it.desc}${it.stats ? '  ' + statText(it) : ''}` };
    });
    const lw = new UI.ListWindow({
      x: 12, y: 62, w: 616, h: 330, items: build(), rowH: 30, maxRows: 10, cancel: true, cols: 2, empty: '(비어 있음)',
      help: { x: 12, y: 398, w: 616, h: 70 },
      onLeftRight: (it, dx) => { if (lw.cursor % 2 === (dx > 0 ? 1 : 0) || lw.items.length <= 1) { tab = (tab + dx + TABS.length) % TABS.length; refresh(); return true; } return false; },
    });
    function refresh() { lw.setItems(build(), false); }
    Engine.push(header);
    Engine.push(lw);
    try {
      for (;;) {
        const r = await lw.choose();
        if (!r) break;
        const id = r.value;
        const it = ITEMS[id];
        if (it.kind === 'key') { await notice(`[y]${it.name}[/]\n${it.desc}`); continue; }
        const acts = [];
        if (it.kind === 'consumable') acts.push({ label: '사용', value: 'use', disabled: !it.field });
        if (EQUIP_SLOTS.includes(it.kind)) acts.push({ label: '장비', value: 'equip' });
        acts.push({ label: '버린다', value: 'drop' });
        const a = await UI.list({ x: 420, y: 140, w: 150, items: acts, cancel: true });
        if (!a) continue;
        if (a.value === 'use') await useItem(id);
        else if (a.value === 'equip') {
          const who = await pickMember({ title: `${it.name} — 누가 장비할까?`, filter: (mid) => Game.canEquip(mid, id), right: (mid) => Game.equipDiffText(mid, id) });
          if (who) { Game.equip(who, it.kind, id); Sound.sfx('confirm'); await notice(`${Game.name(who)}${Util.josa(Game.name(who), '은')} ${it.name}${Util.josa(it.name, '을')} 장비했다.`); }
        } else if (a.value === 'drop') {
          if (await confirm(`${it.name}${Util.josa(it.name, '을')} 하나 버릴까요?`)) { Game.removeItem(id); Sound.sfx('cancel'); }
        }
        refresh();
      }
    } finally {
      lw.close();
      Engine.remove(header);
    }
  }
  function statText(it) {
    const s = it.stats || {};
    const n = { atk: '공', def: '방', mag: '마', spd: '민', hp: 'HP', mp: 'MP' };
    const parts = Object.keys(s).filter((k) => s[k]).map((k) => `${n[k]}${s[k] > 0 ? '+' : ''}${s[k]}`);
    const who = (it.who || ALL).map((w) => (w === 'hero' ? Game.heroName() : CHARACTERS[w].name)).join('·');
    return `[b]${parts.join(' ')}[/] [d](${who})[/]`;
  }

  async function useItem(id) {
    const it = ITEMS[id];
    const u = it.use;
    if (u.type === 'return') {
      const k = Field.map.kind;
      if (k !== 'field' && k !== 'dungeon') { await notice('여기서는 쓸 수 없다. (필드나 던전에서 사용)'); return; }
      // 가 본 마을 중 하나를 고른다
      const towns = [{ label: '리벨 마을', value: ['rivel', 19, 27, 'up'] }];
      if (Game.flag('reached_capital')) towns.push({ label: '왕도 아스테리온', value: ['capital', 23, 37, 'up'] });
      if (Game.flag('reached_samira')) towns.push({ label: '오아시스 사미라', value: ['samira', 17, 25, 'up'] });
      let dest = towns[0].value;
      if (towns.length > 1) {
        const r = await UI.list({ x: 220, y: 160, w: 220, items: towns, title: '어디로 돌아갈까?', cancel: true });
        if (!r) return;
        dest = r.value;
      }
      Game.removeItem(id);
      await notice(`${Game.heroName()}${Util.josa(Game.heroName(), '은')} 귀환의 날개를 하늘 높이 던졌다!`);
      for (const l of Engine.layers.slice()) if (l !== Field.layer) { if (l.close) l.close(); else Engine.remove(l); }
      await Field.warp(dest[0], dest[1], dest[2], dest[3], { sfx: 'escape', slow: true });
      throw new AbortSignalError('warped');
    }
    if (u.type === 'ward') {
      Game.removeItem(id);
      Game.state.ward = u.steps;
      Sound.sfx('mist');
      await notice('정령의 향을 피웠다. 마물들이 한동안 다가오지 않을 것이다.');
      return;
    }
    const who = await pickMember({ title: `${it.name} — 누구에게?` });
    if (!who) return;
    const r = applyField(u, who);
    if (r.ok) { Game.removeItem(id); Sound.sfx('heal'); } else Sound.sfx('buzzer');
    await notice(r.text);
  }

  // ── 주문·특기 ──
  async function magicScreen() {
    const casterId = await pickMember({ title: '누구의 주문·특기?', filter: (id) => Game.state.members[id].skills.length > 0 });
    if (!casterId) return;
    for (;;) {
      const m = Game.state.members[casterId];
      const items = m.skills.map((sid) => {
        const sk = SKILLS[sid];
        const usable = sk.field && m.hp > 0 && m.mp >= (sk.mp || 0);
        return { label: sk.name, right: (sk.kind === 'spell' ? '주문 ' : '특기 ') + (sk.mp ? `MP ${sk.mp}` : '-'), value: sid, disabled: !usable, desc: sk.desc + (sk.field ? '' : ' [d](전투 전용)[/]') };
      });
      const r = await UI.list({ x: 12, y: 60, w: 616, items, title: `${Game.name(casterId)} — MP ${m.mp}/${Game.stats(casterId).maxmp}`, maxRows: 9, rowH: 30, help: { x: 12, y: 398, w: 616, h: 70 }, onDisabled: () => {} });
      if (!r) return;
      const sk = SKILLS[r.value];
      if (sk.target === 'allies') {
        m.mp -= sk.mp;
        const texts = [];
        for (const id of Game.state.party) { const res = applyField(sk, id, casterId); if (res.ok) texts.push(res.text); }
        Sound.sfx('heal');
        await notice(texts.length ? texts.join('\n') : '아무 효과도 없었다.');
        continue;
      }
      const who = await pickMember({ title: `${sk.name} — 누구에게?` });
      if (!who) continue;
      const res = applyField(sk, who, casterId);
      if (res.ok) { m.mp -= sk.mp; Sound.sfx('heal'); } else Sound.sfx('buzzer');
      await notice(res.text);
    }
  }

  // ── 장비 ──
  async function equipScreen() {
    const id = await pickMember({ title: '누구의 장비를 바꿀까?' });
    if (!id) return;
    let preview = null;
    const panel = {
      modal: false,
      draw(ctx) {
        UI.drawWindow(ctx, 340, 12, 288, 250);
        charIcon(ctx, id, 356, 24, 2);
        Text.draw(ctx, Game.name(id), 398, 26, { size: 18, bold: true, color: CHARACTERS[id].color });
        Text.draw(ctx, `Lv ${Game.state.members[id].level}`, 398, 48, { size: 14, color: Theme.dim });
        const cur = Game.stats(id);
        const nxt = preview ? Game.stats(id, preview) : null;
        STAT_LABEL.forEach(([k, n], i) => {
          const y = 80 + i * 28;
          Text.draw(ctx, n, 358, y, { size: 16, color: Theme.dim });
          Text.draw(ctx, String(cur[k]), 500, y, { size: 16, align: 'right' });
          if (nxt) {
            const d = nxt[k] - cur[k];
            Text.draw(ctx, '→', 520, y, { size: 16, color: Theme.dim });
            Text.draw(ctx, String(nxt[k]), 586, y, { size: 16, align: 'right', bold: d !== 0, color: d > 0 ? Theme.green : d < 0 ? Theme.red : Theme.text });
            if (d) Text.draw(ctx, d > 0 ? '▲' : '▼', 610, y + 2, { size: 12, color: d > 0 ? Theme.green : Theme.red });
          }
        });
      },
    };
    Engine.push(panel);
    const slotItems = () => EQUIP_SLOTS.map((sl) => {
      const cur = Game.state.members[id].equip[sl];
      return { label: SLOT_NAMES[sl], right: cur ? ITEMS[cur].name : '──', value: sl, desc: cur ? ITEMS[cur].desc + '  ' + statText(ITEMS[cur]) : '장비하지 않음', rightColor: Theme.text };
    });
    const lw = new UI.ListWindow({ x: 12, y: 12, w: 320, items: slotItems(), rowH: 34, cancel: true, title: '장비 칸', help: { x: 12, y: 398, w: 616, h: 70 } });
    Engine.push(lw);
    try {
      for (;;) {
        preview = null;
        lw.setItems(slotItems());
        const r = await lw.choose();
        if (!r) break;
        const slot = r.value;
        const cands = Game.itemList((it) => it.kind === slot && Game.canEquip(id, it.id));
        const items = cands.map((iid) => ({ label: ITEMS[iid].name, right: '×' + Game.count(iid), value: iid, desc: ITEMS[iid].desc + '  ' + statText(ITEMS[iid]) }));
        if (Game.state.members[id].equip[slot]) items.push({ label: '(장비 해제)', value: '__none', desc: '이 칸의 장비를 해제한다.' });
        if (!items.length) { Sound.sfx('buzzer'); await notice('장비할 수 있는 물건이 없다.'); continue; }
        const setPreview = (it) => {
          if (!it) { preview = null; return; }
          const eq = Object.assign({}, Game.state.members[id].equip);
          eq[slot] = it.value === '__none' ? null : it.value;
          preview = eq;
        };
        const c = await UI.list({ x: 12, y: 210, w: 320, items, maxRows: 5, rowH: 30, cancel: true, title: SLOT_NAMES[slot] + ' 고르기', onHover: setPreview, help: { x: 12, y: 398, w: 616, h: 70 } });
        preview = null;
        if (!c) continue;
        Game.equip(id, slot, c.value === '__none' ? null : c.value);
        Sound.sfx('confirm');
      }
    } finally {
      lw.close();
      Engine.remove(panel);
    }
  }

  // ── 상태 ──
  async function statusScreen() {
    const ids = Game.state.party.concat(Game.state.reserve);
    const first = await pickMember({ title: '누구의 상태를 볼까?' });
    if (!first) return;
    let idx = ids.indexOf(first);
    await new Promise((resolve) => {
      const L = {
        modal: true,
        onAction(a) {
          if (a === 'left' || a === 'up') { idx = (idx - 1 + ids.length) % ids.length; Sound.sfx('cursor'); }
          else if (a === 'right' || a === 'down') { idx = (idx + 1) % ids.length; Sound.sfx('cursor'); }
          else if (a === 'cancel' || a === 'confirm' || a === 'menu') { Sound.sfx('cancel'); Engine.remove(L); resolve(); }
        },
        onPointer(ev) {
          if (ev.type !== 'down') return true;
          if (ev.y > 430 && ev.x < 120) { idx = (idx - 1 + ids.length) % ids.length; Sound.sfx('cursor'); }
          else if (ev.y > 430 && ev.x > 520) { idx = (idx + 1) % ids.length; Sound.sfx('cursor'); }
          else { Sound.sfx('cancel'); Engine.remove(L); resolve(); }
          return true;
        },
        draw(ctx) {
          const id = ids[idx];
          const m = Game.state.members[id];
          const s = Game.stats(id);
          const def = CHARACTERS[id];
          UI.drawWindow(ctx, 12, 12, 616, 456);
          ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(30, 30, 96, 110);
          charIcon(ctx, id, 46, 34, 4);
          Text.draw(ctx, Game.name(id), 146, 30, { size: 26, bold: true, color: def.color });
          Text.draw(ctx, `${def.job} · Lv ${m.level}`, 146, 64, { size: 17, color: Theme.dim });
          const need = m.level >= MAX_LEVEL ? 0 : expForLevel(m.level + 1) - m.exp;
          Text.draw(ctx, `경험치 ${m.exp}  ·  다음 레벨까지 [y]${need}[/]`, 146, 92, { size: 15 });
          UI.gauge(ctx, 146, 116, 300, 6, m.level >= MAX_LEVEL ? 1 : 1 - need / expToNext(m.level), Theme.exp);
          Text.draw(ctx, `HP ${m.hp}/${s.maxhp}   MP ${m.mp}/${s.maxmp}${m.status.poison ? '   [p][독][/]' : ''}${m.hp <= 0 ? '   [r][전투불능][/]' : ''}`, 146, 128, { size: 15 });
          STAT_LABEL.slice(2).forEach(([k, n], i) => {
            Text.draw(ctx, n, 36, 168 + i * 26, { size: 16, color: Theme.dim });
            Text.draw(ctx, String(s[k]), 170, 168 + i * 26, { size: 16, align: 'right', bold: true });
          });
          EQUIP_SLOTS.forEach((sl, i) => {
            Text.draw(ctx, SLOT_NAMES[sl], 200, 168 + i * 26, { size: 15, color: Theme.dim });
            Text.draw(ctx, m.equip[sl] ? ITEMS[m.equip[sl]].name : '──', 270, 168 + i * 26, { size: 15 });
          });
          Text.draw(ctx, '주문·특기', 440, 150, { size: 15, color: Theme.gold });
          // 기술이 많으면 두 줄로 나눠 적는다
          const two = m.skills.length > 6;
          const rows = m.skills.length > 14 ? 8 : 7, lh = rows === 8 ? 18 : 21;
          m.skills.slice(0, rows * 2).forEach((sk, i) => Text.draw(ctx, `${SKILLS[sk].kind === 'spell' ? '◆' : '◇'} ${SKILLS[sk].name}`, 440 + (two ? Math.floor(i / rows) * 92 : 0), 174 + (two ? i % rows : i) * (two ? lh : 21), { size: two ? (rows === 8 ? 12 : 13) : 14, maxW: two ? 88 : 180 }));
          const nextLearn = Object.keys(def.learn).map(Number).filter((l) => l > m.level).sort((a, b) => a - b)[0];
          if (nextLearn) Text.draw(ctx, `Lv ${nextLearn}: ???`, 440, two ? 322 : 174 + m.skills.length * 21, { size: 13, color: Theme.dim });
          const lines = Text.layout(ctx, def.bio.replace('주인공', Game.heroName()), 570, 15);
          Text.drawLines(ctx, lines.slice(0, 4), 36, 332, 22, 15, Infinity, { shadow: false });
          Text.draw(ctx, '◀ 이전', 36, 438, { size: 14, color: Theme.dim });
          Text.draw(ctx, `${idx + 1} / ${ids.length}`, 320, 438, { size: 14, color: Theme.dim, align: 'center' });
          Text.draw(ctx, '다음 ▶', 604, 438, { size: 14, color: Theme.dim, align: 'right' });
        },
      };
      Engine.push(L);
    });
  }

  // ── 편성 ──
  async function formationScreen() {
    const st = Game.state;
    if (st.party.length + st.reserve.length < 2) { await notice('아직 동료가 없다.'); return; }
    let pick = null;
    for (;;) {
      const all = st.party.concat(st.reserve);
      const items = all.map((id, i) => ({
        label: `${i < st.party.length ? i + 1 + '.' : '대기'} ${Game.name(id)}`, right: `Lv ${st.members[id].level} ${CHARACTERS[id].job}`, value: i,
        color: pick === i ? Theme.gold : i >= st.party.length ? Theme.dim : undefined,
      }));
      if (st.party.length < Game.MAX_PARTY && st.reserve.length) { /* 빈 자리는 대기에서 끌어올 수 있다 */ }
      const r = await UI.list({ x: 120, y: 80, w: 400, items, title: pick === null ? '편성 — 바꿀 동료를 고르세요 (전투 참가 최대 4명)' : '편성 — 누구와 자리를 바꿀까요?', rowH: 34, cancel: true, initial: pick || 0 });
      if (!r) { if (pick !== null) { pick = null; continue; } return; }
      if (pick === null) { pick = r.value; continue; }
      const a = pick, b = r.value;
      pick = null;
      if (a === b) continue;
      const arr = st.party.concat(st.reserve);
      [arr[a], arr[b]] = [arr[b], arr[a]];
      const np = arr.slice(0, st.party.length), nr = arr.slice(st.party.length);
      if (nr.includes('hero')) { Sound.sfx('buzzer'); await notice(`${Game.heroName()}${Util.josa(Game.heroName(), '은')} 대기로 돌릴 수 없다.`); continue; }
      if (!np.some((id) => st.members[id].hp > 0)) { Sound.sfx('buzzer'); await notice('전투 멤버 중 한 명은 싸울 수 있어야 한다.'); continue; }
      st.party = np; st.reserve = nr;
      Field.resetFollowers();
      Sound.sfx('confirm');
    }
  }

  // ── 퀘스트 ──
  async function questScreen() {
    let tab = 0;
    const TAB = ['진행 중', '완료'];
    const build = () => {
      const ids = Object.keys(QUESTS).filter((id) => Quests.get(id) && (tab === 0 ? Quests.isActive(id) : Quests.isDone(id)));
      ids.sort((a, b) => (QUESTS[a].type === 'main' ? 0 : 1) - (QUESTS[b].type === 'main' ? 0 : 1));
      return ids.map((id) => ({ label: (QUESTS[id].type === 'main' ? '[y]◆[/] ' : '[g]◇[/] ') + QUESTS[id].name, value: id }));
    };
    let sel = null;
    const panel = {
      modal: false,
      draw(ctx) {
        UI.drawWindow(ctx, 12, 12, 616, 44);
        TAB.forEach((n, i) => { const x = 60 + i * 140; if (i === tab) { ctx.fillStyle = Theme.select; ctx.fillRect(x - 40, 18, 120, 32); } Text.draw(ctx, n, x + 20, 24, { size: 18, align: 'center', bold: i === tab, color: i === tab ? Theme.gold : Theme.dim }); });
        Text.draw(ctx, '◀ ▶ 탭 전환   [y]◆[/]메인 [g]◇[/]서브', 610, 26, { size: 13, align: 'right', color: Theme.dim });
        UI.drawWindow(ctx, 262, 62, 366, 406);
        if (!sel) { Text.draw(ctx, '퀘스트를 고르세요', 445, 240, { size: 16, align: 'center', color: Theme.dim }); return; }
        const q = QUESTS[sel], s = Quests.get(sel);
        Text.draw(ctx, q.name, 280, 76, { size: 20, bold: true, color: q.type === 'main' ? Theme.gold : Theme.green, maxW: 330 });
        Text.draw(ctx, `의뢰인: ${q.giver}`, 280, 106, { size: 14, color: Theme.dim });
        let y = 132;
        const lines = Text.layout(ctx, q.desc, 330, 15);
        Text.drawLines(ctx, lines, 280, y, 21, 15); y += lines.length * 21 + 10;
        Text.draw(ctx, '진행 상황', 280, y, { size: 15, color: Theme.gold }); y += 24;
        q.stages.forEach((stg, i) => {
          if (s.status !== 'done' && i > s.stage) return;
          const done = s.status === 'done' || i < s.stage;
          let t = (done ? '[d]✔ ' : '▶ ') + Quests.stageText(stg);
          if (!done && stg.count) t += ` (${stg.count()}/${stg.max})`;
          if (done) t += '[/]';
          const ls = Text.layout(ctx, t, 330, 14);
          Text.drawLines(ctx, ls, 280, y, 19, 14); y += ls.length * 19 + 4;
        });
        y += 8;
        const r = q.reward || {};
        const parts = [];
        if (r.gold) parts.push(r.gold + 'G');
        for (const [it, n] of r.items || []) parts.push(ITEMS[it].name + (n > 1 ? '×' + n : ''));
        if (r.text) parts.push(r.text);
        Text.draw(ctx, '보상', 280, y, { size: 15, color: Theme.gold });
        const rl = Text.layout(ctx, parts.join(', ') || '-', 290, 14);
        Text.drawLines(ctx, rl, 324, y + 1, 19, 14);
        if (s.status === 'done') {
          const oc = s.outcome === 'jail' ? '결말: 넬을 경비대에 넘겼다' : s.outcome === 'join' ? '결말: 넬을 용서하고 동료로 맞이했다' : '완료';
          Text.draw(ctx, '[g]' + oc + '[/]', 280, 440, { size: 14 });
        }
      },
    };
    Engine.push(panel);
    const lw = new UI.ListWindow({
      x: 12, y: 62, w: 244, h: 406, items: build(), rowH: 30, maxRows: 12, cancel: true, empty: '(없음)',
      onHover: (it) => { sel = it ? it.value : null; },
      onLeftRight: (it, dx) => { tab = (tab + 1) % 2; lw.setItems(build(), false); sel = lw.items[0] ? lw.items[0].value : null; return true; },
    });
    sel = lw.items[0] ? lw.items[0].value : null;
    Engine.push(lw);
    try { for (;;) { const r = await lw.choose(); if (!r) break; } } finally { lw.close(); Engine.remove(panel); }
  }

  // ── 동료 대화 ──
  async function partyTalk() {
    const ids = Game.state.party.concat(Game.state.reserve).filter((id) => id !== 'hero');
    if (!ids.length) { await UI.message('(지금은 말을 걸 동료가 없다. 혼잣말이라도 해 볼까…)'); return; }
    for (const id of ids) {
      const line = partyTalkLine(id);
      if (line) await S.say(Game.name(id), line);
    }
  }

  // ── 저장 / 불러오기 ──
  function slotItems(forLoad) {
    const items = [];
    for (let i = 1; i <= Save.SLOTS; i++) {
      const inf = Save.info(i);
      if (!inf) items.push({ label: `기록 ${i}  ── 비어 있음 ──`, value: i, disabled: forLoad });
      else if (inf.corrupt) items.push({ label: `기록 ${i}  [r](손상된 데이터)[/]`, value: i, disabled: forLoad });
      else items.push({ label: `기록 ${i}  ${inf.name} Lv${inf.level}  ${inf.place}`, right: Util.fmtTime(inf.time), value: i });
    }
    return items;
  }
  async function saveScreen() {
    const r = await UI.list({ x: 60, y: 120, w: 520, items: slotItems(false), title: '어디에 기록할까요?', rowH: 40, cancel: true, initial: Math.max(0, Save.latest() - 1) });
    if (!r) return false;
    const inf = Save.info(r.value);
    if (inf && !(await confirm(`기록 ${r.value}에 덮어쓸까요?`))) return false;
    const ok = Save.write(r.value);
    Sound.sfx('save');
    await notice(ok ? `기록 ${r.value}에 모험을 기록했습니다.` : '[r]기록에 실패했습니다.[/] (브라우저 저장 공간을 확인해 주세요)');
    return ok;
  }
  async function loadScreen() {
    if (!Save.any()) { await notice('불러올 기록이 없습니다.'); return false; }
    const r = await UI.list({ x: 60, y: 120, w: 520, items: slotItems(true), title: '어느 기록을 불러올까요?', rowH: 40, cancel: true, initial: Math.max(0, Save.latest() - 1) });
    if (!r) return false;
    if (Field.map && !(await confirm('지금의 진행 상황은 사라집니다. 불러올까요?'))) return false;
    return Main.loadSlot(r.value);
  }

  // ── 설정 ──
  async function settingsScreen() {
    const keys = Object.keys(Settings.LABELS);
    const build = () => keys.map((k) => ({ label: Settings.LABELS[k].name, right: '◀ ' + Settings.display(k) + ' ▶', value: k, lr: true, rightColor: Theme.gold }));
    const lw = new UI.ListWindow({
      x: 90, y: 100, w: 460, items: build(), rowH: 36, title: '설정 (◀ ▶ 로 변경)', cancel: true,
      onLeftRight: (it, dx) => { const ch = Settings.step(it.value, dx); if (ch) { lw.setItems(build()); Sound.applyVolume(); Main.applyTouchSetting(); } return ch; },
    });
    Engine.push(lw);
    try { for (;;) { const r = await lw.choose(); if (!r) break; Settings.step(r.value, 1) || Settings.set(r.value, 0); lw.setItems(build()); Sound.applyVolume(); Main.applyTouchSetting(); } } finally { lw.close(); }
  }

  return { open, saveScreen, loadScreen, settingsScreen, confirm, pickMember, applyField, charIcon };
})();
