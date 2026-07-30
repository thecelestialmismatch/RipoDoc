/**
 * A tamper-evident access log.
 *
 * RipoDoc's pitch to an MSP includes "every access is logged, and you can show
 * that log to an auditor". A log that can be quietly edited afterwards is not
 * evidence of anything — so each record commits to the one before it:
 *
 *     hash(n) = SHA-256( hash(n-1) ‖ canonical(record n) )
 *
 * Deleting a record, reordering two, or changing a single timestamp breaks the
 * chain at that point and every point after it. That does not make the log
 * *unmodifiable* — nothing on a writable disk is — it makes modification
 * **detectable**, which is the honest claim and the one an auditor cares about.
 *
 * Records are append-only JSON Lines: greppable, streamable, and readable by a
 * customer's own tooling without RipoDoc in the loop.
 */

import { createHash } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import type { AccessEvent, AuditSink } from './audit.ts';

export const GENESIS = '0'.repeat(64);

export interface ChainedRecord extends AccessEvent {
  /** 1-based position in the chain. */
  readonly seq: number;
  /** Hash of the previous record; `GENESIS` for the first. */
  readonly prev: string;
  readonly hash: string;
}

/**
 * A stable serialisation of the fields that are hashed.
 *
 * An array, not an object: key order in JSON is a property of how the object
 * was built, and a chain whose verification depends on that is a chain that
 * breaks the first time someone reorders a struct field.
 */
const canonical = (record: Omit<ChainedRecord, 'hash'>): string =>
  JSON.stringify([
    record.seq,
    record.at,
    record.outcome,
    record.reportId ?? null,
    record.version ?? null,
    record.elementId ?? null,
    record.jti ?? null,
    record.recipientHash ?? null,
    record.reason ?? null,
    record.prev,
  ]);

export const hashRecord = (record: Omit<ChainedRecord, 'hash'>): string =>
  createHash('sha256').update(record.prev).update('\n').update(canonical(record)).digest('hex');

export const chainRecord = (
  event: AccessEvent,
  previous: { readonly seq: number; readonly hash: string },
): ChainedRecord => {
  const unhashed = { ...event, seq: previous.seq + 1, prev: previous.hash };
  return { ...unhashed, hash: hashRecord(unhashed) };
};

export type VerifyAuditResult =
  | { readonly ok: true; readonly records: number; readonly head: string }
  | {
      readonly ok: false;
      readonly failedAt: number;
      readonly reason: 'unparsable' | 'broken-link' | 'bad-hash' | 'out-of-order';
    };

/**
 * Re-derive the whole chain.
 *
 * Deliberately reports the *first* break: everything after it is untrustworthy
 * anyway, and pointing an operator at one line is more useful than a list.
 */
export const verifyAuditLog = (contents: string): VerifyAuditResult => {
  const lines = contents.split('\n').filter((line) => line.trim().length > 0);
  let previous = { seq: 0, hash: GENESIS };

  for (let index = 0; index < lines.length; index += 1) {
    let record: ChainedRecord;
    try {
      record = JSON.parse(lines[index] as string) as ChainedRecord;
    } catch {
      return { ok: false, failedAt: index + 1, reason: 'unparsable' };
    }
    if (record.seq !== previous.seq + 1) {
      return { ok: false, failedAt: index + 1, reason: 'out-of-order' };
    }
    if (record.prev !== previous.hash) {
      return { ok: false, failedAt: index + 1, reason: 'broken-link' };
    }
    const { hash, ...unhashed } = record;
    if (hashRecord(unhashed) !== hash) {
      return { ok: false, failedAt: index + 1, reason: 'bad-hash' };
    }
    previous = { seq: record.seq, hash: record.hash };
  }

  return { ok: true, records: lines.length, head: previous.hash };
};

/**
 * An append-only file sink.
 *
 * Writes are serialised through a promise chain. Two concurrent evidence pages
 * appending at once would otherwise both read the same head and produce two
 * records claiming the same predecessor — a break in the chain caused by
 * RipoDoc itself, which is the one kind of false alarm that would make an
 * operator stop trusting the check.
 */
export const createFileAuditSink = (path: string): AuditSink => {
  let head: Promise<{ seq: number; hash: string }> | undefined;

  const readHead = async (): Promise<{ seq: number; hash: string }> => {
    try {
      const contents = await readFile(path, 'utf8');
      const lines = contents.split('\n').filter((line) => line.trim().length > 0);
      const last = lines[lines.length - 1];
      if (!last) return { seq: 0, hash: GENESIS };
      const record = JSON.parse(last) as ChainedRecord;
      return { seq: record.seq, hash: record.hash };
    } catch {
      return { seq: 0, hash: GENESIS };
    }
  };

  return {
    async write(event) {
      head ??= readHead();
      head = head.then(async (previous) => {
        const record = chainRecord(event, previous);
        mkdirSync(dirname(path), { recursive: true });
        await appendFile(path, `${JSON.stringify(record)}\n`, 'utf8');
        return { seq: record.seq, hash: record.hash };
      });
      await head;
    },
  };
};

/** Write to both sinks; the durable one first, so a crash cannot lose it. */
export const teeAuditSinks = (...sinks: readonly AuditSink[]): AuditSink => ({
  async write(event) {
    for (const sink of sinks) await sink.write(event);
  },
});
