/**
 * `ripodoc audit-verify` — check an access log has not been altered.
 *
 * Exits non-zero on the first broken record, so it drops straight into a cron
 * job or a CI step. The output is written for someone who has to put it in
 * front of an assessor, not for a developer.
 *
 *   node --experimental-strip-types tools/audit-log/verify-cli.ts \
 *     --log var/evidence-access.jsonl
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyAuditLog } from '../../web/frontend/src/lib/evidence/audit-log.ts';

const main = (): void => {
  const argv = process.argv.slice(2);
  const flag = argv.indexOf('--log');
  const path = flag >= 0 ? argv[flag + 1] : argv[0];
  if (!path) throw new Error('Usage: --log <access-log.jsonl>');

  const full = resolve(path);
  const result = verifyAuditLog(readFileSync(full, 'utf8'));

  if (result.ok) {
    process.stdout.write(
      `${full}\n` +
        `  records: ${result.records}\n` +
        `  chain: intact\n` +
        `  head: ${result.head}\n\n` +
        'Every record commits to the one before it. Removing, reordering or\n' +
        'editing any record would have broken the chain at that point.\n',
    );
    return;
  }

  process.stderr.write(
    `${full}\n` +
      `  chain: BROKEN at record ${result.failedAt} (${result.reason})\n\n` +
      'This log can no longer be presented as evidence from that record onward.\n' +
      'Preserve the file, then investigate who had write access to it.\n',
  );
  process.exitCode = 1;
};

main();
