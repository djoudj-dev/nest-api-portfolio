# Étape 1 : Builder
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN pnpm install --frozen-lockfile

# Génère le client Prisma dans node_modules/.prisma
RUN pnpm prisma generate

RUN pnpm run build
RUN ls -la /app/dist


# Étape 2 : Production (sans regenerer prisma)
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Installer uniquement les deps de prod
RUN pnpm install --prod

# Copier le build et le client Prisma déjà généré
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
