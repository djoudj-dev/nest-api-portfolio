# Étape 1 : build NestJS + Prisma
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install
RUN pnpm prisma generate
RUN pnpm run build


# Étape 2 : image minimale de prod
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# Copie le code source ET le dossier dist depuis le builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main"]
