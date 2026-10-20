/* eslint-disable */
// ============================================================================
// Recorder — microphone capture that always produces 16kHz mono WAV.
//
// Why not MediaRecorder: it hands back whatever the browser prefers —
// webm/opus on Chrome, mp4/aac on Safari — so every consumer downstream has
// to deal with two formats, and neither is what speech services accept.
// Cloudflare Workers AI Whisper and Azure Pronunciation Assessment both want
// 16kHz mono PCM. Producing it at the source means no transcoding anywhere.
//
// Capture runs through Web Audio (AudioWorklet, ScriptProcessor as fallback),
// so the same code path also yields live volume for the level meter.
// ============================================================================

const Recorder = {
  TARGET_RATE: 16000,

  _workletUrl: null,
  _active: null,

  supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
              (window.AudioContext || window.webkitAudioContext));
  },

  // The worklet just forwards raw frames to the main thread. Built from a Blob
  // so the project keeps its "no build step, no extra files to deploy" shape.
  _workletModuleUrl() {
    if (this._workletUrl) return this._workletUrl;
    const src = `
      class PCMTap extends AudioWorkletProcessor {
        process(inputs) {
          const ch = inputs[0] && inputs[0][0];
          if (ch && ch.length) this.port.postMessage(ch.slice(0));
          return true;
        }
      }
      registerProcessor('pcm-tap', PCMTap);
    `;
    this._workletUrl = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
    return this._workletUrl;
  },

  // Build the AudioContext and compile the worklet ahead of time so even the
  // FIRST hold starts capturing immediately. Touches no microphone — the
  // stream is only requested in start().
  async warmUp() {
    if (!this.supported() || (this._ctx && this._workletReady)) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this._ctx || this._ctx.state === 'closed') {
        try { this._ctx = new AC({ sampleRate: this.TARGET_RATE }); }
        catch (e) { this._ctx = new AC(); }
        this._workletReady = false;
      }
      if (this._ctx.audioWorklet && !this._workletReady) {
        await this._ctx.audioWorklet.addModule(this._workletModuleUrl());
        this._workletReady = true;
      }
    } catch (e) { /* falls back to building it on first use */ }
  },

  // Start capturing. Returns a handle; call stop() to get the WAV blob.
  // onLevel(0..1) fires continuously for the UI meter.
  //
  // v147（家长 2026-10-20）：「孩子明明读得很对，读了四五遍了，仍然显示
  // 这次没录到声音」。手机上的真凶是**起得太晚**：getUserMedia → 建
  // AudioContext → 编译 worklet → 接节点，这一串在手机上要 150～500ms，
  // 而 start() 是异步的 —— 孩子按下去就开口，等他读完松手，录音才刚刚接上，
  // 于是整段被判成"没录到声音"。
  //
  // 两个改动：
  //   1. start() 一进来就同步发起 getUserMedia（没有任何前置 await）；
  //   2. prime()：手指按下那一刻就开录，多出来的头几百毫秒只当"提前量"，
  //      正式 start() 直接接管这段流，孩子开口的第一个音一定是录进去的。
  prime() {
    if (this._primeP) return this._primeP;
    const self = this;
    this._primeP = Promise.resolve()
      .then(function () { return self.start({ pre: true }); })
      .then(function () {
        // 只留 6 秒的提前量：孩子按下后迟迟没开口（或者只是摸了一下按钮），
        // 不能一直占着麦克风 —— 超时就收掉，下一次按下再重新预热。
        clearTimeout(self._primeT);
        self._primeT = setTimeout(function () {
          if (self._active && self._active.startedAt && !self._hotTaken) {
            self._primeP = null;
            try { self.stop(); } catch (e) {}
          }
        }, 6000);
      })
      .catch(function () { self._primeP = null; return false; });
    return this._primeP;
  },

  async start(opts) {
    const options = opts || {};
    this._primeP = null;          // 走过一次 start，预热标记就作废

    // 已经有"预热中"的采集在跑 → 直接接管它（那段音频就是孩子的起手音）。
    const hot = this._active;
    if (hot && options.pre !== true) {
      hot.startedAt = Date.now();          // 计时从现在算（预热那段只当提前量）
      if (hot.levelRef) hot.levelRef.fn = options.onLevel || null;
      this._hotTaken = true;
      clearTimeout(this._primeT);
      return hot;
    }

    // 关键：不要在这一行之前 await 任何东西（见上面的 v147 说明）。
    const streamP = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const stream = await streamP;

    // Reuse one AudioContext across takes. Building it and compiling the
    // worklet each time cost ~95ms, and a child who starts speaking the
    // instant they press lost that much off the front of the word.
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = this._ctx;
    if (!ctx || ctx.state === 'closed') {
      try { ctx = new AC({ sampleRate: this.TARGET_RATE }); }
      catch (e) { ctx = new AC(); }
      this._ctx = ctx;
      this._workletReady = false;
    }
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) {} }

    const source = ctx.createMediaStreamSource(stream);
    const chunks = [];
    let peak = 0;
    // v147：预热阶段不挂 onLevel，正式 start() 接管后再挂上 —— 所以走一层
    // 可替换的引用，而不是把回调闭包死在 onFrame 里。
    const levelRef = { fn: options.onLevel || null };

    const onFrame = (frame) => {
      chunks.push(frame);
      let localPeak = 0;
      for (let i = 0; i < frame.length; i++) {
        const v = frame[i] < 0 ? -frame[i] : frame[i];
        if (v > localPeak) localPeak = v;
      }
      if (localPeak > peak) peak = localPeak;
      if (levelRef.fn) levelRef.fn(localPeak);
    };

    let node = null, usingWorklet = false;
    if (ctx.audioWorklet) {
      try {
        if (!this._workletReady) {
          await ctx.audioWorklet.addModule(this._workletModuleUrl());
          this._workletReady = true;
        }
        node = new AudioWorkletNode(ctx, 'pcm-tap');
        node.port.onmessage = e => onFrame(e.data);
        usingWorklet = true;
      } catch (e) { node = null; }
    }
    if (!node) {
      // Deprecated but still the only option on older Safari/WebView.
      node = ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = e => onFrame(new Float32Array(e.inputBuffer.getChannelData(0)));
    }

    source.connect(node);
    // ScriptProcessor only runs while connected to a destination; a zero-gain
    // sink keeps it alive without the child hearing themselves.
    const sink = ctx.createGain();
    sink.gain.value = 0;
    node.connect(sink);
    sink.connect(ctx.destination);

    // v148：记下这一台设备的"录音体质"，出问题时能一句话定位。
    this._diag = {
      ctxRate: ctx.sampleRate,        // 实际采样率（红米会偷偷降到 8000，见 _micHealth）
      trackRate: this._trackRate(stream),
      usingWorklet: usingWorklet,
      ua: (navigator.userAgent || '').slice(0, 160),
      startedAt: Date.now(),
    };

    // v147：不再有单独的"预录缓冲"—— 预热本身就是这个 start()，
    // 接管时 chunks 里已经是孩子开口起的那一段。
    this._active = { stream, ctx, source, node, sink, chunks, usingWorklet,
                     startedAt: Date.now(), peak: () => peak,
                     levelRef: levelRef };
    return this._active;
  },

  // 这条流的真实采样率（有些机型 getSettings 不给，那就返回 0 = 不知道）。
  _trackRate(stream) {
    try {
      const t = stream.getAudioTracks()[0];
      const s = t && t.getSettings ? t.getSettings() : null;
      return (s && s.sampleRate) || 0;
    } catch (e) { return 0; }
  },

  recording() { return !!this._active; },

  // Stop and return { blob, duration, sampleRate, peak } — or null if the
  // capture produced no audio at all.
  async stop() {
    const a = this._active;
    this._active = null;
    // v147：一次录音结束，预热标记一起作废；下次按下重新预热。
    this._primeP = null;
    this._hotTaken = false;
    clearTimeout(this._primeT);
    if (!a) return null;

    try { a.node.disconnect(); } catch (e) {}
    try { a.source.disconnect(); } catch (e) {}
    try { a.sink.disconnect(); } catch (e) {}
    try { a.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    const srcRate = a.ctx.sampleRate;
    // Context stays open on purpose — closing it is what made the next take
    // slow to start. It holds no microphone; the stream tracks above do.


    const total = a.chunks.reduce((n, c) => n + c.length, 0);
    if (!total) return null;

    const flat = new Float32Array(total);
    let off = 0;
    a.chunks.forEach(c => { flat.set(c, off); off += c.length; });

    const pcm = srcRate === this.TARGET_RATE ? flat : this._resample(flat, srcRate, this.TARGET_RATE);
    // v148：把这一段录音的"体质"一并交出去 —— 上层据此判断是"真没读"
    // 还是"这段录坏了"，不再靠猜。
    const health = this._micHealth(flat, srcRate);
    this._diag = null;
    return {
      blob: this._encodeWav(pcm, this.TARGET_RATE),
      // Raw samples come back too so several takes can be stitched into one
      // clip later — concatenating PCM is exact, concatenating encoded WAV
      // files is not (each carries its own 44-byte header).
      samples: pcm,
      duration: pcm.length / this.TARGET_RATE,
      sampleRate: this.TARGET_RATE,
      peak: a.peak(),
      health: health,
      healthLabel: this._healthLabel(health),
    };
  },

  // ---------------------------------------------------------------------------
  // v148：这一段录音到底"录得好不好"。
  //
  // 家长 2026-10-20：「手机用的是红米 note 9 5G，发现就这个手机容易出问题…
  // 有时候录出来的声音是很渣的、很嘈杂的，这是为什么？」
  //
  // 原因是这类千元机（天玑 800U 这一档）的音频通路有三件事经常不同时成立：
  //   1. **降采样**：AudioContext 要 16k，机器直接给 8k —— 4kHz 以上的频带
  //      全部消失，而孩子读的 /s/ /f/ /θ/ /ʃ/ 恰好全靠这一段。听起来"发闷、
  //      沙沙响"，Whisper 也最容易在这几个音上判错。
  //   2. **掉帧**：采集线程被系统省电策略压住，帧不连续 → 音频里一段一段
  //      的空洞，听起来"卡、断续、像机器人"。
  //   3. **限幅**（削波）：麦克风增益开太大或离嘴太近，波形顶到 ±1 被削平 →
  //      "嘈杂、刺啦"。这一条很多家长以为是"离得远所以录音不好"，正相反。
  //
  // 这三个都能从样本本身量出来，不需要听得见。量出来之后：
  //   · 采样率低 → 上层放宽"有没有出声"的门槛（低采样率的能量本来就小）；
  //   · 削波严重 → 提示孩子"稍微离远一点"，而不是让他一遍遍重读；
  //   · 掉帧 → 记进诊断，不当场打扰孩子。
  //
  // 返回的都是 0~1 的数或布尔，直接可读，不藏。
  _micHealth(flat, srcRate) {
    const h = {
      srcRate: srcRate || 0,
      lowRate: !!(srcRate && srcRate < 16000 * 0.9),   // 8k 之类
      clipRatio: 0,                                     // 削波采样占比
      silenceRatio: 1,                                  // 接近静音的占比
      dropouts: 0,                                      // 中间的空洞数
      voicedRatio: 0,                                   // 人声（相对本段峰值）占比
      peak: 0,
      rms: 0,
    };
    if (!flat || !flat.length) return h;
    h.silenceRatio = 1;
    h.voicedRatio = 0;

    // ① 峰值 / 均方根 / 削波率
    let peak = 0, sum2 = 0, clipped = 0;
    for (let i = 0; i < flat.length; i++) {
      const v = flat[i];
      const av = v < 0 ? -v : v;
      if (av > peak) peak = av;
      sum2 += v * v;
      if (av >= 0.985) clipped++;      // 顶到天花板
    }
    h.peak = peak;
    h.rms = Math.sqrt(sum2 / flat.length);
    h.clipRatio = clipped / flat.length;

    // ② 人声占比：以本段峰值为参照。削波的录音峰值恒为 1，参照会失准，
    //    所以参照最高取 0.5（正常朗读的峰值区间），见下。
    const ref = Math.min(peak, 0.5);
    const th = Math.max(ref * 0.12, 0.004);
    let voiced = 0;
    for (let i = 0; i < flat.length; i++) {
      const av = flat[i] < 0 ? -flat[i] : flat[i];
      if (av > th) voiced++;
    }
    h.voicedRatio = voiced / flat.length;
    h.silenceRatio = 1 - h.voicedRatio;

    // ③ 掉帧：按 20ms 一格看能量，连续 4 格以上"全零"才算空洞。
    //
    // 为什么是 4 格而不是 3 格：正常的词间停顿、气口、句尾收音落在
    // 0.0005 以下的概率并不低（尤其是 8k 降采样的机器），3 格（约 60ms）
    // 会把正常的换气误报成掉帧 —— 判定要"宁可漏报，不可误报"，
    // 误报会让家长以为手机坏了。
    const step = Math.max(16, Math.round(srcRate * 0.02));   // 20ms 一格
    const needRun = 4;                                        // 连着 80ms 全零
    let run = 0;
    for (let i = 0; i < flat.length; i += step) {
      const end = Math.min(i + step, flat.length);
      let segPeak = 0;
      for (let j = i; j < end; j++) {
        const av = flat[j] < 0 ? -flat[j] : flat[j];
        if (av > segPeak) segPeak = av;
      }
      if (segPeak < 0.0002) { run++; }
      else { if (run >= needRun) h.dropouts++; run = 0; }
    }
    if (run >= needRun) h.dropouts++;
    return h;
  },

  // 一句话说清这段录音有什么毛病（给诊断页 / 控制台看，不给孩子看）。
  _healthLabel(h) {
    if (!h) return '无数据';
    const bits = [];
    if (h.lowRate) bits.push('采样率只有 ' + Math.round(h.srcRate / 1000) + 'k（高频丢失，"发闷"）');
    if (h.clipRatio > 0.01) bits.push('削波 ' + (h.clipRatio * 100).toFixed(1) + '%（太响/离嘴太近，"嘈杂"）');
    if (h.dropouts > 0) bits.push('掉帧 ' + h.dropouts + ' 处（"断续"）');
    if (h.voicedRatio < 0.02) bits.push('几乎没有人声');
    return bits.length ? bits.join('；') : '正常';
  },

  // Whisper hallucinates on very short audio — a 0.21s "beautiful" came back
  // as "Thank you." (filler from its training data), which then scored 0. The
  // same clip padded out to 0.91s transcribed correctly. So anything sent for
  // recognition gets silence front and back, up to a floor of MIN_ASR_SECONDS.
  //
  // Padding is applied ONLY to the copy sent for recognition. The clip kept
  // for playback stays as recorded, or every joined take would carry dead air.
  MIN_ASR_SECONDS: 1.2,
  ASR_PAD_SECONDS: 0.35,

  // 识别耗时几乎只跟音频长度走，而孩子松手总比说完晚半秒到一秒。先掐掉
  // 首尾的静音再送识别：上传的字节少了，模型要听的部分短了，识别内容一
  // 字不少。阈值取得很低（0.015），只掐真正的静音，气声和尾音都留着。
  TRIM_THRESHOLD: 0.015,
  TRIM_KEEP_SECONDS: 0.12,

  trimSilence(samples) {
    if (!samples || !samples.length) return samples;
    const th = this.TRIM_THRESHOLD;
    let first = -1, last = -1;
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i] < 0 ? -samples[i] : samples[i];
      if (v > th) { if (first < 0) first = i; last = i; }
    }
    if (first < 0) return samples;               // 整段都是静音：原样返回
    const keep = Math.round(this.TRIM_KEEP_SECONDS * this.TARGET_RATE);
    const from = Math.max(0, first - keep);
    const to = Math.min(samples.length, last + keep);
    return samples.subarray(from, to);
  },

  padForAsr(samples) {
    if (!samples || !samples.length) return null;
    const core = this.trimSilence(samples);
    const pad = Math.round(this.ASR_PAD_SECONDS * this.TARGET_RATE);
    const floor = Math.round(this.MIN_ASR_SECONDS * this.TARGET_RATE);
    const needed = Math.max(floor - core.length - pad * 2, 0);
    const tail = pad + needed;
    const out = new Float32Array(pad + core.length + tail);
    out.set(core, pad);                          // rest stays zero = silence
    return this.ULAW_ENABLED
      ? this._encodeUlawWav(out, this.TARGET_RATE)
      : this._encodeWav(out, this.TARGET_RATE);
  },

  // --------------------------------------------------------------------------
  // 送识别的那一份压成 8-bit µ-law（v103）——"评分慢"最大的一块钱在这里。
  //
  // 孩子松手后干等的秒数，最大的一段不是模型算得慢（实测换模型只有 1~2 秒
  // 的差），而是**音频从手机爬到 Cloudflare 边缘**这一段跨境上行。16kHz 单声道
  // 16-bit 的 WAV 是原始波形，压不动：一句 4 秒就是 128KB，上行越差等得越久。
  //
  // µ-law（ITU-T G.711）每个采样 8 bit，体积整整砍半，而且是"听得清"的砍法：
  // 它按人耳的响度感受做对数量化，小信号刻度细、大信号刻度粗，所以同样 8 bit
  // 比线性 PCM 清楚得多，频带一点没丢（还是 16kHz 采样）。ASR 要的频谱原样在。
  //
  // 实测（阿里云 qwen3-asr-flash，同一段音频交叉对照）：
  //   16k/16-bit 71KB → 862ms ；16k/µ-law 35KB → 496ms，转写逐字一致。
  //   "My sister likes reading storybooks before bed." 同样 74KB→37KB，逐字一致。
  // 8kHz 还能再砍一半，但 4kHz 以上全没了，孩子读的 /s/ /f/ /θ/ 这些擦音
  // 正是靠那一段 —— 本项目的头号红线是"读对了却判错"，不冒这个险。
  //
  // 容器仍是标准 WAV（fmt tag 7 = µ-law），所以 mime 还是 audio/wav，
  // worker 侧不用猜格式；worker 会把这一份原样转发给阿里云（体积小，
  // 那一跳也更快），另外解一份 16-bit PCM 给 Cloudflare（Whisper 不认 µ-law）。
  // 本地留档 / 播放 / 拼接仍走 16-bit PCM（stop() / join() 不碰这里）。
  ULAW_ENABLED: true,

  // 单个采样 → µ-law 字节。量化台阶与 _encodeWav 保持一致，两边不会差一个 LSB。
  _ulawByte(x) {
    let v = x < -1 ? -1 : x > 1 ? 1 : x;
    v = Math.round(v < 0 ? v * 0x8000 : v * 0x7FFF);
    let sign = 0;
    if (v < 0) { sign = 0x80; v = -v; }
    if (v > 32635) v = 32635;                    // G.711 的饱和点
    v += 0x84;                                   // BIAS，让 0 附近也有码字
    let e = 7, m = 0x4000;
    while (e > 0 && !(v & m)) { e--; m >>= 1; }  // 找最高有效位 → 指数
    const mant = (v >> (e + 3)) & 0x0f;
    return (~(sign | (e << 4) | mant)) & 0xff;
  },

  // 8-bit µ-law WAV，mono。44 字节标准头，fmt tag = 7。
  // byteRate = rate×1、blockAlign = 1、bits = 8，三者必须一起改 ——
  // 只改 bits 的话读文件的一侧会按 2 字节推步长，整段错位。
  _encodeUlawWav(samples, rate) {
    const n = samples.length;
    const buf = new ArrayBuffer(44 + n);
    const view = new DataView(buf);
    const str = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

    str(0, 'RIFF');
    view.setUint32(4, 36 + n, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    view.setUint32(16, 16, true);          // chunk size
    view.setUint16(20, 7, true);           // format = 7 (µ-law)
    view.setUint16(22, 1, true);           // channels = mono
    view.setUint32(24, rate, true);
    view.setUint32(28, rate, true);        // byte rate = rate × 1 byte
    view.setUint16(32, 1, true);           // block align
    view.setUint16(34, 8, true);           // bits per sample
    str(36, 'data');
    view.setUint32(40, n, true);

    const out = new Uint8Array(buf);
    for (let i = 0; i < n; i++) out[44 + i] = this._ulawByte(samples[i]);
    return new Blob([out], { type: 'audio/wav' });
  },

  // Join takes into a single WAV, with a short gap so the words stay distinct.
  join(sampleChunks, gapSeconds) {
    const gap = Math.max(0, Math.round((gapSeconds === undefined ? 0.25 : gapSeconds) * this.TARGET_RATE));
    const parts = sampleChunks.filter(Boolean);
    if (!parts.length) return null;
    const total = parts.reduce((n, p) => n + p.length, 0) + gap * (parts.length - 1);
    const out = new Float32Array(total);
    let off = 0;
    parts.forEach((p, i) => {
      out.set(p, off);
      off += p.length + (i < parts.length - 1 ? gap : 0);
    });
    return { blob: this._encodeWav(out, this.TARGET_RATE), duration: total / this.TARGET_RATE };
  },

  // Linear interpolation is plenty for speech at these rates and keeps the
  // whole thing dependency-free.
  _resample(input, from, to) {
    if (from === to) return input;
    const ratio = from / to;
    const out = new Float32Array(Math.round(input.length / ratio));
    for (let i = 0; i < out.length; i++) {
      const pos = i * ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, input.length - 1);
      const frac = pos - i0;
      out[i] = input[i0] * (1 - frac) + input[i1] * frac;
    }
    return out;
  },

  // 16-bit PCM WAV, mono. 44-byte canonical header.
  _encodeWav(samples, rate) {
    const bytesPerSample = 2;
    const buf = new ArrayBuffer(44 + samples.length * bytesPerSample);
    const view = new DataView(buf);
    const str = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

    str(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * bytesPerSample, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    view.setUint32(16, 16, true);          // PCM chunk size
    view.setUint16(20, 1, true);           // format = PCM
    view.setUint16(22, 1, true);           // channels = mono
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * bytesPerSample, true);   // byte rate
    view.setUint16(32, bytesPerSample, true);          // block align
    view.setUint16(34, 16, true);          // bits per sample
    str(36, 'data');
    view.setUint32(40, samples.length * bytesPerSample, true);

    let off = 44;
    for (let i = 0; i < samples.length; i++, off += 2) {
      let s = samples[i];
      s = s < -1 ? -1 : s > 1 ? 1 : s;
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  },
};
