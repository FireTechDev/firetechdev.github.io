FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY index.html manifest.webmanifest service-worker.js ./
COPY icons ./icons
COPY src ./src
COPY server ./server

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 8787

CMD ["node", "server/orbe-bff.mjs"]
