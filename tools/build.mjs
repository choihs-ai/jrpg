// 단일 HTML 빌드: index.html + style.css + src/*.js → dist/starbell-jrpg.html
//  외부 의존성 없이 파일 하나로 실행된다 (오프라인, 모바일 사파리 포함)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

const start = html.indexOf('<!-- @@SCRIPTS_START@@ -->');
const end = html.indexOf('<!-- @@SCRIPTS_END@@ -->');
if (start < 0 || end < 0) throw new Error('script markers not found in index.html');
const block = html.slice(start, end);
const files = [...block.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (!files.length) throw new Error('no scripts found');

let js = '';
for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  js += `\n// ── ${f} ──\n${src}\n`;
}
js = js.replace(/<\/script/gi, '<\\/script');

let out = html.slice(0, start) + `<script>\n${js}\n</script>\n` + html.slice(end + '<!-- @@SCRIPTS_END@@ -->'.length);
out = out.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const dest = path.join(ROOT, 'dist', 'starbell-jrpg.html');
fs.writeFileSync(dest, out);
console.log(`built ${path.relative(ROOT, dest)} — ${files.length} scripts, ${(out.length / 1024).toFixed(1)} KB`);

// 웹 게시용 조각 (문서 골격 없이 title·style·본문·스크립트만): dist/play.html
const bodyStart = html.indexOf('<body>') + '<body>'.length;
const body = html.slice(bodyStart, start).trim();
const fragment = [
  '<title>별빛 종의 이방인</title>',
  '<meta name="theme-color" content="#05060f">',
  `<style>\n:root { color-scheme: dark; }\n${css}\n</style>`,
  body,
  `<script>\n${js}\n</script>`,
].join('\n');
const dest2 = path.join(ROOT, 'dist', 'play.html');
fs.writeFileSync(dest2, fragment);
console.log(`built ${path.relative(ROOT, dest2)} — ${(fragment.length / 1024).toFixed(1)} KB (artifact fragment)`);
