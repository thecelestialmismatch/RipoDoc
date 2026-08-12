# Private RipoDoc PDF authoring worker. It is reachable only through the
# self-hosted web service and verifies short-lived server-issued capabilities.
FROM node:22-alpine AS runtime

WORKDIR /app
COPY docker/local/package.json ./docker/local/package.json
WORKDIR /app/docker/local
RUN npm install --omit=dev --no-audit --no-fund

WORKDIR /app
RUN apk add --no-cache su-exec \
  && addgroup -S -g 10001 ripodoc \
  && adduser -S -D -H -u 10001 -G ripodoc ripodoc
COPY docker/local/entrypoint.sh /usr/local/bin/ripodoc-worker-entrypoint
RUN chmod 0755 /usr/local/bin/ripodoc-worker-entrypoint
COPY --chown=ripodoc:ripodoc docker/local/server.mjs ./docker/local/server.mjs
COPY --chown=ripodoc:ripodoc tools/evidence-pdf ./tools/evidence-pdf
COPY --chown=ripodoc:ripodoc web/frontend/src/lib/evidence ./web/frontend/src/lib/evidence

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
RUN mkdir -p /data && chown -R ripodoc:ripodoc /data
EXPOSE 4000
ENTRYPOINT ["/usr/local/bin/ripodoc-worker-entrypoint"]
CMD ["node", "docker/local/server.mjs"]
