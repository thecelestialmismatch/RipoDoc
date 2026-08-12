FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json ./
COPY web/frontend/package.json web/frontend/package-lock.json ./web/frontend/
RUN npm ci --prefix web/frontend --ignore-scripts

FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm --prefix web/frontend run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# The application does not need root privileges at runtime.
RUN groupadd --system --gid 10001 ripodoc \
  && useradd --system --uid 10001 --gid ripodoc --home-dir /nonexistent --shell /usr/sbin/nologin ripodoc
COPY --chown=ripodoc:ripodoc --from=build /app/web/frontend ./web/frontend
COPY --chown=ripodoc:ripodoc --from=build /app/node_modules ./node_modules
COPY --chown=ripodoc:ripodoc --from=build /app/tools ./tools
COPY --chown=ripodoc:ripodoc --from=build /app/content ./content

USER ripodoc
EXPOSE 3000
CMD ["npm", "--prefix", "web/frontend", "run", "start"]
