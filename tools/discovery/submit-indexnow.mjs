const SITE_ORIGIN = 'https://www.ripodoc.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export const INDEXNOW_PUBLIC_PATHS = Object.freeze([
  '/',
  '/how-it-works',
  '/for-msps',
  '/report-evidence-readiness',
  '/report-diagnostic-starter-kit',
  '/security',
  '/download',
  '/founding-partners',
  '/about',
  '/legal',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/terms',
  '/legal/refunds',
  '/legal/sla',
  '/legal/dpa',
  '/legal/healthcare-mode-b',
]);

export function assertIndexNowKey(value) {
  const key = String(value ?? '').trim();
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error('INDEXNOW_KEY must be 8–128 characters containing only letters, numbers, or dashes.');
  }
  return key;
}

export function buildIndexNowPayload({ key, origin = SITE_ORIGIN, paths = INDEXNOW_PUBLIC_PATHS }) {
  const verifiedKey = assertIndexNowKey(key);
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.hostname !== 'www.ripodoc.com') {
    throw new Error('IndexNow submissions are restricted to the canonical https://www.ripodoc.com origin.');
  }
  const uniquePaths = [...new Set(paths)];
  if (uniquePaths.length === 0 || uniquePaths.length > 10_000 || uniquePaths.some((path) => !path.startsWith('/'))) {
    throw new Error('IndexNow paths must contain 1–10,000 unique absolute paths.');
  }

  return {
    host: base.host,
    key: verifiedKey,
    keyLocation: `${base.origin}/${verifiedKey}.txt`,
    urlList: uniquePaths.map((path) => new URL(path, base).toString()),
  };
}

export async function submitIndexNow({ key, origin, paths, fetchImpl = fetch }) {
  const payload = buildIndexNowPayload({ key, origin, paths });
  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (![200, 202].includes(response.status)) {
    const detail = (await response.text()).slice(0, 240);
    throw new Error(`IndexNow rejected the URL notification with HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return { status: response.status, count: payload.urlList.length, keyLocation: payload.keyLocation };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  submitIndexNow({ key: process.env.INDEXNOW_KEY })
    .then(({ status, count, keyLocation }) => {
      console.log(JSON.stringify({ service: 'IndexNow', status, submittedUrls: count, keyLocation }));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
