#!/usr/bin/env node
// ===========================================================================
// verify-v171 —— 翻译要"独立思考"：录音时藏答案，<60 分才背一背
//
// 家长原话（2026-10-30 上午 11 点）：
//   「翻译是个大文章，要求孩子们要学会独立思考。说一遍没说对，或者是随便点
//    一下就被看译文其实没有起到作用……在录的过程中，把译文隐藏起来。然后
//    如果没说对，低于 60 分，让孩子们背一背，起到这样的效果。他觉得他背好
//    了之后呢，再点一下按键，可以开始录。说完中文之后，再点一下结束。」
//
// 于是三个翻译场景（阅读逐句 / 完形逐句 / 整篇）统一成这台状态机：
//   ① 第一次进来：只有英文，没有译文（不能白嫖答案）
//   ② 点一下开录：译文块 + 上次结果区一起 display:none（录的时候看不见）
//   ③ 说完再点一下结束：出分
//        ≥60 → 结果区给标准译文对照，按钮回到「点一下说中文」
//        <60 → 结果区给译文 + "先背一背"，按钮变「🎤 我背好了，再说一遍」，
//              屏上常驻背块；下一次开录又被藏起来
//   ④ 麦克风打不开 / 没录上：_trRestore 把藏起来的块放回来
// ===========================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, msg, detail) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg + (detail ? ' —— ' + detail : '')); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');

const rdSeg = appSrc.slice(appSrc.indexOf('_translateSentence(ev, mi, si)'),
                           appSrc.indexOf('_translateSentence(ev, mi, si)') + 3200);
const czSeg = appSrc.slice(appSrc.indexOf('_translateClozeSentence(ev, mi, si)'),
                           appSrc.indexOf('_translateClozeSentence(ev, mi, si)') + 4200);
const psSeg = appSrc.slice(appSrc.indexOf('async toggleTranslate(mi)'),
                           appSrc.indexOf('async toggleTranslate(mi)') + 6200);

// ---------------------------------------------------------------------------
section('1. 开录就藏：录的过程中看不见答案');
{
  ok(appSrc.indexOf('_trBlind(prefix, mi, si)') >= 0, '有 _trBlind 工具（遮答案）');
  ok(/_trBlind\('trs', mi, si\)/.test(appSrc), '阅读逐句：开录前遮住译文/结果区');
  ok(/_trBlind\('cqtrs', mi, si\)/.test(appSrc), '完形逐句：开录前遮住译文/结果区');
  ok(/tr-memo-' \+ mi\)/.test(appSrc) && /tr-result-' \+ mi\)/.test(appSrc),
     '整篇翻译：开录前遮住参考翻译/结果区');
  // 遮的时机必须在 _holdStart / Recorder.start 之前
  const rdBlind = rdSeg.indexOf("_trBlind('trs'");
  const rdStart = rdSeg.indexOf('_holdStart(ev');
  ok(rdBlind >= 0 && rdStart > rdBlind, '阅读逐句：先遮再开录');
  const czBlind = czSeg.indexOf("_trBlind('cqtrs'");
  const czStart = czSeg.indexOf('_holdStart(ev');
  ok(czBlind >= 0 && czStart > czBlind, '完形逐句：先遮再开录');
  const psBlind = psSeg.indexOf("tr-memo-' + mi)");
  const psStart = psSeg.indexOf('Recorder.start()');
  ok(psBlind >= 0 && psStart > psBlind, '整篇翻译：先遮再开录');
  // 门没开（没听英文）不许先把答案藏了
  ok(/classList\.contains\('gate-locked'\)\) return/.test(appSrc),
     '门禁没开时直接返回（不白藏答案）');
}

