import assert from 'node:assert/strict';
import test from 'node:test';
import { PILOT_GATE_IDS, validatePilotEvidence } from './deepseek-harness-pilot-policy.ts';

const digest = 'a'.repeat(64);
const commit = 'b'.repeat(40);

const completeEvidence = () => ({
  schemaVersion: 1,
  purpose: 'synthetic-internal-engineering-only',
  authorization: 'conditional-pilot-not-production-approval',
  sourceCommit: commit,
  archiveSha256: digest,
  lockfileSha256: digest,
  workspaceClassification: 'synthetic-read-only',
  gates: Object.fromEntries(PILOT_GATE_IDS.map((id) => [id, { passed: true, evidence: `recorded evidence for ${id}` }])),
});

test('conditional pilot evidence requires all ten gates and immutable acquisition pins', () => {
  assert.deepEqual(validatePilotEvidence(completeEvidence()), []);
});

test('conditional pilot evidence fails closed for an incomplete or unsafe record', () => {
  const incomplete = completeEvidence();
  incomplete.workspaceClassification = 'customer-data' as never;
  incomplete.gates.credentials = { passed: false, evidence: 'not isolated' };
  delete incomplete.gates['log-destruction'];
  const errors = validatePilotEvidence(incomplete);
  assert.ok(errors.some((error) => error.includes('workspaceClassification')));
  assert.ok(errors.some((error) => error.includes('credentials')));
  assert.ok(errors.some((error) => error.includes('log-destruction')));
});
