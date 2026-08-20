import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

type SimulationKind = 'external-cdn' | 'external-api' | 'same-origin-api';
type RequestClass = 'off-origin' | 'same-origin-api' | 'same-origin-asset';
type Artifact = {
  readonly passed: boolean;
  readonly outcome: 'passed' | 'expected-failure' | 'failed';
  readonly counts: Readonly<Record<RequestClass, number>>;
  readonly browserStorage?: { readonly local: number; readonly session: number };
  readonly productionHarnessStatus?: number;
  readonly zeroExternalAttempts: boolean;
  readonly zeroBrowserPersistence: boolean;
  readonly simulationValidated: boolean;
  readonly simulation?: { readonly kind: SimulationKind; readonly expectedClass: Exclude<RequestClass, 'same-origin-asset'>; readonly locallyAborted: boolean; readonly observedMatches: number; readonly target: string };
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = 'tools/zero-egress-audit-cli.ts';
const invoke = (...args: readonly string[]) => spawnSync(process.execPath, ['--experimental-strip-types', cli, ...args], { cwd: root, encoding: 'utf8' });

const assertSimulation = async (kind: SimulationKind, port: number) => {
  const directory = await mkdtemp(join(tmpdir(), `ripodoc-zero-egress-${kind}-`));
  const artifactPath = join(directory, 'audit.json');
  try {
    const result = invoke('--mode', 'development', '--simulate', kind, '--port', String(port), '--out', artifactPath);
    assert.equal(result.status, 1, `A ${kind} sentinel must fail closed.`);
    assert.match(result.stderr, /EXPECTED-FAILURE/);
    const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as Artifact;
    const expectedClass = kind === 'same-origin-api' ? 'same-origin-api' : 'off-origin';
    assert.equal(artifact.passed, false);
    assert.equal(artifact.outcome, 'expected-failure');
    assert.equal(artifact.simulationValidated, true);
    assert.equal(artifact.zeroExternalAttempts, false);
    assert.equal(artifact.zeroBrowserPersistence, true);
    assert.deepEqual(artifact.browserStorage, { local: 0, session: 0 });
    assert.equal(artifact.productionHarnessStatus, 404);
    assert.equal(artifact.simulation?.kind, kind);
    assert.equal(artifact.simulation?.expectedClass, expectedClass);
    assert.equal(artifact.simulation?.locallyAborted, true);
    assert.equal(artifact.simulation?.observedMatches, 1);
    assert.equal(artifact.counts[expectedClass], 1);
    assert.equal(artifact.counts['off-origin'] + artifact.counts['same-origin-api'], 1);
    assert.match(artifact.simulation?.target ?? '', kind === 'same-origin-api' ? /^http:\/\/localhost/ : /^https:\/\/.*\.invalid\//);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

test('zero-egress CLI documents its CI contract and local simulation safeguards', () => {
  const result = invoke('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /RipoDoc zero-egress audit CLI/);
  assert.match(result.stdout, /--mode <production\|development>/);
  assert.match(result.stdout, /Baseline audit passed with no forbidden request attempt/);
  assert.match(result.stdout, /validated simulation intentionally proved fail-closed behavior/);
  assert.match(result.stdout, /external-cdn/);
  assert.match(result.stdout, /external-api/);
  assert.match(result.stdout, /same-origin-api/);
  assert.match(result.stdout, /reserved \.invalid hosts/);
});

test('zero-egress CLI rejects invalid arguments and simulation kinds with a CI failure code', () => {
  for (const argument of [['--unknown'], ['--simulate', 'unknown-fallback']]) {
    const result = invoke(...argument);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Unsupported or incomplete option/);
  }
});

test('zero-egress CLI writes a failure artifact for a missing local browser prerequisite', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ripodoc-zero-egress-cli-'));
  const artifactPath = join(directory, 'audit.json');
  try {
    const result = invoke('--chromium', join(directory, 'missing-chromium'), '--out', artifactPath);
    assert.equal(result.status, 1);
    const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as Pick<Artifact, 'passed' | 'zeroExternalAttempts' | 'zeroBrowserPersistence'> & { readonly failure?: string };
    assert.equal(artifact.passed, false);
    assert.match(artifact.failure ?? '', /ENOENT/);
    assert.equal(artifact.zeroExternalAttempts, true);
    assert.equal(artifact.zeroBrowserPersistence, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('external CDN fallback is intercepted, locally aborted, and reported as an expected failure', { timeout: 60_000 }, async () => {
  await assertSimulation('external-cdn', 3421);
});

test('external API fallback is intercepted, locally aborted, and reported as an expected failure', { timeout: 60_000 }, async () => {
  await assertSimulation('external-api', 3422);
});

test('same-origin API fallback is intercepted, locally aborted, and reported as an expected failure', { timeout: 60_000 }, async () => {
  await assertSimulation('same-origin-api', 3423);
});
