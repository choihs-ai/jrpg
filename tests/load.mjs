// 브라우저 없이 게임 로직 스크립트를 vm으로 불러온다 (테스트·밸런스 시뮬레이션용)
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGIC = [
  'src/core/util.js', 'src/data/items.js', 'src/data/skills.js', 'src/data/characters.js', 'src/data/monsters.js',
  'src/systems/settings.js', 'src/systems/game.js', 'src/systems/quests.js', 'src/systems/save.js', 'src/systems/battlecore.js',
  'src/maps/legend.js', 'src/maps/maps.js', 'src/maps/rivel.js', 'src/maps/field.js', 'src/maps/dungeons.js', 'src/maps/story.js', 'src/data/talk.js',
];
export function loadGame() {
  const store = {};
  const ctx = {
    console, Math, JSON, Date, setTimeout, clearTimeout,
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    window: {}, document: { addEventListener() {} },
  };
  vm.createContext(ctx);
  let src = LOGIC.map((f) => `//# ${f}\n` + fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
  // 최상위 const 를 컨텍스트 밖에서 꺼내 쓰기 위한 노출
  src += '\n;globalThis.__G = { Util, ITEMS, SKILLS, CHARACTERS, MONSTERS, ENCOUNTERS, Game, Quests, QUESTS, Save, BattleCore, Actor, TILES, MAPS, Settings, expForLevel, expToNext, EQUIP_SLOTS, ELEMENTS, localStorage };';
  vm.runInContext(src, ctx, { filename: 'game-logic.js' });
  return ctx.__G;
}
