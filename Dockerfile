FROM node:24-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

FROM base AS builder
WORKDIR  /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM base AS prod-deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

FROM base AS app
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
