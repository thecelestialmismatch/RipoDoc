FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json ./
COPY web/frontend/package.json web/frontend/package-lock.json ./web/frontend/
RUN npm ci --prefix web/frontend

FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm --prefix web/frontend run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/web/frontend ./web/frontend
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/tools ./tools
COPY --from=build /app/content ./content
EXPOSE 3000
CMD ["npm", "--prefix", "web/frontend", "run", "start"]
