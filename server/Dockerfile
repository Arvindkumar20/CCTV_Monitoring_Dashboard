FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV DETECTOR_WS_URL=ws://detector:8765
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]