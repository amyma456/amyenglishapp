// v147 验证：「这次没录到声音，再按住说一遍」误判的修复
// 家长 2026-10-20：「孩子明明读得都很对，读了四五遍了，仍然显示这次没录到
// 声音，导致下一题弹不出来。」
//
// 根因（本次实测确认）：
//   1. Recorder.start() 里 getUserMedia → 建 AudioContext → 编译 worklet →
//      接节点，手机上要 150~500ms，而调用方是 fire-and-forget，孩子按下去就
//      开口 → 前半句甚至整句没进音频 → 判"没录到声音"；
//   2. _voiceOk 的"有声帧占比 ≥18%"对手机低增益麦克风太苛刻，合法朗读被拦。
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

console.log('== 1. 录音起手不再丢开头（prime 预热 + 接管） ==');
{
  ok(/prime\s*\(\)\s*\{/.test(recSrc), 'Recorder 有 prime()');
  const primeBody = recSrc.slice(recSrc.indexOf('prime() {'), recSrc.indexOf('prime() {') + 900);
  ok(/start\(\{\s*pre:\s*true\s*\}\)/.test(primeBody), 'prime 用的是带 pre 标记的 start');
  ok(/_primeT/.test(primeBody), '预热有 6 秒上限，不会一直占着麦克风');

  const startBody = recSrc.slice(recSrc.indexOf('async start(opts)'), recSrc.indexOf('async start(opts)') + 1600);
  // 关键：getUserMedia 之前不能有 await（否则抢麦被推迟）。先切出这一段，
  // 接管快路里有个 `return hot`，天然没有 await，不该算进来。
  const idxGum = startBody.indexOf('getUserMedia');
  // 只数真代码里的 await —— 注释里写「不要在这一行之前 await 任何东西」不算。
  const before = startBody.slice(0, idxGum)
    .split('\n').map(function (l) { return l.replace(/\/\/.*$/, ''); }).join('\n');
  const awaitBefore = (before.match(/\bawait\b/g) || []).length;
  ok(awaitBefore === 0, 'getUserMedia 之前没有 await（同步抢麦）', '发现 ' + awaitBefore + ' 个 await');

  ok(/const hot = this\._active;/.test(before), 'start() 会检查是否已有预热中的采集');
  ok(/options\.pre !== true[\s\S]{0,220}return hot/.test(before), '有预热 → 直接接管，不重开麦');
  ok(/hot\.levelRef\.fn = options\.onLevel/.test(before), '接管时把音量回调接上（音量条能动）');
  ok(/hot\.startedAt = Date\.now\(\)/.test(before), '接管时重新起算时长（预热那段只当提前量）');
}

console.log('== 2. 按下那一刻就开录 ==');
{
  // v163：_holdStart 头部加了一键录音（tapToggle）分支，函数体变长 —— 窗口放宽到 5200。
  const hs = appSrc.slice(appSrc.indexOf('  _holdStart(ev, key, promptLabel'), appSrc.indexOf('  _holdStart(ev, key, promptLabel') + 5200);
  const flat = hs.replace(/\s+/g, ' ');
  const primed = appSrc.slice(appSrc.indexOf('  _holdStart(ev, key, promptLabel'), appSrc.indexOf('  _holdStart(ev, key, promptLabel') + 3000);
  ok(/Recorder\.prime\(\)/.test(primed), '手指一按就调 Recorder.prime()（预热）');
  ok(/typeof Recorder\.prime === 'function'/.test(hs), '老环境没有 prime 也不会抛错');
  ok(/\.then\(function \(\) \{ started = true; return begin\(\); \}\)/.test(flat),
     '预热完成后立刻 begin()（录音真开始）');
  ok(/var begin = function \(\) \{ return Recorder\.start\(/.test(flat), 'begin() 就是 Recorder.start');
  // 预热必须在 _holdKey 置位之后、还没 await 任何东西之前就发出去
  const iKey = hs.indexOf('this._holdKey = key');
  const iPrime = hs.indexOf('Recorder.prime()');
  ok(iKey >= 0 && iPrime > iKey, '先占住 _holdKey 再预热（防连击重复开麦）');
}

console.log('== 3. 无声判定不再冤枉手机麦克风 ==');
{
  const m = appSrc.match(/VOICE_MIN_RATIO:\s*([0-9.]+)/);
  ok(!!m, '找到 VOICE_MIN_RATIO');
  const ratio = m ? parseFloat(m[1]) : 1;
  ok(ratio > 0 && ratio <= 0.10, '有声帧占比门槛 ≤10%（原 18% 会误杀低增益麦克风）', String(ratio));
  const peak = parseFloat((appSrc.match(/VOICE_MIN_PEAK:\s*([0-9.]+)/) || [])[1]);
  ok(peak > 0 && peak <= 0.06, '峰值门槛仍能挡住底噪（≤0.06）', String(peak));
  // 反向保护：不能松到"一点咔嗒声就算读过"
  ok(ratio >= 0.05, '但也不能松到 5% 以下（否则一声咔嗒就过）', String(ratio));
}

console.log('== 4. 收尾清理（避免下次录音拿到脏状态） ==');
{
  const stopBody = recSrc.slice(recSrc.indexOf('async stop()'), recSrc.indexOf('async stop()') + 600);
  ok(/_primeP = null/.test(stopBody), 'stop() 清预热标记');
  ok(/_hotTaken = false/.test(stopBody), 'stop() 清接管标记');
  ok(/clearTimeout\(this\._primeT\)/.test(stopBody), 'stop() 清预热定时器');
}

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
