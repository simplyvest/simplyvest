import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.toml",
    dbName: "simplyvest-db",
  },
} satisfies Config;
