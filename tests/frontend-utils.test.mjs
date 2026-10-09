import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTime } from '../app/utils/date.ts';
import { campaignRoute } from '../app/utils/routes.ts';
import { createRefreshTask } from '../app/utils/refresh-task.ts';

test('time formatting uses Shanghai timezone and tolerates invalid values', () => {
  assert.equal(formatTime('2026-09-15T00:30:00Z'), '08:30');
  assert.equal(formatTime('invalid'), '--:--');
  assert.equal(formatTime(''), '--:--');
});

test('campaign route encodes path segments and leaves query encoding to the router', () => {
  assert.deepEqual(campaignRoute({ code: 'city/a?b#c', id: 'a&b=中文' }), {
    path: '/campaign/city%2Fa%3Fb%23c', query: { id: 'a&b=中文' }
  });
});

test('concurrent initializers reuse one request', async () => {
  let calls = 0;
  const refresh = createRefreshTask(async () => { calls++; });
  const first = refresh(false);
  const second = refresh(false);
  assert.equal(first, second);
  await Promise.all([first, second]);
  assert.equal(calls, 1);
});

test('events arriving in flight coalesce into one trailing refresh', async () => {
  let calls = 0;
  let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const refresh = createRefreshTask(async () => {
    calls++;
    if (calls === 1) await blocked;
  });
  const first = refresh(false);
  await Promise.resolve();
  refresh();
  refresh();
  release();
  await first;
  assert.equal(calls, 2);
});

test('failed requests can be retried and separate runtimes do not share requests', async () => {
  let calls = 0;
  const refresh = createRefreshTask(async () => {
    if (++calls === 1) throw new Error('offline');
  });
  await assert.rejects(refresh(false), /offline/);
  await refresh(false);
  assert.equal(calls, 2);
  let otherCalls = 0;
  const other = createRefreshTask(async () => { otherCalls++; });
  await Promise.all([refresh(false), other(false)]);
  assert.equal(calls, 3);
  assert.equal(otherCalls, 1);
});
