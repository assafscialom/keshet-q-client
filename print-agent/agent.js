const net = require('net');
const https = require('https');
const http = require('http');

// ── הגדרות ──
const SERVER_URL  = 'https://qclient.iqdesk.xyz/api';
const BRANCH_ID   = 1;          // שנה לפי מספר הסניף
const PRINTER_IP  = '192.168.1.3';
const PRINTER_PORT = 9100;
const POLL_INTERVAL = 2000;     // כל 2 שניות

// ── ESC/POS constants ──
const ESC  = '\x1B';
const GS   = '\x1D';
const LF   = '\x0A';
const INIT        = ESC + '@';
const CUT         = GS + 'V' + '\x00';
const BOLD_ON     = ESC + 'E' + '\x01';
const BOLD_OFF    = ESC + 'E' + '\x00';
const ALIGN_CENTER = ESC + 'a' + '\x01';
const ALIGN_RIGHT  = ESC + 'a' + '\x02';
const ALIGN_LEFT   = ESC + 'a' + '\x00';
const SIZE_LARGE   = GS + '!' + '\x11';
const SIZE_NORMAL  = GS + '!' + '\x00';
const LINE = '-'.repeat(32) + LF;

function buildPage(data, label) {
  let out = INIT;
  out += ALIGN_RIGHT + BOLD_ON + label + BOLD_OFF + LF;
  out += ALIGN_CENTER + 'קשת טעמים' + LF;
  out += SIZE_LARGE + ALIGN_CENTER + 'No.' + data.order_number + LF;
  out += SIZE_NORMAL;
  out += LINE;
  out += ALIGN_RIGHT + BOLD_ON + 'שם לקוח ' + BOLD_OFF + data.customer_name + LF;
  if (data.department_name) out += ALIGN_CENTER + data.department_name + LF;
  out += LINE;
  for (const item of data.items) {
    out += ALIGN_RIGHT;
    out += BOLD_ON + 'מק"ט ' + BOLD_OFF + (item.sku || '-') + LF;
    out += BOLD_ON + 'שם    ' + BOLD_OFF + item.name + LF;
    out += BOLD_ON + 'כמות  ' + BOLD_OFF + item.quantity + (item.metric || '') + LF;
    if (item.cut_type) out += BOLD_ON + 'חיתוך ' + BOLD_OFF + item.cut_type + LF;
    if (item.note)     out += BOLD_ON + 'הערה  ' + BOLD_OFF + item.note + LF;
    out += LINE;
  }
  const date = new Date().toLocaleString('he-IL');
  out += ALIGN_LEFT + date + LF;
  out += LF + LF + LF;
  return out;
}

function buildCustomerPage(data) {
  let out = INIT;
  out += ALIGN_CENTER + 'קשת טעמים' + LF;
  out += SIZE_LARGE + ALIGN_CENTER + String(data.order_number) + LF;
  out += SIZE_NORMAL;
  if (data.department_name) out += ALIGN_CENTER + data.department_name + LF;
  out += LINE;
  out += ALIGN_RIGHT + BOLD_ON + 'שם לקוח ' + BOLD_OFF + data.customer_name + LF;
  out += LINE;
  out += ALIGN_LEFT + new Date().toLocaleString('he-IL') + LF;
  out += LF + LF + LF;
  return out;
}

function sendToPrinter(data) {
  return new Promise((resolve, reject) => {
    const pages = [
      buildPage(data, 'מקור'),
      buildPage(data, 'העתק ללקוח'),
      buildCustomerPage(data),
    ];
    const output = Buffer.from(INIT + pages.join(CUT) + CUT, 'binary');

    const sock = new net.Socket();
    sock.setTimeout(5000);
    sock.connect(PRINTER_PORT, PRINTER_IP, () => {
      sock.write(output, () => { sock.destroy(); resolve(); });
    });
    sock.on('error', reject);
    sock.on('timeout', () => { sock.destroy(); reject(new Error('Printer timeout')); });
  });
}

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL + path);
    const lib = url.protocol === 'https:' ? https : http;
    const bodyStr = body ? JSON.stringify(body) : '';
    const req = lib.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function poll() {
  try {
    const jobs = await apiCall('GET', `/print/${BRANCH_ID}/poll`);
    for (const job of (jobs || [])) {
      const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
      try {
        await sendToPrinter(payload);
        await apiCall('POST', `/print/job/${job.id}/done`);
        console.log(`✓ Job ${job.id} printed`);
      } catch (err) {
        await apiCall('POST', `/print/job/${job.id}/failed`);
        console.error(`✗ Job ${job.id} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

console.log(`Print agent started — Branch ${BRANCH_ID} | Printer ${PRINTER_IP}:${PRINTER_PORT}`);
setInterval(poll, POLL_INTERVAL);
poll();
