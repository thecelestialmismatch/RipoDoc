#!/bin/sh
set -eu

# Named Docker volumes are commonly created as root-owned. The init process
# performs the minimum ownership adjustment on the mounted /data volume, then
# replaces itself with the unprivileged worker process. No browser request can
# influence this path.
if [ "$(id -u)" = "0" ]; then
  mkdir -p "${DATA_DIR:-/data}"
  chown -R ripodoc:ripodoc "${DATA_DIR:-/data}"
  exec su-exec ripodoc "$@"
fi

exec "$@"
