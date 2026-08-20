import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = 'tools/zero-egress-audit-cli.ts';

const invoke = (...args: readonly string[]) => spawnSync(process.execPath, ['--experimental-strip-types', cli, ...args], { cwd: root, encoding: 'utf8' });

test('zero-egress CLI documents its CI contract', () => {
  const result = invoke('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /RipoDoc zero-egress audit CLI/);
  assert.match(result.stdout, /--mode <production\|development>/);
  assert.match(result.stdout, /All static, runtime, storage, and production-harness checks passed/);
  assert.match(result.stdout, /Off-origin and same-origin \/api\/ requests are/);
});

test('zero-egress CLI rejects invalid arguments with a CI failure code', () => {
  const result = invoke('--unknown');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unsupported or incomplete option: --unknown/);
});

test('zero-egress CLI writes a failure artifact for a missing local browser prerequisite', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ripodoc-zero-egress-cli-'));
  const artifact = join(directory, 'audit.json');
  try {
    const result = invoke('--chromium', join(directory, 'missing-chromium'), '--out', artifact);
    assert.equal(result.status, 1);
    const audit = JSON.parse(await readFile(artifact, 'utf8')) as { readonly passed: boolean; readonly failure?: string; readonly zeroExternalAttempts: boolean; readonly zeroBrowserPersistence: boolean };
    assert.equal(audit.passed, false);
    assert.match(audit.failure ?? '', /ENOENT/);
    assert.equal(audit.zeroExternalAttempts, true);
    assert.equal(audit.zeroBrowserPersistence, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
