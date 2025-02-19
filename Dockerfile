FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV ERC20_CONTRACT_ADDRESS=0x1c7d4b196cb0c7b01d743fbc6116a902379c7238
ENV START_BLOCK_NUMBER=7735000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 indexer

COPY --from=builder /app ./

USER indexer

CMD ["npm", "run", "start"]