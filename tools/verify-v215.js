/* eslint-disable */
// v215 校验：微软通道从「兜底」升级为「首发」，但**必须**用普通识别。
//
// 这一版治的是「出分慢」。改动的风险点很集中，逐条钉住：
//   ① Azure 真的和阿里云同时起跑（不是又变成串行）；
//   ② 首发请求**不带**发音评估头 —— 带了它，微软会把读错的词替换成参考句里
//      的词（读成 eat/before，它回 read/after），判定层就会"读错也满分"；
//   ③ 静音时它回的 "." 不能被当成识别成功；
//   ④ 谁先给文本用谁，空手的那一路不占位；
//   ⑤ 输了的那一路不会留下未处理的 rejection。
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'worker/src/index.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg); }
}

console.log('\n[1] Azure 与阿里云同时起跑');
{
  ok(/const aliP = runAliyun\(\);/.test(worker) &&
    /const azP = \(azureReady && bias/.test(worker),
    '默认路径里两条通道都在起跑（aliP + azP）');
  // azP 必须在 firstText 之前就已创建，否则就是串行
  const azAt = worker.indexOf('const azP = (azureReady');
  const raceAt = worker.indexOf('await firstText(entries, hedgeMs)');
  ok(azAt > 0 && raceAt > azAt, 'azP 在竞速之前创建（不是等阿里云失败才发）');
  ok(/async function firstText\(list, capMs\)/.test(worker), '存在"第一个有文本"的竞速函数');
  ok(/queue = queue\.filter\(function \(e\) \{ return e\.who !== w\.who; \}\);/.test(worker),
    '空手而归的一路不占位，继续等另一路');
  ok(/runBackup\(!!azP\)/.test(worker), '兜底不再重复打一次 Azure（skipAzure）');
  ok(/async function runBackup\(skipAzure\)/.test(worker), 'runBackup 支持跳过 Azure');
}

console.log('\n[2] 首发请求不带发音评估（否则读错也会被判过）');
{
  const azCall = worker.slice(worker.indexOf('return azureTranscribe(cfBytes, env, mode, bias'),
    worker.indexOf('return azureTranscribe(cfBytes, env, mode, bias') + 120);
  ok(/first: true/.test(azCall), '首发调用标了 first（用较宽松的超时）');
  ok(!/pa: true/.test(azCall), '首发调用**没有** pa: true —— 这是"读错判过"的根因');
  ok(/发音评估会把识别结果按参考句对齐/.test(worker), '代码里写明了为什么不能用 PA 文本');
  // PA 能力本身保留着（将来校准确了再接），但默认路径不调用
  ok(/const wantPa = !!\(opts && opts\.pa\)/.test(worker), 'PA 能力保留，由 opts.pa 显式开启');
  ok(/AZURE_PA_TIMEOUT_MS/.test(worker), 'PA 的超时常量仍在');
}

console.log('\n[3] 静音不冒充"识别成功"');
{
  ok(/if \(!\/\[A-Za-z0-9\\u4e00-\\u9fa5\]\/\.test\(text\)\) text = '';/.test(worker),
    '纯标点（静音时微软回的 "."）视为空文本');
  ok(/restoreDigits\(text, bias\)/.test(worker), '数字还原（ten → 10）没有丢');
}

console.log('\n[4] 分数来源');
{
  ok(/const usePa = !!\(ai && azureAccuracy != null/.test(worker),
    'PA 分只在真的拿到 PA 结果时才用');
  ok(/const aiScore = usePa \? azureAccuracy : \(ai \? ai\.score : null\);/.test(worker),
    '没有 PA 分时退回本地合分（与 v214 一致）');
  ok(/paWords:/.test(worker), '词级分数透传出去（给以后的高亮用）');
}

console.log('\n[5] 判定输入的性质没变');
{
  // 判定层看的是 text；只要 text 来自普通识别，判定口径就不动。
  ok(/model: wantPa \? 'azure-pa' : 'azure-stt'/.test(worker),
    '普通识别标 azure-stt，PA 标 azure-pa，能区分');
  ok(/X-Asr-Channel/.test(worker) && /az;dur=/.test(worker), 'Server-Timing 仍能分别看两路耗时');
}

console.log('\n[6] 配套工具');
{
  ok(fs.existsSync(path.join(root, 'tools/probe-azure-pa2.js')),
    'tools/probe-azure-pa2.js（验证微软能不能出分、耗时多少）');
  ok(fs.existsSync(path.join(root, 'tools/verify-v215-accuracy.js')),
    'tools/verify-v215-accuracy.js（读对判过 / 读错判不过的回归）');
}

console.log('\n' + (fail ? ('FAILED ' + fail + ' / ' + (pass + fail)) : ('ALL PASS ' + pass)));
process.exit(fail ? 1 : 0);
