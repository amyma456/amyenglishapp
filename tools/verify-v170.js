#!/usr/bin/env node
// ===========================================================================
// verify-v170 —— 参考译文"说出来就常驻"（家长 2026-10-30）
//
// 家长原话：「题目中所有的中文翻译，无论对错，孩子们翻译完一遍之后都出来
// 正确的译文。然后孩子点出说译文的时候，如果是说错了，那个正确的译文出现
// 在孩子要说的那个界面上，而不是藏起来的。这样，就孩子读的时候能够看着
// 正确的译文去说话。」
//
// 落地成三条硬规矩（三个翻译场景全覆盖）：
//   ① 阅读逐句翻译（renderTranslateStep / _translateSentence）
//   ② 完形逐句翻译（renderClozeTransStep / _translateClozeSentence）
//   ③ 整篇翻译（renderPassageStep / toggleTranslate）
//   · 结果区：无论对错（哪怕识别没回话但出了声）都亮参考译文
//   · 试过一遍之后：参考译文常驻在说话按钮上方（tr-inline），重说时看得见
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

// --------------------------------------------------------------------------
section('1. 结果区：无论对错都亮参考译文');
{
  // 阅读逐句：参考答案不再包在 if (heard) 里
  const trSeg = appSrc.slice(appSrc.indexOf('_translateSentence(ev, mi, si)'),
                             appSrc.indexOf('_translateSentence(ev, mi, si)') + 2600);
  ok(trSeg.indexOf('this._trTried') >= 0, '阅读逐句：说完一遍就记 _trTried 标记');
  ok(/参考答案<\/div>'/.test(trSeg), '阅读逐句：结果区有「参考答案」块');
  const trRefIdx = trSeg.indexOf("'<div class=\"tr-block\"><div class=\"tr-label\">参考答案</div>'");
  const trHeardEnd = trSeg.indexOf('if (out.samples)');
  ok(trRefIdx >= 0 && trRefIdx < trHeardEnd && trRefIdx > trSeg.lastIndexOf('if (heard)', trRefIdx),
     '阅读逐句：参考答案不受 if (heard) 限制（无论对错都亮）');

  // 完形逐句：去掉 band !== 'pass' 的限制
  const czSeg = appSrc.slice(appSrc.indexOf('_translateClozeSentence(ev, mi, si)'),
                             appSrc.indexOf('_translateClozeSentence(ev, mi, si)') + 3400);
  ok(czSeg.indexOf('this._trTried') >= 0, '完形逐句：说完一遍就记 _trTried 标记');
  ok(!/band !== 'pass' && refCn/.test(czSeg), '完形逐句：「过了就不亮」的旧条件已删除');
  ok(/if \(refCn\) \{[\s\S]{0,200}参考译文|band === 'pass' \? '参考译文'/.test(czSeg),
     '完形逐句：过了也亮参考（label 用「参考译文」）');

  // 整篇翻译：参考翻译不再包在 if (heard) 里
  const psSeg = appSrc.slice(appSrc.indexOf('async toggleTranslate(mi)'),
                             appSrc.indexOf('async toggleTranslate(mi)') + 5200);
  ok(psSeg.indexOf('this._trTried') >= 0, '整篇翻译：说完一遍就记 _trTried 标记');
  ok(psSeg.indexOf('tr-label">参考翻译') >= 0, '整篇翻译：结果区有「参考翻译」块');
}

// --------------------------------------------------------------------------
section('2. 常驻参考译文：试过一遍后出现在说话的那一屏上');
{
  ok(/tr-inline[\s\S]{0,120}参考译文（可以照着说）/.test(appSrc),
     '阅读逐句：_trTried 后参考译文常驻渲染（tr-inline）');
  ok(/cqtr-[\s\S]{0,400}tr-inline/.test(appSrc) &&
     appSrc.indexOf("refCnShown") >= 0,
     '完形逐句：_trTried 后参考译文常驻渲染（tr-inline）');
  ok(/pass-[\s\S]{0,80}tr-inline[\s\S]{0,120}参考翻译（可以照着说）/.test(appSrc),
     '整篇翻译：_trTried 后参考翻译常驻渲染（tr-inline）');
  // 常驻块必须在说话按钮之前（孩子在按钮上方就能看到）
  const rdStep = appSrc.slice(appSrc.indexOf('renderTranslateStep(m, mi, si, dayIdx)'),
                              appSrc.indexOf('renderTranslateStep(m, mi, si, dayIdx)') + 2400);
  ok(rdStep.indexOf('tr-inline') < rdStep.indexOf('_translateSentence(event'),
     '阅读逐句：常驻块在「点一下说中文」按钮上方');
  const czStep = appSrc.slice(appSrc.indexOf('renderClozeTransStep(m, mi, si, dayIdx)'),
                              appSrc.indexOf('renderClozeTransStep(m, mi, si, dayIdx)') + 2600);
  ok(czStep.indexOf('tr-inline') < czStep.indexOf('_translateClozeSentence(event'),
     '完形逐句：常驻块在「点一下说中文」按钮上方');
  const psStep = appSrc.slice(appSrc.indexOf('renderPassageStep(m, mi, dayIdx)'),
                              appSrc.indexOf('renderPassageStep(m, mi, dayIdx)') + 1400);
  ok(psStep.indexOf('tr-inline') < psStep.indexOf('toggleTranslate('),
     '整篇翻译：常驻块在「开始翻译录音」按钮上方');
  ok(/_trTried\['tr-' \+ this\.state\.currentDay/.test(appSrc) &&
     /_trTried\['cqtr-' \+ this\.state\.currentDay/.test(appSrc) &&
     /_trTried\['pass-' \+ this\.state\.currentDay/.test(appSrc),
     '三种标记都按 天+模块+句 隔离（不会串到别的句子）');
}

// --------------------------------------------------------------------------
section('3. 样式与门禁不回退');
{
  ok(htmlSrc.indexOf('.tr-block.tr-inline') >= 0, 'tr-inline 有常驻块样式（显眼的浅底框）');
  // 门禁照旧：说话按钮仍挂着 data-gate（先听后说不能绕）
  ok(/gate-locked[\s\S]{0,300}点一下说中文/.test(appSrc), '逐句翻译「点一下说中文」仍挂门禁');
  // 点词不回退：句子仍是 sent-words
  ok(/renderTranslateStep[\s\S]{0,900}sent-words/.test(appSrc), '翻译屏的词仍可点');
}

// --------------------------------------------------------------------------
section('4. 真渲染：试过之后这一屏真的有参考译文（jsdom 实测）');
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
        if (k === 'start' || k === 'stop') return () => Promise.resolve({ blob: {}, samples: null });
        return noop;
      },
    });
    const dataSrc = fs.readFileSync(path.join(R, 'data.js'), 'utf8');
    const appRaw = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
    const appSrc2 = appRaw.replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');
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
    let App;
    try {
      const out = new Function('g', `
        const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
                Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
                cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
                IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
                indexedDB, performance, Blob, FormData } = g;
        ${dataSrc}
        ${appSrc2}
        return { App: App, WEEKS: HOMEWORK_WEEKS, DATA: HOMEWORK_DATA };
      `)(sandbox);
      App = out.App;
      sandbox.__weeks = out.WEEKS;
      sandbox.__data = out.DATA;
    } catch (e) {
      console.log('  app.js 装载失败：' + e.stack.split('\n').slice(0, 3).join(' | '));
      process.exit(1);
    }
    App.speak = noop; App.showToast = noop;
    App._playCorrectSound = noop; App._playWrongSound = noop;

    // 找一屏阅读逐句翻译
    let day = -1, mi = -1;
    for (let d = 0; d < sandbox.__weeks[0].length && day < 0; d++) {
      (sandbox.__weeks[0][d].modules || []).forEach(function (m, i) {
        if (m.type === 'reading' && App._pairSentences(m) && App._pairSentences(m).length > 1 && day < 0) { day = d; mi = i; }
      });
    }
    if (day < 0) { ok(false, '找不到可测的阅读模块'); }
    else {
      App.state.currentDay = day;
      App.isTeacher = function () { return false; };
      const m = sandbox.__data[day].modules[mi];
      const before = App.renderTranslateStep(m, mi, 0, day);
      ok(before.indexOf('tr-inline') < 0, '没试过之前：不剧透参考译文');
      App._trTried = App._trTried || {};
      App._trTried['tr-' + day + '-' + mi + '-0'] = true;
      const after = App.renderTranslateStep(m, mi, 0, day);
      ok(after.indexOf('tr-inline') >= 0, '试过一遍之后：同一屏渲染出常驻参考译文');
      ok(after.indexOf('可以照着说') >= 0, '常驻块写着「可以照着说」');
      const seg = after.slice(after.indexOf('tr-inline'));
      const m2 = /<div class="tr-text ref">([\s\S]*?)<\/div>/.exec(seg);
      const pairs = App._pairSentences(m);
      ok(m2 && m2[1] === pairs[0].cn, '常驻参考译文就是这句的标准中文', m2 && m2[1].slice(0, 20));
      // 完形逐句同样实测
      let czDay = -1, czMi = -1;
      for (let d = 0; d < sandbox.__weeks[0].length && czDay < 0; d++) {
        (sandbox.__weeks[0][d].modules || []).forEach(function (mm, i) {
          if (mm.type === 'cloze' && mm.passage && czDay < 0) { czDay = d; czMi = i; }
        });
      }
      if (czDay >= 0) {
        const czm = sandbox.__data[czDay].modules[czMi];
        App.state.currentDay = czDay;
        App._trTried['cqtr-' + czDay + '-' + czMi + '-0'] = true;
        const czHtml = App.renderClozeTransStep(czm, czMi, 0, czDay);
        const hasRef = App._clozeSentenceRefCn(czm, 0, (App._splitSentences(czm.passage) || [])[0]);
        if (hasRef) {
          ok(czHtml.indexOf('tr-inline') >= 0 && czHtml.indexOf('可以照着说') >= 0,
             '完形逐句：试过之后参考译文常驻这一屏');
        } else {
          ok(czHtml.indexOf('tr-inline') < 0, '完形逐句：这句没有参考译文时不渲染空块（不锁死孩子的旧底线保持）');
        }
      }
    }
  }
}

// --------------------------------------------------------------------------
console.log('\n==============================');
console.log('verify-v170: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
