import { spawn, type ChildProcess } from 'node:child_process';
import { access, constants, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium, type Browser, type Page, type Request } from 'playwright-core';

type Mode = 'development' | 'production';
type SimulationKind = 'none' | 'external-cdn' | 'external-api' | 'same-origin-api';
type RequestClass = 'off-origin' | 'same-origin-api' | 'same-origin-asset';
type CapturedRequest = { readonly method: string; readonly resourceType: string; readonly url: string; readonly class: RequestClass };
type StorageCounts = { readonly local: number; readonly session: number };
type Options = { readonly root: string; readonly out: string; readonly port: number; readonly mode: Mode; readonly chromiumPath: string; readonly simulation: SimulationKind; readonly help: boolean };
type StaticCheck = { readonly name: string; readonly passed: boolean; readonly detail: string };
type SimulationSpec = { readonly kind: Exclude<SimulationKind, 'none'>; readonly target: string; readonly method: 'GET' | 'POST'; readonly expectedClass: Exclude<RequestClass, 'same-origin-asset'> };
type SimulationEvidence = SimulationSpec & { readonly locallyAborted: boolean; readonly observedMatches: number };
type MutableSimulationState = SimulationSpec & { locallyAborted: boolean; observedMatches: number };
type TraceResult = { readonly requests: readonly CapturedRequest[]; readonly storage: StorageCounts; readonly simulation?: SimulationEvidence };
type AuditOutcome = 'passed' | 'expected-failure' | 'failed';
type AuditArtifact = {
  readonly schemaVersion: 2;
  readonly tool: 'ripodoc-zero-egress-audit';
  readonly target: 'Evidence Composer local PDF intake and draft workflow';
  readonly mode: Mode;
  readonly outcome: AuditOutcome;
  readonly origin: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly passed: boolean;
  readonly failure?: string;
  readonly staticChecks: readonly StaticCheck[];
  readonly productionHarnessStatus?: number;
  readonly totalRequests: number;
  readonly counts: Readonly<Record<RequestClass, number>>;
  readonly browserStorage?: StorageCounts;
  readonly zeroExternalAttempts: boolean;
  readonly zeroBrowserPersistence: boolean;
  readonly simulation?: SimulationEvidence;
  readonly simulationValidated: boolean;
  readonly requests: readonly CapturedRequest[];
};

const usage = `RipoDoc zero-egress audit CLI

Usage:
  node --experimental-strip-types tools/zero-egress-audit-cli.ts [options]

Options:
  --mode <production|development>  Local server mode (default: production).
  --out <file>                     JSON evidence artifact path.
  --root <directory>               Repository root (default: current directory).
  --port <number>                  Temporary local port (default: 3221).
  --chromium <path>                Chromium executable (default: /usr/bin/chromium).
  --simulate <kind>                Local-only expected-failure probe: external-cdn,
                                   external-api, or same-origin-api.
  --help                           Show this help text.

Exit codes:
  0  Baseline audit passed with no forbidden request attempt.
  1  Audit failed, or a validated simulation intentionally proved fail-closed behavior.
  2  Invalid command-line arguments.

Simulation safety:
  A simulated URL is intercepted and aborted by local browser automation before
  transport. External probes use reserved .invalid hosts; no real external host,
  application API endpoint, document byte, or evidence record is contacted.

The trace begins immediately before fixture PDF selection and ends after the local,
source-linked draft is visible. Off-origin and same-origin /api/ requests are
forbidden; same-origin static assets are disclosed separately.`;

const simulationKinds = new Set<SimulationKind>(['none', 'external-cdn', 'external-api', 'same-origin-api']);

