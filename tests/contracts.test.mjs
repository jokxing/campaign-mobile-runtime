import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSendMessage, parseMarkRead, ContractError, supportErrorMessage } from '../shared/contracts/support.ts';
import { isCampaignConfig, isHomeConfig, isAllowedPreviewOrigin, parsePreviewUpdate } from '../shared/contracts/preview.ts';
import { defaultCampaignConfig } from '../mock/data/campaign.ts';

test('message contract accepts trimmed text and the 300 UTF-16 boundary', () => {
  assert.deepEqual(parseSendMessage({ sender: 'customer', content: '  你好  ' }), { sender: 'customer', content: '你好' });
  assert.equal(parseSendMessage({ sender: 'agent', content: '好'.repeat(300) }).content.length, 300);
  assert.equal(parseSendMessage({ sender: 'customer', content: '😀'.repeat(150) }).content.length, 300);
});
test('invalid request bodies fail instead of being coerced', () => {
  for (const value of [null, [], {}, 1, { sender: 'system', content: 'hello' }, { sender: 'customer', content: 123 },
    { sender: 'customer', content: ' ' }, { sender: 'customer', content: '好'.repeat(301) }]) {
    assert.throws(() => parseSendMessage(value), ContractError);
  }
  for (const value of [null, [], {}, { reader: 'admin' }]) assert.throws(() => parseMarkRead(value), ContractError);
  assert.deepEqual(parseMarkRead({ reader: 'agent' }), { reader: 'agent' });
});
test('known API errors become readable text and network errors have a fallback', () => {
  assert.match(supportErrorMessage({ data: { data: { code: 'FORBIDDEN' } } }), /权限/);
  assert.match(supportErrorMessage(new Error('network')), /网络/);
});
test('campaign preview accepts fixture and rejects malformed nested fields atomically', () => {
  assert.equal(isCampaignConfig(defaultCampaignConfig), true);
  for (const mutate of [
    c => { c.version = 2; }, c => { c.campaigns[0].rules.target = 100000; },
    c => { c.campaigns[0].startAt = '2026-02-30'; }, c => { c.campaigns[0].type = 'unknown'; },
    c => { c.campaigns[0].theme = 'url(https://example.test)'; },
    c => { c.campaigns[1].id = c.campaigns[0].id; }, c => { c.campaigns[0].platforms = ['invalid']; },
    c => { c.campaigns[0].rules = null; }, c => { c.campaigns = Array(101).fill(c.campaigns[0]); }
  ]) {
    const value = structuredClone(defaultCampaignConfig);
    mutate(value);
    assert.equal(isCampaignConfig(value), false);
    assert.equal(parsePreviewUpdate({ channel: 'campaign-studio', type: 'CONFIG_UPDATE', payload: value }), null);
  }
});
test('home preview validates modules, colors and duplicate identifiers', () => {
  const value = { version: 1, name: '首页', theme: { primary: '#2563eb', background: '#ffffff' },
    modules: [{ id: 'hero', title: '主视觉', type: 'hero-banner', visible: true, props: { heading: '欢迎' } }] };
  assert.equal(isHomeConfig(value), true);
  assert.equal(parsePreviewUpdate({ channel: 'mobile-home-composer', type: 'SCHEMA_UPDATE', payload: value })?.payload, value);
  assert.equal(isHomeConfig({ ...value, modules: [value.modules[0], value.modules[0]] }), false);
  assert.equal(isHomeConfig({ ...value, modules: [{ ...value.modules[0], props: { items: [123] } }] }), false);
  assert.equal(parsePreviewUpdate({ channel: 'unknown', type: 'SCHEMA_UPDATE', payload: value }), null);
});
test('query origins cannot grant trust; allowlist uses exact origins', () => {
  assert.equal(isAllowedPreviewOrigin('http://localhost:4173', 'http://localhost:4180', 'http://localhost:4173'), true);
  for (const value of ['https://evil.test', 'http://localhost:4173.evil.test', 'http://localhost:4173/path', 'null', 'javascript:alert(1)']) {
    assert.equal(isAllowedPreviewOrigin(value, 'http://localhost:4180', 'http://localhost:4173'), false);
  }
});
