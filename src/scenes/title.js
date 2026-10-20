'use strict';
// ─────────────────────────────────────────────────────────────
// Title: 타이틀 화면 (밤하늘 · 별똥별 · 종탑 실루엣)
// ─────────────────────────────────────────────────────────────
const Title = (() => {
  let t = 0;
  let pressed = false;
  let menu = null;
  const stars = Array.from({ length: 90 }, (_, i) => ({ x: Util.hash2(i, 1) * 640, y: Util.hash2(i, 2) * 300, s: Util.hash2(i, 3) < 0.15 ? 2 : 1, p: Util.hash2(i, 4) * 6 }));
  let meteor = null;

  const layer = {
    modal: true,
    onPush() { t = 0; pressed = false; Sound.bgm('title'); },
    update(dt) {
      t += dt;
      if (!meteor && Util.chance(dt * 0.4)) meteor = { x: 200 + Math.random() * 400, y: 20 + Math.random() * 60, t: 0 };
      if (meteor) { meteor.t += dt; if (meteor.t > 1.2) meteor = null; }
    },
    onAction(a) { if (!pressed) start(); },
    onPointer(ev) { if (ev.type === 'down' && !pressed) start(); return true; },
    draw(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 480);
      g.addColorStop(0, '#05061a'); g.addColorStop(0.6, '#1a1840'); g.addColorStop(1, '#3a2858');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 480);
      for (const s of stars) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + s.p)); ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, s.s, s.s); }
      ctx.globalAlpha = 1;
      if (meteor) {
        const k = meteor.t / 1.2;
        const x = meteor.x - k * 220, y = meteor.y + k * 110;
        const gr = ctx.createLinearGradient(x, y, x + 80, y - 40);
        gr.addColorStop(0, 'rgba(255,250,220,0.95)'); gr.addColorStop(1, 'rgba(255,250,220,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 3; ctx.globalAlpha = 1 - k;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 80, y - 40); ctx.stroke(); ctx.globalAlpha = 1;
      }
      // 산 실루엣
      ctx.fillStyle = '#141230';
      ctx.beginPath(); ctx.moveTo(0, 400);
      for (let x = 0; x <= 640; x += 40) ctx.lineTo(x, 360 - Math.abs(Math.sin(x * 0.012)) * 70 - (x % 80 === 0 ? 14 : 0));
      ctx.lineTo(640, 480); ctx.lineTo(0, 480); ctx.fill();
      // 종탑
      ctx.fillStyle = '#0c0a20';
      ctx.fillRect(470, 250, 44, 160); ctx.beginPath(); ctx.moveTo(462, 252); ctx.lineTo(492, 206); ctx.lineTo(522, 252); ctx.fill();
      ctx.fillStyle = `rgba(255,215,94,${0.5 + 0.3 * Math.sin(t * 2)})`;
      ctx.beginPath(); ctx.moveTo(482, 270); ctx.quadraticCurveTo(492, 258, 502, 270); ctx.lineTo(505, 292); ctx.lineTo(479, 292); ctx.fill();
      ctx.fillStyle = '#0a081a'; ctx.fillRect(0, 420, 640, 60);
      // 마을 불빛
      for (let i = 0; i < 9; i++) { ctx.fillStyle = `rgba(255,200,110,${0.5 + 0.4 * Math.sin(t * 3 + i)})`; ctx.fillRect(60 + i * 38 + (i % 2) * 7, 430 + (i % 3) * 6, 4, 4); }
      // 제목
      const a = Math.min(1, t / 1.5);
      ctx.globalAlpha = a;
      ctx.save();
      ctx.shadowColor = 'rgba(255,215,94,0.8)'; ctx.shadowBlur = 18;
      Text.draw(ctx, '별빛 종의 이방인', 320, 92, { size: 50, bold: true, align: 'center', color: '#ffe9a8', shadow: false });
      ctx.restore();
      Text.draw(ctx, '─ Stranger of the Starlit Bell ─', 320, 156, { size: 17, align: 'center', color: '#bcd0ff' });
      Text.draw(ctx, '제1장 잠든 종의 유적 · 제2장 왕도로 가는 길 · 제3장 사막의 종', 320, 184, { size: 15, align: 'center', color: Theme.dim });
      ctx.globalAlpha = 1;
      if (!pressed && t > 0.8 && Math.floor(t * 1.6) % 2 === 0) Text.draw(ctx, '화면을 누르거나 아무 키나 누르세요', 320, 300, { size: 18, align: 'center' });
      Text.draw(ctx, '© 2026 · 모든 그래픽과 음악은 코드로 생성되었습니다', 320, 456, { size: 11, align: 'center', color: '#6a6a90' });
    },
  };

  async function start() {
    pressed = true;
    Sound.unlock();
    Sound.sfx('confirm');
    setTimeout(() => Sound.bgm('title'), 120);
    for (;;) {
      const hasSave = Save.any();
      menu = new UI.ListWindow({
        x: 220, y: 236, w: 200, rowH: 36, cancel: false, size: 19,
        items: [
          { label: '새 게임', value: 'new' },
          { label: '이어하기', value: 'continue', disabled: !hasSave },
          { label: '설정', value: 'settings' },
          { label: '조작 방법', value: 'help' },
        ],
        initial: hasSave ? 1 : 0,
      });
      Engine.push(menu);
      const r = await menu.choose();
      menu.close();
      if (!r) continue;
      if (r.value === 'new') { await Main.newGame(); return; }
      if (r.value === 'continue') {
        const ok = await Menu.loadScreen();
        if (ok) return;
      }
      if (r.value === 'settings') await Menu.settingsScreen();
      if (r.value === 'help') {
        await UI.message([
          '[y]키보드[/]  방향키/WASD 이동 · Z/Enter/Space 결정·조사 · X/Esc 취소·메뉴\nShift 걷기↔달리기 · M 지도 · Q/E 목록 페이지 넘김',
          '[y]마우스[/]  가고 싶은 곳을 클릭하면 그곳까지 걸어간다. 사람이나 물건을 클릭하면 다가가서 말을 걸거나 조사한다.\n오른쪽 클릭은 취소. 오른쪽 위 ☰ 버튼은 메뉴.',
          '[y]터치[/]  화면 왼쪽 아래의 방향 패드로 이동, A 결정 · B 취소 · ☰ 메뉴.\n화면을 직접 눌러서 이동할 수도 있다.',
          '[y]전투 요령[/]  적이 무언가 벼르고 있다면 몸을 지키는 법도 있다. 「분석」으로 상대를 살펴보는 것도 좋다.\n쓰러진 동료는 여관에서 쉬거나 되살림 깃털·「소생」으로 되살릴 수 있다.',
          '[y]저장[/]  메뉴의 「저장」으로 언제든 기록할 수 있다. 신전과 유적의 수정에서도 기록할 수 있다.',
        ]);
      }
    }
  }

  return { layer };
})();
