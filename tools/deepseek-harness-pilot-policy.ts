import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PILOT_GATE_IDS = [
  'isolation',
  'pinning',
  'lifecycle-scripts',
  'effective-configuration',
  'file-boundary',
  'network-boundary',
  'model-contract',
  'credentials',
  'prompt-injection',
  'log-destruction',
] as const;

export type PilotGateId = (typeof PILOT_GATE_IDS)[number];

type GateRecord = Readonly<{ readonly passed: boolean; readonly evidence: string }>;

export type PilotEvidence = Readonly<{
  readonly schemaVersion: 1;
  readonly purpose: 'synthetic-internal-engineering-only';
  readonly authorization: 'conditional-pilot-not-production-approval';
  readonly sourceCommit: string;
  readonly archiveSha256: string;
  readonly lockfileSha256: string;
  readonly workspaceClassification: 'synthetic-read-only';
  readonly gates: Readonly<Record<PilotGateId, GateRecord>>;
}>;

const sha256 = /^[a-f0-9]{64}$/i;
const commit = /^[a-f0-9]{40}$/i;

const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const validatePilotEvidence = (value: unknown): readonly string[] => {
  if (!object(value)) return ['pilot evidence must be a JSON object'];
  const errors: string[] = [];
  if (value.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (value.purpose !== 'synthetic-internal-engineering-only') errors.push('purpose must be synthetic-internal-engineering-only');
  if (value.authorization !== 'conditional-pilot-not-production-approval') errors.push('authorization must not claim production approval');
  if (typeof value.sourceCommit !== 'string' || !commit.test(value.sourceCommit)) errors.push('sourceCommit must be a full 40-character immutable commit SHA');
  if (typeof value.archiveSha256 !== 'string' || !sha256.test(value.archiveSha256)) errors.push('archiveSha256 must be a SHA-256 digest');
  if (typeof value.lockfileSha256 !== 'string' || !sha256.test(value.lockfileSha256)) errors.push('lockfileSha256 must be a SHA-256 digest');
  if (value.workspaceClassification !== 'synthetic-read-only') errors.push('workspaceClassification must be synthetic-read-only');
  if (!object(value.gates)) return [...errors, 'gates must be an object'];

  for (const id of PILOT_GATE_IDS) {
    const gate = value.gates[id];
    if (!object(gate) || gate.passed !== true || typeof gate.evidence !== 'string' || gate.evidence.trim().length < 16) {
      errors.push(`${id} must pass with a specific evidence reference`);
    }
  }

  for (const id of Object.keys(value.gates)) if (!PILOT_GATE_IDS.includes(id as PilotGateId)) errors.push(`unexpected gate: ${id}`);
  return errors;
};

const run = async (): Promise<void> => {
  const path = process.argv[2];
  if (!path) {
    process.stderr.write('usage: node --experimental-strip-types tools/deepseek-harness-pilot-policy.ts <evidence.json>\n');
    process.exitCode = 2;
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path, 'utf8'));
  } catch {
    process.stderr.write('pilot evidence could not be read as JSON\n');
    process.exitCode = 1;
    return;
  }

  const errors = validatePilotEvidence(parsed);
  const report = { status: errors.length === 0 ? 'approved-for-conditional-pilot' : 'not-approved', errors };
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (errors.length > 0) process.exitCode = 1;
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) void run();