const parseOptions = (args: readonly string[]): Options => {
  let root = process.cwd();
  let out = '';
  let port = 3221;
  let mode: Mode = 'production';
  let chromiumPath = '/usr/bin/chromium';
  let simulation: SimulationKind = 'none';
  let help = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument) continue;
    if (argument === '--help') { help = true; continue; }
    const value = args[index + 1];
    if (argument === '--root' && value) { root = resolve(value); index += 1; continue; }
    if (argument === '--out' && value) { out = resolve(value); index += 1; continue; }
    if (argument === '--port' && value && /^\d+$/.test(value)) { port = Number(value); index += 1; continue; }
    if (argument === '--mode' && (value === 'production' || value === 'development')) { mode = value; index += 1; continue; }
    if (argument === '--chromium' && value) { chromiumPath = resolve(value); index += 1; continue; }
    if (argument === '--simulate' && value && simulationKinds.has(value as SimulationKind)) { simulation = value as SimulationKind; index += 1; continue; }
    throw new Error(`Unsupported or incomplete option: ${argument}`);
  }
  if (port < 1024 || port > 65535) throw new Error('--port must be between 1024 and 65535.');
  return { root, out: out || resolve(root, 'build/zero-egress-audit/evidence-composer.json'), port, mode, chromiumPath, simulation, help };
};

const requestClass = (origin: string, url: string): RequestClass => !url.startsWith(origin) ? 'off-origin' : url.includes('/api/') ? 'same-origin-api' : 'same-origin-asset';
const emptyCounts = (): Record<RequestClass, number> => ({ 'off-origin': 0, 'same-origin-api': 0, 'same-origin-asset': 0 });
const delay = async (milliseconds: number) => new Promise<void>((resolveDelay) => setTimeout(resolveDelay, milliseconds));
const errorText = (cause: unknown) => cause instanceof Error ? cause.message : String(cause);

const simulationSpec = (kind: SimulationKind, origin: string): SimulationSpec | undefined => {
  if (kind === 'external-cdn') return { kind, target: 'https://ripodoc-pdf-worker-fallback.invalid/pdf.worker.min.mjs', method: 'GET', expectedClass: 'off-origin' };
  if (kind === 'external-api') return { kind, target: 'https://ripodoc-telemetry-fallback.invalid/v1/ingest', method: 'POST', expectedClass: 'off-origin' };
  if (kind === 'same-origin-api') return { kind, target: `${origin}/api/telemetry/web-vitals`, method: 'POST', expectedClass: 'same-origin-api' };
  return undefined;
};