// ---------------------------------------------------------------------------
section('2. <60 分才给背：背块、按钮文案、提示语');
{
  ok(/const below = !!heard && r\.score < self\.PASS_SCORE/.test(rdSeg),
     '阅读逐句：以 60 分为线判"要不要背"');
  ok(/if \(below\) self\._trMemo\[mk\] = true; else delete self\._trMemo\[mk\]/.test(rdSeg),
     '阅读逐句：<60 记"要背"，达标清标记');
  ok(/const below = !!heard && canScore && r\.score < self\.PASS_SCORE/.test(czSeg),
     '完形逐句：同样以 60 分为线');
  ok(/const below = !!heard && r\.score < this\.PASS_SCORE/.test(psSeg),
     '整篇翻译：同样以 60 分为线');
  ok((appSrc.match(/'🎤 我背好了，再说一遍'/g) || []).length >= 2,
     '按钮在没达标时变成「我背好了，再说一遍」');
  ok((appSrc.match(/录音的时候答案会藏起来/g) || []).length >= 3,
     '三个场景的结果区都告诉孩子"录音时答案会藏起来"');
  ok((appSrc.match(/📖 参考译文（背一背，背好再点按钮）|📖 参考翻译（背一背，背好再点按钮）/g) || []).length >= 3,
     '三个场景的背块都标着「背一背」');
  ok(htmlSrc.indexOf('.tr-memo-tip') >= 0, '有"背一背"引导条样式');
}

