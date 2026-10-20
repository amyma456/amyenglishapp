// v148 验证：把"就这个手机容易出问题"治到设备层
//
// 家长 2026-10-20（红米 note 9 5G + 自带浏览器，小米 11 / 13 正常）：
//   「说改了，结果还是没有太大的改善，我很生气！…孩子已经很用心在读了，
//     每字每句都在卡着，然后过不去。并且有时候录出来的声音是很渣的、
//     很嘈杂的，这是为什么？」
//
// 前几版改的都是"门槛"（一把尺调松调紧），这一版改的是**设备的实际录音**：
//   · 千元机常把 AudioContext 的 16k 降成 8k → 高频全丢，声音发闷、识别空手；
//   · 麦克风增益大 / 贴嘴太近 → 波形削平（削波）→ 听着"嘈杂、刺啦"；
//   · 省电策略压采集线程 → 掉帧 → 听着"断续"。
// 三个都能从样本里量出来，量出来就能：① 判定用设备自己的基准；② 提示孩子
// "离远一点"而不是让他重读；③ 记进后台，下次不用再猜。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const recSrc = fs.readFileSync(path.join(ROOT, 'public/recorder.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');

let fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  OK   ' : '  FAIL ') + msg + (cond || extra == null ? '' : ' —— ' + extra));
  if (!cond) fail++;
};

// ---------------------------------------------------------------------------
// 把 recorder.js 的 _micHealth / _healthLabel 单独抠出来跑真样本。
// 直接 eval 整个文件太重（它引用 window/navigator），所以只取这两个方法。
// ---------------------------------------------------------------------------
function loadHealth() {
  const box = {};
  const m = recSrc.match(/_micHealth\(flat, srcRate\)\s*\{[\s\S]*?\n  \},/);
  const l = recSrc.match(/_healthLabel\(h\)\s*\{[\s\S]*?\n  \},/);
  if (!m || !l) return null;
  // eslint-disable-next-line no-new-func
  new Function('box', 'obj = {' + m[0] + l[0] + '}; box._micHealth = obj._micHealth; '
    + 'box._healthLabel = obj._healthLabel;')(box);
  return box;
}

const H = loadHealth();

function tone(len, amp, freq) {
  const s = new Float32Array(len);
  for (let i = 0; i < len; i++) s[i] = Math.sin(2 * Math.PI * (freq || 220) * i / 16000) * amp;
  return s;
}
function talk(len) {                       // 模拟"说话"：有起伏，中间停顿
  const s = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / 16000;
    const env = 0.5 + 0.45 * Math.sin(2 * Math.PI * 2.5 * t);
    const pause = (t % 1.2) > 0.95 ? 0 : 1;    // 每 1.2 秒停 0.25 秒
    // 停顿里留着真实的房间底噪（0.002 量级）—— 真实手机绝不会给出
    // 数字精确等于 0 的采样，除非采集线程真的停了。测试信号必须像真的。
    const noise = (i % 7 - 3) * 0.0005;
    s[i] = (Math.sin(2 * Math.PI * 180 * t) * 0.35 * env + noise) * pause + noise * (1 - pause);
  }
  return s;
}

console.log('== 1. 录音体质能真的量出来（用合成信号验算法，不靠猜） ==');
{
  ok(!!H, '找到 _micHealth / _healthLabel');

  if (H) {
    // ① 正常 16k 说话
    const good = H._micHealth(talk(16000 * 2), 16000);
    ok(!good.lowRate, '16k 不被判降采样');
    ok(good.voicedRatio > 0.4, '正常说话的"人声占比"很高', good.voicedRatio.toFixed(2));
    ok(good.clipRatio < 0.001, '正常说话不算爆音', good.clipRatio.toFixed(4));
    ok(good.dropouts === 0, '正常说话没有掉帧', String(good.dropouts));

    // ② 降采样 8k —— 红米这类机器的典型症状
    const low = H._micHealth(talk(16000 * 2), 8000);
    ok(low.lowRate, '★ 8k 被认出来（红米降采样这条）');
    ok(H._healthLabel(low).indexOf('发闷') >= 0, '报告里点明"发闷"');

    // ③ 削波：贴嘴太近、增益开满 → 波形顶到 ±1
    const clipped = new Float32Array(16000 * 2);
    const src = talk(clipped.length);
    for (let i = 0; i < src.length; i++) clipped[i] = Math.max(-1, Math.min(1, src[i] * 6));
    const ch = H._micHealth(clipped, 16000);
    ok(ch.clipRatio > 0.02, '★ 削波被量出来（"嘈杂"这条）', (ch.clipRatio * 100).toFixed(1) + '%');
    ok(H._healthLabel(ch).indexOf('嘈杂') >= 0, '报告里点明"嘈杂"');

    // ④ 掉帧：中间整段为 0
    const drop = talk(16000 * 2);
    for (let i = 8000; i < 12000; i++) drop[i] = 0;      // 250ms 空洞
    const dr = H._micHealth(drop, 16000);
    ok(dr.dropouts >= 1, '★ 掉帧被数出来（"断续"这条）', String(dr.dropouts));

    // ⑤ 全静音
    const silent = new Float32Array(16000 * 2);
    const si = H._micHealth(silent, 16000);
    ok(si.voicedRatio < 0.01, '静音的人声占比 ≈ 0');
    ok(H._healthLabel(si).indexOf('没有人声') >= 0, '静音会被点名');

    // ⑥ 空样本不能崩
    const empty = H._micHealth(new Float32Array(0), 16000);
    ok(empty && empty.voicedRatio === 0, '空样本安全返回（不抛错、人声占比 0）');
    ok(H._healthLabel(empty) === '无数据' || typeof H._healthLabel(empty) === 'string', '空样本也有文案');
  }
}

