export const INDEXNOW_PUBLIC_PATHS: readonly string[];

export interface IndexNowPayload {
  readonly host: 'www.ripodoc.com';
  readonly key: string;
  readonly keyLocation: string;
  readonly urlList: string[];
}

export function assertIndexNowKey(value: unknown): string;
export function buildIndexNowPayload(input: {
  readonly key: unknown;
  readonly origin?: string;
  readonly paths?: readonly string[];
}): IndexNowPayload;
export function submitIndexNow(input: {
  readonly key: unknown;
  readonly origin?: string;
  readonly paths?: readonly string[];
  readonly fetchImpl?: typeof fetch;
}): Promise<{ readonly status: number; readonly count: number; readonly keyLocation: string }>;