// ---------------------------------------------------------------------------
section('3. 不达标才出现、达标就不剧透（渲染层）');
{
  ok(/const needMemo = !!this\._trMemo\[memoKey\]/.test(appSrc), '阅读逐句：渲染按 _trMemo 判断');
  ok(/const needMemo = !!refCnShown[\s\S]{0,120}_trMemo\['cqtr-/.test(appSrc),
     '完形逐句：渲染按 _trMemo 判断');
  ok(/const needMemo = !!m\.passage_cn && !!this\._trMemo\['pass-/.test(appSrc),
     '整篇翻译：渲染按 _trMemo 判断');
  ok(appSrc.indexOf('_trTried') < 0, 'v170 的"试过就常驻"已彻底移除');
  ok(/if \(needMemo\) \{[\s\S]{0,260}tr-inline/.test(appSrc), '背块只在 needMemo 时渲染');
}

// ---------------------------------------------------------------------------
section('4. 兜底：没录上要把藏起来的块放回来');
{
  ok(/如果没录上|_trRestore\(\)/.test(appSrc), '有 _trRestore 兜底');
  ok((appSrc.match(/_trRestore\(\)/g) || []).length >= 4,
     '阅读/完形/整篇/麦克风失败四处都还原');
}

// ---------------------------------------------------------------------------
section('5. 真渲染 + 真点按钮（jsdom）');
{
  function loadJsdom() {
    const cands = [
      'jsdom',
      'C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom',
      path.join(ROOT, 'node_modules', 'jsdom'),
    ];
    for (const c of cands) { try { return require(c); } catch (e) {} }
    return null;
  }
  const jsdomMod = loadJsdom();
  if (!jsdomMod) {
    console.log('  （没有 jsdom，跳过真渲染检查）');
  } else {
    const R = path.join(ROOT, 'public');
    const dom = new jsdomMod.JSDOM('<!doctype html><body><div id="content-area"></div></body>', {
      url: 'https://amyeng.top/', pretendToBeVisual: true,
    });
    const window = dom.window, document = window.document;
    Object.defineProperty(window.navigator, 'userAgent', { value: 'node', configurable: true });
    const noop = () => {};
    const Api = new Proxy({}, {
      get(t, k) {
        if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
        if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
        if (k === 'cloudAvailable') return () => false;
        if (k === 'isFillerTranscript') return () => false;
        if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push)/.test(k)) {
          return () => Promise.resolve({});
        }
        return noop;
      },
    });
    const Recorder = new Proxy({}, {
      get(t, k) {
        if (k === 'supported') return () => true;
        if (k === 'join' || k === 'padForAsr') return () => null;
        if (k === 'start' || k === 'stop' || k === 'prime') return () => Promise.resolve({ blob: {}, samples: null });
        return noop;
      },
    });
    const dataSrc = fs.readFileSync(path.join(R, 'data.js'), 'utf8');
    const appRaw = fs.readFileSync(path.join(R, 'app.js'), 'utf8')
      .replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');
    const sandbox = {
      document, window, location: window.location, navigator: window.navigator,
      localStorage: window.localStorage, sessionStorage: window.sessionStorage,
      Api, Recorder, URL: window.URL, fetch: () => new Promise(() => {}),
      Cloud: undefined, SpeechRecognition: undefined, Audio: window.Audio,
      alert: noop, confirm: () => true, prompt: () => '',
      requestAnimationFrame: (cb) => setTimeout(cb, 0), cancelAnimationFrame: clearTimeout,
      SpeechSynthesisUtterance: function () {},
      speechSynthesis: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop },
      MutationObserver: window.MutationObserver, IntersectionObserver: window.IntersectionObserver,
      setTimeout, clearTimeout, setInterval, clearInterval, console,
      indexedDB: undefined, performance, Blob: window.Blob, FormData: window.FormData,
    };
    let App, DATA;
    try {
      const out = new Function('g', `
        const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
                Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
                cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
                IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
                indexedDB, performance, Blob, FormData } = g;
        ${dataSrc}
        ${appRaw}
        return { App: App, DATA: HOMEWORK_DATA };
      `)(sandbox);
      App = out.App; DATA = out.DATA;
    } catch (e) {
      console.log('  app.js 装载失败：' + e.stack.split('\n').slice(0, 3).join(' | '));
      process.exit(1);
    }
    App.speak = noop; App.showToast = noop;
    App._playCorrectSound = noop; App._playWrongSound = noop;

    // 找一屏阅读逐句翻译
    let day = -1, mi = -1;
    for (let d = 0; d < DATA.length && day < 0; d++) {
      (DATA[d].modules || []).forEach(function (m, i) {
        const ps = App._pairSentences(m);
        if (m.type === 'reading' && ps && ps.length > 1 && day < 0) { day = d; mi = i; }
      });
    }
    if (day < 0) { ok(false, '找不到可测的阅读模块'); }
    else {
      App.state.currentDay = day;
      App.isTeacher = function () { return false; };
      const m = DATA[day].modules[mi];
      const pairs = App._pairSentences(m);

      // ① 第一次进来：不剧透
      document.getElementById('content-area').innerHTML = App.renderTranslateStep(m, mi, 0, day);
      let memo = document.getElementById('trs-memo-' + mi + '-0');
      let btn = document.getElementById('trs-btn-' + mi + '-0');
      ok(!memo, '第一次进来：没有参考译文块（孩子看不到答案）');
      ok(btn && /点一下说中文/.test(btn.textContent), '第一次进来：按钮是「点一下说中文」');

      // ② 模拟"这一遍 40 分" → 记要背
      App._trMemo = App._trMemo || {};
      App._trMemo['tr-' + day + '-' + mi + '-0'] = true;
      document.getElementById('content-area').innerHTML = App.renderTranslateStep(m, mi, 0, day);
      memo = document.getElementById('trs-memo-' + mi + '-0');
      btn = document.getElementById('trs-btn-' + mi + '-0');
      ok(!!memo, '<60 分之后：屏上出现「背一背」块');
      ok(memo && /背一背/.test(memo.textContent), '背块写着「背一背」');
      ok(memo && memo.textContent.indexOf(pairs[0].cn) >= 0, '背块里就是这句的标准中文');
      ok(btn && /我背好了，再说一遍/.test(btn.textContent), '按钮变成「我背好了，再说一遍」');

      // ③ 开录 → 答案消失
      App._trBlind('trs', mi, 0);
      ok(memo.style.display === 'none', '开录那一刻：背块被藏起来（看不见答案）');
      const slot = document.getElementById('trs-result-' + mi + '-0');
      ok(slot.style.display === 'none', '开录那一刻：上次结果区也收起来');

      // ④ 没录上 → 放回来
      App._trRestore();
      ok(memo.style.display === '', '没录上时：背块放回来');
      ok(slot.style.display === '', '没录上时：结果区放回来');

      // ⑤ 达标 → 不再剧透
      delete App._trMemo['tr-' + day + '-' + mi + '-0'];
      document.getElementById('content-area').innerHTML = App.renderTranslateStep(m, mi, 0, day);
      ok(!document.getElementById('trs-memo-' + mi + '-0'),
         '这一遍达标后：屏上不再挂着答案（下次自己翻回来也不剧透）');
    }
  }
}

console.log('\n==============================');
console.log('verify-v171: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
