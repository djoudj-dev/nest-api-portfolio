# Étape 1 : build de l'app NestJS avec Prisma
FROM node:22-alpine AS builder

WORKDIR /app

# Active corepack pour pnpm
RUN corepack enable

# Copie des fichiers
COPY . .

# Installation des dépendances
RUN pnpm install

# Génération du client Prisma
RUN pnpm prisma generate

# Build de l'app NestJS
RUN pnpm run build


# Étape 2 : image de prod plus légère
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# Copie du code et du build
COPY --from=builder /app /app

# Installe uniquement les dépendances de prod
RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main"]
