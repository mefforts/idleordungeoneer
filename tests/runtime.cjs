const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { parse } = require('acorn');
const { chromium } = require('playwright');
const {withTestingCodes}=require('./code-fixture.cjs');
const root = path.resolve(__dirname, '..');
const resultsDir = path.join(root, 'test-results');
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function balanceHashes(html, names) {
  const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const ast = parse(source, { ecmaVersion: 'latest' });
  const found = {};
  walk(ast, node => {
    if (node.type === 'VariableDeclarator' && names.includes(node.id?.name)) {
      const value = vm.runInNewContext('(' + source.slice(node.init.start, node.init.end) + ')', {}, { timeout: 200 });
      found[node.id.name] = crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
    }
  });
  return found;
}
async function createRuntime() {
  fs.mkdirSync(resultsDir, { recursive: true });
  const html = Buffer.from(withTestingCodes(fs.readFileSync(path.join(root, 'index.html'),'utf8')));
  const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'original-balance.json')));
  assert.deepEqual(balanceHashes(html.toString(), Object.keys(expected)), expected, 'Static phase, wave-power, biome and jewelry definitions match the current approved baseline');
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else {
      res.writeHead(404); res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const systemBrowser = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
  const executablePath = process.env.CHROMIUM_PATH || systemBrowser;
  let browser;
  try { browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] }); }
  catch (error) { server.close(); throw error; }
  return {
    browser, baseURL: `http://127.0.0.1:${server.address().port}`, resultsDir,
    async close() { await browser.close(); await new Promise(resolve => server.close(resolve)); }
  };
}
module.exports = { createRuntime, balanceHashes };
