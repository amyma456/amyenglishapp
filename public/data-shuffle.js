/* eslint-disable */
// ===== 选项位置乱序（v163，家长 2026-10-29）================================
// 家长原话："可能是第2个、第3个，一直都是那几个孩子们不看意思也知道是那个
// 位置，这样不行，必须变成随机的点选，没有任何规律可循。"
//
// 实测题库：468 道选择题里 444 道 answer=0（生成器把正确项放第一位），
// 词汇阶段也有明显偏斜。本文件在**数据加载时**对每道带 options 的题做一次
// 确定性乱序（以题目 id 为随机种子）：options 数组与 answer 下标一起换位，
// 所有下游代码（判分 / 答错提示 / 错题重练 / 老师预览）读到的就是一份
// 自洽的乱序数据，一行渲染逻辑都不用改。
//
// 确定性（同一题每次打开位置相同）是有意的：孩子"记住这道题选哪个"是正常
// 学习记忆；要消灭的是"答案总落在同一个位置"这种可钻的规律。
(function () {
  // FNV-1a 种子 + xorshift 混合 —— 同一 id 每次产生同一排列。
  function seedFrom(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h = Math.imul(h ^ (h >>> 15), 2246822519);
      h = Math.imul(h ^ (h >>> 13), 3266489917);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
  }
  function permute(options, answer, rand) {
    const idx = options.map(function (_, i) { return i; });
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    return { options: idx.map(function (i) { return options[i]; }), answer: idx.indexOf(answer) };
  }
  const weeks = (typeof HOMEWORK_WEEKS !== 'undefined') ? HOMEWORK_WEEKS
    : (typeof HOMEWORK_DATA !== 'undefined' ? [HOMEWORK_DATA] : []);
  let n = 0;
  weeks.forEach(function (wk, wi) {
    (wk || []).forEach(function (day, di) {
      (day.modules || []).forEach(function (m, mi) {
        (m.questions || []).forEach(function (q, qi) {
          if (!q || !q.options || q.options.length < 2 || typeof q.answer !== 'number') return;
          const p = permute(q.options, q.answer, seedFrom(String(q.id || ('q' + wi + di + mi + qi))));
          q.options = p.options; q.answer = p.answer; n++;
        });
        (m.words || []).forEach(function (w) {
          (w.stages || []).forEach(function (s, si) {
            if (!s || !s.options || s.options.length < 2 || typeof s.answer !== 'number') return;
            const p = permute(s.options, s.answer, seedFrom(String(w.word || 'w') + ':' + si + ':' + wi));
            s.options = p.options; s.answer = p.answer; n++;
          });
        });
      });
    });
  });
  if (typeof console !== 'undefined') console.log('option shuffle: ' + n + ' choice instances randomized');
})();
