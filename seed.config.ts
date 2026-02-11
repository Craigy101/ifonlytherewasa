import { SeedPostgres } from "@snaplet/seed/adapter-postgres";
import { defineConfig } from "@snaplet/seed/config";
import postgres from "postgres";

export default defineConfig({
  adapter: () => {
    // Use explicit options to avoid URL-encoding issues with special chars in password
    const client = postgres({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "postgres",
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ssl: "require",
    });
    return new SeedPostgres(client);
  },
  select: [
    "!*",
    "public*",
    "auth.users",
    "auth.identities",
  ],
});
