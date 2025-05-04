interface JwtConfig {
  secret: string;
}

export const jwtConstants: JwtConfig = {
  secret: process.env.JWT_SECRET ?? '',
};

if (!jwtConstants.secret) {
  throw new Error(
    "JWT_SECRET doit être défini dans les variables d'environnement",
  );
}
