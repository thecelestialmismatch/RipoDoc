import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ManifestError, parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';

const evidence = () => ({
  title: 'Rows',
  summary: 'Every row behind the figure.',
  table: {
    columns: [{ key: 'id', label: 'Id' }],
    rows: [{ id: 'A-1' }],
  },
  provenance: {
    sourceSystem: 'PSA',
    sourceQuery: 'status = closed',
    approvedBy: 'Priya Raman',
    approvedAt: '2026-07-01T16:40:00Z',
  },
});

const valid = () => ({
  reportId: 'rpt-demo-0001',
  version: 1,
  title: 'QBR',
  provider: 'Northgate Managed IT',
  client: 'Harbourview Legal',
  periodLabel: 'Q2 2026',
  publishedAt: '2026-07-02T09:15:00Z',
  recipient: { name: 'Dana Whitfield', email: 'dana@example.com' },
  elements: [{ id: 'tickets-resolved', kind: 'kpi', label: 'Tickets', value: '412', evidence: evidence() }],
});

const expectError = (mutate: (input: Record<string, unknown>) => void, pattern: RegExp): void => {
  const input = valid();
  mutate(input as unknown as Record<string, unknown>);
  assert.throws(() => parseManifest(input), (error: unknown) => {
    assert.ok(error instanceof ManifestError, 'expected a ManifestError');
    assert.match(error.message, pattern);
    return true;
  });
};

test('a valid manifest parses', () => {
  const manifest = parseManifest(valid());
  assert.equal(manifest.elements[0]?.id, 'tickets-resolved');
});

test('a kpi without a formatted value is rejected', () => {
  expectError((input) => {
    delete (input.elements as Record<string, unknown>[])[0]?.value;
  }, /value/);
});

test('an unknown element kind is rejected', () => {
  expectError((input) => {
    (input.elements as Record<string, unknown>[])[0]!.kind = 'gauge';
  }, /kind/);
});

test('duplicate element ids are rejected because ids are URLs', () => {
  const input = valid();
  input.elements = [input.elements[0]!, { ...input.elements[0]! }];
  assert.throws(() => parseManifest(input), /duplicate element id/);
});

test('element ids are restricted to URL-safe characters', () => {
  for (const bad of ['Tickets Resolved', '../escape', 'a', 'UPPER', 'trailing-']) {
    expectError((input) => {
      (input.elements as Record<string, unknown>[])[0]!.id = bad;
    }, /lowercase alphanumeric/);
  }
});

test('a missing approval is rejected — unapproved data must never publish', () => {
  expectError((input) => {
    const element = (input.elements as Record<string, unknown>[])[0]!;
    delete ((element.evidence as Record<string, unknown>).provenance as Record<string, unknown>)
      .approvedBy;
  }, /approvedBy/);
});

test('a non-ISO approval timestamp is rejected', () => {
  expectError((input) => {
    const element = (input.elements as Record<string, unknown>[])[0]!;
    ((element.evidence as Record<string, unknown>).provenance as Record<string, unknown>).approvedAt =
      'last tuesday';
  }, /ISO 8601/);
});

test('a row missing a declared column is rejected', () => {
  expectError((input) => {
    const element = (input.elements as Record<string, unknown>[])[0]!;
    ((element.evidence as Record<string, unknown>).table as Record<string, unknown>).rows = [{}];
  }, /expected a string or number/);
});

test('an invalid recipient email is rejected', () => {
  expectError((input) => {
    (input.recipient as Record<string, unknown>).email = 'not-an-email';
  }, /valid email/);
});

test('a non-positive version is rejected', () => {
  expectError((input) => {
    input.version = 0;
  }, /positive integer/);
});

test('an empty report is rejected', () => {
  expectError((input) => {
    input.elements = [];
  }, /at least one element/);
});

test('a bar chart needs a series and rejects negative values', () => {
  const input = valid();
  const element = input.elements[0] as Record<string, unknown>;
  element.kind = 'bar-chart';
  delete element.value;
  assert.throws(() => parseManifest(input), /series/);

  element.series = [{ label: 'April', value: -1 }];
  assert.throws(() => parseManifest(input), /must not be negative/);

  element.series = [{ label: 'April', value: 121 }];
  assert.equal(parseManifest(input).elements[0]?.kind, 'bar-chart');
});

test('non-object input is rejected rather than throwing a TypeError', () => {
  for (const bad of [null, 42, 'text', []]) {
    assert.throws(() => parseManifest(bad), ManifestError);
  }
});