const fixturePdf = (text: string) => {
  const content = `BT /F1 12 Tf 48 720 Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(body, 'ascii')); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(body, 'ascii');
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'ascii');
};

const stopProcessGroup = (processHandle: ChildProcess | undefined) => {
  if (!processHandle?.pid) return;
  try { process.kill(-processHandle.pid, 'SIGTERM'); } catch { /* Process already stopped. */ }
};

const startServer = async (options: Options, testMode: boolean) => {
  if (options.mode === 'production') await access(resolve(options.root, 'web/frontend/.next/BUILD_ID'), constants.R_OK);
  const script = options.mode === 'production' ? 'start' : 'dev';
  const server = spawn('npm', ['--prefix', 'web/frontend', 'run', script, '--', '--port', String(options.port)], {
    cwd: options.root,
    env: { ...process.env, RIPODOC_E2E_TEST_MODE: testMode ? 'true' : 'false', NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED: 'false' },
    stdio: 'ignore',
    detached: true,
  });
  const origin = `http://localhost:${options.port}`;
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/e2e-composer-harness`, { redirect: 'manual' });
      if (testMode ? response.ok : response.status === 404) return { server, origin, status: response.status };
    } catch { /* Server has not started yet. */ }
    await delay(250);
  }
  stopProcessGroup(server);
  throw new Error(`Timed out waiting for the ${testMode ? 'test-mode' : 'production-mode'} audit server.`);
};

const staticChecks = async (root: string): Promise<readonly StaticCheck[]> => {
  const composerPaths = [
    'web/frontend/src/components/dashboard/LocalEvidenceComposer.tsx',
    'web/frontend/src/lib/composer/local-pdf.ts',
    'web/frontend/src/lib/composer/local-evidence.ts',
    'web/frontend/src/lib/composer/local-composer-pdf.ts',
  ];
  const source = await Promise.all(composerPaths.map(async (path) => ({ path, content: await readFile(resolve(root, path), 'utf8') })));
  const forbidden = /fetch\(|\/api\/|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|https?:\/\//;
  const forbiddenHits = source.filter(({ content }) => forbidden.test(content)).map(({ path }) => path);
  const parser = source.find(({ path }) => path.endsWith('/local-pdf.ts'))?.content ?? '';
  const telemetry = await readFile(resolve(root, 'web/frontend/src/components/telemetry/WebVitalsReporter.tsx'), 'utf8');
  const harness = await readFile(resolve(root, 'web/frontend/src/app/e2e-composer-harness/page.tsx'), 'utf8');
  return [
    { name: 'Composer modules contain no egress or persistence primitive', passed: forbiddenHits.length === 0, detail: forbiddenHits.length ? `Forbidden primitive found in: ${forbiddenHits.join(', ')}` : 'No forbidden primitive found in permanent Composer modules.' },
    { name: 'PDF.js worker stays local', passed: parser.includes('useWorkerFetch: false') && parser.includes('pdf.worker.min.mjs'), detail: 'Requires bundled worker and disabled worker fetching.' },
    { name: 'Dashboard telemetry is suppressed', passed: telemetry.includes("pathname.startsWith('/dashboard')"), detail: 'Requires the /dashboard early-return telemetry guard.' },
    { name: 'Fixture harness is test-gated', passed: harness.includes("RIPODOC_E2E_TEST_MODE !== 'true'"), detail: 'Requires an explicit test-mode guard.' },
  ];
};

const runSimulation = async (page: Page, state: MutableSimulationState) => {
  await page.evaluate(`(async () => { try { await fetch(${JSON.stringify(state.target)}, { method: ${JSON.stringify(state.method)}, ...( ${JSON.stringify(state.method)} === 'POST' ? { body: 'ripodoc-zero-egress-sentinel' } : {}) }); } catch { /* Route abort is expected. */ } })()`);
  await page.waitForTimeout(100);
};

const traceComposer = async (browser: Browser, origin: string, kind: SimulationKind): Promise<TraceResult> => {
  // This isolated audit context bypasses CSP only so a sentinel external request reaches
  // the local Playwright route. The route aborts it before transport; production CSP is
  // neither changed nor relied upon as the sole test signal.
  const context = await browser.newContext({ bypassCSP: true });
  const page: Page = await context.newPage();
  const requests: CapturedRequest[] = [];
  const spec = simulationSpec(kind, origin);
  const simulation: MutableSimulationState | undefined = spec ? { ...spec, locallyAborted: false, observedMatches: 0 } : undefined;
  let capture = false;
  page.on('request', (request: Request) => {
    if (!capture) return;
    const url = request.url();
    const classification = requestClass(origin, url);
    requests.push({ method: request.method(), resourceType: request.resourceType(), url, class: classification });
    if (simulation && url === simulation.target) simulation.observedMatches += 1;
  });
  if (simulation) {
    await page.route('**/*', async (route) => {
      if (route.request().url() !== simulation.target) { await route.continue(); return; }
      simulation.locallyAborted = true;
      await route.abort('blockedbyclient');
    });
  }
  try {
    await page.goto(`${origin}/e2e-composer-harness`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await page.waitForTimeout(250);
    capture = true;
    if (simulation) await runSimulation(page, simulation);
    await page.locator('#local-evidence-pdf').setInputFiles({ name: 'zero-egress-fixture.pdf', mimeType: 'application/pdf', buffer: fixturePdf('1. Do you have an approved incident response process?') });
    await page.getByText(/candidate questions found and matched against/i).waitFor();
    await page.getByText('Build local drafts').click();
    await page.getByRole('heading', { name: 'Do you have an approved incident response process?' }).waitFor();
    const storage = await page.evaluate<StorageCounts>('({ local: localStorage.length, session: sessionStorage.length })');
    return { requests, storage, ...(simulation ? { simulation: { ...simulation } } : {}) };
  } finally {
    await context.close();
  }
};

const writeArtifact = async (path: string, artifact: AuditArtifact) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
};

const run = async (options: Options) => {
  const startedAt = new Date().toISOString();
  let testServer: ChildProcess | undefined;
  let guardServer: ChildProcess | undefined;
  let browser: Browser | undefined;
  let checks: readonly StaticCheck[] = [];
  let requests: readonly CapturedRequest[] = [];
  let storage: StorageCounts | undefined;
  let simulation: SimulationEvidence | undefined;
  let guardStatus: number | undefined;
  let failure: string | undefined;
  try {
    await access(options.chromiumPath, constants.X_OK);
    checks = await staticChecks(options.root);
    if (checks.some((check) => !check.passed)) throw new Error(checks.filter((check) => !check.passed).map((check) => `${check.name}: ${check.detail}`).join('; '));
    const started = await startServer(options, true);
    testServer = started.server;
    browser = await chromium.launch({ executablePath: options.chromiumPath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const trace = await traceComposer(browser, started.origin, options.simulation);
    requests = trace.requests;
    storage = trace.storage;
    simulation = trace.simulation;
    await browser.close(); browser = undefined;
    stopProcessGroup(testServer); testServer = undefined;
    await delay(250);
    const guard = await startServer(options, false);
    guardServer = guard.server;
    guardStatus = guard.status;
    if (guardStatus !== 404) throw new Error(`The production-mode fixture harness returned HTTP ${guardStatus}, expected 404.`);
  } catch (cause) {
    failure = errorText(cause);
  } finally {
    await browser?.close();
    stopProcessGroup(testServer);
    stopProcessGroup(guardServer);
  }
  const counts = emptyCounts();
  for (const request of requests) counts[request.class] += 1;
  const forbiddenRequests = counts['off-origin'] + counts['same-origin-api'];
  const zeroExternalAttempts = forbiddenRequests === 0;
  const zeroBrowserPersistence = storage?.local === 0 && storage?.session === 0;
  const environmentValid = !failure && checks.every((check) => check.passed) && zeroBrowserPersistence && guardStatus === 404;
  const simulationValidated = simulation ? environmentValid && simulation.locallyAborted && simulation.observedMatches === 1 && forbiddenRequests === 1 && counts[simulation.expectedClass] === 1 : false;
  const baselinePassed = environmentValid && zeroExternalAttempts;
  const outcome: AuditOutcome = options.simulation === 'none' ? (baselinePassed ? 'passed' : 'failed') : (simulationValidated ? 'expected-failure' : 'failed');
  const artifact: AuditArtifact = {
    schemaVersion: 2,
    tool: 'ripodoc-zero-egress-audit',
    target: 'Evidence Composer local PDF intake and draft workflow',
    mode: options.mode,
    outcome,
    origin: `http://localhost:${options.port}`,
    startedAt,
    completedAt: new Date().toISOString(),
    passed: outcome === 'passed',
    ...(failure ? { failure } : {}),
    staticChecks: checks,
    ...(guardStatus === undefined ? {} : { productionHarnessStatus: guardStatus }),
    totalRequests: requests.length,
    counts,
    ...(storage ? { browserStorage: storage } : {}),
    zeroExternalAttempts,
    zeroBrowserPersistence,
    ...(simulation ? { simulation } : {}),
    simulationValidated,
    requests,
  };
  await writeArtifact(options.out, artifact);
  const summary = `zero-egress-audit ${outcome.toUpperCase()} | simulation=${options.simulation} requests=${artifact.totalRequests} off-origin=${counts['off-origin']} api=${counts['same-origin-api']} assets=${counts['same-origin-asset']} storage=${storage ? `${storage.local}/${storage.session}` : 'unavailable'} guard=${guardStatus ?? 'unavailable'} artifact=${options.out}`;
  if (outcome === 'passed') { console.log(summary); return; }
  console.error(summary);
  if (failure) console.error(`failure: ${failure}`);
  if (outcome === 'expected-failure') console.error(`simulation: ${simulation?.kind} was aborted locally and observed as ${simulation?.expectedClass}; fail-closed exit required.`);
  process.exitCode = 1;
};

try {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) console.log(usage);
  else await run(options);
} catch (cause) {
  console.error(`zero-egress-audit argument/prerequisite error: ${errorText(cause)}`);
  process.exitCode = 2;
}
