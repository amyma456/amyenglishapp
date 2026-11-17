// 登录页「账号簿」交互自测：预填、下拉、点选、备注名自动跟。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://127.0.0.1:8098/index.html';
const outDir = process.argv[3] || '.tmp/login-test';
const width = 390, height = 844;
const port = 9500 + Math.floor(Math.random() * 200);
const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
  '--remote-debugging-port=' + port, '--user-data-dir=' + path.resolve('.tmp/cdp-login'), 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      const p = list.find((t) => t.type === 'page');
      if (p) wsUrl = p.webSocketDebuggerUrl;
    } catch (e) {}
    if (!wsUrl) await sleep(300);
  }
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const mid = ++id; pending.set(mid, { res, rej }); ws.send(JSON.stringify({ id: mid, method, params })); });
  await new Promise((r) => ws.addEventListener('open', r));
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });

  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) return { EXC: r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || '') };
    return r.result.value;
  };
  const shoot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(data, 'base64'));
  };
  const state = () => ev(`(function(){
    var p=document.getElementById('login-phone'), n=document.getElementById('login-name');
    var box=document.getElementById('login-book'), hint=document.getElementById('login-remember-hint');
    return {phone:p&&p.value, name:n&&n.value, rows:box&&box.querySelectorAll('.login-book-item').length,
            open: box? !box.hidden : null, hint: hint&&hint.style.display!=='none'?hint.textContent:''};
  })()`);

  // 1) 洗干净：清掉本机存储
  await send('Page.navigate', { url });
  await sleep(3500);
  await ev(`(function(){localStorage.clear();sessionStorage.clear();
    document.cookie='amy_login_book=; Max-Age=0; path=/';
    document.cookie='amy_login_draft=; Max-Age=0; path=/';
    document.cookie='amy_login=; Max-Age=0; path=/';return 1;})()`);
  await send('Page.navigate', { url });
  await sleep(3500);
  console.log('A 空白设备:', JSON.stringify(await state()));
  await shoot('a-empty');

  // 2) 塞两本账号（模拟这台设备登过老师的号 + 一个学生）
  await ev(`(function(){
    localStorage.setItem('amy_login_book_v2', JSON.stringify([
      {phone:'13800002991', name:'马慧-Amy', ts: Date.now()},
      {phone:'13900001234', name:'马小跳-Tom', ts: Date.now()-86400000}
    ]));
    return 1;})()`);
  await send('Page.navigate', { url });
  await sleep(3500);
  console.log('B 默认填好:', JSON.stringify(await state()));
  await shoot('b-prefilled');

  // 3) 只敲 "13" → 应当出下拉
  await ev(`(function(){
    var p=document.getElementById('login-phone');
    p.focus(); p.value='139'; p.dispatchEvent(new Event('input',{bubbles:true}));
    return 1;})()`);
  await sleep(700);
  console.log('C 敲 139:', JSON.stringify(await state()));
  await shoot('c-dropdown');

  // 4) 点第一行 → 手机号 + 备注名一起填好
  await ev(`(function(){
    var row=document.querySelector('#login-book .login-book-item');
    if(!row) return 'no-row';
    var r=row.getBoundingClientRect();
    row.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:r.left+10,clientY:r.top+10}));
    return 'clicked';})()`);
  await sleep(600);
  console.log('D 点选之后:', JSON.stringify(await state()));
  await shoot('d-picked');

  // 5) 刷新一次：填进去的这组应当变成默认
  await send('Page.navigate', { url });
  await sleep(3500);
  console.log('E 刷新后默认:', JSON.stringify(await state()));
  await shoot('e-after-reload');

  ws.close(); proc.kill(); process.exit(0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
