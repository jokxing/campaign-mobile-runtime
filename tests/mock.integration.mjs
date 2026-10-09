import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

let child;
let base;
before(async () => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port) },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Mock process exited: ${output}`);
    try {
      if ((await fetch(`${base}/api/support/conversations`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Mock startup timed out: ${output}`);
});
after(async () => {
  if (child && child.exitCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
});

async function request(path = '/conversations', options = {}) {
  const response = await fetch(`${base}/api/support${path}`, options);
  return { response, body: await response.json() };
}
const post = body => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('mock list and detail preserve the agreed response envelopes', async () => {
  const { response, body } = await request();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-data-source'), 'mock');
  assert.equal(body.records[0].id, 'conversation-1001');
  assert.equal('messages' in body.records[0], false);
  const detail = await request('/conversations/conversation-1001');
  assert.ok(Array.isArray(detail.body.conversation.messages));
});
test('mock scenarios reproduce empty, 401, 403, 409 and 503 without changing data', async () => {
  for (const [scenario, status, code] of [
    ['unauthenticated', 401, 'UNAUTHENTICATED'], ['forbidden', 403, 'FORBIDDEN'],
    ['conflict', 409, 'CONVERSATION_UNAVAILABLE'], ['unavailable', 503, 'MOCK_UNAVAILABLE']
  ]) {
    const actual = await request('/conversations', { headers: { 'x-mock-scenario': scenario } });
    assert.equal(actual.response.status, status);
    assert.equal(actual.body.data.code, code);
  }
  const empty = await request('/conversations', { headers: { 'x-mock-scenario': 'empty' } });
  assert.deepEqual(empty.body, { records: [] });
  assert.equal((await request()).body.records.length, 1);
});
test('null, invalid roles, non-text and oversized messages return 422 without mutation', async () => {
  const path = '/conversations/conversation-1001';
  const count = (await request(path)).body.conversation.messages.length;
  for (const body of [null, [], {}, { sender: 'system', content: 'x' }, { sender: 'customer', content: 1 },
    { sender: 'customer', content: ' ' }, { sender: 'customer', content: 'x'.repeat(301) }]) {
    const result = await request(`${path}/messages`, post(body));
    assert.equal(result.response.status, 422);
    assert.equal(result.body.data.code, 'INVALID_REQUEST');
  }
  const malformed = await request(`${path}/messages`, { ...post({}), body: '{broken' });
  assert.equal(malformed.response.status, 422);
  for (const body of [null, { reader: 'invalid' }]) {
    assert.equal((await request(`${path}/read`, post(body))).response.status, 422);
  }
  assert.equal((await request(path)).body.conversation.messages.length, count);
});
test('missing conversation has a stable error code', async () => {
  const result = await request('/conversations/missing');
  assert.equal(result.response.status, 404);
  assert.equal(result.body.data.code, 'NOT_FOUND');
});
test('message lifecycle supports send, claim, agent reply, read and closed conflict', async () => {
  const path = '/conversations/conversation-1001';
  const sent = await request(`${path}/messages`, post({ sender: 'customer', content: ' hello ' }));
  assert.equal(sent.response.status, 200);
  assert.equal(sent.body.message.content, 'hello');
  assert.equal((await request(`${path}/claim`, post({}))).response.status, 200);
  assert.equal((await request(`${path}/messages`, post({ sender: 'agent', content: '收到' }))).response.status, 200);
  const read = await request(`${path}/read`, post({ reader: 'customer' }));
  assert.equal(read.body.conversation.unreadCustomer, 0);
  assert.equal(read.body.conversation.messages.at(-1).read, true);
  assert.equal((await request(`${path}/close`, post({}))).response.status, 200);
  const closed = await request(`${path}/messages`, post({ sender: 'customer', content: 'closed' }));
  assert.equal(closed.response.status, 409);
  assert.equal(closed.body.data.code, 'CONVERSATION_UNAVAILABLE');
});
