import { Client } from "pg";
import { appConfig } from "../config";
import logger from "../utils/logger";

export async function ensureDatabaseExists() {
  const defaultDbConfig = {
    user: appConfig.database.username,
    host: appConfig.database.host,
    database: appConfig.database.type, // connect to default postgres DB
    password: appConfig.database.password,
    port: appConfig.database.port,
  };

  const dbName = appConfig.database.db_name;
  if (!dbName) throw new Error("Database name not found in config");

  const client = new Client(defaultDbConfig);

  try {
    await client.connect();

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`✅ Database "${dbName}" created.`);
    } else {
      logger.info(`ℹ️ Database "${dbName}" already exists.`);
    }
  } catch (error) {
    logger.error("Error during DB creation check:", error);
    throw error;
  } finally {
    await client.end();
  }
}
