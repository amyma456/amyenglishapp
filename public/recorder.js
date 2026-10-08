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
  async start(opts) {
    const options = opts || {};
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

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

    const onFrame = (frame) => {
      chunks.push(frame);
      let localPeak = 0;
      for (let i = 0; i < frame.length; i++) {
        const v = frame[i] < 0 ? -frame[i] : frame[i];
        if (v > localPeak) localPeak = v;
      }
      if (localPeak > peak) peak = localPeak;
      if (options.onLevel) options.onLevel(localPeak);
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

    this._active = { stream, ctx, source, node, sink, chunks, usingWorklet,
                     startedAt: Date.now(), peak: () => peak };
    return this._active;
  },

  recording() { return !!this._active; },

  // Stop and return { blob, duration, sampleRate, peak } — or null if the
  // capture produced no audio at all.
  async stop() {
    const a = this._active;
    this._active = null;
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
    return {
      blob: this._encodeWav(pcm, this.TARGET_RATE),
      // Raw samples come back too so several takes can be stitched into one
      // clip later — concatenating PCM is exact, concatenating encoded WAV
      // files is not (each carries its own 44-byte header).
      samples: pcm,
      duration: pcm.length / this.TARGET_RATE,
      sampleRate: this.TARGET_RATE,
      peak: a.peak(),
    };
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
