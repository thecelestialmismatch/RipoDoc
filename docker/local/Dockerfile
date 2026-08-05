# Zero-dependency local dev server for RipoDoc authoring studio
FROM node:20-alpine AS runtime
WORKDIR /app
COPY docker/local/package.json docker/local/server.mjs ./
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
EXPOSE 4000
CMD ["node", "server.mjs"]
