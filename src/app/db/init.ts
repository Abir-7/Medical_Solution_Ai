import { Client } from "pg";
import { appConfig } from "../config";

export async function ensureDatabaseExists() {
  const defaultDbConfig = {
    user: appConfig.database.username,
    host: appConfig.database.host,
    database: "postgres", // connect to default postgres DB
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
      console.log(`✅ Database "${dbName}" created.`);
    } else {
      console.log(`ℹ️ Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error("Error during DB creation check:", error);
    throw error;
  } finally {
    await client.end();
  }
}