console.log('== 2. stop() 把体质交出去，口语那一路存进 meta ==');
{
  ok(/health: health,/.test(recSrc) || /health: health/.test(recSrc), 'stop() 返回 health');
  ok(/_healthLabel\(health\)|healthLabel: this\._healthLabel/.test(recSrc), 'stop() 同时给一句话结论');
  ok(/peak: out\.peak, health: out\.health \|\| null/.test(appSrc), '口语片段 meta 里带上了 health');
  ok(/this\._micNote\(out, 'sp'\)/.test(appSrc), '口语录完也会记一笔');
}

console.log('== 3. 判定用设备自己的基准（只在降采样时放宽） ==');
{
  const body = appSrc.slice(appSrc.indexOf('_voiceOk(out, minSec)'), appSrc.indexOf('_voiceOk(out, minSec)') + 1400);
  ok(/lowRate/.test(body), '★ _voiceOk 读设备的 lowRate');
  ok(/const th = lowRate \? this\.VOICE_MIN_PEAK \* 0\.5 : this\.VOICE_MIN_PEAK/.test(body),
     '降采样设备：峰值门槛减半');
  ok(/const ratioNeed = lowRate \? this\.VOICE_MIN_RATIO \* 0\.6 : this\.VOICE_MIN_RATIO/.test(body),
     '降采样设备：占比门槛也放宽（×0.6）');
  // 反向保护：正常设备不能被误放宽
  ok(/VOICE_MIN_RATIO: 0\.08/.test(appSrc), '正常设备仍是 8%，没有全局降标准');
}

console.log('== 4. 「没录到声音」的判定收成一个出口（不再各写一遍） ==');
{
  ok(/_judgeSilence\(out, minSec\)/.test(appSrc), '有统一的 _judgeSilence');
  const code = appSrc.split('\n').map(function (l) { return l.replace(/\/\/.*$/, ''); }).join('\n');
  const left = (code.match(/voiceOk\s*=\s*!\w+\s*&&\s*(self|this)\._voiceOk\(out\)/g) || []).length;
  ok(left === 0, '★ 页面里不再有各写一遍的 _voiceOk(out)', '还剩 ' + left + ' 处');
  const used = (appSrc.match(/_judgeSilence\(out\)\.voiceOk/g) || []).length;
  ok(used >= 7, '所有"没录到声音"的位置都走统一判定', '接入 ' + used + ' 处');
  // 每个调用点都要记体质
  const notes = (appSrc.match(/_micNote\(out, 'v148'\)/g) || []).length;
  ok(notes === used, '每次判定都顺手记下设备体质', notes + '/' + used);
}

console.log('== 5. 手机自检页（?micdiag=1） ==');
{
  ok(/micdiag=1/.test(appSrc), '入口存在');
  ok(/runMicDiag\(\)\s*\{/.test(appSrc), '有 runMicDiag');
  const body = appSrc.slice(appSrc.indexOf('runMicDiag() {'), appSrc.indexOf('runMicDiag() {') + 7000);
  ok(/Recorder\.prime\(\)/.test(body), '自检也先预热（和真实朗读同一条路）');
  ok(/srcRate/.test(body) && /clipRatio/.test(body) && /dropouts/.test(body),
     '报告逐项列出：采样率 / 爆音 / 掉帧');
  ok(/audio controls src=/.test(body), '能当场回放刚才那段录音');
  ok(/离手机 10~15 厘米|10~15/.test(body), '给出"离多远"的具体建议');
}

console.log('== 6. 爆音时的提示语不怪孩子 ==');
{
  ok(/_clipHintHtml/.test(appSrc), '有 _clipHintHtml');
  const h = appSrc.slice(appSrc.indexOf('_clipHintHtml()'), appSrc.indexOf('_clipHintHtml()') + 300);
  ok(/爆音/.test(h), '说的是"爆音"而不是"没读清"');
  ok(/离/ .test(h), '给出可执行的动作：离远一点');
}

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
