import mysql from "mysql2/promise";
import { env } from "../config/env.js";

if (env.dbSsl && !env.dbSslCa) {
  throw new Error("DB_SSL_CA não configurado");
}

const connection = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,

  ...(env.dbSsl
    ? {
        ssl: {
          ca: env.dbSslCa!,
          rejectUnauthorized: true,
        },
      }
    : {}),
});

export default connection;