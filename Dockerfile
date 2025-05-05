# Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app

# Copie du projet
COPY . .

# Installation des dépendances
RUN corepack enable && pnpm install

# Build de l'application NestJS
RUN pnpm run build

# Étape 2 : image finale
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app .

RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main"]
