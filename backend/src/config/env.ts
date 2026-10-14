import "dotenv/config";

function getEnv(name: string) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variável ${name} não definida`);
    }

    return value;
}

export const env = {
    port: Number(getEnv("PORT")),

    dbHost: getEnv("DB_HOST"),
    dbPort: Number(getEnv("DB_PORT")),
    dbUser: getEnv("DB_USER"),
    dbPassword: getEnv("DB_PASSWORD"),
    dbName: getEnv("DB_NAME"),
    frontendUrl: getEnv("FRONTEND_URL"),

    jwtSecret: getEnv("JWT_SECRET"),
};