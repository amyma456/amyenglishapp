// 用一个真实的 Chromium（无头）打开页面，按脚本点击 + 截图。
// 用法： node tools/cdp-tour.mjs <url> <w> <h> <outDir> <steps> [prefix]
// steps: 要连续点击的选择器数组（用逗号分隔），每点一次截一张图。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const [, , url, w, h, outDir, stepsArg, prefixArg] = process.argv;
const width = parseInt(w || '390', 10);
const height = parseInt(h || '844', 10);
const prefix = prefixArg || 'shot';
const steps = (stepsArg || '').split('|').filter(Boolean);

const port = 9400 + Math.floor(Math.random() * 300);
const userDir = path.resolve('.tmp/cdp-profile');
const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + userDir,
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + port + '/json/list');
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* not ready */ }
    await sleep(300);
  }
  throw new Error('devtools not ready');
}

(async () => {
  const wsUrl = await getWs();
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await new Promise((r) => ws.addEventListener('open', r));

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 700
  });
  if (width < 700) {
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  }
  await send('Page.navigate', { url });
  await sleep(4500);

  fs.mkdirSync(outDir, { recursive: true });
  const shoot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(data, 'base64'));
  };
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return r && r.result ? r.result.value : null;
  };

  await shoot(prefix + '-00');

  for (let i = 0; i < steps.length; i++) {
    const sel = steps[i];
    const ok = await evaluate(`(function(){
      var el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return 'missing';
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return 'hidden';
      el.click();
      return 'ok';
    })()`);
    await sleep(1800);
    await shoot(prefix + '-' + String(i + 1).padStart(2, '0'));
    console.log(i + 1, sel, ok);
  }

  ws.close();
  proc.kill();
  process.exit(0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
