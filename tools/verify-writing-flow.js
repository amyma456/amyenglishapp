/* eslint-disable */
// 写作练习流程校验：把 public/app.js 原样加载进来（只 stub 掉浏览器环境），
// 真跑一遍「填空 → 提交 → 朗读全文 → 全文中文翻译」，确认这几件事没被改坏：
//
//   1. 作文步骤拆成两屏：writing（填空）+ writingread（朗读全文）
//   2. 参考单词条是 sticky 容器（writing-kwbar）：只给英文，中文要点开英文词
//      后在打乱的候选里自己配对出来（配错只提示再想想、不给答案）；配对成功后
//      中文立刻被「眼睛」遮回去，点眼睛才露出来；而且不跟填空联动
//   3. 横线要配对全部做完才让填（readonly + 提示条），提交处还有一道兜底
//   3. 空没填全对 → 不放行；改对再提交 → 放行「开始朗读」
//   4. 朗读屏：句句 ≥60 才记为通过，没全过 nextStep 硬门禁不放行
//   5. 全部读对 → 出全文中文翻译、解锁「下一题」
//   6. 断点续做：作文填完但朗读没做，回到朗读那一屏（不用重填作文）
//
// 用法：node tools/verify-writing-flow.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub ----------
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false,
    classList: {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => on ? e._cls.add(c) : e._cls.delete(c),
      contains: c => e._cls.has(c),
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    insertAdjacentHTML: (pos, h) => { e.innerHTML += h; },
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    removeAttribute: k => { delete e._attrs[k]; },
    appendChild: () => {}, remove: () => {}, scrollIntoView: () => {},
    play: () => Promise.resolve(), focus: () => {}, click: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
  };
  return e;
}
const byId = {};
const getEl = id => (byId[id] = byId[id] || el('div'));
const blankInputs = {};                       // data-blank -> 假输入框
const document = {
  getElementById: getEl,
  querySelector: sel => {
    const mm = /^\[data-blank="(.+)"\]$/.exec(sel);
    if (mm) return blankInputs[mm[1]] || null;
    if (sel === '.writing-kwbar') return el('div');
    return null;
  },
  querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: el('body'), documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

// ---------- Api / Recorder stub ----------
const apiCalls = { speaking: [] };
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: o => { apiCalls.speaking.push(o); return Promise.resolve({}); },
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();

process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

// ---------- 找出写作模块 ----------
let DAY = -1, MI = -1;
HOMEWORK_DATA.forEach((d, di) => (d.modules || []).forEach((mm, mi) => {
  if (DAY < 0 && mm.type === 'writing_template') { DAY = di; MI = mi; }
}));
if (DAY < 0) { console.log('数据里没有 writing_template 模块'); process.exit(1); }

App.state.currentDay = DAY;
App.state.phone = '13800000000';
App.state.role = 'student';
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test' }];
App.state.currentTab = 'today';
const m = HOMEWORK_DATA[DAY].modules[MI];
console.log('模块：' + HOMEWORK_DATA[DAY].day_cn + ' / ' + m.name_cn + '（type=' + m.type + '）\n');

// ---- 主体：配对→填空→朗读这一串里有 async 等待（中文自动遮回），整体包一层 ----
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {

// 1. 步骤拆分
console.log('--- 1. 步骤拆分 ---');
const steps = App._buildSteps(DAY);
const kinds = steps.map(s => s.kind);
ok(kinds[0] === 'writing', '第 1 步是写作填空：' + kinds[0]);
ok(kinds[1] === 'writingread', '第 2 步是朗读全文：' + kinds[1]);
ok(kinds.filter(k => k === 'writingread').length === 1, '朗读全文只有一屏（所有句子都在这一屏）');

// 2. 参考单词条（配对 + 眼睛遮中文）/ 填空横线的锁
console.log('\n--- 2. 参考单词条（配对 + 眼睛遮中文）/ 填空横线的锁 ---');
App.KW_HIDE_MS = 40;                     // 「配好先亮一下」的时长，测试里调小
const wHtml = App.renderWritingTemplate(m, MI, DAY);
ok(wHtml.includes('writing-kwbar'), '关键词条带 sticky 容器 writing-kwbar');
ok((wHtml.match(/class="keyword-chip/g) || []).length === (m.keywords || []).length,
   (m.keywords || []).length + ' 个关键词 chip 都在');
ok(!wHtml.includes('data-kw-blank') && !wHtml.includes('_hlKeyword'),
   '参考单词不跟填空联动（不替孩子指出该填哪个词）');
ok(!wHtml.includes('aria-expanded'), '旧的可展开语义已换成 aria-pressed');
ok((wHtml.match(/onclick="App\._kwPeek\(/g) || []).length === (m.keywords || []).length,
   (m.keywords || []).length + ' 个英文词都能点（听发音 → 找中文）');
ok((wHtml.match(/class="kw-eye"/g) || []).length === (m.keywords || []).length,
   '每个词旁边都有一个「眼睛」（遮 / 露中文）');
ok(wHtml.includes('class="kw-cn"'), '中文意思默认收着（kw-cn）');
ok(!/keyword-chip kw-tap reveal/.test(wHtml), '刚进来没有露着的中文');
ok(wHtml.includes('id="wk-pool-' + MI + '"') && wHtml.includes('display:none'),
   '中文候选池默认不出现（点了英文词才摊开）');
ok(wHtml.includes('placeholder="' + m.blanks[0].hint_cn + '"'),
   '横线上继续用灰色中文提示：' + m.blanks[0].hint_cn);
ok(wHtml.includes('readonly'), '配对没做完 → 横线只读，填不了');
ok(wHtml.includes('id="wf-lock-' + MI + '"'), '有「先配对才能填」的提示条');
ok(App._kwList(m).every(x => x.en && x.cn), '每个关键词的英文 + 中文都齐');

// 图标 / 样式（「藏着」这件事主要靠 CSS，静态查一遍）
const idxSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
ok(/symbol id="i-eye-off"/.test(idxSrc), '有「闭眼睫毛」图标 i-eye-off');
ok(/symbol id="i-eye"/.test(idxSrc), '有「睁眼」图标 i-eye');
ok(/\.keyword-chip\.paired\.reveal \.kw-cn\{display:inline/.test(idxSrc),
   'CSS：点开眼睛才显示中文');
ok(/\.keyword-chip\.paired \.kw-eye\{display:inline-flex/.test(idxSrc),
   'CSS：配对上了才出现眼睛');
ok(/\.writing-blank-input\.locked\{/.test(idxSrc), 'CSS：锁着的横线有单独样式');

// 点英文词 → 念一遍 + 摊开打乱的中文候选
const kwSpoken = [];
App.speak = function (t) { kwSpoken.push(String(t)); };
m.blanks.forEach(b => { blankInputs[b.id] = el('input'); });
App._kwPeek(MI, 0);
ok(kwSpoken[kwSpoken.length - 1] === m.keywords[0], '点英文词 → 先念出这个词：' + m.keywords[0]);
ok(getEl('kw-' + MI + '-0')._cls.has('picking'), '点英文词 → 该词高亮成「正在配对」');
ok(getEl('kwhit-' + MI + '-0')._attrs['aria-pressed'] === 'true', 'aria-pressed 跟着变 true');
const poolHtml = getEl('wk-pool-items-' + MI).innerHTML;
ok((poolHtml.match(/class="wk-cn-chip"/g) || []).length === m.keywords.length,
   '候选池摊开 ' + m.keywords.length + ' 个中文意思');
ok(m.keywords_cn.every(cn => poolHtml.includes(cn)), '5 个中文意思都在候选里（打乱顺序）');
ok(!getEl('kw-' + MI + '-0')._cls.has('paired'), '还没挑中文 → 不算配对成功');

// 挑错 → 只提醒再想想，绝不把答案指出来
App._kwPair(MI, 1);
ok(!App._kwState(MI)[0], '挑错 → 不配对');
ok(getEl('wk-pool-hint-' + MI).textContent.includes('再想想'), '挑错 → 提示再想想');
ok(getEl('kw-' + MI + '-0')._cls.has('picking'), '挑错 → 仍停在配对中，可以接着试');
ok(!getEl('kw-' + MI + '-0')._cls.has('paired'), '挑错 → 中文不露出来');

// 挑对 → 配对成功：中文先亮一下，随后被眼睛自动遮回去
App._kwPair(MI, 0);
ok(App._kwState(MI)[0] === true, '挑对 → 记下配对成功');
ok(getEl('kw-' + MI + '-0')._cls.has('paired'), '挑对 → 词条变绿配对态');
ok(getEl('kw-' + MI + '-0')._cls.has('reveal'), '刚配好 → 中文先亮出来给他看一眼');
ok(kwSpoken[kwSpoken.length - 1] === m.keywords[0], '配好 → 再念一遍（音-形-义绑一次）');
ok(getEl('wk-pool-' + MI).style.display === 'none', '配对成功 → 候选池收回去');
await sleep(App.KW_HIDE_MS + 80);
ok(!getEl('kw-' + MI + '-0')._cls.has('reveal'), '亮完 → 中文自动遮回眼睛后面');
ok(getEl('kweye-' + MI + '-0').innerHTML.includes('i-eye-off'), '眼睛闭着（睫毛挡着中文）');

// 点眼睛才看得见中文，再点又遮上
App._kwReveal(MI, 0);
ok(getEl('kw-' + MI + '-0')._cls.has('reveal'), '点眼睛 → 中文露出来');
ok(getEl('kweye-' + MI + '-0').innerHTML.includes('i-eye'), '眼睛睁开');
App._kwReveal(MI, 0);
ok(!getEl('kw-' + MI + '-0')._cls.has('reveal'), '再点眼睛 → 中文又遮上');

// 还没全配对 → 横线仍然锁着，点它只抖提示
App._writingSyncFillLock(MI, m);
ok(blankInputs[m.blanks[0].id]._attrs['readonly'] === 'readonly', '还没全配对 → 横线 readonly');
ok(getEl('wf-lock-' + MI).innerHTML.includes('才能填横线上的词'), '提示条：先配对再填');
App._writingLockedClick(MI);
ok(getEl('wf-lock-' + MI)._cls.has('shake'), '点锁着的横线 → 提示条抖一下');

// 把剩下 4 个也配上 → 横线解锁
for (let ki = 1; ki < m.keywords.length; ki++) { App._kwPeek(MI, ki); App._kwPair(MI, ki); }
await sleep(App.KW_HIDE_MS + 80);
ok(App._kwAllPaired(MI, m), '5 个词全部配对成功');
ok(getEl('wf-lock-' + MI).innerHTML.includes('可以填横线上的词'), '提示条变成「可以填了」');
ok(getEl('wf-lock-' + MI)._cls.has('ok'), '提示条转成绿色');
ok(blankInputs[m.blanks[0].id]._attrs['readonly'] === undefined, '横线解锁（不再 readonly）');
const wHtmlOpen = App.renderWritingTemplate(m, MI, DAY);
ok(!wHtmlOpen.includes('readonly'), '重进这一屏 → 横线还是能填的（配对进度记住了）');
ok(/keyword-chip kw-tap paired/.test(wHtmlOpen), '重进这一屏 → 配好的词还是配对态');

ok((wHtml.match(/data-blank="/g) || []).length === m.blanks.length, m.blanks.length + ' 个填空输入框');
ok(wHtml.includes('value=""'), '首次进入输入框为空');
ok(wHtml.includes('autocapitalize="off"'), '关掉手机自动首字母大写（词都是小写）');

// 3. 填错 → 门禁关着
console.log('\n--- 3. 填空：先填错 ---');
m.blanks.forEach((b, bi) => {
  blankInputs[b.id] = el('input');
  blankInputs[b.id].value = (bi === 0 ? 'xxxx' : b.answer);
});
App.submitWriting(MI, DAY);
ok(!App._writingAllBlanksRight(m, MI, DAY), '填错一个空 → 不算全对');
ok(getEl('writing-result-' + MI).innerHTML.includes('还有 1 个空没填对'), '提示还有几个空没填对');
ok(getEl('writing-result-' + MI).innerHTML.includes('🀄') === false, '还没出现中文翻译');
ok(App._writingReviewHtml(m, MI, DAY) === '', '回到这一屏不会误判成已全对');

// 4. 改对 → 放行「开始朗读」
console.log('\n--- 4. 填空：改对 ---');
m.blanks.forEach(b => { blankInputs[b.id].value = b.answer; });
App.submitWriting(MI, DAY);
ok(App._writingAllBlanksRight(m, MI, DAY), '全部空都对');
ok(getEl('writing-result-' + MI).innerHTML.includes('点底部「开始朗读」'), '提示点底部开始朗读');
ok(getEl('stage-next-btn').disabled === false, '「开始朗读」解锁');
ok(getEl('stage-next-btn')._cls.has('nudge'), '按钮带 nudge 动效提示');
ok(App._writingReviewHtml(m, MI, DAY).includes('全部填对'), '重新进这一屏能还原「全部填对」提示');
ok(App.renderWritingTemplate(m, MI, DAY).includes('value="' + m.blanks[0].answer + '"'),
   '上一题回来时答案回填，不用重打');

// 5. 朗读屏：初始锁着
console.log('\n--- 5. 朗读全文：初始状态 ---');
const wrStepIdx = steps.findIndex(s => s.kind === 'writingread');
App.state.stepIdx = wrStepIdx;
const rHtml = App.renderWritingRead(m, MI, DAY);
const sents = App._writingSentences(m);
ok((rHtml.match(/class="wr-item/g) || []).length === sents.length, sents.length + ' 句都渲染成一张卡');
ok((rHtml.match(/id="wr-btn-/g) || []).length === sents.length, '每句都有一个「按住跟读」按钮');
ok((rHtml.match(/App\.speak\('/g) || []).length === sents.length, '每句都能点开听一遍');
ok(rHtml.includes(sents[0]), '第一句是「' + sents[0] + '」');
ok(rHtml.includes('读对全部 ' + sents.length + ' 句才能进入下一题'), '写明要读对全部句子');
ok(rHtml.includes('wr-cn') && !rHtml.includes('全文中文翻译'), '还没读完 → 不出中文翻译');
ok(!App._writingAllRead(m, MI), '还没读完');
ok(App._writingReadGateOpen() === false, 'nextStep 硬门禁：不放行');

// 6. 逐句朗读：60 分门槛
console.log('\n--- 6. 逐句朗读（' + App.PASS_SCORE + ' 分门槛）---');
let cb = null;
App._holdStart = (ev, key, label, status, onDone) => { cb = onDone; };
const read = (si, spoken) => {
  App._readWritingSentence({ preventDefault() {} }, MI, si);
  cb({ blob: {}, samples: null }, spoken);
};
read(0, sents[0]);
App._refreshWritingRead(MI, m);
ok(App._writingReadState(MI).passed[0] === true, '第 1 句读对 → 记下来');
ok(getEl('wr-item-' + MI + '-0')._cls.has('done'), '第 1 句的卡变绿');

read(1, sents[1].split(' ').slice(0, 3).join(' '));       // 漏词 → 低分
ok(App._writingReadState(MI).passed[1] !== true, '第 2 句没读全 → 不记通过');
ok(getEl('wr-result-' + MI + '-1').innerHTML.includes('请重试'), '提示重读这一句');
ok(App._writingReadGateOpen() === false, '还有句子没过 → 仍然不放行');

read(1, sents[1]);                                        // 重读通过
for (let si = 2; si < sents.length; si++) read(si, sents[si]);
ok(App._writingAllRead(m, MI), '全部句子读对');
ok(App._writingReadGateOpen() === true, 'nextStep 硬门禁：放行');
ok(getEl('wr-progress-' + MI).innerHTML.includes('全部读完'), '进度条显示全部读完');

// 7. 全文中文翻译
console.log('\n--- 7. 全文中文翻译 ---');
const cnHtml = getEl('wr-cn-' + MI).innerHTML;
ok(cnHtml.includes('全文中文翻译'), '出现「全文中文翻译」标题');
ok(cnHtml.includes(m.full_text_cn.slice(0, 6)), '中文翻译内容用的是 full_text_cn');
ok(getEl('stage-next-btn').disabled === false, '读完 → 解锁下一题');
ok(apiCalls.speaking.filter(x => x.type === 'writing-sentence').length >= sents.length,
   '每句跟读都上报了分数记录');

// 8. 断点续做
console.log('\n--- 8. 断点续做 ---');
const ans = {};
m.blanks.forEach((b, bi) => { ans[Api.answerKey('stu1', DAY, MI, bi)] = { value: b.answer, correct: true }; });
App.state.answers = ans;
ok(App._resumeStepIdx(DAY) > wrStepIdx, '作文和朗读都做完了 → 不再停在这两屏');
App._writingReadState(MI).passed = {};                    // 模拟朗读没做
App._saveWritingRead();
ok(App._resumeStepIdx(DAY) === wrStepIdx, '作文填完但朗读没做 → 直接回到朗读这一屏（不用重填作文）');

// 9. 兜底：绕过界面直接提交也不行
console.log('\n--- 9. 配对门禁兜底 ---');
delete App._kwState(MI)[0];                               // 假装还有一个词没配对
App.submitWriting(MI, DAY);
ok(getEl('writing-result-' + MI).innerHTML.includes('配对好'), '配对没做完直接提交 → 拦住并提示');
ok(!getEl('writing-result-' + MI).innerHTML.includes('批改结果'), '配对没做完 → 不出批改结果');

console.log('\n' + (fail ? '❌ 有 ' + fail + ' 项不通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);

})();
