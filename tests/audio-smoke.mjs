// 오디오 스모크 테스트: 모든 BGM·징글·효과음을 재생해 예외가 없는지 확인
import { launch, sleep } from './helpers.mjs';
const { browser, page, errors } = await launch();
await page.mouse.click(200, 200); // 사용자 제스처 → 오디오 잠금 해제
await sleep(500);
const r = await page.evaluate(async () => {
  const S = __jr.Sound;
  S.unlock();
  await new Promise((res) => setTimeout(res, 300));
  const out = { unlocked: S.unlocked, songs: [], sfx: 0 };
  for (const name of Object.keys(S.SONGS)) {
    if (['victory', 'levelup', 'item', 'inn', 'quest', 'gameover', 'join'].includes(name)) continue;
    S.bgm(name);
    await new Promise((res) => setTimeout(res, 250));
    out.songs.push(S.current === name ? name : '!' + name);
  }
  for (const j of ['item', 'levelup']) await Promise.race([S.jingle(j), new Promise((res) => setTimeout(res, 3000))]);
  for (const n of ['cursor', 'confirm', 'cancel', 'buzzer', 'hit', 'crit', 'miss', 'hurt', 'enemyDie', 'fire', 'ice', 'thunder', 'light', 'dark', 'heal', 'buff', 'debuff', 'mist', 'encounter', 'escape', 'door', 'stairs', 'chest', 'coin', 'bump', 'impact', 'bell', 'chime', 'save', 'poison', 'steal', 'summon', 'charge', 'roar', 'text']) { S.sfx(n); out.sfx++; }
  S.stop();
  return out;
});
console.log(JSON.stringify(r));
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();
process.exit(errors.length || r.songs.some((s) => s.startsWith('!')) ? 1 : 0);
