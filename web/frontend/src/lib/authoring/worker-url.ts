const DEVELOPMENT_FALLBACK = 'http://127.0.0.1:4000/api/local';
const DEFAULT_PRODUCTION_HOSTS = ['worker'];

export interface WorkerUrlPolicy {
  readonly environment?: string;
  readonly allowedProductionHosts?: readonly string[];
}

const configuredHosts = (): readonly string[] => {
  const raw = process.env.RIPODOC_INTERNAL_WORKER_HOSTS;
  if (!raw) return DEFAULT_PRODUCTION_HOSTS;
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
};

const validBasePath = (pathname: string): boolean => pathname === '/api/local' || pathname === '/api/local/';

/**
 * Normalizes the server-to-worker base URL. Production accepts only an explicit
 * internal service hostname; this prevents signed authoring capabilities from
 * being forwarded to an arbitrary operator-configured public endpoint.
 */
export const normalizePrivateWorkerBaseUrl = (raw: string | undefined, policy: WorkerUrlPolicy = {}): string | undefined => {
  const environment = policy.environment ?? process.env.NODE_ENV;
  const value = raw ?? (environment === 'production' ? undefined : DEVELOPMENT_FALLBACK);
  if (!value) return undefined;

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return undefined;
    if (parsed.username || parsed.password || parsed.search || parsed.hash || !validBasePath(parsed.pathname)) return undefined;

    if (environment === 'production') {
      const allowedHosts = (policy.allowedProductionHosts ?? configuredHosts()).map((host) => host.toLowerCase());
      if (allowedHosts.length === 0 || !allowedHosts.includes(parsed.hostname.toLowerCase())) return undefined;
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
};

export const configuredPrivateWorkerBaseUrl = (): string | undefined =>
  normalizePrivateWorkerBaseUrl(process.env.RIPODOC_LOCAL_WORKER_URL);

export const privateWorkerConfigured = (): boolean => Boolean(
  configuredPrivateWorkerBaseUrl() && (process.env.RIPODOC_WORKER_AUTH_SECRET?.length ?? 0) >= 32,
);
