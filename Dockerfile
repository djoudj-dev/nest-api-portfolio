# Stage de build
FROM node:22-alpine AS builder

WORKDIR /app

# Installation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie de tous les fichiers nécessaires
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY src/ ./src/

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Génération du client Prisma
RUN pnpm prisma generate

# Build de l'application
RUN pnpm run build

# Stage de production
FROM node:22-alpine

WORKDIR /app

# Installation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie des fichiers nécessaires
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Copie des fichiers de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Installation des dépendances de production
RUN pnpm install --prod --frozen-lockfile

# Création du dossier uploads
RUN mkdir -p uploads

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=3000

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["node", "dist/src/main.js"]
