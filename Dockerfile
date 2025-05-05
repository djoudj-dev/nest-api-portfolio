# 🏗️ Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app

# Activation de pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie des fichiers essentiels
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src/prisma ./src/prisma/
COPY src ./src

# Installation des dépendances (dev + prod)
RUN pnpm install --frozen-lockfile

# Génération du client Prisma
RUN pnpm add -D prisma && pnpm prisma generate

# Build de l'application NestJS
RUN pnpm run build


# 🏁 Étape 2 : image de production
FROM node:22-alpine

WORKDIR /app

# Activation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie des fichiers nécessaires pour exécuter l'app
COPY package.json pnpm-lock.yaml ./
COPY src/prisma ./src/prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Installation des dépendances de production
RUN pnpm install --prod --frozen-lockfile

# Crée un dossier uploads (utile si tu utilises des fichiers en écriture)
RUN mkdir -p uploads

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Lancement de l'application
CMD ["node", "dist/main"]
