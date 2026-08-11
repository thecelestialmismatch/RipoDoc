# Self-hosted RipoDoc PDF authoring worker.
# The worker runs the reviewed overlay engine; it never needs the public site at runtime.
FROM node:22-alpine AS runtime

WORKDIR /app

# Install the worker's only runtime HTTP dependency in its own package scope.
COPY docker/local/package.json ./docker/local/package.json
WORKDIR /app/docker/local
RUN npm install --omit=dev --no-audit --no-fund

# Copy the worker, overlay engine, and the shared manifest/token primitives it validates.
WORKDIR /app
COPY docker/local/server.mjs ./docker/local/server.mjs
COPY tools/evidence-pdf ./tools/evidence-pdf
COPY web/frontend/src/lib/evidence ./web/frontend/src/lib/evidence

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
EXPOSE 4000

CMD ["node", "docker/local/server.mjs"]
