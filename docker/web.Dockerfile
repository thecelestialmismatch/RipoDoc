FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json ./
COPY web/frontend/package.json web/frontend/package-lock.json ./web/frontend/
RUN npm ci --prefix web/frontend --ignore-scripts

FROM dependencies AS build
ARG NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED=false
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED=${NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED}
RUN npm --prefix web/frontend run build \
  && npm --prefix web/frontend prune --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# The application does not need root privileges at runtime.
RUN groupadd --system --gid 10001 ripodoc \
  && useradd --system --uid 10001 --gid ripodoc --home-dir /nonexistent --shell /usr/sbin/nologin ripodoc
COPY --chown=ripodoc:ripodoc --from=build /app/web/frontend ./web/frontend
COPY --chown=ripodoc:ripodoc --from=build /app/tools ./tools
# Compose configures RIPODOC_CONTENT_ROOT=/app/content/reports; copy the manifests to that runtime root.
COPY --chown=ripodoc:ripodoc --from=build /app/web/frontend/content ./content

# npm is required only to build the application. Remove its bundled CLI dependency tree
# from the runtime image and invoke the already-installed Next.js binary with node.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app/web/frontend
USER ripodoc
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
