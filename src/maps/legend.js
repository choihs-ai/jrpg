'use strict';
// ─────────────────────────────────────────────────────────────
// 타일 범례: 맵 문자 → 속성 (충돌, 바닥 종류 등)
//  그리기는 gfx/tiles.js 담당. 이 파일은 DOM 없이 로직/테스트에서 사용.
// ─────────────────────────────────────────────────────────────
const TILES = {
  // 야외 지형
  '.': { name: 'grass' },
  ',': { name: 'grass2' },
  '"': { name: 'flowers' },
  ';': { name: 'tallgrass' },
  'T': { name: 'tree', solid: true },
  'Y': { name: 'pine', solid: true },
  'Z': { name: 'secrettree' },            // 겉보기엔 나무지만 지나갈 수 있다 (비밀 통로)
  '~': { name: 'water', solid: true },
  '=': { name: 'bridgeH' },
  'H': { name: 'bridgeV' },
  ':': { name: 'path', road: true },
  's': { name: 'sand' },
  '^': { name: 'mountain', solid: true },
  'r': { name: 'rock', solid: true },
  'F': { name: 'fence', solid: true },
  'e': { name: 'hedge', solid: true },
  'u': { name: 'farm' },
  'q': { name: 'cobble', road: true },
  'l': { name: 'lamp', solid: true },
  'S': { name: 'sign', solid: true },
  'o': { name: 'well', solid: true },
  'x': { name: 'barrel', solid: true },
  'X': { name: 'crate', solid: true },
  'j': { name: 'pot', solid: true },
  'P': { name: 'pillar', solid: true },
  'g': { name: 'grave', solid: true },
  'm': { name: 'windmill', solid: true },
  // 건물 외벽
  'W': { name: 'wallWood', solid: true },
  'B': { name: 'wallStone', solid: true },
  'n': { name: 'windowWood', solid: true },
  'N': { name: 'windowStone', solid: true },
  'R': { name: 'roofRed', solid: true },
  'Q': { name: 'roofBlue', solid: true },
  'G': { name: 'roofGreen', solid: true },
  'D': { name: 'door' },
  // 필드 아이콘
  'V': { name: 'iconTown' },
  'U': { name: 'iconRuins' },
  'K': { name: 'iconCabin' },
  'C': { name: 'iconCapital' },
  // 왕도
  'M': { name: 'marble', road: true },
  '@': { name: 'fountain', solid: true },
  'J': { name: 'statue', solid: true },
  'd': { name: 'stall', solid: true },
  // 실내
  'I': { name: 'wallIn', solid: true },
  'w': { name: 'floorWood' },
  'c': { name: 'carpet' },
  'k': { name: 'counter', solid: true, counter: true },
  'L': { name: 'bookshelf', solid: true },
  'b': { name: 'bed', solid: true },
  't': { name: 'table', solid: true },
  'h': { name: 'stool' },
  'p': { name: 'plant', solid: true },
  'f': { name: 'fireplace', solid: true },
  'E': { name: 'mat' },
  'A': { name: 'altar', solid: true },
  'a': { name: 'anvil', solid: true },
  'i': { name: 'shelf', solid: true },
  'z': { name: 'dresser', solid: true },
  // 던전
  '#': { name: 'wallDungeon', solid: true },
  '_': { name: 'floorStone' },
  '-': { name: 'floorRubble' },
  '%': { name: 'crackedWall', solid: true },
  '|': { name: 'gate', solid: true },
  '&': { name: 'torchWall', solid: true },
  '*': { name: 'crystal', solid: true },
  '>': { name: 'stairsDown' },
  '<': { name: 'stairsUp' },
  '0': { name: 'sealDoor', solid: true },
  '$': { name: 'abyss', solid: true },
  'y': { name: 'caveFloor' },
  'O': { name: 'bellBase', solid: true },
  'v': { name: 'sludge', solid: true },
  '+': { name: 'grate' },
  '1': { name: 'gearWall', solid: true },
  ' ': { name: 'void', solid: true },
};

// 맵 종류별 기본 바닥 (물체 타일 아래 깔리는 바닥)
const TILE_BASE = {
  outdoor: '.', town: '.', interior: 'w', dungeon: '_', field: '.',
};
