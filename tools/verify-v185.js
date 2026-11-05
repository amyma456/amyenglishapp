#!/usr/bin/env node
/**
 * v185 校验：线上朗读主通道正式换成 Azure 神经语音（静态音频全量重做）。
 *
 * 家长 2026-11-05 试听 A/B 后定调：「Azure 更好一些，全部都换。」
 *
 * 这一版干了三件事：
 *   1. tools/pregen-tts.js 支持 --engine=azure，且**直连** Azure（经 worker 转
 *      一手要 4 秒/条，直连不到 1 秒/条，2777 条从三小时压到五分钟）。
 *   2. 全量静态音频用 Azure 重做 —— 文件名把 engine 编进哈希，天然破一年缓存。
 *   3. worker 的 azureTtsAudio 补上记账：免费层是「每月 50 万字符」的硬额度，
 *      不记就永远算不出余量，月闸形同虚设。
 *
 * 这个脚本盯的就是这三件事以后别被改回去。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

const workerSrc = fs.readFileSync(path.join(ROOT, 'worker/src/index.js'), 'utf8');
const pregenSrc = fs.readFileSync(path.join(ROOT, 'tools/pregen-tts.js'), 'utf8');

console.log('== 1) worker：Azure 记账（免费层月闸必须算得出余量）==');
const azureFn = (workerSrc.match(/async function azureTtsAudio[\s\S]{0,1400}?\n\}/) || [''])[0];
ok(/usage\.add\(text\.length\)/.test(azureFn), 'azureTtsAudio 合成成功后把字符数记进 azure_usage');
ok(/usage\.add\(text\.length\)[\s\S]{0,40}catch/.test(azureFn), '记账失败不吞掉音频（异常被兜住）');
ok(/AZURE_TTS_MONTHLY_CHAR_CAP/.test(workerSrc), '月度字符闸常量还在');

console.log('== 2) worker：音色映射与 SSML 口型 ==');
ok(/f1: 'en-US-AnaNeural'/.test(workerSrc), 'f1 = Ana（真·儿童音色）');
ok(/const AZURE_VOICE_EN = 'en-US-EmmaNeural'/.test(workerSrc), '英文默认 = Emma');
ok(/const AZURE_VOICE_CN = 'zh-CN-XiaoxiaoNeural'/.test(workerSrc), '中文 = 晓晓');
ok(/<prosody rate='-5%'>/.test(workerSrc), '语速 -5%（比默认稍慢，孩子跟得上）');

console.log('== 3) 预生成脚本：支持 --engine=azure，且直连 Azure ==');
ok(/async function fetchAzureDirect/.test(pregenSrc), '有 fetchAzureDirect（直连 Azure）');
ok(/engine === 'azure' \? await fetchAzureDirect\(text\)/.test(pregenSrc), 'ENGINE=azure 时走直连');
ok(!/ENGINE === 'azure'\s*\?\s*await fetchViaWorker/.test(pregenSrc), '不再绕 worker（那是三小时的走法）');
ok(/缺 AZURE_TTS_KEY/.test(pregenSrc), '缺密钥时报错说得清');
ok(/source: 'azure'/.test(pregenSrc), '抓回来的音频标记 source=azure');

console.log('== 4) 脚本与 worker 的 SSML 必须逐字一致 ==');
function voiceNames(src) {
  const m = src.match(/en-US-AnaNeural|en-US-AriaNeural|en-US-AndrewNeural|en-US-BrianNeural|en-US-EmmaNeural|zh-CN-XiaoxiaoNeural/g) || [];
  return Array.from(new Set(m)).sort().join(',');
}
ok(voiceNames(pregenSrc) === voiceNames(workerSrc),
   '两边音色表一致：' + voiceNames(workerSrc));
const ssmlShape = (src) => {
  const m = src.match(/<speak version='1\.0' xml:lang='" \+ lang \+ "'><voice name='" \+ name \+ "'>"\s*\+\s*"<prosody rate='-5%'>"/);
  return !!m;
};
ok(ssmlShape(pregenSrc) && ssmlShape(workerSrc), '两边 SSML 骨架字面相同（同一个人声）');

console.log('== 5) 换音色必须换文件名（一年 immutable 缓存）==');
ok(/const tag = \(engine \|\| ENGINE \|\| 'ali'\) \+ '\|'/.test(pregenSrc), '文件名哈希里编入 engine');
ok(/if \(f\.file !== fileNameFor\(t, ENGINE\)\) return true;/.test(pregenSrc),
   'todo 判断比对文件名 —— 否则换引擎会被当成"已生成"全部跳过');

console.log('== 6) 静态清单与文件 ==');
const manifestPath = path.join(ROOT, 'public/tts-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const keys = Object.keys(manifest).filter((k) => k !== '__static_probe__');
ok(keys.length > 2700, '清单条目 ' + keys.length + ' 条（含探针 1 条；v185 起旧题库残留已清）');
const missing = keys.filter((k) => !fs.existsSync(path.join(ROOT, 'public/tts', manifest[k])));
ok(missing.length === 0, '清单里引用的文件全都在盘上' + (missing.length ? '（缺 ' + missing.length + '）' : ''));
const workerManifest = fs.readFileSync(path.join(ROOT, 'worker/src/tts-manifest.js'), 'utf8');
ok(/export default \{/.test(workerManifest), 'worker 侧清单已同步生成');

console.log('== 7) 状态文件：全部条目都是 azure 音色 ==');
let state = null;
try { state = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/.pregen-tts-state.json'), 'utf8')); } catch (e) {}
ok(!!state, '状态文件存在');
if (state) {
  const all = Object.keys(state.files);
  const notAzure = all.filter((t) => state.files[t].source !== 'azure');
  ok(notAzure.length === 0, all.length + ' 条全部 source=azure' + (notAzure.length ? '（残留 ' + notAzure.length + ' 条旧音色）' : ''));
}

console.log('== 8) 版本钉子 ==');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');
ok((html.match(/\?v=185/g) || []).length === 6, 'index.html 六处 ?v=185');
ok(!/\?v=184/.test(html), 'index.html 没有残留 v185');
ok(/var CACHE_NAME = 'amy-english-v185';/.test(sw), 'sw.js CACHE_NAME = v185（旧缓存整体作废）');
ok(/var V = 185;/.test(sw), 'sw.js V = 185');

console.log('\n' + (fail ? '✗ 失败 ' + fail + ' 项' : '✓ 全部通过') + '（通过 ' + pass + ' 项）');
process.exit(fail ? 1 : 0);
