import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  chainRecord,
  createFileAuditSink,
  GENESIS,
  hashRecord,
  verifyAuditLog,
} from '../../../web/frontend/src/lib/evidence/audit-log.ts';
import {
  recordAccess,
  resetAuditSink,
  setAuditSink,
  type AccessEvent,
} from '../../../web/frontend/src/lib/evidence/audit.ts';

const event = (overrides: Partial<AccessEvent> = {}): AccessEvent => ({
  at: '2026-07-02T09:15:00Z',
  outcome: 'granted',
  reportId: 'rpt-demo-0001',
  version: 3,
  elementId: 'assets-at-risk',
  jti: 'abc123',
  recipientHash: 'f'.repeat(64),
  ...overrides,
});

const logPath = (): string => join(mkdtempSync(join(tmpdir(), 'ripodoc-audit-')), 'access.jsonl');

test('the first record commits to the genesis hash', () => {
  const record = chainRecord(event(), { seq: 0, hash: GENESIS });
  assert.equal(record.seq, 1);
  assert.equal(record.prev, GENESIS);
  assert.match(record.hash, /^[0-9a-f]{64}$/);
});

test('an appended log verifies end to end', async () => {
  const path = logPath();
  const sink = createFileAuditSink(path);
  for (let index = 0; index < 5; index += 1) {
    await sink.write(event({ elementId: `element-${index}` }));
  }

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.records, 5);
});

test('concurrent writes do not fork the chain', async () => {
  const path = logPath();
  const sink = createFileAuditSink(path);
  await Promise.all(
    Array.from({ length: 25 }, (_, index) => sink.write(event({ elementId: `e${index}` }))),
  );

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, true, 'two requests appending at once must not both claim the same head');
  if (result.ok) assert.equal(result.records, 25);
});

test('a reopened log continues the existing chain', async () => {
  const path = logPath();
  await createFileAuditSink(path).write(event({ elementId: 'first' }));
  await createFileAuditSink(path).write(event({ elementId: 'second' }));

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.records, 2);
});

test('editing a record is detected', async () => {
  const path = logPath();
  const sink = createFileAuditSink(path);
  await sink.write(event({ elementId: 'one' }));
  await sink.write(event({ elementId: 'two' }));
  await sink.write(event({ elementId: 'three' }));

  const lines = readFileSync(path, 'utf8').trim().split('\n');
  const tampered = JSON.parse(lines[1] as string) as Record<string, unknown>;
  tampered.outcome = 'denied';
  lines[1] = JSON.stringify(tampered);
  writeFileSync(path, `${lines.join('\n')}\n`);

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.failedAt, 2);
    assert.equal(result.reason, 'bad-hash');
  }
});

test('deleting a record is detected', async () => {
  const path = logPath();
  const sink = createFileAuditSink(path);
  for (const id of ['one', 'two', 'three']) await sink.write(event({ elementId: id }));

  const lines = readFileSync(path, 'utf8').trim().split('\n');
  writeFileSync(path, `${[lines[0], lines[2]].join('\n')}\n`);

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'out-of-order');
});

test('re-hashing a tampered record still fails, because the chain moves on', async () => {
  const path = logPath();
  const sink = createFileAuditSink(path);
  for (const id of ['one', 'two', 'three']) await sink.write(event({ elementId: id }));

  const lines = readFileSync(path, 'utf8').trim().split('\n');
  const record = JSON.parse(lines[1] as string) as Record<string, unknown>;
  record.outcome = 'denied';
  const { hash: _dropped, ...unhashed } = record;
  lines[1] = JSON.stringify({
    ...unhashed,
    hash: hashRecord(unhashed as Parameters<typeof hashRecord>[0]),
  });
  writeFileSync(path, `${lines.join('\n')}\n`);

  const result = verifyAuditLog(readFileSync(path, 'utf8'));
  assert.equal(result.ok, false, 'record 3 still points at the original hash of record 2');
  if (!result.ok) {
    assert.equal(result.failedAt, 3);
    assert.equal(result.reason, 'broken-link');
  }
});

test('a corrupt line is reported rather than skipped', () => {
  const result = verifyAuditLog('{"seq":1,\n');
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'unparsable');
});

test('an empty log is intact, not broken', () => {
  const result = verifyAuditLog('\n  \n');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.records, 0);
    assert.equal(result.head, GENESIS);
  }
});

test('recordAccess stamps a timestamp and reaches the configured sink', async () => {
  const seen: AccessEvent[] = [];
  setAuditSink({
    async write(received) {
      seen.push(received);
    },
  });
  try {
    await recordAccess({ outcome: 'denied', reason: 'expired' });
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.outcome, 'denied');
    assert.match(seen[0]?.at ?? '', /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    resetAuditSink();
  }
});

test('the raw recipient address never enters a record', async () => {
  const seen: AccessEvent[] = [];
  setAuditSink({
    async write(received) {
      seen.push(received);
    },
  });
  try {
    await recordAccess({ outcome: 'granted', recipientHash: 'a'.repeat(64) });
    const serialised = JSON.stringify(seen);
    assert.ok(!serialised.includes('@'), 'a log line must never carry an email address');
  } finally {
    resetAuditSink();
  }
});
